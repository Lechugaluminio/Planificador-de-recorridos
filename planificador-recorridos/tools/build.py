#!/usr/bin/env python3
"""Arma index.html (un solo archivo, listo para GitHub Pages) a partir de src/.

Uso:  python tools/build.py
Inserta en src/app.html:
  /*FXENGINE*/  <- src/fxengine.js   (motor de fuego y humo animado)
  /*DEMO*/[]    <- src/demo.json     (fotos del ejemplo Monte Carmelo)
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "src"
app = (src / "app.html").read_text(encoding="utf-8")
engine = (src / "fxengine.js").read_text(encoding="utf-8")
demo = (src / "demo.json").read_text(encoding="utf-8")

for mark in ("/*FXENGINE*/", "/*DEMO*/[]"):
    if mark not in app:
        raise SystemExit(f"No encuentro la marca {mark} en src/app.html")

out = app.replace("/*FXENGINE*/", engine).replace("/*DEMO*/[]", demo)
(root / "index.html").write_text(out, encoding="utf-8")
print(f"index.html listo ({len(out.encode('utf-8')) // 1024} KB)")
