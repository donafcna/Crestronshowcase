using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Linq;
using Crestron;
using Crestron.Logos.SplusLibrary;
using Crestron.Logos.SplusObjects;
using Crestron.SimplSharp;

namespace UserModule_VILLAPIECE
{
    public class UserModuleClass_VILLAPIECE : SplusObject
    {
        static CCriticalSection g_criticalSection = new CCriticalSection();
        
        
        
        
        Crestron.Logos.SplusObjects.DigitalInput BTN_CONSIGNE_PLUS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_CONSIGNE_MOINS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_CVC_MARCHE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_CVC_ARRET;
        Crestron.Logos.SplusObjects.DigitalInput BTN_SAUNA_MARCHE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_SAUNA_ARRET;
        Crestron.Logos.SplusObjects.DigitalInput BTN_SAUNA_PLUS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_SAUNA_MOINS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_HAMMAM_MARCHE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_HAMMAM_ARRET;
        Crestron.Logos.SplusObjects.DigitalInput BTN_HAMMAM_PLUS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_HAMMAM_MOINS;
        Crestron.Logos.SplusObjects.DigitalInput BTN_MUSIQUE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_SUIVRE_VIDEO;
        Crestron.Logos.SplusObjects.DigitalInput BTN_MUTE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_AV_OFF;
        Crestron.Logos.SplusObjects.DigitalInput BTN_MEDIA_LECTURE;
        Crestron.Logos.SplusObjects.DigitalInput BTN_MEDIA_SUIVANT;
        Crestron.Logos.SplusObjects.DigitalInput BTN_MEDIA_PRECEDENT;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_SCENE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_MEMORISER;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_VENTILATION;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_GROUPE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_MONTER;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_STOP;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_DESCENDRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_LAM_HORAIRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_LAM_STOP;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_LAM_ANTIHORAIRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_SCENE_STORES;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_SOURCE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> G;
        Crestron.Logos.SplusObjects.AnalogInput IN_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogInput IN_SOURCE;
        Crestron.Logos.SplusObjects.AnalogInput IN_VOLUME;
        Crestron.Logos.SplusObjects.AnalogInput IN_VOLUME_MEDIA;
        Crestron.Logos.SplusObjects.AnalogInput IN_VENTILATION;
        Crestron.Logos.SplusObjects.AnalogInput IN_SAUNA_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogInput IN_HAMMAM_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogInput RETOUR_TEMPERATURE;
        Crestron.Logos.SplusObjects.AnalogInput RETOUR_SAUNA_MESURE;
        Crestron.Logos.SplusObjects.AnalogInput RETOUR_HAMMAM_MESURE;
        Crestron.Logos.SplusObjects.StringInput RETOUR_MODE__DOLLAR__;
        InOutArray<Crestron.Logos.SplusObjects.AnalogInput> IN_CIRCUIT;
        InOutArray<Crestron.Logos.SplusObjects.AnalogInput> RETOUR_CIRCUIT;
        Crestron.Logos.SplusObjects.DigitalOutput FB_CVC_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_CVC_ARRET;
        Crestron.Logos.SplusObjects.DigitalOutput FB_SAUNA_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_SAUNA_ARRET;
        Crestron.Logos.SplusObjects.DigitalOutput FB_HAMMAM_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_HAMMAM_ARRET;
        Crestron.Logos.SplusObjects.DigitalOutput FB_MUSIQUE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_SUIVRE_VIDEO;
        Crestron.Logos.SplusObjects.DigitalOutput FB_MUTE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_AV_OFF;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_CVC_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_SAUNA_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_HAMMAM_MARCHE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_MUTE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_MUSIQUE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_AV_OFF;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_MEDIA_LECTURE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_MEDIA_SUIVANT;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_MEDIA_PRECEDENT;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_SCENE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_MEMORISEE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_VENTILATION;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_SCENE_STORES;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_SOURCE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_SCENE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_MONTER;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_STOP;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_DESCENDRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_LAM_HORAIRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_LAM_STOP;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_LAM_ANTIHORAIRE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_GROUPE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_SCENE_STORES;
        Crestron.Logos.SplusObjects.AnalogOutput FB_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput FB_SOURCE_ACTIVE;
        Crestron.Logos.SplusObjects.AnalogOutput FB_VOLUME;
        Crestron.Logos.SplusObjects.AnalogOutput FB_SOURCE_AUDIO;
        Crestron.Logos.SplusObjects.AnalogOutput FB_VOLUME_MEDIA;
        Crestron.Logos.SplusObjects.AnalogOutput FB_VENTILATION_A;
        Crestron.Logos.SplusObjects.AnalogOutput FB_SAUNA_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput FB_HAMMAM_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput FB_SAUNA_MESURE;
        Crestron.Logos.SplusObjects.AnalogOutput FB_HAMMAM_MESURE;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_VENTILATION;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_SAUNA_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_HAMMAM_CONSIGNE;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_SOURCE;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_VOLUME;
        Crestron.Logos.SplusObjects.AnalogOutput PILOTE_VOLUME_MEDIA;
        Crestron.Logos.SplusObjects.StringOutput TXT_TEMPERATURE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_MODE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_CONSIGNE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_SAUNA_CONSIGNE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_HAMMAM_CONSIGNE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_SAUNA_MESURE__DOLLAR__;
        Crestron.Logos.SplusObjects.StringOutput TXT_HAMMAM_MESURE__DOLLAR__;
        InOutArray<Crestron.Logos.SplusObjects.AnalogOutput> FB_CIRCUIT;
        InOutArray<Crestron.Logos.SplusObjects.AnalogOutput> PILOTE_CIRCUIT;
        UShortParameter PIECE;
        ushort SCENEACTIVE = 0;
        ushort CONSIGNE = 0;
        ushort MARCHE = 0;
        ushort VENT = 0;
        ushort SOURCE = 0;
        ushort MUSIQUE = 0;
        ushort MUTE = 0;
        ushort VOLUME = 0;
        ushort VOLUMEMEDIA = 0;
        ushort SAUNAON = 0;
        ushort HAMMAMON = 0;
        ushort SAUNACONS = 0;
        ushort HAMMAMCONS = 0;
        ushort SAUNAMES = 0;
        ushort HAMMAMMES = 0;
        ushort TEMPMES = 0;
        ushort TEMPRECUE = 0;
        ushort SAUNARECUE = 0;
        ushort HAMMAMRECUE = 0;
        ushort STORESSCENE = 0;
        ushort NBCIRCUITS = 0;
        ushort EMPREINTE = 0;
        ushort CONSMIN = 0;
        ushort CONSMAX = 0;
        ushort CONSPAS = 0;
        ushort CONSINIT = 0;
        ushort MARCHEINIT = 0;
        ushort VENTINIT = 0;
        ushort [] NIVEAU;
        ushort [] TYPEMOTEUR;
        ushort [,] DEFAUT;
        private void CONFIGPIECE (  SplusExecutionContext __context__ ) 
            { 
            
            __context__.SourceCodeLine = 67;
            NBCIRCUITS = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 67;
            EMPREINTE = (ushort) ( 1 ) ; 
            __context__.SourceCodeLine = 67;
            CONSMIN = (ushort) ( 160 ) ; 
            __context__.SourceCodeLine = 67;
            CONSMAX = (ushort) ( 280 ) ; 
            __context__.SourceCodeLine = 67;
            CONSPAS = (ushort) ( 5 ) ; 
            __context__.SourceCodeLine = 67;
            CONSINIT = (ushort) ( 210 ) ; 
            __context__.SourceCodeLine = 67;
            MARCHEINIT = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 67;
            VENTINIT = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 68;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 1))  ) ) 
                { 
                __context__.SourceCodeLine = 70;
                NBCIRCUITS = (ushort) ( 10 ) ; 
                __context__.SourceCodeLine = 70;
                EMPREINTE = (ushort) ( 62503 ) ; 
                __context__.SourceCodeLine = 71;
                CONSMIN = (ushort) ( 160 ) ; 
                __context__.SourceCodeLine = 71;
                CONSMAX = (ushort) ( 280 ) ; 
                __context__.SourceCodeLine = 71;
                CONSPAS = (ushort) ( 5 ) ; 
                __context__.SourceCodeLine = 71;
                CONSINIT = (ushort) ( 210 ) ; 
                __context__.SourceCodeLine = 72;
                MARCHEINIT = (ushort) ( 1 ) ; 
                __context__.SourceCodeLine = 72;
                VENTINIT = (ushort) ( 0 ) ; 
                __context__.SourceCodeLine = 73;
                DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                __context__.SourceCodeLine = 73;
                DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                __context__.SourceCodeLine = 73;
                DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                __context__.SourceCodeLine = 73;
                DEFAUT [ 2 , 5] = (ushort) ( 16384 ) ; 
                __context__.SourceCodeLine = 73;
                DEFAUT [ 2 , 6] = (ushort) ( 19660 ) ; 
                __context__.SourceCodeLine = 74;
                DEFAUT [ 2 , 7] = (ushort) ( 13107 ) ; 
                __context__.SourceCodeLine = 74;
                DEFAUT [ 2 , 8] = (ushort) ( 16384 ) ; 
                __context__.SourceCodeLine = 74;
                DEFAUT [ 2 , 9] = (ushort) ( 19660 ) ; 
                __context__.SourceCodeLine = 74;
                DEFAUT [ 2 , 10] = (ushort) ( 13107 ) ; 
                __context__.SourceCodeLine = 75;
                DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                __context__.SourceCodeLine = 75;
                DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                __context__.SourceCodeLine = 75;
                DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                __context__.SourceCodeLine = 75;
                DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                __context__.SourceCodeLine = 75;
                DEFAUT [ 3 , 5] = (ushort) ( 39321 ) ; 
                __context__.SourceCodeLine = 76;
                DEFAUT [ 3 , 6] = (ushort) ( 45874 ) ; 
                __context__.SourceCodeLine = 76;
                DEFAUT [ 3 , 7] = (ushort) ( 32768 ) ; 
                __context__.SourceCodeLine = 76;
                DEFAUT [ 3 , 8] = (ushort) ( 39321 ) ; 
                __context__.SourceCodeLine = 76;
                DEFAUT [ 3 , 9] = (ushort) ( 45874 ) ; 
                __context__.SourceCodeLine = 76;
                DEFAUT [ 3 , 10] = (ushort) ( 32768 ) ; 
                __context__.SourceCodeLine = 77;
                DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 77;
                DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 77;
                DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 77;
                DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 77;
                DEFAUT [ 4 , 5] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 78;
                DEFAUT [ 4 , 6] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 78;
                DEFAUT [ 4 , 7] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 78;
                DEFAUT [ 4 , 8] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 78;
                DEFAUT [ 4 , 9] = (ushort) ( 65535 ) ; 
                __context__.SourceCodeLine = 78;
                DEFAUT [ 4 , 10] = (ushort) ( 65535 ) ; 
                } 
            
            else 
                {
                __context__.SourceCodeLine = 80;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 2))  ) ) 
                    { 
                    __context__.SourceCodeLine = 82;
                    NBCIRCUITS = (ushort) ( 4 ) ; 
                    __context__.SourceCodeLine = 82;
                    EMPREINTE = (ushort) ( 6962 ) ; 
                    __context__.SourceCodeLine = 83;
                    CONSMIN = (ushort) ( 160 ) ; 
                    __context__.SourceCodeLine = 83;
                    CONSMAX = (ushort) ( 280 ) ; 
                    __context__.SourceCodeLine = 83;
                    CONSPAS = (ushort) ( 5 ) ; 
                    __context__.SourceCodeLine = 83;
                    CONSINIT = (ushort) ( 210 ) ; 
                    __context__.SourceCodeLine = 84;
                    MARCHEINIT = (ushort) ( 1 ) ; 
                    __context__.SourceCodeLine = 84;
                    VENTINIT = (ushort) ( 0 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                    __context__.SourceCodeLine = 85;
                    TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                    __context__.SourceCodeLine = 86;
                    TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                    __context__.SourceCodeLine = 87;
                    DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                    __context__.SourceCodeLine = 87;
                    DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                    __context__.SourceCodeLine = 87;
                    DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                    __context__.SourceCodeLine = 88;
                    DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                    __context__.SourceCodeLine = 88;
                    DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                    __context__.SourceCodeLine = 88;
                    DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                    __context__.SourceCodeLine = 88;
                    DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                    __context__.SourceCodeLine = 89;
                    DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                    __context__.SourceCodeLine = 89;
                    DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                    __context__.SourceCodeLine = 89;
                    DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                    __context__.SourceCodeLine = 89;
                    DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                    } 
                
                else 
                    {
                    __context__.SourceCodeLine = 91;
                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 3))  ) ) 
                        { 
                        __context__.SourceCodeLine = 93;
                        NBCIRCUITS = (ushort) ( 4 ) ; 
                        __context__.SourceCodeLine = 93;
                        EMPREINTE = (ushort) ( 6962 ) ; 
                        __context__.SourceCodeLine = 94;
                        CONSMIN = (ushort) ( 160 ) ; 
                        __context__.SourceCodeLine = 94;
                        CONSMAX = (ushort) ( 280 ) ; 
                        __context__.SourceCodeLine = 94;
                        CONSPAS = (ushort) ( 5 ) ; 
                        __context__.SourceCodeLine = 94;
                        CONSINIT = (ushort) ( 210 ) ; 
                        __context__.SourceCodeLine = 95;
                        MARCHEINIT = (ushort) ( 1 ) ; 
                        __context__.SourceCodeLine = 95;
                        VENTINIT = (ushort) ( 0 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                        __context__.SourceCodeLine = 96;
                        TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                        __context__.SourceCodeLine = 97;
                        TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                        __context__.SourceCodeLine = 98;
                        DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                        __context__.SourceCodeLine = 98;
                        DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                        __context__.SourceCodeLine = 98;
                        DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                        __context__.SourceCodeLine = 99;
                        DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                        __context__.SourceCodeLine = 99;
                        DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                        __context__.SourceCodeLine = 99;
                        DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                        __context__.SourceCodeLine = 99;
                        DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                        __context__.SourceCodeLine = 100;
                        DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                        __context__.SourceCodeLine = 100;
                        DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                        __context__.SourceCodeLine = 100;
                        DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                        __context__.SourceCodeLine = 100;
                        DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                        } 
                    
                    else 
                        {
                        __context__.SourceCodeLine = 102;
                        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 4))  ) ) 
                            { 
                            __context__.SourceCodeLine = 104;
                            NBCIRCUITS = (ushort) ( 4 ) ; 
                            __context__.SourceCodeLine = 104;
                            EMPREINTE = (ushort) ( 6962 ) ; 
                            __context__.SourceCodeLine = 105;
                            CONSMIN = (ushort) ( 160 ) ; 
                            __context__.SourceCodeLine = 105;
                            CONSMAX = (ushort) ( 280 ) ; 
                            __context__.SourceCodeLine = 105;
                            CONSPAS = (ushort) ( 5 ) ; 
                            __context__.SourceCodeLine = 105;
                            CONSINIT = (ushort) ( 210 ) ; 
                            __context__.SourceCodeLine = 106;
                            MARCHEINIT = (ushort) ( 1 ) ; 
                            __context__.SourceCodeLine = 106;
                            VENTINIT = (ushort) ( 0 ) ; 
                            __context__.SourceCodeLine = 107;
                            DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                            __context__.SourceCodeLine = 107;
                            DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                            __context__.SourceCodeLine = 107;
                            DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                            __context__.SourceCodeLine = 108;
                            DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                            __context__.SourceCodeLine = 108;
                            DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                            __context__.SourceCodeLine = 108;
                            DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                            __context__.SourceCodeLine = 108;
                            DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                            __context__.SourceCodeLine = 109;
                            DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                            __context__.SourceCodeLine = 109;
                            DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                            __context__.SourceCodeLine = 109;
                            DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                            __context__.SourceCodeLine = 109;
                            DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                            } 
                        
                        else 
                            {
                            __context__.SourceCodeLine = 111;
                            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 5))  ) ) 
                                { 
                                __context__.SourceCodeLine = 113;
                                NBCIRCUITS = (ushort) ( 4 ) ; 
                                __context__.SourceCodeLine = 113;
                                EMPREINTE = (ushort) ( 6962 ) ; 
                                __context__.SourceCodeLine = 114;
                                CONSMIN = (ushort) ( 160 ) ; 
                                __context__.SourceCodeLine = 114;
                                CONSMAX = (ushort) ( 280 ) ; 
                                __context__.SourceCodeLine = 114;
                                CONSPAS = (ushort) ( 5 ) ; 
                                __context__.SourceCodeLine = 114;
                                CONSINIT = (ushort) ( 210 ) ; 
                                __context__.SourceCodeLine = 115;
                                MARCHEINIT = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 115;
                                VENTINIT = (ushort) ( 0 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                __context__.SourceCodeLine = 116;
                                TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                __context__.SourceCodeLine = 117;
                                TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                __context__.SourceCodeLine = 118;
                                DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                __context__.SourceCodeLine = 118;
                                DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                __context__.SourceCodeLine = 118;
                                DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                __context__.SourceCodeLine = 119;
                                DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                __context__.SourceCodeLine = 119;
                                DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                __context__.SourceCodeLine = 119;
                                DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                __context__.SourceCodeLine = 119;
                                DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                __context__.SourceCodeLine = 120;
                                DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                __context__.SourceCodeLine = 120;
                                DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                __context__.SourceCodeLine = 120;
                                DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                __context__.SourceCodeLine = 120;
                                DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                } 
                            
                            else 
                                {
                                __context__.SourceCodeLine = 122;
                                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 6))  ) ) 
                                    { 
                                    __context__.SourceCodeLine = 124;
                                    NBCIRCUITS = (ushort) ( 4 ) ; 
                                    __context__.SourceCodeLine = 124;
                                    EMPREINTE = (ushort) ( 6962 ) ; 
                                    __context__.SourceCodeLine = 125;
                                    CONSMIN = (ushort) ( 160 ) ; 
                                    __context__.SourceCodeLine = 125;
                                    CONSMAX = (ushort) ( 280 ) ; 
                                    __context__.SourceCodeLine = 125;
                                    CONSPAS = (ushort) ( 5 ) ; 
                                    __context__.SourceCodeLine = 125;
                                    CONSINIT = (ushort) ( 210 ) ; 
                                    __context__.SourceCodeLine = 126;
                                    MARCHEINIT = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 126;
                                    VENTINIT = (ushort) ( 0 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                    __context__.SourceCodeLine = 127;
                                    TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                    __context__.SourceCodeLine = 128;
                                    TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                    __context__.SourceCodeLine = 129;
                                    DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                    __context__.SourceCodeLine = 129;
                                    DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                    __context__.SourceCodeLine = 129;
                                    DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                    __context__.SourceCodeLine = 130;
                                    DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                    __context__.SourceCodeLine = 130;
                                    DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                    __context__.SourceCodeLine = 130;
                                    DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                    __context__.SourceCodeLine = 130;
                                    DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                    __context__.SourceCodeLine = 131;
                                    DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                    __context__.SourceCodeLine = 131;
                                    DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                    __context__.SourceCodeLine = 131;
                                    DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                    __context__.SourceCodeLine = 131;
                                    DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                    } 
                                
                                else 
                                    {
                                    __context__.SourceCodeLine = 133;
                                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 7))  ) ) 
                                        { 
                                        __context__.SourceCodeLine = 135;
                                        NBCIRCUITS = (ushort) ( 4 ) ; 
                                        __context__.SourceCodeLine = 135;
                                        EMPREINTE = (ushort) ( 6962 ) ; 
                                        __context__.SourceCodeLine = 136;
                                        CONSMIN = (ushort) ( 160 ) ; 
                                        __context__.SourceCodeLine = 136;
                                        CONSMAX = (ushort) ( 280 ) ; 
                                        __context__.SourceCodeLine = 136;
                                        CONSPAS = (ushort) ( 5 ) ; 
                                        __context__.SourceCodeLine = 136;
                                        CONSINIT = (ushort) ( 210 ) ; 
                                        __context__.SourceCodeLine = 137;
                                        MARCHEINIT = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 137;
                                        VENTINIT = (ushort) ( 0 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                        __context__.SourceCodeLine = 138;
                                        TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                        __context__.SourceCodeLine = 139;
                                        TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                        __context__.SourceCodeLine = 140;
                                        DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                        __context__.SourceCodeLine = 140;
                                        DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                        __context__.SourceCodeLine = 140;
                                        DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                        __context__.SourceCodeLine = 141;
                                        DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                        __context__.SourceCodeLine = 141;
                                        DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                        __context__.SourceCodeLine = 141;
                                        DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                        __context__.SourceCodeLine = 141;
                                        DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                        __context__.SourceCodeLine = 142;
                                        DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                        __context__.SourceCodeLine = 142;
                                        DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                        __context__.SourceCodeLine = 142;
                                        DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                        __context__.SourceCodeLine = 142;
                                        DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                        } 
                                    
                                    else 
                                        {
                                        __context__.SourceCodeLine = 144;
                                        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 8))  ) ) 
                                            { 
                                            __context__.SourceCodeLine = 146;
                                            NBCIRCUITS = (ushort) ( 4 ) ; 
                                            __context__.SourceCodeLine = 146;
                                            EMPREINTE = (ushort) ( 6962 ) ; 
                                            __context__.SourceCodeLine = 147;
                                            CONSMIN = (ushort) ( 160 ) ; 
                                            __context__.SourceCodeLine = 147;
                                            CONSMAX = (ushort) ( 280 ) ; 
                                            __context__.SourceCodeLine = 147;
                                            CONSPAS = (ushort) ( 5 ) ; 
                                            __context__.SourceCodeLine = 147;
                                            CONSINIT = (ushort) ( 210 ) ; 
                                            __context__.SourceCodeLine = 148;
                                            MARCHEINIT = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 148;
                                            VENTINIT = (ushort) ( 0 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                            __context__.SourceCodeLine = 149;
                                            TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                            __context__.SourceCodeLine = 150;
                                            TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                            __context__.SourceCodeLine = 151;
                                            DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                            __context__.SourceCodeLine = 151;
                                            DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                            __context__.SourceCodeLine = 151;
                                            DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                            __context__.SourceCodeLine = 152;
                                            DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                            __context__.SourceCodeLine = 152;
                                            DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                            __context__.SourceCodeLine = 152;
                                            DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                            __context__.SourceCodeLine = 152;
                                            DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                            __context__.SourceCodeLine = 153;
                                            DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                            __context__.SourceCodeLine = 153;
                                            DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                            __context__.SourceCodeLine = 153;
                                            DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                            __context__.SourceCodeLine = 153;
                                            DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                            } 
                                        
                                        else 
                                            {
                                            __context__.SourceCodeLine = 155;
                                            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 9))  ) ) 
                                                { 
                                                __context__.SourceCodeLine = 157;
                                                NBCIRCUITS = (ushort) ( 4 ) ; 
                                                __context__.SourceCodeLine = 157;
                                                EMPREINTE = (ushort) ( 6962 ) ; 
                                                __context__.SourceCodeLine = 158;
                                                CONSMIN = (ushort) ( 160 ) ; 
                                                __context__.SourceCodeLine = 158;
                                                CONSMAX = (ushort) ( 280 ) ; 
                                                __context__.SourceCodeLine = 158;
                                                CONSPAS = (ushort) ( 5 ) ; 
                                                __context__.SourceCodeLine = 158;
                                                CONSINIT = (ushort) ( 210 ) ; 
                                                __context__.SourceCodeLine = 159;
                                                MARCHEINIT = (ushort) ( 1 ) ; 
                                                __context__.SourceCodeLine = 159;
                                                VENTINIT = (ushort) ( 0 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                __context__.SourceCodeLine = 160;
                                                TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                __context__.SourceCodeLine = 161;
                                                TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                __context__.SourceCodeLine = 162;
                                                DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                __context__.SourceCodeLine = 162;
                                                DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                __context__.SourceCodeLine = 162;
                                                DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                __context__.SourceCodeLine = 163;
                                                DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                __context__.SourceCodeLine = 163;
                                                DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                __context__.SourceCodeLine = 163;
                                                DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                __context__.SourceCodeLine = 163;
                                                DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                __context__.SourceCodeLine = 164;
                                                DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                __context__.SourceCodeLine = 164;
                                                DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                __context__.SourceCodeLine = 164;
                                                DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                __context__.SourceCodeLine = 164;
                                                DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                } 
                                            
                                            else 
                                                {
                                                __context__.SourceCodeLine = 166;
                                                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 10))  ) ) 
                                                    { 
                                                    __context__.SourceCodeLine = 168;
                                                    NBCIRCUITS = (ushort) ( 4 ) ; 
                                                    __context__.SourceCodeLine = 168;
                                                    EMPREINTE = (ushort) ( 6962 ) ; 
                                                    __context__.SourceCodeLine = 169;
                                                    CONSMIN = (ushort) ( 160 ) ; 
                                                    __context__.SourceCodeLine = 169;
                                                    CONSMAX = (ushort) ( 280 ) ; 
                                                    __context__.SourceCodeLine = 169;
                                                    CONSPAS = (ushort) ( 5 ) ; 
                                                    __context__.SourceCodeLine = 169;
                                                    CONSINIT = (ushort) ( 210 ) ; 
                                                    __context__.SourceCodeLine = 170;
                                                    MARCHEINIT = (ushort) ( 1 ) ; 
                                                    __context__.SourceCodeLine = 170;
                                                    VENTINIT = (ushort) ( 0 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                    __context__.SourceCodeLine = 171;
                                                    TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                    __context__.SourceCodeLine = 172;
                                                    TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                    __context__.SourceCodeLine = 173;
                                                    DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                    __context__.SourceCodeLine = 173;
                                                    DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                    __context__.SourceCodeLine = 173;
                                                    DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                    __context__.SourceCodeLine = 174;
                                                    DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                    __context__.SourceCodeLine = 174;
                                                    DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                    __context__.SourceCodeLine = 174;
                                                    DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                    __context__.SourceCodeLine = 174;
                                                    DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                    __context__.SourceCodeLine = 175;
                                                    DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                    __context__.SourceCodeLine = 175;
                                                    DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                    __context__.SourceCodeLine = 175;
                                                    DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                    __context__.SourceCodeLine = 175;
                                                    DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                    } 
                                                
                                                else 
                                                    {
                                                    __context__.SourceCodeLine = 177;
                                                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 11))  ) ) 
                                                        { 
                                                        __context__.SourceCodeLine = 179;
                                                        NBCIRCUITS = (ushort) ( 4 ) ; 
                                                        __context__.SourceCodeLine = 179;
                                                        EMPREINTE = (ushort) ( 6962 ) ; 
                                                        __context__.SourceCodeLine = 180;
                                                        CONSMIN = (ushort) ( 160 ) ; 
                                                        __context__.SourceCodeLine = 180;
                                                        CONSMAX = (ushort) ( 280 ) ; 
                                                        __context__.SourceCodeLine = 180;
                                                        CONSPAS = (ushort) ( 5 ) ; 
                                                        __context__.SourceCodeLine = 180;
                                                        CONSINIT = (ushort) ( 210 ) ; 
                                                        __context__.SourceCodeLine = 181;
                                                        MARCHEINIT = (ushort) ( 1 ) ; 
                                                        __context__.SourceCodeLine = 181;
                                                        VENTINIT = (ushort) ( 0 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                        __context__.SourceCodeLine = 182;
                                                        TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                        __context__.SourceCodeLine = 183;
                                                        TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                        __context__.SourceCodeLine = 184;
                                                        DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                        __context__.SourceCodeLine = 184;
                                                        DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                        __context__.SourceCodeLine = 184;
                                                        DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                        __context__.SourceCodeLine = 185;
                                                        DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                        __context__.SourceCodeLine = 185;
                                                        DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                        __context__.SourceCodeLine = 185;
                                                        DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                        __context__.SourceCodeLine = 185;
                                                        DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                        __context__.SourceCodeLine = 186;
                                                        DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                        __context__.SourceCodeLine = 186;
                                                        DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                        __context__.SourceCodeLine = 186;
                                                        DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                        __context__.SourceCodeLine = 186;
                                                        DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                        } 
                                                    
                                                    else 
                                                        {
                                                        __context__.SourceCodeLine = 188;
                                                        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 12))  ) ) 
                                                            { 
                                                            __context__.SourceCodeLine = 190;
                                                            NBCIRCUITS = (ushort) ( 4 ) ; 
                                                            __context__.SourceCodeLine = 190;
                                                            EMPREINTE = (ushort) ( 6962 ) ; 
                                                            __context__.SourceCodeLine = 191;
                                                            CONSMIN = (ushort) ( 160 ) ; 
                                                            __context__.SourceCodeLine = 191;
                                                            CONSMAX = (ushort) ( 280 ) ; 
                                                            __context__.SourceCodeLine = 191;
                                                            CONSPAS = (ushort) ( 5 ) ; 
                                                            __context__.SourceCodeLine = 191;
                                                            CONSINIT = (ushort) ( 210 ) ; 
                                                            __context__.SourceCodeLine = 192;
                                                            MARCHEINIT = (ushort) ( 1 ) ; 
                                                            __context__.SourceCodeLine = 192;
                                                            VENTINIT = (ushort) ( 0 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                            __context__.SourceCodeLine = 193;
                                                            TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                            __context__.SourceCodeLine = 194;
                                                            TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                            __context__.SourceCodeLine = 195;
                                                            DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                            __context__.SourceCodeLine = 195;
                                                            DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                            __context__.SourceCodeLine = 195;
                                                            DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                            __context__.SourceCodeLine = 196;
                                                            DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                            __context__.SourceCodeLine = 196;
                                                            DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                            __context__.SourceCodeLine = 196;
                                                            DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                            __context__.SourceCodeLine = 196;
                                                            DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                            __context__.SourceCodeLine = 197;
                                                            DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                            __context__.SourceCodeLine = 197;
                                                            DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                            __context__.SourceCodeLine = 197;
                                                            DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                            __context__.SourceCodeLine = 197;
                                                            DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                            } 
                                                        
                                                        else 
                                                            {
                                                            __context__.SourceCodeLine = 199;
                                                            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 13))  ) ) 
                                                                { 
                                                                __context__.SourceCodeLine = 201;
                                                                NBCIRCUITS = (ushort) ( 4 ) ; 
                                                                __context__.SourceCodeLine = 201;
                                                                EMPREINTE = (ushort) ( 6962 ) ; 
                                                                __context__.SourceCodeLine = 202;
                                                                CONSMIN = (ushort) ( 160 ) ; 
                                                                __context__.SourceCodeLine = 202;
                                                                CONSMAX = (ushort) ( 280 ) ; 
                                                                __context__.SourceCodeLine = 202;
                                                                CONSPAS = (ushort) ( 5 ) ; 
                                                                __context__.SourceCodeLine = 202;
                                                                CONSINIT = (ushort) ( 210 ) ; 
                                                                __context__.SourceCodeLine = 203;
                                                                MARCHEINIT = (ushort) ( 1 ) ; 
                                                                __context__.SourceCodeLine = 203;
                                                                VENTINIT = (ushort) ( 0 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                                __context__.SourceCodeLine = 204;
                                                                TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                                __context__.SourceCodeLine = 205;
                                                                TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                                __context__.SourceCodeLine = 206;
                                                                DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                                __context__.SourceCodeLine = 206;
                                                                DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                                __context__.SourceCodeLine = 206;
                                                                DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                                __context__.SourceCodeLine = 207;
                                                                DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                                __context__.SourceCodeLine = 207;
                                                                DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                                __context__.SourceCodeLine = 207;
                                                                DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                                __context__.SourceCodeLine = 207;
                                                                DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                                __context__.SourceCodeLine = 208;
                                                                DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                                __context__.SourceCodeLine = 208;
                                                                DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                                __context__.SourceCodeLine = 208;
                                                                DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                                __context__.SourceCodeLine = 208;
                                                                DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                                } 
                                                            
                                                            else 
                                                                {
                                                                __context__.SourceCodeLine = 210;
                                                                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 14))  ) ) 
                                                                    { 
                                                                    __context__.SourceCodeLine = 212;
                                                                    NBCIRCUITS = (ushort) ( 4 ) ; 
                                                                    __context__.SourceCodeLine = 212;
                                                                    EMPREINTE = (ushort) ( 6962 ) ; 
                                                                    __context__.SourceCodeLine = 213;
                                                                    CONSMIN = (ushort) ( 160 ) ; 
                                                                    __context__.SourceCodeLine = 213;
                                                                    CONSMAX = (ushort) ( 280 ) ; 
                                                                    __context__.SourceCodeLine = 213;
                                                                    CONSPAS = (ushort) ( 5 ) ; 
                                                                    __context__.SourceCodeLine = 213;
                                                                    CONSINIT = (ushort) ( 210 ) ; 
                                                                    __context__.SourceCodeLine = 214;
                                                                    MARCHEINIT = (ushort) ( 1 ) ; 
                                                                    __context__.SourceCodeLine = 214;
                                                                    VENTINIT = (ushort) ( 0 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                                    __context__.SourceCodeLine = 215;
                                                                    TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                                    __context__.SourceCodeLine = 216;
                                                                    TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                                    __context__.SourceCodeLine = 217;
                                                                    DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                                    __context__.SourceCodeLine = 217;
                                                                    DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                                    __context__.SourceCodeLine = 217;
                                                                    DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                                    __context__.SourceCodeLine = 218;
                                                                    DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                                    __context__.SourceCodeLine = 218;
                                                                    DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                                    __context__.SourceCodeLine = 218;
                                                                    DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                                    __context__.SourceCodeLine = 218;
                                                                    DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                                    __context__.SourceCodeLine = 219;
                                                                    DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                                    __context__.SourceCodeLine = 219;
                                                                    DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                                    __context__.SourceCodeLine = 219;
                                                                    DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                                    __context__.SourceCodeLine = 219;
                                                                    DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                                    } 
                                                                
                                                                else 
                                                                    {
                                                                    __context__.SourceCodeLine = 221;
                                                                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (PIECE  .Value == 15))  ) ) 
                                                                        { 
                                                                        __context__.SourceCodeLine = 223;
                                                                        NBCIRCUITS = (ushort) ( 4 ) ; 
                                                                        __context__.SourceCodeLine = 223;
                                                                        EMPREINTE = (ushort) ( 6962 ) ; 
                                                                        __context__.SourceCodeLine = 224;
                                                                        CONSMIN = (ushort) ( 160 ) ; 
                                                                        __context__.SourceCodeLine = 224;
                                                                        CONSMAX = (ushort) ( 280 ) ; 
                                                                        __context__.SourceCodeLine = 224;
                                                                        CONSPAS = (ushort) ( 5 ) ; 
                                                                        __context__.SourceCodeLine = 224;
                                                                        CONSINIT = (ushort) ( 210 ) ; 
                                                                        __context__.SourceCodeLine = 225;
                                                                        MARCHEINIT = (ushort) ( 1 ) ; 
                                                                        __context__.SourceCodeLine = 225;
                                                                        VENTINIT = (ushort) ( 0 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 1] = (ushort) ( 1 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 2] = (ushort) ( 1 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 3] = (ushort) ( 2 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 4] = (ushort) ( 2 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 5] = (ushort) ( 3 ) ; 
                                                                        __context__.SourceCodeLine = 226;
                                                                        TYPEMOTEUR [ 6] = (ushort) ( 3 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 7] = (ushort) ( 1 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 8] = (ushort) ( 2 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 9] = (ushort) ( 3 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 10] = (ushort) ( 1 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 11] = (ushort) ( 2 ) ; 
                                                                        __context__.SourceCodeLine = 227;
                                                                        TYPEMOTEUR [ 12] = (ushort) ( 3 ) ; 
                                                                        __context__.SourceCodeLine = 228;
                                                                        DEFAUT [ 2 , 2] = (ushort) ( 16384 ) ; 
                                                                        __context__.SourceCodeLine = 228;
                                                                        DEFAUT [ 2 , 3] = (ushort) ( 19660 ) ; 
                                                                        __context__.SourceCodeLine = 228;
                                                                        DEFAUT [ 2 , 4] = (ushort) ( 13107 ) ; 
                                                                        __context__.SourceCodeLine = 229;
                                                                        DEFAUT [ 3 , 1] = (ushort) ( 32768 ) ; 
                                                                        __context__.SourceCodeLine = 229;
                                                                        DEFAUT [ 3 , 2] = (ushort) ( 39321 ) ; 
                                                                        __context__.SourceCodeLine = 229;
                                                                        DEFAUT [ 3 , 3] = (ushort) ( 45874 ) ; 
                                                                        __context__.SourceCodeLine = 229;
                                                                        DEFAUT [ 3 , 4] = (ushort) ( 32768 ) ; 
                                                                        __context__.SourceCodeLine = 230;
                                                                        DEFAUT [ 4 , 1] = (ushort) ( 65535 ) ; 
                                                                        __context__.SourceCodeLine = 230;
                                                                        DEFAUT [ 4 , 2] = (ushort) ( 65535 ) ; 
                                                                        __context__.SourceCodeLine = 230;
                                                                        DEFAUT [ 4 , 3] = (ushort) ( 65535 ) ; 
                                                                        __context__.SourceCodeLine = 230;
                                                                        DEFAUT [ 4 , 4] = (ushort) ( 65535 ) ; 
                                                                        } 
                                                                    
                                                                    }
                                                                
                                                                }
                                                            
                                                            }
                                                        
                                                        }
                                                    
                                                    }
                                                
                                                }
                                            
                                            }
                                        
                                        }
                                    
                                    }
                                
                                }
                            
                            }
                        
                        }
                    
                    }
                
                }
            
            
            }
            
        private void DEFAUTSSCENES (  SplusExecutionContext __context__ ) 
            { 
            ushort S = 0;
            ushort C = 0;
            
            
            __context__.SourceCodeLine = 237;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)4; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( S  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (S  >= __FN_FORSTART_VAL__1) && (S  <= __FN_FOREND_VAL__1) ) : ( (S  <= __FN_FORSTART_VAL__1) && (S  >= __FN_FOREND_VAL__1) ) ; S  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 237;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (_SplusNVRAM.MEMORISEE[ S ] == 0))  ) ) 
                    { 
                    __context__.SourceCodeLine = 237;
                    ushort __FN_FORSTART_VAL__2 = (ushort) ( 1 ) ;
                    ushort __FN_FOREND_VAL__2 = (ushort)20; 
                    int __FN_FORSTEP_VAL__2 = (int)1; 
                    for ( C  = __FN_FORSTART_VAL__2; (__FN_FORSTEP_VAL__2 > 0)  ? ( (C  >= __FN_FORSTART_VAL__2) && (C  <= __FN_FOREND_VAL__2) ) : ( (C  <= __FN_FORSTART_VAL__2) && (C  >= __FN_FOREND_VAL__2) ) ; C  += (ushort)__FN_FORSTEP_VAL__2) 
                        { 
                        __context__.SourceCodeLine = 237;
                        _SplusNVRAM.NIVEAUX [ S , C] = (ushort) ( DEFAUT[ S , C ] ) ; 
                        __context__.SourceCodeLine = 237;
                        } 
                    
                    } 
                
                __context__.SourceCodeLine = 237;
                } 
            
            
            }
            
        private CrestronString TEXTE10 (  SplusExecutionContext __context__, ushort X ) 
            { 
            CrestronString T;
            T  = new CrestronString( Crestron.Logos.SplusObjects.CrestronStringEncoding.eEncodingASCII, 16, this );
            
            
            __context__.SourceCodeLine = 243;
            MakeString ( T , "{0:d}.{1:d}", (ushort)(X / 10), (ushort)Mod( X , 10 )) ; 
            __context__.SourceCodeLine = 244;
            return ( T ) ; 
            
            }
            
        private void MAJCVC (  SplusExecutionContext __context__ ) 
            { 
            CrestronString T;
            T  = new CrestronString( Crestron.Logos.SplusObjects.CrestronStringEncoding.eEncodingASCII, 16, this );
            
            
            __context__.SourceCodeLine = 250;
            FB_CONSIGNE  .Value = (ushort) ( CONSIGNE ) ; 
            __context__.SourceCodeLine = 251;
            PILOTE_CONSIGNE  .Value = (ushort) ( CONSIGNE ) ; 
            __context__.SourceCodeLine = 252;
            TXT_CONSIGNE__DOLLAR__  .UpdateValue ( TEXTE10 (  __context__ , (ushort)( CONSIGNE ))  ) ; 
            __context__.SourceCodeLine = 253;
            FB_CVC_MARCHE  .Value = (ushort) ( MARCHE ) ; 
            __context__.SourceCodeLine = 254;
            FB_CVC_ARRET  .Value = (ushort) ( Functions.Not( MARCHE ) ) ; 
            __context__.SourceCodeLine = 255;
            PILOTE_CVC_MARCHE  .Value = (ushort) ( MARCHE ) ; 
            __context__.SourceCodeLine = 256;
            FB_VENTILATION_A  .Value = (ushort) ( VENT ) ; 
            __context__.SourceCodeLine = 257;
            PILOTE_VENTILATION  .Value = (ushort) ( VENT ) ; 
            __context__.SourceCodeLine = 258;
            FB_VENTILATION [ 1]  .Value = (ushort) ( Functions.BoolToInt (VENT == 0) ) ; 
            __context__.SourceCodeLine = 258;
            FB_VENTILATION [ 2]  .Value = (ushort) ( Functions.BoolToInt (VENT == 1) ) ; 
            __context__.SourceCodeLine = 258;
            FB_VENTILATION [ 3]  .Value = (ushort) ( Functions.BoolToInt (VENT == 2) ) ; 
            __context__.SourceCodeLine = 258;
            FB_VENTILATION [ 4]  .Value = (ushort) ( Functions.BoolToInt (VENT == 3) ) ; 
            __context__.SourceCodeLine = 259;
            if ( Functions.TestForTrue  ( ( TEMPRECUE)  ) ) 
                { 
                __context__.SourceCodeLine = 259;
                TXT_TEMPERATURE__DOLLAR__  .UpdateValue ( TEXTE10 (  __context__ , (ushort)( TEMPMES ))  ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 259;
                TXT_TEMPERATURE__DOLLAR__  .UpdateValue ( "--"  ) ; 
                } 
            
            __context__.SourceCodeLine = 260;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( Functions.Length( RETOUR_MODE__DOLLAR__ ) > 0 ))  ) ) 
                { 
                __context__.SourceCodeLine = 260;
                TXT_MODE__DOLLAR__  .UpdateValue ( RETOUR_MODE__DOLLAR__  ) ; 
                } 
            
            else 
                {
                __context__.SourceCodeLine = 261;
                if ( Functions.TestForTrue  ( ( Functions.Not( MARCHE ))  ) ) 
                    { 
                    __context__.SourceCodeLine = 261;
                    TXT_MODE__DOLLAR__  .UpdateValue ( "ARRET"  ) ; 
                    } 
                
                else 
                    {
                    __context__.SourceCodeLine = 262;
                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (Functions.TestForTrue ( TEMPRECUE ) && Functions.TestForTrue ( Functions.BoolToInt ( CONSIGNE > TEMPMES ) )) ))  ) ) 
                        { 
                        __context__.SourceCodeLine = 262;
                        TXT_MODE__DOLLAR__  .UpdateValue ( "CHAUFFAGE"  ) ; 
                        } 
                    
                    else 
                        {
                        __context__.SourceCodeLine = 263;
                        if ( Functions.TestForTrue  ( ( TEMPRECUE)  ) ) 
                            { 
                            __context__.SourceCodeLine = 263;
                            TXT_MODE__DOLLAR__  .UpdateValue ( "CLIMATISATION"  ) ; 
                            } 
                        
                        else 
                            { 
                            __context__.SourceCodeLine = 264;
                            TXT_MODE__DOLLAR__  .UpdateValue ( ""  ) ; 
                            } 
                        
                        }
                    
                    }
                
                }
            
            
            }
            
        private void MAJWELLNESS (  SplusExecutionContext __context__ ) 
            { 
            CrestronString T;
            T  = new CrestronString( Crestron.Logos.SplusObjects.CrestronStringEncoding.eEncodingASCII, 16, this );
            
            
            __context__.SourceCodeLine = 270;
            FB_SAUNA_MARCHE  .Value = (ushort) ( SAUNAON ) ; 
            __context__.SourceCodeLine = 270;
            FB_SAUNA_ARRET  .Value = (ushort) ( Functions.Not( SAUNAON ) ) ; 
            __context__.SourceCodeLine = 270;
            PILOTE_SAUNA_MARCHE  .Value = (ushort) ( SAUNAON ) ; 
            __context__.SourceCodeLine = 271;
            FB_HAMMAM_MARCHE  .Value = (ushort) ( HAMMAMON ) ; 
            __context__.SourceCodeLine = 271;
            FB_HAMMAM_ARRET  .Value = (ushort) ( Functions.Not( HAMMAMON ) ) ; 
            __context__.SourceCodeLine = 271;
            PILOTE_HAMMAM_MARCHE  .Value = (ushort) ( HAMMAMON ) ; 
            __context__.SourceCodeLine = 272;
            FB_SAUNA_CONSIGNE  .Value = (ushort) ( SAUNACONS ) ; 
            __context__.SourceCodeLine = 272;
            PILOTE_SAUNA_CONSIGNE  .Value = (ushort) ( SAUNACONS ) ; 
            __context__.SourceCodeLine = 272;
            TXT_SAUNA_CONSIGNE__DOLLAR__  .UpdateValue ( TEXTE10 (  __context__ , (ushort)( SAUNACONS ))  ) ; 
            __context__.SourceCodeLine = 273;
            FB_HAMMAM_CONSIGNE  .Value = (ushort) ( HAMMAMCONS ) ; 
            __context__.SourceCodeLine = 273;
            PILOTE_HAMMAM_CONSIGNE  .Value = (ushort) ( HAMMAMCONS ) ; 
            __context__.SourceCodeLine = 274;
            MakeString ( T , "{0:d}", (ushort)HAMMAMCONS) ; 
            __context__.SourceCodeLine = 274;
            TXT_HAMMAM_CONSIGNE__DOLLAR__  .UpdateValue ( T  ) ; 
            __context__.SourceCodeLine = 275;
            FB_SAUNA_MESURE  .Value = (ushort) ( SAUNAMES ) ; 
            __context__.SourceCodeLine = 275;
            FB_HAMMAM_MESURE  .Value = (ushort) ( HAMMAMMES ) ; 
            __context__.SourceCodeLine = 276;
            if ( Functions.TestForTrue  ( ( SAUNARECUE)  ) ) 
                { 
                __context__.SourceCodeLine = 276;
                TXT_SAUNA_MESURE__DOLLAR__  .UpdateValue ( TEXTE10 (  __context__ , (ushort)( SAUNAMES ))  ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 276;
                TXT_SAUNA_MESURE__DOLLAR__  .UpdateValue ( "--"  ) ; 
                } 
            
            __context__.SourceCodeLine = 277;
            if ( Functions.TestForTrue  ( ( HAMMAMRECUE)  ) ) 
                { 
                __context__.SourceCodeLine = 277;
                MakeString ( T , "{0:d}", (ushort)HAMMAMMES) ; 
                __context__.SourceCodeLine = 277;
                TXT_HAMMAM_MESURE__DOLLAR__  .UpdateValue ( T  ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 277;
                TXT_HAMMAM_MESURE__DOLLAR__  .UpdateValue ( "--"  ) ; 
                } 
            
            
            }
            
        private void MAJAV (  SplusExecutionContext __context__ ) 
            { 
            ushort I = 0;
            
            
            __context__.SourceCodeLine = 283;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)5; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( I  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (I  >= __FN_FORSTART_VAL__1) && (I  <= __FN_FOREND_VAL__1) ) : ( (I  <= __FN_FORSTART_VAL__1) && (I  >= __FN_FOREND_VAL__1) ) ; I  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 283;
                FB_SOURCE [ I]  .Value = (ushort) ( Functions.BoolToInt (SOURCE == (I - 1)) ) ; 
                __context__.SourceCodeLine = 283;
                } 
            
            __context__.SourceCodeLine = 284;
            FB_SOURCE_ACTIVE  .Value = (ushort) ( SOURCE ) ; 
            __context__.SourceCodeLine = 284;
            PILOTE_SOURCE  .Value = (ushort) ( SOURCE ) ; 
            __context__.SourceCodeLine = 285;
            FB_MUSIQUE  .Value = (ushort) ( MUSIQUE ) ; 
            __context__.SourceCodeLine = 285;
            FB_SUIVRE_VIDEO  .Value = (ushort) ( Functions.Not( MUSIQUE ) ) ; 
            __context__.SourceCodeLine = 285;
            PILOTE_MUSIQUE  .Value = (ushort) ( MUSIQUE ) ; 
            __context__.SourceCodeLine = 286;
            if ( Functions.TestForTrue  ( ( MUSIQUE)  ) ) 
                { 
                __context__.SourceCodeLine = 286;
                FB_SOURCE_AUDIO  .Value = (ushort) ( 5 ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 286;
                FB_SOURCE_AUDIO  .Value = (ushort) ( SOURCE ) ; 
                } 
            
            __context__.SourceCodeLine = 287;
            FB_AV_OFF  .Value = (ushort) ( Functions.BoolToInt ( (Functions.TestForTrue ( Functions.BoolToInt (SOURCE == 0) ) && Functions.TestForTrue ( Functions.BoolToInt (MUSIQUE == 0) )) ) ) ; 
            __context__.SourceCodeLine = 288;
            FB_MUTE  .Value = (ushort) ( MUTE ) ; 
            __context__.SourceCodeLine = 288;
            PILOTE_MUTE  .Value = (ushort) ( MUTE ) ; 
            __context__.SourceCodeLine = 289;
            FB_VOLUME  .Value = (ushort) ( VOLUME ) ; 
            __context__.SourceCodeLine = 289;
            PILOTE_VOLUME  .Value = (ushort) ( VOLUME ) ; 
            __context__.SourceCodeLine = 290;
            FB_VOLUME_MEDIA  .Value = (ushort) ( VOLUMEMEDIA ) ; 
            __context__.SourceCodeLine = 290;
            PILOTE_VOLUME_MEDIA  .Value = (ushort) ( VOLUMEMEDIA ) ; 
            
            }
            
        private void POSERCIRCUIT (  SplusExecutionContext __context__, ushort C , ushort X ) 
            { 
            
            __context__.SourceCodeLine = 295;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (Functions.TestForTrue ( Functions.BoolToInt ( C < 1 ) ) || Functions.TestForTrue ( Functions.BoolToInt ( C > 20 ) )) ))  ) ) 
                {
                __context__.SourceCodeLine = 295;
                return ; 
                }
            
            __context__.SourceCodeLine = 296;
            NIVEAU [ C] = (ushort) ( X ) ; 
            __context__.SourceCodeLine = 296;
            FB_CIRCUIT [ C]  .Value = (ushort) ( X ) ; 
            __context__.SourceCodeLine = 296;
            PILOTE_CIRCUIT [ C]  .Value = (ushort) ( X ) ; 
            
            }
            
        private void MAJSCENES (  SplusExecutionContext __context__ ) 
            { 
            ushort S = 0;
            
            
            __context__.SourceCodeLine = 302;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)4; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( S  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (S  >= __FN_FORSTART_VAL__1) && (S  <= __FN_FOREND_VAL__1) ) : ( (S  <= __FN_FORSTART_VAL__1) && (S  >= __FN_FOREND_VAL__1) ) ; S  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 302;
                FB_SCENE [ S]  .Value = (ushort) ( Functions.BoolToInt (SCENEACTIVE == S) ) ; 
                __context__.SourceCodeLine = 302;
                FB_MEMORISEE [ S]  .Value = (ushort) ( _SplusNVRAM.MEMORISEE[ S ] ) ; 
                __context__.SourceCodeLine = 302;
                } 
            
            
            }
            
        private void RAPPELSCENE (  SplusExecutionContext __context__, ushort S ) 
            { 
            ushort C = 0;
            
            
            __context__.SourceCodeLine = 308;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)NBCIRCUITS; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( C  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (C  >= __FN_FORSTART_VAL__1) && (C  <= __FN_FOREND_VAL__1) ) : ( (C  <= __FN_FORSTART_VAL__1) && (C  >= __FN_FOREND_VAL__1) ) ; C  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 308;
                POSERCIRCUIT (  __context__ , (ushort)( C ), (ushort)( _SplusNVRAM.NIVEAUX[ S , C ] )) ; 
                __context__.SourceCodeLine = 308;
                } 
            
            __context__.SourceCodeLine = 309;
            SCENEACTIVE = (ushort) ( S ) ; 
            __context__.SourceCodeLine = 309;
            MAJSCENES (  __context__  ) ; 
            __context__.SourceCodeLine = 310;
            Functions.Pulse ( 30, PILOTE_SCENE [ S] ) ; 
            
            }
            
        private void TOUSMOTEURS (  SplusExecutionContext __context__, ushort SENS ) 
            { 
            ushort I = 0;
            
            
            __context__.SourceCodeLine = 316;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)12; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( I  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (I  >= __FN_FORSTART_VAL__1) && (I  <= __FN_FOREND_VAL__1) ) : ( (I  <= __FN_FORSTART_VAL__1) && (I  >= __FN_FOREND_VAL__1) ) ; I  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 318;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( TYPEMOTEUR[ I ] > 0 ))  ) ) 
                    { 
                    __context__.SourceCodeLine = 320;
                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (SENS == 1))  ) ) 
                        { 
                        __context__.SourceCodeLine = 320;
                        Functions.Pulse ( 50, PILOTE_MONTER [ I] ) ; 
                        } 
                    
                    else 
                        { 
                        __context__.SourceCodeLine = 320;
                        Functions.Pulse ( 50, PILOTE_DESCENDRE [ I] ) ; 
                        } 
                    
                    } 
                
                __context__.SourceCodeLine = 316;
                } 
            
            
            }
            
        private void TOUSCIRCUITS (  SplusExecutionContext __context__, ushort X ) 
            { 
            ushort C = 0;
            
            
            __context__.SourceCodeLine = 328;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)NBCIRCUITS; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( C  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (C  >= __FN_FORSTART_VAL__1) && (C  <= __FN_FOREND_VAL__1) ) : ( (C  <= __FN_FORSTART_VAL__1) && (C  >= __FN_FOREND_VAL__1) ) ; C  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 328;
                POSERCIRCUIT (  __context__ , (ushort)( C ), (ushort)( X )) ; 
                __context__.SourceCodeLine = 328;
                } 
            
            __context__.SourceCodeLine = 329;
            SCENEACTIVE = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 329;
            MAJSCENES (  __context__  ) ; 
            
            }
            
        object BTN_SCENE_OnPush_0 ( Object __EventInfo__ )
        
            { 
            Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
            try
            {
                SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
                
                __context__.SourceCodeLine = 333;
                RAPPELSCENE (  __context__ , (ushort)( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) )) ; 
                
                
            }
            catch(Exception e) { ObjectCatchHandler(e); }
            finally { ObjectFinallyHandler( __SignalEventArg__ ); }
            return this;
            
        }
        
    object BTN_MEMORISER_OnPush_1 ( Object __EventInfo__ )
    
        { 
        Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
        try
        {
            SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
            ushort S = 0;
            ushort C = 0;
            
            
            __context__.SourceCodeLine = 337;
            S = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
            __context__.SourceCodeLine = 338;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)20; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( C  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (C  >= __FN_FORSTART_VAL__1) && (C  <= __FN_FOREND_VAL__1) ) : ( (C  <= __FN_FORSTART_VAL__1) && (C  >= __FN_FOREND_VAL__1) ) ; C  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 338;
                _SplusNVRAM.NIVEAUX [ S , C] = (ushort) ( NIVEAU[ C ] ) ; 
                __context__.SourceCodeLine = 338;
                } 
            
            __context__.SourceCodeLine = 339;
            _SplusNVRAM.MEMORISEE [ S] = (ushort) ( 1 ) ; 
            __context__.SourceCodeLine = 339;
            MAJSCENES (  __context__  ) ; 
            
            
        }
        catch(Exception e) { ObjectCatchHandler(e); }
        finally { ObjectFinallyHandler( __SignalEventArg__ ); }
        return this;
        
    }
    
