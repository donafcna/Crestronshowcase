# Appartement Crans-Montana — contrat de joins (v4.1 du Core, appliqué au projet)

Le contrat est celui du Core Villa Crans (`projects/villa-crans/ch5/docs/03_CONTRAT_JOINS.md`,
`projects/villa-crans/simpl/contract/README_SLOT2.md`) : rien n'est redéfini ici, seul le dimensionnement
vient de `villa_config.json`. GUI CH5 et C# du slot 1 sont des copies du Core ; le SMW du slot 2 est généré.

## Principe v4

- Tous les pilotages portent le **même join quelle que soit la pièce** (sources 150-156, télécommandes 211-600,
  scènes 51-54, stores groupés 61-69, moteurs 81-98, scènes stores 201-204, CVC 49/50/610-615, presets 401-411).
  Le C# connaît la pièce affichée par chaque écran (`_activeRoomPerDevice`), pose `Room_Selected#` (a10) sur
  l'EISC puis relaie l'impulsion en `X_fb`. Le slot 2 route vers le matériel de cette pièce avec des buffers.
- **Le feedback des écrans vient du C#** (sources, scènes, consigne, presets, vacances). Le slot 2 renvoie les
  mesures réelles par pièce (`Rxx_*_Actual`), qui font foi dès réception.
- Sens sur le symbole EISC : sortie = reçu par le slot 2, entrée = renvoyé par le slot 2.

## Joins globaux (< 1000)

| Famille | Joins | Slot 2 reçoit (sortie) | Slot 2 renvoie (entrée, lu par le C#) |
|---|---|---|---|
| Pièces | d11-40, a10, s10 | `Room_SelectN_fb`, `Room_Selected#`, `Room_Selected$` | `Room_SelectN`, `Room_Select#` (ignorés) |
| Alarme | d41/42, s43, d44-46, d301-312 | `Alarm_Arm/Disarm_fb`, `Alarm_Code$`, `Alarm_Code_Clear`, `Alarm_PartN_*_fb` | `Alarm_Arm/Disarm`, `Alarm_Code_OK/KO`, `Alarm_PartN_*` |
| Éclairage | d51-54, a21, a71-90 | `Lighting_SceneN_fb`, `Lighting_Master_fb`, `Circuit_n_fb#` | `Lighting_SceneN`, `Lighting_Master`, `Circuit_n#` (ignorés) |
| Stores | d61-69, d81-98, d201-204 | `Shades_<Volets/Rideaux/Stores>_Up/Stop/Down`, `Motor_n_*_fb`, `Shades_Scene_n_fb` | `Motor_n_*`, `Shades_Scene_n` (ignorés) |
| Audio / vidéo | d150-156, d200, d55, a51/52, d211-220, d500-600, d251-253, a254 | `Source_Select_n_fb`, `Source_AudioReturn_fb`, `AV_Off_fb`, `Audio_Mute_fb`, `Source_Active_fb#`, `Audio_Volume_fb#`, `Remote_AppleTV/SkyQ/IPTV/Swisscom_*`, `Media_*`, `Media_Volume_fb#` | entrées miroir ignorées |
| CVC global | d49/50, d610-615, a31-33, a61, s32-34 | `HVAC_Setpoint_Up/Down`, `HVAC_On/Off/Fan_*_Cmd`, `HVAC_Setpoint_fb`, `HVAC_Temperature_fb`, `HVAC_Mode_fb`, `HVAC_FanSpeed_Cmd#`, `HVAC_*_fb$` | `HVAC_Setpoint`, `HVAC_Mode` (ignorés) |
| Presets | d401-411 | `Global_*_fb` | `Global_Vacation_On/Off` |
| Wellness | d620-627, a62/63 | non câblé (`contrat.wellness.actif = false`) | — |

Système (s99-106, d/a250, a240/a260/d261, d421-424, s420/421) : entre GUI et C# uniquement, jamais sur l'EISC.

## Blocs pièce (>= 1000) — base = 1000 + (id - 1) x 100

| Offset | Slot 2 reçoit | Slot 2 renvoie | Condition |
|---|---|---|---|
| d+21..24 | `Rxx_Lighting_SceneN_fb` (scène active) | `Rxx_Lighting_SceneN_Actual` (clavier) | `eclairages.actif` |
| a+71..+70+n | `Rxx_Circuit_n_fb#` (niveau imposé) | `Rxx_Circuit_n_Actual#` (niveau réel) | n = `circuits.nombre` (1..20) |
| a+31 | `Rxx_HVAC_Setpoint_fb#` (x10) | `Rxx_HVAC_Setpoint#` (thermostat) | `cvc.actif` |
| a+32, s+32..34 | `Rxx_HVAC_Temperature_fb$`, `_Mode_fb$`, `_Setpoint_fb$` | `Rxx_HVAC_Temperature#` (x10) | `cvc.actif` |
| a+33, d+93..98 | `Rxx_HVAC_FanSpeed_fb#`, `Rxx_HVAC_On/Off/Fan_*_fb` | `Rxx_HVAC_FanSpeed_Actual#`, `Rxx_HVAC_On_Actual` | `cvc.actif` |

Le C# pousse aussi vers l'EISC les offsets +41..57, +81..92, a+51..54, s+10 (`PushRoomFeedback`), sans nom
dans le générateur : invisibles au Debugger, chantier Core (voir CONTEXTE du Core, « Reste à faire » 4).

## Les 17 pièces

Circuits et scènes viennent de la séquence d'opérations Lutron (`tools/lutron-seq-of-op.json`), moteurs, CVC et
A/V des plans. Les pièces sans moteur portent 6 moteurs de repli inactifs (`moteurs.actif = false`).

| id | Pièce | Circuits | Moteurs réels | CVC | A/V | Base bloc | Signaux bloc |
|---|---|---|---|---|---|---|---|
| 1 | Salon | 5 | 4 (2 rideaux, 2 voilages) | oui | oui | 1000 | 32 |
| 2 | Salle à manger | 3 | 2 | oui | oui | 1100 | 28 |
| 3 | Cuisine | 6 | 1 | oui | oui | 1200 | 34 |
| 4 | Entrée & couloir | 3 | 0 | - | - | 1300 | 14 |
| 5 | WC | 1 | 0 | - | - | 1400 | 10 |
| 6 | Buanderie | 2 | 0 | - | - | 1500 | 12 |
| 7 | Chambre principale | 10 | 3 | oui | oui | 1600 | 42 |
| 8 | Salle de bains principale | 8 | 0 | oui | - | 1700 | 38 |
| 9 | Bureau | 2 | 1 | oui | - | 1800 | 26 |
| 10 | Salle TV | 8 | 2 | oui | oui | 1900 | 38 |
| 11 | Salle de bains TV | 11 | 0 | oui | - | 2000 | 44 |
| 12 | Hall & escalier | 3 | 0 | - | - | 2100 | 14 |
| 13 | Chambre Twin | 8 | 2 | oui | oui | 2200 | 38 |
| 14 | Salle de bains Twin | 10 | 0 | oui | - | 2300 | 42 |
| 15 | Chambre VIP | 8 | 2 | oui | oui | 2400 | 38 |
| 16 | Salle de bains VIP | 10 | 0 | oui | - | 2500 | 42 |
| 17 | Balcons & terrasses | 3 | 1 | - | - | 2600 | 14 |

Total : 101 circuits, 18 moteurs, 13 pièces CVC, 8 pièces A/V (5 sources : Apple TV, Sky Q, Swisscom, IPTV,
MUSIQUE), 4 scènes d'éclairage par pièce (OFF / JOUR / SOIR / NUIT). Join le plus haut : d2698 (pièce 17,
+98) sur un symbole de 2732 : la pièce 17 est la dernière possible sans agrandir l'EISC dans SIMPL Windows.

