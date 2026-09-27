# Restaurant Kyoto Gardens — contrat de joins v1.0 (27.09.2026)

Référence unique : `config/restaurant-kyoto_config.json` → `contrat`. Le C# (`Joins.cs`), le SIMPL (`RestaurantKyoto_Slot2.smw`) et le futur GUI CH5 (showcase `sushi-bar-kyoto`) s'y conforment ; `tools/check-contract.js` vérifie la cohérence.

## Principe

- Tous les joins de pilotage sont globaux : le même numéro dans toutes les zones.
- Le C# (slot 1) connaît la zone affichée par chaque écran (_activeRoomPerDevice ; 0 = « Tout le restaurant ») : il applique l'action à cette zone — ou à toutes les zones quand l'écran affiche « Tout le restaurant » — pose Room_Select# (a10) sur l'EISC, puis recopie l'impulsion sur le même join. Le slot 2 route avec des buffers validés par Room_Active_nn (d101-117, un seul haut = a10) ; Room_Active_00 (d100) est haut quand l'action vise tout le restaurant.
- Feedback des écrans : toujours calculé par le C#. Le slot 2 renvoie les mesures réelles par les entrées _Actual (blocs zone et globaux restaurant) ; elles font foi dès réception.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, Rnn_xxx_fb = état tenu par le C#) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc zone EISC : join = 1000 + (id−1)×100 + offset (16 zones → 1000..2599, socle 2732, 17 zones max). Réservé aux échanges C# ↔ slot 2, jamais émis par un écran.
- **Scènes par zone** : `Scene_x` s'applique à la zone a10 (a10 = 0 → toutes les zones = `applyAllScene` du GUI). Climat, musique, service et couverts sont globaux (non zonés).

Direction : → = écran → C# · ← = C# → écran · ↔ = commande et feedback sur le même join.

## 1. Signaux globaux (écrans ↔ C#, recopiés vers le slot 2)

### Digitaux

