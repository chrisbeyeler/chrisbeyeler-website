#!/usr/bin/env python3
"""Erzeugt WebP-Varianten (480/960/1440 px Breite) für alle Rasterbilder,
die in index.html eingebunden sind. Originale bleiben als Fallback erhalten.

Aufruf im Projektverzeichnis:  python3 tools/optimize_images.py
"""
import os, re, sys
from PIL import Image

WIDTHS = (480, 960, 1440)
QUALITY = 74

def variants(src):
    base, _ = os.path.splitext(src)
    with Image.open(src) as im:
        w, h = im.size
        out = []
        for target in WIDTHS:
            if target > w and out:
                break
            tw = min(target, w)
            dst = f"{base}-{tw}.webp"
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
                frame = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
                frame = frame.resize((tw, round(h * tw / w)), Image.LANCZOS)
                frame.save(dst, "WEBP", quality=QUALITY, method=6)
            out.append((tw, dst))
            if tw == w:
                break
        return out

def main():
    html = open("index.html", encoding="utf-8").read()
    srcs = sorted(set(re.findall(r'(?:src|data-poster)="((?:img|assets)/[^"]+\.(?:jpe?g|png))"', html)))
    before = after = 0
    for src in srcs:
        if not os.path.exists(src) or "favicon" in src or "webclip" in src:
            continue
        v = variants(src)
        before += os.path.getsize(src)
        after += os.path.getsize(v[-1][1])
        print(f"{src}: " + ", ".join(f"{w}w {os.path.getsize(p)//1024} KB" for w, p in v))
    print(f"\nOriginale {before//1024} KB -> grösste WebP-Variante {after//1024} KB")

if __name__ == "__main__":
    sys.exit(main())