object IN_CIRCUIT_OnChange_2 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort C = 0;
        
        
        __context__.SourceCodeLine = 344;
        C = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 345;
        POSERCIRCUIT (  __context__ , (ushort)( C ), (ushort)( IN_CIRCUIT[ C ] .UshortValue )) ; 
        __context__.SourceCodeLine = 346;
        SCENEACTIVE = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 346;
        MAJSCENES (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_CIRCUIT_OnChange_3 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort C = 0;
        
        
        __context__.SourceCodeLine = 351;
        C = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 352;
        NIVEAU [ C] = (ushort) ( RETOUR_CIRCUIT[ C ] .UshortValue ) ; 
        __context__.SourceCodeLine = 352;
        FB_CIRCUIT [ C]  .Value = (ushort) ( RETOUR_CIRCUIT[ C ] .UshortValue ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CONSIGNE_PLUS_OnPush_4 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 356;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (CONSIGNE + CONSPAS) <= CONSMAX ))  ) ) 
            {
            __context__.SourceCodeLine = 356;
            CONSIGNE = (ushort) ( (CONSIGNE + CONSPAS) ) ; 
            }
        
        __context__.SourceCodeLine = 356;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CONSIGNE_MOINS_OnPush_5 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 357;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( CONSIGNE >= (CONSMIN + CONSPAS) ))  ) ) 
            {
            __context__.SourceCodeLine = 357;
            CONSIGNE = (ushort) ( (CONSIGNE - CONSPAS) ) ; 
            }
        
        __context__.SourceCodeLine = 357;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_CONSIGNE_OnChange_6 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 358;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (Functions.TestForTrue ( Functions.BoolToInt ( IN_CONSIGNE  .UshortValue >= CONSMIN ) ) && Functions.TestForTrue ( Functions.BoolToInt ( IN_CONSIGNE  .UshortValue <= CONSMAX ) )) ))  ) ) 
            { 
            __context__.SourceCodeLine = 358;
            CONSIGNE = (ushort) ( IN_CONSIGNE  .UshortValue ) ; 
            __context__.SourceCodeLine = 358;
            MAJCVC (  __context__  ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CVC_MARCHE_OnPush_7 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 359;
        MARCHE = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 359;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CVC_ARRET_OnPush_8 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 360;
        MARCHE = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 360;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_VENTILATION_OnPush_9 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 361;
        VENT = (ushort) ( (Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) - 1) ) ; 
        __context__.SourceCodeLine = 361;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_VENTILATION_OnChange_10 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 362;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( IN_VENTILATION  .UshortValue <= 3 ))  ) ) 
            { 
            __context__.SourceCodeLine = 362;
            VENT = (ushort) ( IN_VENTILATION  .UshortValue ) ; 
            __context__.SourceCodeLine = 362;
            MAJCVC (  __context__  ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_TEMPERATURE_OnChange_11 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 363;
        TEMPMES = (ushort) ( RETOUR_TEMPERATURE  .UshortValue ) ; 
        __context__.SourceCodeLine = 363;
        TEMPRECUE = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 363;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_MODE__DOLLAR___OnChange_12 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 364;
        MAJCVC (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SAUNA_MARCHE_OnPush_13 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 367;
        SAUNAON = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 367;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SAUNA_ARRET_OnPush_14 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 368;
        SAUNAON = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 368;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SAUNA_PLUS_OnPush_15 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 369;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (SAUNACONS + 10) <= 1000 ))  ) ) 
            {
            __context__.SourceCodeLine = 369;
            SAUNACONS = (ushort) ( (SAUNACONS + 10) ) ; 
            }
        
        __context__.SourceCodeLine = 369;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SAUNA_MOINS_OnPush_16 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 370;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( SAUNACONS >= 610 ))  ) ) 
            {
            __context__.SourceCodeLine = 370;
            SAUNACONS = (ushort) ( (SAUNACONS - 10) ) ; 
            }
        
        __context__.SourceCodeLine = 370;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_HAMMAM_MARCHE_OnPush_17 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 371;
        HAMMAMON = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 371;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_HAMMAM_ARRET_OnPush_18 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 372;
        HAMMAMON = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 372;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_HAMMAM_PLUS_OnPush_19 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 373;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( HAMMAMCONS < 100 ))  ) ) 
            {
            __context__.SourceCodeLine = 373;
            HAMMAMCONS = (ushort) ( (HAMMAMCONS + 1) ) ; 
            }
        
        __context__.SourceCodeLine = 373;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_HAMMAM_MOINS_OnPush_20 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 374;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( HAMMAMCONS > 90 ))  ) ) 
            {
            __context__.SourceCodeLine = 374;
            HAMMAMCONS = (ushort) ( (HAMMAMCONS - 1) ) ; 
            }
        
        __context__.SourceCodeLine = 374;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_SAUNA_CONSIGNE_OnChange_21 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 375;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (Functions.TestForTrue ( Functions.BoolToInt ( IN_SAUNA_CONSIGNE  .UshortValue >= 600 ) ) && Functions.TestForTrue ( Functions.BoolToInt ( IN_SAUNA_CONSIGNE  .UshortValue <= 1000 ) )) ))  ) ) 
            { 
            __context__.SourceCodeLine = 375;
            SAUNACONS = (ushort) ( IN_SAUNA_CONSIGNE  .UshortValue ) ; 
            __context__.SourceCodeLine = 375;
            MAJWELLNESS (  __context__  ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_HAMMAM_CONSIGNE_OnChange_22 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 376;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( (Functions.TestForTrue ( Functions.BoolToInt ( IN_HAMMAM_CONSIGNE  .UshortValue >= 90 ) ) && Functions.TestForTrue ( Functions.BoolToInt ( IN_HAMMAM_CONSIGNE  .UshortValue <= 100 ) )) ))  ) ) 
            { 
            __context__.SourceCodeLine = 376;
            HAMMAMCONS = (ushort) ( IN_HAMMAM_CONSIGNE  .UshortValue ) ; 
            __context__.SourceCodeLine = 376;
            MAJWELLNESS (  __context__  ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_SAUNA_MESURE_OnChange_23 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 377;
        SAUNAMES = (ushort) ( RETOUR_SAUNA_MESURE  .UshortValue ) ; 
        __context__.SourceCodeLine = 377;
        SAUNARECUE = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 377;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_HAMMAM_MESURE_OnChange_24 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 378;
        HAMMAMMES = (ushort) ( RETOUR_HAMMAM_MESURE  .UshortValue ) ; 
        __context__.SourceCodeLine = 378;
        HAMMAMRECUE = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 378;
        MAJWELLNESS (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MONTER_OnPush_25 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 381;
        PILOTE_MONTER [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MONTER_OnRelease_26 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 382;
        PILOTE_MONTER [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_STOP_OnPush_27 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 383;
        PILOTE_STOP [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_STOP_OnRelease_28 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 384;
        PILOTE_STOP [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_DESCENDRE_OnPush_29 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 385;
        PILOTE_DESCENDRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_DESCENDRE_OnRelease_30 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 386;
        PILOTE_DESCENDRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_HORAIRE_OnPush_31 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 387;
        PILOTE_LAM_HORAIRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_HORAIRE_OnRelease_32 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 388;
        PILOTE_LAM_HORAIRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_STOP_OnPush_33 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 389;
        PILOTE_LAM_STOP [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_STOP_OnRelease_34 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 390;
        PILOTE_LAM_STOP [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_ANTIHORAIRE_OnPush_35 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 391;
        PILOTE_LAM_ANTIHORAIRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 1 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_LAM_ANTIHORAIRE_OnRelease_36 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 392;
        PILOTE_LAM_ANTIHORAIRE [ Functions.GetLastModifiedArrayIndex( __SignalEventArg__ )]  .Value = (ushort) ( 0 ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_GROUPE_OnPush_37 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort G = 0;
        ushort FAMILLE = 0;
        ushort ACTION = 0;
        ushort I = 0;
        
        
        __context__.SourceCodeLine = 396;
        G = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 397;
        FAMILLE = (ushort) ( (((G - 1) / 3) + 1) ) ; 
        __context__.SourceCodeLine = 398;
        ACTION = (ushort) ( (Mod( (G - 1) , 3 ) + 1) ) ; 
        __context__.SourceCodeLine = 399;
        Functions.Pulse ( 50, PILOTE_GROUPE [ G] ) ; 
        __context__.SourceCodeLine = 400;
        ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
        ushort __FN_FOREND_VAL__1 = (ushort)12; 
        int __FN_FORSTEP_VAL__1 = (int)1; 
        for ( I  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (I  >= __FN_FORSTART_VAL__1) && (I  <= __FN_FOREND_VAL__1) ) : ( (I  <= __FN_FORSTART_VAL__1) && (I  >= __FN_FOREND_VAL__1) ) ; I  += (ushort)__FN_FORSTEP_VAL__1) 
            { 
            __context__.SourceCodeLine = 402;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (TYPEMOTEUR[ I ] == FAMILLE))  ) ) 
                { 
                __context__.SourceCodeLine = 404;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (ACTION == 1))  ) ) 
                    { 
                    __context__.SourceCodeLine = 404;
                    Functions.Pulse ( 50, PILOTE_MONTER [ I] ) ; 
                    } 
                
                else 
                    {
                    __context__.SourceCodeLine = 405;
                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (ACTION == 3))  ) ) 
                        { 
                        __context__.SourceCodeLine = 405;
                        Functions.Pulse ( 50, PILOTE_DESCENDRE [ I] ) ; 
                        } 
                    
                    }
                
                } 
            
            __context__.SourceCodeLine = 400;
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SCENE_STORES_OnPush_38 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort I = 0;
        
        
        __context__.SourceCodeLine = 412;
        STORESSCENE = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 413;
        ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
        ushort __FN_FOREND_VAL__1 = (ushort)4; 
        int __FN_FORSTEP_VAL__1 = (int)1; 
        for ( I  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (I  >= __FN_FORSTART_VAL__1) && (I  <= __FN_FOREND_VAL__1) ) : ( (I  <= __FN_FORSTART_VAL__1) && (I  >= __FN_FOREND_VAL__1) ) ; I  += (ushort)__FN_FORSTEP_VAL__1) 
            { 
            __context__.SourceCodeLine = 413;
            FB_SCENE_STORES [ I]  .Value = (ushort) ( Functions.BoolToInt (STORESSCENE == I) ) ; 
            __context__.SourceCodeLine = 413;
            } 
        
        __context__.SourceCodeLine = 414;
        Functions.Pulse ( 50, PILOTE_SCENE_STORES [ STORESSCENE] ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SOURCE_OnPush_39 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 418;
        SOURCE = (ushort) ( (Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) - 1) ) ; 
        __context__.SourceCodeLine = 418;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (SOURCE == 0))  ) ) 
            {
            __context__.SourceCodeLine = 418;
            MUSIQUE = (ushort) ( 0 ) ; 
            }
        
        __context__.SourceCodeLine = 418;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_SOURCE_OnChange_40 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 419;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( IN_SOURCE  .UshortValue <= 4 ))  ) ) 
            { 
            __context__.SourceCodeLine = 419;
            SOURCE = (ushort) ( IN_SOURCE  .UshortValue ) ; 
            __context__.SourceCodeLine = 419;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (SOURCE == 0))  ) ) 
                {
                __context__.SourceCodeLine = 419;
                MUSIQUE = (ushort) ( 0 ) ; 
                }
            
            __context__.SourceCodeLine = 419;
            MAJAV (  __context__  ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MUSIQUE_OnPush_41 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 420;
        MUSIQUE = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 420;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_SUIVRE_VIDEO_OnPush_42 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 421;
        MUSIQUE = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 421;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MUTE_OnPush_43 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 422;
        MUTE = (ushort) ( Functions.Not( MUTE ) ) ; 
        __context__.SourceCodeLine = 422;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_AV_OFF_OnPush_44 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 423;
        SOURCE = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 423;
        MUSIQUE = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 423;
        MAJAV (  __context__  ) ; 
        __context__.SourceCodeLine = 423;
        Functions.Pulse ( 50, PILOTE_AV_OFF ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_VOLUME_OnChange_45 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 424;
        VOLUME = (ushort) ( IN_VOLUME  .UshortValue ) ; 
        __context__.SourceCodeLine = 424;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object IN_VOLUME_MEDIA_OnChange_46 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 425;
        VOLUMEMEDIA = (ushort) ( IN_VOLUME_MEDIA  .UshortValue ) ; 
        __context__.SourceCodeLine = 425;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MEDIA_LECTURE_OnPush_47 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 426;
        Functions.Pulse ( 20, PILOTE_MEDIA_LECTURE ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MEDIA_SUIVANT_OnPush_48 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 427;
        Functions.Pulse ( 20, PILOTE_MEDIA_SUIVANT ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_MEDIA_PRECEDENT_OnPush_49 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 428;
        Functions.Pulse ( 20, PILOTE_MEDIA_PRECEDENT ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object G_OnPush_50 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort G = 0;
        
        
        __context__.SourceCodeLine = 434;
        G = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 435;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 1))  ) ) 
            { 
            __context__.SourceCodeLine = 435;
            TOUSCIRCUITS (  __context__ , (ushort)( 65535 )) ; 
            } 
        
        else 
            {
            __context__.SourceCodeLine = 436;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 2))  ) ) 
                { 
                __context__.SourceCodeLine = 436;
                TOUSCIRCUITS (  __context__ , (ushort)( 0 )) ; 
                } 
            
            else 
                {
                __context__.SourceCodeLine = 437;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 3))  ) ) 
                    { 
                    __context__.SourceCodeLine = 437;
                    TOUSCIRCUITS (  __context__ , (ushort)( 32768 )) ; 
                    } 
                
                else 
                    {
                    __context__.SourceCodeLine = 438;
                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 4))  ) ) 
                        { 
                        __context__.SourceCodeLine = 438;
                        TOUSMOTEURS (  __context__ , (ushort)( 1 )) ; 
                        } 
                    
                    else 
                        {
                        __context__.SourceCodeLine = 439;
                        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 5))  ) ) 
                            { 
                            __context__.SourceCodeLine = 439;
                            TOUSMOTEURS (  __context__ , (ushort)( 0 )) ; 
                            } 
                        
                        else 
                            {
                            __context__.SourceCodeLine = 440;
                            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 7))  ) ) 
                                { 
                                __context__.SourceCodeLine = 440;
                                CONSIGNE = (ushort) ( 210 ) ; 
                                __context__.SourceCodeLine = 440;
                                MARCHE = (ushort) ( 1 ) ; 
                                __context__.SourceCodeLine = 440;
                                MAJCVC (  __context__  ) ; 
                                } 
                            
                            else 
                                {
                                __context__.SourceCodeLine = 441;
                                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 8))  ) ) 
                                    { 
                                    __context__.SourceCodeLine = 441;
                                    CONSIGNE = (ushort) ( 180 ) ; 
                                    __context__.SourceCodeLine = 441;
                                    MARCHE = (ushort) ( 1 ) ; 
                                    __context__.SourceCodeLine = 441;
                                    MAJCVC (  __context__  ) ; 
                                    } 
                                
                                else 
                                    {
                                    __context__.SourceCodeLine = 442;
                                    if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 9))  ) ) 
                                        { 
                                        __context__.SourceCodeLine = 442;
                                        CONSIGNE = (ushort) ( 120 ) ; 
                                        __context__.SourceCodeLine = 442;
                                        MARCHE = (ushort) ( 1 ) ; 
                                        __context__.SourceCodeLine = 442;
                                        MAJCVC (  __context__  ) ; 
                                        } 
                                    
                                    else 
                                        {
                                        __context__.SourceCodeLine = 443;
                                        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (G == 10))  ) ) 
                                            { 
                                            __context__.SourceCodeLine = 443;
                                            CONSIGNE = (ushort) ( 120 ) ; 
                                            __context__.SourceCodeLine = 443;
                                            MARCHE = (ushort) ( 1 ) ; 
                                            __context__.SourceCodeLine = 443;
                                            MAJCVC (  __context__  ) ; 
                                            __context__.SourceCodeLine = 443;
                                            TOUSCIRCUITS (  __context__ , (ushort)( 0 )) ; 
                                            __context__.SourceCodeLine = 443;
                                            TOUSMOTEURS (  __context__ , (ushort)( 0 )) ; 
                                            } 
                                        
                                        }
                                    
                                    }
                                
                                }
                            
                            }
                        
                        }
                    
                    }
                
                }
            
            }
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

