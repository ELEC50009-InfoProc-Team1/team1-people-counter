#include "morphological_dilation.hpp"

void morphological_dilation(stream_t& stream_in, stream_t& stream_out,
                            int rows, int cols) {

#pragma HLS INTERFACE axis port=stream_in
#pragma HLS INTERFACE axis port=stream_out
#pragma HLS INTERFACE s_axilite port=rows
#pragma HLS INTERFACE s_axilite port=cols
#pragma HLS INTERFACE s_axilite port=return

    ap_uint<8> linebuf[5][MAX_COLS];
#pragma HLS ARRAY_PARTITION variable=linebuf complete dim=1

    ap_uint<8> window[5][5];
#pragma HLS ARRAY_PARTITION variable=window complete dim=0

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
#pragma HLS PIPELINE II=1
            pixel_t pix_in = stream_in.read();

            for (int i = 4; i > 0; i--) {
                linebuf[i][c] = linebuf[i-1][c];
            }
            linebuf[0][c] = pix_in.data;

            for (int i = 0; i < 5; i++) {
                for (int j = 0; j < 4; j++) {
                    window[i][j] = window[i][j+1];
                }
            }

            for (int i = 0; i < 5; i++) {
                window[i][4] = linebuf[i][c];
            }

            ap_uint<8> result = 0x00;
            if (r < 4 || c < 4) {
                result = 0;
            } else {
                for (int i = 0; i < 5; i++) {
                    for (int j = 0; j < 5; j++) {
                        result |= window[i][j];
                    }
                }
            }

            pixel_t pix_out;
            pix_out.data = result;
            pix_out.last = pix_in.last;
            pix_out.keep = 1;
            pix_out.strb = 1;
            pix_out.user = pix_in.user;
            pix_out.id   = 0;
            pix_out.dest = 0;
            stream_out.write(pix_out);
        }
    }
}