| Join | Nom | Sens | Description |
|---|---|---|---|
| 51 | `Scene_Welcome` | ↔ | Scène « Accueil » sur la zone affichée (a10 ; 0 = toutes les zones) ; fb tenu = scène active de la zone affichée |
| 52 | `Scene_Dinner` | ↔ | Scène « Dîner » (extérieur : « Allées ») |
| 53 | `Scene_Rooftop` | ↔ | Scène « Rooftop » (extérieur : « Jardins ») |
| 54 | `Scene_Cleaning` | ↔ | Scène « Nettoyage » (extérieur : « Tout allumé ») |
| 55 | `Scene_Closed` | ↔ | Scène « Fermeture » (extérieur : « Veille ») |
| 100 | `Room_Select_All` | ↔ | Sélection « Tout le restaurant » (Room_Select# = 0) ; fb = cet écran affiche tout le restaurant. Sur l'EISC : Room_Active_00, haut quand l'action vise toutes les zones. |
| 101-117 | `Room_Select_{n}` | ↔ | Sélection directe de la zone n (join = 100+n) ; fb = zone affichée par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. |
| 151 | `Lights_AllOn` | ↔ | Tous les circuits de la zone affichée à 100 % ; fb = tous allumés |
| 152 | `Lights_AllOff` | ↔ | Tous les circuits à 0 ; fb = tous éteints |
| 161-168 | `Light_{n}_Toggle` | ↔ | Bascule 0/100 % du circuit n (1..8) ; fb = circuit allumé (> 0) |
| 181 | `HVAC_Setpoint_Up` | → | Consigne +pas (0,5 °C), bornée 18-25 |
| 182 | `HVAC_Setpoint_Down` | → | Consigne −pas |
| 241 | `Music_PlayPause` | ↔ | Lecture / pause ; fb tenu = en lecture (entrée EISC Music_PlayPause_Actual = lecture réelle) |
| 243-245 | `Music_EQ_{n}` | ↔ | Égaliseur n (1 Lounge, 2 Dining, 3 Live) ; fb tenu (interlock) |
| 250 | `Config_Resync` | → | Demande de (ré)envoi de la configuration JSON |
| 261 | `Service_Fluide` | ↔ | « Tout traité » : service fluide (état 0) ; fb tenu (interlock) |
| 262 | `Service_Sommelier` | ↔ | Appel sommelier (état 1) ; fb tenu |
| 263 | `Service_Accueil` | ↔ | Appel accueil (état 2) ; fb tenu |
| 264 | `Service_Cuisine` | ↔ | Appel cuisine (état 3) ; fb tenu |

### Analogiques

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Zone affichée par cet écran (0 = tout le restaurant, 1..17). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11-18 | `Light_{n}_Level#` | ↔ | Niveau du circuit n (0-65535) ; curseur → C# (scène de la zone → personnalisée) ; fb = niveau |
| 26 | `Scene#` | ← | Scène active de la zone affichée : 0 = personnalisée, 1..5 |
| 30 | `Music_Volume#` | ↔ | Volume musique du restaurant (0-80, borne volumeMax) |
| 41 | `Room_LightsAvg#` | ← | Niveau moyen des circuits actifs de la zone affichée (0-100) |
| 42 | `Room_LightsOn#` | ← | Circuits allumés dans la zone affichée |
| 43 | `Restaurant_LightsOn#` | ← | Nombre de circuits allumés dans tout le restaurant |
| 60 | `HVAC_Setpoint#` | ↔ | Consigne × 10 (215 = 21,5 °C), bornée 180-250, arrondie au pas |
| 61 | `HVAC_Temperature#` | ← | Température mesurée × 10 (entrée EISC HVAC_Temperature_Actual#, défaut 212) |
| 62 | `HVAC_FreshAir#` | ← | Air neuf mesuré en % (entrée EISC HVAC_FreshAir_Actual#, défaut 68) |
| 80 | `Service_State#` | ← | État du service : 0 Fluide, 1 Sommelier, 2 Accueil, 3 Cuisine |
| 81 | `Covers#` | ← | Couverts en salle (entrée EISC Covers_Actual#, défaut 32) |
| 250 | `Config_ChunkAck#` | → | Accusé de réception du chunk N de configuration |

### Sériels (écrans seulement, jamais sur l'EISC)

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Name$` | ← | Nom de la zone affichée (« Tout le restaurant » pour a10 = 0) |
| 11 | `Room_Subtitle$` | ← | « Éteint » / « Éclairage moyen N % » |
| 12 | `Scene_Name$` | ← | Nom de la scène active de la zone affichée (libellé extérieur pour la zone Extérieur) / « Personnalisée » |
| 13 | `Restaurant_Summary$` | ← | « Restaurant gastronomique · 15 pavillons » |
| 20 | `Music_Title$` | ← | Titre en cours (« Kyoto After Dark ») |
| 21 | `Music_Sub$` | ← | Sous-titre (« Jazz contemporain ») |
| 30 | `Service_Text$` | ← | « Service fluide » / « Service sommelier » / … |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |
| 105 | `Config_Json$` | ← | Transport de la configuration (VCFG|i|n|payload) |
| 106 | `Config_Hash$` | ← | Empreinte de la configuration |

Niveaux 0-65535 sur les joins, 0-100 % en interne ; consigne × 10 ; volume 0-80 direct ; air neuf et couverts directs.

## 2. Ce que voit le slot 2 sur le symbole EISC (IP-ID F0, 127.0.0.2)

- **Sorties du symbole = ce que le slot 2 reçoit.** Chaque action arrive sous son nom nu (`Scene_Dinner`, `Light_2_Toggle`, `HVAC_Setpoint_Up`, `Music_EQ_2`, `Service_Sommelier`, `Music_Volume#`…) en impulsion, **précédée** de `Room_Select#` (a10) et de `Room_Active_nn` (d100-116, un seul haut). Un appui sur « Dîner » dans le Bar minéral fait donc monter `Room_Active_04` puis `Scene_Dinner` ; le même appui depuis « Tout le restaurant » fait monter `Room_Active_00` puis `Scene_Dinner`, et le C# pousse les `Rnn_Scene_fb#` / `Rnn_Light_n_*_fb` des 16 zones.
- **Globaux restaurant :** `HVAC_Setpoint#` (a60, × 10) et `Music_Volume#` (a30) sont tenus par le C# sur l'EISC : après un `HVAC_Setpoint_Up/Down` ou un curseur, le slot 2 lit toujours la valeur bornée. `Music_PlayPause`, `Music_EQ_n`, `Service_x` arrivent en impulsion (interlock côté C#). Les globaux ne dépendent pas de a10 (aucune bufferisation par zone).
- **Entrées du symbole = ce que le slot 2 renvoie.** États réels restaurant `xxx_Actual` sur les mêmes joins que l'action (`Music_PlayPause_Actual` d241 = lecture réelle, `Music_EQ_n_Actual` d243-245 et `Service_x_Actual` d261-264 sur front montant, `Music_Volume_Actual#` a30, `HVAC_Setpoint_Actual#` a60, `HVAC_Temperature_Actual#` a61, `HVAC_FreshAir_Actual#` a62, `Service_State_Actual#` a80, `Covers_Actual#` a81) et mesures par zone `Rnn_xxx_Actual` dans les blocs zone.
- Les sériels ne sont pas câblés en entrée. Les analogiques « ← » (mesures pour les écrans) ne sont pas en sortie de l'EISC.
- Bufferisation : un sous-système « Espace nn - Nom » par zone contient un **Analog Buffer** validé par `Room_Active_nn` qui recopie `Light_1..4_Level#` vers `Rnn_Light_n_Level_Buf#`. Pour les digitaux (scènes, Toggle), poser de la même façon un symbole **Buffer** (enable = `Room_Active_nn`) dans SIMPL Windows. Pour suivre aussi les actions globales (a10 = 0), combiner `Room_Active_00` en OR avec chaque `Room_Active_nn`, ou se fier aux `Rnn_xxx_fb` que le C# pousse pour chaque zone.

## 3. Blocs zone (C# ↔ slot 2) — join = 1000 + (id−1)×100 + offset

Échanges C# ↔ slot 2 par zone 'intersystem'. _fb = tenu par le C# (sortie EISC, reçu par le slot 2) ; _Actual = mesure renvoyée par le slot 2 (entrée EISC). Seuls les circuits actifs de la zone sont câblés (4 partout).

### Digitaux

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_On` | oui | oui | eclairages |
| +11 | `Room_Displayed` | oui | — | * — La zone est affichée sur au moins un écran (ou tout le restaurant) |

### Analogiques

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_Level` | oui | oui | eclairages |
| +20 | `Scene` | oui | oui | eclairages — 0 = personnalisée, 1..5 ; un `_Actual` change le marqueur de scène, pas les niveaux |

### Sériels

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +10 | `Room_Name` | oui | — | * |

## 4. Zones de la configuration courante (ordre du GUI, id 1 = Extérieur)

| Id | Clé GUI | Nom | Bloc EISC | Circuits (clés tables / bar / pergola / plants) | Scènes |
|---|---|---|---|---|---|
| 1 | exterior | Extérieur | 1000 | Appliques des clôtures · Lampadaires et lanternes · Spots de sol · Chemins et jardins | Accueil · Allées · Jardins · Tout allumé · Veille |
| 2 | accueil | Accueil | 1100 | Suspensions et lustres · Appliques et corniches · Spots plafond · Balises et éclairage décoratif | Accueil · Dîner · Rooftop · Nettoyage · Fermeture |
| 3 | dining | Salle vitrée | 1200 | idem intérieur | idem |
| 4 | bar | Bar minéral | 1300 | idem intérieur | idem |
| 5 | kitchen | Cuisine ouverte | 1400 | idem intérieur | idem |
| 6 | cellar | Cave à vins | 1500 | idem intérieur | idem |
| 7 | private | Salon privé | 1600 | idem intérieur | idem |
| 8 | signature | Salle signature | 1700 | idem intérieur | idem |
| 9 | teppanyaki | Teppanyaki | 1800 | idem intérieur | idem |
| 10 | lounge | Lounge | 1900 | idem intérieur | idem |
| 11 | gallery | Galerie | 2000 | idem intérieur | idem |
| 12 | belvedere | Belvédère | 2100 | idem intérieur | idem |
| 13 | terrace | Terrasse | 2200 | idem intérieur | idem |
| 14 | rooftop | Rooftop | 2300 | idem intérieur | idem |
| 15 | pergola | Pergola | 2400 | idem intérieur | idem |
| 16 | garden | Jardin suspendu | 2500 | idem intérieur | idem |

Niveaux de scène (tables / bar / pergola / plants, identiques intérieur et extérieur) : Accueil 72/76/45/55 · Dîner 48/62/35/40 · Rooftop 60/52/88/82 · Nettoyage 100/100/100/65 · Fermeture 0/8/0/18. État initial : toutes les zones en « Fermeture ».

Globaux : consigne 21,5 °C (18-25, pas 0,5), mesure 21,2 °C, air neuf 68 % ; musique en lecture, volume 38/80, égaliseur Lounge ; service Fluide, 32 couverts.

## 5. Recette Debugger (à faire sur matériel, jamais réalisée)

1. Sélection « Bar minéral » sur la dalle → `Room_Select#` = 4, `Room_Active_04` haut, les autres bas (`Room_Active_00` bas).
2. Appui « Dîner » → `Scene_Dinner` impulsion ; `R04_Light_1_Level_fb#` = 31457 (48 %), `R04_Light_2_Level_fb#` = 40632 (62 %), `R04_Scene_fb#` = 2 ; `Scene_Dinner` tenu haut sur la dalle, `Scene#` = 2, `Scene_Name$` = « Dîner ». La zone Extérieur n'a pas bougé.
3. Renvoyer `R04_Light_1_Level_Actual#` = 32768 depuis le Debugger → la dalle affiche 50 % sur « Suspensions et lustres », `Scene_Name$` inchangé (marqueur non touché par une mesure).
4. Curseur `Light_3_Level#` sur la dalle → `Room_Active_04` puis `Light_3_Level#` ; `R04_Scene_fb#` = 0, `Scene_Name$` = « Personnalisée » ; les autres zones inchangées.
5. iPad sur « Tout le restaurant » : appui « Fermeture » → `Room_Select#` = 0, `Room_Active_00` haut, puis `Scene_Closed` ; les 16 `Rnn_Scene_fb#` = 5 et `Rnn_Light_2_Level_fb#` = 5243 (8 %) ; la dalle (Bar minéral) suit ; `Scene_Name$` de l'iPad = « Fermeture ».
6. Dalle sur « Extérieur » : `Scene_Name$` = « Veille » (libellé extérieur de la scène 5) ; appui `Scene_Cleaning` → `Scene_Name$` = « Tout allumé », `R01_Light_1..4_Level_fb#` = 65535/65535/65535/42598.
7. Climat : `HVAC_Setpoint_Up` × 2 → `HVAC_Setpoint#` = 225 sur l'EISC et sur les écrans ; 7 appuis de plus → bloqué à 250. Renvoyer `HVAC_Temperature_Actual#` = 198 → les écrans affichent 19,8° ; `HVAC_FreshAir_Actual#` = 55 → 55 %.
8. Musique : `Music_Volume#` = 100 depuis un écran → recopié à 80 (volumeMax) ; `Music_EQ_3` → `Music_EQ_3` seul tenu haut sur les écrans ; renvoyer `Music_PlayPause_Actual` bas → bouton lecture relâché sur tous les écrans.
9. Service : `Service_Sommelier` → `Service_State#` = 1, `Service_Text$` = « Service sommelier », `Service_Sommelier` tenu ; `Service_Fluide` (« Tout traité ») → état 0. Renvoyer `Covers_Actual#` = 48 → `Covers#` = 48 partout.
