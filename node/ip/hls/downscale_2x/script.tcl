open_project downscale_2x
set_top downscale_2x
add_files downscale_2x/downscale_2x.cpp
open_solution "solution1"
set_part {xc7z020clg400-1}
create_clock -period 10
csynth_design
export_design -format ip_catalog -description "2x downscale for 8-bit AXI stream" -display_name "Downscale 2x"
exit
