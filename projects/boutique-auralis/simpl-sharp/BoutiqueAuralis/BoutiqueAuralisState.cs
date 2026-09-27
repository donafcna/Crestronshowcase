// Boutique Auralis — état courant tenu par le C# (slot 1). Le slot 2 fait foi dès qu'il renvoie une
// mesure (_Actual) ; sinon les valeurs viennent des états initiaux du JSON.

using System;
using System.Collections.Generic;

namespace BoutiqueAuralis
{
    public class RoomState
    {
        public RoomConfig Cfg;
        public int[] LightPct;          // 0-100 par circuit (index = position dans le JSON, circuits inactifs forcés à 0)
        public int Scene;               // 0 = ambiance personnalisée, 1..4 = dernière scène appliquée à cet espace
        public bool MusicPlaying, MusicMuted;
        public int MusicVolume, MusicSource;

        public RoomState(RoomConfig cfg)
        {
            Cfg = cfg;
            LightPct = new int[cfg.Circuits.Count];
            for (int i = 0; i < LightPct.Length; i++) LightPct[i] = cfg.Circuits[i].Active ? Clamp(cfg.Circuits[i].InitialLevelPct) : 0;
            MusicPlaying = cfg.AudioActive && cfg.AudioInitialPlaying;
            MusicMuted = cfg.AudioActive && cfg.AudioInitialMuted;
            MusicVolume = Clamp(cfg.AudioInitialVolume);
            MusicSource = cfg.AudioInitialSource;
        }

        public static int Clamp(int v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
        public bool CircuitActive(int i) { return i >= 0 && i < Cfg.Circuits.Count && Cfg.Circuits[i].Active; }
        public int ActiveCircuits { get { int n = 0; for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i)) n++; return n; } }
        public int LightsOn { get { int n = 0; for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i) && LightPct[i] > 0) n++; return n; } }
        /// <summary>Moyenne des circuits actifs (tuile « Éclairage moyen N % »).</summary>
        public int LightsAvg { get { int n = 0, sum = 0; for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i)) { n++; sum += LightPct[i]; } return n == 0 ? 0 : (int)Math.Round(sum / (double)n); } }
        public bool AllLightsOn { get { if (ActiveCircuits == 0) return false; for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i) && LightPct[i] < 100) return false; return true; } }
        public bool AllLightsOff { get { for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i) && LightPct[i] > 0) return false; return true; } }
    }

    public class BoutiqueState
    {
        public int[] BlindsPct = new int[Joins.MaxBlinds];   // 0-100 par façade (100 = ouvert), index = façade − 1
        public int Kelvin;                                    // température de couleur du blanc (K)
        public bool WhiteAuto;
        public bool ScentOn;
        public int Fragrance;                                 // 1..8
        public int Diffusion;                                 // 0-100
        public bool ScheduleOn;
        public int OpeningMin, ClosingMin;                    // minutes depuis minuit (0-1439)
        public int LastScheduleMinute = -1;                   // dernière minute traitée par le cycle horaire

        public static int ClampMinutes(int v) { return v < 0 ? 0 : v > 1439 ? 1439 : v; }
        public static int WrapMinutes(int v) { v %= 1440; return v < 0 ? v + 1440 : v; }
        public static string FormatTime(int minutes) { minutes = ClampMinutes(minutes); return string.Format("{0:00}:{1:00}", minutes / 60, minutes % 60); }
    }
}
