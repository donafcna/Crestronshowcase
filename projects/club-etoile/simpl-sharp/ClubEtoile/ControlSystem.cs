// Club Étoile — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : registre des salles et de leurs fonctionnalités (club-etoile_config.json), salle affichée
// par chaque écran (0 = tout le club), application des actions, feedback des écrans, pont EISC vers
// le slot 2 (SIMPL), globaux club : affluence → CVC, audio (dB simulé ou mesuré, limiteur), effets
// scéniques (fumée, stroboscope, lyres), écran DJ, raccourcis régie, navigation 3D par écran.
//
// Chaîne réelle : écran (TSW-1070 / XPanel / iPad / iPhone)
//                   → C# slot 1 : action appliquée à la salle affichée par CET écran (ou à toutes)
//                   → EISC IP-ID F0 : Room_Select# (a10) posé, puis impulsion sur le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers
//                   → EISC : mesures _Actual (blocs salle 1000+, globaux club) → C# → feedback des écrans.
//
// Contrat : Joins.cs ↔ config/club-etoile_config.json → contrat (tools/check-contract.js).

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

namespace ClubEtoile
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/club-etoile_config.json";
        private const string Ch5ProjectName = "clubetoile";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int ConfigChunkSize = 200;
        private const int AllRoom = 0;                    // Room_Select# = 0 → tout le club
        private const int DbPeriodMs = 1000;              // simulation du niveau sonore (1 s, comme le simulateur)
        private const int PulseMs = 250;                  // actions élémentaires d'une macro vers le slot 2
        private const int ViewBuilding = 1, ViewFloor = 2, ViewRoom = 3;

        private ClubEtoileConfig _cfg;
        private string _configMinified = "";
        private string _configHash = "";
        private readonly List<string> _configChunks = new List<string>();
        private readonly Dictionary<uint, int> _configChunkPos = new Dictionary<uint, int>();

        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _roomOrder = new List<int>();
        private readonly ClubState _club = new ClubState();
        private string _summary = "";

        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private EthernetIntersystemCommunications _eisc;
        private readonly Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private readonly Dictionary<uint, PanelNav> _navPerDevice = new Dictionary<uint, PanelNav>();
        private readonly CCriticalSection _lock = new CCriticalSection();
        private CTimer _dbTimer;                          // créé une fois, réarmé par Reset(), arrêté par Stop()
        private readonly Random _rand = new Random();
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;

        public ControlSystem() : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;
                CrestronEnvironment.ProgramStatusEventHandler += OnProgramStatus;
            }
            catch (Exception e) { ErrorLog.Error("CLUB ctor: {0}", e.Message); }
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
                    _navPerDevice[p.ID] = DefaultNav();
                }
                _dbTimer = new CTimer(OnDbTick, null, Timeout.Infinite, Timeout.Infinite);
                if (_cfg.AudioActive && _cfg.SimulateDb) _dbTimer.Reset(DbPeriodMs, DbPeriodMs);
                RefreshAll();

                CrestronConsole.AddNewConsoleCommand(CmdState, "clubstate", "Etat des salles Club Etoile (clubstate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "clubroom", "Salle affichee par ecran : clubroom <ipid hex> <salle, 0 = tout>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("clubtrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "clubtrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("CLUB: {0} v{1} — {2} salles, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("CLUB InitializeSystem: {0}", e.ToString()); }
        }

        private void OnProgramStatus(eProgramStatusEventType t)
        {
            if (t != eProgramStatusEventType.Stopping) return;
            try { if (_dbTimer != null) { _dbTimer.Stop(); _dbTimer.Dispose(); } } catch { }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("CLUB: " + fmt, a); }

        // -------------------------------------------------------------------------------------
        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("CLUB: {0} absent — aucune salle.", ConfigPath); _cfg = new ClubEtoileConfig(); return; }
                string raw = System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8);
                var root = JObject.Parse(raw);
                _cfg = ClubEtoileConfig.Parse(root);
                _configMinified = root.ToString(Newtonsoft.Json.Formatting.None);
                _configHash = ComputeHash(_configMinified);
                _configChunks.Clear();
                for (int i = 0; i < _configMinified.Length; i += ConfigChunkSize)
                    _configChunks.Add(_configMinified.Substring(i, Math.Min(ConfigChunkSize, _configMinified.Length - i)));
                CrestronConsole.PrintLine("CLUB: configuration chargee ({0} car., {1} chunks, empreinte {2}).", _configMinified.Length, _configChunks.Count, _configHash);
            }
            catch (Exception e) { ErrorLog.Error("CLUB: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new ClubEtoileConfig(); }
        }

        private static string ComputeHash(string s)
        {
            unchecked { uint h = 2166136261; foreach (char c in s) { h ^= c; h *= 16777619; } return h.ToString("X8"); }
        }

        private void BuildState()
        {
            _rooms.Clear(); _roomOrder.Clear();
            foreach (var rc in _cfg.Rooms) { _rooms[rc.Id] = new RoomState(rc, _cfg); _roomOrder.Add(rc.Id); }
            _summary = _cfg.Subtitle.Length > 0 ? _cfg.Subtitle
                : _cfg.Floors.Count + (_cfg.Floors.Count > 1 ? " niveaux · " : " niveau · ") + _rooms.Count + (_rooms.Count > 1 ? " salles" : " salle");

            var cr = _cfg.CrowdByKey(_cfg.InitialCrowdKey);
            if (cr == null && _cfg.Crowds.Count > 0) cr = _cfg.Crowds[0];
            _club.Crowd = cr != null ? cr.Id : 0;
            _club.FanPct = cr != null ? RoomState.Clamp(cr.FanPct) : 0;
            _club.SetpointC = cr != null ? cr.SetpointC : 0;
            _club.TemperatureC = _cfg.InitialTemperatureC;
            _club.CtaOnline = _cfg.CtaOnlineDefault;
            _club.DancefloorVolume = RoomState.Clamp(_cfg.InitialDancefloorVolume);
            _club.BarVolume = RoomState.Clamp(_cfg.InitialBarVolume);
            _club.Db = Math.Max(0, _cfg.InitialDb);
            _club.Smoke = _cfg.EffectsActive && _cfg.InitialSmoke;
            _club.Strobe = _cfg.EffectsActive && _cfg.InitialStrobe;
            _club.Lyres = _cfg.EffectsActive && _cfg.InitialLyres;
            _club.StrobeFreq = ClubState.Clamp(_cfg.InitialStrobeFreq, _cfg.StrobeFreqMin, _cfg.StrobeFreqMax);
            _club.ScreenSource = _cfg.ScreenActive ? _cfg.InitialScreenSource : 0;
        }

        /// <summary>Le GUI démarre sur la salle initiale du JSON (vue « Bâtiment »), à défaut « Tout le club ».</summary>
        private int DefaultRoom()
        {
            RoomConfig rc;
            return _cfg.RoomsByKey.TryGetValue(_cfg.InitialRoomKey, out rc) ? rc.Id : AllRoom;
        }
        private PanelNav DefaultNav()
        {
            var n = new PanelNav { View = _cfg.InitialView == "room" ? ViewRoom : _cfg.InitialView == "floor" ? ViewFloor : ViewBuilding, Floor = 0 };
            RoomConfig rc;
            if (_cfg.RoomsByKey.TryGetValue(_cfg.InitialRoomKey, out rc)) n.Floor = _cfg.FloorGuiOf(rc);
            return n;
        }
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoomPerDevice.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }
        private PanelNav Nav(BasicTriList dev) { PanelNav n; if (!_navPerDevice.TryGetValue(dev.ID, out n)) { n = DefaultNav(); _navPerDevice[dev.ID] = n; } return n; }
        private RoomState Room(int id) { RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }
        private bool RoomExists(int id) { return id == AllRoom || _rooms.ContainsKey(id); }

        /// <summary>Salles réelles visées par une action : toutes si l'écran affiche « Tout le club ».</summary>
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
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("CLUB: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("CLUB: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("CLUB: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                RegisterUserInterface(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("CLUB: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { PushAllRoomBlocks(); PushClubToEisc(); PushEiscActiveRoom(DefaultRoom()); return; }
                if (!_activeRoomPerDevice.ContainsKey(p.ID)) _activeRoomPerDevice[p.ID] = DefaultRoom();
                PushSystemInfo(p);
                PushRoomToPanel(p, _activeRoomPerDevice[p.ID]);
                PushNavToPanel(p);
                PushClubToPanel(p);
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
            catch (Exception e) { ErrorLog.Error("CLUB OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
            finally { _lock.Leave(); }
        }

        /// <summary>Recopie l'action vers le slot 2 : Room_Select# (a10) + Room_Active_nn d'abord, puis le même join.</summary>
        private void MirrorToEisc(BasicTriList dev, SigEventArgs args)
        {
            if (_eisc == null) return;
            uint j = args.Sig.Number;
            if (args.Sig.Type == eSigType.Bool && (j == Joins.ConfigResync || (j >= Joins.RoomSelectAll && j <= Joins.RoomSelectBase + Joins.MaxRooms)
                || (j >= Joins.ClubViewBuilding && j <= Joins.ClubViewRoom))) return;              // navigation : écrans seulement
            if (args.Sig.Type == eSigType.UShort && (j == Joins.ConfigChunkAck || j == Joins.RoomSelect || j == Joins.ClubFloor)) return;
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
            if (j == Joins.HvacFan) return (ushort)_club.FanPct;
            if (j == Joins.AudioDancefloorVolume) return (ushort)_club.DancefloorVolume;
            if (j == Joins.AudioBarVolume) return (ushort)_club.BarVolume;
            if (j == Joins.StrobeFreq) return (ushort)_club.StrobeFreq;
            if (j == Joins.RoomLevel)
            {
                var r = Room(roomId);
                return r != null ? ToRaw(r.LevelPct) : ToRaw(ToPct(raw));
            }
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
            Trace("appui d{0} ecran {1:X2} salle {2}", j, dev.ID, roomId);

            if (j == Joins.RoomSelectAll) { SelectRoom(dev, AllRoom); return; }
            if (j > Joins.RoomSelectBase && j <= Joins.RoomSelectBase + Joins.MaxRooms) { SelectRoom(dev, (int)(j - Joins.RoomSelectBase)); return; }
            if (j == Joins.ConfigResync) { StartConfigSend(dev); return; }
            if (j == Joins.ClubViewBuilding) { SetView(dev, ViewBuilding); return; }
            if (j == Joins.ClubViewFloor) { SetView(dev, ViewFloor); return; }
            if (j == Joins.ClubViewRoom) { SetView(dev, ViewRoom); return; }

            // ---- ambiance de la salle affichée (ou de toutes)
            if (j >= Joins.SceneSignature && j <= Joins.SceneOff)
            {
                if (SetScene(roomId, (int)(j - Joins.SceneSignature + 1))) PushRoomsEverywhere(roomId);
                return;
            }

            // ---- club (globaux)
            bool club = true;
            if (j >= Joins.CrowdCozy && j <= Joins.CrowdPacked) club = SetCrowd((int)(j - Joins.CrowdCozy + 1));
            else if (j == Joins.SmokeOn && _cfg.EffectsActive) _club.Smoke = true;
            else if (j == Joins.SmokeOff && _cfg.EffectsActive) _club.Smoke = false;
            else if (j == Joins.StrobeOn && _cfg.EffectsActive) _club.Strobe = true;
            else if (j == Joins.StrobeOff && _cfg.EffectsActive) _club.Strobe = false;
            else if (j == Joins.LyresOn && _cfg.EffectsActive) _club.Lyres = true;
            else if (j == Joins.LyresOff && _cfg.EffectsActive) _club.Lyres = false;
            else if (j > Joins.ScreenSourceBase && j <= Joins.ScreenSourceBase + Joins.MaxScreenSources && _cfg.ScreenActive)
            {
                int s = (int)(j - Joins.ScreenSourceBase);
                if (_cfg.ScreenSourceById(s) != null) _club.ScreenSource = s; else club = false;
            }
            else if (j == Joins.MacroPeakAlert) RunMacro(_cfg.MacroPeakAlert);
            else if (j == Joins.MacroCalmEnd) RunMacro(_cfg.MacroCalmEnd);
            else if (j == Joins.MacroAllOff) RunMacro(_cfg.MacroAllOff);
            else if (j == Joins.MacroPartyQuick) RunMacro(_cfg.MacroPartyQuick);
            else club = false;
            if (club) PushClubEverywhere();
        }

        private bool HandleAnalog(BasicTriList dev, uint j, ushort v)
        {
            if (j == Joins.RoomSelect) { if (v <= Joins.MaxRooms) SelectRoom(dev, v); return false; }
            if (j == Joins.ConfigChunkAck) { OnConfigChunkAck(dev, v); return false; }
            if (j == Joins.ClubFloor) { SetFloor(dev, v); return false; }
            int roomId = ActiveRoom(dev);
            Trace("analog a{0}={1} ecran {2:X2} salle {3}", j, v, dev.ID, roomId);

            // ---- intensité de la salle affichée (ou de toutes)
            if (j == Joins.RoomLevel)
            {
                bool any = false;
                foreach (var t in Targets(roomId)) if (t.Cfg.AmbianceActive) { t.LevelPct = ToPct(v); t.Derive(_cfg); any = true; }
                if (any) PushRoomsEverywhere(roomId);
                return any;
            }

            // ---- club (globaux)
            if (j == Joins.HvacFan && _cfg.HvacActive) { _club.FanPct = RoomState.Clamp(v); PushClubEverywhere(); return true; }
            if (j == Joins.AudioDancefloorVolume && _cfg.AudioActive) { _club.DancefloorVolume = RoomState.Clamp(v); PushClubEverywhere(); return true; }
            if (j == Joins.AudioBarVolume && _cfg.AudioActive) { _club.BarVolume = RoomState.Clamp(v); PushClubEverywhere(); return true; }
            if (j == Joins.StrobeFreq && _cfg.EffectsActive) { _club.StrobeFreq = ClubState.Clamp(v, _cfg.StrobeFreqMin, _cfg.StrobeFreqMax); PushClubEverywhere(); return true; }
            return false;
        }

        // =====================================================================================
        // Logique métier
        // =====================================================================================
        private static int ToPct(ushort v) { return (int)Math.Round(v * 100.0 / 65535.0); }
        private static ushort ToRaw(int pct) { return (ushort)Math.Round(RoomState.Clamp(pct) * 65535.0 / 100.0); }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (!RoomExists(roomId)) return;
            _activeRoomPerDevice[dev.ID] = roomId;
            var nav = Nav(dev);
            var r = Room(roomId);
            if (r != null) { nav.Floor = _cfg.FloorGuiOf(r.Cfg); nav.View = ViewRoom; }   // changeRoom() du simulateur
            else nav.View = ViewBuilding;
            PushEiscActiveRoom(roomId);
            PushRoomToPanel(dev, roomId);
            PushNavToPanel(dev);
            PushAllRoomBlocks();   // Rnn_Room_Displayed_fb
        }

        private void SetView(BasicTriList dev, int view) { Nav(dev).View = view; PushNavToPanel(dev); }

        /// <summary>Étage demandé par l'écran (0..2) : vue « Étage » sur cet étage ; la salle affichée ne change pas.</summary>
        private void SetFloor(BasicTriList dev, int gui)
        {
            if (_cfg.FloorByGui(gui) == null) return;
            var nav = Nav(dev);
            nav.Floor = gui;
            if (nav.View == ViewRoom) nav.View = ViewFloor;
            PushNavToPanel(dev);
        }

        /// <summary>Scène n (1..4) sur la salle visée ou sur toutes ; les circuits sont re-dérivés.</summary>
        private bool SetScene(int roomId, int sceneId)
        {
            if (_cfg.SceneById(sceneId) == null) return false;
            bool any = false;
            foreach (var t in Targets(roomId)) if (t.Cfg.AmbianceActive) { t.Scene = sceneId; t.Derive(_cfg); any = true; }
            return any;
        }

        /// <summary>Affluence n (1..3) : pose la ventilation et la consigne calculée (loi du simulateur).</summary>
        private bool SetCrowd(int id)
        {
            var cr = _cfg.CrowdById(id);
            if (cr == null) return false;
            _club.Crowd = cr.Id;
            _club.FanPct = RoomState.Clamp(cr.FanPct);
            _club.SetpointC = cr.SetpointC;
            Trace("affluence {0} ({1}) : ventilation {2} %, consigne {3:0.0} C", cr.Id, cr.Name, cr.FanPct, cr.SetpointC);
            return true;
        }

        /// <summary>Raccourci régie : applique les états, puis pulse les actions élémentaires sur l'EISC pour le slot 2.</summary>
        private void RunMacro(MacroConfig m)
        {
            if (m == null) return;
            var pulses = new List<uint>();
            if (m.CrowdKey.Length > 0)
            {
                var cr = _cfg.CrowdByKey(m.CrowdKey);
                if (cr != null && SetCrowd(cr.Id)) pulses.Add(Joins.CrowdCozy + (uint)(cr.Id - 1));
            }
            if (_cfg.EffectsActive)
            {
                if (m.HasStrobe) { _club.Strobe = m.Strobe; pulses.Add(m.Strobe ? Joins.StrobeOn : Joins.StrobeOff); }
                if (m.HasSmoke) { _club.Smoke = m.Smoke; pulses.Add(m.Smoke ? Joins.SmokeOn : Joins.SmokeOff); }
            }
            if (m.VolumesZero && _cfg.AudioActive) { _club.DancefloorVolume = 0; _club.BarVolume = 0; }
            Trace("macro {0} appliquee", m.Name);
            if (_eisc == null) return;
            try
            {
                foreach (uint j in pulses) _eisc.BooleanInput[j].Pulse(PulseMs);
                if (m.VolumesZero && _cfg.AudioActive)
                {
                    _eisc.UShortInput[Joins.AudioDancefloorVolume].UShortValue = 0;
                    _eisc.UShortInput[Joins.AudioBarVolume].UShortValue = 0;
                }
            }
            catch { }
        }

        private bool LimiterTripped { get { return _cfg.AudioActive && (_club.LimiterActual || _club.Db >= _cfg.LimiterThresholdDb); } }

        /// <summary>Tick 1 s : simulation du niveau sonore (10 + ⌊volume piste × 0,95⌋ ± 2) tant que le DSP ne parle pas.</summary>
        private void OnDbTick(object o)
        {
            try
            {
                _lock.Enter();
                if (_club.DbFromSlot2 || !_cfg.SimulateDb) { _dbTimer.Stop(); return; }
                int db = 10 + (int)Math.Floor(_club.DancefloorVolume * 0.95) + _rand.Next(-2, 3);
                if (db < 0) db = 0;
                if (db == _club.Db) return;
                _club.Db = db;
                PushAudioLevelToPanels();
                PushClubToEisc();   // Club_Audio_Limiter_fb suit le seuil
            }
            catch (Exception e) { ErrorLog.Error("CLUB OnDbTick : {0}", e.Message); }
            finally { _lock.Leave(); }
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
                Trace("slot2 salle {0} offset +{1} {2}", roomId, off, args.Sig.Type);
                if (args.Sig.Type == eSigType.Bool)
                {
                    bool v = args.Sig.BoolValue;
                    if (off > Joins.Room.LightOnBase && off <= Joins.Room.LightOnBase + Joins.MaxCircuits)
                    {
                        int i = (int)(off - Joins.Room.LightOnBase) - 1;
                        if (!r.Cfg.LightsActive || !r.CircuitActive(i)) return;
                        if ((r.LightPct[i] > 0) != v) r.LightPct[i] = v ? 100 : 0;
                    }
                    else if (off > Joins.Room.SceneBase && off <= Joins.Room.SceneBase + Joins.MaxScenes)
                    {
                        if (!v || !r.Cfg.AmbianceActive) return;            // un seul haut : seul le front montant compte
                        int s = (int)(off - Joins.Room.SceneBase);
                        if (_cfg.SceneById(s) == null) return;
                        r.Scene = s; r.Derive(_cfg);
                    }
                    else return;
                }
                else if (args.Sig.Type == eSigType.UShort)
                {
                    ushort v = args.Sig.UShortValue;
                    if (off > Joins.Room.LightLevelBase && off <= Joins.Room.LightLevelBase + Joins.MaxCircuits)
                    {
                        int i = (int)(off - Joins.Room.LightLevelBase) - 1;
                        if (!r.Cfg.LightsActive || !r.CircuitActive(i)) return;
                        int pct = ToPct(v);
                        r.LightPct[i] = r.Cfg.Circuits[i].Dimmable ? pct : (pct > 0 ? 100 : 0);
                    }
                    else if (off == Joins.Room.Level) { if (!r.Cfg.AmbianceActive) return; r.LevelPct = ToPct(v); r.Derive(_cfg); }
                    else if (off == Joins.Room.Scene) { if (!r.Cfg.AmbianceActive || _cfg.SceneById(v) == null) return; r.Scene = v; r.Derive(_cfg); }
                    else return;
                }
                else return;
                PushRoomEverywhere(roomId);   // écrans + Rnn_xxx_fb (l'état tenu suit la mesure)
                return;
            }
            // ---- club : états réels renvoyés par le slot 2
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (j == Joins.HvacCtaOnline) _club.CtaOnline = v;
                else if (j == Joins.AudioLimiter) _club.LimiterActual = v;
                else if (j == Joins.SmokeOn) _club.Smoke = v;
                else if (j == Joins.StrobeOn) _club.Strobe = v;
                else if (j == Joins.LyresOn) _club.Lyres = v;
                else if (j > Joins.ScreenSourceBase && j <= Joins.ScreenSourceBase + Joins.MaxScreenSources)
                {
                    int s = (int)(j - Joins.ScreenSourceBase);
                    if (!v || _cfg.ScreenSourceById(s) == null) return;
                    _club.ScreenSource = s;
                }
                else return;
                PushClubEverywhere();
                return;
            }
            if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (j == Joins.HvacFan) _club.FanPct = RoomState.Clamp(v);
                else if (j == Joins.HvacTemperature) _club.TemperatureC = v / 10.0;
                else if (j == Joins.AudioDancefloorVolume) _club.DancefloorVolume = RoomState.Clamp(v);
                else if (j == Joins.AudioBarVolume) _club.BarVolume = RoomState.Clamp(v);
                else if (j == Joins.AudioDb) { _club.Db = v; if (!_club.DbFromSlot2) { _club.DbFromSlot2 = true; if (_dbTimer != null) _dbTimer.Stop(); Trace("niveau sonore : le DSP fait foi"); } }
                else if (j == Joins.StrobeFreq) _club.StrobeFreq = ClubState.Clamp(v, _cfg.StrobeFreqMin, _cfg.StrobeFreqMax);
                else return;
                PushClubEverywhere();
            }
        }

        // =====================================================================================
        // Feedback des écrans
        // =====================================================================================
        private void RefreshAll()
        {
            foreach (var p in _panels) { if (p == _eisc) continue; PushSystemInfo(p); PushRoomToPanel(p, ActiveRoom(p)); PushNavToPanel(p); PushClubToPanel(p); }
            PushAllRoomBlocks();
            PushClubToEisc();
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
            foreach (var p in _panels) { if (p == _eisc) continue; int a = ActiveRoom(p); if (a == roomId || a == AllRoom) PushRoomToPanel(p, a); }
        }
        private void PushClubEverywhere() { foreach (var p in _panels) if (p != _eisc) PushClubToPanel(p); PushClubToEisc(); }

        private void PushSystemInfo(BasicTriList p)
        {
            p.StringInput[Joins.SystemIpId].StringValue = string.Format("{0:X2}", p.ID);
            p.StringInput[Joins.SystemCpzName].StringValue = _cpzName;
            p.StringInput[Joins.SystemCpzDate].StringValue = _cpzDate;
            p.StringInput[Joins.ConfigHash].StringValue = _configHash;
        }

        /// <summary>Scène commune à toutes les salles (0 = ambiances mixtes) et intensité moyenne, pour « Tout le club ».</summary>
        private int CommonScene()
        {
            int s = -1;
            foreach (var r in _rooms.Values) { if (!r.Cfg.AmbianceActive) continue; if (s < 0) s = r.Scene; else if (s != r.Scene) return 0; }
            return s < 0 ? 0 : s;
        }
        private int AverageLevel()
        {
            int n = 0, sum = 0;
            foreach (var r in _rooms.Values) if (r.Cfg.AmbianceActive) { n++; sum += r.LevelPct; }
            return n == 0 ? 0 : (int)Math.Round(sum / (double)n);
        }

        private void PushRoomToPanel(BasicTriList p, int roomId)
        {
            var r = Room(roomId);
            if (roomId != AllRoom && r == null) return;
            p.UShortInput[Joins.RoomSelect].UShortValue = (ushort)roomId;
            p.BooleanInput[Joins.RoomSelectAll].BoolValue = roomId == AllRoom;
            for (int n = 1; n <= Joins.MaxRooms; n++) p.BooleanInput[Joins.RoomSelectBase + (uint)n].BoolValue = n == roomId;

            int scene = r != null ? (r.Cfg.AmbianceActive ? r.Scene : 0) : CommonScene();
            int level = r != null ? (r.Cfg.AmbianceActive ? r.LevelPct : 0) : AverageLevel();
            var sc = _cfg.SceneById(scene);
            string sceneName = sc != null ? sc.Name : _cfg.MixedSceneName;
            p.StringInput[Joins.RoomName].StringValue = r != null ? r.Cfg.Name : _cfg.AllName;
            p.StringInput[Joins.RoomMood].StringValue = r != null ? r.Cfg.Mood : _summary;
            p.StringInput[Joins.RoomColor].StringValue = r != null ? r.Cfg.Color : "";
            p.StringInput[Joins.SceneName].StringValue = sceneName;
            p.StringInput[Joins.RoomSubtitle].StringValue = sc == null ? sceneName : (sc.Factor <= 0 ? sc.Name : sc.Name + " · " + level + " %");
            p.UShortInput[Joins.Scene].UShortValue = (ushort)scene;
            for (int i = 1; i <= Joins.MaxScenes; i++) p.BooleanInput[Joins.SceneSignature + (uint)(i - 1)].BoolValue = scene == i;
            p.UShortInput[Joins.RoomLevel].UShortValue = ToRaw(level);

            // circuits dérivés (lecture seule) : ceux de la salle affichée ; moyenne par index pour « Tout le club »
            for (int i = 1; i <= Joins.MaxCircuits; i++)
            {
                int pct = 0;
                if (r != null) pct = r.Cfg.LightsActive && r.CircuitActive(i - 1) ? r.LightPct[i - 1] : 0;
                else { int n = 0, sum = 0; foreach (var t in _rooms.Values) if (t.Cfg.LightsActive && t.CircuitActive(i - 1)) { n++; sum += t.LightPct[i - 1]; } pct = n == 0 ? 0 : (int)Math.Round(sum / (double)n); }
                p.UShortInput[Joins.LightLevelBase + (uint)i].UShortValue = ToRaw(pct);
            }
            p.StringInput[Joins.ClubSummary].StringValue = _summary;
        }

        private void PushNavToPanel(BasicTriList p)
        {
            var nav = Nav(p);
            p.BooleanInput[Joins.ClubViewBuilding].BoolValue = nav.View == ViewBuilding;
            p.BooleanInput[Joins.ClubViewFloor].BoolValue = nav.View == ViewFloor;
            p.BooleanInput[Joins.ClubViewRoom].BoolValue = nav.View == ViewRoom;
            p.UShortInput[Joins.ClubFloor].UShortValue = (ushort)Math.Max(0, nav.Floor);
        }

        private void PushAudioLevelToPanel(BasicTriList p)
        {
            bool lim = LimiterTripped;
            p.UShortInput[Joins.AudioDb].UShortValue = (ushort)(_cfg.AudioActive ? Math.Min(65535, Math.Max(0, _club.Db)) : 0);
            p.BooleanInput[Joins.AudioLimiter].BoolValue = lim;
            p.StringInput[Joins.AudioLimiterText].StringValue = _cfg.AudioActive ? (lim ? _cfg.TextLimiterOn : _cfg.TextLimiterOff) : "";
        }
        private void PushAudioLevelToPanels() { foreach (var p in _panels) if (p != _eisc) PushAudioLevelToPanel(p); }

        private void PushClubToPanel(BasicTriList p)
        {
            p.StringInput[Joins.ClubSummary].StringValue = _summary;
            // affluence et CVC
            var cr = _cfg.CrowdById(_club.Crowd);
            for (int i = 1; i <= Joins.MaxCrowds; i++) p.BooleanInput[Joins.CrowdCozy + (uint)(i - 1)].BoolValue = _club.Crowd == i;
            p.StringInput[Joins.CrowdName].StringValue = cr != null ? cr.Name : "";
            bool hv = _cfg.HvacActive;
            p.UShortInput[Joins.HvacFan].UShortValue = (ushort)(hv ? _club.FanPct : 0);
            p.UShortInput[Joins.HvacSetpoint].UShortValue = hv ? ClubState.Tenths(_club.SetpointC) : (ushort)0;
            p.UShortInput[Joins.HvacTemperature].UShortValue = hv ? ClubState.Tenths(_club.TemperatureC) : (ushort)0;
            p.BooleanInput[Joins.HvacCtaOnline].BoolValue = hv && _club.CtaOnline;
            p.StringInput[Joins.HvacStatus].StringValue = hv ? (_club.CtaOnline ? _cfg.TextCtaOnline : _cfg.TextCtaOffline) : "";
            // audio
            bool au = _cfg.AudioActive;
            p.UShortInput[Joins.AudioDancefloorVolume].UShortValue = (ushort)(au ? _club.DancefloorVolume : 0);
            p.UShortInput[Joins.AudioBarVolume].UShortValue = (ushort)(au ? _club.BarVolume : 0);
            PushAudioLevelToPanel(p);
            // effets
            bool ef = _cfg.EffectsActive;
            p.BooleanInput[Joins.SmokeOn].BoolValue = ef && _club.Smoke;
            p.BooleanInput[Joins.SmokeOff].BoolValue = ef && !_club.Smoke;
            p.BooleanInput[Joins.StrobeOn].BoolValue = ef && _club.Strobe;
            p.BooleanInput[Joins.StrobeOff].BoolValue = ef && !_club.Strobe;
            p.BooleanInput[Joins.LyresOn].BoolValue = ef && _club.Lyres;
            p.BooleanInput[Joins.LyresOff].BoolValue = ef && !_club.Lyres;
            p.UShortInput[Joins.StrobeFreq].UShortValue = (ushort)(ef ? _club.StrobeFreq : 0);
            p.StringInput[Joins.SmokeStatus].StringValue = ef ? (_club.Smoke ? _cfg.TextSmokeActive : _cfg.TextSmokeReady) : "";
            p.StringInput[Joins.StrobeStatus].StringValue = ef ? (_club.Strobe ? _cfg.TextStrobeOn : _cfg.TextStrobeOff) : "";
            // écran DJ
            var src = _cfg.ScreenActive ? _cfg.ScreenSourceById(_club.ScreenSource) : null;
            for (int i = 1; i <= Joins.MaxScreenSources; i++) p.BooleanInput[Joins.ScreenSourceBase + (uint)i].BoolValue = src != null && _club.ScreenSource == i;
            p.UShortInput[Joins.ScreenSource].UShortValue = (ushort)(src != null ? _club.ScreenSource : 0);
            p.StringInput[Joins.ScreenSourceName].StringValue = src != null ? src.Name : "";
            // raccourcis : fb = états réunis
            bool packed = cr != null && cr.Key == "packed", cozy = cr != null && cr.Key == "cozy";
            p.BooleanInput[Joins.MacroPeakAlert].BoolValue = packed && ef && _club.Strobe && _club.Smoke;
            p.BooleanInput[Joins.MacroCalmEnd].BoolValue = ef && !_club.Strobe && !_club.Smoke;
            p.BooleanInput[Joins.MacroAllOff].BoolValue = cozy && ef && !_club.Strobe && !_club.Smoke && au && _club.DancefloorVolume == 0 && _club.BarVolume == 0;
            p.BooleanInput[Joins.MacroPartyQuick].BoolValue = ef && _club.Strobe && _club.Smoke;
        }

        // -------------------------------------------------------------------------------------
        // Vers le slot 2 : bloc club (états tenus) et blocs salle
        // -------------------------------------------------------------------------------------
        /// <summary>États tenus des fonctions globales, sur le bloc club (Club_xxx_fb = 500 + join global).</summary>
        private void PushClubToEisc()
        {
            if (_eisc == null) return;
            uint b = Joins.ClubBlockBase;
            for (int i = 1; i <= Joins.MaxCrowds; i++) _eisc.BooleanInput[b + Joins.CrowdCozy + (uint)(i - 1)].BoolValue = _club.Crowd == i;
            _eisc.BooleanInput[b + Joins.AudioLimiter].BoolValue = LimiterTripped;
            _eisc.BooleanInput[b + Joins.SmokeOn].BoolValue = _cfg.EffectsActive && _club.Smoke;
            _eisc.BooleanInput[b + Joins.StrobeOn].BoolValue = _cfg.EffectsActive && _club.Strobe;
            _eisc.BooleanInput[b + Joins.LyresOn].BoolValue = _cfg.EffectsActive && _club.Lyres;
            for (int i = 1; i <= Joins.MaxScreenSources; i++) _eisc.BooleanInput[b + Joins.ScreenSourceBase + (uint)i].BoolValue = _cfg.ScreenActive && _club.ScreenSource == i;
            _eisc.UShortInput[b + Joins.HvacFan].UShortValue = (ushort)(_cfg.HvacActive ? _club.FanPct : 0);
            _eisc.UShortInput[b + Joins.HvacSetpoint].UShortValue = _cfg.HvacActive ? ClubState.Tenths(_club.SetpointC) : (ushort)0;
            _eisc.UShortInput[b + Joins.AudioDancefloorVolume].UShortValue = (ushort)(_cfg.AudioActive ? _club.DancefloorVolume : 0);
            _eisc.UShortInput[b + Joins.AudioBarVolume].UShortValue = (ushort)(_cfg.AudioActive ? _club.BarVolume : 0);
            _eisc.UShortInput[b + Joins.StrobeFreq].UShortValue = (ushort)(_cfg.EffectsActive ? _club.StrobeFreq : 0);
            _eisc.UShortInput[b + Joins.ScreenSource].UShortValue = (ushort)(_cfg.ScreenActive ? _club.ScreenSource : 0);
        }

        private void PushAllRoomBlocks() { foreach (int id in _roomOrder) PushRoomBlock(id); }

        private bool IsDisplayed(int roomId) { foreach (var kv in _activeRoomPerDevice) if (kv.Value == roomId || kv.Value == AllRoom) return true; return false; }

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
                    if (!r.CircuitActive(i - 1)) continue;
                    _eisc.BooleanInput[b + Joins.Room.LightOnBase + (uint)i].BoolValue = r.LightPct[i - 1] > 0;
                    _eisc.UShortInput[b + Joins.Room.LightLevelBase + (uint)i].UShortValue = ToRaw(r.LightPct[i - 1]);
                }
            if (r.Cfg.AmbianceActive)
            {
                for (int i = 1; i <= Joins.MaxScenes; i++) _eisc.BooleanInput[b + Joins.Room.SceneBase + (uint)i].BoolValue = r.Scene == i;
                _eisc.UShortInput[b + Joins.Room.Level].UShortValue = ToRaw(r.LevelPct);
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
                var sc = _cfg.SceneById(r.Scene);
                sb.AppendFormat("[{0}] {1} : scene {2} intensite {3}% ", id, r.Cfg.Name, sc != null ? sc.Name : "?", r.LevelPct);
                if (r.Cfg.LightsActive) { sb.Append("L="); for (int i = 0; i < r.LightPct.Length; i++) sb.Append(r.CircuitActive(i) ? r.LightPct[i] + "% " : "-- "); }
                sb.Append("\r\n");
            }
            var cr = _cfg.CrowdById(_club.Crowd);
            sb.AppendFormat("Club : affluence {0}, ventilation {1}%, consigne {2:0.0} C, mesure {3:0.0} C, CTA {4}\r\n",
                cr != null ? cr.Name : "?", _club.FanPct, _club.SetpointC, _club.TemperatureC, _club.CtaOnline ? "en ligne" : "hors ligne");
            sb.AppendFormat("       piste {0}, bar {1}, {2} dB ({3}), limiteur {4}\r\n",
                _club.DancefloorVolume, _club.BarVolume, _club.Db, _club.DbFromSlot2 ? "DSP" : "simule", LimiterTripped ? "ACTIF" : "repos");
            var src = _cfg.ScreenSourceById(_club.ScreenSource);
            sb.AppendFormat("       fumee {0}, strobe {1} ({2} Hz), lyres {3}, ecran DJ {4}\r\n",
                _club.Smoke ? "ON" : "off", _club.Strobe ? "ON" : "off", _club.StrobeFreq, _club.Lyres ? "ON" : "off", src != null ? src.Name : "-");
            foreach (var kv in _activeRoomPerDevice)
            {
                PanelNav nav; _navPerDevice.TryGetValue(kv.Key, out nav);
                sb.AppendFormat("Ecran {0:X2} -> salle {1}{2}, vue {3}, etage {4}\r\n", kv.Key, kv.Value, kv.Value == AllRoom ? " (tout le club)" : "",
                    nav == null ? "?" : nav.View == ViewBuilding ? "batiment" : nav.View == ViewFloor ? "etage" : "salle", nav == null ? -1 : nav.Floor);
            }
        }

        private void CmdRoom(string arg)
        {
            var parts = (arg ?? "").Trim().Split(' ');
            uint ipid; int room;
            if (parts.Length != 2 || !uint.TryParse(parts[0], System.Globalization.NumberStyles.HexNumber, null, out ipid) || !int.TryParse(parts[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : clubroom <ipid hex> <salle, 0 = tout>\r\n"); return; }
            foreach (var p in _panels) if (p.ID == ipid && p != _eisc) { try { _lock.Enter(); SelectRoom(p, room); } finally { _lock.Leave(); } CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> salle {1}\r\n", ipid, room); return; }
            CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ipid);
        }
    }
}
