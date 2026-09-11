# 03 — Contrat de joins v3

Référence unique. **Le GUI, le C# (slot 1) et le SIMPL (slot 2) doivent s'y conformer.**
Source : `villa_config.json` → `contrat`. Version **3**, du 11.09.2026.
Couche d'exécution côté GUI : `src/js/villa-joins.js`.

---

## 1. Principe v3

Jusqu'au contrat v2, les 15 pièces partageaient **un seul jeu de joins de pilotage**, la
pièce courante étant portée par l'analogique 10. Sur un panel unique cela fonctionne ; dès
que deux supports physiques (dalle TSW-1070, iPad, iPhone, XPanel) affichent deux pièces
différentes, ils écrivent sur les mêmes joins et se volent mutuellement leurs commandes et
leurs feedbacks.

En v3, **chaque pièce dispose côté GUI de son propre bloc de 100 joins**, avec les mêmes
offsets que le bloc EISC déjà en place :

```
joinPhysique = base + offset          base = 1000 + (pieceId − 1) × 100

pièce 1  → 1000-1099        pièce 2  → 1100-1199
pièce 3  → 1200-1299        …        pièce 15 → 2400-2499
```

Le HTML **conserve ses joins historiques** (dits « logiques ») : les règles CSS, les
`querySelector` et les abonnements existants restent valables. La couche `VillaJoins`
réécrit à l'exécution les attributs des composants CH5 et détourne
`CrComLib.publishEvent` / `subscribeState` vers le join physique de la pièce affichée par
**ce** panel. Un attribut miroir (`data-join`, `data-rjoin`, `data-cjoin`, `data-vjoin`)
conserve le join logique pour le ciblage CSS/JS.

Un join absent de `contrat.blocsPiecesGui.mapping` n'est **jamais** traduit : il reste
global (voir § 4).

### Chaîne complète

```
 driver / appareil  (KNX, IR, IP, centrale d'alarme, ampli…)
        │
        ▼
 SIMPL Windows — slot 2        logique métier, interlocks, drivers
        │
        ▼  EISC  IP-ID 0xF0 @ 127.0.0.2      blocs de 100 joins par pièce
        │
        ▼
 C# SIMPL# Pro — slot 1        registre des pièces, feedbacks, routage
        │
        ├──► contract manager (CH5 contract) ──► joins des panels
        │
        ▼  sériel 105 (chunks VCFG) + sériel 106 (empreinte)
 villa_config.json             pièces, modules, noms, contrat
        │
        ▼
 GUI CH5  (index.html / iphone.html)
        │
        ▼  js/villa-joins.js   joinLogique ──► base + offset
 CrComLib / WebXPanel
```

La pièce courante d'un panel est détectée automatiquement par `VillaJoins` :
analogique **10** (`Piece.Active`) ou digital **11-40** (`Piece.Select`, join = 10 + id).
Elle est mémorisée en `localStorage` (`villa_joins_room`) pour survivre à un rechargement.

### Activation

| Champ | Valeur | Effet |
|---|---|---|
| `blocsPiecesGui.actif` | `true` | la traduction est possible |
| `blocsPiecesGui.appliqueEn` | `["deploiement"]` | traduction active **uniquement** si `meta.mode = "deploiement"` |

En mode **showcase**, la couche est inerte (identité) : le site vitrine n'a qu'un panel
virtuel et `js/local-feedback.js` travaille sur les joins logiques.

---

## 2. Signaux GLOBAUX

Non traduits, répliqués **1:1** vers l'EISC du slot 2 : le numéro de join est identique des
deux côtés. Ils s'appliquent à toute la villa, ou à la pièce affichée par le périphérique
qui les émet lorsqu'il s'agit de sélection.

Direction : *entrée* (→) = panel/slot 2 → slot 1 · *sortie* (←) = slot 1 → panels/slot 2 ·
*bidirectionnel* (↔) = commande + feedback sur le même join.

### Digitaux

