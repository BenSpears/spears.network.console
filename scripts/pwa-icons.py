#!/usr/bin/env python3
"""Generate per-tool PWA icons + manifests into static/pwa/.
Run from repo root:  python3 scripts/pwa-icons.py
Re-run whenever tools are added/removed."""
import glob, json, os, re
from PIL import Image, ImageDraw, ImageFont

FONT = "assets/og/DejaVuSansMono-Bold.ttf"
BG = (10, 14, 18)      # #0a0e12
MINT = (94, 242, 160)  # #5ef2a0
OUT = "static/pwa"
os.makedirs(OUT, exist_ok=True)


def fit_font(draw, text, target_w, start):
    size = start
    while size > 8:
        f = ImageFont.truetype(FONT, size)
        bb = draw.textbbox((0, 0), text, font=f)
        if (bb[2] - bb[0]) <= target_w:
            return f
        size -= 4
    return ImageFont.truetype(FONT, size)


def draw_icon(size, glyph, out, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, size, size], fill=BG + (255,))
        target = size * 0.5
    else:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.18), fill=BG)
        target = size * 0.66
    f = fit_font(d, glyph, target, int(size * 0.5))
    bb = d.textbbox((0, 0), glyph, font=f)
    x = (size - (bb[2] - bb[0])) / 2 - bb[0]
    y = (size - (bb[3] - bb[1])) / 2 - bb[1]
    d.text((x, y), glyph, font=f, fill=MINT)
    img.save(out)


def field(text, key):
    m = re.search(r'^%s\s*=\s*"(.*)"\s*$' % key, text, re.M)
    return m.group(1) if m else ""


count = 0
for path in glob.glob("content/tools/*.md"):
    slug = os.path.splitext(os.path.basename(path))[0]
    if slug == "_index":
        continue
    t = open(path).read()
    title = field(t, "title")
    glyph = field(t, "glyph") or "»"
    if not title:
        continue
    short = title if len(title) <= 12 else title.split()[0]
    draw_icon(192, glyph, "%s/%s-192.png" % (OUT, slug))
    draw_icon(512, glyph, "%s/%s-512.png" % (OUT, slug))
    draw_icon(512, glyph, "%s/%s-maskable-512.png" % (OUT, slug), maskable=True)
    manifest = {
        "id": "/tools/%s/" % slug,
        "name": title,
        "short_name": short,
        "start_url": "/tools/%s/" % slug,
        "scope": "/",
        "display": "standalone",
        "background_color": "#0a0e12",
        "theme_color": "#0a0e12",
        "icons": [
            {"src": "/pwa/%s-192.png" % slug, "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/pwa/%s-512.png" % slug, "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/pwa/%s-maskable-512.png" % slug, "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    with open("%s/%s.webmanifest" % (OUT, slug), "w") as f:
        json.dump(manifest, f, indent=2)
    count += 1

print("generated PWA icons + manifests for %d tools" % count)