public override object FunctionMain (  object __obj__ ) 
    { 
    ushort S = 0;
    
    try
    {
        SplusExecutionContext __context__ = SplusFunctionMainStartCode();
        
        __context__.SourceCodeLine = 449;
        CONFIGPIECE (  __context__  ) ; 
        __context__.SourceCodeLine = 450;
        WaitForInitializationComplete ( ) ; 
        __context__.SourceCodeLine = 451;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (_SplusNVRAM.INITIALISE != EMPREINTE))  ) ) 
            { 
            __context__.SourceCodeLine = 451;
            DEFAUTSSCENES (  __context__  ) ; 
            __context__.SourceCodeLine = 451;
            _SplusNVRAM.INITIALISE = (ushort) ( EMPREINTE ) ; 
            } 
        
        __context__.SourceCodeLine = 452;
        CONSIGNE = (ushort) ( CONSINIT ) ; 
        __context__.SourceCodeLine = 452;
        MARCHE = (ushort) ( MARCHEINIT ) ; 
        __context__.SourceCodeLine = 452;
        VENT = (ushort) ( VENTINIT ) ; 
        __context__.SourceCodeLine = 453;
        SAUNACONS = (ushort) ( 800 ) ; 
        __context__.SourceCodeLine = 453;
        HAMMAMCONS = (ushort) ( 95 ) ; 
        __context__.SourceCodeLine = 454;
        MAJSCENES (  __context__  ) ; 
        __context__.SourceCodeLine = 454;
        MAJCVC (  __context__  ) ; 
        __context__.SourceCodeLine = 454;
        MAJWELLNESS (  __context__  ) ; 
        __context__.SourceCodeLine = 454;
        MAJAV (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler(); }
    return __obj__;
    }
    

