// FTV Home — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : registre des pièces et de leurs fonctionnalités (ftvhome_config.json), pièce affichée par
// chaque écran, application des actions, feedback des écrans, pont EISC vers le slot 2 (SIMPL).
//
// Chaîne réelle : écran (TSW-1070 / XPanel / iPad / iPhone)
//                   → C# slot 1 : action appliquée à la pièce affichée par CET écran
//                   → EISC IP-ID F0 : Room_Select# (a10) posé, puis impulsion sur le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers
//                   → EISC : mesures _Actual (blocs pièce 1000+) → C# → feedback des écrans.
//
// Contrat : Joins.cs ↔ config/ftvhome_config.json → contrat (tools/check-contract.js).

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

namespace FtvHome
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/ftvhome_config.json";
        private const string Ch5ProjectName = "ftvhome";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int SceneFeedbackMs = 1400;
        private const int ConfigChunkSize = 200;

        private HomeConfig _cfg;
        private string _configMinified = "";
        private string _configHash = "";
        private readonly List<string> _configChunks = new List<string>();
        private readonly Dictionary<uint, int> _configChunkPos = new Dictionary<uint, int>();

        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _roomOrder = new List<int>();
        private readonly HouseState _house = new HouseState();

        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private EthernetIntersystemCommunications _eisc;
        private readonly Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private readonly Dictionary<uint, int> _videoTargetPerDevice = new Dictionary<uint, int>();
        private readonly CCriticalSection _lock = new CCriticalSection();
        private CTimer _garageTimer;                     // créé une fois, réarmé par Reset()
        private readonly Dictionary<uint, CTimer> _sceneTimers = new Dictionary<uint, CTimer>();   // un par scène, réarmés
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;

        public ControlSystem() : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;
                CrestronEnvironment.ProgramStatusEventHandler += OnProgramStatus;
            }
            catch (Exception e) { ErrorLog.Error("FTVHOME ctor: {0}", e.Message); }
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
                    _videoTargetPerDevice[p.ID] = DefaultDisplayFor(DefaultRoom());
                }
                RefreshAll();

                CrestronConsole.AddNewConsoleCommand(CmdState, "ftvstate", "Etat des pieces FTV Home (ftvstate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "ftvroom", "Piece affichee par ecran : ftvroom <ipid hex> <piece>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("ftvtrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "ftvtrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("FTVHOME: {0} v{1} — {2} pieces, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("FTVHOME InitializeSystem: {0}", e.ToString()); }
        }

        private void OnProgramStatus(eProgramStatusEventType t)
        {
            if (t != eProgramStatusEventType.Stopping) return;
            try { if (_garageTimer != null) _garageTimer.Dispose(); foreach (var ti in _sceneTimers.Values) ti.Dispose(); } catch { }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("FTVHOME: " + fmt, a); }

        // -------------------------------------------------------------------------------------
        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("FTVHOME: {0} absent — aucune piece.", ConfigPath); _cfg = new HomeConfig(); return; }
                string raw = System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8);
                var root = JObject.Parse(raw);
                _cfg = HomeConfig.Parse(root);
                _configMinified = root.ToString(Newtonsoft.Json.Formatting.None);
                _configHash = ComputeHash(_configMinified);
                _configChunks.Clear();
                for (int i = 0; i < _configMinified.Length; i += ConfigChunkSize)
                    _configChunks.Add(_configMinified.Substring(i, Math.Min(ConfigChunkSize, _configMinified.Length - i)));
                CrestronConsole.PrintLine("FTVHOME: configuration chargee ({0} car., {1} chunks, empreinte {2}).", _configMinified.Length, _configChunks.Count, _configHash);
            }
            catch (Exception e) { ErrorLog.Error("FTVHOME: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new HomeConfig(); }
        }

        private static string ComputeHash(string s)
        {
            unchecked { uint h = 2166136261; foreach (char c in s) { h ^= c; h *= 16777619; } return h.ToString("X8"); }
        }

        private void BuildState()
        {
            _rooms.Clear(); _roomOrder.Clear();
            foreach (var rc in _cfg.Rooms) { _rooms[rc.Id] = new RoomState(rc); _roomOrder.Add(rc.Id); }
            foreach (var rs in _rooms.Values) ApplyFav(rs, rs.MusicFav);
            _house.Displays.Clear();
            foreach (var d in _cfg.Displays) _house.Displays[d.Id] = new DisplayState { Cfg = d, On = d.Id == 1, Source = d.Id == 1 ? 1 : 0 };
        }

        private int DefaultRoom() { return _roomOrder.Count > 0 ? _roomOrder[0] : 1; }
        private int DefaultDisplayFor(int roomId)
        {
            RoomState r;
            if (_rooms.TryGetValue(roomId, out r) && r.Cfg.VideoActive && r.Cfg.DefaultDisplay > 0) return r.Cfg.DefaultDisplay;
            return _cfg.Displays.Count > 0 ? _cfg.Displays[0].Id : 1;
        }
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoomPerDevice.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }
        private int VideoTarget(BasicTriList dev) { int d; return _videoTargetPerDevice.TryGetValue(dev.ID, out d) ? d : DefaultDisplayFor(ActiveRoom(dev)); }
        private RoomState Room(int id) { RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }

        // -------------------------------------------------------------------------------------
        private void RegisterUserInterface(BasicTriList dev)
        {
            dev.SigChange += OnSigChange;
            dev.OnlineStatusChange += OnOnlineStatus;
            var res = dev.Register();
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("FTVHOME: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("FTVHOME: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("FTVHOME: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                RegisterUserInterface(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("FTVHOME: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { PushAllRoomBlocks(); PushEiscActiveRoom(DefaultRoom()); return; }
                if (!_activeRoomPerDevice.ContainsKey(p.ID)) _activeRoomPerDevice[p.ID] = DefaultRoom();
                PushSystemInfo(p);
                PushRoomToPanel(p, _activeRoomPerDevice[p.ID]);
                PushHouseToPanel(p);
            }
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
            catch (Exception e) { ErrorLog.Error("FTVHOME OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
            finally { _lock.Leave(); }
        }

        /// <summary>Recopie l'action vers le slot 2 : Room_Select# (a10) d'abord, puis le même join.</summary>
        private void MirrorToEisc(BasicTriList dev, SigEventArgs args)
        {
            if (_eisc == null) return;
            uint j = args.Sig.Number;
            if (args.Sig.Type == eSigType.Bool && (j == Joins.ConfigResync || (j > Joins.RoomSelectBase && j <= Joins.RoomSelectBase + Joins.MaxRooms))) return;
            if (args.Sig.Type == eSigType.UShort && (j == Joins.ConfigChunkAck || j == Joins.RoomSelect)) return;
            try
            {
                int roomId = ActiveRoom(dev);
                PushEiscActiveRoom(roomId);
                _eisc.UShortInput[Joins.VideoDisplayTarget].UShortValue = (ushort)VideoTarget(dev);   // écran vidéo ciblé par CET écran
                if (args.Sig.Type == eSigType.Bool) _eisc.BooleanInput[j].BoolValue = args.Sig.BoolValue;
                else _eisc.UShortInput[j].UShortValue = BoundedAnalog(roomId, j, args.Sig.UShortValue);   // valeur bornée par l'état, jamais brute
            }
            catch { }
        }

        /// <summary>Valeur analogique telle que retenue par l'état (bornes du contrat), pour la recopie EISC.</summary>
        private ushort BoundedAnalog(int roomId, uint j, ushort raw)
        {
            var r = Room(roomId);
            if (r == null) return raw;
            if (j == Joins.HvacSetpoint) return (ushort)Math.Round(r.Setpoint * 10);
            if (j == Joins.MusicVolume) return (ushort)r.MusicVolume;
            if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits) { int i = (int)(j - Joins.LightLevelBase) - 1; return i < r.LightPct.Length ? ToRaw(r.LightPct[i]) : raw; }
            if (j > Joins.ShadePositionBase && j <= Joins.ShadePositionBase + Joins.MaxShades) { int i = (int)(j - Joins.ShadePositionBase) - 1; return i < r.ShadePct.Length ? ToRaw(r.ShadePct[i]) : raw; }
            if (j == Joins.VideoVolume || (j > Joins.VideoDisplayVolumeBase && j <= Joins.VideoDisplayVolumeBase + Joins.MaxDisplays)) return (ushort)RoomState.Clamp(raw);
            return raw;
        }

        private void PushEiscActiveRoom(int roomId)
        {
            if (_eisc == null) return;
            _eisc.UShortInput[Joins.RoomSelect].UShortValue = (ushort)roomId;
            for (int n = 1; n <= Joins.MaxRooms; n++) _eisc.BooleanInput[Joins.RoomSelectBase + (uint)n].BoolValue = n == roomId;
        }

        private void HandleDigitalPress(BasicTriList dev, uint j)
        {
            int roomId = ActiveRoom(dev);
            var r = Room(roomId);
            Trace("appui d{0} ecran {1:X2} piece {2}", j, dev.ID, roomId);

            if (j > Joins.RoomSelectBase && j <= Joins.RoomSelectBase + Joins.MaxRooms) { SelectRoom(dev, (int)(j - Joins.RoomSelectBase)); return; }
            if (j == Joins.ConfigResync) { StartConfigSend(dev); return; }
            if (j >= Joins.SceneArrive && j <= Joins.SceneLeave) { RunScene((int)(j - Joins.SceneArrive + 1)); PulseSceneFeedback(j); RefreshAll(); return; }

            // ---- pièce
            if (r != null)
            {
                bool done = true;
                if (j == Joins.RoomOff) RoomOff(r);
                else if (j == Joins.LightsAllOn && r.Cfg.LightsActive) SetAllLights(r, 100);
                else if (j == Joins.LightsAllOff && r.Cfg.LightsActive) SetAllLights(r, 0);
                else if (j == Joins.LightsDimUp && r.Cfg.LightsActive) for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = LevelFor(r, i, r.LightPct[i] + 20);
                else if (j == Joins.LightsDimDown && r.Cfg.LightsActive) for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = LevelFor(r, i, r.LightPct[i] - 20);
                else if (j > Joins.LightToggleBase && j <= Joins.LightToggleBase + Joins.MaxCircuits)
                {
                    int i = (int)(j - Joins.LightToggleBase) - 1;
                    if (i < r.LightPct.Length) r.LightPct[i] = r.LightPct[i] > 0 ? 0 : 100; else done = false;
                }
                else if (j == Joins.ShadesAllOpen && r.Cfg.ShadesActive) SetAllShades(r, 100);
                else if (j == Joins.ShadesAllClose && r.Cfg.ShadesActive) SetAllShades(r, 0);
                else if (j > Joins.ShadeUpBase && j <= Joins.ShadeUpBase + Joins.MaxShades) done = SetShade(r, (int)(j - Joins.ShadeUpBase), 100, Joins.Room.ShadeUpBase);
                else if (j > Joins.ShadeStopBase && j <= Joins.ShadeStopBase + Joins.MaxShades) done = SetShade(r, (int)(j - Joins.ShadeStopBase), 50, Joins.Room.ShadeStopBase);
                else if (j > Joins.ShadeDownBase && j <= Joins.ShadeDownBase + Joins.MaxShades) done = SetShade(r, (int)(j - Joins.ShadeDownBase), 0, Joins.Room.ShadeDownBase);
                else if (j >= Joins.HvacSetpointUp && j <= Joins.HvacHumidityOff && r.Cfg.Hvac.Active) HandleHvac(r, j);
                else if (j == Joins.LockLock && r.Cfg.LockActive) r.Locked = true;
                else if (j == Joins.LockUnlock && r.Cfg.LockActive) r.Locked = false;
                else if (j >= Joins.MusicServiceBase + 1 && j <= Joins.MusicMute && r.Cfg.AudioActive) HandleMusic(r, j);
                else done = false;
                if (done) { PushRoomEverywhere(roomId); return; }
            }

            // ---- maison
            bool house = true;
            if (j == Joins.AccessFrontDoorLock && _cfg.AccessActive) _house.FrontDoorLocked = true;
            else if (j == Joins.AccessFrontDoorUnlock && _cfg.AccessActive) _house.FrontDoorLocked = false;
            else if (j == Joins.AccessGateClose && _cfg.AccessActive) _house.GateClosed = true;
            else if (j == Joins.AccessGateOpen && _cfg.AccessActive) _house.GateClosed = false;
            else if (j == Joins.AccessGarageOpen && _cfg.AccessActive) { _house.GarageOpen = true; _house.GarageClosing = false; }
            else if (j == Joins.AccessGarageClose && _cfg.AccessActive) StartGarageClosing();
            else if (j == Joins.PoolOn && _cfg.PoolActive) _house.PoolOn = true;
            else if (j == Joins.PoolOff && _cfg.PoolActive) _house.PoolOn = false;
            else if (j == Joins.SpaOn && _cfg.SpaActive) _house.SpaOn = true;
            else if (j == Joins.SpaOff && _cfg.SpaActive) _house.SpaOn = false;
            else if (_cfg.VideoActive && j > Joins.VideoDisplaySelectBase && j <= Joins.VideoDisplaySelectBase + Joins.MaxDisplays) _videoTargetPerDevice[dev.ID] = (int)(j - Joins.VideoDisplaySelectBase);
            else if (_cfg.VideoActive && j > Joins.VideoDisplayOnBase && j <= Joins.VideoDisplayOnBase + Joins.MaxDisplays) SetDisplay((int)(j - Joins.VideoDisplayOnBase), true, DefaultVideoSource());
            else if (_cfg.VideoActive && j > Joins.VideoDisplayOffBase && j <= Joins.VideoDisplayOffBase + Joins.MaxDisplays) SetDisplay((int)(j - Joins.VideoDisplayOffBase), false, 0);
            else if (_cfg.VideoActive && j > Joins.VideoSourceBase && j <= Joins.VideoSourceBase + Joins.MaxSources) SetDisplay(VideoTarget(dev), true, (int)(j - Joins.VideoSourceBase));
            else if (_cfg.VideoActive && j > Joins.VideoChannelBase && j <= Joins.VideoChannelBase + Joins.MaxChannels) _house.Channel = (int)(j - Joins.VideoChannelBase);
            else house = false;
            if (house) PushHouseEverywhere();
        }

        private bool HandleAnalog(BasicTriList dev, uint j, ushort v)
        {
            if (j == Joins.RoomSelect) { if (v >= 1 && v <= Joins.MaxRooms) SelectRoom(dev, v); return false; }
            if (j == Joins.ConfigChunkAck) { OnConfigChunkAck(dev, v); return false; }
            int roomId = ActiveRoom(dev);
            var r = Room(roomId);
            Trace("analog a{0}={1} ecran {2:X2} piece {3}", j, v, dev.ID, roomId);
            if (r != null)
            {
                if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits)
                {
                    int i = (int)(j - Joins.LightLevelBase) - 1;
                    if (r.Cfg.LightsActive && i < r.LightPct.Length) { r.LightPct[i] = LevelFor(r, i, ToPct(v)); PushRoomEverywhere(roomId); return true; }
                    return false;
                }
                if (j > Joins.ShadePositionBase && j <= Joins.ShadePositionBase + Joins.MaxShades)
                {
                    int i = (int)(j - Joins.ShadePositionBase) - 1;
                    if (r.Cfg.ShadesActive && i < r.ShadePct.Length) { r.ShadePct[i] = ToPct(v); PushRoomEverywhere(roomId); return true; }
                    return false;
                }
                if (j == Joins.HvacSetpoint && r.Cfg.Hvac.Active) { r.Setpoint = ClampSetpoint(r, v / 10.0); PushRoomEverywhere(roomId); return true; }
                if (j == Joins.MusicVolume && r.Cfg.AudioActive) { r.MusicVolume = RoomState.Clamp(v); r.MusicMuted = r.MusicVolume == 0; PushRoomEverywhere(roomId); return true; }
            }
            if (_cfg.VideoActive)
            {
                if (j == Joins.VideoDisplayTarget) { if (_house.Displays.ContainsKey(v)) { _videoTargetPerDevice[dev.ID] = v; PushHouseToPanel(dev); } return false; }
                if (j > Joins.VideoDisplayVolumeBase && j <= Joins.VideoDisplayVolumeBase + Joins.MaxDisplays)
                {
                    DisplayState d; if (_house.Displays.TryGetValue((int)(j - Joins.VideoDisplayVolumeBase), out d)) { d.Volume = RoomState.Clamp(v); PushHouseEverywhere(); return true; }
                    return false;
                }
                if (j == Joins.VideoVolume)
                {
                    DisplayState d; if (_house.Displays.TryGetValue(VideoTarget(dev), out d)) { d.Volume = RoomState.Clamp(v); PushHouseEverywhere(); return true; }
                    return false;
                }
            }
            return false;
        }

        // =====================================================================================
        // Logique métier
        // =====================================================================================
        private static int ToPct(ushort v) { return (int)Math.Round(v * 100.0 / 65535.0); }
        private static ushort ToRaw(int pct) { return (ushort)Math.Round(RoomState.Clamp(pct) * 65535.0 / 100.0); }
        private static double ClampSetpoint(RoomState r, double v)
        {
            double step = r.Cfg.Hvac.Step > 0 ? r.Cfg.Hvac.Step : 0.5;
            return Math.Max(r.Cfg.Hvac.Min, Math.Min(r.Cfg.Hvac.Max, Math.Round(v / step) * step));
        }
        /// <summary>Un circuit non gradable ne connaît que 0 et 100 %.</summary>
        private static int LevelFor(RoomState r, int i, int pct) { return r.Cfg.Circuits[i].Dimmable ? RoomState.Clamp(pct) : (pct > 0 ? 100 : 0); }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (!_rooms.ContainsKey(roomId)) return;
            _activeRoomPerDevice[dev.ID] = roomId;
            _videoTargetPerDevice[dev.ID] = DefaultDisplayFor(roomId);
            PushEiscActiveRoom(roomId);
            PushRoomToPanel(dev, roomId);
            PushHouseToPanel(dev);
            PushAllRoomBlocks();   // Rnn_Room_Displayed_fb
        }

        private void SetAllLights(RoomState r, int pct) { for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = pct; }
        private void SetAllShades(RoomState r, int pct) { for (int i = 0; i < r.ShadePct.Length; i++) r.ShadePct[i] = pct; }

        private bool SetShade(RoomState r, int n, int pct, uint pulseOffset)
        {
            if (!r.Cfg.ShadesActive || n < 1 || n > r.ShadePct.Length) return false;
            r.ShadePct[n - 1] = pct;
            PulseRoomBlock(r.Cfg.Id, pulseOffset + (uint)n);   // Rnn_Shade_n_Up/Stop/Down vers le moteur
            return true;
        }

        private void HandleHvac(RoomState r, uint j)
        {
            switch (j)
            {
                case Joins.HvacSetpointUp: r.Setpoint = ClampSetpoint(r, r.Setpoint + r.Cfg.Hvac.Step); break;
                case Joins.HvacSetpointDown: r.Setpoint = ClampSetpoint(r, r.Setpoint - r.Cfg.Hvac.Step); break;
                case Joins.HvacModeHeat: r.Mode = HvacMode.Heat; break;
                case Joins.HvacModeCool: r.Mode = HvacMode.Cool; break;
                case Joins.HvacModeAuto: r.Mode = HvacMode.Auto; break;
                case Joins.HvacModeNext: r.Mode = r.Mode == HvacMode.Heat ? HvacMode.Cool : r.Mode == HvacMode.Cool ? HvacMode.Auto : HvacMode.Heat; break;
                case Joins.HvacFanAuto: r.FanOn = false; break;
                case Joins.HvacFanOn: r.FanOn = true; break;
                case Joins.HvacScheduleRun: r.Hold = false; break;
                case Joins.HvacScheduleHold: r.Hold = true; break;
                case Joins.HvacHumidityOn: r.HumidityCtrl = true; break;
                case Joins.HvacHumidityOff: r.HumidityCtrl = false; break;
            }
        }

        private void HandleMusic(RoomState r, uint j)
        {
            if (j > Joins.MusicServiceBase && j <= Joins.MusicServiceBase + Joins.MaxServices)
            {
                int s = (int)(j - Joins.MusicServiceBase);
                if (s <= _cfg.Services.Count) { r.MusicService = s; r.MusicPlaying = true; r.MusicSub = _cfg.Services[s - 1].Name + " · " + r.Cfg.Name; }
            }
            else if (j > Joins.MusicFavBase && j <= Joins.MusicFavBase + Joins.MaxFavs)
            {
                int f = (int)(j - Joins.MusicFavBase);
                if (f <= _cfg.Favs.Count) { ApplyFav(r, f); r.MusicPlaying = true; }
            }
            else if (j == Joins.MusicPlayPause) r.MusicPlaying = !r.MusicPlaying;
            else if (j == Joins.MusicMute)
            {
                r.MusicMuted = !r.MusicMuted;
                if (r.MusicMuted) { r.MusicVolumeBeforeMute = r.MusicVolume; r.MusicVolume = 0; }
                else r.MusicVolume = r.MusicVolumeBeforeMute > 0 ? r.MusicVolumeBeforeMute : 30;
            }
            else if (j == Joins.MusicPrev || j == Joins.MusicNext)
            {
                if (_cfg.Favs.Count > 0 && r.MusicFav > 0)
                {
                    int f = r.MusicFav + (j == Joins.MusicNext ? 1 : -1);
                    if (f < 1) f = _cfg.Favs.Count; if (f > _cfg.Favs.Count) f = 1;
                    ApplyFav(r, f);
                }
            }
        }

        private void ApplyFav(RoomState r, int f)
        {
            if (f < 1 || f > _cfg.Favs.Count) { r.MusicFav = 0; return; }
            var fav = _cfg.Favs[f - 1];
            r.MusicFav = f; r.MusicTitle = fav.Name; r.MusicSub = fav.Sub + " · " + r.Cfg.Name; r.MusicTint = fav.Tint;
            for (int i = 0; i < _cfg.Services.Count; i++) if (_cfg.Services[i].Name == fav.Sub) r.MusicService = i + 1;
        }

        private void RoomOff(RoomState r)
        {
            SetAllLights(r, 0);
            if (r.Cfg.AudioActive) r.MusicPlaying = false;
            if (r.Cfg.VideoActive) foreach (var d in _house.Displays.Values) if (d.Cfg.RoomKey == r.Cfg.Key) { d.On = false; d.Source = 0; }
            PushHouseEverywhere();
        }

        private int DefaultVideoSource() { foreach (var s in _cfg.Sources) if (s.Channels) return s.Id; return _cfg.Sources.Count > 0 ? _cfg.Sources[0].Id : 1; }

        private void SetDisplay(int id, bool on, int source)
        {
            DisplayState d;
            if (!_house.Displays.TryGetValue(id, out d)) return;
            if (source > _cfg.Sources.Count) return;
            d.On = on; d.Source = on ? source : 0;
        }

        private void StartGarageClosing()
        {
            if (!_house.GarageOpen) return;
            _house.GarageClosing = true;
            if (_garageTimer == null)
                _garageTimer = new CTimer(o =>
                {
                    try { _lock.Enter(); _house.GarageOpen = false; _house.GarageClosing = false; PushHouseEverywhere(); }
                    finally { _lock.Leave(); }
                }, Timeout.Infinite);
            _garageTimer.Reset(_cfg.GarageClosingMs);
        }

        private void RunScene(int idx)
        {
            SceneConfig sc = null;
            foreach (var s in _cfg.Scenes) if (s.Id == idx) sc = s;
            if (sc == null) return;
            foreach (var r in _rooms.Values)
            {
                int pct;
                if (sc.LightsByRoom.TryGetValue(r.Cfg.Key, out pct)) SetAllLights(r, pct);
                else if (sc.LightsDefaultPct >= 0) SetAllLights(r, sc.LightsDefaultPct);
                if (sc.ShadesPct >= 0) SetAllShades(r, sc.ShadesPct);
                if (sc.StopMusic) r.MusicPlaying = false;
                if (sc.LockAll && r.Cfg.LockActive) r.Locked = true;
            }
            if (sc.LockAll) { _house.FrontDoorLocked = true; _house.GateClosed = true; _house.GarageOpen = false; _house.GarageClosing = false; }
            Trace("scene {0} ({1}) appliquee", sc.Id, sc.Name);
        }

        private void PulseSceneFeedback(uint join)
        {
            foreach (var p in _panels) if (p != _eisc) p.BooleanInput[join].BoolValue = true;
            CTimer t;
            if (!_sceneTimers.TryGetValue(join, out t))
            {
                t = new CTimer(o => { try { _lock.Enter(); foreach (var p in _panels) if (p != _eisc) p.BooleanInput[join].BoolValue = false; } finally { _lock.Leave(); } }, Timeout.Infinite);
                _sceneTimers[join] = t;
            }
            t.Reset(SceneFeedbackMs);
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
                Trace("slot2 piece {0} offset +{1} {2}", roomId, off, args.Sig.Type);
                if (args.Sig.Type == eSigType.Bool)
                {
                    bool v = args.Sig.BoolValue;
                    if (off > Joins.Room.LightOnBase && off <= Joins.Room.LightOnBase + Joins.MaxCircuits)
                    { int i = (int)off - 1; if (i < r.LightPct.Length && (r.LightPct[i] > 0) != v) r.LightPct[i] = v ? 100 : 0; }
                    else if (off == Joins.Room.LockLocked) r.Locked = v;
                    else if (off == Joins.Room.HvacHeat && v) r.Mode = HvacMode.Heat;
                    else if (off == Joins.Room.HvacCool && v) r.Mode = HvacMode.Cool;
                    else if (off == Joins.Room.HvacAuto && v) r.Mode = HvacMode.Auto;
                    else if (off == Joins.Room.HvacFanOn) r.FanOn = v;
                    else if (off == Joins.Room.HvacHold) r.Hold = v;
                    else if (off == Joins.Room.HvacHumidity) r.HumidityCtrl = v;
                    else if (off == Joins.Room.MusicPlaying) r.MusicPlaying = v;
                    else if (off == Joins.Room.MusicMuted) r.MusicMuted = v;
                    else return;
                }
                else if (args.Sig.Type == eSigType.UShort)
                {
                    ushort v = args.Sig.UShortValue;
                    if (off > Joins.Room.LightLevelBase && off <= Joins.Room.LightLevelBase + Joins.MaxCircuits)
                    { int i = (int)(off - Joins.Room.LightLevelBase) - 1; if (i < r.LightPct.Length) r.LightPct[i] = ToPct(v); else return; }
                    else if (off > Joins.Room.ShadePositionBase && off <= Joins.Room.ShadePositionBase + Joins.MaxShades)
                    { int i = (int)(off - Joins.Room.ShadePositionBase) - 1; if (i < r.ShadePct.Length) r.ShadePct[i] = ToPct(v); else return; }
                    else if (off == Joins.Room.HvacSetpoint) r.Setpoint = ClampSetpoint(r, v / 10.0);
                    else if (off == Joins.Room.HvacTemperature) r.Temp = v / 10.0;
                    else if (off == Joins.Room.HvacHumidityMeasure) r.Humidity = RoomState.Clamp(v);
                    else if (off == Joins.Room.MusicVolume) r.MusicVolume = RoomState.Clamp(v);
                    else if (off == Joins.Room.MusicService) r.MusicService = v;
                    else if (off == Joins.Room.MusicFav) ApplyFav(r, v);
                    else return;
                }
                else return;
                PushRoomEverywhere(roomId);   // écrans + Rnn_xxx_fb (l'état tenu suit la mesure)
                return;
            }
            // ---- maison : états réels renvoyés par le slot 2
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (j == Joins.AccessFrontDoorLock) _house.FrontDoorLocked = v;
                else if (j == Joins.AccessGateClose) _house.GateClosed = v;
                else if (j == Joins.AccessGarageOpen) _house.GarageOpen = v;
                else if (j == Joins.AccessGarageClosing) _house.GarageClosing = v;
                else if (j == Joins.PoolOn) _house.PoolOn = v;
                else if (j == Joins.SpaOn) _house.SpaOn = v;
                else if (j > Joins.VideoDisplayOnBase && j <= Joins.VideoDisplayOnBase + Joins.MaxDisplays)
                { DisplayState d; if (_house.Displays.TryGetValue((int)(j - Joins.VideoDisplayOnBase), out d)) { d.On = v; if (!v) d.Source = 0; } else return; }
                else return;
            }
            else if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (j > Joins.VideoDisplayVolumeBase && j <= Joins.VideoDisplayVolumeBase + Joins.MaxDisplays)
                { DisplayState d; if (_house.Displays.TryGetValue((int)(j - Joins.VideoDisplayVolumeBase), out d)) d.Volume = RoomState.Clamp(v); else return; }
                else if (j > Joins.VideoDisplaySourceBase && j <= Joins.VideoDisplaySourceBase + Joins.MaxDisplays)
                { DisplayState d; if (_house.Displays.TryGetValue((int)(j - Joins.VideoDisplaySourceBase), out d)) { d.Source = v; d.On = v > 0; } else return; }
                else if (j == Joins.VideoChannel) _house.Channel = v;
                else return;
            }
            else return;
            PushHouseToPanels();
        }

        // =====================================================================================
        // Feedback des écrans
        // =====================================================================================
        private void RefreshAll()
        {
            foreach (var p in _panels) { if (p == _eisc) continue; PushSystemInfo(p); PushRoomToPanel(p, ActiveRoom(p)); PushHouseToPanel(p); }
            PushAllRoomBlocks();
        }
        private void PushRoomEverywhere(int roomId) { PushRoomToPanels(roomId); PushRoomBlock(roomId); }
        private void PushRoomToPanels(int roomId)
        {
            foreach (var p in _panels) { if (p == _eisc) continue; if (ActiveRoom(p) == roomId) PushRoomToPanel(p, roomId); else PushHouseCounters(p); }
        }
        private void PushHouseEverywhere() { PushHouseToPanels(); }
        private void PushHouseToPanels() { foreach (var p in _panels) if (p != _eisc) PushHouseToPanel(p); }

        private void PushSystemInfo(BasicTriList p)
        {
            p.StringInput[Joins.SystemIpId].StringValue = string.Format("{0:X2}", p.ID);
            p.StringInput[Joins.SystemCpzName].StringValue = _cpzName;
            p.StringInput[Joins.SystemCpzDate].StringValue = _cpzDate;
            p.StringInput[Joins.ConfigHash].StringValue = _configHash;
        }

        private void PushHouseCounters(BasicTriList p)
        {
            int lightsOn = 0, shadesOpen = 0;
            foreach (var r in _rooms.Values) { lightsOn += r.LightsOn; shadesOpen += r.ShadesOpen; }
            p.UShortInput[Joins.HouseLightsOn].UShortValue = (ushort)lightsOn;
            p.UShortInput[Joins.HouseShadesOpen].UShortValue = (ushort)shadesOpen;
        }

        private void PushRoomToPanel(BasicTriList p, int roomId)
        {
            var r = Room(roomId);
            if (r == null) return;
            p.UShortInput[Joins.RoomSelect].UShortValue = (ushort)roomId;
            for (int n = 1; n <= Joins.MaxRooms; n++) p.BooleanInput[Joins.RoomSelectBase + (uint)n].BoolValue = n == roomId;
            p.StringInput[Joins.RoomName].StringValue = r.Cfg.Name;
            int on = r.LightsOn;
            p.StringInput[Joins.RoomSubtitle].StringValue = on == 0 ? "Tous les éclairages éteints" : on + (on > 1 ? " éclairages allumés" : " éclairage allumé");
            p.UShortInput[Joins.RoomLightsOn].UShortValue = (ushort)on;
            p.UShortInput[Joins.RoomShadesOpen].UShortValue = (ushort)r.ShadesOpen;
            PushHouseCounters(p);

            // éclairages
            p.BooleanInput[Joins.LightsAllOn].BoolValue = r.Cfg.LightsActive && r.AllLightsOn;
            p.BooleanInput[Joins.LightsAllOff].BoolValue = r.Cfg.LightsActive && r.AllLightsOff;
            for (int i = 1; i <= Joins.MaxCircuits; i++)
            {
                int pct = i <= r.LightPct.Length ? r.LightPct[i - 1] : 0;
                p.BooleanInput[Joins.LightToggleBase + (uint)i].BoolValue = pct > 0;
                p.UShortInput[Joins.LightLevelBase + (uint)i].UShortValue = ToRaw(pct);
            }
            // occultants
            p.BooleanInput[Joins.ShadesAllOpen].BoolValue = r.Cfg.ShadesActive && r.AllShadesOpen;
            p.BooleanInput[Joins.ShadesAllClose].BoolValue = r.Cfg.ShadesActive && r.AllShadesClosed;
            for (int i = 1; i <= Joins.MaxShades; i++)
            {
                bool has = i <= r.ShadePct.Length;
                int pct = has ? r.ShadePct[i - 1] : 0;
                p.BooleanInput[Joins.ShadeUpBase + (uint)i].BoolValue = has && pct >= 100;
                p.BooleanInput[Joins.ShadeStopBase + (uint)i].BoolValue = has && pct == 50;
                p.BooleanInput[Joins.ShadeDownBase + (uint)i].BoolValue = has && pct <= 0;
                p.UShortInput[Joins.ShadePositionBase + (uint)i].UShortValue = ToRaw(pct);
            }
            // CVC
            bool hv = r.Cfg.Hvac.Active;
            p.BooleanInput[Joins.HvacModeHeat].BoolValue = hv && r.Mode == HvacMode.Heat;
            p.BooleanInput[Joins.HvacModeCool].BoolValue = hv && r.Mode == HvacMode.Cool;
            p.BooleanInput[Joins.HvacModeAuto].BoolValue = hv && r.Mode == HvacMode.Auto;
            p.BooleanInput[Joins.HvacFanAuto].BoolValue = hv && !r.FanOn;
            p.BooleanInput[Joins.HvacFanOn].BoolValue = hv && r.FanOn;
            p.BooleanInput[Joins.HvacScheduleRun].BoolValue = hv && !r.Hold;
            p.BooleanInput[Joins.HvacScheduleHold].BoolValue = hv && r.Hold;
            p.BooleanInput[Joins.HvacHumidityOn].BoolValue = hv && r.HumidityCtrl;
            p.BooleanInput[Joins.HvacHumidityOff].BoolValue = hv && !r.HumidityCtrl;
            p.UShortInput[Joins.HvacSetpoint].UShortValue = hv ? (ushort)Math.Round(r.Setpoint * 10) : (ushort)0;
            p.UShortInput[Joins.HvacTemperature].UShortValue = hv ? (ushort)Math.Round(r.Temp * 10) : (ushort)0;
            p.UShortInput[Joins.HvacMode].UShortValue = hv ? (ushort)r.Mode : (ushort)0;
            p.UShortInput[Joins.HvacFan].UShortValue = (ushort)(hv && r.FanOn ? 1 : 0);
            p.UShortInput[Joins.HvacHumidity].UShortValue = hv ? (ushort)r.Humidity : (ushort)0;
            // serrure
            p.BooleanInput[Joins.LockLock].BoolValue = r.Cfg.LockActive && r.Locked;
            p.BooleanInput[Joins.LockUnlock].BoolValue = r.Cfg.LockActive && !r.Locked;
            // musique
            bool au = r.Cfg.AudioActive;
            for (int i = 1; i <= Joins.MaxServices; i++) p.BooleanInput[Joins.MusicServiceBase + (uint)i].BoolValue = au && r.MusicService == i;
            for (int i = 1; i <= Joins.MaxFavs; i++) p.BooleanInput[Joins.MusicFavBase + (uint)i].BoolValue = au && r.MusicFav == i;
            p.BooleanInput[Joins.MusicPlayPause].BoolValue = au && r.MusicPlaying;
            p.BooleanInput[Joins.MusicMute].BoolValue = au && r.MusicMuted;
            p.UShortInput[Joins.MusicVolume].UShortValue = (ushort)(au ? r.MusicVolume : 0);
            p.StringInput[Joins.MusicTitle].StringValue = au && r.MusicPlaying ? r.MusicTitle : "";
            p.StringInput[Joins.MusicSub].StringValue = au && r.MusicPlaying ? r.MusicSub : "";
            p.StringInput[Joins.MusicTint].StringValue = au ? r.MusicTint : "";
        }

        private void PushHouseToPanel(BasicTriList p)
        {
            p.StringInput[Joins.HouseStatus].StringValue = _cfg.HouseStatus;
            PushHouseCounters(p);
            bool ac = _cfg.AccessActive;
            p.BooleanInput[Joins.AccessFrontDoorLock].BoolValue = ac && _house.FrontDoorLocked;
            p.BooleanInput[Joins.AccessFrontDoorUnlock].BoolValue = ac && !_house.FrontDoorLocked;
            p.BooleanInput[Joins.AccessGateClose].BoolValue = ac && _house.GateClosed;
            p.BooleanInput[Joins.AccessGateOpen].BoolValue = ac && !_house.GateClosed;
            p.BooleanInput[Joins.AccessGarageOpen].BoolValue = ac && _house.GarageOpen && !_house.GarageClosing;
            p.BooleanInput[Joins.AccessGarageClose].BoolValue = ac && !_house.GarageOpen;
            p.BooleanInput[Joins.AccessGarageClosing].BoolValue = ac && _house.GarageClosing;
            p.BooleanInput[Joins.PoolOn].BoolValue = _cfg.PoolActive && _house.PoolOn;
            p.BooleanInput[Joins.PoolOff].BoolValue = _cfg.PoolActive && !_house.PoolOn;
            p.BooleanInput[Joins.SpaOn].BoolValue = _cfg.SpaActive && _house.SpaOn;
            p.BooleanInput[Joins.SpaOff].BoolValue = _cfg.SpaActive && !_house.SpaOn;

            int target = VideoTarget(p);
            DisplayState td; _house.Displays.TryGetValue(target, out td);
            p.UShortInput[Joins.VideoDisplayTarget].UShortValue = (ushort)(_cfg.VideoActive ? target : 0);
            for (int i = 1; i <= Joins.MaxDisplays; i++)
            {
                DisplayState d = null;
                bool has = _cfg.VideoActive && _house.Displays.TryGetValue(i, out d) && d != null;
                p.BooleanInput[Joins.VideoDisplaySelectBase + (uint)i].BoolValue = has && target == i;
                p.BooleanInput[Joins.VideoDisplayOnBase + (uint)i].BoolValue = has && d.On;
                p.BooleanInput[Joins.VideoDisplayOffBase + (uint)i].BoolValue = has && !d.On;
                p.UShortInput[Joins.VideoDisplayVolumeBase + (uint)i].UShortValue = (ushort)(has ? d.Volume : 0);
                p.UShortInput[Joins.VideoDisplaySourceBase + (uint)i].UShortValue = (ushort)(has ? d.Source : 0);
            }
            int src = td != null && td.On ? td.Source : 0;
            for (int i = 1; i <= Joins.MaxSources; i++) p.BooleanInput[Joins.VideoSourceBase + (uint)i].BoolValue = src == i;
            bool tv = src >= 1 && src <= _cfg.Sources.Count && _cfg.Sources[src - 1].Channels;
            for (int i = 1; i <= Joins.MaxChannels; i++) p.BooleanInput[Joins.VideoChannelBase + (uint)i].BoolValue = tv && _house.Channel == i;
            p.UShortInput[Joins.VideoChannel].UShortValue = (ushort)(tv ? _house.Channel : 0);
            p.UShortInput[Joins.VideoVolume].UShortValue = (ushort)(td != null ? td.Volume : 0);
            p.StringInput[Joins.VideoSourceName].StringValue = src >= 1 && src <= _cfg.Sources.Count ? _cfg.Sources[src - 1].Name : "";
        }

        // -------------------------------------------------------------------------------------
        // Blocs pièce vers le slot 2
        // -------------------------------------------------------------------------------------
        private void PushAllRoomBlocks() { foreach (int id in _roomOrder) PushRoomBlock(id); }

        private bool IsDisplayed(int roomId) { foreach (var kv in _activeRoomPerDevice) if (kv.Value == roomId) return true; return false; }

        private void PushRoomBlock(int roomId)
        {
            var r = Room(roomId);
            if (_eisc == null || r == null || !r.Cfg.Intersystem) return;
            uint b = Joins.RoomBlock(roomId);
            _eisc.StringInput[b + Joins.Room.Name].StringValue = r.Cfg.Name;
            _eisc.BooleanInput[b + Joins.Room.Displayed].BoolValue = IsDisplayed(roomId);
            if (r.Cfg.LightsActive)
                for (int i = 1; i <= r.LightPct.Length; i++)
                {
                    _eisc.BooleanInput[b + Joins.Room.LightOnBase + (uint)i].BoolValue = r.LightPct[i - 1] > 0;
                    _eisc.UShortInput[b + Joins.Room.LightLevelBase + (uint)i].UShortValue = ToRaw(r.LightPct[i - 1]);
                }
            if (r.Cfg.ShadesActive)
                for (int i = 1; i <= r.ShadePct.Length; i++) _eisc.UShortInput[b + Joins.Room.ShadePositionBase + (uint)i].UShortValue = ToRaw(r.ShadePct[i - 1]);
            if (r.Cfg.Hvac.Active)
            {
                _eisc.UShortInput[b + Joins.Room.HvacSetpoint].UShortValue = (ushort)Math.Round(r.Setpoint * 10);
                _eisc.BooleanInput[b + Joins.Room.HvacHeat].BoolValue = r.Mode == HvacMode.Heat;
                _eisc.BooleanInput[b + Joins.Room.HvacCool].BoolValue = r.Mode == HvacMode.Cool;
                _eisc.BooleanInput[b + Joins.Room.HvacAuto].BoolValue = r.Mode == HvacMode.Auto;
                _eisc.BooleanInput[b + Joins.Room.HvacFanOn].BoolValue = r.FanOn;
                _eisc.BooleanInput[b + Joins.Room.HvacHold].BoolValue = r.Hold;
                _eisc.BooleanInput[b + Joins.Room.HvacHumidity].BoolValue = r.HumidityCtrl;
            }
            if (r.Cfg.LockActive) _eisc.BooleanInput[b + Joins.Room.LockLocked].BoolValue = r.Locked;
            if (r.Cfg.AudioActive)
            {
                _eisc.BooleanInput[b + Joins.Room.MusicPlaying].BoolValue = r.MusicPlaying;
                _eisc.BooleanInput[b + Joins.Room.MusicMuted].BoolValue = r.MusicMuted;
                _eisc.UShortInput[b + Joins.Room.MusicVolume].UShortValue = (ushort)r.MusicVolume;
                _eisc.UShortInput[b + Joins.Room.MusicService].UShortValue = (ushort)r.MusicService;
                _eisc.UShortInput[b + Joins.Room.MusicFav].UShortValue = (ushort)r.MusicFav;
            }
        }

        private void PulseRoomBlock(int roomId, uint offset)
        {
            var r = Room(roomId);
            if (_eisc == null || r == null || !r.Cfg.Intersystem) return;
            uint j = Joins.RoomBlock(roomId) + offset;
            _eisc.BooleanInput[j].Pulse(250);   // impulsion 250 ms vers le moteur (slot 2)
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
            foreach (int id in _roomOrder)
            {
                var r = _rooms[id];
                if (!string.IsNullOrEmpty(arg) && arg.Trim() != id.ToString()) continue;
                sb.AppendFormat("[{0}] {1} : ", id, r.Cfg.Name);
                if (r.Cfg.LightsActive) { sb.Append("L="); foreach (var l in r.LightPct) sb.Append(l + "% "); }
                if (r.Cfg.ShadesActive) { sb.Append("S="); foreach (var s in r.ShadePct) sb.Append(s + "% "); }
                if (r.Cfg.Hvac.Active) sb.AppendFormat("CVC={0}/{1} {2} fan{3} hold{4} ", r.Temp, r.Setpoint, r.Mode, r.FanOn ? "On" : "Auto", r.Hold ? 1 : 0);
                if (r.Cfg.LockActive) sb.Append(r.Locked ? "verrouille " : "DEVERROUILLE ");
                if (r.Cfg.AudioActive) sb.AppendFormat("musique {0} '{1}' vol{2} ", r.MusicPlaying ? "ON" : "off", r.MusicTitle, r.MusicVolume);
                sb.Append("\r\n");
            }
            sb.AppendFormat("Maison : porte {0}, portail {1}, garage {2}{3}, piscine {4}, spa {5}, chaine {6}\r\n", _house.FrontDoorLocked ? "verrouillee" : "ouverte", _house.GateClosed ? "ferme" : "ouvert", _house.GarageOpen ? "ouvert" : "ferme", _house.GarageClosing ? " (fermeture)" : "", _house.PoolOn, _house.SpaOn, _house.Channel);
            foreach (var kv in _activeRoomPerDevice) sb.AppendFormat("Ecran {0:X2} -> piece {1}\r\n", kv.Key, kv.Value);
        }

        private void CmdRoom(string arg)
        {
            var parts = (arg ?? "").Trim().Split(' ');
            uint ipid; int room;
            if (parts.Length != 2 || !uint.TryParse(parts[0], System.Globalization.NumberStyles.HexNumber, null, out ipid) || !int.TryParse(parts[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : ftvroom <ipid hex> <piece>\r\n"); return; }
            foreach (var p in _panels) if (p.ID == ipid && p != _eisc) { try { _lock.Enter(); SelectRoom(p, room); } finally { _lock.Leave(); } CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> piece {1}\r\n", ipid, room); return; }
            CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ipid);
        }
    }
}
