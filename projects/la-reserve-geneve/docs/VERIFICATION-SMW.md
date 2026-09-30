# Vérification des joins contre les programmes SIMPL (généré par tools/verifier_smw.py)

**Aucun écart.** Les libellés de zones (Le Loft = signal Restaurant, Le Loft Fond = Lotti) restent à confirmer au Debugger.

## Bar — Reserve Bar prg06.smw IP-ID 0x04

| Contrôle | Join | Signal trouvé | Résultat |
|---|---|---|---|
| Source Airplay Bar : join libre | b80 | — | OK |
| Source DJ : join libre | b81 | — | OK |
| Source iPod : join libre | b82 | — | OK |
| Source Music Bar Lounge : join libre | b83 | — | OK |
| Tout éteindre : join libre | b84 | — | OK |
| Confirmation (retour) | b56 | Ipad_1_Power_Off_INT | OK |
| Éteindre | b55 | Ipad_1_General_Off | OK |
| Annuler | b54 | Ipad_1_General_Off_Cancel | OK |
| Fermer (Exit) | b57 | Ipad_1_Reset_Subpage | OK |
| Occupé (retour) | b3 | Busy_General_Off | OK |
| Progression (retour) | n15 | Busy_General_Off_Analog | OK |
| Source sélectionnée (texte) | s15 | Ipad_1_Source_Select | OK |
| Page Rez-de-chaussée | b61 | Ipad_1_Distrib_Zone_Rez | OK |
| Distribute Tsé-Fong | b76 | Ipad_1_Distrib_Tsefong | OK |
| Off Tsé-Fong | b98 | Ipad_1_Power_Off_Tsé-Fong | OK |
| Source du groupe Tsé-Fong | s9 | Source_Select_Tsé-Fong | OK |
| Tsé-Fong Vol + | b38 | Ipad_1_tsefong_Vol_+ | OK |
| Tsé-Fong Vol − | b39 | Ipad_1_tsefong_Vol_- | OK |
| Tsé-Fong Mute | b40 | Ipad_1_tsefong_Mute | OK |
| Tsé-Fong Is_Mute | b40 | tsefong_Is_Mute | OK |
| Tsé-Fong niveau | n8 | tsefong_Vol | OK |
| Distribute Salon 1 | b77 | Ipad_1_Distrib_Salon1 | OK |
| Off Salon 1 | b96 | Ipad_1_Power_Off_Salon_1 | OK |
| Source du groupe Salon 1 | s7 | Source_Select_Salon_1 | OK |
| Salon 1 Vol + | b42 | Ipad_1_Salon1_Vol_+ | OK |
| Salon 1 Vol − | b43 | Ipad_1_Salon1_Vol_- | OK |
| Salon 1 Mute | b44 | Ipad_1_Salon1_Mute | OK |
| Salon 1 Is_Mute | b44 | Salon1_Is_Mute | OK |
| Salon 1 niveau | n9 | Salon1_Vol | OK |
| Distribute Salon 2 | b78 | Ipad_1_Distrib_Salon2 | OK |
| Off Salon 2 | b97 | Ipad_1_Power_Off_Salon_2 | OK |
| Source du groupe Salon 2 | s8 | Source_Select_Salon_2 | OK |
| Salon 2 Vol + | b46 | Ipad_1_Salon2_Vol_+ | OK |
| Salon 2 Vol − | b47 | Ipad_1_Salon2_Vol_- | OK |
| Salon 2 Mute | b48 | Ipad_1_Salon2_Mute | OK |
| Salon 2 Is_Mute | b48 | Salon2_Is_Mute | OK |
| Salon 2 niveau | n10 | Salon2_Vol | OK |
| Distribute Terrasse Tsé-Fong | b79 | Ipad_1_Distrib_Terrasse2 | OK |
| Off Terrasse Tsé-Fong | b95 | Ipad_1_Power_Off_Terrasse2 | OK |
| Source du groupe Terrasse Tsé-Fong | s6 | Source_Select_Terrasse2 | OK |
| Terrasse Tsé-Fong Vol + | b50 | Ipad_1_Terrasse2_Vol_+ | OK |
| Terrasse Tsé-Fong Vol − | b51 | Ipad_1_Terrasse2_Vol_- | OK |
| Terrasse Tsé-Fong Mute | b52 | Ipad_1_Terrasse2_Mute | OK |
| Terrasse Tsé-Fong Is_Mute | b52 | Terrasse2_Is_Mute | OK |
| Terrasse Tsé-Fong niveau | n11 | Terrasse2_Vol | OK |
| Page Sous-sol | b62 | Ipad_1_Distrib_Zone_Sous-sol | OK |
| Distribute All Bar | b71 | Ipad_1_Distrib_Bar | OK |
| Off All Bar | b90 | Ipad_1_Power_Off_Bar | OK |
| Source du groupe All Bar | s1 | Source_Select_Bar | OK |
| Bar vers Fenêtre Vol + | b10 | Ipad_1_BarL_Vol_+ | OK |
| Bar vers Fenêtre Vol − | b11 | Ipad_1_BarL_Vol_- | OK |
| Bar vers Fenêtre Mute | b12 | Ipad_1_BarL_Mute | OK |
| Bar vers Fenêtre Is_Mute | b12 | BarL_Is_Mute | OK |
| Bar vers Fenêtre niveau | n1 | BarL_Vol | OK |
| Bar vers Entrée Vol + | b14 | Ipad_1_BarR_Vol_+ | OK |
| Bar vers Entrée Vol − | b15 | Ipad_1_BarR_Vol_- | OK |
| Bar vers Entrée Mute | b16 | Ipad_1_BarR_Mute | OK |
| Bar vers Entrée Is_Mute | b16 | BarR_Is_Mute | OK |
| Bar vers Entrée niveau | n2 | BarR_Vol | OK |
| Distribute Lobby & WC | b72 | Ipad_1_Distrib_Lobby/WC | OK |
| Off Lobby & WC | b91 | Ipad_1_Power_Off_Lobby/WC | OK |
| Source du groupe Lobby & WC | s2 | Source_Select_Lobby/wc | OK |
| Lobby Vol + | b18 | Ipad_1_Lobby_Vol_+ | OK |
| Lobby Vol − | b19 | Ipad_1_Lobby_Vol_- | OK |
| Lobby Mute | b20 | Ipad_1_Lobby_Mute | OK |
| Lobby Is_Mute | b20 | Lobby_Is_Mute | OK |
| Lobby niveau | n3 | Lobby_Vol | OK |
| WC Vol + | b22 | Ipad_1_WC_Vol_+ | OK |
| WC Vol − | b23 | Ipad_1_WC_Vol_- | OK |
| WC Mute | b24 | Ipad_1_WC_Mute | OK |
| WC Is_Mute | b24 | WC_Is_Mute | OK |
| WC niveau | n4 | WC_Vol | OK |
| Distribute Le Loft | b74 | Ipad_1_Distrib_Restaurant | OK |
| Off Le Loft | b93 | Ipad_1_Power_Off_Restaurant | OK |
| Source du groupe Le Loft | s4 | Source_Select_Restaurant | OK |
| Le Loft Vol + | b30 | Ipad_1_Restaurant_Vol_+ | OK |
| Le Loft Vol − | b31 | Ipad_1_Restaurant_Vol_- | OK |
| Le Loft Mute | b32 | Ipad_1_Restaurant_Mute | OK |
| Le Loft Is_Mute | b32 | Restaurant_Is_Mute | OK |
| Le Loft niveau | n6 | Restaurant_Vol | OK |
| Le Loft Fond Vol + | b66 | Ipad_1_Lotti_Vol_+ | OK |
| Le Loft Fond Vol − | b67 | Ipad_1_Lotti_Vol_- | OK |
| Le Loft Fond Mute | b68 | Ipad_1_Lotti_Mute | OK |
| Le Loft Fond Is_Mute | b68 | Lotti_Is_Mute | OK |
| Le Loft Fond niveau | n12 | Lotti_Vol | OK |
| Distribute Fumoir | b73 | Ipad_1_Distrib_Fumoir | OK |
| Off Fumoir | b92 | Ipad_1_Power_Off_Fumoir | OK |
| Source du groupe Fumoir | s3 | Source_Select_Fumoir | OK |
| Fumoir Vol + | b26 | Ipad_1_Fumoir_Vol_+ | OK |
| Fumoir Vol − | b27 | Ipad_1_Fumoir_Vol_- | OK |
| Fumoir Mute | b28 | Ipad_1_Fumoir_Mute | OK |
| Fumoir Is_Mute | b28 | Fumoir_Is_Mute | OK |
| Fumoir niveau | n5 | Fumoir_Vol | OK |
| Distribute Terrasse Bar | b75 | Ipad_1_Distrib_Terrasse/Bar | OK |
| Off Terrasse Bar | b94 | Ipad_1_Power_Off_Terrasse/Bar | OK |
| Source du groupe Terrasse Bar | s5 | Source_Select_Terrasse/Bar | OK |
| Terrasse Bar Vol + | b34 | Ipad_1_Terrasse/Bar_Vol_+ | OK |
| Terrasse Bar Vol − | b35 | Ipad_1_Terrasse/Bar_Vol_- | OK |
| Terrasse Bar Mute | b36 | Ipad_1_Terrasse/Bar_Mute | OK |
| Terrasse Bar Is_Mute | b36 | Terrasse/Bar_Is_Mute | OK |
| Terrasse Bar niveau | n7 | Terrasse/Bar_Vol | OK |

