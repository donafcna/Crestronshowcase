# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

Projet Fréquence TV : GUI Crestron CH5 « Villa Crans-Montana » + programme SIMPL# Pro (slot 1, `Backend/Backend/ControlSystem.cs`) + SIMPL Windows (slot 2, `..\VillaCrans SIMPL\VillaCrans_Slot2.smw`). Contrat de joins **v2** (`docs/03_CONTRAT_JOINS.md`). Doc complète dans `docs/` (01 spéc · 02 villa_config · 03 joins · 04 SIMPL · 05 recette · 06 to-do · 07 retours direction 09.09 · 08 workflow showcase), audit `AUDIT_2026-09-02.md`, règles CH5 `.agents/AGENTS.md` (« Rule of Gold » : états par joins natifs CH5, jamais par DOM JS).

## Fichiers qui comptent
- `src/index.html` (dalle TSW-1070 1280×800, iPad 1180×776, XPanel) et `src/iphone.html` : SOURCE DE VÉRITÉ, mise en page fluide. Blocs `<style id="tablet-sidebar">` (menu de gauche regroupé, toutes largeurs), `<style id="global-modals-xl">` (modales agrandies), `<style id="theme-readability">` (thèmes Clair / Verre dépoli).
- `villa_config.json` (racine = copié dans `src/` par `deploy.ps1`) : dimensionnement, `meta.mode = "deploiement"` (jamais `showcase` ici), `pagesSpeciales` (Jeux / Animation désactivées, code conservé), `traductions`.
- `deploy.ps1` : `node --check` de chaque `<script>` (Test-InlineScripts) + validation JSON + contraste (si Playwright installé : `npm i -D playwright pngjs && npx playwright install chromium`) → `npx ch5-cli archive` → TSW (pscp/plink) → CP4. `-Target web` = XPanel + QR codes.
- **Contraste (règle permanente : 0 défaut)** — `tools/check_contrast_dom.mjs` (Playwright, à lancer sur une preview servie : `node tools/check_contrast_dom.mjs --root http://localhost:4173/showcases/villa-gemini-frequencetv --min 4`) : parcourt les 3 thèmes × page + 10 fenêtres × états dynamiques (badges d'alarme), recompose le fond réel (couches translucides + `backdrop-filter: brightness()`) et sort en erreur sous 4:1. Attendre 900 ms après un changement de thème (transitions CSS) sinon on mesure des valeurs intermédiaires. `tools/check_contrast.mjs` (ancien, par capture d'écran, seuil 3:1) reste utilisable depuis `deploy.ps1`.

## Règles GUI validées par Donatien (09.09.2026)
- Télécommandes : Apple TV = Menu + croix (joins 211-216) ; Sky Q / IPTV (500 / 530 + index) et Swisscom (560 + index) en 3 zones rectangulaires ; auto-ajustement `fitRemoteLayout` (jamais hors cadre) ; `#source-control-overlay ch5-button .cb-btn` sans bordure bleue CH5.
- Sources : vidéo 151-154 en interlock, Musique 155 indépendante (badge audio), 156 = retour audio vidéo ; premier appui = activation + télécommande ; scènes mémorisées (appui long, `localStorage villa_scene_<pièce>_<n>`) ; bandeau « État de la villa » (sériels 111/112 optionnels).
- Modales Contrôle global / presets / caméras : 94 % du GUI, fond `.modal-backdrop` quasi opaque, textes ≥ 1,1 rem.
- Thèmes : Sombre, Clair, Verre dépoli (Cyberpunk retiré), `<body id="app-body">` obligatoire (les surcharges de thème partent de `body#app-body` pour battre les règles internes en `#id !important`).
  - `<style id="theme-overlays">` : fonds **et** textes des fenêtres + boutons de la page, par thème. Clair = coque `#f8fafc`, cartes `rgba(15,23,42,.06)`, textes `#0f172a` / `#475569`, accents foncés (`#047857` `#1d4ed8` `#a16207` `#6d28d9` `#b91c1c`). Ne jamais repeindre : éléments avec un fond hexadécimal en dur (`:not([style*="background: #"])`, `:not([customStyle*="background: #"])` → touches couleur des télécommandes), dégradés (`:not([style*="gradient"])`), ni un `ch5-button[selected="true"]` (couleur d'état).
  - Verre dépoli = panneaux **translucides** (`--container-bg: rgba(15,23,42,.42)`) + `--blur-val: blur(20px) saturate(1.2) brightness(0.3)` : c'est l'assombrissement du backdrop qui garantit la lisibilité, pas l'opacité (l'avoir rendu opaque le faisait ressembler au thème Sombre).
  - Boutons CH5 sans style dédié : le bleu CH5 `#0099ff` ne porte pas de texte blanc (3:1) → `#0369a1` en thèmes sombres, carte claire en Clair. Bouton sélectionné vert `#10b981` (Contrôle global) → libellé `#052e16`.
  - Badges d'état des partitions d'alarme : classes `.alarm-badge--off/--partial/--active` (jamais de couleurs en dur dans le JS) pour que chaque thème garde le contraste.
