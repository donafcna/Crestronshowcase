# Yacht Asteria — contrat de joins v1.0 (27.09.2026)

Référence unique : `config/yacht-asteria_config.json` → `contrat`. Le C# (`Joins.cs`), le SIMPL (`YachtAsteria_Slot2.smw`) et le futur GUI CH5 (showcase `yacht-monaco`) s'y conforment ; `tools/check-contract.js` vérifie la cohérence.

## Principe

- Tous les joins de pilotage sont globaux : le même numéro dans tous les espaces.
- Le C# (slot 1) connaît l'espace affiché par chaque écran (_activeRoomPerDevice ; 0 = « Tout le yacht ») : il applique l'action à cet espace — ou à tous les espaces quand l'écran affiche « Tout le yacht » — pose Room_Select# (a10) sur l'EISC, puis recopie l'impulsion sur le même join. Le slot 2 route avec des buffers validés par Room_Active_nn (d101-140, un seul haut = a10) ; Room_Active_00 (d100) est haut quand l'action vise tout le yacht.
- Feedback des écrans : toujours calculé par le C#. Le slot 2 renvoie les mesures réelles par les entrées _Actual des blocs espace ; elles font foi dès réception.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, Rnn_xxx_fb = état tenu par le C#) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc espace EISC : join = 500 + (id−1)×50 + offset (37 espaces → 500..2349, socle 2732). Réservé aux échanges C# ↔ slot 2, jamais émis par un écran.
- Scènes, couleur des bandeaux, effets, vitesse et cycle jour/nuit sont globaux (tout le yacht). Éclairages et audio sont par espace.

Direction : → = écran → C# · ← = C# → écran · ↔ = commande et feedback sur le même join.

## 1. Signaux globaux (écrans ↔ C#, recopiés vers le slot 2)

### Digitaux

