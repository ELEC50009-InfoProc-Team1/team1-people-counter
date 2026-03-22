#include "gaussian_blur.hpp"

void gaussian_blur(stream_t& stream_in, stream_t& stream_out,
                   int rows, int cols) {
#pragma HLS INTERFACE axis port=stream_in
#pragma HLS INTERFACE axis port=stream_out
#pragma HLS INTERFACE s_axilite port=rows
#pragma HLS INTERFACE s_axilite port=cols
#pragma HLS INTERFACE s_axilite port=return

    ap_uint<8> linebuf[5][MAX_COLS];
#pragma HLS ARRAY_PARTITION variable=linebuf complete dim=1

    const int kernel[5][5] = {
        { 1,  4,  6,  4, 1},
        { 4, 16, 24, 16, 4},
        { 6, 24, 36, 24, 6},
        { 4, 16, 24, 16, 4},
        { 1,  4,  6,  4, 1}
    };
#pragma HLS ARRAY_PARTITION variable=kernel complete dim=0

    ap_uint<8> window[5][5];
#pragma HLS ARRAY_PARTITION variable=window complete dim=0

    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
#pragma HLS PIPELINE II=1

            // Read new pixel
            pixel_t pix_in = stream_in.read();

            // Shift line buffers down
            for (int i = 4; i > 0; i--) {
                linebuf[i][col] = linebuf[i-1][col];
            }
            linebuf[0][col] = pix_in.data;

            // Shift window left
            for (int i = 0; i < 5; i++) {
                for (int j = 0; j < 4; j++) {
                    window[i][j] = window[i][j+1];
                }
            }

            // Fill rightmost column of window from line buffers
            for (int i = 0; i < 5; i++) {
                window[i][4] = linebuf[i][col];
            }

            // Compute 5x5 convolution
            ap_uint<18> sum = 0;
            for (int i = 0; i < 5; i++) {
                for (int j = 0; j < 5; j++) {
                    sum += window[i][j] * kernel[i][j];
                }
            }

            ap_uint<8> result;
            if (row < 4 || col < 4)
                result = 0;
            else
                result = (ap_uint<8>)(sum >> 8);

            // Write output pixel
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
