#!/usr/bin/env python3
"""
Synchronise la vitrine « Showroom FTV Nyon » (public/showcases/showroom-ftv-nyon/) avec le GUI CH5 du projet.

Usage :
    python3 scripts/sync-showroom-ftv-nyon.py ../../projects/showroom-ftv-nyon

Source unique : projects/showroom-ftv-nyon/ch5/src + showroom_config.json (racine du projet). La vitrine n'est
JAMAIS éditée à la main : ce script la remplace entièrement.
Différences avec le déploiement :
  - meta.mode = "showcase", meta.version suffixée "-showcase" → js/local-feedback.js simule le processeur ;
  - js/webxpanel.js et js/ch5-components.js (connexion CP4 / CrComLib) ne sont ni copiés ni chargés ;
  - contrôle bloquant : aucun terme de test dans les noms publiés.
"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEST = HERE.parent / "public" / "showcases" / "showroom-ftv-nyon"
EXCLUDED_JS = {"webxpanel.js", "ch5-components.js"}
TEST_TERMS = ["todo", "xxx", "lorem", "dummy", "fixme"]

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    proj = Path(sys.argv[1]).resolve()
    src = proj / "ch5" / "src"
    cfg = json.loads((proj / "showroom_config.json").read_text(encoding="utf-8"))
    names = [cfg["maison"]["nom"]] + [p["nom"] for p in cfg["pieces"]]
    for p in cfg["pieces"]:
        names += [c["nom"] for c in p["pilotages"]["eclairages"]["circuits"]] + [a["nom"] for a in p["actions"]]
    bad = [n for n in names for t in TEST_TERMS if t in n.lower()]
    if bad:
        sys.exit("Noms non publiables : " + ", ".join(bad))
    cfg["meta"]["mode"] = "showcase"
    cfg["meta"]["version"] = cfg["meta"]["version"] + "-showcase"
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(src, DEST, ignore=shutil.ignore_patterns(*EXCLUDED_JS, "showroom_config.js", "showroom_config.json"))
    txt = json.dumps(cfg, ensure_ascii=False, indent=2)
    (DEST / "showroom_config.json").write_text(txt + "\n", encoding="utf-8")
    (DEST / "showroom_config.js").write_text("/* Vitrine — généré par scripts/sync-showroom-ftv-nyon.py, ne pas éditer. */\nwindow.showroomConfig = " + txt + ";\n", encoding="utf-8")
    for html in ("index.html", "iphone.html"):
        f = DEST / html
        t = f.read_text(encoding="utf-8")
        for js in EXCLUDED_JS:
            t = re.sub(r'\s*<script src="js/' + re.escape(js) + r'"></script>', "", t)
        f.write_text(t, encoding="utf-8")
    n = sum(1 for _ in DEST.rglob("*") if _.is_file())
    print(f"Vitrine Showroom FTV Nyon synchronisée : {n} fichiers, version {cfg['meta']['version']}.")

if __name__ == "__main__":
    main()
