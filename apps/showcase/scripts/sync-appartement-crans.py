#!/usr/bin/env python3
"""
Synchronise la vitrine « Appartement Crans-Montana » (public/showcases/appartement-crans/)
avec le GUI CH5 assemblé du projet (dossier ch5/src du projet appartement-crans).

Usage :
    python3 scripts/sync-appartement-crans.py "C:/dev/crestron/repo/projects/appartement-crans/ch5/src"
    python3 scripts/sync-appartement-crans.py <ch5/src> --refresh-feedback   # recopie js/local-feedback.js

Même rôle que sync-villa-crans.py (dont il importe patch_html, strip_admin_monitors_js et
TEST_TERMS) avec ces différences :
  - la configuration vient du villa_config.json CANONIQUE à la racine du projet (src/ n'est
    qu'une copie de build) ; meta.mode = "showcase", meta.version suffixée "-showcase" ;
  - les noms réels des pièces / scènes / circuits / moteurs sont CONSERVÉS (ils sont propres) ;
    contrôle bloquant : aucun terme de test (TEST_TERMS) ni terme interdit (FORBIDDEN_TERMS)
    dans la configuration ou les HTML publiés ;
  - widgets météo + bandeau activés, pages spéciales Vidéo / Jeux / Animation désactivées ;
  - les pilotages restent tels que dans le JSON (pas de « tout actif ») ;
  - js/local-feedback.js est copié depuis la vitrine Villa Crans à la première synchronisation
    (ou avec --refresh-feedback), puis maintenu à la main dans public/showcases/appartement-crans/js/ :
    la copie lit les niveaux de scène par pièce (pilotages.eclairages.scenes.niveaux) et les
    pièces sans audio-vidéo dans villaConfigEmbedded.
"""
import importlib.util
import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DEST = ROOT / "public" / "showcases" / "appartement-crans"
VILLA_SHOWCASE = ROOT / "public" / "showcases" / "villa-gemini-frequencetv"

_spec = importlib.util.spec_from_file_location("sync_villa_crans", HERE / "sync-villa-crans.py")
villa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(villa)

TEST_TERMS = villa.TEST_TERMS
# Dépôt public : aucun nom d'opérateur, d'exploitant ni de lieu-dit du projet réel.
FORBIDDEN_TERMS = ["six senses", "hult", "téléphériques", "sixsense"]
# Ne sont copiés que les fichiers référencés par les HTML (webxpanel.js = connexion CP4, exclu).
JS_EXCLUDED = {"webxpanel.js", "local-feedback.js"}


def find_terms(text: str, terms) -> list:
    low = text.lower()
    return [t for t in terms if t in low]


def check_names(c: dict) -> None:
    """Contrôle bloquant : noms réels conservés, donc ils doivent être propres."""
    names = [c["meta"].get("projet", "")]
    names += [s["nom"] for s in c.get("sourcesAudioVideo", [])]
    names += c.get("scenesStores", {}).get("noms", [])
    for p in c["pieces"]:
        pl = p["pilotages"]
        names.append(p["nom"])
        names += pl["eclairages"]["scenes"].get("noms", [])
        names += pl["eclairages"]["circuits"].get("noms", [])
        names += [m.get("nom", "") for m in pl["moteurs"].get("liste", [])]
    bad = [(n, t) for n in names for t in find_terms(n, TEST_TERMS + FORBIDDEN_TERMS)]
    if bad:
        sys.exit("Noms non publiables dans villa_config.json : " + ", ".join(f"« {n} » ({t})" for n, t in bad))


def clean_config(src: Path) -> dict:
    c = json.loads(src.read_text(encoding="utf-8"))
    check_names(c)
    c["meta"]["version"] = c["meta"].get("version", "1.0.0") + "-showcase"
    c["meta"]["mode"] = "showcase"   # drapeau lu par js/local-feedback.js (déploiement = "deploiement")
    for w in ("meteoActualites", "bandeauActualites"):
        if w in c.get("widgets", {}):
            c["widgets"][w]["actif"] = True
    for k in ("video", "jeux", "animation"):
        if k in c.get("pagesSpeciales", {}):
            c["pagesSpeciales"][k]["actif"] = False
    for lang, d in c.get("traductions", {}).items():
        for k in list(d):
            if find_terms(k + " " + str(d[k]), TEST_TERMS):
                del d[k]
    return c


