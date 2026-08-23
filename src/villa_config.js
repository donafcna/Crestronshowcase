window.villaConfigEmbedded = {
  "meta": {
    "projet": "Villa Crans",
    "integrateur": "Fréquence TV",
    "version": "1.0.0",
    "dateModification": "2026-08-22",
    "langueReference": "fr",
    "languesDisponibles": [
      "fr",
      "en",
      "es",
      "de",
      "ru"
    ],
    "aide": [
      "PROCESS ÉQUIPE FTV : 1) Remplir ce fichier (sections 'pieces', 'sourcesAudioVideo', 'scenesStores').",
      "2) L'envoyer dans la conversation Claude qui complète la section 'traductions' pour toutes les langues du GUI.",
      "3) Le déployer sur le CP4 (deploy.ps1 le copie dans /user/villa_config.json).",
      "4) Au démarrage, le CP4 lit ce fichier et le transmet au CH5 qui modèle le GUI en conséquence.",
      "RÈGLES : maximum 4 scènes d'éclairage par pièce. Maximum 10 circuits par pièce. Maximum 6 moteurs par pièce.",
      "Un nom laissé vide (\"\") reprend le nom par défaut indiqué dans 'valeursParDefaut'.",
      "Un pilotage avec \"actif\": false masque toute la section correspondante dans le GUI pour cette pièce."
    ]
  },
  "valeursParDefaut": {
    "scenesEclairage": [
      "OFF",
      "Sex",
      "Baise",
      "Alcool"
    ],
    "circuits": [
      "Spots Plafond",
      "Lustre Central",
      "Appliques Murales",
      "Ruban LED"
    ],
    "moteurs": [
      {
        "nom": "Volet ext. 1",
        "type": "volet"
      },
      {
        "nom": "Volet ext. 2",
        "type": "volet"
      },
      {
        "nom": "Rideau ext. 1",
        "type": "rideau"
      },
      {
        "nom": "Rideau ext. 2",
        "type": "rideau"
      },
      {
        "nom": "Store 1",
        "type": "store"
      },
      {
        "nom": "Store 2",
        "type": "store"
      }
    ],
    "scenesStores": [
      "Tout Ouvrir",
      "Position Été",
      "Position Hiver",
      "Tout Fermer"
    ],
    "cvc": {
      "consigneMinC": 16,
      "consigneMaxC": 28,
      "pasC": 0.5
    }
  },
  "sourcesAudioVideo": [
    {
      "id": 1,
      "nom": "IPTV"
    },
    {
      "id": 2,
      "nom": "Box Pirate"
    },
    {
      "id": 3,
      "nom": "Humax"
    },
    {
      "id": 4,
      "nom": "Jukebox"
    },
    {
      "id": 5,
      "nom": "MUSIQUE"
    }
  ],
  "scenesStores": {
    "nombre": 4,
    "noms": [
      "Tout Ouvrir",
      "Position Été",
      "Position Hiver",
      "Tout Fermer"
    ]
  },
  "widgets": {
    "description": "Affichage des widgets du GUI (true = affiche, false = masque). Reglage global villa.",
    "meteoActualites": {
      "actif": false,
      "description": "Widget meteo Nyon / actualites RSS de la colonne de gauche"
    },
    "bandeauActualites": {
      "actif": false,
      "description": "Bandeau defilant Dernieres Actualites du bloc multimedia"
    },
    "parPeripherique": {
      "description": "Surcharges par appareil (cle = IP-ID hexadecimal). Pour chaque widget : true = affiche, false = masque sur CET appareil ; cle absente = reglage global. Extensible a d autres parametres d affichage.",
      "03": {
        "nom": "TSW dalle tactile"
      },
      "04": {
        "nom": "XPanel navigateur"
      },
      "05": {
        "nom": "iPad"
      },
      "06": {
        "nom": "iPhone"
      }
    }
  },
  "pieces": [
    {
      "id": 1,
      "nom": "Salle de Play",
      "intersystem": true,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS2",
              "TOTAL3"
            ]
          },
          "circuits": {
            "nombre": 10,
            "noms": [
              "Spots Plafond Ouest",
              "Lustre Principal",
              "Ruban LED Corniche",
              "Applique Murale Nord",
              "Spots Plafond Ouest2",
              "Lustre Principal2",
              "Ruban LED Corniche2",
              "Applique Murale Nord2",
              "Ruban LED Corniche3",
              "Applique Murale Nord3"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": false
        },
        "controlesGeneraux": {
          "actif": false,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 2,
      "nom": "Chambre Maman",
      "intersystem": true,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "Jeux",
              "Baise",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Spots Zone Cuisson",
              "Suspension Îlot",
              "LED Plan de Travail",
              "Plafonnier Central"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": false
        },
        "controlesGeneraux": {
          "actif": false,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 3,
      "nom": "Chambre Papa",
      "intersystem": true,
      "pilotages": {
        "eclairages": {
          "actif": false,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Lustre Table Repas",
              "Spots Plafond",
              "Appliques Buffet Est",
              "Ruban LED Vaisselier"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 4,
      "nom": "Suite amis",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Plafonnier Suite",
              "Liseuse Lit Gauche",
              "Liseuse Lit Droite",
              "Corniche LED Tête de Lit"
            ]
          }
        },
        "moteurs": {
          "actif": false,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": false,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": false,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 5,
      "nom": "Chambre Amis",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Plafonnier Chambre 1",
              "Lampe Bureau 1",
              "Liseuse Lit 1",
              "Spots Dressing 1"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 6,
      "nom": "Chambre 2",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Plafonnier Chambre 2",
              "Lampe Bureau 2",
              "Liseuse Lit 2",
              "Spots Dressing 2"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 7,
      "nom": "Bureau",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Spots Plafond Bureau",
              "Lampe Bureau Design",
              "Ruban LED Bibliothèque",
              "Applique Zone Accueil"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 8,
      "nom": "Home Cinéma",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Nez de Marche Gradué",
              "Appliques Murales Gauche",
              "Appliques Murales Droite",
              "Ruban LED Écran"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 9,
      "nom": "Chambre 3",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Plafonnier Chambre 3",
              "Lampe Bureau 3",
              "Liseuse Lit 3",
              "Spots Dressing 3"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 10,
      "nom": "Suite Invités",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Lustre Suite Invités",
              "Liseuse Invités",
              "LED Tête de Lit",
              "Spots Dressing Invités"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 11,
      "nom": "Terrasse & Jardin",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Projecteurs Avant-toit",
              "Appliques Façade Sud",
              "Spots Encastrés Sol",
              "Ruban LED Sous-Banc"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 12,
      "nom": "Piscine & Spa",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Projecteurs Subaquatiques",
              "Spots Plafond Spa",
              "Ruban LED Margelle",
              "Appliques Ambiance Plage"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 13,
      "nom": "Sauna & Hammam",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Plafonnier Vapeur Sauna",
              "Ruban LED Sous-Banc Sauna",
              "Projecteurs Hammam",
              "Spots Douche Pluie"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 14,
      "nom": "Pool House",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Suspensions Bar Pool House",
              "Spots Plafond Salon d'Été",
              "Ruban LED Comptoir",
              "Appliques Terrasse Pool House"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    },
    {
      "id": 15,
      "nom": "Garage & Ateliers",
      "intersystem": false,
      "pilotages": {
        "eclairages": {
          "actif": true,
          "scenes": {
            "nombre": 4,
            "noms": [
              "OFF",
              "CINÉMA",
              "REPAS",
              "TOTAL"
            ]
          },
          "circuits": {
            "nombre": 4,
            "noms": [
              "Réglettes LED Garage",
              "Spots Zone Établi",
              "Éclairage Porte Sectionnelle",
              "Appliques Entrée Garage"
            ]
          }
        },
        "moteurs": {
          "actif": true,
          "nombre": 6,
          "liste": [
            {
              "nom": "Volet ext. 1",
              "type": "volet"
            },
            {
              "nom": "Volet ext. 2",
              "type": "volet"
            },
            {
              "nom": "Rideau ext. 1",
              "type": "rideau"
            },
            {
              "nom": "Rideau ext. 2",
              "type": "rideau"
            },
            {
              "nom": "Store 1",
              "type": "store"
            },
            {
              "nom": "Store 2",
              "type": "store"
            }
          ]
        },
        "cvc": {
          "actif": true
        },
        "controlesGeneraux": {
          "actif": true,
          "partitionsAlarme": 4
        },
        "audioVideo": {
          "actif": true,
          "sources": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    }
  ],
  "traductions": {
    "en": {
      "Salon": "Living Room",
      "Cuisine": "Kitchen",
      "Salle à Manger": "Dining Room",
      "Suite Parentale": "Master Suite",
      "Chambre 1": "Bedroom 1",
      "Chambre 2": "Bedroom 2",
      "Chambre 3": "Bedroom 3",
      "Bureau": "Office",
      "Home Cinéma": "Home Cinema",
      "Suite Invités": "Guest Suite",
      "Terrasse & Jardin": "Terrace & Garden",
      "Piscine & Spa": "Pool & Spa",
      "Sauna & Hammam": "Sauna & Hammam",
      "Pool House": "Pool House",
      "Garage & Ateliers": "Garage & Workshops",
      "OFF": "OFF",
      "CINÉMA": "CINEMA",
      "REPAS": "DINNER",
      "TOTAL": "FULL",
      "Tout Ouvrir": "Open All",
      "Position Été": "Summer Position",
      "Position Hiver": "Winter Position",
      "Tout Fermer": "Close All",
      "Volet ext. 1": "Ext. Shutter 1",
      "Volet ext. 2": "Ext. Shutter 2",
      "Rideau ext. 1": "Ext. Curtain 1",
      "Rideau ext. 2": "Ext. Curtain 2",
      "Store 1": "Shade 1",
      "Store 2": "Shade 2",
      "MUSIQUE": "MUSIC",
      "CHAUFFAGE": "HEATING",
      "CLIMATISATION": "COOLING",
      "Spots Plafond": "Ceiling Spots",
      "Lustre Central": "Central Chandelier",
      "Appliques Murales": "Wall Sconces",
      "Ruban LED": "LED Strip",
      "Spots Plafond Ouest": "West Ceiling Spots",
      "Lustre Principal": "Main Chandelier",
      "Ruban LED Corniche": "Cornice LED Strip",
      "Applique Murale Nord": "North Wall Sconce",
      "Spots Zone Cuisson": "Cooking Area Spots",
      "Suspension Îlot": "Island Pendant",
      "LED Plan de Travail": "Worktop LED",
      "Plafonnier Central": "Central Ceiling Light",
      "Lustre Table Repas": "Dining Table Chandelier",
      "Appliques Buffet Est": "East Buffet Sconces",
      "Ruban LED Vaisselier": "Cabinet LED Strip",
      "Plafonnier Suite": "Suite Ceiling Light",
      "Liseuse Lit Gauche": "Left Reading Light",
      "Liseuse Lit Droite": "Right Reading Light",
      "Corniche LED Tête de Lit": "Headboard LED Cove",
      "Plafonnier Chambre 1": "Bedroom 1 Ceiling Light",
      "Lampe Bureau 1": "Desk Lamp 1",
      "Liseuse Lit 1": "Reading Light 1",
      "Spots Dressing 1": "Dressing Spots 1",
      "Plafonnier Chambre 2": "Bedroom 2 Ceiling Light",
      "Lampe Bureau 2": "Desk Lamp 2",
      "Liseuse Lit 2": "Reading Light 2",
      "Spots Dressing 2": "Dressing Spots 2",
      "Plafonnier Chambre 3": "Bedroom 3 Ceiling Light",
      "Lampe Bureau 3": "Desk Lamp 3",
      "Liseuse Lit 3": "Reading Light 3",
      "Spots Dressing 3": "Dressing Spots 3",
      "Spots Plafond Bureau": "Office Ceiling Spots",
      "Lampe Bureau Design": "Design Desk Lamp",
      "Ruban LED Bibliothèque": "Bookshelf LED Strip",
      "Applique Zone Accueil": "Entry Area Sconce",
      "Nez de Marche Gradué": "Dimmed Step Lights",
      "Appliques Murales Gauche": "Left Wall Sconces",
      "Appliques Murales Droite": "Right Wall Sconces",
      "Ruban LED Écran": "Screen LED Strip",
      "Lustre Suite Invités": "Guest Suite Chandelier",
      "Liseuse Invités": "Guest Reading Light",
      "LED Tête de Lit": "Headboard LED",
      "Spots Dressing Invités": "Guest Dressing Spots",
      "Projecteurs Avant-toit": "Eaves Floodlights",
      "Appliques Façade Sud": "South Facade Sconces",
      "Spots Encastrés Sol": "Ground Recessed Spots",
      "Ruban LED Sous-Banc": "Under-Bench LED Strip",
      "Projecteurs Subaquatiques": "Underwater Lights",
      "Spots Plafond Spa": "Spa Ceiling Spots",
      "Ruban LED Margelle": "Pool Edge LED Strip",
      "Appliques Ambiance Plage": "Deck Ambience Sconces",
      "Plafonnier Vapeur Sauna": "Sauna Ceiling Light",
      "Ruban LED Sous-Banc Sauna": "Sauna Under-Bench LED",
      "Projecteurs Hammam": "Hammam Lights",
      "Spots Douche Pluie": "Rain Shower Spots",
      "Suspensions Bar Pool House": "Pool House Bar Pendants",
      "Spots Plafond Salon d'Été": "Summer Lounge Spots",
      "Ruban LED Comptoir": "Counter LED Strip",
      "Appliques Terrasse Pool House": "Pool House Terrace Sconces",
      "Réglettes LED Garage": "Garage LED Battens",
      "Spots Zone Établi": "Workbench Spots",
      "Éclairage Porte Sectionnelle": "Sectional Door Light",
      "Appliques Entrée Garage": "Garage Entry Sconces",
      "IPTV": "IPTV",
      "Box Pirate": "Pirate Box",
      "Humax": "Humax",
      "Jukebox": "Jukebox",
      "Sex": "Sex",
      "Baise": "Fuck",
      "Alcool": "Alcohol",
      "Salon2": "Living Room 2",
      "REPAS2": "DINNER 2",
      "TOTAL3": "FULL 3",
      "Chambre pour Baiser": "Fuck Room",
      "Salle à Baiser": "Shagging Room",
      "Suite bébé": "Baby Suite"
    },
    "es": {
      "Salon": "Salón",
      "Cuisine": "Cocina",
      "Salle à Manger": "Comedor",
      "Suite Parentale": "Suite Principal",
      "Chambre 1": "Dormitorio 1",
      "Chambre 2": "Dormitorio 2",
      "Chambre 3": "Dormitorio 3",
      "Bureau": "Despacho",
      "Home Cinéma": "Cine en Casa",
      "Suite Invités": "Suite de Invitados",
      "Terrasse & Jardin": "Terraza y Jardín",
      "Piscine & Spa": "Piscina y Spa",
      "Sauna & Hammam": "Sauna y Hammam",
      "Pool House": "Pool House",
      "Garage & Ateliers": "Garaje y Talleres",
      "OFF": "OFF",
      "CINÉMA": "CINE",
      "REPAS": "COMIDA",
      "TOTAL": "TOTAL",
      "Tout Ouvrir": "Abrir Todo",
      "Position Été": "Posición Verano",
      "Position Hiver": "Posición Invierno",
      "Tout Fermer": "Cerrar Todo",
      "Volet ext. 1": "Persiana ext. 1",
      "Volet ext. 2": "Persiana ext. 2",
      "Rideau ext. 1": "Cortina ext. 1",
      "Rideau ext. 2": "Cortina ext. 2",
      "Store 1": "Estor 1",
      "Store 2": "Estor 2",
      "MUSIQUE": "MÚSICA",
      "CHAUFFAGE": "CALEFACCIÓN",
      "CLIMATISATION": "REFRIGERACIÓN",
      "Spots Plafond": "Focos de Techo",
      "Lustre Central": "Lámpara Central",
      "Appliques Murales": "Apliques de Pared",
      "Ruban LED": "Tira LED",
      "Spots Plafond Ouest": "Focos Techo Oeste",
      "Lustre Principal": "Lámpara Principal",
      "Ruban LED Corniche": "Tira LED Cornisa",
      "Applique Murale Nord": "Aplique Norte",
      "Spots Zone Cuisson": "Focos Zona Cocción",
      "Suspension Îlot": "Colgante Isla",
      "LED Plan de Travail": "LED Encimera",
      "Plafonnier Central": "Plafón Central",
      "Lustre Table Repas": "Lámpara Mesa Comedor",
      "Appliques Buffet Est": "Apliques Aparador Este",
      "Ruban LED Vaisselier": "Tira LED Vitrina",
      "Plafonnier Suite": "Plafón Suite",
      "Liseuse Lit Gauche": "Lector Izquierdo",
      "Liseuse Lit Droite": "Lector Derecho",
      "Corniche LED Tête de Lit": "LED Cabecero",
      "Plafonnier Chambre 1": "Plafón Dormitorio 1",
      "Lampe Bureau 1": "Lámpara Escritorio 1",
      "Liseuse Lit 1": "Lector Cama 1",
      "Spots Dressing 1": "Focos Vestidor 1",
      "Plafonnier Chambre 2": "Plafón Dormitorio 2",
      "Lampe Bureau 2": "Lámpara Escritorio 2",
      "Liseuse Lit 2": "Lector Cama 2",
      "Spots Dressing 2": "Focos Vestidor 2",
      "Plafonnier Chambre 3": "Plafón Dormitorio 3",
      "Lampe Bureau 3": "Lámpara Escritorio 3",
      "Liseuse Lit 3": "Lector Cama 3",
      "Spots Dressing 3": "Focos Vestidor 3",
      "Spots Plafond Bureau": "Focos Techo Despacho",
      "Lampe Bureau Design": "Lámpara de Diseño",
      "Ruban LED Bibliothèque": "Tira LED Librería",
      "Applique Zone Accueil": "Aplique Recepción",
      "Nez de Marche Gradué": "Luz de Escalones",
      "Appliques Murales Gauche": "Apliques Izquierda",
      "Appliques Murales Droite": "Apliques Derecha",
      "Ruban LED Écran": "Tira LED Pantalla",
      "Lustre Suite Invités": "Lámpara Suite Invitados",
      "Liseuse Invités": "Lector Invitados",
      "LED Tête de Lit": "LED Cabecero Cama",
      "Spots Dressing Invités": "Focos Vestidor Invitados",
      "Projecteurs Avant-toit": "Proyectores Alero",
      "Appliques Façade Sud": "Apliques Fachada Sur",
      "Spots Encastrés Sol": "Focos Empotrados Suelo",
      "Ruban LED Sous-Banc": "Tira LED Bajo Banco",
      "Projecteurs Subaquatiques": "Focos Subacuáticos",
      "Spots Plafond Spa": "Focos Techo Spa",
      "Ruban LED Margelle": "Tira LED Borde Piscina",
      "Appliques Ambiance Plage": "Apliques Zona Playa",
      "Plafonnier Vapeur Sauna": "Plafón Sauna",
      "Ruban LED Sous-Banc Sauna": "Tira LED Banco Sauna",
      "Projecteurs Hammam": "Focos Hammam",
      "Spots Douche Pluie": "Focos Ducha Lluvia",
      "Suspensions Bar Pool House": "Colgantes Bar Pool House",
      "Spots Plafond Salon d'Été": "Focos Salón de Verano",
      "Ruban LED Comptoir": "Tira LED Barra",
      "Appliques Terrasse Pool House": "Apliques Terraza Pool House",
      "Réglettes LED Garage": "Regletas LED Garaje",
      "Spots Zone Établi": "Focos Banco de Trabajo",
      "Éclairage Porte Sectionnelle": "Luz Puerta Seccional",
      "Appliques Entrée Garage": "Apliques Entrada Garaje",
      "IPTV": "IPTV",
      "Box Pirate": "Caja Pirata",
      "Humax": "Humax",
      "Jukebox": "Jukebox",
      "Sex": "Sexo",
      "Baise": "Follar",
      "Alcool": "Alcohol",
      "Salon2": "Salón 2",
      "REPAS2": "COMIDA 2",
      "TOTAL3": "TOTAL 3",
      "Chambre pour Baiser": "Cuarto de Follar",
      "Salle à Baiser": "Sala de Follar",
      "Suite bébé": "Suite del Bebé"
    },
    "de": {
      "Salon": "Wohnzimmer",
      "Cuisine": "Küche",
      "Salle à Manger": "Esszimmer",
      "Suite Parentale": "Elternsuite",
      "Chambre 1": "Schlafzimmer 1",
      "Chambre 2": "Schlafzimmer 2",
      "Chambre 3": "Schlafzimmer 3",
      "Bureau": "Büro",
      "Home Cinéma": "Heimkino",
      "Suite Invités": "Gästesuite",
      "Terrasse & Jardin": "Terrasse & Garten",
      "Piscine & Spa": "Pool & Spa",
      "Sauna & Hammam": "Sauna & Hamam",
      "Pool House": "Poolhaus",
      "Garage & Ateliers": "Garage & Werkstätten",
      "OFF": "AUS",
      "CINÉMA": "KINO",
      "REPAS": "ESSEN",
      "TOTAL": "VOLL",
      "Tout Ouvrir": "Alles Öffnen",
      "Position Été": "Sommerposition",
      "Position Hiver": "Winterposition",
      "Tout Fermer": "Alles Schließen",
      "Volet ext. 1": "Rollladen 1",
      "Volet ext. 2": "Rollladen 2",
      "Rideau ext. 1": "Vorhang 1",
      "Rideau ext. 2": "Vorhang 2",
      "Store 1": "Markise 1",
      "Store 2": "Markise 2",
      "MUSIQUE": "MUSIK",
      "CHAUFFAGE": "HEIZUNG",
      "CLIMATISATION": "KÜHLUNG",
      "Spots Plafond": "Deckenspots",
      "Lustre Central": "Zentraler Lüster",
      "Appliques Murales": "Wandleuchten",
      "Ruban LED": "LED-Band",
      "Spots Plafond Ouest": "Deckenspots West",
      "Lustre Principal": "Hauptlüster",
      "Ruban LED Corniche": "LED-Band Gesims",
      "Applique Murale Nord": "Wandleuchte Nord",
      "Spots Zone Cuisson": "Spots Kochbereich",
      "Suspension Îlot": "Pendelleuchte Insel",
      "LED Plan de Travail": "LED Arbeitsplatte",
      "Plafonnier Central": "Deckenleuchte Mitte",
      "Lustre Table Repas": "Lüster Esstisch",
      "Appliques Buffet Est": "Wandleuchten Buffet Ost",
      "Ruban LED Vaisselier": "LED-Band Vitrine",
      "Plafonnier Suite": "Deckenleuchte Suite",
      "Liseuse Lit Gauche": "Leselampe links",
      "Liseuse Lit Droite": "Leselampe rechts",
      "Corniche LED Tête de Lit": "LED-Voute Kopfteil",
      "Plafonnier Chambre 1": "Deckenleuchte SZ 1",
      "Lampe Bureau 1": "Schreibtischlampe 1",
      "Liseuse Lit 1": "Leselampe 1",
      "Spots Dressing 1": "Spots Ankleide 1",
      "Plafonnier Chambre 2": "Deckenleuchte SZ 2",
      "Lampe Bureau 2": "Schreibtischlampe 2",
      "Liseuse Lit 2": "Leselampe 2",
      "Spots Dressing 2": "Spots Ankleide 2",
      "Plafonnier Chambre 3": "Deckenleuchte SZ 3",
      "Lampe Bureau 3": "Schreibtischlampe 3",
      "Liseuse Lit 3": "Leselampe 3",
      "Spots Dressing 3": "Spots Ankleide 3",
      "Spots Plafond Bureau": "Deckenspots Büro",
      "Lampe Bureau Design": "Design-Schreibtischlampe",
      "Ruban LED Bibliothèque": "LED-Band Bibliothek",
      "Applique Zone Accueil": "Wandleuchte Empfang",
      "Nez de Marche Gradué": "Gedimmtes Stufenlicht",
      "Appliques Murales Gauche": "Wandleuchten links",
      "Appliques Murales Droite": "Wandleuchten rechts",
      "Ruban LED Écran": "LED-Band Leinwand",
      "Lustre Suite Invités": "Lüster Gästesuite",
      "Liseuse Invités": "Leselampe Gäste",
      "LED Tête de Lit": "LED Kopfteil",
      "Spots Dressing Invités": "Spots Ankleide Gäste",
      "Projecteurs Avant-toit": "Strahler Dachvorsprung",
      "Appliques Façade Sud": "Wandleuchten Südfassade",
      "Spots Encastrés Sol": "Bodeneinbauspots",
      "Ruban LED Sous-Banc": "LED-Band Sitzbank",
      "Projecteurs Subaquatiques": "Unterwasserscheinwerfer",
      "Spots Plafond Spa": "Deckenspots Spa",
      "Ruban LED Margelle": "LED-Band Beckenrand",
      "Appliques Ambiance Plage": "Wandleuchten Poolbereich",
      "Plafonnier Vapeur Sauna": "Deckenleuchte Sauna",
      "Ruban LED Sous-Banc Sauna": "LED-Band Saunabank",
      "Projecteurs Hammam": "Strahler Hamam",
      "Spots Douche Pluie": "Spots Regendusche",
      "Suspensions Bar Pool House": "Pendelleuchten Bar",
      "Spots Plafond Salon d'Été": "Spots Sommerlounge",
      "Ruban LED Comptoir": "LED-Band Theke",
      "Appliques Terrasse Pool House": "Wandleuchten Poolhaus-Terrasse",
      "Réglettes LED Garage": "LED-Leisten Garage",
      "Spots Zone Établi": "Spots Werkbank",
      "Éclairage Porte Sectionnelle": "Licht Sektionaltor",
      "Appliques Entrée Garage": "Wandleuchten Garageneinfahrt",
      "IPTV": "IPTV",
      "Box Pirate": "Piraten-Box",
      "Humax": "Humax",
      "Jukebox": "Jukebox",
      "Sex": "Sex",
      "Baise": "Fick",
      "Alcool": "Alkohol",
      "Salon2": "Wohnzimmer 2",
      "REPAS2": "ESSEN 2",
      "TOTAL3": "VOLL 3",
      "Chambre pour Baiser": "Fickzimmer",
      "Salle à Baiser": "Ficksalon",
      "Suite bébé": "Babysuite"
    },
    "ru": {
      "Salon": "Гостиная",
      "Cuisine": "Кухня",
      "Salle à Manger": "Столовая",
      "Suite Parentale": "Хозяйская спальня",
      "Chambre 1": "Спальня 1",
      "Chambre 2": "Спальня 2",
      "Chambre 3": "Спальня 3",
      "Bureau": "Кабинет",
      "Home Cinéma": "Домашний кинотеатр",
      "Suite Invités": "Гостевая спальня",
      "Terrasse & Jardin": "Терраса и сад",
      "Piscine & Spa": "Бассейн и спа",
      "Sauna & Hammam": "Сауна и хаммам",
      "Pool House": "Пул-хаус",
      "Garage & Ateliers": "Гараж и мастерские",
      "OFF": "ВЫКЛ",
      "CINÉMA": "КИНО",
      "REPAS": "УЖИН",
      "TOTAL": "ПОЛНЫЙ",
      "Tout Ouvrir": "Открыть все",
      "Position Été": "Летнее положение",
      "Position Hiver": "Зимнее положение",
      "Tout Fermer": "Закрыть все",
      "Volet ext. 1": "Рольставни 1",
      "Volet ext. 2": "Рольставни 2",
      "Rideau ext. 1": "Штора 1",
      "Rideau ext. 2": "Штора 2",
      "Store 1": "Маркиза 1",
      "Store 2": "Маркиза 2",
      "MUSIQUE": "МУЗЫКА",
      "CHAUFFAGE": "ОТОПЛЕНИЕ",
      "CLIMATISATION": "ОХЛАЖДЕНИЕ",
      "Spots Plafond": "Потолочные споты",
      "Lustre Central": "Центральная люстра",
      "Appliques Murales": "Настенные бра",
      "Ruban LED": "LED-лента",
      "Spots Plafond Ouest": "Споты потолка (запад)",
      "Lustre Principal": "Главная люстра",
      "Ruban LED Corniche": "LED-лента карниза",
      "Applique Murale Nord": "Бра северное",
      "Spots Zone Cuisson": "Споты зоны плиты",
      "Suspension Îlot": "Подвес над островом",
      "LED Plan de Travail": "LED столешницы",
      "Plafonnier Central": "Центральный светильник",
      "Lustre Table Repas": "Люстра над столом",
      "Appliques Buffet Est": "Бра у буфета (восток)",
      "Ruban LED Vaisselier": "LED-лента серванта",
      "Plafonnier Suite": "Светильник спальни",
      "Liseuse Lit Gauche": "Бра для чтения (лев.)",
      "Liseuse Lit Droite": "Бра для чтения (прав.)",
      "Corniche LED Tête de Lit": "LED изголовья",
      "Plafonnier Chambre 1": "Светильник спальни 1",
      "Lampe Bureau 1": "Настольная лампа 1",
      "Liseuse Lit 1": "Бра для чтения 1",
      "Spots Dressing 1": "Споты гардероба 1",
      "Plafonnier Chambre 2": "Светильник спальни 2",
      "Lampe Bureau 2": "Настольная лампа 2",
      "Liseuse Lit 2": "Бра для чтения 2",
      "Spots Dressing 2": "Споты гардероба 2",
      "Plafonnier Chambre 3": "Светильник спальни 3",
      "Lampe Bureau 3": "Настольная лампа 3",
      "Liseuse Lit 3": "Бра для чтения 3",
      "Spots Dressing 3": "Споты гардероба 3",
      "Spots Plafond Bureau": "Споты кабинета",
      "Lampe Bureau Design": "Дизайнерская лампа",
      "Ruban LED Bibliothèque": "LED-лента библиотеки",
      "Applique Zone Accueil": "Бра у входа",
      "Nez de Marche Gradué": "Подсветка ступеней",
      "Appliques Murales Gauche": "Бра левые",
      "Appliques Murales Droite": "Бра правые",
      "Ruban LED Écran": "LED-лента экрана",
      "Lustre Suite Invités": "Люстра гостевой",
      "Liseuse Invités": "Бра для чтения (гости)",
      "LED Tête de Lit": "LED изголовья кровати",
      "Spots Dressing Invités": "Споты гардероба (гости)",
      "Projecteurs Avant-toit": "Прожекторы карниза",
      "Appliques Façade Sud": "Бра южного фасада",
      "Spots Encastrés Sol": "Встроенные споты в полу",
      "Ruban LED Sous-Banc": "LED-лента под скамьёй",
      "Projecteurs Subaquatiques": "Подводные прожекторы",
      "Spots Plafond Spa": "Споты потолка спа",
      "Ruban LED Margelle": "LED-лента борта",
      "Appliques Ambiance Plage": "Бра зоны отдыха",
      "Plafonnier Vapeur Sauna": "Светильник сауны",
      "Ruban LED Sous-Banc Sauna": "LED-лента под полкой",
      "Projecteurs Hammam": "Прожекторы хаммама",
      "Spots Douche Pluie": "Споты тропического душа",
      "Suspensions Bar Pool House": "Подвесы бара",
      "Spots Plafond Salon d'Été": "Споты летней гостиной",
      "Ruban LED Comptoir": "LED-лента стойки",
      "Appliques Terrasse Pool House": "Бра террасы пул-хауса",
      "Réglettes LED Garage": "LED-светильники гаража",
      "Spots Zone Établi": "Споты верстака",
      "Éclairage Porte Sectionnelle": "Свет секционных ворот",
      "Appliques Entrée Garage": "Бра въезда в гараж",
      "IPTV": "IPTV",
      "Box Pirate": "Пиратский бокс",
      "Humax": "Humax",
      "Jukebox": "Джукбокс",
      "Sex": "Секс",
      "Baise": "Трах",
      "Alcool": "Алкоголь",
      "Salon2": "Гостиная 2",
      "REPAS2": "УЖИН 2",
      "TOTAL3": "ПОЛНЫЙ 3",
      "Chambre pour Baiser": "Комната для траха",
      "Salle à Baiser": "Зал для траха",
      "Suite bébé": "Детская спальня"
    }
  },
  "contrat": {
    "version": 2,
    "notes": [
      "CONTRAT v2 (22.08.2026) : Piece.Select etendu a 30 pieces (digitaux 11-40). Decalages : Eclairage.Scene 21-24 -> 51-54, AV.Mute 53 -> 55, CVC.ConsignePlus 35 -> 49, CVC.ConsigneMoins 36 -> 50, Meteo.EasterEgg 37 -> 56.",
      "Contrat de joins unifié Villa Crans, structuré en deux familles :",
      "1) signauxGlobaux : joins système/globaux/interface (tous < 1000), miroir 1:1 vers l'EISC du slot 2.",
      "2) blocsPieces : chaque pièce expose un bloc de 100 joins sur l'EISC - base = 1000 + (id - 1) * 100.",
      "   Exemple : pièce 1 = 1000..1099, pièce 2 = 1100..1199, pièce 15 = 2400..2499.",
      "   Le flag 'intersystem' de chaque pièce (true/false) active ou coupe son bloc EISC :",
      "   mettre false sur les pièces non câblées en SIMPL limite le nombre de signaux à monitorer dans le debugger.",
      "Les joins GUI restent découplés (la dalle pilote la pièce active) ; les blocs par pièce ne concernent que l'intersystem.",
      "CONFLIT HISTORIQUE RÉSOLU : les joins 201/202 étaient partagés entre lecteur média (mute/volume) et scènes de stores.",
      "Le lecteur média utilise désormais 55 (mute) et 52 (volume) ; 201-204 restent les scènes de stores."
    ],
    "eisc": {
      "actif": true,
      "ipid": "0xF0",
      "adresseIp": "127.0.0.2",
      "slotCible": 2,
      "description": "Pont intersystem vers le programme SIMPL Windows chargé sur le slot 2 du CP4. Côté SIMPL : symbole 'Intersystem Communications' (EISC), IP-ID F0, IP 127.0.0.2."
    },
    "signauxGlobaux": [
      {
        "contractName": "Piece.Active",
        "type": "analog",
        "join": 10,
        "direction": "bidirectionnel",
        "eiscJoin": 10,
        "description": "ID de la pièce active (1..N)"
      },
      {
        "contractName": "Piece.Nom",
        "type": "serial",
        "join": 10,
        "direction": "sortie",
        "eiscJoin": 10,
        "description": "Nom de la pièce active (majuscules)"
      },
      {
        "contractName": "Piece.Select",
        "type": "digital",
        "joinDebut": 11,
        "nombre": 30,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 11,
        "description": "Selection directe piece 1..30 (join = 10 + id de piece) + feedback"
      },
      {
        "contractName": "Eclairage.Scene",
        "type": "digital",
        "joinDebut": 51,
        "nombre": 4,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 51,
        "description": "Scenes d'eclairage 1..4 de la piece active + feedback (v2, ex-21-24)"
      },
      {
        "contractName": "Eclairage.NiveauMaster",
        "type": "analog",
        "join": 21,
        "direction": "bidirectionnel",
        "eiscJoin": 21,
        "description": "Niveau master éclairage pièce active (0..65535)"
      },
      {
        "contractName": "CVC.Consigne",
        "type": "analog",
        "join": 31,
        "direction": "bidirectionnel",
        "eiscJoin": 31,
        "description": "Consigne de température x10 (210 = 21.0°C)"
      },
      {
        "contractName": "CVC.TempActuelle",
        "type": "serial",
        "join": 32,
        "direction": "sortie",
        "eiscJoin": 32,
        "description": "Température actuelle formatée (ex: 22.4)"
      },
      {
        "contractName": "CVC.Mode",
        "type": "serial",
        "join": 33,
        "direction": "sortie",
        "eiscJoin": 33,
        "description": "Mode CVC actif (CHAUFFAGE / CLIMATISATION)"
      },
      {
        "contractName": "CVC.ConsigneTexte",
        "type": "serial",
        "join": 34,
        "direction": "sortie",
        "eiscJoin": 34,
        "description": "Consigne formatée (ex: 21.0)"
      },
      {
        "contractName": "CVC.ConsignePlus",
        "type": "digital",
        "join": 49,
        "direction": "entree",
        "eiscJoin": 49,
        "description": "Consigne +0.5 C (piece active) (v2, ex-35)"
      },
      {
        "contractName": "CVC.ConsigneMoins",
        "type": "digital",
        "join": 50,
        "direction": "entree",
        "eiscJoin": 50,
        "description": "Consigne -0.5 C (piece active) (v2, ex-36)"
      },
      {
        "contractName": "Meteo.EasterEgg",
        "type": "digital",
        "join": 56,
        "direction": "entree",
        "eiscJoin": 56,
        "description": "Triple-clic widget meteo (v2, ex-37)"
      },
      {
        "contractName": "Stores.Groupe",
        "type": "digital",
        "joinDebut": 61,
        "nombre": 9,
        "direction": "entree",
        "eiscJoinDebut": 61,
        "description": "Commandes groupees des motorisations de la piece active : Volets Ext. 61/62/63, Rideaux 64/65/66, Stores 67/68/69 (Monter/Stop/Descendre). Le C# relaie vers le slot 2 qui pilote les moteurs reels."
      },
      {
        "contractName": "Alarme.Armer",
        "type": "digital",
        "join": 41,
        "direction": "bidirectionnel",
        "eiscJoin": 41,
        "description": "Armement général alarme + feedback"
      },
      {
        "contractName": "Alarme.Desarmer",
        "type": "digital",
        "join": 42,
        "direction": "bidirectionnel",
        "eiscJoin": 42,
        "description": "Désarmement général alarme + feedback"
      },
      {
        "contractName": "AV.SourceActive",
        "type": "analog",
        "join": 51,
        "direction": "bidirectionnel",
        "eiscJoin": 51,
        "description": "Source A/V active (0=off, 1..5)"
      },
      {
        "contractName": "AV.Volume",
        "type": "analog",
        "join": 52,
        "direction": "bidirectionnel",
        "eiscJoin": 52,
        "description": "Volume multimédia pièce active (0..65535)"
      },
      {
        "contractName": "AV.Mute",
        "type": "digital",
        "join": 55,
        "direction": "bidirectionnel",
        "eiscJoin": 55,
        "description": "Mute audio piece active (toggle + feedback) (v2, ex-53)"
      },
      {
        "contractName": "Eclairage.Circuit",
        "type": "analog",
        "joinDebut": 71,
        "nombre": 10,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 71,
        "description": "Niveau des circuits d'éclairage 1..10 de la pièce active"
      },
      {
        "contractName": "Moteur.Commande",
        "type": "digital",
        "joinDebut": 81,
        "nombre": 18,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 81,
        "description": "Moteurs 1..6 : triplets Monter/Stop/Descendre (81,82,83 = moteur 1 ... 96,97,98 = moteur 6)"
      },
      {
        "contractName": "Systeme.IpId",
        "type": "serial",
        "join": 99,
        "direction": "sortie",
        "eiscJoin": 99,
        "description": "IP-ID du panel connecté"
      },
      {
        "contractName": "Systeme.CpzNom",
        "type": "serial",
        "join": 101,
        "direction": "sortie",
        "eiscJoin": 101,
        "description": "Nom du fichier CPZ"
      },
      {
        "contractName": "Systeme.CpzDate",
        "type": "serial",
        "join": 102,
        "direction": "sortie",
        "eiscJoin": 102,
        "description": "Date de compilation du CPZ"
      },
      {
        "contractName": "Systeme.Console",
        "type": "serial",
        "join": 103,
        "direction": "bidirectionnel",
        "eiscJoin": 103,
        "description": "Commande console CP4 (entrée) / réponse (sortie)"
      },
      {
        "contractName": "Systeme.DateValidation",
        "type": "serial",
        "join": 104,
        "direction": "bidirectionnel",
        "eiscJoin": 104,
        "description": "Date de dernière validation par périphérique"
      },
      {
        "contractName": "Config.Json",
        "type": "serial",
        "join": 105,
        "direction": "sortie",
        "eiscJoin": 105,
        "description": "Transport de villa_config.json vers le CH5 (chunks 'VCFG|i|n|payload')"
      },
      {
        "contractName": "Config.Hash",
        "type": "serial",
        "join": 106,
        "direction": "sortie",
        "eiscJoin": 106,
        "description": "Empreinte de villa_config.json publiee aux panels : le GUI ne demande le transfert complet (Digital 250) que si son cache differe."
      },
      {
        "contractName": "AV.Source.Select",
        "type": "digital",
        "joinDebut": 150,
        "nombre": 6,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 150,
        "description": "Sélection source 0..5 (150 = OFF) + feedback interverrouillé"
      },
      {
        "contractName": "Stores.Scene",
        "type": "digital",
        "joinDebut": 201,
        "nombre": 4,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 201,
        "description": "Scènes de stores 1..4 de la pièce active + feedback"
      },
      {
        "contractName": "Config.Resync",
        "type": "digital",
        "join": 250,
        "direction": "entree",
        "eiscJoin": 250,
        "description": "Demande de (re)envoi de la configuration par le panel"
      },
      {
        "contractName": "Config.ChunkAck",
        "type": "analog",
        "join": 250,
        "direction": "entree",
        "eiscJoin": 250,
        "description": "Accusé de réception du chunk N de configuration"
      },
      {
        "contractName": "Alarme.Partition",
        "type": "digital",
        "joinDebut": 301,
        "nombre": 12,
        "direction": "bidirectionnel",
        "eiscJoinDebut": 301,
        "description": "Partitions 1..4 : triplets Armer/Partiel/Désarmer (301,302,303 = partition 1)"
      },
      {
        "contractName": "Global.Eclairage.ToutAllumer",
        "type": "digital",
        "join": 401,
        "direction": "entree",
        "eiscJoin": 401,
        "description": "Commande globale : tout allumer"
      },
      {
        "contractName": "Global.Eclairage.ToutEteindre",
        "type": "digital",
        "join": 402,
        "direction": "entree",
        "eiscJoin": 402,
        "description": "Commande globale : tout éteindre"
      },
      {
        "contractName": "Global.Eclairage.ModeEco",
        "type": "digital",
        "join": 403,
        "direction": "entree",
        "eiscJoin": 403,
        "description": "Commande globale : mode éco"
      },
      {
        "contractName": "Global.Stores.ToutOuvrir",
        "type": "digital",
        "join": 404,
        "direction": "entree",
        "eiscJoin": 404,
        "description": "Commande globale : ouvrir tous les stores"
      },
      {
        "contractName": "Global.Stores.ToutFermer",
        "type": "digital",
        "join": 405,
        "direction": "entree",
        "eiscJoin": 405,
        "description": "Commande globale : fermer tous les stores"
      },
      {
        "contractName": "Global.Stores.PositionInter",
        "type": "digital",
        "join": 406,
        "direction": "entree",
        "eiscJoin": 406,
        "description": "Commande globale : position intermédiaire"
      },
      {
        "contractName": "Global.CVC.Confort",
        "type": "digital",
        "join": 407,
        "direction": "entree",
        "eiscJoin": 407,
        "description": "Commande globale CVC : confort"
      },
      {
        "contractName": "Global.CVC.Nuit",
        "type": "digital",
        "join": 408,
        "direction": "entree",
        "eiscJoin": 408,
        "description": "Commande globale CVC : nuit"
      },
      {
        "contractName": "Global.CVC.HorsGel",
        "type": "digital",
        "join": 409,
        "direction": "entree",
        "eiscJoin": 409,
        "description": "Commande globale CVC : hors gel"
      },
      {
        "contractName": "Global.Vacances.Activer",
        "type": "digital",
        "join": 410,
        "direction": "bidirectionnel",
        "eiscJoin": 410,
        "description": "Mode vacances ON + feedback"
      },
      {
        "contractName": "Global.Vacances.Desactiver",
        "type": "digital",
        "join": 411,
        "direction": "bidirectionnel",
        "eiscJoin": 411,
        "description": "Mode vacances OFF + feedback"
      },
      {
        "contractName": "Presets.Sauvegarde",
        "type": "serial",
        "join": 420,
        "direction": "entree",
        "eiscJoin": 420,
        "description": "Payload JSON de sauvegarde des presets globaux"
      },
      {
        "contractName": "Systeme.PieceActiveDalle",
        "type": "analog",
        "join": 240,
        "direction": "sortie",
        "eiscJoin": 240,
        "description": "Piece actuellement affichee par la dalle principale (IP-ID 03), diffusee a tous les peripheriques (suivi par le debugger virtuel)."
      }
    ],
    "blocsPieces": {
      "description": "Bloc de joins EISC par pièce, pour le programme SIMPL du slot 2. Base du bloc = 1000 + (pieceId - 1) * 100. Offsets ci-dessous à ajouter à la base. Actif uniquement si la pièce a 'intersystem': true.",
      "baseFormule": "1000 + (pieceId - 1) * 100",
      "tailleBloc": 100,
      "offsets": [
        {
          "contractName": "Piece.<id>.Stores.Groupe",
          "type": "digital",
          "offsetDebut": 1,
          "nombre": 9,
          "direction": "sortie",
          "description": "Echo par piece des commandes groupees de la dalle : Volets Up/Stop/Down (+1/+2/+3), Rideaux (+4/+5/+6), Stores (+7/+8/+9)"
        },
        {
          "contractName": "Piece.<id>.Eclairage.Scene",
          "type": "digital",
          "offsetDebut": 21,
          "nombre": 4,
          "direction": "bidirectionnel",
          "description": "Scènes éclairage 1..4 : commande depuis le slot 2 + feedback"
        },
        {
          "contractName": "Piece.<id>.CVC.ConsignePlus",
          "type": "digital",
          "offset": 35,
          "direction": "entree",
          "description": "Consigne +0.5°C"
        },
        {
          "contractName": "Piece.<id>.CVC.ConsigneMoins",
          "type": "digital",
          "offset": 36,
          "direction": "entree",
          "description": "Consigne -0.5°C"
        },
        {
          "contractName": "Piece.<id>.Stores.Scene",
          "type": "digital",
          "offsetDebut": 41,
          "nombre": 4,
          "direction": "bidirectionnel",
          "description": "Scenes de stores 1..4 (equiv. joins GUI 201-204)"
        },
        {
          "contractName": "Piece.<id>.AV.Mute",
          "type": "digital",
          "offset": 50,
          "direction": "bidirectionnel",
          "description": "Mute audio (toggle + feedback, equiv. join GUI 55)"
        },
        {
          "contractName": "Piece.<id>.AV.Source.Select",
          "type": "digital",
          "offsetDebut": 51,
          "nombre": 6,
          "direction": "bidirectionnel",
          "description": "Sélection source 0..5 (51 = OFF, équiv. joins GUI 150-155)"
        },
        {
          "contractName": "Piece.<id>.Moteur.Commande",
          "type": "digital",
          "offsetDebut": 61,
          "nombre": 18,
          "direction": "sortie",
          "description": "Moteurs 1..6, triplets Monter/Stop/Descendre (écho des appuis GUI, équiv. joins 81-98)"
        },
        {
          "contractName": "Piece.<id>.Alarme.Partition",
          "type": "digital",
          "offsetDebut": 81,
          "nombre": 12,
          "direction": "bidirectionnel",
          "description": "Partitions 1..4, triplets Armer/Partiel/Désarmer (équiv. joins GUI 301-312)"
        },
        {
          "contractName": "Piece.<id>.Eclairage.NiveauMaster",
          "type": "analog",
          "offset": 21,
          "direction": "bidirectionnel",
          "description": "Niveau master éclairage (0..65535)"
        },
        {
          "contractName": "Piece.<id>.CVC.Consigne",
          "type": "analog",
          "offset": 31,
          "direction": "bidirectionnel",
          "description": "Consigne de température x10"
        },
        {
          "contractName": "Piece.<id>.AV.SourceActive",
          "type": "analog",
          "offset": 51,
          "direction": "bidirectionnel",
          "description": "Source active (0=off, 1..5)"
        },
        {
          "contractName": "Piece.<id>.AV.Volume",
          "type": "analog",
          "offset": 52,
          "direction": "bidirectionnel",
          "description": "Volume multimédia (0..65535)"
        },
        {
          "contractName": "Piece.<id>.Eclairage.Circuit",
          "type": "analog",
          "offsetDebut": 71,
          "nombre": 10,
          "direction": "bidirectionnel",
          "description": "Niveau des circuits 1..10"
        },
        {
          "contractName": "Piece.<id>.CVC.TempActuelle",
          "type": "serial",
          "offset": 32,
          "direction": "sortie",
          "description": "Température actuelle formatée"
        },
        {
          "contractName": "Piece.<id>.CVC.Mode",
          "type": "serial",
          "offset": 33,
          "direction": "sortie",
          "description": "Mode CVC (CHAUFFAGE / CLIMATISATION)"
        },
        {
          "contractName": "Piece.<id>.CVC.ConsigneTexte",
          "type": "serial",
          "offset": 34,
          "direction": "sortie",
          "description": "Consigne formatée"
        },
        {
          "contractName": "Piece.<id>.Nom",
          "type": "serial",
          "offset": 10,
          "direction": "sortie",
          "description": "Nom de la pièce (langue de référence)"
        }
      ]
    }
  }
}
;