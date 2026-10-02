# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

## 02/10/2026 — v6.0.3 → v6.1 : « Villa FTV », dossier `projects/villa-ftv`, correctifs de recette TSW, GUI sans menu
- Nom affiché **Villa FTV** (v6.0.3) ; dossier renommé `projects/villa-ftv` (f95281a8). Zoom tactile supprimé (`js/gesture-controls.js`, v6.0.4).
- Pont SIMPL : la pièce affichée est propre à l'écran, retour d11-40 / a10 produit localement (v6.0.5) ; `VillaMotors.render()` paresseux
  (lag ×5, v6.0.6) ; `VillaJoins.validIpId` (XPanel « Online (54) » = IP-ID 0x36 mémorisé) ; **repeat digital** (`sendObjectToNative` des
  `<ch5-button sendEventOnClick>`) et analogiques `{rcb}` (`bridgeReceiveObjectFromNative`) traduits (v6.0.7). Un seul `VillaPiece.usp`
  (`INTEGER_PARAMETER Piece`, `mP=2 / P1= / P2=Nd`), PIT ≤ 20 car. (`VillaCrans_Direct`), règle SIMPL+ 1307 (scalaires avant tableaux).
- **CrComLib : `Ch5SignalBridge.subscribe()` n'est jamais appelé** (`Ch5Signal._subscriptions` contient déjà `stateSubscription`) — la dalle
  pousse tous les joins, ne pas « corriger » les abonnements. Recette TSW ouverte : joins émis OK, retours non affichés (consigne, faders → 0
  après 1,5 s, sources) → lire le bloc « Pont SIMPL » de l'écran d'administration (appui long 3 s, `VillaJoins.diagText()`, v6.1).
  « Sauvegarder » des presets globaux (s420) = sans objet en v6.0 (valeurs fixes). Température `--` tant que `RETOUR_Temperature` non câblé.
- **v6.1 — `interface.menuPieces {visible, pieces, pieceParDefaut}`** (`js/nav-pieces.js` + `themes/nav-pieces.css`, doc § 3 bis) ; `?menu=0|1`,
  `?room=N` prioritaires ; sans menu : titre = pièce, appui court = fenêtre « choisir une pièce ». QR (`gen_qr.js`) et vitrine passent `menu=0&room=N`.
  **`applyTheme` ne retire plus que `theme-*`** (`body.className = ''` effaçait `vn-no-menu`, `modal-ouverte`). Site : `VillaFtvTools.jsx`
  (sélecteur « Espace », Général + pièces, pas sur smartphone). Batterie `tools/batterie-v61.mjs` (186 contextes, 0 rouge).
- **v6.2 — bouton « Recherche »** (`js/quick-actions.js` + `themes/quick-actions.css`, `interface.recherche {actif, suggestions}`) : catalogue depuis la
  config, mêmes impulsions que les boutons (`pulse(join)` = publishEvent true/false, `avSelect`, `animateGroupBlinds`, `openXxxModal`,
  `selectRoomFromConfig` / `changeRoomIphone`), historique `localStorage` (`villa_qa_recent`, `villa_qa_counts`), `window.villaCurrentLang()`,
  événement `villa-language-changed`. Tests `tools/qa-quick-actions.mjs`, `tools/batterie-v62.mjs`.
- PowerShell de Donatien : `git` absent du PATH → jamais de `git pull` dans les commandes ; commits/push via le PC (gitkraken). `deploy.ps1 -Target simpl` n'arrête plus le slot 2.

## 30/09/2026 — v6.0 : UN SEUL programme SIMPL (slot 1), plus de C# (CH5 1.0.215 + SIMPL à compiler, F12)
- `meta.backend = "simpl"` (Villa Crans) : chaque écran émet/reçoit les joins de SA pièce, join = 625 + (id−1)×125 + offset (626..2500 ;
  plafond des symboles de dalle SIMPL = 2511 digitaux → 15 pièces max). Table `contrat.simplDirect.mapping` (offsets compacts 1..125).
  `"csharp"`/absent = v5 inchangée (Appartement Crans-Montana). Version C# figée : branche git **`villa-crans-csharp-v5.5`**.
