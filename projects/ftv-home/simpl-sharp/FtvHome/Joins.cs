// FTV Home — contrat de joins v1.0 (27.09.2026).
// Source de vérité : config/ftvhome_config.json → contrat. tools/check-contract.js vérifie que ce
// fichier et le JSON racontent la même chose. Ne rien changer ici sans mettre à jour le JSON.
//
// Principe : tous les joins de pilotage sont GLOBAUX (identiques dans toutes les pièces). Le C#
// applique l'action à la pièce affichée par l'écran émetteur, pose Room_Select# (a10) sur l'EISC
// puis recopie l'impulsion sur le même join : le slot 2 voit chaque action dans le debugger et
// route avec des buffers validés par Room_Active_nn (d11-40).

namespace FtvHome
{
    public static class Joins
    {
        // ---------------------------------------------------------------- limites
        public const int MaxRooms = 30;
        public const int MaxCircuits = 20;
        public const int MaxShades = 8;
        public const int MaxDisplays = 8;
        public const int MaxSources = 8;
        public const int MaxChannels = 8;
        public const int MaxServices = 8;
        public const int MaxFavs = 8;

        // ---------------------------------------------------------------- digitaux
        public const uint RoomSelectBase = 10;          // 11-40 : Room_Select_n = 10 + n
        public const uint SceneArrive = 51;
        public const uint SceneMorning = 52;
        public const uint SceneNight = 53;
        public const uint SceneLeave = 54;
        public const uint RoomOff = 55;

        public const uint LightsAllOn = 101;
        public const uint LightsAllOff = 102;
        public const uint LightsDimUp = 103;
        public const uint LightsDimDown = 104;
        public const uint LightToggleBase = 110;        // 111-130 : Light_n_Toggle

        public const uint ShadesAllOpen = 141;
        public const uint ShadesAllClose = 142;
        public const uint ShadeUpBase = 150;            // 151-158
        public const uint ShadeStopBase = 160;          // 161-168
        public const uint ShadeDownBase = 170;          // 171-178

        public const uint HvacSetpointUp = 181;
        public const uint HvacSetpointDown = 182;
        public const uint HvacModeHeat = 183;
        public const uint HvacModeCool = 184;
        public const uint HvacModeAuto = 185;
        public const uint HvacModeNext = 186;
        public const uint HvacFanAuto = 187;
        public const uint HvacFanOn = 188;
        public const uint HvacScheduleRun = 189;
        public const uint HvacScheduleHold = 190;
        public const uint HvacHumidityOn = 191;
        public const uint HvacHumidityOff = 192;

        public const uint LockLock = 201;
        public const uint LockUnlock = 202;

        public const uint AccessFrontDoorLock = 211;
        public const uint AccessFrontDoorUnlock = 212;
        public const uint AccessGateClose = 213;
        public const uint AccessGateOpen = 214;
        public const uint AccessGarageOpen = 215;
        public const uint AccessGarageClose = 216;
        public const uint AccessGarageClosing = 217;    // fb seul

        public const uint PoolOn = 221;
        public const uint PoolOff = 222;
        public const uint SpaOn = 223;
        public const uint SpaOff = 224;

        public const uint VideoDisplaySelectBase = 230; // 231-238
        public const uint VideoDisplayOnBase = 240;     // 241-248
        public const uint VideoDisplayOffBase = 250;    // 251-258  (d250 = Config_Resync, hors plage)
        public const uint VideoSourceBase = 260;        // 261-268
        public const uint VideoChannelBase = 270;       // 271-278

        public const uint MusicServiceBase = 280;       // 281-288
        public const uint MusicFavBase = 290;           // 291-298
        public const uint MusicPrev = 301;
        public const uint MusicPlayPause = 302;
        public const uint MusicNext = 303;
        public const uint MusicMute = 304;

        public const uint ConfigResync = 250;

        // ---------------------------------------------------------------- analogiques
        public const uint RoomSelect = 10;
        public const uint LightLevelBase = 10;          // 11-30
        public const uint ShadePositionBase = 30;       // 31-38
        public const uint VideoDisplayTarget = 40;
        public const uint VideoDisplayVolumeBase = 40;  // 41-48
        public const uint VideoVolume = 49;
        public const uint VideoDisplaySourceBase = 50;  // 51-58
        public const uint VideoChannel = 59;
        public const uint HvacSetpoint = 60;
        public const uint HvacTemperature = 61;
        public const uint HvacMode = 62;
        public const uint HvacFan = 63;
        public const uint HvacHumidity = 64;
        public const uint MusicVolume = 70;
        public const uint HouseLightsOn = 71;
        public const uint HouseShadesOpen = 72;
        public const uint RoomLightsOn = 73;
        public const uint RoomShadesOpen = 74;
        public const uint ConfigChunkAck = 250;

        // ---------------------------------------------------------------- sériels
        public const uint RoomName = 10;
        public const uint RoomSubtitle = 11;
        public const uint MusicTitle = 20;
        public const uint MusicSub = 21;
        public const uint MusicTint = 22;
        public const uint VideoSourceName = 23;
        public const uint HouseStatus = 30;
        public const uint SystemIpId = 99;
        public const uint SystemCpzName = 101;
        public const uint SystemCpzDate = 102;
        public const uint ConfigJson = 105;
        public const uint ConfigHash = 106;

        // ---------------------------------------------------------------- blocs pièce EISC
        // join = RoomBlockBase + (id-1)*RoomBlockSize + offset
        public const uint RoomBlockBase = 1000;
        public const uint RoomBlockSize = 100;

        public static class Room
        {
            // digitaux
            public const uint LightOnBase = 0;          // +1..+20
            public const uint ShadeUpBase = 20;         // +21..+28
            public const uint ShadeStopBase = 30;       // +31..+38
            public const uint ShadeDownBase = 40;       // +41..+48
            public const uint LockLocked = 51;
            public const uint HvacHeat = 52;
            public const uint HvacCool = 53;
            public const uint HvacAuto = 54;
            public const uint HvacFanOn = 55;
            public const uint HvacHold = 56;
            public const uint HvacHumidity = 57;
            public const uint Displayed = 61;
            public const uint MusicPlaying = 71;
            public const uint MusicMuted = 72;
            // analogiques
            public const uint LightLevelBase = 10;      // +11..+30
            public const uint ShadePositionBase = 30;   // +31..+38
            public const uint HvacSetpoint = 60;
            public const uint HvacTemperature = 61;
            public const uint HvacHumidityMeasure = 64;
            public const uint MusicVolume = 70;
            public const uint MusicService = 75;
            public const uint MusicFav = 76;
            // sériels
            public const uint Name = 10;
        }

        public static uint RoomBlock(int roomId) { return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize; }
        public static bool IsRoomBlock(uint join) { return join >= RoomBlockBase && join < RoomBlockBase + RoomBlockSize * MaxRooms; }
    }
}
