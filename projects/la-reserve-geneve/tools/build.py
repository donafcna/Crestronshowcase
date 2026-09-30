#!/usr/bin/env python3
"""
La Réserve Genève — prépare ch5/src et le contrat de joins depuis reserve_config.json (SOURCE UNIQUE).

  python3 tools/build.py                       # mode et espace du JSON
  python3 tools/build.py --espace lodge        # CH5 d'un espace (un CH5 par panneau)
  python3 tools/build.py --mode showcase       # utilisé par la synchronisation vitrine
  python3 tools/build.py --check               # contrôles seuls, n'écrit rien

Écrit ch5/src/reserve_config.js (window.reserveConfig), ch5/src/reserve_config.json, ch5/src/version.js et
docs/CONTRAT-JOINS.md. Contrôles bloquants : JSON valide, clés en double, espace/thème connus, aucun join utilisé
deux fois pour des fonctions différentes dans un même panneau, joins dans les plages du symbole SIMPL.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ch5" / "src"
CFG = ROOT / "reserve_config.json"

def no_dupes(pairs):
    seen = {}
    for k, _ in pairs:
        if k.lower() in seen:
            sys.exit(f"Clé en double dans reserve_config.json : « {k} »")
        seen[k.lower()] = k
    return dict(pairs)

def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None

def joins_of(e):
    """(type, join, fonction, signal SIMPL) pour chaque join utilisé par le GUI de l'espace."""
    G, sig = e["global"], []
    for s in e["sources"]:
        sig.append(("b", s["join"], f"Source « {s['nom']} » (appui)", f"{s['signal']} — à déplacer depuis le smart object {e['simpl']['smartObject']}, élément {s['so']}"))
    a = G["arretGeneralDemande"]
    sig.append(("b", a["join"], "Tout éteindre (demande)", f"{a['signal']} — à déplacer depuis le smart object, élément {a['so']}"))
    for k, lbl in [("confirmationRetour", "Confirmation d'extinction affichée (retour)"), ("eteindre", "Éteindre (confirmer)"), ("annuler", "Annuler"),
                   ("fermer", "Fermer / Exit (Reset_Subpage)"), ("occupe", "Extinction en cours (retour)"), ("connecte", "Connecté (retour)")]:
        if G.get(k): sig.append(("b", G[k], lbl, ""))
    if G.get("occupeProgression"): sig.append(("n", G["occupeProgression"], "Progression de l'extinction (retour)", ""))
    sig.append(("s", G["sourceCourante"], "Source sélectionnée (texte)", ""))
    for p in e["pages"]:
        if p["bouton"]: sig.append(("b", p["bouton"], f"Page « {p['nom']} » (appui)", ""))
        if p["retour"]: sig.append(("b", p["retour"], f"Page « {p['nom']} » (retour)", ""))
        for g in p["groupes"]:
            if g["diffuser"]:
                sig.append(("b", g["diffuser"], f"Distribute « {g['nom']} »", ""))
                sig.append(("b", g["arret"], f"Off « {g['nom']} »", ""))
                sig.append(("s", g["retourSource"], f"Source du groupe « {g['nom']} » (texte)", ""))
            for z in g["zones"]:
                sig.append(("b", z["volPlus"], f"{z['nom']} Vol + (maintien)", f"{z['signalSimpl']}"))
                sig.append(("b", z["volMoins"], f"{z['nom']} Vol − (maintien)", ""))
                sig.append(("b", z["muet"], f"{z['nom']} Mute (appui) / Is_Mute (retour)", ""))
                sig.append(("n", z["niveau"], f"{z['nom']} niveau (retour)", ""))
    return sig

def main():
    c = json.loads(CFG.read_text(encoding="utf-8"), object_pairs_hook=no_dupes)
    mode = arg("--mode") or c["meta"]["mode"]
    esp = arg("--espace") or c["meta"]["espace"]
    errs = []
    if mode not in ("deploiement", "showcase"): errs.append("meta.mode doit valoir deploiement ou showcase")
    ids = [e["id"] for e in c["espaces"]]
    if esp not in ids: errs.append(f"espace inconnu : {esp} ({', '.join(ids)})")
    if c["meta"]["theme"] not in [t["id"] for t in c["themes"]]: errs.append("meta.theme inconnu")
    md = ["# La Réserve Genève — contrat de joins (généré par tools/build.py, ne pas éditer)", "",
          "Les numéros sont ceux des symboles Crestron App des programmes SIMPL existants : le CH5 remplace le panneau VT Pro",
          "sans C#. Seule modification SIMPL : les sources et « Power Off » passaient par le smart object 1 (Icon List",
          "Horizontal) ; ils sont déplacés sur des joins digitaux libres du panneau (colonne « Signal SIMPL »).", ""]
    for e in c["espaces"]:
        seen = {}
        for t, j, f, s in joins_of(e):
            if not j: continue
            maxi = e["simpl"]["digitauxMax"] if t == "b" else e["simpl"]["analogiquesMax"] if t == "n" else 99
            if j > maxi: errs.append(f"{e['nom']} : join {t}{j} hors du symbole ({maxi})")
            k = (t, j)
            if k in seen and not (f.endswith("(retour)") or seen[k].endswith("(retour)")) and "Mute" not in f:
                errs.append(f"{e['nom']} : join {t}{j} utilisé deux fois ({seen[k]} / {f})")
            seen.setdefault(k, f)
        md += [f"## {e['nom']} — {e['simpl']['programme']}, {e['simpl']['symbole']}, IP-ID {e['simpl']['ipid']}", "",
               "| Type | Join | Fonction | Signal SIMPL / action |", "|---|---|---|---|"]
        for t, j, f, s in sorted(joins_of(e), key=lambda x: ("bns".index(x[0]), x[1])):
            md.append(f"| {dict(b='Digital', n='Analogique', s='Sériel')[t]} | {j} | {f} | {s} |")
        md.append("")
    if errs:
        sys.exit("reserve_config.json refusé :\n  - " + "\n  - ".join(errs))
    if "--check" in sys.argv:
        print(f"OK : {len(c['espaces'])} espaces, mode {mode}, espace {esp}."); return
    c["meta"]["mode"], c["meta"]["espace"] = mode, esp
    txt = json.dumps(c, ensure_ascii=False, indent=2)
    (SRC / "reserve_config.json").write_text(txt + "\n", encoding="utf-8")
    (SRC / "reserve_config.js").write_text("/* Copie générée par tools/build.py depuis reserve_config.json — ne pas éditer. */\nwindow.reserveConfig = " + txt + ";\n", encoding="utf-8")
    (SRC / "version.js").write_text(f'window.reserveVersion = "{c["meta"]["version"]}";\n', encoding="utf-8")
    (ROOT / "docs" / "CONTRAT-JOINS.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"ch5/src prêt : espace {esp}, mode {mode}, version {c['meta']['version']}.")

if __name__ == "__main__":
    main()
