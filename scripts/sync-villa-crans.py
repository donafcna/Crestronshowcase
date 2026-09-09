#!/usr/bin/env python3
"""
Synchronise la vitrine « Villa Crans-Montana » (public/showcases/villa-gemini-frequencetv/)
avec le GUI CH5 réel du projet VillaCrans (dossier src/ du dépôt VillaCrans).

Usage :
    python3 scripts/sync-villa-crans.py "C:/Users/donat/Desktop/VillaCrans/src"

Ce que fait le script :
  1. copie index.html, iphone.html, version.js, build_date.json, config.js / config.json ;
  2. remplace le chargement de js/webxpanel.js (connexion CP4) par js/local-feedback.js
     (moteur d'état 100 % front-end, contrat de joins v2) ;
  3. masque l'indicateur Online/Offline et neutralise la console d'administration
     (moniteur de joins, terminal CP4) qui n'ont pas de sens sans processeur ;
  4. produit un villa_config.json / villa_config.js « vitrine » : mêmes structures que le
     fichier réel, mais avec des noms de pièces / scènes / sources de démonstration
     (le fichier de développement contient des noms de test), meta.mode = "showcase" et tous les
     pilotages actifs.

Le moteur js/local-feedback.js n'est PAS écrasé : il est maintenu à la main dans ce dépôt.
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "public" / "showcases" / "villa-gemini-frequencetv"

ROOM_NAMES = ["Salon", "Cuisine", "Salle à manger", "Suite parentale", "Chambre 1", "Chambre 2",
              "Bureau", "Home Cinéma", "Chambre 3", "Suite invités", "Terrasse & Jardin",
              "Piscine & Spa", "Sauna & Hammam", "Pool House", "Garage & Ateliers"]
ROOM_ICONS = {"Salon": "🛋️", "Cuisine": "🍳", "Salle à manger": "🍽️", "Suite parentale": "🛏️",
              "Chambre 1": "🛏️", "Chambre 2": "🛏️", "Bureau": "💼", "Home Cinéma": "🎬",
              "Chambre 3": "🛏️", "Suite invités": "🚪", "Terrasse & Jardin": "🌿",
              "Piscine & Spa": "🏊", "Sauna & Hammam": "🧖", "Pool House": "🏖️",
              "Garage & Ateliers": "🚗"}
SCENES = ["OFF", "CINÉMA", "REPAS", "TOTAL"]
SOURCES = [{"id": 1, "nom": "APPLE TV"}, {"id": 2, "nom": "SKY Q"}, {"id": 3, "nom": "SWISSCOM TV"},
           {"id": 4, "nom": "IPTV"}, {"id": 5, "nom": "MUSIQUE"}]
# Termes de test présents dans le fichier de développement : jamais dans la vitrine publique
TEST_TERMS = ["baise", "sex", "alcool", "pirate", "maman", "papa", "jeux", "repas2", "total3",
              "suite amis", "chambre amis", "humax", "jukebox"]

SHOWCASE_STYLE = ("    <!-- Vitrine : pas de processeur, indicateur de connexion masqué -->\n"
                  "    <style>#connection-status{display:none !important}</style>\n"
                  "    <script>window.updateConnectionStatusUI = function () {};</script>\n")
SHOWCASE_SCRIPT = ("<!-- Vitrine : console d'administration (joins, terminal CP4) sans objet -->\n"
                   "<script>window.openAdminModal = function () {};</script>\n")


# iphone.html (v1.0.165) : dictionnaire « ru » tronqué (chaîne non terminée) qui rend tout le
# script métier invalide. Réparé ici tant que la source n'est pas corrigée (voir AUDIT VillaCrans).
IPHONE_BROKEN = 'source_video: "А            // Configuration de secours'
IPHONE_FIXED = """source_video: "Активный Источник :",
                    circuits_title: "Свет :",
                    motors_title: "Моторы :",
                    tab_lights: "СВЕТ",
                    tab_shades: "ШТОРЫ",
                    motors_title_section: "МОТОРЫ",
                    widgets_title: "Виджеты",
                    weather_title: "Местная погода",
                    weather_wind: "Ветер",
                    weather_humidity: "Влажность",
                    news_title: "Новости",
                    video_title: "Smart Home Video"
                }
            };

            // Configuration de secours"""


