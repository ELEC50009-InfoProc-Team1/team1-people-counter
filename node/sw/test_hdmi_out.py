from pynq import Overlay
from pynq.lib.video import *
import numpy as np
import cv2
import time

ol = Overlay("/home/xilinx/jupyter_notebooks/people_counter/people_counter.bit")

hdmi_out = ol.video.hdmi_out
hdmi_out.configure(VideoMode(1280, 720, 24))
hdmi_out.start()
time.sleep(1)

W, H = 1280, 720

# Phase 1: Black screen
print("Phase 1: Black screen (3s)")
frame = hdmi_out.newframe()
frame[:] = 0
hdmi_out.writeframe(frame)
time.sleep(3)

# Phase 2: Border test
print("Phase 2: Border + crosshair (3s)")
frame = hdmi_out.newframe()
frame[:] = 0
frame[0, :] = [255, 255, 255]
frame[H-1, :] = [255, 255, 255]
frame[:, 0] = [255, 255, 255]
frame[:, W-1] = [255, 255, 255]
frame[H//2-1:H//2+1, :] = [0, 0, 255]
frame[:, W//2-1:W//2+1] = [0, 0, 255]
hdmi_out.writeframe(frame)
time.sleep(3)

# Phase 3: Color bars
print("Phase 3: Color bars (3s)")
frame = hdmi_out.newframe()
frame[:] = 0
bar_w = W // 8
colors = [
    (255, 255, 255),
    (0, 255, 255),
    (255, 255, 0),
    (0, 255, 0),
    (255, 0, 255),
    (0, 0, 255),
    (255, 0, 0),
    (0, 0, 0),
]
for i, c in enumerate(colors):
    frame[:, i*bar_w:(i+1)*bar_w] = c
hdmi_out.writeframe(frame)
time.sleep(3)

# Phase 4: Grey gradient
print("Phase 4: Grey gradient (3s)")
frame = hdmi_out.newframe()
grad = np.linspace(0, 255, W, dtype=np.uint8)
frame[:] = np.stack([grad, grad, grad], axis=-1)
hdmi_out.writeframe(frame)
time.sleep(3)

# Phase 5: Test card with text
print("Phase 5: Test card")
frame = hdmi_out.newframe()
frame[:] = [32, 32, 32]

lines = [
    "HDMI OUTPUT TEST",
    "PYNQ Z1 -- Zynq-7020 XC7Z020CLG400-1",
    f"Resolution: {W}x{H} 24bpp",
    "",
    "0xDEADBEEF 0xCAFEBABE 0xFFFF 0x0000",
    "0x55AA55AA 0xBAADF00D 0x8BADF00D",
    "",
    "Lorem ipsum dolor sit amet, consectetur",
    "adipiscing elit. Sed do eiusmod tempor",
    "incididunt ut labore et dolore magna aliqua.",
    "",
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    "the quick brown fox jumps over the lazy dog",
    "1234567890 !@#$%^&*()-=_+[]{}|;:',.<>?/",
    "",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "",
    f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}",
    "If you can read this, HDMI out is working.",
]

# Convert to BGR for cv2
img = np.array(frame)
y = 60
for line in lines:
    if line == "HDMI OUTPUT TEST":
        cv2.putText(img, line, (40, y), cv2.FONT_HERSHEY_DUPLEX, 2.0, (255, 255, 255), 2, cv2.LINE_AA)
        y += 70
    elif line == "":
        y += 20
    else:
        cv2.putText(img, line, (40, y), cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 1, cv2.LINE_AA)
        y += 30

np.copyto(frame, img)
hdmi_out.writeframe(frame)

print("Test card displayed. Press Ctrl+C to stop.")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass

hdmi_out.stop()
print("Done!")
