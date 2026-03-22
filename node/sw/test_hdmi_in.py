#!/usr/bin/env python3
import time
import signal
from pynq import Overlay

_overlay = None
_running = True

def _stop(sig, frame):
    global _running
    _running = False

signal.signal(signal.SIGINT, _stop)
signal.signal(signal.SIGTERM, _stop)

_overlay = Overlay("/home/xilinx/jupyter_notebooks/people_counter/hdmi_only.bit")

hdmi_in = _overlay.video.hdmi_in
hdmi_in.configure()
hdmi_in.start()

frame_idx = 0
try:
    while _running:
        frame = hdmi_in.readframe()
        frame.freebuffer()
        frame_idx += 1
        print(f"[FRAME {frame_idx}] new frame received", flush=True)
finally:
    hdmi_in.stop()
    print(f"Done. {frame_idx} frames received.")