- Traduction au **pont natif** (`js/villa-joins.js`) : `CrComLib.Ch5SignalBridge.prototype.sendXToNative` patché à l'émission (couvre les
  `<ch5-button sendEventOnClick>` figés), `bridgeReceiveXFromNative` à la réception ; retours des autres pièces en cache, rejoués au changement de
  pièce. Série 421 (JSON scène) → impulsion 431-434 ; télécommandes globales précédées de a241 = pièce. HTML inchangé.
- `simpl/direct/generate_simpl.js` → `VillaCrans_Direct.smw` (socle CP4 sans EISC, 19 dalles sur les MÊMES signaux, 15 `VillaPiece_Rnn.usp` +
  `VillaGlobal.usp` générés avec les valeurs de la config) + `SIGNAUX.md`. Formats de symboles copiés d'HDH PRO4 v9 (TSW-770, XPanel 3.0,
  Crestron One, SIMPL+ SmC 103, index = ordre de déclaration). Contrôles `verifier_smw.py`, `croiser_contrat.py` ; GUI `tools/qa-simpl-v60.mjs`.
- `deploy.ps1 -Target simpl` : LPZ → /program01, retire l'ancien cpz, `progload -p:01`. Dalle 0x03 déclarée TSW-770 : Replace Device → TSW-1070.

## 29/09/2026 — v5.3 fenêtre Moteurs (joins 7-12 : 129-146, lamelles 111-128 / 157-174)
- `js/motors-controls.js` + `themes/motors-controls.css` : `moteurs` = { nombre 1..12, liste { nom, type, lamelles } }, pagination sans défilement,
  pas de `:has()` (TSW). Sur le banc aucun `<ch5-button>` n'émet (chaîne mesurable sur les `<button>` iPhone) ; classes sur l'hôte `<ch5-button>`.

## 29/09/2026 — v5.4 : interface « Connect » optionnelle + fonctions retirées par la config (à compiler : CH5 1.0.213, CPZ ; inclut v5.3)
- `meta.interface = "connect"` → `themes/connect.css` + `js/connect-ui.js` (chargés en fin de `index.html` / `iphone.html`) : interface
  d'application résidentielle épurée qui masque le Core (`html[data-iface=connect]`) et parle les mêmes joins v4.1 (d10+id, d51-54, a71-90,
  d81-98, d201-204, a31/s32/d49/d50/d610-615/a61, d401-409). Sans ce drapeau (Villa Crans) : inerte. API `window.ConnectUI`.
- C# : `LoadFeatureFlags` + `IsDisabledFeatureJoin` — `contrat.alarme.actif=false` ou aucune pièce `audioVideo.actif` → joins alarme / A/V
  ignorés à l'entrée (ni traitement ni miroir EISC). Villa Crans inchangée (alarme et A/V présents).
- `applyTheme` ne retire que `theme-*` depuis v6.1 ; Connect garde son état sur `<html>`.
- v5.5 : `connect-boot` dans le `<head>` (après `villa_config.js`) pose `data-iface` avant tout rendu → aucun flash du Core ; contrôle `apps/showcase/scripts/test-connect-flash.cjs`.

