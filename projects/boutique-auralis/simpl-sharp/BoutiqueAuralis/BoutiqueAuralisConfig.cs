// Boutique Auralis — modèle de la configuration /user/boutique-auralis_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonctionnalité absente ou actif=false n'est ni
// routée par le C#, ni câblée dans le SIMPL, ni affichée par le GUI. Un circuit actif=false garde
// son index (join global stable) mais est ignoré partout (lustre d'apparat hors du hall).

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace BoutiqueAuralis
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

    public class NamedItem { public int Id; public string Key = ""; public string Name = ""; }
    public class FloorConfig { public string Id = ""; public string Name = ""; }

    public class BlindsConfig
    {
        public bool Active;
        public List<NamedItem> Faces = new List<NamedItem>();   // 1..4
        public int OpenPct = 100, HalfPct = 50, ClosePct = 0;
        public int InitialPct = 100;
        public int PulseMs = 250;
    }

    public class WhiteLawStep { public int BeforeHour; public int Kelvin; }

    public class WhiteConfig
    {
        public bool Active;
        public int Min = 2700, Max = 6500, Step = 100;
        public int Initial = 3000;
        public bool AutoInitial;
        public int PeriodMs = 60000;
        public List<WhiteLawStep> Law = new List<WhiteLawStep>();   // triée par heure croissante
        public int DefaultKelvin = 3000;
    }

    public class ScentConfig
    {
        public bool Active;
        public bool InitialOn = true;
        public int InitialFragrance = 1;
        public int InitialDiffusion = 30;
        public List<NamedItem> Fragrances = new List<NamedItem>();
    }

    public class ScheduleConfig
    {
        public bool Active;
        public bool InitialOn;
        public int OpeningMin = 540, ClosingMin = 1140;   // 09:00 / 19:00
        public int StepMin = 15;
        public int PeriodMs = 30000;
        public string OpeningSceneKey = "opening", ClosingSceneKey = "closed";
    }

    public class BoutiqueAuralisConfig
    {
        public string Project = "Boutique Auralis";
        public string Version = "";
        public string Mode = "deploiement";
        public string BoutiqueName = "";
        public string AllName = "Toute la boutique";
        public string CustomSceneName = "Ambiance personnalisée";
        public string InitialSceneKey = "closed";
        public bool AllLightsActive;
        public BlindsConfig Blinds = new BlindsConfig();
        public WhiteConfig White = new WhiteConfig();
        public ScentConfig Scent = new ScentConfig();
        public ScheduleConfig Schedule = new ScheduleConfig();
        public List<FloorConfig> Floors = new List<FloorConfig>();
        public List<SceneConfig> Scenes = new List<SceneConfig>();
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

        /// <summary>« HH:MM » → minutes depuis minuit (0-1439) ; def si invalide.</summary>
        public static int ParseTime(string hhmm, int def)
        {
            if (string.IsNullOrEmpty(hhmm)) return def;
            var parts = hhmm.Trim().Split(':');
            int h, m;
            if (parts.Length != 2 || !int.TryParse(parts[0], out h) || !int.TryParse(parts[1], out m)) return def;
            if (h < 0 || h > 23 || m < 0 || m > 59) return def;
            return h * 60 + m;
        }

        public static BoutiqueAuralisConfig Parse(JObject root)
        {
            var c = new BoutiqueAuralisConfig();
            var meta = root["meta"];
            c.Project = S(meta, "projet", c.Project);
            c.Version = S(meta, "version", "");
            c.Mode = S(meta, "mode", "deploiement");

            var bq = root["boutique"];
            c.BoutiqueName = S(bq, "nom", "");
            c.AllName = S(bq, "touteLaBoutique", c.AllName);
            c.CustomSceneName = S(bq, "scenePersonnalisee", c.CustomSceneName);
            c.InitialSceneKey = S(bq, "sceneInitiale", c.InitialSceneKey);

            if (bq != null)
            {
                foreach (var sc in bq["scenes"] ?? new JArray())
                {
                    if (c.Scenes.Count >= Joins.MaxScenes) break;
                    var scene = new SceneConfig { Id = I(sc, "id", 0), Key = S(sc, "cle", ""), Name = S(sc, "nom", "") };
                    if (scene.Id < 1 || scene.Id > Joins.MaxScenes) continue;
                    if (sc["niveaux"] is JObject)
                        foreach (var kv in (JObject)sc["niveaux"]) { try { scene.Levels[kv.Key] = (int)kv.Value; } catch { } }
                    c.Scenes.Add(scene);
                }

                c.AllLightsActive = B(bq["eclairageGeneral"], "actif", false);

                var st = bq["stores"];
                c.Blinds.Active = B(st, "actif", false);
                if (c.Blinds.Active)
                {
                    foreach (var f in st["facades"] ?? new JArray())
                    {
                        int id = I(f, "id", 0);
                        if (id >= 1 && id <= Joins.MaxBlinds) c.Blinds.Faces.Add(new NamedItem { Id = id, Key = S(f, "cle", ""), Name = S(f, "nom", "") });
                    }
                    var pos = st["positions"];
                    c.Blinds.OpenPct = I(pos, "open", 100); c.Blinds.HalfPct = I(pos, "half", 50); c.Blinds.ClosePct = I(pos, "close", 0);
                    c.Blinds.InitialPct = I(st, "positionInitiale", 100);
                    c.Blinds.PulseMs = Math.Max(50, I(st, "impulsionMs", 250));
                    if (c.Blinds.Faces.Count == 0) c.Blinds.Active = false;
                }

                var bl = bq["blanc"];
                c.White.Active = B(bl, "actif", false);
                if (c.White.Active)
                {
                    c.White.Min = I(bl, "min", 2700); c.White.Max = I(bl, "max", 6500); c.White.Step = Math.Max(1, I(bl, "pas", 100));
                    c.White.Initial = I(bl, "initial", 3000);
                    c.White.AutoInitial = B(bl, "autoInitial", false);
                    c.White.PeriodMs = Math.Max(1000, I(bl, "periodeMs", 60000));
                    c.White.DefaultKelvin = I(bl, "kelvinDefaut", 3000);
                    foreach (var step in bl["loiHoraire"] ?? new JArray())
                        c.White.Law.Add(new WhiteLawStep { BeforeHour = I(step, "avantHeure", 24), Kelvin = I(step, "kelvin", c.White.DefaultKelvin) });
                    c.White.Law.Sort(delegate(WhiteLawStep a, WhiteLawStep b) { return a.BeforeHour.CompareTo(b.BeforeHour); });
                }

                var pf = bq["parfum"];
                c.Scent.Active = B(pf, "actif", false);
                if (c.Scent.Active)
                {
                    var ini = pf["etatInitial"];
                    c.Scent.InitialOn = B(ini, "diffusion", true);
                    c.Scent.InitialFragrance = I(ini, "fragrance", 1);
                    c.Scent.InitialDiffusion = I(ini, "intensite", 30);
                    foreach (var f in pf["fragrances"] ?? new JArray())
                    {
                        int id = I(f, "id", 0);
                        if (id >= 1 && id <= Joins.MaxFragrances) c.Scent.Fragrances.Add(new NamedItem { Id = id, Name = S(f, "nom", "") });
                    }
                    if (c.Scent.InitialFragrance < 1 || c.Scent.InitialFragrance > Joins.MaxFragrances) c.Scent.InitialFragrance = 1;
                }

                var hr = bq["horaires"];
                c.Schedule.Active = B(hr, "actif", false);
                if (c.Schedule.Active)
                {
                    var ini = hr["etatInitial"];
                    c.Schedule.InitialOn = B(ini, "actif", false);
                    c.Schedule.OpeningMin = ParseTime(S(ini, "ouverture", "09:00"), 540);
                    c.Schedule.ClosingMin = ParseTime(S(ini, "fermeture", "19:00"), 1140);
                    c.Schedule.StepMin = Math.Max(1, I(hr, "pasMinutes", 15));
                    c.Schedule.PeriodMs = Math.Max(1000, I(hr, "periodeMs", 30000));
                    c.Schedule.OpeningSceneKey = S(hr, "sceneOuverture", "opening");
                    c.Schedule.ClosingSceneKey = S(hr, "sceneFermeture", "closed");
                }

                var musique = bq["musique"];
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

        /// <summary>Espace virtuel « Toute la boutique » (id 0) : union des circuits par index, audio actif si un espace l'est.</summary>
        public RoomConfig BuildAllRoom()
        {
            var all = new RoomConfig { Id = 0, Key = "all", Name = AllName, Intersystem = false, LightsActive = false, AudioActive = false };
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
        public NamedItem FragranceById(int id) { foreach (var f in Scent.Fragrances) if (f.Id == id) return f; return null; }
        public bool HasFace(int n) { foreach (var f in Blinds.Faces) if (f.Id == n) return true; return false; }
    }
}
