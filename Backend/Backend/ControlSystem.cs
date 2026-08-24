using System;
using System.Collections.Generic;
using Crestron.SimplSharp;
using Crestron.SimplSharpPro;
using Crestron.SimplSharpPro.UI;                    // Indispensable pour XpanelForSmartGraphics
using Crestron.SimplSharpPro.CrestronThread;
using Crestron.SimplSharpPro.DeviceSupport;
using Crestron.SimplSharpPro.EthernetCommunication; // EISC intersystem vers le slot 2

namespace VillaFrequenceTvAutomation
{
    public class RoomState
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public ushort ActiveScene { get; set; }
        public ushort LightLevel1 { get; set; }
        public ushort TargetTemperature { get; set; }
        public ushort CurrentTemperature { get; set; }
        public ushort ActiveVideoSource { get; set; }
        public ushort AudioVolume { get; set; }
        public bool IsAudioMuted { get; set; }
        public ushort[] CircuitLevels { get; set; }
        public ushort ActiveStoreScene { get; set; }
        public ushort[] PartitionStates { get; set; }

        public RoomState(int id, string name)
        {
            RoomId = id;
            RoomName = name;
            ActiveScene = 1; // index de scène 1..4 (contrat v2 : joins digitaux 45-48)
            LightLevel1 = 0;
            TargetTemperature = 210;
            CurrentTemperature = 224;
            ActiveVideoSource = 0;
            AudioVolume = 25000;
            IsAudioMuted = false;
            CircuitLevels = new ushort[10] { 32768, 32768, 32768, 32768, 32768, 32768, 32768, 32768, 32768, 32768 };
            ActiveStoreScene = 204;
            PartitionStates = new ushort[4] { 0, 0, 0, 0 };
        }
    }

    public class ControlSystem : CrestronControlSystem
    {
        // Liste dynamique gérant tous les écrans connectés (TSW-1070, XPanel, iPad, iPhone) + EISC slot 2
        private List<BasicTriList> _touchPanels;
        private Dictionary<int, RoomState> _roomsRegistry;
        private Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private bool _globalAlarmArmedState = false;
        private bool _vacationModeActive = false;
        private string _cpzFileName = "villaftv.cpz";
        private string _cpzCompileDate = "Inconnue";
        private Dictionary<uint, string> _validationDates = new Dictionary<uint, string>();

        // --- Configuration villa_config.json (dimensionnement du GUI) ---
        private const string VillaConfigPath = "/user/villa_config.json";
        // 180 caractères par chunk : les serials CIP natifs des dalles tronquent au-delà de ~255 octets
        private const int ConfigChunkSize = 180;
        private const uint ConfigSerialJoin = 105;   // Config.Json : transport JSON vers le CH5
        private const uint ConfigHashJoin = 106;     // Config.Hash : empreinte publiée aux panels (transfert seulement si différente)
        private const uint ConfigSyncJoin = 250;     // Digital = demande de config, Analog = ack de chunk
        private string _configHash = "";
        private Newtonsoft.Json.Linq.JObject _villaConfig = null;
        private List<string> _configChunks = new List<string>();
        private Dictionary<uint, int> _configChunkCursor = new Dictionary<uint, int>();

        // Pièce affichée par la dalle principale (IP-ID 0x03), diffusée à tous sur l'Analog 240
        // pour permettre au debugger virtuel de "suivre la dalle".
        private const uint TswRoomBroadcastJoin = 240;
        private const uint MainPanelIpId = 0x03;
        private ushort _tswActiveRoom = 1;

        // Volume audio matériel de la dalle TSW (page Vidéo) : Analog 260 = volume 0-100
        // (extender AllAudioVolume, échelle 0-65535), Digital 261 = bascule mute.
        private const uint TswVolumeJoin = 260;
        private const uint TswMuteJoin = 261;
        private Tsw1070GV _mainTswPanel = null;
        private ushort _tswVolPct = 50;
        private ushort _tswVolBeforeMute = 50;
        private bool _tswVolMuted = false;

        private void BroadcastTswVolume()
        {
            if (_touchPanels == null) return;
            foreach (var dev in _touchPanels)
            {
                dev.UShortInput[TswVolumeJoin].UShortValue = _tswVolPct;
                dev.BooleanInput[TswMuteJoin].BoolValue = _tswVolMuted;
            }
        }

        private void ApplyTswVolumeHardware(ushort pct)
        {
            _tswVolPct = pct;
            if (_mainTswPanel != null)
                _mainTswPanel.ExtenderAudioReservedSigs.AllAudioVolume.UShortValue = (ushort)(pct * 65535 / 100);
        }

        private void SetTswVolume(ushort pct)
        {
            if (pct > 100) pct = 100;
            if (pct > 0) { _tswVolMuted = false; _tswVolBeforeMute = pct; }
            else _tswVolMuted = true;
            ApplyTswVolumeHardware(pct);
            BroadcastTswVolume();
        }

        private void ToggleTswMute()
        {
            _tswVolMuted = !_tswVolMuted;
            if (_tswVolMuted)
            {
                _tswVolBeforeMute = _tswVolPct > 0 ? _tswVolPct : (ushort)50;
                ApplyTswVolumeHardware(0);
            }
            else
            {
                ApplyTswVolumeHardware(_tswVolBeforeMute);
            }
            BroadcastTswVolume();
        }

        // Barre d'outils virtuelle de la TS-1070 (ordre affiché : 1=Power, 2=Home, 3=Ampoule,
        // 4=Flèche haut, 5=Flèche bas, 6=Micro). Home referme l'application ouverte (navigateur
        // YouTube) pour revenir immédiatement au projet CH5 ; les flèches ajustent le volume ±5.
        private void OnTswToolbarSigChange(Crestron.SimplSharpPro.DeviceExtender ext, SigEventArgs args)
        {
            try
            {
                if (_mainTswPanel == null || args.Sig.Type != eSigType.Bool) return;
                CrestronConsole.PrintLine("TOOLBAR: sig {0} = {1}", args.Sig.Number, args.Sig.BoolValue);
                if (!args.Sig.BoolValue) return; // front montant uniquement
                var tb = _mainTswPanel.ExtenderButtonToolbarReservedSigs;

                if (args.Sig == tb.Button2OnFeedback) // Home : retour au projet CH5
                {
                    CrestronConsole.PrintLine("TOOLBAR: Home pressé -> fermeture de l'application ouverte.");
                    _mainTswPanel.ExtenderApplicationControlReservedSigs.HideOpenedApplication();
                }
                else if (args.Sig == tb.Button4OnFeedback) // Flèche haut : volume +5
                {
                    SetTswVolume((ushort)Math.Min(100, _tswVolPct + 5));
                }
                else if (args.Sig == tb.Button5OnFeedback) // Flèche bas : volume -5
                {
                    SetTswVolume((ushort)Math.Max(0, _tswVolPct - 5));
                }
            }
            catch (Exception ex) { ErrorLog.Notice("Notice: toolbar TSW: {0}", ex.Message); }
        }

        private void OnTswAudioExtenderSigChange(Crestron.SimplSharpPro.DeviceExtender ext, SigEventArgs args)
        {
            try
            {
                if (_mainTswPanel == null) return;
                var fb = _mainTswPanel.ExtenderAudioReservedSigs.AllAudioVolumeFeedback;
                if (args.Sig == fb)
                {
                    _tswVolPct = (ushort)Math.Round(fb.UShortValue * 100.0 / 65535.0);
                    CrestronConsole.PrintLine("VOLUME DALLE: feedback matériel {0}% (brut {1}).", _tswVolPct, fb.UShortValue);
                    BroadcastTswVolume();
                }
            }
            catch { /* feedback best-effort */ }
        }

        private void BroadcastTswRoom()
        {
            if (_touchPanels == null) return;
            foreach (var dev in _touchPanels)
                dev.UShortInput[TswRoomBroadcastJoin].UShortValue = _tswActiveRoom;
        }

        // --- EISC : pont intersystem de tout le contrat vers le programme SIMPL du slot 2 ---
        // Signaux globaux (< 1000) : miroir 1:1. Pièces : bloc de 100 joins par pièce,
        // base = 1000 + (id - 1) * 100, activable par le flag 'intersystem' de chaque pièce.
        private EthernetIntersystemCommunications _eisc = null;
        private const uint RoomBlockBase = 1000;
        private const uint RoomBlockSize = 100;
        private Dictionary<int, bool> _roomEiscEnabled = new Dictionary<int, bool>();

        public ControlSystem() : base()
        {
            Thread.MaxNumberOfUserThreads = 32;
        }

        public override void InitializeSystem()
        {
            try
            {
                // Récupération des informations sur le fichier CPZ compilé
                try
                {
                    var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                    _cpzFileName = System.IO.Path.GetFileName(assembly.Location);
                    if (System.IO.File.Exists(assembly.Location))
                    {
                        _cpzCompileDate = System.IO.File.GetLastWriteTime(assembly.Location).ToString("dd/MM/yyyy HH:mm:ss");
                    }
                }
                catch (Exception ex)
                {
                    ErrorLog.Notice("Notice: Échec de lecture des métadonnées de l'assembly CPZ: {0}", ex.Message);
                }

                // Lecture de la date de dernière validation de manière indépendante par périphérique
                try
                {
                    foreach (uint ipId in new uint[] { 3, 4, 5, 6 })
                    {
                        string path = string.Format("/user/last_validation_date_{0:D2}.txt", ipId);
                        if (System.IO.File.Exists(path))
                        {
                            _validationDates[ipId] = System.IO.File.ReadAllText(path).Trim();
                            CrestronConsole.PrintLine("Validation date for IP-ID {0:X2} loaded from persistent file: {1}", ipId, _validationDates[ipId]);
                        }
                        else
                        {
                            _validationDates[ipId] = "";
                        }
                    }
                }
                catch (Exception ex)
                {
                    ErrorLog.Notice("Notice: Échec de lecture des fichiers de validation: {0}", ex.Message);
                }

                // 0. Chargement de la configuration de dimensionnement villa_config.json
                LoadVillaConfiguration();

                // 1. Initialisation de la base de données des pièces de la Villa
                BuildVillaRoomsDatabase();

                _touchPanels = new List<BasicTriList>();

                // 2. Déclaration et instanciation de la dalle tactile principale TSW-1070 sur l'IP ID 0x03
                //    L'extender audio (volume matériel) doit être activé AVANT le Register.
                var mainTsw = new Tsw1070GV(0x03, this);
                try
                {
                    mainTsw.ExtenderAudioReservedSigs.Use();
                    mainTsw.ExtenderAudioReservedSigs.DeviceExtenderSigChange += OnTswAudioExtenderSigChange;
                    mainTsw.ExtenderButtonToolbarReservedSigs.Use();
                    mainTsw.ExtenderButtonToolbarReservedSigs.DeviceExtenderSigChange += OnTswToolbarSigChange;
                    mainTsw.ExtenderApplicationControlReservedSigs.Use();
                    _mainTswPanel = mainTsw;
                }
                catch (Exception ex)
                {
                    ErrorLog.Notice("Notice: extender audio de la dalle TSW indisponible: {0}", ex.Message);
                }
                RegisterUserInterface(mainTsw);

                // Commandes console de diagnostic (tapées sur la console du CP4) :
                // villahome  = ferme l'application ouverte sur la dalle (retour au projet CH5)
                // villavol N = règle le volume matériel de la dalle (0-100)
                CrestronConsole.AddNewConsoleCommand(s =>
                {
                    try
                    {
                        if (_mainTswPanel == null) { CrestronConsole.ConsoleCommandResponse("villahome: dalle indisponible\r\n"); return; }
                        _mainTswPanel.ExtenderApplicationControlReservedSigs.HideOpenedApplication();
                        CrestronConsole.ConsoleCommandResponse("villahome: HideOpenedApplication envoye a la dalle\r\n");
                    }
                    catch (Exception ex2) { CrestronConsole.ConsoleCommandResponse("villahome: erreur {0}\r\n", ex2.Message); }
                }, "villahome", "Ferme l'application ouverte sur la dalle TSW (retour CH5)", ConsoleAccessLevelEnum.AccessOperator);
                CrestronConsole.AddNewConsoleCommand(s =>
                {
                    ushort v;
                    if (ushort.TryParse((s ?? "").Trim(), out v)) { SetTswVolume(v); CrestronConsole.ConsoleCommandResponse("villavol: volume {0}% applique\r\n", v); }
                    else CrestronConsole.ConsoleCommandResponse("villavol: usage 'villavol 0-100' (actuel {0}%)\r\n", _tswVolPct);
                }, "villavol", "Regle le volume materiel de la dalle TSW (0-100)", ConsoleAccessLevelEnum.AccessOperator);

                // 3. Déclaration et instanciation du Web XPanel HTML5 sur l'IP ID 0x04
                RegisterUserInterface(new XpanelForHtml5(0x04, this));

                // 4. Déclaration et instanciation de l'iPad sur l'IP ID 0x05 (Crestron Go / Crestron App)
                var ipad = new CrestronApp(0x05, this);
                ipad.ParameterProjectName.Value = "villaftv";
                RegisterUserInterface(ipad);

                // 5. Déclaration et instanciation de l'iPhone 17 sur l'IP ID 0x06 (Crestron Go mobile)
                var iphone = new CrestronApp(0x06, this);
                iphone.ParameterProjectName.Value = "villaftv";
                RegisterUserInterface(iphone);

                // 6. EISC intersystem : réplique tout le contrat de joins vers le programme SIMPL du slot 2.
                //    Le miroir est 1:1 (même numéro de join des deux côtés). Côté SIMPL : EISC IP-ID F0, IP 127.0.0.2.
                InitializeIntersystemBridge();

                // Force un premier rafraîchissement des textes de l'écran à l'allumage pour toutes les dalles
                foreach(var panel in _touchPanels)
                {
                    _activeRoomPerDevice[panel.ID] = 1;
                    UpdateScreenStateForPanel(panel, 1);
                }
            }
            catch (Exception ex)
            {
                ErrorLog.Error("Échec critique lors de l'initialisation du processeur : {0}", ex.Message);
            }
        }

        /// <summary>
        /// Charge /user/villa_config.json (dimensionnement du GUI) et prépare les chunks de transport vers le CH5.
        /// </summary>
        private void LoadVillaConfiguration()
        {
            try
            {
                if (!System.IO.File.Exists(VillaConfigPath))
                {
                    CrestronConsole.PrintLine("CONFIG: {0} introuvable - dimensionnement historique conservé.", VillaConfigPath);
                    return;
                }
                string raw = System.IO.File.ReadAllText(VillaConfigPath);
                _villaConfig = Newtonsoft.Json.Linq.JObject.Parse(raw);

                // Transport minifié, découpé en chunks acquittés "VCFG|i|n|payload".
                // Tout caractère non-ASCII est échappé en \uXXXX (notation JSON standard) :
                // le lien série CIP des dalles remplace les caractères hors plan de base
                // (emojis...) par des '?', un flux 100% ASCII est insensible à l'encodage.
                string minified = EscapeNonAscii(_villaConfig.ToString(Newtonsoft.Json.Formatting.None));
                _configChunks.Clear();
                int total = (minified.Length + ConfigChunkSize - 1) / ConfigChunkSize;
                for (int i = 0; i < total; i++)
                {
                    int start = i * ConfigChunkSize;
                    int len = Math.Min(ConfigChunkSize, minified.Length - start);
                    _configChunks.Add(string.Format("VCFG|{0}|{1}|{2}", i + 1, total, minified.Substring(start, len)));
                }
                _configHash = ComputeConfigHash(minified) + "-" + total;
                CrestronConsole.PrintLine("CONFIG: villa_config.json chargé ({0} caractères, {1} chunks, empreinte {2}).", minified.Length, total, _configHash);
            }
            catch (Exception ex)
            {
                _villaConfig = null;
                _configChunks.Clear();
                ErrorLog.Error("CONFIG: Échec de lecture de villa_config.json : {0}", ex.Message);
            }
        }

        /// <summary>
        /// Échappe tous les caractères non-ASCII d'un JSON minifié en séquences \uXXXX.
        /// (Le non-ASCII n'apparaît que dans les littéraux de chaîne : l'échappement global est sûr.)
        /// </summary>
        private static string EscapeNonAscii(string s)
        {
            var sb = new System.Text.StringBuilder(s.Length + 64);
            foreach (char ch in s)
            {
                if (ch > 0x7E || ch < 0x20)
                    sb.AppendFormat("\\u{0:x4}", (int)ch);
                else
                    sb.Append(ch);
            }
            return sb.ToString();
        }

        /// <summary>
        /// Empreinte FNV-1a de la configuration : permet aux panels de ne demander le transfert
        /// complet que lorsque leur cache diffère.
        /// </summary>
        private static string ComputeConfigHash(string s)
        {
            unchecked
            {
                uint h = 2166136261;
                foreach (char c in s) { h ^= c; h *= 16777619; }
                return h.ToString("X8");
            }
        }

        /// <summary>
        /// Démarre (ou redémarre) l'envoi de la configuration vers un panel. Chunks acquittés via l'Analog Join 250.
        /// </summary>
        private void StartConfigSend(BasicTriList panel)
        {
            if (_configChunks.Count == 0)
            {
                CrestronConsole.PrintLine("CONFIG: Demande de config du IP-ID {0:X2} ignorée (aucune configuration chargée).", panel.ID);
                return;
            }
            _configChunkCursor[panel.ID] = 1;
            // Purge du join avant l'envoi : un join sériel repositionné à une valeur identique
            // n'émet pas d'événement côté panel, ce qui bloquerait toute retransmission.
            panel.StringInput[ConfigSerialJoin].StringValue = "";
            panel.StringInput[ConfigSerialJoin].StringValue = _configChunks[0];
            CrestronConsole.PrintLine("CONFIG: Envoi de la configuration au IP-ID {0:X2} (chunk 1/{1}).", panel.ID, _configChunks.Count);
        }

        private void OnConfigChunkAck(BasicTriList panel, ushort ackedChunk)
        {
            if (!_configChunkCursor.ContainsKey(panel.ID)) return;
            int current = _configChunkCursor[panel.ID];
            if (ackedChunk != current) return;
            if (current >= _configChunks.Count)
            {
                _configChunkCursor.Remove(panel.ID);
                CrestronConsole.PrintLine("CONFIG: Configuration transmise intégralement au IP-ID {0:X2}.", panel.ID);
                return;
            }
            _configChunkCursor[panel.ID] = current + 1;
            panel.StringInput[ConfigSerialJoin].StringValue = _configChunks[current];
        }

        /// <summary>
        /// Crée l'EISC vers le slot 2 (miroir 1:1 du contrat de joins) selon la section contrat.eisc de la config.
        /// </summary>
        private void InitializeIntersystemBridge()
        {
            try
            {
                uint ipid = 0xF0;
                string ipAddress = "127.0.0.2";
                bool actif = true;
                if (_villaConfig != null && _villaConfig["contrat"] != null && _villaConfig["contrat"]["eisc"] != null)
                {
                    var eiscCfg = _villaConfig["contrat"]["eisc"];
                    if (eiscCfg["actif"] != null) actif = (bool)eiscCfg["actif"];
                    if (eiscCfg["adresseIp"] != null) ipAddress = (string)eiscCfg["adresseIp"];
                    if (eiscCfg["ipid"] != null)
                    {
                        string rawIpid = ((string)eiscCfg["ipid"]).Replace("0x", "").Replace("0X", "");
                        ipid = Convert.ToUInt32(rawIpid, 16);
                    }
                }
                if (!actif)
                {
                    CrestronConsole.PrintLine("EISC: Pont intersystem désactivé par la configuration.");
                    return;
                }
                _eisc = new EthernetIntersystemCommunications(ipid, ipAddress, this);
                // L'EISC est traité comme un panel : il reçoit tout le feedback du contrat et
                // ses signaux entrants (slot 2 -> slot 1) sont traités comme des commandes.
                RegisterUserInterface(_eisc);
                CrestronConsole.PrintLine("EISC: Pont intersystem actif vers {0} (IP-ID {1:X2}) - contrat miroir 1:1.", ipAddress, ipid);
            }
            catch (Exception ex)
            {
                ErrorLog.Error("EISC: Échec d'initialisation du pont intersystem : {0}", ex.Message);
            }
        }

        /// <summary>
        /// Réplique un signal brut d'un panel vers l'EISC du slot 2 (miroir 1:1 du contrat).
        /// </summary>
        private void MirrorSignalToEisc(BasicTriList sourceDevice, SigEventArgs args)
        {
            if (_eisc == null || sourceDevice == _eisc) return;
            if (args.Sig.Number >= RoomBlockBase) return; // la plage >= 1000 est réservée aux blocs pièces
            try
            {
                uint join = args.Sig.Number;
                switch (args.Sig.Type)
                {
                    case eSigType.Bool:
                        _eisc.BooleanInput[join].BoolValue = args.Sig.BoolValue;
                        break;
                    case eSigType.UShort:
                        _eisc.UShortInput[join].UShortValue = args.Sig.UShortValue;
                        break;
                    case eSigType.String:
                        _eisc.StringInput[join].StringValue = args.Sig.StringValue;
                        break;
                }
            }
            catch { /* miroir best-effort : ne doit jamais bloquer le traitement principal */ }
        }

        /// <summary>
        /// Enregistre un écran tactile (ou l'EISC) et l'abonne aux événements d'entrée utilisateur et de statut de connexion.
        /// </summary>
        private void RegisterUserInterface(BasicTriList device)
        {
            device.SigChange += new SigEventHandler(OnTouchPanelSignalReceived);
            device.OnlineStatusChange += new OnlineStatusChangeEventHandler(OnTouchPanelOnlineStatusChange);
            var result = device.Register();
            if (result.ToString() == "Success")
            {
                _touchPanels.Add(device);
                CrestronConsole.PrintLine("SUCCESS: Périphérique tactile {0} enregistré sur l'IP ID {1:X2}.", device.GetType().Name, device.ID);
            }
            else
            {
                ErrorLog.Error("ERREUR: Impossible d'enregistrer {0} sur l'IP ID {1:X2}. Statut : {2}", device.GetType().Name, device.ID, result.ToString());
            }
        }

        private void OnTouchPanelOnlineStatusChange(GenericBase currentDevice, OnlineOfflineEventArgs args)
        {
            if (args.DeviceOnLine)
            {
                BasicTriList panel = currentDevice as BasicTriList;
                if (panel != null)
                {
                    CrestronConsole.PrintLine("DEVICE ONLINE: Périphérique tactile IP-ID {0:X2} est en ligne.", panel.ID);
                    int roomId = _activeRoomPerDevice.ContainsKey(panel.ID) ? _activeRoomPerDevice[panel.ID] : 1;
                    UpdateScreenStateForPanel(panel, roomId);

                    // Publie l'empreinte de la configuration : le panel demandera le transfert
                    // complet (Digital 250) uniquement si son cache diffère.
                    if (panel != _eisc)
                        panel.StringInput[ConfigHashJoin].StringValue = _configHash;
                    else
                        MirrorAllRoomsToEisc(); // slot 2 en ligne : pousser l'état de toutes les pièces exposées

                    // Informe le nouvel arrivant de la pièce affichée par la dalle principale
                    panel.UShortInput[TswRoomBroadcastJoin].UShortValue = _tswActiveRoom;

                    // ... et du volume matériel courant de la dalle (page Vidéo)
                    panel.UShortInput[TswVolumeJoin].UShortValue = _tswVolPct;
                    panel.BooleanInput[TswMuteJoin].BoolValue = _tswVolMuted;
                }
            }
        }

        // --- MÉTHODES DE RETOUR D'ÉTATS (FEEDBACK) PAR PIÈCE ---

        private void SendFeedbackBoolToRoom(int roomId, uint joinNumber, bool value)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    panel.BooleanInput[joinNumber].BoolValue = value;
            }
            MirrorRoomStateToEisc(roomId);
        }

        private void SendFeedbackUShortToRoom(int roomId, uint joinNumber, ushort value)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    panel.UShortInput[joinNumber].UShortValue = value;
            }
            MirrorRoomStateToEisc(roomId);
        }

        private void SendFeedbackStringToRoom(int roomId, uint joinNumber, string value)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    panel.StringInput[joinNumber].StringValue = value;
            }
            MirrorRoomStateToEisc(roomId);
        }

        private void BroadcastFeedbackToRoom(int roomId)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    UpdateScreenStateForPanel(panel, roomId);
            }
            MirrorRoomStateToEisc(roomId);
        }

        private void BroadcastFeedbackToAll()
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID))
                    UpdateScreenStateForPanel(panel, _activeRoomPerDevice[panel.ID]);
            }
            MirrorAllRoomsToEisc();
        }

        private void BuildVillaRoomsDatabase()
        {
            _roomsRegistry = new Dictionary<int, RoomState>();

            // Dimensionnement par villa_config.json quand il est présent sur le processeur
            if (_villaConfig != null && _villaConfig["pieces"] is Newtonsoft.Json.Linq.JArray)
            {
                int eiscExposed = 0;
                foreach (var piece in (Newtonsoft.Json.Linq.JArray)_villaConfig["pieces"])
                {
                    int id = piece["id"] != null ? (int)piece["id"] : (_roomsRegistry.Count + 1);
                    string nom = piece["nom"] != null ? (string)piece["nom"] : ("Pièce " + id);
                    if (!_roomsRegistry.ContainsKey(id))
                        _roomsRegistry.Add(id, new RoomState(id, nom));

                    // Flag 'intersystem' : expose (ou non) le bloc EISC de cette pièce vers le slot 2
                    bool eiscOn = piece["intersystem"] == null || (bool)piece["intersystem"];
                    _roomEiscEnabled[id] = eiscOn;
                    if (eiscOn) eiscExposed++;
                }
                CrestronConsole.PrintLine("CONFIG: Registre construit depuis villa_config.json : {0} pièces ({1} exposées en intersystem).",
                    _roomsRegistry.Count, eiscExposed);
                return;
            }

            // Repli historique si aucune configuration n'est chargée
            string[] roomNames = {
                "Salon", "Cuisine", "Salle à Manger", "Suite Parentale", "Chambre 1",
                "Chambre 2", "Bureau", "Home Cinéma", "Terrasse extrieure", "Espace SPA / Piscine"
            };

            for (int i = 1; i <= 10; i++)
            {
                _roomsRegistry.Add(i, new RoomState(i, roomNames[i - 1]));
                _roomEiscEnabled[i] = true;
            }
        }

        // --- BLOCS EISC PAR PIÈCE (contrat blocsPieces) ---

        private uint RoomBlockStart(int roomId)
        {
            return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize;
        }

        /// <summary>
        /// Pousse l'état complet d'une pièce vers son bloc EISC (base = 1000 + (id-1)*100),
        /// uniquement si la pièce est exposée en intersystem ('intersystem': true dans villa_config.json).
        /// </summary>
        private void MirrorRoomStateToEisc(int roomId)
        {
            if (_touchPanels == null) return;
            if (!_roomsRegistry.ContainsKey(roomId)) return;
            bool eiscEnabled = _roomEiscEnabled.ContainsKey(roomId) && _roomEiscEnabled[roomId];

            try
            {
                RoomState room = _roomsRegistry[roomId];
                uint b = RoomBlockStart(roomId);

                // Panels (debugger virtuel compris) : TOUTES les pièces sont diffusées.
                // EISC (slot 2) : uniquement les pièces avec 'intersystem': true (limite le debugger SIMPL).
                foreach (var dev in _touchPanels)
                {
                    if (dev == _eisc && !eiscEnabled) continue;
                    // Digitals : scènes éclairage (+21..24), scènes stores (+41..44), mute (+50), source (+51..56)
                    for (uint s = 0; s < 4; s++)
                        dev.BooleanInput[b + 21 + s].BoolValue = (room.ActiveScene == s + 1);
                    for (uint s = 0; s < 4; s++)
                        dev.BooleanInput[b + 41 + s].BoolValue = (room.ActiveStoreScene == 201 + s);
                    dev.BooleanInput[b + 50].BoolValue = room.IsAudioMuted;
                    for (uint s = 0; s < 6; s++)
                        dev.BooleanInput[b + 51 + s].BoolValue = (room.ActiveVideoSource == s);
                    // Partitions d'alarme (+81..92 : triplets Armé / Partiel / Désarmé)
                    for (uint p = 0; p < 4; p++)
                    {
                        ushort st = room.PartitionStates[p];
                        dev.BooleanInput[b + 81 + p * 3].BoolValue = (st == 1);
                        dev.BooleanInput[b + 82 + p * 3].BoolValue = (st == 2);
                        dev.BooleanInput[b + 83 + p * 3].BoolValue = (st == 0);
                    }

                    // Analogs : master (+21), consigne (+31), source (+51), volume (+52), circuits (+71..80)
                    dev.UShortInput[b + 21].UShortValue = room.LightLevel1;
                    dev.UShortInput[b + 31].UShortValue = room.TargetTemperature;
                    dev.UShortInput[b + 51].UShortValue = room.ActiveVideoSource;
                    dev.UShortInput[b + 52].UShortValue = room.AudioVolume;
                    for (uint i = 0; i < 10; i++)
                        dev.UShortInput[b + 71 + i].UShortValue = room.CircuitLevels[i];

                    // Serials : nom (+10), temp actuelle (+32), mode (+33), consigne texte (+34)
                    dev.StringInput[b + 10].StringValue = room.RoomName;
                    dev.StringInput[b + 32].StringValue = ((double)room.CurrentTemperature / 10.0).ToString("F1");
                    dev.StringInput[b + 33].StringValue = room.TargetTemperature > room.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION";
                    dev.StringInput[b + 34].StringValue = ((double)room.TargetTemperature / 10.0).ToString("F1");
                }
            }
            catch { /* miroir best-effort */ }
        }

        private void MirrorAllRoomsToEisc()
        {
            foreach (var id in _roomsRegistry.Keys)
                MirrorRoomStateToEisc(id);
        }

        /// <summary>
        /// Traite une commande reçue du programme SIMPL du slot 2 sur un bloc pièce de l'EISC.
        /// </summary>
        private void ProcessEiscRoomSignal(BasicTriList sourceDevice, SigEventArgs args)
        {
            uint join = args.Sig.Number;
            int roomId = (int)((join - RoomBlockBase) / RoomBlockSize) + 1;
            uint offset = (join - RoomBlockBase) % RoomBlockSize;
            if (!_roomsRegistry.ContainsKey(roomId)) return;
            // Le flag 'intersystem' ne restreint que le slot 2 ; les panels (debugger) pilotent toutes les pièces
            if (sourceDevice == _eisc && (!_roomEiscEnabled.ContainsKey(roomId) || !_roomEiscEnabled[roomId])) return;

            RoomState room = _roomsRegistry[roomId];

            if (args.Sig.Type == eSigType.Bool)
            {
                if (!args.Sig.BoolValue) return; // front montant uniquement
                CrestronConsole.PrintLine("EISC: Slot 2 -> Pièce {0}, commande digitale offset {1}", roomId, offset);

                if (offset >= 21 && offset <= 24)          // Scènes d'éclairage (index 1..4)
                {
                    uint sceneIdx = offset - 20;
                    room.ActiveScene = (ushort)sceneIdx;
                    if (sceneIdx == 1) room.LightLevel1 = 0;
                    if (sceneIdx == 2) room.LightLevel1 = 19660;
                    if (sceneIdx == 3) room.LightLevel1 = 45875;
                    if (sceneIdx == 4) room.LightLevel1 = 65535;
                }
                else if (offset == 35)                      // Consigne +
                    room.TargetTemperature = (ushort)Math.Min(280, room.TargetTemperature + 5);
                else if (offset == 36)                      // Consigne -
                    room.TargetTemperature = (ushort)Math.Max(160, room.TargetTemperature - 5);
                else if (offset >= 41 && offset <= 44)      // Scènes de stores
                    room.ActiveStoreScene = (ushort)(201 + (offset - 41));
                else if (offset == 50)                      // Mute toggle
                    room.IsAudioMuted = !room.IsAudioMuted;
                else if (offset >= 51 && offset <= 56)      // Sélection de source
                {
                    room.ActiveVideoSource = (ushort)(offset - 51);
                    DispatchIpCommandToSonyTv(roomId, room.ActiveVideoSource);
                }
                else if (offset >= 81 && offset <= 92)      // Partitions d'alarme
                {
                    uint partIdx = (offset - 81) / 3;
                    uint actionType = (offset - 81) % 3;
                    room.PartitionStates[partIdx] = (ushort)(actionType == 0 ? 1 : (actionType == 1 ? 2 : 0));
                }
                else return;

                BroadcastFeedbackToRoom(roomId);
                MirrorRoomStateToEisc(roomId);
            }
            else if (args.Sig.Type == eSigType.UShort)
            {
                ushort val = args.Sig.UShortValue;
                if (offset == 21) room.LightLevel1 = val;
                else if (offset == 31) room.TargetTemperature = val;
                else if (offset == 51) { room.ActiveVideoSource = val; DispatchIpCommandToSonyTv(roomId, val); }
                else if (offset == 52) room.AudioVolume = val;
                else if (offset >= 71 && offset <= 80) room.CircuitLevels[offset - 71] = val;
                else return;

                CrestronConsole.PrintLine("EISC: Slot 2 -> Pièce {0}, valeur analogique offset {1} = {2}", roomId, offset, val);
                BroadcastFeedbackToRoom(roomId);
                MirrorRoomStateToEisc(roomId);
            }
        }

        private void OnTouchPanelSignalReceived(BasicTriList currentDevice, SigEventArgs args)
        {
            ushort joinNumber = (ushort)args.Sig.Number;

            // Commandes sur les blocs pièces (joins >= 1000) : acceptées de l'EISC (slot 2)
            // ET des panels (le debugger virtuel XPanel peut ainsi piloter n'importe quelle pièce).
            // Les joins réservés firmware (ex : 29731) tombent hors registre et sont ignorés.
            if (args.Sig.Number >= RoomBlockBase)
            {
                ProcessEiscRoomSignal(currentDevice, args);
                return;
            }

            if (!_activeRoomPerDevice.ContainsKey(currentDevice.ID))
                _activeRoomPerDevice[currentDevice.ID] = 1;

            // Miroir intersystem : chaque signal global brut (< 1000) est répliqué 1:1 vers le slot 2
            MirrorSignalToEisc(currentDevice, args);

            switch (args.Sig.Type)
            {
                case eSigType.Bool:
                    if (args.Sig.BoolValue == true)
                    {
                        ProcessDigitalSignal(currentDevice, joinNumber);
                    }
                    break;

                case eSigType.UShort:
                    ProcessAnalogSignal(currentDevice, joinNumber, args.Sig.UShortValue);
                    break;

                case eSigType.String:
                    CrestronConsole.PrintLine("[JS CONSOLE] IP-ID {0:X2} (Join {1}): {2}", currentDevice.ID, joinNumber, args.Sig.StringValue);
                    if (joinNumber == 103)
                    {
                        string command = args.Sig.StringValue;
                        if (!string.IsNullOrEmpty(command))
                        {
                            string consoleResult = "";
                            if (CrestronConsole.SendControlSystemCommand(command, ref consoleResult))
                            {
                                string formattedResult = FormatConsoleResponse(consoleResult);
                                CrestronConsole.PrintLine("CONSOLE-CMD: Commande '{0}' exécutée. Réponse envoyée de {1} caractères.", command, formattedResult.Length);
                                foreach (var panel in _touchPanels)
                                {
                                    panel.StringInput[103].StringValue = formattedResult;
                                }
                            }
                            else
                            {
                                foreach (var panel in _touchPanels)
                                {
                                    panel.StringInput[103].StringValue = "Erreur: Impossible d'exécuter la commande.";
                                }
                            }
                        }
                    }
                    else if (joinNumber == 104)
                    {
                        string newDate = args.Sig.StringValue;
                        uint panelId = currentDevice.ID;
                        bool hasChanged = !_validationDates.ContainsKey(panelId) || _validationDates[panelId] != newDate;
                        if (hasChanged)
                        {
                            _validationDates[panelId] = newDate;
                            try
                            {
                                string path = string.Format("/user/last_validation_date_{0:D2}.txt", panelId);
                                System.IO.File.WriteAllText(path, newDate);
                                CrestronConsole.PrintLine("Validation date for IP-ID {0:X2} saved to persistent file: {1}", panelId, newDate);
                            }
                            catch (Exception ex)
                            {
                                ErrorLog.Notice("Notice: Échec de sauvegarde de la date de validation pour IP-ID {0:X2}: {1}", panelId, ex.Message);
                            }
                            // Feedback only to the current device
                            currentDevice.StringInput[104].StringValue = newDate;
                        }
                    }
                    else if (joinNumber == 420)
                    {
                        SavePresetConfig(args.Sig.StringValue);
                    }
                    break;
            }
        }

        private void ProcessDigitalSignal(BasicTriList currentDevice, ushort joinNumber)
        {
            int activeRoomId = _activeRoomPerDevice[currentDevice.ID];
            RoomState selectedRoom = _roomsRegistry[activeRoomId];

            // Filtre de journal : au-delà de 3000 il n'y a que des joins réservés firmware (capteurs,
            // extenders de la dalle) - ils sont ignorés par le programme, inutile de les tracer.
            if (joinNumber <= 3000)
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Digital Join {2}", currentDevice.ID, activeRoomId, joinNumber);

            // Rooms Navigation (Digital 11 à 40 : jusqu'à 30 pièces, contrat v2)
            if (joinNumber >= 11 && joinNumber <= 40)
            {
                int roomSelected = joinNumber - 10;
                if (!_roomsRegistry.ContainsKey(roomSelected)) return;
                _activeRoomPerDevice[currentDevice.ID] = roomSelected;
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} navigated to Room {1} (via Digital)", currentDevice.ID, roomSelected);
                UpdateScreenStateForPanel(currentDevice, roomSelected);
                if (currentDevice.ID == MainPanelIpId) { _tswActiveRoom = (ushort)roomSelected; BroadcastTswRoom(); }
                return;
            }

            // Demande d'envoi de la configuration villa_config.json (Digital 250)
            if (joinNumber == ConfigSyncJoin)
            {
                StartConfigSend(currentDevice);
                return;
            }

            // Sources Selection (Digital 150 to 155)
            if (joinNumber >= 150 && joinNumber <= 155)
            {
                ushort sourceId = (ushort)(joinNumber - 150);
                selectedRoom.ActiveVideoSource = sourceId;
                SendFeedbackUShortToRoom(activeRoomId, 51, sourceId); // Still send analog feedback for compatibility
                
                // Send digital feedback to all panels in this room
                foreach (var panel in _touchPanels)
                {
                    if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == activeRoomId)
                    {
                        for (uint i = 150; i <= 155; i++)
                        {
                            panel.BooleanInput[i].BoolValue = (joinNumber == i);
                        }
                    }
                }
                
                DispatchIpCommandToSonyTv(activeRoomId, sourceId);
                return;
            }

            // Scènes d'éclairage 1..4 (Digital 51-54, contrat v2)
            if (joinNumber >= 51 && joinNumber <= 54)
            {
                int sceneIdx = joinNumber - 50;
                selectedRoom.ActiveScene = (ushort)sceneIdx;

                if (sceneIdx == 1) selectedRoom.LightLevel1 = 0;
                if (sceneIdx == 2) selectedRoom.LightLevel1 = 19660;
                if (sceneIdx == 3) selectedRoom.LightLevel1 = 45875;
                if (sceneIdx == 4) selectedRoom.LightLevel1 = 65535;

                BroadcastFeedbackToRoom(activeRoomId);
                return;
            }

            switch (joinNumber)
            {
                case 49: // Target Temp Up (+0.5°C => +5 raw) - contrat v2 (ex-35)
                    selectedRoom.TargetTemperature = (ushort)Math.Min(280, selectedRoom.TargetTemperature + 5);
                    SendFeedbackUShortToRoom(activeRoomId, 31, selectedRoom.TargetTemperature);
                    SendFeedbackStringToRoom(activeRoomId, 33, selectedRoom.TargetTemperature > selectedRoom.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION");
                    SendFeedbackStringToRoom(activeRoomId, 34, ((double)selectedRoom.TargetTemperature / 10.0).ToString("F1"));
                    break;

                case 50: // Target Temp Down (-0.5°C => -5 raw) - contrat v2 (ex-36)
                    selectedRoom.TargetTemperature = (ushort)Math.Max(160, selectedRoom.TargetTemperature - 5);
                    SendFeedbackUShortToRoom(activeRoomId, 31, selectedRoom.TargetTemperature);
                    SendFeedbackStringToRoom(activeRoomId, 33, selectedRoom.TargetTemperature > selectedRoom.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION");
                    SendFeedbackStringToRoom(activeRoomId, 34, ((double)selectedRoom.TargetTemperature / 10.0).ToString("F1"));
                    break;

                case 56: // Easter Egg - Widget Météo triple-tap - contrat v2 (ex-37)
                    CrestronConsole.PrintLine("EASTER EGG: Triple-clic sur le widget météo détecté. Lecture de funny.mp3 demandée.");
                    break;

                case 41:
                    _globalAlarmArmedState = true;
                    CrestronConsole.PrintLine("SÉCURITÉ: Armement général demandé par l'IP-ID {0:X2}.", currentDevice.ID);
                    BroadcastFeedbackToAll();
                    break;

                case 42:
                    _globalAlarmArmedState = false;
                    CrestronConsole.PrintLine("SÉCURITÉ: Désarmement général effectué.");
                    BroadcastFeedbackToAll();
                    break;

                case 55: // Mute audio - contrat v2 (ex-53, libéré pour les scènes 51-54)
                    selectedRoom.IsAudioMuted = !selectedRoom.IsAudioMuted;
                    SendFeedbackBoolToRoom(activeRoomId, 55, selectedRoom.IsAudioMuted);
                    break;

                case (ushort)TswMuteJoin: // Bascule mute du volume matériel de la dalle TSW (page Vidéo)
                    CrestronConsole.PrintLine("VOLUME DALLE: bascule mute demandée par IP-ID {0:X2}.", currentDevice.ID);
                    ToggleTswMute();
                    break;

                // Stores groupés Volets/Rideaux/Stores (61-69) - écho différencié vers le bloc pièce EISC (+1..+9)
                case 61:
                case 62:
                case 63:
                case 64:
                case 65:
                case 66:
                case 67:
                case 68:
                case 69:
                    CrestronConsole.PrintLine("STORE CONTROL - Event on digital join {0} received (pièce {1}).", joinNumber, activeRoomId);
                    if (_touchPanels != null)
                    {
                        bool grpEisc = _roomEiscEnabled.ContainsKey(activeRoomId) && _roomEiscEnabled[activeRoomId];
                        uint groupJoin = RoomBlockStart(activeRoomId) + 1 + (uint)(joinNumber - 61);
                        foreach (var dev in _touchPanels)
                        {
                            if (dev == _eisc && !grpEisc) continue;
                            dev.BooleanInput[groupJoin].BoolValue = true;
                            dev.BooleanInput[groupJoin].BoolValue = false;
                        }
                    }
                    break;

                // Moteurs 1..6 (joins 81-98 : triplets Monter/Stop/Descendre) - écho vers le bloc pièce EISC (+61..78)
                case 81: case 82: case 83: case 84: case 85: case 86:
                case 87: case 88: case 89: case 90: case 91: case 92:
                case 93: case 94: case 95: case 96: case 97: case 98:
                    CrestronConsole.PrintLine("MOTEURS: Commande join {0} (pièce {1}).", joinNumber, activeRoomId);
                    if (_touchPanels != null)
                    {
                        bool motEisc = _roomEiscEnabled.ContainsKey(activeRoomId) && _roomEiscEnabled[activeRoomId];
                        uint motorJoin = RoomBlockStart(activeRoomId) + 61 + (uint)(joinNumber - 81);
                        foreach (var dev in _touchPanels)
                        {
                            if (dev == _eisc && !motEisc) continue;
                            dev.BooleanInput[motorJoin].BoolValue = true;
                            dev.BooleanInput[motorJoin].BoolValue = false;
                        }
                    }
                    break;

                // Scénarios de Stores (joins 201 à 204)
                case 201:
                case 202:
                case 203:
                case 204:
                    selectedRoom.ActiveStoreScene = joinNumber;
                    CrestronConsole.PrintLine("STORES: Scénario {0} activé dans la pièce {1}", joinNumber, activeRoomId);
                    BroadcastFeedbackToRoom(activeRoomId);
                    break;

                // Partitions d'alarme (joins 301 à 312)
                case 301: case 302: case 303:
                case 304: case 305: case 306:
                case 307: case 308: case 309:
                case 310: case 311: case 312:
                    uint partIdx = (uint)((joinNumber - 301) / 3);
                    uint actionType = (uint)((joinNumber - 301) % 3);
                    selectedRoom.PartitionStates[partIdx] = (ushort)(actionType == 0 ? 1 : (actionType == 1 ? 2 : 0));
                    CrestronConsole.PrintLine("SÉCURITÉ: Partition {0} de la pièce {1} passée à l'état {2}", partIdx + 1, activeRoomId, selectedRoom.PartitionStates[partIdx]);
                    BroadcastFeedbackToRoom(activeRoomId);
                    break;

                // Commandes globales de la maison (joins 401 à 411)
                case 401:
                    CrestronConsole.PrintLine("GLOBAL: Éclairage Global - Tout Allumer demandé.");
                    if (!ApplyPreset("light_all"))
                    {
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.LightLevel1 = 65535;
                            for (int i = 0; i < 6; i++) rm.CircuitLevels[i] = 65535;
                        }
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 402:
                    CrestronConsole.PrintLine("GLOBAL: Éclairage Global - Tout Éteindre demandé.");
                    if (!ApplyPreset("light_off"))
                    {
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.LightLevel1 = 0;
                            for (int i = 0; i < 6; i++) rm.CircuitLevels[i] = 0;
                        }
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 403:
                    CrestronConsole.PrintLine("GLOBAL: Éclairage Global - Mode Éco demandé.");
                    if (!ApplyPreset("light_eco"))
                    {
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.LightLevel1 = 32768;
                            for (int i = 0; i < 10; i++) rm.CircuitLevels[i] = 32768;
                        }
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 404:
                    CrestronConsole.PrintLine("GLOBAL: Stores Globaux - Tout Ouvrir demandé.");
                    if (!ApplyPreset("shade_open"))
                    {
                        foreach (var rm in _touchPanels)
                        {
                            for (uint i = 1; i <= 6; i++)
                            {
                                rm.BooleanInput[80 + i * 3 - 2].BoolValue = true;
                            }
                        }
                    }
                    break;

                case 405:
                    CrestronConsole.PrintLine("GLOBAL: Stores Globaux - Tout Fermer demandé.");
                    if (!ApplyPreset("shade_close"))
                    {
                        foreach (var rm in _touchPanels)
                        {
                            for (uint i = 1; i <= 6; i++)
                            {
                                rm.BooleanInput[80 + i * 3].BoolValue = true;
                            }
                        }
                    }
                    break;

                case 406:
                    CrestronConsole.PrintLine("GLOBAL: Stores Globaux - Position Intermédiaire demandé.");
                    break;

                case 407:
                    CrestronConsole.PrintLine("GLOBAL: Climatisation - Mode Confort demandé.");
                    if (!ApplyPreset("hvac_confort"))
                    {
                        foreach (var rm in _roomsRegistry.Values) rm.TargetTemperature = 210;
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 408:
                    CrestronConsole.PrintLine("GLOBAL: Climatisation - Mode Nuit demandé.");
                    if (!ApplyPreset("hvac_nuit"))
                    {
                        foreach (var rm in _roomsRegistry.Values) rm.TargetTemperature = 180;
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 409:
                    CrestronConsole.PrintLine("GLOBAL: Climatisation - Mode Hors Gel demandé.");
                    if (!ApplyPreset("hvac_horsgel"))
                    {
                        foreach (var rm in _roomsRegistry.Values) rm.TargetTemperature = 120;
                        BroadcastFeedbackToAll();
                    }
                    break;

                case 410:
                    CrestronConsole.PrintLine("GLOBAL: Mode Vacances Activé.");
                    _vacationModeActive = true;
                    if (!ApplyPreset("vacation"))
                    {
                        foreach (var rm in _roomsRegistry.Values) rm.TargetTemperature = 120;
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.LightLevel1 = 0;
                            for (int i = 0; i < 6; i++) rm.CircuitLevels[i] = 0;
                        }
                        foreach (var rm in _touchPanels)
                        {
                            for (uint i = 1; i <= 6; i++)
                            {
                                rm.BooleanInput[80 + i * 3].BoolValue = true;
                            }
                        }
                    }
                    BroadcastFeedbackToAll();
                    break;

                case 411:
                    CrestronConsole.PrintLine("GLOBAL: Mode Vacances Désactivé.");
                    _vacationModeActive = false;
                    BroadcastFeedbackToAll();
                    break;

                case 103:
                    string iptResult = "";
                    if (CrestronConsole.SendControlSystemCommand("ipt", ref iptResult))
                    {
                        string formattedIpt = FormatIpTable(iptResult);
                        CrestronConsole.PrintLine("IP-TABLE-CMD: Commande 'ipt' exécutée. Envoi de {0} caractères aux {1} panels.", 
                            formattedIpt.Length, _touchPanels.Count);
                        foreach (var panel in _touchPanels)
                        {
                            panel.StringInput[103].StringValue = formattedIpt;
                        }
                    }
                    else
                    {
                        foreach (var panel in _touchPanels)
                        {
                            panel.StringInput[103].StringValue = "Erreur: Impossible d'exécuter la commande 'ipt' sur le CP4.";
                        }
                    }
                    break;
            }
        }

        private void ProcessAnalogSignal(BasicTriList currentDevice, ushort joinNumber, ushort rawValue)
        {
            int activeRoomId = _activeRoomPerDevice[currentDevice.ID];
            
            // Filtre de journal : join 10 (trop bavard) et joins réservés firmware (> 3000) non tracés
            if (joinNumber != 10 && joinNumber <= 3000)
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Analog Join {2} = {3}", currentDevice.ID, activeRoomId, joinNumber, rawValue);

            switch (joinNumber)
            {
                case 10:
                    if (rawValue >= 1 && _roomsRegistry.ContainsKey(rawValue))
                    {
                        CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} navigated to Room {1}", currentDevice.ID, rawValue);
                        _activeRoomPerDevice[currentDevice.ID] = rawValue;
                        UpdateScreenStateForPanel(currentDevice, rawValue);
                        if (currentDevice.ID == MainPanelIpId) { _tswActiveRoom = rawValue; BroadcastTswRoom(); }
                    }
                    break;

                case (ushort)ConfigSyncJoin:
                    // Accusé de réception d'un chunk de configuration (Analog 250)
                    OnConfigChunkAck(currentDevice, rawValue);
                    break;

                case (ushort)TswVolumeJoin: // Volume matériel de la dalle TSW (0-100), page Vidéo
                    CrestronConsole.PrintLine("VOLUME DALLE: {0}% demandé par IP-ID {1:X2}.", rawValue, currentDevice.ID);
                    SetTswVolume(rawValue);
                    break;

                case 21:
                    _roomsRegistry[activeRoomId].LightLevel1 = rawValue;
                    SendFeedbackUShortToRoom(activeRoomId, 21, rawValue);
                    break;

                case 31:
                    _roomsRegistry[activeRoomId].TargetTemperature = rawValue;
                    SendFeedbackUShortToRoom(activeRoomId, 31, rawValue);
                    SendFeedbackStringToRoom(activeRoomId, 33, rawValue > _roomsRegistry[activeRoomId].CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION");
                    
                    // Send formatted target temperature string on String Join 34
                    double targetTempDouble = (double)rawValue / 10.0;
                    SendFeedbackStringToRoom(activeRoomId, 34, targetTempDouble.ToString("F1"));
                    break;

                case 51:
                    _roomsRegistry[activeRoomId].ActiveVideoSource = rawValue;
                    SendFeedbackUShortToRoom(activeRoomId, 51, rawValue);
                    DispatchIpCommandToSonyTv(activeRoomId, rawValue);
                    break;

                case 52:
                    _roomsRegistry[activeRoomId].AudioVolume = rawValue;
                    SendFeedbackUShortToRoom(activeRoomId, 52, rawValue);
                    break;

                case 71:
                case 72:
                case 73:
                case 74:
                case 75:
                case 76:
                case 77:
                case 78:
                case 79:
                case 80:
                    _roomsRegistry[activeRoomId].CircuitLevels[joinNumber - 71] = rawValue;
                    SendFeedbackUShortToRoom(activeRoomId, joinNumber, rawValue);
                    break;
            }
        }

        private void UpdateScreenStateForPanel(BasicTriList panel, int roomId)
        {
            RoomState room = _roomsRegistry[roomId];

            // Envoi des informations textuelles et numériques à la dalle spécifique
            panel.UShortInput[10].UShortValue = (ushort)roomId;
            panel.StringInput[10].StringValue = room.RoomName.ToUpper();
            
            // Envoi de l'IP ID sur le String Join 99
            panel.StringInput[99].StringValue = panel.ID.ToString("D2");

            // Envoi des informations sur le fichier CPZ (Joins 101 et 102) et de l'empreinte de config (106)
            panel.StringInput[101].StringValue = _cpzFileName;
            panel.StringInput[102].StringValue = _cpzCompileDate;
            panel.StringInput[ConfigHashJoin].StringValue = _configHash;
            panel.StringInput[104].StringValue = _validationDates.ContainsKey(panel.ID) ? _validationDates[panel.ID] : "";

            // Native Room Selection Feedback (Digital 11-40, jusqu'à 30 pièces - contrat v2)
            for (uint i = 11; i <= 40; i++)
            {
                panel.BooleanInput[i].BoolValue = (roomId == (i - 10));
            }

            // Native Source Selection Feedback (Digital 150-155)
            for (uint i = 150; i <= 155; i++)
            {
                panel.BooleanInput[i].BoolValue = (room.ActiveVideoSource == (i - 150));
            }

            // Feedback des scènes d'éclairage (Digital 51-54, ActiveScene = index 1..4 - contrat v2)
            for (uint s = 1; s <= 4; s++)
            {
                panel.BooleanInput[50 + s].BoolValue = (room.ActiveScene == s);
            }

            panel.UShortInput[21].UShortValue = room.LightLevel1;
            panel.UShortInput[31].UShortValue = room.TargetTemperature;

            // Envoyer le niveau des 10 circuits d'éclairage
            for (uint i = 0; i < 10; i++)
            {
                panel.UShortInput[71 + i].UShortValue = room.CircuitLevels[i];
            }

            // Envoyer le feedback des scénarios de stores (201 à 204)
            for (uint i = 201; i <= 204; i++)
            {
                panel.BooleanInput[i].BoolValue = (room.ActiveStoreScene == i);
            }

            // Envoyer le feedback des partitions d'alarme (301 à 312)
            for (uint partIdx = 0; partIdx < 4; partIdx++)
            {
                ushort state = room.PartitionStates[partIdx];
                uint baseJoin = 301 + partIdx * 3;
                panel.BooleanInput[baseJoin].BoolValue = (state == 1);
                panel.BooleanInput[baseJoin + 1].BoolValue = (state == 2);
                panel.BooleanInput[baseJoin + 2].BoolValue = (state == 0);
            }

            // Envoyer le feedback du mode vacances global (410 / 411)
            panel.BooleanInput[410].BoolValue = _vacationModeActive;
            panel.BooleanInput[411].BoolValue = !_vacationModeActive;

            double convertedTemp = (double)room.CurrentTemperature / 10.0;
            panel.StringInput[32].StringValue = convertedTemp.ToString("F1");

            // Formatted target temperature for String Join 34
            double convertedTargetTemp = (double)room.TargetTemperature / 10.0;
            panel.StringInput[34].StringValue = convertedTargetTemp.ToString("F1");

            panel.UShortInput[51].UShortValue = room.ActiveVideoSource;
            panel.UShortInput[52].UShortValue = room.AudioVolume;
            panel.BooleanInput[55].BoolValue = room.IsAudioMuted;

            panel.BooleanInput[41].BoolValue = _globalAlarmArmedState;
            panel.BooleanInput[42].BoolValue = !_globalAlarmArmedState;
        }

        private void DispatchIpCommandToSonyTv(int roomId, ushort sourceId)
        {
            string labelSource = "Power Off";
            if (sourceId == 1) labelSource = "Apple TV";
            if (sourceId == 2) labelSource = "Sky Q";
            if (sourceId == 3) labelSource = "Swisscom TV";
            if (sourceId == 4) labelSource = "IPTV";

            CrestronConsole.PrintLine("SONY-IP-DRIVER: [Zone: {0}] -> Commutation IP vers [{1}].",
                _roomsRegistry[roomId].RoomName, labelSource);
        }

        private string FormatIpTable(string rawIpt)
        {
            try
            {
                var lines = rawIpt.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                var formattedLines = new List<string>();
                
                // Add header lines
                formattedLines.Add("IP Table for program 1");
                formattedLines.Add("CIP_ID  Type      Status      DevID  Port   IP Address/SiteName");
                
                foreach (var line in lines)
                {
                    string trimmed = line.Trim();
                    if (string.IsNullOrEmpty(trimmed)) continue;
                    if (trimmed.StartsWith("IP Table") || trimmed.StartsWith("CIP_ID") || trimmed.StartsWith("Total CIP")) continue;
                    
                    var parts = trimmed.Split(new char[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 5)
                    {
                        string id = parts[0];
                        string type = parts[1];
                        string status = parts[2];
                        string port = "";
                        string ip = "";
                        string devId = "";
                        
                        // Check if parts[3] is port or DevID
                        if (parts[3].StartsWith("4179") || parts[3].Length > 2)
                        {
                            port = parts[3];
                            ip = parts[4];
                        }
                        else
                        {
                            devId = parts[3];
                            port = parts[4];
                            ip = parts[5];
                        }
                        
                        // Format clean IP (e.g. 127.000.000.001 => 127.0.0.1 to save space)
                        if (ip.Contains("000") || ip.Contains(".00"))
                        {
                            var octets = ip.Split('.');
                            if (octets.Length == 4)
                            {
                                ip = string.Format("{0}.{1}.{2}.{3}", 
                                    int.Parse(octets[0]), 
                                    int.Parse(octets[1]), 
                                    int.Parse(octets[2]), 
                                    int.Parse(octets[3]));
                            }
                        }
                        
                        // Format the line with fixed widths matching the image
                        string formattedLine = string.Format("{0,6}  {1,-10}{2,-12}{3,-7}{4,-7}{5}", 
                            id, type, status, devId, port, ip);
                        formattedLines.Add(formattedLine);
                    }
                }
                
                string result = string.Join("\n", formattedLines.ToArray());
                if (result.Length > 254)
                {
                    result = result.Substring(0, 254);
                }
                return result;
            }
            catch (Exception ex)
            {
                return "Erreur formatage table IP: " + ex.Message;
            }
        }

        private string FormatConsoleResponse(string rawResponse)
        {
            if (string.IsNullOrEmpty(rawResponse))
                return "Aucune réponse du processeur.";

            // Normalisation des fins de ligne pour forcer des sauts de ligne lisibles (\r -> \r\n)
            string normalized = rawResponse.Replace("\r\n", "\n").Replace("\r", "\n").Replace("\n", "\r\n");

            // Limite à 8000 caractères pour CH5 String Join
            if (normalized.Length > 8000)
            {
                return normalized.Substring(0, 8000) + "\r\n[AFFICHAGE TRONQUÉ À 8000 CARACTÈRES]";
            }
            return normalized;
        }

        private void SavePresetConfig(string jsonPayload)
        {
            try
            {
                CrestronConsole.PrintLine("PRESETS: Received configuration payload on Join 420: {0}", jsonPayload);
                
                // Parse the JSON payload to get the preset name
                var payload = Newtonsoft.Json.Linq.JObject.Parse(jsonPayload);
                string presetName = (string)payload["preset"];
                
                if (string.IsNullOrEmpty(presetName))
                {
                    CrestronConsole.PrintLine("PRESETS ERROR: Preset name is empty in payload.");
                    return;
                }
                
                // Save JSON payload to persistent file in /user/ directory
                string path = string.Format("/user/preset_cfg_{0}.json", presetName);
                System.IO.File.WriteAllText(path, jsonPayload);
                CrestronConsole.PrintLine("PRESETS: Saved preset configuration to persistent file: {0}", path);
            }
            catch (Exception ex)
            {
                ErrorLog.Error("PRESETS ERROR: Fail to save preset configuration: {0}", ex.Message);
            }
        }

        private bool ApplyPreset(string presetName)
        {
            try
            {
                string path = string.Format("/user/preset_cfg_{0}.json", presetName);
                if (!System.IO.File.Exists(path))
                {
                    CrestronConsole.PrintLine("PRESETS: Configuration file '{0}' not found. Falling back to default preset logic.", path);
                    return false;
                }
                
                string jsonContent = System.IO.File.ReadAllText(path);
                var payload = Newtonsoft.Json.Linq.JObject.Parse(jsonContent);
                var data = payload["data"] as Newtonsoft.Json.Linq.JObject;
                if (data == null)
                {
                    CrestronConsole.PrintLine("PRESETS: Configuration data is null in '{0}'. Falling back to default preset logic.", path);
                    return false;
                }
                
                CrestronConsole.PrintLine("PRESETS: Applying customized preset configuration from '{0}'.", path);
                
                if (presetName.StartsWith("light_"))
                {
                    // Format: "data": { "1": { "71": 65535, "72": 32768 }, ... }
                    foreach (var roomProp in data.Properties())
                    {
                        int roomId;
                        if (int.TryParse(roomProp.Name, out roomId) && _roomsRegistry.ContainsKey(roomId))
                        {
                            var roomState = _roomsRegistry[roomId];
                            var circuitsObj = roomProp.Value as Newtonsoft.Json.Linq.JObject;
                            if (circuitsObj != null)
                            {
                                foreach (var circuitProp in circuitsObj.Properties())
                                {
                                    int circuitId;
                                    if (int.TryParse(circuitProp.Name, out circuitId) && circuitId >= 71 && circuitId <= 80)
                                    {
                                        ushort val = (ushort)circuitProp.Value;
                                        roomState.CircuitLevels[circuitId - 71] = val;
                                        
                                        // Update master LightLevel1 if it's the main circuit (Join 71)
                                        if (circuitId == 71)
                                            roomState.LightLevel1 = val;
                                    }
                                }
                            }
                        }
                    }
                    BroadcastFeedbackToAll();
                    return true;
                }
                else if (presetName.StartsWith("shade_"))
                {
                    // Format: "data": { "1": [1, 2, 3], ... }
                    bool isOpening = presetName == "shade_open";
                    foreach (var roomProp in data.Properties())
                    {
                        int roomId;
                        if (int.TryParse(roomProp.Name, out roomId) && _roomsRegistry.ContainsKey(roomId))
                        {
                            var motorsArr = roomProp.Value as Newtonsoft.Json.Linq.JArray;
                            if (motorsArr != null)
                            {
                                foreach (var item in motorsArr)
                                {
                                    int motorId = (int)item;
                                    if (motorId >= 1 && motorId <= 6)
                                    {
                                        uint actionJoin = (uint)(80 + motorId * 3 - (isOpening ? 2 : 0));
                                        foreach (var panel in _touchPanels)
                                        {
                                            panel.BooleanInput[actionJoin].BoolValue = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
                else if (presetName.StartsWith("hvac_"))
                {
                    // Format: "data": { "1": { "temp": 210 }, ... }
                    foreach (var roomProp in data.Properties())
                    {
                        int roomId;
                        if (int.TryParse(roomProp.Name, out roomId) && _roomsRegistry.ContainsKey(roomId))
                        {
                            var roomState = _roomsRegistry[roomId];
                            var tempObj = roomProp.Value as Newtonsoft.Json.Linq.JObject;
                            if (tempObj != null && tempObj["temp"] != null)
                            {
                                ushort targetTemp = (ushort)tempObj["temp"];
                                roomState.TargetTemperature = targetTemp;
                            }
                        }
                    }
                    BroadcastFeedbackToAll();
                    return true;
                }
                else if (presetName == "vacation")
                {
                    // Format: "data": { "light": true, "shade": false, "hvac": true }
                    bool lightOpt = data["light"] != null ? (bool)data["light"] : true;
                    bool shadeOpt = data["shade"] != null ? (bool)data["shade"] : true;
                    bool hvacOpt = data["hvac"] != null ? (bool)data["hvac"] : true;
                    
                    if (lightOpt)
                    {
                        if (!ApplyPreset("light_off"))
                        {
                            // Fallback to default
                            foreach (var rm in _roomsRegistry.Values)
                            {
                                rm.LightLevel1 = 0;
                                for (int i = 0; i < 6; i++) rm.CircuitLevels[i] = 0;
                            }
                        }
                    }
                    
                    if (shadeOpt)
                    {
                        if (!ApplyPreset("shade_close"))
                        {
                            // Fallback to default
                            foreach (var rm in _touchPanels)
                            {
                                for (uint i = 1; i <= 6; i++)
                                {
                                    rm.BooleanInput[80 + i * 3].BoolValue = true;
                                }
                            }
                        }
                    }
                    
                    if (hvacOpt)
                    {
                        if (!ApplyPreset("hvac_horsgel"))
                        {
                            // Fallback to default
                            foreach (var rm in _roomsRegistry.Values) rm.TargetTemperature = 120;
                        }
                    }
                    
                    BroadcastFeedbackToAll();
                    return true;
                }
            }
            catch (Exception ex)
            {
                ErrorLog.Error("PRESETS ERROR: Fail to apply customized preset '{0}': {1}", presetName, ex.Message);
            }
            return false;
        }
    }
}