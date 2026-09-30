# La Réserve Genève — contrat de joins (généré par tools/build.py, ne pas éditer)

Les numéros sont ceux des symboles Crestron App des programmes SIMPL existants : le CH5 remplace le panneau VT Pro
sans C#. Seule modification SIMPL : les sources et « Power Off » passaient par le smart object 1 (Icon List
Horizontal) ; ils sont déplacés sur des joins digitaux libres du panneau (colonne « Signal SIMPL »).

## Bar — Reserve Bar prg06.smw, Bar Lounge (Crestron App), IP-ID 0x04

| Type | Join | Fonction | Signal SIMPL / action |
|---|---|---|---|
| Digital | 1 | Connecté (retour) |  |
| Digital | 3 | Extinction en cours (retour) |  |
| Digital | 10 | Bar vers Fenêtre Vol + (maintien) | BarL |
| Digital | 11 | Bar vers Fenêtre Vol − (maintien) |  |
| Digital | 12 | Bar vers Fenêtre Mute (appui) / Is_Mute (retour) |  |
| Digital | 14 | Bar vers Entrée Vol + (maintien) | BarR |
| Digital | 15 | Bar vers Entrée Vol − (maintien) |  |
| Digital | 16 | Bar vers Entrée Mute (appui) / Is_Mute (retour) |  |
| Digital | 18 | Lobby Vol + (maintien) | Lobby |
| Digital | 19 | Lobby Vol − (maintien) |  |
| Digital | 20 | Lobby Mute (appui) / Is_Mute (retour) |  |
| Digital | 22 | WC Vol + (maintien) | WC |
| Digital | 23 | WC Vol − (maintien) |  |
| Digital | 24 | WC Mute (appui) / Is_Mute (retour) |  |
| Digital | 26 | Fumoir Vol + (maintien) | Fumoir |
| Digital | 27 | Fumoir Vol − (maintien) |  |
| Digital | 28 | Fumoir Mute (appui) / Is_Mute (retour) |  |
| Digital | 30 | Le Loft Vol + (maintien) | Restaurant |
| Digital | 31 | Le Loft Vol − (maintien) |  |
| Digital | 32 | Le Loft Mute (appui) / Is_Mute (retour) |  |
| Digital | 34 | Terrasse Bar Vol + (maintien) | Terrasse/Bar |
| Digital | 35 | Terrasse Bar Vol − (maintien) |  |
| Digital | 36 | Terrasse Bar Mute (appui) / Is_Mute (retour) |  |
| Digital | 38 | Tsé-Fong Vol + (maintien) | tsefong |
| Digital | 39 | Tsé-Fong Vol − (maintien) |  |
| Digital | 40 | Tsé-Fong Mute (appui) / Is_Mute (retour) |  |
| Digital | 42 | Salon 1 Vol + (maintien) | Salon1 |
| Digital | 43 | Salon 1 Vol − (maintien) |  |
| Digital | 44 | Salon 1 Mute (appui) / Is_Mute (retour) |  |
| Digital | 46 | Salon 2 Vol + (maintien) | Salon2 |
| Digital | 47 | Salon 2 Vol − (maintien) |  |
| Digital | 48 | Salon 2 Mute (appui) / Is_Mute (retour) |  |
| Digital | 50 | Terrasse Tsé-Fong Vol + (maintien) | Terrasse2 |
| Digital | 51 | Terrasse Tsé-Fong Vol − (maintien) |  |
| Digital | 52 | Terrasse Tsé-Fong Mute (appui) / Is_Mute (retour) |  |
| Digital | 54 | Annuler |  |
| Digital | 55 | Éteindre (confirmer) |  |
| Digital | 56 | Confirmation d'extinction affichée (retour) |  |
| Digital | 57 | Fermer / Exit (Reset_Subpage) |  |
| Digital | 61 | Page « Rez-de-chaussée » (appui) |  |
| Digital | 62 | Page « Sous-sol » (appui) |  |
| Digital | 63 | Page « Rez-de-chaussée » (retour) |  |
| Digital | 64 | Page « Sous-sol » (retour) |  |
| Digital | 66 | Le Loft Fond Vol + (maintien) | Lotti |
| Digital | 67 | Le Loft Fond Vol − (maintien) |  |
| Digital | 68 | Le Loft Fond Mute (appui) / Is_Mute (retour) |  |
| Digital | 71 | Distribute « All Bar » |  |
| Digital | 72 | Distribute « Lobby & WC » |  |
| Digital | 73 | Distribute « Fumoir » |  |
| Digital | 74 | Distribute « Le Loft » |  |
| Digital | 75 | Distribute « Terrasse Bar » |  |
| Digital | 76 | Distribute « Tsé-Fong » |  |
| Digital | 77 | Distribute « Salon 1 » |  |
| Digital | 78 | Distribute « Salon 2 » |  |
| Digital | 79 | Distribute « Terrasse Tsé-Fong » |  |
| Digital | 80 | Source « Airplay Bar » (appui) | Ipad_1_Input_2 — à déplacer depuis le smart object 1, élément 1 |
| Digital | 81 | Source « DJ » (appui) | Ipad_1_Input_3 — à déplacer depuis le smart object 1, élément 2 |
| Digital | 82 | Source « Lecteur radio » (appui) | Ipad_1_Input_4 — à déplacer depuis le smart object 1, élément 3 |
| Digital | 83 | Source « Music Bar Lounge » (appui) | Ipad_1_Input_1 — à déplacer depuis le smart object 1, élément 4 |
| Digital | 84 | Tout éteindre (demande) | Ipad_1_Power_Off — à déplacer depuis le smart object, élément 5 |
| Digital | 90 | Off « All Bar » |  |
| Digital | 91 | Off « Lobby & WC » |  |
| Digital | 92 | Off « Fumoir » |  |
| Digital | 93 | Off « Le Loft » |  |
| Digital | 94 | Off « Terrasse Bar » |  |
| Digital | 95 | Off « Terrasse Tsé-Fong » |  |
| Digital | 96 | Off « Salon 1 » |  |
| Digital | 97 | Off « Salon 2 » |  |
| Digital | 98 | Off « Tsé-Fong » |  |
| Analogique | 1 | Bar vers Fenêtre niveau (retour) |  |
| Analogique | 2 | Bar vers Entrée niveau (retour) |  |
| Analogique | 3 | Lobby niveau (retour) |  |
| Analogique | 4 | WC niveau (retour) |  |
| Analogique | 5 | Fumoir niveau (retour) |  |
| Analogique | 6 | Le Loft niveau (retour) |  |
| Analogique | 7 | Terrasse Bar niveau (retour) |  |
| Analogique | 8 | Tsé-Fong niveau (retour) |  |
| Analogique | 9 | Salon 1 niveau (retour) |  |
| Analogique | 10 | Salon 2 niveau (retour) |  |
| Analogique | 11 | Terrasse Tsé-Fong niveau (retour) |  |
| Analogique | 12 | Le Loft Fond niveau (retour) |  |
| Analogique | 15 | Progression de l'extinction (retour) |  |
| Sériel | 1 | Source du groupe « All Bar » (texte) |  |
| Sériel | 2 | Source du groupe « Lobby & WC » (texte) |  |
| Sériel | 3 | Source du groupe « Fumoir » (texte) |  |
| Sériel | 4 | Source du groupe « Le Loft » (texte) |  |
| Sériel | 5 | Source du groupe « Terrasse Bar » (texte) |  |
| Sériel | 6 | Source du groupe « Terrasse Tsé-Fong » (texte) |  |
| Sériel | 7 | Source du groupe « Salon 1 » (texte) |  |
| Sériel | 8 | Source du groupe « Salon 2 » (texte) |  |
| Sériel | 9 | Source du groupe « Tsé-Fong » (texte) |  |
| Sériel | 15 | Source sélectionnée (texte) |  |

