# Project_Slot2.smw — programme SIMPL du slot 2 (contrat v4.1)

## État v4.1 (18/09/2026) — ce que le slot 2 reçoit, ce qu'il doit renvoyer

Lu dans `ControlSystem.cs` (routage v4 du 16.09, scènes mémorisées du 18.09) et `generate_slot2.js`. Fait foi sur les sections historiques plus bas.

- **Joins globaux (< 1000)** : tous les pilotages (sources 150-156, télécommandes 211-600, scènes 51-54, stores 61-69, moteurs 81-98, scènes stores 201-204, HVAC 49/50/610-615, wellness 620-627, presets 401-411) arrivent au slot 2 en **impulsion** sur `X_fb`, précédée de `Room_Select#` (a10) = pièce affichée par l'écran émetteur. Le slot 2 route lui-même vers le matériel de cette pièce (buffers sur a10).
- **Le feedback affiché vient du C#, pas du slot 2** : sources, musique, audio = vidéo, mute, scènes d'éclairage, scènes de stores, presets globaux 401-409, mode vacances 410/411, consigne, volumes. Le C# ignore les entrées EISC globales `Source_Select_n`, `Source_AudioReturn`, `Audio_Mute`, `Motor_n_*`, `Shades_Scene_n`, `Media_Volume#`, `Circuit_n#` et `Room_Select#` entrant : **ces entrées sont mortes**, ne pas y câbler d'interlock (doublon avec le C#, sans effet sur les écrans).
- **Ce que le C# lit du slot 2** (entrées du symbole) : `Alarm_Arm/Disarm` (41/42), `Alarm_Code_OK/KO` (44/45), `Alarm_Part<n>_*` (301-312), `Global_Vacation_On/Off` (410/411), et par pièce les `_Actual` : `Rxx_HVAC_On_Actual`, `Rxx_HVAC_FanSpeed_Actual#`, `Rxx_HVAC_Setpoint#`, `Rxx_HVAC_Temperature#` (mesure × 10), `Rxx_Sauna/Hammam_*_Actual`, `Rxx_Circuit_N_Actual#` (niveau réel, 1..20), `Rxx_Lighting_SceneN_Actual` (scène imposée par un clavier, facultatif).
- **Blocs pièce (≥ 1000)** : seuls trois blocs sont générés par pièce `intersystem` — CVC (+31..34, +93..98), wellness (+11..16, a+34..37, s+44..47) et éclairage (+21..24, a+71..90). Le C# pousse aussi vers l'EISC les offsets +41..45, +50..57, +81..92, a+51..54, s+10 de chaque pièce (`PushRoomFeedback`) : **sans nom dans le générateur, donc invisibles au debugger** — à nommer dans un prochain lot si le slot 2 doit s'en servir.
- **Rôle du slot 2** : drivers réels derrière les `_fb` / `_Cmd` (gradateurs sur `Rxx_Circuit_N_fb#`, moteurs, IR/IP des télécommandes routées par a10 + `Source_Active#`, centrale d'alarme sur 43-46, thermostats, sauna/hammam), remontée des mesures `_Actual`, position intermédiaire des stores (406, vide côté C#). Rien d'autre.
- **20 circuits par pièce** (a71-90, `MAX_CIRCUITS = 20`) ; `circuits.nombre` du JSON borne le câblage. Le `.smw` de base contient encore 2010 définitions `R01_..R15_` du v3, sans câblage : à nettoyer dans SIMPL Windows.
- **Recette Debugger restante (LPZ v4.1 compilé le 18.09, jamais testé sur matériel)** : rappel de scène → `Lighting_SceneN_fb` impulsion + `Rxx_Lighting_SceneN_fb` tenu + `Rxx_Circuit_1..n_fb#` aux niveaux ; 💾 → aucun join (le sériel 421 n'est pas recopié) ; scène enregistrée sur la dalle visible sur l'iPad ; progreset puis rappel.

## Préparation par projet — outillage 0.2.0, 17/09/2026

`generate_slot2.js --config <profil.json> --input <base.smw> --output <nouveau.smw>` lit exactement le profil indiqué et conserve la base. La sortie distincte doit être neuve. Les sources sont vérifiées avant écriture ; le mode historique en place garde sa sauvegarde. Pour vérifier aussi le contrat et les sources du socle, utiliser `tools/quality/prepare-project.mjs` depuis la racine du dépôt (voir `docs/industrialisation/LOT-0.2.0.md`). Le SMW généré conserve les anciens câblages : vérifier les drivers et compiler le LPZ dans SIMPL Windows avant recette. Les capacités de la base historique peuvent être insuffisantes ; aucun agrandissement implicite du symbole n'est effectué.

## Extension wellness v4 — 17/09/2026

Sauna/hammam : d620–627 ; a/s62–65. Cibles et mesures indépendantes du HVAC, sorties de pièce a+34..37 et s+44..47 (s+34 HVAC préservé). Détails : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Générer une copie SMW puis compiler le LPZ avant recette Debugger. Aucun déploiement matériel réalisé.


## Extension HVAC v4 du 16/09/2026

ON/OFF : d610/611 ; ventilation Auto/1/2/3 : d612–615 et a61 (0..3). Retours par pièce : digitaux +93..98, analogique +33 ; la température mesurée reste +32. Aucun bloc GUI v3 réactivé. Détails, sens des signaux et recette Debugger : `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md` depuis la racine du dépôt.

Généré par `contract/generate_slot2.js` à partir de `simpl-windows/Project_Slot2.smw`
(modifié en place, une sauvegarde `Project_Slot2.backup-<horodatage>.smw` est écrite à
chaque exécution et remplace la précédente). **Fermer le projet dans SIMPL Windows avant de
lancer le script.**

```
node contract/generate_slot2.js
```

Le script lit `projects/villa-crans/ch5/villa_config.json` : contrat de joins, liste des pièces
et flag `intersystem` de chacune.

## Contenu

- CP4 + **EISC « Packed » IP-ID F0 → 127.0.0.2** (la base contenait un typo `172.0.0.2`, corrigé).
- **Signaux globaux (joins < 1000)**, câblés selon `contrat.signauxGlobaux` :

| Famille | Joins | Signaux |
|---|---|---|
| Sélection pièces 1..30 | d11-40 | `Room_Select1..30` (+`_fb`) |
| Alarme armement | d41/42 | `Alarm_Arm` / `Alarm_Disarm` (+`_fb`) |
| **Alarme code (v3)** | s43, d44-46 | `Alarm_Code$` (reçu), `Alarm_Code_OK` / `_KO` (émis), `Alarm_Code_Clear` (reçu) |
| Consigne CVC ± | d49/50 | `HVAC_Setpoint_Up` / `_Down` (reçus, en sortie du symbole depuis le 16.09) |
| Scènes éclairage 1..4 | d51-54 | `Lighting_Scene1..4` (+`_fb`) |
| Mute | d55 | `Audio_Mute` (+`_fb`) |
| Stores groupés | d61-69 | `Shades_Volets/Rideaux/Stores_Up/Stop/Down` |
| Moteurs 1..6 | d81-98 | `Motor_n_Up/Stop/Down` (+`_fb`) |
| Sources A/V 0..5, retour audio | d150-156 | `Source_Select_0..5`, `Source_AudioReturn` (+`_fb`) |
| Partitions d'alarme 1..4 | d301-312 | `Alarm_Part<n>_Arm/Partial/Disarm` (+`_fb` reçus) |
| Commandes globales | d401-411 | `Global_Lights_AllOn/AllOff/Eco`, `Global_Shades_AllOpen/AllClose/Preset`, `Global_HVAC_Comfort/Night/Frost`, `Global_Vacation_On/Off` (`_fb` = reçus) |
| **CVC par pièce (v4)** | a/s 1000+(id-1)*100 +31..34 | `R<nn>_HVAC_Setpoint_fb#` (reçu) / `R<nn>_HVAC_Setpoint#` (envoyé), `R<nn>_HVAC_Temperature#` (mesure envoyée, x10), `R<nn>_HVAC_Temperature_fb$`, `R<nn>_HVAC_Mode_fb$`, `R<nn>_HVAC_Setpoint_fb$` — seuls joins de bloc conservés en v4 |
| Lecteur média | d251-253, a254 | `Media_PlayPause` / `_Next` / `_Prev` (reçus), `Media_Volume#` (+`_fb#`) |
| Scènes stores 1..4 | d201-204 | `Shades_Scene_1..4` (+`_fb`) |
| Pièce active | a10 | `Room_Select#` / `Room_Selected#` |
| Master éclairage / consigne | a21 / a31 | `Lighting_Master` / `HVAC_Setpoint` (+`_fb`) |
| Source / volume | a51 / a52 | `Source_Active#` / `Audio_Volume#` (+`_fb#`) |
| Circuits 1..20 | a71-90 | `Circuit_n#` (+`_fb#`) — entrée `Circuit_n#` morte, le niveau vient du C# |
| Textes CVC / pièce | s10/32/33/34 | `Room_Selected$`, `HVAC_Temperature_fb$`, `HVAC_Mode_fb$`, `HVAC_Setpoint_fb$` |

- **Blocs pièces (joins ≥ 1000)** — `joinPhysique = 1000 + (pieceId − 1) × 100 + offset`. **Historique v3** : le tableau ci-dessous décrit les 69 offsets du v3, dont les définitions `R01_..R15_` subsistent dans le `.smw` sans être câblées. Depuis le v4 seuls les blocs CVC, wellness et éclairage sont générés (voir « État v4.1 » en tête).

| Offsets | Signaux (préfixe `R01_` … `R15_`) |
|---|---|
| +1..+9 | `Shades_Volets/Rideaux/Stores_Up/Stop/Down` |
| +21..+24 | `Lighting_Scene1..4` |
| +35 / +36 | `HVAC_Setpoint_Up` / `_Down` |
| +41..+44 | `Shades_Scene1..4` |
| +45 | `AV_Off` |
| +50 | `Audio_Mute` |
| +51..+55 | `Source_Off` / `Source_AppleTV` / `Source_SkyQ` / `Source_Swisscom` / `Source_IPTV` |
| +56 / +57 | `Source_Music` / `Source_AudioReturn` |
| +58..+60 | `Media_PlayPause` / `Media_Next` / `Media_Prev` |
| +61..+78 | `Motor_1..6_Up/Stop/Down` |
| +21/+31/+51/+52/+53/+54 (analog) | `Lighting_Master#`, `HVAC_Setpoint#`, `Source_Active#`, `Audio_Volume#`, `Source_Audio#`, `Media_Volume#` |
| +71..+90 (analog) | `Circuit_1..20#` |
| +10/+32/+33/+34 (sériel) | `Room_Name$`, `HVAC_Temperature$`, `HVAC_Mode$`, `HVAC_Setpoint_Text$` |

## Convention de nommage — à lire avant d'ouvrir le debugger

- **Signaux globaux** (historique) : nom nu = **entrée** du symbole, le slot 2 commande ;
  suffixe `_fb` = **sortie**, le slot 2 reçoit le retour d'état.
- **Blocs pièces** : nom nu = **sortie** du symbole, donc **ce que le slot 2 reçoit** — l'appui
  sur un bouton de la GUI et l'état courant. C'est ce qu'on regarde dans le debugger.
  Suffixe `_CMD` = **entrée**, ce que le slot 2 envoie vers la GUI.
  Exception assumée : sur un bloc pièce le même join est bidirectionnel, appeler `_fb` l'appui
  d'un bouton serait trompeur.
- Un appui sur « scène 2 » dans la pièce 7 fait donc monter **`R07_Lighting_Scene2`**.

## Ce que le slot 2 n'a PAS à câbler (corrigé le 18/09/2026)

Cette section disait, après le constat TSW du 16.09, que l'état affiché venait « uniquement » du slot 2 et demandait des interlocks sur `Source_Select_1..4`, un toggle sur `Source_Select_5`, des interlocks sur les presets, le mode vacances et les scènes. **C'est périmé depuis le routage v4 côté C# (16.09 soir)** : le C# fournit lui-même le feedback des sources, de la musique, du retour audio, du mute, des scènes d'éclairage et de stores, des presets 401-409, du mode vacances et de la consigne (`RouteGlobalDigitalToActiveRoom`, `PushRoomFeedback`, `PushGlobalSelectionFeedback`). Les entrées EISC correspondantes ne sont pas lues. Seules exceptions encore lues : `Global_Vacation_On/Off` (410/411) et l'alarme (41/42, 44/45, 301-312).

Sur la dalle, une source vidéo active donne le fond violet et le logo agrandi ; la source dont l'audio joue porte le badge égaliseur animé ; la confirmation « la musique reste / l'audio suit la vidéo » n'apparaît que si la musique est active quand on appuie sur une vidéo. Tout cela est calculé par le C# à partir des appuis, puis poussé aux écrans.

## Dimensionnement du symbole EISC

Le script n'écrit pas les dimensions : il les lit et calibre ses offsets dessus
(`analogIn = n1I + 1`, `analogOut = n1O`, `serieOut = n1O + n2I − 1`). Il refuse de câbler une
pièce dont un join dépasse la capacité et la signale dans son rapport.

Pour 15 pièces il faut au moins **2500 joins de chaque type** (le join le plus haut est 2490,
pièce 15 offset +90). Le redimensionnement se fait **à la main dans SIMPL Windows** — double-clic
sur le symbole *Ethernet Intersystem Communications (Packed)* — parce que SIMPL ré-indexe alors
tous les signaux existants, ce qu'aucune édition du fichier ne sait faire de façon fiable.
État au 12.09.2026 : `n1I=2732`, `n2I=2733`, soit 2732 digitaux, 2732 analogiques, 2552 sériels.

## Mise en service

1. Ouvrir `simpl-windows/Project_Slot2.smw` dans SIMPL Windows, **Compile (F12)** → `.lpz`.
2. Charger le `.lpz` sur le **slot 2** du CP4 (Toolbox, ou l'interface web du CP4, section
   *Programs Slot Management*).
3. L'EISC passe ONLINE dans `ipt -p:01` (entrée F0) dès que les deux programmes tournent.
4. Câbler la logique SIMPL sur les signaux nommés.

Prérequis côté CP4 : `/user/villa_config.json` à jour (c'est lui qui porte le flag `intersystem`
de chaque pièce), et le programme du slot 1 redémarré après la copie.
