# 10 — Architecture et pièges

## Site showcase (`repo\apps\showcase`)

React 19 + Vite 8, lint `oxlint` (pas ESLint). Deps : `lucide-react` (via `src/icons.js`, imports nommés), `qrcode`, `html2canvas` (imports dynamiques).
`npm run dev` / `build` / `lint` / `preview`.

- `src/data/projects.js` — **source de vérité unique du contenu** : `sectors`, `devices` (avec `viewport` / `simulatorType`, dont TSW-1080 = `wallpanel_hd`), `projects` (textes FR/EN/DE dans `text`, `status` `realisation`/`concept`, `isInteractive`, éventuellement `embedUrl` / `embedPhoneUrl`). Helpers `getProjectText` / `getProjectName` / `getStatusLabel` / `getDeviceById`.
- `src/router.jsx` — mini-routeur History API maison : `/interfaces/:secteur/:projet/:support`, `/contact`, `/fiche/:projet` ; query `?client=`, `?kiosk=1`, `?lang=` ; rewrites dans `vercel.json`.
- `src/components/simulators/` — un composant par projet interactif, lazy-loadé. Ajouter un projet = entrée dans `projects.js` + simulateur ici + entrée dans les maps `SIMULATORS` de `Showcase.jsx` **et** `DemoMode.jsx`.
- `src/components/` — `Dashboard`, `Showcase` (orchestrateur, démo automatique via `useAutoDemo` + `DemoOverlay`, kiosque), `Sidebar` (tab-bar mobile), `DeviceFrame` (boîtiers, échelle via `useFitScale`), `DemoToolbar`, `BackgroundVideo`.
- `src/components/DemoMode.jsx` + `src/demo.css` — mode démo mobile : routes hash `#demo` (launcher tactile) et `#demo/<projectId>` (plein écran réel, deviceType auto iPhone→phone / iPad→tablet) ; redirection auto vers `#demo` sur mobile **uniquement à la racine**, jamais sur un lien profond partagé ; `#site` force le site classique. PWA : `public/manifest.webmanifest`, `public/sw.js`, `public/icons/`.
- `src/pages/` — `Contact`, `ProjectSheet` (fiche A4 imprimable, sans sidebar), lazy-loadées depuis `App.jsx`.
- `src/context/LanguageContext.jsx` — FR/EN/DE (`SUPPORTED_LANGS` dans `src/data/uiTranslations.js`, qui prime sur `src/data/translations.js`).
- `src/hooks/` — `useDemoSettings` (`?client=`, `?kiosk=`), `useFitScale`, `useScreenCalibration`.
- `public/showcases/<id>/index.html` (+ `iphone.html`) — projets non interactifs embarquant une vraie interface CH5 via `embedUrl` / `embedPhoneUrl`.
- `scripts/sync-villa-crans.py <VillaCrans/src>` — régénère la Villa Crans-Montana depuis les sources réelles. Ne jamais copier le `villa_config.json` de développement tel quel (noms de test) ni `js/webxpanel.js` ; `js/local-feedback.js` (moteur d'état, contrat v2) est maintenu à la main.
- **Convention** : `README.md` est un **journal daté** (entrées chronologiques de session), pas un readme statique — on y ajoute, on ne le réécrit pas.

## Châssis, échelle, modes d'affichage

`DeviceFrame`, `scaleRules.js`, `devices.js` : chaque support porte ses caractéristiques réelles (`model`, `diagonalInches`, `nativeW/H`, `physicalW/H` en mm). Châssis de référence : TSW-1070 10,1″ 1920×1200, iPad (A16) 11″, iPhone 16 Pro.

**Vocabulaire figé (ne jamais dire « plein écran » sans préciser)**

- **Mode normal** — la page du site. Châssis ajusté à la page sans jamais dépasser la taille réelle : badge « Taille réelle » si atteinte (±3 %), sinon « réduit à N % ». Pas de sélecteur Responsive. Les outils de démo (QR code · Présentation · Fiche PDF · Plein écran, `DemoToolbar vertical`) puis la légende sur 2 lignes sont empilés dans la colonne de droite au-dessus des boutons de support (`.side-info--tools`) : plus de barre d'outils au-dessus du châssis, plus de marge droite de 65 px.
- **Plein écran** — bouton de la barre d'outils : GUI brute dans un nouvel onglet, sans châssis (dalle et tablette uniquement, jamais smartphone).
- **Mode Scène** — « bouton Scène », bouton d'angle du châssis (flèches diagonales), `isFullscreen` dans le code : châssis seul agrandi au maximum, colonne de droite conservée (fixe 340 px : logo ancré, boutons de support, légende à hauteur fixe, rappel de démo — rien ne bouge entre les deux réglages). Bandeau Dev en haut à gauche (`DevMetrics`, `dev-metrics--fs`) ; les mesures remontent par `FrameInfoContext`. **Seul mode où existe le sélecteur Taille réelle / Responsive.**
- **Plein écran navigateur F11** — indépendant du site.

Le bouton Scène est posé sur la scène à taille fixe (34 px, `--corner-right` / `--corner-top`), jamais réduit avec le châssis.

**Taille réelle** = dimensions physiques. `useScreenCalibration` : convention CSS 96 dpi par défaut, ou px/mm calibré par le visiteur avec une carte bancaire (`CalibrateCard`, lien « Calibrer l'écran » dans la légende du mode Scène et bouton du bandeau Dev, mémorisé dans `localStorage ftv-px-per-mm`) ; rognage si trop grand, légende → F11. **Responsive** = remplit l'espace sans plafond, légende ×k par rapport à la page.

**Légende (`ChassisCaption`)** : `Nom modèle · diagonale · résolution native [· ×k | · avertissement]` + sélecteur Taille réelle / Responsive. Jamais de pourcentage de conception.

**Barre d'outils** : QR code · Présentation · Fiche PDF · Plein écran (« Copier le lien » retiré le 10/9/2026).
**Mode Dev** : `/1` ou `/0` ajouté à n'importe quelle adresse (pas seulement la racine) active/désactive et reste sur la page ; aussi `?dev=1/0`, Ctrl+Alt+D, clic sur le badge.
**Démo automatique (`useAutoDemo`)** : n'appuie jamais sur un bouton déjà actif (`isAlreadyActive`). `data-demo-ignore` exclut un bouton, `data-demo-nav` désigne le conteneur des pièces.

## Thèmes et lisibilité

3 thèmes : Sombre, Clair élégant, Verre dépoli (Cyberpunk retiré, ne pas le réintroduire).

- `<body id="app-body">` obligatoire : toutes les surcharges partent de `body#app-body`, car les règles internes du GUI sont en `#id !important`. Blocs `theme-overlays`, `settings-xl`, `gear-icons`, `tablet-sidebar`, `global-modals-xl`, `theme-readability`.
- **Ne jamais repeindre** : un fond hexadécimal en dur (`:not([style*="background: #"])`, `:not([customStyle*="background: #"])` → touches couleur des télécommandes), un dégradé (`:not([style*="gradient"])`), ni un `ch5-button[selected="true"]` (couleur d'état).
- Verre dépoli = panneaux **translucides** (`--container-bg: rgba(15,23,42,.42)`) + `--blur-val: blur(20px) saturate(1.2) brightness(0.3)` : c'est l'assombrissement du backdrop qui assure la lisibilité, pas l'opacité (opaque, il ressemble au thème Sombre).
- Clair = coque `#f8fafc`, cartes `rgba(15,23,42,.06)`, textes `#0f172a` / `#475569`, accents foncés (`#047857` `#1d4ed8` `#a16207` `#6d28d9` `#b91c1c`).
- Bleu CH5 `#0099ff` ne porte pas de texte blanc (3:1) → `#0369a1` en thèmes sombres, carte claire en Clair. Bouton sélectionné vert `#10b981` → libellé `#052e16`.
- Badges d'alarme : classes `.alarm-badge--off/--partial/--active`, jamais de couleur en dur dans le JS.
- Icônes : engrenages = SVG `.gear-icon` unique (jamais d'emoji ⚙️, flou et pâle), couleur par thème. Logo Apple TV au repos = même SVG que l'état sélectionné, 44 px, version sombre (`fill %230f172a`) en thème Clair. Piège : le `customClass` d'un `ch5-button` atterrit sur le DIV interne `.ch5-button`, pas sur l'hôte → cibler `ch5-button:not([selected="true"]) .src-appletv`, jamais `ch5-button.src-appletv`.
- **Règle permanente** : aucun texte sous 4:1, dans aucun thème, ni sur la page ni dans les fenêtres, états dynamiques compris. Vérification : `npm run build && npx vite preview --port 4173` puis `node scripts/check-contrast-dom.mjs` (3 thèmes × page + 10 fenêtres × états d'alarme, dalle et smartphone ; recompose le fond réel, `backdrop-filter: brightness()` inclus ; attendre 900 ms après un changement de thème à cause des transitions CSS). Même fichier côté VillaCrans : `tools/check_contrast_dom.mjs`.
- **Aucun son** : `funny.mp3` et ses déclencheurs retirés le 10/9/2026 ; `playFunnySound()` reste définie mais silencieuse.

## GUI de déploiement (VillaCrans)

- `src/index.html` (dalle TSW-1070 1280×800, iPad 1180×776, XPanel) et `src/iphone.html` = source de vérité, mise en page fluide.
- `villa_config.json` (racine, copié dans `src/` par `deploy.ps1`) : dimensionnement, `meta.mode = "deploiement"` (jamais `showcase` ici), `pagesSpeciales` (Jeux / Animation désactivées, code conservé), `traductions`.
- Contrat de joins **v2** (`docs/03_CONTRAT_JOINS.md`). Règles CH5 dans `.agents/AGENTS.md` — « Rule of Gold » : états par joins natifs CH5, jamais par DOM JS.
- Télécommandes : Apple TV = Menu + croix (joins 211-216) ; Sky Q / IPTV (500 / 530 + index) et Swisscom (560 + index) en 3 zones rectangulaires ; auto-ajustement `fitRemoteLayout` (jamais hors cadre) ; `#source-control-overlay ch5-button .cb-btn` sans bordure bleue CH5.
- Sources : vidéo 151-154 en interlock, Musique 155 indépendante (badge audio), 156 = retour audio vidéo ; premier appui = activation + télécommande ; scènes mémorisées (appui long, `localStorage villa_scene_<pièce>_<n>`) ; bandeau « État de la villa » (sériels 111/112 optionnels).
- Fenêtres agrandies : Contrôle global, Caméras, Système de sécurité (94 % du GUI, `global-modals-xl`, fond `.modal-backdrop` quasi opaque, textes ≥ 1,1 rem) et Réglages (640 px dalle/tablette, 440 px smartphone, `settings-xl`), variantes compactes en `@media (max-height: 700px / 620px)`.
- Menu de gauche : Réglages + version + météo groupés au-dessus du menu des pièces à **toutes** les largeurs, dalle comprise (`tablet-sidebar`).

## À ne pas faire

- Accumuler des fichiers `.cmd` / `.bundle` (un seul `showcase.bundle`, remplacé).
- Demander à Donatien de cliquer sur des cartes de fichiers : les fichiers sont écrits directement dans ses dossiers.
- Réintroduire le thème Cyberpunk ou les pages Jeux / Animation.
- Éditer à la main `public/showcases/villa-gemini-frequencetv/` (sauf `js/local-feedback.js`).