## Fitness — Reserve prg005.smw, Fitness (Crestron App), IP-ID 0x04

| Type | Join | Fonction | Signal SIMPL / action |
|---|---|---|---|
| Digital | 1 | Connecté (retour) |  |
| Digital | 7 | Off « Fonctional Zone » |  |
| Digital | 8 | Off « Accueil Cardio » |  |
| Digital | 9 | Off « Musculation » |  |
| Digital | 10 | Off « Kinesis » |  |
| Digital | 11 | Off « Room CC » |  |
| Digital | 15 | Distribute « Fonctional Zone » |  |
| Digital | 16 | Distribute « Kinesis » |  |
| Digital | 17 | Distribute « Accueil Cardio » |  |
| Digital | 18 | Distribute « Room CC » |  |
| Digital | 19 | Distribute « Musculation » |  |
| Digital | 25 | Fonctional Zone Vol + (maintien) | Fitness |
| Digital | 26 | Fonctional Zone Vol − (maintien) |  |
| Digital | 27 | Fonctional Zone Mute (appui) / Is_Mute (retour) |  |
| Digital | 29 | Room CC Vol + (maintien) | Salle_TV |
| Digital | 30 | Room CC Vol − (maintien) |  |
| Digital | 31 | Room CC Mute (appui) / Is_Mute (retour) |  |
| Digital | 33 | Kinesis Vol + (maintien) | Kinesis |
| Digital | 34 | Kinesis Vol − (maintien) |  |
| Digital | 35 | Kinesis Mute (appui) / Is_Mute (retour) |  |
| Digital | 37 | Accueil Cardio Vol + (maintien) | Accueil |
| Digital | 38 | Accueil Cardio Vol − (maintien) |  |
| Digital | 39 | Accueil Cardio Mute (appui) / Is_Mute (retour) |  |
| Digital | 41 | Musculation Vol + (maintien) | Sport |
| Digital | 42 | Musculation Vol − (maintien) |  |
| Digital | 43 | Musculation Mute (appui) / Is_Mute (retour) |  |
| Digital | 50 | Éteindre (confirmer) |  |
| Digital | 51 | Annuler |  |
| Digital | 52 | Confirmation d'extinction affichée (retour) |  |
| Digital | 55 | Fermer / Exit (Reset_Subpage) |  |
| Digital | 61 | Source « Airplay Room CC » (appui) | Ipad_1_Input_4 — à déplacer depuis le smart object 1, élément 1 |
| Digital | 62 | Source « Airplay Fonctional Zone » (appui) | Ipad_1_Input_1 — à déplacer depuis le smart object 1, élément 2 |
| Digital | 63 | Source « Airplay Kinesis » (appui) | Ipad_1_Input_3 — à déplacer depuis le smart object 1, élément 3 |
| Digital | 64 | Source « Laptop Reception » (appui) | Ipad_1_Input_2 — à déplacer depuis le smart object 1, élément 4 |
| Digital | 65 | Source « Music Bar Lounge » (appui) | Ipad_1_Input_5 — à déplacer depuis le smart object 1, élément 5 |
| Digital | 66 | Tout éteindre (demande) | Ipad_1_Power_Off — à déplacer depuis le smart object, élément 6 |
| Analogique | 1 | Fonctional Zone niveau (retour) |  |
| Analogique | 2 | Accueil Cardio niveau (retour) |  |
| Analogique | 3 | Room CC niveau (retour) |  |
| Analogique | 4 | Kinesis niveau (retour) |  |
| Analogique | 5 | Musculation niveau (retour) |  |
| Sériel | 1 | Source sélectionnée (texte) |  |
| Sériel | 5 | Source du groupe « Fonctional Zone » (texte) |  |
| Sériel | 6 | Source du groupe « Room CC » (texte) |  |
| Sériel | 7 | Source du groupe « Accueil Cardio » (texte) |  |
| Sériel | 8 | Source du groupe « Musculation » (texte) |  |
| Sériel | 9 | Source du groupe « Kinesis » (texte) |  |

