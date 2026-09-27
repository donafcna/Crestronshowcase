// Restaurant Kyoto Gardens — état courant tenu par le C# (slot 1). Le slot 2 fait foi dès qu'il renvoie
// une mesure (_Actual) ; sinon les valeurs viennent des états initiaux du JSON.

using System;
using System.Collections.Generic;

namespace RestaurantKyoto
{
    public class RoomState
    {
        public RoomConfig Cfg;
        public int[] LightPct;          // 0-100 par circuit (index = position dans le JSON, circuits inactifs forcés à 0)
        public int Scene;               // scène active de la zone : 0 = personnalisée, 1..5

        public RoomState(RoomConfig cfg, int initialScene)
        {
            Cfg = cfg;
            LightPct = new int[cfg.Circuits.Count];
            for (int i = 0; i < LightPct.Length; i++) LightPct[i] = cfg.Circuits[i].Active ? Clamp(cfg.Circuits[i].InitialLevelPct) : 0;
            Scene = initialScene;
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

    /// <summary>Globaux non zonés (bloc « restaurant ») : climat, musique, service, couverts.</summary>
    public class RestaurantState
    {
        public double Setpoint;                 // °C, bornée min/max, arrondie au pas
        public double Temperature;              // °C mesurée (HVAC_Temperature_Actual#)
        public int FreshAir;                    // % (HVAC_FreshAir_Actual#)
        public bool MusicPlaying;
        public int MusicVolume;                 // 0..volumeMax
        public int MusicEq;                     // 1..3
        public int Service;                     // 0 Fluide, 1 Sommelier, 2 Accueil, 3 Cuisine
        public int Covers;                      // couverts (Covers_Actual#)

        public static int ClampInt(int v, int min, int max) { return v < min ? min : v > max ? max : v; }
    }
}
