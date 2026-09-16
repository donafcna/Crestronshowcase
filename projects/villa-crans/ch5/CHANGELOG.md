# Villa Crans CH5 — journal des versions

## v1.0.177 (à compiler) — 15-16.09.2026 — Contrat v4, XPanel du bureau, lot smartphone Sources / Moteurs / Swisscom

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.176 (XPanel sur le CP4 du bureau 192.168.3.109) | **à relancer** : `deploy.ps1 -Target web -CP4Host 192.168.3.109` |
| CPZ slot 1 | 14.09 (v3) | **à recompiler** : routage v4 des joins globaux vers la pièce affichée (voir ci-dessous) |
| LPZ slot 2 | 15.09 (v3) | **à régénérer** : `generate_slot2.js` v4 + F12 (consigne ± dans le bon sens, join 156), buffers sur `Room_Select#` |
| Showcase Vercel | lot du 16.09 | `index.html` + `iphone.html` + config régénérés, poussés |

### Contrat de joins v4 (décision du 15.09)

- **Joins de pilotage identiques dans toutes les pièces** (sources 150-156, télécommandes 211-220 /
  500-527 / 530-557 / 560-600, scènes stores 201-204, stores groupés 61-69) ; **SIMPL route sur
  `Room_Select#` avec des buffers** pour ne pas surcharger le debugger Toolbox. Le v3 (bloc par
  pièce) est désactivé (`contrat.blocsPiecesGui.actif=false`) : sa réécriture d'attribut n'émettait
  pas — aucun join Apple TV / Sky Q ne remontait dans le debugger. `generate_slot2.js` : 107 signaux
  `Remote_*`, 1980 câblages de blocs pièces retirés (les définitions `R01_..R15_` restent à
  nettoyer dans SIMPL Windows). 75 boutons de télécommande de la dalle portent leur join en dur.

### Slot 1 (C#) et slot 2 — recette TSW du 16.09

- **Aucun feedback sur la dalle (fond violet, badge audio, confirmation musique, consigne)** :
  depuis le v3 le C# n'appliquait que les blocs >= 1000 ; en v4 la GUI émet sur les joins globaux,
  que le C# recopiait vers l'EISC sans les traiter. Ajout du routage v4 : join global → pièce
  affichée par le panel (`V4DigitalOffsets` / `V4AnalogOffsets`, copie de `blocsPiecesGui.mapping`)
  → même logique métier (`ApplyRoom*Command`) ; `PushRoomFeedback` renvoie aussi l'instantané sur
  les joins globaux aux panels qui affichent la pièce. Les signaux venant du slot 2 ne sont pas
  routés (ce sont des feedbacks).
- **Consigne ± invisible dans le debugger** : `HVAC_Setpoint_Up/Down` (49/50) étaient câblés en
  entrée du symbole EISC (sens slot 2 → GUI) ; passés en sortie (reçus), anciennes entrées purgées.
  Join 156 (`Source_AudioReturn`) ajouté, il manquait dans toutes les générations.
- ACTIVER / DÉSACTIVER verts ensemble : `selectGlobalControl` forçait `selected` dans le DOM ;
  neutralisée, le C# tient déjà l'interlock 410/411.
- `README_SLOT2.md` : tableau de la logique à câbler côté slot 2 (interlocks, toggle musique).

### Chaîne de déploiement

- `deploy.ps1` réparé et fiabilisé : ASCII pur + BOM, serveur `tools/serve_src.mjs`, `ch5-cli -p`,
  `tools/ch5-compat.js` (Node 24), succès vérifié par HTTPS, `-CP4Host`, `-SkipContrast`, `-SkipBuild`.
  Détail dans `CONTEXTE-CLAUDE.md` § Pièges.

### Tous châssis

- Menu : « Garage & ateliers » (pièce 15 `actif:false`) et « Vidéo » masqués, réversibles dans
  `villa_config.json` ; QR codes régénérés sans la pièce 15.
- Tuiles de source : couleurs du projet en activé / désactivé (fonds blancs sur XPanel corrigés)
  via `ch5-button[customClass~="…"] .cb-btn` — cette version de CH5 ne recopie pas `customClass`
  sur l'hôte.
- Thème clair : icônes haut-parleur et Power en noir. Bouton PRESET retiré des stores globaux.
  Configuration du preset global sans TOTAL / REPAS / CINÉMA / ÉTEINDRE. Mode Vacances : sélecteur
  de preset et ligne Climatisation retirés, titre « Sélection des pièces : simulation de présence
  aléatoire ».
