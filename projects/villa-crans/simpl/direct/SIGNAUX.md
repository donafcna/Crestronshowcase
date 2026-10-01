# Villa Crans v6.0 — programme SIMPL unique : joins et signaux (généré)

Contrat S : join de pièce = 625 + (id - 1) × 125 + offset. Généré par `simpl/direct/generate_simpl.js` depuis `villa_config.json` (version 1.0.215).

Dalles déclarées : 0x03 Dalle TSW-1070 (salon) (TSW-770) ; 0x04 XPanel (XPanel 3.0 Crestron HTML5) ; 0x05 iPad Crestron One (Crestron One) ; 0x06 iPhone Crestron One (Crestron One) ; 0x11 QR Salle_de_jeux (XPanel 3.0 Crestron HTML5) ; 0x12 QR Chambre_maman (XPanel 3.0 Crestron HTML5) ; 0x13 QR Chambre_papa (XPanel 3.0 Crestron HTML5) ; 0x14 QR Suite_amis (XPanel 3.0 Crestron HTML5) ; 0x15 QR Chambre_amis (XPanel 3.0 Crestron HTML5) ; 0x16 QR Chambre_2 (XPanel 3.0 Crestron HTML5) ; 0x17 QR Bureau (XPanel 3.0 Crestron HTML5) ; 0x18 QR Home_cinema (XPanel 3.0 Crestron HTML5) ; 0x19 QR Chambre_3 (XPanel 3.0 Crestron HTML5) ; 0x1A QR Suite_invites (XPanel 3.0 Crestron HTML5) ; 0x1B QR Terrasse_et_jardin (XPanel 3.0 Crestron HTML5) ; 0x1C QR Piscine_et_spa (XPanel 3.0 Crestron HTML5) ; 0x1D QR Sauna_et_hammam (XPanel 3.0 Crestron HTML5) ; 0x1E QR Pool_house (XPanel 3.0 Crestron HTML5) ; 0x1F QR Garage_et_ateliers (XPanel 3.0 Crestron HTML5).

## Pièces

- R01 = Salle de jeux : joins 626..750, module `VillaPiece_R01.usp`.
- R02 = Chambre maman : joins 751..875, module `VillaPiece_R02.usp`.
- R03 = Chambre papa : joins 876..1000, module `VillaPiece_R03.usp`.
- R04 = Suite amis : joins 1001..1125, module `VillaPiece_R04.usp`.
- R05 = Chambre amis : joins 1126..1250, module `VillaPiece_R05.usp`.
- R06 = Chambre 2 : joins 1251..1375, module `VillaPiece_R06.usp`.
- R07 = Bureau : joins 1376..1500, module `VillaPiece_R07.usp`.
- R08 = Home cinéma : joins 1501..1625, module `VillaPiece_R08.usp`.
- R09 = Chambre 3 : joins 1626..1750, module `VillaPiece_R09.usp`.
- R10 = Suite invités : joins 1751..1875, module `VillaPiece_R10.usp`.
- R11 = Terrasse & jardin : joins 1876..2000, module `VillaPiece_R11.usp`.
- R12 = Piscine & spa : joins 2001..2125, module `VillaPiece_R12.usp`.
- R13 = Sauna & hammam : joins 2126..2250, module `VillaPiece_R13.usp`.
- R14 = Pool house : joins 2251..2375, module `VillaPiece_R14.usp`.
- R15 = Garage & ateliers : joins 2376..2500, module `VillaPiece_R15.usp`.

## Bloc d'une pièce (offsets, identiques pour toutes les pièces)

