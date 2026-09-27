# FTV Home — contrat de joins v1.0 (27.09.2026)

Référence unique : `config/ftvhome_config.json` → `contrat`. Le C# (`Joins.cs`), le SIMPL (`FtvHome_Slot2.smw`) et le futur GUI CH5 s'y conforment ; `tools/check-contract.js` vérifie la cohérence.

## Principe

- Tous les joins de pilotage sont globaux : le même numéro dans toutes les pièces.
- Le C# (slot 1) connaît la pièce affichée par chaque écran (_activeRoomPerDevice) : il applique l'action à cette pièce, pose Room_Select# (a10) sur l'EISC, puis recopie l'impulsion sur le même join. Le slot 2 route avec des buffers validés par Room_Active_nn (d11-40, un seul haut = a10).
- Feedback des écrans : toujours calculé par le C#. Le slot 2 renvoie les mesures réelles par les entrées _Actual des blocs pièce ; elles font foi dès réception.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, Rnn_xxx_fb = état tenu par le C#) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc pièce EISC : join = 1000 + (id-1)*100 + offset. Réservé aux échanges C# ↔ slot 2, jamais émis par un écran.

Direction : → = écran → C# · ← = C# → écran · ↔ = commande et feedback sur le même join.

## 1. Signaux globaux (écrans ↔ C#, recopiés vers le slot 2)

### Digitaux

