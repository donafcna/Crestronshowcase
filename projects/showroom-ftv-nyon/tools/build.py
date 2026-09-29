#!/usr/bin/env python3
"""
Showroom FTV Nyon — prépare ch5/src avant archive CH5 ou synchronisation vitrine.

  python3 tools/build.py            # mode du JSON (deploiement)
  python3 tools/build.py --check    # contrôles seuls, n'écrit rien

Écrit ch5/src/showroom_config.js (window.showroomConfig), ch5/src/showroom_config.json (copie de build) et
ch5/src/version.js depuis showroom_config.json (racine du projet = SOURCE UNIQUE, jamais la copie de src/).
Contrôles bloquants : JSON valide, clés en double (même à la casse près : PowerShell 5.1 les refuse), images
référencées présentes, limites du contrat respectées, meta.mode connu.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ch5" / "src"
CFG = ROOT / "showroom_config.json"

def no_dupes(pairs):
    seen = {}
    for k, _ in pairs:
        if k.lower() in seen:
            sys.exit(f"Clé en double (casse comprise) dans showroom_config.json : « {k} » / « {seen[k.lower()]} »")
        seen[k.lower()] = k
    return dict(pairs)

def main():
    check_only = "--check" in sys.argv
    c = json.loads(CFG.read_text(encoding="utf-8"), object_pairs_hook=no_dupes)
    errs = []
    if c["meta"].get("mode") not in ("deploiement", "showcase"):
        errs.append("meta.mode doit valoir deploiement ou showcase")
    lim = c["contrat"]["limites"]
    if len(c["pieces"]) > lim["piecesMax"]: errs.append("trop de pièces")
    if len(c["maison"]["actions"]) > lim["actionsMaisonMax"]: errs.append("trop d'actions maison")
    ids = set()
    for p in c["pieces"]:
        if p["id"] in ids: errs.append(f"id de pièce en double : {p['id']}")
        ids.add(p["id"])
        e = p["pilotages"]["eclairages"]
        if len(e["circuits"]) > lim["circuitsMax"]: errs.append(f"{p['nom']} : plus de {lim['circuitsMax']} circuits")
        if len(e["scenes"]) > lim["scenesMax"]: errs.append(f"{p['nom']} : trop de scènes")
        if len(p["actions"]) > lim["actionsMax"]: errs.append(f"{p['nom']} : trop d'actions")
        for sc in e["scenes"]:
            if len(sc["niveaux"]) > len(e["circuits"]): errs.append(f"{p['nom']} / {sc['nom']} : plus de niveaux que de circuits")
        names = [s["nom"] for s in e["scenes"]]
        for a in p["actions"]:
            s = a.get("effets", {}).get("scene")
            if s and s not in names: errs.append(f"{p['nom']} / action {a['nom']} : scène « {s} » absente")
        if p["etage"] not in [f["id"] for f in c["etages"]]: errs.append(f"{p['nom']} : étage inconnu")
    imgs = [c["maison"]["photo"]] + [p["photo"] for p in c["pieces"]] + [f["pochette"] for f in c["musique"]["favoris"]] \
        + [t["pochette"] for t in c["musique"]["pistes"]] + [k["image"] for k in c.get("cameras", [])]
    for i in imgs:
        if i and not i.startswith(("http://", "https://")) and not (SRC / i).exists():
            errs.append(f"image absente : ch5/src/{i}")
    if errs:
        sys.exit("showroom_config.json refusé :\n  - " + "\n  - ".join(errs))
    if check_only:
        print(f"OK : {len(c['pieces'])} pièces, {sum(len(p['pilotages']['eclairages']['circuits']) for p in c['pieces'])} circuits, mode {c['meta']['mode']}.")
        return
    txt = json.dumps(c, ensure_ascii=False, indent=2)
    (SRC / "showroom_config.json").write_text(txt + "\n", encoding="utf-8")
    (SRC / "showroom_config.js").write_text("/* Copie générée par tools/build.py depuis showroom_config.json — ne pas éditer. */\nwindow.showroomConfig = " + txt + ";\n", encoding="utf-8")
    (SRC / "version.js").write_text(f"window.showroomVersion = \"{c['meta']['version']}\";\n", encoding="utf-8")
    print(f"ch5/src prêt : config {c['meta']['version']} ({c['meta']['mode']}), {len(c['pieces'])} pièces.")

if __name__ == "__main__":
    main()