| Type | Join logique GUI | Offset | Signal (préfixe Rnn_) | Sens |
|---|---|---|---|---|
| a | 31 | 1 | Consigne | appui / valeur |
| a | 31 | 1 | Consigne_fb | retour |
| a | 51 | 2 | Source | appui / valeur |
| a | 51 | 2 | Source_fb | retour |
| a | 52 | 3 | Volume | appui / valeur |
| a | 52 | 3 | Volume_fb | retour |
| a | 53 | 4 | Source_Audio_fb | retour |
| a | 61 | 5 | Ventilation | appui / valeur |
| a | 61 | 5 | Ventilation_fb | retour |
| a | 62 | 6 | Sauna_Consigne | appui / valeur |
| a | 62 | 6 | Sauna_Consigne_fb | retour |
| a | 63 | 7 | Hammam_Consigne | appui / valeur |
| a | 63 | 7 | Hammam_Consigne_fb | retour |
| a | 64 | 8 | Sauna_Mesure_fb | retour |
| a | 65 | 9 | Hammam_Mesure_fb | retour |
| a | 71 | 10 | Circuit01 | appui / valeur |
| a | 71 | 10 | Circuit01_fb | retour |
| a | 72 | 11 | Circuit02 | appui / valeur |
| a | 72 | 11 | Circuit02_fb | retour |
| a | 73 | 12 | Circuit03 | appui / valeur |
| a | 73 | 12 | Circuit03_fb | retour |
| a | 74 | 13 | Circuit04 | appui / valeur |
| a | 74 | 13 | Circuit04_fb | retour |
| a | 75 | 14 | Circuit05 | appui / valeur |
| a | 75 | 14 | Circuit05_fb | retour |
| a | 76 | 15 | Circuit06 | appui / valeur |
| a | 76 | 15 | Circuit06_fb | retour |
| a | 77 | 16 | Circuit07 | appui / valeur |
| a | 77 | 16 | Circuit07_fb | retour |
| a | 78 | 17 | Circuit08 | appui / valeur |
| a | 78 | 17 | Circuit08_fb | retour |
| a | 79 | 18 | Circuit09 | appui / valeur |
| a | 79 | 18 | Circuit09_fb | retour |
| a | 80 | 19 | Circuit10 | appui / valeur |
| a | 80 | 19 | Circuit10_fb | retour |
| a | 81 | 20 | Circuit11 | appui / valeur |
| a | 81 | 20 | Circuit11_fb | retour |
| a | 82 | 21 | Circuit12 | appui / valeur |
| a | 82 | 21 | Circuit12_fb | retour |
| a | 83 | 22 | Circuit13 | appui / valeur |
| a | 83 | 22 | Circuit13_fb | retour |
| a | 84 | 23 | Circuit14 | appui / valeur |
| a | 84 | 23 | Circuit14_fb | retour |
| a | 85 | 24 | Circuit15 | appui / valeur |
| a | 85 | 24 | Circuit15_fb | retour |
| a | 86 | 25 | Circuit16 | appui / valeur |
| a | 86 | 25 | Circuit16_fb | retour |
| a | 87 | 26 | Circuit17 | appui / valeur |
| a | 87 | 26 | Circuit17_fb | retour |
| a | 88 | 27 | Circuit18 | appui / valeur |
| a | 88 | 27 | Circuit18_fb | retour |
| a | 89 | 28 | Circuit19 | appui / valeur |
| a | 89 | 28 | Circuit19_fb | retour |
| a | 90 | 29 | Circuit20 | appui / valeur |
| a | 90 | 29 | Circuit20_fb | retour |
| a | 254 | 30 | Volume_Media | appui / valeur |
| a | 254 | 30 | Volume_Media_fb | retour |
| d | 49 | 1 | Consigne_Plus | appui |
| d | 50 | 2 | Consigne_Moins | appui |
| d | 51 | 3 | Scene1 | appui |
| d | 51 | 3 | Scene1_fb | retour |
| d | 52 | 4 | Scene2 | appui |
| d | 52 | 4 | Scene2_fb | retour |
| d | 53 | 5 | Scene3 | appui |
| d | 53 | 5 | Scene3_fb | retour |
| d | 54 | 6 | Scene4 | appui |
| d | 54 | 6 | Scene4_fb | retour |
| d | 55 | 7 | Mute | appui |
| d | 55 | 7 | Mute_fb | retour |
| d | 61 | 8 | Groupe_Volets_Ouvrir | appui |
| d | 62 | 9 | Groupe_Volets_Demi | appui |
| d | 63 | 10 | Groupe_Volets_Fermer | appui |
| d | 64 | 11 | Groupe_Rideaux_Ouvrir | appui |
| d | 65 | 12 | Groupe_Rideaux_Demi | appui |
| d | 66 | 13 | Groupe_Rideaux_Fermer | appui |
| d | 67 | 14 | Groupe_Stores_Ouvrir | appui |
| d | 68 | 15 | Groupe_Stores_Demi | appui |
| d | 69 | 16 | Groupe_Stores_Fermer | appui |
| d | 81 | 17 | Moteur01_Monter | appui |
| d | 82 | 18 | Moteur01_Stop | appui |
| d | 83 | 19 | Moteur01_Descendre | appui |
| d | 84 | 20 | Moteur02_Monter | appui |
| d | 85 | 21 | Moteur02_Stop | appui |
| d | 86 | 22 | Moteur02_Descendre | appui |
| d | 87 | 23 | Moteur03_Monter | appui |
| d | 88 | 24 | Moteur03_Stop | appui |
| d | 89 | 25 | Moteur03_Descendre | appui |
| d | 90 | 26 | Moteur04_Monter | appui |
| d | 91 | 27 | Moteur04_Stop | appui |
| d | 92 | 28 | Moteur04_Descendre | appui |
| d | 93 | 29 | Moteur05_Monter | appui |
| d | 94 | 30 | Moteur05_Stop | appui |
| d | 95 | 31 | Moteur05_Descendre | appui |
| d | 96 | 32 | Moteur06_Monter | appui |
| d | 97 | 33 | Moteur06_Stop | appui |
| d | 98 | 34 | Moteur06_Descendre | appui |
| d | 111 | 35 | Lamelles01_Horaire | appui |
| d | 112 | 36 | Lamelles01_Stop | appui |
| d | 113 | 37 | Lamelles01_Antihoraire | appui |
| d | 114 | 38 | Lamelles02_Horaire | appui |
| d | 115 | 39 | Lamelles02_Stop | appui |
| d | 116 | 40 | Lamelles02_Antihoraire | appui |
| d | 117 | 41 | Lamelles03_Horaire | appui |
| d | 118 | 42 | Lamelles03_Stop | appui |
| d | 119 | 43 | Lamelles03_Antihoraire | appui |
| d | 120 | 44 | Lamelles04_Horaire | appui |
| d | 121 | 45 | Lamelles04_Stop | appui |
| d | 122 | 46 | Lamelles04_Antihoraire | appui |
| d | 123 | 47 | Lamelles05_Horaire | appui |
| d | 124 | 48 | Lamelles05_Stop | appui |
| d | 125 | 49 | Lamelles05_Antihoraire | appui |
| d | 126 | 50 | Lamelles06_Horaire | appui |
| d | 127 | 51 | Lamelles06_Stop | appui |
| d | 128 | 52 | Lamelles06_Antihoraire | appui |
| d | 129 | 53 | Moteur07_Monter | appui |
| d | 130 | 54 | Moteur07_Stop | appui |
| d | 131 | 55 | Moteur07_Descendre | appui |
| d | 132 | 56 | Moteur08_Monter | appui |
| d | 133 | 57 | Moteur08_Stop | appui |
| d | 134 | 58 | Moteur08_Descendre | appui |
| d | 135 | 59 | Moteur09_Monter | appui |
| d | 136 | 60 | Moteur09_Stop | appui |
| d | 137 | 61 | Moteur09_Descendre | appui |
| d | 138 | 62 | Moteur10_Monter | appui |
| d | 139 | 63 | Moteur10_Stop | appui |
| d | 140 | 64 | Moteur10_Descendre | appui |
| d | 141 | 65 | Moteur11_Monter | appui |
| d | 142 | 66 | Moteur11_Stop | appui |
| d | 143 | 67 | Moteur11_Descendre | appui |
| d | 144 | 68 | Moteur12_Monter | appui |
| d | 145 | 69 | Moteur12_Stop | appui |
| d | 146 | 70 | Moteur12_Descendre | appui |
| d | 150 | 71 | Source0 | appui |
| d | 150 | 71 | Source0_fb | retour |
| d | 151 | 72 | Source1 | appui |
| d | 151 | 72 | Source1_fb | retour |
| d | 152 | 73 | Source2 | appui |
| d | 152 | 73 | Source2_fb | retour |
| d | 153 | 74 | Source3 | appui |
| d | 153 | 74 | Source3_fb | retour |
| d | 154 | 75 | Source4 | appui |
| d | 154 | 75 | Source4_fb | retour |
| d | 155 | 76 | Musique | appui |
| d | 155 | 76 | Musique_fb | retour |
| d | 156 | 77 | Audio_Suit_Video | appui |
| d | 156 | 77 | Audio_Suit_Video_fb | retour |
| d | 157 | 78 | Lamelles07_Horaire | appui |
| d | 158 | 79 | Lamelles07_Stop | appui |
| d | 159 | 80 | Lamelles07_Antihoraire | appui |
| d | 160 | 81 | Lamelles08_Horaire | appui |
| d | 161 | 82 | Lamelles08_Stop | appui |
| d | 162 | 83 | Lamelles08_Antihoraire | appui |
| d | 163 | 84 | Lamelles09_Horaire | appui |
| d | 164 | 85 | Lamelles09_Stop | appui |
| d | 165 | 86 | Lamelles09_Antihoraire | appui |
| d | 166 | 87 | Lamelles10_Horaire | appui |
| d | 167 | 88 | Lamelles10_Stop | appui |
| d | 168 | 89 | Lamelles10_Antihoraire | appui |
| d | 169 | 90 | Lamelles11_Horaire | appui |
| d | 170 | 91 | Lamelles11_Stop | appui |
| d | 171 | 92 | Lamelles11_Antihoraire | appui |
| d | 172 | 93 | Lamelles12_Horaire | appui |
| d | 173 | 94 | Lamelles12_Stop | appui |
| d | 174 | 95 | Lamelles12_Antihoraire | appui |
| d | 200 | 96 | AV_Off | appui |
| d | 200 | 96 | AV_Off_fb | retour |
| d | 201 | 97 | Scene_Stores1 | appui |
| d | 201 | 97 | Scene_Stores1_fb | retour |
| d | 202 | 98 | Scene_Stores2 | appui |
| d | 202 | 98 | Scene_Stores2_fb | retour |
| d | 203 | 99 | Scene_Stores3 | appui |
| d | 203 | 99 | Scene_Stores3_fb | retour |
| d | 204 | 100 | Scene_Stores4 | appui |
| d | 204 | 100 | Scene_Stores4_fb | retour |
| d | 251 | 101 | Media_LecturePause | appui |
| d | 252 | 102 | Media_Suivant | appui |
| d | 253 | 103 | Media_Precedent | appui |
| d | 421 | 104 | Scene1_Memorisee_fb | retour |
| d | 422 | 105 | Scene2_Memorisee_fb | retour |
| d | 423 | 106 | Scene3_Memorisee_fb | retour |
| d | 424 | 107 | Scene4_Memorisee_fb | retour |
| d | 431 | 108 | Scene1_Memoriser | appui |
| d | 432 | 109 | Scene2_Memoriser | appui |
| d | 433 | 110 | Scene3_Memoriser | appui |
| d | 434 | 111 | Scene4_Memoriser | appui |
| d | 610 | 112 | CVC_Marche | appui |
| d | 610 | 112 | CVC_Marche_fb | retour |
| d | 611 | 113 | CVC_Arret | appui |
| d | 611 | 113 | CVC_Arret_fb | retour |
| d | 612 | 114 | Ventilation0 | appui |
| d | 612 | 114 | Ventilation0_fb | retour |
| d | 613 | 115 | Ventilation1 | appui |
| d | 613 | 115 | Ventilation1_fb | retour |
| d | 614 | 116 | Ventilation2 | appui |
| d | 614 | 116 | Ventilation2_fb | retour |
| d | 615 | 117 | Ventilation3 | appui |
| d | 615 | 117 | Ventilation3_fb | retour |
| d | 620 | 118 | Sauna_Marche | appui |
| d | 620 | 118 | Sauna_Marche_fb | retour |
| d | 621 | 119 | Sauna_Arret | appui |
| d | 621 | 119 | Sauna_Arret_fb | retour |
| d | 622 | 120 | Sauna_Plus | appui |
| d | 623 | 121 | Sauna_Moins | appui |
| d | 624 | 122 | Hammam_Marche | appui |
| d | 624 | 122 | Hammam_Marche_fb | retour |
| d | 625 | 123 | Hammam_Arret | appui |
| d | 625 | 123 | Hammam_Arret_fb | retour |
| d | 626 | 124 | Hammam_Plus | appui |
| d | 627 | 125 | Hammam_Moins | appui |
| s | 32 | 2 | Temperature_txt | retour |
| s | 33 | 3 | CVC_Mode_txt | retour |
| s | 34 | 4 | Consigne_txt | retour |
| s | 62 | 5 | Sauna_Consigne_txt | retour |
| s | 63 | 6 | Hammam_Consigne_txt | retour |
| s | 64 | 7 | Sauna_Mesure_txt | retour |
| s | 65 | 8 | Hammam_Mesure_txt | retour |