## Lodge — Reserve Bar prg06.smw, Crestron App (LA_RESERVE_LODGE_01), IP-ID 0x05

| Type | Join | Fonction | Signal SIMPL / action |
|---|---|---|---|
| Digital | 1 | Connecté (retour) |  |
| Digital | 3 | Extinction en cours (retour) |  |
| Digital | 10 | Lodge Left Vol + (maintien) | LodgeL |
| Digital | 11 | Lodge Left Vol − (maintien) |  |
| Digital | 12 | Lodge Left Mute (appui) / Is_Mute (retour) |  |
| Digital | 14 | Lodge Right Vol + (maintien) | LodgeR |
| Digital | 15 | Lodge Right Vol − (maintien) |  |
| Digital | 16 | Lodge Right Mute (appui) / Is_Mute (retour) |  |
| Digital | 18 | Pool Vol + (maintien) | Pool |
| Digital | 19 | Pool Vol − (maintien) |  |
| Digital | 20 | Pool Mute (appui) / Is_Mute (retour) |  |
| Digital | 22 | Exterior Vol + (maintien) | Exterior |
| Digital | 23 | Exterior Vol − (maintien) |  |
| Digital | 24 | Exterior Mute (appui) / Is_Mute (retour) |  |
| Digital | 26 | Exterior Sub Vol + (maintien) | ExteriorSub |
| Digital | 27 | Exterior Sub Vol − (maintien) |  |
| Digital | 28 | Exterior Sub Mute (appui) / Is_Mute (retour) |  |
| Digital | 30 | Micro Vol + (maintien) | Micro |
| Digital | 31 | Micro Vol − (maintien) |  |
| Digital | 32 | Micro Mute (appui) / Is_Mute (retour) |  |
| Digital | 54 | Annuler |  |
| Digital | 55 | Éteindre (confirmer) |  |
| Digital | 56 | Confirmation d'extinction affichée (retour) |  |
| Digital | 57 | Fermer / Exit (Reset_Subpage) |  |
| Digital | 61 | Source « iPad Lodge » (appui) | Ipad_2_Input_1 — à déplacer depuis le smart object 1, élément 1 |
| Digital | 62 | Source « DJ Left » (appui) | Ipad_2_Input_2 — à déplacer depuis le smart object 1, élément 2 |
| Digital | 63 | Source « DJ Right » (appui) | Ipad_2_Input_3 — à déplacer depuis le smart object 1, élément 3 |
| Digital | 64 | Source « Sound of the Bar » (appui) | Ipad_2_Input_4 — à déplacer depuis le smart object 1, élément 4 |
| Digital | 65 | Tout éteindre (demande) | Ipad_2_Power_Off — à déplacer depuis le smart object, élément 5 |
| Digital | 71 | Distribute « Lodge Left » |  |
| Digital | 72 | Distribute « Lodge Right » |  |
| Digital | 73 | Distribute « Pool » |  |
| Digital | 74 | Distribute « Exterior » |  |
| Digital | 90 | Off « Lodge Left » |  |
| Digital | 91 | Off « Lodge Right » |  |
| Digital | 92 | Off « Pool » |  |
| Digital | 93 | Off « Exterior » |  |
| Analogique | 1 | Lodge Left niveau (retour) |  |
| Analogique | 2 | Lodge Right niveau (retour) |  |
| Analogique | 3 | Pool niveau (retour) |  |
| Analogique | 4 | Exterior niveau (retour) |  |
| Analogique | 5 | Exterior Sub niveau (retour) |  |
| Analogique | 6 | Micro niveau (retour) |  |
| Analogique | 15 | Progression de l'extinction (retour) |  |
| Sériel | 1 | Source du groupe « Lodge Left » (texte) |  |
| Sériel | 2 | Source du groupe « Lodge Right » (texte) |  |
| Sériel | 3 | Source du groupe « Pool » (texte) |  |
| Sériel | 4 | Source du groupe « Exterior » (texte) |  |
| Sériel | 15 | Source sélectionnée (texte) |  |

