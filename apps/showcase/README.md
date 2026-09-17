# Premier commit 19/7/2026 13h00

Perte de toutes les données la veille et première reconstitution des fichiers. 

Premiers tests sur Ecrans 21.5': dimensionnement des périphériques OK pour tous les projets et secteurs d'activités. 

Refaire les mêmes tests en mode plein écran

Refaire les mêmes tests sur écran 14.5'


# maj 19/7/2026 20h51

Ajout GUI pour tous les projets listés

Ajout photos dans les background de tous les GUI

Beaucoup de temps passé avec le bouton "Plein écran", encore à peaufiner

Résumé: suppréssion de presque toutes les grosses "incohérences graphiques", à part quelques petits détails: photos chalet, amérliorer les contrastes des textes sur certains GUI (Salle de conférence, ...)


# maj 5/9/2026 — Mode Démo Mobile iPhone/iPad (outil marketing)

Objectif : transformer le showcase en outil de démonstration pour l'équipe Marketing de Frequence TV, utilisable directement sur iPhone et iPad.

Nouveautés :

- **Mode démo mobile** : sur iPhone/iPad, le site ouvre automatiquement un launcher tactile (`/#demo`) listant les 11 interfaces. Chaque interface s'ouvre en **plein écran réel** (`/#demo/<id>`), sans cadre simulé — la version phone sur iPhone, la version tablette sur iPad (détection automatique, bascule manuelle possible via la pilule flottante qui se masque toute seule).
- Les projets CH5 réels (Villa Crans Montana) utilisent automatiquement `iphone.html` sur smartphone et `index.html` sur tablette.
- **PWA installable** : manifest + icônes + service worker. Sur iPad/iPhone : Partager → « Sur l'écran d'accueil » → l'outil se lance en plein écran comme une vraie app Crestron (icône « FTV Demos »).
- Corrections responsive : grille Boutique Hermès en 1 colonne sur smartphone, en-tête Chalet Zermatt compact, safe areas iOS (encoche / barre home), en-tête du launcher sur petits écrans.
- Le site desktop classique est inchangé (accessible via « Ouvrir le site complet » ou `/#site`).

Fichiers ajoutés : `src/components/DemoMode.jsx`, `src/demo.css`, `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`. Modifiés : `App.jsx`, `main.jsx`, `index.html`, `index.css`, `translations.js` (clés `demo_*` FR/EN).

À tester sur les vrais appareils : installation PWA, rotation iPad, Villa Crans Montana en portrait iPad (l'en-tête CH5 d'origine est un peu serré en portrait — prévoir la démo en paysage).


# maj 5/9/2026 (soir) — Fusion v2 marketing + mode démo mobile

Réparation du conflit entre les deux livraisons du jour (v2 « outil marketing » avec routeur/pages, et mode démo mobile iPhone/iPad) : le déploiement de l'après-midi plantait (« useRouter must be used within RouterProvider ») car `App.jsx`/`main.jsx` du mode démo avaient écrasé ceux de la v2.

- `App.jsx`, `main.jsx` et `index.html` reconstruits : RouterProvider + pages v2 (`/interfaces/...`, `/pourquoi-ch5`, `/contact`, `/fiche/:projet`, kiosque, toolbar QR/PDF) **et** mode démo mobile (`#demo`, `#demo/<id>`) + PWA + SEO/OG.
- `DemoMode.jsx` adapté à la v2 : icônes nommées (`src/icons.js`), simulateurs lazy-loadés, noms de projets multilingues (`getProjectName`), langues FR/EN/DE.
- Le `#demo` reste en hash-routing : compatible avec les rewrites Vercel, et la redirection mobile automatique ne s'applique qu'à la racine du site (les liens profonds partagés `/interfaces/...` ne sont pas détournés).
- Clés `demo_*` ajoutées en DE ; page 404 ajoutée.
- Vérifié par captures : desktop (accueil, showcase + toolbar, pourquoi-ch5, contact, fiche), iPhone (launcher démo, simulateurs, lien profond préservé). Build OK, bundle principal ~360 kB (code splitting v2 conservé).
- À surveiller : l'affichage du simulateur de la page `/interfaces` sur très petit écran (le mode démo `#demo` est la voie prévue sur mobile).


# maj 6/9/2026 — Publication de la fusion sur GitHub

- Vérification du dossier après la fusion v2 + mode démo : `App.jsx`/`main.jsx` cohérents (RouterProvider + `#demo`), build Vite OK (bundle principal ~360 kB), lint OK (seule erreur : fichier CH5 minifié dans `public/showcases`, non concerné).
- `vercel.json` : l'exclusion des rewrites visait `og-image.png` alors que le fichier est `og-image.jpg` — corrigé.
- `node_modules/` et `dist/` étaient encore suivis par git (5 296 fichiers) malgré le `.gitignore` — retirés de l'index.
- Commit `a3a8960` poussé sur `origin/main` (github.com/donafcna/Crestronshowcase).
- Déploiement : le projet Vercel `crestrongui` n'est pas connecté au repo et le déploiement CLI n'était pas possible depuis la session → à connecter dans le dashboard Vercel (Settings → Git → Connect Git Repository → `donafcna/Crestronshowcase`, branche `main`, framework Vite, output `dist`). Ensuite chaque push sur `main` déploiera la prod automatiquement.
- 6/9 (suite) : projet Vercel reconnecté au repo (Disconnect → Connect), premier déploiement Git `e6367e7` promu en production. Vérifié en prod : `/`, `/contact`, `/pourquoi-ch5`, `/fiche/chalet-zermatt` (rewrites SPA OK), `sw.js`, `manifest.webmanifest`, `sitemap.xml` (21 URLs). Désormais : push sur `main` = déploiement prod.

# maj 6/9/2026 (après-midi) — Châssis rognés + QR code

- **Châssis tablette / smartphone rognés en haut et en bas** : le CSS du stage v2 dimensionnait le boîtier via `var(--chassis-w/h)` que `DeviceFrame` ne définissait pas ; le boîtier prenait alors la taille de son contenu (écran + paddings frame + bezel = 1457 × 1113 au lieu de 1408 × 1064 pour la tablette) et débordait du stage à l'échelle calculée. Correctif : `DeviceFrame` expose `--chassis-w/h`, le boîtier est en `box-sizing: border-box` sans padding, le bezel est un simple fond absolu et l'écran est centré en absolu à sa résolution native. Mesuré en prod : boîtier = taille de conception, 0 px rogné, marge de 12 px autour.
- **QR code** : il encodait la page du site (`/interfaces/...`, châssis simulé). Il cible maintenant le mode démo `/#demo/<projet>` : sur iPhone/iPad l'interface s'ouvre en plein écran réel, version phone ou tablette détectée automatiquement. Le bouton « Copier le lien » garde l'URL de la page du site.

# maj 6/9/2026 (soir) — Villa Crans-Montana 100 % front-end, boîtiers iPhone / iPad réalistes

