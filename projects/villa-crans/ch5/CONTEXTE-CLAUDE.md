# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

## 17/09/2026 — feuille de route (conversation vocale ChatGPT ; détail : docs du projet Cowork 00, 10, 30, 60)
- Nom : **Crans-Montana**, jamais « Grand Montana » ; « Villa Gemini » = même projet.
- Étapes : V1 stable → bêta Alexandre (chaque blocage = à simplifier ou à passer dans `villa_config.json`) → « Core Fréquence TV » réutilisable → toutes les GUI du showcase au niveau Villa Crans → livrable client. Horizon 1–2 mois.
- Architecture cible : CH5 + C# générique maintenus par l'IA ; le programmeur ne touche que le JSON de config et SIMPL. Critère : un programmeur SIMPL qui ne connaît ni CH5 ni C# déploie seul.
- Premier chantier : audit de la Villa Crans (design system, composants, interactions, points de rupture, animations, contraintes physiques) + contrat de données JSON ↔ C# ↔ SIMPL ↔ CH5.
- Qualité en amont : cohérence architecturale/physique → AV → graphique/fonctionnelle ; chaque correction devient une règle écrite, puis un contrôle automatique si possible.
- Session « Work » ChatGPT lancée le 17.09 à 10 h 21 : résultat inconnu, à vérifier.

## 17/09/2026 (soir) — lot 1.0.183 : OFF, mute, logs PRESETS, tuiles pressées (détail : CHANGELOG)
Retours TSW de Donatien. Règles apprises, à ne pas recasser :
- **Un `<ch5-button sendEventOnClick="N">` émet SEUL l'impulsion** (`repeatdigital` true/false via le pont natif, hors
  `CrComLib.publishEvent`). Ne jamais doubler par un `publishEvent('b',N,true)` dans son `onclick` : 2 fronts montants par
  appui, et un `true` jamais relâché bloque les appuis suivants. `sendPowerOff` (200) et `toggleMute` (55) n'émettent
  plus rien ; l'état vient du `receiveStateSelected`.
- **Un join sans nom dans le slot 2 est invisible au debugger** : vérifier `generate_slot2.js` avant de chercher côté
  GUI/C#. Le 200 (`AV.Extinction`) n'y existait pas → `AV_Off` / `AV_Off_fb` ajoutés, `Project_Slot2.smw` régénéré.
- Logs C# de repli (« preset not found ») → `Trace()`, jamais `CrestronConsole.PrintLine` inconditionnel.
- Faders de « Configuration du preset global » = `<input type="range">` locaux ; émission uniquement à « Enregistrer »
  (s420 JSON → `/user/preset_cfg_<nom>.json`). Normal qu'aucun analogique ne remonte.
- Fenêtre ouverte pendant l'appui → `avReleaseTilesSoon()` relâche `ch5-button--pressed` des tuiles sources.
- `deploy.ps1 -Target web` : vérification finale robuste (rappel de certificat compilé `Add-Type`, repli `curl.exe -k`) ;
  un scriptblock PowerShell en `ServerCertificateValidationCallback` = « connexion sous-jacente fermée ».
- Recette locale : `node tools/recette-off-sources.mjs http://localhost:4179 apres <dossier>` (pont `JSInterface` émulé
  = ce que reçoit le CP4, « 10 » attendu par appui) + `tools/check_contrast_dom.mjs --root … --min 4`.
- Réseau de Donatien : **CP4 192.168.1.200, TSW 192.168.1.16** ; banc bureau CP4 192.168.3.109.
- Réserve : `iphone.html` `toggleMute` (télécommandes) publie un niveau 55 hors `<ch5-button>` ; `deploy.ps1` a
  incrémenté `version.json` deux fois le 17/09 (1.0.182 sans build valide, 1.0.183) → `meta.version` = 1.0.183.

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage
Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.
Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.
GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.
Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.
CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.

## Lots précédents (détail : CHANGELOG)
- 16/09 estate-2, GUI 1.0.179 : sous-sol cinéma/sauna/hammam/garage/golf, ondes audio, TV animées, jardin, cycle jour/nuit ; HVAC ON/OFF + Auto/1/2/3 (joins 610–615, a61, `docs/HVAC-2026-09-16.md`). LPZ non compilé, CPZ bloqué par Windows (`MSB3441`), aucun déploiement matériel.
- 16/09 lot Codex 1.0.178 : retours natifs de la fenêtre Centralisation (`receiveStateSelected` 401–405, 407–411, `src/themes/global-controls.css`) ; ne jamais remettre `[selected]` sans `="true"`. CH5Z/CPZ/LPZ préexistants préservés.