public override void LogosSplusInitialize()
{
    SocketInfo __socketinfo__ = new SocketInfo( 1, this );
    InitialParametersClass.ResolveHostName = __socketinfo__.ResolveHostName;
    _SplusNVRAM = new SplusNVRAM( this );
    _SplusNVRAM.MEMORISEE  = new ushort[ 5 ];
    NIVEAU  = new ushort[ 21 ];
    TYPEMOTEUR  = new ushort[ 13 ];
    _SplusNVRAM.NIVEAUX  = new ushort[ 5,21 ];
    DEFAUT  = new ushort[ 5,21 ];
    
    BTN_CONSIGNE_PLUS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CONSIGNE_PLUS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_CONSIGNE_PLUS__DigitalInput__, BTN_CONSIGNE_PLUS );
    
    BTN_CONSIGNE_MOINS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CONSIGNE_MOINS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_CONSIGNE_MOINS__DigitalInput__, BTN_CONSIGNE_MOINS );
    
    BTN_CVC_MARCHE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CVC_MARCHE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_CVC_MARCHE__DigitalInput__, BTN_CVC_MARCHE );
    
    BTN_CVC_ARRET = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CVC_ARRET__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_CVC_ARRET__DigitalInput__, BTN_CVC_ARRET );
    
    BTN_SAUNA_MARCHE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SAUNA_MARCHE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_SAUNA_MARCHE__DigitalInput__, BTN_SAUNA_MARCHE );
    
    BTN_SAUNA_ARRET = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SAUNA_ARRET__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_SAUNA_ARRET__DigitalInput__, BTN_SAUNA_ARRET );
    
    BTN_SAUNA_PLUS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SAUNA_PLUS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_SAUNA_PLUS__DigitalInput__, BTN_SAUNA_PLUS );
    
    BTN_SAUNA_MOINS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SAUNA_MOINS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_SAUNA_MOINS__DigitalInput__, BTN_SAUNA_MOINS );
    
    BTN_HAMMAM_MARCHE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_HAMMAM_MARCHE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_HAMMAM_MARCHE__DigitalInput__, BTN_HAMMAM_MARCHE );
    
    BTN_HAMMAM_ARRET = new Crestron.Logos.SplusObjects.DigitalInput( BTN_HAMMAM_ARRET__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_HAMMAM_ARRET__DigitalInput__, BTN_HAMMAM_ARRET );
    
    BTN_HAMMAM_PLUS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_HAMMAM_PLUS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_HAMMAM_PLUS__DigitalInput__, BTN_HAMMAM_PLUS );
    
    BTN_HAMMAM_MOINS = new Crestron.Logos.SplusObjects.DigitalInput( BTN_HAMMAM_MOINS__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_HAMMAM_MOINS__DigitalInput__, BTN_HAMMAM_MOINS );
    
    BTN_MUSIQUE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MUSIQUE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_MUSIQUE__DigitalInput__, BTN_MUSIQUE );
    
    BTN_SUIVRE_VIDEO = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SUIVRE_VIDEO__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_SUIVRE_VIDEO__DigitalInput__, BTN_SUIVRE_VIDEO );
    
    BTN_MUTE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MUTE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_MUTE__DigitalInput__, BTN_MUTE );
    
    BTN_AV_OFF = new Crestron.Logos.SplusObjects.DigitalInput( BTN_AV_OFF__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_AV_OFF__DigitalInput__, BTN_AV_OFF );
    
    BTN_MEDIA_LECTURE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MEDIA_LECTURE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_MEDIA_LECTURE__DigitalInput__, BTN_MEDIA_LECTURE );
    
    BTN_MEDIA_SUIVANT = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MEDIA_SUIVANT__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_MEDIA_SUIVANT__DigitalInput__, BTN_MEDIA_SUIVANT );
    
    BTN_MEDIA_PRECEDENT = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MEDIA_PRECEDENT__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_MEDIA_PRECEDENT__DigitalInput__, BTN_MEDIA_PRECEDENT );
    
    BTN_SCENE = new InOutArray<DigitalInput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        BTN_SCENE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SCENE__DigitalInput__ + i, BTN_SCENE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_SCENE__DigitalInput__ + i, BTN_SCENE[i+1] );
    }
    
    BTN_MEMORISER = new InOutArray<DigitalInput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        BTN_MEMORISER[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MEMORISER__DigitalInput__ + i, BTN_MEMORISER__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_MEMORISER__DigitalInput__ + i, BTN_MEMORISER[i+1] );
    }
    
    BTN_VENTILATION = new InOutArray<DigitalInput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        BTN_VENTILATION[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_VENTILATION__DigitalInput__ + i, BTN_VENTILATION__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_VENTILATION__DigitalInput__ + i, BTN_VENTILATION[i+1] );
    }
    
    BTN_GROUPE = new InOutArray<DigitalInput>( 9, this );
    for( uint i = 0; i < 9; i++ )
    {
        BTN_GROUPE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_GROUPE__DigitalInput__ + i, BTN_GROUPE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_GROUPE__DigitalInput__ + i, BTN_GROUPE[i+1] );
    }
    
    BTN_MONTER = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_MONTER[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_MONTER__DigitalInput__ + i, BTN_MONTER__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_MONTER__DigitalInput__ + i, BTN_MONTER[i+1] );
    }
    
    BTN_STOP = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_STOP[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_STOP__DigitalInput__ + i, BTN_STOP__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_STOP__DigitalInput__ + i, BTN_STOP[i+1] );
    }
    
    BTN_DESCENDRE = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_DESCENDRE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_DESCENDRE__DigitalInput__ + i, BTN_DESCENDRE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_DESCENDRE__DigitalInput__ + i, BTN_DESCENDRE[i+1] );
    }
    
    BTN_LAM_HORAIRE = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_LAM_HORAIRE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_LAM_HORAIRE__DigitalInput__ + i, BTN_LAM_HORAIRE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_LAM_HORAIRE__DigitalInput__ + i, BTN_LAM_HORAIRE[i+1] );
    }
    
    BTN_LAM_STOP = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_LAM_STOP[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_LAM_STOP__DigitalInput__ + i, BTN_LAM_STOP__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_LAM_STOP__DigitalInput__ + i, BTN_LAM_STOP[i+1] );
    }
    
    BTN_LAM_ANTIHORAIRE = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_LAM_ANTIHORAIRE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_LAM_ANTIHORAIRE__DigitalInput__ + i, BTN_LAM_ANTIHORAIRE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_LAM_ANTIHORAIRE__DigitalInput__ + i, BTN_LAM_ANTIHORAIRE[i+1] );
    }
    
    BTN_SCENE_STORES = new InOutArray<DigitalInput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        BTN_SCENE_STORES[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SCENE_STORES__DigitalInput__ + i, BTN_SCENE_STORES__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_SCENE_STORES__DigitalInput__ + i, BTN_SCENE_STORES[i+1] );
    }
    
    BTN_SOURCE = new InOutArray<DigitalInput>( 5, this );
    for( uint i = 0; i < 5; i++ )
    {
        BTN_SOURCE[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_SOURCE__DigitalInput__ + i, BTN_SOURCE__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_SOURCE__DigitalInput__ + i, BTN_SOURCE[i+1] );
    }
    
    G = new InOutArray<DigitalInput>( 10, this );
    for( uint i = 0; i < 10; i++ )
    {
        G[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( G__DigitalInput__ + i, G__DigitalInput__, this );
        m_DigitalInputList.Add( G__DigitalInput__ + i, G[i+1] );
    }
    
    FB_CVC_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_CVC_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_CVC_MARCHE__DigitalOutput__, FB_CVC_MARCHE );
    
    FB_CVC_ARRET = new Crestron.Logos.SplusObjects.DigitalOutput( FB_CVC_ARRET__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_CVC_ARRET__DigitalOutput__, FB_CVC_ARRET );
    
    FB_SAUNA_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SAUNA_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_SAUNA_MARCHE__DigitalOutput__, FB_SAUNA_MARCHE );
    
    FB_SAUNA_ARRET = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SAUNA_ARRET__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_SAUNA_ARRET__DigitalOutput__, FB_SAUNA_ARRET );
    
    FB_HAMMAM_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_HAMMAM_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_HAMMAM_MARCHE__DigitalOutput__, FB_HAMMAM_MARCHE );
    
    FB_HAMMAM_ARRET = new Crestron.Logos.SplusObjects.DigitalOutput( FB_HAMMAM_ARRET__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_HAMMAM_ARRET__DigitalOutput__, FB_HAMMAM_ARRET );
    
    FB_MUSIQUE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_MUSIQUE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_MUSIQUE__DigitalOutput__, FB_MUSIQUE );
    
    FB_SUIVRE_VIDEO = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SUIVRE_VIDEO__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_SUIVRE_VIDEO__DigitalOutput__, FB_SUIVRE_VIDEO );
    
    FB_MUTE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_MUTE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_MUTE__DigitalOutput__, FB_MUTE );
    
    FB_AV_OFF = new Crestron.Logos.SplusObjects.DigitalOutput( FB_AV_OFF__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_AV_OFF__DigitalOutput__, FB_AV_OFF );
    
    PILOTE_CVC_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_CVC_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_CVC_MARCHE__DigitalOutput__, PILOTE_CVC_MARCHE );
    
    PILOTE_SAUNA_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_SAUNA_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_SAUNA_MARCHE__DigitalOutput__, PILOTE_SAUNA_MARCHE );
    
    PILOTE_HAMMAM_MARCHE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_HAMMAM_MARCHE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_HAMMAM_MARCHE__DigitalOutput__, PILOTE_HAMMAM_MARCHE );
    
    PILOTE_MUTE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MUTE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_MUTE__DigitalOutput__, PILOTE_MUTE );
    
    PILOTE_MUSIQUE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MUSIQUE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_MUSIQUE__DigitalOutput__, PILOTE_MUSIQUE );
    
    PILOTE_AV_OFF = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_AV_OFF__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_AV_OFF__DigitalOutput__, PILOTE_AV_OFF );
    
    PILOTE_MEDIA_LECTURE = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MEDIA_LECTURE__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_MEDIA_LECTURE__DigitalOutput__, PILOTE_MEDIA_LECTURE );
    
    PILOTE_MEDIA_SUIVANT = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MEDIA_SUIVANT__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_MEDIA_SUIVANT__DigitalOutput__, PILOTE_MEDIA_SUIVANT );
    
    PILOTE_MEDIA_PRECEDENT = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MEDIA_PRECEDENT__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_MEDIA_PRECEDENT__DigitalOutput__, PILOTE_MEDIA_PRECEDENT );
    
    FB_SCENE = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        FB_SCENE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SCENE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_SCENE__DigitalOutput__ + i, FB_SCENE[i+1] );
    }
    
    FB_MEMORISEE = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        FB_MEMORISEE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_MEMORISEE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_MEMORISEE__DigitalOutput__ + i, FB_MEMORISEE[i+1] );
    }
    
    FB_VENTILATION = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        FB_VENTILATION[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_VENTILATION__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_VENTILATION__DigitalOutput__ + i, FB_VENTILATION[i+1] );
    }
    
    FB_SCENE_STORES = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        FB_SCENE_STORES[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SCENE_STORES__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_SCENE_STORES__DigitalOutput__ + i, FB_SCENE_STORES[i+1] );
    }
    
    FB_SOURCE = new InOutArray<DigitalOutput>( 5, this );
    for( uint i = 0; i < 5; i++ )
    {
        FB_SOURCE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_SOURCE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_SOURCE__DigitalOutput__ + i, FB_SOURCE[i+1] );
    }
    
    PILOTE_SCENE = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        PILOTE_SCENE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_SCENE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_SCENE__DigitalOutput__ + i, PILOTE_SCENE[i+1] );
    }
    
    PILOTE_MONTER = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_MONTER[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_MONTER__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_MONTER__DigitalOutput__ + i, PILOTE_MONTER[i+1] );
    }
    
    PILOTE_STOP = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_STOP[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_STOP__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_STOP__DigitalOutput__ + i, PILOTE_STOP[i+1] );
    }
    
    PILOTE_DESCENDRE = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_DESCENDRE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_DESCENDRE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_DESCENDRE__DigitalOutput__ + i, PILOTE_DESCENDRE[i+1] );
    }
    
    PILOTE_LAM_HORAIRE = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_LAM_HORAIRE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_LAM_HORAIRE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_LAM_HORAIRE__DigitalOutput__ + i, PILOTE_LAM_HORAIRE[i+1] );
    }
    
    PILOTE_LAM_STOP = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_LAM_STOP[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_LAM_STOP__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_LAM_STOP__DigitalOutput__ + i, PILOTE_LAM_STOP[i+1] );
    }
    
    PILOTE_LAM_ANTIHORAIRE = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_LAM_ANTIHORAIRE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_LAM_ANTIHORAIRE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_LAM_ANTIHORAIRE__DigitalOutput__ + i, PILOTE_LAM_ANTIHORAIRE[i+1] );
    }
    
    PILOTE_GROUPE = new InOutArray<DigitalOutput>( 9, this );
    for( uint i = 0; i < 9; i++ )
    {
        PILOTE_GROUPE[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_GROUPE__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_GROUPE__DigitalOutput__ + i, PILOTE_GROUPE[i+1] );
    }
    
    PILOTE_SCENE_STORES = new InOutArray<DigitalOutput>( 4, this );
    for( uint i = 0; i < 4; i++ )
    {
        PILOTE_SCENE_STORES[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_SCENE_STORES__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_SCENE_STORES__DigitalOutput__ + i, PILOTE_SCENE_STORES[i+1] );
    }
    
    IN_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogInput( IN_CONSIGNE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_CONSIGNE__AnalogSerialInput__, IN_CONSIGNE );
    
    IN_SOURCE = new Crestron.Logos.SplusObjects.AnalogInput( IN_SOURCE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_SOURCE__AnalogSerialInput__, IN_SOURCE );
    
    IN_VOLUME = new Crestron.Logos.SplusObjects.AnalogInput( IN_VOLUME__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_VOLUME__AnalogSerialInput__, IN_VOLUME );
    
    IN_VOLUME_MEDIA = new Crestron.Logos.SplusObjects.AnalogInput( IN_VOLUME_MEDIA__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_VOLUME_MEDIA__AnalogSerialInput__, IN_VOLUME_MEDIA );
    
    IN_VENTILATION = new Crestron.Logos.SplusObjects.AnalogInput( IN_VENTILATION__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_VENTILATION__AnalogSerialInput__, IN_VENTILATION );
    
    IN_SAUNA_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogInput( IN_SAUNA_CONSIGNE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_SAUNA_CONSIGNE__AnalogSerialInput__, IN_SAUNA_CONSIGNE );
    
    IN_HAMMAM_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogInput( IN_HAMMAM_CONSIGNE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( IN_HAMMAM_CONSIGNE__AnalogSerialInput__, IN_HAMMAM_CONSIGNE );
    
    RETOUR_TEMPERATURE = new Crestron.Logos.SplusObjects.AnalogInput( RETOUR_TEMPERATURE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( RETOUR_TEMPERATURE__AnalogSerialInput__, RETOUR_TEMPERATURE );
    
    RETOUR_SAUNA_MESURE = new Crestron.Logos.SplusObjects.AnalogInput( RETOUR_SAUNA_MESURE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( RETOUR_SAUNA_MESURE__AnalogSerialInput__, RETOUR_SAUNA_MESURE );
    
    RETOUR_HAMMAM_MESURE = new Crestron.Logos.SplusObjects.AnalogInput( RETOUR_HAMMAM_MESURE__AnalogSerialInput__, this );
    m_AnalogInputList.Add( RETOUR_HAMMAM_MESURE__AnalogSerialInput__, RETOUR_HAMMAM_MESURE );
    
    IN_CIRCUIT = new InOutArray<AnalogInput>( 20, this );
    for( uint i = 0; i < 20; i++ )
    {
        IN_CIRCUIT[i+1] = new Crestron.Logos.SplusObjects.AnalogInput( IN_CIRCUIT__AnalogSerialInput__ + i, IN_CIRCUIT__AnalogSerialInput__, this );
        m_AnalogInputList.Add( IN_CIRCUIT__AnalogSerialInput__ + i, IN_CIRCUIT[i+1] );
    }
    
    RETOUR_CIRCUIT = new InOutArray<AnalogInput>( 20, this );
    for( uint i = 0; i < 20; i++ )
    {
        RETOUR_CIRCUIT[i+1] = new Crestron.Logos.SplusObjects.AnalogInput( RETOUR_CIRCUIT__AnalogSerialInput__ + i, RETOUR_CIRCUIT__AnalogSerialInput__, this );
        m_AnalogInputList.Add( RETOUR_CIRCUIT__AnalogSerialInput__ + i, RETOUR_CIRCUIT[i+1] );
    }
    
    FB_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_CONSIGNE__AnalogSerialOutput__, FB_CONSIGNE );
    
    FB_SOURCE_ACTIVE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_SOURCE_ACTIVE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_SOURCE_ACTIVE__AnalogSerialOutput__, FB_SOURCE_ACTIVE );
    
    FB_VOLUME = new Crestron.Logos.SplusObjects.AnalogOutput( FB_VOLUME__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_VOLUME__AnalogSerialOutput__, FB_VOLUME );
    
    FB_SOURCE_AUDIO = new Crestron.Logos.SplusObjects.AnalogOutput( FB_SOURCE_AUDIO__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_SOURCE_AUDIO__AnalogSerialOutput__, FB_SOURCE_AUDIO );
    
    FB_VOLUME_MEDIA = new Crestron.Logos.SplusObjects.AnalogOutput( FB_VOLUME_MEDIA__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_VOLUME_MEDIA__AnalogSerialOutput__, FB_VOLUME_MEDIA );
    
    FB_VENTILATION_A = new Crestron.Logos.SplusObjects.AnalogOutput( FB_VENTILATION_A__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_VENTILATION_A__AnalogSerialOutput__, FB_VENTILATION_A );
    
    FB_SAUNA_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_SAUNA_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_SAUNA_CONSIGNE__AnalogSerialOutput__, FB_SAUNA_CONSIGNE );
    
    FB_HAMMAM_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_HAMMAM_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_HAMMAM_CONSIGNE__AnalogSerialOutput__, FB_HAMMAM_CONSIGNE );
    
    FB_SAUNA_MESURE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_SAUNA_MESURE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_SAUNA_MESURE__AnalogSerialOutput__, FB_SAUNA_MESURE );
    
    FB_HAMMAM_MESURE = new Crestron.Logos.SplusObjects.AnalogOutput( FB_HAMMAM_MESURE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( FB_HAMMAM_MESURE__AnalogSerialOutput__, FB_HAMMAM_MESURE );
    
    PILOTE_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_CONSIGNE__AnalogSerialOutput__, PILOTE_CONSIGNE );
    
    PILOTE_VENTILATION = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_VENTILATION__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_VENTILATION__AnalogSerialOutput__, PILOTE_VENTILATION );
    
    PILOTE_SAUNA_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_SAUNA_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_SAUNA_CONSIGNE__AnalogSerialOutput__, PILOTE_SAUNA_CONSIGNE );
    
    PILOTE_HAMMAM_CONSIGNE = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_HAMMAM_CONSIGNE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_HAMMAM_CONSIGNE__AnalogSerialOutput__, PILOTE_HAMMAM_CONSIGNE );
    
    PILOTE_SOURCE = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_SOURCE__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_SOURCE__AnalogSerialOutput__, PILOTE_SOURCE );
    
    PILOTE_VOLUME = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_VOLUME__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_VOLUME__AnalogSerialOutput__, PILOTE_VOLUME );
    
    PILOTE_VOLUME_MEDIA = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_VOLUME_MEDIA__AnalogSerialOutput__, this );
    m_AnalogOutputList.Add( PILOTE_VOLUME_MEDIA__AnalogSerialOutput__, PILOTE_VOLUME_MEDIA );
    
    FB_CIRCUIT = new InOutArray<AnalogOutput>( 20, this );
    for( uint i = 0; i < 20; i++ )
    {
        FB_CIRCUIT[i+1] = new Crestron.Logos.SplusObjects.AnalogOutput( FB_CIRCUIT__AnalogSerialOutput__ + i, this );
        m_AnalogOutputList.Add( FB_CIRCUIT__AnalogSerialOutput__ + i, FB_CIRCUIT[i+1] );
    }
    
    PILOTE_CIRCUIT = new InOutArray<AnalogOutput>( 20, this );
    for( uint i = 0; i < 20; i++ )
    {
        PILOTE_CIRCUIT[i+1] = new Crestron.Logos.SplusObjects.AnalogOutput( PILOTE_CIRCUIT__AnalogSerialOutput__ + i, this );
        m_AnalogOutputList.Add( PILOTE_CIRCUIT__AnalogSerialOutput__ + i, PILOTE_CIRCUIT[i+1] );
    }
    
    RETOUR_MODE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringInput( RETOUR_MODE__DOLLAR____AnalogSerialInput__, 40, this );
    m_StringInputList.Add( RETOUR_MODE__DOLLAR____AnalogSerialInput__, RETOUR_MODE__DOLLAR__ );
    
    TXT_TEMPERATURE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_TEMPERATURE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_TEMPERATURE__DOLLAR____AnalogSerialOutput__, TXT_TEMPERATURE__DOLLAR__ );
    
    TXT_MODE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_MODE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_MODE__DOLLAR____AnalogSerialOutput__, TXT_MODE__DOLLAR__ );
    
    TXT_CONSIGNE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_CONSIGNE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_CONSIGNE__DOLLAR____AnalogSerialOutput__, TXT_CONSIGNE__DOLLAR__ );
    
    TXT_SAUNA_CONSIGNE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_SAUNA_CONSIGNE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_SAUNA_CONSIGNE__DOLLAR____AnalogSerialOutput__, TXT_SAUNA_CONSIGNE__DOLLAR__ );
    
    TXT_HAMMAM_CONSIGNE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_HAMMAM_CONSIGNE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_HAMMAM_CONSIGNE__DOLLAR____AnalogSerialOutput__, TXT_HAMMAM_CONSIGNE__DOLLAR__ );
    
    TXT_SAUNA_MESURE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_SAUNA_MESURE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_SAUNA_MESURE__DOLLAR____AnalogSerialOutput__, TXT_SAUNA_MESURE__DOLLAR__ );
    
    TXT_HAMMAM_MESURE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( TXT_HAMMAM_MESURE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( TXT_HAMMAM_MESURE__DOLLAR____AnalogSerialOutput__, TXT_HAMMAM_MESURE__DOLLAR__ );
    
    PIECE = new UShortParameter( PIECE__Parameter__, this );
    m_ParameterList.Add( PIECE__Parameter__, PIECE );
    
    
    for( uint i = 0; i < 4; i++ )
        BTN_SCENE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SCENE_OnPush_0, false ) );
        
    for( uint i = 0; i < 4; i++ )
        BTN_MEMORISER[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MEMORISER_OnPush_1, false ) );
        
    for( uint i = 0; i < 20; i++ )
        IN_CIRCUIT[i+1].OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_CIRCUIT_OnChange_2, false ) );
        
    for( uint i = 0; i < 20; i++ )
        RETOUR_CIRCUIT[i+1].OnAnalogChange.Add( new InputChangeHandlerWrapper( RETOUR_CIRCUIT_OnChange_3, false ) );
        
    BTN_CONSIGNE_PLUS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CONSIGNE_PLUS_OnPush_4, false ) );
    BTN_CONSIGNE_MOINS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CONSIGNE_MOINS_OnPush_5, false ) );
    IN_CONSIGNE.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_CONSIGNE_OnChange_6, false ) );
    BTN_CVC_MARCHE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CVC_MARCHE_OnPush_7, false ) );
    BTN_CVC_ARRET.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CVC_ARRET_OnPush_8, false ) );
    for( uint i = 0; i < 4; i++ )
        BTN_VENTILATION[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_VENTILATION_OnPush_9, false ) );
        
    IN_VENTILATION.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_VENTILATION_OnChange_10, false ) );
    RETOUR_TEMPERATURE.OnAnalogChange.Add( new InputChangeHandlerWrapper( RETOUR_TEMPERATURE_OnChange_11, false ) );
    RETOUR_MODE__DOLLAR__.OnSerialChange.Add( new InputChangeHandlerWrapper( RETOUR_MODE__DOLLAR___OnChange_12, false ) );
    BTN_SAUNA_MARCHE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SAUNA_MARCHE_OnPush_13, false ) );
    BTN_SAUNA_ARRET.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SAUNA_ARRET_OnPush_14, false ) );
    BTN_SAUNA_PLUS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SAUNA_PLUS_OnPush_15, false ) );
    BTN_SAUNA_MOINS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SAUNA_MOINS_OnPush_16, false ) );
    BTN_HAMMAM_MARCHE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_HAMMAM_MARCHE_OnPush_17, false ) );
    BTN_HAMMAM_ARRET.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_HAMMAM_ARRET_OnPush_18, false ) );
    BTN_HAMMAM_PLUS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_HAMMAM_PLUS_OnPush_19, false ) );
    BTN_HAMMAM_MOINS.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_HAMMAM_MOINS_OnPush_20, false ) );
    IN_SAUNA_CONSIGNE.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_SAUNA_CONSIGNE_OnChange_21, false ) );
    IN_HAMMAM_CONSIGNE.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_HAMMAM_CONSIGNE_OnChange_22, false ) );
    RETOUR_SAUNA_MESURE.OnAnalogChange.Add( new InputChangeHandlerWrapper( RETOUR_SAUNA_MESURE_OnChange_23, false ) );
    RETOUR_HAMMAM_MESURE.OnAnalogChange.Add( new InputChangeHandlerWrapper( RETOUR_HAMMAM_MESURE_OnChange_24, false ) );
    for( uint i = 0; i < 12; i++ )
        BTN_MONTER[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MONTER_OnPush_25, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_MONTER[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_MONTER_OnRelease_26, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_STOP[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_STOP_OnPush_27, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_STOP[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_STOP_OnRelease_28, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_DESCENDRE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_DESCENDRE_OnPush_29, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_DESCENDRE[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_DESCENDRE_OnRelease_30, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_HORAIRE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_LAM_HORAIRE_OnPush_31, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_HORAIRE[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_LAM_HORAIRE_OnRelease_32, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_STOP[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_LAM_STOP_OnPush_33, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_STOP[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_LAM_STOP_OnRelease_34, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_ANTIHORAIRE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_LAM_ANTIHORAIRE_OnPush_35, false ) );
        
    for( uint i = 0; i < 12; i++ )
        BTN_LAM_ANTIHORAIRE[i+1].OnDigitalRelease.Add( new InputChangeHandlerWrapper( BTN_LAM_ANTIHORAIRE_OnRelease_36, false ) );
        
    for( uint i = 0; i < 9; i++ )
        BTN_GROUPE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_GROUPE_OnPush_37, false ) );
        
    for( uint i = 0; i < 4; i++ )
        BTN_SCENE_STORES[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SCENE_STORES_OnPush_38, false ) );
        
    for( uint i = 0; i < 5; i++ )
        BTN_SOURCE[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SOURCE_OnPush_39, false ) );
        
    IN_SOURCE.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_SOURCE_OnChange_40, false ) );
    BTN_MUSIQUE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MUSIQUE_OnPush_41, false ) );
    BTN_SUIVRE_VIDEO.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_SUIVRE_VIDEO_OnPush_42, false ) );
    BTN_MUTE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MUTE_OnPush_43, false ) );
    BTN_AV_OFF.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_AV_OFF_OnPush_44, false ) );
    IN_VOLUME.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_VOLUME_OnChange_45, false ) );
    IN_VOLUME_MEDIA.OnAnalogChange.Add( new InputChangeHandlerWrapper( IN_VOLUME_MEDIA_OnChange_46, false ) );
    BTN_MEDIA_LECTURE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MEDIA_LECTURE_OnPush_47, false ) );
    BTN_MEDIA_SUIVANT.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MEDIA_SUIVANT_OnPush_48, false ) );
    BTN_MEDIA_PRECEDENT.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_MEDIA_PRECEDENT_OnPush_49, false ) );
    for( uint i = 0; i < 10; i++ )
        G[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( G_OnPush_50, false ) );
        
    
    _SplusNVRAM.PopulateCustomAttributeList( true );
    
    NVRAM = _SplusNVRAM;
    
}