- **Villa Crans-Montana (projet CH5 réel, `public/showcases/villa-gemini-frequencetv/`)** : plus aucun lien avec le programme C# / processeur CP4. Supprimés : `js/webxpanel.js`, la connexion WebXPanel / IP-ID, l'indicateur Online/Offline, la console d'administration (moniteur de joins, terminal CP4, infos CPZ/CH5Z, date de validation), le logger console vers le join 100, `admin_monitors` de `config.js` / `config.json`. Nouveau `js/local-feedback.js` : moteur d'état local (pièces avec valeurs propres, scènes qui règlent les circuits, sources, volume, mute, alarme, thermostat ± avec dérive lente de la température mesurée, moteurs momentanés) branché sur le pont interne des composants CH5 (`Ch5SignalBridge.prototype.publish/send*ToNative` → moteur ; `bridgeReceive*FromNative` ← moteur). `index.html` et `iphone.html` n'appellent plus `CrComLib` ; l'ancien `frontend-feedback.js` (qui ne fonctionnait pas : `CrComLib.publishEvent` n'est pas réassignable) est supprimé. Testé sous Playwright : pièces, scènes, sources, volume/circuits (glisser), mute, alarme, consigne, iPhone (select pièce, scènes, sources).
- **Boîtiers iPhone / iPad (`DeviceFrame`, `devices.js`, `index.css`)** : proportions réelles (iPhone 16 Pro 450 × 940 pour un écran 402 × 874 ; iPad Pro 13" 1466 × 1122 pour 1376 × 1032), corps titane avec bords, coins d'écran arrondis, Dynamic Island, caméra, boutons latéraux, barre d'état iOS/iPadOS avec heure réelle + réseau + batterie, indicateur home. La GUI occupe la zone hors « safe area » (59/34 pt sur iPhone, 24/20 pt sur iPad) exactement comme en mode démo plein écran sur un vrai appareil. Marge de 28 px autour du boîtier : plus rien de rogné.

# maj 6/9/2026 (nuit) — 4 nouvelles interfaces, plein écran réparé, Xpanel Palace Genève

- **4 nouveaux simulateurs** inspirés du showcase AVstudio (chacun avec son CSS dans `src/components/simulators/`, FR/EN/DE, versions dalle/tablette/smartphone, feedback 100 % local) :
  - `home-cinema-cologny` — Home Cinéma Cologny (résidentiel) : activités en un appui, projecteur avec préchauffage, masquage 16:9 / 2.39, 4 zones d'éclairage, molette de volume Atmos, sièges motorisés.
  - `huddle-room-nyon` — Huddle Room Nyon (salle de réunion) : thème clair, agenda calé sur l'heure réelle, « Rejoindre » one-touch (Teams/Zoom/Meet), AirMedia avec code, caméra auto-framing, réservation, occupation/CO2.
  - `suite-palace-montreux` — Suite Palace Montreux (hôtellerie) : sélecteur de langue intégré (FR/EN/DE/IT/ES/JA), accueil au nom du client (`?client=`), ambiances, DND / faire la chambre / majordome, climat, rideaux, TV/musique, services.
  - `appartement-eaux-vives` — Appartement Eaux-Vives (résidentiel) : pièces, 7 scènes avec programme hebdomadaire éditable (heure ± 15 min, jours, actif), climat par zone, stores position + lamelles, énergie solaire.
  - Ajouts : entrées `projects.js`, maps SIMULATORS (`Showcase.jsx`, `DemoMode.jsx`), 33 icônes Lucide dans `icons.js`. Le launcher `#demo` et le sitemap les reprennent automatiquement.
- **Boîtiers** : 6 % d'air garanti autour du boîtier (`useFitScale` `margin`), stage en `overflow: visible` (ombres et boutons latéraux jamais coupés).
- **Plein écran réparé** : les règles génériques `position: relative / height: 100% !important` écrasaient le mode `.fullscreen-mode` (qui n'était donc pas plein écran). Désormais fixé sur tout l'écran, avec la place réservée au logo Fréquence TV et au sélecteur de support.
- **Palace 5* Genève sur PC / Xpanel** : l'écran du navigateur simulé était à 0 px de haut (règle `height: auto !important` ajoutée le matin) → GUI invisible. Corrigé.

# maj 6/9/2026 (nuit, suite) — Villa Crans-Montana v1.0.149, bouton TSW-1080 retiré

- **Villa Crans-Montana mise à jour depuis `C:\Users\donat\Desktop\VillaCrans\src` (v1.0.149, 21/7/2026)** : 15 pièces, 5 sources (dont Musique) avec logos, alarme à 4 partitions avec code, caméras, contrôle global (presets éclairage / CVC / stores), lecteur média, thèmes, `roomCircuits` par pièce. Même traitement que le matin : plus aucun lien avec le programme C# / CP4 (WebXPanel, IP-ID, indicateur de connexion, console admin, terminal, logger join 100 supprimés), `local-feedback.js` étendu aux nouveaux signaux (200 extinction, 201/202 mute et volume, 301-312 partitions, 401-411 presets globaux, modes CVC 403-409 avec consigne, 155 Musique).
- Deux bugs de la source d'origine corrigés au passage : (1) `iphone.html` avait un bloc de traductions russes tronqué (`source_video: "А…`) qui rendait tout le script iPhone invalide (SyntaxError) — reconstruit ; (2) les overlays « Circuits » et « Moteurs » de l'iPhone étaient en `display: flex` inline donc ouverts au chargement — masqués par défaut, ouverts en flex.
- Collision de numéros dans le projet d'origine : les pièces 11-15 émettaient 21-25, comme les scènes 21-24 (sélectionner « Piscine & Spa » allumait « Cinéma »). Dans la copie showcase, les boutons de pièce 11-15 utilisent 121-125.
- **Bouton « Dalle TSW-1080 » retiré** de tous les projets (`crestron_1080` retiré des listes `devices`) : la page `/…/wallpanel_hd` redirige vers le support par défaut et disparaît du sitemap.
- (suite) **Bandeau de sélection des projets** : les cartes défilaient horizontalement sans barre visible → le 6e projet (Appartement Eaux-Vives) était invisible ; les cartes sont compactées et passent à la ligne si besoin. La carte dépliée (« + ») débordait du bandeau (hauteur fixe) : pastilles et description sur une ligne, bandeau en hauteur automatique.
- **Service worker** : `/showcases/` passait en cache-first → un ancien `config.js` / `local-feedback.js` en cache avec le nouveau HTML (valeurs CVC vides sur Villa Crans-Montana après mise à jour). Désormais réseau d'abord pour `/showcases/`, cache renommé `ftv-showcase-v2` (purge automatique). Si une page semble ancienne : recharger une fois.


# maj 6/9/2026 — retrait de la page « Pourquoi le CH5 ? »

Page, entrée de navigation (desktop + mobile), boutons du dashboard, route `/pourquoi-ch5`, entrée du sitemap et styles `why-*` retirés. Le fichier `src/pages/WhyCH5.jsx` est déplacé dans `_to_delete/` (à supprimer).


# maj 6/9/2026 — démo automatique des GUI

- « Présentation » devient une **démo automatique** : sur PC (pointeur souris, écran ≥ 900 px) elle démarre seule à l'affichage d'un GUI. Un curseur animé (`DemoOverlay.jsx`) presse les boutons, glisse les curseurs, change de pièce (liste de navigation détectée dans le DOM), puis passe au support / projet suivant. Moteur générique dans `src/hooks/useAutoDemo.js` (fonctionne aussi dans l'iframe CH5 réelle : `ch5-button`, `onclick`). Timings dans `TIMING` (≈ 2 s par action, 2,4 s après un changement de pièce, 4–6 actions par pièce, 6 pièces max).
- Toute action réelle de l'utilisateur (`isTrusted`) ou un appui sur « Présentation » met la démo en pause ; chronomètre circulaire « Reprise de la démo dans X secondes » (10 s d'inactivité, `IDLE_RESUME_MS`), clic dessus = reprise immédiate. Mobile/tablette : inactive par défaut. `?kiosk=1` = plein écran + démo.
- L'ancien défilement fixe (7 s par support) est supprimé.
- À savoir : la Villa Crans-Montana appelle `window.playAudioDemo` / `window.openWeatherWebsite` qui n'existent pas dans l'export 100 % front-end (erreurs console préexistantes, déclenchées aussi par la démo).

# maj 6/9/2026 (soir) — correctifs démo automatique

- Villa Crans-Montana : la démo n'attendait que 10 s le chargement de l'iframe CH5 (plusieurs Mo de bibliothèque/thèmes/polices) et exigeait `readyState === "complete"` ; en ligne elle abandonnait avant que l'interface soit prête (pas de curseur, passage direct au support suivant). Désormais : attente jusqu'à 45 s, dès que le document est interactif et qu'au moins 3 boutons sont détectés.
- `local-feedback.js` : ajout de `window.playAudioDemo` (joue `funny.mp3` via `playFunnySound`) et `window.openWeatherWebsite` (ouvre MétéoSuisse sur un vrai clic seulement, jamais pendant la démo) → plus d'erreurs console.
- Service worker : cache `ftv-showcase-v3` (purge les anciens caches à la prochaine visite).
- Dossier `_to_delete/` supprimé.

# maj 7/9/2026 — précision du curseur de démo et faders

- Le curseur était décalé : rendu dans `.showcase-container` dont l'animation `fade-in` laisse un `transform`, ce qui fait de `position: fixed` une position relative au conteneur. Curseur et chronomètre sont maintenant rendus dans `<body>` via un portail React (`DemoOverlay.jsx`).
- Cible exacte : pour un `<input type="range">` le curseur vise le thumb (position calculée depuis la valeur, largeur de thumb ≈ 18 px sur piste fine), pour un `<ch5-slider>` la poignée noUiSlider.
- Faders : appui + maintien (260 ms, curseur « enfoncé ») puis glissement progressif (1 s) jusqu'à la nouvelle valeur — `input`/`change` pour React, vrai `mousedown/mousemove/mouseup` sur la poignée pour noUiSlider. Les pistes fines (3 px) sont désormais détectées (elles étaient filtrées par la taille minimale).
- Chaque pièce montre en priorité un fader s'il y en a un ; la liste des cibles est recalculée avant chaque action (fenêtres modales, changements d'onglet).

# maj 6/9/2026 — trois interfaces « thèmes » issues du mood board

- Trois nouveaux simulateurs (concepts) déclinant les trois directions validées sur le canevas de maquettes : **Villa Léman** (résidentiel, thème Obsidienne — anthracite, accent cyan, capitales condensées Barlow, cadran circulaire, tuiles photo par étage), **Siège Lakeside Nyon** (salle de réunion, thème Atelier clair — cartes blanches sur gris chaud, Outfit, cadran dégradé ; accueil, salles, présentation, visio, agenda) et **Appartement Carouge** (résidentiel, thème Spectre — une couleur par système, Sora/Rubik ; médias, éclairage, climat, stores, accès, routines).
- Fichiers : `src/components/simulators/{VillaLeman,SiegeNyon,AppartementCarouge}.jsx` + CSS ; entrées ajoutées dans `projects.js`, `Showcase.jsx` et `DemoMode.jsx`. Dalle TSW-1070/1080, tablette et smartphone, FR/EN/DE, compatibles démo automatique (`data-demo-nav` sur les sélecteurs de pièces).
- Polices Google chargées par un hook `useFonts` (balise `<link>` injectée) et non par `@import` CSS : un `@import` bloqué faisait échouer le chargement du chunk CSS lazy et laissait l'interface vide.
- À faire : remplacer les emplacements « Photo · … » et les vignettes Unsplash par des médias Fréquence TV.


# maj 7/9/2026 — FTV Home (ex « Crestron Home ») refondu à partir des captures de l'app Crestron Home OS

Refonte complète du simulateur `crestron-home`, à partir de 67 captures d'écran de
l'application Crestron Home OS 4.11.4 prises sur iPhone et iPad (dossier
`Downloads/iCloud Photos from Donatien Peigne`).

