# Villa Crans CH5 — journal des versions

## v1.0.171 — 14.09.2026 — GUI smartphone agrandie, barre d'outils de la vitrine allégée

Lot de retours de Donatien sur le châssis iPhone de la vitrine. Tout passe par des blocs de style
partagés : un seul `<style id="mobile-xl">` dans `iphone.html` pour l'agrandissement, aucune valeur
posée écran par écran.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.170 | inchangé — `iphone.html` modifié, `.\deploy.ps1` à relancer |
| CPZ slot 1 | — | inchangé |
| LPZ slot 2 | — | inchangé |
| Showcase Vercel | 1.0.168-showcase | `iphone.html` régénéré, build et push à faire |

### Vitrine (apps/showcase)

- **Bouton « Présentation » retiré** de la barre d'outils (`DemoToolbar`) et de son câblage
  (`Showcase.jsx` : `presenting`, `onTogglePresentation`, `handleTogglePresentation`). La démo
  automatique se met déjà en pause au premier geste et la bulle « Reprise de la démo dans N
  secondes » la relance : le bouton faisait doublon. Clés `tool_present` / `tool_present_stop`
  supprimées en FR/EN/DE.
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
