// GÉNÉRÉ par tools/gen_joins.js depuis showroom_config.json → contrat (version 1.0). NE PAS ÉDITER.
// Contrôle : node tools/gen_joins.js --check (échoue si ce fichier n'est plus aligné sur le JSON).
namespace ShowroomNyon
{
    public static class Joins
    {
        public const int MaxRooms = 30, MaxCircuits = 20, MaxScenes = 8, MaxActions = 8;
        public const int MaxHouseActions = 8, MaxServices = 8, MaxFavs = 8, MaxSources = 8;
        public const int MaxCameras = 8, MaxBrowse = 8;
        public const uint BlockBase = 1000, BlockStep = 100;

        public static class Dig
        {
            /// <summary>Room_Select_{n} (11-40, ↔) — Afficher la pièce n (join = 10+n) ; fb = pièce affichée par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10.</summary>
            public const uint RoomSelect = 11;
            public const uint RoomSelectLast = 40;
            /// <summary>House_Action_{n} (51-58, ↔) — Action maison n (maison.actions[n-1] : Welcome, Goodbye…) ; fb = impulsion 1,4 s « action appliquée »</summary>
            public const uint HouseAction = 51;
            public const uint HouseActionLast = 58;
            /// <summary>Room_Off (59, ↔) — Bouton Marche/Arrêt de la barre du bas dans une pièce : éclairages à 0, musique et vidéo arrêtées</summary>
            public const uint RoomOff = 59;
            /// <summary>House_AllOff (60, →) — Bouton Marche/Arrêt de la barre du bas sur l'accueil : toute la maison éteinte</summary>
            public const uint HouseAllOff = 60;
            /// <summary>Room_Action_{n} (61-68, ↔) — Action n de la pièce affichée (pieces[].actions[n-1]) ; fb = impulsion 1,4 s</summary>
            public const uint RoomAction = 61;
            public const uint RoomActionLast = 68;
            /// <summary>Light_Scene_{n} (71-78, ↔) — Scène d'éclairage n de la pièce affichée (niveaux dans pieces[].pilotages.eclairages.scenes[n-1].niveaux) ; fb tenu = scène active</summary>
            public const uint LightScene = 71;
            public const uint LightSceneLast = 78;
            /// <summary>Lights_AllOn (101, ↔) — Tous les circuits de la pièce à 100 % ; fb = tous allumés</summary>
            public const uint LightsAllOn = 101;
            /// <summary>Lights_AllOff (102, ↔) — Tous les circuits à 0 ; fb = tous éteints</summary>
            public const uint LightsAllOff = 102;
            /// <summary>Lights_DimUp (103, →) — All Lights + : tous les circuits +10 %</summary>
            public const uint LightsDimUp = 103;
            /// <summary>Lights_DimDown (104, →) — All Lights − : tous les circuits −10 %</summary>
            public const uint LightsDimDown = 104;
            /// <summary>Light_{n}_Toggle (111-130, ↔) — Interrupteur du circuit n (1..20) : 0 ↔ dernier niveau (100 % par défaut) ; fb = circuit allumé</summary>
            public const uint LightToggle = 111;
            public const uint LightToggleLast = 130;
            /// <summary>House_Lights_AllOff (141, →) — Accueil, tuile Lights : éteint tous les circuits de la maison</summary>
            public const uint HouseLightsAllOff = 141;
            /// <summary>Video_Remote_{n} (201-208, →) — Télécommande Apple TV de la pièce : 1 Menu, 2 Lecture/Pause, 3 TV/Accueil, 4 Haut, 5 Bas, 6 Gauche, 7 Droite, 8 Sélection</summary>
            public const uint VideoRemote = 201;
            public const uint VideoRemoteLast = 208;
            /// <summary>Camera_Select_{n} (231-238, ↔) — Afficher la caméra n ; fb = caméra affichée</summary>
            public const uint CameraSelect = 231;
            public const uint CameraSelectLast = 238;
            /// <summary>Video_Off (251, ↔) — Arrêt de la vidéo de la pièce ; fb tenu = vidéo arrêtée</summary>
            public const uint VideoOff = 251;
            /// <summary>Video_Source_{n} (261-268, ↔) — Source vidéo n dans la pièce affichée (allume) ; fb = source active</summary>
            public const uint VideoSource = 261;
            public const uint VideoSourceLast = 268;
            /// <summary>Music_Service_{n} (281-288, ↔) — Service audio n (musique.services[n-1]) dans la pièce affichée, démarre la lecture ; fb = service actif</summary>
            public const uint MusicService = 281;
            public const uint MusicServiceLast = 288;
            /// <summary>Music_Fav_{n} (291-298, ↔) — Favori n (musique.favoris[n-1]) ; fb = favori en cours</summary>
            public const uint MusicFav = 291;
            public const uint MusicFavLast = 298;
            /// <summary>Music_Prev (301, →) — Piste précédente</summary>
            public const uint MusicPrev = 301;
            /// <summary>Music_PlayPause (302, ↔) — Lecture / pause ; fb tenu = en lecture</summary>
            public const uint MusicPlayPause = 302;
            /// <summary>Music_Next (303, →) — Piste suivante</summary>
            public const uint MusicNext = 303;
            /// <summary>Music_Mute (304, ↔) — Muet ; fb tenu = muet</summary>
            public const uint MusicMute = 304;
            /// <summary>Music_Rewind (305, →) — Retour de 15 s</summary>
            public const uint MusicRewind = 305;
            /// <summary>Music_Forward (306, →) — Avance de 15 s</summary>
            public const uint MusicForward = 306;
            /// <summary>Music_Like (307, ↔) — J'aime ; fb tenu</summary>
            public const uint MusicLike = 307;
            /// <summary>Music_Dislike (308, ↔) — Je n'aime pas ; fb tenu</summary>
            public const uint MusicDislike = 308;
            /// <summary>Music_Shuffle (309, ↔) — Lecture aléatoire ; fb tenu</summary>
            public const uint MusicShuffle = 309;
            /// <summary>Music_Repeat (310, ↔) — Répétition ; fb tenu</summary>
            public const uint MusicRepeat = 310;
            /// <summary>Music_Off (311, ↔) — Arrêt de la musique de la pièce (bouton Marche/Arrêt du lecteur) ; fb tenu = arrêtée</summary>
            public const uint MusicOff = 311;
            /// <summary>Music_SleepTimer_Toggle (312, ↔) — Minuterie de veille ; fb tenu = active</summary>
            public const uint MusicSleepTimerToggle = 312;
            /// <summary>Music_Browse_{n} (321-328, →) — Rubrique n de « Parcourir » du service actif (Flow, Charts…)</summary>
            public const uint MusicBrowse = 321;
            public const uint MusicBrowseLast = 328;
            /// <summary>Room_{n}_LightsOn (401-430, ←) — Pièce n : au moins un circuit allumé (tuiles de la page Rooms, textes d'état)</summary>
            public const uint RoomLightsOn = 401;
            public const uint RoomLightsOnLast = 430;
            /// <summary>Room_{n}_MediaOn (431-460, ←) — Pièce n : musique ou vidéo en marche</summary>
            public const uint RoomMediaOn = 431;
            public const uint RoomMediaOnLast = 460;
            /// <summary>House_MusicPlaying (470, ←) — Au moins une pièce en lecture (tuile Music de l'accueil)</summary>
            public const uint HouseMusicPlaying = 470;
            /// <summary>House_LightsOn (471, ←) — Au moins un circuit allumé dans la maison</summary>
            public const uint HouseLightsOn = 471;
        }

