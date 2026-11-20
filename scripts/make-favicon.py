from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen, replayRecording
from pathlib import Path

root = Path(__file__).resolve().parents[1]
font = TTFont(Path(__file__).resolve().parent / "Poppins-Bold.ttf")
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()

chars = "m."
recordings = []
cursor_x = 0.0
xmin = ymin = float("inf")
xmax = ymax = float("-inf")

for ch in chars:
    glyph = glyph_set[cmap[ord(ch)]]
    rp = RecordingPen()
    glyph.draw(rp)
    recordings.append((rp.value, cursor_x))

    bp = BoundsPen(glyph_set)
    glyph.draw(bp)
    if bp.bounds:
        gx0, gy0, gx1, gy1 = bp.bounds
        xmin = min(xmin, gx0 + cursor_x)
        ymin = min(ymin, gy0)
        xmax = max(xmax, gx1 + cursor_x)
        ymax = max(ymax, gy1)

    cursor_x += glyph.width

size = 64
pad = 6
gw = xmax - xmin
gh = ymax - ymin
scale = min((size - 2 * pad) / gw, (size - 2 * pad) / gh)
ox = (size - gw * scale) / 2 - xmin * scale
oy = (size - gh * scale) / 2 + ymax * scale

pen = SVGPathPen(glyph_set)
for recording, dx in recordings:
    tpen = TransformPen(pen, (scale, 0, 0, -scale, ox + dx * scale, oy))
    replayRecording(recording, tpen)

path = pen.getCommands()
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="{path}" fill="#FEE500"/>
</svg>
"""
(root / "static" / "favicon.svg").write_text(svg, encoding="utf-8")
print("favicon written: m.")
