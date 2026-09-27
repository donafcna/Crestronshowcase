# Club Étoile — contrat de joins v1.0 (27.09.2026)

Référence unique : `config/club-etoile_config.json` → `contrat`. Le C# (`Joins.cs`), le SIMPL (`ClubEtoile_Slot2.smw`) et le futur GUI CH5 (showcase `club-etoile`) s'y conforment ; `tools/check-contract.js` vérifie la cohérence.

## Principe

- Tous les joins de pilotage sont globaux : le même numéro dans toutes les salles.
- Le C# (slot 1) connaît la salle affichée par chaque écran (_activeRoomPerDevice ; 0 = « Tout le club ») : il applique l'action à cette salle — ou à toutes quand l'écran affiche « Tout le club » — pose Room_Select# (a10) sur l'EISC, puis recopie l'impulsion sur le même join. Le slot 2 route avec des buffers validés par Room_Active_nn (d101-110, un seul haut = a10) ; Room_Active_00 (d100) est haut quand l'action vise tout le club.
- Feedback des écrans : toujours calculé par le C#. Le slot 2 renvoie les mesures réelles par les entrées _Actual (blocs salle et joins globaux club) ; elles font foi dès réception.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, `Rnn_xxx_fb` / `Club_xxx_fb` = état tenu par le C#) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc salle EISC : join = 1000 + (id−1)×100 + offset (3 salles → 1000..1299, socle 2732). Bloc club EISC : join = 500 + join global (états tenus des fonctions globales, 500..750 ; occupés : d611-654, a520-541). Réservés aux échanges C# ↔ slot 2, jamais émis par un écran.
- Par salle : ambiance (scène + intensité). Les 4 circuits d'éclairage sont **dérivés** de l'ambiance (intensité × facteur de scène × coefficient du circuit), jamais pilotés un par un depuis les écrans. Affluence, CVC, audio, effets, écran DJ et raccourcis sont globaux (club). Pas d'audio ni de climat par salle.

Direction : → = écran → C# · ← = C# → écran · ↔ = commande et feedback sur le même join.

## 1. Signaux globaux (écrans ↔ C#, recopiés vers le slot 2)

### Digitaux