- **Sources : logique audio/vidéo unifiée (`avSelect`)** — confirmation « musique ou audio de la
  vidéo », télécommande ouverte ensuite, **badge égaliseur animé** sur la source dont l'audio joue
  (iPhone aligné sur la dalle le 16.09, liseré sombre en thème clair pour la musique).

### Smartphone

- « Sources » (titre) / « Source » (onglet), en-têtes à gauche, pas de titre Éclairage dans une
  pièce sans éclairage, voile noir flouté qui bloque les clics sous les fenêtres.
- Moteurs : pagination (Stores atteignable), presets par famille Volet / Rideaux / Stores
  (Tout ouvrir / Demi-ouverture / Tout fermer).
- Sources : grille 2 colonnes, MUSIQUE pleine largeur, doublon « Musique / lecteur média » retiré,
  engrenage MUSIQUE → lecteur média (page vide corrigée), bouton Musique plus rogné.
- Swisscom : volume ± / ✦ / ⇥ / sourdine retirés, boutons agrandis (grille 5 colonnes).

## v1.0.175 — 15.09.2026 — Smartphone : télécommandes alignées sur la dalle, stores et icônes de moteurs

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.174 | `iphone.html` modifié — `.\deploy.ps1` à relancer |
| CPZ slot 1 | 14.09 | inchangé |
| LPZ slot 2 | 15.09 | inchangé |
| Showcase Vercel | lot du 15.09 | `iphone.html` régénéré |

### Moteurs

- **Icônes reprises à l'identique de la dalle**, trois familles au lieu d'une seule : volets et
  moteurs génériques en lamelles cyan, **rideaux à double pan bleu ciel** (`curtain-left/right`),
  stores en lamelles vert d'eau. La famille est déduite du libellé, donc la fenêtre Moteurs,
  régénérée à chaque pièce, classe aussi « Rideau ext. 1 » et « Store 2 » correctement.
- **Ligne « Stores » ajoutée** (joins 67-69) : elle existait sur la dalle, pas sur le smartphone.
  Les trois lignes tiennent sans défilement, y compris sur iPhone SE (lignes resserrées dans le repli).

### Télécommandes

- **Apple TV alignée sur la dalle, qui fait référence** : mêmes six boutons — croix directionnelle
  en croix, OK au centre, Menu — et mêmes proportions. Accueil, lecture/pause, volume ± et sourdine
  ont été retirés du smartphone : ils n'existent pas sur le châssis de référence. La disposition
  passe en colonne (croix puis Menu), le châssis étant en portrait.
- **Sky Q et IPTV agrandis** : la disposition n'occupait que 484 px sur les 675 disponibles, elle en
  prend 633. Croix directionnelle 190 → 268 px, hauteurs et espacements augmentés, pastilles de
  couleur 26 → 44 px. Plus aucune cible sous 40 px sur iPhone 16 Pro (21 avant).
- **Défaut corrigé : la zone cliquable ne suivait pas le bouton dessiné.** `.cb-btn` gardait sa
  taille par défaut (66 × 33 px) : on pouvait viser une flèche de la croix Apple TV et ne rien
  déclencher. Elle épouse désormais le bouton — plus petite cible réelle : 70 px sur Apple TV,
  41 px sur Sky Q. **Le même défaut existe sur la dalle** (`index.html`), non corrigé ici.

### Swisscom TV

Reprise au même niveau que les autres. Les touches étaient à 33 px et 40 des 41 cibles passaient
sous 40 px. Deux corrections :

- **Toutes les touches rondes le sont vraiment.** L'étirement en hauteur avait transformé PG±, CH±
  et les pastilles de couleur en ovales — largeur et hauteur sont de nouveau égales partout.
- **Volume / P et pavé numérique côte à côte** au lieu d'empilés. Empilés, la disposition faisait
  1082 px de haut : l'échelle tombait à 0,61 et annulait tout agrandissement. Côte à côte, elle fait
  905 × 478 — largeur et hauteur arrivent à saturation en même temps, c'est l'optimum de cette
  structure. Échelle 0,695, **touches à 47 px** (33 avant), plus petite cible 38 px (18 avant),
  8 cibles sous 40 px au lieu de 40. « radio » n'est plus tronqué en « ra… ».

### Contrôles

