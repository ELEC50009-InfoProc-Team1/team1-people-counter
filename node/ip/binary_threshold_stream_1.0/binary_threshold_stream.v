`timescale 1ns / 1ps

module binary_threshold_stream #(
    parameter integer THRESHOLD = 25
)(
    input  wire        aclk,
    input  wire        aresetn,

    // AXI4-Stream Slave (8-bit in from bg_subtract diff)
    input  wire [7:0]  s_axis_tdata,
    input  wire        s_axis_tvalid,
    output wire        s_axis_tready,
    input  wire        s_axis_tlast,
    input  wire        s_axis_tuser,
    input  wire [0:0]  s_axis_tkeep,

    // AXI4-Stream Master (8-bit out: 0x00 or 0xFF)
    output wire [7:0]  m_axis_tdata,
    output wire        m_axis_tvalid,
    input  wire        m_axis_tready,
    output wire        m_axis_tlast,
    output wire        m_axis_tuser,
    output wire [0:0]  m_axis_tkeep
);

    assign s_axis_tready = m_axis_tready;
    assign m_axis_tdata  = (s_axis_tdata > THRESHOLD[7:0]) ? 8'hFF : 8'h00;
    assign m_axis_tvalid = s_axis_tvalid;
    assign m_axis_tlast  = s_axis_tlast;
    assign m_axis_tuser  = s_axis_tuser;
    assign m_axis_tkeep  = 1'b1;

endmodule
