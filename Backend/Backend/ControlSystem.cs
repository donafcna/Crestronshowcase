using System;
using System.Collections.Generic;
using Crestron.SimplSharp;
using Crestron.SimplSharpPro;
using Crestron.SimplSharpPro.UI;                    // Indispensable pour XpanelForSmartGraphics
using Crestron.SimplSharpPro.CrestronThread;
using Crestron.SimplSharpPro.DeviceSupport;

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

        public RoomState(int id, string name)
        {
            RoomId = id;
            RoomName = name;
            ActiveScene = 21;
            LightLevel1 = 0;
            TargetTemperature = 210;
            CurrentTemperature = 224;
            ActiveVideoSource = 0;
            AudioVolume = 25000;
            IsAudioMuted = false;
        }
    }

    public class ControlSystem : CrestronControlSystem
    {
        // Liste dynamique gérant tous les écrans connectés (TSW-1070, XPanel, iPad, iPhone)
        private List<BasicTriListWithSmartObject> _touchPanels;
        private Dictionary<int, RoomState> _roomsRegistry;
        private Dictionary<uint, int> _activeRoomPerDevice = new Dictionary<uint, int>();
        private bool _globalAlarmArmedState = false;
        private string _cpzFileName = "villaftv.cpz";
        private string _cpzCompileDate = "Inconnue";
        private Dictionary<uint, string> _validationDates = new Dictionary<uint, string>();

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

                // 1. Initialisation de la base de données des pièces de la Villa
                BuildVillaRoomsDatabase();

                _touchPanels = new List<BasicTriListWithSmartObject>();

                // 2. Déclaration et instanciation de la dalle tactile principale TSW-1070 sur l'IP ID 0x03
                RegisterUserInterface(new Tsw1070GV(0x03, this));

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
        /// Enregistre un écran tactile et l'abonne aux événements d'entrée utilisateur et de statut de connexion.
        /// </summary>
        private void RegisterUserInterface(BasicTriListWithSmartObject device)
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
        }

        private void SendFeedbackUShortToRoom(int roomId, uint joinNumber, ushort value)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    panel.UShortInput[joinNumber].UShortValue = value;
            }
        }

        private void SendFeedbackStringToRoom(int roomId, uint joinNumber, string value)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    panel.StringInput[joinNumber].StringValue = value;
            }
        }

        private void BroadcastFeedbackToRoom(int roomId)
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == roomId)
                    UpdateScreenStateForPanel(panel, roomId);
            }
        }

        private void BroadcastFeedbackToAll()
        {
            foreach (var panel in _touchPanels)
            {
                if (_activeRoomPerDevice.ContainsKey(panel.ID))
                    UpdateScreenStateForPanel(panel, _activeRoomPerDevice[panel.ID]);
            }
        }

        private void BuildVillaRoomsDatabase()
        {
            _roomsRegistry = new Dictionary<int, RoomState>();
            string[] roomNames = {
                "Salon", "Cuisine", "Salle à Manger", "Suite Parentale", "Chambre 1",
                "Chambre 2", "Bureau", "Home Cinéma", "Terrasse extrieure", "Espace SPA / Piscine"
            };

            for (int i = 1; i <= 10; i++)
            {
                _roomsRegistry.Add(i, new RoomState(i, roomNames[i - 1]));
            }
        }

        private void OnTouchPanelSignalReceived(BasicTriList currentDevice, SigEventArgs args)
        {
            ushort joinNumber = (ushort)args.Sig.Number;

            if (!_activeRoomPerDevice.ContainsKey(currentDevice.ID))
                _activeRoomPerDevice[currentDevice.ID] = 1;

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
                    break;
            }
        }

        private void ProcessDigitalSignal(BasicTriList currentDevice, ushort joinNumber)
        {
            int activeRoomId = _activeRoomPerDevice[currentDevice.ID];
            RoomState selectedRoom = _roomsRegistry[activeRoomId];

            CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Digital Join {2}", currentDevice.ID, activeRoomId, joinNumber);

            // Rooms Navigation (Digital 11 to 18)
            if (joinNumber >= 11 && joinNumber <= 18)
            {
                int roomSelected = joinNumber - 10;
                _activeRoomPerDevice[currentDevice.ID] = roomSelected;
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} navigated to Room {1} (via Digital)", currentDevice.ID, roomSelected);
                UpdateScreenStateForPanel(currentDevice, roomSelected);
                return;
            }

            // Sources Selection (Digital 150 to 154)
            if (joinNumber >= 150 && joinNumber <= 154)
            {
                ushort sourceId = (ushort)(joinNumber - 150);
                selectedRoom.ActiveVideoSource = sourceId;
                SendFeedbackUShortToRoom(activeRoomId, 51, sourceId); // Still send analog feedback for compatibility
                
                // Send digital feedback to all panels in this room
                foreach (var panel in _touchPanels)
                {
                    if (_activeRoomPerDevice.ContainsKey(panel.ID) && _activeRoomPerDevice[panel.ID] == activeRoomId)
                    {
                        for (uint i = 150; i <= 154; i++)
                        {
                            panel.BooleanInput[i].BoolValue = (joinNumber == i);
                        }
                    }
                }
                
                DispatchIpCommandToSonyTv(activeRoomId, sourceId);
                return;
            }

            if (joinNumber >= 21 && joinNumber <= 24)
            {
                selectedRoom.ActiveScene = joinNumber;

                if (joinNumber == 21) selectedRoom.LightLevel1 = 0;
                if (joinNumber == 22) selectedRoom.LightLevel1 = 19660;
                if (joinNumber == 23) selectedRoom.LightLevel1 = 45875;
                if (joinNumber == 24) selectedRoom.LightLevel1 = 65535;

                BroadcastFeedbackToRoom(activeRoomId);
                return;
            }

            switch (joinNumber)
            {
                case 35: // Target Temp Up (+0.5°C => +5 raw)
                    selectedRoom.TargetTemperature = (ushort)Math.Min(280, selectedRoom.TargetTemperature + 5);
                    SendFeedbackUShortToRoom(activeRoomId, 31, selectedRoom.TargetTemperature);
                    SendFeedbackStringToRoom(activeRoomId, 33, selectedRoom.TargetTemperature > selectedRoom.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION");
                    SendFeedbackStringToRoom(activeRoomId, 34, ((double)selectedRoom.TargetTemperature / 10.0).ToString("F1"));
                    break;

                case 36: // Target Temp Down (-0.5°C => -5 raw)
                    selectedRoom.TargetTemperature = (ushort)Math.Max(160, selectedRoom.TargetTemperature - 5);
                    SendFeedbackUShortToRoom(activeRoomId, 31, selectedRoom.TargetTemperature);
                    SendFeedbackStringToRoom(activeRoomId, 33, selectedRoom.TargetTemperature > selectedRoom.CurrentTemperature ? "CHAUFFAGE" : "CLIMATISATION");
                    SendFeedbackStringToRoom(activeRoomId, 34, ((double)selectedRoom.TargetTemperature / 10.0).ToString("F1"));
                    break;

                case 37: // Easter Egg - Widget Météo triple-tap
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

                case 53:
                    selectedRoom.IsAudioMuted = !selectedRoom.IsAudioMuted;
                    SendFeedbackBoolToRoom(activeRoomId, 53, selectedRoom.IsAudioMuted);
                    break;

                case 61:
                case 62:
                case 63:
                case 64:
                case 65:
                case 66:
                case 67:
                case 68:
                case 69:
                    CrestronConsole.PrintLine("STORE CONTROL - Event on digital join {0} received.", joinNumber);
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
            
            if (joinNumber != 10) 
                CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} (Room {1}) triggered Analog Join {2} = {3}", currentDevice.ID, activeRoomId, joinNumber, rawValue);

            switch (joinNumber)
            {
                case 10:
                    if (rawValue >= 1 && rawValue <= 10)
                    {
                        CrestronConsole.PrintLine("[DECOUPLE] IP-ID {0:X2} navigated to Room {1}", currentDevice.ID, rawValue);
                        _activeRoomPerDevice[currentDevice.ID] = rawValue;
                        UpdateScreenStateForPanel(currentDevice, rawValue);
                    }
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

            // Envoi des informations sur le fichier CPZ (Joins 101 et 102)
            panel.StringInput[101].StringValue = _cpzFileName;
            panel.StringInput[102].StringValue = _cpzCompileDate;
            panel.StringInput[104].StringValue = _validationDates.ContainsKey(panel.ID) ? _validationDates[panel.ID] : "";

            // Native Room Selection Feedback (Digital 11-18)
            for (uint i = 11; i <= 18; i++)
            {
                panel.BooleanInput[i].BoolValue = (roomId == (i - 10));
            }

            // Native Source Selection Feedback (Digital 150-154)
            for (uint i = 150; i <= 154; i++)
            {
                panel.BooleanInput[i].BoolValue = (room.ActiveVideoSource == (i - 150));
            }

            panel.BooleanInput[21].BoolValue = (room.ActiveScene == 21);
            panel.BooleanInput[22].BoolValue = (room.ActiveScene == 22);
            panel.BooleanInput[23].BoolValue = (room.ActiveScene == 23);
            panel.BooleanInput[24].BoolValue = (room.ActiveScene == 24);

            panel.UShortInput[21].UShortValue = room.LightLevel1;
            panel.UShortInput[31].UShortValue = room.TargetTemperature;

            double convertedTemp = (double)room.CurrentTemperature / 10.0;
            panel.StringInput[32].StringValue = convertedTemp.ToString("F1");

            // Formatted target temperature for String Join 34
            double convertedTargetTemp = (double)room.TargetTemperature / 10.0;
            panel.StringInput[34].StringValue = convertedTargetTemp.ToString("F1");

            panel.UShortInput[51].UShortValue = room.ActiveVideoSource;
            panel.UShortInput[52].UShortValue = room.AudioVolume;
            panel.BooleanInput[53].BoolValue = room.IsAudioMuted;

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
    }
}