Playwright : 2 châssis × 3 thèmes × 13 écrans, aucun débordement hors des deux listes défilantes
assumées (Caméras, Configuration preset), aucune erreur console. Contraste complet
(`check_contrast_dom.mjs`, 3 thèmes × page + 10 fenêtres + états d'alarme, dalle et smartphone) :
aucun texte sous 4:1.

## v1.0.174 — 14.09.2026 — GUI smartphone : entête allégée, plus aucun défilement, scènes et moteurs au niveau de la dalle

Deuxième lot de retours sur le châssis iPhone. Deux consignes générales en sortent, consignées
dans CONTEXTE-CLAUDE.md : **aucun défilement dans les GUI** et **occuper la place au mieux,
jamais de bouton trop petit**.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.174** | `.\deploy.ps1` — chargée sur la TSW 192.168.1.16 le 14.09 (PROJECTLOAD OK) |
| CPZ slot 1 | recompilé le 14.09 | SIMPL# Pro puis `-Target cp4` — chargé sur le CP4, slot 01 rechargé |
| LPZ slot 2 | régénéré le 15.09 | `generate_slot2.js` + F12 — **chargé sur le slot 2 du CP4** |
| Showcase Vercel | lot du 14.09 | poussé sur `main`, déploiement automatique |

**Les quatre artefacts sont alignés pour la première fois** (15.09.2026, 05:44) : archive CH5 sur la
TSW et le XPanel, CPZ sur le slot 1, LPZ sur le slot 2, vitrine en ligne.

Réserve sur le slot 2 : `generate_slot2.js` **ajoute** des signaux, il n'en retire pas. Les 15
`R<nn>_Lighting_Master` (+ `_CMD`) de l'analogique +21, sorti du contrat le 13.09, sont toujours
câblés sur le symbole EISC. Plus personne ne les écrit : ils resteront à 0 dans le debugger.
Sans effet sur le fonctionnement, mais trompeur pendant la recette.

### Entête et fenêtre Réglages

- **« Pièce active v1.0.x : » retiré.** Le libellé, la version et l'état de connexion occupaient une
  ligne entière et poussaient l'engrenage hors du cadre. La ligne se réduit à la liste des pièces
  (52 px) et à l'engrenage (52 px) : ~46 px rendus au contenu.
- **Version et état de connexion dans la fenêtre Réglages**, entre le titre et le bouton Fermer.
  L'appui long de 3 s qui ouvre la console d'administration suit la version (il était sur
  « Pièce active »). `active_piece` n'existe que sur smartphone : la dalle n'affichait pas ce texte.

### Aucun défilement

`html`, `body` et les panneaux d'onglet passent en `overflow: hidden`, toutes les barres de
défilement sont masquées (`::-webkit-scrollbar`, `scrollbar-width`). Les trois pages et les fenêtres
Sécurité, Centralisation, Réglages, Moteurs et télécommandes tiennent désormais à l'écran sur
iPhone 16 Pro **et** iPhone SE. La page Source a été recompactée pour le petit écran
(sources 42 px, engrenages 40 px, marges resserrées).
**Exception assumée** : Caméras (10 flux), Circuits et Configuration preset gardent un défilement —
ces listes sont par nature illimitées ; la barre est masquée, rien ne bouge en dehors d'elles.

### Télécommandes — toutes les sources

- **Mise à l'échelle automatique** (`fitRemoteLayout`, repris de la dalle mais autorisé à agrandir,
  plafond 2,4) : la disposition est dessinée à taille fixe puis étirée pour remplir la fenêtre, qui
  passe elle-même à 92 % de la hauteur d'écran. Apple TV gagne **×1,68**. Sky Q et Swisscom étaient
  déjà à la largeur maximale : elles gagnent la hauteur et perdent leur défilement.
- **Défaut corrigé au passage : les trois télécommandes sortaient entièrement en bleu.** Le fond
  générique des boutons CH5 (`#0369a1 !important`) écrasait leur `customStyle`, alors que la dalle
  les rend en gris anthracite. Les 80 `customStyle` de la fenêtre sont désormais marqués
  `!important` : le style en ligne repasse devant, Siri Remote redevient grise et les touches de
  couleur retrouvent leurs couleurs.

### Scènes mémorisées sur iPhone

Appui long (0,9 s) sur OFF / CINÉMA / REPAS / TOTAL : les niveaux des circuits de la pièce sont
enregistrés sous **la même clé que la dalle** (`villa_scene_<pièce>_<n>`, même structure JSON).
Pastille dorée sur le bouton mémorisé, message fugitif, rappel des niveaux à l'appui court.
Les niveaux sont suivis par abonnement aux analogiques, avec repli sur la valeur des curseurs.

### Icônes de moteurs animées

Les lamelles descendent à la fermeture et remontent à l'ouverture en 1,5 s, comme sur la dalle ;
l'icône pulse tant que le moteur bouge et ▪ la fige à sa position réelle en cours de course.
Posées devant chaque libellé, page et fenêtre Moteurs, y compris sur les lignes régénérées à chaque
changement de pièce (MutationObserver).

### Contrôles

