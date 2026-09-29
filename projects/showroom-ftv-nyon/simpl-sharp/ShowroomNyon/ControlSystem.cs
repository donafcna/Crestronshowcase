// Showroom FTV Nyon — programme SIMPL# Pro du slot 1 (CP4).
//
// Rôle : lire /user/showroom_config.json, tenir l'état des pièces (éclairage, musique, vidéo), connaître la
// pièce affichée par chaque écran, appliquer les actions, renvoyer le feedback aux écrans et recopier chaque
// action vers le slot 2 (SIMPL) par l'EISC.
//
// Chaîne réelle : écran (TSW-1070 0x03 / XPanel 0x04 / iPad 0x05 / iPhone 0x06)
//                   → C# slot 1 : action appliquée à la pièce affichée par CET écran
//                   → EISC IP-ID F0 : Room_Select# (a10) + Room_Active_nn posés, puis le MÊME join
//                   → SIMPL slot 2 : buffers validés par Room_Active_nn → drivers (Lutron, B&O, Apple TV…)
//                   → EISC : mesures _Actual (blocs pièce 1000+) → C# → feedback des écrans.
//
// Contrat : Joins.cs est GÉNÉRÉ depuis showroom_config.json (node tools/gen_joins.js). Les règles d'état sont
// identiques à ch5/src/js/local-feedback.js (vitrine).

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

namespace ShowroomNyon
{
    public class ControlSystem : CrestronControlSystem
    {
        private const string ConfigPath = "/user/showroom_config.json";
        private const string Ch5ProjectName = "showroomnyon";
        private const uint TswIpId = 0x03, XpanelIpId = 0x04, IpadIpId = 0x05, IphoneIpId = 0x06;
        private const int PulseMs = 1400;

        private ShowroomConfig _cfg = new ShowroomConfig();
        private readonly Dictionary<int, RoomState> _rooms = new Dictionary<int, RoomState>();
        private readonly List<int> _order = new List<int>();
        private readonly List<BasicTriList> _panels = new List<BasicTriList>();
        private readonly Dictionary<uint, int> _activeRoom = new Dictionary<uint, int>();
        private readonly Dictionary<uint, int> _camera = new Dictionary<uint, int>();
        private EthernetIntersystemCommunications _eisc;
        private readonly CCriticalSection _lock = new CCriticalSection();
        private CTimer _tick;
        private int _mediaRoom;
        private string _cpzName = "", _cpzDate = "";
        private bool _trace;
        private readonly Random _rnd = new Random();

        public ControlSystem() : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;
                CrestronEnvironment.ProgramStatusEventHandler += t => { if (t == eProgramStatusEventType.Stopping && _tick != null) _tick.Dispose(); };
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM ctor: {0}", e.Message); }
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

                Register(new Tsw1070GV(TswIpId, this));   // même classe que Villa Crans et FTV Home (CPZ validé sur CP4)
                Register(new XpanelForHtml5(XpanelIpId, this));
                var ipad = new CrestronOne(IpadIpId, this); ipad.ParameterProjectName.Value = Ch5ProjectName; Register(ipad);
                var iphone = new CrestronOne(IphoneIpId, this); iphone.ParameterProjectName.Value = Ch5ProjectName; Register(iphone);
                InitializeEisc();

                foreach (var p in _panels) if (p != _eisc) _activeRoom[p.ID] = DefaultRoom();
                _tick = new CTimer(OnTick, null, 1000, 1000);

                CrestronConsole.AddNewConsoleCommand(CmdState, "showroomstate", "Etat des pieces du Showroom FTV Nyon (showroomstate [id])", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(CmdRoom, "showroomroom", "Piece affichee par un ecran : showroomroom <ipid hex> <piece>", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s => { _trace = !_trace; CrestronConsole.ConsoleCommandResponse("showroomtrace: {0}\r\n", _trace ? "ON" : "OFF"); }, "showroomtrace", "Bascule les traces console", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.PrintLine("SHOWROOM: {0} v{1} — {2} pieces, mode {3}, CPZ {4} ({5}).", _cfg.Project, _cfg.Version, _rooms.Count, _cfg.Mode, _cpzName, _cpzDate);
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM InitializeSystem: {0}", e.ToString()); }
        }

        private void Trace(string fmt, params object[] a) { if (_trace) CrestronConsole.PrintLine("SHOWROOM: " + fmt, a); }

        private void LoadConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(ConfigPath)) { ErrorLog.Error("SHOWROOM: {0} absent — aucune piece.", ConfigPath); return; }
                _cfg = ShowroomConfig.Parse(JObject.Parse(System.IO.File.ReadAllText(ConfigPath, Encoding.UTF8)));
                _trace = _cfg.TraceConsole;
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM: lecture de {0} : {1}", ConfigPath, e.Message); _cfg = new ShowroomConfig(); }
            _rooms.Clear(); _order.Clear();
            foreach (var rc in _cfg.Rooms) { _rooms[rc.Id] = new RoomState(rc); _order.Add(rc.Id); }
        }

