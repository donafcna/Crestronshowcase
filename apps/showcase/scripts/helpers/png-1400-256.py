#!/usr/bin/env python3
"""
Réduit des captures de fiche au format du site : largeur 1400 px maximum (jamais agrandies),
palette 256 couleurs (PNG « P »), comme les captures de public/sheets/<id>/.

Usage : python3 scripts/helpers/png-1400-256.py <dossier source> <dossier destination>
"""
import sys
from pathlib import Path

from PIL import Image

MAX_W = 1400


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, dest = Path(sys.argv[1]), Path(sys.argv[2])
    dest.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob("[0-9]*.png")):
        im = Image.open(f).convert("RGB")
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        im.save(dest / f.name, optimize=True)
        print(f"{f.name}: {im.size[0]}x{im.size[1]} P {(dest / f.name).stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
