#!/usr/bin/env python3
"""
Synchronise la vitrine « La Réserve Genève » (public/showcases/la-reserve-geneve/) avec le GUI CH5 du projet.

Usage :
    python3 scripts/sync-la-reserve-geneve.py ../../projects/la-reserve-geneve

Source unique : projects/la-reserve-geneve/ch5/src + reserve_config.json. La vitrine n'est JAMAIS éditée à la main :
ce script la remplace entièrement.
Différences avec le déploiement :
  - meta.mode = "showcase", meta.version suffixée "-showcase" → js/local-feedback.js simule le processeur ;
  - sélecteur d'espace Bar / Fitness / Lodge visible (un seul GUI pour les trois panneaux) ;
  - js/webxpanel.js et js/ch5-components.js (connexion CP3 / CrComLib) ne sont ni copiés ni chargés.
"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEST = HERE.parent / "public" / "showcases" / "la-reserve-geneve"
EXCLUDED_JS = {"webxpanel.js", "ch5-components.js"}

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    proj = Path(sys.argv[1]).resolve()
    src = proj / "ch5" / "src"
    cfg = json.loads((proj / "reserve_config.json").read_text(encoding="utf-8"))
    cfg["meta"]["mode"] = "showcase"
    cfg["meta"]["version"] = cfg["meta"]["version"] + "-showcase"
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(src, DEST, ignore=shutil.ignore_patterns(*EXCLUDED_JS, "reserve_config.js", "reserve_config.json", "OFL-*.txt"))
    txt = json.dumps(cfg, ensure_ascii=False, indent=2)
    (DEST / "reserve_config.json").write_text(txt + "\n", encoding="utf-8")
    (DEST / "reserve_config.js").write_text("/* Vitrine — généré par scripts/sync-la-reserve-geneve.py, ne pas éditer. */\nwindow.reserveConfig = " + txt + ";\n", encoding="utf-8")
    for html in ("index.html", "iphone.html"):
        f = DEST / html
        t = f.read_text(encoding="utf-8")
        for js in EXCLUDED_JS:
            t = re.sub(r'\s*<script src="js/' + re.escape(js) + r'"></script>', "", t)
        f.write_text(t, encoding="utf-8")
    n = sum(1 for _ in DEST.rglob("*") if _.is_file())
    print(f"Vitrine La Réserve Genève synchronisée : {n} fichiers, version {cfg['meta']['version']}.")

if __name__ == "__main__":
    main()
