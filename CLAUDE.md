# Crestron GUI Showcase

Site vitrine (React 19 + Vite 8) présentant des interfaces domotiques Crestron/Lutron (CH5) par secteur — projet entrepreneurial parallèle au travail chez Fréquence TV, devenu outil pour l'équipe marketing. Contexte métier/marketing complet dans la note Obsidian `10_Travail/Dev Crestron/Crestron Showcase Website.md` (vault Obsidian, voir son `CLAUDE.md`).

Déployé sur Vercel : https://crestrongui.vercel.app/ — le projet Vercel était déployé via `npx vercel --prod` (non connecté au repo) ; depuis le 6/9/2026 la fusion est sur GitHub (`donafcna/Crestronshowcase`, branche `main`) et le projet Vercel `crestrongui` est connecté au repo (production = branche `main`) : chaque push sur `main` déploie la prod automatiquement. Ne plus utiliser `npx vercel --prod`. Si un déploiement Git reste en « Production » avec une horloge (non servi), le promouvoir dans le dashboard (séquelle du rollback du 5/9). `node_modules/` et `dist/` ne sont plus suivis par git.

## Stack

- React 19 + Vite 8, lint via `oxlint` (pas ESLint) ; deps : `lucide-react` (via `src/icons.js`, imports nommés), `qrcode`, `html2canvas` (imports dynamiques)
- `npm run dev` / `npm run build` / `npm run lint` / `npm run preview`

## Structure