## Les 4 artefacts à suivre (convention validée le 13.09.2026)
Quatre versions à tenir alignées, ici et en tête de chaque entrée du CHANGELOG.
| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | source 1.0.183 ; installé : 1.0.181 rapporté | `deploy.ps1 -Target web` (CP4 192.168.1.200) / `-Target tsw -TswHost 192.168.1.16` — incrémente `version.json` à chaque build |
| CPZ slot 1 (C#) | 1.0.180.0 installé ; source modifiée 17/09 soir | **à recompiler** SIMPL# Pro + `deploy.ps1 -Target cp4` |
| LPZ slot 2 (SIMPL) | 1.0.181 compilé 17/09 16:25 ; SMW régénéré depuis (+`AV_Off`) | **à recompiler** (F12 sur `Project_Slot2.smw`) puis charger |
| Showcase Vercel | lot du 16.09 | `sync-villa-crans.py` puis push `main` → Vercel |

`meta.version` du `villa_config.json` s'aligne à la main sur la version du build.

## Arborescence (monorepo, depuis la restructuration du 11.09.2026)
`C:\dev\crestron\repo` — `projects/villa-crans/ch5` (GUI + C#, ce fichier à la racine) · `projects/villa-crans/simpl` (`contract/generate_slot2.js` → `simpl-windows/Project_Slot2.smw`, seul projet SIMPL ; l'historique `VillaCrans_Slot2.*` a été supprimé par Donatien le 17/09) · `apps/showcase` (site vitrine, clone de `donafcna/Crestronshowcase`, main → Vercel). Les anciens chemins `C:\Users\donat\Desktop\VillaCrans` et `VillaCrans SIMPL` ne sont plus utilisés.
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
Styles `mobile-xl` (fin de `<body>`), `mobile-ux` (moteurs animés, scènes `villa_scene_<pièce>_<n>`, MutationObserver), blocs `mobile-lot-0915/0916` ; cibles ≥ 44 px, repli `@media (max-height: 700px)`. Entête = pièces + engrenage.
Pièges : un style en ligne `!important` ne se reprend pas en CSS (le retirer du HTML) ; `ch5-button` → `width/height:100%` sur `> div` et `.cb-btn` ; `min-width:0` en grille ; les `customStyle` de `#source-control-overlay` sont `!important` un par un, ne pas les « nettoyer ».
## Lot smartphone 15-16.09.2026 — logique audio/vidéo et pièges CH5
- **Un seul point d'entrée pour les sources : `window.avSelect(join)`** (IIFE `AV`, identique dalle / iPhone) :
  confirmation musique / audio vidéo (`#audio-confirm-overlay`), `avOpenRemote` (ignore les événements non fiables →
  tests en `page.click`), `avRender()` pose `selected` / `audio-active` / `audio-music`. Badge égaliseur animé
  (`.tv-live-badge`) = source dont l'audio joue, sur tous les châssis.
- **`customClass` n'est PAS recopié sur l'hôte** : sélecteur `ch5-button[customClass~="x"] .cb-btn`, jamais `ch5-button.x`.
- Menu : pièces `actif:false` et `pagesSpeciales.video.actif=false` masqués par `villaPiecesActives(vc)`.
- Retirés à la demande : PRESET (406) des stores globaux, raccourcis de scène de la config du preset global, sélecteur
  de preset et ligne Climatisation du mode Vacances ; iPhone : grille sources 2 colonnes, Moteurs paginés.
- **Après toute reconstruction HTML par script : compter les `<div>`**, chaque fenêtre enfant direct de `body`.
  Sections conditionnelles par `applyPilotageVisibility`, jamais par heuristique sur le nom de la pièce.
- Outillage conteneur : `device_commit_files` avec un chemin de sortie neuf ; `src/villa_config.json` = copie de build,
  la source est `villa_config.json` racine.
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
## Pièges de la chaîne de déploiement (rencontrés en conditions réelles)
1. `deploy.ps1` en **ASCII pur + BOM** (sans BOM, PowerShell 5.1 lit cp1252 et casse la parité des chaînes).
2. Jamais de `node -e "..."` dans `Start-Process` : serveur dans `tools/serve_src.mjs` (port 4179).
3. `ch5-cli deploy` exige `-p` (mot de passe SFTP demandé), sort en code 0 même en échec → la page est vérifiée.
4. Node 23+ casse `ch5-cli` → `tools/ch5-compat.js` via `node --require`.
5. Banc bureau : CP4 `192.168.3.109`, SFTP `FTV`, `-CP4Host <ip>` ; `-SkipContrast` / `-SkipBuild` ; `-ExecutionPolicy Bypass`.

## Reste à faire
1. Recompiler CPZ (routage v4 + traces) → `deploy.ps1 -Target cp4` ; LPZ : F12 sur `Project_Slot2.smw` (+`AV_Off`) et
   charger ; CH5 : `deploy.ps1 -Target web` (CP4 .1.200) et `-Target tsw -TswHost 192.168.1.16`.
2. Recette matérielle du lot 1.0.183 : OFF → `AV_Off_fb` ↑↓, mute → une bascule par appui, zéro ligne PRESETS, tuile
   relâchée sous la télécommande ; deux supports sur deux pièces (a10 avant chaque commande) ; joins de télécommande.
3. Supprimer les 2010 signaux `R*_` du SMW ; chaîne d'alarme s43 / d44-46 ; `docs/03_CONTRAT_JOINS.md` en v4.
4. `villa_config.json` : noms de test (`REPAS2`, `TOTAL3`, `valeursParDefaut.scenesEclairage`) avant toute visite client.
5. Réserves : libellé « P » Swisscom ; scènes 201-204 encore au contrat ; `iphone.html` mute télécommandes (niveau).