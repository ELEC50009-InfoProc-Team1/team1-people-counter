# ui
UI_WIDTH = 1280
UI_HEIGHT = 720
ROOM_NAME = "Lab Room 2"
MAX_OCCUPANCY = 20
PANEL = (28, 28, 28)
PANEL_ALT = (24, 24, 24)
TEXT = (240, 240, 240)
SUBTEXT = (150, 150, 150)
GREEN = (80, 200, 80)
BAR_BG = (40, 40, 40)
BG = (18, 18, 18)
BORDER = (60, 60, 60)


class UI:
    def __init__(self):
        # imports
        from time import strftime
        self.strftime = strftime
        import cv2
        self.cv2 = cv2
        from numpy import zeros, uint8
        self.zeros = zeros
        self.uint8 = uint8

        self._frame = None      # render target — set via attach() or lazily allocated
        self._last = {}         # last-drawn state per region

    def attach(self, frame_buf):
        """Point the UI at an external buffer (e.g. PYNQ hdmi_out.newframe()).
        All subsequent draws go directly into frame_buf — no copies needed."""
        self._frame = frame_buf
        self._frame[:] = BG
        self._last.clear()      # force full redraw on first draw_dashboard call

    def _ensure_frame(self):
        if self._frame is None:
            self._frame = self.zeros((UI_HEIGHT, UI_WIDTH, 3), dtype=self.uint8)
            self._frame[:] = BG

    def _percent_full(self, count, capacity):
        if capacity <= 0:
            return 0
        return min(100, int((count / capacity) * 100))

    def _percent_colour(self, percent):
        if percent < 50:
            return (80, 200, 80)
        if percent < 80:
            return (0, 165, 255)
        return (0, 0, 220)

    def best_room(self, room_name, room_count, max_occupancy, other_rooms):
        current_ratio = 1.0 if max_occupancy <= 0 else room_count / max_occupancy
        best = (room_name, room_count, max_occupancy, current_ratio)

        for name, count, capacity in other_rooms:
            ratio = 1.0 if capacity <= 0 else count / capacity
            if ratio < best[3]:
                best = (name, count, capacity, ratio)

        return best[:3]

    def _panel(self, frame, x1, y1, x2, y2, colour=PANEL):
        self.cv2.rectangle(frame, (x1, y1), (x2, y2), colour, -1)
        self.cv2.rectangle(frame, (x1, y1), (x2, y2), BORDER, 1)

    def bar(self, frame, x, y, width, height, percent, colour):
        self.cv2.rectangle(
            frame, (x, y), (x + width, y + height), BAR_BG, -1)
        fill = int(width * percent / 100)
        if fill > 0:
            self.cv2.rectangle(
                frame, (x, y), (x + fill, y + height), colour, -1)

    def centre_x(self, text, font, scale, thickness, middle):
        width = self.cv2.getTextSize(text, font, scale, thickness)[0][0]
        return middle - width // 2

    # ── region draw helpers (write directly into self._frame) ─────────────

    def _draw_header(self, room_name):
        self._panel(self._frame, 0, 0, UI_WIDTH, 90)
        self.cv2.putText(
            self._frame, room_name, (40, 52),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.2, TEXT, 2, self.cv2.LINE_AA)
        self.cv2.putText(
            self._frame, "People Counter V1.0", (42, 78),
            self.cv2.FONT_HERSHEY_SIMPLEX, 0.65, SUBTEXT, 1, self.cv2.LINE_AA)

    def _draw_clock(self, t):
        # Clear just the clock slice of the header, then redraw.
        self._frame[0:90, 1070:UI_WIDTH] = PANEL
        self.cv2.line(self._frame, (UI_WIDTH - 1, 0), (UI_WIDTH - 1, 90), BORDER, 1)
        self.cv2.putText(
            self._frame, t, (UI_WIDTH - 180, 58),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.0, GREEN, 2, self.cv2.LINE_AA)

    def _draw_left_panel(self, room_count, room_name, max_occupancy):
        current_percent = self._percent_full(room_count, max_occupancy)
        current_colour = self._percent_colour(current_percent)
        spaces_left = max(0, max_occupancy - room_count)

        self._frame[108:562, 28:602] = BG
        self._panel(self._frame, 30, 110, 600, 560)
        self.cv2.putText(
            self._frame, "Current occupancy", (60, 163),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.0, TEXT, 2, self.cv2.LINE_AA)

        count_text = str(room_count)
        count_x = self.centre_x(
            count_text, self.cv2.FONT_HERSHEY_DUPLEX, 7.0, 8, 315)
        self.cv2.putText(
            self._frame, count_text, (count_x, 360),
            self.cv2.FONT_HERSHEY_DUPLEX, 7.0, TEXT, 8, self.cv2.LINE_AA)
        self.cv2.putText(
            self._frame, f"{current_percent}% occupied", (60, 430),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.2, current_colour, 2, self.cv2.LINE_AA)
        self.bar(self._frame, 60, 460, 500, 30, current_percent, current_colour)
        self.cv2.putText(
            self._frame, f"{spaces_left} spaces left", (60, 530),
            self.cv2.FONT_HERSHEY_SIMPLEX, 0.9, SUBTEXT, 2, self.cv2.LINE_AA)

    def _draw_right_panel(self, best_name, best_count, best_capacity):
        best_percent = self._percent_full(best_count, best_capacity)
        best_colour = self._percent_colour(best_percent)
        best_spaces = max(0, best_capacity - best_count)

        self._frame[108:562, 628:1242] = BG
        self._panel(self._frame, 630, 110, 1240, 560)
        self.cv2.putText(
            self._frame, "Best room to go to", (660, 163),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.0, TEXT, 2, self.cv2.LINE_AA)
        self.cv2.putText(
            self._frame, best_name, (660, 260),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.6, TEXT, 2, self.cv2.LINE_AA)
        self.cv2.putText(
            self._frame, f"{best_percent}% occupied", (660, 330),
            self.cv2.FONT_HERSHEY_DUPLEX, 1.2, best_colour, 2, self.cv2.LINE_AA)
        self.bar(self._frame, 660, 370, 540, 30, best_percent, best_colour)
        self.cv2.putText(
            self._frame, f"{best_spaces} spaces left", (660, 450),
            self.cv2.FONT_HERSHEY_SIMPLEX, 0.9, SUBTEXT, 2, self.cv2.LINE_AA)

    def _draw_bottom_bar(self, other_rooms):
        self._frame[578:682, 28:1242] = BG
        self._panel(self._frame, 30, 580, 1240, 680, PANEL_ALT)
        x = 60
        for name, count, capacity in other_rooms:
            percent = self._percent_full(count, capacity)
            colour = self._percent_colour(percent)
            self.cv2.putText(
                self._frame, f"{name}: {percent}%", (x, 640),
                self.cv2.FONT_HERSHEY_SIMPLEX, 0.85, colour, 1, self.cv2.LINE_AA)
            x += 380

    # ── public API ─────────────────────────────────────────────────────────

    def draw_dashboard(self, room_count, room_name, max_occupancy, other_rooms):
        """Update dirty regions in self._frame. Returns True if any pixels changed."""
        self._ensure_frame()

        best_name, best_count, best_capacity = self.best_room(
            room_name, room_count, max_occupancy, other_rooms)

        t = self.strftime("%H:%M:%S")
        changed = False

        if self._last.get('header') != room_name:
            self._draw_header(room_name)
            self._last['header'] = room_name
            self._last.pop('clock', None)   # header wipe cleared the clock area
            changed = True

        if self._last.get('clock') != t:
            self._draw_clock(t)
            self._last['clock'] = t
            changed = True

        left_key = (room_count, room_name, max_occupancy)
        if self._last.get('left') != left_key:
            self._draw_left_panel(room_count, room_name, max_occupancy)
            self._last['left'] = left_key
            changed = True

        right_key = (best_name, best_count, best_capacity)
        if self._last.get('right') != right_key:
            self._draw_right_panel(best_name, best_count, best_capacity)
            self._last['right'] = right_key
            changed = True

        bottom_key = tuple((n, c, cap) for n, c, cap in other_rooms)
        if self._last.get('bottom') != bottom_key:
            self._draw_bottom_bar(other_rooms)
            self._last['bottom'] = bottom_key
            changed = True

        return changed

    def build_dashboard_frame(
        self,
        room_count,
        room_name=ROOM_NAME,
        max_occupancy=MAX_OCCUPANCY,
        other_rooms=[]
    ):
        """Returns self._frame if anything changed, else None."""
        changed = self.draw_dashboard(room_count, room_name, max_occupancy, other_rooms)
        return self._frame if changed else None
