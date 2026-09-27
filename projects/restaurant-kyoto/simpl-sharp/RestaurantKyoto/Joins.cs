// Restaurant Kyoto Gardens — contrat de joins v1.0 (27.09.2026).
// Source de vérité : config/restaurant-kyoto_config.json → contrat. tools/check-contract.js vérifie que ce
// fichier et le JSON racontent la même chose. Ne rien changer ici sans mettre à jour le JSON.
//
// Principe : tous les joins de pilotage sont GLOBAUX (identiques dans toutes les zones). Le C#
// applique l'action à la zone affichée par l'écran émetteur (0 = tout le restaurant → toutes les zones),
// pose Room_Select# (a10) sur l'EISC puis recopie l'impulsion sur le même join : le slot 2 voit chaque
// action dans le debugger et route avec des buffers validés par Room_Active_nn (d100-117).
// Les scènes sont PAR ZONE (Scene_x sur la zone a10) ; climat, musique, service et couverts sont globaux.

namespace RestaurantKyoto
{
    public static class Joins
    {
        // ---------------------------------------------------------------- limites
        public const int MaxRooms = 17;                // 1000 + 17 × 100 − 1 = 2699 ≤ 2732 (socle EISC)
        public const int MaxCircuits = 8;
        public const int MaxScenes = 5;                // Scene_Welcome / Dinner / Rooftop / Cleaning / Closed
        public const int MaxEq = 3;                    // Music_EQ_1..3 : Lounge / Dining / Live
        public const int MaxServices = 4;              // états 0..3 : Fluide / Sommelier / Accueil / Cuisine

        // ---------------------------------------------------------------- digitaux
        public const uint SceneWelcome = 51;
        public const uint SceneDinner = 52;
        public const uint SceneRooftop = 53;
        public const uint SceneCleaning = 54;
        public const uint SceneClosed = 55;

        public const uint RoomSelectAll = 100;          // Tout le restaurant = Room_Select# 0
        public const uint RoomSelectBase = 100;         // 101-117 : Room_Select_n = 100 + n

        public const uint LightsAllOn = 151;
        public const uint LightsAllOff = 152;
        public const uint LightToggleBase = 160;        // 161-168 : Light_n_Toggle

        public const uint HvacSetpointUp = 181;
        public const uint HvacSetpointDown = 182;

        public const uint MusicPlayPause = 241;
        public const uint MusicEqBase = 242;            // 243-245 : Music_EQ_n

        public const uint ConfigResync = 250;

        public const uint ServiceFluide = 261;          // état 0
        public const uint ServiceSommelier = 262;       // état 1
        public const uint ServiceAccueil = 263;         // état 2
        public const uint ServiceCuisine = 264;         // état 3

        // ---------------------------------------------------------------- analogiques
        public const uint RoomSelect = 10;              // 0 = tout le restaurant, 1..17
        public const uint LightLevelBase = 10;          // 11-18 : Light_n_Level#
        public const uint Scene = 26;                   // fb seul (0 = personnalisée, 1..5) — zone affichée
        public const uint MusicVolume = 30;             // 0..volumeMax (80)
        public const uint RoomLightsAvg = 41;
        public const uint RoomLightsOn = 42;
        public const uint RestaurantLightsOn = 43;
        public const uint HvacSetpoint = 60;            // × 10
        public const uint HvacTemperature = 61;         // × 10, fb seul (entrée EISC _Actual)
        public const uint HvacFreshAir = 62;            // %, fb seul (entrée EISC _Actual)
        public const uint ServiceState = 80;            // fb seul (0..3)
        public const uint Covers = 81;                  // fb seul (entrée EISC _Actual)
        public const uint ConfigChunkAck = 250;

        // ---------------------------------------------------------------- sériels
        public const uint RoomName = 10;
        public const uint RoomSubtitle = 11;
        public const uint SceneName = 12;
        public const uint RestaurantSummary = 13;
        public const uint MusicTitle = 20;
        public const uint MusicSub = 21;
        public const uint ServiceText = 30;
        public const uint SystemIpId = 99;
        public const uint SystemCpzName = 101;
        public const uint SystemCpzDate = 102;
        public const uint ConfigJson = 105;
        public const uint ConfigHash = 106;

        // ---------------------------------------------------------------- blocs zone EISC
        // join = RoomBlockBase + (id-1)*RoomBlockSize + offset   (1000..2599 pour 16 zones, socle 2732)
        public const uint RoomBlockBase = 1000;
        public const uint RoomBlockSize = 100;

        public static class Room
        {
            // digitaux
            public const uint LightOnBase = 0;          // +1..+8
            public const uint Displayed = 11;
            // analogiques
            public const uint LightLevelBase = 0;       // +1..+8
            public const uint Scene = 20;               // 0 = personnalisée, 1..5
            // sériels
            public const uint Name = 10;
        }

        public static uint RoomBlock(int roomId) { return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize; }
        public static bool IsRoomBlock(uint join) { return join >= RoomBlockBase && join < RoomBlockBase + RoomBlockSize * MaxRooms; }
    }
}
