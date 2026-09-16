# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)


## 16/09/2026 — estate-2, GUI 1.0.179 : villa, animations et HVAC

Demande groupée de Donatien : sous-sol avec cinéma, sauna/hammam, garage et simulateur de golf (16 pièces showcase), grand salon/cuisine/salle à manger au RDC, rampe d'accès garage dégagée, fenêtres vers l'extérieur avec cours anglaises au sous-sol, bannes de chaque pièce RDC. Cinq circuits lumineux indépendants ; fondu linéaire 3 s conservé. Rideaux : flèches horizontales dans les GUI sources.

Audio : ondes sur sources vidéo et musique, diamètres selon le volume A/V ou le volume média distinct, arrêt sur mute/OFF ; cinéma 11 canaux dont arrière/surround/plafond. TV : programmes Canvas animés cinéma, football, tennis, course automobile, 15 images/s sans téléchargement de vidéos ni son. Jardin : luminaires, projections douces, clôtures/terrasse/piscine et lumière sous l'eau ; portiques caméra quatre coins, façades et portail. Cycle 20 s (deux demi-cycles de 10 s, transitions de 2 s). Eau déformée par shader et brise discrète sur une partie du feuillage, haies fixes ; réduction avec le niveau de qualité. Démo automatique : Smartphone 60 s, autres supports 10 s.

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

Tests locaux : 24 contrôles villa, 28 navigation, 23 fondu, 40 matrice 3D, 36 combinaisons GUI HVAC et 15 contrôles réception native sans simulateur ; 76 contrôles C#/JSON/SMW. Contraste pages/fenêtres/états dans les trois thèmes : aucun texte sous 4:1. Test dédié des délais 60/10 s, volume musique, pause vidéo et shader de l'eau. Mesure locale GPU 1280×800 DPR 1,5 : environ 55–60 images/s (pièce, villa fermée et ouverte). Limite : rendu stylisé enrichi, pas promesse de photoréalisme.

Preuves dans `Claude outputs/codex-plan3d-villa2/` ; dossier `livraison-hvac` : JSON, CH5Z assemblé, SMW préparé. Le projet SIMPL original et ses modifications locales sont préservés : copie = 715 ajouts, aucune suppression. **LPZ non compilé ; aucun déploiement matériel.** C# compilé, mais Windows bloque l'empaquetage final du CPZ (`MSB3441 / 0x800711C7`, contrôle d'applications). Premier CPZ d'essai écarté de la livraison. La mise en service nécessite les bons CPZ/LPZ et la recette Debugger.

## Dernier lot Codex — contrôle global 1.0.178, 16/09/2026

Demande explicite de Donatien après les lots 3D : corriger les retours de la fenêtre Centralisation sur tous les supports. Source `src/index.html` / `src/iphone.html`, CSS commun `src/themes/global-controls.css` : retours natifs `receiveStateSelected` (401–405, 407–411), gris inactif / vert actif. Ne jamais remettre le sélecteur CSS `[selected]` sans `="true"` : il active aussi les boutons false. Les retours d'état ne sont pas forcés au clic dans le DOM.

Version **source** et config canonique 1.0.178 ; showcase régénéré par le script qui lit la config racine. Le feedback local conserve une seule commande globale par section, désélectionne les états devenus inexacts après réglage individuel, et distingue commande stores/position mesurée. Recette navigateur : 36 combinaisons, 1 292 assertions, injection de retours booléens natifs CH5 sans moteur local, contraste 4:1 pages/modales. **CH5Z, CPZ et LPZ préexistants préservés, aucun déploiement matériel** ; leur état installé n'est pas déduit de la version source. Donatien a signalé le chargement CPZ/LPZ le 16/09, sans vérification physique dans ce lot. Les tableaux historiques ci-dessous ne constituent pas un nouvel état matériel.

