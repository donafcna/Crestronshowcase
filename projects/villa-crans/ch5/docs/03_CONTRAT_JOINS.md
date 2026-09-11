# 03 — Contrat de joins v2

Référence unique. **Le GUI, le C# (slot 1) et le SIMPL (slot 2) doivent s'y conformer.**
Source : `villa_config.json` → `contrat`. Version **2**, du 22.08.2026.

## 1. Renumérotation v2 — ce qui a changé

`Piece.Select` a été étendu de 15 à **30 pièces** (digitaux 11-40), ce qui a poussé
plusieurs signaux :

| Signal | v1 | **v2** |
|---|---|---|
| `Eclairage.Scene` (4 scènes) | 21-24 | **51-54** |
| `AV.Mute` | 53 | **55** |
| `CVC.ConsignePlus` | 35 | **49** |
| `CVC.ConsigneMoins` | 36 | **50** |
| `Meteo.EasterEgg` | 37 | **56** |

Les **offsets des blocs pièces ne changent pas** : à l'intérieur d'un bloc, les scènes
restent à +21..24, la consigne à +35/+36, etc.

État de la migration :

- **C# slot 1** : ✅ aligné v2 partout, vérifié signal par signal.
- **SIMPL slot 2** : ✅ aligné v2 (généré depuis le contrat).
- **GUI `index.html`** : ⚠️ majoritairement v2, mais un bloc de souscription reste sur les
  joins v1 21-24 (ligne 8777).
- **`src/config.js`** : ⚠️ le moniteur admin surveille encore le join **53** pour le mute
  (devrait être 55) — l'indicateur restera figé à 0.
- **`CONFIG_PROCESS.md`** : ⚠️ dit encore « 53 (mute) » dans le § « Conflit résolu ».

### Conflit historique résolu (v1.0.150)

Les joins **201/202** étaient partagés entre le lecteur média (mute/volume) et les scènes
de stores. Le lecteur média utilise désormais **55** (mute) et **52** (volume) ;
**201-204** restent exclusivement les scènes de stores.

---

## 2. Signaux globaux (< 1000)

Répliqués **1:1** vers l'EISC du slot 2 : le numéro de join est identique des deux côtés.
Ils s'appliquent toujours à **la pièce active du périphérique** qui les émet.

Direction : *entrée* = panel/slot 2 → slot 1 · *sortie* = slot 1 → panels/slot 2 ·
*bidirectionnel* = commande + feedback sur le même join.

### Digitaux