Playwright headless : 2 châssis (iPhone 16 Pro, iPhone SE) × 3 thèmes × 13 écrans. Aucun
débordement, aucune erreur console, aucun élément hors cadre hors des deux listes ci-dessus.
Limite connue : les touches des télécommandes Sky Q (21) et Swisscom (73) restent sous 40 px — ce
sont des télécommandes physiques à 40+ touches, il faudrait les paginer pour aller plus loin.
Garde-fou posé sur `closeAllModals`, qui plantait en vitrine (`closeAdminModal` y est retiré).

## v1.0.173 — 14.09.2026 — GUI smartphone agrandie, barre d'outils de la vitrine allégée

Lot de retours de Donatien sur le châssis iPhone de la vitrine. Tout passe par des blocs de style
partagés : un seul `<style id="mobile-xl">` dans `iphone.html` pour l'agrandissement, aucune valeur
posée écran par écran.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.173** | `.\deploy.ps1` — chargé sur la TSW 192.168.1.16 (PROJECTLOAD OK), XPanel déposé sur le CP4 |
| CPZ slot 1 | — | `Villaftv.cpz` transféré et `progload -p:01` lancé — **l'archive vient de `dist/`, à recompiler dans SIMPL# Pro si `ControlSystem.cs` du 13.09 n'y est pas encore** |
| LPZ slot 2 | — | inchangé |
| Showcase Vercel | poussé sur `main` | déploiement Vercel automatique au push |

Les 1.0.171 et 1.0.172 ont été consommées par deux `deploy.ps1` interrompus (la TSW ne répondait
pas : `Network error: Connection timed out`). Numéros sautés, pas de version livrée.

### Vitrine (apps/showcase)

- **Bouton « Présentation » retiré** de la barre d'outils (`DemoToolbar`) et de son câblage
  (`Showcase.jsx` : `presenting`, `onTogglePresentation`, `handleTogglePresentation`). La démo
  automatique se met déjà en pause au premier geste et la bulle « Reprise de la démo dans N
  secondes » la relance : le bouton faisait doublon. Clés `tool_present` / `tool_present_stop`
  supprimées en FR/EN/DE.
- **Démo automatique active sur tous les supports.** Elle ne démarrait que sur PC
  (`isDesktopPointer`) ou en mode salon : sans le bouton « Présentation », elle n'était plus
  démarrable à la main sur mobile et tablette. Le premier geste la met en pause, le visiteur
  tactile garde donc la main immédiatement.
- **Bulle de reprise en bas à gauche dans tous les modes** (`marketing.css`). À droite elle
  recouvrait la colonne Dalle / Tablette / Smartphone. La prop `side` de `DemoCountdown` et la
  classe `demo-countdown--left` disparaissent : une seule position, plus de variante.
- **Bouton « Plein écran » caché** (`showEmbedTool`, faux par défaut) : doublon avec le bouton
  Scène du châssis. Le plein écran reste accessible par l'adresse, sur le modèle de /1 et /0 du
  Mode Dev : **`/3` affiche la GUI seule sur toute la fenêtre, `/4` revient au Mode normal**
  (`hooks/useGuiFullscreen.js`, mémorisé par navigateur, suffixe retiré de l'URL, Échap en
  échappatoire). Le contenu de l'écran est extrait dans `guiContent` et servi à l'identique dans
  le châssis et en plein écran.
- Vocabulaire figé : `scale_caption_too_small` disait « mode Présentation », qui n'existe pas —
  remplacé par « Mode Scène » (FR/EN/DE).

### GUI smartphone (`src/iphone.html`)

- **Caméras sans filtre vert.** Le flux portait `sepia(100%) hue-rotate(90deg) saturate(180%)` —
  une vision nocturne simulée. Les images sont les mêmes que sur la dalle et l'iPad : elles ont
  désormais aussi le même traitement (`contrast(108%) brightness(98%)`), les mêmes scanlines
  discrètes et le même cartouche de nom (blanc sur fond sombre, il était vert).
- **Agrandissement général** (`<style id="mobile-xl">`) : entête, scènes d'éclairage (48 → 60 px),
  moteurs, boutons Alarme / Caméras / Global (36 → 46 px), ± du HVAC (60 → 72 px), sources
  (→ 66 px) et leurs engrenages (26 → 44 px), barre de navigation, et toutes les modales —
  Sécurité, Caméras, Centralisation, Configuration preset, Réglages, Circuits, Moteurs
  (panneaux 380 → 440 px de large, 85 % → 92 % de haut). Aucune cible tactile sous 40 px.
