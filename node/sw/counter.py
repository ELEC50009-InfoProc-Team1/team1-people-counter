#!/usr/bin/env python

import time
import logging
import argparse

from collections import OrderedDict
from enum import Enum

# These imports take a while on the arm soc.
import numpy as np
import cv2

logger = logging.getLogger(__name__)


class Orientation(Enum):
    UP = 1
    DOWN = 2
    LEFT = 3
    RIGHT = 4


class BigBeautifulBackend:
    """Connector for George's fantastic server"""

    def __init__(self, base_url, api_key):
        import requests
        self.session = requests.Session()

        self.url = base_url.rstrip('/')
        self.session.headers.update({
            "x-api-key": api_key,
            "Content-Type": "application/json"
        })
        self.timeout = 5

    def check_auth(self) -> bool:
        """Test API key"""
        try:
            response = self.session.get(
                f"{self.url}/user/me", timeout=self.timeout
            )

            if response.status_code != 200:
                logging.warning(
                    f"API key check failed: {response.status_code} {response.text}")
                return False

            data = response.json()
            user_id = data.get("id")
            user_name = data.get("name")

            logger.info(
                f"Authenticated with API at {self.url} as {user_name} (id={user_id})")
            return True

        except Exception as e:
            logger.error(f"Error checking API key: {e}")
            return False

    def setup_myself_for_ui(self) -> bool:
        """get room id and things"""
        try:
            camera_response = self.session.get(
                f"{self.url}/camera/me", timeout=self.timeout
            )

            doorway_id = camera_response.json().get("location")

            doorway_response = self.session.get(
                f"{self.url}/doorway/{doorway_id}", timeout=self.timeout
            )

            self.in_room_id = doorway_response.json().get("inRoomID")
            self.out_room_id = doorway_response.json().get("outRoomID")

            self.in_room_name = None
            self.out_room_name = None

            if self.in_room_id is not None:
                in_room_response = self.session.get(
                    f"{self.url}/room/{self.in_room_id}", timeout=self.timeout
                )
                self.in_room_name = in_room_response.json().get("name")

            if self.out_room_id is not None:
                out_room_response = self.session.get(
                    f"{self.url}/room/{self.out_room_id}", timeout=self.timeout
                )
                self.out_room_name = out_room_response.json().get("name")

            logger.info(
                f"Camera configured read from server. inRoom: {self.in_room_name if self.in_room_name is not None else 'unknown'} ({self.in_room_id if self.in_room_id is not None else 'unknown'}), outRoom: {self.out_room_name if self.out_room_name is not None else 'unknown'} ({self.out_room_id if self.out_room_id is not None else 'unknown'})")

            return True

        except Exception as e:
            logger.error(f"Error setting up camera things for UI: {e}")
            return False

    def get_occupancy(self) -> tuple[int, int]:
        """Returns (currentNoOfPeople, maxCapacity) for in-room"""
        try:
            response = self.session.get(
                f"{self.url}/room/{self.in_room_id}", timeout=self.timeout
            )

            if response.status_code != 200:
                logging.warning(
                    f"Failed to fetch occupancy: {response.status_code} {response.text}")
                return 0, 0

            data = response.json()
            return data.get("currentNoOfPeople"), data.get("maxCapacity")

        except Exception as e:
            logger.error(f"Error getting occupancy API key: {e}")
            return 0, 0

    def get_all_rooms(self):
        """Returns all room objects visible to this API user"""
        try:
            response = self.session.get(
                f"{self.url}/room/all", timeout=self.timeout
            )

            if response.status_code != 200:
                logging.warning(
                    f"Failed to fetch rooms: {response.status_code} {response.text}")
                return None

            rooms_data = response.json().get("rooms")

            rooms_list = [
                (
                    r.get("name", "Unknown"),
                    r.get("currentNoOfPeople", 0),
                    r.get("maxCapacity", 0)
                )
                for r in rooms_data
            ]

            return rooms_list

        except Exception as e:
            logger.error(f"Error getting room list: {e}")
            return None

    def _trigger(self, increment: bool = True) -> bool:
        try:
            endpoint = "enterroom" if increment else "exitroom"
            response = self.session.post(
                f"{self.url}/trigger/{endpoint}", timeout=self.timeout
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Server error during trigger {endpoint}: {e}")
            return False

    def enter(self) -> bool: return self._trigger(True)
    def exit(self) -> bool: return self._trigger(False)


class CentroidTracker:
    """Tracks centroids (wow)"""

    def __init__(self, max_disappeared_seconds, max_distance):
        from scipy.spatial import distance
        self.distance = distance

        self.max_disappeared = max_disappeared_seconds
        self.max_distance = max_distance

        self.objects = OrderedDict()
        self.last_seen = OrderedDict()
        self.next_id = 0

    def _register(self, centroid):
        self.objects[self.next_id] = centroid
        self.last_seen[self.next_id] = time.time()
        self.next_id += 1

    def _deregister(self, id):
        del self.objects[id]
        del self.last_seen[id]

    def _check_disappear(self, id):
        current_time = time.time()
        if current_time - self.last_seen[id] > self.max_disappeared:
            self._deregister(id)

    def update(self, input_centroids: list[tuple[int, int]]) -> dict:
        # No objects in frame
        if not input_centroids:
            # Must copy, size will change as we iterate
            for id in list(self.last_seen.keys()):
                self._check_disappear(id)
            return self.objects

        # No existing tracked objects
        if not self.objects:
            for centroid in input_centroids:
                self._register(centroid)
            return self.objects

        # Else, we have both existing objects, and in-frame centroids
        object_ids = list(self.objects.keys())
        object_centroids = np.array(list(self.objects.values()))
        input_centroids = np.array(input_centroids)

        # TODO try using np linalg instead?
        D = self.distance.cdist(object_centroids, input_centroids)

        rows = D.min(axis=1).argsort()
        cols = D.argmin(axis=1)[rows]

        used_rows, used_cols = set(), set()

        for row, col in zip(rows, cols):
            if row in used_rows or col in used_cols:
                continue
            if D[row, col] > self.max_distance:
                continue

            id = object_ids[row]
            self.objects[id] = input_centroids[col]
            self.last_seen[id] = time.time()

            used_rows.add(row)
            used_cols.add(col)

        unused_rows = set(range(D.shape[0])) - used_rows
        unused_cols = set(range(D.shape[1])) - used_cols

        for row in unused_rows:
            id = object_ids[row]
            self._check_disappear(id)

        for col in unused_cols:
            self._register(input_centroids[col])

        return self.objects


class PeopleCounter:
    """Thing to track people"""

    def __init__(self, height: int, width: int, server: BigBeautifulBackend, orientation: Orientation = Orientation.UP):
        self.horizontal = orientation in (Orientation.LEFT, Orientation.RIGHT)
        self.positive = orientation in (Orientation.UP, Orientation.LEFT)
        dim = width if self.horizontal else height
        self.width = width
        self.height = height
        self.lower_bound = dim // 3
        self.upper_bound = (2 * dim) // 3
        self.server = server

        self.object_origins = {}
        self.counted_ids = set()

        self.occupancy = 0

    def _count(self, id, exit: bool):
        self.counted_ids.add(id)
        if self.positive ^ exit:
            self.occupancy += 1
            logging.info(f"Person enterred. Occupancy: {self.occupancy}")
            if self.server:
                self.server.enter()
        else:
            self.occupancy -= 1
            logging.info(f"Person left. Occupancy: {self.occupancy}")
            if self.server:
                self.server.exit()

    def process(self, active_objects):
        # Delete objects no longer being tracked
        for id in list(self.object_origins.keys()):
            if id not in active_objects:
                del self.object_origins[id]
                self.counted_ids.discard(id)

        for id, (cx, cy) in active_objects.items():
            # Ignore those already counted
            if id in self.counted_ids:
                continue

            pos = cx if self.horizontal else cy

            cur_zone = 0 if pos < self.lower_bound else 2 if pos > self.upper_bound else 1

            if id not in self.object_origins:
                # Cannot start in middle
                if cur_zone != 1:
                    self.object_origins[id] = cur_zone

            else:
                origin = self.object_origins[id]

                if origin == 0 and cur_zone == 2:
                    self._count(id, True)
                elif origin == 2 and cur_zone == 0:
                    self._count(id, False)

    def draw_zones(self, frame):
        # Horizontal movement means vertical lines
        if not self.horizontal:
            cv2.line(frame, (0, self.lower_bound),
                     (self.width, self.lower_bound), (255, 255, 0), 2)
            cv2.line(frame, (0, self.upper_bound),
                     (self.width, self.upper_bound), (255, 255, 0), 2)
        else:
            cv2.line(frame, (self.lower_bound, 0),
                     (self.lower_bound, self.height), (255, 255, 0), 2)
            cv2.line(frame, (self.upper_bound, 0),
                     (self.upper_bound, self.height), (255, 255, 0), 2)


class Pipeline:
    """Hardware pipeline things"""

    def __init__(self, bitstream):
        from pynq import Overlay, allocate, MMIO
        from pynq.lib.video import PIXEL_RGBA
        self.Overlay = Overlay
        self.allocate = allocate
        self.MMIO = MMIO
        self.PIXEL_RGBA = PIXEL_RGBA

        self.bitstream = bitstream
        self.ol = None
        self.hdmi_in = None
        self.buf_rgb = None
        self.buf_diff = None
        self.buf_bg_old = None
        self.buf_bg_new = None

        self.hdmi_out = None
        self.buf_hdmi_out = None

    def _find_ip(self, name):
        for k in self.ol.ip_dict:
            if name in k:
                return k
        raise KeyError(f"No IP matching '{name}'")

    def _configure_ip(self, ip, height, width):
        ip.write(0x10, height)
        ip.write(0x18, width)

    def setup(self, enable_hdmi_out=False):
        self.ol = self.Overlay(self.bitstream)

        logger.debug("Setting up hdmi_in...")
        self.hdmi_in = self.ol.video.hdmi_in
        self.hdmi_in.configure(self.PIXEL_RGBA)
        self.hdmi_in.start()
        time.sleep(1)

        if enable_hdmi_out:
            from pynq.lib.video import VideoMode
            self.hdmi_out = self.ol.video.hdmi_out
            mode = VideoMode(1280, 720, 24)
            self.hdmi_out.configure(mode)
            self.hdmi_out.start()

            # Initialise out buffer
            self.buf_hdmi_out = self.hdmi_out.newframe()
            self.buf_hdmi_out[:] = 0
            self.hdmi_out.writeframe(self.buf_hdmi_out)

        frame = self.hdmi_in.readframe()
        self.H, self.W, _ = frame.shape
        N = self.H * self.W
        self.H2, self.W2 = self.H // 2, self.W // 2
        N2 = self.H2 * self.W2
        logger.debug(f"Input resolution: {self.W}x{self.H}")
        logger.debug(f"Mask resolution:  {self.W2}x{self.H2}")

        # Configure processing IPs (full resolution)
        full_ip_names = [
            'gaussian_blur',
            'bg_subtract',
            'downscale_2x'
        ]
        full_ips = [
            self.MMIO(self.ol.ip_dict[self._find_ip(name)]['phys_addr'], 0x10000) for name in full_ip_names]
        for ip in full_ips:
            self._configure_ip(ip, self.H, self.W)

        # Configure morph IPs (half resolution)
        morph_ip_names = [
            'morphological_open/morphological_erosion_0',
            'morphological_open/morphological_dilati_0',
            'morphological_close/morphological_dilati_1',
            'morphological_close/morphological_erosion_1',
        ]
        morph_ips = [
            self.MMIO(self.ol.ip_dict[self._find_ip(name)]['phys_addr'], 0x10000) for name in morph_ip_names]
        for ip in morph_ips:
            self._configure_ip(ip, self.H2, self.W2)

        self.ips = full_ips + morph_ips

        self.dma0 = self.ol.video.processing_pipeline.axi_dma_0
        self.dma1 = self.ol.video.processing_pipeline.axi_dma_1

        # Allocate DMA memory
        self.buf_rgb = self.allocate(shape=(self.H, self.W, 4), dtype=np.uint8)
        self.buf_diff = self.allocate(shape=(N2,),     dtype=np.uint8)
        self.buf_bg_old = self.allocate(shape=(N,),      dtype=np.uint16)
        self.buf_bg_new = self.allocate(shape=(N,),      dtype=np.uint16)

        # Initialise bg buffer
        self.buf_bg_old[:] = 0
        self.buf_bg_old.flush()

    def run_pipeline(self):
        frame = self.hdmi_in.readframe()
        np.copyto(self.buf_rgb, frame)
        self.buf_rgb.flush()

        for ip in self.ips:
            ip.write(0x00, 0x01)

        self.dma0.recvchannel.transfer(self.buf_diff)
        self.dma1.recvchannel.transfer(self.buf_bg_new)
        self.dma1.sendchannel.transfer(self.buf_bg_old)
        self.dma0.sendchannel.transfer(self.buf_rgb)

        self.dma0.sendchannel.wait()
        self.dma1.sendchannel.wait()
        self.dma0.recvchannel.wait()
        self.dma1.recvchannel.wait()

        self.buf_bg_old, self.buf_bg_new = self.buf_bg_new, self.buf_bg_old

    def learn_background(self, frames: int):
        times = []
        for i in range(frames):
            t0 = time.time()
            self.run_pipeline()
            times.append(time.time() - t0)
            if (i + 1) % 100 == 0:
                avg = np.mean(times[-100:])
                logger.debug(
                    f"  {i+1}/{frames}  {1.0/avg:.1f} fps  ({avg*1000:.1f} ms)")
        self.buf_bg_old.invalidate()

    def write_hdmi_out(self, frame):
        if self.hdmi_out is None:
            logger.warning("HDMI out IP not configured, will not send frame")
            return
        resized = cv2.resize(
            frame,
            (1280, 720), interpolation=cv2.INTER_NEAREST
        )
        np.copyto(self.buf_hdmi_out, resized)
        self.hdmi_out.writeframe(self.buf_hdmi_out)

    def close(self):
        for ip in (self.hdmi_in, self.hdmi_out):
            if ip is not None:
                ip.stop()
        for buf in [self.buf_rgb, self.buf_diff, self.buf_bg_old, self.buf_bg_new]:
            if buf is not None:
                del buf


def detect_centroids(mask, min_area: int, max_area: int) -> tuple[list, list]:
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    centers = []
    bboxes = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < min_area or area > max_area:
            continue

        x, y, w, h = cv2.boundingRect(cnt)

        aspect = h / max(w, 1)
        if aspect < 0.5:
            continue

        cx = x + w // 2
        cy = y + h // 2
        centers.append((cx, cy))
        bboxes.append((x, y, w, h))

    return centers, bboxes


def parse_args():
    parser = argparse.ArgumentParser(
        description="Team 1's People Countinator",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--bitstream",
        type=str,
        default="/home/xilinx/jupyter_notebooks/people_counter/people_counter.bit",
        help="Path to .bit"
    )
    parser.add_argument(
        "--bg-frames",
        type=int,
        default=1000,
        help="Number of frames to train background for"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.1,
        help="Interval to process frames"
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=0,
        help="Duration (in seconds) to record for. If 0, will record forever"
    )
    parser.add_argument(
        "--orientation",
        default=Orientation.UP.name,
        type=str,
        choices=[o.name for o in Orientation],
        help="Orientation that increases room occupancy"
    )
    LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    parser.add_argument(
        "-l", "--loglevel",
        default="INFO",
        choices=LOG_LEVELS,
        help="Set log level"
    )

    api_group = parser.add_argument_group("API options")
    api_group.add_argument(
        "--api-url",
        type=str,
        default="https://infoproc.unigeorge.uk/api/v1",
        help="API base URL"
    )
    api_group.add_argument(
        "-k", "--api-key",
        type=str,
        help="API key"
    )

    out_group = parser.add_argument_group("Output options")
    out_group.add_argument(
        "-s", "--save-buffers",
        action="store_true",
        help="Save background and recording to --buffer-dir"
    )
    out_group.add_argument(
        "--buffer-dir",
        type=str,
        default="buffers",
        help="Buffer output directory (requires -s)"
    )
    out_group.add_argument(
        "--hdmi-out",
        choices=("OFF", "NORMAL", "BUFFER"),
        type=str,
        default="OFF",
        help="HDMI output"
    )

    tuning_group = parser.add_argument_group("Tuning parameters")
    tuning_group.add_argument(
        "--min-area",
        type=int,
        default=1500,
        help="Minimum object size"
    )
    tuning_group.add_argument(
        "--max-area",
        type=int,
        default=50000,
        help="Maximum object size"
    )
    tuning_group.add_argument(
        "--max-disappeared",
        type=float,
        default=0.5,
        help="Max seconds for a person to be hidden until they count as a new person"
    )
    tuning_group.add_argument(
        "--max-distance",
        type=int,
        default=80,
        help="Max distance "
    )

    return parser.parse_args()


def main():
    # Args and logging
    args = parse_args()
    logging.basicConfig(
        level=args.loglevel,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    logger.info("Setting up...")

    # Handle SIGINT nicely, or we may hang forever in C code
    def handle_signal(signum, frame):
        from sys import exit
        logger.info("Interrupt received, will exit soon...")
        exit(0)

    import signal
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, handle_signal)

    # FPGA pipeline
    hw = Pipeline(args.bitstream)

    # Centroid tracking and backend
    tracker = CentroidTracker(args.max_disappeared, args.max_distance)
    counter = None
    server = None
    if args.api_key is not None:
        server = BigBeautifulBackend(args.api_url, args.api_key)
        if not server.check_auth():
            logger.error(
                "API connection couldn't be established. Is the key correct? Continuing without backend...")
            server = None
        if server is not None:
            server.setup_myself_for_ui()
    else:
        logger.warning("API Key not provided, disabling backend...")

    # Output
    out_dir = args.buffer_dir
    video_writer = None

    start = None
    frame_count = 0

    try:
        # Initialise IPs
        hw.setup(args.hdmi_out != "OFF")

        # Person tracking
        counter = PeopleCounter(hw.H2, hw.W2, server,
                                orientation=Orientation[args.orientation])

        # Learn background
        logger.info(
            f"Background ({args.bg_frames} frames): 3 seconds till learning starts...")
        time.sleep(3)
        logger.info(f"Learning background - keep scene empty...")
        hw.learn_background(args.bg_frames)
        logger.debug("Background locked and loaded")

        ui = None
        if args.hdmi_out == "NORMAL":
            if server is not None:
                import ui as uii
                ui = uii.UI()
                # Point UI directly at the HDMI output buffer so draws go straight
                # to the display memory with no intermediate copy.
                ui.attach(hw.buf_hdmi_out)
            else:
                logger.warning(
                    "Cannot use --hdmi-out=NORMAL without API connection, changing to BUFFER.")
                args.hdmi_out = "BUFFER"

        # Save background
        if args.save_buffers:
            from PIL import Image
            from os import makedirs
            import os.path
            makedirs(out_dir, exist_ok=True)

            bg_img = (np.array(hw.buf_bg_old) >> 8).astype(
                np.uint8).reshape(hw.H, hw.W)

            bg_path = os.path.join(out_dir, "background.png")
            Image.fromarray(bg_img).save(bg_path)
            logger.info(f"Saved {bg_path}")

            # Output video
            fourcc = cv2.VideoWriter_fourcc(*'MJPG')
            video_path = os.path.join(out_dir, "tracking_output.avi")
            fps = 1.0 / args.interval
            video_writer = cv2.VideoWriter(
                video_path, fourcc, fps, (hw.W2, hw.H2)
            )
            logger.info(f"Saving output to {video_path}")

        logger.info("Recording begins in 3s...")
        time.sleep(3)
        if (args.duration > 0):
            logger.info(
                f"Recording for {args.duration}s. Interval: {args.interval}s...")
        else:
            logger.info(
                f"Recording continously. Interval: {args.interval}s. Press ctrl-c to exit...")

        start = time.time()
        last_save = 0.0
        last_room_refresh = 0.0
        cur_occupancy = 0
        max_occupancy = 0
        other_rooms = []

        # while running:
        while True:
            hw.run_pipeline()
            frame_count += 1
            elapsed = time.time() - start

            if args.duration > 0 and elapsed > args.duration:
                logger.info(f"Stopping after {elapsed}s.")
                break

            if elapsed - last_save >= args.interval:
                hw.buf_diff.invalidate()
                diff = np.array(hw.buf_diff).reshape(hw.H2, hw.W2)

                # contour detection
                mask = (diff > 0).astype(np.uint8) * 255
                centers, bboxes = detect_centroids(
                    mask, args.min_area, args.max_area
                )
                logger.debug(f"Detected {len(centers)} blobs")

                objects = tracker.update(centers)
                counter.process(objects)

                if args.hdmi_out == "NORMAL":
                    if elapsed - last_room_refresh >= 5.0:
                        cur_occupancy, max_occupancy = server.get_occupancy()
                        logging.info(
                            f"Got new occupancy from API: {cur_occupancy} / {max_occupancy}")
                        other_rooms = server.get_all_rooms() or []
                        last_room_refresh = elapsed

                    if ui.build_dashboard_frame(
                        cur_occupancy,
                        server.in_room_name,
                        max_occupancy,
                        other_rooms
                    ) is not None:
                        hw.hdmi_out.writeframe(hw.buf_hdmi_out)

                # Output to file and/or HDMI
                if args.save_buffers or args.hdmi_out != "OFF":
                    vis = cv2.cvtColor(diff, cv2.COLOR_GRAY2BGR)

                    # Add zones
                    counter.draw_zones(vis)

                    # Add bboxes
                    for x, y, w, h in bboxes:
                        cv2.rectangle(vis, (x, y), (x+w, y+h), (0, 0, 255), 2)

                    # Add labels
                    for object_id, (cx, cy) in objects.items():
                        cv2.putText(
                            vis,
                            f"ID {object_id}",
                            (cx-10, cy-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1
                        )

                    # Add current room count
                    cv2.putText(
                        vis,
                        f"Occupancy: {counter.occupancy}",
                        (10, 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1
                    )

                    # Write frame
                    if args.save_buffers and video_writer is not None:
                        video_writer.write(vis)
                    if args.hdmi_out == "BUFFER":
                        hw.write_hdmi_out(vis)

                last_save = elapsed

    except Exception as e:
        logger.critical(f"Unexpected error: {e}, exiting...")

    finally:
        # Log final stats
        if start is not None:
            total = time.time() - start
            logger.info(
                f"{frame_count} frames in {total:.1f}s ({frame_count/total:.1f} fps)")

        logging.info("Cleaning up hardware and buffers")
        hw.close()
        if video_writer is not None:
            video_writer.release()

        logging.info("Goodbye..")


if __name__ == '__main__':
    main()