| Join | Nom | Sens | Description |
|---|---|---|---|
| 51 | `Scene_Signature` | ↔ | Ambiance « Signature » sur la salle visée (a10 ; 0 = toutes) ; fb tenu = scène active de la salle affichée |
| 52 | `Scene_Party` | ↔ | Ambiance « Festif » |
| 53 | `Scene_Calm` | ↔ | Ambiance « Doux » |
| 54 | `Scene_Off` | ↔ | Ambiance « Éteint » (tous les circuits de la salle à 0) |
| 100 | `Room_Select_All` | ↔ | Sélection « Tout le club » (Room_Select# = 0) ; fb = cet écran affiche tout le club. Sur l'EISC : Room_Active_00 |
| 101-110 | `Room_Select_{n}` | ↔ | Sélection directe de la salle n (join = 100+n) ; fb = salle affichée par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. Pose aussi l'étage et la vue « salle » de l'écran |
| 111 | `Crowd_Cozy` | ↔ | Affluence « Calme » (< 200 p.) : ventilation 35 %, consigne 21,0 °C ; fb tenu (interlock) |
| 112 | `Crowd_Busy` | ↔ | Affluence « Normal » : ventilation 65 %, consigne 19,0 °C ; fb tenu |
| 113 | `Crowd_Packed` | ↔ | Affluence « Forte affluence » (> 1000 p.) : ventilation 100 %, consigne 17,0 °C ; fb tenu |
| 121 | `HVAC_CTA_Online` | ← | CTA en ligne (entrée EISC `HVAC_CTA_Online_Actual` ; haut par défaut tant que le slot 2 ne dit rien) |
| 131 | `Audio_Limiter` | ← | Limiteur déclenché : dB mesuré ≥ seuil (105) ou `Audio_Limiter_Actual` haut ; alerte rouge sur les écrans |
| 141 | `Smoke_On` | ↔ | Machine CO2 : lancer le jet ; fb tenu = jet actif |
| 142 | `Smoke_Off` | ↔ | Machine CO2 : stop ; fb tenu = prêt |
| 143 | `Strobe_On` | ↔ | Stroboscope : lancer ; fb tenu = actif |
| 144 | `Strobe_Off` | ↔ | Stroboscope : stop ; fb tenu = éteint |
| 145 | `Lyres_On` | ↔ | Mouvement des lyres : marche ; fb tenu |
| 146 | `Lyres_Off` | ↔ | Mouvement des lyres : arrêt ; fb tenu |
| 151-154 | `Screen_Source_{n}` | ↔ | Écran DJ : source n (1 Visuels club, 2 HDMI régie, 3 Caméra live, 4 Logo) ; fb tenu (interlock) |
| 161 | `Macro_PeakAlert` | ↔ | « Alerte Peak Affluence » = Crowd_Packed + Strobe_On + Smoke_On ; fb = les trois états réunis |
| 162 | `Macro_CalmEnd` | ↔ | « Calme / Fin Service » = Strobe_Off + Smoke_Off + Crowd_Cozy ; fb = strobe et fumée arrêtés (scène rapide « Calme » du smartphone) |
| 163 | `Macro_AllOff` | ↔ | « Extinction Son & Effets » = Strobe_Off + Smoke_Off + volumes piste et bar à 0 + Crowd_Cozy ; fb = tout éteint |
| 164 | `Macro_PartyQuick` | ↔ | Scène rapide « Soirée » (smartphone) = Strobe_On + Smoke_On ; fb = strobe et fumée actifs |
| 171 | `Club_View_Building` | ↔ | Vue « Bâtiment » (3D des 3 niveaux) sur cet écran ; fb tenu. Écrans seulement, jamais sur l'EISC |
| 172 | `Club_View_Floor` | ↔ | Vue « Étage » (Club_Floor#) sur cet écran ; fb tenu. Écrans seulement |
| 173 | `Club_View_Room` | ↔ | Vue « Salle » (salle affichée) sur cet écran ; fb tenu. Écrans seulement |
| 250 | `Config_Resync` | → | Demande de (ré)envoi de la configuration JSON |

### Analogiques

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Salle affichée par cet écran (0 = tout le club, 1..10). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11 | `Room_Level#` | ↔ | « Intensité de la salle » (0-65535 sur le join, 0-100 % en interne) de la salle visée ; curseur → C# ; fb = intensité |
| 12 | `Scene#` | ← | Scène active de la salle affichée (1..4 ; 0 = ambiances mixtes pour « Tout le club ») |
| 20 | `HVAC_Fan#` | ↔ | Extraction d'air (0-100 %) ; posée par l'affluence puis réglable au curseur ; fb = valeur tenue (ou `HVAC_Fan_Actual#`) |
| 21 | `HVAC_Setpoint#` | ← | Consigne CVC × 10 (190 = 19,0 °C), calculée depuis l'affluence ; poussée au slot 2 par `Club_HVAC_Setpoint_fb#` (a521) |
| 22 | `HVAC_Temperature#` | ← | Température mesurée × 10 (entrée EISC `HVAC_Temperature_Actual#`) |
| 30 | `Audio_Dancefloor_Volume#` | ↔ | Volume piste (0-100) ; fb = valeur tenue |
| 31 | `Audio_Bar_Volume#` | ↔ | Volume bar (0-100) ; fb = valeur tenue |
| 32 | `Audio_Db#` | ← | Niveau sonore mesuré (dB) : `Audio_Db_Actual#` du DSP ; simulé par le C# tant que rien n'est reçu (`simulerDb`) |
| 40 | `Strobe_Freq#` | ↔ | Fréquence programmée du stroboscope (1-15 Hz, direct) ; fb = valeur tenue |
| 41 | `Screen_Source#` | ← | Source active de l'écran DJ (1..4) |
| 42 | `Club_Floor#` | ↔ | Étage affiché par cet écran (0 = RDC, 1, 2) ; → change l'étage de la vue « Étage » ; fb = étage de la salle affichée. Écrans seulement |
| 51-58 | `Light_{n}_Level#` | ← | Niveau dérivé du circuit n de la salle affichée (0-65535) : intensité × facteur de scène × coefficient. Lecture seule |
| 250 | `Config_ChunkAck#` | → | Accusé de réception du chunk N de configuration |

### Sériels (écrans seulement, jamais sur l'EISC)

| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Name$` | ← | Nom de la salle affichée (« Tout le club » pour a10 = 0) |
| 11 | `Room_Subtitle$` | ← | « Signature · 75 % » / « Éteint » / « Ambiances mixtes » |
| 12 | `Scene_Name$` | ← | Nom de la scène active de la salle affichée / « Ambiances mixtes » |
| 13 | `Club_Summary$` | ← | « 3 niveaux · 3 grandes salles · DJ » |
| 14 | `Room_Mood$` | ← | Ambiance texte de la salle (« Or & velours · Piste rétro · DJ ») |
| 15 | `Room_Color$` | ← | Couleur signature de la salle (#rrggbb) |
| 20 | `HVAC_Status$` | ← | « CTA en ligne » / « CTA hors ligne » |
| 21 | `Crowd_Name$` | ← | Nom de l'affluence courante (Calme / Normal / Forte affluence) |
| 22 | `Audio_Limiter_Text$` | ← | « Limiteur actif · seuil atteint » / « Seuil 105 dB » |
| 23 | `Smoke_Status$` | ← | « Machine CO2 : Prêt » / « Machine CO2 : Jet Actif » |
| 24 | `Strobe_Status$` | ← | « Strobe : Actif » / « Strobe : Éteint » |
| 25 | `Screen_Source_Name$` | ← | Nom de la source active de l'écran DJ |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |
| 105 | `Config_Json$` | ← | Transport de la configuration (VCFG\|i\|n\|payload) |
| 106 | `Config_Hash$` | ← | Empreinte de la configuration |

Niveaux 0-65535 sur les joins, 0-100 % en interne ; consignes et températures × 10 ; volumes, ventilation et fréquence strobe directs. L'horloge des écrans est locale (aucun join).

## 2. Ce que voit le slot 2 sur le symbole EISC (IP-ID F0, 127.0.0.2)

- **Sorties du symbole = ce que le slot 2 reçoit.** Chaque action arrive sous son nom nu (`Scene_Party`, `Crowd_Packed`, `Smoke_On`, `Screen_Source_2`, `Macro_PeakAlert`, `Room_Level#`, `HVAC_Fan#`, `Audio_Bar_Volume#`…) en impulsion, **précédée** de `Room_Select#` (a10) et de `Room_Active_nn` (d100-103, un seul haut). Un appui « Festif » sur le Neon Foundry fait donc monter `Room_Active_02` puis `Scene_Party` ; le même appui depuis « Tout le club » fait monter `Room_Active_00` puis `Scene_Party`, et le C# pousse les `Rnn_Scene_*_fb` des 3 salles.
- **Bloc club (sorties, 500 + join global) = états tenus par le C#** : `Club_Crowd_Cozy/Busy/Packed_fb` (d611-613), `Club_Audio_Limiter_fb` (d631), `Club_Smoke_On_fb` (d641), `Club_Strobe_On_fb` (d643), `Club_Lyres_On_fb` (d645), `Club_Screen_Source_1..4_fb` (d651-654), `Club_HVAC_Fan_fb#` (a520), `Club_HVAC_Setpoint_fb#` (a521, × 10), `Club_Audio_Dancefloor_Volume_fb#` (a530), `Club_Audio_Bar_Volume_fb#` (a531), `Club_Strobe_Freq_fb#` (a540), `Club_Screen_Source_fb#` (a541). C'est la vérité pour les drivers : une macro ou un changement d'affluence modifie ces états sans qu'aucun bouton élémentaire ne soit pressé.
- **Macros** : le C# recopie `Macro_xxx` puis pulse 250 ms les actions élémentaires qu'elle déclenche (`Crowd_Packed`, `Strobe_On`, `Smoke_On`… ; volumes posés sur `Audio_*_Volume#`), pour que le Debugger montre la décomposition.
- **Entrées du symbole = ce que le slot 2 renvoie.** États réels club sur les mêmes joins que l'action : `HVAC_CTA_Online_Actual` (d121), `Audio_Limiter_Actual` (d131), `Smoke_On_Actual` (d141), `Strobe_On_Actual` (d143), `Lyres_On_Actual` (d145), `Screen_Source_1..4_Actual` (d151-154, front montant), `HVAC_Fan_Actual#` (a20), `HVAC_Temperature_Actual#` (a22, × 10), `Audio_Dancefloor_Volume_Actual#` (a30), `Audio_Bar_Volume_Actual#` (a31), `Audio_Db_Actual#` (a32), `Strobe_Freq_Actual#` (a40) ; et mesures par salle `Rnn_xxx_Actual` dans les blocs salle.
- **Niveau sonore** : tant que `Audio_Db_Actual#` n'a jamais été reçu, le C# simule dB = 10 + ⌊volume piste × 0,95⌋ ± 2 toutes les secondes (CTimer) ; dès la première mesure, la simulation s'arrête définitivement et le DSP fait foi.
- Les sériels ne sont pas câblés en entrée. Les analogiques « ← » (mesures pour les écrans) ne sont pas en sortie de l'EISC ; `Light_n_Level#` (dérivés) n'y sont pas non plus : le slot 2 les reçoit dans les blocs salle.
- Bufferisation : un sous-système « Salle nn - Nom » par salle contient un **Analog Buffer** validé par `Room_Active_nn` qui recopie `Room_Level#` vers `Rnn_Room_Level_Buf#`. Pour les digitaux (`Scene_*`), poser de la même façon un symbole **Buffer** (enable = `Room_Active_nn`) dans SIMPL Windows. Pour suivre aussi les actions globales, combiner `Room_Active_00` en OR avec chaque `Room_Active_nn` (ou se fier aux `Rnn_xxx_fb`, que le C# pousse pour chaque salle).

## 3. Blocs salle (C# ↔ slot 2) — join = 1000 + (id−1)×100 + offset

Échanges C# ↔ slot 2 par salle 'intersystem'. _fb = tenu par le C# (sortie EISC, reçu par le slot 2) ; _Actual = mesure renvoyée par le slot 2 (entrée EISC). Seules les fonctionnalités actives de la salle sont câblées.

### Digitaux

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` (C# → slot 2) | Entrée `_Actual` (slot 2 → C#) | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_On` | oui | oui | eclairages — circuit dérivé allumé (> 0) |
| +11-14 | `Scene_{n}` | oui | oui | ambiance — scène n tenue (1 Signature, 2 Festif, 3 Doux, 4 Éteint), un seul haut ; en entrée, seul le front montant compte |
| +61 | `Room_Displayed` | oui | — | * — La salle est affichée sur au moins un écran (ou tout le club) |

### Analogiques

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +1-8 | `Light_{n}_Level` | oui | oui | eclairages — 0-65535, dérivé de l'ambiance |
| +11 | `Room_Level` | oui | oui | ambiance — intensité 0-65535 |
| +12 | `Scene` | oui | oui | ambiance — 1..4 |

### Sériels

| Offset | Nom (préfixe `Rnn_`) | Sortie `_fb` | Entrée `_Actual` | Fonction requise |
|---|---|---|---|---|
| +10 | `Room_Name` | oui | — | * |

Dérivation des circuits (loi du simulateur `venue.js`) : niveau = clamp(intensité × facteur × coefficient, 0..100), facteurs Signature 0,8 · Festif 1,25 · Doux 0,3 · Éteint 0 ; coefficients Piste 1,0 · Lyres 1,0 · Barres LED murales 0,9 · Boules à facettes 0,7. Une mesure `Rnn_Light_n_Level_Actual#` remplace le niveau dérivé jusqu'au prochain changement d'ambiance ; une mesure `Rnn_Room_Level_Actual#` ou `Rnn_Scene_Actual#` re-dérive les 4 circuits.

## 4. Salles de la configuration courante

| Id | Clé GUI | Nom | Étage | Bloc EISC | Ambiance | Circuits dérivés |
|---|---|---|---|---|---|---|
| 1 | original | Studio 77 · Disco | Rez-de-chaussée (0) | 1000 | Signature 75 % | piste, lyres, barres, boules |
| 2 | neon | Neon Foundry · Electro | 1er étage (1) | 1100 | Signature 75 % | piste, lyres, barres, boules |
| 3 | sky | Sky Garden · Panoramique | 2e étage (2) | 1200 | Signature 75 % | piste, lyres, barres, boules |

État initial club : affluence Normal (ventilation 65 %, consigne 19,0 °C, mesure 19,0 °C, CTA en ligne), volumes 90/60, 102 dB simulé, fumée off, strobe off (8 Hz), lyres on, écran DJ Visuels club, vue « Bâtiment », salle Studio 77.

## 5. Recette Debugger (à faire sur matériel, jamais réalisée)

1. Sélection « Neon Foundry » sur la dalle → `Room_Select#` = 2, `Room_Active_02` haut, les autres bas ; la dalle passe en vue « Salle », `Club_Floor#` = 1.
2. Appui « Festif » → `Scene_Party` impulsion ; `R02_Scene_2_fb` haut, `R02_Scene_fb#` = 2, `R02_Light_1_Level_fb#` = 94 % (75 × 1,25 × 1,0) → 61 603, `R02_Light_4_Level_fb#` = 66 % (75 × 1,25 × 0,7) → 43 253 ; `Scene_Name$` = « Festif », `Room_Subtitle$` = « Festif · 75 % ».
3. Curseur intensité 40 % → `Room_Level#` = 26 214 sur l'EISC après `Room_Active_02` ; les 4 `R02_Light_n_Level_fb#` se re-dérivent ; `R02_Room_Level_Buf#` suit dans le sous-système « Salle 02 ».
4. Renvoyer `R02_Scene_4_Actual` haut depuis le Debugger → la dalle affiche « Éteint », les 4 circuits à 0, `Scene_Off` tenu haut.
5. iPad sur « Tout le club » : `Scene_Calm` → `Room_Active_00` haut puis `Scene_Calm` ; les 3 `Rnn_Scene_3_fb` montent ; la dalle (Neon Foundry) suit ; `Scene_Name$` iPad = « Doux » ; puis `Scene_Party` sur la dalle seule → iPad affiche « Ambiances mixtes », `Scene#` = 0.
6. `Crowd_Packed` → `Club_Crowd_Packed_fb` haut, `Club_HVAC_Fan_fb#` = 100, `Club_HVAC_Setpoint_fb#` = 170 ; `HVAC_Fan#` curseur à 80 → `Club_HVAC_Fan_fb#` = 80. Renvoyer `HVAC_Temperature_Actual#` = 183 → écrans « 18,3 °C » ; `HVAC_CTA_Online_Actual` bas → « CTA hors ligne ».
7. `Macro_PeakAlert` → impulsion `Macro_PeakAlert`, puis 250 ms sur `Crowd_Packed`, `Strobe_On`, `Smoke_On` ; `Club_Strobe_On_fb` et `Club_Smoke_On_fb` hauts ; `Smoke_Status$` = « Machine CO2 : Jet Actif ». `Macro_AllOff` → `Strobe_Off`, `Smoke_Off`, `Crowd_Cozy` pulsés, `Audio_Dancefloor_Volume#` et `Audio_Bar_Volume#` = 0.
8. Audio : `Audio_Dancefloor_Volume#` = 100 → en ≤ 1 s `Audio_Db#` ≈ 105 sur les écrans, `Audio_Limiter` haut, `Club_Audio_Limiter_fb` haut, texte « Limiteur actif · seuil atteint ». Renvoyer `Audio_Db_Actual#` = 98 → la simulation s'arrête, 98 dB affichés, limiteur bas.
9. `Screen_Source_3` → `Club_Screen_Source_3_fb` haut, `Club_Screen_Source_fb#` = 3, `Screen_Source_Name$` = « Caméra live » ; renvoyer `Screen_Source_4_Actual` haut → « Logo ».
10. `Club_View_Building` / `Club_Floor#` = 2 sur l'iPhone : aucun signal sur l'EISC, feedback d171-173 / a42 sur cet écran seulement.
