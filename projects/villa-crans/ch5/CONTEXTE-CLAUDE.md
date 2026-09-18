# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

## 18/09/2026 (après-midi) — P1 Reprise : contrat v4.1 documenté, config purgée, outillage Codex re-basé (session Cowork « Crestron CH5 », commit sur main, pas poussé)
- **Deux sessions Claude ont travaillé le même jour** : l'autre a livré v1.0.186 → 1.0.191 → traductions (nuit) ; cette session a archivé son working tree (commit `f9804689`, branche `backup/crestron-local-2026-09-18` poussée) puis livré P1 par-dessus. Avant toute livraison : `git status`, jamais deux sessions en écriture en même temps (leçon du 5/9).
- **Passation du 17.09** (`docs/PASSATION-2026-09-17.docx`) : trois piliers Showcase / AV Channel Projects / Academy, roadmap P0→P4. Rapport P0 et annexe contrat : docs du projet Cowork `80-p0-reprise`, `81-p0-contrat-joins`. Vocabulaire : **Crans-Montana**, jamais « Grand Montana » (renommé dans `tools/quality` et `docs/industrialisation`).
- `villa_config.json` : `meta.version` aligné sur `version.json` (**1.0.196**) ; `blocsPiecesGui.mapping.analog` complété 81-90 (= `V4AnalogOffsets`) ; sources renommées comme dans le GUI (Apple TV / Sky Q / Swisscom / IPTV / MUSIQUE — les libellés du GUI sont en dur dans les HTML) ; **noms de test purgés** (scènes REPAS2 / TOTAL3 / vulgaires → REPAS / TOTAL / AMBIANCE, source « Box pirate », 11 clés orphelines de `traductions`, `AMBIANCE` ajouté en 4 langues). `src/villa_config.*` et copie vitrine régénérés (`clean_config` de `sync-villa-crans.py`). `generate_slot2.js` sur copie : **SMW identique**, pas de LPZ à refaire pour ce lot.
- **Docs** : `03_CONTRAT_JOINS.md` retitré v4.1 avec un §0 « Principe v4 » (§1/§5/§6 marqués historiques) ; `README_SLOT2.md` renommé `Project_Slot2`, section « État v4.1 » (ce que le slot 2 reçoit / renvoie, entrées EISC mortes, offsets sans nom), la section « logique à câbler » du 16.09 est **corrigée** (le feedback vient du C#, pas d'interlocks slot 2) ; `04_SIMPL_SLOT2.md` bandeau historique. Vérité : le C# ignore les entrées EISC globales `Source_Select_n`, `Audio_Mute`, `Motor_n_*`, `Shades_Scene_n`, `Circuit_n#`, `Room_Select#` ; il lit 41/42, 44/45, 301-312, 410/411 et les `_Actual` par pièce.
- **`tools/quality` (Codex) re-basé** : `validate-config` accepte 20 circuits, `audit.mjs` lit `Project_Slot2.smw`, `runtime-v4.json` = profil `crans-montana-v4.1-gui1.0.196-csharp1.0.192.0` (13 empreintes recalculées), exemple Villa Léman réaligné ; **43/43 tests node verts** (`node --test tools/quality/quality.test.mjs tools/quality/compatibility.test.mjs`, React requis dans `apps/showcase/node_modules`). Bêta Alexandre : profil `docs/verification/2026-09-18-beta-alexandre/` (0 défaut `--release`), notice mise à jour ; **binaires à compiler par Donatien** (README du dossier).
- Chantiers Core identifiés, non traités : type de source non paramétrable (Apple TV / Sky Q / Swisscom / IPTV figés dans HTML, C# l. 2153, GEN l. 222) ; offsets +41..57 / +81..92 poussés par `PushRoomFeedback` sans nom EISC ; générateur qui duplique les plages au lieu de lire `signauxGlobaux` ; bornes HVAC, presets, IP-ID en dur dans le C#. Doc projet Cowork `81-p0-contrat-joins`, § 4.

## 18/09/2026 (nuit, autre session) — traductions complètes + appui long iPhone (à compiler : dalle, web, mobile)
- Deux mécanismes de traduction : (1) textes fixes = `data-i18n="clé"` + dictionnaires `translations` (fr/en/es/de/ru) dans chaque HTML, `window.villaI18n(clé)` ; (2) noms venant de `villa_config.json` = table `traductions.<lang>[texte FR]` via `villaTranslateName()` ; texte fixe à traduire par cette table = `data-tname`. **Tout nouveau libellé passe par l'un des deux** ; le mode CVC du sériel 33 (FR côté C#) se traduit à l'affichage (`villaHvacModeText`), jamais `data-ch5-textcontent` sur un texte traduit.
- iPhone : appui long fiabilisé (iOS annulait le pointer : `touch-callout`, `user-select`, `contextmenu`) ; en-têtes `clamp()` + retour à la ligne ; `global-controls.css` point de rupture 480 px. Restent en français par choix : noms de test des circuits, caméras de démo, options techniques du preset global.

## 18/09/2026 (soir, autre session) — contrat v4.1 : scènes mémorisées par le C#, 20 circuits (v1.0.191 : CH5 TSW + XPanel et CPZ chargés, validés ; LPZ compilé 18/09 05:20, recette Debugger à faire)
- Scènes : 💾 → sériel 421 `{p,s,c[%]}` (compact) → `/user/scenes_<pièce>.json` ; rappel = bouton 51-54 seul, le C# impose les niveaux (scène mémorisée > table `niveaux` ; « le slot 2 fait foi » seulement au démarrage) ; marqueurs 💾 = d421-424. Plus de `localStorage` de scène (showcase `local-feedback.js` simule le C#). 20 circuits : joins 71-90, `MaxCircuits`, bloc pièce a+71..+90, `MAX_CIRCUITS`. SMW : bloc éclairage par pièce (`Rxx_Lighting_SceneN_fb` / `_Actual`, `Rxx_Circuit_N_fb#` / `_Actual#`).
- Règles apprises : **le CP4 tronque à 119 caractères tout sériel émis par un écran** → jamais de JSON long des panneaux vers le C# ; sur une ligne partagée jamais de largeur fixe (flex + minimum) ; ne jamais animer `visibility` ; les HTML du dépôt sont en CRLF.

## 18/09/2026 (autre session) — HVAC dalle/tablette + feedback Contrôle global (v1.0.186)
- Fenêtre HVAC : consigne à gauche, ON/OFF à droite, « Ventilation » en ligne avec AUTO/1/2/3 ; trait sous l'onglet seulement s'il y a plusieurs onglets (`climate-tabs--single`). Active si `contrat.cvcEtendu.actif`. Contrôle global : 401-405 / 407-409 n'avaient aucune entrée C# → `_global*Selection`, `PushGlobalSelectionFeedback`, `ClearGlobalSelection` ; contrat 03 : 401-409 en ↔.

## 17/09/2026 — feuille de route (conversation vocale ChatGPT ; détail : docs du projet Cowork 00, 10, 30, 60)
- Nom : **Crans-Montana**, jamais « Grand Montana » ; « Villa Gemini » = même projet.
- Étapes : V1 stable → bêta Alexandre (chaque blocage = à simplifier ou à passer dans `villa_config.json`) → « Core Fréquence TV » réutilisable → toutes les GUI du showcase au niveau Villa Crans → livrable client. Horizon 1–2 mois.
- Architecture cible : CH5 + C# générique maintenus par l'IA ; le programmeur ne touche que le JSON de config et SIMPL. Critère : un programmeur SIMPL qui ne connaît ni CH5 ni C# déploie seul.
- Premier chantier : audit de la Villa Crans (design system, composants, interactions, points de rupture, animations, contraintes physiques) + contrat de données JSON ↔ C# ↔ SIMPL ↔ CH5.
- Qualité en amont : cohérence architecturale/physique → AV → graphique/fonctionnelle ; chaque correction devient une règle écrite, puis un contrôle automatique si possible.

## 17/09/2026 (soir) — lot 1.0.183 : OFF, mute, logs PRESETS, tuiles pressées (détail : CHANGELOG)
- **Un `<ch5-button sendEventOnClick="N">` émet SEUL l'impulsion** : jamais de `publishEvent('b',N,true)` en plus dans son `onclick` (2 fronts, `true` jamais relâché). `sendPowerOff` (200) et `toggleMute` (55) n'émettent plus ; l'état vient du `receiveStateSelected`.
- **Un join sans nom dans le slot 2 est invisible au debugger** : vérifier `generate_slot2.js` d'abord. Logs de repli C# → `Trace()`. Faders du preset global = `<input type="range">` locaux, émission à « Enregistrer » (s420). `avReleaseTilesSoon()` relâche les tuiles sources.
- `deploy.ps1 -Target web` : rappel de certificat compilé + repli `curl.exe -k`. Recette : `node tools/recette-off-sources.mjs http://localhost:4179 apres <dossier>` + `tools/check_contrast_dom.mjs --root … --min 4`.
- Réseau de Donatien : **CP4 192.168.1.200, TSW 192.168.1.16** ; banc bureau CP4 192.168.3.109. iPhone : IP-ID 0x06 par défaut **non enregistré** → passer par les QR (`?ipId=0x1N&room=N`, 0x11-0x1E) sinon hors ligne. Réserve : `iphone.html` `toggleMute` publie un niveau 55 hors `<ch5-button>`.

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage (détail : CHANGELOG)
Local technique au sous-sol (17 pièces vitrine), **sous-sol sans fenêtres**, wellness sauna/hammam cloisonné, garage, voisinage et paysage ; 4 programmes TV 3D partagés 640×360, ondes audio selon le volume. GUI : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, sauna 60–100 °C, hammam 90–100 %, HVAC 16–28 °C ; joins d620–627, a/s62–65, C# `WellnessState`, EISC nommés (`docs/WELLNESS-2026-09-17.md`). CH5Z + CPZ 1.0.180.0 compilés, LPZ non compilé, rien déployé dans ce lot. Preuves : `Claude outputs/room-revision/livraison`.

## Les 4 artefacts à suivre (convention validée le 13.09.2026)
Quatre versions à tenir alignées, ici et en tête de chaque entrée du CHANGELOG.
| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | source **1.0.196** (`version.json` = `meta.version`) ; installé 1.0.191 (TSW .1.16, XPanel CP4 .1.200) ; lot traductions **à compiler** | `deploy.ps1 -Target web` (CP4 192.168.1.200) / `-Target tsw -TswHost 192.168.1.16` — incrémente `version.json` à chaque build, puis aligner `meta.version` |
| CPZ slot 1 (C#) | 1.0.191.0 chargé ; source `AssemblyInfo` 1.0.192.0 | SIMPL# Pro + `deploy.ps1 -Target cp4` |
| LPZ slot 2 (SIMPL) | v4.1 compilé 18/09 05:20 (`Project_Slot2.lpz`), **jamais testé sur matériel** ; SMW inchangé par P1 | F12 sur `Project_Slot2.smw` puis charger |
| Showcase Vercel | prod = `74cd4a41` (17.09) ; copie locale à jour (lots 18/09 + P1), **non poussée** | `sync-villa-crans.py` puis push `main` → Vercel |

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
1. **Push de `main`** (2 commits locaux : archive + P1) → déploie la vitrine (traductions) sur Vercel ; vérifier en ligne ensuite. Attendre le GO de Donatien.
2. LPZ v4.1 : charger `Project_Slot2.lpz` et recette Debugger (rappel de scène → `Rxx_Circuit_N_fb#`, 💾 → aucun join, dalle ↔ iPad, progreset). Compiler le lot traductions (`-Target web`, `-Target tsw`) puis aligner `meta.version`.
3. Bêta Alexandre : `prepare-project` + CH5Z / CPZ 1.0.192.0 / LPZ depuis `docs/verification/2026-09-18-beta-alexandre/README.md`, manifeste des binaires, recette A01-A12.
4. Core (P2) : `sourcesAudioVideo[].type` lu par HTML / C# / générateur ; nommer les offsets +41..57 / +81..92 dans `generate_slot2.js` (puis F12) ; générateur lisant `signauxGlobaux` ; supprimer les 2010 `R*_` v3 du SMW ; commentaires C# « 10 circuits » (l. 1854, 2089) et v3 (l. 1791) au prochain recompilé.
5. Recette matérielle du lot 1.0.183 (OFF → `AV_Off_fb` ↑↓, mute une bascule, tuiles relâchées) ; iPhone Crestron One « connecting » (IP-ID 0x06 non enregistré → QR `?ipId=0x1N&room=N`).
