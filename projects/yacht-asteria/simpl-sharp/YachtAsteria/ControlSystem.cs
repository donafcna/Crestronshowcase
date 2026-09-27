// Yacht Asteria — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : registre des espaces et de leurs fonctionnalités (yacht-asteria_config.json), espace affiché
// par chaque écran (0 = tout le yacht), application des actions, feedback des écrans, pont EISC vers le
// slot 2 (SIMPL), scènes globales, couleur / effets des bandeaux (cycle CTimer), cycle jour/nuit.
//
// Chaîne réelle : écran (TSW-1070 / XPanel / iPad / iPhone)
//                   → C# slot 1 : action appliquée à l'espace affiché par CET écran (ou à tous)
//                   → EISC IP-ID F0 : Room_Select# (a10) posé, puis impulsion sur le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers
//                   → EISC : mesures _Actual (blocs espace 500+) → C# → feedback des écrans.
//
// Contrat : Joins.cs ↔ config/yacht-asteria_config.json → contrat (tools/check-contract.js).

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

namespace YachtAsteria
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/yacht-asteria_config.json";
        private const string Ch5ProjectName = "yachtasteria";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int ConfigChunkSize = 200;
        private const int AllRoom = 0;                    // Room_Select# = 0 → tout le yacht

        private YachtAsteriaConfig _cfg;
        private string _configMinified = "";
        private string _configHash = "";
        private readonly List<string> _configChunks = new List<string>();
        private readonly Dictionary<uint, int> _configChunkPos = new Dictionary<uint, int>();

        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _roomOrder = new List<int>();
        private RoomState _all;                           // espace virtuel « Tout le yacht » (id 0, jamais sur l'EISC)
        private readonly YachtState _yacht = new YachtState();
        private string _summary = "";

        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private EthernetIntersystemCommunications _eisc;
        private readonly Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private readonly CCriticalSection _lock = new CCriticalSection();
        private CTimer _effectTimer;                      // créé une fois, réarmé par Reset(), arrêté par Stop()
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;

        public ControlSystem() : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;
                CrestronEnvironment.ProgramStatusEventHandler += OnProgramStatus;
            }
            catch (Exception e) { ErrorLog.Error("YACHT ctor: {0}", e.Message); }
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
                _effectTimer = new CTimer(OnEffectTick, null, Timeout.Infinite, Timeout.Infinite);   // Timeout = Crestron.SimplSharp (comme ftv-home)
                ApplyEffect(_yacht.Effect);
                RefreshAll();

                CrestronConsole.AddNewConsoleCommand(CmdState, "yachtstate", "Etat des espaces Yacht Asteria (yachtstate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "yachtroom", "Espace affiche par ecran : yachtroom <ipid hex> <espace, 0 = tout>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("yachttrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "yachttrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("YACHT: {0} v{1} — {2} espaces, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("YACHT InitializeSystem: {0}", e.ToString()); }
        }

        private void OnProgramStatus(eProgramStatusEventType t)
        {
            if (t != eProgramStatusEventType.Stopping) return;
            try { if (_effectTimer != null) { _effectTimer.Stop(); _effectTimer.Dispose(); } } catch { }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("YACHT: " + fmt, a); }

        // -------------------------------------------------------------------------------------
        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("YACHT: {0} absent — aucun espace.", ConfigPath); _cfg = new YachtAsteriaConfig(); return; }
                string raw = System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8);
                var root = JObject.Parse(raw);
                _cfg = YachtAsteriaConfig.Parse(root);
                _configMinified = root.ToString(Newtonsoft.Json.Formatting.None);
                _configHash = ComputeHash(_configMinified);
                _configChunks.Clear();
                for (int i = 0; i < _configMinified.Length; i += ConfigChunkSize)
                    _configChunks.Add(_configMinified.Substring(i, Math.Min(ConfigChunkSize, _configMinified.Length - i)));
                CrestronConsole.PrintLine("YACHT: configuration chargee ({0} car., {1} chunks, empreinte {2}).", _configMinified.Length, _configChunks.Count, _configHash);
            }
            catch (Exception e) { ErrorLog.Error("YACHT: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new YachtAsteriaConfig(); }
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
            _summary = _cfg.Floors.Count + (_cfg.Floors.Count > 1 ? " ponts · " : " pont · ") + _rooms.Count + (_rooms.Count > 1 ? " espaces" : " espace");

            var sc = _cfg.SceneByKey(_cfg.InitialSceneKey);
            _yacht.Scene = sc != null ? sc.Id : 0;
            int r, g, b;
            if (!YachtState.TryParseHex(_cfg.InitialColor, out r, out g, out b)) { r = 255; g = 215; b = 162; }
            _yacht.UserR = r; _yacht.UserG = g; _yacht.UserB = b;
            _yacht.ColorR = r; _yacht.ColorG = g; _yacht.ColorB = b;
            var ef = _cfg.EffectByKey(_cfg.InitialEffectKey);
            _yacht.Effect = ef != null ? ef.Id : 0;
            _yacht.Speed = RoomState.Clamp(_cfg.InitialSpeed);
        }

        private int DefaultRoom() { return AllRoom; }   // le GUI démarre sur « Tout le yacht »
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoomPerDevice.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }
        private RoomState Room(int id) { if (id == AllRoom) return _all; RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }
        private bool RoomExists(int id) { return id == AllRoom || _rooms.ContainsKey(id); }

        /// <summary>Espaces réels visés par une action : tous si l'écran affiche « Tout le yacht ».</summary>
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
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("YACHT: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("YACHT: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("YACHT: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                RegisterUserInterface(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("YACHT: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { PushAllRoomBlocks(); PushYachtToEisc(); PushEiscActiveRoom(DefaultRoom()); return; }
                if (!_activeRoomPerDevice.ContainsKey(p.ID)) _activeRoomPerDevice[p.ID] = DefaultRoom();
                PushSystemInfo(p);
                PushRoomToPanel(p, _activeRoomPerDevice[p.ID]);
                PushYachtToPanel(p);
            }
            catch (Exception e) { ErrorLog.Error("YACHT OnOnlineStatus {0:X2} : {1}", p.ID, e.ToString()); }
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
            catch (Exception e) { ErrorLog.Error("YACHT OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
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
            if (j == Joins.ColorR) return (ushort)_yacht.ColorR;
            if (j == Joins.ColorG) return (ushort)_yacht.ColorG;
            if (j == Joins.ColorB) return (ushort)_yacht.ColorB;
            if (j == Joins.Speed) return (ushort)_yacht.Speed;
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

            // ---- yacht (globaux)
            if (j >= Joins.SceneCruise && j <= Joins.SceneNight) { RunScene((int)(j - Joins.SceneCruise + 1)); RefreshAll(); return; }
            bool yacht = true;
            if (j > Joins.ColorPresetBase && j <= Joins.ColorPresetBase + Joins.MaxColorPresets) yacht = SetColorPreset((int)(j - Joins.ColorPresetBase));
            else if (j >= Joins.EffectOff && j <= Joins.EffectOff + Joins.MaxEffects) ApplyEffect((int)(j - Joins.EffectOff));
            else yacht = false;
            if (yacht) { PushYachtEverywhere(); return; }

            // ---- espace affiché (ou tous)
            var r = Room(roomId);
            if (r == null) return;
            bool done = true;
            if (j == Joins.LightsAllOn && r.Cfg.LightsActive) { foreach (var t in TargetsWithAll(roomId)) SetAllLights(t, 100); CustomScene(); }
            else if (j == Joins.LightsAllOff && r.Cfg.LightsActive) { foreach (var t in TargetsWithAll(roomId)) SetAllLights(t, 0); CustomScene(); }
            else if (j > Joins.LightToggleBase && j <= Joins.LightToggleBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightToggleBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { int pct = r.LightPct[i] > 0 ? 0 : 100; SetLight(roomId, i, pct); CustomScene(); }
                else done = false;
            }
            else if (j > Joins.MusicSourceBase && j <= Joins.MusicSourceBase + Joins.MaxSources && r.Cfg.AudioActive)
            {
                int s = (int)(j - Joins.MusicSourceBase);
                if (_cfg.SourceById(s) != null) { foreach (var t in TargetsWithAll(roomId)) { if (t.Cfg.AudioActive) { t.MusicSource = s; t.MusicPlaying = true; } } }
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

            // ---- yacht (globaux)
            if (j == Joins.ColorR || j == Joins.ColorG || j == Joins.ColorB)
            {
                int c = YachtState.Clamp255(v);
                if (j == Joins.ColorR) _yacht.UserR = c; else if (j == Joins.ColorG) _yacht.UserG = c; else _yacht.UserB = c;
                if (_yacht.Effect == 0) { _yacht.ColorR = _yacht.UserR; _yacht.ColorG = _yacht.UserG; _yacht.ColorB = _yacht.UserB; }
                PushYachtEverywhere(); return true;
            }
            if (j == Joins.Speed) { _yacht.Speed = RoomState.Clamp(v); PushYachtEverywhere(); return true; }

            // ---- espace affiché (ou tous)
            var r = Room(roomId);
            if (r == null) return false;
            if (j > Joins.LightLevelBase && j <= Joins.LightLevelBase + Joins.MaxCircuits)
            {
                int i = (int)(j - Joins.LightLevelBase) - 1;
                if (r.Cfg.LightsActive && r.CircuitActive(i)) { SetLight(roomId, i, ToPct(v)); CustomScene(); PushRoomsEverywhere(roomId); return true; }
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

        /// <summary>Cibles réelles + l'espace virtuel « Tout le yacht » quand l'action vise tous les espaces (miroir du GUI).</summary>
        private IEnumerable<RoomState> TargetsWithAll(int roomId)
        {
            foreach (var t in Targets(roomId)) yield return t;
            if (roomId == AllRoom) yield return _all;
        }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (!RoomExists(roomId)) return;
            _activeRoomPerDevice[dev.ID] = roomId;
            PushEiscActiveRoom(roomId);
            PushRoomToPanel(dev, roomId);
            PushYachtToPanel(dev);
            PushAllRoomBlocks();   // Rnn_Room_Displayed_fb
        }

        private void SetAllLights(RoomState r, int pct) { for (int i = 0; i < r.LightPct.Length; i++) r.LightPct[i] = LevelFor(r, i, pct); }

        private void SetLight(int roomId, int i, int pct)
        {
            foreach (var t in Targets(roomId)) if (i < t.LightPct.Length) t.LightPct[i] = LevelFor(t, i, pct);
            if (roomId == AllRoom && i < _all.LightPct.Length) _all.LightPct[i] = LevelFor(_all, i, pct);
        }

        /// <summary>Toute action manuelle sur un éclairage → « Ambiance personnalisée » (poussée seulement si la scène change).</summary>
        private void CustomScene() { if (_yacht.Scene == 0) return; _yacht.Scene = 0; PushYachtToPanels(); }

        /// <summary>Scène globale : niveaux par clé de circuit sur tous les espaces et sur « Tout le yacht ».</summary>
        private void RunScene(int id)
        {
            var sc = _cfg.SceneById(id);
            if (sc == null) return;
            foreach (var r in _rooms.Values) ApplySceneTo(r, sc);
            ApplySceneTo(_all, sc);
            _yacht.Scene = sc.Id;
            Trace("scene {0} ({1}) appliquee", sc.Id, sc.Name);
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

        private bool SetColorPreset(int n)
        {
            ColorPresetConfig cp = null;
            foreach (var c in _cfg.ColorPresets) if (c.Id == n) cp = c;
            int r, g, b;
            if (cp == null || !YachtState.TryParseHex(cp.Hex, out r, out g, out b)) return false;
            _yacht.UserR = r; _yacht.UserG = g; _yacht.UserB = b;
            if (_yacht.Effect == 0) { _yacht.ColorR = r; _yacht.ColorG = g; _yacht.ColorB = b; }
            return true;
        }

        /// <summary>0 = lumière fixe (couleur choisie, cycle arrêté) ; 1..3 = cycle de couleurs calculé par CTimer.</summary>
        private void ApplyEffect(int id)
        {
            var ef = _cfg.EffectById(id);
            if (id != 0 && ef == null) return;
            _yacht.Effect = id;
            _yacht.EffectStep = 0;
            if (ef == null)
            {
                _yacht.ColorR = _yacht.UserR; _yacht.ColorG = _yacht.UserG; _yacht.ColorB = _yacht.UserB;
                if (_effectTimer != null) _effectTimer.Stop();
                return;
            }
            SetCurrentColor(ef.Colors[0]);
            if (_effectTimer != null) _effectTimer.Reset(_cfg.EffectPeriodMs, _cfg.EffectPeriodMs);
        }

        private void SetCurrentColor(string hex)
        {
            int r, g, b;
            if (YachtState.TryParseHex(hex, out r, out g, out b)) { _yacht.ColorR = r; _yacht.ColorG = g; _yacht.ColorB = b; }
        }

        /// <summary>Tick du cycle de couleurs (même loi que le simulateur : pas += 0,012 + vitesse × 0,0003).</summary>
        private void OnEffectTick(object o)
        {
            try
            {
                _lock.Enter();
                var ef = _cfg.EffectById(_yacht.Effect);
                if (ef == null) { _effectTimer.Stop(); return; }
                _yacht.EffectStep += 0.012 + _yacht.Speed * 0.0003;
                int idx = (int)Math.Floor(_yacht.EffectStep) % ef.Colors.Count;
                string hex = ef.Colors[idx];
                if (hex == _yacht.ColorHex) return;
                SetCurrentColor(hex);
                PushColorToPanels();
                PushYachtToEisc();
            }
            catch (Exception e) { ErrorLog.Error("YACHT OnEffectTick : {0}", e.Message); }
            finally { _lock.Leave(); }
        }

        /// <summary>Cycle jour/nuit : sur front montant de Daylight_Day/Night_Actual, scène du JSON (si cycleAutomatique).</summary>
        private void OnDaylight(bool day, bool v)
        {
            bool was = day ? _yacht.DayActual : _yacht.NightActual;
            if (day) _yacht.DayActual = v; else _yacht.NightActual = v;
            if (!v || was || !_cfg.AutoCycle) return;
            var sc = _cfg.SceneByKey(day ? _cfg.CycleDayScene : _cfg.CycleNightScene);
            if (sc == null) return;
            RunScene(sc.Id);
            Trace("cycle {0} -> scene {1}", day ? "jour" : "nuit", sc.Name);
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
                    else if (off == Joins.Room.MusicSource) { if (_cfg.SourceById(v) != null) r.MusicSource = v; else return; }
                    else return;
                }
                else return;
                PushRoomEverywhere(roomId);   // écrans + Rnn_xxx_fb (l'état tenu suit la mesure)
                return;
            }
            // ---- yacht : états réels renvoyés par le slot 2
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (j == Joins.DaylightDay) OnDaylight(true, v);
                else if (j == Joins.DaylightNight) OnDaylight(false, v);
                else return;
                RefreshAll();
                return;
            }
            if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (j == Joins.ColorR || j == Joins.ColorG || j == Joins.ColorB)
                {
                    int c = YachtState.Clamp255(v);
                    if (j == Joins.ColorR) _yacht.ColorR = c; else if (j == Joins.ColorG) _yacht.ColorG = c; else _yacht.ColorB = c;
                    if (_yacht.Effect == 0) { _yacht.UserR = _yacht.ColorR; _yacht.UserG = _yacht.ColorG; _yacht.UserB = _yacht.ColorB; }
                }
                else if (j == Joins.Speed) _yacht.Speed = RoomState.Clamp(v);
                else if (j == Joins.Effect) { if (v > Joins.MaxEffects || v == _yacht.Effect) return; ApplyEffect(v); }   // écho du slot 2 : ne pas relancer le cycle
                else return;
                PushYachtEverywhere();
            }
        }

        // =====================================================================================
        // Feedback des écrans
        // =====================================================================================
        private void RefreshAll()
        {
            foreach (var p in _panels) { if (p == _eisc) continue; PushSystemInfo(p); PushRoomToPanel(p, ActiveRoom(p)); PushYachtToPanel(p); }
            PushAllRoomBlocks();
            PushYachtToEisc();
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
            foreach (var p in _panels) { if (p == _eisc) continue; int a = ActiveRoom(p); if (a == roomId || a == AllRoom) PushRoomToPanel(p, a); else PushYachtCounters(p); }
        }
        private void PushYachtEverywhere() { PushYachtToPanels(); PushYachtToEisc(); }
        private void PushYachtToPanels() { foreach (var p in _panels) if (p != _eisc) PushYachtToPanel(p); }

        private void PushSystemInfo(BasicTriList p)
        {
            p.StringInput[Joins.SystemIpId].StringValue = string.Format("{0:X2}", p.ID);
            p.StringInput[Joins.SystemCpzName].StringValue = _cpzName;
            p.StringInput[Joins.SystemCpzDate].StringValue = _cpzDate;
            p.StringInput[Joins.ConfigHash].StringValue = _configHash;
        }

        private int YachtLightsOn() { int n = 0; foreach (var r in _rooms.Values) n += r.LightsOn; return n; }
        private void PushYachtCounters(BasicTriList p) { p.UShortInput[Joins.YachtLightsOn].UShortValue = (ushort)YachtLightsOn(); }

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
            PushYachtCounters(p);

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
            // musique
            bool au = r.Cfg.AudioActive;
            for (int i = 1; i <= Joins.MaxSources; i++) p.BooleanInput[Joins.MusicSourceBase + (uint)i].BoolValue = au && r.MusicSource == i;
            p.BooleanInput[Joins.MusicPlayPause].BoolValue = au && r.MusicPlaying;
            p.BooleanInput[Joins.MusicMute].BoolValue = au && r.MusicMuted;
            p.UShortInput[Joins.MusicVolume].UShortValue = (ushort)(au ? r.MusicVolume : 0);
            var src = au ? _cfg.SourceById(r.MusicSource) : null;
            p.StringInput[Joins.MusicSourceName].StringValue = src != null ? src.Name : "";
        }

        private void PushColorToPanel(BasicTriList p)
        {
            p.UShortInput[Joins.ColorR].UShortValue = (ushort)_yacht.ColorR;
            p.UShortInput[Joins.ColorG].UShortValue = (ushort)_yacht.ColorG;
            p.UShortInput[Joins.ColorB].UShortValue = (ushort)_yacht.ColorB;
            p.StringInput[Joins.ColorHex].StringValue = _yacht.ColorHex;
            string user = YachtState.ToHex(_yacht.UserR, _yacht.UserG, _yacht.UserB);
            for (int i = 1; i <= Joins.MaxColorPresets; i++)
            {
                bool on = false;
                foreach (var c in _cfg.ColorPresets) if (c.Id == i && c.Hex.ToLower() == user) on = true;
                p.BooleanInput[Joins.ColorPresetBase + (uint)i].BoolValue = on;
            }
        }
        private void PushColorToPanels() { foreach (var p in _panels) if (p != _eisc) PushColorToPanel(p); }

        private void PushYachtToPanel(BasicTriList p)
        {
            p.StringInput[Joins.YachtSummary].StringValue = _summary;
            PushYachtCounters(p);
            // scènes
            var sc = _cfg.SceneById(_yacht.Scene);
            for (int i = 1; i <= Joins.MaxScenes; i++) p.BooleanInput[Joins.SceneCruise + (uint)(i - 1)].BoolValue = _yacht.Scene == i;
            p.UShortInput[Joins.Scene].UShortValue = (ushort)_yacht.Scene;
            p.StringInput[Joins.SceneName].StringValue = sc != null ? sc.Name : _cfg.CustomSceneName;
            // couleur et effets
            PushColorToPanel(p);
            for (int i = 0; i <= Joins.MaxEffects; i++) p.BooleanInput[Joins.EffectOff + (uint)i].BoolValue = _yacht.Effect == i;
            p.UShortInput[Joins.Effect].UShortValue = (ushort)_yacht.Effect;
            p.UShortInput[Joins.Speed].UShortValue = (ushort)_yacht.Speed;
            // cycle jour/nuit
            p.BooleanInput[Joins.DaylightDay].BoolValue = _yacht.DayActual;
            p.BooleanInput[Joins.DaylightNight].BoolValue = _yacht.NightActual;
        }

        // -------------------------------------------------------------------------------------
        // Vers le slot 2 : états globaux et blocs espace
        // -------------------------------------------------------------------------------------
        /// <summary>Couleur courante (cycle compris) et vitesse, tenues sur les sorties a21-24 de l'EISC.</summary>
        private void PushYachtToEisc()
        {
            if (_eisc == null) return;
            _eisc.UShortInput[Joins.ColorR].UShortValue = (ushort)_yacht.ColorR;
            _eisc.UShortInput[Joins.ColorG].UShortValue = (ushort)_yacht.ColorG;
            _eisc.UShortInput[Joins.ColorB].UShortValue = (ushort)_yacht.ColorB;
            _eisc.UShortInput[Joins.Speed].UShortValue = (ushort)_yacht.Speed;
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
                for (int i = 1; i <= r.LightPct.Length; i++)
                {
                    if (!r.CircuitActive(i - 1)) continue;
                    _eisc.BooleanInput[b + Joins.Room.LightOnBase + (uint)i].BoolValue = r.LightPct[i - 1] > 0;
                    _eisc.UShortInput[b + Joins.Room.LightLevelBase + (uint)i].UShortValue = ToRaw(r.LightPct[i - 1]);
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
                sb.AppendFormat("[{0}] {1} : ", id, r.Cfg.Name);
                if (r.Cfg.LightsActive) { sb.Append("L="); for (int i = 0; i < r.LightPct.Length; i++) sb.Append(r.CircuitActive(i) ? r.LightPct[i] + "% " : "-- "); }
                if (r.Cfg.AudioActive) sb.AppendFormat("musique {0}{1} src{2} vol{3} ", r.MusicPlaying ? "ON" : "off", r.MusicMuted ? " (muet)" : "", r.MusicSource, r.MusicVolume);
                sb.Append("\r\n");
            }
            var sc = _cfg.SceneById(_yacht.Scene);
            sb.AppendFormat("Yacht : scene {0}, couleur {1} (choisie {2}), effet {3}, vitesse {4}, jour {5}, nuit {6}, circuits allumes {7}\r\n",
                sc != null ? sc.Name : _cfg.CustomSceneName, _yacht.ColorHex, YachtState.ToHex(_yacht.UserR, _yacht.UserG, _yacht.UserB), _yacht.Effect, _yacht.Speed, _yacht.DayActual, _yacht.NightActual, YachtLightsOn());
            foreach (var kv in _activeRoomPerDevice) sb.AppendFormat("Ecran {0:X2} -> espace {1}{2}\r\n", kv.Key, kv.Value, kv.Value == AllRoom ? " (tout le yacht)" : "");
        }

        private void CmdRoom(string arg)
        {
            var parts = (arg ?? "").Trim().Split(' ');
            uint ipid; int room;
            if (parts.Length != 2 || !uint.TryParse(parts[0], System.Globalization.NumberStyles.HexNumber, null, out ipid) || !int.TryParse(parts[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : yachtroom <ipid hex> <espace, 0 = tout>\r\n"); return; }
            foreach (var p in _panels) if (p.ID == ipid && p != _eisc) { try { _lock.Enter(); SelectRoom(p, room); } finally { _lock.Leave(); } CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> espace {1}\r\n", ipid, room); return; }
            CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ipid);
        }
    }
}
