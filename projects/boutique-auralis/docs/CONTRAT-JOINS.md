# Boutique Auralis — contrat de joins v1.0 (27.09.2026)

Référence unique : `config/boutique-auralis_config.json` → `contrat`. Le C# (`Joins.cs`), le SIMPL (`BoutiqueAuralis_Slot2.smw`) et le futur GUI CH5 (showcase `boutique-hermes`) s'y conforment ; `tools/check-contract.js` vérifie la cohérence.

## Principe

- Tous les joins de pilotage sont globaux : le même numéro dans tous les espaces.
- Le C# (slot 1) connaît l'espace affiché par chaque écran (_activeRoomPerDevice ; 0 = « Toute la boutique ») : il applique l'action à cet espace — ou à tous les espaces quand l'écran affiche « Toute la boutique » — pose Room_Select# (a10) sur l'EISC, puis recopie l'impulsion sur le même join. Le slot 2 route avec des buffers validés par Room_Active_nn (d101-117, un seul haut = a10) ; Room_Active_00 (d100) est haut quand l'action vise toute la boutique.
- Les scènes suivent a10 (comportement du simulateur) : `Scene_Gala` depuis un écran sur « Salon des pierres » ne touche que cet espace ; depuis « Toute la boutique », les 15 espaces. Chaque espace garde sa scène active (`Scene#`, `Scene_Name$`, `Rnn_Scene_fb#`) ; tout réglage manuel (curseur, Toggle, éclairage général) la ramène à « Ambiance personnalisée ».
- Les fonctions boutique (stores, éclairage général, blanc, parfum, horaires) sont globales par nature : un seul état pour toute la boutique, a10 est posé mais n'a pas d'effet sur elles.
- Feedback des écrans : toujours calculé par le C#. Le slot 2 renvoie les mesures réelles par les entrées _Actual (blocs espace et bloc maison) ; elles font foi dès réception.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, Rnn_xxx_fb = état tenu par le C#, analogiques boutique tenus) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc espace EISC : join = 1000 + (id−1)×100 + offset (15 espaces → 1000..2499, socle 2732, piecesMax 17 → 2699). Réservé aux échanges C# ↔ slot 2, jamais émis par un écran.

Direction : → = écran → C# · ← = C# → écran · ↔ = commande et feedback sur le même join.

## 1. Signaux globaux (écrans ↔ C#, recopiés vers le slot 2)

### Digitaux

