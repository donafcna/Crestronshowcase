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

        public ControlSystem() : base()
        {
            Thread.MaxNumberOfUserThreads = 32;
        }

        public override void InitializeSystem()
        {
            try
            {
                // 1. Initialisation de la base de données des pièces de la Villa
                BuildVillaRoomsDatabase();

                _touchPanels = new List<BasicTriListWithSmartObject>();

                // 2. Déclaration et instanciation de la dalle tactile principale TSW-1070 sur l'IP ID 0x03
                RegisterUserInterface(new Tsw1070GV(0x03, this));

                // 3. Déclaration et instanciation du Web XPanel HTML5 sur l'IP ID 0x04
                RegisterUserInterface(new XpanelForHtml5(0x04, this));

                // 4. Déclaration et instanciation de l'iPad sur l'IP ID 0x05 (Crestron Go / Crestron App)
                var ipad = new CrestronApp(0x05, this);
                ipad.ParameterProjectName.Value = "villa-frequencetv";
                RegisterUserInterface(ipad);

                // 5. Déclaration et instanciation de l'iPhone 17 sur l'IP ID 0x06 (Crestron Go mobile)
                var iphone = new CrestronApp(0x06, this);
                iphone.ParameterProjectName.Value = "villa-frequencetv";
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
        /// Enregistre un écran tactile et l'abonne aux événements d'entrée utilisateur.
        /// </summary>
        private void RegisterUserInterface(BasicTriListWithSmartObject device)
        {
            device.SigChange += new SigEventHandler(OnTouchPanelSignalReceived);
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
    }
}