| Join(s) | `contractName` | Dir. | Description |
|---|---|---|---|
| 11-40 | `Piece.Select` | ↔ | Sélection directe pièce 1..30 (**join = 10 + id**) + feedback. Pilote aussi la base de bloc du panel |
| 41 | `Alarme.Armer` | ↔ | Armement général de la centrale + feedback |
| 42 | `Alarme.Desarmer` | ↔ | Désarmement général + feedback |
| 44 | `Alarme.CodeValide` | ← | Impulsion : code accepté par la centrale *(v3)* |
| 45 | `Alarme.CodeRefuse` | ← | Impulsion : code refusé *(v3)* |
| 46 | `Alarme.CodeEfface` | → | Touche **C** du pavé : efface la saisie en cours *(v3)* |
| 56 | `Meteo.EasterEgg` | → | Triple-clic widget météo |
| 250 | `Config.Resync` | → | Demande de (ré)envoi de la configuration |
| 261 | `Systeme.MuteDalle` | ↔ | Mute du volume matériel de la dalle TSW |
| 301-312 | `Alarme.Partition` | ↔ | Partitions 1..4, triplets Armer/Partiel/Désarmer (301,302,303 = partition 1) |
| 401 | `Global.Eclairage.ToutAllumer` | → | |
| 402 | `Global.Eclairage.ToutEteindre` | → | |
| 403 | `Global.Eclairage.ModeEco` | → | |
| 404 | `Global.Stores.ToutOuvrir` | → | |
| 405 | `Global.Stores.ToutFermer` | → | |
| 406 | `Global.Stores.PositionInter` | → | ⚠️ implémenté à vide côté C# (log seul) |
| 407 | `Global.CVC.Confort` | → | |
| 408 | `Global.CVC.Nuit` | → | |
| 409 | `Global.CVC.HorsGel` | → | |
| 410 | `Global.Vacances.Activer` | ↔ | |
| 411 | `Global.Vacances.Desactiver` | ↔ | |
| 211-220 | `AV.Telecommande.AppleTV` | → | Apple TV : up, down, left, right, select, back, home, play/pause, rew, fwd |
| 500-527 | `AV.Telecommande.SkyQ` | → | Sky Q, 28 touches (offsets ci-dessous) |
| 530-557 | `AV.Telecommande.IPTV` | → | Box IPTV, mêmes offsets que Sky Q |
| 560-600 | `AV.Telecommande.Swisscom` | → | Swisscom TV, 41 touches (offsets ci-dessous) |

Offsets Sky Q / IPTV (0..27) : up, down, left, right, ok, back, menu, exit, live, dvr,
guide, info, last, pg+, pg−, ch+, ch−, rew, play, fwd, pause, stop, replay, rec, jaune,
bleu, rouge, vert.
Offsets Swisscom (0..40) : power, assistant, input, mute, rew, rec, fwd, replay, play,
skip, back, home, guide, option, up, down, left, right, ok, vol+, vol−, mic, P+, P−, pip,
0..9, txt, radio, rouge, vert, jaune, bleu.

Dans le GUI, les touches **volume +/− et mute** des télécommandes agissent sur les joins
logiques `AV.Volume` (analogique 52) et `AV.Mute` (digital 55) — donc, après traduction,
sur le bloc de la pièce affichée — et non sur la box : les joins box correspondants
(mute 563, vol 579/580) ne sont pas émis.
⚠️ Ces blocs de télécommande sont **à router côté C#** (drivers IR/IP) : ils sont ignorés
tant que le `switch` ne les connaît pas. Les anciens joins 221-250 ne sont plus émis
(250 était en collision avec `Config.Resync`).

### Analogiques

| Join | `contractName` | Dir. | Description |
|---|---|---|---|
| 10 | `Piece.Active` | ↔ | ID de la pièce active (1..N) — la voie sans limite de 30. Fixe la base de bloc du panel |
| 240 | `Systeme.PieceActiveDalle` | ← | Pièce affichée par la dalle 0x03, diffusée à tous |
| 250 | `Config.ChunkAck` | → | Accusé de réception du chunk N |
| 260 | `Systeme.VolumeDalle` | ↔ | Volume matériel de la dalle TSW (0-100) |

### Sériels

