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