| Join | Nom | Sens | Description |
|---|---|---|---|
| 11-40 | `Room_Select_{n}` | ↔ | Sélection directe de la pièce n (join = 10+n) ; fb = pièce affichée par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. |
| 51 | `Scene_Arrive` | ↔ | Scène maison « J'arrive » ; fb = impulsion 1,4 s « Scène appliquée » |
| 52 | `Scene_Morning` | ↔ | Scène « Bonjour » |
| 53 | `Scene_Night` | ↔ | Scène « Bonne nuit » |
| 54 | `Scene_Leave` | ↔ | Scène « Je pars » |
| 55 | `Room_Off` | ↔ | Éteindre la pièce affichée (éclairages, musique, écrans vidéo) |
| 101 | `Lights_AllOn` | ↔ | Tous les circuits de la pièce à 100 % ; fb = tous allumés |
| 102 | `Lights_AllOff` | ↔ | Tous les circuits à 0 ; fb = tous éteints |
| 103 | `Lights_DimUp` | → | Tous les circuits +20 % |
| 104 | `Lights_DimDown` | → | Tous les circuits −20 % |
| 111-130 | `Light_{n}_Toggle` | ↔ | Bascule 0/100 % du circuit n (1..20) ; fb = circuit allumé (> 0) |
| 141 | `Shades_AllOpen` | ↔ | Tous les occultants de la pièce à 100 % ; fb = tous ouverts |
| 142 | `Shades_AllClose` | ↔ | Tous à 0 % ; fb = tous fermés |
| 151-158 | `Shade_{n}_Up` | ↔ | Monter l'occultant n (1..8) → 100 % ; fb = position 100 % |
| 161-168 | `Shade_{n}_Stop` | ↔ | Stop → position mi-course 50 % ; fb = 50 % |
| 171-178 | `Shade_{n}_Down` | ↔ | Descendre → 0 % ; fb = 0 % |
| 181 | `HVAC_Setpoint_Up` | → | Consigne +pas (0,5 °C), bornée min/max |
| 182 | `HVAC_Setpoint_Down` | → | Consigne −pas |
| 183 | `HVAC_Mode_Heat` | ↔ | Mode Chauffage ; fb tenu |
| 184 | `HVAC_Mode_Cool` | ↔ | Mode Rafraîchissement ; fb tenu |
| 185 | `HVAC_Mode_Auto` | ↔ | Mode Automatique ; fb tenu |
| 186 | `HVAC_Mode_Next` | → | Rotation Chauffage → Rafraîchissement → Automatique (bouton unique du GUI) |
| 187 | `HVAC_Fan_Auto` | ↔ | Ventilateur automatique ; fb tenu |
| 188 | `HVAC_Fan_On` | ↔ | Ventilateur continu ; fb tenu |
| 189 | `HVAC_Schedule_Run` | ↔ | Planification en cours ; fb tenu |
| 190 | `HVAC_Schedule_Hold` | ↔ | Planification en pause (maintien manuel) ; fb tenu |
| 191 | `HVAC_Humidity_On` | ↔ | Contrôle de l'humidité activé ; fb tenu |
| 192 | `HVAC_Humidity_Off` | ↔ | Contrôle de l'humidité désactivé ; fb tenu |
| 201 | `Lock_Lock` | ↔ | Verrouiller la serrure de la pièce ; fb tenu = verrouillée |
| 202 | `Lock_Unlock` | ↔ | Déverrouiller ; fb tenu = déverrouillée |
| 211 | `Access_FrontDoor_Lock` | ↔ | Maison : porte d'entrée verrouillée (fb tenu) |
| 212 | `Access_FrontDoor_Unlock` | ↔ | Maison : porte d'entrée déverrouillée (fb tenu) |
| 213 | `Access_Gate_Close` | ↔ | Maison : portail fermé (fb tenu) |
| 214 | `Access_Gate_Open` | ↔ | Maison : portail ouvert (fb tenu) |
| 215 | `Access_Garage_Open` | ↔ | Maison : garage ouvert (fb tenu) |
| 216 | `Access_Garage_Close` | ↔ | Maison : garage fermé (fb tenu) |
| 217 | `Access_Garage_Closing` | ← | Maison : « Fermeture en cours… » (tenu pendant garageFermetureMs) |
| 221 | `Pool_On` | ↔ | Filtration piscine activée (fb tenu) |
| 222 | `Pool_Off` | ↔ | Piscine désactivée (fb tenu) |
| 223 | `Spa_On` | ↔ | Spa activé (fb tenu) |
| 224 | `Spa_Off` | ↔ | Spa désactivé (fb tenu) |
| 231-238 | `Video_Display_{n}_Select` | ↔ | Écran n devient la cible de la feuille Vidéo de cet écran ; fb = écran ciblé |
| 241-248 | `Video_Display_{n}_On` | ↔ | Allumer l'écran n (source TV par défaut) ; fb tenu = allumé |
| 250 | `Config_Resync` | → | Demande de (ré)envoi de la configuration JSON |
| 251-258 | `Video_Display_{n}_Off` | ↔ | Éteindre l'écran n ; fb tenu = éteint |
| 261-268 | `Video_Source_{n}` | ↔ | Router la source n vers l'écran ciblé (et l'allumer) ; fb = source active sur l'écran ciblé |
| 271-278 | `Video_Channel_{n}` | ↔ | Chaîne n (source TV seulement) ; fb = chaîne active |
| 281-288 | `Music_Service_{n}` | ↔ | Service audio n dans la pièce affichée (démarre la lecture) ; fb = service actif |
| 291-298 | `Music_Fav_{n}` | ↔ | Lance le favori n ; fb = favori en cours |
| 301 | `Music_Prev` | → | Précédent |
| 302 | `Music_PlayPause` | ↔ | Lecture / pause ; fb tenu = en lecture |
| 303 | `Music_Next` | → | Suivant |
| 304 | `Music_Mute` | ↔ | Coupe le son (volume 0) ; fb tenu = muet |