        public static class Ana
        {
            /// <summary>Room_Select# (10, ↔) — Pièce affichée par cet écran (1..30). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2</summary>
            public const uint RoomSelect = 10;
            /// <summary>Light_{n}_Level# (11-30, ↔) — Niveau du circuit n (0-65535) ; curseur → C# ; fb = niveau</summary>
            public const uint LightLevel = 11;
            public const uint LightLevelLast = 30;
            /// <summary>Video_Volume# (49, ↔) — Volume vidéo de la pièce (0-100)</summary>
            public const uint VideoVolume = 49;
            /// <summary>Video_Source# (51, ←) — Source vidéo active de la pièce (0 = arrêt)</summary>
            public const uint VideoSource = 51;
            /// <summary>Music_Volume# (70, ↔) — Volume musique de la pièce (0-100)</summary>
            public const uint MusicVolume = 70;
            /// <summary>Music_Position# (71, ←) — Position de lecture (s)</summary>
            public const uint MusicPosition = 71;
            /// <summary>Music_Duration# (72, ←) — Durée de la piste (s)</summary>
            public const uint MusicDuration = 72;
            /// <summary>Music_SleepTimer# (73, ↔) — Minuterie de veille (min, 0-120)</summary>
            public const uint MusicSleepTimer = 73;
            /// <summary>Music_Service# (74, ←) — Service actif de la pièce (0 = arrêt)</summary>
            public const uint MusicService = 74;
            /// <summary>Music_Track# (75, ←) — Index de la piste en cours (1..n de musique.pistes)</summary>
            public const uint MusicTrack = 75;
            /// <summary>House_MediaRoom# (76, ←) — Pièce du lecteur « en cours » de la barre du bas (0 = aucune)</summary>
            public const uint HouseMediaRoom = 76;
            /// <summary>Light_Scene# (77, ←) — Scène d'éclairage active de la pièce (0 = aucune)</summary>
            public const uint LightScene = 77;
            /// <summary>House_LightsOnCount# (78, ←) — Nombre de circuits allumés dans la maison</summary>
            public const uint HouseLightsOnCount = 78;
            /// <summary>Camera# (79, ←) — Caméra affichée (0 = aucune)</summary>
            public const uint Camera = 79;
        }

