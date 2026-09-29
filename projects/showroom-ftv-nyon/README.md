# Showroom FTV Nyon — GUI CH5 + slot 1 SIMPL# Pro + slot 2 SIMPL Windows

Recréation à l'identique de l'interface Crestron Home de la dalle TSW-1070 d'entrée du showroom Fréquence TV de Nyon,
pour la dalle TSW-1070, le XPanel, l'iPad et l'iPhone (Crestron One). Même architecture que Villa Crans / FTV Home.

```
projects/showroom-ftv-nyon/
├── showroom_config.json          SOURCE UNIQUE : maison, 6 pièces, photos, actions, circuits, scènes, musique, vidéo, caméras, contrat de joins
├── ch5/
│   ├── src/index.html            dalle TSW-1070 (1920×1200), XPanel, iPad — redirige les smartphones vers iphone.html
│   ├── src/iphone.html           iPhone (Crestron One)
│   ├── src/css/showroom.css      feuille unique, 3 thèmes (Sombre = photos, Clair, Verre dépoli), unités « u »
│   ├── src/js/                   app.js (GUI), bus.js (joins), connect.js (WebXPanel), local-feedback.js (vitrine), icons.js (SVG)
│   ├── src/img/                  rooms/*.jpg (photos du showroom recadrées), covers/*.svg (pochettes factices), cameras/
│   ├── deploy.ps1                build + TSW / web / mobile / cp4 / config (ASCII + BOM)
│   └── tools/qa-showroom.cjs     batterie bloquante écran par écran (3 thèmes × 6 châssis × 40 écrans)
├── simpl-sharp/ShowroomNyon.sln  slot 1 — ControlSystem.cs, ShowroomConfig.cs, ShowroomState.cs, Joins.cs (généré)
├── simpl/simpl-windows/          slot 2 — ShowroomNyon_Slot2.smw (généré) + .signals.txt + socle nu
├── tools/                        build.py, gen_joins.js, generate_slot2.js, check_slot2.js, parity/ (C# ↔ vitrine)
└── docs/CONTRAT-JOINS.md         contrat lisible (généré) + recette Debugger
```

## Principe
1. **Un JSON pilote tout.** Les photos (`maison.photo`, `pieces[].photo`), pochettes et images de caméra sont des chemins
   relatifs au GUI (`img/...`) ou des URL : remplacer le fichier ou changer le chemin suffit.
2. **Joins globaux, identiques dans toutes les pièces** ; `Room_Select#` (a10) + `Room_Active_nn` désignent la pièce ; le
   slot 2 bufferise. Le GUI ne connaît aucun numéro en dur : `Joins.of('Light_{n}_Toggle', 3)` lit le contrat.
3. **Le GUI n'invente aucun état** : retours du C# en déploiement, de `js/local-feedback.js` (même moteur, parité vérifiée
   par `tools/parity/parity.js`) en vitrine (`meta.mode = showcase`, généré par `apps/showcase/scripts/sync-showroom-ftv-nyon.py`).

## Mise en service (PC Windows)
1. `cd C:\dev\crestron\repo\projects\showroom-ftv-nyon\ch5` → `npm install`, copier `deploy.secrets.example.psd1` en `deploy.secrets.psd1` et le remplir.
2. `simpl-sharp\ShowroomNyon.sln` dans Visual Studio (NuGet Crestron 2.21.274) → `ShowroomNyon.cpz`.
3. `simpl\simpl-windows\ShowroomNyon_Slot2.smw` dans SIMPL Windows → F12 → `.lpz` → slot 2.
4. `powershell -ExecutionPolicy Bypass -File .\deploy.ps1` (ou `-Target tsw|web|mobile|cp4|config`).
5. Écrans : TSW 0x03, XPanel 0x04, iPad 0x05, iPhone 0x06 (projet Crestron One `showroomnyon`). Console CP4 : `showroomstate`, `showroomroom <ipid> <pièce>`, `showroomtrace`.

## Après une modification du JSON
`node tools/gen_joins.js` (Joins.cs + contrat) · `node tools/generate_slot2.js` puis `node tools/check_slot2.js` ·
`python3 tools/build.py --check` · `python3 ../../apps/showcase/scripts/sync-showroom-ftv-nyon.py .` (depuis apps/showcase : chemin du projet).
