"""Convert 'moden' to SVG paths using KakaoBig, matching Kakao logo box 74x24."""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

root = Path(r"D:\Dev\cursor\servicedesk\ModeunSystems-front")
woff = root / "static" / "KakaoBig-Regular.woff2"
out_font = root / "static" / "fonts" / "KakaoBig-Regular.woff2"
out_svg = root / "static" / "moden-logo.svg"

out_font.parent.mkdir(parents=True, exist_ok=True)
out_font.write_bytes(woff.read_bytes())

font = TTFont(woff)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
units_per_em = font["head"].unitsPerEm
ascender = font["hhea"].ascender
descender = font["hhea"].descender

text = "moden"
# Kakao logo box
vb_w, vb_h = 74.0, 24.0
# Target glyph height inside box (kakao paths span ~0.3–22.3 ≈ 22px)
target_h = 21.5

# Measure advance width
advances = []
for ch in text:
    gname = cmap.get(ord(ch))
    if not gname:
        raise SystemExit(f"missing glyph: {ch}")
    advances.append(glyph_set[gname].width)

total_adv = sum(advances)
scale = target_h / units_per_em
# Slight tracking like kakao (tight)
tracking = -units_per_em * 0.02
total_adv_tracked = total_adv + tracking * (len(text) - 1)
text_w = total_adv_tracked * scale

# If wider than box, shrink to fit with tiny padding
pad_x = 0.5
if text_w > vb_w - pad_x * 2:
    scale = (vb_w - pad_x * 2) / total_adv_tracked
    text_w = total_adv_tracked * scale

# Vertical: place baseline so caps sit like kakao (~y 0.3 to 22)
# In font, baseline at 0, ascender up. SVG y grows down.
# After scale+flipY: y_svg = origin_y - y_font * scale
origin_y = 21.2  # near kakao bottom of letters
origin_x = (vb_w - text_w) / 2  # center like kakao wordmark feel; kakao is leftish — use 0.5
origin_x = 0.8

paths = []
pen_x = 0.0
for i, ch in enumerate(text):
    gname = cmap[ord(ch)]
    glyph = glyph_set[gname]
    svg_pen = SVGPathPen(glyph_set)
    # font y-up → svg y-down
    t = Transform().translate(origin_x + pen_x * scale, origin_y).scale(scale, -scale)
    tpen = TransformPen(svg_pen, t)
    glyph.draw(tpen)
    d = svg_pen.getCommands()
    if d:
        paths.append(d)
    pen_x += advances[i] + tracking

svg = [
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(vb_w)}" height="{int(vb_h)}" viewBox="0 0 {vb_w} {vb_h}" fill="none" class="ico_logo">',
]
for d in paths:
    svg.append(f'  <path fill-rule="nonzero" d="{d}" fill="black"/>')
svg.append("</svg>")
out_svg.write_text("\n".join(svg) + "\n", encoding="utf-8")
print("wrote", out_svg)
print("scale", scale, "text_w", text_w, "paths", len(paths))

# Also dump systems subtitle as small SVG optional
text2 = "systems"
adv2 = [glyph_set[cmap[ord(c)]].width for c in text2]
total2 = sum(adv2)
sub_h = 9.0
scale2 = sub_h / units_per_em
origin_y2 = 8.5
origin_x2 = 0.0
paths2 = []
pen_x = 0.0
for i, ch in enumerate(text2):
    gname = cmap[ord(ch)]
    glyph = glyph_set[gname]
    svg_pen = SVGPathPen(glyph_set)
    t = Transform().translate(origin_x2 + pen_x * scale2, origin_y2).scale(scale2, -scale2)
    tpen = TransformPen(svg_pen, t)
    glyph.draw(tpen)
    d = svg_pen.getCommands()
    if d:
        paths2.append(d)
    pen_x += adv2[i]

sub_w = total2 * scale2 + 2
out_sub = root / "static" / "systems-word.svg"
sub = [
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{sub_w:.1f}" height="10" viewBox="0 0 {sub_w:.1f} 10" fill="none">',
]
for d in paths2:
    sub.append(f'  <path fill-rule="nonzero" d="{d}" fill="black"/>')
sub.append("</svg>")
out_sub.write_text("\n".join(sub) + "\n", encoding="utf-8")
print("wrote", out_sub, "w", sub_w)
