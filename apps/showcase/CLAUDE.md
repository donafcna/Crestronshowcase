# Crestron GUI Showcase

Site vitrine (React 19 + Vite 8) présentant des interfaces domotiques Crestron/Lutron (CH5) par secteur — projet entrepreneurial parallèle au travail chez Fréquence TV, devenu outil pour l'équipe marketing. Contexte métier/marketing complet dans la note Obsidian `10_Travail/Dev Crestron/Crestron Showcase Website.md` (vault Obsidian, voir son `CLAUDE.md`).

Déployé sur Vercel : https://crestrongui.vercel.app/ — le projet Vercel était déployé via `npx vercel --prod` (non connecté au repo) ; depuis le 6/9/2026 la fusion est sur GitHub (`donafcna/Crestronshowcase`, branche `main`) et le projet Vercel `crestrongui` est connecté au repo (production = branche `main`) : chaque push sur `main` déploie la prod automatiquement. Ne plus utiliser `npx vercel --prod`. Si un déploiement Git reste en « Production » avec une horloge (non servi), le promouvoir dans le dashboard (séquelle du rollback du 5/9). `node_modules/` et `dist/` ne sont plus suivis par git.

## Stack

Dernier lot Codex du 16/09 : moteur fond 3D `2026-09-16-estate-1` (`public/plan3d/estate.js`, villa assemblée puis éclatement/zoom), et demande distincte de correction du contrôle global GUI source **1.0.178**. Retours natifs CH5, un état sélectionné par section, gris/vert communs dans `themes/global-controls.css` ; feedback local vitrine interverrouillé. Voir les dernières entrées README et `docs/plan3d.md`. Le script de sync lit désormais le `villa_config.json` canonique à la racine CH5. Les archives et installations matérielles ne sont pas mises à jour par le push Vercel.

- React 19 + Vite 8, lint via `oxlint` (pas ESLint) ; deps : `lucide-react` (via `src/icons.js`, imports nommés), `qrcode`, `html2canvas` (imports dynamiques)
- `npm run dev` / `npm run build` / `npm run lint` / `npm run preview`

Dernier complément 3D du 17/09 : `stadiums-1`, tribunes/public/paddock dans les programmes TV via `public/plan3d/tv-venues.js`. GUI conservée en 1.0.181. Recette ciblée `scripts/test-tv-stadiums.cjs`, 31 contrôles trois thèmes/deux modes ; détails et limites dans le journal README et `docs/plan3d.md`.

## Structure