## Fitness — Reserve prg005.smw IP-ID 0x04

| Contrôle | Join | Signal trouvé | Résultat |
|---|---|---|---|
| Source Airplay Room CC : join libre | b61 | — | OK |
| Source Airplay Fonctional Zone : join libre | b62 | — | OK |
| Source Airplay Kinesis : join libre | b63 | — | OK |
| Source Laptop Reception : join libre | b64 | — | OK |
| Source Music Bar Lounge : join libre | b65 | — | OK |
| Tout éteindre : join libre | b66 | — | OK |
| Confirmation (retour) | b52 | Ipad_1_Power_Off_INT | OK |
| Éteindre | b50 | Ipad_1_General_Off | OK |
| Annuler | b51 | Ipad_1_General_Off_Cancel | OK |
| Fermer (Exit) | b55 | Ipad_1_Reset_Subpage | OK |
| Source sélectionnée (texte) | s1 | Ipad_1_Source_Select | OK |
| Distribute Accueil Cardio | b17 | Ipad_1_Distrib_Accueil | OK |
| Off Accueil Cardio | b8 | Ipad_1_Power_Off_Accueil | OK |
| Source du groupe Accueil Cardio | s7 | Source_Select_Accueil | OK |
| Accueil Cardio Vol + | b37 | Ipad_1_Accueil_Vol_+ | OK |
| Accueil Cardio Vol − | b38 | Ipad_1_Accueil_Vol_- | OK |
| Accueil Cardio Mute | b39 | Ipad_1_Accueil_Mute | OK |
| Accueil Cardio Is_Mute | b39 | Accueil_Is_Mute | OK |
| Accueil Cardio niveau | n2 | Accueil_Vol | OK |
| Distribute Fonctional Zone | b15 | Ipad_1_Distrib_Fitness | OK |
| Off Fonctional Zone | b7 | Ipad_1_Power_Off_Fitness | OK |
| Source du groupe Fonctional Zone | s5 | Source_Select_Fitness | OK |
| Fonctional Zone Vol + | b25 | Ipad_1_Fitness_Vol_+ | OK |
| Fonctional Zone Vol − | b26 | Ipad_1_Fitness_Vol_- | OK |
| Fonctional Zone Mute | b27 | Ipad_1_Fitness_Mute | OK |
| Fonctional Zone Is_Mute | b27 | Fitness_Is_Mute | OK |
| Fonctional Zone niveau | n1 | Fitness_Vol | OK |
| Distribute Room CC | b18 | Ipad_1_Distrib_Salle_TV | OK |
| Off Room CC | b11 | Ipad_1_Power_Off_Salle_TV | OK |
| Source du groupe Room CC | s6 | Source_Select_Salle_TV | OK |
| Room CC Vol + | b29 | Ipad_1_Salle_TV_Vol_+ | OK |
| Room CC Vol − | b30 | Ipad_1_Salle_TV_Vol_- | OK |
| Room CC Mute | b31 | Ipad_1_Salle_TV_Mute | OK |
| Room CC Is_Mute | b31 | Salle_TV_Is_Mute | OK |
| Room CC niveau | n3 | Salle_TV_Vol | OK |
| Distribute Kinesis | b16 | Ipad_1_Distrib_Kinesis | OK |
| Off Kinesis | b10 | Ipad_1_Power_Off_Kinesis | OK |
| Source du groupe Kinesis | s9 | Source_Select_Kinesis | OK |
| Kinesis Vol + | b33 | Ipad_1_Kinesis_Vol_+ | OK |
| Kinesis Vol − | b34 | Ipad_1_Kinesis_Vol_- | OK |
| Kinesis Mute | b35 | Ipad_1_Kinesis_Mute | OK |
| Kinesis Is_Mute | b35 | Kinesis_Is_Mute | OK |
| Kinesis niveau | n4 | Kinesis_Vol | OK |
| Distribute Musculation | b19 | Ipad_1_Distrib_Sport | OK |
| Off Musculation | b9 | Ipad_1_Power_Off_Sport | OK |
| Source du groupe Musculation | s8 | Source_Select_Sport | OK |
| Musculation Vol + | b41 | Ipad_1_Sport_Vol_+ | OK |
| Musculation Vol − | b42 | Ipad_1_Sport_Vol_- | OK |
| Musculation Mute | b43 | Ipad_1_Sport_Mute | OK |
| Musculation Is_Mute | b43 | Sport_Is_Mute | OK |
| Musculation niveau | n5 | Sport_Vol | OK |