## Recette Debugger (à faire, rien testé sur matériel)

1. Slot 1 chargé avec `/user/villa_config.json`, slot 2 chargé : `ipt -p:01` montre F0 ONLINE.
2. Dalle : choisir une pièce → `Room_Selected#` = id, `Room_SelectN_fb` haut, `Room_Selected$` = nom.
3. Scène JOUR dans le Salon → `Lighting_Scene2_fb` impulsion, `R01_Lighting_Scene2_fb` tenu,
   `R01_Circuit_1..5_fb#` aux niveaux de la table `niveaux` (52428 / 65535).
4. Curseur d'un circuit → `R01_Circuit_n_fb#` suit ; forcer `R01_Circuit_n_Actual#` depuis le Debugger →
   le GUI affiche la valeur forcée (le slot 2 fait foi).
5. Consigne +/- → `HVAC_Setpoint_Up/Down` impulsion puis `R01_HVAC_Setpoint_fb#` (x10) ; forcer
   `R01_HVAC_Temperature#` = 215 → la dalle affiche 21,5 °C.
6. Moteur 1 monter → `Motor_1_Up_fb` impulsion précédée de `Room_Selected#`.
7. Source Apple TV puis une touche de la télécommande → `Source_Select_1_fb`, `Source_Active_fb#`, `Remote_AppleTV_*`.
8. Deux écrans sur deux pièces différentes : vérifier que a10 précède chaque impulsion et que la pièce de
   destination est la bonne (limite connue : deux appuis simultanés sur le même join ne font qu'un front).
9. Alarme : code sur la dalle → `Alarm_Code$` ; forcer `Alarm_Code_OK` → le GUI passe en armé.
