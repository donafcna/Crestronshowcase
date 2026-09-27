// Club Étoile — contrat de joins v1.0 (27.09.2026).
// Source de vérité : config/club-etoile_config.json → contrat. tools/check-contract.js vérifie que ce
// fichier et le JSON racontent la même chose. Ne rien changer ici sans mettre à jour le JSON.
//
// Principe : tous les joins de pilotage sont GLOBAUX (identiques dans toutes les salles). Le C#
// applique l'action à la salle affichée par l'écran émetteur (0 = tout le club → toutes les salles),
// pose Room_Select# (a10) sur l'EISC puis recopie l'impulsion sur le même join : le slot 2 voit chaque
// action dans le debugger et route avec des buffers validés par Room_Active_nn (d100-110).
// Les fonctions globales du club (affluence, CVC, audio, effets, écran DJ) ont leurs états tenus dans
// le bloc club (Club_xxx_fb = 500 + join global) et leurs mesures réelles sur les entrées _Actual.

namespace ClubEtoile
{
    public static class Joins
    {
        // ---------------------------------------------------------------- limites
        public const int MaxRooms = 10;
        public const int MaxCircuits = 8;
        public const int MaxScenes = 4;                // Scene_Signature / Party / Calm / Off
        public const int MaxCrowds = 3;                // Crowd_Cozy / Busy / Packed
        public const int MaxScreenSources = 4;         // Screen_Source_1..4

        // ---------------------------------------------------------------- digitaux
        public const uint SceneSignature = 51;
        public const uint SceneParty = 52;
        public const uint SceneCalm = 53;
        public const uint SceneOff = 54;

        public const uint RoomSelectAll = 100;          // Tout le club = Room_Select# 0
        public const uint RoomSelectBase = 100;         // 101-110 : Room_Select_n = 100 + n

        public const uint CrowdCozy = 111;
        public const uint CrowdBusy = 112;
        public const uint CrowdPacked = 113;

        public const uint HvacCtaOnline = 121;          // fb seul ; entrée EISC HVAC_CTA_Online_Actual
        public const uint AudioLimiter = 131;           // fb seul ; entrée EISC Audio_Limiter_Actual

        public const uint SmokeOn = 141;
        public const uint SmokeOff = 142;
        public const uint StrobeOn = 143;
        public const uint StrobeOff = 144;
        public const uint LyresOn = 145;
        public const uint LyresOff = 146;

        public const uint ScreenSourceBase = 150;       // 151-154 : Screen_Source_n

        public const uint MacroPeakAlert = 161;
        public const uint MacroCalmEnd = 162;
        public const uint MacroAllOff = 163;
        public const uint MacroPartyQuick = 164;

        public const uint ClubViewBuilding = 171;       // écrans seulement (navigation)
        public const uint ClubViewFloor = 172;
        public const uint ClubViewRoom = 173;

        public const uint ConfigResync = 250;

        // ---------------------------------------------------------------- analogiques
        public const uint RoomSelect = 10;              // 0 = tout le club, 1..10
        public const uint RoomLevel = 11;               // intensité de la salle (0-65535)
        public const uint Scene = 12;                   // fb seul (0 = mixte, 1..4)
        public const uint HvacFan = 20;
        public const uint HvacSetpoint = 21;            // fb seul, × 10
        public const uint HvacTemperature = 22;         // fb seul, × 10 ; entrée EISC HVAC_Temperature_Actual#
        public const uint AudioDancefloorVolume = 30;
        public const uint AudioBarVolume = 31;
        public const uint AudioDb = 32;                 // fb seul ; entrée EISC Audio_Db_Actual#
        public const uint StrobeFreq = 40;              // 1-15 Hz
        public const uint ScreenSource = 41;            // fb seul (1..4)
        public const uint ClubFloor = 42;               // écrans seulement (0-2)
        public const uint LightLevelBase = 50;          // 51-58 : Light_n_Level# (fb seul, dérivé)
        public const uint ConfigChunkAck = 250;

        // ---------------------------------------------------------------- sériels
        public const uint RoomName = 10;
        public const uint RoomSubtitle = 11;
        public const uint SceneName = 12;
        public const uint ClubSummary = 13;
        public const uint RoomMood = 14;
        public const uint RoomColor = 15;
        public const uint HvacStatus = 20;
        public const uint CrowdName = 21;
        public const uint AudioLimiterText = 22;
        public const uint SmokeStatus = 23;
        public const uint StrobeStatus = 24;
        public const uint ScreenSourceName = 25;
        public const uint SystemIpId = 99;
        public const uint SystemCpzName = 101;
        public const uint SystemCpzDate = 102;
        public const uint ConfigJson = 105;
        public const uint ConfigHash = 106;

        // ---------------------------------------------------------------- bloc club EISC
        // Club_xxx_fb : join = ClubBlockBase + join global (500..750), sortie EISC seulement.
        public const uint ClubBlockBase = 500;

        // ---------------------------------------------------------------- blocs salle EISC
        // join = RoomBlockBase + (id-1)*RoomBlockSize + offset   (1000..1299 pour 3 salles, socle 2732)
        public const uint RoomBlockBase = 1000;
        public const uint RoomBlockSize = 100;

        public static class Room
        {
            // digitaux
            public const uint LightOnBase = 0;          // +1..+8
            public const uint SceneBase = 10;           // +11..+14 : Scene_n tenue
            public const uint Displayed = 61;
            // analogiques
            public const uint LightLevelBase = 0;       // +1..+8
            public const uint Level = 11;
            public const uint Scene = 12;
            // sériels
            public const uint Name = 10;
        }

        public static uint RoomBlock(int roomId) { return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize; }
        public static bool IsRoomBlock(uint join) { return join >= RoomBlockBase && join < RoomBlockBase + RoomBlockSize * MaxRooms; }
    }
}