## Les 4 artefacts à suivre (convention validée le 13.09.2026)
Quatre versions à tenir alignées, ici et en tête de chaque entrée du CHANGELOG.

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.176** (15.09, XPanel sur le CP4 du bureau) | `.\deploy.ps1 -Target web -CP4Host 192.168.3.109` — **à relancer** : lots des 15-16.09 non compilés |
| CPZ slot 1 (C#) | 14.09 (v3) | **à recompiler** (routage v4 ajouté le 16.09) : SIMPL# Pro + `.\deploy.ps1 -Target cp4` |
| LPZ slot 2 (SIMPL) | 15.09 (contrat v3) | **à régénérer** : `generate_slot2.js` (v4, 107 `Remote_*`, blocs pièces retirés) + F12, puis buffers sur `Room_Select#` |
| Showcase Vercel | lot du 16.09 | poussé sur `main` — Vercel déploie automatiquement ; `deployer-v2.bat` est obsolète |

`deploy.ps1` incrémente `version.json` à chaque build (même si le build échoue ensuite) ; `meta.version` du `villa_config.json` s'aligne à la main.

Projet Fréquence TV : GUI Crestron CH5 « Villa Crans-Montana » + SIMPL# Pro (slot 1, `Backend/Backend/ControlSystem.cs`) + SIMPL Windows (slot 2). Contrat de joins **v4** (15.09.2026, `villa_config.json` → `contrat`, doc `docs/03_CONTRAT_JOINS.md` encore en v3). Doc dans `docs/` (01 spéc · 02 villa_config · 03 joins · 04 SIMPL · 05 recette · 06 to-do · 07 retours direction 09.09 · 08 workflow showcase), audit `AUDIT_2026-09-02.md`, journal `CHANGELOG.md`, règles CH5 `.agents/AGENTS.md` (« Rule of Gold » : états par joins natifs CH5, jamais par DOM JS).

## Arborescence (monorepo, depuis la restructuration du 11.09.2026)
`C:\dev\crestron\repo` — `projects/villa-crans/ch5` (GUI + C#, ce fichier à la racine) · `projects/villa-crans/simpl` (slot 2 `.smw`, contrat) · `apps/showcase` (site vitrine, clone de `donafcna/Crestronshowcase`, main → Vercel). Les anciens chemins `C:\Users\donat\Desktop\VillaCrans` et `VillaCrans SIMPL` ne sont plus utilisés.

## Fichiers qui comptent
- `src/index.html` (dalle TSW-1070, iPad, XPanel) et `src/iphone.html` : SOURCE DE VÉRITÉ. Blocs `<style id="tablet-sidebar">` (menu de gauche groupé), `<style id="global-modals-xl">` (modales agrandies), `<style id="theme-readability">` / `<style id="theme-overlays">` (thèmes Sombre / Clair / Verre dépoli).
- `src/js/villa-joins.js` : couche v3 (traduction par pièce) **désactivée** par `contrat.blocsPiecesGui.actif=false` ; sert encore à `villaPiecesActives(vc)` (pièces `actif:false` hors menus) et aux miroirs `data-join`.
- `villa_config.json` (racine = copié dans `src/` par `deploy.ps1`) : `meta.mode = "deploiement"` (jamais `showcase` ici), **`meta.tracesConsole`** (faux = debugger propre, voir plus bas), `contrat.signauxGlobaux`, `contrat.blocsPieces` (EISC), **`contrat.blocsPiecesGui`** (mapping join logique → offset), `contrat.alarme`, **`pieces[].pilotages.eclairages.scenes.niveaux`** (niveaux de circuits par scène), `pagesSpeciales`, `traductions`.
- `deploy.ps1` : `node --check` de chaque `<script>` + validation JSON + contraste → `npx ch5-cli archive` → TSW (pscp/plink) → CP4. `-Target web` = XPanel + QR codes.
- **Contraste (règle permanente : 0 défaut)** — `node tools/check_contrast_dom.mjs --root http://localhost:4173 --min 4` sur une preview servie (3 thèmes × page + 10 fenêtres × états dynamiques, dalle et smartphone). Attendre 900 ms après un changement de thème.

## Contrat de joins v4 (15.09.2026) — joins de pilotage identiques dans toutes les pièces
Décision de Donatien : **tous les pilotages (sources 150-156, télécommandes Apple TV 211-220 / Sky Q
500-527 / IPTV 530-557 / Swisscom 560-600, scènes stores 201-204, stores groupés 61-69) portent le
même join quelle que soit la pièce ; SIMPL route sur `Room_Select#` (a10) avec des buffers**, pour
ne pas surcharger le debugger Toolbox. Le v3 (`base = 1000 + (pieceId-1)*100`) est désactivé :
`blocsPiecesGui.actif=false`, blocs pièces retirés de `generate_slot2.js` (1980 câblages) — les 2010
définitions `R01_..R15_` restent dans le `.smw`, à nettoyer dans SIMPL Windows. Ne pas réactiver le v3 :
il reposait sur une réécriture d'attribut qui n'émettait pas (le bouton témoin émettait via `onclick`).
Restent globaux par nature : pièces 11-40 / a10, alarme 41-48 + 301-312, presets 401-411 / s420,
système s99-106, dig/ana 250, dalle a240/a260/d261, météo d56. Mute Swisscom → 55.
En mode `showcase` tout tourne sur ces joins avec `js/local-feedback.js`.
**Côté C# (16.09)** : `RouteGlobalDigitalToActiveRoom` / `RouteGlobalAnalogToActiveRoom` (tables
`V4*Offsets` = `blocsPiecesGui.mapping`) appliquent un join global à la pièce affichée par le panel
(`_activeRoomPerDevice`) ; `PushRoomFeedback` renvoie l'instantané global aux panels de la pièce.
**Côté slot 2** : convention `X_fb` = appui REÇU de la GUI (sortie du symbole), `X` = feedback à
RENVOYER (entrée). Sans logique câblée (interlocks sources / scènes, toggle musique 155 remis à 0
par 156), la dalle ne voit rien venir du slot 2 — le C# fournit déjà le feedback des sources,
scènes, consigne, vacances, partitions ; le slot 2 pilote le matériel réel.

## Règles GUI validées par Donatien
- **Aucun défilement** (14.09) : le contenu tient à l'écran, quitte à redimensionner ; seules exceptions
  smartphone : Caméras, Circuits, Configuration preset. **Occuper la place au mieux** : fenêtres 92 % de
  la hauteur, télécommandes mises à l'échelle (`fitRemoteLayout`, agrandissement autorisé sur smartphone).
- **Cohérence entre châssis** : textes et couleurs identiques dalle / iPad / XPanel / smartphone, dans
  le même lot ; seules les dimensions se règlent par support. Boutons ronds, jamais ovales ; aucune
  cible < 40 px.
- Télécommandes : Apple TV = Menu + croix (211-220) ; Sky Q / IPTV (500 / 530 + index) et Swisscom (560 + index) en 3 zones rectangulaires ; `fitRemoteLayout` (jamais hors cadre) ; pas de bordure bleue CH5 sur `#source-control-overlay`.
- Sources : vidéo 151-154 en interlock, Musique 155 indépendante (badge audio), 156 = retour audio vidéo ; premier appui = activation + télécommande ; scènes mémorisées (appui long, `localStorage villa_scene_<pièce>_<n>`) ; bandeau « État de la villa ».
- Modales Contrôle global / presets / caméras / sécurité : 94 % du GUI, fond quasi opaque, textes ≥ 1,1 rem. Réglages : 640 px dalle/tablette, 440 px smartphone.
- Thèmes : Sombre, Clair, Verre dépoli (Cyberpunk retiré), `<body id="app-body">` obligatoire.
  - Verre dépoli (réglage v1.0.167) : `--container-bg: rgba(15,23,42,.34)` + `--blur-val: blur(18px) saturate(1.8) brightness(0.40)`. La version « voile blanc 0.10 / brightness 0.5 » du site vitrine est plus jolie mais fait tomber 33 textes sous 4:1 — ne pas la rétroporter telle quelle.
  - Clair = coque `#f8fafc`, cartes `rgba(15,23,42,.06)`, textes `#0f172a` / `#475569`, accents foncés (`#047857` `#1d4ed8` `#a16207` `#6d28d9` `#b91c1c`). Ne jamais repeindre : fonds hexadécimaux en dur, dégradés, `ch5-button[selected="true"]`.
  - Bouton CH5 sans style dédié : `#0369a1` en thèmes sombres (le bleu `#0099ff` ne porte pas de texte blanc). Sélectionné vert `#10b981` → libellé `#052e16`.
  - Badges d'alarme : classes `.alarm-badge--off/--partial/--active`, jamais de couleur en dur dans le JS.
- Menu de gauche : Réglages + version + météo groupés au-dessus des pièces à toutes les largeurs. Icônes : SVG `.gear-icon`, jamais d'emoji.
- **Logos des boutons de source : une seule couche (v1.0.168).** Le logo est l'`<img class="src-overlay-img">`, frère du `ch5-button`, mis à l'échelle par CSS (`.logo-active` 1,7 ; `.logo-mono` 1,28 + `filter: invert(1)` en Clair). Fonds CSS de logo neutralisés dans `<style id="logo-source-couche-unique">` — ne jamais rajouter de `background-image` sur `.src-*`. L'état est lu sur le châssis (`ch5-button:not([selected="true"]) ~ .src-overlay-img`). Une ligne CSS cassée vers la ligne 1452 (`ch5-button.src-iptv { ... }utf8,<svg …`) avale encore le bloc suivant.
- **Aucun son** : `playFunnySound` neutralisée, `playSynthSound` supprimée (11.09.2026).
- **Le debugger ne montre que des signaux (13.09).** Émission sur changement uniquement (`SetBool` / `SetUShort` / `SetString` ; exceptions : impulsions, code d'alarme, `_forcePush`). Traces C# et `console.log` (s100) sous `meta.tracesConsole` (`progreset` pour relire).
- **Scènes d'éclairage → circuits (13.09).** `pieces[].pilotages.eclairages.scenes.niveaux` (0-65535 par circuit) ; **le slot 2 fait foi** dès qu'un niveau remonte sur +71..+80 (`_circuitFromSlot2`). Démarrage scène 1.

## GUI smartphone — agrandissement (14.09.2026)
Tout tient dans `<style id="mobile-xl">` (fin de `<body>`) + `<style id="mobile-ux">` (moteurs animés,
scènes mémorisées `villa_scene_<pièce>_<n>`, MutationObserver sur `#motors-container` /
`#circuits-container`) + blocs `mobile-lot-0915` / `mobile-lot-0916`. Cibles ≥ 44 px, repli
`@media (max-height: 700px)`. Pièges : un style en ligne `!important` ne se reprend pas en CSS (le
retirer du HTML) ; sur un `ch5-button` donner `width/height: 100%` à `> div` et `.cb-btn` ; `min-width: 0`
sur les éléments de grille ; le fond générique `#0369a1 !important` des boutons CH5 écrase les
`customStyle` → ceux de `#source-control-overlay` sont `!important` un par un, ne pas les « nettoyer ».
L'entête ne porte que la liste des pièces et l'engrenage (version, connexion, admin dans Réglages).

## Lot smartphone 15-16.09.2026 — logique audio/vidéo et pièges CH5
- **Un seul point d'entrée pour les sources : `window.avSelect(join)`** (bloc IIFE `AV`, identique
  dalle / iPhone) : confirmation « musique ou audio de la vidéo » (`#audio-confirm-overlay`), ouverture
  de la télécommande (`avOpenRemote`, ignore les événements non fiables → tests en `page.click`),
  `avRender()` pose `selected` / `audio-active` / `audio-music`. L'ancien `selectSource` délègue.
  **Badge égaliseur animé** (`.tv-live-badge` + `.tv-equalizer-mini`, 4 barres `tv-eq`) = source dont
  l'AUDIO joue, sur tous les châssis (iPhone : injecté dans chaque `#source-btn-N`, 16.09) ; fond ambre
  + liseré blanc pour la musique, liseré `#0f172a` en thème clair.
- **`customClass` n'est PAS recopié sur l'hôte dans cette version de CH5** : sélecteur
  `ch5-button[customClass~="x"] .cb-btn`, jamais `ch5-button.x`. Les couleurs des tuiles de source
  (XPanel) et les icônes noires du thème clair (haut-parleur, Power) en dépendent.
- Menu : pièces `actif:false` (15 Garage & ateliers) et `pagesSpeciales.video.actif=false` masqués
  par `villaPiecesActives(vc)` — réversible dans `villa_config.json`.
- Retirés à la demande : PRESET (406) des stores globaux, TOTAL/REPAS/CINÉMA/ÉTEINDRE de la config
  du preset global, sélecteur de preset et ligne Climatisation du mode Vacances. iPhone : « Sources »
  (titre) / « Source » (onglet) = exception assumée ; grille sources 2 colonnes (MUSIQUE pleine
  largeur), Moteurs paginés, presets par famille Volet / Rideaux / Stores, Swisscom sans vol± / ✦ / ⇥ / 🔇.
- **Après toute reconstruction de bloc HTML par script : compter les `<div>`** et vérifier que chaque fenêtre est enfant direct de `body` (une fermeture avalée a imbriqué 10 fenêtres). Sections conditionnelles pilotées par `applyPilotageVisibility`, jamais par heuristique sur le nom de la pièce.
- Outillage conteneur : `device_commit_files` sert un **chemin de sortie neuf** à chaque livraison
  (cache observé sur un même `stagedPath`) ; `src/villa_config.json` est une copie de build, la
  source est `villa_config.json` à la racine (la recopier avant `sync-villa-crans.py`).

## Plan 3D (16.09.2026) — fond de page du SITE, le GUI des châssis ne change jamais
**Vidéo par défaut** ; `apps/showcase/src/components/Plan3DBackground.jsx` ne la remplace que dans
les cas de `PLAN3D_RULES` (`{device,minWidth,maxWidth}` — aujourd'hui : châssis Smartphone ; l'utilisateur
teste d'autres tailles d'écran et dira quoi ajouter). 3D active ⇒ châssis calé à gauche (`.plan3d-on`,
`--chassis-scale`), pièce cadrée avant la colonne des boutons. Deux scènes (extérieurs / pièces) : la
lumière du jour de la pièce suit ses motorisations (`daylight()`), moteurs visibles avec voyants, montagnes
en relief unique (sans scintillement), TV détaillée (écran 1024×576). `public/plan3d/plan3d.js` (Three.js `public/plan3d/vendor/`, `import()` à l'exécution) et
`public/plan3d/villa-crans.json` (disposition, style). Lit le GUI **à travers l'iframe** (même
origine) : CrComLib (a10, a71-80, d150-156, d155, a31/s33), clics `ch5-button[data-join]` (211-216,
Sky 500+, IPTV 530+, Swisscom 574+, stores 61-69, moteurs 81-98), `animateGroupBlinds`. Villa plein
fond, pièce active cadrée dans la zone libre à droite du châssis (`api.setWindow`). `window.__plan3d`
= API (`jump()` termine les mouvements). Détail dans `apps/showcase/CLAUDE.md`. **Malentendu du
16.09 à ne pas répéter** : une demande « plan 3D / fond d'écran » vise le site Vercel, jamais le GUI.

## Vitrine (apps/showcase, crestrongui.vercel.app)
Copie régénérée par `python apps/showcase/scripts/sync-villa-crans.py <chemin>/projects/villa-crans/ch5/src` (jamais éditée à la main) ; `meta.mode = "showcase"`, feedback simulé par `js/local-feedback.js`, curseur de démo. Le script copie aussi `js/villa-joins.js` ; `js/local-feedback.js` est propre à la vitrine.
**Barre d'outils (14.09.2026) : QR code · Fiche PDF.** « Présentation » retiré (la bulle « Reprise
de la démo dans N secondes », désormais en bas à gauche dans tous les modes, est la seule commande
de la démo) et « Plein écran » caché derrière `showEmbedTool` : doublon avec le bouton Scène. Le
plein écran se demande par l'adresse — **`/3` GUI seule plein écran, `/4` retour au Mode normal**,
sur le modèle de `/1` et `/0` du Mode Dev (`hooks/useGuiFullscreen.js`, Échap en échappatoire).
La démo automatique démarre désormais sur **tous les supports** (elle était réservée au PC via
`isDesktopPointer`) : sans bouton, elle n'était plus démarrable à la main sur mobile et tablette.

