// FTV Home — état courant tenu par le C# (slot 1). Le slot 2 fait foi dès qu'il renvoie une
// mesure (_Actual) ; sinon les valeurs viennent des états initiaux du JSON.

using System;
using System.Collections.Generic;

namespace FtvHome
{
    public enum HvacMode { Heat = 1, Cool = 2, Auto = 3 }

    public class RoomState
    {
        public RoomConfig Cfg;
        public int[] LightPct;          // 0-100 par circuit
        public int[] ShadePct;          // 0-100 par occultant (100 = ouvert)
        public double Temp, Setpoint;
        public HvacMode Mode = HvacMode.Auto;
        public bool FanOn, Hold, HumidityCtrl;
        public int Humidity;
        public bool Locked;
        public bool MusicPlaying, MusicMuted;
        public int MusicVolumeBeforeMute;
        public int MusicVolume, MusicService, MusicFav;
        public string MusicTitle = "", MusicSub = "", MusicTint = "";

        public RoomState(RoomConfig cfg)
        {
            Cfg = cfg;
            LightPct = new int[cfg.Circuits.Count];
            for (int i = 0; i < LightPct.Length; i++) LightPct[i] = Clamp(cfg.Circuits[i].InitialLevelPct);
            ShadePct = new int[cfg.Shades.Count];
            for (int i = 0; i < ShadePct.Length; i++) ShadePct[i] = Clamp(cfg.Shades[i].InitialPositionPct);
            Temp = cfg.Hvac.InitialTemp; Setpoint = cfg.Hvac.InitialSetpoint;
            Mode = cfg.Hvac.InitialMode == "heat" ? HvacMode.Heat : cfg.Hvac.InitialMode == "cool" ? HvacMode.Cool : HvacMode.Auto;
            FanOn = cfg.Hvac.InitialFanOn; Hold = cfg.Hvac.InitialHold;
            Humidity = cfg.Hvac.InitialHumidity; HumidityCtrl = cfg.Hvac.InitialHumidityCtrl;
            Locked = cfg.LockInitialLocked;
            MusicPlaying = cfg.AudioActive && cfg.AudioInitialPlaying;
            MusicVolume = Clamp(cfg.AudioInitialVolume);
            MusicFav = cfg.AudioInitialFav;
        }

        public static int Clamp(int v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
        public int LightsOn { get { int n = 0; foreach (var l in LightPct) if (l > 0) n++; return n; } }
        public int ShadesOpen { get { int n = 0; foreach (var s in ShadePct) if (s > 5) n++; return n; } }
        public bool AllLightsOn { get { if (LightPct.Length == 0) return false; foreach (var l in LightPct) if (l < 100) return false; return true; } }
        public bool AllLightsOff { get { foreach (var l in LightPct) if (l > 0) return false; return true; } }
        public bool AllShadesOpen { get { if (ShadePct.Length == 0) return false; foreach (var s in ShadePct) if (s < 100) return false; return true; } }
        public bool AllShadesClosed { get { foreach (var s in ShadePct) if (s > 0) return false; return true; } }
    }

    public class DisplayState
    {
        public NamedItem Cfg;
        public bool On;
        public int Source;      // 0 = aucune, 1..8
        public int Volume = 35;
    }

    public class HouseState
    {
        public bool FrontDoorLocked = true, GateClosed = true, GarageOpen = false, GarageClosing = false;
        public bool PoolOn = true, SpaOn = false;
        public int Channel = 1;
        public Dictionary<int, DisplayState> Displays = new Dictionary<int, DisplayState>();
    }
}