- **Pavé de code Sécurité** : afficheur 180×42 → 240×62 px, touches 60×48 → 96×66 px, libellés à
  1,7 rem. Les tailles en ligne portaient `!important` et bloquaient toute reprise en CSS : elles
  ont été retirées du HTML et le pavé est réglé par le bloc partagé.
- **Boutons CH5 des modales** : la division interne de CH5 ne suivait pas la taille de l'hôte — le
  fond débordait du bouton et le libellé, à l'étroit, se faisait tronquer (« DÉSACTIVER » rendu
  « DESACT… »). Corrigé pour Centralisation, Sécurité, Circuits et Moteurs.
- **Engrenage de la ligne « Pièce active »** : il sortait du cadre de 19 px (bloc de gauche en
  `white-space: nowrap` sans `min-width`). La ligne passe sur deux niveaux : libellé au-dessus,
  liste des pièces et engrenage en dessous, sur toute la largeur.
- **Grilles de scénarios** des modales Éclairages / Stores : `min-width: 0` sur les éléments de
  grille, qui ne rétrécissent pas sous leur contenu par défaut et sortaient du panneau.
- **« Sélection de la source audio et vidéo » → « Source audio et vidéo »** (FR/EN/ES/DE/RU) :
  titre d'onglet et libellé de la barre basse, qui tenait sur trois lignes.

### Contrôles

Playwright headless (`chromium` du conteneur) sur la copie vitrine, 3 thèmes × 2 châssis
(iPhone 16 Pro 393×852, iPhone SE 375×667) × 3 pages × 5 modales : aucun débordement horizontal,
aucun élément hors cadre, aucune cible tactile < 40 px, aucune erreur console. Planche-contact des
8 écrans jointe à la session. Aucune variable de thème ni couleur touchée : la batterie de
contraste n'a pas été relancée.

## v1.0.170 — 13.09.2026 — Recette sur dalle : le debugger ne montre plus que des signaux

Premier lot de retours relevés par Donatien sur la TSW-1070 avec le SIMPL Debugger ouvert sur le
slot 2. Toutes les corrections sont au niveau du système : un interrupteur, un helper, une table de
configuration — aucune retouche écran par écran.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.170 | à produire par `.\deploy.ps1` |
| CPZ slot 1 | — | à recompiler dans SIMPL# Pro (`ControlSystem.cs` modifié) |
| LPZ slot 2 | — | `node contract/generate_slot2.js` puis F12 dans SIMPL Windows |
| Showcase Vercel | 1.0.168-showcase | non régénéré, non poussé |

La 1.0.169 a été consommée par un `deploy.ps1` interrompu (`node_modules` absent après le passage
en monorepo, `npx ch5-cli` tombait en 404 : `npm install` dans `projects/villa-crans/ch5` le règle).

### Émission sur changement de valeur uniquement

`PushRoomFeedback` réécrivait les 16 analogiques, les 4 sériels et tous les digitaux du bloc d'une
pièce **à chaque action**, même inchangés. Trois conséquences, de la plus grave à la plus bénigne :

1. **Redéclenchement de scène.** Sur un bloc pièce, le même join est bidirectionnel : le nom nu est
   la sortie du symbole, donc ce que le slot 2 reçoit. Réaffirmer `R07_Lighting_Scene3` à 1 pendant
   un appui sur la consigne CVC produit un front que le slot 2 ne distingue pas d'un appui sur la
   scène. Un thermostat manipulé rallumait la scène d'éclairage de la pièce.
2. Trafic CIP inutile vers la dalle, l'iPad, l'iPhone, le XPanel et l'EISC.
3. Debugger illisible : 20 lignes par appui de bouton.

Correction : trois helpers `SetBool` / `SetUShort` / `SetString` qui comparent avant d'écrire,
appliqués à `PushRoomFeedback`, `UpdateScreenStateForPanel` (30 écritures) et `BroadcastTswVolume`.
Les impulsions (`PulseRoomDigital`) et la relance volontaire du code d'alarme (ser 43 remis à vide
puis réécrit) gardent leur écriture inconditionnelle : là, le front **est** le message.

Garde-fou : `_forcePush` rétablit l'écriture inconditionnelle pendant `OnTouchPanelOnlineStatusChange`,
sans quoi un panel qui se reconnecte ne recevrait que les signaux ayant changé depuis sa déconnexion.

### Traces console sous `meta.tracesConsole`

58 `CrestronConsole.PrintLine` dans le C# et la recopie des `console.log` de la GUI sur le sériel 100
remplissaient le debugger de `[BLOC PIECE]`, `MOTEURS/MEDIA`, `[DECOUPLE]`, `[JS CONSOLE]`, `GLOBAL`…

Un seul interrupteur, `meta.tracesConsole` du `villa_config.json`, faux par défaut :