- `src/data/projects.js` — source de vérité unique du contenu : `sectors`, `devices` (avec `viewport`/`simulatorType`, dont TSW-1080 = wallpanel_hd), `projects` (textes FR/EN/DE dans `text`, `status` realisation/concept, `isInteractive`, éventuellement `embedUrl`/`embedPhoneUrl`). Helpers `getProjectText/getProjectName/getStatusLabel/getDeviceById`. Guide non-dev : `docs/GUIDE-MARKETING.md`.
- `src/router.jsx` — mini-routeur History API maison : `/interfaces/:secteur/:projet/:support`, `/contact`, `/fiche/:projet` ; query `?client=`, `?kiosk=1`, `?lang=` ; rewrites dans `vercel.json`.
- `src/components/simulators/` — un composant par projet interactif, lazy-loadé. Ajouter un projet = entrée dans `projects.js` + simulateur ici + entrée unique dans `src/components/simulatorRegistry.js`. Showcase et DemoMode utilisent ce registre commun ; `scripts/check-catalogue.mjs` le vérifie avant build. Aucun repli silencieux vers une autre villa.
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
- **Châssis (`DeviceFrame`, `scaleRules.js`, `devices.js`)** : chaque support a ses caractéristiques réelles (`model`, `diagonalInches`, `nativeW/H`, `physicalW/H` en mm). Mode normal (10/9/2026) : châssis ajusté à la page **sans dépasser la taille réelle** ; badge « Taille réelle » si atteinte (±3 %), sinon « réduit à N % » (N = échelle / échelle réelle), pas de sélecteur. Les outils de démo (QR code · Présentation · Fiche PDF · Plein écran, `DemoToolbar vertical`) puis la légende sur 2 lignes sont empilés dans la colonne de droite au-dessus des boutons de support (`.side-info--tools`) : plus de barre d'outils au-dessus du châssis, plus de marge droite de 65 px. Le bouton Scène est posé sur la scène à taille fixe (34 px, `--corner-right/--corner-top`), jamais réduit avec le châssis. Mode Scène : sélecteur *Taille réelle* (dimensions physiques ; `useScreenCalibration` : convention CSS 96 dpi par défaut, ou px/mm calibré par le visiteur avec une carte bancaire — `CalibrateCard`, lien « Calibrer l'écran » dans la légende du mode Scène et bouton du bandeau Dev, mémorisé dans `localStorage ftv-px-per-mm` — rognées si trop grandes, légende → F11) / *Responsive* (remplit l'espace sans plafond, légende ×k par rapport à la page).
- **Vocabulaire — 4 modes d'affichage (fixés le 10/9/2026, ne jamais dire « plein écran » sans préciser)** : « Mode normal » = la page du site ; « Plein écran » = bouton de la barre d'outils, GUI brute dans un nouvel onglet sans châssis (dalle et tablette uniquement, jamais smartphone) ; « Mode Scène » = « bouton Scène » (bouton d'angle du châssis, flèches diagonales ; `isFullscreen` dans le code : châssis seul agrandi au maximum, colonne de droite) ; « Plein écran navigateur F11 » = indépendant du site.
- **Mode Scène** : colonne de droite fixe 340 px (logo ancré, boutons de support, légende à hauteur fixe, rappel de démo) — rien ne doit bouger entre Taille réelle et Responsive ; bandeau Dev en haut à gauche (`DevMetrics`, `dev-metrics--fs`). Les mesures du châssis remontent par `FrameInfoContext`.
- **Légende (`ChassisCaption`)** : `Nom modèle · diagonale · résolution native [· ×k | · avertissement]` + sélecteur Taille réelle / Responsive. Pas de pourcentage de conception.
- **Démo automatique (`useAutoDemo`)** : n'appuie jamais sur un bouton déjà actif (`isAlreadyActive`).
- **Fiches (`/fiche/:id`, `ProjectSheet`)** : section « Fonctionnalités en détail » depuis `src/data/sheets/<id>.js` (FR/EN/DE : intro, sections {title, image, image2?, portrait?, text, buttons[[label, fonction]]}) + captures `public/sheets/<id>/NN-nom.png` (PNG 1400 px, 256 couleurs). Captures via Playwright : `.device-screen` de `/interfaces/<secteur>/<id>/<support>` (helper de session : `shot-helper.mjs`). Toute modification d'écran d'un simulateur ⇒ refaire sa capture et sa section.
- **Lisibilité (règle permanente)** : aucun texte sous **4:1** dans aucun thème, ni sur la page ni dans les fenêtres, états dynamiques compris. Vérification : `npm run build && npx vite preview --port 4173` puis `node scripts/check-contrast-dom.mjs` (3 thèmes × page + 10 fenêtres × états d'alarme, dalle et smartphone ; recompose le fond réel, `backdrop-filter: brightness()` inclus ; attend 900 ms après un changement de thème à cause des transitions CSS). Le même fichier est livré côté VillaCrans en `tools/check_contrast_dom.mjs`.
- **Mode Dev** : `/1` ou `/0` ajouté à n'importe quelle adresse (pas seulement la racine) active / désactive, puis reste sur la page ; `?dev=1/0`, Ctrl+Alt+D, clic sur le badge.
- **Barre d'outils** : QR code · Présentation · Fiche PDF · Plein écran (« Copier le lien » retiré le 10/9/2026).
- **Thèmes du GUI Villa Crans (10/9/2026)** : `<body id="app-body">` + blocs `theme-overlays` / `settings-xl` / `gear-icons` — toutes les surcharges partent de `body#app-body` (les règles internes du GUI sont en `#id !important`). Ne jamais repeindre un fond hexadécimal en dur, un dégradé, ni un `ch5-button[selected="true"]`. Verre dépoli = panneaux translucides + backdrop assombri (jamais opaques, sinon il ressemble au thème Sombre).
- **Ne pas faire** : fichiers `.cmd`/`.bundle` qui s'accumulent (un seul `showcase.bundle`, remplacé) ; demander à Donatien de cliquer sur les cartes de fichiers (elles sont déjà écrites dans ses dossiers) ; réintroduire le thème Cyberpunk ou les pages Jeux / Animation (désactivées dans `villa_config`, code conservé).

## Plan 3D de la villa en fond de page (16/9/2026) — site uniquement, jamais dans le GUI
- **Le GUI des châssis ne change pas** (dalle, tablette, smartphone, XPanel) : la copie `public/showcases/villa-gemini-frequencetv/` reste la sortie brute de `scripts/sync-villa-crans.py`. Toute demande « plan 3D » concerne le **fond de page du site**, là où tourne la vidéo.
- Implémentation : `src/components/Plan3DBackground.jsx` remplace `BackgroundVideo` pour les projets listés dans `PLAN3D_PROJECTS` (`villa-gemini-frequencetv` → `public/plan3d/villa-crans.json` : style, disposition des pièces). Le module `public/plan3d/plan3d.js` (Three.js dans `public/plan3d/vendor/`, chargé par `import()` à l'exécution, hors bundle) lit les feedbacks du GUI **à travers l'iframe, même origine** : `iframe.contentWindow.CrComLib` (a10 pièce, a71-80 circuits, d150-156 sources, d155 musique, a31/s33 consigne), clics sur `ch5-button[data-join]` (télécommandes 211-216 / 500+ / 530+ / 574+, stores 61-69, moteurs 81-98) et enveloppe `animateGroupBlinds`. Noms de pièces lus dans `villaConfigEmbedded` de l'iframe.
- **Quand** : la vidéo de fond reste le défaut. La 3D ne la remplace que si `plan3dEnabled(projectId, device, windowW)` est vrai, c'est-à-dire projet listé dans `PLAN3D_PROJECTS` **et** une règle de `PLAN3D_RULES` satisfaite (`{device, minWidth, maxWidth}`, chaque borne optionnelle). Règle actuelle : `{device: "phone"}` (châssis Smartphone, toute largeur). Jamais en Plein écran. Ajouter les cas au fur et à mesure des essais de l'utilisateur, jamais réactiver la 3D partout.
- Cadrage actualisé par Codex le 16/09 : villa entière **et** pièce active cadrées dans la zone libre entre le boîtier complet et `.workspace-device-sidebar`, via `api.setWindow(rect)` et projection du volume. Smartphone à gauche en Mode normal **et** en Mode Scène. Molette sur le décor : dézoom villa / zoom dernière pièce. `selectedRoom()` conserve la cible des commandes quand `activeRoom()` vaut null en vue globale ; `focusSelected()` rétablit la vue pièce. `window.__plan3d` = API (tests : `jump()`, `metrics()`, `version`).
- Rendu (16/9, détails) : deux scènes rendues sur le même tampon de profondeur — `scene` (sol, pins, relief des montagnes en grille de hauteurs à couleurs de sommets, terrasse, piscine) sous jour constant, `sceneR` (pièces) dont hemi/sun/fill suivent `daylight(R)` = (1−volet)(1−0,85 store)(1−0,7 rideaux) de la pièce active, plus un `SpotLight` par la fenêtre et un rai additif (`R.shaft`). Fenêtre percée dans le mur nord avec motorisations visibles (caisson de volet ouvert, store à tube, tringle à moteur de rail, voyant LED par moteur clignotant pendant la course) ; terrasse = pergola à store de toit (famille `store`, axe z). `R.shades[famille] = {mesh|meshes, pos, cible, min, axis, led, update}`. TV : écran canvas 1024×576 par source, voyant de veille. Tests : `api.shadePos(famille, 0..1)`, `api.daylight()`.
- Vérification : `npm run build`, `npm run lint`, serveur Vite local, puis `node scripts/test-plan3d.cjs` avec Playwright disponible. La toile est attendue sur `/interfaces/residentiel/villa-gemini-frequencetv/phone`. Dalle et tablette conservent la vidéo ; aucun plan3d dans leurs GUI. Documentation du lot Codex, matériaux CC0, performances et limites : `docs/plan3d.md`.
- Complément Codex `atlas-2` (16/09) : OFF prioritaire pour le rendu, snapshot `Villa.get` relu après sélection car les analogiques identiques peuvent ne pas être réémis. Façades instanciées en vue globale (`envelope.js`), disparition avant zoom ; clic sur une pièce appelle le handler existant `changeRoomIphone` (demande explicite de Donatien, liaison désormais bidirectionnelle pour la sélection). Caméra sans saut, vue pièce rapprochée. Fenêtre et occultations du cinéma déplacées sur le mur ouest, écran réservé au mur nord. Ajouter `scripts/test-plan3d-navigation.cjs` à la recette ; aucune modification de la GUI générée.


## 16/09/2026 — estate-2, GUI 1.0.179 : villa, animations et HVAC

Demande groupée de Donatien : sous-sol avec cinéma, sauna/hammam, garage et simulateur de golf (16 pièces showcase), grand salon/cuisine/salle à manger au RDC, rampe d'accès garage dégagée, fenêtres vers l'extérieur avec cours anglaises au sous-sol, bannes de chaque pièce RDC. Cinq circuits lumineux indépendants ; fondu linéaire 3 s conservé. Rideaux : flèches horizontales dans les GUI sources.

Audio : ondes sur sources vidéo et musique, diamètres selon le volume A/V ou le volume média distinct, arrêt sur mute/OFF ; cinéma 11 canaux dont arrière/surround/plafond. TV : programmes Canvas animés cinéma, football, tennis, course automobile, 15 images/s sans téléchargement de vidéos ni son. Jardin : luminaires, projections douces, clôtures/terrasse/piscine et lumière sous l'eau ; portiques caméra quatre coins, façades et portail. Cycle 20 s (deux demi-cycles de 10 s, transitions de 2 s). Eau déformée par shader et brise discrète sur une partie du feuillage, haies fixes ; réduction avec le niveau de qualité. Démo automatique : Smartphone 60 s, autres supports 10 s.

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

Tests locaux : 24 contrôles villa, 28 navigation, 23 fondu, 40 matrice 3D, 36 combinaisons GUI HVAC et 15 contrôles réception native sans simulateur ; 76 contrôles C#/JSON/SMW. Contraste pages/fenêtres/états dans les trois thèmes : aucun texte sous 4:1. Test dédié des délais 60/10 s, volume musique, pause vidéo et shader de l'eau. Mesure locale GPU 1280×800 DPR 1,5 : environ 55–60 images/s (pièce, villa fermée et ouverte). Limite : rendu stylisé enrichi, pas promesse de photoréalisme.

Preuves dans `Claude outputs/codex-plan3d-villa2/` ; dossier `livraison-hvac` : JSON, CH5Z assemblé, SMW préparé. Le projet SIMPL original et ses modifications locales sont préservés : copie = 715 ajouts, aucune suppression. **LPZ non compilé ; aucun déploiement matériel.** C# compilé, mais Windows bloque l'empaquetage final du CPZ (`MSB3441 / 0x800711C7`, contrôle d'applications). Premier CPZ d'essai écarté de la livraison. La mise en service nécessite les bons CPZ/LPZ et la recette Debugger.


## 16/09/2026 — estate-3 : cycle jour/nuit de 70 secondes

À la demande de Donatien : jour stable 30 s, transition progressive vers la nuit 5 s, nuit stable 30 s, transition vers le jour 5 s, en boucle. Le ciel, la lumière naturelle et les luminaires extérieurs suivent la même progression douce. Changement limité au rythme du fond 3D ; GUI 1.0.179 et programmes Crestron inchangés.

Validation ciblée : un cycle complet observé au navigateur, neuf contrôles réussis (plateaux, transitions, reprise et éclairage piscine), aucune erreur JavaScript/shader. Build et lint réussis. Matrice GUI inchangée : ce lot ne modifie ni ses écrans, ni ses thèmes, ni ses interactions. Rapport local : Claude outputs/day-night-verification.json.


## 16/09/2026 — estate-4 : transitions jour/nuit de 10 secondes

Nouvel ajustement demandé : 30 s de jour, transition de 10 s vers la nuit, 30 s de nuit, transition de 10 s vers le jour. Cycle total 80 s, même variation douce et synchronisation des éclairages extérieurs.

Validation : cycle complet de 80 s observé, neuf contrôles réussis (dont les transitions et l'éclairage piscine), aucune erreur JavaScript/shader ; build et lint réussis. Rapport local : Claude outputs/day-night-80-verification.json. Aucun changement de GUI ou de programmes Crestron.

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage

Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.

Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.

## 17/09/2026 — paysage valley-1

Deux lacs alimentent les ruisseaux ; eau et relief partagent le profil de valley.js. Chemins raccordés, ponts, soubassements des chalets ; onze champs, bosquets et herbe texturée. Arbres/touffes instanciés, détails fixes regroupés, environ 4 Ko gzip supplémentaires et aucun asset distant. Trois thèmes × deux modes × jour/nuit vérifiés, contrôle réel eau/terrain, 29 tests paysage et 31 tests TV. Voir docs/plan3d.md et les preuves Claude outputs/alpine-landscape. Chargeur/API valley-1, imports TV stadiums-1 conservés. GUI 1.0.181 inchangée ; aucun déploiement matériel par ce lot.
