# 04 — Programme SIMPL slot 2

Dossier : `C:\Users\donat\Desktop\VillaCrans SIMPL` (hors dépôt du GUI)
Fichier principal : `VillaCrans_Slot2.smw` — dernière modification **24.08.2026 20:51**

---

## 1. Rôle

Le slot 2 est le **point de raccordement au matériel réel**. Le slot 1 (C#) tient l'état de
la villa et l'expose sur un EISC ; le slot 2 lit cet EISC et pilote les modules
d'éclairage, les moteurs, le CVC, l'alarme et l'audio.

Le partage des rôles :

| | Slot 1 (C#) | Slot 2 (SIMPL) |
|---|---|---|
| État de la villa | ✅ registre de pièces, feedback aux panels | ❌ |
| Distribution de la config | ✅ | ❌ |
| Logique de scènes, presets, vacances | ✅ | ❌ |
| Pilotage matériel réel | ❌ | ✅ à câbler |

---

## 2. Contenu réel du programme

Ouvert et analysé au 02.09.2026 :

| Élément | Détail |
|---|---|
| Processeur | CP4 (Cresnet id 01, Ethernet id 02) |
| Symbole EISC | **Ethernet Intersystem Communications (Packed)**, `SmC=1160`, H=21 |
| Dimensions EISC | **2232 digitaux / 2233 analogiques-sériels** *(redimensionné : le dimensionnement d'origine 232/233 ne permettait pas les blocs pièces)* |
| IP-ID / IP | `F0` / `127.0.0.2` — confirmé aussi dans `VillaCrans_Slot2.dip` |
| Signaux nommés | **344** |
| Entrées EISC câblées | **150** (103 digitaux, 47 analogiques) |
| Sorties EISC câblées | **191** (135 digitaux, 48 analogiques, 8 sériels) |
| Logique métier | **quasi nulle** : un seul symbole `Analog Buffer` dans un sous-système |

**En clair : le slot 2 est aujourd'hui une coquille de raccordement.** Tous les signaux du
contrat sont exposés sous des noms lisibles, prêts à être câblés, mais aucune logique de
pilotage matériel n'a encore été écrite. C'est exactement le bon état pour passer la main
à l'intégrateur qui câblera les modules.

### Convention de nommage

| Suffixe | Type |
|---|---|
| *(aucun)* | digital |
| `#` | analogique |
| `$` | sériel |
| `_fb` | retour d'état — **sortie EISC**, écrit par le slot 1 |

---

## 3. Ce qui est câblé — signaux globaux

| Famille | Joins | Signaux SIMPL | Contrat |
|---|---|---|---|
| Sélection pièces 1..30 | d11-40 | `Room_Select1..30` + `_fb` | ✅ |
| Alarme générale | d41/42 | `Alarm_Arm` / `Alarm_Disarm` + `_fb` | ✅ |
| Consigne CVC ± | d49/50 | `HVAC_Setpoint_Up` / `_Down` | ✅ |
| Scènes d'éclairage | d51-54 | `Lighting_Scene1..4` + `_fb` | ✅ |
| Mute | d55 | `Audio_Mute` + `_fb` | ✅ |
| Stores groupés | d61-69 (sorties) | `Shades_Volets/Rideaux/Stores_Up/Stop/Down` | ✅ |
| Moteurs 1..6 | d81-98 | `Motor_n_Up/Stop/Down` + `_fb` | ✅ |
| Sources A/V 0..5 | d150-155 | `Source_Select_0..5` + `_fb` | ✅ |
| Scènes de stores | d201-204 | `Shades_Scene_1..4` + `_fb` | ✅ |
| Pièce active | a10 | `Room_Select#` (cmd) / `Room_Selected#` (fb) | ✅ |
| Master éclairage | a21 | `Lighting_Master` + `_fb` | ✅ |
| Consigne CVC | a31 | `HVAC_Setpoint` + `_fb` | ✅ |
| Température actuelle | a32 (fb) | `HVAC_Temperature_fb` | ⚠️ voir §5 |
| Source active / volume | a51 / a52 | `Source_Active#` / `Audio_Volume#` + `_fb#` | ✅ |
| Circuits 1..10 | a71-80 | `Circuit_n#` + `_fb#` | ✅ |
| Nom pièce | s10 | `Room_Selected$` | ✅ |
| Temp / mode / consigne (texte) | s32/s33/s34 | `HVAC_Temperature_fb$`, `HVAC_Mode_fb$`, `HVAC_Setpoint_fb$` | ✅ |

**Note sur les stores groupés (61-69) :** ils sont câblés en **sorties** EISC, pas en
entrées. C'est volontaire et correct — le slot 2 *reçoit* les appuis de la dalle pour
piloter les moteurs réels. Un correctif de `generate_slot2.js` a purgé les anciennes
entrées I61..I69 issues des générations précédentes.

---

## 4. Ce qui est câblé — blocs pièces

Seules les pièces **1, 2 et 3** portent `"intersystem": true`, donc seuls les blocs
1000-1299 sont exposés.

| Pièce | Base | Ce qui est câblé |
|---|---|---|
| 1 — Salle de Jeux | 1000 | Scènes +21..24, écho stores +1..9, circuits analogiques +71..80, consigne ± +35/+36, sources +51..54, volume, moteurs (voir §5), nom +10, temp/mode/consigne sériels +32/33/34 |
| 2 — Chambre Maman | 1100 | Scènes +21..24, écho stores +1..9, circuits analogiques +71..80 |
| 3 — Chambre Papa | 1200 | Scènes +21..24, écho stores +1..9, circuits analogiques +71..80 |

La pièce 1 a été câblée beaucoup plus finement que les deux autres — manifestement à la
main dans SIMPL Windows, en pièce pilote.

---

## 5. ⚠️ Écarts au contrat — à corriger

Ces écarts viennent d'un câblage manuel dans SIMPL Windows (le générateur, lui, respecte le
contrat). Ils ne provoquent pas d'erreur de compilation : les signaux existent, ils portent
juste **le mauvais nom pour le mauvais join**.

### 5.1 Moteurs de la pièce 1 — collision avec les partitions d'alarme (grave)

| Signal SIMPL | Join réel | Ce que le contrat met à cet offset |
|---|---|---|
| `Motor_Room1_Volet_Ext1_Open` + `_fb` | 1081 (+81) | **`Piece.1.Alarme.Partition` 1 — Armer** |
| `Motor_Room1_Volet_Ext1_Stop` + `_fb` | 1082 (+82) | Partition 1 — Partiel |
| `Motor_Room1_Volet_Ext1_Close` + `_fb` | 1083 (+83) | Partition 1 — Désarmer |
| … jusqu'à `Motor_Room1_Store2_Close` | 1098 (+98) | +93..96 = partition 4 ; +97/+98 hors contrat |

Le contrat place les moteurs par pièce à **+61..+78** et les partitions à **+81..+92**.

**Conséquence concrète** : le slot 1 écrit les états de partitions d'alarme sur +81..92 ;
le SIMPL les lira sous des noms `Motor_Room1_*_fb`. Et une commande moteur envoyée par le
slot 2 sur ces signaux sera interprétée par le slot 1 comme un ordre d'armement de
partition.

**Correctif** : recâbler `Motor_Room1_*` sur **1061..1078**, et libérer 1081-1092 pour les
partitions.

### 5.2 Sources A/V de la pièce 1 — décalage d'un rang

| Signal SIMPL | Join réel | Réalité du contrat |
|---|---|---|
| `AV_Room1_Source1` | 1051 (+51) | **source 0 = OFF** |
| `AV_Room1_Source2` | 1052 (+52) | source 1 |
| `AV_Room1_Source3` | 1053 (+53) | source 2 |
| `AV_Room1_Source4` | 1054 (+54) | source 3 |
| *(absent)* | 1055/1056 | sources 4 et 5 |

**Correctif** : renommer en `AV_Room1_Source_0..5` sur +51..+56, ou décaler d'un rang.

### 5.3 Volume analogique de la pièce 1 — mauvais offset

`AV_Room1_Volume` (+ `_fb`) est câblé sur l'**analogique 1053 (+53)**. Le contrat place le
volume à **+52** et la source active à **+51** — ni l'un ni l'autre n'est câblé.

**Correctif** : `AV_Room1_Volume` → analogique +52 ; ajouter `AV_Room1_SourceActive` → +51.

### 5.4 Analogique 33 `HVAC_Mode` — signal fantôme

Une entrée analogique est câblée sur le join **33**. Le contrat ne connaît le join 33 que
comme **sériel** (`CVC.Mode`, sortie). L'analogique 33 n'est ni lu ni écrit par le C# :
signal mort.

**Correctif** : supprimer l'entrée analogique 33.

---

## 6. Ce qui n'est pas câblé

Signaux du contrat sans câblage SIMPL. Certains sont sans objet côté slot 2, d'autres sont
de vraies fonctions manquantes.

### Sans objet pour le slot 2 (fonctions internes GUI ↔ CP4)

`Systeme.IpId` (s99), `Systeme.CpzNom` (s101), `Systeme.CpzDate` (s102),
`Systeme.Console` (s103), `Systeme.DateValidation` (s104), `Config.Json` (s105),
`Config.Hash` (s106), `Config.Resync` (d250), `Config.ChunkAck` (a250),
`Presets.Sauvegarde` (s420), `Systeme.PieceActiveDalle` (a240),
`Systeme.VolumeDalle` (a260), `Systeme.MuteDalle` (d261), `Meteo.EasterEgg` (d56).

⬜ Aucun besoin de les câbler, sauf si l'on veut piloter le volume matériel de la dalle
depuis le SIMPL (a260 / d261) ou lire la pièce affichée par la dalle (a240).

### À câbler — vraies fonctions manquantes

| Famille | Joins | Enjeu |
|---|---|---|
| `Alarme.Partition` | d301-312 | **Les 4 partitions ne sont pas raccordées au SIMPL.** Seul l'armement général (41/42) l'est |
| `Global.Eclairage.*` | d401/402/403 | Tout allumer / tout éteindre / mode éco |
| `Global.Stores.*` | d404/405/406 | Tout ouvrir / tout fermer / position intermédiaire |
| `Global.CVC.*` | d407/408/409 | Confort / nuit / hors gel |
| `Global.Vacances.*` | d410/411 | Mode vacances |

⬜ Ces 14 signaux sont traités côté C# (qui met à jour son état interne et pousse le
feedback) mais **rien ne les traduit en action matérielle**. Un appui sur « Tout éteindre »
change l'affichage du GUI et rien d'autre.

---

## 7. Le générateur `generate_slot2.js`

Le `.smw` est en partie **généré**, pas écrit entièrement à la main.

```
cd "C:\Users\donat\Desktop\VillaCrans SIMPL"
node generate_slot2.js
```

Ce qu'il fait :

1. Crée une **sauvegarde horodatée** (`VillaCrans_Slot2.backup-AAAA-MM-JJ-hh-mm.smw`).
2. Corrige `IPA=172.0.0.2` → `127.0.0.2` et le nom de programme.
3. Lit les dimensions du symbole EISC et **auto-calibre** les offsets internes
   (analogique entrée / analogique sortie / sériel sortie) sur des signaux de référence
   déjà câblés — c'est ce qui lui permet de survivre à un redimensionnement du symbole.
4. Ajoute les signaux du contrat v2 manquants, en respectant les entrées existantes
   (les câblages manuels ne sont **jamais** écrasés).
5. Lit `..\VillaCrans\villa_config.json` pour ne câbler les blocs pièces que des pièces
   `intersystem: true`.
6. Réécrit le bloc du symbole EISC et ajoute les nouveaux blocs de signaux en fin de
   fichier.

Règles d'usage :

- ⚠️ **Fermer `VillaCrans_Slot2.smw` dans SIMPL Windows avant de lancer le script** — il
  modifie le fichier en place.
- Le script est **idempotent** : le relancer ne duplique rien.
- Il n'écrase jamais un câblage manuel existant. **C'est pourquoi les écarts du §5 ne se
  corrigent pas tout seuls** : il faut les supprimer dans SIMPL Windows, puis relancer le
  script.
- La base d'origine `VillaCrans.smw` a été supprimée ; le fichier de travail est aussi le
  fichier de sortie. Les sauvegardes horodatées sont le seul filet.

---

## 8. Mise en service

1. Ouvrir `VillaCrans_Slot2.smw` dans SIMPL Windows.
2. **Compile (F12)** → `VillaCrans_Slot2.lpz`.
3. Charger le `.lpz` sur le **slot 2** du CP4 : par Toolbox, ou copie dans `/program02/`
   puis console `progload -p:02`.
4. Vérifier que l'EISC passe ONLINE : `ipt -p:01` doit montrer l'entrée `F0`.
5. Câbler la logique matérielle sur les signaux nommés.

Le slot 1 doit tourner pour que l'EISC monte. À sa mise en ligne, le C# pousse
immédiatement l'état complet de toutes les pièces exposées.

---

## 9. Capacité et dimensionnement

Le symbole EISC est aujourd'hui à **2232 digitaux / 2233 analogiques-sériels**, ce qui
couvre les blocs des pièces 1 à 22 en digital.

Pour aller au-delà : dans SIMPL Windows, double-cliquer le symbole EISC et porter les
digitaux à **4001** et les analogiques/sériels à **2587** (valeurs suggérées par le
générateur), sauvegarder, puis relancer `node generate_slot2.js` — SIMPL réindexe seul et
le script recâble.

Rappel : chaque pièce passée à `"intersystem": true` ajoute ~62 signaux à surveiller dans
le debugger, et le slot 1 réécrit tout le bloc à chaque changement d'état de la pièce.
N'exposer que les pièces réellement câblées.

---

## 10. Fichiers du dossier

| Fichier | Rôle |
|---|---|
| `VillaCrans_Slot2.smw` | programme de travail — **c'est celui qu'on édite et qu'on compile** |
| `generate_slot2.js` | générateur, voir §7 |
| `README_SLOT2.md` | note d'origine (décrit encore le dimensionnement 232/233, antérieur au redimensionnement) |
| `VillaCrans_Slot2.backup-*.smw` | sauvegardes horodatées automatiques (4 à ce jour) |
| `VillaCrans_Slot2.lpz` | dernière compilation (23.08.2026) — **antérieure au `.smw` actuel** |
| `VillaCrans_Slot2.dip` | table IP générée : `id0=F0`, `addr0=127.0.0.2` |
| `VillaCrans_Slot2.sig` | table des signaux de la compilation |
| `VillaCrans_Slot2.smft` | définition matérielle : CP4, Cresnet 01, Ethernet 02 |
| `VillaCrans_Slot2.sm2` | ancienne révision |
| `VillaCrans.smw.ASV` | autosave de la base d'origine (supprimée) |

⚠️ **Le `.lpz` date du 23.08 alors que le `.smw` a été modifié le 24.08** : ce qui tourne
sur le CP4 n'est pas le programme en cours d'édition. Recompiler avant tout test.

⬜ Ce dossier n'est pas versionné et vit à côté du dépôt GUI. À rapatrier sous git, ou au
minimum à sauvegarder ailleurs que sur le Bureau.