- **43 messages** passent par un helper `Trace()` et disparaissent — tout ce qui suit une action
  utilisateur, y compris le code d'alarme de référence qui s'affichait en clair au démarrage ;
- **15 messages restent** toujours affichés : démarrage, chargement de configuration, EISC,
  enregistrement et arrivée des périphériques, erreurs de presets, réponses aux commandes console
  tapées par l'exploitant. De quoi diagnostiquer une panne sur site sans rien réactiver.

Le flag est relu à chaque chargement de configuration : le rétablir ne demande qu'un `progreset`,
pas une recompilation. Côté GUI, les `console.log` restent visibles dans la console du navigateur et
dans l'outil Console Web quoi qu'il arrive ; seul le pont vers le sériel 100 est coupé.

### Retrait de l'analogique +21 (`Lighting_Master`) du bloc pièce

`R__Lighting_Master#` portait un « Dimmer Général » 0-65535 calculé par le C# d'après la scène
(0 / 30 / 70 / 100 %). Aucun composant de la GUI ne l'écrivait, et il n'était lu que pour remplir une
case d'une grille de diagnostic. Il ne portait aucune information que les niveaux de circuits ne
donnent déjà. Retiré de `contrat.blocsPiecesGui.mapping.analog`, du feedback C#, de la colonne
« Dimmer (J21) » de la grille et du plan `OFF_A` de `generate_slot2.js`.

Le signal **global** `Lighting_Master` (a21) reste en place : `generate_slot2.js` s'en sert pour
calibrer l'offset d'entrée analogique du symbole EISC.

### Les scènes d'éclairage pilotent enfin les circuits

Un appui sur une scène ne touchait pas à `CircuitLevels` : les circuits restaient à 32768, la valeur
du constructeur, quelle que soit la scène. La seule chose qu'une scène pilotait était le master
supprimé ci-dessus — autrement dit, après ce retrait, une scène n'aurait plus rien fait du tout.

Les niveaux vivent désormais dans `villa_config.json`, par pièce :
`pieces[].pilotages.eclairages.scenes.niveaux`, un tableau de niveaux 0-65535 par scène, dans
l'ordre de `circuits.noms`. 15 pièces servies, 4 scènes chacune.

**Le slot 2 fait foi.** La table n'est qu'une valeur de repli : dès qu'un niveau de circuit remonte
du slot 2 (offsets +71..+80 venant de l'EISC), `_circuitFromSlot2` mémorise que ce circuit est piloté
par le système d'éclairage réel, et une scène ne le repositionne plus. C'est le comportement qui
tient sur un chantier, où un variateur touché depuis un clavier mural doit rester maître de son
niveau ; la table ne sert que tant que rien n'est câblé derrière.

Au démarrage, chaque pièce est posée sur sa scène 1 (OFF), donc circuits à 0.

### Vérifications

`node --check` sur les 6 blocs `<script>` d'`index.html` (la même barrière que `deploy.ps1`),
`villa_config.json` et `generate_slot2.js` validés, équilibrage du C# contrôlé. La batterie
Playwright de contraste n'a pas été relancée : aucune variable de thème, aucun token, aucune règle de
mise en page n'a été touché — la seule modification visible est une colonne retirée d'une table de
diagnostic. Pas de compilateur C# ni SIMPL dans les sessions Claude : le CPZ et le LPZ restent à
produire sur le PC.

## v1.0.168 — 11.09.2026 — Logo des boutons de source : une seule couche

Le bouton **Apple TV** non sélectionné affichait une pomme déformée (feuille soudée au corps, bord
droit dentelé) alors que la même pomme était nette à l'état sélectionné.

Cause : deux logos étaient peints l'un sur l'autre. L'`<img class="src-overlay-img">` — seul logo de
l'état sélectionné, aspect respecté par `preserveAspectRatio` — et un fond CSS historique sur le
châssis CH5, étiré dans un carré de 44 × 44 px alors que le viewBox fait 384 × 512. La superposition
des deux formes produisait le contour dentelé. Le thème Clair cumulait en plus une pomme sombre (fond
CSS) et une pomme blanche (overlay). Swisscom avait le même doublon (34 × 34 sur un viewBox
200 × 290), moins visible.

Correction au niveau du composant, dans un unique bloc `<style id="logo-source-couche-unique">` en
fin de `<head>` :

- fond CSS supprimé sur les cinq boutons de source, dans tous les états → l'overlay est la source
  unique du logo, donc l'état non sélectionné affiche exactement l'image de l'état sélectionné ;
- logos monochromes blancs marqués `.logo-mono` : mis à l'échelle 1,28 (44 px de haut, la taille
  apparente validée le 10.09) et inversés en sombre sur le thème Clair ;
