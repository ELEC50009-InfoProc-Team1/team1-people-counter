#ifndef BG_SUBTRACT_HPP
#define BG_SUBTRACT_HPP

#include <ap_int.h>
#include <hls_stream.h>
#include <ap_axi_sdata.h>

typedef ap_axiu<8, 1, 1, 1>  pix8_t;
typedef ap_axiu<16, 1, 1, 1> pix16_t;

typedef hls::stream<pix8_t>  stream8_t;
typedef hls::stream<pix16_t> stream16_t;

void bg_subtract(stream8_t&  stream_in_current,
                 stream16_t& stream_in_bg,
                 stream8_t&  stream_out_diff,
                 stream16_t& stream_out_bg,
                 int rows, int cols);

#endif