| Join | `contractName` | Dir. | Description |
|---|---|---|---|
| 43 | `Alarme.CodeSaisi` | → | Code saisi sur le pavé, envoyé à la centrale pour validation *(v3)* |
| 99 | `Systeme.IpId` | ← | IP-ID du panel connecté |
| 100 | `Systeme.ConsoleNavigateur` | ← | `console.log` / `window.onerror` du GUI vers le CP4 (250 car. max) *(v3 : entré au contrat)* |
| 101 | `Systeme.CpzNom` | ← | Nom du fichier CPZ |
| 102 | `Systeme.CpzDate` | ← | Date de compilation du CPZ |
| 103 | `Systeme.Console` | ↔ | Commande console CP4 (entrée) / réponse (sortie) |
| 104 | `Systeme.DateValidation` | ↔ | Date de dernière validation, **par périphérique** |
| 105 | `Config.Json` | ← | Transport de la config (`VCFG\|i\|n\|payload`) |
| 106 | `Config.Hash` | ← | Empreinte de la config |
| 420 | `Presets.Sauvegarde` | → | Payload JSON de sauvegarde des presets globaux |

⚠️ Le C# répond aussi à un **digital 103** (`FormatIpTable`) qui n'est pas au contrat et
qu'aucun GUI n'émet — code mort, avec une troncature différente de celle du chemin sériel
(254 contre 8000 caractères).

### Pavé de code d'alarme (nouveau en v3)

Le code était comparé à `'1234'` **en dur dans le JavaScript du panel** : lisible par
quiconque ouvre l'inspecteur, et identique sur tous les sites. En mode déploiement, la
saisie part désormais à la centrale :

| Sens | Join | Contenu |
|---|---|---|
| GUI → centrale | sériel **43** | code saisi, sur appui **E** |
| GUI → centrale | digital **46** | touche **C** (impulsion 100 ms) |
| centrale → GUI | digital **44** | code accepté → ouverture de l'écran des partitions |
| centrale → GUI | digital **45** | code refusé → message d'erreur |

Sans réponse sous **2,5 s**, le GUI affiche « CENTRALE INJOIGNABLE (joins 43/44/45) ».
La comparaison locale à `'1234'` ne subsiste que sur la branche **showcase**, où il n'y a
aucun processeur.

---

## 3. Bloc par pièce

Chaque pièce expose **le même bloc de 100 joins** côté GUI et côté EISC.
`base = 1000 + (pieceId − 1) × 100`.

Colonne « Join logique » = numéro écrit dans le HTML, traduit à l'exécution par
`VillaJoins`. Un tiret signifie que le bloc EISC porte ce signal mais que le GUI ne
l'utilise pas (il passe par un join global, voir § 4).

### Digitaux

| Offset | `contractName` | Dir. | Join logique HTML | Pièce 1 | Pièce 15 |
|---|---|---|---|---|---|
| +1..+9 | `Piece.<id>.Stores.Groupe` | ↔ | 61-69 (Volets 61/62/63, Rideaux 64/65/66, Stores 67/68/69) | 1001-1009 | 2401-2409 |
| +21..+24 | `Piece.<id>.Eclairage.Scene` | ↔ | 51-54 | 1021-1024 | 2421-2424 |
| +35 | `Piece.<id>.CVC.ConsignePlus` | → | 49 | 1035 | 2435 |
| +36 | `Piece.<id>.CVC.ConsigneMoins` | → | 50 | 1036 | 2436 |
| +41..+44 | `Piece.<id>.Stores.Scene` | ↔ | 201-204 | 1041-1044 | 2441-2444 |
| +45 | `Piece.<id>.AV.Extinction` | ↔ | 200 | 1045 | 2445 |
| +50 | `Piece.<id>.AV.Mute` | ↔ | 55 | 1050 | 2450 |
| +51..+55 | `Piece.<id>.AV.Source.Select` | ↔ | 150-154 — **+51 = OFF** | 1051-1055 | 2451-2455 |
| +56 | `Piece.<id>.AV.Musique` | ↔ | 155 | 1056 | 2456 |
| +57 | `Piece.<id>.AV.Audio.SuivreVideo` | ↔ | 156 | 1057 | 2457 |
| +58..+60 | `Piece.<id>.Media.Transport` | → | 251, 252, 253 | 1058-1060 | 2458-2460 |
| +61..+78 | `Piece.<id>.Moteur.Commande` | ↔ | 81-98 (moteurs 1..6, triplets Monter/Stop/Descendre) | 1061-1078 | 2461-2478 |
| +81..+92 | `Piece.<id>.Alarme.Partition` | ↔ | — (le GUI reste sur les globaux 301-312) | 1081-1092 | 2481-2492 |

### Analogiques