- `src/data/projects.js` — source de vérité unique du contenu : `sectors`, `devices` (avec `viewport`/`simulatorType`, dont TSW-1080 = wallpanel_hd), `projects` (textes FR/EN/DE dans `text`, `status` realisation/concept, `isInteractive`, éventuellement `embedUrl`/`embedPhoneUrl`). Helpers `getProjectText/getProjectName/getStatusLabel/getDeviceById`. Guide non-dev : `docs/GUIDE-MARKETING.md`.
- `src/router.jsx` — mini-routeur History API maison : `/interfaces/:secteur/:projet/:support`, `/contact`, `/fiche/:projet` ; query `?client=`, `?kiosk=1`, `?lang=` ; rewrites dans `vercel.json`.
- `src/components/simulators/` — un composant par projet interactif, lazy-loadés (ajouter un projet = entrée dans `projects.js` + simulateur ici + entrée dans les maps SIMULATORS de `Showcase.jsx` et `DemoMode.jsx`).
- `src/components/` — `Dashboard`, `Showcase` (orchestrateur, démo automatique via `useAutoDemo` + `DemoOverlay`, kiosque), `Sidebar` (avec tab-bar mobile), `DeviceFrame` (boîtiers, échelle via `useFitScale`), `DemoToolbar` (copier lien, QR, présentation, fiche PDF, capture PNG, nom client), `BackgroundVideo`.
- `src/components/DemoMode.jsx` + `src/demo.css` — **mode démo mobile** (outil marketing) : routes hash `#demo` (launcher tactile) et `#demo/<projectId>` (interface en plein écran réel, deviceType auto iPhone→phone / iPad→tablet) ; redirection auto vers `#demo` sur mobile UNIQUEMENT à la racine (jamais sur un lien profond partagé) ; `#site` force le site classique. PWA : `public/manifest.webmanifest`, `public/sw.js`, `public/icons/`.
- `src/pages/` — `Contact`, `ProjectSheet` (fiche A4 imprimable, rendue sans sidebar) — lazy-loadées depuis `App.jsx`.
- `src/context/LanguageContext.jsx` — langues publiques FR/EN/DE (`SUPPORTED_LANGS` dans `src/data/uiTranslations.js`, qui prime sur `src/data/translations.js`).
- `src/hooks/` — `useDemoSettings` (`?client=`, `?kiosk=`), `useFitScale`.
- `public/showcases/<id>/index.html` (+ `iphone.html`) — projets non-interactifs embarquant une vraie interface CH5 via `embedUrl`/`embedPhoneUrl`.
- `scripts/sync-villa-crans.py <VillaCrans/src>` — met à jour la Villa Crans-Montana depuis les sources réelles (voir README 7/9/2026) ; ne jamais copier `villa_config.json` de développement tel quel (noms de test) ni `js/webxpanel.js` ; `js/local-feedback.js` (moteur d'état, contrat v2) est maintenu à la main.

## Convention importante

`README.md` sert de **journal daté** (entrées chronologiques des sessions de dev), pas de readme statique — continuer à ajouter des entrées plutôt que de le réécrire.

## Leçon du 5/9/2026

Deux sessions Claude ont livré en parallèle (v2 marketing et mode démo mobile) et l'écrasement mutuel de `App.jsx`/`main.jsx` a cassé la prod (« useRouter must be used within RouterProvider », rollback Vercel nécessaire). Avant toute livraison : vérifier que le dossier local n'a pas divergé du point de départ, et builder + tester avant `vercel --prod`.

## TODO connus

- Activer Vercel Web Analytics dans le dashboard.
- Confirmer l'e-mail de contact dans `src/data/company.js` (info@frequence-tv.ch = hypothèse).
- Remplacer vignettes Unsplash / vidéos Mixkit par des médias Fréquence TV.
- Affichage du simulateur de `/interfaces` sur très petit écran à améliorer (le mode `#demo` est la voie mobile prévue).
- Tester le déploiement sur Apple Store / Play Store.

## Session Cowork « Villa Crans CH5 » (9/9/2026) — règles et mécanique, à lire avant de toucher au châssis / plein écran / fiches

- **Deux versions d'une seule source** : le GUI Villa Crans-Montana vient TOUJOURS de `C:\Users\donat\Desktop\VillaCrans\src` (dépôt VillaCrans, voir son `CONTEXTE-CLAUDE.md`) via `python3 scripts/sync-villa-crans.py <src>` ; jamais d'édition à la main dans `public/showcases/villa-gemini-frequencetv/` sauf `js/local-feedback.js` (moteur de démo, contrat de joins v2, `meta.mode === "showcase"` obligatoire).
- **Pousser depuis une session Claude** : le proxy Git refuse ce dépôt → Claude dépose `showcase.bundle` dans `VillaCrans\Claude outputs\showcase-sync-0909\` ; `watch-showcase.cmd` (PC de Donatien) l'applique et pousse tout seul, `push-showcase.cmd` en manuel. Un bundle = `git bundle create showcase.bundle <main distant>..main`.
- **Châssis (`DeviceFrame`, `scaleRules.js`, `devices.js`)** : chaque support a ses caractéristiques réelles (`model`, `diagonalInches`, `nativeW/H`, `physicalW/H` en mm). Règle unique, page ET plein écran : *Taille réelle* = dimensions physiques calibrées (`useScreenCalibration` : diagonale de l'écran réglable dans le bandeau Dev, px/mm mémorisé), identiques partout, rognées si trop grandes (légende → « F11 ») ; *Responsive* = remplit l'espace (page : plafond `maxUpscale`, plein écran : sans plafond, marge 0,5 %). Ne jamais réintroduire un mode qui dépendrait de la page.
- **Vocabulaire — 4 modes d'affichage (fixés le 10/9/2026, ne jamais dire « plein écran » sans préciser)** : « Mode normal » = la page du site ; « Mode Plein écran » = bouton de la barre d'outils, GUI brute dans un nouvel onglet sans châssis (dalle et tablette uniquement, jamais smartphone) ; « Mode Scène » = bouton d'angle du châssis (`isFullscreen` dans le code : châssis seul agrandi au maximum, colonne de droite) ; « Plein écran navigateur F11 » = indépendant du site.
- **Mode Scène** : colonne de droite fixe 340 px (logo ancré, boutons de support, légende à hauteur fixe, rappel de démo) — rien ne doit bouger entre Taille réelle et Responsive ; bandeau Dev en haut à gauche (`DevMetrics`, `dev-metrics--fs`). Les mesures du châssis remontent par `FrameInfoContext`.
- **Légende (`ChassisCaption`)** : `Nom modèle · diagonale · résolution native [· ×k | · avertissement]` + sélecteur Taille réelle / Responsive. Pas de pourcentage de conception.
- **Démo automatique (`useAutoDemo`)** : n'appuie jamais sur un bouton déjà actif (`isAlreadyActive`).
- **Fiches (`/fiche/:id`, `ProjectSheet`)** : section « Fonctionnalités en détail » depuis `src/data/sheets/<id>.js` (FR/EN/DE : intro, sections {title, image, image2?, portrait?, text, buttons[[label, fonction]]}) + captures `public/sheets/<id>/NN-nom.png` (PNG 1400 px, 256 couleurs). Captures via Playwright : `.device-screen` de `/interfaces/<secteur>/<id>/<support>` (helper de session : `shot-helper.mjs`). Toute modification d'écran d'un simulateur ⇒ refaire sa capture et sa section.
- **Lisibilité** : aucun texte sous 3:1 de contraste, dans tous les thèmes du GUI Villa Crans (`tools/check_contrast.mjs` côté VillaCrans).
- **Ne pas faire** : fichiers `.cmd`/`.bundle` qui s'accumulent (un seul `showcase.bundle`, remplacé) ; demander à Donatien de cliquer sur les cartes de fichiers (elles sont déjà écrites dans ses dossiers) ; réintroduire le thème Cyberpunk ou les pages Jeux / Animation (désactivées dans `villa_config`, code conservé).
