# People Counter — Information Processing Team 1

## Project Setup

**1. Clone the repo**
```bash
git clone https://github.com/ELEC50009-InfoProc-Team1/people-counter.git
```


**2. Launch Vivado**  
Similar to Lab 2, open a new Vivado window and in the TCL command window cd to where the git repo is . 


**3. Build HLS IPs first**
```bash
source build_ip.tcl
```

**4. Rebuild the Vivado project**
```bash
source base.tcl
```

---

The script should add the constraints and wrapper automatically. If not then:
- Create a HDL wrapper for the block design
- Include the constraints file

It should compile first time ✌🏾  

## Pulling from remote
When pulling from remote, to avoid unnecessary errors in Vivado it is best to clean your folder structure first:  
```bash
git pull --rebase
git clean -fxd
```
Now repeat the project setup steps from step 2.  

> [!CAUTION]
> `git clean` will delete everything in Vivado. If you have made changes to the block diagramn, follow the below steps or else it WILL be deleted. Only `base.tcl` is used to store the entire design. Don't ask me how ik ✌🏾(even after I made this process)

## Adding Something to the Main Block Design

1. Make your changes in Vivado and validate the design.
2. In the Vivado Tcl console:
```tcl
write_project_tcl -force C:/pathtorepo/base.tcl
```
4. Commit:
```bash
git add .
git commit -m "Description of what you changed"
git push
```

---