def assert_clean(label: str, text: str) -> None:
    found = find_terms(text, FORBIDDEN_TERMS)
    if found:
        sys.exit(f"{label} : terme interdit présent ({', '.join(found)}) — synchronisation refusée")


def copy_tree(src: Path, dest: Path, skip=()) -> int:
    n = 0
    for f in src.rglob("*"):
        if f.is_dir() or f.name in skip or any(part in skip for part in f.relative_to(src).parts):
            continue
        target = dest / f.relative_to(src)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(f, target)
        n += 1
    return n


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    refresh_feedback = "--refresh-feedback" in sys.argv
    if len(args) != 1:
        sys.exit(__doc__)
    src = Path(args[0])
    for name in ("index.html", "iphone.html", "config.js", "config.json"):
        assert (src / name).exists(), f"{name} manquant dans {src}"
    canonical = src.parent.parent / "villa_config.json"
    assert canonical.exists(), f"villa_config.json canonique introuvable : {canonical}"
    DEST.mkdir(parents=True, exist_ok=True)
    (DEST / "js").mkdir(exist_ok=True)

    villa.patch_html(src / "index.html", DEST / "index.html")
    villa.patch_html(src / "iphone.html", DEST / "iphone.html")
    for name in ("index.html", "iphone.html"):
        assert_clean(name, (DEST / name).read_text(encoding="utf-8"))

    n_js = copy_tree(src / "js", DEST / "js", skip=JS_EXCLUDED)
    # themes/svgs (777 icônes du gabarit Crestron) n'est référencé ni par les HTML ni par les CSS : non copié.
    n_themes = copy_tree(src / "themes", DEST / "themes", skip=("svgs",))
    shutil.rmtree(DEST / "themes" / "svgs", ignore_errors=True)
    n_appui = copy_tree(src / "appui", DEST / "appui") if (src / "appui").exists() else 0
    for name in ("version.js", "build_date.json"):
        if (src / name).exists():
            shutil.copy(src / name, DEST / name)
    villa.strip_admin_monitors_js(src / "config.js", DEST / "config.js")
    cfg_json = json.loads((src / "config.json").read_text(encoding="utf-8"))
    cfg_json.pop("admin_monitors", None)
    (DEST / "config.json").write_text(json.dumps(cfg_json, ensure_ascii=False, indent=2), encoding="utf-8")
    assert_clean("config.js", (DEST / "config.js").read_text(encoding="utf-8"))

    feedback = DEST / "js" / "local-feedback.js"
    if refresh_feedback or not feedback.exists():
        shutil.copy(VILLA_SHOWCASE / "js" / "local-feedback.js", feedback)
        print("js/local-feedback.js copié depuis la vitrine Villa Crans (à adapter : niveaux de scène par pièce)")

    c = clean_config(canonical)
    dump = json.dumps(c, ensure_ascii=False, indent=2)
    assert_clean("villa_config.json", dump)
    (DEST / "villa_config.json").write_text(dump, encoding="utf-8")
    (DEST / "villa_config.js").write_text("window.villaConfigEmbedded = " + dump + "\n;\n", encoding="utf-8")
    print(f"Vitrine Appartement Crans-Montana synchronisée depuis {src}")
    print(f"  {len(c['pieces'])} pièces, {sum(p['pilotages']['eclairages']['circuits']['nombre'] for p in c['pieces'])} circuits, "
          f"version {c['meta']['version']}, {n_js} js, {n_themes} fichiers de thèmes, {n_appui} appui")
    print("Vérifier : npm run build, puis /interfaces/residentiel/appartement-crans/wallpanel et /phone")


if __name__ == "__main__":
    main()
