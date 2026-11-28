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
- **Implantation des écrans — règle permanente demandée le 17/09** : une TV allumée doit rester entièrement dégagée, jamais derrière un meuble, une bibliothèque, des lames décoratives, un rideau ou un luminaire. Réserver une zone libre au mur ou au pied du lit ; contrôler depuis la caméra en Mode normal et Scène, occultations ouvertes/fermées. L'escamotage dans un meuble n'est admis qu'à l'arrêt, pour une TV explicitement conçue ainsi. Déplacer physiquement l'obstacle ou l'écran ; ne pas désactiver le test de profondeur pour cacher le défaut. Même exigence de cohérence pour les fenêtres et les autres équipements.
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

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-ftv/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

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

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-ftv/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.

## 17/09/2026 — paysage valley-1

Deux lacs alimentent les ruisseaux ; eau et relief partagent le profil de valley.js. Chemins raccordés, ponts, soubassements des chalets ; onze champs, bosquets et herbe texturée. Arbres/touffes instanciés, détails fixes regroupés, environ 4 Ko gzip supplémentaires et aucun asset distant. Trois thèmes × deux modes × jour/nuit vérifiés, contrôle réel eau/terrain, 29 tests paysage et 31 tests TV. Voir docs/plan3d.md et les preuves Claude outputs/alpine-landscape. Chargeur/API valley-1, imports TV stadiums-1 conservés. GUI 1.0.181 inchangée ; aucun déploiement matériel par ce lot.


## 17/09/2026 — audio-1

Ondes ×2, diamètre lié au volume audible (a52 AV / a254 musique). Initialisation source=5 corrigée en musique active dans le feedback local ; Suite invités/terrasse/piscine concernées. Enceintes des suites dégagées, Wellness/garage/golf équipés : 32 enceintes, 15 pièces. Cuisine et local technique sans enceintes. 263 contrôles locaux, build/lint réussis ; détails et preuves dans README et docs/plan3d.md. Aucun changement des programmes matériels.


## 17/09/2026 — lighting-1

Scènes mieux distinctes en journée : lumière naturelle intérieure rééquilibrée, rebond des lampes conservé, fondu 3 s et occultations inchangés. 54 appliques de façade à double faisceau, allumage crépusculaire ; un seul maillage de projection. Showcase : pièce 11 Pool House, pièce 14 Bar & Lounge (choix utilisateur), génération depuis sync-villa-crans.py. Aucun changement au JSON physique ni aux programmes matériels. Recettes test-scene-contrast.cjs, test-room-labels.cjs et test-plan3d-lighting.cjs ; preuves et mesures dans README et docs/plan3d.md.


## 17/09/2026 — feedback-1

TV salle à manger déplacée hors du meuble à bouteilles ; tous les écrans contrôlés par rayons (11 TV, occultations ouvertes/fermées, normal/Scène). Rails reculés près du mur arrière, applique Salon dégagée et écran cinéma ajusté sous la corniche. Lumière d’ambiance localisée canapé/chevets, deux sources lumineuses conservées ; fondu 3 s inchangé. Ondes fines réellement expansives sur 1,6 s, amplitude selon le volume audible, arrêt mute/OFF/pause. Recettes test-plan3d-room-feedback.cjs, test-plan3d-audio.cjs et test-plan3d-lighting.cjs ; résultats et limites dans docs/plan3d.md. Aucun changement GUI ou matériel.


## 17/09/2026 — tour-1

Villa Crans ouvre le secteur Residential sur Smartphone : vue globale 3 s, pièces aléatoires à t=3 puis toutes les 5 s, TSW à t=60 pendant 10 s, retour Smartphone en boucle. Horloge jour/nuit commune conservée entre les montages 3D ; CINÉMA + rideaux fermés au crépuscule, OFF + rideaux ouverts à l'aube. Contrôle manuel prioritaire, reprise téléphone 60 s. `src/hooks/villaTour.js` porte cette séquence, les autres projets conservent useAutoDemo générique. État dans local-feedback.js, sans changement GUI ou programmes matériels. Recette : test-villa-tour.cjs ; autres bancs prennent la main via helpers/villa-manual.cjs. Voir README et docs/plan3d.md.


## 17/09/2026 — journey-1 : parcours guidés et lisibilité nocturne