- Menu de gauche : Réglages + version + météo groupés au-dessus du menu des pièces à TOUTES les largeurs, dalle comprise (`<style id="tablet-sidebar">`).
- Fenêtres agrandies : Contrôle global, Caméras, Système de sécurité (94 % du GUI, `<style id="global-modals-xl">`) et Réglages (640 px dalle/tablette, 440 px smartphone, `<style id="settings-xl">`), avec variantes compactes en `@media (max-height: 700px / 620px)`.
- Icônes : engrenages = SVG `.gear-icon` unique (jamais d'emoji ⚙️ : flou et pâle), couleur par thème ; logo Apple TV au repos = même SVG que l'état sélectionné, 44 px, version sombre (`fill %230f172a`) en thème Clair. Attention : `customClass` d'un `ch5-button` atterrit sur le DIV interne `.ch5-button`, pas sur l'hôte → cibler `ch5-button:not([selected="true"]) .src-appletv`, jamais `ch5-button.src-appletv`.
- Aucun son : `funny.mp3` et ses déclencheurs (titre « Sélection de la source », widget météo, triple-tap smartphone) ont été retirés le 10/9/2026 ; `playFunnySound()` reste définie mais silencieuse.

## Vitrine (Crestronshowcase, site crestrongui.vercel.app)
Copie régénérée par `scripts/sync-villa-crans.py "C:\Users\donat\Desktop\VillaCrans\src"` (jamais éditée à la main) ; `meta.mode = "showcase"`, feedback simulé par `js/local-feedback.js`. Claude ne peut pas pousser : il dépose `Claude outputs\showcase-sync-0909\showcase.bundle`, `watch-showcase.cmd` pousse automatiquement (sinon `push-showcase.cmd`).

## Reste à faire (docs/06_TODO.md)
1. `.\deploy.ps1` → compile 1.0.166, dalle + XPanel + CP4 (config racine = `src`, à jour).
2. Recette sur site (8 tests, `docs/07_RETOURS_DIRECTION_2026-09-09.md`) ; point Donatien / Alex / Antoine.
3. P1 C# : try/catch `BuildVillaRoomsDatabase`, joins moteurs pulsés à remettre à false, presets `i < 10`, gardes `ContainsKey`, nom de preset, borne routage ≥ 1000 ; sériels 111/112 si voulus.

## Où sont les fichiers (PC lp-dpe-01-lenovo)
`C:\Users\donat\Desktop\VillaCrans` (GUI + C#, ce fichier = `CONTEXTE-CLAUDE.md` à la racine) · `..\VillaCrans SIMPL` · `..\Villa Crans Screenshots` · clone showcase `Desktop\Crestronshowcase` (règles côté site : son `CLAUDE.md`). Vitrine : dépôt `donafcna/Crestronshowcase`, main → Vercel automatique.

## État au 10.09.2026 (fin de session)
Showcase à jour (dernier commit `0933f31`) et `VillaCrans\src` idem — **non compilé pour la dalle** (`deploy.ps1` à lancer). Session du 10/9 : Mode normal du site réorganisé (outils + légende dans la colonne de droite, « réduit à N % »), fenêtres Système de sécurité et Réglages agrandies, cohérence des 3 thèmes sur toutes les pages et fenêtres avec contrôle de contraste automatisé (4:1), engrenages et logo Apple TV nets, son caché retiré.
