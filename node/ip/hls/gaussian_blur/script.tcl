open_project gaussian_blur
set_top gaussian_blur
add_files gaussian_blur/gaussian_blur.cpp
open_solution "solution1"
set_part {xc7z020clg400-1}
create_clock -period 10
csynth_design
export_design -format ip_catalog -description "5x5 Gaussian blur for 8-bit AXI stream" -display_name "Gaussian Blur"
exit
