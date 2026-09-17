# VillaCrans_Slot2.smw — programme SIMPL du slot 2

## Préparation par projet — outillage 0.2.0, 17/09/2026

`generate_slot2.js --config <profil.json> --input <base.smw> --output <nouveau.smw>` lit exactement le profil indiqué et conserve la base. La sortie distincte doit être neuve. Les sources sont vérifiées avant écriture ; le mode historique en place garde sa sauvegarde. Pour vérifier aussi le contrat et les sources du socle, utiliser `tools/quality/prepare-project.mjs` depuis la racine du dépôt (voir `docs/industrialisation/LOT-0.2.0.md`). Le SMW généré conserve les anciens câblages : vérifier les drivers et compiler le LPZ dans SIMPL Windows avant recette. Les capacités de la base historique peuvent être insuffisantes ; aucun agrandissement implicite du symbole n'est effectué.

## Extension wellness v4 — 17/09/2026

Sauna/hammam : d620–627 ; a/s62–65. Cibles et mesures indépendantes du HVAC, sorties de pièce a+34..37 et s+44..47 (s+34 HVAC préservé). Détails : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Générer une copie SMW puis compiler le LPZ avant recette Debugger. Aucun déploiement matériel réalisé.


## Extension HVAC v4 du 16/09/2026

ON/OFF : d610/611 ; ventilation Auto/1/2/3 : d612–615 et a61 (0..3). Retours par pièce : digitaux +93..98, analogique +33 ; la température mesurée reste +32. Aucun bloc GUI v3 réactivé. Détails, sens des signaux et recette Debugger : `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md` depuis la racine du dépôt.

Généré par `contract/generate_slot2.js` à partir de `simpl-windows/VillaCrans_Slot2.smw`
(modifié en place, une sauvegarde `VillaCrans_Slot2.backup-<horodatage>.smw` est écrite à
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
| Circuits 1..10 | a71-80 | `Circuit_n#` (+`_fb#`) |
| Textes CVC / pièce | s10/32/33/34 | `Room_Selected$`, `HVAC_Temperature_fb$`, `HVAC_Mode_fb$`, `HVAC_Setpoint_fb$` |

- **Blocs pièces (joins ≥ 1000)** — contrat v3, `joinPhysique = 1000 + (pieceId − 1) × 100 + offset`.
  Les 69 offsets de `contrat.blocsPiecesGui.mapping` sont câblés pour chaque pièce exposée :
  49 digitaux, 16 analogiques, 4 sériels.

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
| +71..+80 (analog) | `Circuit_1..10#` |
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

## Logique à câbler côté slot 2 — sans elle, la GUI n'a AUCUN feedback (constat TSW du 16.09.2026)

La GUI ne présume rien : un appui est une **impulsion de 80 ms** sur `X_fb`, et l'état affiché
(fond violet, badge égaliseur, confirmation « musique ou vidéo », vert des boutons globaux)
vient **uniquement** de l'entrée `X` renvoyée par le slot 2. Tant que rien n'est câblé, le
debugger montre l'impulsion et la tablette ne change pas. À câbler :

| Fonction | Reçu (`_fb`, impulsion) | À renvoyer (nom nu, maintenu) | Symbole SIMPL |
|---|---|---|---|
| Source vidéo | `Source_Select_1..4_fb` | `Source_Select_1..4` | **Interlock** 4 voies ; `Source_Select_0_fb` (tout éteindre) = *Clear* |
| Musique sur les HP | `Source_Select_5_fb` | `Source_Select_5` | **Toggle** ; remis à 0 par `Source_AudioReturn_fb` (156) et par `Source_Select_0_fb` |
| Audio = vidéo | `Source_AudioReturn_fb` | `Source_AudioReturn` | = NOT `Source_Select_5` |
| Mode vacances | `Global_Vacation_On/Off` (410/411) | idem | **Interlock** 2 voies (les boutons ne se sélectionnent plus localement depuis le 16.09) |
| Presets globaux | 401-403, 404-405, 407-409 | idem | **Interlock** par famille |
| Consigne CVC ± | `HVAC_Setpoint_Up/Down` (49/50, reçus) | `HVAC_Setpoint` (a31) ± 5 (x10 : 0,5 °C) | Analog Increment / Decrement, borné |
| Scènes d'éclairage | `Lighting_Scene1..4_fb` | `Lighting_Scene1..4` | **Interlock** |

Sur la dalle, une source vidéo active (`Source_Select_N` = 1) donne le fond violet et le logo
agrandi ; la source dont l'**audio** joue (`Source_Select_N` si musique = 0, sinon
`Source_Select_5`) porte le badge égaliseur animé. La confirmation « la musique reste / l'audio
suit la vidéo » n'apparaît que si `Source_Select_5` est à 1 quand on appuie sur une vidéo.

## Dimensionnement du symbole EISC

Le script n'écrit pas les dimensions : il les lit et calibre ses offsets dessus
(`analogIn = n1I + 1`, `analogOut = n1O`, `serieOut = n1O + n2I − 1`). Il refuse de câbler une
pièce dont un join dépasse la capacité et la signale dans son rapport.

Pour 15 pièces il faut au moins **2500 joins de chaque type** (le join le plus haut est 2480,
pièce 15 offset +80). Le redimensionnement se fait **à la main dans SIMPL Windows** — double-clic
sur le symbole *Ethernet Intersystem Communications (Packed)* — parce que SIMPL ré-indexe alors
tous les signaux existants, ce qu'aucune édition du fichier ne sait faire de façon fiable.
État au 12.09.2026 : `n1I=2732`, `n2I=2733`, soit 2732 digitaux, 2732 analogiques, 2552 sériels.

## Mise en service

1. Ouvrir `simpl-windows/VillaCrans_Slot2.smw` dans SIMPL Windows, **Compile (F12)** → `.lpz`.
2. Charger le `.lpz` sur le **slot 2** du CP4 (Toolbox, ou l'interface web du CP4, section
   *Programs Slot Management*).
3. L'EISC passe ONLINE dans `ipt -p:01` (entrée F0) dès que les deux programmes tournent.
4. Câbler la logique SIMPL sur les signaux nommés.

Prérequis côté CP4 : `/user/villa_config.json` à jour (c'est lui qui porte le flag `intersystem`
de chaque pièce), et le programme du slot 1 redémarré après la copie.
