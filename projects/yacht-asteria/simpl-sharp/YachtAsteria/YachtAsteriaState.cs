// Yacht Asteria — état courant tenu par le C# (slot 1). Le slot 2 fait foi dès qu'il renvoie une
// mesure (_Actual) ; sinon les valeurs viennent des états initiaux du JSON.

using System;
using System.Collections.Generic;

namespace YachtAsteria
{
    public class RoomState
    {
        public RoomConfig Cfg;
        public int[] LightPct;          // 0-100 par circuit (index = position dans le JSON, circuits inactifs forcés à 0)
        public bool MusicPlaying, MusicMuted;
        public int MusicVolumeBeforeMute;
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

    public class YachtState
    {
        public int Scene;                       // 0 = ambiance personnalisée, 1..4
        public int ColorR, ColorG, ColorB;      // couleur courante (poussée aux écrans et au slot 2)
        public int UserR, UserG, UserB;         // couleur choisie par l'utilisateur (restaurée quand l'effet s'arrête)
        public int Effect;                      // 0 = fixe, 1..3
        public int Speed;                       // 0-100
        public double EffectStep;
        public bool DayActual, NightActual;     // horloge astronomique du slot 2

        public string ColorHex { get { return ToHex(ColorR, ColorG, ColorB); } }

        public static string ToHex(int r, int g, int b) { return "#" + r.ToString("x2") + g.ToString("x2") + b.ToString("x2"); }

        /// <summary>#rrggbb → composantes 0-255 ; false si la chaîne est invalide.</summary>
        public static bool TryParseHex(string hex, out int r, out int g, out int b)
        {
            r = g = b = 0;
            if (string.IsNullOrEmpty(hex)) return false;
            string h = hex.Trim().TrimStart('#');
            if (h.Length != 6) return false;
            try
            {
                r = Convert.ToInt32(h.Substring(0, 2), 16);
                g = Convert.ToInt32(h.Substring(2, 2), 16);
                b = Convert.ToInt32(h.Substring(4, 2), 16);
                return true;
            }
            catch { return false; }
        }

        public static int Clamp255(int v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
    }
}