def patch_html(src: Path, dest: Path) -> None:
    html = src.read_text(encoding="utf-8")
    if IPHONE_BROKEN in html:
        html = html.replace(IPHONE_BROKEN, IPHONE_FIXED)
        print(f"{src.name} : dictionnaire ru tronqué réparé (bug connu de la source)")
    # iphone.html : panneaux Circuits / Moteurs / Caméras / Centralisation posés avec display:flex en dur,
    # donc ouverts au chargement (ils sont ouverts/fermés en JS avec block/none)
    html, n = re.subn(r'(<div id="[a-z-]+-overlay" class="custom-overlay-panel" style="[^"]*?)display: flex;',
                      r"\1display: none;", html)
    if n:
        print(f"{src.name} : {n} panneau(x) overlay masqué(s) au chargement")
    n = html.count('<script src="js/webxpanel.js"></script>')
    assert n == 1, f"{src.name}: balise webxpanel.js introuvable ou multiple ({n})"
    html = html.replace('<script src="js/webxpanel.js"></script>',
                        '<script src="js/local-feedback.js"></script>')
    assert html.count("</head>") == 1 and html.count("</body>") == 1
    html = html.replace("</head>", SHOWCASE_STYLE + "</head>")
    html = html.replace("</body>", SHOWCASE_SCRIPT + "</body>")
    dest.write_text(html, encoding="utf-8")


def strip_admin_monitors_js(src: Path, dest: Path) -> None:
    txt = src.read_text(encoding="utf-8")
    txt = re.sub(r',\s*"admin_monitors"\s*:\s*\[[^\]]*\]', "", txt, flags=re.S)
    dest.write_text(txt, encoding="utf-8")


def clean_config(src: Path) -> dict:
    c = json.loads(src.read_text(encoding="utf-8"))
    c["meta"]["version"] = c["meta"].get("version", "1.0.0") + "-showcase"
    c["meta"]["mode"] = "showcase"   # drapeau lu par js/local-feedback.js (déploiement = "deploiement")
    c["valeursParDefaut"]["scenesEclairage"] = SCENES
    c["sourcesAudioVideo"] = SOURCES
    for w in ("meteoActualites", "bandeauActualites"):
        if w in c.get("widgets", {}):
            c["widgets"][w]["actif"] = True
    # Page « Vidéo » = recherche YouTube en autoplay : pas dans une vitrine publique en démo automatique
    if "video" in c.get("pagesSpeciales", {}):
        c["pagesSpeciales"]["video"]["actif"] = False
    for p in c["pieces"]:
        p["nom"] = ROOM_NAMES[p["id"] - 1] if p["id"] <= len(ROOM_NAMES) else p["nom"]
        p["icone"] = ROOM_ICONS.get(p["nom"], p.get("icone", "🏠"))
        pl = p["pilotages"]
        pl["eclairages"]["actif"] = True
        pl["eclairages"]["scenes"] = {"nombre": 4, "noms": list(SCENES)}
        circ = pl["eclairages"]["circuits"]["noms"][:4]
        pl["eclairages"]["circuits"] = {"nombre": len(circ), "noms": circ}
        for k in ("moteurs", "cvc", "controlesGeneraux", "audioVideo"):
            pl[k]["actif"] = True
    for lang, d in c.get("traductions", {}).items():
        for k in list(d):
            if any(t in k.lower() or t in str(d[k]).lower() for t in TEST_TERMS):
                del d[k]
        for s in SOURCES:
            d.setdefault(s["nom"], s["nom"])
    return c


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    for name in ("index.html", "iphone.html", "villa_config.json", "config.js", "config.json"):
        assert (src / name).exists(), f"{name} manquant dans {src}"

    patch_html(src / "index.html", DEST / "index.html")
    patch_html(src / "iphone.html", DEST / "iphone.html")
    for name in ("version.js", "build_date.json"):
        if (src / name).exists():
            shutil.copy(src / name, DEST / name)
    strip_admin_monitors_js(src / "config.js", DEST / "config.js")
    cfg_json = json.loads((src / "config.json").read_text(encoding="utf-8"))
    cfg_json.pop("admin_monitors", None)
    (DEST / "config.json").write_text(json.dumps(cfg_json, ensure_ascii=False, indent=2), encoding="utf-8")

    c = clean_config(src / "villa_config.json")
    (DEST / "villa_config.json").write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding="utf-8")
    (DEST / "villa_config.js").write_text("window.villaConfigEmbedded = "
                                          + json.dumps(c, ensure_ascii=False, indent=2) + "\n;\n",
                                          encoding="utf-8")
    print("Vitrine Villa Crans-Montana synchronisée depuis", src)
    print("Vérifier : npm run build, puis /interfaces/residentiel/villa-gemini-frequencetv/wallpanel et #demo")


if __name__ == "__main__":
    main()
