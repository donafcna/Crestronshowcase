// Boutique Auralis — contrat de joins v1.0 (27.09.2026).
// Source de vérité : config/boutique-auralis_config.json → contrat. tools/check-contract.js vérifie que
// ce fichier et le JSON racontent la même chose. Ne rien changer ici sans mettre à jour le JSON.
//
// Principe : tous les joins de pilotage sont GLOBAUX (identiques dans tous les espaces). Le C#
// applique l'action à l'espace affiché par l'écran émetteur (0 = toute la boutique → tous les espaces),
// pose Room_Select# (a10) sur l'EISC puis recopie l'impulsion sur le même join : le slot 2 voit chaque
// action dans le debugger et route avec des buffers validés par Room_Active_nn (d100-117).
// Les fonctions boutique (stores, éclairage général, blanc, parfum, horaires) sont globales par nature.

namespace BoutiqueAuralis
{
    public static class Joins
    {
        // ---------------------------------------------------------------- limites
        public const int MaxRooms = 17;                // 1000 + 17 × 100 − 1 = 2699 ≤ 2732 (socle EISC)
        public const int MaxCircuits = 8;
        public const int MaxSources = 8;
        public const int MaxBlinds = 4;                // façades nord / sud / est / ouest
        public const int MaxFragrances = 8;
        public const int MaxScenes = 4;                // Scene_Opening / Gala / Private / Closed

        // ---------------------------------------------------------------- digitaux
        public const uint SceneOpening = 51;
        public const uint SceneGala = 52;
        public const uint ScenePrivate = 53;
        public const uint SceneClosed = 54;

        public const uint RoomSelectAll = 100;          // Toute la boutique = Room_Select# 0
        public const uint RoomSelectBase = 100;         // 101-117 : Room_Select_n = 100 + n

        public const uint LightsAllOn = 151;            // éclairage général (tous les espaces)
        public const uint LightsAllOff = 152;
        public const uint LightToggleBase = 160;        // 161-168 : Light_n_Toggle

        public const uint BlindsOpenBase = 170;         // 171-174 : Blinds_n_Open
        public const uint BlindsAllOpen = 175;
        public const uint BlindsHalfBase = 180;         // 181-184 : Blinds_n_Half
        public const uint BlindsAllHalf = 185;
        public const uint BlindsCloseBase = 190;        // 191-194 : Blinds_n_Close
        public const uint BlindsAllClose = 195;

        public const uint WhiteAuto = 201;              // bascule ; entrée EISC White_Auto_Actual

        public const uint ScentOn = 211;                // interlock ; entrée EISC Scent_On_Actual
        public const uint ScentOff = 212;
        public const uint ScentFragranceBase = 220;     // 221-228 : Scent_Fragrance_n

        public const uint ScheduleOn = 231;
        public const uint ScheduleOff = 232;
        public const uint ScheduleOpeningUp = 233;
        public const uint ScheduleOpeningDown = 234;
        public const uint ScheduleClosingUp = 235;
        public const uint ScheduleClosingDown = 236;

        public const uint MusicSourceBase = 240;        // 241-248 : Music_Source_n
        public const uint ConfigResync = 250;
        public const uint MusicPlayPause = 261;
        public const uint MusicMute = 262;

        // ---------------------------------------------------------------- analogiques
        public const uint RoomSelect = 10;              // 0 = toute la boutique, 1..17
        public const uint LightLevelBase = 10;          // 11-18 : Light_n_Level#
        public const uint WhiteTemperature = 21;        // kelvins directs
        public const uint ScentDiffusion = 22;          // 0-100
        public const uint ScheduleOpening = 23;         // minutes depuis minuit
        public const uint ScheduleClosing = 24;
        public const uint Scene = 26;                   // fb seul (0 = personnalisée, 1..4)
        public const uint MusicVolume = 30;
        public const uint BlindsPositionBase = 30;      // 31-34 : Blinds_n_Position#
        public const uint RoomLightsAvg = 41;
        public const uint RoomLightsOn = 42;
        public const uint BoutiqueLightsOn = 43;
        public const uint ConfigChunkAck = 250;

        // ---------------------------------------------------------------- sériels
        public const uint RoomName = 10;
        public const uint RoomSubtitle = 11;
        public const uint SceneName = 12;
        public const uint BoutiqueSummary = 13;
        public const uint ScheduleOpeningText = 14;
        public const uint ScheduleClosingText = 15;
        public const uint ScentFragranceName = 16;
        public const uint MusicSourceName = 20;
        public const uint SystemIpId = 99;
        public const uint SystemCpzName = 101;
        public const uint SystemCpzDate = 102;
        public const uint ConfigJson = 105;
        public const uint ConfigHash = 106;

        // ---------------------------------------------------------------- bloc maison EISC (impulsions moteurs, jamais sur un écran)
        public static class House
        {
            public const uint BlindsUpBase = 300;       // 301-304 : Blinds_n_Up
            public const uint BlindsStopBase = 310;     // 311-314 : Blinds_n_Stop
            public const uint BlindsDownBase = 320;     // 321-324 : Blinds_n_Down
            public const uint PulseFirst = 301, PulseLast = 324;
        }

        // ---------------------------------------------------------------- blocs espace EISC
        // join = RoomBlockBase + (id-1)*RoomBlockSize + offset   (1000..2499 pour 15 espaces, socle 2732)
        public const uint RoomBlockBase = 1000;
        public const uint RoomBlockSize = 100;

        public static class Room
        {
            // digitaux
            public const uint LightOnBase = 0;          // +1..+8
            public const uint Displayed = 11;
            public const uint MusicPlaying = 21;
            public const uint MusicMuted = 22;
            // analogiques
            public const uint LightLevelBase = 0;       // +1..+8
            public const uint MusicVolume = 21;
            public const uint MusicSource = 22;
            public const uint Scene = 25;               // fb seul
            // sériels
            public const uint Name = 10;
        }

        public static uint RoomBlock(int roomId) { return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize; }
        public static bool IsRoomBlock(uint join) { return join >= RoomBlockBase && join < RoomBlockBase + RoomBlockSize * MaxRooms; }
    }
}
