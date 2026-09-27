// Restaurant Kyoto Gardens — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : registre des zones et de leurs circuits (restaurant-kyoto_config.json), zone affichée par
// chaque écran (0 = tout le restaurant), scènes PAR ZONE, application des actions, feedback des écrans,
// pont EISC vers le slot 2 (SIMPL), globaux restaurant (climat, musique, service, couverts).
//
// Chaîne réelle : écran (TSW-1070 / XPanel / iPad / iPhone)
//                   → C# slot 1 : action appliquée à la zone affichée par CET écran (ou à toutes)
//                   → EISC IP-ID F0 : Room_Select# (a10) posé, puis impulsion sur le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers
//                   → EISC : mesures _Actual (blocs zone 1000+, globaux restaurant) → C# → feedback des écrans.
//
// Contrat : Joins.cs ↔ config/restaurant-kyoto_config.json → contrat (tools/check-contract.js).

using System;
using System.Collections.Generic;
using System.Text;
using Crestron.SimplSharp;
using Crestron.SimplSharpPro;
using Crestron.SimplSharpPro.CrestronThread;
using Crestron.SimplSharpPro.DeviceSupport;
using Crestron.SimplSharpPro.EthernetCommunication;
using Crestron.SimplSharpPro.UI;
using Newtonsoft.Json.Linq;

