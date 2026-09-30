/* Vitrine — généré par scripts/sync-la-reserve-geneve.py, ne pas éditer. */
window.reserveConfig = {
  "meta": {
    "projet": "La Réserve Genève — GUI CH5 Bar / Fitness / Lodge",
    "version": "1.0.0-showcase",
    "mode": "showcase",
    "espace": "bar",
    "theme": "lac",
    "langue": "fr",
    "note": "Source unique. mode = deploiement (processeur CP3, programmes SIMPL existants) ou showcase (vitrine, feedback local). espace = bar | fitness | lodge : un CH5 par espace (deploy.ps1 -Espace)."
  },
  "marque": {
    "nom": "La Réserve",
    "lieu": "Genève",
    "signature": "Hotel & Spa"
  },
  "themes": [
    {
      "id": "lac",
      "nom": "Lac",
      "description": "Clair, bronze",
      "apercu": {
        "fond": "#f5f1ea",
        "surface": "#ffffff",
        "accent": "#8a5a3c",
        "texte": "#2b2320"
      }
    },
    {
      "id": "nuit",
      "nom": "Nuit",
      "description": "Anthracite, cuivre",
      "apercu": {
        "fond": "#101113",
        "surface": "#23252a",
        "accent": "#d4916a",
        "texte": "#f3eee7"
      }
    },
    {
      "id": "spa",
      "nom": "Spa",
      "description": "Sable, vert sauge",
      "apercu": {
        "fond": "#eeeae1",
        "surface": "#fbf9f4",
        "accent": "#4d6a57",
        "texte": "#243029"
      }
    }
  ],
  "echelleAnalogique": 65535,
  "espaces": [
    {
      "id": "bar",
      "nom": "Bar",
      "sousTitre": "Bar & Lounge",
      "simpl": {
        "programme": "Reserve Bar prg06.smw",
        "processeur": "CP3",
        "ipid": "0x04",
        "symbole": "Bar Lounge (Crestron App)",
        "vtp": "Bar.vtp",
        "smartObject": 1,
        "digitauxMax": 111,
        "analogiquesMax": 32
      },
      "global": {
        "arretGeneralDemande": {
          "so": 5,
          "signal": "Ipad_1_Power_Off",
          "join": 84
        },
        "confirmationRetour": 56,
        "eteindre": 55,
        "annuler": 54,
        "fermer": 57,
        "occupe": 3,
        "occupeProgression": 15,
        "sourceCourante": 15,
        "connecte": 1
      },
      "sources": [
        {
          "id": 1,
          "nom": "Airplay Bar",
          "icone": "airplay",
          "so": 1,
          "signal": "Ipad_1_Input_2",
          "join": 80
        },
        {
          "id": 2,
          "nom": "DJ",
          "icone": "dj",
          "so": 2,
          "signal": "Ipad_1_Input_3",
          "join": 81
        },
        {
          "id": 3,
          "nom": "iPod",
          "icone": "ipod",
          "so": 3,
          "signal": "Ipad_1_Input_4",
          "join": 82
        },
        {
          "id": 4,
          "nom": "Music Bar Lounge",
          "icone": "music",
          "so": 4,
          "signal": "Ipad_1_Input_1",
          "join": 83
        }
      ],
      "pages": [
        {
          "id": "rez",
          "nom": "Rez-de-chaussée",
          "bouton": 61,
          "retour": 63,
          "groupes": [
            {
              "id": "tsefong",
              "nom": "Tsé-Fong",
              "diffuser": 76,
              "arret": 98,
              "retourSource": 9,
              "zones": [
                {
                  "id": "tsefong",
                  "nom": "Tsé-Fong",
                  "volPlus": 38,
                  "volMoins": 39,
                  "muet": 40,
                  "muetRetour": 40,
                  "niveau": 8,
                  "signalSimpl": "tsefong"
                }
              ]
            },
            {
              "id": "salon1",
              "nom": "Salon 1",
              "diffuser": 77,
              "arret": 96,
              "retourSource": 7,
              "zones": [
                {
                  "id": "salon1",
                  "nom": "Salon 1",
                  "volPlus": 42,
                  "volMoins": 43,
                  "muet": 44,
                  "muetRetour": 44,
                  "niveau": 9,
                  "signalSimpl": "Salon1"
                }
              ]
            },
            {
              "id": "salon2",
              "nom": "Salon 2",
              "diffuser": 78,
              "arret": 97,
              "retourSource": 8,
              "zones": [
                {
                  "id": "salon2",
                  "nom": "Salon 2",
                  "volPlus": 46,
                  "volMoins": 47,
                  "muet": 48,
                  "muetRetour": 48,
                  "niveau": 10,
                  "signalSimpl": "Salon2"
                }
              ]
            },
            {
              "id": "terrasse2",
              "nom": "Terrasse Tsé-Fong",
              "diffuser": 79,
              "arret": 95,
              "retourSource": 6,
              "zones": [
                {
                  "id": "terrasse2",
                  "nom": "Terrasse Tsé-Fong",
                  "volPlus": 50,
                  "volMoins": 51,
                  "muet": 52,
                  "muetRetour": 52,
                  "niveau": 11,
                  "signalSimpl": "Terrasse2"
                }
              ]
            }
          ]
        },
        {
          "id": "soussol",
          "nom": "Sous-sol",
          "bouton": 62,
          "retour": 64,
          "groupes": [
            {
              "id": "allbar",
              "nom": "All Bar",
              "diffuser": 71,
              "arret": 90,
              "retourSource": 1,
              "zones": [
                {
                  "id": "barl",
                  "nom": "Bar vers Fenêtre",
                  "volPlus": 10,
                  "volMoins": 11,
                  "muet": 12,
                  "muetRetour": 12,
                  "niveau": 1,
                  "signalSimpl": "BarL"
                },
                {
                  "id": "barr",
                  "nom": "Bar vers Entrée",
                  "volPlus": 14,
                  "volMoins": 15,
                  "muet": 16,
                  "muetRetour": 16,
                  "niveau": 2,
                  "signalSimpl": "BarR"
                }
              ]
            },
            {
              "id": "lobbywc",
              "nom": "Lobby & WC",
              "diffuser": 72,
              "arret": 91,
              "retourSource": 2,
              "zones": [
                {
                  "id": "lobby",
                  "nom": "Lobby",
                  "volPlus": 18,
                  "volMoins": 19,
                  "muet": 20,
                  "muetRetour": 20,
                  "niveau": 3,
                  "signalSimpl": "Lobby"
                },
                {
                  "id": "wc",
                  "nom": "WC",
                  "volPlus": 22,
                  "volMoins": 23,
                  "muet": 24,
                  "muetRetour": 24,
                  "niveau": 4,
                  "signalSimpl": "WC"
                }
              ]
            },
            {
              "id": "loft",
              "nom": "Le Loft",
              "diffuser": 74,
              "arret": 93,
              "retourSource": 4,
              "zones": [
                {
                  "id": "loft",
                  "nom": "Le Loft",
                  "volPlus": 30,
                  "volMoins": 31,
                  "muet": 32,
                  "muetRetour": 32,
                  "niveau": 6,
                  "signalSimpl": "Restaurant"
                },
                {
                  "id": "loftfond",
                  "nom": "Le Loft Fond",
                  "volPlus": 66,
                  "volMoins": 67,
                  "muet": 68,
                  "muetRetour": 68,
                  "niveau": 12,
                  "signalSimpl": "Lotti"
                }
              ]
            },
            {
              "id": "fumoir",
              "nom": "Fumoir",
              "diffuser": 73,
              "arret": 92,
              "retourSource": 3,
              "zones": [
                {
                  "id": "fumoir",
                  "nom": "Fumoir",
                  "volPlus": 26,
                  "volMoins": 27,
                  "muet": 28,
                  "muetRetour": 28,
                  "niveau": 5,
                  "signalSimpl": "Fumoir"
                }
              ]
            },
            {
              "id": "terrassebar",
              "nom": "Terrasse Bar",
              "diffuser": 75,
              "arret": 94,
              "retourSource": 5,
              "zones": [
                {
                  "id": "terrassebar",
                  "nom": "Terrasse Bar",
                  "volPlus": 34,
                  "volMoins": 35,
                  "muet": 36,
                  "muetRetour": 36,
                  "niveau": 7,
                  "signalSimpl": "Terrasse/Bar"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "fitness",
      "nom": "Fitness",
      "sousTitre": "Fitness & Spa",
      "simpl": {
        "programme": "Reserve prg005.smw",
        "processeur": "CP3",
        "ipid": "0x04",
        "symbole": "Fitness (Crestron App)",
        "vtp": "Fitness.vtp",
        "smartObject": 1,
        "digitauxMax": 78,
        "analogiquesMax": 32
      },
      "global": {
        "arretGeneralDemande": {
          "so": 6,
          "signal": "Ipad_1_Power_Off",
          "join": 66
        },
        "confirmationRetour": 52,
        "eteindre": 50,
        "annuler": 51,
        "fermer": 55,
        "occupe": 0,
        "occupeProgression": 0,
        "sourceCourante": 1,
        "connecte": 1,
        "attenteLocaleMs": 4000
      },
      "sources": [
        {
          "id": 1,
          "nom": "Airplay Room CC",
          "icone": "airplay",
          "so": 1,
          "signal": "Ipad_1_Input_4",
          "join": 61
        },
        {
          "id": 2,
          "nom": "Airplay Fonctional Zone",
          "icone": "airplay",
          "so": 2,
          "signal": "Ipad_1_Input_1",
          "join": 62
        },
        {
          "id": 3,
          "nom": "Airplay Kinesis",
          "icone": "airplay",
          "so": 3,
          "signal": "Ipad_1_Input_3",
          "join": 63
        },
        {
          "id": 4,
          "nom": "Laptop Reception",
          "icone": "laptop",
          "so": 4,
          "signal": "Ipad_1_Input_2",
          "join": 64
        },
        {
          "id": 5,
          "nom": "Music Bar Lounge",
          "icone": "music",
          "so": 5,
          "signal": "Ipad_1_Input_5",
          "join": 65
        }
      ],
      "pages": [
        {
          "id": "zones",
          "nom": "Zones",
          "bouton": 0,
          "retour": 0,
          "groupes": [
            {
              "id": "accueil",
              "nom": "Accueil Cardio",
              "diffuser": 17,
              "arret": 8,
              "retourSource": 7,
              "zones": [
                {
                  "id": "accueil",
                  "nom": "Accueil Cardio",
                  "volPlus": 37,
                  "volMoins": 38,
                  "muet": 39,
                  "muetRetour": 39,
                  "niveau": 2,
                  "signalSimpl": "Accueil"
                }
              ]
            },
            {
              "id": "fonctional",
              "nom": "Fonctional Zone",
              "diffuser": 15,
              "arret": 7,
              "retourSource": 5,
              "zones": [
                {
                  "id": "fonctional",
                  "nom": "Fonctional Zone",
                  "volPlus": 25,
                  "volMoins": 26,
                  "muet": 27,
                  "muetRetour": 27,
                  "niveau": 1,
                  "signalSimpl": "Fitness"
                }
              ]
            },
            {
              "id": "roomcc",
              "nom": "Room CC",
              "diffuser": 18,
              "arret": 11,
              "retourSource": 6,
              "zones": [
                {
                  "id": "roomcc",
                  "nom": "Room CC",
                  "volPlus": 29,
                  "volMoins": 30,
                  "muet": 31,
                  "muetRetour": 31,
                  "niveau": 3,
                  "signalSimpl": "Salle_TV"
                }
              ]
            },
            {
              "id": "kinesis",
              "nom": "Kinesis",
              "diffuser": 16,
              "arret": 10,
              "retourSource": 9,
              "zones": [
                {
                  "id": "kinesis",
                  "nom": "Kinesis",
                  "volPlus": 33,
                  "volMoins": 34,
                  "muet": 35,
                  "muetRetour": 35,
                  "niveau": 4,
                  "signalSimpl": "Kinesis"
                }
              ]
            },
            {
              "id": "musculation",
              "nom": "Musculation",
              "diffuser": 19,
              "arret": 9,
              "retourSource": 8,
              "zones": [
                {
                  "id": "musculation",
                  "nom": "Musculation",
                  "volPlus": 41,
                  "volMoins": 42,
                  "muet": 43,
                  "muetRetour": 43,
                  "niveau": 5,
                  "signalSimpl": "Sport"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "lodge",
      "nom": "Lodge",
      "sousTitre": "Lodge & Pool",
      "simpl": {
        "programme": "Reserve Bar prg06.smw",
        "processeur": "CP3",
        "ipid": "0x05",
        "symbole": "Crestron App (LA_RESERVE_LODGE_01)",
        "vtp": "LA_RESERVE_LODGE_01.vtp",
        "smartObject": 1,
        "digitauxMax": 93,
        "analogiquesMax": 32
      },
      "global": {
        "arretGeneralDemande": {
          "so": 5,
          "signal": "Ipad_2_Power_Off",
          "join": 65
        },
        "confirmationRetour": 56,
        "eteindre": 55,
        "annuler": 54,
        "fermer": 57,
        "occupe": 3,
        "occupeProgression": 15,
        "sourceCourante": 15,
        "connecte": 1
      },
      "sources": [
        {
          "id": 1,
          "nom": "iPad Lodge",
          "icone": "tablet",
          "so": 1,
          "signal": "Ipad_2_Input_1",
          "join": 61
        },
        {
          "id": 2,
          "nom": "DJ Left",
          "icone": "laptop",
          "so": 2,
          "signal": "Ipad_2_Input_2",
          "join": 62
        },
        {
          "id": 3,
          "nom": "DJ Right",
          "icone": "laptop",
          "so": 3,
          "signal": "Ipad_2_Input_3",
          "join": 63
        },
        {
          "id": 4,
          "nom": "Sound of the Bar",
          "icone": "music",
          "so": 4,
          "signal": "Ipad_2_Input_4",
          "join": 64
        }
      ],
      "pages": [
        {
          "id": "zones",
          "nom": "Zones",
          "bouton": 0,
          "retour": 0,
          "groupes": [
            {
              "id": "lodgel",
              "nom": "Lodge Left",
              "diffuser": 71,
              "arret": 90,
              "retourSource": 1,
              "zones": [
                {
                  "id": "lodgel",
                  "nom": "Lodge Left",
                  "volPlus": 10,
                  "volMoins": 11,
                  "muet": 12,
                  "muetRetour": 12,
                  "niveau": 1,
                  "signalSimpl": "LodgeL"
                }
              ]
            },
            {
              "id": "lodger",
              "nom": "Lodge Right",
              "diffuser": 72,
              "arret": 91,
              "retourSource": 2,
              "zones": [
                {
                  "id": "lodger",
                  "nom": "Lodge Right",
                  "volPlus": 14,
                  "volMoins": 15,
                  "muet": 16,
                  "muetRetour": 16,
                  "niveau": 2,
                  "signalSimpl": "LodgeR"
                }
              ]
            },
            {
              "id": "pool",
              "nom": "Pool",
              "diffuser": 73,
              "arret": 92,
              "retourSource": 3,
              "zones": [
                {
                  "id": "pool",
                  "nom": "Pool",
                  "volPlus": 18,
                  "volMoins": 19,
                  "muet": 20,
                  "muetRetour": 20,
                  "niveau": 3,
                  "signalSimpl": "Pool"
                }
              ]
            },
            {
              "id": "exterior",
              "nom": "Exterior",
              "diffuser": 74,
              "arret": 93,
              "retourSource": 4,
              "zones": [
                {
                  "id": "exterior",
                  "nom": "Exterior",
                  "volPlus": 22,
                  "volMoins": 23,
                  "muet": 24,
                  "muetRetour": 24,
                  "niveau": 4,
                  "signalSimpl": "Exterior"
                },
                {
                  "id": "exteriorsub",
                  "nom": "Exterior Sub",
                  "volPlus": 26,
                  "volMoins": 27,
                  "muet": 28,
                  "muetRetour": 28,
                  "niveau": 5,
                  "signalSimpl": "ExteriorSub"
                }
              ]
            },
            {
              "id": "micro",
              "nom": "Micro",
              "diffuser": 0,
              "arret": 0,
              "retourSource": 0,
              "zones": [
                {
                  "id": "micro",
                  "nom": "Micro",
                  "volPlus": 30,
                  "volMoins": 31,
                  "muet": 32,
                  "muetRetour": 32,
                  "niveau": 6,
                  "signalSimpl": "Micro"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
