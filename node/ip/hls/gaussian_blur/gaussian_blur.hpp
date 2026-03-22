#ifndef GAUSSIAN_BLUR_HPP
#define GAUSSIAN_BLUR_HPP

#include <ap_int.h>
#include <hls_stream.h>
#include <ap_axi_sdata.h>

#define MAX_ROWS 1080
#define MAX_COLS 1920

typedef ap_axiu<8, 1, 1, 1> pixel_t;
typedef hls::stream<pixel_t> stream_t;

void gaussian_blur(stream_t& stream_in, stream_t& stream_out,
                   int rows, int cols);

#endif