namespace RestaurantKyoto
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/restaurant-kyoto_config.json";
        private const string Ch5ProjectName = "restaurantkyoto";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int ConfigChunkSize = 200;
        private const int AllRoom = 0;                    // Room_Select# = 0 → tout le restaurant

        private RestaurantKyotoConfig _cfg;
        private string _configMinified = "";
        private string _configHash = "";
        private readonly List<string> _configChunks = new List<string>();
        private readonly Dictionary<uint, int> _configChunkPos = new Dictionary<uint, int>();

        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _roomOrder = new List<int>();
        private RoomState _all;                           // zone virtuelle « Tout le restaurant » (id 0, jamais sur l'EISC)
        private readonly RestaurantState _rest = new RestaurantState();

        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private EthernetIntersystemCommunications _eisc;
        private readonly Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private readonly CCriticalSection _lock = new CCriticalSection();
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;

        public ControlSystem() : base()
        {
            try { Thread.MaxNumberOfUserThreads = 20; }
            catch (Exception e) { ErrorLog.Error("KYOTO ctor: {0}", e.Message); }
        }

        // =====================================================================================
        // Démarrage
        // =====================================================================================
        public override void InitializeSystem()
        {
            try
            {
                try
                {
                    var asm = System.Reflection.Assembly.GetExecutingAssembly();
                    _cpzName = System.IO.Path.GetFileName(asm.Location);
                    if (System.IO.File.Exists(asm.Location)) _cpzDate = System.IO.File.GetLastWriteTime(asm.Location).ToString("dd/MM/yyyy HH:mm:ss");
                }
                catch { }

                LoadConfiguration();
                BuildState();

                var tsw = new Tsw1070GV(TswIpId, this);
                RegisterUserInterface(tsw);
                RegisterUserInterface(new XpanelForHtml5(XpanelIpId, this));
                var ipad = new CrestronOne(IpadIpId, this); ipad.ParameterProjectName.Value = Ch5ProjectName; RegisterUserInterface(ipad);
                var iphone = new CrestronOne(IphoneIpId, this); iphone.ParameterProjectName.Value = Ch5ProjectName; RegisterUserInterface(iphone);

                InitializeEisc();

                foreach (var p in _panels)
                {
                    if (p == _eisc) continue;
                    _activeRoomPerDevice[p.ID] = DefaultRoom();
                }
                RefreshAll();

                CrestronConsole.AddNewConsoleCommand(CmdState, "kyotostate", "Etat des zones Restaurant Kyoto (kyotostate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "kyotoroom", "Zone affichee par ecran : kyotoroom <ipid hex> <zone, 0 = tout>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("kyototrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "kyototrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("KYOTO: {0} v{1} — {2} zones, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("KYOTO InitializeSystem: {0}", e.ToString()); }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("KYOTO: " + fmt, a); }

        // -------------------------------------------------------------------------------------
        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("KYOTO: {0} absent — aucune zone.", ConfigPath); _cfg = new RestaurantKyotoConfig(); return; }
                string raw = System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8);
                var root = JObject.Parse(raw);
                _cfg = RestaurantKyotoConfig.Parse(root);
                _configMinified = root.ToString(Newtonsoft.Json.Formatting.None);
                _configHash = ComputeHash(_configMinified);
                _configChunks.Clear();
                for (int i = 0; i < _configMinified.Length; i += ConfigChunkSize)
                    _configChunks.Add(_configMinified.Substring(i, Math.Min(ConfigChunkSize, _configMinified.Length - i)));
                CrestronConsole.PrintLine("KYOTO: configuration chargee ({0} car., {1} chunks, empreinte {2}).", _configMinified.Length, _configChunks.Count, _configHash);
            }
            catch (Exception e) { ErrorLog.Error("KYOTO: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new RestaurantKyotoConfig(); }
        }

        private static string ComputeHash(string s)
        {
            unchecked { uint h = 2166136261; foreach (char c in s) { h ^= c; h *= 16777619; } return h.ToString("X8"); }
        }

        private void BuildState()
        {
            _rooms.Clear(); _roomOrder.Clear();
            var sc = _cfg.SceneByKey(_cfg.InitialSceneKey);
            int initialScene = sc != null ? sc.Id : 0;
            foreach (var rc in _cfg.Rooms) { _rooms[rc.Id] = new RoomState(rc, initialScene); _roomOrder.Add(rc.Id); }
            _all = new RoomState(_cfg.BuildAllRoom(), initialScene);

            _rest.Setpoint = ClampSetpoint(_cfg.Hvac.InitialSetpoint);
            _rest.Temperature = _cfg.Hvac.InitialTemperature;
            _rest.FreshAir = RestaurantState.ClampInt(_cfg.Hvac.InitialFreshAir, 0, 100);
            _rest.MusicPlaying = _cfg.Music.Active && _cfg.Music.InitialPlaying;
            _rest.MusicVolume = ClampVolume(_cfg.Music.InitialVolume);
            _rest.MusicEq = _cfg.Music.InitialEq;
            var st = _cfg.ServiceByKey(_cfg.Service.InitialKey);
            _rest.Service = st != null ? st.Id : 0;
            _rest.Covers = _cfg.Service.InitialCovers;
        }

        private int DefaultRoom() { return _roomOrder.Count > 0 ? _roomOrder[0] : AllRoom; }   // le GUI démarre sur la première zone (Extérieur)
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoomPerDevice.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }
        private RoomState Room(int id) { if (id == AllRoom) { SyncAll(); return _all; } RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }
        private bool RoomExists(int id) { return id == AllRoom || _rooms.ContainsKey(id); }

        /// <summary>La zone virtuelle « Tout le restaurant » est toujours dérivée des zones réelles : niveau = moyenne par
        /// index de circuit (zones où ce circuit est actif), scène = celle commune à toutes les zones sinon 0.</summary>
        private void SyncAll()
        {
            if (_all == null) return;
            for (int i = 0; i < _all.LightPct.Length; i++)
            {
                int n = 0, sum = 0;
                foreach (int id in _roomOrder) { var r = _rooms[id]; if (r.CircuitActive(i)) { n++; sum += r.LightPct[i]; } }
                _all.LightPct[i] = n == 0 ? 0 : (int)Math.Round(sum / (double)n);
            }
            _all.Scene = AllScene();
        }

        /// <summary>Zones réelles visées par une action : toutes si l'écran affiche « Tout le restaurant ».</summary>
        private IEnumerable<RoomState> Targets(int roomId)
        {
            if (roomId == AllRoom) { foreach (int id in _roomOrder) yield return _rooms[id]; }
            else { var r = Room(roomId); if (r != null) yield return r; }
        }

        // -------------------------------------------------------------------------------------
        private void RegisterUserInterface(BasicTriList dev)
        {
            dev.SigChange += OnSigChange;
            dev.OnlineStatusChange += OnOnlineStatus;
            var res = dev.Register();
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("KYOTO: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("KYOTO: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("KYOTO: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                RegisterUserInterface(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("KYOTO: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { PushAllRoomBlocks(); PushRestaurantToEisc(); PushEiscActiveRoom(DefaultRoom()); return; }
                if (!_activeRoomPerDevice.ContainsKey(p.ID)) _activeRoomPerDevice[p.ID] = DefaultRoom();
                PushSystemInfo(p);
                PushRoomToPanel(p, _activeRoomPerDevice[p.ID]);
                PushRestaurantToPanel(p);
            }
            catch (Exception e) { ErrorLog.Error("KYOTO OnOnlineStatus {0:X2} : {1}", p.ID, e.ToString()); }
            finally { _lock.Leave(); }
        }

        // =====================================================================================
        // Réception des signaux
        // =====================================================================================
        private void OnSigChange(BasicTriList dev, SigEventArgs args)
        {
            try
            {
                _lock.Enter();
                if (_eisc != null && dev == _eisc) { OnEiscSignal(args); return; }
                uint j = args.Sig.Number;
                switch (args.Sig.Type)
                {
                    case eSigType.Bool:
                        MirrorToEisc(dev, args);
                        if (args.Sig.BoolValue) HandleDigitalPress(dev, j);
                        break;
                    case eSigType.UShort:
                        if (HandleAnalog(dev, j, args.Sig.UShortValue)) MirrorToEisc(dev, args);
                        break;
                }
            }
            catch (Exception e) { ErrorLog.Error("KYOTO OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
            finally { _lock.Leave(); }
        }

        /// <summary>Recopie l'action vers le slot 2 : Room_Select# (a10) + Room_Active_nn d'abord, puis le même join.</summary>
        private void MirrorToEisc(BasicTriList dev, SigEventArgs args)
        {
            if (_eisc == null) return;
            uint j = args.Sig.Number;
            if (args.Sig.Type == eSigType.Bool && (j == Joins.ConfigResync || (j >= Joins.RoomSelectAll && j <= Joins.RoomSelectBase + Joins.MaxRooms))) return;
            if (args.Sig.Type == eSigType.UShort && (j == Joins.ConfigChunkAck || j == Joins.RoomSelect)) return;
            try
            {
                int roomId = ActiveRoom(dev);
                PushEiscActiveRoom(roomId);
                if (args.Sig.Type == eSigType.Bool) _eisc.BooleanInput[j].BoolValue = args.Sig.BoolValue;
                else _eisc.UShortInput[j].UShortValue = BoundedAnalog(roomId, j, args.Sig.UShortValue);   // valeur bornée par l'état, jamais brute
            }
            catch { }
        }

        /// <summary>Valeur analogique telle que retenue par l'état (bornes du contrat), pour la recopie EISC.</summary>
        private ushort BoundedAnalog(int roomId, uint j, ushort raw)
        {
            if (j == Joins.MusicVolume) return (ushort)_rest.MusicVolume;
            if (j == Joins.HvacSetpoint) return SetpointRaw();
            var r = Room(roomId);
            if (r == null) return raw;
            if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits) { int i = (int)(j - Joins.LightLevelBase) - 1; return i < r.LightPct.Length ? ToRaw(r.LightPct[i]) : raw; }
            return raw;
        }

        private void PushEiscActiveRoom(int roomId)
        {
            if (_eisc == null) return;
            _eisc.UShortInput[Joins.RoomSelect].UShortValue = (ushort)roomId;
            _eisc.BooleanInput[Joins.RoomSelectAll].BoolValue = roomId == AllRoom;
            for (int n = 1; n <= Joins.MaxRooms; n++) _eisc.BooleanInput[Joins.RoomSelectBase + (uint)n].BoolValue = n == roomId;
        }

        private void HandleDigitalPress(BasicTriList dev, uint j)
        {
            int roomId = ActiveRoom(dev);
            Trace("appui d{0} ecran {1:X2} zone {2}", j, dev.ID, roomId);

            if (j == Joins.RoomSelectAll) { SelectRoom(dev, AllRoom); return; }
            if (j > Joins.RoomSelectBase && j <= Joins.RoomSelectBase + Joins.MaxRooms) { SelectRoom(dev, (int)(j - Joins.RoomSelectBase)); return; }
            if (j == Joins.ConfigResync) { StartConfigSend(dev); return; }

            // ---- restaurant (globaux non zonés)
            bool isGlobal = true;
            if (j == Joins.HvacSetpointUp && _cfg.Hvac.Active) _rest.Setpoint = ClampSetpoint(_rest.Setpoint + _cfg.Hvac.Step);
            else if (j == Joins.HvacSetpointDown && _cfg.Hvac.Active) _rest.Setpoint = ClampSetpoint(_rest.Setpoint - _cfg.Hvac.Step);
            else if (j == Joins.MusicPlayPause && _cfg.Music.Active) _rest.MusicPlaying = !_rest.MusicPlaying;
            else if (j > Joins.MusicEqBase && j <= Joins.MusicEqBase + Joins.MaxEq && _cfg.Music.Active)
            {
                int eq = (int)(j - Joins.MusicEqBase);
                if (_cfg.EqName(eq).Length > 0) _rest.MusicEq = eq; else isGlobal = false;
            }
            else if (j >= Joins.ServiceFluide && j <= Joins.ServiceCuisine && _cfg.Service.Active)
            {
                int st = (int)(j - Joins.ServiceFluide);
                if (_cfg.ServiceById(st) != null) _rest.Service = st; else isGlobal = false;
            }
            else isGlobal = false;
            if (isGlobal) { PushRestaurantEverywhere(); return; }

            // ---- zone affichée (ou toutes)
            var r = Room(roomId);
            if (r == null) return;
            bool done = true;
            if (j >= Joins.SceneWelcome && j <= Joins.SceneClosed) done = RunScene(roomId, (int)(j - Joins.SceneWelcome + 1));
            else if (j == Joins.LightsAllOn && r.Cfg.LightsActive) { foreach (var t in Targets(roomId)) { SetAllLights(t, 100); t.Scene = 0; } }
            else if (j == Joins.LightsAllOff && r.Cfg.LightsActive) { foreach (var t in Targets(roomId)) { SetAllLights(t, 0); t.Scene = 0; } }
            else if (j > Joins.LightToggleBase && j <= Joins.LightToggleBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightToggleBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { int pct = r.LightPct[i] > 0 ? 0 : 100; SetLight(roomId, i, pct); }
                else done = false;
            }
            else done = false;
            if (done) PushRoomsEverywhere(roomId);
        }

        private bool HandleAnalog(BasicTriList dev, uint j, ushort v)
        {
            if (j == Joins.RoomSelect) { if (v <= Joins.MaxRooms) SelectRoom(dev, v); return false; }
            if (j == Joins.ConfigChunkAck) { OnConfigChunkAck(dev, v); return false; }
            int roomId = ActiveRoom(dev);
            Trace("analog a{0}={1} ecran {2:X2} zone {3}", j, v, dev.ID, roomId);

            // ---- restaurant (globaux non zonés)
            if (j == Joins.MusicVolume && _cfg.Music.Active) { _rest.MusicVolume = ClampVolume(v); PushRestaurantEverywhere(); return true; }
            if (j == Joins.HvacSetpoint && _cfg.Hvac.Active) { _rest.Setpoint = ClampSetpoint(v / 10.0); PushRestaurantEverywhere(); return true; }

            // ---- zone affichée (ou toutes)
            var r = Room(roomId);
            if (r == null) return false;
            if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightLevelBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { SetLight(roomId, i, ToPct(v)); PushRoomsEverywhere(roomId); return true; }
                return false;
            }
            return false;
        }

        // =====================================================================================
        // Logique métier
        // =====================================================================================
        private static int ToPct(ushort v) { return (int)Math.Round(v * 100.0 / 65535.0); }
        private static ushort ToRaw(int pct) { return (ushort)Math.Round(RoomState.Clamp(pct) * 65535.0 / 100.0); }
        private int ClampVolume(int v) { return RestaurantState.ClampInt(v, 0, _cfg.Music.VolumeMax); }
        private double ClampSetpoint(double v)
        {
            double step = _cfg.Hvac.Step > 0 ? _cfg.Hvac.Step : 0.5;
            return Math.Max(_cfg.Hvac.Min, Math.Min(_cfg.Hvac.Max, Math.Round(v / step) * step));
        }
        private ushort SetpointRaw() { return (ushort)Math.Round(_rest.Setpoint * 10); }
        /// <summary>Un circuit inactif reste à 0 ; un circuit non gradable ne connaît que 0 et 100 %.</summary>
        private static int LevelFor(RoomState r, int i, int pct)
        {
            if (!r.CircuitActive(i)) return 0;
            return r.Cfg.Circuits[i].Dimmable ? RoomState.Clamp(pct) : (pct > 0 ? 100 : 0);
        }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (!RoomExists(roomId)) return;
            _activeRoomPerDevice[dev.ID] = roomId;
            PushEiscActiveRoom(roomId);
            PushRoomToPanel(dev, roomId);
            PushRestaurantToPanel(dev);
            PushAllRoomBlocks();   // Rnn_Room_Displayed_fb
        }

        private void SetAllLights(RoomState r, int pct) { for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = LevelFor(r, i, pct); }

        /// <summary>Curseur ou bascule : la scène de chaque zone touchée devient « Personnalisée » (comportement du GUI).
        /// roomId = 0 → toutes les zones ; la zone virtuelle « tout » n'est jamais écrite, elle est recalculée (SyncAll).</summary>
        private void SetLight(int roomId, int i, int pct)
        {
            foreach (var t in Targets(roomId)) if (i < t.LightPct.Length) { t.LightPct[i] = LevelFor(t, i, pct); t.Scene = 0; }
        }

        /// <summary>Scène par zone : niveaux par clé de circuit sur la zone visée, ou sur toutes les zones (applyAllScene du GUI).</summary>
        private bool RunScene(int roomId, int id)
        {
            var sc = _cfg.SceneById(id);
            if (sc == null) return false;
            foreach (var t in Targets(roomId)) ApplySceneTo(t, sc);
            Trace("scene {0} ({1}) appliquee a la zone {2}", sc.Id, sc.Name, roomId);
            return true;
        }

        private static void ApplySceneTo(RoomState r, SceneConfig sc)
        {
            if (!r.Cfg.LightsActive) return;
            for (int i = 0; i < r.LightPct.Length; i++)
            {
                int pct;
                if (r.CircuitActive(i) && sc.Levels.TryGetValue(r.Cfg.Circuits[i].Key, out pct)) r.LightPct[i] = LevelFor(r, i, pct);
            }
            r.Scene = sc.Id;
        }

        /// <summary>Scène de « Tout le restaurant » : celle commune à toutes les zones, sinon personnalisée (0).</summary>
        private int AllScene()
        {
            int s = -1;
            foreach (int id in _roomOrder) { int z = _rooms[id].Scene; if (s == -1) s = z; else if (s != z) return 0; }
            return s < 0 ? 0 : s;
        }

        private string SceneNameFor(RoomState r, int sceneId)
        {
            var sc = _cfg.SceneById(sceneId);
            if (sc == null) return _cfg.CustomSceneName;
            return r.Cfg.Exterior && sc.ExteriorName.Length > 0 ? sc.ExteriorName : sc.Name;
        }

        // =====================================================================================
        // Retours du slot 2 (entrées EISC)
        // =====================================================================================
        private void OnEiscSignal(SigEventArgs args)
        {
            uint j = args.Sig.Number;
            if (Joins.IsRoomBlock(j))
            {
                int roomId = (int)((j - Joins.RoomBlockBase) / Joins.RoomBlockSize) + 1;
                uint off = (j - Joins.RoomBlockBase) % Joins.RoomBlockSize;
                var r = Room(roomId);
                if (r == null || !r.Cfg.Intersystem) return;
                Trace("slot2 zone {0} offset +{1} {2}", roomId, off, args.Sig.Type);
                if (args.Sig.Type == eSigType.Bool)
                {
                    bool v = args.Sig.BoolValue;
                    if (off > Joins.Room.LightOnBase && off <= Joins.Room.LightOnBase + Joins.MaxCircuits)
                    {
                        int i = (int)(off - Joins.Room.LightOnBase) - 1;
                        if (!r.CircuitActive(i)) return;
                        if ((r.LightPct[i] > 0) != v) r.LightPct[i] = v ? 100 : 0; else return;
                    }
                    else return;
                }
                else if (args.Sig.Type == eSigType.UShort)
                {
                    ushort v = args.Sig.UShortValue;
                    if (off > Joins.Room.LightLevelBase && off <= Joins.Room.LightLevelBase + Joins.MaxCircuits)
                    { int i = (int)(off - Joins.Room.LightLevelBase) - 1; if (r.CircuitActive(i)) r.LightPct[i] = LevelFor(r, i, ToPct(v)); else return; }
                    else if (off == Joins.Room.Scene) { if (v <= Joins.MaxScenes && (v == 0 || _cfg.SceneById(v) != null)) r.Scene = v; else return; }
                    else return;
                }
                else return;
                PushRoomEverywhere(roomId);   // écrans + Rnn_xxx_fb (l'état tenu suit la mesure)
                return;
            }
            // ---- restaurant : états réels renvoyés par le slot 2
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (j == Joins.MusicPlayPause) _rest.MusicPlaying = v;
                else if (j > Joins.MusicEqBase && j <= Joins.MusicEqBase + Joins.MaxEq) { if (v && _cfg.EqName((int)(j - Joins.MusicEqBase)).Length > 0) _rest.MusicEq = (int)(j - Joins.MusicEqBase); else return; }
                else if (j >= Joins.ServiceFluide && j <= Joins.ServiceCuisine) { int st = (int)(j - Joins.ServiceFluide); if (v && _cfg.ServiceById(st) != null) _rest.Service = st; else return; }
                else return;
                PushRestaurantEverywhere();
                return;
            }
            if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (j == Joins.MusicVolume) _rest.MusicVolume = ClampVolume(v);
                else if (j == Joins.HvacSetpoint) _rest.Setpoint = ClampSetpoint(v / 10.0);
                else if (j == Joins.HvacTemperature) _rest.Temperature = v / 10.0;
                else if (j == Joins.HvacFreshAir) _rest.FreshAir = RestaurantState.ClampInt(v, 0, 100);
                else if (j == Joins.ServiceState) { if (v < Joins.MaxServices && _cfg.ServiceById(v) != null) _rest.Service = v; else return; }
                else if (j == Joins.Covers) _rest.Covers = v;
                else return;
                PushRestaurantEverywhere();
            }
        }

        // =====================================================================================
        // Feedback des écrans
        // =====================================================================================
        private void RefreshAll()
        {
            foreach (var p in _panels) { if (p == _eisc) continue; PushSystemInfo(p); PushRoomToPanel(p, ActiveRoom(p)); PushRestaurantToPanel(p); }
            PushAllRoomBlocks();
            PushRestaurantToEisc();
        }
        private void PushRoomEverywhere(int roomId) { PushRoomToPanels(roomId); PushRoomBlock(roomId); }
        /// <summary>Après une action sur roomId (0 = toutes) : écrans concernés + blocs EISC.</summary>
        private void PushRoomsEverywhere(int roomId)
        {
            if (roomId == AllRoom) { foreach (var p in _panels) if (p != _eisc) PushRoomToPanel(p, ActiveRoom(p)); PushAllRoomBlocks(); }
            else PushRoomEverywhere(roomId);
        }
        private void PushRoomToPanels(int roomId)
        {
            foreach (var p in _panels) { if (p == _eisc) continue; int a = ActiveRoom(p); if (a == roomId || a == AllRoom) PushRoomToPanel(p, a); else PushRestaurantCounters(p); }
        }
        private void PushRestaurantEverywhere() { foreach (var p in _panels) if (p != _eisc) PushRestaurantToPanel(p); PushRestaurantToEisc(); }

        private void PushSystemInfo(BasicTriList p)
        {
            p.StringInput[Joins.SystemIpId].StringValue = string.Format("{0:X2}", p.ID);
            p.StringInput[Joins.SystemCpzName].StringValue = _cpzName;
            p.StringInput[Joins.SystemCpzDate].StringValue = _cpzDate;
            p.StringInput[Joins.ConfigHash].StringValue = _configHash;
        }

        private int RestaurantLightsOn() { int n = 0; foreach (var r in _rooms.Values) n += r.LightsOn; return n; }
        private void PushRestaurantCounters(BasicTriList p) { p.UShortInput[Joins.RestaurantLightsOn].UShortValue = (ushort)RestaurantLightsOn(); }

        private void PushRoomToPanel(BasicTriList p, int roomId)
        {
            var r = Room(roomId);
            if (r == null) return;
            p.UShortInput[Joins.RoomSelect].UShortValue = (ushort)roomId;
            p.BooleanInput[Joins.RoomSelectAll].BoolValue = roomId == AllRoom;
            for (int n = 1; n <= Joins.MaxRooms; n++) p.BooleanInput[Joins.RoomSelectBase + (uint)n].BoolValue = n == roomId;
            p.StringInput[Joins.RoomName].StringValue = r.Cfg.Name;
            int avg = r.LightsAvg;
            p.StringInput[Joins.RoomSubtitle].StringValue = avg == 0 ? "Éteint" : "Éclairage moyen " + avg + " %";
            p.UShortInput[Joins.RoomLightsAvg].UShortValue = (ushort)avg;
            p.UShortInput[Joins.RoomLightsOn].UShortValue = (ushort)(roomId == AllRoom ? RestaurantLightsOn() : r.LightsOn);   // « tout » : total du restaurant
            PushRestaurantCounters(p);

            // scènes de la zone affichée (« tout » : scène commune, sinon personnalisée — SyncAll)
            int scene = r.Scene;
            for (int i = 1; i <= Joins.MaxScenes; i++) p.BooleanInput[Joins.SceneWelcome + (uint)(i - 1)].BoolValue = scene == i;
            p.UShortInput[Joins.Scene].UShortValue = (ushort)scene;
            p.StringInput[Joins.SceneName].StringValue = SceneNameFor(r, scene);

            // éclairages
            bool li = r.Cfg.LightsActive;
            p.BooleanInput[Joins.LightsAllOn].BoolValue = li && r.AllLightsOn;
            p.BooleanInput[Joins.LightsAllOff].BoolValue = li && r.AllLightsOff;
            for (int i = 1; i <= Joins.MaxCircuits; i++)
            {
                int pct = li && r.CircuitActive(i - 1) ? r.LightPct[i - 1] : 0;
                p.BooleanInput[Joins.LightToggleBase + (uint)i].BoolValue = pct > 0;
                p.UShortInput[Joins.LightLevelBase + (uint)i].UShortValue = ToRaw(pct);
            }
        }

        private void PushRestaurantToPanel(BasicTriList p)
        {
            p.StringInput[Joins.RestaurantSummary].StringValue = _cfg.Summary;
            PushRestaurantCounters(p);
            // climat
            bool hv = _cfg.Hvac.Active;
            p.UShortInput[Joins.HvacSetpoint].UShortValue = hv ? SetpointRaw() : (ushort)0;
            p.UShortInput[Joins.HvacTemperature].UShortValue = hv ? (ushort)Math.Round(_rest.Temperature * 10) : (ushort)0;
            p.UShortInput[Joins.HvacFreshAir].UShortValue = hv ? (ushort)_rest.FreshAir : (ushort)0;
            // musique
            bool mu = _cfg.Music.Active;
            p.BooleanInput[Joins.MusicPlayPause].BoolValue = mu && _rest.MusicPlaying;
            for (int i = 1; i <= Joins.MaxEq; i++) p.BooleanInput[Joins.MusicEqBase + (uint)i].BoolValue = mu && _rest.MusicEq == i;
            p.UShortInput[Joins.MusicVolume].UShortValue = (ushort)(mu ? _rest.MusicVolume : 0);
            p.StringInput[Joins.MusicTitle].StringValue = mu ? _cfg.Music.Title : "";
            p.StringInput[Joins.MusicSub].StringValue = mu ? _cfg.Music.Sub : "";
            // service
            bool se = _cfg.Service.Active;
            for (int i = 0; i < Joins.MaxServices; i++) p.BooleanInput[Joins.ServiceFluide + (uint)i].BoolValue = se && _rest.Service == i;
            p.UShortInput[Joins.ServiceState].UShortValue = (ushort)(se ? _rest.Service : 0);
            p.UShortInput[Joins.Covers].UShortValue = (ushort)(se ? _rest.Covers : 0);
            var st = _cfg.ServiceById(_rest.Service);
            p.StringInput[Joins.ServiceText].StringValue = se && st != null ? st.Text : "";
        }

        // -------------------------------------------------------------------------------------
        // Vers le slot 2 : états globaux et blocs zone
        // -------------------------------------------------------------------------------------
        /// <summary>Consigne (× 10) et volume tenus sur les sorties a60 / a30 de l'EISC (après +/− comme après curseur).</summary>
        private void PushRestaurantToEisc()
        {
            if (_eisc == null) return;
            if (_cfg.Hvac.Active) _eisc.UShortInput[Joins.HvacSetpoint].UShortValue = SetpointRaw();
            if (_cfg.Music.Active) _eisc.UShortInput[Joins.MusicVolume].UShortValue = (ushort)_rest.MusicVolume;
        }

        private void PushAllRoomBlocks() { foreach (int id in _roomOrder) PushRoomBlock(id); }

        private bool IsDisplayed(int roomId) { foreach (var kv in _activeRoomPerDevice) if (kv.Value == roomId || kv.Value == AllRoom) return true; return false; }

        private void PushRoomBlock(int roomId)
        {
            var r = Room(roomId);
            if (_eisc == null || r == null || roomId == AllRoom || !r.Cfg.Intersystem) return;
            uint b = Joins.RoomBlock(roomId);
            _eisc.StringInput[b + Joins.Room.Name].StringValue = r.Cfg.Name;
            _eisc.BooleanInput[b + Joins.Room.Displayed].BoolValue = IsDisplayed(roomId);
            if (r.Cfg.LightsActive)
            {
                for (int i = 1; i <= r.LightPct.Length; i++)
                {
                    if (!r.CircuitActive(i - 1)) continue;
                    _eisc.BooleanInput[b + Joins.Room.LightOnBase + (uint)i].BoolValue = r.LightPct[i - 1] > 0;
                    _eisc.UShortInput[b + Joins.Room.LightLevelBase + (uint)i].UShortValue = ToRaw(r.LightPct[i - 1]);
                }
                _eisc.UShortInput[b + Joins.Room.Scene].UShortValue = (ushort)r.Scene;
            }
        }

        // -------------------------------------------------------------------------------------
        // Transport de la configuration vers le GUI (s105 chunks, a250 ack, d250 resync)
        // -------------------------------------------------------------------------------------
        private void StartConfigSend(BasicTriList p)
        {
            if (_configChunks.Count == 0) return;
            _configChunkPos[p.ID] = 0;
            PushSystemInfo(p);
            SendConfigChunk(p, 0);
        }
        private void SendConfigChunk(BasicTriList p, int idx)
        {
            if (idx >= _configChunks.Count) return;
            p.StringInput[Joins.ConfigJson].StringValue = string.Format("VCFG|{0}|{1}|{2}", idx + 1, _configChunks.Count, _configChunks[idx]);
        }
        private void OnConfigChunkAck(BasicTriList p, ushort acked)
        {
            int pos; if (!_configChunkPos.TryGetValue(p.ID, out pos)) return;
            if (acked != pos + 1) return;
            _configChunkPos[p.ID] = acked;
            if (acked < _configChunks.Count) SendConfigChunk(p, acked);
            else Trace("configuration transmise a l'ecran {0:X2}", p.ID);
        }

        // -------------------------------------------------------------------------------------
        // Console
        // -------------------------------------------------------------------------------------
        private void CmdState(string arg)
        {
            var sb = new StringBuilder();
            try { _lock.Enter(); CmdStateLocked(arg, sb); } finally { _lock.Leave(); }
            CrestronConsole.ConsoleCommandResponse(sb.ToString());
        }
        private void CmdStateLocked(string arg, StringBuilder sb)
        {
            string filter = (arg ?? "").Trim();
            foreach (int id in _roomOrder)
            {
                var r = _rooms[id];
                if (filter.Length > 0 && filter != id.ToString()) continue;
                sb.AppendFormat("[{0}] {1} : scene {2} ", id, r.Cfg.Name, SceneNameFor(r, r.Scene));
                if (r.Cfg.LightsActive) { sb.Append("L="); for (int i = 0; i < r.LightPct.Length; i++) sb.Append(r.CircuitActive(i) ? r.LightPct[i] + "% " : "-- "); }
                sb.Append("\r\n");
            }
            var st = _cfg.ServiceById(_rest.Service);
            sb.AppendFormat("Restaurant : consigne {0} / mesure {1} / air neuf {2}%, musique {3} vol{4} eq{5} ({6}), service {7}, couverts {8}, circuits allumes {9}\r\n",
                _rest.Setpoint, _rest.Temperature, _rest.FreshAir, _rest.MusicPlaying ? "ON" : "off", _rest.MusicVolume, _rest.MusicEq, _cfg.EqName(_rest.MusicEq),
                st != null ? st.Name : _rest.Service.ToString(), _rest.Covers, RestaurantLightsOn());
            foreach (var kv in _activeRoomPerDevice) sb.AppendFormat("Ecran {0:X2} -> zone {1}{2}\r\n", kv.Key, kv.Value, kv.Value == AllRoom ? " (tout le restaurant)" : "");
        }

        private void CmdRoom(string arg)
        {
            var parts = (arg ?? "").Trim().Split(' ');
            uint ipid; int room;
            if (parts.Length != 2 || !uint.TryParse(parts[0], System.Globalization.NumberStyles.HexNumber, null, out ipid) || !int.TryParse(parts[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : kyotoroom <ipid hex> <zone, 0 = tout>\r\n"); return; }
            foreach (var p in _panels) if (p.ID == ipid && p != _eisc) { try { _lock.Enter(); SelectRoom(p, room); } finally { _lock.Leave(); } CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> zone {1}\r\n", ipid, room); return; }
            CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ipid);
        }
    }
}