| Offset | `contractName` | Dir. | Join logique HTML | Pièce 1 | Pièce 15 |
|---|---|---|---|---|---|
| +21 | `Piece.<id>.Eclairage.NiveauMaster` | ↔ | 21 (0..65535) | 1021 | 2421 |
| +31 | `Piece.<id>.CVC.Consigne` | ↔ | 31 (× 10 : 210 = 21,0 °C) | 1031 | 2431 |
| +51 | `Piece.<id>.AV.SourceActive` | ↔ | 51 (0 = off, 1..4) | 1051 | 2451 |
| +52 | `Piece.<id>.AV.Volume` | ↔ | 52 (0..65535) | 1052 | 2452 |
| +53 | `Piece.<id>.AV.SourceAudio` | ← | 53 (0 = off, 1..4 = audio vidéo, 5 = musique) | 1053 | 2453 |
| +54 | `Piece.<id>.Media.Volume` | ↔ | 254 (0..65535) | 1054 | 2454 |
| +71..+80 | `Piece.<id>.Eclairage.Circuit` | ↔ | 71-80 (circuits 1..10) | 1071-1080 | 2471-2480 |

### Sériels

| Offset | `contractName` | Dir. | Join logique HTML | Pièce 1 | Pièce 15 |
|---|---|---|---|---|---|
| +10 | `Piece.<id>.Nom` | ← | 10 | 1010 | 2410 |
| +32 | `Piece.<id>.CVC.TempActuelle` | ← | 32 | 1032 | 2432 |
| +33 | `Piece.<id>.CVC.Mode` | ← | 33 (`CHAUFFAGE` / `CLIMATISATION`) | 1033 | 2433 |
| +34 | `Piece.<id>.CVC.ConsigneTexte` | ← | 34 | 1034 | 2434 |

### Le drapeau `intersystem`

Le bloc **EISC** n'est actif que si la pièce porte `"intersystem": true` : sinon aucun
signal de cette pièce n'apparaît côté SIMPL. C'est le levier pour limiter le nombre de
signaux à monitorer dans le debugger.

⚠️ Ce drapeau ne concerne **que l'EISC**. Côté GUI, la traduction `VillaJoins` s'applique
à toutes les pièces : une pièce en `intersystem: false` écrit bien sur son propre bloc
1000+, simplement le slot 2 ne le voit pas.

### Offsets à surveiller de près

Écarts connus entre le contrat et le câblage SIMPL actuel :

- **Moteurs = +61..+78**, pas +81. Le SIMPL les a câblés à +81..+98.
- **Partitions = +81..+92.** Ce sont donc les partitions que le SIMPL reçoit sous des noms
  de moteurs.
- **Sources : +51 = OFF**, donc `Source 1` est à **+52**. Le SIMPL nomme `Source1` le
  signal +51.
- **Volume analogique = +52**, pas +53.

Voir [04 — SIMPL slot 2](04_SIMPL_SLOT2.md) § Écarts.

---

## 4. Exceptions — ce qui reste commun à toutes les pièces

Déclaré dans `contrat.blocsPiecesGui.exceptionsGlobales`. Ces joins ne figurent pas dans
`mapping`, donc `VillaJoins` les laisse passer tels quels.

| Plage | `contractName` | Justification |
|---|---|---|
| digital 11-40 | `Piece.Select` | Sélection de la pièce : globale par nature — c'est elle qui **fixe** la base de bloc du panel. La traduire n'aurait aucun sens |
| analogique 10 | `Piece.Active` | Même rôle : identifie la pièce affichée par le périphérique |
| digital 41-48 | `Alarme.General` / `Alarme.Code` | La centrale d'alarme est **unique pour la villa** : armement, désarmement, pavé de code (43/44/45/46) ne dépendent pas de la pièce affichée |
| digital 301-312 | `Alarme.Partition` | **Exception demandée.** Les états des partitions 1..4 sont communs à toute la villa : les dupliquer par pièce imposerait 15 états concurrents pour une seule réalité physique |
| digital 401-411 + sériel 420 | `Global.*` / `Presets.Sauvegarde` | **Exception demandée.** Les commandes et presets globaux (tout allumer, mode vacances, CVC confort/nuit/hors-gel…) portent sur la villa entière |
| digital 211-220, 500-527, 530-557, 560-600 | `AV.Telecommande.*` | Une commande de télécommande vise l'**appareil source** (Apple TV, Sky Q, box IPTV, Swisscom), pas la pièce. Dupliquer par pièce n'aurait pas de sens et coûterait 15 × 130 joins |
| sériel 99-106, digital 250, analogique 250 | `Systeme.*` / `Config.*` | Signaux système et transport de configuration : IP-ID, CPZ, console, resync, chunks. Rien de dépendant d'une pièce |
| analogique 240, analogique 260, digital 261 | `Systeme.*Dalle` | Matériel propre à la **dalle TSW principale** (volume et mute physiques, pièce affichée) : une seule dalle, un seul état |
| digital 56 | `Meteo.EasterEgg` | Widget global, sans rattachement à une pièce |

