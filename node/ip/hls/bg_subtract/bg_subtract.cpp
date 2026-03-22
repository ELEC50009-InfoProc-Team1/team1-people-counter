#include "bg_subtract.hpp"

void bg_subtract(stream8_t&  stream_in_current,
                 stream16_t& stream_in_bg,
                 stream8_t&  stream_out_diff,
                 stream16_t& stream_out_bg,
                 int rows, int cols) {
#pragma HLS INTERFACE axis port=stream_in_current
#pragma HLS INTERFACE axis port=stream_in_bg
#pragma HLS INTERFACE axis port=stream_out_diff
#pragma HLS INTERFACE axis port=stream_out_bg
#pragma HLS INTERFACE s_axilite port=rows
#pragma HLS INTERFACE s_axilite port=cols
#pragma HLS INTERFACE s_axilite port=return

    for (int i = 0; i < rows * cols; i++) {
#pragma HLS PIPELINE II=1

        // Read current pixel (8-bit from gaussian)
        pix8_t pix_cur = stream_in_current.read();
        ap_uint<8> current = pix_cur.data;

        // Read old background (16-bit: 8.8 fixed point)
        pix16_t pix_bg = stream_in_bg.read();
        ap_uint<16> bg_old = pix_bg.data;

        // Update background: bg_new = bg_old + ((current<<8) - bg_old) >> 7
        ap_int<18> current_fp = (ap_int<18>)(current) << 8;
        ap_int<18> diff_fp = current_fp - (ap_int<18>)bg_old;
        ap_int<18> update = diff_fp >> 7;
        ap_int<18> bg_new_full = (ap_int<18>)bg_old + update;

        // Clamp to [0, 65535]
        ap_uint<16> bg_new;
        if (bg_new_full < 0)
            bg_new = 0;
        else if (bg_new_full > 65535)
            bg_new = 65535;
        else
            bg_new = (ap_uint<16>)bg_new_full;

        // Compute absolute difference (8-bit integer parts)
        ap_uint<8> bg_int = bg_old >> 8;
        ap_int<10> raw_diff = (ap_int<10>)current - (ap_int<10>)bg_int;
        ap_uint<8> abs_diff;
        if (raw_diff < 0)
            abs_diff = (ap_uint<8>)(-raw_diff);
        else
            abs_diff = (ap_uint<8>)raw_diff;

        // Output absolute difference (to threshold stage)
        pix8_t pix_out;
        pix_out.data = abs_diff;
        pix_out.last = pix_cur.last;
        pix_out.keep = 1;
        pix_out.strb = 1;
        pix_out.user = pix_cur.user;
        pix_out.id   = 0;
        pix_out.dest = 0;
        stream_out_diff.write(pix_out);

        // Output updated background (back to DDR)
        pix16_t pix_bg_out;
        pix_bg_out.data = bg_new;
        pix_bg_out.last = pix_cur.last;
        pix_bg_out.keep = 3;  // 2 bytes valid
        pix_bg_out.strb = 3;
        pix_bg_out.user = pix_cur.user;
        pix_bg_out.id   = 0;
        pix_bg_out.dest = 0;
        stream_out_bg.write(pix_bg_out);
    }
}
