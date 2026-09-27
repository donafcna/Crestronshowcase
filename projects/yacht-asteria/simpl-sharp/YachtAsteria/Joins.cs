// Yacht Asteria — contrat de joins v1.0 (27.09.2026).
// Source de vérité : config/yacht-asteria_config.json → contrat. tools/check-contract.js vérifie que ce
// fichier et le JSON racontent la même chose. Ne rien changer ici sans mettre à jour le JSON.
//
// Principe : tous les joins de pilotage sont GLOBAUX (identiques dans tous les espaces). Le C#
// applique l'action à l'espace affiché par l'écran émetteur (0 = tout le yacht → tous les espaces),
// pose Room_Select# (a10) sur l'EISC puis recopie l'impulsion sur le même join : le slot 2 voit chaque
// action dans le debugger et route avec des buffers validés par Room_Active_nn (d100-140).

namespace YachtAsteria
{
    public static class Joins
    {
        // ---------------------------------------------------------------- limites
        public const int MaxRooms = 40;
        public const int MaxCircuits = 8;
        public const int MaxSources = 8;
        public const int MaxColorPresets = 8;
        public const int MaxEffects = 3;               // Effect_BlueWave / Rainbow / Champagne
        public const int MaxScenes = 4;                // Scene_Cruise / Sunset / Dinner / Night

        // ---------------------------------------------------------------- digitaux
        public const uint SceneCruise = 51;
        public const uint SceneSunset = 52;
        public const uint SceneDinner = 53;
        public const uint SceneNight = 54;

        public const uint RoomSelectAll = 100;          // Tout le yacht = Room_Select# 0
        public const uint RoomSelectBase = 100;         // 101-140 : Room_Select_n = 100 + n

        public const uint LightsAllOn = 151;
        public const uint LightsAllOff = 152;
        public const uint LightToggleBase = 160;        // 161-168 : Light_n_Toggle

        public const uint ColorPresetBase = 200;        // 201-208 : Color_Preset_n
        public const uint EffectOff = 211;
        public const uint EffectBlueWave = 212;
        public const uint EffectRainbow = 213;
        public const uint EffectChampagne = 214;

        public const uint DaylightDay = 221;            // fb seul ; entrée EISC Daylight_Day_Actual
        public const uint DaylightNight = 222;          // fb seul ; entrée EISC Daylight_Night_Actual

        public const uint MusicSourceBase = 230;        // 231-238 : Music_Source_n
        public const uint MusicPlayPause = 241;
        public const uint MusicMute = 242;

        public const uint ConfigResync = 250;

        // ---------------------------------------------------------------- analogiques
        public const uint RoomSelect = 10;              // 0 = tout le yacht, 1..40
        public const uint LightLevelBase = 10;          // 11-18 : Light_n_Level#
        public const uint ColorR = 21;
        public const uint ColorG = 22;
        public const uint ColorB = 23;
        public const uint Speed = 24;
        public const uint Effect = 25;                  // fb seul (0..3)
        public const uint Scene = 26;                   // fb seul (0 = personnalisée, 1..4)
        public const uint MusicVolume = 30;
        public const uint RoomLightsAvg = 41;
        public const uint RoomLightsOn = 42;
        public const uint YachtLightsOn = 43;
        public const uint ConfigChunkAck = 250;

        // ---------------------------------------------------------------- sériels
        public const uint RoomName = 10;
        public const uint RoomSubtitle = 11;
        public const uint SceneName = 12;
        public const uint YachtSummary = 13;
        public const uint MusicSourceName = 20;
        public const uint ColorHex = 22;
        public const uint SystemIpId = 99;
        public const uint SystemCpzName = 101;
        public const uint SystemCpzDate = 102;
        public const uint ConfigJson = 105;
        public const uint ConfigHash = 106;

        // ---------------------------------------------------------------- blocs espace EISC
        // join = RoomBlockBase + (id-1)*RoomBlockSize + offset   (500..2349 pour 37 espaces, socle 2732)
        public const uint RoomBlockBase = 500;
        public const uint RoomBlockSize = 50;

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
            // sériels
            public const uint Name = 10;
        }

        public static uint RoomBlock(int roomId) { return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize; }
        public static bool IsRoomBlock(uint join) { return join >= RoomBlockBase && join < RoomBlockBase + RoomBlockSize * MaxRooms; }
    }
}
