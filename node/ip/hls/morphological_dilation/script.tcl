open_project morphological_dilation
set_top morphological_dilation
add_files morphological_dilation/morphological_dilation.cpp
open_solution "solution1"
set_part {xc7z020clg400-1}
create_clock -period 10
csynth_design
export_design -format ip_catalog -description "5x5 binary dilation for 8-bit AXI stream" -display_name "Morphological Dilation"
exit