## Signaux à câbler aux pilotes (joins vides), par pièce

Sorties des modules : `PILOTE_CVC_Marche`, `PILOTE_Sauna_Marche`, `PILOTE_Hammam_Marche`, `PILOTE_Mute`, `PILOTE_Musique`, `PILOTE_AV_Off`, `PILOTE_Media_LecturePause`, `PILOTE_Media_Suivant`, `PILOTE_Media_Precedent`, `PILOTE_Scene1`, `PILOTE_Scene2`, `PILOTE_Scene3`, `PILOTE_Scene4`, `PILOTE_Moteur01_Monter`, `PILOTE_Moteur02_Monter`, `PILOTE_Moteur03_Monter`, `PILOTE_Moteur04_Monter`, `PILOTE_Moteur05_Monter`, `PILOTE_Moteur06_Monter`, `PILOTE_Moteur07_Monter`, `PILOTE_Moteur08_Monter`, `PILOTE_Moteur09_Monter`, `PILOTE_Moteur10_Monter`, `PILOTE_Moteur11_Monter`, `PILOTE_Moteur12_Monter`, `PILOTE_Moteur01_Stop`, `PILOTE_Moteur02_Stop`, `PILOTE_Moteur03_Stop`, `PILOTE_Moteur04_Stop`, `PILOTE_Moteur05_Stop`, `PILOTE_Moteur06_Stop`, `PILOTE_Moteur07_Stop`, `PILOTE_Moteur08_Stop`, `PILOTE_Moteur09_Stop`, `PILOTE_Moteur10_Stop`, `PILOTE_Moteur11_Stop`, `PILOTE_Moteur12_Stop`, `PILOTE_Moteur01_Descendre`, `PILOTE_Moteur02_Descendre`, `PILOTE_Moteur03_Descendre`, `PILOTE_Moteur04_Descendre`, `PILOTE_Moteur05_Descendre`, `PILOTE_Moteur06_Descendre`, `PILOTE_Moteur07_Descendre`, `PILOTE_Moteur08_Descendre`, `PILOTE_Moteur09_Descendre`, `PILOTE_Moteur10_Descendre`, `PILOTE_Moteur11_Descendre`, `PILOTE_Moteur12_Descendre`, `PILOTE_Lamelles01_Horaire`, `PILOTE_Lamelles02_Horaire`, `PILOTE_Lamelles03_Horaire`, `PILOTE_Lamelles04_Horaire`, `PILOTE_Lamelles05_Horaire`, `PILOTE_Lamelles06_Horaire`, `PILOTE_Lamelles07_Horaire`, `PILOTE_Lamelles08_Horaire`, `PILOTE_Lamelles09_Horaire`, `PILOTE_Lamelles10_Horaire`, `PILOTE_Lamelles11_Horaire`, `PILOTE_Lamelles12_Horaire`, `PILOTE_Lamelles01_Stop`, `PILOTE_Lamelles02_Stop`, `PILOTE_Lamelles03_Stop`, `PILOTE_Lamelles04_Stop`, `PILOTE_Lamelles05_Stop`, `PILOTE_Lamelles06_Stop`, `PILOTE_Lamelles07_Stop`, `PILOTE_Lamelles08_Stop`, `PILOTE_Lamelles09_Stop`, `PILOTE_Lamelles10_Stop`, `PILOTE_Lamelles11_Stop`, `PILOTE_Lamelles12_Stop`, `PILOTE_Lamelles01_Antihoraire`, `PILOTE_Lamelles02_Antihoraire`, `PILOTE_Lamelles03_Antihoraire`, `PILOTE_Lamelles04_Antihoraire`, `PILOTE_Lamelles05_Antihoraire`, `PILOTE_Lamelles06_Antihoraire`, `PILOTE_Lamelles07_Antihoraire`, `PILOTE_Lamelles08_Antihoraire`, `PILOTE_Lamelles09_Antihoraire`, `PILOTE_Lamelles10_Antihoraire`, `PILOTE_Lamelles11_Antihoraire`, `PILOTE_Lamelles12_Antihoraire`, `PILOTE_Groupe_Volets_Ouvrir`, `PILOTE_Groupe_Volets_Demi`, `PILOTE_Groupe_Volets_Fermer`, `PILOTE_Groupe_Rideaux_Ouvrir`, `PILOTE_Groupe_Rideaux_Demi`, `PILOTE_Groupe_Rideaux_Fermer`, `PILOTE_Groupe_Stores_Ouvrir`, `PILOTE_Groupe_Stores_Demi`, `PILOTE_Groupe_Stores_Fermer`, `PILOTE_Scene_Stores1`, `PILOTE_Scene_Stores2`, `PILOTE_Scene_Stores3`, `PILOTE_Scene_Stores4`, `PILOTE_Consigne`, `PILOTE_Ventilation`, `PILOTE_Sauna_Consigne`, `PILOTE_Hammam_Consigne`, `PILOTE_Source`, `PILOTE_Volume`, `PILOTE_Volume_Media`, `PILOTE_Circuit01`, `PILOTE_Circuit02`, `PILOTE_Circuit03`, `PILOTE_Circuit04`, `PILOTE_Circuit05`, `PILOTE_Circuit06`, `PILOTE_Circuit07`, `PILOTE_Circuit08`, `PILOTE_Circuit09`, `PILOTE_Circuit10`, `PILOTE_Circuit11`, `PILOTE_Circuit12`, `PILOTE_Circuit13`, `PILOTE_Circuit14`, `PILOTE_Circuit15`, `PILOTE_Circuit16`, `PILOTE_Circuit17`, `PILOTE_Circuit18`, `PILOTE_Circuit19`, `PILOTE_Circuit20`.

Entrées des modules (retours des pilotes, facultatifs) : `RETOUR_Temperature`, `RETOUR_Sauna_Mesure`, `RETOUR_Hammam_Mesure`, `RETOUR_CVC_Mode`, `RETOUR_Circuit01`, `RETOUR_Circuit02`, `RETOUR_Circuit03`, `RETOUR_Circuit04`, `RETOUR_Circuit05`, `RETOUR_Circuit06`, `RETOUR_Circuit07`, `RETOUR_Circuit08`, `RETOUR_Circuit09`, `RETOUR_Circuit10`, `RETOUR_Circuit11`, `RETOUR_Circuit12`, `RETOUR_Circuit13`, `RETOUR_Circuit14`, `RETOUR_Circuit15`, `RETOUR_Circuit16`, `RETOUR_Circuit17`, `RETOUR_Circuit18`, `RETOUR_Circuit19`, `RETOUR_Circuit20`.

## Global

Alarme, partitions, centralisation : module `VillaGlobal.usp`. Télécommandes : joins globaux inchangés (`TELECOMMANDE_*`), pièce émettrice sur l'analogique 241 (`TELECOMMANDE_Piece`).

Signaux : 5664 ; symboles de dalle : 19 ; modules SIMPL+ : 16.