Dernière demande de Donatien : chaque pièce montre un parcours complet. Tablette/dalle/PC : pièce → éclairage → HVAC → audio/vidéo → Apple TV → IPTV → volume → OFF audio/vidéo. Les simulateurs sans ces deux sources utilisent deux sources réellement disponibles ; un lecteur audio se termine par Pause. Aucun clic aléatoire sur réglages, alarmes ou commandes générales. Trois pièces sont parcourues avant la poursuite du carrousel.

Villa Crans Smartphone : fermeture de tous les moteurs présents ; de nuit TOTAL puis CINÉMA, de jour CINÉMA puis ouverture de tous les moteurs ; ensuite HVAC, sources Apple TV/IPTV, volume, OFF A/V. Les motorisations finissent leur course et chaque fondu de scène dure trois secondes. La branche jour/nuit est choisie au début de la visite ; l'ambiance globale n'écrase pas la pièce en cours. Les autres pièces suivent toujours le cycle 30/10/30/10. Vue villa initiale conservée trois secondes. Les anciens créneaux de cinq secondes par pièce sont remplacés : la dernière pièce se termine avant le changement de châssis, les 60 secondes Smartphone et 10 secondes TSW sont désormais des durées minimales. La tablette Villa Crans montre trois visites complètes. Intervention manuelle toujours prioritaire, délai de reprise 60 secondes Smartphone / 10 secondes autres supports.

La demande « jamais de pièce dans le noir total » remplace l'ancienne exigence de rendu complètement noir : faible remplissage de présentation par les deux lumières déjà présentes (hémisphère minimum 0,32, remplissage 0,18). Les luminaires commandés et leurs retours restent strictement à zéro en OFF. Aucun ajout de lumière, modèle ou média distant. Contraste mesuré Bureau de jour OFF/CINÉMA/REPAS/TOTAL : 0,259 / 0,381 / 0,518 / 0,599 ; valeurs de pixels, pas des lux.

Corrections constatées pendant la recette : le curseur CH5 synthétique ne transmettait pas toujours le volume ; publication du même join analogique dans le simulateur local uniquement. Les ancêtres masquant un bouton ne sont plus considérés comme une cible visible ; défilement des panneaux existants avant déplacement. Seuil de taille évalué avant réduction du châssis. Appartement Carouge : contrôles du lecteur et de la liste des pièces conservés dans le DOM pendant les mises à jour React, permettant le glissement complet du volume. Villa Nyon : volume réellement contrôlé et pourcentage synchronisé. FTV Home : source Apple TV, volume par écran et OFF de l'écran ciblé ; captures et fiches FR/EN/DE actualisées.

Recette locale : 34 contrôles du cycle Villa Crans, 122 contrôles sur cinq parcours React, 23 contrôles de fondu, 18 contrôles de contraste, 8 contrôles fiches/volume/cibles et comparaison trois thèmes × normal/Scène. FTV Home possède ses deux thèmes clair/sombre, sans verre dépoli. Premiers essais ont révélé les défauts de volume, de clipping et de remontage React ci-dessus ; tous corrigés puis recontrôlés. Pas de nouvelle erreur navigateur ; messages WebXPanel/SVG préexistants TSW consignés séparément. Build/lint réussis avec avertissements préexistants.

Preuves et comparaison : `docs/verification/2026-09-17-journey-1/` à la racine du dépôt. Source GUI CH5, configuration physique, C# et SIMPL inchangés ; aucun matériel compilé ou déployé. Le tracé F1 demandé ensuite est uniquement consigné dans `apps/showcase/docs/TODO-SHOWCASE.md`, sans modification de la simulation sportive.


Publication vérifiée : **74cd4a41**, main → Vercel. Quatre ressources publiques identiques aux octets Git ; **34 contrôles Villa Crans et 122 contrôles React réussis sur le site public**, soit 156. Cycle jour/nuit, deux passages Smartphone et TSW, sources et volume réels, arrêt A/V, priorité manuelle et minimum de visibilité confirmés. Aucun nouveau défaut navigateur ; messages préexistants du TSW séparés. Preuves `production/`, `production-react/` et `production-assets.json` dans `docs/verification/2026-09-17-journey-1/`. Aucun matériel déployé. La TODO F1 est enregistrée sans réalisation.


