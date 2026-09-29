// Showroom FTV Nyon — modèle de /user/showroom_config.json (lu au démarrage du slot 1).
// Même fichier que celui embarqué par le GUI (showroom_config.js) : une seule source, projects/showroom-ftv-nyon/showroom_config.json.
// Ce qui n'est pas déclaré n'existe pas : une fonction absente ou actif=false n'est ni routée, ni câblée, ni affichée.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace ShowroomNyon
{
    public class Effects
    {
        public string Scene = "";            // pièce : nom d'une scène d'éclairage
        public int Music;                    // id de service à démarrer (0 = aucun)
        public int Fav;                      // favori à lancer
        public string ScenePerRoom = "";     // maison : scène appliquée dans chaque pièce qui la possède
        public int LevelWithoutScene = -1;   // maison : niveau % des pièces sans cette scène (-1 = inchangé)
        public bool AllOff;                  // maison : tout éteindre
        public List<int> Rooms = new List<int>();   // maison : restreint à ces pièces (vide = toutes)

        public static Effects Parse(JToken t)
        {
            var e = new Effects();
            if (t == null || t.Type != JTokenType.Object) return e;
            e.Scene = (string)t["scene"] ?? "";
            e.Music = (int?)t["musique"] ?? 0;
            e.Fav = (int?)t["favori"] ?? 0;
            e.ScenePerRoom = (string)t["scenePieces"] ?? "";
            e.LevelWithoutScene = (int?)t["niveauSansScene"] ?? -1;
            e.AllOff = (bool?)t["toutEteindre"] ?? false;
            var p = t["pieces"] as JArray;
            if (p != null) foreach (var x in p) e.Rooms.Add((int)x);
            return e;
        }
    }

    public class NamedAction { public string Name = ""; public Effects Fx = new Effects(); }

    public class CircuitConfig { public string Name = ""; public bool Dimmable = true; public int InitialPct; }

    public class LightSceneConfig { public string Name = ""; public List<int> Levels = new List<int>(); }

    public class RoomConfig
    {
        public int Id;
        public string Name = "";
        public bool Intersystem = true;
        public List<NamedAction> Actions = new List<NamedAction>();
        public bool LightsActive;
        public List<CircuitConfig> Circuits = new List<CircuitConfig>();
        public List<LightSceneConfig> Scenes = new List<LightSceneConfig>();
        public bool AudioActive;
        public List<int> AudioServices = new List<int>();
        public int AudioInitialVolume = 30;
        public bool VideoActive;
        public List<int> VideoSources = new List<int>();
        public int VideoInitialVolume = 30;

        public int SceneByName(string name)
        {
            for (int i = 0; i < Scenes.Count; i++) if (Scenes[i].Name == name) return i + 1;
            return 0;
        }
    }

    public class ServiceConfig { public int Id; public string Name = ""; public bool Streaming; public int BrowseCount; }
    public class FavConfig { public int Id; public string Name = ""; public int Service; }
    public class TrackConfig { public string Title = "", Artist = "", Album = "", Cover = ""; public int Duration = 180; }
    public class SourceConfig { public int Id; public string Name = ""; }
    public class CameraConfig { public int Id; public string Name = ""; public int Room; public string Stream = ""; }

    public class ShowroomConfig
    {
        public string Project = "Showroom FTV Nyon", Version = "0.0.0", Mode = "deploiement";
        public bool TraceConsole;
        public List<NamedAction> HouseActions = new List<NamedAction>();
        public List<RoomConfig> Rooms = new List<RoomConfig>();
        public List<ServiceConfig> Services = new List<ServiceConfig>();
        public List<FavConfig> Favs = new List<FavConfig>();
        public List<TrackConfig> Tracks = new List<TrackConfig>();
        public List<SourceConfig> Sources = new List<SourceConfig>();
        public List<CameraConfig> Cameras = new List<CameraConfig>();
        public bool EiscActive = true;
        public string EiscIpId = "0xF0", EiscIp = "127.0.0.2";

        private static List<int> Ints(JToken t)
        {
            var l = new List<int>();
            var a = t as JArray;
            if (a != null) foreach (var x in a) l.Add((int)x);
            return l;
        }
        private static int Clamp(int v, int lo, int hi) { return Math.Max(lo, Math.Min(hi, v)); }

        public static ShowroomConfig Parse(JObject root)
        {
            var c = new ShowroomConfig();
            var meta = root["meta"];
            if (meta != null)
            {
                c.Project = (string)meta["projet"] ?? c.Project;
                c.Version = (string)meta["version"] ?? c.Version;
                c.Mode = (string)meta["mode"] ?? c.Mode;
                c.TraceConsole = (bool?)meta["tracesConsole"] ?? false;
            }
            var maison = root["maison"];
            if (maison != null && maison["actions"] is JArray)
                foreach (var a in (JArray)maison["actions"])
                    if (c.HouseActions.Count < Joins.MaxHouseActions) c.HouseActions.Add(new NamedAction { Name = (string)a["nom"] ?? "", Fx = Effects.Parse(a["effets"]) });

            var mus = root["musique"];
            if (mus != null)
            {
                if (mus["services"] is JArray)
                    foreach (var s in (JArray)mus["services"])
                    {
                        int id = (int?)s["id"] ?? 0;
                        if (id < 1 || id > Joins.MaxServices) continue;
                        var br = s["parcourir"] as JArray;
                        c.Services.Add(new ServiceConfig { Id = id, Name = (string)s["nom"] ?? "", Streaming = (string)s["type"] == "streaming", BrowseCount = br == null ? 0 : Math.Min(br.Count, Joins.MaxBrowse) });
                    }
                if (mus["favoris"] is JArray)
                    foreach (var f in (JArray)mus["favoris"])
                    {
                        int id = (int?)f["id"] ?? 0;
                        if (id < 1 || id > Joins.MaxFavs) continue;
                        c.Favs.Add(new FavConfig { Id = id, Name = (string)f["nom"] ?? "", Service = (int?)f["service"] ?? 1 });
                    }
                if (mus["pistes"] is JArray)
                    foreach (var t in (JArray)mus["pistes"])
                        c.Tracks.Add(new TrackConfig { Title = (string)t["titre"] ?? "", Artist = (string)t["artiste"] ?? "", Album = (string)t["album"] ?? "", Cover = (string)t["pochette"] ?? "", Duration = Math.Max(1, (int?)t["duree"] ?? 180) });
            }
            var vid = root["video"];
            if (vid != null && vid["sources"] is JArray)
                foreach (var s in (JArray)vid["sources"])
                {
                    int id = (int?)s["id"] ?? 0;
                    if (id >= 1 && id <= Joins.MaxSources) c.Sources.Add(new SourceConfig { Id = id, Name = (string)s["nom"] ?? "" });
                }
            if (root["cameras"] is JArray)
            {
                int i = 0;
                foreach (var k in (JArray)root["cameras"])
                {
                    if (++i > Joins.MaxCameras) break;
                    c.Cameras.Add(new CameraConfig { Id = i, Name = (string)k["nom"] ?? "", Room = (int?)k["piece"] ?? 0, Stream = (string)k["flux"] ?? "" });
                }
            }
            if (root["pieces"] is JArray)
                foreach (var p in (JArray)root["pieces"])
                {
                    int id = (int?)p["id"] ?? 0;
                    if (id < 1 || id > Joins.MaxRooms) continue;
                    var r = new RoomConfig { Id = id, Name = (string)p["nom"] ?? ("Room " + id), Intersystem = (bool?)p["intersystem"] ?? true };
                    if (p["actions"] is JArray)
                        foreach (var a in (JArray)p["actions"])
                            if (r.Actions.Count < Joins.MaxActions) r.Actions.Add(new NamedAction { Name = (string)a["nom"] ?? "", Fx = Effects.Parse(a["effets"]) });
                    var pl = p["pilotages"];
                    var ec = pl == null ? null : pl["eclairages"];
                    if (ec != null && ((bool?)ec["actif"] ?? false))
                    {
                        r.LightsActive = true;
                        if (ec["circuits"] is JArray)
                            foreach (var ci in (JArray)ec["circuits"])
                                if (r.Circuits.Count < Joins.MaxCircuits)
                                    r.Circuits.Add(new CircuitConfig { Name = (string)ci["nom"] ?? "", Dimmable = (bool?)ci["gradable"] ?? true, InitialPct = Clamp((int?)ci["niveauInitial"] ?? 0, 0, 100) });
                        if (ec["scenes"] is JArray)
                            foreach (var sc in (JArray)ec["scenes"])
                                if (r.Scenes.Count < Joins.MaxScenes)
                                {
                                    var ls = new LightSceneConfig { Name = (string)sc["nom"] ?? "" };
                                    foreach (int v in Ints(sc["niveaux"])) ls.Levels.Add(Clamp(v, 0, 100));
                                    r.Scenes.Add(ls);
                                }
                    }
                    var au = pl == null ? null : pl["audio"];
                    if (au != null && ((bool?)au["actif"] ?? false))
                    {
                        r.AudioActive = true;
                        r.AudioServices = Ints(au["services"]);
                        r.AudioInitialVolume = Clamp((int?)au["volumeInitial"] ?? 30, 0, 100);
                    }
                    var vi = pl == null ? null : pl["video"];
                    if (vi != null && ((bool?)vi["actif"] ?? false))
                    {
                        r.VideoActive = true;
                        r.VideoSources = Ints(vi["sources"]);
                        r.VideoInitialVolume = Clamp((int?)vi["volumeInitial"] ?? 30, 0, 100);
                    }
                    c.Rooms.Add(r);
                }
            var ct = root["contrat"];
            var eisc = ct == null ? null : ct["eisc"];
            if (eisc != null)
            {
                c.EiscActive = (bool?)eisc["actif"] ?? true;
                c.EiscIpId = (string)eisc["ipid"] ?? c.EiscIpId;
                c.EiscIp = (string)eisc["adresseIp"] ?? c.EiscIp;
            }
            return c;
        }

        public ServiceConfig Service(int id) { foreach (var s in Services) if (s.Id == id) return s; return null; }
        public SourceConfig Source(int id) { foreach (var s in Sources) if (s.Id == id) return s; return null; }
        public FavConfig Fav(int id) { foreach (var f in Favs) if (f.Id == id) return f; return null; }
    }
}