        private int DefaultRoom() { return _order.Count > 0 ? _order[0] : 1; }
        private RoomState Room(int id) { RoomState r; return _rooms.TryGetValue(id, out r) ? r : null; }
        private int ActiveRoom(BasicTriList dev) { int r; return _activeRoom.TryGetValue(dev.ID, out r) ? r : DefaultRoom(); }

        private void Register(BasicTriList dev)
        {
            dev.SigChange += OnSigChange;
            dev.OnlineStatusChange += OnOnlineStatus;
            var res = dev.Register();
            if (res == eDeviceRegistrationUnRegistrationResponse.Success) { _panels.Add(dev); CrestronConsole.PrintLine("SHOWROOM: {0} enregistre en IP-ID {1:X2}.", dev.GetType().Name, dev.ID); }
            else ErrorLog.Error("SHOWROOM: echec d'enregistrement {0} IP-ID {1:X2} : {2}", dev.GetType().Name, dev.ID, res);
        }

        private void InitializeEisc()
        {
            if (!_cfg.EiscActive) { CrestronConsole.PrintLine("SHOWROOM: EISC desactive par la configuration."); return; }
            try
            {
                uint ipid = Convert.ToUInt32(_cfg.EiscIpId.Replace("0x", "").Replace("0X", ""), 16);
                _eisc = new EthernetIntersystemCommunications(ipid, _cfg.EiscIp, this);
                Register(_eisc);
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM: EISC : {0}", e.Message); _eisc = null; }
        }

        private void OnOnlineStatus(GenericBase dev, OnlineOfflineEventArgs args)
        {
            if (!args.DeviceOnLine) return;
            var p = dev as BasicTriList;
            if (p == null) return;
            try
            {
                _lock.Enter();
                if (p == _eisc) { foreach (int id in _order) PushBlock(id); PushEiscRoom(DefaultRoom()); return; }
                if (!_activeRoom.ContainsKey(p.ID)) _activeRoom[p.ID] = DefaultRoom();
                p.StringInput[Joins.Ser.SystemeIpId].StringValue = p.ID.ToString("X2");
                p.StringInput[Joins.Ser.SystemeCpzNom].StringValue = _cpzName;
                p.StringInput[Joins.Ser.SystemeCpzDate].StringValue = _cpzDate;
                PushRoomToPanel(p);
                PushHouseToPanel(p);
                PushCamera(p);
            }
            finally { _lock.Leave(); }
        }

        // =====================================================================================
        // Réception
        // =====================================================================================
        private void OnSigChange(BasicTriList dev, SigEventArgs args)
        {
            try
            {
                _lock.Enter();
                if (_eisc != null && dev == _eisc) { OnEisc(args); return; }
                uint j = args.Sig.Number;
                if (args.Sig.Type == eSigType.Bool)
                {
                    Mirror(dev, args);
                    if (args.Sig.BoolValue) OnPress(dev, j);
                }
                else if (args.Sig.Type == eSigType.UShort)
                {
                    if (OnAnalog(dev, j, args.Sig.UShortValue)) Mirror(dev, args);
                }
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM OnSigChange {0}/{1} : {2}", args.Sig.Type, args.Sig.Number, e.ToString()); }
            finally { _lock.Leave(); }
        }

        private static bool In(uint j, uint a, uint b) { return j >= a && j <= b; }

        /// <summary>Recopie vers le slot 2 : Room_Select# (a10) et Room_Active_nn d'abord, puis le même join.</summary>
        private void Mirror(BasicTriList dev, SigEventArgs args)
        {
            if (_eisc == null) return;
            uint j = args.Sig.Number;
            if (args.Sig.Type == eSigType.Bool && In(j, Joins.Dig.RoomSelect, Joins.Dig.RoomSelectLast)) return;
            if (args.Sig.Type == eSigType.UShort && j == Joins.Ana.RoomSelect) return;
            try
            {
                int roomId = ActiveRoom(dev);
                PushEiscRoom(roomId);
                if (args.Sig.Type == eSigType.Bool) _eisc.BooleanInput[j].BoolValue = args.Sig.BoolValue;
                else _eisc.UShortInput[j].UShortValue = Bounded(roomId, j, args.Sig.UShortValue);
            }
            catch { }
        }

        private ushort Bounded(int roomId, uint j, ushort raw)
        {
            var r = Room(roomId);
            if (r == null) return raw;
            if (In(j, Joins.Ana.LightLevel, Joins.Ana.LightLevelLast)) { int i = (int)(j - Joins.Ana.LightLevel); return i < r.Levels.Length ? ToRaw(r.Levels[i]) : raw; }
            if (j == Joins.Ana.MusicVolume) return (ushort)r.Music.Volume;
            if (j == Joins.Ana.VideoVolume) return (ushort)r.VideoVolume;
            if (j == Joins.Ana.MusicSleepTimer) return (ushort)r.Music.SleepMinutes;
            return raw;
        }

        private void PushEiscRoom(int roomId)
        {
            if (_eisc == null) return;
            _eisc.UShortInput[Joins.Ana.RoomSelect].UShortValue = (ushort)roomId;
            for (uint n = 0; n <= Joins.Dig.RoomSelectLast - Joins.Dig.RoomSelect; n++)
                _eisc.BooleanInput[Joins.Dig.RoomSelect + n].BoolValue = n + 1 == roomId;
        }

        private void OnPress(BasicTriList dev, uint j)
        {
            int roomId = ActiveRoom(dev);
            var r = Room(roomId);
            Trace("appui d{0} (ecran {1:X2}, piece {2})", j, dev.ID, roomId);

            if (In(j, Joins.Dig.RoomSelect, Joins.Dig.RoomSelectLast)) { SelectRoom(dev, (int)(j - Joins.Dig.RoomSelect) + 1); return; }
            if (In(j, Joins.Dig.HouseAction, Joins.Dig.HouseActionLast))
            {
                int i = (int)(j - Joins.Dig.HouseAction);
                if (i < _cfg.HouseActions.Count) { HouseEffects(_cfg.HouseActions[i].Fx); Pulse(dev, j); RefreshAll(); }
                return;
            }
            if (j == Joins.Dig.HouseAllOff) { foreach (var x in _rooms.Values) x.Off(); RefreshAll(); return; }
            if (j == Joins.Dig.HouseLightsAllOff) { foreach (var x in _rooms.Values) x.SetAll(0); RefreshAll(); return; }
            if (In(j, Joins.Dig.CameraSelect, Joins.Dig.CameraSelectLast))
            {
                int n = (int)(j - Joins.Dig.CameraSelect) + 1;
                if (n <= _cfg.Cameras.Count) { _camera[dev.ID] = n; PushCamera(dev); }
                return;
            }
            if (r == null) return;

            if (j == Joins.Dig.RoomOff) r.Off();
            else if (In(j, Joins.Dig.RoomAction, Joins.Dig.RoomActionLast))
            {
                int i = (int)(j - Joins.Dig.RoomAction);
                if (i >= r.Cfg.Actions.Count) return;
                RoomEffects(r, r.Cfg.Actions[i].Fx);
                PulseBlock(roomId, Joins.BlkDig.Action + (uint)i);
                Pulse(dev, j);
            }
            else if (In(j, Joins.Dig.LightScene, Joins.Dig.LightSceneLast)) { r.ApplyScene((int)(j - Joins.Dig.LightScene) + 1); }
            else if (j == Joins.Dig.LightsAllOn) r.SetAll(100);
            else if (j == Joins.Dig.LightsAllOff) r.SetAll(0);
            else if (j == Joins.Dig.LightsDimUp) r.Dim(10);
            else if (j == Joins.Dig.LightsDimDown) r.Dim(-10);
            else if (In(j, Joins.Dig.LightToggle, Joins.Dig.LightToggleLast)) r.Toggle((int)(j - Joins.Dig.LightToggle));
            else if (j == Joins.Dig.VideoOff) r.VideoSource = 0;
            else if (In(j, Joins.Dig.VideoSource, Joins.Dig.VideoSourceLast))
            {
                int n = (int)(j - Joins.Dig.VideoSource) + 1;
                if (r.Cfg.VideoActive && r.Cfg.VideoSources.Contains(n)) { r.VideoSource = n; _mediaRoom = roomId; }
            }
            else if (In(j, Joins.Dig.VideoRemote, Joins.Dig.VideoRemoteLast)) return;   // impulsion vers le slot 2 seulement
            else if (In(j, Joins.Dig.MusicService, Joins.Dig.MusicServiceLast))
            {
                int n = (int)(j - Joins.Dig.MusicService) + 1;
                var s = _cfg.Service(n);
                StartMusic(r, n, s != null && s.Streaming ? 1 : 0);
            }
            else if (In(j, Joins.Dig.MusicFav, Joins.Dig.MusicFavLast))
            {
                var f = _cfg.Fav((int)(j - Joins.Dig.MusicFav) + 1);
                if (f != null) StartMusic(r, f.Service, f.Id);
            }
            else if (In(j, Joins.Dig.MusicBrowse, Joins.Dig.MusicBrowseLast))
            {
                if (r.Music.Service > 0 && _cfg.Tracks.Count > 0)
                {
                    r.Music.Track = (int)(j - Joins.Dig.MusicBrowse) % _cfg.Tracks.Count + 1;
                    r.Music.Position = 0; r.Music.Playing = true; r.Music.Fav = 0;
                }
            }
            else HandleTransport(r, j);

            PushRoomEverywhere(roomId);
            PushHouseEverywhere();
        }

        private void HandleTransport(RoomState r, uint j)
        {
            var m = r.Music;
            if (j == Joins.Dig.MusicPrev) Step(r, -1);
            else if (j == Joins.Dig.MusicNext) Step(r, 1);
            else if (j == Joins.Dig.MusicPlayPause) { if (m.Service == 0) StartMusic(r, 1, 1); else m.Playing = !m.Playing; }
            else if (j == Joins.Dig.MusicMute) m.Muted = !m.Muted;
            else if (j == Joins.Dig.MusicRewind) m.Position = Math.Max(0, m.Position - 15);
            else if (j == Joins.Dig.MusicForward) m.Position = Math.Min(Duration(r) - 1, m.Position + 15);
            else if (j == Joins.Dig.MusicLike) { m.Like = !m.Like; if (m.Like) m.Dislike = false; }
            else if (j == Joins.Dig.MusicDislike) { m.Dislike = !m.Dislike; if (m.Dislike) m.Like = false; }
            else if (j == Joins.Dig.MusicShuffle) m.Shuffle = !m.Shuffle;
            else if (j == Joins.Dig.MusicRepeat) m.Repeat = !m.Repeat;
            else if (j == Joins.Dig.MusicOff) r.MusicOff();
            else if (j == Joins.Dig.MusicSleepTimerToggle)
            {
                m.Sleep = !m.Sleep;
                if (m.Sleep && m.SleepMinutes == 0) m.SleepMinutes = 30;
                m.SleepLeftS = m.Sleep ? m.SleepMinutes * 60 : 0;
            }
        }

        private bool OnAnalog(BasicTriList dev, uint j, ushort v)
        {
            if (j == Joins.Ana.RoomSelect) { if (Room(v) != null) SelectRoom(dev, v); return false; }
            int roomId = ActiveRoom(dev);
            var r = Room(roomId);
            if (r == null) return false;
            if (In(j, Joins.Ana.LightLevel, Joins.Ana.LightLevelLast))
            {
                int i = (int)(j - Joins.Ana.LightLevel);
                if (i >= r.Levels.Length) return false;
                r.SetLevel(i, ToPct(v)); r.Scene = 0;
            }
            else if (j == Joins.Ana.MusicVolume) { r.Music.Volume = RoomState.Clamp(v); if (v > 0) r.Music.Muted = false; }
            else if (j == Joins.Ana.VideoVolume) r.VideoVolume = RoomState.Clamp(v);
            else if (j == Joins.Ana.MusicSleepTimer) { r.Music.SleepMinutes = RoomState.Clamp(v, 0, 120); if (r.Music.Sleep) r.Music.SleepLeftS = r.Music.SleepMinutes * 60; }
            else return false;
            PushRoomEverywhere(roomId);
            PushHouseEverywhere();
            return true;
        }

        // =====================================================================================
        // Règles (identiques à js/local-feedback.js)
        // =====================================================================================
        // Arrondi « au plus loin de zéro » comme Math.round du GUI (Math.Round seul arrondit au pair : 19660,5 → 19660).
        private static int ToPct(ushort v) { return (int)Math.Round(v * 100.0 / 65535.0, MidpointRounding.AwayFromZero); }
        private static ushort ToRaw(int pct) { return (ushort)Math.Round(RoomState.Clamp(pct) * 65535.0 / 100.0, MidpointRounding.AwayFromZero); }
        private int Duration(RoomState r) { return r.Music.Track >= 1 && r.Music.Track <= _cfg.Tracks.Count ? _cfg.Tracks[r.Music.Track - 1].Duration : 0; }

        private void SelectRoom(BasicTriList dev, int roomId)
        {
            if (Room(roomId) == null) return;
            _activeRoom[dev.ID] = roomId;
            PushRoomToPanel(dev);
            foreach (int id in _order) PushBlock(id);   // Room_Displayed
        }

        private void StartMusic(RoomState r, int service, int fav)
        {
            if (!r.Cfg.AudioActive) return;
            var m = r.Music;
            m.Service = service > 0 ? service : 1;
            var s = _cfg.Service(m.Service);
            if (s != null && s.Streaming)
            {
                if (fav > 0) { m.Fav = fav; m.Track = ((fav - 1) * 2) % Math.Max(1, _cfg.Tracks.Count) + 1; }
                m.Position = 0;
            }
            else m.Fav = 0;
            m.Playing = true;
            _mediaRoom = r.Cfg.Id;
        }

        private void Step(RoomState r, int d)
        {
            int n = _cfg.Tracks.Count;
            if (r.Music.Service == 0 || n == 0) return;
            r.Music.Track = ((r.Music.Track - 1 + d) % n + n) % n + 1;
            r.Music.Position = 0;
        }

        private void RoomEffects(RoomState r, Effects fx)
        {
            if (!string.IsNullOrEmpty(fx.Scene)) { int k = r.Cfg.SceneByName(fx.Scene); if (k > 0) r.ApplyScene(k); }
            if (fx.Music > 0) StartMusic(r, fx.Music, fx.Fav);
        }

        private void HouseEffects(Effects fx)
        {
            foreach (int id in _order)
            {
                if (fx.Rooms.Count > 0 && !fx.Rooms.Contains(id)) continue;
                var r = _rooms[id];
                if (fx.AllOff) { r.Off(); continue; }
                if (!string.IsNullOrEmpty(fx.ScenePerRoom))
                {
                    int k = r.Cfg.SceneByName(fx.ScenePerRoom);
                    if (k > 0) r.ApplyScene(k); else if (fx.LevelWithoutScene >= 0) r.SetAll(fx.LevelWithoutScene);
                }
                if (fx.Music > 0) StartMusic(r, fx.Music, fx.Fav);
            }
        }

        private void Pulse(BasicTriList dev, uint j)
        {
            dev.BooleanInput[j].BoolValue = true;
            new CTimer(o => { try { dev.BooleanInput[j].BoolValue = false; } catch { } }, PulseMs);
        }

        private void OnTick(object o)
        {
            try
            {
                _lock.Enter();
                foreach (int id in _order)
                {
                    var r = _rooms[id]; var m = r.Music; var s = _cfg.Service(m.Service);
                    bool changed = false;
                    if (m.Service > 0 && m.Playing && s != null && s.Streaming)
                    {
                        m.Position++;
                        if (m.Position >= Duration(r)) { if (m.Repeat) m.Position = 0; else Step(r, m.Shuffle ? 1 + _rnd.Next(3) : 1); }
                        changed = true;
                    }
                    if (m.Sleep && m.SleepLeftS > 0)
                    {
                        m.SleepLeftS--;
                        if (m.SleepLeftS % 60 == 0) changed = true;
                        if (m.SleepLeftS == 0) { r.MusicOff(); r.VideoSource = 0; PushHouseEverywhere(); }
                    }
                    if (changed) PushMusicToPanels(id);
                }
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM tick: {0}", e.Message); }
            finally { _lock.Leave(); }
        }

        // =====================================================================================
        // Retours du slot 2 (EISC) : les mesures réelles font foi
        // =====================================================================================
        private void OnEisc(SigEventArgs args)
        {
            uint j = args.Sig.Number;
            if (j < Joins.BlockBase) return;
            int id = (int)((j - Joins.BlockBase) / Joins.BlockStep) + 1;
            uint off = (j - Joins.BlockBase) % Joins.BlockStep;
            var r = Room(id);
            if (r == null) return;
            if (args.Sig.Type == eSigType.Bool)
            {
                bool v = args.Sig.BoolValue;
                if (In(off, Joins.BlkDig.LightOn, Joins.BlkDig.LightOnLast))
                {
                    int i = (int)(off - Joins.BlkDig.LightOn);
                    if (i < r.Levels.Length && (r.Levels[i] > 0) != v) { if (v) r.Levels[i] = r.Last[i]; else { r.Last[i] = r.Levels[i]; r.Levels[i] = 0; } r.Scene = 0; }
                }
                else if (off == Joins.BlkDig.MusicPlaying) r.Music.Playing = v;
                else if (off == Joins.BlkDig.MusicMuted) r.Music.Muted = v;
                else if (off == Joins.BlkDig.VideoOn && !v) r.VideoSource = 0;
                else return;
            }
            else if (args.Sig.Type == eSigType.UShort)
            {
                ushort v = args.Sig.UShortValue;
                if (In(off, Joins.BlkAna.LightLevel, Joins.BlkAna.LightLevelLast))
                {
                    int i = (int)(off - Joins.BlkAna.LightLevel);
                    if (i < r.Levels.Length) { r.Levels[i] = ToPct(v); if (r.Levels[i] > 0) r.Last[i] = r.Levels[i]; r.Scene = 0; }
                }
                else if (off == Joins.BlkAna.MusicVolume) r.Music.Volume = RoomState.Clamp(v);
                else if (off == Joins.BlkAna.MusicService) { if (v == 0) r.MusicOff(); else if (_cfg.Service(v) != null) r.Music.Service = v; }
                else if (off == Joins.BlkAna.VideoVolume) r.VideoVolume = RoomState.Clamp(v);
                else if (off == Joins.BlkAna.VideoSource) r.VideoSource = r.Cfg.VideoSources.Contains(v) ? v : 0;
                else return;
            }
            else return;
            Trace("slot 2 : piece {0} offset {1}", id, off);
            PushRoomToPanels(id);
            PushHouseEverywhere();
        }

        // =====================================================================================
        // Feedback
        // =====================================================================================
        private void RefreshAll() { foreach (int id in _order) PushRoomEverywhere(id); PushHouseEverywhere(); }
        private void PushRoomEverywhere(int id) { PushRoomToPanels(id); PushBlock(id); }
        private void PushRoomToPanels(int id) { foreach (var p in _panels) if (p != _eisc && ActiveRoom(p) == id) PushRoomToPanel(p); }
        private void PushHouseEverywhere() { UpdateMediaRoom(); foreach (var p in _panels) if (p != _eisc) PushHouseToPanel(p); }
        private void PushMusicToPanels(int id) { foreach (var p in _panels) if (p != _eisc && ActiveRoom(p) == id) PushMusic(p, _rooms[id]); }

        private static void B(BasicTriList p, uint j, bool v) { if (p.BooleanInput[j].BoolValue != v) p.BooleanInput[j].BoolValue = v; }
        private static void A(BasicTriList p, uint j, int v) { ushort u = (ushort)Math.Max(0, Math.Min(65535, v)); if (p.UShortInput[j].UShortValue != u) p.UShortInput[j].UShortValue = u; }
        private static void S(BasicTriList p, uint j, string v) { v = v ?? ""; if (p.StringInput[j].StringValue != v) p.StringInput[j].StringValue = v; }

        private void PushRoomToPanel(BasicTriList p)
        {
            var r = Room(ActiveRoom(p));
            if (r == null) return;
            A(p, Joins.Ana.RoomSelect, r.Cfg.Id);
            for (uint n = 0; n <= Joins.Dig.RoomSelectLast - Joins.Dig.RoomSelect; n++) B(p, Joins.Dig.RoomSelect + n, n + 1 == r.Cfg.Id);
            for (uint n = 0; n <= Joins.Dig.LightSceneLast - Joins.Dig.LightScene; n++) B(p, Joins.Dig.LightScene + n, r.Scene == n + 1);
            A(p, Joins.Ana.LightScene, r.Scene);
            bool allOn = r.Levels.Length > 0, allOff = true;
            foreach (int v in r.Levels) { if (v < 100) allOn = false; if (v > 0) allOff = false; }
            B(p, Joins.Dig.LightsAllOn, allOn);
            B(p, Joins.Dig.LightsAllOff, allOff);
            for (uint n = 0; n <= Joins.Dig.LightToggleLast - Joins.Dig.LightToggle; n++)
            {
                int lv = n < r.Levels.Length ? r.Levels[n] : 0;
                B(p, Joins.Dig.LightToggle + n, lv > 0);
                A(p, Joins.Ana.LightLevel + n, ToRaw(lv));
            }
            PushMusic(p, r);
            for (uint n = 0; n <= Joins.Dig.VideoSourceLast - Joins.Dig.VideoSource; n++) B(p, Joins.Dig.VideoSource + n, r.VideoSource == n + 1);
            B(p, Joins.Dig.VideoOff, r.VideoSource == 0);
            A(p, Joins.Ana.VideoVolume, r.VideoVolume);
            A(p, Joins.Ana.VideoSource, r.VideoSource);
            var src = _cfg.Source(r.VideoSource);
            S(p, Joins.Ser.VideoSourceName, src == null ? "" : src.Name);
        }

        private void PushMusic(BasicTriList p, RoomState r)
        {
            var m = r.Music; var s = _cfg.Service(m.Service);
            bool streaming = s != null && s.Streaming;
            TrackConfig t = streaming && m.Track >= 1 && m.Track <= _cfg.Tracks.Count ? _cfg.Tracks[m.Track - 1] : null;
            for (uint n = 0; n <= Joins.Dig.MusicServiceLast - Joins.Dig.MusicService; n++) B(p, Joins.Dig.MusicService + n, m.Service == n + 1);
            for (uint n = 0; n <= Joins.Dig.MusicFavLast - Joins.Dig.MusicFav; n++) B(p, Joins.Dig.MusicFav + n, m.Fav == n + 1);
            B(p, Joins.Dig.MusicPlayPause, m.Service > 0 && m.Playing);
            B(p, Joins.Dig.MusicMute, m.Muted);
            B(p, Joins.Dig.MusicLike, m.Like);
            B(p, Joins.Dig.MusicDislike, m.Dislike);
            B(p, Joins.Dig.MusicShuffle, m.Shuffle);
            B(p, Joins.Dig.MusicRepeat, m.Repeat);
            B(p, Joins.Dig.MusicOff, m.Service == 0);
            B(p, Joins.Dig.MusicSleepTimerToggle, m.Sleep);
            A(p, Joins.Ana.MusicVolume, m.Muted ? 0 : m.Volume);
            A(p, Joins.Ana.MusicPosition, t != null ? m.Position : 0);
            A(p, Joins.Ana.MusicDuration, t != null ? t.Duration : 0);
            A(p, Joins.Ana.MusicSleepTimer, m.Sleep ? (m.SleepLeftS + 59) / 60 : m.SleepMinutes);
            A(p, Joins.Ana.MusicService, m.Service);
            A(p, Joins.Ana.MusicTrack, t != null ? m.Track : 0);
            S(p, Joins.Ser.MusicTitle, s == null ? "" : (t != null ? t.Title : s.Name));
            S(p, Joins.Ser.MusicArtist, t != null ? t.Artist : "");
            S(p, Joins.Ser.MusicAlbum, t != null ? t.Album : "");
            S(p, Joins.Ser.MusicCover, t != null ? t.Cover : "");
        }

        private void UpdateMediaRoom()
        {
            var cur = Room(_mediaRoom);
            if (cur == null || !cur.MediaOn) _mediaRoom = 0;
            if (_mediaRoom == 0) foreach (int id in _order) if (_rooms[id].MediaOn) { _mediaRoom = id; break; }
        }

        private void PushHouseToPanel(BasicTriList p)
        {
            int count = 0; bool anyPlay = false;
            foreach (int id in _order)
            {
                var r = _rooms[id];
                int on = r.LightsOnCount;
                count += on;
                if (id >= 1 && id <= Joins.MaxRooms)
                {
                    B(p, Joins.Dig.RoomLightsOn + (uint)id - 1, on > 0);
                    B(p, Joins.Dig.RoomMediaOn + (uint)id - 1, r.MediaOn);
                }
                if (r.Music.Service > 0 && r.Music.Playing) anyPlay = true;
            }
            B(p, Joins.Dig.HouseMusicPlaying, anyPlay);
            B(p, Joins.Dig.HouseLightsOn, count > 0);
            A(p, Joins.Ana.HouseLightsOnCount, count);
            A(p, Joins.Ana.HouseMediaRoom, _mediaRoom);
            string label = "";
            var mr = Room(_mediaRoom);
            if (mr != null)
            {
                var s = _cfg.Service(mr.Music.Service);
                var v = s == null ? _cfg.Source(mr.VideoSource) : null;
                label = (s != null ? s.Name : v != null ? v.Name : "Media") + " in " + mr.Cfg.Name;
            }
            S(p, Joins.Ser.MusicNowPlaying, label);
        }

        private void PushCamera(BasicTriList p)
        {
            int c; _camera.TryGetValue(p.ID, out c);
            for (uint n = 0; n <= Joins.Dig.CameraSelectLast - Joins.Dig.CameraSelect; n++) B(p, Joins.Dig.CameraSelect + n, c == n + 1);
            A(p, Joins.Ana.Camera, c);
            S(p, Joins.Ser.CameraUrl, c >= 1 && c <= _cfg.Cameras.Count ? _cfg.Cameras[c - 1].Stream : "");
        }

        /// <summary>Bloc pièce EISC : états tenus par le C# (_fb) pour le slot 2.</summary>
        private void PushBlock(int id)
        {
            var r = Room(id);
            if (_eisc == null || r == null || !r.Cfg.Intersystem) return;
            uint b = Joins.BlockBase + (uint)(id - 1) * Joins.BlockStep;
            try
            {
                if (r.Cfg.LightsActive)
                {
                    for (int i = 0; i < r.Levels.Length; i++)
                    {
                        B(_eisc, b + Joins.BlkDig.LightOn + (uint)i, r.Levels[i] > 0);
                        A(_eisc, b + Joins.BlkAna.LightLevel + (uint)i, ToRaw(r.Levels[i]));
                    }
                    for (int i = 0; i < r.Cfg.Scenes.Count; i++) B(_eisc, b + Joins.BlkDig.LightScene + (uint)i, r.Scene == i + 1);
                }
                bool shown = false;
                foreach (var kv in _activeRoom) if (kv.Value == id) { shown = true; break; }
                B(_eisc, b + Joins.BlkDig.RoomDisplayed, shown);
                if (r.Cfg.AudioActive)
                {
                    B(_eisc, b + Joins.BlkDig.MusicPlaying, r.Music.Service > 0 && r.Music.Playing);
                    B(_eisc, b + Joins.BlkDig.MusicMuted, r.Music.Muted);
                    A(_eisc, b + Joins.BlkAna.MusicVolume, r.Music.Volume);
                    A(_eisc, b + Joins.BlkAna.MusicService, r.Music.Service);
                }
                if (r.Cfg.VideoActive)
                {
                    B(_eisc, b + Joins.BlkDig.VideoOn, r.VideoSource > 0);
                    A(_eisc, b + Joins.BlkAna.VideoVolume, r.VideoVolume);
                    A(_eisc, b + Joins.BlkAna.VideoSource, r.VideoSource);
                }
            }
            catch (Exception e) { ErrorLog.Error("SHOWROOM bloc piece {0} : {1}", id, e.Message); }
        }

        private void PulseBlock(int id, uint offset)
        {
            var r = Room(id);
            if (_eisc == null || r == null || !r.Cfg.Intersystem) return;
            uint j = Joins.BlockBase + (uint)(id - 1) * Joins.BlockStep + offset;
            _eisc.BooleanInput[j].BoolValue = true;
            new CTimer(o => { try { _eisc.BooleanInput[j].BoolValue = false; } catch { } }, 250);
        }

        // =====================================================================================
        // Console
        // =====================================================================================
        private void CmdState(string arg)
        {
            var sb = new StringBuilder();
            try
            {
                _lock.Enter();
                int only; int.TryParse((arg ?? "").Trim(), out only);
                foreach (int id in _order)
                {
                    if (only > 0 && id != only) continue;
                    var r = _rooms[id]; var m = r.Music;
                    sb.AppendFormat("{0,2} {1,-26} lum [{2}] scene {3} | musique svc {4} {5} piste {6} {7}s vol {8}{9} | video src {10} vol {11}\r\n",
                        id, r.Cfg.Name, string.Join(",", Array.ConvertAll(r.Levels, x => x.ToString())), r.Scene, m.Service, m.Playing ? "lecture" : "pause",
                        m.Track, m.Position, m.Volume, m.Muted ? " muet" : "", r.VideoSource, r.VideoVolume);
                }
                foreach (var kv in _activeRoom) sb.AppendFormat("ecran {0:X2} -> piece {1}\r\n", kv.Key, kv.Value);
                sb.AppendFormat("lecteur en cours : piece {0}\r\n", _mediaRoom);
            }
            finally { _lock.Leave(); }
            CrestronConsole.ConsoleCommandResponse(sb.ToString());
        }

        private void CmdRoom(string arg)
        {
            var a = (arg ?? "").Trim().Split(' ');
            uint ip; int room;
            if (a.Length < 2 || !uint.TryParse(a[0].Replace("0x", ""), System.Globalization.NumberStyles.HexNumber, null, out ip) || !int.TryParse(a[1], out room))
            { CrestronConsole.ConsoleCommandResponse("usage : showroomroom <ipid hex> <piece>\r\n"); return; }
            try
            {
                _lock.Enter();
                foreach (var p in _panels) if (p != _eisc && p.ID == ip) { SelectRoom(p, room); CrestronConsole.ConsoleCommandResponse("ecran {0:X2} -> piece {1}\r\n", ip, room); return; }
                CrestronConsole.ConsoleCommandResponse("ecran {0:X2} inconnu\r\n", ip);
            }
            finally { _lock.Leave(); }
        }
    }
}
