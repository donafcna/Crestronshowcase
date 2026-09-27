// Restaurant Kyoto Gardens — modèle de la configuration /user/restaurant-kyoto_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonctionnalité absente ou actif=false n'est ni
// routée par le C#, ni câblée dans le SIMPL, ni affichée par le GUI. Un circuit actif=false garde
// son index (join global stable) mais est ignoré partout.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace RestaurantKyoto
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
        public bool Exterior;                   // libellés de scène extérieurs
        public bool Intersystem = true;
        public bool LightsActive;
        public List<CircuitConfig> Circuits = new List<CircuitConfig>();
    }

    public class SceneConfig
    {
        public int Id;
        public string Key = "";
        public string Name = "";
        public string Note = "";
        public string ExteriorName = "";        // libellé pour la zone Extérieur (vide = même nom)
        public string ExteriorNote = "";
        public Dictionary<string, int> Levels = new Dictionary<string, int>();   // clé de circuit → %
    }

    public class HvacConfig
    {
        public bool Active;
        public double Min = 18, Max = 25, Step = 0.5;
        public double InitialSetpoint = 21.5;
        public double InitialTemperature = 21.2;
        public int InitialFreshAir = 68;
    }

    public class MusicConfig
    {
        public bool Active;
        public int VolumeMax = 80;
        public string Title = "";
        public string Sub = "";
        public List<NamedItem> Eqs = new List<NamedItem>();
        public bool InitialPlaying = true;
        public int InitialVolume = 38;
        public int InitialEq = 1;
    }

    public class ServiceStateConfig { public int Id; public string Key = ""; public string Name = ""; public string Text = ""; }

    public class ServiceConfig
    {
        public bool Active;
        public List<ServiceStateConfig> States = new List<ServiceStateConfig>();
        public string InitialKey = "fluide";
        public int InitialCovers = 32;
    }

    public class NamedItem { public int Id; public string Name = ""; }
    public class FloorConfig { public string Id = ""; public string Name = ""; }

    public class RestaurantKyotoConfig
    {
        public string Project = "Restaurant Kyoto Gardens";
        public string Version = "";
        public string Mode = "deploiement";
        public string RestaurantName = "";
        public string Summary = "";
        public string AllName = "Tout le restaurant";
        public string CustomSceneName = "Personnalisée";
        public string InitialSceneKey = "closed";
        public List<FloorConfig> Floors = new List<FloorConfig>();
        public List<SceneConfig> Scenes = new List<SceneConfig>();
        public HvacConfig Hvac = new HvacConfig();
        public MusicConfig Music = new MusicConfig();
        public ServiceConfig Service = new ServiceConfig();
        public List<RoomConfig> Rooms = new List<RoomConfig>();
        public Dictionary<string, RoomConfig> RoomsByKey = new Dictionary<string, RoomConfig>();
        public Dictionary<int, RoomConfig> RoomsById = new Dictionary<int, RoomConfig>();
        public string EiscIpId = "0xF0";
        public string EiscIp = "127.0.0.2";
        public bool EiscActive = true;

        private static bool B(JToken t, string k, bool def) { return t != null && t[k] != null && t[k].Type == JTokenType.Boolean ? (bool)t[k] : def; }
        private static int I(JToken t, string k, int def) { if (t == null || t[k] == null) return def; try { return (int)t[k]; } catch { return def; } }
        private static double F(JToken t, string k, double def) { if (t == null || t[k] == null) return def; try { return (double)t[k]; } catch { return def; } }
        private static string S(JToken t, string k, string def) { return t != null && t[k] != null && t[k].Type == JTokenType.String ? (string)t[k] : def; }

        public static RestaurantKyotoConfig Parse(JObject root)
        {
            var c = new RestaurantKyotoConfig();
            var meta = root["meta"];
            c.Project = S(meta, "projet", c.Project);
            c.Version = S(meta, "version", "");
            c.Mode = S(meta, "mode", "deploiement");

            var rest = root["restaurant"];
            c.RestaurantName = S(rest, "nom", "");
            c.Summary = S(rest, "sousTitre", "");
            c.AllName = S(rest, "toutLeRestaurant", c.AllName);
            c.CustomSceneName = S(rest, "scenePersonnalisee", c.CustomSceneName);
            c.InitialSceneKey = S(rest, "sceneInitiale", c.InitialSceneKey);

            if (rest != null)
            {
                var ext = rest["libellesScenesExterieur"];
                foreach (var sc in rest["scenes"] ?? new JArray())
                {
                    if (c.Scenes.Count >= Joins.MaxScenes) break;
                    var scene = new SceneConfig { Id = I(sc, "id", 0), Key = S(sc, "cle", ""), Name = S(sc, "nom", ""), Note = S(sc, "note", "") };
                    if (scene.Id < 1 || scene.Id > Joins.MaxScenes) continue;
                    if (sc["niveaux"] is JObject)
                        foreach (var kv in (JObject)sc["niveaux"]) { try { scene.Levels[kv.Key] = (int)kv.Value; } catch { } }
                    var e = ext != null && scene.Key.Length > 0 ? ext[scene.Key] : null;
                    scene.ExteriorName = S(e, "nom", "");
                    scene.ExteriorNote = S(e, "note", "");
                    c.Scenes.Add(scene);
                }

                var climat = rest["climat"];
                c.Hvac.Active = B(climat, "actif", false);
                var consigne = climat != null ? climat["consigne"] : null;
                c.Hvac.Min = F(consigne, "min", 18);
                c.Hvac.Max = F(consigne, "max", 25);
                c.Hvac.Step = F(consigne, "pas", 0.5);
                if (c.Hvac.Step <= 0) c.Hvac.Step = 0.5;
                if (c.Hvac.Max < c.Hvac.Min) c.Hvac.Max = c.Hvac.Min;
                var cIni = climat != null ? climat["etatInitial"] : null;
                c.Hvac.InitialSetpoint = F(cIni, "consigne", 21.5);
                c.Hvac.InitialTemperature = F(cIni, "temperature", 21.2);
                c.Hvac.InitialFreshAir = I(cIni, "airNeuf", 68);

                var musique = rest["musique"];
                c.Music.Active = B(musique, "actif", false);
                c.Music.VolumeMax = Math.Max(1, Math.Min(100, I(musique, "volumeMax", 80)));
                c.Music.Title = S(musique, "titre", "");
                c.Music.Sub = S(musique, "sousTitre", "");
                if (musique != null)
                    foreach (var eq in musique["eq"] ?? new JArray())
                    {
                        int id = I(eq, "id", 0);
                        if (id >= 1 && id <= Joins.MaxEq) c.Music.Eqs.Add(new NamedItem { Id = id, Name = S(eq, "nom", "") });
                    }
                var mIni = musique != null ? musique["etatInitial"] : null;
                c.Music.InitialPlaying = B(mIni, "lecture", true);
                c.Music.InitialVolume = I(mIni, "volume", 38);
                c.Music.InitialEq = I(mIni, "eq", 1);
                if (c.Music.InitialEq < 1 || c.Music.InitialEq > Joins.MaxEq) c.Music.InitialEq = 1;

                var service = rest["service"];
                c.Service.Active = B(service, "actif", false);
                if (service != null)
                    foreach (var st in service["etats"] ?? new JArray())
                    {
                        int id = I(st, "id", -1);
                        if (id < 0 || id >= Joins.MaxServices) continue;
                        c.Service.States.Add(new ServiceStateConfig { Id = id, Key = S(st, "cle", ""), Name = S(st, "nom", ""), Text = S(st, "texte", "") });
                    }
                c.Service.InitialKey = S(service, "etatInitial", "fluide");
                c.Service.InitialCovers = Math.Max(0, I(service, "couvertsInitial", 32));
            }

            foreach (var f in root["etages"] ?? new JArray()) c.Floors.Add(new FloorConfig { Id = S(f, "id", ""), Name = S(f, "nom", "") });

            foreach (var p in root["pieces"] ?? new JArray())
            {
                var r = new RoomConfig
                {
                    Id = I(p, "id", 0), Key = S(p, "cle", ""), Name = S(p, "nom", ""), Floor = S(p, "etage", ""),
                    Exterior = B(p, "exterieur", false), Intersystem = B(p, "intersystem", true)
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

        /// <summary>Zone virtuelle « Tout le restaurant » (id 0) : union des circuits par index, libellés intérieurs.</summary>
        public RoomConfig BuildAllRoom()
        {
            var all = new RoomConfig { Id = 0, Key = "all", Name = AllName, Intersystem = false, LightsActive = false, Exterior = false };
            foreach (var r in Rooms)
            {
                if (r.LightsActive) all.LightsActive = true;
                for (int i = 0; i < r.Circuits.Count; i++)
                {
                    var ci = r.Circuits[i];
                    while (all.Circuits.Count <= i) all.Circuits.Add(null);
                    if (all.Circuits[i] == null) all.Circuits[i] = new CircuitConfig { Key = ci.Key, Name = "", Dimmable = true, Active = false, InitialLevelPct = ci.InitialLevelPct };
                    var a = all.Circuits[i];
                    if (ci.Active) a.Active = true;                                   // actif quelque part = actif dans « tout »
                    if (a.Name.Length == 0 && !r.Exterior) a.Name = ci.Name;          // libellé intérieur de préférence
                    if (a.Key.Length == 0) a.Key = ci.Key;
                }
            }
            for (int i = 0; i < all.Circuits.Count; i++) if (all.Circuits[i] == null) all.Circuits[i] = new CircuitConfig { Active = false };
            return all;
        }

        public SceneConfig SceneByKey(string key) { foreach (var s in Scenes) if (s.Key == key) return s; return null; }
        public SceneConfig SceneById(int id) { foreach (var s in Scenes) if (s.Id == id) return s; return null; }
        public ServiceStateConfig ServiceById(int id) { foreach (var s in Service.States) if (s.Id == id) return s; return null; }
        public ServiceStateConfig ServiceByKey(string key) { foreach (var s in Service.States) if (s.Key == key) return s; return null; }
        public string EqName(int id) { foreach (var e in Music.Eqs) if (e.Id == id) return e.Name; return ""; }
    }
}