public override void LogosSimplSharpInitialize()
{
    
    
}

public UserModuleClass_VILLAPIECE ( string InstanceName, string ReferenceID, Crestron.Logos.SplusObjects.CrestronStringEncoding nEncodingType ) : base( InstanceName, ReferenceID, nEncodingType ) {}




const uint BTN_CONSIGNE_PLUS__DigitalInput__ = 0;
const uint BTN_CONSIGNE_MOINS__DigitalInput__ = 1;
const uint BTN_CVC_MARCHE__DigitalInput__ = 2;
const uint BTN_CVC_ARRET__DigitalInput__ = 3;
const uint BTN_SAUNA_MARCHE__DigitalInput__ = 4;
const uint BTN_SAUNA_ARRET__DigitalInput__ = 5;
const uint BTN_SAUNA_PLUS__DigitalInput__ = 6;
const uint BTN_SAUNA_MOINS__DigitalInput__ = 7;
const uint BTN_HAMMAM_MARCHE__DigitalInput__ = 8;
const uint BTN_HAMMAM_ARRET__DigitalInput__ = 9;
const uint BTN_HAMMAM_PLUS__DigitalInput__ = 10;
const uint BTN_HAMMAM_MOINS__DigitalInput__ = 11;
const uint BTN_MUSIQUE__DigitalInput__ = 12;
const uint BTN_SUIVRE_VIDEO__DigitalInput__ = 13;
const uint BTN_MUTE__DigitalInput__ = 14;
const uint BTN_AV_OFF__DigitalInput__ = 15;
const uint BTN_MEDIA_LECTURE__DigitalInput__ = 16;
const uint BTN_MEDIA_SUIVANT__DigitalInput__ = 17;
const uint BTN_MEDIA_PRECEDENT__DigitalInput__ = 18;
const uint BTN_SCENE__DigitalInput__ = 19;
const uint BTN_MEMORISER__DigitalInput__ = 23;
const uint BTN_VENTILATION__DigitalInput__ = 27;
const uint BTN_GROUPE__DigitalInput__ = 31;
const uint BTN_MONTER__DigitalInput__ = 40;
const uint BTN_STOP__DigitalInput__ = 52;
const uint BTN_DESCENDRE__DigitalInput__ = 64;
const uint BTN_LAM_HORAIRE__DigitalInput__ = 76;
const uint BTN_LAM_STOP__DigitalInput__ = 88;
const uint BTN_LAM_ANTIHORAIRE__DigitalInput__ = 100;
const uint BTN_SCENE_STORES__DigitalInput__ = 112;
const uint BTN_SOURCE__DigitalInput__ = 116;
const uint G__DigitalInput__ = 121;
const uint IN_CONSIGNE__AnalogSerialInput__ = 0;
const uint IN_SOURCE__AnalogSerialInput__ = 1;
const uint IN_VOLUME__AnalogSerialInput__ = 2;
const uint IN_VOLUME_MEDIA__AnalogSerialInput__ = 3;
const uint IN_VENTILATION__AnalogSerialInput__ = 4;
const uint IN_SAUNA_CONSIGNE__AnalogSerialInput__ = 5;
const uint IN_HAMMAM_CONSIGNE__AnalogSerialInput__ = 6;
const uint RETOUR_TEMPERATURE__AnalogSerialInput__ = 7;
const uint RETOUR_SAUNA_MESURE__AnalogSerialInput__ = 8;
const uint RETOUR_HAMMAM_MESURE__AnalogSerialInput__ = 9;
const uint RETOUR_MODE__DOLLAR____AnalogSerialInput__ = 10;
const uint IN_CIRCUIT__AnalogSerialInput__ = 11;
const uint RETOUR_CIRCUIT__AnalogSerialInput__ = 31;
const uint FB_CVC_MARCHE__DigitalOutput__ = 0;
const uint FB_CVC_ARRET__DigitalOutput__ = 1;
const uint FB_SAUNA_MARCHE__DigitalOutput__ = 2;
const uint FB_SAUNA_ARRET__DigitalOutput__ = 3;
const uint FB_HAMMAM_MARCHE__DigitalOutput__ = 4;
const uint FB_HAMMAM_ARRET__DigitalOutput__ = 5;
const uint FB_MUSIQUE__DigitalOutput__ = 6;
const uint FB_SUIVRE_VIDEO__DigitalOutput__ = 7;
const uint FB_MUTE__DigitalOutput__ = 8;
const uint FB_AV_OFF__DigitalOutput__ = 9;
const uint PILOTE_CVC_MARCHE__DigitalOutput__ = 10;
const uint PILOTE_SAUNA_MARCHE__DigitalOutput__ = 11;
const uint PILOTE_HAMMAM_MARCHE__DigitalOutput__ = 12;
const uint PILOTE_MUTE__DigitalOutput__ = 13;
const uint PILOTE_MUSIQUE__DigitalOutput__ = 14;
const uint PILOTE_AV_OFF__DigitalOutput__ = 15;
const uint PILOTE_MEDIA_LECTURE__DigitalOutput__ = 16;
const uint PILOTE_MEDIA_SUIVANT__DigitalOutput__ = 17;
const uint PILOTE_MEDIA_PRECEDENT__DigitalOutput__ = 18;
const uint FB_SCENE__DigitalOutput__ = 19;
const uint FB_MEMORISEE__DigitalOutput__ = 23;
const uint FB_VENTILATION__DigitalOutput__ = 27;
const uint FB_SCENE_STORES__DigitalOutput__ = 31;
const uint FB_SOURCE__DigitalOutput__ = 35;
const uint PILOTE_SCENE__DigitalOutput__ = 40;
const uint PILOTE_MONTER__DigitalOutput__ = 44;
const uint PILOTE_STOP__DigitalOutput__ = 56;
const uint PILOTE_DESCENDRE__DigitalOutput__ = 68;
const uint PILOTE_LAM_HORAIRE__DigitalOutput__ = 80;
const uint PILOTE_LAM_STOP__DigitalOutput__ = 92;
const uint PILOTE_LAM_ANTIHORAIRE__DigitalOutput__ = 104;
const uint PILOTE_GROUPE__DigitalOutput__ = 116;
const uint PILOTE_SCENE_STORES__DigitalOutput__ = 125;
const uint FB_CONSIGNE__AnalogSerialOutput__ = 0;
const uint FB_SOURCE_ACTIVE__AnalogSerialOutput__ = 1;
const uint FB_VOLUME__AnalogSerialOutput__ = 2;
const uint FB_SOURCE_AUDIO__AnalogSerialOutput__ = 3;
const uint FB_VOLUME_MEDIA__AnalogSerialOutput__ = 4;
const uint FB_VENTILATION_A__AnalogSerialOutput__ = 5;
const uint FB_SAUNA_CONSIGNE__AnalogSerialOutput__ = 6;
const uint FB_HAMMAM_CONSIGNE__AnalogSerialOutput__ = 7;
const uint FB_SAUNA_MESURE__AnalogSerialOutput__ = 8;
const uint FB_HAMMAM_MESURE__AnalogSerialOutput__ = 9;
const uint PILOTE_CONSIGNE__AnalogSerialOutput__ = 10;
const uint PILOTE_VENTILATION__AnalogSerialOutput__ = 11;
const uint PILOTE_SAUNA_CONSIGNE__AnalogSerialOutput__ = 12;
const uint PILOTE_HAMMAM_CONSIGNE__AnalogSerialOutput__ = 13;
const uint PILOTE_SOURCE__AnalogSerialOutput__ = 14;
const uint PILOTE_VOLUME__AnalogSerialOutput__ = 15;
const uint PILOTE_VOLUME_MEDIA__AnalogSerialOutput__ = 16;
const uint TXT_TEMPERATURE__DOLLAR____AnalogSerialOutput__ = 17;
const uint TXT_MODE__DOLLAR____AnalogSerialOutput__ = 18;
const uint TXT_CONSIGNE__DOLLAR____AnalogSerialOutput__ = 19;
const uint TXT_SAUNA_CONSIGNE__DOLLAR____AnalogSerialOutput__ = 20;
const uint TXT_HAMMAM_CONSIGNE__DOLLAR____AnalogSerialOutput__ = 21;
const uint TXT_SAUNA_MESURE__DOLLAR____AnalogSerialOutput__ = 22;
const uint TXT_HAMMAM_MESURE__DOLLAR____AnalogSerialOutput__ = 23;
const uint FB_CIRCUIT__AnalogSerialOutput__ = 24;
const uint PILOTE_CIRCUIT__AnalogSerialOutput__ = 44;
const uint PIECE__Parameter__ = 10;

[SplusStructAttribute(-1, true, false)]
public class SplusNVRAM : SplusStructureBase
{

    public SplusNVRAM( SplusObject __caller__ ) : base( __caller__ ) {}
    
    [SplusStructAttribute(0, false, true)]
            public ushort INITIALISE = 0;
            [SplusStructAttribute(1, false, true)]
            public ushort [,] NIVEAUX;
            [SplusStructAttribute(2, false, true)]
            public ushort [] MEMORISEE;
            
}

SplusNVRAM _SplusNVRAM = null;

public class __CEvent__ : CEvent
{
    public __CEvent__() {}
    public void Close() { base.Close(); }
    public int Reset() { return base.Reset() ? 1 : 0; }
    public int Set() { return base.Set() ? 1 : 0; }
    public int Wait( int timeOutInMs ) { return base.Wait( timeOutInMs ) ? 1 : 0; }
}
public class __CMutex__ : CMutex
{
    public __CMutex__() {}
    public void Close() { base.Close(); }
    public void ReleaseMutex() { base.ReleaseMutex(); }
    public int WaitForMutex() { return base.WaitForMutex() ? 1 : 0; }
}
 public int IsNull( object obj ){ return (obj == null) ? 1 : 0; }
}


}