        public static class Ser
        {
            /// <summary>Music_Title$ (20, ←) — Titre en cours</summary>
            public const uint MusicTitle = 20;
            /// <summary>Music_Artist$ (21, ←) — Artiste</summary>
            public const uint MusicArtist = 21;
            /// <summary>Music_Album$ (22, ←) — Album</summary>
            public const uint MusicAlbum = 22;
            /// <summary>Music_Cover$ (23, ←) — Pochette (chemin relatif au GUI ou URL)</summary>
            public const uint MusicCover = 23;
            /// <summary>Music_NowPlaying$ (24, ←) — Barre du bas : « Deezer in Aquarium »</summary>
            public const uint MusicNowPlaying = 24;
            /// <summary>Video_Source_Name$ (25, ←) — Nom de la source vidéo active</summary>
            public const uint VideoSourceName = 25;
            /// <summary>Camera_Url$ (26, ←) — Flux de la caméra affichée (vide = image fixe de la config)</summary>
            public const uint CameraUrl = 26;
            /// <summary>Systeme_IpId$ (99, ←) — IP-ID de l'écran connecté</summary>
            public const uint SystemeIpId = 99;
            /// <summary>Systeme_CpzNom$ (101, ←) — Nom du CPZ</summary>
            public const uint SystemeCpzNom = 101;
            /// <summary>Systeme_CpzDate$ (102, ←) — Date de compilation du CPZ</summary>
            public const uint SystemeCpzDate = 102;
        }

        /// <summary>Offsets des blocs pièce : join = BlockBase + (id-1)*BlockStep + offset.</summary>
        public static class BlkDig
        {
            /// <summary>Light_{n}_On (1-20, ) — </summary>
            public const uint LightOn = 1;
            public const uint LightOnLast = 20;
            /// <summary>Light_Scene_{n} (31-38, ) — </summary>
            public const uint LightScene = 31;
            public const uint LightSceneLast = 38;
            /// <summary>Action_{n} (41-48, ) — Impulsion : action n de la pièce déclenchée</summary>
            public const uint Action = 41;
            public const uint ActionLast = 48;
            /// <summary>Room_Displayed (61, ) — </summary>
            public const uint RoomDisplayed = 61;
            /// <summary>Music_Playing (71, ) — </summary>
            public const uint MusicPlaying = 71;
            /// <summary>Music_Muted (72, ) — </summary>
            public const uint MusicMuted = 72;
            /// <summary>Video_On (81, ) — </summary>
            public const uint VideoOn = 81;
        }

        public static class BlkAna
        {
            /// <summary>Light_{n}_Level (11-30, ) — </summary>
            public const uint LightLevel = 11;
            public const uint LightLevelLast = 30;
            /// <summary>Music_Volume (71, ) — </summary>
            public const uint MusicVolume = 71;
            /// <summary>Music_Service (72, ) — </summary>
            public const uint MusicService = 72;
            /// <summary>Video_Volume (81, ) — </summary>
            public const uint VideoVolume = 81;
            /// <summary>Video_Source (82, ) — </summary>
            public const uint VideoSource = 82;
        }
    }
}
