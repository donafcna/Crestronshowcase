// Club Étoile — état courant tenu par le C# (slot 1). Le slot 2 fait foi dès qu'il renvoie une
// mesure (_Actual) ; sinon les valeurs viennent des états initiaux du JSON.

using System;
using System.Collections.Generic;

namespace ClubEtoile
{
    public class RoomState
    {
        public RoomConfig Cfg;
        public int Scene;               // 1..4 (0 = aucune scène connue)
        public int LevelPct;            // intensité de la salle 0-100
        public int[] LightPct;          // niveaux dérivés 0-100 par circuit (index = position dans le JSON)

        public RoomState(RoomConfig cfg, ClubEtoileConfig club)
        {
            Cfg = cfg;
            var sc = club.SceneByKey(cfg.InitialSceneKey);
            Scene = sc != null ? sc.Id : (club.Scenes.Count > 0 ? club.Scenes[0].Id : 0);
            LevelPct = Clamp(cfg.InitialLevelPct);
            LightPct = new int[cfg.Circuits.Count];
            Derive(club);
        }

        public static int Clamp(int v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
        public bool CircuitActive(int i) { return i >= 0 && i < Cfg.Circuits.Count && Cfg.Circuits[i].Active; }

        /// <summary>Niveaux des circuits dérivés de l'ambiance : intensité × facteur de scène × coefficient (loi du simulateur).</summary>
        public void Derive(ClubEtoileConfig club)
        {
            var sc = club.SceneById(Scene);
            double factor = sc != null ? sc.Factor : 0;
            for (int i = 0; i < LightPct.Length; i++)
            {
                if (!CircuitActive(i)) { LightPct[i] = 0; continue; }
                int pct = Clamp((int)Math.Round(LevelPct * factor * Cfg.Circuits[i].Coefficient));
                LightPct[i] = Cfg.Circuits[i].Dimmable ? pct : (pct > 0 ? 100 : 0);
            }
        }

        public int LightsOn { get { int n = 0; for (int i = 0; i < LightPct.Length; i++) if (CircuitActive(i) && LightPct[i] > 0) n++; return n; } }
    }

    public class ClubState
    {
        public int Crowd;                       // 1..3 (id d'affluence), 0 = inconnue
        public int FanPct;                      // 0-100
        public double SetpointC;                // consigne calculée (× 10 sur le join)
        public double TemperatureC;             // mesure (HVAC_Temperature_Actual#)
        public bool CtaOnline;
        public int DancefloorVolume, BarVolume; // 0-100
        public int Db;                          // dB mesuré ou simulé
        public bool DbFromSlot2;                // vrai dès la première mesure Audio_Db_Actual#
        public bool LimiterActual;              // Audio_Limiter_Actual du DSP
        public bool Smoke, Strobe, Lyres;
        public int StrobeFreq;                  // Hz
        public int ScreenSource;                // 1..4

        public static int Clamp(int v, int min, int max) { return v < min ? min : v > max ? max : v; }
        public static ushort Tenths(double c) { double v = Math.Round(c * 10.0); return (ushort)(v < 0 ? 0 : v > 65535 ? 65535 : v); }
    }

    /// <summary>Navigation propre à chaque écran (jamais sur l'EISC) : vue et étage affichés.</summary>
    public class PanelNav
    {
        public int View;                        // 1 = bâtiment, 2 = étage, 3 = salle
        public int Floor;                       // index GUI 0..2
    }
}