**Renommé « FTV Home »** dans `projects.js`. L'identifiant reste `crestron-home` :
les liens déjà partagés (`/interfaces/residentiel/crestron-home/...`) continuent de
fonctionner. Le client devient « Interface résidentielle Fréquence TV » et les textes
FR/EN/DE ont été réécrits en conséquence.

**Parti pris : réinterprétation, pas copie.** Structure et parcours repris de
l'application de référence (accueil « scènes + contrôles », pièces filtrées par étage,
détail de pièce par services, feuilles de pilotage), mais palette, typographie et
détails graphiques aux couleurs Fréquence TV — violet de marque `#6d3bf5`, cyan
d'appui `#1ea7d6`, ambre `#e8a317` pour l'éclairage, typo Outfit. Aucun logo ni nom
de service tiers.

**Nouveaux fichiers**
- `src/components/simulators/crestronHome.css` — feuille dédiée, tout est préfixé
  `ch-` sous la racine `.ch-home` (les anciennes règles `crestron-home-*` de
  `index.css` deviennent mortes, à purger un jour).
- `src/data/crestronHomeUi.js` — dictionnaire FR/EN/DE du simulateur.
  `src/data/crestronHomeTranslations.js` n'est plus importé (fichier minifié à 8
  langues, dont 5 non exposées par le site).

