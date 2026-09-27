// FTV Home — modèle de la configuration /user/ftvhome_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonctionnalité absente ou actif=false n'est ni
// routée par le C#, ni câblée dans le SIMPL, ni affichée par le GUI.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace FtvHome
{
    public class CircuitConfig
    {
        public string Name;
        public bool Dimmable = true;
        public int InitialLevelPct;
    }

    public class ShadeConfig
    {
        public string Name;
        public int InitialPositionPct;
    }

    public class HvacConfig
    {
        public bool Active;
        public double Min = 16, Max = 30, Step = 0.5;
        public double InitialTemp = 21.0, InitialSetpoint = 21.0;
        public string InitialMode = "auto";   // heat | cool | auto
        public bool InitialFanOn;
        public bool InitialHold;
        public int InitialHumidity = 45;
        public bool InitialHumidityCtrl;
    }

    public class RoomConfig
    {
        public int Id;
        public string Key;
        public string Name;
        public string Floor;
        public bool Intersystem = true;
        public bool Favorite;
        public bool LightsActive;
        public List<CircuitConfig> Circuits = new List<CircuitConfig>();
        public bool ShadesActive;
        public List<ShadeConfig> Shades = new List<ShadeConfig>();
        public HvacConfig Hvac = new HvacConfig();
        public bool VideoActive;
        public int DefaultDisplay;
        public bool AudioActive;
        public bool AudioInitialPlaying;
        public int AudioInitialFav;
        public int AudioInitialVolume = 30;
        public bool LockActive;
        public bool LockInitialLocked = true;
    }

    public class SceneConfig
    {
        public int Id;
        public string Key;
        public string Name;
        public int LightsDefaultPct;                       // -1 = ne pas toucher
        public Dictionary<string, int> LightsByRoom = new Dictionary<string, int>();
        public int ShadesPct = -1;                         // -1 = ne pas toucher
        public bool LockAll;
        public bool StopMusic;
    }

    public class NamedItem { public int Id; public string Name; public string Sub; public string Tint; public bool Channels; public string RoomKey; }

    public class HomeConfig
    {
        public string Project = "FTV Home";
        public string Version = "";
        public string Mode = "deploiement";
        public string HouseName = "";
        public string HouseStatus = "";
        public bool AccessActive, AccessFrontDoor, AccessGate, AccessGarage;
        public int GarageClosingMs = 1800;
        public bool PoolActive, SpaActive, VideoActive;
        public List<NamedItem> Displays = new List<NamedItem>();
        public List<NamedItem> Sources = new List<NamedItem>();
        public List<NamedItem> Channels = new List<NamedItem>();
        public List<NamedItem> Services = new List<NamedItem>();
        public List<NamedItem> Favs = new List<NamedItem>();
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

        public static HomeConfig Parse(JObject root)
        {
            var c = new HomeConfig();
            var meta = root["meta"];
            c.Project = S(meta, "projet", c.Project);
            c.Version = S(meta, "version", "");
            c.Mode = S(meta, "mode", "deploiement");

            var maison = root["maison"];
            c.HouseName = S(maison, "nom", "");
            c.HouseStatus = S(maison, "etatBandeau", "");
            var acces = maison != null ? maison["acces"] : null;
            c.AccessActive = B(acces, "actif", false);
            c.AccessFrontDoor = B(acces, "porteEntree", true);
            c.AccessGate = B(acces, "portail", true);
            c.AccessGarage = B(acces, "garage", true);
            c.GarageClosingMs = I(acces, "garageFermetureMs", 1800);
            c.PoolActive = B(maison != null ? maison["piscine"] : null, "actif", false);
            c.SpaActive = B(maison != null ? maison["spa"] : null, "actif", false);
            var video = maison != null ? maison["video"] : null;
            c.VideoActive = B(video, "actif", false);
            if (video != null)
            {
                foreach (var d in video["ecrans"] ?? new JArray()) { int id = I(d, "id", 0); if (id >= 1 && id <= Joins.MaxDisplays) c.Displays.Add(new NamedItem { Id = id, Name = S(d, "nom", ""), RoomKey = S(d, "piece", "") }); }
                foreach (var s in video["sources"] ?? new JArray()) { int id = I(s, "id", 0); if (id >= 1 && id <= Joins.MaxSources) c.Sources.Add(new NamedItem { Id = id, Name = S(s, "nom", ""), Channels = B(s, "chaines", false) }); }
                foreach (var ch in video["chaines"] ?? new JArray()) { int id = I(ch, "id", 0); if (id >= 1 && id <= Joins.MaxChannels) c.Channels.Add(new NamedItem { Id = id, Name = S(ch, "nom", ""), Sub = S(ch, "numero", "") }); }
            }
            var musique = maison != null ? maison["musique"] : null;
            if (musique != null)
            {
                foreach (var s in musique["services"] ?? new JArray()) if (c.Services.Count < Joins.MaxServices) c.Services.Add(new NamedItem { Id = c.Services.Count + 1, Name = S(s, "nom", "") });
                foreach (var f in musique["favoris"] ?? new JArray()) if (c.Favs.Count < Joins.MaxFavs) c.Favs.Add(new NamedItem { Id = c.Favs.Count + 1, Name = S(f, "titre", ""), Sub = S(f, "sousTitre", ""), Tint = S(f, "couleur", "") });
            }
            if (maison != null)
            {
                foreach (var sc in maison["scenes"] ?? new JArray())
                {
                    var scene = new SceneConfig { Id = I(sc, "id", 0), Key = S(sc, "cle", ""), Name = S(sc, "nom", "") };
                    var ecl = sc["eclairages"];
                    scene.LightsDefaultPct = ecl == null ? -1 : I(ecl, "defaut", -1);
                    if (ecl != null && ecl["pieces"] is JObject)
                        foreach (var kv in (JObject)ecl["pieces"]) { try { scene.LightsByRoom[kv.Key] = (int)kv.Value; } catch { } }
                    scene.ShadesPct = I(sc, "occultants", -1);
                    scene.LockAll = B(sc, "verrouiller", false);
                    scene.StopMusic = B(sc, "musiqueStop", false);
                    c.Scenes.Add(scene);
                }
            }

            foreach (var p in root["pieces"] ?? new JArray())
            {
                var r = new RoomConfig
                {
                    Id = I(p, "id", 0), Key = S(p, "cle", ""), Name = S(p, "nom", ""), Floor = S(p, "etage", ""),
                    Intersystem = B(p, "intersystem", true), Favorite = B(p, "favori", false)
                };
                if (r.Id < 1 || r.Id > Joins.MaxRooms) continue;
                var pil = p["pilotages"];
                var ecl = pil != null ? pil["eclairages"] : null;
                r.LightsActive = B(ecl, "actif", false);
                if (r.LightsActive)
                    foreach (var ci in ecl["circuits"] ?? new JArray())
                    {
                        if (r.Circuits.Count >= Joins.MaxCircuits) break;
                        r.Circuits.Add(new CircuitConfig { Name = S(ci, "nom", ""), Dimmable = B(ci, "gradable", true), InitialLevelPct = I(ci, "niveauInitial", 0) });
                    }
                var occ = pil != null ? pil["occultants"] : null;
                r.ShadesActive = B(occ, "actif", false);
                if (r.ShadesActive)
                    foreach (var m in occ["moteurs"] ?? new JArray())
                    {
                        if (r.Shades.Count >= Joins.MaxShades) break;
                        r.Shades.Add(new ShadeConfig { Name = S(m, "nom", ""), InitialPositionPct = I(m, "positionInitiale", 0) });
                    }
                var cvc = pil != null ? pil["cvc"] : null;
                r.Hvac.Active = B(cvc, "actif", false);
                if (r.Hvac.Active)
                {
                    var cons = cvc["consigne"];
                    r.Hvac.Min = D(cons, "min", 16); r.Hvac.Max = D(cons, "max", 30); r.Hvac.Step = D(cons, "pas", 0.5);
                    var ini = cvc["etatInitial"];
                    r.Hvac.InitialTemp = D(ini, "temperature", 21); r.Hvac.InitialSetpoint = D(ini, "consigne", 21);
                    r.Hvac.InitialMode = S(ini, "mode", "auto");
                    r.Hvac.InitialFanOn = S(ini, "ventilation", "auto") == "on";
                    r.Hvac.InitialHold = B(ini, "planificationPause", false);
                    r.Hvac.InitialHumidity = I(ini, "humidite", 45);
                    r.Hvac.InitialHumidityCtrl = B(ini, "controleHumidite", false);
                }
                var vid = pil != null ? pil["video"] : null;
                r.VideoActive = B(vid, "actif", false) && c.VideoActive;
                r.DefaultDisplay = I(vid, "ecranParDefaut", 0);
                if (r.DefaultDisplay < 1 || r.DefaultDisplay > Joins.MaxDisplays) r.DefaultDisplay = 0;
                var aud = pil != null ? pil["audio"] : null;
                r.AudioActive = B(aud, "actif", false);
                var audIni = aud != null ? aud["etatInitial"] : null;
                r.AudioInitialPlaying = B(audIni, "lecture", false);
                r.AudioInitialFav = I(audIni, "favori", 0);
                r.AudioInitialVolume = I(audIni, "volume", 30);
                var ser = pil != null ? pil["serrure"] : null;
                r.LockActive = B(ser, "actif", false);
                r.LockInitialLocked = B(ser != null ? ser["etatInitial"] : null, "verrouillee", true);

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
    }
}