## Pièges de la chaîne de déploiement (15.09.2026, tous rencontrés en conditions réelles)
1. `deploy.ps1` en **ASCII pur + BOM** : sans BOM, PowerShell 5.1 lit cp1252, un tiret cadratin devient
   `â€"` dont le guillemet typographique inverse la parité des chaînes. Parser dans les deux décodages.
2. Jamais de `node -e "..."` dans `Start-Process` (coupé au premier espace) : serveur dans
   `tools/serve_src.mjs`, Content-Type explicite, attente du port 4179.
3. `ch5-cli deploy` exige `-p` (aucune option de mot de passe, aucune variable d'environnement lue) ;
   sinon `No SFTP connection available`.
4. Node 23+ casse `ch5-cli` (`util.isDate` retiré, `ssh2-streams` l'appelle au `setstat`) →
   `tools/ch5-compat.js` chargé par `node --require` avant le CLI.
5. `ch5-cli` sort en code 0 même en échec : le succès se vérifie sur `https://<cp4>/villaftv/index.html`.
6. Banc du bureau : CP4 `192.168.3.109`, compte SFTP `FTV`, `-CP4Host <ip>` ; `Test-NetConnection -Port 22`.
   `-SkipContrast` / `-SkipBuild` existent. PowerShell bloque les scripts : `-ExecutionPolicy Bypass`.

## Reste à faire
1. Recompiler le CPZ (SIMPL# Pro, routage v4) puis `powershell -ExecutionPolicy Bypass -File C:\dev\crestron\repo\projects\villa-crans\ch5\deploy.ps1 -Target cp4` ; CH5 : `... deploy.ps1 -Target tsw -TswHost 192.168.1.16` / `-Target web` (CP4 .1.200 encore en v1.0.149 du 21.07).
2. LPZ : `node C:\dev\crestron\repo\projects\villa-crans\simpl\contract\generate_slot2.js` + F12 ; buffers SIMPL sur `Room_Select#` ; supprimer les 2010 signaux `R*_` ; chaîne d'alarme s43 / d44-46.
3. Recette : deux supports sur deux pièces en même temps ; joins de télécommande dans le debugger (Apple TV / Sky Q : aucun ne remontait en v3).
4. `villa_config.json` porte encore des noms de test inappropriés (`valeursParDefaut.scenesEclairage`) — avant toute visite client.
5. Réserves : libellé « P » des flèches de chaîne Swisscom disparu ; scènes 201-204 encore au contrat / slot 2 ; `docs/03_CONTRAT_JOINS.md` à passer en v4.

## État au 16.09.2026
Lots 15-16.09 dans les sources et poussés (source + vitrine), batteries vertes (Playwright 3 thèmes,
contraste dalle 1920×1200 + smartphone, interactions 3D). CPZ et LPZ rechargés par Donatien le 16.09
(routage v4, CVC par pièce, média, partitions) ; **CH5 à recompiler** (badge, tap-highlight). CP4 .1.200 : v1.0.149 du 21.07 tant que `-Target web` n'a pas été relancé.