| Join | Nom | Sens | Description |
|---|---|---|---|
| 51 | `Scene_Opening` | ↔ | Scène « Ouverture » sur l'espace affiché (tous si a10 = 0) ; fb tenu = scène active de l'espace affiché |
| 52 | `Scene_Gala` | ↔ | Scène « Réception » |
| 53 | `Scene_Private` | ↔ | Scène « Rendez-vous privé » |
| 54 | `Scene_Closed` | ↔ | Scène « Fermeture » |
| 100 | `Room_Select_All` | ↔ | Sélection « Toute la boutique » (Room_Select# = 0) ; fb = cet écran affiche toute la boutique. Sur l'EISC : Room_Active_00, haut quand l'action vise tous les espaces. |
| 101-117 | `Room_Select_{n}` | ↔ | Sélection directe de l'espace n (join = 100+n) ; fb = espace affiché par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. |
| 151 | `Lights_AllOn` | ↔ | Éclairage général : tous les circuits actifs de tous les espaces à 100 % ; fb = tout allumé |
| 152 | `Lights_AllOff` | ↔ | Éclairage général : tous les circuits à 0 ; fb = tout éteint |
| 161-168 | `Light_{n}_Toggle` | ↔ | Bascule 0/100 % du circuit n (1..8) de l'espace affiché (tous si a10 = 0) ; fb = circuit allumé (> 0) |
| 171-174 | `Blinds_{n}_Open` | ↔ | Ouvrir les stores de la façade n (1 nord, 2 sud, 3 est, 4 ouest) → 100 % + impulsion Blinds_n_Up ; fb = façade ouverte |
| 175 | `Blinds_All_Open` | ↔ | Ouvrir toutes les façades ; fb = les 4 façades ouvertes |
| 181-184 | `Blinds_{n}_Half` | ↔ | Mi-hauteur façade n → 50 % + impulsion Blinds_n_Stop ; fb = 50 % |
| 185 | `Blinds_All_Half` | ↔ | Mi-hauteur toutes façades ; fb = les 4 façades à 50 % |
| 191-194 | `Blinds_{n}_Close` | ↔ | Fermer façade n → 0 % + impulsion Blinds_n_Down ; fb = façade fermée |
| 195 | `Blinds_All_Close` | ↔ | Fermer toutes façades ; fb = les 4 façades fermées |
| 201 | `White_Auto` | ↔ | Bascule du cycle horaire du blanc ; fb tenu = automatisme actif (entrée EISC White_Auto_Actual) |
| 211 | `Scent_On` | ↔ | Diffusion du parfum activée ; fb tenu (interlock avec Scent_Off, entrée EISC Scent_On_Actual) |
| 212 | `Scent_Off` | ↔ | Diffusion arrêtée ; fb tenu |
| 221-228 | `Scent_Fragrance_{n}` | ↔ | Fragrance n (1 Bois d’ambre, 2 Agrumes, 3 Thé blanc) ; fb tenu = fragrance choisie (interlock, entrée EISC Scent_Fragrance_n_Actual) |
| 231 | `Schedule_On` | ↔ | Cycle horaire ouverture / fermeture activé ; fb tenu (interlock) |
| 232 | `Schedule_Off` | ↔ | Cycle horaire désactivé ; fb tenu |
| 233 | `Schedule_Opening_Up` | → | Heure d'ouverture + pasMinutes (15 min, bouclage 24 h) |
| 234 | `Schedule_Opening_Down` | → | Heure d'ouverture − pasMinutes |
| 235 | `Schedule_Closing_Up` | → | Heure de fermeture + pasMinutes |
| 236 | `Schedule_Closing_Down` | → | Heure de fermeture − pasMinutes |
| 241-248 | `Music_Source_{n}` | ↔ | Source audio n (1..3) dans l'espace affiché (tous si a10 = 0, démarre la lecture) ; fb = source active |
| 250 | `Config_Resync` | → | Demande de (ré)envoi de la configuration JSON |
| 261 | `Music_PlayPause` | ↔ | Lecture / pause ; fb tenu = en lecture |
| 262 | `Music_Mute` | ↔ | Coupe le son (volume conservé) ; fb tenu = muet |

### Analogiques

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Espace affiché par cet écran (0 = toute la boutique, 1..17). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11-18 | `Light_{n}_Level#` | ↔ | Niveau du circuit n (0-65535) ; curseur → C# ; fb = niveau |
| 21 | `White_Temperature#` | ↔ | Température de couleur du blanc en kelvins directs (2700-6500, pas 100) ; un réglage manuel coupe White_Auto ; tenu sur l'EISC, entrée White_Temperature_Actual# |
| 22 | `Scent_Diffusion#` | ↔ | Intensité de diffusion du parfum (0-100) ; tenu sur l'EISC, entrée Scent_Diffusion_Actual# |
| 23 | `Schedule_Opening#` | ↔ | Heure d'ouverture en minutes depuis minuit (0-1439) ; tenu sur l'EISC |
| 24 | `Schedule_Closing#` | ↔ | Heure de fermeture en minutes depuis minuit (0-1439) ; tenu sur l'EISC |
| 26 | `Scene#` | ← | 0 = ambiance personnalisée, 1..4 = scène active de l'espace affiché (toute la boutique : scène commune aux 15 espaces, sinon 0) |
| 30 | `Music_Volume#` | ↔ | Volume musique de l'espace (0-100) |
| 31-34 | `Blinds_{n}_Position#` | ↔ | Position des stores de la façade n (0-65535, 65535 = ouvert) ; curseur → ramené à Open / Half / Close ; fb = position tenue ; tenu sur l'EISC, entrée Blinds_n_Position_Actual# |
| 41 | `Room_LightsAvg#` | ← | Niveau moyen des circuits actifs de l'espace affiché (0-100, tuile « Éclairage moyen N % ») |
| 42 | `Room_LightsOn#` | ← | Circuits allumés dans l'espace affiché |
| 43 | `Boutique_LightsOn#` | ← | Nombre de circuits allumés dans toute la boutique |
| 250 | `Config_ChunkAck#` | → | Accusé de réception du chunk N de configuration |

### Sériels (écrans seulement, jamais sur l'EISC)

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Name$` | ← | Nom de l'espace affiché (« Toute la boutique » pour a10 = 0) |
| 11 | `Room_Subtitle$` | ← | « Éteint » / « Éclairage moyen N % » |
| 12 | `Scene_Name$` | ← | Nom de la scène active de l'espace affiché / « Ambiance personnalisée » |
| 13 | `Boutique_Summary$` | ← | « 2 niveaux · 15 espaces » |
| 14 | `Schedule_Opening$` | ← | Heure d'ouverture « HH:MM » |
| 15 | `Schedule_Closing$` | ← | Heure de fermeture « HH:MM » |
| 16 | `Scent_Fragrance_Name$` | ← | Nom de la fragrance choisie |
| 20 | `Music_Source_Name$` | ← | Nom de la source audio de l'espace affiché |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |
| 105 | `Config_Json$` | ← | Transport de la configuration (VCFG|i|n|payload) |
| 106 | `Config_Hash$` | ← | Empreinte de la configuration |

Niveaux et positions 0-65535 sur les joins, 0-100 % en interne ; blanc en kelvins directs (2700-6500) ; horaires en minutes depuis minuit (0-1439) ; volumes et diffusion 0-100 direct.

## 2. Ce que voit le slot 2 sur le symbole EISC (IP-ID F0, 127.0.0.2)

- **Sorties du symbole = ce que le slot 2 reçoit.** Chaque action arrive sous son nom nu (`Scene_Gala`, `Light_2_Toggle`, `Blinds_3_Close`, `Scent_Fragrance_2`, `White_Temperature#`, `Music_Volume#`…) en impulsion, **précédée** de `Room_Select#` (a10) et de `Room_Active_nn` (d100-115, un seul haut). Un appui sur « Spots » dans le Salon des pierres fait donc monter `Room_Active_07` puis `Light_3_Toggle` ; le même appui depuis « Toute la boutique » fait monter `Room_Active_00` puis `Light_3_Toggle`, et le C# pousse les `Rnn_Light_3_*_fb` des 15 espaces.
- **Bloc maison (fonctions boutique) :** les analogiques `White_Temperature#` (a21), `Scent_Diffusion#` (a22), `Schedule_Opening#` / `Schedule_Closing#` (a23-24) et `Blinds_n_Position#` (a31-34) sont **tenus** par le C# sur l'EISC (valeur courante, loi horaire du blanc comprise) : le slot 2 n'a qu'à les recopier vers les drivers. Les digitaux boutique arrivent en impulsion (`White_Auto` = bascule, `Scent_On/Off`, `Scent_Fragrance_n`, `Schedule_On/Off` = interlocks côté C#). Chaque commande de store produit en plus une impulsion moteur `Blinds_n_Up` / `Blinds_n_Stop` / `Blinds_n_Down` (d301-324, 250 ms) par façade concernée.
- **Entrées du symbole = ce que le slot 2 renvoie.** États réels boutique `xxx_Actual` sur les mêmes joins que l'action (`White_Auto_Actual` d201, `Scent_On_Actual` d211, `Scent_Fragrance_n_Actual` d221-223, `White_Temperature_Actual#` a21, `Scent_Diffusion_Actual#` a22, `Blinds_n_Position_Actual#` a31-34) et mesures par espace `Rnn_xxx_Actual` dans les blocs espace. Les horaires n'ont pas d'entrée _Actual (état C# seul). Quand le cycle horaire déclenche une scène, le C# la recopie sur l'EISC comme un appui depuis « Toute la boutique » (`Room_Select#` = 0, `Room_Active_00` haut, impulsion `Scene_Opening` / `Scene_Closed`).
- Les sériels ne sont pas câblés en entrée. Les analogiques « ← » (mesures pour les écrans) ne sont pas en sortie de l'EISC.
- Bufferisation : un sous-système « Espace nn - Nom » par espace contient un **Analog Buffer** validé par `Room_Active_nn` qui recopie `Light_n_Level#` (circuits actifs) et `Music_Volume#` vers `Rnn_xxx_Buf#`. Pour les digitaux, poser de la même façon un symbole **Buffer** (enable = `Room_Active_nn`) dans SIMPL Windows. Pour suivre aussi les actions globales, combiner `Room_Active_00` en OR avec chaque `Room_Active_nn` (ou se fier aux `Rnn_xxx_fb`, que le C# pousse pour chaque espace).

### Bloc maison

| Join | Nom | Sens EISC | Description |
|---|---|---|---|
| d201 | `White_Auto_Actual` | entrée | État réel renvoyé par le slot 2 (même join que l’action `White_Auto`) |
| d211 | `Scent_On_Actual` | entrée | État réel renvoyé par le slot 2 (même join que l’action `Scent_On`) |
| d221-228 | `Scent_Fragrance_{n}_Actual` | entrée | État réel renvoyé par le slot 2 (même join que l’action `Scent_Fragrance_{n}`) |
| a21 | `White_Temperature_Actual#` | entrée | Mesure réelle (même join que `White_Temperature#`, tenu en sortie par le C#) |
| a22 | `Scent_Diffusion_Actual#` | entrée | Mesure réelle (même join que `Scent_Diffusion#`, tenu en sortie par le C#) |
| a31-34 | `Blinds_{n}_Position_Actual#` | entrée | Mesure réelle (même join que `Blinds_{n}_Position#`, tenu en sortie par le C#) |
| d301-304 | `Blinds_{n}_Up` | sortie | Impulsion 250 ms du C# vers le moteur de la façade n |
| d311-314 | `Blinds_{n}_Stop` | sortie | Impulsion 250 ms du C# vers le moteur de la façade n |
| d321-324 | `Blinds_{n}_Down` | sortie | Impulsion 250 ms du C# vers le moteur de la façade n |

## 3. Blocs espace (C# ↔ slot 2) — join = 1000 + (id−1)×100 + offset

Échanges C# ↔ slot 2 par espace 'intersystem'. _fb = tenu par le C# (sortie EISC, reçu par le slot 2) ; _Actual = mesure renvoyée par le slot 2 (entrée EISC). Seuls les circuits actifs de l'espace sont câblés : le canal 6 « Lustre d'apparat » n'existe que dans le hall (index conservé partout, joins globaux stables).

### Digitaux

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_On` | oui | oui | eclairages |
| +11 | `Room_Displayed` | oui | — | * — L'espace est affiché sur au moins un écran (ou toute la boutique) |
| +21 | `Music_Playing` | oui | oui | audio |
| +22 | `Music_Muted` | oui | oui | audio |

### Analogiques

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_Level` | oui | oui | eclairages |
| +21 | `Music_Volume` | oui | oui | audio |
| +22 | `Music_Source` | oui | oui | audio — 1..8 |
| +25 | `Scene` | oui | — | eclairages — 0 = personnalisée, 1..4 = scène active de l'espace |

### Sériels

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +10 | `Room_Name` | oui | — | * |

## 4. Espaces de la configuration courante

| Id | Clé GUI | Nom | Niveau | Bloc EISC | Circuits actifs | Audio |
|---|---|---|---|---|---|---|
| 1 | hall | Hall & escalier d’apparat | Rez-de-chaussée | 1000 | case, cove, spot, sconce, path, chandelier | oui |
| 2 | r1 | Diamants & alliances | Rez-de-chaussée | 1100 | case, cove, spot, sconce, path | oui |
| 3 | r2 | Galerie Éclat | Rez-de-chaussée | 1200 | case, cove, spot, sconce, path | oui |
| 4 | r3 | Perles & Pétales | Rez-de-chaussée | 1300 | case, cove, spot, sconce, path | oui |
| 5 | r4 | Haute joaillerie | Rez-de-chaussée | 1400 | case, cove, spot, sconce, path | oui |
| 6 | r5 | Le Temps poétique | Rez-de-chaussée | 1500 | case, cove, spot, sconce, path | oui |
| 7 | r6 | Salon des pierres | Rez-de-chaussée | 1600 | case, cove, spot, sconce, path | oui |
| 8 | u1 | Salon privé Émeraude | Premier étage | 1700 | case, cove, spot, sconce, path | oui |
| 9 | u2 | Galerie de la nature | Premier étage | 1800 | case, cove, spot, sconce, path | oui |
| 10 | u3 | Cabinet de curiosités | Premier étage | 1900 | case, cove, spot, sconce, path | oui |
| 11 | u4 | Salon privé Rubis | Premier étage | 2000 | case, cove, spot, sconce, path | oui |
| 12 | u5 | Salon des fiançailles | Premier étage | 2100 | case, cove, spot, sconce, path | oui |
| 13 | u6 | Salon des signatures | Premier étage | 2200 | case, cove, spot, sconce, path | oui |
| 14 | u7 | Écrin Saphir | Premier étage | 2300 | case, cove, spot, sconce, path | oui |
| 15 | u8 | Salon des commandes | Premier étage | 2400 | case, cove, spot, sconce, path | oui |

## 5. Recette Debugger (à faire sur matériel, jamais réalisée)

1. Sélection « Salon des pierres » sur la dalle → `Room_Select#` = 7, `Room_Active_07` haut, les autres bas (`Room_Active_00` bas).
2. Scène « Réception » → `Scene_Gala` impulsion ; `R07_Light_1_Level_fb#` (vitrines) = 65535, `R07_Light_2_Level_fb#` (corniches) = 55705 (85 %), `R07_Scene_fb#` = 2 ; les autres `Rnn_Scene_fb#` restent à 4 (Fermeture) ; sur la dalle `Scene_Gala` haut, `Scene_Name$` = « Réception ». Pas de `R07_Light_6_*` (pas de lustre).
3. Curseur `Light_3_Level#` = 32768 sur la dalle → `Room_Active_07` puis `Light_3_Level#` ; `R07_Light_3_Level_fb#` = 32768, `R07_Scene_fb#` = 0, `Scene_Name$` = « Ambiance personnalisée ».
4. Renvoyer `R07_Light_3_Level_Actual#` = 0 depuis le Debugger → la dalle affiche 0 % sur « Spots », `R07_Light_3_On_fb` bas.
5. iPad sur « Toute la boutique » : `Scene_Opening` → `Room_Active_00` puis `Scene_Opening` ; les 15 `Rnn_Scene_fb#` = 1, `R01_Light_6_Level_fb#` (lustre du hall) = 39321 (60 %) ; la dalle (Salon des pierres) suit.
6. `Lights_AllOff` depuis n'importe quel écran → tous les `Rnn_Light_*_fb#` = 0, `Rnn_Scene_fb#` = 0, `Lights_AllOff` tenu haut sur tous les écrans.
7. Stores : `Blinds_2_Close` → `Blinds_2_Down` impulsion 250 ms, `Blinds_2_Position#` = 0 tenu, `Blinds_All_Close` bas (les 3 autres façades ouvertes) ; `Blinds_All_Half` → 4 impulsions `Blinds_n_Stop`, les 4 positions = 32768, `Blinds_All_Half` haut. Renvoyer `Blinds_1_Position_Actual#` = 65535 → façade nord affichée ouverte.
8. Blanc : `White_Temperature#` = 4000 → tenu sur l'EISC, `White_Auto` bas. `White_Auto` (impulsion) → fb haut et `White_Temperature#` = 3500 / 4500 / 3000 selon l'heure ; attendre la minute suivante ne change rien si le palier est le même. Renvoyer `White_Auto_Actual` bas → fb bas.
9. Parfum : `Scent_Fragrance_3` → fb interlock, `Scent_Fragrance_Name$` = « Thé blanc » ; `Scent_Diffusion#` = 60 tenu ; `Scent_Off` → `Scent_On` fb bas.
10. Horaires : `Schedule_Opening_Up` ×2 → `Schedule_Opening#` = 570, `Schedule_Opening$` = « 09:30 ». Régler `Schedule_Closing#` sur la minute courante + 1 puis `Schedule_On` : à la minute → `Room_Active_00` haut puis impulsion `Scene_Closed` sur l'EISC, `Rnn_Scene_fb#` = 4 partout. `Schedule_Off` → plus rien à l'heure suivante.
11. Audio depuis « Toute la boutique » : `Music_Source_2` → `Room_Active_00` puis `Music_Source_2` ; `Rnn_Music_Source_fb#` = 2 et `Rnn_Music_Playing_fb` haut dans les 15 espaces. Renvoyer `R04_Music_Muted_Actual` haut → « Perles & Pétales » affiche muet, les autres non.