---

## 5. Migration v2 → v3

Pour chaque join **logique** écrit dans le HTML :

| Join logique | Signal | v2 — comportement | v3 — comportement |
|---|---|---|---|
| dig 11-40 | `Piece.Select` | sélection de la pièce du panel | **inchangé** (global) ; fixe en plus la base de bloc de ce panel |
| dig 41, 42 | `Alarme.Armer/Desarmer` | global | **inchangé** (global) |
| dig 44, 45, 46 | pavé de code d'alarme | *n'existaient pas* — code comparé à `'1234'` en dur dans le JS | **nouveaux**, globaux : feedback centrale (44/45) et touche C (46) |
| dig 49 / 50 | `CVC.ConsignePlus/Moins` | join unique partagé, appliqué à la pièce active du C# | → **base+35 / base+36** |
| dig 51-54 | `Eclairage.Scene` 1..4 | joins partagés | → **base+21..+24** |
| dig 55 | `AV.Mute` | join partagé | → **base+50** |
| dig 56 | `Meteo.EasterEgg` | global | **inchangé** (global) |
| dig 61-69 | `Stores.Groupe` | commande globale, écho par pièce sur base+1..+9 | → **base+1..+9** : la commande elle-même est désormais écrite dans le bloc de la pièce |
| dig 81-98 | `Moteur.Commande` | joins partagés, écho par pièce sur base+61..+78 | → **base+61..+78** |
| dig 150-154 | `AV.Source.Select` (150 = OFF) | joins partagés | → **base+51..+55** |
| dig 155 | `AV.Musique` | join partagé | → **base+56** |
| dig 156 | `AV.Audio.SuivreVideo` | join partagé | → **base+57** |
| dig 200 | `AV.Extinction` | join global, extinction de la « pièce active » | → **base+45** : éteint explicitement l'A/V de la pièce affichée |
| dig 201-204 | `Stores.Scene` 1..4 | joins partagés | → **base+41..+44** |
| dig 251-253 | `Media.Transport` | émis par le GUI, **hors contrat** | → **base+58..+60**, entrés au contrat |
| dig 301-312 | `Alarme.Partition` | global | **inchangé** (global, exception demandée) |
| dig 401-411 | `Global.*` | global | **inchangé** (global, exception demandée) |
| dig 211-220 / 500-600 | `AV.Telecommande.*` | global | **inchangé** (global : vise l'appareil source) |
| dig 250, 261 | `Config.Resync`, `Systeme.MuteDalle` | global | **inchangé** (global) |
| ana 10 | `Piece.Active` | pièce active du panel | **inchangé** (global) |
| ana 21 | `Eclairage.NiveauMaster` | analogique partagé | → **base+21** |
| ana 31 | `CVC.Consigne` | analogique partagé | → **base+31** |
| ana 51 | `AV.SourceActive` | analogique partagé | → **base+51** |
| ana 52 | `AV.Volume` | analogique partagé | → **base+52** |
| ana 53 | `AV.SourceAudio` | analogique partagé | → **base+53** |
| ana 71-80 | `Eclairage.Circuit` 1..10 | analogiques partagés | → **base+71..+80** |
| ana 240, 250, 260 | `Systeme.*` / `Config.ChunkAck` | global | **inchangé** (global) |
| ana 254 | `Media.Volume` | émis par le GUI, **hors contrat** | → **base+54**, entré au contrat |
| ser 10 | `Piece.Nom` | nom de la pièce active | → **base+10** (nom du bloc de la pièce affichée) |
| ser 32, 33, 34 | `CVC.TempActuelle/Mode/ConsigneTexte` | sériels partagés | → **base+32 / +33 / +34** |
| ser 43 | `Alarme.CodeSaisi` | *n'existait pas* | **nouveau**, global |
| ser 99-106 | `Systeme.*` / `Config.*` | global | **inchangé** (global) |
| ser 100 | `Systeme.ConsoleNavigateur` | émis par le GUI, **hors contrat** | **inchangé** (global), entré au contrat |
| ser 420 | `Presets.Sauvegarde` | global | **inchangé** (global, exception demandée) |

**Conséquence pratique** : deux panels affichant deux pièces différentes n'ont plus aucun
join de pilotage en commun. Le C# n'a plus besoin de deviner « quelle pièce » derrière un
appui sur un join partagé : le join le dit.

---

## 6. Ce que le slot 2 doit implémenter

Pour chaque pièce exposée (`"intersystem": true`), un bloc EISC de 100 joins à
`base = 1000 + (id − 1) × 100`.

### Entrées du slot 2 (GUI/C# → SIMPL)

| Offset | Type | Signal |
|---|---|---|
| +1..+9 | digital | Stores groupés : Volets Up/Stop/Down, Rideaux, Stores |
| +21..+24 | digital | Scènes d'éclairage 1..4 |
| +35, +36 | digital | Consigne CVC +0,5 / −0,5 °C |
| +41..+44 | digital | Scènes de stores 1..4 |
| +45 | digital | Extinction A/V complète de la pièce |
| +50 | digital | Mute audio |
| +51..+55 | digital | Source vidéo, interlock (**+51 = OFF**) |
| +56 | digital | Musique sur les haut-parleurs |
| +57 | digital | L'audio revient à la source vidéo |
| +58..+60 | digital | Lecteur média : transport (voir ⚠️ ci-dessous) |
| +61..+78 | digital | Moteurs 1..6, triplets Monter/Stop/Descendre |
| +81..+92 | digital | Partitions d'alarme 1..4, triplets Armer/Partiel/Désarmer |
| +21 | analog | Niveau master éclairage (0..65535) |
| +31 | analog | Consigne CVC × 10 |
| +52 | analog | Volume multimédia (0..65535) |
| +54 | analog | Volume du lecteur média (0..65535) |
| +71..+80 | analog | Niveau des circuits 1..10 |

### Sorties du slot 2 (SIMPL → C# → panels)

| Offset | Type | Signal |
|---|---|---|
| +21..+24 | digital | Feedback des scènes d'éclairage |
| +41..+44 | digital | Feedback des scènes de stores |
| +50 | digital | Feedback mute |
| +51..+57 | digital | Feedback source / musique / audio=vidéo |
| +81..+92 | digital | Feedback des partitions |
| +21, +31, +51, +52, +53, +54 | analog | Niveau master, consigne, source active, volume, source audio, volume média |
| +71..+80 | analog | Feedback des niveaux de circuits |
| +10 | serial | Nom de la pièce |
| +32, +33, +34 | serial | Température, mode CVC, consigne formatée |

### Signaux globaux à câbler en 1:1

Digitaux 11-40, 41, 42, 44, 45, 46, 56, 250, 261, 301-312, 401-411, 211-220, 500-527,
530-557, 560-600 · analogiques 10, 240, 250, 260 · sériels 43, 99-106, 420.

Les commandes venant du slot 2 sur un bloc pièce sont prises en compte **sur front
montant** uniquement. À la mise en ligne de l'EISC, le C# pousse l'état complet de toutes
les pièces exposées.

⚠️ **À compléter dans le JSON** : `contrat.blocsPieces.offsets` ne déclare pas encore
les offsets nouveaux de la v3 — digital **+45**, **+57**, **+58..+60**, analogiques
**+53** et **+54** — alors que `blocsPiecesGui.mapping` y envoie déjà des joins GUI.
Le tableau ci-dessus fait foi.

⚠️ **Ordre du transport média** : le contrat décrit 251 = précédent, 252 = lecture/pause,
253 = suivant, mais le HTML câble ⏮️ = 253, ⏯️ = 251, ⏭️ = 252. Il faut trancher côté slot 2
avant de brancher un vrai lecteur.

---

## 7. Limite : 30 pièces

```
pièce 30  →  base = 1000 + 29 × 100 = 3900
             offset maximum utilisé   = 98
             join le plus haut        = 3998
```

Le contrat déclare `pieceMax: 30` et `joinMaxTheorique: 3998`, sous le **plafond CH5 de
4000 joins** par type. La limite de 30 pièces est donc doublement contrainte :

- par `Piece.Select` (digitaux 11-40, soit 30 pièces exactement) ;
- par l'espace de joins : une 31ᵉ pièce demanderait la base 4000, hors plage CH5.

`VillaJoins.setRoom()` refuse tout identifiant hors de `1..pieceMax` ; aucun join n'est
alors traduit et le panel reste sur son bloc précédent.

Pour aller au-delà, il faudrait réduire `tailleBloc` (100 → 64, par exemple, ce qui
autorise 46 pièces) — mais cela casse l'alignement décimal qui rend les blocs lisibles dans
le debugger, et impose de recâbler entièrement le slot 2.

---

## 8. Collisions à connaître

Le C# ne contrôle **aucune** limite. Un dépassement se traduit par une collision
silencieuse dans l'espace de joins global :

| Dépassement | Join produit | Collision |
|---|---|---|
| 5ᵉ scène d'éclairage | digital 55 | **`AV.Mute`** — la scène 5 coupe le son |
| 31ᵉ pièce | digital 41 | **`Alarme.Armer`** — sélectionner la pièce 31 arme l'alarme |
| 11ᵉ circuit | analogique 81 | zone `Moteur.Commande`, non traitée → ignoré |
| 7ᵉ moteur | digitaux 99/100/101 | hors contrat → ignorés |
| 5ᵉ partition | digital 313 | hors `switch` → ignoré |

⚠️ Le C# route **tout** join ≥ 1000 vers le traitement des blocs pièces, sans borne haute.
Un join firmware compris entre 1000 et 3998 serait interprété comme une commande sur l'une
des pièces 1 à 30.

### Conflit historique résolu (v1.0.150)

Les joins **201/202** étaient partagés entre le lecteur média (mute/volume) et les scènes
de stores. Le lecteur média utilise désormais **55** (mute) et **52** (volume) ;
**201-204** restent exclusivement les scènes de stores.

---

## 9. Pont EISC — configuration

```json
"contrat": {
  "eisc": {
    "actif": true,
    "ipid": "0xF0",
    "adresseIp": "127.0.0.2",
    "slotCible": 2
  }
}
```

- Côté C# : `EthernetIntersystemCommunications(0xF0, "127.0.0.2", this)`, valeurs relues
  depuis le contrat au démarrage (valeurs en dur en repli si la section est absente).
- Côté SIMPL : symbole **Ethernet Intersystem Communications (Packed)**, IP-ID **F0**,
  IP **127.0.0.2**.
- `127.0.0.2` est la boucle inter-slots du CP4. ⚠️ Un `172.0.0.2` traîne dans certaines
  bases SIMPL — c'est une coquille, corrigée par `generate_slot2.js`.

### Sens des signaux

| Sens | Contenu |
|---|---|
| Slot 1 → slot 2 | état complet de chaque pièce exposée (feedback temps réel), signaux globaux 1:1 |
| Slot 2 → slot 1 | toute commande écrite sur un bloc pièce (scène, consigne, source, circuit, partition…) est appliquée à la pièce visée, et le feedback repart vers les panels **et** l'EISC |

---

## 10. Diagnostic côté GUI

`window.VillaJoins` expose, dans la console du navigateur :

| Appel | Retour |
|---|---|
| `VillaJoins.room` | id de la pièce courante de ce panel |
| `VillaJoins.base` | base du bloc (ex. `2400`) |
| `VillaJoins.actif` | `true` si la traduction est active (mode déploiement) |
| `VillaJoins.phys('b', '55')` | join physique correspondant au join logique |
| `VillaJoins.table()` | table complète `{piece, base, actif, joins}` |
| `VillaJoins.rescan(el)` | re-mappe un sous-arbre CH5 créé dynamiquement |
| `VillaJoins.setRoom(id)` | force la pièce de ce panel |

Chaque changement de pièce trace `[VillaJoins] pièce N → bloc de joins B..B+99`.

⚠️ Si `js/villa-joins.js` est absent du `.ch5z`, le HTML installe un repli inerte et trace
`[VillaJoins] couche absente : joins logiques utilisés tels quels.` — le GUI fonctionne,
mais **retombe au comportement v2** (joins partagés entre pièces).
