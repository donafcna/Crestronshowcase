// Boutique Auralis — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : registre des espaces et de leurs fonctionnalités (boutique-auralis_config.json), espace affiché
// par chaque écran (0 = toute la boutique), application des actions, feedback des écrans, pont EISC vers
// le slot 2 (SIMPL), scènes par espace, fonctions boutique (stores 4 façades, éclairage général, blanc
// et loi horaire, parfum, cycle horaire ouverture / fermeture par CTimer).
//
// Chaîne réelle : écran (TSW-1070 / XPanel / iPad / iPhone)
//                   → C# slot 1 : action appliquée à l'espace affiché par CET écran (ou à tous)
//                   → EISC IP-ID F0 : Room_Select# (a10) posé, puis impulsion sur le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers
//                   → EISC : mesures _Actual (blocs espace 1000+, bloc maison) → C# → feedback des écrans.
//
// Contrat : Joins.cs ↔ config/boutique-auralis_config.json → contrat (tools/check-contract.js).

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

namespace BoutiqueAuralis
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/boutique-auralis_config.json";
        private const string Ch5ProjectName = "boutiqueauralis";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int ConfigChunkSize = 200;
        private const int AllRoom = 0;                    // Room_Select# = 0 → toute la boutique

        private BoutiqueAuralisConfig _cfg;
        private string _configMinified = "";
        private string _configHash = "";
        private readonly List<string> _configChunks = new List<string>();
        private readonly Dictionary<uint, int> _configChunkPos = new Dictionary<uint, int>();

        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _roomOrder = new List<int>();
        private RoomState _all;                           // espace virtuel « Toute la boutique » (id 0, jamais sur l'EISC)
        private readonly BoutiqueState _b = new BoutiqueState();
        private string _summary = "";

        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private EthernetIntersystemCommunications _eisc;
        private readonly Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private readonly CCriticalSection _lock = new CCriticalSection();
        private CTimer _whiteTimer;                       // loi horaire du blanc (periodeMs, 1 min)
        private CTimer _scheduleTimer;                    // cycle ouverture / fermeture (periodeMs, 30 s)
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;

        public ControlSystem() : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;
                CrestronEnvironment.ProgramStatusEventHandler += OnProgramStatus;
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE ctor: {0}", e.Message); }
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
                if (_cfg.White.Active) { if (_b.WhiteAuto) ApplyWhiteLaw(); _whiteTimer = new CTimer(OnWhiteTick, null, _cfg.White.PeriodMs, _cfg.White.PeriodMs); }
                if (_cfg.Schedule.Active) _scheduleTimer = new CTimer(OnScheduleTick, null, _cfg.Schedule.PeriodMs, _cfg.Schedule.PeriodMs);
                RefreshAll();

                CrestronConsole.AddNewConsoleCommand(CmdState, "boutiquestate", "Etat des espaces Boutique Auralis (boutiquestate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "boutiqueroom", "Espace affiche par ecran : boutiqueroom <ipid hex> <espace, 0 = tout>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("boutiquetrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "boutiquetrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("BOUTIQUE: {0} v{1} — {2} espaces, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE InitializeSystem: {0}", e.ToString()); }
        }

        private void OnProgramStatus(eProgramStatusEventType t)
        {
            if (t != eProgramStatusEventType.Stopping) return;
            try
            {
                if (_whiteTimer != null) { _whiteTimer.Stop(); _whiteTimer.Dispose(); }
                if (_scheduleTimer != null) { _scheduleTimer.Stop(); _scheduleTimer.Dispose(); }
            }
            catch { }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("BOUTIQUE: " + fmt, a); }

        // -------------------------------------------------------------------------------------
        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("BOUTIQUE: {0} absent — aucun espace.", ConfigPath); _cfg = new BoutiqueAuralisConfig(); return; }
                string raw = System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8);
                var root = JObject.Parse(raw);
                _cfg = BoutiqueAuralisConfig.Parse(root);
                _configMinified = root.ToString(Newtonsoft.Json.Formatting.None);
                _configHash = ComputeHash(_configMinified);
                _configChunks.Clear();
                for (int i = 0; i < _configMinified.Length; i += ConfigChunkSize)
                    _configChunks.Add(_configMinified.Substring(i, Math.Min(ConfigChunkSize, _configMinified.Length - i)));
                CrestronConsole.PrintLine("BOUTIQUE: configuration chargee ({0} car., {1} chunks, empreinte {2}).", _configMinified.Length, _configChunks.Count, _configHash);
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new BoutiqueAuralisConfig(); }
        }

        private static string ComputeHash(string s)
        {
            unchecked { uint h = 2166136261; foreach (char c in s) { h ^= c; h *= 16777619; } return h.ToString("X8"); }
        }

        private void BuildState()
        {
            _rooms.Clear(); _roomOrder.Clear();
            foreach (var rc in _cfg.Rooms) { _rooms[rc.Id] = new RoomState(rc); _roomOrder.Add(rc.Id); }
            _all = new RoomState(_cfg.BuildAllRoom());
            _summary = _cfg.Floors.Count + (_cfg.Floors.Count > 1 ? " niveaux · " : " niveau · ") + _rooms.Count + (_rooms.Count > 1 ? " espaces" : " espace");

            var sc = _cfg.SceneByKey(_cfg.InitialSceneKey);
            int sceneId = sc != null ? sc.Id : 0;
            foreach (var r in _rooms.Values) r.Scene = sceneId;
            _all.Scene = sceneId;

            for (int i = 0; i < Joins.MaxBlinds; i++) _b.BlindsPct[i] = RoomState.Clamp(_cfg.Blinds.InitialPct);
            _b.Kelvin = ClampKelvin(_cfg.White.Initial);
            _b.WhiteAuto = _cfg.White.Active && _cfg.White.AutoInitial;
            _b.ScentOn = _cfg.Scent.Active && _cfg.Scent.InitialOn;
            _b.Fragrance = _cfg.Scent.Active ? _cfg.Scent.InitialFragrance : 0;
            _b.Diffusion = RoomState.Clamp(_cfg.Scent.InitialDiffusion);
            _b.ScheduleOn = _cfg.Schedule.Active && _cfg.Schedule.InitialOn;
            _b.OpeningMin = BoutiqueState.ClampMinutes(_cfg.Schedule.OpeningMin);
            _b.ClosingMin = BoutiqueState.ClampMinutes(_cfg.Schedule.ClosingMin);
        }

        private int DefaultRoom() { return AllRoom; }   // le GUI démarre sur « Toute la boutique »
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoomPerDevice.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }
        private RoomState Room(int id) { if (id == AllRoom) return _all; RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }
        private bool RoomExists(int id) { return id == AllRoom || _rooms.ContainsKey(id); }

        /// <summary>Espaces réels visés par une action : tous si l'écran affiche « Toute la boutique ».</summary>
        private IEnumerable<RoomState> Targets(int roomId)
        {
            if (roomId == AllRoom) { foreach (int id in _roomOrder) yield return _rooms[id]; }
            else { var r = Room(roomId); if (r != null) yield return r; }
        }

        /// <summary>Cibles réelles + l'espace virtuel « Toute la boutique » quand l'action vise tous les espaces (miroir du GUI).</summary>
        private IEnumerable<RoomState> TargetsWithAll(int roomId)
        {
            foreach (var t in Targets(roomId)) yield return t;
            if (roomId == AllRoom) yield return _all;
        }

        // -------------------------------------------------------------------------------------
        private void RegisterUserInterface(BasicTriList dev)
        {
            dev.SigChange += OnSigChange;
            dev.OnlineStatusChange += OnOnlineStatus;
            var res = dev.Register();
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("BOUTIQUE: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("BOUTIQUE: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("BOUTIQUE: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                RegisterUserInterface(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { PushAllRoomBlocks(); PushBoutiqueToEisc(); PushEiscActiveRoom(DefaultRoom()); return; }
                if (!_activeRoomPerDevice.ContainsKey(p.ID)) _activeRoomPerDevice[p.ID] = DefaultRoom();
                PushSystemInfo(p);
                PushRoomToPanel(p, _activeRoomPerDevice[p.ID]);
                PushBoutiqueToPanel(p);
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE OnOnlineStatus {0:X2} : {1}", p.ID, e.ToString()); }
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
            catch (Exception e) { ErrorLog.Error("BOUTIQUE OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
            finally { _lock.Leave(); }
        }

        /// <summary>Recopie l'action vers le slot 2 : Room_Select# (a10) + Room_Active_nn d'abord, puis le même join.</summary>
        private void MirrorToEisc(BasicTriList dev, SigEventArgs args)
        {
            if (_eisc == null) return;
            uint j = args.Sig.Number;
            if (args.Sig.Type == eSigType.Bool && (j == Joins.ConfigResync || (j >= Joins.RoomSelectAll && j <= Joins.RoomSelectBase + Joins.MaxRooms))) return;
            if (args.Sig.Type == eSigType.Bool && j >= Joins.House.PulseFirst && j <= Joins.House.PulseLast) return;   // impulsions moteurs : réservées au C#
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
            if (j == Joins.WhiteTemperature) return (ushort)_b.Kelvin;
            if (j == Joins.ScentDiffusion) return (ushort)_b.Diffusion;
            if (j == Joins.ScheduleOpening) return (ushort)_b.OpeningMin;
            if (j == Joins.ScheduleClosing) return (ushort)_b.ClosingMin;
            if (j > Joins.BlindsPositionBase && j <= Joins.BlindsPositionBase + Joins.MaxBlinds) return ToRaw(_b.BlindsPct[(int)(j - Joins.BlindsPositionBase) - 1]);
            var r = Room(roomId);
            if (r == null) return raw;
            if (j == Joins.MusicVolume) return (ushort)r.MusicVolume;
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
            Trace("appui d{0} ecran {1:X2} espace {2}", j, dev.ID, roomId);

            if (j == Joins.RoomSelectAll) { SelectRoom(dev, AllRoom); return; }
            if (j > Joins.RoomSelectBase && j <= Joins.RoomSelectBase + Joins.MaxRooms) { SelectRoom(dev, (int)(j - Joins.RoomSelectBase)); return; }
            if (j == Joins.ConfigResync) { StartConfigSend(dev); return; }

            // ---- scènes : espace visé (ou tous si a10 = 0), comportement du simulateur
            if (j >= Joins.SceneOpening && j <= Joins.SceneClosed) { RunScene((int)(j - Joins.SceneOpening + 1), roomId); PushRoomsEverywhere(roomId); return; }

            // ---- éclairage général : tous les espaces, quel que soit a10
            if ((j == Joins.LightsAllOn || j == Joins.LightsAllOff) && _cfg.AllLightsActive)
            {
                foreach (var t in TargetsWithAll(AllRoom)) SetAllLights(t, j == Joins.LightsAllOn ? 100 : 0);
                CustomScene(AllRoom);
                PushRoomsEverywhere(AllRoom); PushBoutiqueEverywhere();
                return;
            }

            // ---- boutique (globaux)
            bool house = true;
            if (j > Joins.BlindsOpenBase && j <= Joins.BlindsOpenBase + Joins.MaxBlinds) house = SetBlinds((int)(j - Joins.BlindsOpenBase), _cfg.Blinds.OpenPct, Joins.House.BlindsUpBase);
            else if (j == Joins.BlindsAllOpen) house = SetBlinds(0, _cfg.Blinds.OpenPct, Joins.House.BlindsUpBase);
            else if (j > Joins.BlindsHalfBase && j <= Joins.BlindsHalfBase + Joins.MaxBlinds) house = SetBlinds((int)(j - Joins.BlindsHalfBase), _cfg.Blinds.HalfPct, Joins.House.BlindsStopBase);
            else if (j == Joins.BlindsAllHalf) house = SetBlinds(0, _cfg.Blinds.HalfPct, Joins.House.BlindsStopBase);
            else if (j > Joins.BlindsCloseBase && j <= Joins.BlindsCloseBase + Joins.MaxBlinds) house = SetBlinds((int)(j - Joins.BlindsCloseBase), _cfg.Blinds.ClosePct, Joins.House.BlindsDownBase);
            else if (j == Joins.BlindsAllClose) house = SetBlinds(0, _cfg.Blinds.ClosePct, Joins.House.BlindsDownBase);
            else if (j == Joins.WhiteAuto && _cfg.White.Active) { _b.WhiteAuto = !_b.WhiteAuto; if (_b.WhiteAuto) ApplyWhiteLaw(); }
            else if (j == Joins.ScentOn && _cfg.Scent.Active) _b.ScentOn = true;
            else if (j == Joins.ScentOff && _cfg.Scent.Active) _b.ScentOn = false;
            else if (j > Joins.ScentFragranceBase && j <= Joins.ScentFragranceBase + Joins.MaxFragrances && _cfg.Scent.Active)
            {
                int f = (int)(j - Joins.ScentFragranceBase);
                if (_cfg.FragranceById(f) != null) _b.Fragrance = f; else house = false;
            }
            else if (j == Joins.ScheduleOn && _cfg.Schedule.Active) _b.ScheduleOn = true;
            else if (j == Joins.ScheduleOff && _cfg.Schedule.Active) _b.ScheduleOn = false;
            else if (j == Joins.ScheduleOpeningUp && _cfg.Schedule.Active) _b.OpeningMin = BoutiqueState.WrapMinutes(_b.OpeningMin + _cfg.Schedule.StepMin);
            else if (j == Joins.ScheduleOpeningDown && _cfg.Schedule.Active) _b.OpeningMin = BoutiqueState.WrapMinutes(_b.OpeningMin - _cfg.Schedule.StepMin);
            else if (j == Joins.ScheduleClosingUp && _cfg.Schedule.Active) _b.ClosingMin = BoutiqueState.WrapMinutes(_b.ClosingMin + _cfg.Schedule.StepMin);
            else if (j == Joins.ScheduleClosingDown && _cfg.Schedule.Active) _b.ClosingMin = BoutiqueState.WrapMinutes(_b.ClosingMin - _cfg.Schedule.StepMin);
            else house = false;
            if (house) { PushBoutiqueEverywhere(); return; }

            // ---- espace affiché (ou tous)
            var r = Room(roomId);
            if (r == null) return;
            bool done = true;
            if (j > Joins.LightToggleBase && j <= Joins.LightToggleBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightToggleBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { int pct = r.LightPct[i] > 0 ? 0 : 100; SetLight(roomId, i, pct); CustomScene(roomId); }
                else done = false;
            }
            else if (j > Joins.MusicSourceBase && j <= Joins.MusicSourceBase + Joins.MaxSources && r.Cfg.AudioActive)
            {
                int s = (int)(j - Joins.MusicSourceBase);
                if (s <= _cfg.Sources.Count) { foreach (var t in TargetsWithAll(roomId)) { if (t.Cfg.AudioActive) { t.MusicSource = s; t.MusicPlaying = true; } } }
                else done = false;
            }
            else if (j == Joins.MusicPlayPause && r.Cfg.AudioActive) { bool v = !r.MusicPlaying; foreach (var t in TargetsWithAll(roomId)) if (t.Cfg.AudioActive) t.MusicPlaying = v; }
            else if (j == Joins.MusicMute && r.Cfg.AudioActive) { bool v = !r.MusicMuted; foreach (var t in TargetsWithAll(roomId)) if (t.Cfg.AudioActive) t.MusicMuted = v; }
            else done = false;
            if (done) PushRoomsEverywhere(roomId);
        }

        private bool HandleAnalog(BasicTriList dev, uint j, ushort v)
        {
            if (j == Joins.RoomSelect) { if (v <= Joins.MaxRooms) SelectRoom(dev, v); return false; }
            if (j == Joins.ConfigChunkAck) { OnConfigChunkAck(dev, v); return false; }
            int roomId = ActiveRoom(dev);
            Trace("analog a{0}={1} ecran {2:X2} espace {3}", j, v, dev.ID, roomId);

            // ---- boutique (globaux)
            if (j == Joins.WhiteTemperature && _cfg.White.Active) { _b.Kelvin = ClampKelvin(v); _b.WhiteAuto = false; PushBoutiqueEverywhere(); return true; }   // réglage manuel → automatisme coupé (simulateur)
            if (j == Joins.ScentDiffusion && _cfg.Scent.Active) { _b.Diffusion = RoomState.Clamp(v); PushBoutiqueEverywhere(); return true; }
            if (j == Joins.ScheduleOpening && _cfg.Schedule.Active) { _b.OpeningMin = BoutiqueState.ClampMinutes(v); PushBoutiqueEverywhere(); return true; }
            if (j == Joins.ScheduleClosing && _cfg.Schedule.Active) { _b.ClosingMin = BoutiqueState.ClampMinutes(v); PushBoutiqueEverywhere(); return true; }
            if (j > Joins.BlindsPositionBase && j <= Joins.BlindsPositionBase + Joins.MaxBlinds)
            {
                // curseur de position : ramené aux trois états du GUI (Open ≥ 75 %, Close ≤ 25 %, Half entre les deux)
                int pct = ToPct(v);
                bool ok = pct >= 75 ? SetBlinds((int)(j - Joins.BlindsPositionBase), _cfg.Blinds.OpenPct, Joins.House.BlindsUpBase)
                        : pct <= 25 ? SetBlinds((int)(j - Joins.BlindsPositionBase), _cfg.Blinds.ClosePct, Joins.House.BlindsDownBase)
                        : SetBlinds((int)(j - Joins.BlindsPositionBase), _cfg.Blinds.HalfPct, Joins.House.BlindsStopBase);
                if (ok) PushBoutiqueEverywhere();
                return ok;
            }

            // ---- espace affiché (ou tous)
            var r = Room(roomId);
            if (r == null) return false;
            if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightLevelBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { SetLight(roomId, i, ToPct(v)); CustomScene(roomId); PushRoomsEverywhere(roomId); return true; }
                return false;
            }
            if (j == Joins.MusicVolume && r.Cfg.AudioActive)
            {
                int vol = RoomState.Clamp(v);
                foreach (var t in TargetsWithAll(roomId)) if (t.Cfg.AudioActive) t.MusicVolume = vol;
                PushRoomsEverywhere(roomId); return true;
            }
            return false;
        }

        // =====================================================================================
        // Logique métier
        // =====================================================================================
        private static int ToPct(ushort v) { return (int)Math.Round(v * 100.0 / 65535.0); }
        private static ushort ToRaw(int pct) { return (ushort)Math.Round(RoomState.Clamp(pct) * 65535.0 / 100.0); }
        /// <summary>Un circuit inactif reste à 0 ; un circuit non gradable ne connaît que 0 et 100 %.</summary>
        private static int LevelFor(RoomState r, int i, int pct)
        {
            if (!r.CircuitActive(i)) return 0;
            return r.Cfg.Circuits[i].Dimmable ? RoomState.Clamp(pct) : (pct > 0 ? 100 : 0);
        }
        private int ClampKelvin(int k)
        {
            int step = _cfg.White.Step > 0 ? _cfg.White.Step : 100;
            k = (int)Math.Round(k / (double)step) * step;
            return Math.Max(_cfg.White.Min, Math.Min(_cfg.White.Max, k));
        }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (!RoomExists(roomId)) return;
            _activeRoomPerDevice[dev.ID] = roomId;
            PushEiscActiveRoom(roomId);
            PushRoomToPanel(dev, roomId);
            PushBoutiqueToPanel(dev);
            PushAllRoomBlocks();   // Rnn_Room_Displayed_fb
        }

        private void SetAllLights(RoomState r, int pct) { for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = LevelFor(r, i, pct); }

        private void SetLight(int roomId, int i, int pct)
        {
            foreach (var t in Targets(roomId)) if (i < t.LightPct.Length) t.LightPct[i] = LevelFor(t, i, pct);
            if (roomId == AllRoom && i < _all.LightPct.Length) _all.LightPct[i] = LevelFor(_all, i, pct);
        }

        /// <summary>Réglage manuel → « Ambiance personnalisée » sur les espaces visés.</summary>
        private void CustomScene(int roomId) { foreach (var t in TargetsWithAll(roomId)) t.Scene = 0; }

        /// <summary>Scène de l'espace visé (tous les espaces + le virtuel si a10 = 0) : niveaux par clé de circuit.</summary>
        private void RunScene(int id, int roomId)
        {
            var sc = _cfg.SceneById(id);
            if (sc == null) return;
            foreach (var t in TargetsWithAll(roomId)) { ApplySceneTo(t, sc); t.Scene = sc.Id; }
            Trace("scene {0} ({1}) appliquee sur {2}", sc.Id, sc.Name, roomId == AllRoom ? "toute la boutique" : "espace " + roomId);
        }

        private static void ApplySceneTo(RoomState r, SceneConfig sc)
        {
            if (!r.Cfg.LightsActive) return;
            for (int i = 0; i < r.LightPct.Length; i++)
            {
                int pct;
                if (r.CircuitActive(i) && sc.Levels.TryGetValue(r.Cfg.Circuits[i].Key, out pct)) r.LightPct[i] = LevelFor(r, i, pct);
            }
        }

        /// <summary>Scène affichée pour un espace : celle de l'espace, ou pour « Toute la boutique » la scène commune aux espaces (0 sinon).</summary>
        private int SceneOf(int roomId)
        {
            if (roomId != AllRoom) { var r = Room(roomId); return r != null ? r.Scene : 0; }
            int common = -1;
            foreach (var r in _rooms.Values) { if (common == -1) common = r.Scene; else if (common != r.Scene) return 0; }
            return common < 0 ? 0 : common;
        }

        /// <summary>Stores : façade n (1..4) ou toutes (0) → position tenue + impulsion moteur Blinds_n_Up/Stop/Down.</summary>
        private bool SetBlinds(int face, int pct, uint pulseBase)
        {
            if (!_cfg.Blinds.Active) return false;
            if (face != 0 && !_cfg.HasFace(face)) return false;
            foreach (var f in _cfg.Blinds.Faces)
            {
                if (face != 0 && f.Id != face) continue;
                _b.BlindsPct[f.Id - 1] = RoomState.Clamp(pct);
                PulseHouse(pulseBase + (uint)f.Id);
            }
            return true;
        }

        /// <summary>Loi horaire du blanc (simulateur) : kelvin du premier palier dont l'heure n'est pas atteinte, sinon kelvinDefaut.</summary>
        private bool ApplyWhiteLaw()
        {
            if (!_cfg.White.Active) return false;
            int hour = DateTime.Now.Hour;
            int k = _cfg.White.DefaultKelvin;
            foreach (var step in _cfg.White.Law) if (hour < step.BeforeHour) { k = step.Kelvin; break; }
            k = ClampKelvin(k);
            if (k == _b.Kelvin) return false;
            _b.Kelvin = k;
            return true;
        }

        private void OnWhiteTick(object o)
        {
            try
            {
                _lock.Enter();
                if (_b.WhiteAuto && ApplyWhiteLaw()) { Trace("blanc auto -> {0} K", _b.Kelvin); PushBoutiqueEverywhere(); }
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE OnWhiteTick : {0}", e.Message); }
            finally { _lock.Leave(); }
        }

        /// <summary>Cycle horaire : à l'heure d'ouverture → scène Ouverture sur toute la boutique, à la fermeture → Fermeture (une fois par minute).</summary>
        private void OnScheduleTick(object o)
        {
            try
            {
                _lock.Enter();
                var now = DateTime.Now;
                int minute = now.Hour * 60 + now.Minute;
                if (minute == _b.LastScheduleMinute) return;
                _b.LastScheduleMinute = minute;
                if (!_b.ScheduleOn) return;
                SceneConfig sc = null;
                if (minute == _b.OpeningMin) sc = _cfg.SceneByKey(_cfg.Schedule.OpeningSceneKey);
                else if (minute == _b.ClosingMin) sc = _cfg.SceneByKey(_cfg.Schedule.ClosingSceneKey);
                if (sc == null) return;
                RunScene(sc.Id, AllRoom);
                Trace("cycle horaire {0} -> scene {1}", BoutiqueState.FormatTime(minute), sc.Name);
                PushRoomsEverywhere(AllRoom);
                // L'action automatique est visible dans le Debugger comme un appui depuis « Toute la boutique » :
                // a10 = 0 + Room_Active_00 posés, puis impulsion Scene_x sur l'EISC (règle 3 du contrat).
                if (_eisc != null) { PushEiscActiveRoom(AllRoom); _eisc.BooleanInput[Joins.SceneOpening + (uint)(sc.Id - 1)].Pulse(250); }
            }
            catch (Exception e) { ErrorLog.Error("BOUTIQUE OnScheduleTick : {0}", e.Message); }
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
                Trace("slot2 espace {0} offset +{1} {2}", roomId, off, args.Sig.Type);
                if (args.Sig.Type == eSigType.Bool)
                {
                    bool v = args.Sig.BoolValue;
                    if (off > Joins.Room.LightOnBase && off <= Joins.Room.LightOnBase + Joins.MaxCircuits)
                    {
                        int i = (int)(off - Joins.Room.LightOnBase) - 1;
                        if (!r.CircuitActive(i)) return;
                        if ((r.LightPct[i] > 0) != v) r.LightPct[i] = v ? 100 : 0;
                    }
                    else if (off == Joins.Room.MusicPlaying) r.MusicPlaying = v;
                    else if (off == Joins.Room.MusicMuted) r.MusicMuted = v;
                    else return;
                }
                else if (args.Sig.Type == eSigType.UShort)
                {
                    ushort v = args.Sig.UShortValue;
                    if (off > Joins.Room.LightLevelBase && off <= Joins.Room.LightLevelBase + Joins.MaxCircuits)
                    { int i = (int)(off - Joins.Room.LightLevelBase) - 1; if (r.CircuitActive(i)) r.LightPct[i] = LevelFor(r, i, ToPct(v)); else return; }
                    else if (off == Joins.Room.MusicVolume) r.MusicVolume = RoomState.Clamp(v);
                    else if (off == Joins.Room.MusicSource) { if (v >= 1 && v <= _cfg.Sources.Count) r.MusicSource = v; else return; }
                    else return;
                }
                else return;
                PushRoomEverywhere(roomId);   // écrans + Rnn_xxx_fb (l'état tenu suit la mesure, la scène affichée ne change pas)
                return;
            }
            // ---- boutique : états réels renvoyés par le slot 2 (bloc maison)
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (j == Joins.WhiteAuto && _cfg.White.Active) { _b.WhiteAuto = v; if (v) ApplyWhiteLaw(); }
                else if (j == Joins.ScentOn && _cfg.Scent.Active) _b.ScentOn = v;
                else if (j > Joins.ScentFragranceBase && j <= Joins.ScentFragranceBase + Joins.MaxFragrances && _cfg.Scent.Active)
                { int f = (int)(j - Joins.ScentFragranceBase); if (v && _cfg.FragranceById(f) != null) _b.Fragrance = f; else return; }
                else return;
                PushBoutiqueEverywhere();
                return;
            }
            if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (j == Joins.WhiteTemperature && _cfg.White.Active) _b.Kelvin = ClampKelvin(v);
                else if (j == Joins.ScentDiffusion && _cfg.Scent.Active) _b.Diffusion = RoomState.Clamp(v);
                else if (j > Joins.BlindsPositionBase && j <= Joins.BlindsPositionBase + Joins.MaxBlinds && _cfg.Blinds.Active)
                { int f = (int)(j - Joins.BlindsPositionBase); if (_cfg.HasFace(f)) _b.BlindsPct[f - 1] = ToPct(v); else return; }
                else return;
                PushBoutiqueEverywhere();
            }
        }

        // =====================================================================================
        // Feedback des écrans
        // =====================================================================================
        private void RefreshAll()
        {
            foreach (var p in _panels) { if (p == _eisc) continue; PushSystemInfo(p); PushRoomToPanel(p, ActiveRoom(p)); PushBoutiqueToPanel(p); }
            PushAllRoomBlocks();
            PushBoutiqueToEisc();
        }
        private void PushRoomEverywhere(int roomId) { PushRoomToPanels(roomId); PushRoomBlock(roomId); }
        /// <summary>Après une action sur roomId (0 = tous) : écrans concernés + blocs EISC.</summary>
        private void PushRoomsEverywhere(int roomId)
        {
            if (roomId == AllRoom) { foreach (var p in _panels) if (p != _eisc) PushRoomToPanel(p, ActiveRoom(p)); PushAllRoomBlocks(); }
            else PushRoomEverywhere(roomId);
        }
        private void PushRoomToPanels(int roomId)
        {
            foreach (var p in _panels) { if (p == _eisc) continue; int a = ActiveRoom(p); if (a == roomId || a == AllRoom) PushRoomToPanel(p, a); else PushBoutiqueCounters(p); }
        }
        private void PushBoutiqueEverywhere() { PushBoutiqueToPanels(); PushBoutiqueToEisc(); }
        private void PushBoutiqueToPanels() { foreach (var p in _panels) if (p != _eisc) PushBoutiqueToPanel(p); }

        private void PushSystemInfo(BasicTriList p)
        {
            p.StringInput[Joins.SystemIpId].StringValue = string.Format("{0:X2}", p.ID);
            p.StringInput[Joins.SystemCpzName].StringValue = _cpzName;
            p.StringInput[Joins.SystemCpzDate].StringValue = _cpzDate;
            p.StringInput[Joins.ConfigHash].StringValue = _configHash;
        }

        private int BoutiqueLightsOn() { int n = 0; foreach (var r in _rooms.Values) n += r.LightsOn; return n; }
        private bool AllRoomsLightsOn() { foreach (var r in _rooms.Values) if (r.Cfg.LightsActive && !r.AllLightsOn) return false; return _rooms.Count > 0; }
        private bool AllRoomsLightsOff() { foreach (var r in _rooms.Values) if (!r.AllLightsOff) return false; return true; }
        private void PushBoutiqueCounters(BasicTriList p)
        {
            p.UShortInput[Joins.BoutiqueLightsOn].UShortValue = (ushort)BoutiqueLightsOn();
            p.BooleanInput[Joins.LightsAllOn].BoolValue = _cfg.AllLightsActive && AllRoomsLightsOn();
            p.BooleanInput[Joins.LightsAllOff].BoolValue = _cfg.AllLightsActive && AllRoomsLightsOff();
        }

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
            p.UShortInput[Joins.RoomLightsOn].UShortValue = (ushort)r.LightsOn;
            PushBoutiqueCounters(p);

            // scènes (de l'espace affiché)
            int scene = SceneOf(roomId);
            var sc = _cfg.SceneById(scene);
            for (int i = 1; i <= Joins.MaxScenes; i++) p.BooleanInput[Joins.SceneOpening + (uint)(i - 1)].BoolValue = scene == i;
            p.UShortInput[Joins.Scene].UShortValue = (ushort)scene;
            p.StringInput[Joins.SceneName].StringValue = sc != null ? sc.Name : _cfg.CustomSceneName;

            // éclairages
            bool li = r.Cfg.LightsActive;
            for (int i = 1; i <= Joins.MaxCircuits; i++)
            {
                int pct = li && r.CircuitActive(i - 1) ? r.LightPct[i - 1] : 0;
                p.BooleanInput[Joins.LightToggleBase + (uint)i].BoolValue = pct > 0;
                p.UShortInput[Joins.LightLevelBase + (uint)i].UShortValue = ToRaw(pct);
            }
            // musique
            bool au = r.Cfg.AudioActive;
            for (int i = 1; i <= Joins.MaxSources; i++) p.BooleanInput[Joins.MusicSourceBase + (uint)i].BoolValue = au && r.MusicSource == i;
            p.BooleanInput[Joins.MusicPlayPause].BoolValue = au && r.MusicPlaying;
            p.BooleanInput[Joins.MusicMute].BoolValue = au && r.MusicMuted;
            p.UShortInput[Joins.MusicVolume].UShortValue = (ushort)(au ? r.MusicVolume : 0);
            p.StringInput[Joins.MusicSourceName].StringValue = au && r.MusicSource >= 1 && r.MusicSource <= _cfg.Sources.Count ? _cfg.Sources[r.MusicSource - 1].Name : "";
        }

        private void PushBoutiqueToPanel(BasicTriList p)
        {
            p.StringInput[Joins.BoutiqueSummary].StringValue = _summary;
            PushBoutiqueCounters(p);

            // stores : fb par façade + « toutes »
            bool bl = _cfg.Blinds.Active;
            bool allOpen = bl, allHalf = bl, allClose = bl;
            for (int n = 1; n <= Joins.MaxBlinds; n++)
            {
                bool has = bl && _cfg.HasFace(n);
                int pct = has ? _b.BlindsPct[n - 1] : 0;
                bool open = has && pct >= _cfg.Blinds.OpenPct, half = has && pct == _cfg.Blinds.HalfPct, close = has && pct <= _cfg.Blinds.ClosePct;
                p.BooleanInput[Joins.BlindsOpenBase + (uint)n].BoolValue = open;
                p.BooleanInput[Joins.BlindsHalfBase + (uint)n].BoolValue = half;
                p.BooleanInput[Joins.BlindsCloseBase + (uint)n].BoolValue = close;
                p.UShortInput[Joins.BlindsPositionBase + (uint)n].UShortValue = ToRaw(pct);
                if (has) { allOpen &= open; allHalf &= half; allClose &= close; }
            }
            p.BooleanInput[Joins.BlindsAllOpen].BoolValue = allOpen;
            p.BooleanInput[Joins.BlindsAllHalf].BoolValue = allHalf;
            p.BooleanInput[Joins.BlindsAllClose].BoolValue = allClose;

            // blanc
            bool wh = _cfg.White.Active;
            p.BooleanInput[Joins.WhiteAuto].BoolValue = wh && _b.WhiteAuto;
            p.UShortInput[Joins.WhiteTemperature].UShortValue = (ushort)(wh ? _b.Kelvin : 0);

            // parfum
            bool sc = _cfg.Scent.Active;
            p.BooleanInput[Joins.ScentOn].BoolValue = sc && _b.ScentOn;
            p.BooleanInput[Joins.ScentOff].BoolValue = sc && !_b.ScentOn;
            for (int i = 1; i <= Joins.MaxFragrances; i++) p.BooleanInput[Joins.ScentFragranceBase + (uint)i].BoolValue = sc && _b.Fragrance == i;
            p.UShortInput[Joins.ScentDiffusion].UShortValue = (ushort)(sc ? _b.Diffusion : 0);
            var fr = sc ? _cfg.FragranceById(_b.Fragrance) : null;
            p.StringInput[Joins.ScentFragranceName].StringValue = fr != null ? fr.Name : "";

            // horaires
            bool sh = _cfg.Schedule.Active;
            p.BooleanInput[Joins.ScheduleOn].BoolValue = sh && _b.ScheduleOn;
            p.BooleanInput[Joins.ScheduleOff].BoolValue = sh && !_b.ScheduleOn;
            p.UShortInput[Joins.ScheduleOpening].UShortValue = (ushort)(sh ? _b.OpeningMin : 0);
            p.UShortInput[Joins.ScheduleClosing].UShortValue = (ushort)(sh ? _b.ClosingMin : 0);
            p.StringInput[Joins.ScheduleOpeningText].StringValue = sh ? BoutiqueState.FormatTime(_b.OpeningMin) : "";
            p.StringInput[Joins.ScheduleClosingText].StringValue = sh ? BoutiqueState.FormatTime(_b.ClosingMin) : "";
        }

        // -------------------------------------------------------------------------------------
        // Vers le slot 2 : états boutique (bloc maison) et blocs espace
        // -------------------------------------------------------------------------------------
        /// <summary>Analogiques boutique tenus sur les sorties de l'EISC : blanc, parfum, horaires, positions des stores.</summary>
        private void PushBoutiqueToEisc()
        {
            if (_eisc == null) return;
            if (_cfg.White.Active) _eisc.UShortInput[Joins.WhiteTemperature].UShortValue = (ushort)_b.Kelvin;
            if (_cfg.Scent.Active) _eisc.UShortInput[Joins.ScentDiffusion].UShortValue = (ushort)_b.Diffusion;
            if (_cfg.Schedule.Active)
            {
                _eisc.UShortInput[Joins.ScheduleOpening].UShortValue = (ushort)_b.OpeningMin;
                _eisc.UShortInput[Joins.ScheduleClosing].UShortValue = (ushort)_b.ClosingMin;
            }
            if (_cfg.Blinds.Active)
                foreach (var f in _cfg.Blinds.Faces) _eisc.UShortInput[Joins.BlindsPositionBase + (uint)f.Id].UShortValue = ToRaw(_b.BlindsPct[f.Id - 1]);
        }

        private void PulseHouse(uint join)
        {
            if (_eisc == null) return;
            _eisc.BooleanInput[join].Pulse(_cfg.Blinds.PulseMs);   // impulsion vers le moteur (slot 2)
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
            if (r.Cfg.AudioActive)
            {
                _eisc.BooleanInput[b + Joins.Room.MusicPlaying].BoolValue = r.MusicPlaying;
                _eisc.BooleanInput[b + Joins.Room.MusicMuted].BoolValue = r.MusicMuted;
                _eisc.UShortInput[b + Joins.Room.MusicVolume].UShortValue = (ushort)r.MusicVolume;
                _eisc.UShortInput[b + Joins.Room.MusicSource].UShortValue = (ushort)r.MusicSource;
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
                sb.AppendFormat("[{0}] {1} : scene {2} ", id, r.Cfg.Name, sc != null ? sc.Name : _cfg.CustomSceneName);
                if (r.Cfg.LightsActive) { sb.Append("L="); for (int i = 0; i < r.LightPct.Length; i++) sb.Append(r.CircuitActive(i) ? r.LightPct[i] + "% " : "-- "); }
                if (r.Cfg.AudioActive) sb.AppendFormat("musique {0}{1} src{2} vol{3} ", r.MusicPlaying ? "ON" : "off", r.MusicMuted ? " (muet)" : "", r.MusicSource, r.MusicVolume);
                sb.Append("\r\n");
            }
            var st = new StringBuilder();
            foreach (var f in _cfg.Blinds.Faces) st.AppendFormat("{0} {1}% ", f.Key, _b.BlindsPct[f.Id - 1]);
            var fr = _cfg.FragranceById(_b.Fragrance);
            sb.AppendFormat("Boutique : stores {0}; blanc {1} K auto {2}; parfum {3} '{4}' {5}%; horaires {6} {7}-{8}; circuits allumes {9}\r\n",
                st.ToString(), _b.Kelvin, _b.WhiteAuto ? "ON" : "off", _b.ScentOn ? "ON" : "off", fr != null ? fr.Name : "", _b.Diffusion,
                _b.ScheduleOn ? "ON" : "off", BoutiqueState.FormatTime(_b.OpeningMin), BoutiqueState.FormatTime(_b.ClosingMin), BoutiqueLightsOn());
            foreach (var kv in _activeRoomPerDevice) sb.AppendFormat("Ecran {0:X2} -> espace {1}{2}\r\n", kv.Key, kv.Value, kv.Value == AllRoom ? " (toute la boutique)" : "");
        }

        private void CmdRoom(string arg)
        {
            var parts = (arg ?? "").Trim().Split(' ');
            uint ipid; int room;
            if (parts.Length != 2 || !uint.TryParse(parts[0], System.Globalization.NumberStyles.HexNumber, null, out ipid) || !int.TryParse(parts[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : boutiqueroom <ipid hex> <espace, 0 = tout>\r\n"); return; }
            if (!RoomExists(room)) { CrestronConsole.ConsoleCommandResponse("espace {0} inconnu (0 = tout, 1..{1})\r\n", room, _rooms.Count); return; }
            foreach (var p in _panels) if (p.ID == ipid && p != _eisc) { try { _lock.Enter(); SelectRoom(p, room); } finally { _lock.Leave(); } CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> espace {1}\r\n", ipid, room); return; }
            CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ipid);
        }
    }
}