| Join | Nom | Sens | Description |
|---|---|---|---|
| 51 | `Scene_Cruise` | ↔ | Scène « Croisière » sur tout le yacht ; fb tenu = scène active |
| 52 | `Scene_Sunset` | ↔ | Scène « Sunset » |
| 53 | `Scene_Dinner` | ↔ | Scène « Dîner à bord » |
| 54 | `Scene_Night` | ↔ | Scène « Nuit » |
| 100 | `Room_Select_All` | ↔ | Sélection « Tout le yacht » (Room_Select# = 0) ; fb = cet écran affiche tout le yacht. Sur l'EISC : Room_Active_00, haut quand l'action vise tous les espaces. |
| 101-140 | `Room_Select_{n}` | ↔ | Sélection directe de l'espace n (join = 100+n) ; fb = espace affiché par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. |
| 151 | `Lights_AllOn` | ↔ | Tous les circuits de l'espace affiché à 100 % ; fb = tous allumés |
| 152 | `Lights_AllOff` | ↔ | Tous les circuits à 0 ; fb = tous éteints |
| 161-168 | `Light_{n}_Toggle` | ↔ | Bascule 0/100 % du circuit n (1..8) ; fb = circuit allumé (> 0) |
| 201-208 | `Color_Preset_{n}` | ↔ | Couleur préréglée n des bandeaux (1 Champagne, 2 Lagon, 3 Azur, 4 Améthyste) ; fb = couleur courante égale au preset |
| 211 | `Effect_Off` | ↔ | Lumière fixe (couleur choisie) ; fb tenu (interlock) |
| 212 | `Effect_BlueWave` | ↔ | Effet « Vague bleue » ; fb tenu |
| 213 | `Effect_Rainbow` | ↔ | Effet « Couleurs douces » ; fb tenu |
| 214 | `Effect_Champagne` | ↔ | Effet « Reflets champagne » ; fb tenu |
| 221 | `Daylight_Day` | ← | Jour (horloge astronomique du slot 2, entrée Daylight_Day_Actual) ; cycle auto → scène « Croisière » sur le front montant |
| 222 | `Daylight_Night` | ← | Nuit (Daylight_Night_Actual) ; cycle auto → scène « Dîner à bord » sur le front montant |
| 231-238 | `Music_Source_{n}` | ↔ | Source audio n (1..4) dans l'espace affiché (démarre la lecture) ; fb = source active |
| 241 | `Music_PlayPause` | ↔ | Lecture / pause ; fb tenu = en lecture |
| 242 | `Music_Mute` | ↔ | Coupe le son ; fb tenu = muet |
| 250 | `Config_Resync` | → | Demande de (ré)envoi de la configuration JSON |

### Analogiques

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Espace affiché par cet écran (0 = tout le yacht, 1..40). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11-18 | `Light_{n}_Level#` | ↔ | Niveau du circuit n (0-65535) ; curseur → C# ; fb = niveau |
| 21 | `Color_R#` | ↔ | Composante rouge des bandeaux (0-255) ; en effet actif, poussée par le cycle C# |
| 22 | `Color_G#` | ↔ | Composante verte (0-255) |
| 23 | `Color_B#` | ↔ | Composante bleue (0-255) |
| 24 | `Speed#` | ↔ | Vitesse de transition des effets (0-100) |
| 25 | `Effect#` | ← | 0 = fixe, 1 = Vague bleue, 2 = Couleurs douces, 3 = Reflets champagne |
| 26 | `Scene#` | ← | 0 = ambiance personnalisée, 1..4 = scène active |
| 30 | `Music_Volume#` | ↔ | Volume musique de l'espace (0-100) |
| 41 | `Room_LightsAvg#` | ← | Niveau moyen des circuits actifs de l'espace affiché (0-100, tuile « Éclairage moyen N % ») |
| 42 | `Room_LightsOn#` | ← | Circuits allumés dans l'espace affiché |
| 43 | `Yacht_LightsOn#` | ← | Nombre de circuits allumés sur tout le yacht |
| 250 | `Config_ChunkAck#` | → | Accusé de réception du chunk N de configuration |

### Sériels (écrans seulement, jamais sur l'EISC)

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Name$` | ← | Nom de l'espace affiché (« Tout le yacht » pour a10 = 0) |
| 11 | `Room_Subtitle$` | ← | « Éteint » / « Éclairage moyen N % » |
| 12 | `Scene_Name$` | ← | Nom de la scène active / « Ambiance personnalisée » |
| 13 | `Yacht_Summary$` | ← | « 5 ponts · 37 espaces » |
| 20 | `Music_Source_Name$` | ← | Nom de la source audio de l'espace affiché |
| 22 | `Color_Hex$` | ← | Couleur courante des bandeaux (#rrggbb) |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |
| 105 | `Config_Json$` | ← | Transport de la configuration (VCFG|i|n|payload) |
| 106 | `Config_Hash$` | ← | Empreinte de la configuration |


Niveaux 0-65535 sur les joins, 0-100 % en interne ; composantes couleur 0-255 ; volumes et vitesse 0-100 direct.

## 2. Ce que voit le slot 2 sur le symbole EISC (IP-ID F0, 127.0.0.2)

- **Sorties du symbole = ce que le slot 2 reçoit.** Chaque action arrive sous son nom nu (`Scene_Dinner`, `Light_2_Toggle`, `Color_Preset_3`, `Effect_BlueWave`, `Music_Volume#`, `Color_R#`…) en impulsion, **précédée** de `Room_Select#` (a10) et de `Room_Active_nn` (d100-137, un seul haut). Un appui sur « Spots » dans le Grand salon fait donc monter `Room_Active_12` puis `Light_2_Toggle` ; le même appui depuis « Tout le yacht » fait monter `Room_Active_00` puis `Light_2_Toggle`, et le C# pousse les `Rnn_Light_2_*_fb` des 37 espaces.
- **Couleur et effets :** `Color_R#/G#/B#` (a21-23) et `Speed#` (a24) sont tenus par le C# sur l'EISC. Quand un effet tourne, le cycle de couleurs (CTimer 350 ms) pousse en continu les trois composantes : le slot 2 n'a qu'à les recopier vers les drivers LED. `Effect_Off/BlueWave/Rainbow/Champagne` arrivent en impulsion (interlock côté C#).
- **Entrées du symbole = ce que le slot 2 renvoie.** États réels yacht `xxx_Actual` sur les mêmes joins que l'action (`Color_R_Actual#` a21, `Speed_Actual#` a24, `Effect_Actual#` a25) et mesures par espace `Rnn_xxx_Actual` dans les blocs espace. `Daylight_Day_Actual` (d221) et `Daylight_Night_Actual` (d222) viennent de l'horloge astronomique du slot 2 : sur front montant, si `cycleAutomatique` est vrai, le C# applique « Croisière » (jour) ou « Dîner à bord » (nuit).
- Les sériels ne sont pas câblés en entrée. Les analogiques « ← » (mesures pour les écrans) ne sont pas en sortie de l'EISC.
- Bufferisation : un sous-système « Espace nn - Nom » par espace contient un **Analog Buffer** validé par `Room_Active_nn` qui recopie `Light_n_Level#` (circuits actifs) et `Music_Volume#` vers `Rnn_xxx_Buf#`. Pour les digitaux, poser de la même façon un symbole **Buffer** (enable = `Room_Active_nn`) dans SIMPL Windows. Pour suivre aussi les actions globales, combiner `Room_Active_00` en OR avec chaque `Room_Active_nn` (ou se fier aux `Rnn_xxx_fb`, que le C# pousse pour chaque espace).

## 3. Blocs espace (C# ↔ slot 2) — join = 500 + (id−1)×50 + offset

Échanges C# ↔ slot 2 par espace 'intersystem'. _fb = tenu par le C# (sortie EISC, reçu par le slot 2) ; _Actual = mesure renvoyée par le slot 2 (entrée EISC). Seuls les circuits actifs de l'espace sont câblés : le canal 5 « Piscines » n'existe que dans les 4 espaces avec bassin (index conservé partout, joins globaux stables).

### Digitaux

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_On` | oui | oui | eclairages |
| +11 | `Room_Displayed` | oui | — | * — L'espace est affiché sur au moins un écran (ou tout le yacht) |
| +21 | `Music_Playing` | oui | oui | audio |
| +22 | `Music_Muted` | oui | oui | audio |

### Analogiques

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_Level` | oui | oui | eclairages |
| +21 | `Music_Volume` | oui | oui | audio |
| +22 | `Music_Source` | oui | oui | audio — 1..8 |

### Sériels

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +10 | `Room_Name` | oui | — | * |

## 4. Espaces de la configuration courante (id = clé GUI + 1)

| Id | Clé GUI | Nom | Pont | Bloc EISC | Circuits actifs | Audio |
|---|---|---|---|---|---|---|
| 1 | 0 | Beach club | Pont inférieur | 500 | cove, spot, accent, night, pool | oui |
| 2 | 1 | Spa & massage | Pont inférieur | 550 | cove, spot, accent, night | oui |
| 3 | 2 | Fitness | Pont inférieur | 600 | cove, spot, accent, night | oui |
| 4 | 3 | Cinéma | Pont inférieur | 650 | cove, spot, accent, night | oui |
| 5 | 4 | Machines | Pont inférieur | 700 | cove, spot, accent, night | oui |
| 6 | 5 | Mess équipage | Pont inférieur | 750 | cove, spot, accent, night | oui |
| 7 | 6 | Buanderie | Pont inférieur | 800 | cove, spot, accent, night | oui |
| 8 | 7 | Cabines équipage | Pont inférieur | 850 | cove, spot, accent, night | oui |
| 9 | 8 | Réserve & racks AV | Pont inférieur | 900 | cove, spot, accent, night | oui |
| 10 | 9 | Équipage avant | Pont inférieur | 950 | cove, spot, accent, night | oui |
| 11 | 10 | Terrasse arrière & bassin | Pont principal | 1000 | cove, spot, accent, night, pool | oui |
| 12 | 11 | Grand salon | Pont principal | 1050 | cove, spot, accent, night | oui |
| 13 | 12 | Salle à manger | Pont principal | 1100 | cove, spot, accent, night | oui |
| 14 | 13 | Atrium & escalier | Pont principal | 1150 | cove, spot, accent, night | oui |
| 15 | 14 | Cuisine principale | Pont principal | 1200 | cove, spot, accent, night | oui |
| 16 | 15 | Suite VIP | Pont principal | 1250 | cove, spot, accent, night | oui |
| 17 | 16 | Suite invités bâbord | Pont principal | 1300 | cove, spot, accent, night | oui |
| 18 | 17 | Suite invités tribord | Pont principal | 1350 | cove, spot, accent, night | oui |
| 19 | 18 | Salon avant | Pont principal | 1400 | cove, spot, accent, night | oui |
| 20 | 19 | Dîner extérieur | Pont propriétaire | 1450 | cove, spot, accent, night | oui |
| 21 | 20 | Sky lounge | Pont propriétaire | 1500 | cove, spot, accent, night | oui |
| 22 | 21 | Galerie centrale | Pont propriétaire | 1550 | cove, spot, accent, night | oui |
| 23 | 22 | Suite propriétaire | Pont propriétaire | 1600 | cove, spot, accent, night | oui |
| 24 | 23 | Salle de bain propriétaire | Pont propriétaire | 1650 | cove, spot, accent, night | oui |
| 25 | 24 | Dressing propriétaire | Pont propriétaire | 1700 | cove, spot, accent, night | oui |
| 26 | 25 | Suite familiale | Pont propriétaire | 1750 | cove, spot, accent, night | oui |
| 27 | 26 | Terrasse privée & jacuzzi | Pont propriétaire | 1800 | cove, spot, accent, night, pool | oui |
| 28 | 27 | Terrasse panoramique | Pont passerelle | 1850 | cove, spot, accent, night | oui |
| 29 | 28 | Salon observation | Pont passerelle | 1900 | cove, spot, accent, night | oui |
| 30 | 29 | Lobby supérieur | Pont passerelle | 1950 | cove, spot, accent, night | oui |
| 31 | 30 | Cabine capitaine | Pont passerelle | 2000 | cove, spot, accent, night | oui |
| 32 | 31 | Bureau navigation | Pont passerelle | 2050 | cove, spot, accent, night | oui |
| 33 | 32 | Passerelle | Pont passerelle | 2100 | cove, spot, accent, night | oui |
| 34 | 33 | Solarium | Sun deck | 2150 | cove, spot, accent, night | oui |
| 35 | 34 | Bar & cuisine extérieure | Sun deck | 2200 | cove, spot, accent, night | oui |
| 36 | 35 | Lounge couvert | Sun deck | 2250 | cove, spot, accent, night | oui |
| 37 | 36 | Piscine du sun deck | Sun deck | 2300 | cove, spot, accent, night, pool | oui |

## 5. Recette Debugger (à faire sur matériel, jamais réalisée)

1. Sélection « Grand salon » sur la dalle → `Room_Select#` = 12, `Room_Active_12` haut, les autres bas (`Room_Active_00` bas).
2. Appui « Tout allumer » → `Lights_AllOn` impulsion ; `R12_Light_1_Level_fb#`..`R12_Light_4_Level_fb#` = 65535 ; `R12_Light_1_On_fb` haut ; pas de `R12_Light_5_*` (pas de bassin).
3. Renvoyer `R12_Light_1_Level_Actual#` = 32768 depuis le Debugger → la dalle affiche 50 % sur « Corniches & bandeaux », `Scene_Name$` inchangé.
4. iPad sur « Tout le yacht » pendant que la dalle est sur le Grand salon : curseur iPad `Light_2_Level#` → `Room_Select#` = 0, `Room_Active_00` haut, puis `Light_2_Level#` ; les 37 `Rnn_Light_2_Level_fb#` suivent, la dalle (Grand salon) suit aussi, `Scene_Name$` = « Ambiance personnalisée ».
5. Scène « Dîner à bord » → `Scene_Dinner` impulsion ; `Rnn_Light_1_Level_fb#` = 65535 (cove 100 %) et `Rnn_Light_5_Level_fb#` = 65535 dans les 4 espaces à bassin ; `Scene_Dinner` tenu haut sur les écrans, `Scene#` = 3.
6. `Color_Preset_2` (Lagon) → `Color_R#` = 125, `Color_G#` = 224, `Color_B#` = 216 tenus sur l'EISC, `Color_Hex$` = #7de0d8. Puis `Effect_BlueWave` → les trois composantes cyclent toutes 350 ms (#61c3df → #81d7d0 → #72a3df), plus vite avec `Speed#` = 100 ; `Effect_Off` → retour à #7de0d8.
7. Cycle : forcer `Daylight_Night_Actual` haut dans le Debugger → scène « Dîner à bord » appliquée ; `Daylight_Day_Actual` haut → « Croisière ». Répéter sans front (déjà haut) → aucun effet.
8. Audio depuis « Tout le yacht » : `Music_Source_3` → `Room_Active_00` puis `Music_Source_3` ; `Rnn_Music_Source_fb#` = 3 et `Rnn_Music_Playing_fb` haut dans les 37 espaces. Renvoyer `R05_Music_Muted_Actual` haut → « Machines » affiche muet, les autres non.