## Lodge — Reserve Bar prg06.smw IP-ID 0x05

| Contrôle | Join | Signal trouvé | Résultat |
|---|---|---|---|
| Source iPad Lodge : join libre | b61 | — | OK |
| Source DJ Left : join libre | b62 | — | OK |
| Source DJ Right : join libre | b63 | — | OK |
| Source Sound of the Bar : join libre | b64 | — | OK |
| Tout éteindre : join libre | b65 | — | OK |
| Confirmation (retour) | b56 | Ipad_2_Power_Off_INT | OK |
| Éteindre | b55 | Ipad_2_General_Off | OK |
| Annuler | b54 | Ipad_2_General_Off_Cancel | OK |
| Fermer (Exit) | b57 | Ipad_2_Reset_Subpage | OK |
| Occupé (retour) | b3 | Lodge_Busy_General_Off | OK |
| Progression (retour) | n15 | Lodge_Busy_General_Off_Analog | OK |
| Source sélectionnée (texte) | s15 | Ipad_2_Source_Select | OK |
| Distribute Lodge Left | b71 | Ipad_2_Distrib_LodgeL | OK |
| Off Lodge Left | b90 | Ipad_2_Power_Off_LodgeL | OK |
| Source du groupe Lodge Left | s1 | Source_Select_LodgeL | OK |
| Lodge Left Vol + | b10 | Ipad_2_LodgeL_Vol_+ | OK |
| Lodge Left Vol − | b11 | Ipad_2_LodgeL_Vol_- | OK |
| Lodge Left Mute | b12 | Ipad_2_LodgeL_Mute | OK |
| Lodge Left Is_Mute | b12 | LodgeL_Is_Mute | OK |
| Lodge Left niveau | n1 | LodgeL_Vol | OK |
| Distribute Lodge Right | b72 | Ipad_2_Distrib_LodgeR | OK |
| Off Lodge Right | b91 | Ipad_2_Power_Off_LodgeR | OK |
| Source du groupe Lodge Right | s2 | Source_Select_LodgeR | OK |
| Lodge Right Vol + | b14 | Ipad_2_LodgeR_Vol_+ | OK |
| Lodge Right Vol − | b15 | Ipad_2_LodgeR_Vol_- | OK |
| Lodge Right Mute | b16 | Ipad_2_LodgeR_Mute | OK |
| Lodge Right Is_Mute | b16 | LodgeR_Is_Mute | OK |
| Lodge Right niveau | n2 | LodgeR_Vol | OK |
| Distribute Pool | b73 | Ipad_2_Distrib_Pool | OK |
| Off Pool | b92 | Ipad_2_Power_Off_Pool | OK |
| Source du groupe Pool | s3 | Source_Select_Pool | OK |
| Pool Vol + | b18 | Ipad_2_Pool_Vol_+ | OK |
| Pool Vol − | b19 | Ipad_2_Pool_Vol_- | OK |
| Pool Mute | b20 | Ipad_2_Pool_Mute | OK |
| Pool Is_Mute | b20 | Pool_Is_Mute | OK |
| Pool niveau | n3 | Pool_Vol | OK |
| Distribute Exterior | b74 | Ipad_2_Distrib_Exterior | OK |
| Off Exterior | b93 | Ipad_2_Power_Off_Exterior | OK |
| Source du groupe Exterior | s4 | Source_Select_Exterior | OK |
| Exterior Vol + | b22 | Ipad_2_Exterior_Vol_+ | OK |
| Exterior Vol − | b23 | Ipad_2_Exterior_Vol_- | OK |
| Exterior Mute | b24 | Ipad_2_Exterior_Mute | OK |
| Exterior Is_Mute | b24 | Exterior_Is_Mute | OK |
| Exterior niveau | n4 | Exterior_Vol | OK |
| Exterior Sub Vol + | b26 | Ipad_2_ExteriorSub_Vol_+ | OK |
| Exterior Sub Vol − | b27 | Ipad_2_ExteriorSub_Vol_- | OK |
| Exterior Sub Mute | b28 | Ipad_2_ExteriorSub_Mute | OK |
| Exterior Sub Is_Mute | b28 | ExteriorSub_Is_Mute | OK |
| Exterior Sub niveau | n5 | ExteriorSub_Vol | OK |
| Micro Vol + | b30 | Ipad_2_Micro_Vol_+ | OK |
| Micro Vol − | b31 | Ipad_2_Micro_Vol_- | OK |
| Micro Mute | b32 | Ipad_2_Micro_Mute | OK |
| Micro Is_Mute | b32 | Micro_Is_Mute | OK |
| Micro niveau | n6 | Micro_Vol | OK |

