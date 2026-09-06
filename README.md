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
