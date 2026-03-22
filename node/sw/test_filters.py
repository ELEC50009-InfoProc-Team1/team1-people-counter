from pynq import Overlay, allocate, MMIO
from pynq.lib.video import *
import numpy as np
import time
import os
from PIL import Image

ol = Overlay("/home/xilinx/jupyter_notebooks/people_counter/people_counter.bit")

def find_ip(name):
    for k in ol.ip_dict:
        if name in k:
            return k
    raise KeyError(f"No IP matching '{name}'")

hdmi_in = ol.video.hdmi_in
hdmi_in.configure(PIXEL_RGBA)
hdmi_in.start()
time.sleep(1)

frame = hdmi_in.readframe()
H, W, _ = frame.shape
N = H * W
H2, W2 = H // 2, W // 2
N2 = H2 * W2
print(f"Input resolution: {W}x{H}")
print(f"Mask resolution:  {W2}x{H2}")

# Configure processing IPs (full resolution)
gauss = MMIO(ol.ip_dict[find_ip('gaussian_blur')]['phys_addr'], 0x10000)
bgsub = MMIO(ol.ip_dict[find_ip('bg_subtract')]['phys_addr'], 0x10000)
ds    = MMIO(ol.ip_dict[find_ip('downscale_2x')]['phys_addr'], 0x10000)

for ip in [gauss, bgsub, ds]:
    ip.write(0x10, H)
    ip.write(0x18, W)

# Configure morph IPs (half resolution)
erode0  = MMIO(ol.ip_dict[find_ip('morphological_open/morphological_erosion_0')]['phys_addr'], 0x10000)
dilate0 = MMIO(ol.ip_dict[find_ip('morphological_open/morphological_dilati_0')]['phys_addr'], 0x10000)
dilate1 = MMIO(ol.ip_dict[find_ip('morphological_close/morphological_dilati_1')]['phys_addr'], 0x10000)
erode1  = MMIO(ol.ip_dict[find_ip('morphological_close/morphological_erosion_1')]['phys_addr'], 0x10000)

for ip in [erode0, dilate0, dilate1, erode1]:
    ip.write(0x10, H2)
    ip.write(0x18, W2)

dma0 = ol.video.processing_pipeline.axi_dma_0
dma1 = ol.video.processing_pipeline.axi_dma_1

buf_rgb    = allocate(shape=(H, W, 4), dtype=np.uint8)
buf_diff   = allocate(shape=(N2,),     dtype=np.uint8)
buf_bg_old = allocate(shape=(N,),      dtype=np.uint16)
buf_bg_new = allocate(shape=(N,),      dtype=np.uint16)
buf_bg_old[:] = 0
buf_bg_old.flush()

os.makedirs("buffers", exist_ok=True)

def run_pipeline():
    frame = hdmi_in.readframe()
    np.copyto(buf_rgb, frame)
    buf_rgb.flush()

    gauss.write(0x00, 0x01)
    bgsub.write(0x00, 0x01)
    ds.write(0x00, 0x01)
    erode0.write(0x00, 0x01)
    dilate0.write(0x00, 0x01)
    dilate1.write(0x00, 0x01)
    erode1.write(0x00, 0x01)

    dma0.recvchannel.transfer(buf_diff)
    dma1.recvchannel.transfer(buf_bg_new)
    dma1.sendchannel.transfer(buf_bg_old)
    dma0.sendchannel.transfer(buf_rgb)

    dma0.sendchannel.wait()
    dma1.sendchannel.wait()
    dma0.recvchannel.wait()
    dma1.recvchannel.wait()

print("Setup the background.")
print("10 seconds till learning starts...")
time.sleep(10)

BG_FRAMES = 1000
print(f"\nLearning background ({BG_FRAMES} frames) - keep scene empty...")
times = []
for i in range(BG_FRAMES):
    t0 = time.time()
    run_pipeline()
    buf_bg_old, buf_bg_new = buf_bg_new, buf_bg_old
    times.append(time.time() - t0)
    if (i + 1) % 50 == 0:
        avg = np.mean(times[-50:])
        print(f"  {i+1}/{BG_FRAMES}  {1.0/avg:.1f} fps  ({avg*1000:.1f} ms)")

print("Background locked and loaded\n")

buf_bg_old.invalidate()
bg_img = (np.array(buf_bg_old) >> 8).astype(np.uint8).reshape(H, W)
Image.fromarray(bg_img).save("buffers/background.png")
print("Saved buffers/background.png")

print("\nStart the video! Recording in 3s...")
time.sleep(3)

DURATION = 5.0
INTERVAL = 0.2
print(f"Recording for {DURATION}s, saving mask every {INTERVAL}s...")

start = time.time()
last_save = 0.0
mask_idx = 0
frame_count = 0

while time.time() - start < DURATION:
    run_pipeline()
    buf_bg_old, buf_bg_new = buf_bg_new, buf_bg_old
    frame_count += 1
    elapsed = time.time() - start

    if elapsed - last_save >= INTERVAL:
        buf_diff.invalidate()
        diff = np.array(buf_diff).reshape(H2, W2)
        Image.fromarray(diff).save(f"buffers/mask_{mask_idx:02d}.png")
        print(f"  [{elapsed:.1f}s] mask_{mask_idx:02d}.png  max={int(diff.max())}  mean={diff.mean():.1f}")
        mask_idx += 1
        last_save = elapsed

total = time.time() - start
print(f"\n{frame_count} frames in {total:.1f}s ({frame_count/total:.1f} fps)")
print(f"{mask_idx} masks saved to buffers/")
print("Done!")

hdmi_in.stop()
del buf_rgb, buf_diff, buf_bg_old, buf_bg_new
