// Club Étoile — modèle de la configuration /user/club-etoile_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonctionnalité absente ou actif=false n'est ni
// routée par le C#, ni câblée dans le SIMPL, ni affichée par le GUI. Un circuit actif=false garde
// son index (join stable) mais est ignoré partout.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace ClubEtoile
{
    public class CircuitConfig
    {
        public string Key = "";
        public string Name = "";
        public bool Dimmable = true;
        public bool Active = true;
        public double Coefficient = 1.0;      // part de l'intensité de la salle attribuée à ce circuit
    }

    public class RoomConfig
    {
        public int Id;
        public string Key = "";
        public string Name = "";
        public string Floor = "";
        public string Color = "";
        public string Mood = "";
        public bool Intersystem = true;
        public bool AmbianceActive;
        public string InitialSceneKey = "signature";
        public int InitialLevelPct = 75;
        public bool LightsActive;
        public List<CircuitConfig> Circuits = new List<CircuitConfig>();
    }

    public class SceneConfig { public int Id; public string Key = ""; public string Name = ""; public double Factor; }

    public class CrowdConfig { public int Id; public string Key = ""; public string Name = ""; public string Detail = ""; public int FanPct; public double SetpointC; }

    public class MacroConfig
    {
        public string Name = "";
        public string CrowdKey = "";          // "" = affluence inchangée
        public bool HasStrobe, Strobe, HasSmoke, Smoke, VolumesZero;
    }

    public class NamedItem { public int Id; public string Key = ""; public string Name = ""; }
    public class FloorConfig { public string Id = ""; public string Name = ""; public int Gui; }

    public class ClubEtoileConfig
    {
        public string Project = "Club Étoile";
        public string Version = "";
        public string Mode = "deploiement";
        public string ClubName = "";
        public string Subtitle = "";
        public string AllName = "Tout le club";
        public string MixedSceneName = "Ambiances mixtes";
        public string InitialSceneKey = "signature";
        public int InitialLevelPct = 75;

        public List<CrowdConfig> Crowds = new List<CrowdConfig>();
        public string InitialCrowdKey = "busy";
        public bool HvacActive;
        public double InitialTemperatureC = 19.0;
        public bool CtaOnlineDefault = true;
        public string TextCtaOnline = "CTA en ligne", TextCtaOffline = "CTA hors ligne";

        public bool AudioActive;
        public int InitialDancefloorVolume = 90, InitialBarVolume = 60, InitialDb = 102;
        public int LimiterThresholdDb = 105;
        public bool SimulateDb = true;
        public string TextLimiterOn = "Limiteur actif · seuil atteint", TextLimiterOff = "Seuil 105 dB";

        public bool EffectsActive;
        public bool InitialSmoke, InitialStrobe, InitialLyres = true;
        public int InitialStrobeFreq = 8, StrobeFreqMin = 1, StrobeFreqMax = 15;
        public string TextSmokeReady = "Machine CO2 : Prêt", TextSmokeActive = "Machine CO2 : Jet Actif";
        public string TextStrobeOn = "Strobe : Actif", TextStrobeOff = "Strobe : Éteint";

        public bool ScreenActive;
        public int InitialScreenSource = 1;
        public List<NamedItem> ScreenSources = new List<NamedItem>();

        public MacroConfig MacroPeakAlert, MacroCalmEnd, MacroAllOff, MacroPartyQuick;
        public string InitialView = "building";
        public string InitialRoomKey = "original";

        public List<FloorConfig> Floors = new List<FloorConfig>();
        public List<SceneConfig> Scenes = new List<SceneConfig>();
        public List<RoomConfig> Rooms = new List<RoomConfig>();
        public Dictionary<string, RoomConfig> RoomsByKey = new Dictionary<string, RoomConfig>();
        public Dictionary<int, RoomConfig> RoomsById = new Dictionary<int, RoomConfig>();
        public string EiscIpId = "0xF0";
        public string EiscIp = "127.0.0.2";
        public bool EiscActive = true;

        private static bool B(JToken t, string k, bool def) { return t != null && t[k] != null && t[k].Type == JTokenType.Boolean ? (bool)t[k] : def; }
        private static int I(JToken t, string k, int def) { if (t == null || t[k] == null) return def; try { return (int)t[k]; } catch { return def; } }
        private static double D(JToken t, string k, double def) { if (t == null || t[k] == null) return def; try { return (double)t[k]; } catch { return def; } }
        private static string S(JToken t, string k, string def) { return t != null && t[k] != null && t[k].Type == JTokenType.String ? (string)t[k] : def; }
        private static JToken Sub(JToken t, string k) { return t != null ? t[k] : null; }

        private static MacroConfig ParseMacro(JToken m, string defName)
        {
            var mc = new MacroConfig { Name = S(m, "nom", defName), CrowdKey = S(m, "affluence", "") };
            mc.HasStrobe = m != null && m["strobe"] != null; mc.Strobe = B(m, "strobe", false);
            mc.HasSmoke = m != null && m["fumee"] != null; mc.Smoke = B(m, "fumee", false);
            mc.VolumesZero = B(m, "volumesZero", false);
            return mc;
        }

        public static ClubEtoileConfig Parse(JObject root)
        {
            var c = new ClubEtoileConfig();
            var meta = root["meta"];
            c.Project = S(meta, "projet", c.Project);
            c.Version = S(meta, "version", "");
            c.Mode = S(meta, "mode", "deploiement");

            var club = root["club"];
            c.ClubName = S(club, "nom", "");
            c.Subtitle = S(club, "sousTitre", "");
            c.AllName = S(club, "toutLeClub", c.AllName);
            c.MixedSceneName = S(club, "sceneMixte", c.MixedSceneName);
            c.InitialSceneKey = S(club, "sceneInitiale", c.InitialSceneKey);
            c.InitialLevelPct = I(club, "intensiteInitiale", 75);
            c.InitialCrowdKey = S(club, "affluenceInitiale", c.InitialCrowdKey);

            if (club != null)
            {
                foreach (var sc in club["scenes"] ?? new JArray())
                {
                    int id = I(sc, "id", 0);
                    if (id < 1 || id > Joins.MaxScenes) continue;
                    c.Scenes.Add(new SceneConfig { Id = id, Key = S(sc, "cle", ""), Name = S(sc, "nom", ""), Factor = Math.Max(0, D(sc, "facteur", 1.0)) });
                }
                foreach (var cr in club["affluence"] ?? new JArray())
                {
                    int id = I(cr, "id", 0);
                    if (id < 1 || id > Joins.MaxCrowds) continue;
                    c.Crowds.Add(new CrowdConfig { Id = id, Key = S(cr, "cle", ""), Name = S(cr, "nom", ""), Detail = S(cr, "detail", ""), FanPct = I(cr, "ventilation", 50), SetpointC = D(cr, "consigne", 20.0) });
                }
                var cvc = club["cvc"];
                c.HvacActive = B(cvc, "actif", false);
                c.InitialTemperatureC = D(cvc, "temperatureInitiale", 19.0);
                c.CtaOnlineDefault = B(cvc, "ctaEnLigneParDefaut", true);
                c.TextCtaOnline = S(cvc, "texteEnLigne", c.TextCtaOnline);
                c.TextCtaOffline = S(cvc, "texteHorsLigne", c.TextCtaOffline);

                var audio = club["audio"];
                c.AudioActive = B(audio, "actif", false);
                c.InitialDancefloorVolume = I(audio, "volumePisteInitial", 90);
                c.InitialBarVolume = I(audio, "volumeBarInitial", 60);
                c.InitialDb = I(audio, "dbInitial", 102);
                c.LimiterThresholdDb = I(audio, "seuilLimiteurDb", 105);
                c.SimulateDb = B(audio, "simulerDb", true);
                c.TextLimiterOn = S(audio, "texteLimiteurActif", c.TextLimiterOn);
                c.TextLimiterOff = S(audio, "texteLimiteurRepos", c.TextLimiterOff);

                var effets = club["effets"];
                c.EffectsActive = B(effets, "actif", false);
                c.InitialSmoke = B(effets, "fumeeInitiale", false);
                c.InitialStrobe = B(effets, "strobeInitial", false);
                c.InitialLyres = B(effets, "lyresInitiales", true);
                c.StrobeFreqMin = Math.Max(1, I(effets, "strobeFrequenceMin", 1));      // contrat : 1-15 Hz, jamais 0
                c.StrobeFreqMax = Math.Max(c.StrobeFreqMin, I(effets, "strobeFrequenceMax", 15));
                c.InitialStrobeFreq = I(effets, "strobeFrequenceInitiale", 8);
                var textes = Sub(effets, "textes");
                c.TextSmokeReady = S(textes, "fumeePret", c.TextSmokeReady);
                c.TextSmokeActive = S(textes, "fumeeActive", c.TextSmokeActive);
                c.TextStrobeOn = S(textes, "strobeActif", c.TextStrobeOn);
                c.TextStrobeOff = S(textes, "strobeEteint", c.TextStrobeOff);

                var ecran = club["ecranDj"];
                c.ScreenActive = B(ecran, "actif", false);
                c.InitialScreenSource = I(ecran, "sourceInitiale", 1);
                if (ecran != null)
                    foreach (var s in ecran["sources"] ?? new JArray())
                    {
                        int id = I(s, "id", 0);
                        if (id >= 1 && id <= Joins.MaxScreenSources) c.ScreenSources.Add(new NamedItem { Id = id, Key = S(s, "cle", ""), Name = S(s, "nom", "") });
                    }
                if (c.InitialScreenSource < 1 || c.InitialScreenSource > Joins.MaxScreenSources) c.InitialScreenSource = 1;

                var macros = club["macros"];
                c.MacroPeakAlert = ParseMacro(Sub(macros, "peakAlert"), "Alerte Peak Affluence");
                c.MacroCalmEnd = ParseMacro(Sub(macros, "calmEnd"), "Calme / Fin Service");
                c.MacroAllOff = ParseMacro(Sub(macros, "allOff"), "Extinction Son & Effets");
                c.MacroPartyQuick = ParseMacro(Sub(macros, "partyQuick"), "Soirée");

                var nav = club["navigation"];
                c.InitialView = S(nav, "vueInitiale", "building");
                c.InitialRoomKey = S(nav, "salleInitiale", "original");
            }
            else
            {
                c.MacroPeakAlert = new MacroConfig(); c.MacroCalmEnd = new MacroConfig(); c.MacroAllOff = new MacroConfig(); c.MacroPartyQuick = new MacroConfig();
            }

            foreach (var f in root["etages"] ?? new JArray()) c.Floors.Add(new FloorConfig { Id = S(f, "id", ""), Name = S(f, "nom", ""), Gui = I(f, "gui", c.Floors.Count) });

            foreach (var p in root["pieces"] ?? new JArray())
            {
                var r = new RoomConfig
                {
                    Id = I(p, "id", 0), Key = S(p, "cle", ""), Name = S(p, "nom", ""), Floor = S(p, "etage", ""),
                    Color = S(p, "couleur", ""), Mood = S(p, "ambianceTexte", ""), Intersystem = B(p, "intersystem", true)
                };
                if (r.Id < 1 || r.Id > Joins.MaxRooms) continue;
                var pil = p["pilotages"];
                var amb = Sub(pil, "ambiance");
                r.AmbianceActive = B(amb, "actif", false);
                var ambIni = Sub(amb, "etatInitial");
                r.InitialSceneKey = S(ambIni, "scene", c.InitialSceneKey);
                r.InitialLevelPct = I(ambIni, "intensite", c.InitialLevelPct);
                var ecl = Sub(pil, "eclairages");
                r.LightsActive = B(ecl, "actif", false);
                if (r.LightsActive)
                    foreach (var ci in ecl["circuits"] ?? new JArray())
                    {
                        if (r.Circuits.Count >= Joins.MaxCircuits) break;
                        r.Circuits.Add(new CircuitConfig { Key = S(ci, "cle", ""), Name = S(ci, "nom", ""), Dimmable = B(ci, "gradable", true), Active = B(ci, "actif", true), Coefficient = Math.Max(0, D(ci, "coefficient", 1.0)) });
                    }
                c.Rooms.Add(r);
                c.RoomsById[r.Id] = r;
                if (!string.IsNullOrEmpty(r.Key)) c.RoomsByKey[r.Key] = r;
            }

            var eisc = root["contrat"] != null ? root["contrat"]["eisc"] : null;
            c.EiscActive = B(eisc, "actif", true);
            c.EiscIpId = S(eisc, "ipid", "0xF0");
            c.EiscIp = S(eisc, "adresseIp", "127.0.0.2");
            return c;
        }

        public SceneConfig SceneByKey(string key) { foreach (var s in Scenes) if (s.Key == key) return s; return null; }
        public SceneConfig SceneById(int id) { foreach (var s in Scenes) if (s.Id == id) return s; return null; }
        public CrowdConfig CrowdByKey(string key) { foreach (var s in Crowds) if (s.Key == key) return s; return null; }
        public CrowdConfig CrowdById(int id) { foreach (var s in Crowds) if (s.Id == id) return s; return null; }
        public NamedItem ScreenSourceById(int id) { foreach (var s in ScreenSources) if (s.Id == id) return s; return null; }
        public FloorConfig FloorById(string id) { foreach (var f in Floors) if (f.Id == id) return f; return null; }
        public FloorConfig FloorByGui(int gui) { foreach (var f in Floors) if (f.Gui == gui) return f; return null; }
        public int FloorGuiOf(RoomConfig r) { var f = r != null ? FloorById(r.Floor) : null; return f != null ? f.Gui : 0; }
    }
}
