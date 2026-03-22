# People Counter — Information Processing Team 1

![WhatsApp Image 2026-03-12 at 20 26 59](https://github.com/user-attachments/assets/0491e398-4aef-4fe1-8482-70df0dd10904)

This repository details the design, implementation, and evaluation of a real-time, FPGA-accelerated IoT system for room occupancy monitoring.

For this repository, node refers to the PYNQ-Z1 board running both PL and PS.

FILE TREE

---

## Node: Programmable Logic Setup

In a similar fashion to Lab 2 ...

**1. Launch Vivado**  
Open a new Vivado window and in the TCL command window cd to `C:/pathtorepo/node`.


**2. Build HLS IPs first**
```bash
source build_ip.tcl
```

**3. Rebuild the Vivado project**
```bash
source base.tcl
```

The script should add the constraints and wrapper automatically. If not then:
- Create a HDL wrapper for the block design
- Include the [constraints file](node/constraints.xdc)

## Node: Processing System Setup
In Jupyter Notebook, add the following 4 files to the same directory:
- people_counter.bit
- people_counter.hwh
- [counter.py](node/sw/counter.py)
- [ui.py](node/sw/ui.py)

Run `python counter.py` to see the arguments required. An example command would look like:
```bash
python counter.py --hdmi-out=NORMAL --bg-frame=100 --orientation=DOWN --api-key=1483433276495450113_a8be6969b22f222eb13fc9b31705a5d09c2cc2498e9ac3ed237d0db7cc5158b82fad8b6b68648ee27b84575e4cf59b96
```

---
