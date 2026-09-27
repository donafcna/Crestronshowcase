// Yacht Asteria — modèle de la configuration /user/yacht-asteria_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonctionnalité absente ou actif=false n'est ni
// routée par le C#, ni câblée dans le SIMPL, ni affichée par le GUI. Un circuit actif=false garde
// son index (join global stable) mais est ignoré partout.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace YachtAsteria
{
    public class CircuitConfig
    {
        public string Key = "";
        public string Name = "";
        public bool Dimmable = true;
        public bool Active = true;
        public int InitialLevelPct;
    }

    public class RoomConfig
    {
        public int Id;
        public string Key = "";
        public string Name = "";
        public string Floor = "";
        public bool Intersystem = true;
        public bool LightsActive;
        public List<CircuitConfig> Circuits = new List<CircuitConfig>();
        public bool AudioActive;
        public bool AudioInitialPlaying;
        public bool AudioInitialMuted;
        public int AudioInitialSource = 1;
        public int AudioInitialVolume = 35;
    }

    public class SceneConfig
    {
        public int Id;
        public string Key = "";
        public string Name = "";
        public Dictionary<string, int> Levels = new Dictionary<string, int>();   // clé de circuit → %
    }

    public class ColorPresetConfig { public int Id; public string Name = ""; public string Hex = ""; }

    public class EffectConfig
    {
        public int Id;
        public string Key = "";
        public string Name = "";
        public List<string> Colors = new List<string>();
    }

    public class NamedItem { public int Id; public string Name = ""; }
    public class FloorConfig { public string Id = ""; public string Name = ""; }

    public class YachtAsteriaConfig
    {
        public string Project = "Yacht Asteria";
        public string Version = "";
        public string Mode = "deploiement";
        public string YachtName = "";
        public string AllName = "Tout le yacht";
        public string CustomSceneName = "Ambiance personnalisée";
        public string InitialSceneKey = "cruise";
        public string InitialColor = "#ffd7a2";
        public string InitialEffectKey = "off";
        public int InitialSpeed = 35;
        public int EffectPeriodMs = 350;
        public bool AutoCycle;
        public string CycleDayScene = "cruise";
        public string CycleNightScene = "dinner";
        public List<FloorConfig> Floors = new List<FloorConfig>();
        public List<SceneConfig> Scenes = new List<SceneConfig>();
        public List<ColorPresetConfig> ColorPresets = new List<ColorPresetConfig>();
        public List<EffectConfig> Effects = new List<EffectConfig>();
        public List<NamedItem> Sources = new List<NamedItem>();
        public List<RoomConfig> Rooms = new List<RoomConfig>();
        public Dictionary<string, RoomConfig> RoomsByKey = new Dictionary<string, RoomConfig>();
        public Dictionary<int, RoomConfig> RoomsById = new Dictionary<int, RoomConfig>();
        public string EiscIpId = "0xF0";
        public string EiscIp = "127.0.0.2";
        public bool EiscActive = true;

        private static bool B(JToken t, string k, bool def) { return t != null && t[k] != null && t[k].Type == JTokenType.Boolean ? (bool)t[k] : def; }
        private static int I(JToken t, string k, int def) { if (t == null || t[k] == null) return def; try { return (int)t[k]; } catch { return def; } }
        private static string S(JToken t, string k, string def) { return t != null && t[k] != null && t[k].Type == JTokenType.String ? (string)t[k] : def; }

        public static YachtAsteriaConfig Parse(JObject root)
        {
            var c = new YachtAsteriaConfig();
            var meta = root["meta"];
            c.Project = S(meta, "projet", c.Project);
            c.Version = S(meta, "version", "");
            c.Mode = S(meta, "mode", "deploiement");

            var yacht = root["yacht"];
            c.YachtName = S(yacht, "nom", "");
            c.AllName = S(yacht, "toutLeYacht", c.AllName);
            c.CustomSceneName = S(yacht, "scenePersonnalisee", c.CustomSceneName);
            c.InitialSceneKey = S(yacht, "sceneInitiale", c.InitialSceneKey);
            c.AutoCycle = B(yacht, "cycleAutomatique", false);
            var cycle = yacht != null ? yacht["cycleJourNuit"] : null;
            c.CycleDayScene = S(cycle, "jour", c.CycleDayScene);
            c.CycleNightScene = S(cycle, "nuit", c.CycleNightScene);

            if (yacht != null)
            {
                foreach (var sc in yacht["scenes"] ?? new JArray())
                {
                    if (c.Scenes.Count >= Joins.MaxScenes) break;
                    var scene = new SceneConfig { Id = I(sc, "id", 0), Key = S(sc, "cle", ""), Name = S(sc, "nom", "") };
                    if (scene.Id < 1 || scene.Id > Joins.MaxScenes) continue;
                    if (sc["niveaux"] is JObject)
                        foreach (var kv in (JObject)sc["niveaux"]) { try { scene.Levels[kv.Key] = (int)kv.Value; } catch { } }
                    c.Scenes.Add(scene);
                }
                var couleurs = yacht["couleurs"];
                c.InitialColor = S(couleurs, "initiale", c.InitialColor);
                if (couleurs != null)
                    foreach (var cp in couleurs["presets"] ?? new JArray())
                    {
                        int id = I(cp, "id", 0);
                        if (id >= 1 && id <= Joins.MaxColorPresets) c.ColorPresets.Add(new ColorPresetConfig { Id = id, Name = S(cp, "nom", ""), Hex = S(cp, "hex", "") });
                    }
                var effets = yacht["effets"];
                c.InitialEffectKey = S(effets, "initial", "off");
                c.InitialSpeed = I(effets, "vitesseInitiale", 35);
                c.EffectPeriodMs = Math.Max(100, I(effets, "periodeMs", 350));
                if (effets != null)
                    foreach (var ef in effets["liste"] ?? new JArray())
                    {
                        int id = I(ef, "id", 0);
                        if (id < 1 || id > Joins.MaxEffects) continue;
                        var e = new EffectConfig { Id = id, Key = S(ef, "cle", ""), Name = S(ef, "nom", "") };
                        foreach (var col in ef["couleurs"] ?? new JArray()) if (col.Type == JTokenType.String) e.Colors.Add((string)col);
                        if (e.Colors.Count > 0) c.Effects.Add(e);
                    }
                var musique = yacht["musique"];
                if (musique != null)
                    foreach (var s in musique["sources"] ?? new JArray())
                    {
                        int id = I(s, "id", 0);
                        if (id >= 1 && id <= Joins.MaxSources) c.Sources.Add(new NamedItem { Id = id, Name = S(s, "nom", "") });
                    }
            }

            foreach (var f in root["etages"] ?? new JArray()) c.Floors.Add(new FloorConfig { Id = S(f, "id", ""), Name = S(f, "nom", "") });

            foreach (var p in root["pieces"] ?? new JArray())
            {
                var r = new RoomConfig
                {
                    Id = I(p, "id", 0), Key = S(p, "cle", ""), Name = S(p, "nom", ""), Floor = S(p, "etage", ""),
                    Intersystem = B(p, "intersystem", true)
                };
                if (r.Id < 1 || r.Id > Joins.MaxRooms) continue;
                var pil = p["pilotages"];
                var ecl = pil != null ? pil["eclairages"] : null;
                r.LightsActive = B(ecl, "actif", false);
                if (r.LightsActive)
                    foreach (var ci in ecl["circuits"] ?? new JArray())
                    {
                        if (r.Circuits.Count >= Joins.MaxCircuits) break;
                        r.Circuits.Add(new CircuitConfig { Key = S(ci, "cle", ""), Name = S(ci, "nom", ""), Dimmable = B(ci, "gradable", true), Active = B(ci, "actif", true), InitialLevelPct = I(ci, "niveauInitial", 0) });
                    }
                var aud = pil != null ? pil["audio"] : null;
                r.AudioActive = B(aud, "actif", false);
                var audIni = aud != null ? aud["etatInitial"] : null;
                r.AudioInitialPlaying = B(audIni, "lecture", false);
                r.AudioInitialMuted = B(audIni, "muet", false);
                r.AudioInitialSource = I(audIni, "source", 1);
                if (r.AudioInitialSource < 1 || r.AudioInitialSource > Joins.MaxSources) r.AudioInitialSource = 1;
                r.AudioInitialVolume = I(audIni, "volume", 35);

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

        /// <summary>Espace virtuel « Tout le yacht » (id 0) : union des circuits par clé, audio actif si un espace l'est.</summary>
        public RoomConfig BuildAllRoom()
        {
            var all = new RoomConfig { Id = 0, Key = "all", Name = AllName, Intersystem = false, LightsActive = false, AudioActive = false };
            var seen = new Dictionary<string, CircuitConfig>();
            foreach (var r in Rooms)
            {
                if (r.LightsActive) all.LightsActive = true;
                if (r.AudioActive) all.AudioActive = true;
                for (int i = 0; i < r.Circuits.Count; i++)
                {
                    var ci = r.Circuits[i];
                    while (all.Circuits.Count <= i) all.Circuits.Add(null);
                    if (all.Circuits[i] == null || (!all.Circuits[i].Active && ci.Active))
                        all.Circuits[i] = new CircuitConfig { Key = ci.Key, Name = ci.Name, Dimmable = true, Active = ci.Active, InitialLevelPct = ci.InitialLevelPct };
                }
            }
            for (int i = 0; i < all.Circuits.Count; i++) if (all.Circuits[i] == null) all.Circuits[i] = new CircuitConfig { Active = false };
            return all;
        }

        public SceneConfig SceneByKey(string key) { foreach (var s in Scenes) if (s.Key == key) return s; return null; }
        public SceneConfig SceneById(int id) { foreach (var s in Scenes) if (s.Id == id) return s; return null; }
        public EffectConfig EffectById(int id) { foreach (var e in Effects) if (e.Id == id) return e; return null; }
        public EffectConfig EffectByKey(string key) { foreach (var e in Effects) if (e.Key == key) return e; return null; }
        public NamedItem SourceById(int id) { foreach (var s in Sources) if (s.Id == id) return s; return null; }
    }
}
