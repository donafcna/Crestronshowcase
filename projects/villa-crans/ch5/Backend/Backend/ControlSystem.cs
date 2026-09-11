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
        public ushort ActiveVideoSource { get; set; }   // 0 = off, 1..4 = source vidéo (interlock)
        public bool MusicAudio { get; set; }             // true = la musique joue sur les haut-parleurs, la vidéo reste à l'écran (v1.0.166)
        public ushort AudioVolume { get; set; }
        public ushort MediaVolume { get; set; }         // v3 : volume propre au lecteur média (analogique logique 254 = offset +54)
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
            MusicAudio = false;
            AudioVolume = 25000;
            MediaVolume = 25000;                        // v3 : lecteur média indépendant du volume A/V
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

        // Web XPanel "QR code" : un IP-ID par pièce (0x10 + id de pièce, soit 0x11..0x2E pour 30 pièces).
        // Le QR code d'une pièce ouvre https://<CP4>/villaftv/index.html?ipId=0x1N&room=N dans le
        // navigateur du téléphone (voir tools/gen_qr.js). Chaque connexion sur un IP-ID QR est forcée
        // sur sa pièce, de sorte qu'un nouveau scan revient toujours sur la bonne pièce.
        private const uint QrXpanelBaseIpId = 0x10;
        private const int QrXpanelMaxRooms = 30;

        private bool IsQrXpanel(uint ipId)
        {
            return ipId > QrXpanelBaseIpId && ipId <= QrXpanelBaseIpId + QrXpanelMaxRooms;
        }

        /// <summary>Pièce affichée par défaut pour un périphérique : sa pièce dédiée pour un XPanel QR, sinon la 1.</summary>
        private int DefaultRoomForPanel(uint ipId)
        {
            if (IsQrXpanel(ipId))
            {
                int roomId = (int)(ipId - QrXpanelBaseIpId);
                if (_roomsRegistry != null && _roomsRegistry.ContainsKey(roomId)) return roomId;
            }
            return 1;
        }

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
        private const int RoomBlockMaxRoom = 30;   // v3 : contrat.blocsPiecesGui.pieceMax (joins 1000..3998)
        private Dictionary<int, bool> _roomEiscEnabled = new Dictionary<int, bool>();

        // v3 : liste blanche du miroir 1:1 vers l'EISC, construite depuis contrat.signauxGlobaux.
        // Raison : depuis le contrat v3 les panels n'émettent plus les joins de pièce en dessous de
        // 1000 ; recopier aveuglément tout join < 1000 vers le slot 2 enverrait des signaux qui n'ont
        // aucun sens global. Si la configuration est absente, on retombe sur le comportement v2
        // (tout < 1000 est recopié) pour ne jamais couper le pont par accident.
        private Dictionary<uint, bool> _mirrorDigital = new Dictionary<uint, bool>();
        private Dictionary<uint, bool> _mirrorAnalog = new Dictionary<uint, bool>();
        private Dictionary<uint, bool> _mirrorSerial = new Dictionary<uint, bool>();
        private bool _mirrorWhitelistLoaded = false;

        // v3 : validation du code d'alarme (serial 43 / digitaux 44-46).
        // Le code de référence n'est codé en dur NI dans le JavaScript du panel NI ici : il est lu
        // dans contrat.alarme.codeParDefaut. La saisie est d'abord relayée à la vraie centrale via
        // l'EISC (serial 43) ; le C# ne tranche localement que si le slot 2 n'a pas répondu dans le
        // délai contrat.alarme.delaiReponseCentraleMs (le GUI, lui, abandonne à 2500 ms).
        private const uint AlarmCodeEntryJoin = 43;   // serial, entrée
        private const uint AlarmCodeOkJoin = 44;      // digital, sortie (impulsion)
        private const uint AlarmCodeKoJoin = 45;      // digital, sortie (impulsion)
        private const uint AlarmCodeClearJoin = 46;   // digital, entrée
        private string _alarmReferenceCode = "";
        private int _alarmPanelReplyMs = 1200;
        private string _alarmPendingCode = "";
        private bool _alarmVerdictPending = false;
        private CTimer _alarmCodeTimer = null;
        private BasicTriList _alarmCodeRequester = null;   // v3 : panel qui a saisi le code (le verdict ne va qu'à lui)

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
                // v3 / P1-1 : sous try/catch. Un villa_config.json mal typé (id ou intersystem non
                // numérique / non booléen) levait ici et remontait au catch global : aucun panel
                // n'était alors enregistré et le système devenait inutilisable. Le repli historique
                // garantit désormais un registre exploitable quoi qu'il arrive.
                try
                {
                    BuildVillaRoomsDatabase();
                }
                catch (Exception exRooms)
                {
                    ErrorLog.Error("CONFIG: Échec de construction du registre des pièces ({0}) - repli sur la liste historique.", exRooms.Message);
                    _roomsRegistry = null;
                }
                if (_roomsRegistry == null || _roomsRegistry.Count == 0)
                    BuildFallbackRoomsDatabase();

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

                // 3b. Web XPanel "QR code" : un XpanelForHtml5 par pièce de villa_config.json (IP-ID 0x10 + id).
                //     Le CP4 n'accepte qu'un client par IP-ID : un téléphone actif par pièce, le nouveau scan remplace l'ancien.
                //     Les IP-ID doivent aussi exister dans la table IP du CP4 (créés automatiquement par Register()).
                var qrRoomIds = new List<int>(_roomsRegistry.Keys);
                qrRoomIds.Sort();
                foreach (int roomKey in qrRoomIds)
                {
                    if (roomKey < 1 || roomKey > QrXpanelMaxRooms) continue;
                    uint qrIpId = QrXpanelBaseIpId + (uint)roomKey;
                    RegisterUserInterface(new XpanelForHtml5(qrIpId, this));
                }

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
                    int defaultRoom = DefaultRoomForPanel(panel.ID);
                    _activeRoomPerDevice[panel.ID] = defaultRoom;
                    UpdateScreenStateForPanel(panel, defaultRoom);
                }

                // v3 : premier remplissage des blocs de joins de toutes les pièces (1000 + (id-1)*100),
                // sur lesquels les panels et le slot 2 s'abonnent désormais pour tout l'état de pièce.
                PushAllRoomsFeedback();
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

                // v3 : liste blanche du miroir EISC + code d'alarme de référence, tous deux lus
                // dans le contrat et jamais codés en dur dans le programme.
                BuildGlobalMirrorWhitelist();
                LoadAlarmReferenceCode();
            }
            catch (Exception ex)
            {
                _villaConfig = null;
                _configChunks.Clear();
                ErrorLog.Error("CONFIG: Échec de lecture de villa_config.json : {0}", ex.Message);
            }
        }

        /// <summary>
        /// v3 : construit la liste blanche des joins réellement globaux à partir de
        /// contrat.signauxGlobaux. Seuls ces joins (< 1000) sont encore recopiés 1:1 vers l'EISC ;
        /// tout le pilotage de pièce passe désormais par les blocs >= 1000.
        /// </summary>
        private void BuildGlobalMirrorWhitelist()
        {
            _mirrorDigital.Clear();
            _mirrorAnalog.Clear();
            _mirrorSerial.Clear();
            _mirrorWhitelistLoaded = false;
            try
            {
                if (_villaConfig == null || _villaConfig["contrat"] == null) return;
                var liste = _villaConfig["contrat"]["signauxGlobaux"] as Newtonsoft.Json.Linq.JArray;
                if (liste == null) return;

                foreach (var sig in liste)
                {
                    try
                    {
                        string type = sig["type"] != null ? (string)sig["type"] : "";
                        Dictionary<uint, bool> cible = null;
                        if (type == "digital") cible = _mirrorDigital;
                        else if (type == "analog") cible = _mirrorAnalog;
                        else if (type == "serial") cible = _mirrorSerial;
                        if (cible == null) continue;

                        uint debut;
                        int nombre = 1;
                        if (sig["joinDebut"] != null)
                        {
                            debut = (uint)(int)sig["joinDebut"];
                            if (sig["nombre"] != null) nombre = (int)sig["nombre"];
                        }
                        else if (sig["join"] != null)
                        {
                            debut = (uint)(int)sig["join"];
                        }
                        else continue;

                        for (int i = 0; i < nombre; i++)
                        {
                            uint j = debut + (uint)i;
                            if (j < RoomBlockBase) cible[j] = true;
                        }
                    }
                    catch { /* une entrée mal typée ne doit pas invalider toute la liste */ }
                }

                _mirrorWhitelistLoaded = (_mirrorDigital.Count + _mirrorAnalog.Count + _mirrorSerial.Count) > 0;
                CrestronConsole.PrintLine("EISC: Liste blanche du miroir global chargée ({0} digitaux, {1} analogiques, {2} sériels).",
                    _mirrorDigital.Count, _mirrorAnalog.Count, _mirrorSerial.Count);
            }
            catch (Exception ex)
            {
                _mirrorWhitelistLoaded = false;
                ErrorLog.Notice("Notice: EISC: liste blanche du miroir illisible ({0}) - miroir v2 conservé.", ex.Message);
            }
        }

        /// <summary>
        /// v3 : lit le code d'alarme de référence dans contrat.alarme. Choix documenté : la validation
        /// appartient à la vraie centrale (slot 2), le C# ne garde ce code que comme repli hors ligne.
        /// Si le champ est absent ou vide, aucune validation locale n'est possible (tout est refusé) :
        /// mieux vaut un pavé inopérant qu'un code en dur dans le programme.
        /// </summary>
        private void LoadAlarmReferenceCode()
        {
            try
            {
                if (_villaConfig == null || _villaConfig["contrat"] == null) return;
                var alarme = _villaConfig["contrat"]["alarme"];
                if (alarme == null)
                {
                    ErrorLog.Notice("Notice: ALARME: contrat.alarme absent de villa_config.json - aucune validation locale possible.");
                    return;
                }
                if (alarme["codeParDefaut"] != null) _alarmReferenceCode = ((string)alarme["codeParDefaut"]).Trim();
                if (alarme["delaiReponseCentraleMs"] != null)
                {
                    int delai = (int)alarme["delaiReponseCentraleMs"];
                    // Le GUI abandonne à 2500 ms : le repli local doit trancher avant.
                    if (delai >= 200 && delai <= 2200) _alarmPanelReplyMs = delai;
                }
                CrestronConsole.PrintLine("ALARME: code de référence {0} (repli local après {1} ms sans réponse du slot 2).",
                    string.IsNullOrEmpty(_alarmReferenceCode) ? "non configuré" : "chargé depuis la configuration", _alarmPanelReplyMs);
            }
            catch (Exception ex)
            {
                ErrorLog.Notice("Notice: ALARME: lecture de contrat.alarme impossible : {0}", ex.Message);
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
        /// Réplique un signal brut d'un panel vers l'EISC du slot 2.
        /// v3 : passe-plat intégral au-dessus de 1000 (les blocs GUI par pièce portent les mêmes
        /// numéros que les blocs EISC), liste blanche contrat.signauxGlobaux en dessous.
        /// </summary>
        private void MirrorSignalToEisc(BasicTriList sourceDevice, SigEventArgs args)
        {
            if (_eisc == null || sourceDevice == _eisc) return;
            uint joinRaw = args.Sig.Number;

            if (joinRaw >= RoomBlockBase)
            {
                // v3 : les blocs GUI par pièce portent exactement les mêmes numéros que les blocs
                // EISC. Le pont est donc un simple passe-plat : aucun recalcul, aucune corrélation
                // avec la pièce active. Seul le flag 'intersystem' de la pièce filtre encore.
                int roomOfJoin = (int)((joinRaw - RoomBlockBase) / RoomBlockSize) + 1;
                if (roomOfJoin < 1 || roomOfJoin > RoomBlockMaxRoom) return;
                if (!_roomEiscEnabled.ContainsKey(roomOfJoin) || !_roomEiscEnabled[roomOfJoin]) return;
            }
            else if (args.Sig.Type == eSigType.String && joinRaw == AlarmCodeEntryJoin)
            {
                // v3 : le code d'alarme est relayé explicitement par ProcessAlarmCodeEntry
                // (purge du sériel avant écriture), pas par le miroir générique.
                return;
            }
            else if (!IsGlobalMirrorSignal(args.Sig.Type, joinRaw))
            {
                // v3 : join < 1000 hors contrat.signauxGlobaux -> plus recopié aveuglément.
                return;
            }

            try
            {
                uint join = joinRaw;
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
        /// v3 : vrai si le join (< 1000) figure dans contrat.signauxGlobaux pour ce type de signal.
        /// Tant que la liste blanche n'a pas pu être chargée, on conserve le comportement v2
        /// (tout est recopié) : le pont ne doit jamais tomber à cause d'une configuration manquante.
        /// </summary>
        private bool IsGlobalMirrorSignal(eSigType type, uint join)
        {
            if (!_mirrorWhitelistLoaded) return true;
            if (type == eSigType.Bool) return _mirrorDigital.ContainsKey(join);
            if (type == eSigType.UShort) return _mirrorAnalog.ContainsKey(join);
            if (type == eSigType.String) return _mirrorSerial.ContainsKey(join);
            return false;
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
                    if (IsQrXpanel(panel.ID))
                    {
                        // Connexion par QR code : toujours repartir sur la pièce dédiée à cet IP-ID,
                        // même si l'utilisateur précédent avait navigué ailleurs.
                        roomId = DefaultRoomForPanel(panel.ID);
                        _activeRoomPerDevice[panel.ID] = roomId;
                        CrestronConsole.PrintLine("QR-XPANEL: IP-ID {0:X2} forcé sur la pièce {1}.", panel.ID, roomId);
                    }
                    UpdateScreenStateForPanel(panel, roomId);

                    // v3 : un panel ne s'abonne qu'aux joins de sa pièce, mais il peut naviguer :
                    // on republie l'état de TOUTES les pièces sur leurs blocs respectifs à chaque
                    // arrivée (panel ou slot 2). Opération rare, coût négligeable.
                    PushAllRoomsFeedback();

                    // Publie l'empreinte de la configuration : le panel demandera le transfert
                    // complet (Digital 250) uniquement si son cache diffère.
                    if (panel != _eisc)
                        panel.StringInput[ConfigHashJoin].StringValue = _configHash;

                    // Informe le nouvel arrivant de la pièce affichée par la dalle principale
                    panel.UShortInput[TswRoomBroadcastJoin].UShortValue = _tswActiveRoom;

                    // ... et du volume matériel courant de la dalle (page Vidéo)
                    panel.UShortInput[TswVolumeJoin].UShortValue = _tswVolPct;
                    panel.BooleanInput[TswMuteJoin].BoolValue = _tswVolMuted;
                }
            }
        }

        // --- MÉTHODES DE RETOUR D'ÉTATS (FEEDBACK) PAR PIÈCE ---

        // v3 : les feedbacks de pièce ne dépendent plus du panel qui regarde. Toute l'information
        // d'une pièce est écrite sur SON bloc (RoomBlockStart(roomId) + offset) pour tous les
        // périphériques : un panel ne s'abonne qu'aux joins de la pièce qu'il affiche.
        // Les anciennes méthodes SendFeedbackBool/UShort/StringToRoom, qui ciblaient les panels
        // « dont la pièce active correspond », ont disparu : elles étaient la cause du bug de
        // conception (deux supports sur deux pièces écrasaient les mêmes joins).

        // v3 : BroadcastFeedbackToRoom a disparu, remplacée par PushRoomFeedback (même rôle, mais
        // écriture sur le bloc de la pièce pour tous les périphériques).

        private void BroadcastFeedbackToAll()
        {
            // Partie globale de l'écran (nom de pièce, sélection, alarme centrale, vacances...)
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID))
                    UpdateScreenStateForPanel(panel, _activeRoomPerDevice[panel.ID]);
            }
            PushAllRoomsFeedback();
        }

        /// <summary>
        /// v3 : impulsion d'un digital global. Si un panel est précisé, lui seul la reçoit (cas du
        /// verdict de code d'alarme : les autres écrans ne doivent pas changer de page) ; sinon
        /// tous les panels la reçoivent. L'EISC est exclu, il est servi par le miroir.
        /// </summary>
        private void PulseGlobalDigitalToPanels(uint joinNumber, BasicTriList target)
        {
            if (target != null && target != _eisc)
            {
                target.BooleanInput[joinNumber].BoolValue = true;
                target.BooleanInput[joinNumber].BoolValue = false;
                return;
            }
            if (_touchPanels == null) return;
            foreach (var panel in _touchPanels)
            {
                if (panel == _eisc) continue;
                panel.BooleanInput[joinNumber].BoolValue = true;
                panel.BooleanInput[joinNumber].BoolValue = false;
            }
        }

        /// <summary>
        /// v3 / P1-2 : impulsion sur un join du bloc d'une pièce (stores groupés +1..+9,
        /// moteurs +61..+78). Le join est systématiquement remis à false : une impulsion qui
        /// restait haute bloquait le moteur côté SIMPL.
        /// </summary>
        private void PulseRoomDigital(int roomId, uint offset)
        {
            if (_touchPanels == null) return;
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId)) return;
            bool eiscEnabled = _roomEiscEnabled.ContainsKey(roomId) && _roomEiscEnabled[roomId];
            uint join = RoomBlockStart(roomId) + offset;
            foreach (var dev in _touchPanels)
            {
                if (dev == _eisc && !eiscEnabled) continue;
                dev.BooleanInput[join].BoolValue = true;
                dev.BooleanInput[join].BoolValue = false;
            }
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
                    // v3 / P1-1 : chaque pièce est lue isolément. Une entrée mal typée est signalée
                    // et ignorée, elle ne fait plus tomber la construction complète du registre.
                    try
                    {
                        int id = piece["id"] != null ? (int)piece["id"] : (_roomsRegistry.Count + 1);
                        if (id < 1 || id > RoomBlockMaxRoom)
                        {
                            ErrorLog.Notice("CONFIG: Pièce d'id {0} hors plage 1..{1} - ignorée.", id, RoomBlockMaxRoom);
                            continue;
                        }
                        string nom = piece["nom"] != null ? (string)piece["nom"] : ("Pièce " + id);
                        if (!_roomsRegistry.ContainsKey(id))
                            _roomsRegistry.Add(id, new RoomState(id, nom));

                        // Flag 'intersystem' : expose (ou non) le bloc EISC de cette pièce vers le slot 2
                        bool eiscOn = piece["intersystem"] == null || (bool)piece["intersystem"];
                        _roomEiscEnabled[id] = eiscOn;
                        if (eiscOn) eiscExposed++;
                    }
                    catch (Exception exPiece)
                    {
                        ErrorLog.Notice("CONFIG: Pièce ignorée (JSON mal typé) : {0}", exPiece.Message);
                    }
                }
                if (_roomsRegistry.Count > 0)
                {
                    CrestronConsole.PrintLine("CONFIG: Registre construit depuis villa_config.json : {0} pièces ({1} exposées en intersystem).",
                        _roomsRegistry.Count, eiscExposed);
                    return;
                }
                ErrorLog.Error("CONFIG: Aucune pièce exploitable dans villa_config.json - repli sur la liste historique.");
            }

            BuildFallbackRoomsDatabase();
        }

        /// <summary>
        /// v3 / P1-1 : repli historique, utilisable aussi bien quand aucune configuration n'est
        /// chargée que lorsque la lecture de villa_config.json a échoué.
        /// </summary>
        private void BuildFallbackRoomsDatabase()
        {
            if (_roomsRegistry == null) _roomsRegistry = new Dictionary<int, RoomState>();

            string[] roomNames = {
                "Salon", "Cuisine", "Salle à Manger", "Suite Parentale", "Chambre 1",
                "Chambre 2", "Bureau", "Home Cinéma", "Terrasse extrieure", "Espace SPA / Piscine"
            };

            for (int i = 1; i <= 10; i++)
            {
                if (!_roomsRegistry.ContainsKey(i))
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
        /// v3 / P1-2 : commande globale des 6 moteurs de toutes les pièces (Monter = offset +61+3n,
        /// Descendre = offset +63+3n). Remplace les anciennes boucles qui écrivaient sur la plage
        /// d'ENTRÉE panel 81-98 sans jamais repasser à false.
        /// </summary>
        private void PulseAllMotorsInAllRooms(bool opening)
        {
            if (_roomsRegistry == null) return;
            foreach (var id in _roomsRegistry.Keys)
            {
                for (uint m = 0; m < 6; m++)
                    PulseRoomDigital(id, (opening ? (uint)61 : (uint)63) + m * 3);
            }
        }

        /// <summary>
        /// v3 : pousse l'état complet d'une pièce sur SON bloc de joins (base = 1000 + (id-1)*100),
        /// vers TOUS les périphériques : panels (dalle, iPad, iPhone, XPanel) et EISC du slot 2.
        /// Les panels ne s'abonnent qu'aux joins de la pièce qu'ils affichent, il n'y a donc plus
        /// aucune logique « quel panel regarde quoi » dans le feedback. Le flag 'intersystem' ne
        /// filtre que le slot 2 (limitation du nombre de signaux à monitorer dans le debugger SIMPL).
        /// </summary>
        private void PushRoomFeedback(int roomId)
        {
            if (_touchPanels == null) return;
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId)) return;
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
                    dev.BooleanInput[b + 45].BoolValue = (room.ActiveVideoSource == 0 && !room.MusicAudio); // v3 : AV.Extinction (join logique 200)
                    dev.BooleanInput[b + 50].BoolValue = room.IsAudioMuted;
                    for (uint s = 0; s < 5; s++)
                        dev.BooleanInput[b + 51 + s].BoolValue = (room.ActiveVideoSource == s);
                    dev.BooleanInput[b + 56].BoolValue = room.MusicAudio;    // musique sur les haut-parleurs
                    dev.BooleanInput[b + 57].BoolValue = !room.MusicAudio;   // audio = source vidéo
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
                    dev.UShortInput[b + 53].UShortValue = room.MusicAudio ? (ushort)5 : room.ActiveVideoSource; // source audio
                    dev.UShortInput[b + 54].UShortValue = room.MediaVolume; // v3 : Media.Volume (join logique 254)
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

        private void PushAllRoomsFeedback()
        {
            if (_roomsRegistry == null) return;
            foreach (var id in _roomsRegistry.Keys)
                PushRoomFeedback(id);
        }

        /// <summary>
        /// v3 : point d'entrée UNIQUE des joins >= 1000, qu'ils viennent du programme SIMPL du
        /// slot 2 ou d'un panel (depuis le contrat v3 la GUI émet elle aussi sur le bloc de la
        /// pièce affichée : joinPhysique = 1000 + (pieceId - 1) * 100 + offset). La pièce est donc
        /// portée par le join lui-même, plus jamais par _activeRoomPerDevice.
        /// </summary>
        private void ProcessRoomBlockSignal(BasicTriList sourceDevice, SigEventArgs args)
        {
            uint join = args.Sig.Number;
            int roomId = (int)((join - RoomBlockBase) / RoomBlockSize) + 1;   // v3 : décodage de la pièce
            uint offset = (join - RoomBlockBase) % RoomBlockSize;             // v3 : décodage de l'offset
            // P1-6 : borne de routage cohérente avec le décodage. Au-delà de la dernière pièce
            // possible (contrat.blocsPiecesGui.pieceMax) on est dans les joins réservés firmware.
            if (roomId < 1 || roomId > RoomBlockMaxRoom) return;
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId)) return;
            // Le flag 'intersystem' ne restreint que le slot 2 ; les panels pilotent toutes les pièces
            if (sourceDevice == _eisc && (!_roomEiscEnabled.ContainsKey(roomId) || !_roomEiscEnabled[roomId])) return;

            if (args.Sig.Type == eSigType.Bool)
            {
                if (!args.Sig.BoolValue) return; // front montant uniquement
                ApplyRoomDigitalCommand(roomId, offset, sourceDevice);
            }
            else if (args.Sig.Type == eSigType.UShort)
            {
                ApplyRoomAnalogCommand(roomId, offset, args.Sig.UShortValue);
            }
        }

        /// <summary>
        /// v3 : logique métier digitale d'une pièce, exprimée en offsets de bloc
        /// (table contrat.blocsPiecesGui.mapping). Appelée pour les commandes du slot 2 comme pour
        /// celles des panels : une seule implémentation, plus de duplication join logique / offset.
        /// </summary>
        private void ApplyRoomDigitalCommand(int roomId, uint offset, BasicTriList sourceDevice)
        {
            RoomState room = _roomsRegistry[roomId];
            CrestronConsole.PrintLine("[BLOC PIECE] IP-ID {0:X2} -> Pièce {1}, commande digitale offset {2}",
                sourceDevice != null ? sourceDevice.ID : (uint)0, roomId, offset);

            // v3 : impulsions sans état côté C# (stores groupés +1..+9 = joins logiques 61-69,
            // transport média +58..+60 = joins logiques 251-253, moteurs +61..+78 = joins 81-98).
            // Le relais vers le slot 2 est déjà assuré par le passe-plat de MirrorSignalToEisc :
            // il n'y a plus d'écho à fabriquer ici (c'est lui qui laissait les joins moteurs hauts).
            if ((offset >= 1 && offset <= 9) || (offset >= 58 && offset <= 78))
            {
                CrestronConsole.PrintLine("MOTEURS/MEDIA: impulsion offset {0} pièce {1} relayée au slot 2.", offset, roomId);
                return;
            }

            if (offset >= 21 && offset <= 24)          // Scènes d'éclairage 1..4 (joins logiques 51-54)
            {
                uint sceneIdx = offset - 20;
                room.ActiveScene = (ushort)sceneIdx;
                if (sceneIdx == 1) room.LightLevel1 = 0;
                if (sceneIdx == 2) room.LightLevel1 = 19660;
                if (sceneIdx == 3) room.LightLevel1 = 45875;
                if (sceneIdx == 4) room.LightLevel1 = 65535;
            }
            else if (offset == 35)                      // Consigne + (join logique 49)
                room.TargetTemperature = (ushort)Math.Min(280, room.TargetTemperature + 5);
            else if (offset == 36)                      // Consigne - (join logique 50)
                room.TargetTemperature = (ushort)Math.Max(160, room.TargetTemperature - 5);
            else if (offset >= 41 && offset <= 44)      // Scènes de stores (joins logiques 201-204)
                room.ActiveStoreScene = (ushort)(201 + (offset - 41));
            else if (offset == 45)                      // v3 : extinction A/V complète (join logique 200)
            {
                room.ActiveVideoSource = 0;
                room.MusicAudio = false;
                DispatchIpCommandToSonyTv(roomId, 0);
                DispatchAudioRouting(roomId);
            }
            else if (offset == 50)                      // Mute toggle (join logique 55)
                room.IsAudioMuted = !room.IsAudioMuted;
            else if (offset >= 51 && offset <= 55)      // Source vidéo en interlock (+51 = OFF, joins logiques 150-154)
            {
                room.ActiveVideoSource = (ushort)(offset - 51);
                if (room.ActiveVideoSource == 0) room.MusicAudio = false;
                DispatchIpCommandToSonyTv(roomId, room.ActiveVideoSource);
                DispatchAudioRouting(roomId);
            }
            else if (offset == 56)                      // Musique sur les haut-parleurs (join logique 155)
            {
                room.MusicAudio = true;
                DispatchAudioRouting(roomId);
            }
            else if (offset == 57)                      // L'audio revient à la source vidéo (join logique 156)
            {
                room.MusicAudio = false;
                DispatchAudioRouting(roomId);
            }
            else if (offset >= 81 && offset <= 92)      // Partitions d'alarme (joins logiques 301-312)
            {
                uint partIdx = (offset - 81) / 3;
                uint actionType = (offset - 81) % 3;
                ApplyAlarmPartition(partIdx, actionType);
                BroadcastFeedbackToAll();               // les partitions sont communes à toute la villa
                return;
            }
            else return;

            PushRoomFeedback(roomId);
        }

        /// <summary>
        /// v3 : logique métier analogique d'une pièce, exprimée en offsets de bloc.
        /// </summary>
        private void ApplyRoomAnalogCommand(int roomId, uint offset, ushort val)
        {
            RoomState room = _roomsRegistry[roomId];

            if (offset == 21) room.LightLevel1 = val;                        // join logique 21
            else if (offset == 31) room.TargetTemperature = val;             // join logique 31
            else if (offset == 51) { room.ActiveVideoSource = val; DispatchIpCommandToSonyTv(roomId, val); } // join logique 51
            else if (offset == 52) room.AudioVolume = val;                   // join logique 52
            else if (offset == 53)
            {
                // v3 : AV.SourceAudio (join logique 53) n'avait aucune entrée : impossible de choisir
                // la source audio depuis le GUI. 5 = musique, 0..4 = l'audio suit la source vidéo.
                room.MusicAudio = (val == 5);
                DispatchAudioRouting(roomId);
            }
            else if (offset == 54) room.MediaVolume = val;                   // v3 : Media.Volume (join logique 254)
            else if (offset >= 71 && offset <= 80) room.CircuitLevels[offset - 71] = val; // joins logiques 71-80
            else return;

            CrestronConsole.PrintLine("[BLOC PIECE] Pièce {0} - valeur analogique offset {1} = {2}", roomId, offset, val);
            PushRoomFeedback(roomId);
        }

        /// <summary>
        /// v3 : les partitions d'alarme 1..4 sont communes à toute la villa
        /// (contrat.blocsPiecesGui.exceptionsGlobales) : l'état est appliqué à toutes les pièces,
        /// de sorte que chaque bloc EISC et chaque panel affichent la même chose.
        /// </summary>
        private void ApplyAlarmPartition(uint partIdx, uint actionType)
        {
            if (partIdx > 3 || _roomsRegistry == null) return;
            ushort newState = (ushort)(actionType == 0 ? 1 : (actionType == 1 ? 2 : 0));
            foreach (var rm in _roomsRegistry.Values)
                rm.PartitionStates[partIdx] = newState;
            CrestronConsole.PrintLine("SÉCURITÉ: Partition {0} de la villa passée à l'état {1}", partIdx + 1, newState);
        }

        // --- v3 : VALIDATION DU CODE D'ALARME (sériel 43, digitaux 44 / 45 / 46) ---
        // Choix documenté : le code de référence n'est codé en dur nulle part. La saisie part
        // d'abord à la vraie centrale, via l'EISC du slot 2 (sériel 43) ; c'est elle qui répond par
        // une impulsion sur le digital 44 (accepté) ou 45 (refusé). Le C# ne tranche en local
        // (contrat.alarme.codeParDefaut) que si le slot 2 n'a pas répondu dans le délai imparti,
        // afin que le pavé reste utilisable quand le programme SIMPL est arrêté ou non chargé.
        // Le GUI abandonne de son côté à 2500 ms : le repli local tranche donc toujours avant.

        private void StopAlarmCodeTimer()
        {
            if (_alarmCodeTimer != null)
            {
                try { _alarmCodeTimer.Stop(); }
                catch { /* arrêt best-effort */ }
                _alarmCodeTimer = null;
            }
        }

        private void ProcessAlarmCodeEntry(BasicTriList sourceDevice, string code)
        {
            if (sourceDevice == _eisc) return;      // la centrale ne se valide pas elle-même
            StopAlarmCodeTimer();
            _alarmPendingCode = code == null ? "" : code.Trim();
            _alarmVerdictPending = true;
            _alarmCodeRequester = sourceDevice;

            if (_eisc != null)
            {
                // Purge puis écriture : un sériel réécrit à la même valeur n'émet pas d'événement,
                // deux saisies identiques successives resteraient sans verdict côté slot 2.
                try
                {
                    _eisc.StringInput[AlarmCodeEntryJoin].StringValue = "";
                    _eisc.StringInput[AlarmCodeEntryJoin].StringValue = _alarmPendingCode;
                }
                catch { /* relais best-effort */ }
            }
            CrestronConsole.PrintLine("ALARME: code reçu de l'IP-ID {0:X2}, relayé à la centrale (attente {1} ms).",
                sourceDevice != null ? sourceDevice.ID : (uint)0, _alarmPanelReplyMs);
            _alarmCodeTimer = new CTimer(OnAlarmCodeTimeout, (long)_alarmPanelReplyMs);
        }

        private void OnAlarmCodeTimeout(object userSpecific)
        {
            try
            {
                if (!_alarmVerdictPending) return;
                _alarmVerdictPending = false;
                bool accepte = !string.IsNullOrEmpty(_alarmReferenceCode) && _alarmPendingCode == _alarmReferenceCode;
                _alarmPendingCode = "";
                CrestronConsole.PrintLine("ALARME: aucun verdict du slot 2 - validation locale : {0}.", accepte ? "ACCEPTÉ" : "REFUSÉ");
                PulseGlobalDigitalToPanels(accepte ? AlarmCodeOkJoin : AlarmCodeKoJoin, _alarmCodeRequester);
                _alarmCodeRequester = null;
            }
            catch (Exception ex)
            {
                ErrorLog.Notice("Notice: ALARME: échec du repli local de validation : {0}", ex.Message);
            }
            finally
            {
                _alarmCodeTimer = null;
            }
        }

        /// <summary>v3 : verdict reçu de la centrale (slot 2) sur le digital 44 ou 45.</summary>
        private void OnAlarmCodeVerdictFromPanelSystem(bool accepte)
        {
            StopAlarmCodeTimer();
            _alarmVerdictPending = false;
            _alarmPendingCode = "";
            CrestronConsole.PrintLine("ALARME: verdict de la centrale (slot 2) : {0}.", accepte ? "ACCEPTÉ" : "REFUSÉ");
            PulseGlobalDigitalToPanels(accepte ? AlarmCodeOkJoin : AlarmCodeKoJoin, _alarmCodeRequester);
            _alarmCodeRequester = null;
        }

        private void OnTouchPanelSignalReceived(BasicTriList currentDevice, SigEventArgs args)
        {
            ushort joinNumber = (ushort)args.Sig.Number;

            if (!_activeRoomPerDevice.ContainsKey(currentDevice.ID))
                _activeRoomPerDevice[currentDevice.ID] = DefaultRoomForPanel(currentDevice.ID);

            // Miroir intersystem : passe-plat pour les blocs pièces (>= 1000, mêmes numéros de join
            // des deux côtés depuis le contrat v3), liste blanche contrat.signauxGlobaux en dessous.
            MirrorSignalToEisc(currentDevice, args);

            // v3 : commandes sur les blocs pièces (joins >= 1000). Elles viennent désormais aussi
            // bien du slot 2 que des panels : depuis le contrat v3 la GUI émet sur le bloc de la
            // pièce qu'elle affiche, la pièce est donc portée par le join et non plus par
            // _activeRoomPerDevice. Les joins réservés firmware (ex : 29731) tombent hors plage.
            if (args.Sig.Number >= RoomBlockBase)
            {
                ProcessRoomBlockSignal(currentDevice, args);
                return;
            }

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
                    // v3 : le sériel 43 transporte un code d'alarme, il ne doit jamais apparaître en clair dans le journal.
                    if (joinNumber == AlarmCodeEntryJoin)
                        CrestronConsole.PrintLine("[JS CONSOLE] IP-ID {0:X2} (Join {1}): [code masqué]", currentDevice.ID, joinNumber);
                    else
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
                    else if (joinNumber == AlarmCodeEntryJoin)
                    {
                        // v3 : code d'alarme saisi sur le pavé du GUI (sériel 43). Il n'est plus
                        // comparé dans le JavaScript du panel : c'est la centrale du slot 2 qui tranche.
                        ProcessAlarmCodeEntry(currentDevice, args.Sig.StringValue);
                    }
                    else if (joinNumber == 420)
                    {
                        SavePresetConfig(args.Sig.StringValue);
                    }
                    break;
            }
        }

        /// <summary>
        /// v3 : ne traite plus QUE les joins réellement globaux (< 1000, contrat.signauxGlobaux).
        /// Tout le pilotage de pièce (éclairage, CVC, stores, moteurs, A/V, média) est arrivé sur le
        /// bloc de la pièce concernée et a été traité par ApplyRoomDigitalCommand : aucun de ces
        /// joins ne dépend plus de _activeRoomPerDevice, deux supports sur deux pièces différentes
        /// ne peuvent plus s'écraser mutuellement.
        /// </summary>
        private void ProcessDigitalSignal(BasicTriList currentDevice, ushort joinNumber)
        {
            // P1-4 : plus d'indexation nue de _activeRoomPerDevice / _roomsRegistry ici. La pièce
            // n'est utilisée que pour le journal et pour le suivi de la dalle (analogique 240).
            int activeRoomId = _activeRoomPerDevice.ContainsKey(currentDevice.ID)
                ? _activeRoomPerDevice[currentDevice.ID]
                : DefaultRoomForPanel(currentDevice.ID);

            // Filtre de journal : au-delà de 3000 il n'y a que des joins réservés firmware (capteurs,
            // extenders de la dalle) - ils sont ignorés par le programme, inutile de les tracer.
            if (joinNumber <= 3000)
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Digital Join {2}", currentDevice.ID, activeRoomId, joinNumber);

            // Rooms Navigation (Digital 11 à 40 : jusqu'à 30 pièces, contrat v2)
            if (joinNumber >= 11 && joinNumber <= 40)
            {
                int roomSelected = joinNumber - 10;
                if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomSelected)) return; // P1-4
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

            // v3 : les joins de pilotage de pièce (200 extinction A/V, 150-156 sources, 51-54 scènes
            // d'éclairage, 49/50 consigne, 55 mute, 61-69 stores groupés, 81-98 moteurs, 201-204
            // scènes de stores, 251-253 transport média) ne transitent plus par ici : la GUI les
            // émet sur le bloc de la pièce affichée (>= 1000) et ApplyRoomDigitalCommand les traite.

            switch (joinNumber)
            {
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

                case (ushort)AlarmCodeOkJoin: // v3 : verdict « code accepté » émis par la centrale du slot 2
                    if (currentDevice == _eisc) OnAlarmCodeVerdictFromPanelSystem(true);
                    break;

                case (ushort)AlarmCodeKoJoin: // v3 : verdict « code refusé » émis par la centrale du slot 2
                    if (currentDevice == _eisc) OnAlarmCodeVerdictFromPanelSystem(false);
                    break;

                case (ushort)AlarmCodeClearJoin: // v3 : touche C du pavé - abandon de la saisie en cours
                    StopAlarmCodeTimer();
                    _alarmVerdictPending = false;
                    _alarmPendingCode = "";
                    _alarmCodeRequester = null;
                    CrestronConsole.PrintLine("ALARME: saisie effacée par l'IP-ID {0:X2}.", currentDevice.ID);
                    break;

                case (ushort)TswMuteJoin: // Bascule mute du volume matériel de la dalle TSW (page Vidéo)
                    CrestronConsole.PrintLine("VOLUME DALLE: bascule mute demandée par IP-ID {0:X2}.", currentDevice.ID);
                    ToggleTswMute();
                    break;

                // Partitions d'alarme (joins 301 à 312) - v3 : exception globale assumée du contrat,
                // les 4 partitions sont communes à toute la villa (et non plus à la pièce affichée).
                case 301: case 302: case 303:
                case 304: case 305: case 306:
                case 307: case 308: case 309:
                case 310: case 311: case 312:
                    ApplyAlarmPartition((uint)((joinNumber - 301) / 3), (uint)((joinNumber - 301) % 3));
                    BroadcastFeedbackToAll();
                    break;

                // Commandes globales de la maison (joins 401 à 411)
                case 401:
                    CrestronConsole.PrintLine("GLOBAL: Éclairage Global - Tout Allumer demandé.");
                    if (!ApplyPreset("light_all"))
                    {
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.LightLevel1 = 65535;
                            for (int i = 0; i < 10; i++) rm.CircuitLevels[i] = 65535; // P1-3 : 10 circuits, pas 6
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
                            for (int i = 0; i < 10; i++) rm.CircuitLevels[i] = 0; // P1-3 : 10 circuits, pas 6
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
                        PulseAllMotorsInAllRooms(true);   // v3 / P1-2 : impulsion propre sur le bloc de CHAQUE pièce
                    break;

                case 405:
                    CrestronConsole.PrintLine("GLOBAL: Stores Globaux - Tout Fermer demandé.");
                    if (!ApplyPreset("shade_close"))
                        PulseAllMotorsInAllRooms(false);  // v3 / P1-2 : idem, et remise à false garantie
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
                        foreach (var rm in _roomsRegistry.Values)
                        {
                            rm.TargetTemperature = 120;
                            rm.LightLevel1 = 0;
                            for (int i = 0; i < 10; i++) rm.CircuitLevels[i] = 0; // P1-3 : 10 circuits, pas 6
                        }
                        PulseAllMotorsInAllRooms(false);  // v3 / P1-2 : fermeture propre, joins remis à false
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

        /// <summary>
        /// v3 : ne traite plus QUE les analogiques globaux (10 pièce affichée, 250 ack de config,
        /// 260 volume matériel de la dalle). Les analogiques de pièce (21, 31, 51, 52, 53, 71-80,
        /// 254) arrivent sur le bloc de leur pièce et sont traités par ApplyRoomAnalogCommand.
        /// </summary>
        private void ProcessAnalogSignal(BasicTriList currentDevice, ushort joinNumber, ushort rawValue)
        {
            // P1-4 : accès protégé (le dictionnaire peut ne pas encore contenir ce périphérique)
            int activeRoomId = _activeRoomPerDevice.ContainsKey(currentDevice.ID)
                ? _activeRoomPerDevice[currentDevice.ID]
                : DefaultRoomForPanel(currentDevice.ID);


            // Filtre de journal : join 10 (trop bavard) et joins réservés firmware (> 3000) non tracés
            if (joinNumber != 10 && joinNumber <= 3000)
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Analog Join {2} = {3}", currentDevice.ID, activeRoomId, joinNumber, rawValue);

            switch (joinNumber)
            {
                case 10:
                    if (rawValue >= 1 && _roomsRegistry != null && _roomsRegistry.ContainsKey(rawValue)) // P1-4
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
            }
        }

        /// <summary>
        /// Partie GLOBALE de l'écran d'un panel : identité de la pièce affichée, sélection de pièce,
        /// alarme centrale, partitions, mode vacances, informations système. v3 : les états de pièce
        /// sont poussés en parallèle sur le bloc de chaque pièce par PushRoomFeedback ; ce qui reste
        /// ici est soit global, soit l'instantané de la pièce affichée au moment de la navigation.
        /// </summary>
        private void UpdateScreenStateForPanel(BasicTriList panel, int roomId)
        {
            // P1-4 : garde sur le registre (un id de pièce absent de villa_config.json provoquait
            // une KeyNotFoundException dès la première mise à jour d'écran).
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId))
            {
                ErrorLog.Notice("Notice: Pièce {0} inconnue du registre - écran du IP-ID {1:X2} non rafraîchi.", roomId, panel.ID);
                return;
            }
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

            // Native Source Selection Feedback (Digital 150-154 vidéo, 155 musique en audio, 156 audio = vidéo)
            for (uint i = 150; i <= 154; i++)
            {
                panel.BooleanInput[i].BoolValue = (room.ActiveVideoSource == (i - 150));
            }
            panel.BooleanInput[155].BoolValue = room.MusicAudio;
            panel.BooleanInput[156].BoolValue = !room.MusicAudio;

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

            // v3 : le sériel 33 (mode CVC) manquait ici : le libellé CHAUFFAGE / CLIMATISATION
            // restait vide à la connexion et au changement de pièce, jusqu'au premier appui consigne.
            panel.StringInput[33].StringValue = room.TargetTemperature > room.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION";

            // Formatted target temperature for String Join 34
            double convertedTargetTemp = (double)room.TargetTemperature / 10.0;
            panel.StringInput[34].StringValue = convertedTargetTemp.ToString("F1");

            panel.UShortInput[51].UShortValue = room.ActiveVideoSource;
            panel.UShortInput[52].UShortValue = room.AudioVolume;
            panel.UShortInput[53].UShortValue = room.MusicAudio ? (ushort)5 : room.ActiveVideoSource; // source audio (5 = musique)
            panel.BooleanInput[55].BoolValue = room.IsAudioMuted;

            panel.BooleanInput[41].BoolValue = _globalAlarmArmedState;
            panel.BooleanInput[42].BoolValue = !_globalAlarmArmedState;
        }

        // Routage audio des haut-parleurs de la pièce : musique (5) ou audio de la source vidéo.
        // Point d'accroche pour le driver ampli / matrice audio ; pour l'instant journalisé.
        private void DispatchAudioRouting(int roomId)
        {
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId)) return; // P1-4
            var room = _roomsRegistry[roomId];
            string label = room.MusicAudio ? "Musique" : (room.ActiveVideoSource == 0 ? "Off" : "Audio de la source vidéo " + room.ActiveVideoSource);
            CrestronConsole.PrintLine("AUDIO-ROUTING: [Zone: {0}] -> haut-parleurs = [{1}].", room.RoomName, label);
        }

        private void DispatchIpCommandToSonyTv(int roomId, ushort sourceId)
        {
            if (_roomsRegistry == null || !_roomsRegistry.ContainsKey(roomId)) return; // P1-4
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

                // P1-5 : le nom vient du panel et servait tel quel à composer un chemin de fichier
                // (traversée '../' possible, écriture n'importe où sur le CP4). Il est désormais
                // assaini : seuls [a-z A-Z 0-9 _ -] sont acceptés, 40 caractères au plus.
                presetName = SanitizePresetName(presetName);
                if (string.IsNullOrEmpty(presetName))
                {
                    ErrorLog.Error("PRESETS ERROR: Nom de preset refusé (caractères non autorisés).");
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

        /// <summary>
        /// P1-5 : liste blanche stricte des caractères d'un nom de preset. Retourne "" si le nom
        /// contient autre chose que des lettres, chiffres, '_' ou '-' : aucune traversée de
        /// répertoire n'est possible, le fichier reste dans /user/.
        /// </summary>
        private static string SanitizePresetName(string rawName)
        {
            if (string.IsNullOrEmpty(rawName)) return "";
            string name = rawName.Trim();
            if (name.Length > 40) return "";
            foreach (char c in name)
            {
                bool ok = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == '-';
                if (!ok) return "";
            }
            return name;
        }

        private bool ApplyPreset(string presetName)
        {
            try
            {
                // P1-5 : même assainissement à la lecture (les noms internes du C# y sont insensibles).
                presetName = SanitizePresetName(presetName);
                if (string.IsNullOrEmpty(presetName)) return false;
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
                                        // v3 / P1-2 : impulsion sur le bloc de LA pièce concernée
                                        // (+61 Monter / +63 Descendre pour le moteur 1, +3 par moteur),
                                        // au lieu d'une écriture permanente sur la plage d'entrée 81-98
                                        // de tous les panels.
                                        uint offset = (uint)((isOpening ? 61 : 63) + (motorId - 1) * 3);
                                        PulseRoomDigital(roomId, offset);
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
                                for (int i = 0; i < 10; i++) rm.CircuitLevels[i] = 0; // P1-3 : 10 circuits, pas 6
                            }
                        }
                    }
                    
                    if (shadeOpt)
                    {
                        if (!ApplyPreset("shade_close"))
                            PulseAllMotorsInAllRooms(false); // v3 / P1-2 : impulsions par pièce, remises à false
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