## 26/09/2026 — Hotel Brassus iPhone, vitrine 2.1.1

Demande explicite : adaptation portrait et ouverture Hôtellerie sur Hotel Brassus / Smartphone avec maquette 3D. Dalle TSW, PC/XPanel et Tablette : GUI CH5 original et vidéo de fond. Adaptation dédiée `phone.html/css/js`, commandes locales sans transport matériel, sept espaces, trois thèmes Original/Clair/Sombre conservés, scènes/circuits, volume/sources/mute, stores avec arrêt et consigne. États conservés entre espaces durant la session. Cette adaptation web ne constitue pas un CH5Z livré au matériel. Source CH5 de l'hôtel et copie native inchangées.

La maquette ouvre en vue globale, puis suit le niveau d'un espace sélectionné ou d'une commande d'éclairage. Éclairages synchronisés, molette de zoom, cadrage entre le téléphone et la colonne en modes normal/Scène. Les limites architecturales de la maquette restent celles documentées au lot 2.1.0. Aucun modèle 3D chargé en fond sur les trois grands supports.


## 26/09/2026 — Référence Smartphone commune : grand iPhone

À la demande explicite de Donatien, tous les projets utilisent le grand format portrait iPhone 18 Pro Max (Apple FR vérifié le 26/09/2026 : https://www.apple.com/fr/iphone-18-pro/specs/). Écran 6,9 pouces, 1320 × 2868 pixels, boîtier 78 × 163,4 mm. Configuration partagée `src/data/devices.js` : écran 440 × 956 unités CSS, GUI 440 × 863 après zones réservées de présentation 59/34, boîtier graphique 488 × 1022. La taille physique calibrée et le Mode Scène utilisent cette même configuration. Remplace la référence iPhone 16 Pro antérieure ; aucune variante par projet.


## 26/09/2026 — Accès mobile exclusivement simplifié, vitrine 2.1.2

Demande de Donatien : smartphones et tablettes affichent seulement le catalogue tactile et son lecteur de GUI. Le choix est fait avant tout rendu du site complet, pour toutes les routes, paramètres et ancien hash #site. Les liens #demo/projet restent utilisables et le retour ouvre le catalogue. Suppression du bouton « Ouvrir le site complet » dans le catalogue et la page indisponible. Les ordinateurs conservent le site complet. Détection iOS/Android et iPad avec user-agent de bureau ; rotation iPad maintenue en tablette.

## 26/09/2026 — Hotel Brassus, enveloppe et caméra 2.1.3

Le fond 3D Hotel Brassus affiche l'enveloppe complète seulement en vue générale. La sélection d'un espace masque l'enveloppe et isole le niveau en coupe. Navigation permanente : molette delta positif = vue complète immédiate ; delta négatif = progression vers la dernière zone sélectionnée. La sélection GUI lance directement la transition. Ne pas perdre `selectedZone` au retour général.

## 27/09/2026 — Appartement Crans-Montana, vitrine 2.2.17 : deuxième GUI CH5 issue du Core

- Projet `appartement-crans` (non interactif, `embedUrl` / `embedPhoneUrl` vers `public/showcases/appartement-crans/`), placé après `villa-gemini-frequencetv` dans `projects.js`. Dépôt public : aucun nom d'opérateur, de lieu-dit ni de personne ; `scripts/sync-appartement-crans.py` refuse toute synchronisation contenant un terme de test ou un terme interdit.
- Régénération : `python3 scripts/sync-appartement-crans.py <projects/appartement-crans/ch5/src>` (config canonique `projects/appartement-crans/villa_config.json`, noms réels conservés, pilotages tels quels). Jamais d'édition à la main dans `public/showcases/appartement-crans/` sauf `js/local-feedback.js` (copie adaptée du moteur Villa Crans : niveaux de scène par pièce lus dans `villaConfigEmbedded`).
- Démo automatique : les GUI issues du Core hors Villa Crans suivent la branche Core de `src/hooks/orderedDemo.js` (jamais un bouton déjà actif, trois pièces par cycle). Le délai d'entrée du site s'applique (10 s dalle / tablette, 60 s smartphone).
- Recette : `node scripts/test-appartement-crans.cjs` (70 contrôles) puis `node scripts/check-contrast-dom.mjs --root http://localhost:4173/showcases/appartement-crans`. Captures de fiche : `scripts/shoot-appartement-crans.cjs` puis `scripts/helpers/png-1400-256.py`. Le fond 3D repositionne l'iframe du châssis Smartphone en continu : utiliser `page.mouse` / clics DOM et une capture par découpe de page, jamais `locator.click()` / `locator.screenshot()`.
- Défauts Core connus, non corrigés ici (à traiter dans le Core) : « Alarme » de l'en-tête smartphone en thème Clair à 3,88:1 (aussi sur Villa Crans) ; noms de pièces longs tronqués dans le menu dalle / tablette ; onze circuits = défilement interne de la fenêtre Circuits sur dalle / tablette ; boutons Fermer (78×35) et Enregistrer (34×42) de la fenêtre Circuits, en-tête smartphone Alarme / Caméras / Global 36 px de haut.

## 27/09/2026 — Appartement Crans-Montana (`appartement-crans`), deuxième GUI Core

- Deux vitrines issues du même Core : `sync-villa-crans.py` et `sync-appartement-crans.py` (config canonique `projects/appartement-crans/villa_config.json`, noms réels conservés, termes interdits bloquants — dépôt public, jamais de nom d'opérateur, de lieu-dit ni de personne). Toute correction GUI se fait dans le Core puis se propage aux DEUX copies ; vérifier les deux (contraste, `test-appartement-crans.cjs`, `test-appartement-crans-modes.cjs`).
- Batterie « site » de référence : `scripts/test-appartement-crans-modes.cjs` (3 thèmes × Mode normal / Scène Taille réelle / Scène Responsive / Plein écran × dalle / iPad / smartphone). Planche avant/après : `scripts/planche-avant-apres.cjs --before <site de départ> --after <site courant> --project <id>` (worktree `git worktree add <dir> <commit>` servi sur 4174).
- Fond 3D : `cfg.enveloppe = "residence"` → `public/plan3d/residence.js` ; disposition = `pieces[].plan3d` du projet, régénérée par `scripts/build-plan3d-appartement.mjs` (jamais de surcharge dans le script).
- Tests 3D GPU (`test-plan3d*.cjs`) : sans GPU (SwiftShader) 3 assertions échouent à l'identique avant/après ; comparer toujours à la référence, ne pas « corriger » le moteur pour ces cas.

## 29/09/2026 — interface Connect (Appartement Crans-Montana) et projets en retrait, vitrine 2.3.0
- `meta.interface = "connect"` dans le JSON d'un projet issu du Core → `themes/connect.css` + `js/connect-ui.js` (API `window.ConnectUI` : `openRoom(id)`, `setTab(t)`, `state`). Le Core d'origine est masqué, pas supprimé. Tests : `test-appartement-crans.cjs`, `test-appartement-crans-modes.cjs`, `test-connect-flash.cjs` (aucun flash du Core au chargement) ; `check-contrast-dom.mjs` ne couvre pas Connect.
- **Projets en retrait** : `src/data/retiredProjects.js` (Villa Nyon, Appartement Carouge, Appartement Eaux-Vives). Exclus du catalogue public, conservés dans le dépôt. « Ressort les projets maquettes mis en retrait » = retirer leurs identifiants de cette liste.


## 25/11/2026 — Villa Stark

Ajout du concept Villa Stark dans Résidentiel : villa photographique et dalle interactives, commandes françaises, scénarios de vie dont Mon film, trois thèmes lisibles, agrandissement des commandes, adaptation tactile et arrêt intermédiaire des stores. Présentation immersive isolée via `immersiveDemo`, démo automatique générique désactivée. Ressources locales sous `public/showcases/villa-stark/`, fiches FR/EN/DE et captures dédiées. Recette, comparaison et limites : `docs/verification/2026-11-25-villa-stark/README.md`. Aucun programme matériel modifié.


## 25/11/2026 — Villa Stark : fond animé séparé du châssis

Correction demandée : la villa animée est le fond du site ; le GUI seul utilise DeviceFrame pour TSW, XPanel, iPad et iPhone. `mode=panel` / `mode=background` réutilisent le même moteur, état diffusé par BroadcastChannel avec identifiant de session propre au Showcase. Le GUI reste l’autorité de simulation ; le fond ne simule pas de températures indépendantes. État conservé entre supports, commandes du fond relayées au GUI, outils de scène et thème dans la colonne standard. L’accueil iPhone tient sans défilement, navigation toujours disponible. Douze combinaisons châssis/thème vérifiées, Mode Scène, éclairage bleu, stores, cinéma et visiteur synchronisés ; build/lint réussis. Captures et limites : `docs/verification/2026-11-25-villa-stark-chassis/`. Remplace la présentation immersive sans châssis du lot précédent. Aucun matériel modifié.


## 25/11/2026 — Villa Stark : cadrage dégagé et logo officiel

Châssis aligné à gauche ; villa recadrée depuis les limites réelles du châssis et des outils, vues intérieures dans la même zone dégagée. Adaptation au support et au redimensionnement. Logo officiel du site, sans recoloration, remplace le texte recréé ; captures de fiche actualisées. Recette : 24 combinaisons (quatre supports × trois thèmes × normal/Scène Responsive), neuf baies sans recouvrement dans chaque cas ; complément 960×640 et bleu intérieur synchronisé. Résultats et limites : `docs/verification/2026-11-25-villa-stark-framing/`. Aucun matériel modifié.


## 25/11/2026 — Villa Stark originale, GUI blanc par défaut

Architecture et paysage recréés : pierre gneiss, bois et zinc, volumes décalés, jardin jurassien. Quinze nouveaux visuels générés, ancien ensemble photographique et ancien plan raster retirés du public ; plan SVG et calques recalés sur 1672×941. GUI blanc par défaut (glacier, clé de préférence v2), logo officiel intégré, trois thèmes conservés. Recette : 24 combinaisons supports/thèmes/modes ajustés, neuf intérieurs, éclairages, stores, garage, couverture et interphone. Captures de fiche actualisées ; détails, limites et provenance : `docs/verification/2026-11-25-villa-stark-original/` et `public/showcases/villa-stark/SOURCE.md`. Aucun matériel modifié.

### 25 novembre 2026 — Villa Stark 2.3.19
La photographie plein fond remplace la mise en vignette du lot précédent. DeviceFrame commun restauré, ancrage gauche conservé. Logo sans cartouche adapté aux thèmes via filtres SVG. Stores smartphone : grille deux colonnes sans superposition ; sélection des pièces d'éclairage sans état persistant. Molette sur fond = extérieur/dernière pièce, sélection GUI = intérieur ; dézoom sans changer les commandes. Interphone : animation SVG du portail et état synchronisé, fermeture automatique. Visiteur et Bonjour retirés visuellement. Pause commune de démo : 120 s après dernière interaction, conservée entre supports/projets ; délai initial inchangé. Voir docs/verification/2026-11-25-villa-stark-unified/README.md pour preuves et limites de recette. Aucun matériel modifié.

### 25 novembre 2026 — Villa Stark 2.3.20, portail
Remplace le passage SVG de 2.3.19 par camera-gate-open-v2.webp, imagegen intégré, utilisée uniquement dans l'ouverture x721..976/y360..623. Décor original conservé. Vantail texturé dans foreignObject SVG avec rotation Y 0 à -88°, perspective 650 px, durée 3,2 s. Fermeture automatique conservée. Preuves, limites et prompt dans docs/verification/2026-11-25-villa-stark-gate-v2/.

### 25 novembre 2026 — Villa Stark 2.3.21, musique
renderMusic utilise S.musicRoom et les objets S.music existants : six boutons, select des dix pièces, range volume. Ne pas réintroduire le tableau par zone. Changement de pièce : enterRoom(id,false), page MUSIQUE conservée. Source rétablit le son ; arrêt limité à la pièce courante ; volume oninput publie sans reconstruire le DOM. Recette ciblée 24 combinaisons et indépendance des zones : docs/verification/2026-11-25-villa-stark-music/.

### 25 novembre 2026 — Villa Stark 2.3.22
Styles locaux : flèche stage clampée, scrollbar workspace invisible mais scroll conservé. ROOM_ICONS commun à renderPlan light/clim, floor-plan.svg ne garde que les contours. Stores en grille avec icônes SVG séparées du texte et dimensions égales. tv-broadcast.js utilise directement createTVStage de Villa FTV, renderer lazy 640x360/15fps, uniquement vue intérieure ; routes TV par pièce et cadrage cover. Badges TV et flammes extérieurs masqués. circuits.rgbw actif uniquement Pool ; pas de teinte globale, spots SVG localisés. Voir docs/verification/2026-11-25-villa-stark-refinements/README.md pour tests et limites.

### 25 novembre 2026 — Villa Stark 2.3.23

Bouton « Intrusion terrasse » retiré des outils de simulation et de la page autonome. Gestionnaire correspondant retiré ; les commandes de sécurité du GUI restent disponibles. Fiche explicative mise à jour dans les trois langues.

### 25 novembre 2026 — Villa Stark 2.3.24

Stores de la pièce sélectionnée : bateau et blackout indépendants, montée / arrêt / descente, positions persistées et synchronisées entre le GUI et le fond. Recalage des baies sur la photo avec compensation du recadrage cover, perspective et silhouettes de premier plan. Le cinéma ne présente pas de faux store sur sa photo sans fenêtre.

Éclairage intérieur : variation globale de la photo retirée ; circuits nommés selon les luminaires visibles, sources et retombées lumineuses localisées dans lighting-scene.js. Les sources de lumière extérieures et le contenu TV sont préservés. Les spots blancs de terrasse et de bassin partagent les points physiques RGBW de la piscine.

TV : arrêt transparent et homographie sur quatre coins de la TV salon / cinéma. Recette et limites du rendu photographique : docs/verification/2026-11-25-villa-stark-realism/.
### 26 novembre 2026 — Villa Stark 2.3.25
Stores intérieurs reconstruits par vitrage dans shade-scene.js : limites de la baie en coordonnées photo, montants conservés, ourlet et plis interpolés dans le plan de la fenêtre. Salle à manger recalée sur les vitrages avec détourage de la suspension et du mobilier. Blackout textile taupe lisse ; store bateau avec paquet de plis à la remontée. Course complète 6,5 secondes, accélération/décélération et pas de position 0,1 %. Arrêt conserve la position synchronisée. Aucun changement des commandes ni du format GUI. Recette et limites : docs/verification/2026-11-26-stores/.
### 26 novembre 2026 — Villa Stark 2.3.26
Menus de pièces : options natives avec fond clair opaque / texte foncé, sélection bleue, règles communes Stores et Musique, couleurs système en contraste forcé. Aperçus des stores : position relative pour contenir le tissu dans sa miniature. Suite parentale : détourage du bouquet, vase, bougie et mobilier en coordonnées photo, remplacement des grands polygones à l'origine du trou dans la toile. Entrée : bas gauche de toile recalé sur le seuil (1449,756), extrémité droite (1671,831) dans la photo de référence. Version TV inchangée : attente d'une vidéo existante.
### 26 novembre 2026 — Villa Stark 2.3.27
Le programme « film » (train 3D) est remplacé uniquement dans Villa Stark par la vidéo Runway existante de présentatrice, retrouvée dans FTV_RESIDENTIEL/04_GENERATIONS/Video Gen4.5. Clip original 1280 × 720, 24 i/s, 5,04 s, 1,25 Mo, sans piste audio. Boucle muette locale, poster issu du premier cadre ; projection sur les quatre coins photographiques inchangée. Lecture à 24 mises à jour/s, pause/reprise du GUI opérationnelles. Vidéo arrêtée lorsque la TV s'éteint, change de programme, quitte la pièce ou passe en arrière-plan ; WebGL des sports chargé à la demande. Aucune nouvelle génération ni appel distant pendant la lecture. Football et automobile conservés. Recette : docs/verification/2026-11-26-journal-tv/.
### 26 novembre 2026 — Villa Stark 2.3.28
Stores : repères photo par vitrage pour bureau, fitness et salon ; prolongement du rail hors image au lieu de l'aplatir sur le bord supérieur. Projection homographique des ourlets et des plis pendant la course. Remplacement des grands masques par les contours du fauteuil et des appareils de fitness. Piscine : roue HSV tactile et clavier (flèches, Début/Fin ; Page précédente/suivante pour la saturation), blanc et arrêt séparés, intensité RGBW synchronisée. Couleurs personnalisées hexadécimales dans l'état partagé, sans coloration de toute la photo. Page piscine en grille adaptée aux quatre châssis, sans scroll supplémentaire. Luminaires : suppression générale des cœurs opaques et traits noirs approximatifs ; entrée recalée sur le verre des suspensions et les lèvres lumineuses des marches, retombées douces conservées. Démo : compte à rebours en flux dans la colonne d'outils de Showcase, avant les boutons de châssis, et non superposé au GUI. Voir docs/verification/2026-11-26-perspective/ pour recette et limites.

### 26 novembre 2026 — Villa Stark 2.3.30
Suite parentale et chambre d’amis : le second moteur est un rideau latéral, gardant la clé d’état blackout pour préserver la synchronisation et les scénarios existants. Commandes rondes ouvrir/arrêter/fermer, aperçu de vitrage à plis verticaux. Déploiement dans le fond photographique par bandes de tissu prélevées sur le rideau réel (sans lampe ni mobilier), rail et bas projetés dans le plan de la baie ; premier plan préservé. La vue extérieure suit aussi la course latérale. Les autres pièces conservent leurs stores verticaux.
Cheminée : déformation sinusoïdale de la photo supprimée. Vidéo filmée de Matthew Twin / Pexels, 5 s, muette, recadrée et intégrée par fusion lumineuse dans le foyer. Crédit et licence dans assets/video/fireplace-CREDITS.txt. Fondu de boucle et contours doux. Pause hors salon/onglet caché et mouvement réduit conservés. Recette ciblée : docs/verification/2026-11-26-rideaux-feu/.

### 26 novembre 2026 — Villa Stark 2.3.31
Feu : nouveau fichier fireplace-calm.mp4 limité au début du plan, avant l’arrivée du bras. Boucle vérifiée par une planche de tous les passages (8 images/s), durée 1,5 s. Hauteur des flammes ramenée à 58 %, intensité de fusion à 62 %, base du feu conservée au niveau des galets.
Éclairage : suppression des ellipses sombres de toutes les pièces. Nouveau fixture-scene.js : extinction de 50 ouvertures de spots aux coordonnées photo exactes, reconstruction locale du bois autour de la source et petite collerette d’appareil éteint. Les niveaux intermédiaires suivent le même circuit que le GUI. Lampes des chambres, sous-face des suspensions et appliques du cinéma : atténuation de la texture photographique dans leur contour, sans silhouette peinte par-dessus. Halos d’appliques cinéma traités dans la texture du mur ; suspensions entrée utilisent leur propre verre photographique. Contrôle des dix pièces et limites du rendu photo : docs/verification/2026-11-26-spots-feu/.

### 26 novembre 2026 — Villa Stark 2.3.32
Feu : boucle de 30 s à 24 i/s, source réelle Merve Sezer / Pexels (crédit complété), ralentie à 56 % de la vitesse d’origine. Raccord de deux passages mobiles par fondu de 2 s, encodé dans le média ; suppression du fondu vers une première image figée. Écart fin/début contrôlé et situé dans l’amplitude normale des images successives. Pas de bras dans le plan sélectionné.
Spots : alpha strictement nul autour des raccords, transition elliptique douce, pas de copie opaque du rectangle photo. Préservation de la couleur ambiante de la collerette à partir du tableau source. Curseurs : poignée de 30 px dans une surface de 44 px, padding intérieur 7 px et ombre réduite, aux deux extrémités, tous châssis.
Salon LED : nouvel état photo room-Living-led-off-v1.webp créé par retouche des seules LED. led-scene.js extrait le champ d’éclairement et l’applique aux textures originales dans l’alcôve et la corniche ; détails et silhouettes stables. Canaux précis éteints, raccords doux, commande explicite LED étagères et corniche. Les autres circuits restent indépendants.
TV : Swisscom montre le journal Runway ; Apple TV montre un accueil tvOS simulé, avec sélection par les flèches et OK et retour MENU/TV. Une seule source sélectionnée dans le choix, indépendamment des appareils laissés sous tension. Projection vidéo rentrée de 1,2 % sur les quatre côtés pour conserver le cadre photo, notamment à gauche et en bas. Version du module TV mise à jour pour le cache. Recette : docs/verification/2026-11-26-boucle-spots-curseurs/.

### 27 novembre 2026 — Villa Stark 2.3.33
Ajout du septième spot du salon, juste au-dessus du mur en pierre : centre photo (824,185), demi-dimensions 3,5 × 1,5 pixels. Il utilise le même circuit spots, la même variation et le même raccord transparent que les autres appareils ; aucun nouveau masque global.
Le calque de radiance artificielle du circuit spots est supprimé dans toutes les pièces : à 100 % chaud, seule la photo d’origine est révélée, sans apparition d’un second halo. Le blanc froid est limité par découpe aux ouvertures et appareils photographiés, sans ajouter de source ailleurs.

### 27 novembre 2026 — Villa Stark 2.3.34
Le faisceau du spot (824,185) sur le mur en pierre suit le même groupe et la même opacité que son ouverture lumineuse. Nouvelle référence photo room-Living-stone-spot-off-v1.webp : retrait du seul faisceau, éclairage ambiant et autres sources conservés. Le moteur extrait un champ d’éclairement lissé pour le réappliquer à la photo d’origine ; pierres, joints, grain et silhouettes stables. Contour limité à la face en pierre, alpha progressif intérieur sans bord rectangulaire. Pleine intensité : photo source inchangée ; niveau nul : état ambiant sans ce faisceau.

### 27 novembre 2026 — Villa Stark 2.3.35
Transport lumineux photographique séparé pour les deux circuits des neuf autres pièces, piscine incluse : 18 références room-<pièce>-<circuit>-off-v1.webp. relight-scene.js extrait des gains, conserve les textures de la photo et combine les contributions de façon additive dans un filtre SVG GPU. Recouvrements plafonnés à 88 % de retrait pour préserver une ambiance lisible, cartes 836×471 et cache de deux pièces pour la mémoire mobile. Surfaces intérieures et reflets contrôlés, vues extérieures/écrans/bougies/pièces voisines protégés. Aucun halo synthétique ajouté. Suppression des anciens traits d'escalier et du second masque d'appliques cinéma. Libellés explicités : LED escalier et corniches ; Chevet gauche et corniche ; Appliques, corniche et plafond. Recette ciblée : neuf pièces × cinq états de circuits, quatre châssis × trois thèmes sur l'écran entrée, régression salon. Dossier docs/verification/2026-11-27-tous-circuits.

### 28 novembre 2026 — Villa Stark 2.3.36
Paysages Runway récupérés de la conversation du 27 novembre : salon, salle à manger, suite parentale et extérieur. Stabilisation sur le bâti, lecture silencieuse ralentie et fondu cyclique ; masque sur les vitrages/nature, mise en pause hors vue ou derrière une toile fermée. Les vidéos originales et intermédiaires restent locales. Sources et scripts reproductibles dans assets/video/landscape-sources.json et scripts/*stark-landscape*.
Rideaux : texture photographique construite une fois, seul le contour de déplacement est actualisé ; photo et miniature utilisent la même position décimale, coalescence des messages à 16 ms. Sens des flèches adapté au côté de repli. Vérifications détaillées dans docs/verification/2026-11-28-paysages/README.md.

### 28 novembre 2026 — Villa Stark 2.3.37
Vue extérieure : vent local sur les feuillages, fougères et graminées ; mouvement lent des nuages et de la brume, calé sur une boucle périodique sans déplacer le bâti. Masque étendu aux pointes des fougères près des marches. Écran du cinéma extérieur : présentatrice Runway existante, projection sur les quatre coins intérieurs de l’écran et conservation du cadre noir ; pause hors vue et à l’extinction générale.
Toutes les pièces vitrées disposent désormais d’une vidéo de végétation : Living, Dining, Kitchen, Office, Fitness, Entry, Master, Bedroom. Les trois prises Runway existantes sont conservées et complétées ; les cinq autres utilisent la photo originale avec déplacement local doux des feuillages. Les masques de vitrage et d’occultation du premier plan sont communs aux stores : ni les montants ni le mobilier ne sont animés. Cinema n’a pas de paysage visible depuis son intérieur ; Pool utilise la vue extérieure. Aucune nouvelle génération payante. Scripts reproductibles animate-stark-window-foliage.py et enhance-stark-exterior.py. Recette ciblée : docs/verification/2026-11-28-exterieur.