- l'état est lu sur le châssis (`ch5-button:not([selected="true"]):not(.ch5-button--selected) ~
  .src-overlay-img`) et non sur la classe `.logo-active` de l'image : les deux se désynchronisent
  pendant la transition, et une pomme sombre sur fond violet en serait le prix ;
- bloc mort du 10.09 (`background-size: 44px 44px` sur `.src-appletv`) supprimé.

`iphone.html` ne porte pas ce motif (ni overlay ni fond CSS de logo de source) : rien à corriger.

Vérifié en mode déploiement : 3 thèmes × {non sélectionné, sélectionné} × {1920 × 1200, iPad 11"} —
une seule couche de logo, contraste 17,6:1 (Sombre, Contraste élevé) et 18,3:1 (Clair) non
sélectionné, 4,2:1 sélectionné (violet préexistant), cibles tactiles 282 × 104 et 166 × 104 px,
aucun scroll horizontal, comptage d'erreurs console identique à l'avant. Vitrine régénérée par
`sync-villa-crans.py` et échantillonnée 12 fois par thème sous curseur de démo : aucune couche CSS
en trop, aucune inversion pendant la sélection, aucune désynchronisation châssis / `.logo-active`.
Planches-contact avant/après (déploiement) et vitrine jointes.

Versions alignées en 1.0.168 : `version.json`, `src/version.js`, `villa_config.json` (racine et
`src/`), `src/villa_config.js` ; vitrine en `1.0.168-showcase`. **Reste à pousser sur Vercel**
(`apps/showcase/deployer-v2.bat`) et à compiler.

## v1.0.167 — 11.09.2026 — Contrat de joins v3 : un bloc de joins par pièce

Version préparée pour la **recette sur supports physiques** (dalle TSW-1070, iPad, iPhone, XPanel),
après des mois de mise au point sur le seul site vitrine.

### Changement structurant — fin des joins partagés entre pièces

Jusqu'en v2, les 15 pièces partageaient **un seul jeu de joins** ; la pièce courante était portée par
l'analogique 10 et mémorisée côté C# par périphérique. Invisible sur le showcase (un seul panneau
virtuel, feedback simulé en frontend), ce choix casse dès que deux supports physiques affichent deux
pièces différentes : ils écrivent sur les mêmes joins et se volent commandes et feedbacks.

Désormais chaque pièce dispose de **son propre bloc de 100 joins**, avec la même formule et les mêmes
offsets que les blocs EISC déjà en place :

```
joinPhysique = 1000 + (pieceId - 1) * 100 + offset
```

- Pièce 1 → 1000-1099 · pièce 7 → 1600-1699 · pièce 15 → 2400-2499 · plafond 30 pièces (3998 < 4000).
- Le HTML conserve ses joins « logiques » historiques : les règles CSS et les `querySelector` restent
  valables. La traduction se fait à l'exécution dans `src/js/villa-joins.js` (nouvelle couche
  `VillaJoins`), pilotée par `contrat.blocsPiecesGui.mapping` du `villa_config.json`.
- Attributs miroir `data-join` / `data-rjoin` / `data-cjoin` / `data-vjoin` ajoutés sur chaque
  composant CH5 : ils portent le join logique et ne bougent jamais, c'est sur eux que pointent
  désormais les sélecteurs CSS et JS.
- En mode `showcase`, la couche est inerte : le site vitrine continue de tourner sur les joins
  logiques avec `js/local-feedback.js`, sans aucune modification.

**Restent communs à toute la villa** (exceptions documentées et justifiées dans le JSON) :
sélection de pièce (dig 11-40, ana 10), **états des partitions d'alarme 1-4 (dig 301-312)**,
**presets globaux (dig 401-411, ser 420)**, centrale d'alarme (dig 41-48), télécommandes de sources
(dig 211-220, 500-527, 530-557, 560-600 — une commande vise l'appareil source, pas la pièce),
signaux système et transport de configuration (ser 99-106, dig/ana 250), matériel de la dalle
(ana 240, ana 260, dig 261), easter egg météo (dig 56).

### Boutons qui n'émettaient rien

- **Commandes groupées de stores** : les 9 boutons « Tout ouvrir / Demi-ouverture / Tout fermer »
  ne faisaient que l'animation CSS. Ils émettent désormais les joins 61-69 du contrat
  (volets 61/62/63, rideaux 64/65/66, stores 67/68/69), via `animateGroupBlinds`.
- **Pavé de code d'alarme** : le code était comparé à `'1234'` **en dur dans le JavaScript du panel**.
  La saisie part maintenant à la centrale (ser 43) qui répond par une impulsion sur dig 44 (accepté)
  ou dig 45 (refusé) ; la touche C envoie le dig 46. Repli local de mise en service dans
  `contrat.alarme.codeParDefaut`, à changer ou à vider sur site.
- **iPhone** : `window.toggleMute()` était appelé par deux boutons sans avoir jamais été défini ;
  le feedback de sélection de pièce s'arrêtait à la pièce 8 (boucle 11-18) ; les touches Apple TV
  rembobinage/avance (219/220) n'étaient pas câblées ; la touche mute de la télécommande Swisscom
  (563) était écrasée par le join 55 et n'était donc jamais émise.
- **Interlock des sources** (dalle) : le bloc d'abonnement était gardé par `typeof CrComLib !==
  'undefined'` alors qu'il s'exécute avant le chargement de `ch5-components.js` — il ne s'abonnait
  jamais sur la dalle. Différé par `VillaJoins.whenReady()`.

### Joins ajoutés au contrat

Utilisés par l'interface sans être déclarés : dig 200 (extinction A/V), dig 251-253 (transport du
lecteur média, ordre aligné sur le câblage réel des boutons : 251 lecture/pause, 252 suivant,
253 précédent), ana 254 (volume du lecteur média), ser 100 (console navigateur), et le pavé de code
d'alarme ser 43 / dig 44 / dig 45 / dig 46.

### C# slot 1 (`Backend/Backend/ControlSystem.cs`)

- Décodage unique des blocs ≥ 1000 (`room`, `offset`) pour l'EISC **comme** pour les panels ;
  logique métier factorisée en `ApplyRoomDigitalCommand` / `ApplyRoomAnalogCommand`.
- Les feedbacks sont écrits sur le bloc de la pièce concernée pour toutes les pièces : plus aucune
  logique « quel panneau regarde quoi ». `PushRoomFeedback(roomId)` remplace les envois ciblés.
- Miroir EISC : passe-plat au-dessus de 1000, liste blanche construite depuis `signauxGlobaux` en
  dessous.
- Chaîne d'alarme complète (43/44/45/46) avec relais vers le slot 2 et repli temporisé.
- Les 6 points P1 corrigés : try/catch sur `BuildVillaRoomsDatabase`, impulsions moteurs toujours
  remises à false, boucles de presets bornées à 10, gardes `ContainsKey`, nom de preset assaini
  (plus de traversée de chemin possible), borne de routage ≥ 1000 cohérente.
- Correctifs annexes : ser 33 (mode CVC) ajouté à `UpdateScreenStateForPanel`, entrée ana 53
  (source audio) créée.

### Rétroportage depuis le site vitrine

- Thème **Verre dépoli** : la version du site (voile blanc 0.10 + backdrop à 50 %) est plus jolie mais
  faisait tomber **33 textes sous 4:1**. Réglage retenu : flou réduit et saturation relevée du site
  (photo nette et colorée), voile ardoise allégé 0.42 → 0.34, backdrop à 40 %. Fond composite
  ≈ rgb(72,75,82) : blanc à 8,5:1, menthe #6ee7b7 à 5,5:1.
- Suppression définitive de `playSynthSound()` (synthétiseur Web Audio, 56 lignes dans chaque
  fichier) : plus aucun code sonore dans la GUI.
- Non rétroporté volontairement : la suppression de `sendConsoleCommand` / `quickConsoleCommand` /
  `refreshIptable`, qui pilotent le terminal du CP4 et n'ont de sens qu'en déploiement.

### Contraste

Défaut préexistant corrigé : le vert « Online » du bandeau d'état était à 2,5:1 sur fond clair et
3,4:1 en Verre dépoli. Accent foncé `#047857` en thème Clair, menthe `#a7f3d0` en Verre dépoli.
Batterie `tools/check_contrast_dom.mjs` : **aucun texte sous 4:1**, 3 thèmes × page + 10 fenêtres
× états dynamiques, dalle et smartphone.

### Divers

- Le libellé de version affiché était figé à `v1.0.149` dans les deux fichiers : corrigé.
- `scripts/sync-villa-crans.py` (dépôt showcase) copie désormais `js/villa-joins.js`.

---

## v1.0.166 — 09-10.09.2026
Télécommandes complètes (Apple TV, Sky Q, IPTV, Swisscom), sources vidéo en interlock avec musique
indépendante, fenêtres Contrôle global / Caméras / Système de sécurité / Réglages agrandies,
cohérence des 3 thèmes, engrenages en SVG, son caché retiré.

## v1.0.165 — 09.09.2026
Retours de direction du 09.09 appliqués, bandeau « État de la villa », contrat de joins v2.