### Analogiques

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Pièce affichée par cet écran (1..30). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11-30 | `Light_{n}_Level#` | ↔ | Niveau du circuit n (0-65535) ; curseur → C# ; fb = niveau |
| 31-38 | `Shade_{n}_Position#` | ↔ | Position de l'occultant n (0-65535, 65535 = ouvert) |
| 40 | `Video_Display_Target#` | ↔ | Écran ciblé par la feuille Vidéo (1..8) |
| 41-48 | `Video_Display_{n}_Volume#` | ↔ | Volume de l'écran n (0-100) |
| 49 | `Video_Volume#` | ↔ | Volume de l'écran ciblé (0-100) |
| 51-58 | `Video_Display_{n}_Source#` | ← | Source active de l'écran n (0 = éteint, 1..8) |
| 59 | `Video_Channel#` | ← | Chaîne active (1..8, 0 = aucune) |
| 60 | `HVAC_Setpoint#` | ↔ | Consigne × 10 (215 = 21,5 °C) |
| 61 | `HVAC_Temperature#` | ← | Température mesurée × 10 |
| 62 | `HVAC_Mode#` | ← | 1 = Chauffage, 2 = Rafraîchissement, 3 = Automatique |
| 63 | `HVAC_Fan#` | ← | 0 = Automatique, 1 = Continu |
| 64 | `HVAC_Humidity#` | ← | Hygrométrie mesurée (%) |
| 70 | `Music_Volume#` | ↔ | Volume musique de la pièce (0-100) |
| 71 | `House_LightsOn#` | ← | Nombre de circuits allumés dans la maison |
| 72 | `House_ShadesOpen#` | ← | Nombre d'occultants ouverts (> 5 %) dans la maison |
| 73 | `Room_LightsOn#` | ← | Circuits allumés dans la pièce affichée |
| 74 | `Room_ShadesOpen#` | ← | Occultants ouverts dans la pièce affichée |
| 250 | `Config_ChunkAck#` | → | Accusé de réception du chunk N de configuration |