| Join(s) | `contractName` | Dir. | Description |
|---|---|---|---|
| 11-40 | `Piece.Select` | ↔ | Sélection directe pièce 1..30 (**join = 10 + id**) + feedback |
| 41 | `Alarme.Armer` | ↔ | Armement général + feedback |
| 42 | `Alarme.Desarmer` | ↔ | Désarmement général + feedback |
| 49 | `CVC.ConsignePlus` | → | Consigne +0,5 °C *(v2, ex-35)* |
| 50 | `CVC.ConsigneMoins` | → | Consigne −0,5 °C *(v2, ex-36)* |
| 51-54 | `Eclairage.Scene` | ↔ | Scènes d'éclairage 1..4 + feedback *(v2, ex-21-24)* |
| 55 | `AV.Mute` | ↔ | Mute audio (toggle + feedback) *(v2, ex-53)* |
| 56 | `Meteo.EasterEgg` | → | Triple-clic widget météo *(v2, ex-37)* |
| 61-69 | `Stores.Groupe` | → | Commandes groupées : Volets 61/62/63, Rideaux 64/65/66, Stores 67/68/69 (Monter/Stop/Descendre) |
| 81-98 | `Moteur.Commande` | ↔ | Moteurs 1..6, triplets Monter/Stop/Descendre (81,82,83 = moteur 1 … 96,97,98 = moteur 6) |
| 150-154 | `AV.Source.Select` | ↔ | Sélection source **vidéo** 0..4 (**150 = OFF**) + feedback interverrouillé *(v1.0.166 : la musique n'est plus une source vidéo)* |
| 155 | `AV.Musique` | ↔ | Appui : la musique passe sur les haut-parleurs, la vidéo reste à l'écran ; feedback = musique en audio *(v1.0.166)* |
| 156 | `AV.Audio.SuivreVideo` | ↔ | Appui : l'audio revient à la source vidéo ; feedback = audio suit la vidéo *(v1.0.166)* |
| 200 | `AV.Extinction` | → | Power OFF du GUI : vidéo off + audio off (traité par le C# depuis v1.0.166 ; le GUI n'émet plus 50 ni 201) |
| 201-204 | `Stores.Scene` | ↔ | Scènes de stores 1..4 + feedback |
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
| 211-220 | `AV.Telecommande.AppleTV` | → | Télécommande Apple TV : up, down, left, right, select, back, home, play/pause, rew, fwd *(09.09.2026)* |
| 500-527 | `AV.Telecommande.SkyQ` | → | Télécommande Sky Q, 28 touches (offsets ci-dessous) *(09.09.2026)* |
| 530-557 | `AV.Telecommande.IPTV` | → | Télécommande box IPTV, mêmes offsets que Sky Q *(09.09.2026)* |
| 560-600 | `AV.Telecommande.Swisscom` | → | Télécommande Swisscom TV, 41 touches (offsets ci-dessous) *(09.09.2026)* |

Offsets Sky Q / IPTV (0..27) : up, down, left, right, ok, back, menu, exit, live, dvr, guide, info, last, pg+, pg−, ch+, ch−, rew, play, fwd, pause, stop, replay, rec, jaune, bleu, rouge, vert.
Offsets Swisscom (0..40) : power, assistant, input, mute, rew, rec, fwd, replay, play, skip, back, home, guide, option, up, down, left, right, ok, vol+, vol−, mic, P+, P−, pip, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, txt, radio, rouge, vert, jaune, bleu.
Dans le GUI, les touches **volume +/− et mute** des télécommandes agissent sur `AV.Volume` (analogique 52, pas de 5 %) et `AV.Mute` (55) de la pièce, pas sur la box : les joins box correspondants (mute 563, vol 579/580) ne sont pas émis. ⚠️ Ces blocs sont **à router côté C#** (drivers IR/IP) : ils sont ignorés tant que le `switch` ne les connaît pas. Les anciens joins 221-250 (télécommandes du 09.09 matin) ne sont plus émis — 250 était en collision avec `Config.Resync`.

### Analogiques

| Join(s) | `contractName` | Dir. | Description |
|---|---|---|---|
| 10 | `Piece.Active` | ↔ | ID de la pièce active (1..N) — la voie sans limite de 30 |
| 21 | `Eclairage.NiveauMaster` | ↔ | Niveau master éclairage (0..65535) |
| 31 | `CVC.Consigne` | ↔ | Consigne × 10 (210 = 21,0 °C) |
| 51 | `AV.SourceActive` | ↔ | Source vidéo active (0 = off, 1..4) |
| 53 | `AV.SourceAudio` | ← | Source audio des haut-parleurs : 0 = off, 1..4 = audio de la vidéo, 5 = musique *(v1.0.166)* |
| 52 | `AV.Volume` | ↔ | Volume multimédia (0..65535) |
| 71-80 | `Eclairage.Circuit` | ↔ | Niveau des circuits 1..10 |
| 240 | `Systeme.PieceActiveDalle` | ← | Pièce affichée par la dalle 0x03, diffusée à tous |
| 250 | `Config.ChunkAck` | → | Accusé de réception du chunk N |
| 260 | `Systeme.VolumeDalle` | ↔ | Volume matériel de la dalle TSW (0-100) |

### Sériels

| Join | `contractName` | Dir. | Description |
|---|---|---|---|
| 10 | `Piece.Nom` | ← | Nom de la pièce active (majuscules) |
| 32 | `CVC.TempActuelle` | ← | Température actuelle formatée (ex. `22.4`) |
| 33 | `CVC.Mode` | ← | `CHAUFFAGE` / `CLIMATISATION` |
| 34 | `CVC.ConsigneTexte` | ← | Consigne formatée (ex. `21.0`) |
| 99 | `Systeme.IpId` | ← | IP-ID du panel connecté |
| 101 | `Systeme.CpzNom` | ← | Nom du fichier CPZ |
| 102 | `Systeme.CpzDate` | ← | Date de compilation du CPZ |
| 103 | `Systeme.Console` | ↔ | Commande console CP4 (entrée) / réponse (sortie) |
| 104 | `Systeme.DateValidation` | ↔ | Date de dernière validation, **par périphérique** |
| 105 | `Config.Json` | ← | Transport de la config (`VCFG\|i\|n\|payload`) |
| 106 | `Config.Hash` | ← | Empreinte de la config |
| 420 | `Presets.Sauvegarde` | → | Payload JSON de sauvegarde des presets globaux |

### Hors contrat, utilisé par le GUI

| Join | Type | Usage |
|---|---|---|
| 100 | serial | Remontée des `console.log` / `window.onerror` du GUI vers le CP4 (tronqué à 250 car.) |

⚠️ Le C# répond aussi à un **digital 103** (`FormatIpTable`) qui n'est pas au contrat et
qu'aucun GUI n'émet — code mort, avec une troncature différente de celle du chemin sériel
(254 contre 8000 caractères).

---

## 3. Blocs pièces (≥ 1000) — l'intersystem

Chaque pièce expose un bloc de **100 joins** sur l'EISC.

```
base = 1000 + (pieceId − 1) × 100

pièce 1  → 1000-1099        pièce 2  → 1100-1199
pièce 3  → 1200-1299        …        pièce 15 → 2400-2499
```

Le bloc n'est actif que si la pièce porte `"intersystem": true`. Sinon, **aucun signal de
cette pièce n'apparaît côté SIMPL** — c'est le levier pour limiter le nombre de signaux à
monitorer dans le debugger.

Contrairement aux signaux globaux, un bloc pièce s'applique à **sa** pièce quelle que soit
la pièce affichée sur les dalles. C'est ce qui permet au SIMPL de piloter n'importe quelle
pièce sans dépendre du GUI.

### Offsets à ajouter à la base

#### Digitaux

| Offset | `contractName` | Dir. | Description |
|---|---|---|---|
| +1..+9 | `Piece.<id>.Stores.Groupe` | ← | Écho des commandes groupées : Volets +1/+2/+3, Rideaux +4/+5/+6, Stores +7/+8/+9 |
| +21..+24 | `Piece.<id>.Eclairage.Scene` | ↔ | Scènes 1..4 : commande depuis le slot 2 + feedback |
| +35 | `Piece.<id>.CVC.ConsignePlus` | → | +0,5 °C |
| +36 | `Piece.<id>.CVC.ConsigneMoins` | → | −0,5 °C |
| +41..+44 | `Piece.<id>.Stores.Scene` | ↔ | Scènes de stores 1..4 |
| +50 | `Piece.<id>.AV.Mute` | ↔ | Mute |
| +51..+55 | `Piece.<id>.AV.Source.Select` | ↔ | Sélection source vidéo 0..4 — **+51 = OFF** |
| +56 | `Piece.<id>.AV.Musique` | ↔ | Musique sur les haut-parleurs + feedback |
| +57 | `Piece.<id>.AV.Audio.SuivreVideo` | ↔ | Audio = source vidéo + feedback |
| **+61..+78** | `Piece.<id>.Moteur.Commande` | ← | Moteurs 1..6, triplets Monter/Stop/Descendre (écho des appuis GUI) |
| **+81..+92** | `Piece.<id>.Alarme.Partition` | ↔ | Partitions 1..4, triplets Armer/Partiel/Désarmer |

#### Analogiques

| Offset | `contractName` | Dir. | Description |
|---|---|---|---|
| +21 | `Piece.<id>.Eclairage.NiveauMaster` | ↔ | 0..65535 |
| +31 | `Piece.<id>.CVC.Consigne` | ↔ | × 10 |
| **+51** | `Piece.<id>.AV.SourceActive` | ↔ | 0 = off, 1..5 |
| **+52** | `Piece.<id>.AV.Volume` | ↔ | 0..65535 |
| +53 | `Piece.<id>.AV.SourceAudio` | ← | 0 = off, 1..4 = audio vidéo, 5 = musique |
| +71..+80 | `Piece.<id>.Eclairage.Circuit` | ↔ | Niveaux des circuits 1..10 |

#### Sériels

| Offset | `contractName` | Dir. | Description |
|---|---|---|---|
| +10 | `Piece.<id>.Nom` | ← | Nom de la pièce (langue de référence) |
| +32 | `Piece.<id>.CVC.TempActuelle` | ← | |
| +33 | `Piece.<id>.CVC.Mode` | ← | |
| +34 | `Piece.<id>.CVC.ConsigneTexte` | ← | |

### Deux offsets à surveiller de près

Les colonnes en gras ci-dessus sont celles où le câblage SIMPL actuel diverge du contrat :

- **Moteurs = +61..+78**, pas +81. Le SIMPL les a câblés à +81..+98.
- **Partitions = +81..+92.** Ce sont donc les partitions que le SIMPL reçoit sous des noms
  de moteurs.
- **Sources : +51 = OFF**, donc `Source 1` est à **+52**. Le SIMPL nomme `Source1` le
  signal +51.
- **Volume analogique = +52**, pas +53.

Voir [04 — SIMPL slot 2](04_SIMPL_SLOT2.md) § Écarts.

---

## 4. Collisions à connaître

Le C# ne contrôle **aucune** limite. Un dépassement se traduit par une collision
silencieuse dans l'espace de joins global :

| Dépassement | Join produit | Collision |
|---|---|---|
| 5ᵉ scène d'éclairage | digital 55 | **`AV.Mute`** — la scène 5 coupe le son |
| 31ᵉ pièce | digital 41 | **`Alarme.Armer`** — sélectionner la pièce 31 arme l'alarme |
| 11ᵉ circuit | analogique 81 | zone `Moteur.Commande`, non traitée → ignoré |
| 7ᵉ moteur | digitaux 99/100/101 | hors contrat → ignorés |
| 5ᵉ partition | digital 313 | hors `switch` → ignoré |

⚠️ Autre point : le C# route **tout** join ≥ 1000 vers le traitement des blocs pièces, sans
borne haute. Un join firmware compris entre 1000 et 2499 serait interprété comme une
commande sur l'une des pièces 1 à 15.

---

## 5. Pont EISC — configuration

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
- À la mise en ligne de l'EISC, le C# pousse l'état complet de toutes les pièces exposées.

### Sens des signaux

| Sens | Contenu |
|---|---|
| Slot 1 → slot 2 | état complet de chaque pièce exposée (feedback temps réel), signaux globaux 1:1, écho des appuis moteurs et stores |
| Slot 2 → slot 1 | toute commande écrite sur un bloc pièce (scène, consigne, source, circuit, partition…) est appliquée à la pièce visée, et le feedback repart vers les panels **et** l'EISC |

Les commandes venant du slot 2 sur un bloc pièce sont prises en compte **sur front
montant** uniquement.