## 28/09/2026 — v5.1 : le Core sert un 2e projet, `projects/appartement-crans/` (lire son `CONTEXTE-CLAUDE.md`)
- Config propre + `tools/assemble.py` (copie `src/` + C# renommé) + `tools/generate_slot2.js` ; toute correction ICI puis `assemble.py` et `sync-appartement-crans.py`.
- Système : `<style id="touch-targets">` (cibles ≥ 40 px, `#circuits-container[data-cols]`), contraste Clair iPhone, ville météo `widgets.meteoActualites`. Noms de pièces ≤ ~16 caractères (menu dalle).

## 27/09/2026 — v4.7 : conversion iPhone terminée (CH5 à compiler, vitrine régénérée non poussée)
- **Sur l'iPhone (Crestron One), tout bouton à état est un `<button>`** : `pressDigital(N)` à l'appui, `subscribeState` → `toggleSelected` au retour,
  classe `.selected`. Le `<ch5-button receiveStateSelected>` n'y affiche ni l'appui ni l'état (5-20 s de retard, v4.4). Convertis : Centralisation
  401-411 (v4.4), partitions 301-312 (v4.6), scènes fenêtre Circuits 51-54 + HVAC 610-615 + sauna/hammam 620-621/624-625 (v4.7). Restent en
  `<ch5-button>` les impulsions sans état (49/50, 622/623, 626/627, télécommandes, 251-253). La dalle (`index.html`) garde ses `<ch5-button>`.
- **Scène OFF (51) = or comme les autres scènes ; OFF audio/vidéo (200) = rouge plein quand tout est éteint, sur tous les châssis** (v4.9, 28.09 ;
  v4.8 « scène OFF rouge » était un malentendu, annulé). Jetons `--av-off-*` dans `av-controls.css`, chargée par les deux HTML comme `scene-controls.css`.
- Piège dalle en Clair : `.theme-light .scene-btn:not([selected="true"])` d'index.html vise l'élément interne (jamais `selected`) → repeignait l'état
  sélectionné. Corrigé pour les scènes dans `scene-controls.css` ; à vérifier pour `source-btn`, `mute-btn`, `preset-btn`, `preset-text-btn`.
- Jetons par thème dans les CSS partagés, consommés par les deux formes : `global-controls.css` (`--global-*`), `alarm-controls.css` (`--alarm-*`),
  `room-controls.css` (`--hvac-*` sur `.hvac-controls`), `scene-controls.css` (`--scene-*` sur `#circuits-overlay`). Couleurs en `!important`
  à cause de la règle générique `.theme-light .custom-overlay-panel button` d'`iphone.html`.
- Deux jeux de boutons de scène sur l'iPhone : `scene-btn-5x` (page) et `circuit-scene-btn-5x` (fenêtre Circuits) ; abonnement, libellés
  traduits, pastille `data-saved`, appui long (`SCENE_SEL`, `sceneIdxOf` lit `data-join`) couvrent les deux.
- Batterie `tools/qa-v47.mjs <page> <dossier> [--w --h --base]` (pont natif factice) ; smartphone de référence : iPhone 18 Pro Max 440×956 (cf. `apps/showcase/CLAUDE.md`).

## Les 4 artefacts à suivre (convention validée le 13.09.2026)
Quatre versions à tenir alignées, ici et en tête de chaque entrée du CHANGELOG.
| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel + mobile) | **1.0.230** déployé le 02/10 (v6.0.7) sur TSW, XPanel, mobile ; v6.1 (config 1.0.224) **à compiler** (`-Target web`, `tsw`, `mobile`) | `deploy.ps1` incrémente `version.json` à chaque build, puis aligner `meta.version` |
| Showcase Vercel | prod suit `main` ; copie Villa FTV régénérée avec v6.1 | `sync-villa-crans.py` puis push `main` → Vercel |
## Fichiers qui comptent
- `src/index.html` (dalle TSW-1070, iPad, XPanel) et `src/iphone.html` : SOURCE DE VÉRITÉ. Blocs `<style id="tablet-sidebar">` (menu de gauche groupé), `<style id="global-modals-xl">` (modales agrandies), `<style id="theme-readability">` / `<style id="theme-overlays">` (thèmes Sombre / Clair / Verre dépoli).
- `src/js/villa-joins.js` : pont SIMPL v6.0 (actif si `meta.backend = simpl`) ; couche v3 désactivée ; `villaPiecesActives(vc)` et miroirs `data-join`.
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
- Sources : vidéo 151-154 en interlock, Musique 155 indépendante (badge audio), 156 = retour audio vidéo ; premier appui = activation + télécommande ; scènes mémorisées par le C# (v4.1, plus de `localStorage`) ; bandeau « État de la villa ».
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
- **Scènes d'éclairage → circuits (13.09).** `pieces[].pilotages.eclairages.scenes.niveaux` (0-65535 par circuit) ; **le slot 2 fait foi** dès qu'un niveau remonte sur +71..+90 (`_circuitFromSlot2`) — sauf rappel explicite ou scène mémorisée (v4.1). Démarrage scène 1.
## GUI smartphone — agrandissement (14.09.2026)
Styles `mobile-xl` (fin de `<body>`), `mobile-ux` (moteurs animés, MutationObserver), blocs `mobile-lot-0915/0916` ; cibles ≥ 44 px, repli `@media (max-height: 700px)`. Entête = pièces + engrenage.
Pièges : un style en ligne `!important` ne se reprend pas en CSS (le retirer du HTML) ; `ch5-button` → `width/height:100%` sur `> div` et `.cb-btn` ; `min-width:0` en grille ; les `customStyle` de `#source-control-overlay` sont `!important` un par un, ne pas les « nettoyer ».
## Plan 3D (16.09.2026) — fond de page du SITE, le GUI des châssis ne change jamais
Vidéo par défaut ; `apps/showcase/src/components/Plan3DBackground.jsx` ne la remplace que dans les cas de `PLAN3D_RULES` (aujourd'hui :
châssis Smartphone). 3D active ⇒ châssis calé à gauche (`.plan3d-on`, `--chassis-scale`). `public/plan3d/plan3d.js` (Three.js) lit le GUI
à travers l'iframe (CrComLib a10, a71-80, d150-156, clics `ch5-button[data-join]`), API `window.__plan3d`. Détail : `apps/showcase/CLAUDE.md`.
**Malentendu du 16.09 à ne pas répéter** : une demande « plan 3D / fond d'écran » vise le site Vercel, jamais le GUI.
## Vitrine (apps/showcase, crestrongui.vercel.app)
Copie régénérée par `python apps/showcase/scripts/sync-villa-crans.py <chemin>/projects/villa-ftv/ch5/src` (jamais éditée à la main) ; `meta.mode = "showcase"`, feedback simulé par `js/local-feedback.js`, curseur de démo. Le script copie aussi `js/villa-joins.js` ; `js/local-feedback.js` est propre à la vitrine.
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
6. **Jamais deux clés d'un même objet JSON qui ne diffèrent que par la casse** (`MUSIQUE` / `Musique` dans `traductions`) : `ConvertFrom-Json` de PowerShell 5.1 refuse le fichier et `deploy.ps1` s'arrête avant le build, alors que `JSON.parse` et Python les acceptent en silence. Contrôlé désormais par `tools/quality/validate-config.mjs`.
## Reste à faire
1. **v6 recette TSW** : retours processeur → écran (lire le bloc « Pont SIMPL » de l'écran d'administration sur la dalle) ; câbler `Rnn_PILOTE_*`,
   `Rnn_RETOUR_Temperature`, `TELECOMMANDE_*` ; recette Debugger (`simpl/direct/README.md`). Supprimer `src/js/slats-controls.*` (+ copies vitrine). Recopier le Core dans l'Appartement (`assemble.py`).
4. Bêta Alexandre : `prepare-project` + binaires depuis `docs/verification/2026-09-18-beta-alexandre/README.md`, recette A01-A12.
5. Core (P2) : `sourcesAudioVideo[].type` lu par HTML / C# / générateur ; nommer les offsets +41..57 / +81..92 dans `generate_slot2.js` ;
   générateur lisant `signauxGlobaux` ; supprimer les 2010 `R*_` v3 du SMW ; commentaires C# « 10 circuits » et v3 au prochain recompilé.
6. Trancher la référence smartphone (iPhone 16 Pro du vocabulaire figé vs iPhone 18 Pro Max du 26/09) et l'écrire aux deux endroits.
