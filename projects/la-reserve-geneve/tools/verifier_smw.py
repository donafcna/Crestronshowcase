#!/usr/bin/env python3
"""
La Réserve Genève — confronte reserve_config.json aux programmes SIMPL existants (.smw, format texte).

  python3 tools/verifier_smw.py "<dossier des programmes>"      (ex. C:/Users/donat/Desktop/Reserve Bar)

Pour chaque espace : retrouve le symbole Crestron App (IP-ID de simpl.ipid) dans simpl.programme, puis vérifie que
chaque join du GUI porte le bon signal (Vol_+, Vol_-, Mute, Distrib, Power_Off, Source_Select, …) et que les joins
proposés pour les sources sont libres sur le symbole. Sortie : docs/VERIFICATION-SMW.md. Code retour 1 si écart.
"""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import json

ROOT = Path(__file__).resolve().parent.parent

def parse(path):
    txt = Path(path).read_text(encoding="latin-1").replace("\r", "")
    objs = []
    for blk in txt.split("\n[\n"):
        d = {}
        for l in blk.split("\n"):
            if "=" in l:
                k, v = l.split("=", 1); d.setdefault(k, v)
        objs.append(d)
    return objs

def panel(objs, ipid):
    sg = {o["H"]: o.get("Nm", "") for o in objs if o.get("ObjTp") == "Sg"}
    dev = [o for o in objs if o.get("ObjTp") == "Dv" and o.get("ProdLine") == "Smart Graphics" and o.get("Ad", "").lower() == ipid[2:].lower().zfill(2)]
    if not dev: return None
    sm = [o for o in objs if o.get("ObjTp") == "Sm" and o.get("H") == dev[0]["SmH"]][0]
    n1, n2, n1o = int(sm.get("n1I", 0)), int(sm.get("n2I", 0)), int(sm.get("n1O", 0))
    res = {"b": {}, "n": {}, "s": {}}
    for k, v in sm.items():
        m = re.match(r"([IO])(\d+)$", k)
        if not m: continue
        io, i = m.group(1), int(m.group(2))
        name = sg.get(v, "")
        lim1 = n1 if io == "I" else n1o
        t, j = ("b", i) if i <= lim1 else ("n", i - lim1) if i <= lim1 + n2 else ("s", i - lim1 - n2)
        res[t].setdefault(j, {})["fb" if io == "I" else "press"] = name
    return res

def main():
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not folder: sys.exit(__doc__)
    c = json.loads((ROOT / "reserve_config.json").read_text(encoding="utf-8"))
    out, bad = ["# Vérification des joins contre les programmes SIMPL (généré par tools/verifier_smw.py)", ""], 0
    for e in c["espaces"]:
        p = panel(parse(folder / e["simpl"]["programme"]), e["simpl"]["ipid"])
        out += [f"## {e['nom']} — {e['simpl']['programme']} IP-ID {e['simpl']['ipid']}", "", "| Contrôle | Join | Signal trouvé | Résultat |", "|---|---|---|---|"]
        def chk(label, t, j, rx, key="press", free=False):
            nonlocal bad
            got = p[t].get(j, {}).get(key, "") if p else ""
            reserved = "reserved" in got
            ok = (not got or reserved) if free else bool(re.search(rx, got, re.I))
            if not ok: bad += 1
            out.append(f"| {label} | {t}{j} | {got or '—'} | {'OK' if ok else 'ÉCART'} |")
        G = e["global"]
        for s in e["sources"]: chk(f"Source {s['nom']} : join libre", "b", s["join"], "", free=True)
        chk("Tout éteindre : join libre", "b", G["arretGeneralDemande"]["join"], "", free=True)
        chk("Confirmation (retour)", "b", G["confirmationRetour"], r"Power_Off_INT", "fb")
        chk("Éteindre", "b", G["eteindre"], r"General_Off$")
        chk("Annuler", "b", G["annuler"], r"General_Off_Cancel")
        chk("Fermer (Exit)", "b", G["fermer"], r"Reset_Subpage")
        if G.get("occupe"): chk("Occupé (retour)", "b", G["occupe"], r"Busy_General_Off", "fb")
        if G.get("occupeProgression"): chk("Progression (retour)", "n", G["occupeProgression"], r"Busy_General_Off_Analog", "fb")
        chk("Source sélectionnée (texte)", "s", G["sourceCourante"], r"Source_Select", "fb")
        for pg in e["pages"]:
            if pg["bouton"]: chk(f"Page {pg['nom']}", "b", pg["bouton"], r"Distrib_Zone")
            for g in pg["groupes"]:
                if g["diffuser"]:
                    chk(f"Distribute {g['nom']}", "b", g["diffuser"], r"Distrib_")
                    chk(f"Off {g['nom']}", "b", g["arret"], r"Power_Off_")
                    chk(f"Source du groupe {g['nom']}", "s", g["retourSource"], r"Source_Select_", "fb")
                for z in g["zones"]:
                    k = re.escape(z["signalSimpl"])
                    chk(f"{z['nom']} Vol +", "b", z["volPlus"], k + r"_Vol_\+")
                    chk(f"{z['nom']} Vol −", "b", z["volMoins"], k + r"_Vol_-")
                    chk(f"{z['nom']} Mute", "b", z["muet"], k + r"_Mute")
                    chk(f"{z['nom']} Is_Mute", "b", z["muetRetour"], k + r"_Is_Mute", "fb")
                    chk(f"{z['nom']} niveau", "n", z["niveau"], k + r"_Vol$", "fb")
        out.append("")
    out.insert(2, f"**{'Aucun écart' if not bad else str(bad) + ' écart(s)'}.** Les libellés de zones (Le Loft = signal Restaurant, Le Loft Fond = Lotti) restent à confirmer au Debugger.\n")
    (ROOT / "docs" / "VERIFICATION-SMW.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"{bad} écart(s) — docs/VERIFICATION-SMW.md")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
