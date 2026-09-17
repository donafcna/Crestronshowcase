# 40 — Références et directions graphiques

## Veille UI (6 sept. 2026)

Ce qui est recherché : des **images d'interfaces**, pas de la doc technique. Les interfaces « old school » style VT Pro sont rejetées — c'est précisément ce dont le showcase doit démarquer Fréquence TV.

Inspirations retenues :

- Shots Dribbble de **Marc Caldwell** : Intuitiv UI, Lighting Page, CH5 UI, Cable Remote, Marine UI, Global Locks, Intercom, Room Grouping
- Démo **Tahoe** d'Intuitiv
- **Digital Automation** (vidéos YouTube)
- **AVstudio** showcase
- **Crestron Home OS** — jugé intéressant, manque d'images (à chercher sur le web)

Règle : s'en inspirer **avec des modifications**, jamais de reprise à l'identique.

Page de revue des références : artefact `1c5a03b1-7e1f-40db-b52f-ac322c3e3e30` (avis stockés dans la collection `avis`).

## Trois directions graphiques (validées le 6 sept. 2026)

Issues du mood board (canevas artefact `3ba508cf…`), chacune incarnée par un simulateur dédié :

| Direction | Simulateur | Contexte |
|---|---|---|
| **Obsidienne** | `villa-leman` — Villa Léman | résidentiel |
| **Atelier clair** | `siege-nyon` — Siège Lakeside Nyon | salle de réunion |
| **Spectre** | `appartement-carouge` — Appartement Carouge | résidentiel |

Fichiers : `src/components/simulators/{VillaLeman,SiegeNyon,AppartementCarouge}.jsx` + CSS, entrées dans `projects.js`, `Showcase.jsx`, `DemoMode.jsx`.

## FTV Home (7 sept. 2026)

67 captures de l'app **Crestron Home OS 4.11.4** (iPhone + iPad) ont servi de base à la refonte du simulateur `crestron-home`. Choix retenu : **réinterprétation aux couleurs Fréquence TV**, pas une copie fidèle. Le GUI tablette sert aussi la section Dalle TSW-1070. Projet renommé **« FTV Home »**, identifiant `crestron-home` conservé pour ne pas casser les liens partagés.

## Thèmes du GUI

Sombre · Clair élégant · Verre dépoli. Cyberpunk supprimé — ne pas le réintroduire.
Détails d'implémentation et pièges : voir `10-architecture-et-pieges.md`.
