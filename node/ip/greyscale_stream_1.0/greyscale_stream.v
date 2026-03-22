`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Module: greyscale_stream
// Description: Converts 32-bit RGB (from DMA) to 8-bit greyscale luminance.
//              Uses BT.601 weights: Y = (77*R + 150*G + 29*B) >> 8
//              Pure AXI4-Stream interface — no control registers needed.
//////////////////////////////////////////////////////////////////////////////////

module greyscale_stream (
    input  wire        aclk,
    input  wire        aresetn,

    // AXI4-Stream Slave (32-bit RGB input from DMA MM2S)
    input  wire [31:0] s_axis_tdata,
    input  wire        s_axis_tvalid,
    output wire        s_axis_tready,
    input  wire        s_axis_tlast,
    input  wire        s_axis_tuser,
    input  wire [3:0]  s_axis_tkeep,

    // AXI4-Stream Master (8-bit greyscale output to DMA S2MM)
    output wire [7:0]  m_axis_tdata,
    output wire        m_axis_tvalid,
    input  wire        m_axis_tready,
    output wire        m_axis_tlast,
    output wire        m_axis_tuser,
    output wire [0:0]  m_axis_tkeep
);

    // Extract RGB channels from 32-bit input (bits 31:24 are padding)
    wire [7:0] r = s_axis_tdata[23:16];
    wire [7:0] g = s_axis_tdata[15:8];
    wire [7:0] b = s_axis_tdata[7:0];

    // BT.601 luminance calculation
    wire [15:0] y_sum = r * 8'd77 + g * 8'd150 + b * 8'd29;

    // Backpressure: accept input when downstream is ready
    assign s_axis_tready = m_axis_tready;

    // Output greyscale pixel with sideband signals passed through
    assign m_axis_tdata  = y_sum[15:8];
    assign m_axis_tvalid = s_axis_tvalid;
    assign m_axis_tlast  = s_axis_tlast;
    assign m_axis_tuser  = s_axis_tuser;
    assign m_axis_tkeep  = 1'b1;

endmodule
