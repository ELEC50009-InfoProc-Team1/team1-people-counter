#include "downscale_2x.hpp"

void downscale_2x(stream_t& stream_in, stream_t& stream_out,
                  int rows, int cols) {

#pragma HLS INTERFACE axis port=stream_in
#pragma HLS INTERFACE axis port=stream_out
#pragma HLS INTERFACE s_axilite port=rows
#pragma HLS INTERFACE s_axilite port=cols
#pragma HLS INTERFACE s_axilite port=return

    int last_row = rows - 2;
    int last_col = cols - 2;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
#pragma HLS PIPELINE II=1
            pixel_t pix_in = stream_in.read();

            if (((r & 1) == 0) && ((c & 1) == 0)) {
                pixel_t pix_out;
                pix_out.data = pix_in.data;
                pix_out.last = (r == last_row && c == last_col) ? 1 : 0;
                pix_out.keep = 1;
                pix_out.strb = 1;
                pix_out.user = (r == 0 && c == 0) ? 1 : 0;
                pix_out.id   = 0;
                pix_out.dest = 0;
                stream_out.write(pix_out);
            }
        }
    }
}
