open_project morphological_erosion
set_top morphological_erosion
add_files morphological_erosion/morphological_erosion.cpp
open_solution "solution1"
set_part {xc7z020clg400-1}
create_clock -period 10
csynth_design
export_design -format ip_catalog -description "5x5 binary erosion for 8-bit AXI stream" -display_name "Morphological Erosion"
exit