**Écrans couverts** — accueil (héro + 4 scènes + contrôles Lumières / Musique /
Occultants / Thermostat / Accès / Piscine / Spa), pièces (chips Toutes / Favoris /
étages, groupes repliables, cartes photo avec pastilles d'état et favori), détail de
pièce (Actions + Des services), et six feuilles : Lumières (maître + gradateurs +
interrupteurs), Occultants (position au %, Monter/Stop/Descendre), Thermostat
(cadran dégradé, consigne, mode / ventilateur / planification, hygrométrie), Vidéo
(écrans + sources + grille de chaînes), Musique (services, favoris, lecteur, volume),
Réglages (thème clair/sombre, contrôles et pièces affichés). Mini-lecteur persistant
au-dessus de la barre d'onglets.

**Quatre gabarits, un seul composant** — `deviceType` pilote les variantes :
`phone` 402×781, `tablet` 1376×988, `wallpanel` 1280×800 (dalle TSW-1070) et
`desktop` 1920×1080. Sur la dalle : pas de barre d'état iOS mais un bandeau
heure / maison / modèle, rythme vertical resserré pour tenir dans 800 px sans
défiler, et cibles tactiles élargies (48 px). Les feuilles s'ouvrent en bas sur
téléphone, en modale centrée sur tablette / dalle / Xpanel.

À faire : purger les règles `crestron-home-*` orphelines dans `index.css`, et
remplacer les vignettes Unsplash par des photos Fréquence TV (TODO déjà listé).

# maj 7/9/2026 — Villa Crans-Montana mise à jour en v1.0.165 (contrat de joins v2)

- **Villa Crans-Montana** (`public/showcases/villa-gemini-frequencetv/`) synchronisée avec `C:\Users\donat\Desktop\VillaCrans\src` (v1.0.165, sources du 6/9/2026) : menu des pièces généré depuis `villa_config.js` (icônes, 15 pièces, pages spéciales Jeux / Animation), contrat de joins v2 (`Piece.Select` 11-40, scènes 51-54, mute 55, consigne 49/50, easter egg météo 56, scènes de stores 201-204), redirection smartphone → `iphone.html` étendue à Android, réglages, thèmes, alarme 4 partitions, contrôle global.
- Nouveau script **`scripts/sync-villa-crans.py <dossier src VillaCrans>`** : copie `index.html` / `iphone.html` / `version.js` / `build_date.json`, remplace `js/webxpanel.js` par `js/local-feedback.js`, masque l'indicateur Online/Offline (`#connection-status`), neutralise la console d'administration (`openAdminModal`), et génère un `villa_config.json/.js` « vitrine » : le fichier de développement contient des noms de test (pièces, scènes, sources) qui ne doivent jamais apparaître sur le site public → pièces / scènes / sources remplacées par les noms de démonstration, traductions purgées, tous les pilotages actifs, widgets météo + bandeau affichés, page « Vidéo » (YouTube autoplay) désactivée.
- `js/local-feedback.js` réécrit pour le contrat v2 (maintenu à la main, jamais écrasé par le script) : sélection de pièce par l'analogique 10 (`Piece.Active`) ou les digitaux 11-40, feedback `receiveStateSelected` des pièces, niveau master 21, consigne ×10 (31), presets CVC globaux 407-409 appliqués à toutes les pièces, mode éco éclairage 403, mode vacances 410/411, scènes de stores, mute resynchronisé (le bouton mute du GUI émet à la fois l'impulsion `<ch5-button>` et `publishEvent(55)` / `publishEvent(201)`). Sériels 99/101/102/104 alimentés pour la page Réglages.
- Deux bugs de la **source** VillaCrans contournés dans la copie vitrine (à corriger dans le projet) : `iphone.html` dictionnaire `ru` tronqué (chaîne non terminée → tout le script métier iPhone rejeté, cf. audit du 2/9) ; panneaux `circuits/motors/cameras/global-control-overlay` posés en `display: flex` dans le HTML donc ouverts au chargement.
- Points relevés dans le GUI (non modifiés) : `sendPowerOff()` publie encore le digital 50 (= `CVC.ConsigneMoins` en v2) et `toggleMute()` le digital 201 (= `Stores.Scene 1` en v2) ; le moteur local les ignore quand ils accompagnent 200 / 55.
- `user_original_html.txt` (extrait de conversation de juillet, 84 Ko, publié sur le site) supprimé.
- Testé sous Playwright (build de production) : wallpanel, tablette, smartphone, démo automatique (curseur, changement de pièce, consigne), `#demo/villa-gemini-frequencetv` mobile, `iphone.html` (liste des pièces, changement de pièce, panneaux fermés).

# maj 9/9/2026 — Villa Crans-Montana : retours de la direction (Antoine)

Corrections demandées après la revue de l'interface par Antoine Dändliker (e-mail du 9/9/2026, 16h54), appliquées à la copie embarquée `public/showcases/villa-gemini-frequencetv/` **et** au projet source VillaCrans (`src/index.html`, `src/iphone.html`, `villa_config.json`) :

- **Scènes fonctionnelles en mode démo** : chaque scène d'éclairage mémorise les niveaux des circuits **et** les positions des stores (appui long ≈ 1,2 s sur une scène, ou bouton 💾 dans la fenêtre Circuits), les restitue visuellement au rappel (curseurs + icônes de stores), avec confirmation à l'enregistrement (« Scène « REPAS » enregistrée ») et au rappel (« … rappelée »). Un point vert marque les scènes mémorisées. Stockage `localStorage` (`villa_scene_<pièce>_<scène>`), lu aussi par le moteur de démo `js/local-feedback.js`.
- **Premier appui sur une source** = activation + ouverture immédiate de la télécommande correspondante (Musique → lecteur média). Les overlays télécommande / lecteur média, absents de la copie showcase, ont été réinjectés depuis le GUI source. Les événements synthétiques de la démo automatique n'ouvrent pas la télécommande.
- **Fil d'actualités supprimé** (Le Monde / BBC RSS + bandeau défilant) → bandeau statique « État de la villa » : alarme, portes, source active, température → consigne, consommation, état du processeur, version. Le widget météo reste affiché en permanence (plus d'alternance).
- **Majuscules uniformisées** (sentence case) : « Salle à manger », « Suite parentale », « Suite invités », « Contrôle global », « Mode actif », « Consigne demandée »… dans les libellés HTML, les 5 dictionnaires et les configurations.
- **Traductions** : 32 nouvelles clés (boutons d'entête, télécommande, sécurité, contrôle global, bandeau d'état, confirmations de scène) en FR/EN/ES/DE/RU ; `active_piece` russe corrigé ; dictionnaire russe tronqué de `iphone.html` réparé (bug qui invalidait tout le script du GUI iPhone dans le projet source).

Fichiers : `index.html`, `iphone.html`, `config.js`/`config.json`, `js/local-feedback.js` (scènes mémorisées, sériels 111/112 « portes » / « conso » pour la démo).

# maj 9/9/2026 (soir) — Villa Crans-Montana : sync v1.0.166 depuis VillaCrans/src

