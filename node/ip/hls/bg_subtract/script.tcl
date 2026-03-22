open_project bg_subtract
set_top bg_subtract
add_files bg_subtract/bg_subtract.cpp
open_solution "solution1"
set_part {xc7z020clg400-1}
create_clock -period 10
csynth_design
export_design -format ip_catalog -description "Background subtraction with 16 bit model in DDR" -display_name "BG Subtract"
exit