### Sériels (écrans seulement, jamais sur l'EISC)

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Name$` | ← | Nom de la pièce affichée |
| 11 | `Room_Subtitle$` | ← | « 2 éclairages allumés » / « Tous les éclairages éteints » |
| 20 | `Music_Title$` | ← | Titre en cours |
| 21 | `Music_Sub$` | ← | Sous-titre « Radio · Séjour » |
| 22 | `Music_Tint$` | ← | Couleur de pochette (#rrggbb) |
| 23 | `Video_Source_Name$` | ← | Nom de la source active sur l'écran ciblé |
| 30 | `House_Status$` | ← | Bandeau d'état de la maison |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |
| 105 | `Config_Json$` | ← | Transport de la configuration (VCFG|i|n|payload) |
| 106 | `Config_Hash$` | ← | Empreinte de la configuration |

## 2. Ce que voit le slot 2 sur le symbole EISC (IP-ID F0, 127.0.0.2)

- **Sorties du symbole = ce que le slot 2 reçoit.** Chaque action arrive sous son nom nu (`Scene_Night`, `Light_2_Toggle`, `Shade_1_Up`, `HVAC_Setpoint#`, `Music_Volume#`…) en impulsion, **précédée** de `Room_Select#` (a10) et de `Room_Active_nn` (d11-40, un seul haut). Un appui sur « Baisser » dans la Cuisine fait donc monter `Room_Active_02` puis `Lights_DimDown`.
- **Entrées du symbole = ce que le slot 2 renvoie.** États réels maison `xxx_Actual` (mêmes joins que l'action : `Access_FrontDoor_Locked_Actual` d211, `Pool_On_Actual` d221, `Video_Display_1_On_Actual` d241, `Video_Display_1_Source_Actual#` a51…) et mesures par pièce `Rnn_xxx_Actual` dans les blocs pièce.
- Les sériels ne sont pas câblés en entrée. Les analogiques « ← » (mesures pour les écrans) ne sont pas sur l'EISC : ils passent par les blocs pièce.
- Bufferisation : un sous-système « Piece nn » par pièce contient un **Analog Buffer** validé par `Room_Active_nn` qui recopie les analogiques globaux vers `Rnn_xxx_Buf#`. Pour les digitaux, poser de la même façon un symbole **Buffer** (enable = `Room_Active_nn`) dans SIMPL Windows.

## 3. Blocs pièce (C# ↔ slot 2) — join = 1000 + (id−1)×100 + offset

Échanges C# ↔ slot 2 par pièce 'intersystem'. _fb = tenu par le C# (sortie EISC, reçu par le slot 2) ; _Actual = mesure renvoyée par le slot 2 (entrée EISC). Seules les fonctionnalités actives de la pièce sont câblées.

### Digitaux

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-20 | `Light_{n}_On` | oui | oui | eclairages |
| +21-28 | `Shade_{n}_Up` | oui | — | occultants — Impulsion vers le moteur |
| +31-38 | `Shade_{n}_Stop` | oui | — | occultants |
| +41-48 | `Shade_{n}_Down` | oui | — | occultants |
| +51 | `Lock_Locked` | oui | oui | serrure |
| +52 | `HVAC_Heat` | oui | oui | cvc |
| +53 | `HVAC_Cool` | oui | oui | cvc |
| +54 | `HVAC_Auto` | oui | oui | cvc |
| +55 | `HVAC_FanOn` | oui | oui | cvc |
| +56 | `HVAC_Hold` | oui | oui | cvc |
| +57 | `HVAC_Humidity` | oui | oui | cvc |
| +61 | `Room_Displayed` | oui | — | * — La pièce est affichée sur au moins un écran |
| +71 | `Music_Playing` | oui | oui | audio |
| +72 | `Music_Muted` | oui | oui | audio |

### Analogiques

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +11-30 | `Light_{n}_Level` | oui | oui | eclairages |
| +31-38 | `Shade_{n}_Position` | oui | oui | occultants |
| +60 | `HVAC_Setpoint` | oui | oui | cvc — × 10 |
| +61 | `HVAC_Temperature` | — | oui | cvc — × 10, mesure du thermostat |
| +64 | `HVAC_Humidity` | — | oui | cvc — % mesuré |
| +70 | `Music_Volume` | oui | oui | audio |
| +75 | `Music_Service` | oui | oui | audio — 1..8 |
| +76 | `Music_Fav` | oui | oui | audio — 1..8, 0 = aucun |

### Sériels

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +10 | `Room_Name` | oui | — | * |

Les offsets +21..+48 (`Rnn_Shade_n_Up/Stop/Down`) sont des impulsions de 250 ms du C# vers le moteur, sans suffixe.

## 4. Pièces de la configuration courante

| Id | Clé | Nom | Bloc EISC | Éclairages | Occultants | CVC | Vidéo | Audio | Serrure |
|---|---|---|---|---|---|---|---|---|---|
| 1 | living | Séjour | 1000 | 3 circuits | 2 | oui | écran 1 | oui | oui |
| 2 | kitchen | Cuisine | 1100 | 2 circuits | 1 | — | — | oui | — |
| 3 | dining | Salle à manger | 1200 | 2 circuits | 1 | oui | — | oui | — |
| 4 | cinema | Home cinéma | 1300 | 2 circuits | 1 | oui | écran 3 | oui | — |
| 5 | terrace | Terrasse | 1400 | 1 circuits | 1 | — | — | oui | — |
| 6 | pool | Piscine | 1500 | 1 circuits | — | — | — | oui | — |
| 7 | master | Chambre parentale | 1600 | 2 circuits | 2 | oui | écran 4 | oui | — |
| 8 | guest | Chambre d'amis | 1700 | 1 circuits | 1 | oui | — | — | — |

## 5. Recette Debugger (à faire sur matériel, jamais réalisée)

1. Sélection Cuisine sur la dalle → `Room_Select#` = 2, `Room_Active_02` haut, les autres bas.
2. Appui « Tout allumer » → `Lights_AllOn` impulsion ; `R02_Light_1_Level_fb#` et `R02_Light_2_Level_fb#` = 65535 ; `R02_Light_1_On_fb` haut.
3. Renvoyer `R02_Light_1_Level_Actual#` = 32768 depuis le Debugger → la dalle affiche 50 % sur le circuit 1.
4. iPad sur le Séjour pendant que la dalle est sur la Cuisine : curseur iPad → `Room_Select#` = 1 puis `Light_1_Level#` ; la dalle ne bouge pas.
5. Scène « Bonne nuit » → `Scene_Night` ; tous les `Rnn_Light_*_fb#` à 0, `Rnn_Shade_*_Position_fb#` à 0, `Rnn_Shade_*_Down` impulsions, `Access_*` verrouillés sur les écrans.
6. Garage : `Access_Garage_Close` → l'écran affiche « Fermeture en cours… » 1,8 s puis fermé ; le slot 2 peut imposer l'état réel par `Access_Garage_Closing_Actual` / `Access_Garage_Open_Actual`.