- Copie vitrine régénérée par `scripts/sync-villa-crans.py` depuis `C:\Users\donat\Desktop\VillaCrans\src` (source de vérité, contrat de joins v2) : retours de la direction du 9/9 **et** logique audio/vidéo v1.0.166 (télécommandes complètes Apple TV / Sky Q / Swisscom TV / IPTV ; la Musique joue sur les haut-parleurs en gardant la vidéo à l'écran, confirmation « garder la musique / audio de la vidéo », join 156 = retour audio vidéo).
- Le script pose `meta.mode = "showcase"` dans le `villa_config` vitrine ; `js/local-feedback.js` refuse de démarrer si ce drapeau n'est pas là (copié par erreur sur un CP4, il reste inerte).
- `js/local-feedback.js` (contrat v2) : scènes mémorisées `localStorage` (`villa_scene_<pièce>_<1..4>`), plus de désélection d'une scène quand un curseur renvoie la même valeur, sériels 111/112 (portes / conso) pour le bandeau « État de la villa », Musique (155) hors interlock vidéo (151-154), join 156.
- Contournements du 7/9 devenus inutiles (dictionnaire `ru`, overlays `display: flex`) : conservés dans le script, inactifs sur la source corrigée.

# maj 10/9/2026 — supports, Crestron Home, Chalet Zermatt, Home Cinéma, son Villa

- Supports : ordre fixe pour tous les projets — Dalle TSW-1070, Dalle TSW-1080, PC / Xpanel, Tablette, Smartphone (`VIEWPORT_ORDER`, `Showcase.jsx`) ; support ouvert par défaut et enchaînement de la démo dans ce même ordre.
- Crestron Home : la remise à zéro `.ch-home button { padding: 0 }` l'emportait sur les paddings des classes (textes et icônes collés au bord gauche) → `:where(button)` ; tailles de texte augmentées (corps 0,98 → 1,18 rem sur tablette / PC, 0,95 → 1,15 rem sur dalle, 0,9 → 1 rem sur téléphone ; petits textes et titres de section à l'avenant).
- Chalet Zermatt : icône « Volets & Ombrage » (`fa-blinds` n'existe pas dans Font Awesome 6) → `fa-bars-staggered` ; sélecteur de support flottant (XPanel / iPad / TS-1070 / Smartphone) retiré, le support est choisi dans la vitrine.
- Home Cinéma Cologny : toutes les tailles de texte × 1,2 (`homeCinema.css`).
- Villa Crans-Montana : son caché retiré (`playFunnySound` / `playSynthSound`, balise audio, `onclick` du titre source, compteur 3 clics du widget météo, `playAudioDemo` inerte, `funny.mp3` supprimé).
- Villa Léman : photos de pièces (Unsplash) en fond des tuiles de pièces (`photo` dans `ROOMS`, calque `.vl-tile-img` + dégradé), placeholder « Photo · … » retiré ; textes du rail de navigation agrandis (10,5 → 13 px).
- Supports : le bouton TSW-1080 n'est plus proposé sur aucun projet (gabarit conservé dans `devices`) ; libellé « Dalle TSW-1070 » → « Dalle TSW ».
- Appartement Carouge : textes du menu latéral 13 → 16 px, icônes 18 → 21 px.
- Palace Genève (Connect Dashboard) : boutons, textes et panneaux agrandis d'un bloc — `zoom` 1,35 sur la racine `.hotel-geneva-dashboard` (1,5 sur Xpanel), fin d'`index.css`.

# maj 16/9/2026 — reprise Codex du fond 3D

- Smartphone à gauche également en **Mode Scène** ; bouton d'angle repositionné et caméra cadrée dans l'espace libre entre le boîtier et la colonne de droite.
- Molette sur le décor : vers le bas, vue globale ; vers le haut, dernière pièce sélectionnée. Les commandes continuent de cibler la pièce choisie en vue globale. Les gestes dans la GUI, la colonne de droite et Ctrl/Cmd + molette sont préservés.
- Parquet texturé, textiles, rideaux plissés, mobilier/accessoires différenciés, éclairages variés, enceintes encastrées/surround, thermostats et claviers muraux détaillés. Terrain continu avec neige intégrée, jardin, cheminement et feuillage instancié. Caméra stable au repos.
- Surfaces statiques regroupées, ombre calculée à la demande, résolution adaptée aux performances, imports versionnés et ressources libérées à la sortie. Trois textures WebP CC0 ajoutées : 111 Ko. La 3D reste un fond de showcase réservé à la règle Smartphone existante ; aucune édition des GUI CH5 générées.
- Suppression de l'enregistrement de `/sw.js`, inexistant. Exclusion des bibliothèques tierces minifiées du lint, maintien de l'analyse du code applicatif.
- Conception, limites et tests : `docs/plan3d.md`. Point de départ réversible : `571f7c76`. Aucune compilation ni publication matérielle CH5/CP4/TSW dans ce lot.

# maj 16/9/2026 — obscurité, façades et navigation 3D

- OFF coupe réellement les lampes du plan, y compris après changement de pièce ou avec un ancien preset OFF mémorisé. Relecture des niveaux identiques non réémis ; TV à faible halo local, extinction de la lumière ambiante lorsque toutes les occultations sont fermées.
- Vues des pièces rapprochées ; transitions continues depuis la pose courante, y compris lors de sélections rapides et depuis la vue globale.
- Façades complètes en vue globale. Premier clic : ouverture du plan ; clic dans une pièce : zoom et sélection de cette pièce dans le Smartphone. Au zoom, disparition des façades avant le mouvement ; au dézoom, retour des façades après le trajet. Les étages éclatés sont conservés.
- Home cinéma réorganisé : écran sur mur plein, fenêtre/volet/store/rideaux sur mur latéral ; commandes et acoustique déplacées ; éclairage périphérique sans rail masquant l'écran dans la projection.
- Aucun changement des fichiers GUI, du contrat de joins, ni des règles de supports 3D. Version du moteur `2026-09-16-atlas-2`, référence précédente `5a54237f`. Tests supplémentaires : `scripts/test-plan3d-navigation.cjs`.

# maj 16/9/2026 — villa assemblée et retours du contrôle global

- Vue dézoomée : villa alpine contemporaine assemblée, parements en pierre et bois, baies, balcons, toitures/terrasses, bannes, pergola, jardin, sculpture, bassin, ruisseau/passerelle, clôture et caméras. Trois textures WebP CC0 ajoutées, 37,7 Ko. Enveloppe regroupée, intérieurs simplifiés en vue éclatée, ombres mises en cache.
- Séquence d'entrée : retrait enveloppe/toitures, séparation des étages, zoom pièce. Le retour réassemble la villa ; entre pièces, caméra directe depuis sa pose actuelle. Clic plan → sélection du Smartphone conservé. Version moteur `2026-09-16-estate-1`.
- Complément demandé pendant le lot : fondu linéaire des éclairages 3D sur 3 secondes, avec reprise au niveau affiché si la scène change en cours de variation. Halos et éclairage indirect suivent le fondu ; retours des boutons immédiats, valeurs et temporisations du CH5 matériel inchangées.
- Demande GUI supplémentaire de Donatien : correction dans `projects/villa-crans/ch5/src`, version **1.0.178**, puis synchronisation. Smartphone : joins de retour natifs ajoutés aux commandes globales ; dalle/tablette : suppression du sélecteur CSS `[selected]` qui allumait aussi `selected="false"`. Couleurs et libellés communs via `themes/global-controls.css`, gris au repos et vert sélectionné, contraste ≥4:1, commandes ≥44 px. Aucun état DOM simulé dans la source de déploiement.
- Feedback local : interlocks éclairage/CVC/vacances, stores globaux mémorisés comme commande reçue et désélectionnés après action individuelle. Les changements individuels d'éclairage/CVC retirent un retour global devenu inexact. Les moteurs 3D de toutes les pièces suivent ouvrir/fermer/vacances.
- Synchronisation : configuration canonique à la racine CH5, noms publics nettoyés, CSS partagé copié. Fiche FR/EN/DE et capture Contrôle global mises à jour.
- Recette : 38 contrôles matrice 3D + 28 navigation + 23 fondu linéaire ; 36 combinaisons GUI et 1 292 assertions (dont injection native sans simulation), zéro exception ; contrôle de contraste complet existant à 4:1 réussi. Mesures locales accélérées : environ 53–54 images/s dans les trois vues. Preuves dans `Claude outputs/codex-plan3d-estate/`.
- Source CH5 mise à jour ; CH5Z physique, CPZ et LPZ préexistants préservés. Aucun déploiement matériel dans ce lot. Publication par le flux main → Vercel.


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

## 17/09/2026 — industrialisation 0.1.0 : registre commun et contrôles pré-bêta

Les 17 simulateurs React sont désormais enregistrés dans `src/components/simulatorRegistry.js`, utilisé par Showcase et DemoMode. Un projet absent est détecté par `scripts/check-catalogue.mjs`, ajouté au prébuild ; le repli silencieux vers Villa Nyon est supprimé. Aucun changement visuel des simulateurs dans ce lot.

Contrôles : 32 chargements navigateur du catalogue et de la démo, sans exception ; build réussi, lint sans erreur (avertissements préexistants). L'audit recense 18 projets / 8 secteurs et 18 fiches FR/EN/DE, avec 173 images présentes. Cette couverture ne qualifie pas encore les fonctionnalités des 17 concepts ni leur déploiement CH5.

Méthode et candidats matériels : `../../docs/industrialisation/`. Le correctif C# de contexte EISC, les copies de configuration et les nouveaux outils qualité sont décrits dans le journal Villa. Dossier pré-bêta Alexandre produit en local ; pas de publication Vercel par cette tâche, pas d'installation sur équipement. Les tests portent sur des snapshots et ne couvrent pas les changements 3D/Wellness ultérieurs de l'autre tâche active.

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage

Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.

Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.

## 17/09/2026 — industrialisation 0.2.0 : supports et préparation commune

Registre partagé des 17 simulateurs entre Showcase et DemoMode, contrôlé au prébuild. Le mode #demo filtre les interfaces selon le téléphone/tablette déclaré au catalogue ; liens incompatibles/inconnus expliqués en FR/EN/DE, bascule limitée aux supports prévus, boutons flottants 44 px. Les écrans internes des simulateurs sont conservés.

Préparation indépendante CH5/SIMPL depuis un seul profil JSON, contrôle du contrat et empreintes du socle GUI 1.0.181 / C# 1.0.180. Exemple de banc Villa Léman à deux pièces, mêmes sources Grand Montana, CH5Z assemblé. Aucun LPZ compilé ni matériel contacté. Voir docs/industrialisation/LOT-0.2.0.md à la racine du dépôt.

Validation : 43 tests de configuration/compatibilité ; 49 contrôles navigateur démo FR/EN/DE sur téléphone/tablette ; 28 contrôles de chargement et de visibilité HVAC du pilote sur trois supports et trois thèmes ; 76 HVAC + 53 Wellness sur la copie SMW. Build et lint réussis. Workflow GitHub ajouté pour tests, catalogue, build et lint ; il ne remplace pas la recette visuelle/matérielle ni une protection de branche.

Complément de revue visuelle : en 1280 × 800, l’enveloppe Wellness empêchait les anciens sélecteurs de marge d’agir et les boutons de ventilation dépassaient de leur carte. Correction dans themes/room-controls.css commun, GUI 1.0.181 ; ON/OFF et ventilation sur une ligne en faible hauteur, cibles tactiles conservées. Matrice HVAC relancée avec succès : 555 contrôles ; premier essai parallèle expiré à la capture, conservé parmi les preuves. C# inchangé en 1.0.180.

Validation finale GUI 1.0.181 : 632 contrôles Wellness (36 combinaisons et retours natifs) et contraste 4:1 réussis. Les fiches FR/EN/DE et captures d’accueil sombre/clair décrivent la disposition compacte.

## 17/09/2026 — stadiums-1 : enceintes sportives dans les TV 3D

À la demande de Donatien, tennis, football et course automobile disposent maintenant de tribunes, public fixe, projecteurs et tableaux d'affichage. Court central en terre battue avec chaise d'arbitre et bancs ; stade de football avec tribunes couvertes, abris et marquages complémentaires ; circuit avec paddock, garages, gradins, barrières et ligne de départ. Caméras recadrées pour montrer les enceintes. Joueurs, balles et voitures restent animés.

Nouveau module `public/plan3d/tv-venues.js` : décor procédural regroupé en deux maillages instanciés et un tableau, soit trois appels de dessin par programme. 620 à 1 060 spectateurs selon le sport ; 8 090 octets de code (3 487 compressés en gzip), aucun modèle ou média distant supplémentaire. Rendu TV partagé 640 × 360, 10–15 images/s, anticrénelage deux échantillons ; le plan de la villa conserve sa cadence indépendante. Ressources graphiques libérées à la fermeture, vérifiées à zéro après destruction du banc TV.

Build et lint réussis. 31 contrôles `scripts/test-tv-stadiums.cjs` passent sur Vite preview : trois programmes × trois thèmes × deux modes, pause/reprise/menu/OFF, absence d'erreur JavaScript/shader dans la vue 3D, retour vidéo dalle/tablette. Mesures sur ce laptop, 1280×800 DPR 1,5 : 52,0 à 53,5 images/s ; ce ne sont pas des garanties tous appareils. Deux messages console préexistants dalle/tablette (WebXPanel et tracé SVG) reproduits sur Vercel avant publication, consignés séparément. Aucune modification GUI CH5/JSON/C#/SIMPL par ce lot ; GUI toujours 1.0.181. Preuves et planche avant/après : `Claude outputs/sports-stadiums/` à la racine du dépôt.

## 17/09/2026 — valley-1 : lacs, ruisseaux continus et couverture du paysage

Deux lacs alimentent les ruisseaux, dont le profil descend jusqu'au-delà du terrain visible. Relief creusé suivant la même définition que l'eau ; berges rocheuses et roseaux, ponts sur la route publique. Les chemins des chalets rejoignent la route, contournent les lacs et aboutissent aux escaliers ; soubassements et poteaux de terrasse épousent les terrains en pente. La bande beige de la capture signalée était un chemin, pas de l'eau : sa largeur et ses raccordements sont clarifiés.

Onze parcelles, bosquets de 620 conifères instanciés et 1 800 petites touffes ; texture d'herbe procédurale, feuillage densifié. Les champs évitent les pentes et les berges ; le premier plan des vues pièces reste dégagé. Aucun fichier média ou modèle distant supplémentaire ; environ 4 Ko gzip supplémentaires pour les modules de paysage. La neige reste intégrée au relief unique, sans seconde couche.

Validation : build/lint, 29 contrôles du paysage (jour/nuit, trois thèmes × deux modes, navigation, intersections réelles eau/terrain) ; les 31 contrôles TV passent aussi. Mesures locales 1280×800 DPR 1,5 autour de 53–56 images/s, dépendantes du matériel. Cycle 30/10/30/10 conservé. Preuves et planche avant/après en colonnes par thème : `Claude outputs/alpine-landscape/`. Premier essai du banc expiré en resélectionnant la pièce déjà active ; scénario corrigé pour utiliser la molette de retour, puis matrice réussie. Aucun changement GUI, JSON, C# ou SIMPL par le lot paysage ; GUI 1.0.181 inchangée.


## 17/09/2026 — audio-1 : ondes agrandies et Suite invités

Diamètre des ondes multiplié par deux, proportionnel au volume de la source audible : audio/vidéo (a52) ou lecteur musique (a254), conformément aux deux volumes indépendants existants. Mute, OFF, pause vidéo et volume nul arrêtent l'animation. Transparence légère conservée ; anneaux légèrement dégagés des façades des enceintes, sans désactiver leur occlusion par les objets.

Cause reproduite dans la Suite invités, la terrasse et la piscine : le préréglage historique source=5 ne déclenchait pas le booléen musique. L'initialisation du feedback local traduit désormais ce préréglage en musique active et source vidéo éteinte. L'enceinte gauche des deux suites est dégagée du mobilier et de la TV escamotable. Enceintes animées ajoutées dans le vestibule Wellness, le garage et le simulateur de golf. Total : 32 enceintes dans 15 pièces ; cuisine sans enceintes selon la demande précédente, local technique sans équipement AV.

Recette dédiée scripts/test-plan3d-audio.cjs : 263 contrôles locaux réussis (17 pièces, quatre sources vidéo, deux volumes, mute/OFF/pause, retour de pièce, visibilité réelle par rayons, trois thèmes, normal/Scène, feedback dalle/tablette). Les deux suites présentent chacune deux anneaux dégagés. Aucun défaut JavaScript/shader téléphone ; messages WebXPanel/SVG préexistants dalle/tablette consignés séparément. Deux assertions supplémentaires verrouillent les erreurs des modes normal et des autres supports. Build/lint réussis ; 56,0 images/s mesurées localement sur 4 secondes, 1280×800 DPR 1,5. Aucun média distant ajouté. Preuves : Claude outputs/audio-waves/qa-final, baseline et planche-avant-apres.png.

Périmètre : fond 3D et feedback local showcase uniquement. Source GUI, JSON de déploiement, C# et SIMPL inchangés ; aucune compilation ou installation matérielle par ce lot. Chargeur et API 2026-09-17-audio-1 ; imports paysage valley-1 et TV stadiums-1 conservés.


## 17/09/2026 — lighting-1 : scènes en journée et appliques de façade

Rééquilibrage des intérieurs en coupe : contribution naturelle réduite à 32 % du réglage extérieur, spot de fenêtre 32 au lieu de 90, rebond des lampes conservé également en journée. La couleur du rebond mêle progressivement ciel et éclairage chaud. Aucun changement d'exposition lié aux scènes ; le paysage reste indépendant. Jour/nuit 30/10/30/10, transmission volet × store × rideaux et fondu linéaire de trois secondes conservés. Pièces sans fenêtres sans apport naturel ; OFF ne laisse aucun éclairage artificiel de pièce.

54 appliques à double faisceau sur montants de pierre, façades et volumes des étages. Les supports en pierre sont élargis pour placer les luminaires sur le mur, sans les monter sur les vitrages. Projection chaude procédurale regroupée en un seul maillage transparent (un appel de dessin), synchronisée avec le crépuscule et avec la disparition des façades. Aucune nouvelle lumière dynamique, ombre calculée ou ressource distante ; environ 1 Ko gzip de code ajouté.

Noms choisis par Donatien : pièce 11 Terrasse & Jardin → Pool House ; pièce 14 Pool House → Bar & Lounge. Générateur sync-villa-crans.py mis à jour, deux configurations publiques régénérées par clean_config. Identifiants et pilotages inchangés. Le JSON physique garde exactement la même empreinte SHA-256 ; GUI source, C# et SIMPL inchangés, aucun matériel déployé.

Validation locale : 16 contrôles visuels/numériques du contraste (quatre scènes × jour/nuit × ouvert/fermé, salon/cinéma/bar, façades), 23 contrôles de fondu, 35 contrôles de noms/thèmes/langues/supports et d'occultations. Trois thèmes en mode normal et Scène ; faisceaux masqués dans la vue pièce. Les noms sont vérifiés sur trois supports × FR/EN/DE × trois thèmes. Les deux assertions supplémentaires du banc de contraste verrouillent la version et un écart minimal notable en journée. Build/lint réussis. Premier essai de la matrice de noms lancé avant la disponibilité des fonctions GUI : attente d'initialisation corrigée, puis matrice réussie.

Mesure sur la zone Bureau : luminosités moyennes jour OFF/CINÉMA/REPAS/TOTAL de 0,440/0,514/0,595/0,650 avant à 0,255/0,391/0,521/0,607 après ; pas une mesure lux physique. Nuit et occultations fermées restent comparables. 53,6 images/s mesurées sur ce laptop en vue villa nocturne 1280×800 DPR 1,5, dépendantes de l'appareil. Preuves : Claude outputs/scene-contrast/baseline, qa, matrix, fades et planche-avant-apres.png.


## 17/09/2026 — feedback-1 : écrans dégagés, éclairage localisé et ondes en mouvement

La TV de la salle à manger est déplacée sur une travée libre, entre buffet et cave à bouteilles, et agrandie. Le rail de spots est reculé ; l'écran reste sous les appliques, hors de l'axe de la suspension. Contrôle élargi aux autres pièces : applique du Salon décalée, rail du Bureau reculé, écran cinéma ajusté sous sa corniche avec la barre de son au-dessus du sol. Règle permanente ajoutée à CLAUDE.md et aux consignes locales : aucun mobilier, rideau ou équipement ne masque un écran allumé ; contrôler les vrais obstacles, sans contourner la profondeur.

Le blocage des scènes Salon/Suite parentale n'a pas été reproduit sur une session neuve : les quatre boutons transmettaient déjà quatre ensembles de niveaux distincts. Leur rendu est amélioré : lumière d'ambiance localisée au lampadaire du canapé et près des chevets ; contribution distincte des corniches/appliques/LED aux deux lumières existantes. Fondu linéaire 3 secondes, jour/nuit, occultations, presets mémorisés et feedbacks GUI conservés.

Ondes audio : même anneau fin, expansion visible de 60 à 100 % du diamètre maximal, puis disparition, toutes les 1,6 seconde. Diamètre maximal proportionnel au volume de la source audible ; AV/musique distincts, mute/OFF/pause/volume nul respectés. Aucun maillage, texture distante ou lumière supplémentaire.

Recettes : scripts/test-plan3d-room-feedback.cjs (boutons réels, quatre scènes Salon/Suite × jour/nuit × ouvert/fermé, rayons caméra-écran sur les 11 TV), test-plan3d-audio.cjs (mesure temporelle sur chaque enceinte) et test-plan3d-lighting.cjs (fondu et interruptions). Preuves et résultats dans Claude outputs/room-feedback. Ce lot ne change ni la GUI, ni la configuration physique, ni C#/SIMPL ; aucun déploiement matériel.

Validation du lot : 69 contrôles scènes/TV réussis, 280 contrôles audio réussis (15 pièces et 32 enceintes, amplitude mesurée pendant un cycle complet), 23 contrôles de fondu réussis. Les tests plus fins ont révélé le rail du Salon dans l'axe de la caméra en Mode normal ; tous les rails sont désormais rapprochés du mur arrière. Contrôle final normal 1280 × 800 : 6 006 rayons caméra-écran dégagés sur 11 TV, volets/rideaux ouverts et fermés. Build et lint réussis (avertissements préexistants). Mesure locale : 56,8 images/s, DPR 1,5 ; 459 octets gzip ajoutés aux deux modules, aucune ressource distante ni lumière supplémentaire. Preuves dans Claude outputs/room-feedback (before, qa, audio, normal-dense, fades).

Mode Scène 1920 × 1080 : 23 contrôles réussis, 6 006/6 006 rayons dégagés également. Trois thèmes photographiés dans les deux modes ; dalle et tablette gardent la vidéo de fond (banc audio).


## 17/09/2026 — tour-1 : séquence résidentielle dédiée à Villa Crans

Entrée par le secteur Residential/Résidentiel : Smartphone en premier, vue villa assemblée pendant 3 secondes, pièce aléatoire différente toutes les 5 secondes, passage au TSW à 60 secondes. Présentation TSW 10 secondes après chargement, puis nouvelle minute Smartphone en boucle. La dernière visite commence à t=58 et se termine à t=60. Aucune attente d'inactivité entre ces changements automatiques ; intervention manuelle prioritaire et reprise après 60 s sur téléphone, 10 s ailleurs. Le bandeau ramène la carte du projet actif dans la zone visible après navigation.

Horloge 30/10/30/10 conservée entre les châssis : scène CINÉMA basse et variée dans les 17 pièces au début du crépuscule, fermeture des rideaux ; OFF et ouverture des rideaux au début de l'aube. Les fondus restent linéaires sur 3 secondes. Le curseur visite les onglets et commandes HVAC/volume sans contredire cette ambiance. Volets, stores et bannes ne sont pas assimilés aux rideaux. États par pièce synchronisés dans le feedback local Showcase, sans sélectionner successivement toutes les pièces ni faire sauter la caméra.

Validation locale : 34 contrôles du nouveau banc test-villa-tour.cjs, cycle observé sur plus de 110 secondes (jour/nuit/aube/nuit, deux passages Smartphone), navigation par le menu depuis Appartement Carouge, rythmes, tirage sans répétition, pointeur animé et priorité manuelle. Trois thèmes × normal/Scène photographiés. Les 23 contrôles de fondu passent. Premier essai du nouveau banc : assertion trop restrictive sur le nombre de coordonnées distinctes du curseur ; remplacée par le nombre réel de déplacements, puis cycle complet repassé. Deux messages console TSW préexistants (WebXPanel absent et tracé SVG) consignés séparément ; aucune nouvelle erreur. Build/lint réussis, avertissements préexistants.

Preuves : `Claude outputs/villa-tour/qa-final`, `fades`, `comparison/index.html`. Aucun modèle, média ou éclairage dynamique ajouté. Source GUI, JSON physique, SIMPL# et SIMPL Windows inchangés par ce lot ; aucune compilation ou livraison sur matériel.

Contrôles complémentaires : 27 contrôles de navigation 3D réussis, quatre contrôles de reprise/menu/autre projet réussis. Comparatif visuel avant/après, trois thèmes en colonnes : `Claude outputs/villa-tour/comparison/index.html`.

Ajustement de chronométrage après le premier contrôle public : les pauses de déplacement du pointeur vers la liste des pièces sont plafonnées par la prochaine échéance, pour ne pas ajouter 810 ms après un ralentissement de rendu. Le banc horodate désormais les événements de sélection réels, avant le rendu synchrone, au lieu de déduire leur heure des captures échantillonnées.

Publication finale vérifiée : **b1de7af0**, main → Vercel. Les 34 contrôles du cycle complet passent sur le site public final, avec événements de sélection horodatés avant le rendu, deux passages Smartphone et TSW, ambiances de toutes les pièces, priorité manuelle et trois thèmes × normal/Scène. Aucune nouvelle erreur. Ressources publiques comparées aux octets Git et nouveau bundle React confirmé. Rapports, captures publiques et comparatif avant/après archivés dans `docs/verification/2026-09-17-tour-1/` à la racine du dépôt. Aucun programme matériel modifié ou déployé par ce lot.


## 17/09/2026 — journey-1 : parcours guidés et lisibilité nocturne

Dernière demande de Donatien : chaque pièce montre un parcours complet. Tablette/dalle/PC : pièce → éclairage → HVAC → audio/vidéo → Apple TV → IPTV → volume → OFF audio/vidéo. Les simulateurs sans ces deux sources utilisent deux sources réellement disponibles ; un lecteur audio se termine par Pause. Aucun clic aléatoire sur réglages, alarmes ou commandes générales. Trois pièces sont parcourues avant la poursuite du carrousel.

Villa Crans Smartphone : fermeture de tous les moteurs présents ; de nuit TOTAL puis CINÉMA, de jour CINÉMA puis ouverture de tous les moteurs ; ensuite HVAC, sources Apple TV/IPTV, volume, OFF A/V. Les motorisations finissent leur course et chaque fondu de scène dure trois secondes. La branche jour/nuit est choisie au début de la visite ; l'ambiance globale n'écrase pas la pièce en cours. Les autres pièces suivent toujours le cycle 30/10/30/10. Vue villa initiale conservée trois secondes. Les anciens créneaux de cinq secondes par pièce sont remplacés : la dernière pièce se termine avant le changement de châssis, les 60 secondes Smartphone et 10 secondes TSW sont désormais des durées minimales. La tablette Villa Crans montre trois visites complètes. Intervention manuelle toujours prioritaire, délai de reprise 60 secondes Smartphone / 10 secondes autres supports.

La demande « jamais de pièce dans le noir total » remplace l'ancienne exigence de rendu complètement noir : faible remplissage de présentation par les deux lumières déjà présentes (hémisphère minimum 0,32, remplissage 0,18). Les luminaires commandés et leurs retours restent strictement à zéro en OFF. Aucun ajout de lumière, modèle ou média distant. Contraste mesuré Bureau de jour OFF/CINÉMA/REPAS/TOTAL : 0,259 / 0,381 / 0,518 / 0,599 ; valeurs de pixels, pas des lux.

Corrections constatées pendant la recette : le curseur CH5 synthétique ne transmettait pas toujours le volume ; publication du même join analogique dans le simulateur local uniquement. Les ancêtres masquant un bouton ne sont plus considérés comme une cible visible ; défilement des panneaux existants avant déplacement. Seuil de taille évalué avant réduction du châssis. Appartement Carouge : contrôles du lecteur et de la liste des pièces conservés dans le DOM pendant les mises à jour React, permettant le glissement complet du volume. Villa Nyon : volume réellement contrôlé et pourcentage synchronisé. FTV Home : source Apple TV, volume par écran et OFF de l'écran ciblé ; captures et fiches FR/EN/DE actualisées.

Recette locale : 34 contrôles du cycle Villa Crans, 122 contrôles sur cinq parcours React, 23 contrôles de fondu, 18 contrôles de contraste, 8 contrôles fiches/volume/cibles et comparaison trois thèmes × normal/Scène. FTV Home possède ses deux thèmes clair/sombre, sans verre dépoli. Premiers essais ont révélé les défauts de volume, de clipping et de remontage React ci-dessus ; tous corrigés puis recontrôlés. Pas de nouvelle erreur navigateur ; messages WebXPanel/SVG préexistants TSW consignés séparément. Build/lint réussis avec avertissements préexistants.

Preuves et comparaison : `docs/verification/2026-09-17-journey-1/` à la racine du dépôt. Source GUI CH5, configuration physique, C# et SIMPL inchangés ; aucun matériel compilé ou déployé. Le tracé F1 demandé ensuite est uniquement consigné dans `apps/showcase/docs/TODO-SHOWCASE.md`, sans modification de la simulation sportive.
