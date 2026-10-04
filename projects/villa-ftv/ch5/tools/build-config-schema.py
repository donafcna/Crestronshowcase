# -*- coding: utf-8 -*-
"""Genere villa_config.schema.json (JSON Schema draft-07) a partir de ce fichier.

Source unique du schema : modifier ICI puis relancer
    python tools/build-config-schema.py
Annotation maison "x-etat" (ignoree par VS Code, lue par tools/check-config.mjs) :
    actif       lu par le GUI (CH5)
    processeur  lu seulement par le generateur SIMPL / le C# (aucun effet sur le GUI)
    inutilise   lu par personne aujourd'hui (documentation ou vestige)
    prevu       cle de la feuille de route v2 : SANS EFFET tant qu'elle n'est pas implementee
"""
import json, os

ETAT_TXT = {
    'actif': '',
    'processeur': '[PROCESSEUR] ',
    'inutilise': '[INUTILISÉ] ',
    'prevu': '[PRÉVU v2 — sans effet aujourd\'hui] ',
}


def d(desc, etat='actif', **kw):
    """Noeud de schema avec description prefixee par son etat."""
    n = {'description': ETAT_TXT[etat] + desc, 'x-etat': etat}
    n.update(kw)
    return n


def obj(desc, props, etat='actif', required=None, **kw):
    n = d(desc, etat, type='object', properties=props, **kw)
    if required:
        n['required'] = required
    return n


def arr(desc, items, etat='actif', **kw):
    return d(desc, etat, type='array', items=items, **kw)


TXT = {'type': 'string'}
BOOL = {'type': 'boolean'}
LANGUES_GUI = ['fr', 'en', 'es', 'de', 'ru']
THEMES_GUI = ['dark', 'light', 'glass']
CONTROLES_GLOBAUX = ['alarme', 'cameras', 'controleGlobal', 'recherche', 'reglages']
COMMANDES_CIRCUIT = ['onoff', 'variation', 'rgbw', 'tunableWhite']

DEFS = {
    'langue': d('Code langue ISO 639-1. Langues du GUI aujourd\'hui : ' + ', '.join(LANGUES_GUI) + '.',
                type='string', pattern='^[a-z]{2}$'),
    'theme': d('Thème du GUI : dark = Sombre, light = Clair, glass = Verre dépoli.', type='string', enum=THEMES_GUI),
    'controleGlobal': d('Bouton de l\'entête : ' + ', '.join(CONTROLES_GLOBAUX) + '.', 'prevu',
                        type='string', enum=CONTROLES_GLOBAUX),
    'plage': d('Plage réglable.', type='object', required=['min', 'max', 'pas'], properties={
        'min': {'type': 'number'}, 'max': {'type': 'number'},
        'pas': {'type': 'number', 'exclusiveMinimum': 0},
        'consigne': d('Consigne au démarrage.', type='number'),
    }),
    'idPiece': {'type': 'integer', 'minimum': 1, 'maximum': 30},
    'actif': d('false = module retiré de la pièce (onglet/bouton masqué).', type='boolean', default=True),
}
REF = lambda n: {'$ref': '#/definitions/' + n}

# ---------------------------------------------------------------- meta
META = obj('Identité du projet et réglages techniques.', {
    'projet': d('Nom affiché du projet (titre, XPanel, programme SIMPL).', type='string', minLength=1),
    'integrateur': d('Société intégratrice (information).', 'inutilise', type='string'),
    'description': d('Description libre (information).', 'inutilise', type='string'),
    'coreOrigine': d('Version du Core dont ce projet est issu (information).', 'inutilise', type='string'),
    'version': d('Version de la configuration, alignée par deploy.ps1.', type='string',
                 pattern='^\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?$'),
    'mode': d('deploiement = chez le client (retours du processeur) ; showcase = site vitrine (retours simulés). '
              'Jamais « showcase » dans un dépôt projet.', type='string', enum=['deploiement', 'showcase']),
    'backend': d('simpl = un seul programme SIMPL (v6.0, pont direct) ; csharp ou absent = C# slot 1 + SIMPL slot 2 (v5).',
                 type='string', enum=['simpl', 'csharp']),
    'interface': d('Variante de disposition. connect = interface épurée « Connect » (v5.4). Absent = GUI standard.',
                   type='string', enum=['connect']),
    'fonctionsRetirees': arr('Fonctions retirées du projet (information pour le générateur et la doc).',
                             {'type': 'string', 'enum': ['audioVideo', 'alarme', 'cameras']}, 'inutilise'),
    'tracesConsole': d('false = debugger propre (aucune trace console ni s100).', type='boolean'),
    'tracesLatence': d('Traces [LAT] de mesure de latence (iPhone).', type='boolean'),
    'dateModification': d('Date de dernière modification (information).', 'inutilise', type='string'),
    'langueReference': d('Langue dans laquelle sont écrits les noms du fichier (pièces, scènes, circuits). '
                         'Les tables « traductions » partent de cette langue.', type='string', pattern='^[a-z]{2}$'),
    'languesDisponibles': arr('Remplacé par interface.langues.disponibles (v2). Lu en repli quand ce bloc est absent.',
                              REF('langue'), 'inutilise', uniqueItems=True),
    'aide': arr('Aide au remplissage (information).', TXT, 'inutilise'),
}, required=['projet', 'version', 'mode'])

# ---------------------------------------------------------------- interface
INTERFACE = obj('Ce que l\'utilisateur voit : navigation, recherche, thèmes, langues, contrôles globaux.', {
    'menuPieces': obj('Menu de gauche (v6.1, js/nav-pieces.js). ?menu=0|1 et ?room=N dans l\'adresse priment.', {
        'visible': d('false = pas de menu de gauche ; titre = pièce, appui = choix de pièce.', type='boolean'),
        'pieces': arr('Pièces proposées, dans l\'ordre ([] = toutes les pièces actives).', REF('idPiece'), uniqueItems=True),
        'pieceParDefaut': d('Pièce au démarrage (null = première proposée).', type=['integer', 'null'], minimum=1, maximum=30),
        'etats': obj('Pastilles d\'état dans le menu de gauche (iPad général) : source A/V allumée, lumière allumée. '
                     'Le pont v6 garde déjà en cache les retours des autres pièces.', {
                         'audioVideo': d('Pastille « source allumée ».', 'prevu', type='boolean'),
                         'eclairage': d('Pastille « lumière allumée ».', 'prevu', type='boolean'),
                     }, 'prevu'),
    }),
    'recherche': obj('Bouton « Recherche » / actions rapides (v6.2).', {
        'actif': BOOL, 'suggestions': d('Suggestions selon l\'usage.', type='boolean'),
    }),
    'themes': obj('Thèmes proposés dans Réglages. Absent = les trois thèmes, Sombre par défaut.', {
        'disponibles': arr('Thèmes proposés (au moins un).', REF('theme'), 'prevu', minItems=1, uniqueItems=True),
        'parDefaut': d('Thème au premier démarrage d\'un appareil (le choix de l\'utilisateur est ensuite mémorisé).',
                       'prevu', allOf=[REF('theme')]),
    }, 'prevu'),
    'langues': obj('Langues proposées dans Réglages. Absent = meta.languesDisponibles, sinon toutes.', {
        'disponibles': arr('Langues proposées (au moins une).', REF('langue'), 'prevu', minItems=1, uniqueItems=True),
        'parDefaut': d('Langue au premier démarrage d\'un appareil.', 'prevu', allOf=[REF('langue')]),
    }, 'prevu'),
    'controlesGlobaux': obj('Boutons de l\'entête (alarme, caméras, contrôle global, recherche, réglages). '
                            'Surcharge possible par pièce : pieces[].interface.controlesGlobaux.', {
        'parDefaut': arr('Boutons affichés sur toutes les pages, dans l\'ordre.', REF('controleGlobal'), 'prevu', uniqueItems=True),
        'general': arr('Boutons de la page « Général » de l\'iPad général (vue d\'ensemble).', REF('controleGlobal'),
                       'prevu', uniqueItems=True),
    }, 'prevu'),
    'description': TXT, 'rechercheDescription': TXT,
})

# ---------------------------------------------------------------- pieces
CIRCUIT_ITEM = obj('Un circuit d\'éclairage.', {
    'nom': d('Nom affiché.', 'prevu', type='string'),
    'commande': d('Commande proposée dans le GUI : onoff = interrupteur ; variation = fader ; rgbw = fader + couleur ; '
                  'tunableWhite = fader + température de couleur. Absent : déduit de « technologie » (contact → onoff, sinon variation).',
                  'prevu', type='string', enum=COMMANDES_CIRCUIT),
    'technologie': d('Pilotage électrique (DALI, PHASE, contact, KNX, 0-10V…). N\'influence pas le GUI.', 'prevu', type='string'),
    'lutron': d('Nom du circuit dans Lutron Designer.', 'prevu', type='string'),
    'kelvinMin': d('Tunable white : température la plus chaude.', 'prevu', type='integer', minimum=1000, maximum=10000),
    'kelvinMax': d('Tunable white : température la plus froide.', 'prevu', type='integer', minimum=1000, maximum=10000),
}, 'prevu', required=['nom'])

NIVEAU = {'anyOf': [
    {'type': 'integer', 'minimum': 0, 'maximum': 65535},
    d('Circuit couleur (prévu) : niveau + kelvin, ou r/g/b/w en 0-65535.', 'prevu', type='object', properties={
        'niveau': {'type': 'integer', 'minimum': 0, 'maximum': 65535},
        'kelvin': {'type': 'integer', 'minimum': 1000, 'maximum': 10000},
        'r': {'type': 'integer', 'minimum': 0, 'maximum': 65535}, 'g': {'type': 'integer', 'minimum': 0, 'maximum': 65535},
        'b': {'type': 'integer', 'minimum': 0, 'maximum': 65535}, 'w': {'type': 'integer', 'minimum': 0, 'maximum': 65535},
    }),
]}

ECLAIRAGES = obj('Scènes et circuits d\'éclairage.', {
    'actif': REF('actif'),
    'scenes': obj('Scènes de la pièce (4 max, joins 51-54).', {
        'nombre': {'type': 'integer', 'minimum': 0, 'maximum': 4},
        'noms': arr('Noms affichés ("" = nom par défaut).', TXT, maxItems=4),
        'niveaux': arr('Une ligne par scène, une valeur 0-65535 par circuit (le slot 2 fait foi dès qu\'un niveau remonte).',
                       {'type': 'array', 'items': NIVEAU}, maxItems=4),
        'origine': d('Provenance des niveaux (information).', 'inutilise', type='string'),
        'niveauxDescription': TXT,
    }),
    'circuits': obj('Circuits de la pièce (20 max, analogiques 71-90).', {
        'nombre': {'type': 'integer', 'minimum': 0, 'maximum': 20},
        'noms': arr('Noms affichés ("" = nom par défaut). Remplacé par « liste » quand elle est présente.', TXT, maxItems=20),
        'type': arr('Technologie électrique par circuit (Appartement : DALI / PHASE / contact). '
                    'Ne choisit PAS la commande du GUI : voir liste[].commande.', TXT, 'inutilise', maxItems=20),
        'lutron': arr('Nom Lutron par circuit (information).', TXT, 'inutilise', maxItems=20),
        'liste': arr('Description complète de chaque circuit (v2). Prioritaire sur noms / type / lutron.', CIRCUIT_ITEM,
                     'prevu', maxItems=20),
    }),
})

MOTEUR_ITEM = obj('Un moteur.', {
    'nom': {'type': 'string'},
    'type': d('Icône et libellés : volet, rideau (Ouvrir/Fermer), store.', type='string', enum=['volet', 'rideau', 'store']),
    'lamelles': d('Rangée Horaire / Stop / Antihoraire sous le moteur.', type='boolean'),
    'position': d('Réglage de la position en % en plus de Monter / Stop / Descendre.', 'prevu', type='boolean'),
    'angleLamelles': d('Réglage de l\'angle des lamelles en %, indépendant de la position.', 'prevu', type='boolean'),
}, required=['nom', 'type'])

MOTEURS = obj('Volets, rideaux et stores (12 max, v5.3).', {
    'actif': REF('actif'),
    'nombre': {'type': 'integer', 'minimum': 0, 'maximum': 12},
    'liste': arr('Un objet par moteur. Moins d\'entrées que « nombre » : complété par valeursParDefaut.moteurs.',
                 MOTEUR_ITEM, maxItems=12),
})

CVC = obj('Chauffage / climatisation de la pièce.', {
    'actif': REF('actif'),
    'marcheArret': d('Boutons Marche / Arrêt.', 'inutilise', type='boolean'),
    'ventilation': obj('Vitesses de ventilation.', {
        'actif': BOOL,
        'vitesses': arr('Vitesses proposées (0 auto, 1 faible, 2 moyen, 3 fort). Le GUI affiche aujourd\'hui les 4.',
                        {'type': 'integer', 'minimum': 0, 'maximum': 3}, 'inutilise', uniqueItems=True),
    }),
    'etatInitial': obj('État au démarrage du processeur.', {
        'marche': BOOL, 'ventilation': {'type': 'integer', 'minimum': 0, 'maximum': 3},
    }, 'processeur'),
    'consigne': REF('plage'),
    'modes': arr('Modes proposés. Aujourd\'hui le mode n\'est qu\'affiché (texte envoyé par le processeur).',
                 {'type': 'string', 'enum': ['auto', 'chauffage', 'climatisation', 'ventilation', 'deshumidification', 'eco', 'arret']},
                 'prevu', uniqueItems=True),
    'deriveC': d('« Drift » : écart toléré autour de la consigne en °C avant relance (hypothèse à confirmer avec Alexandre).',
                 'prevu', type='number', minimum=0, maximum=5),
})

WELL = lambda n: obj(n + ' (consigne en °C).', {
    'actif': BOOL, 'min': {'type': 'number'}, 'max': {'type': 'number'},
    'pas': {'type': 'number', 'exclusiveMinimum': 0}, 'consigne': {'type': 'number'},
})

PIECE = obj('Une pièce.', {
    'id': d('Identifiant unique (1-30 ; 15 max en backend simpl).', allOf=[REF('idPiece')]),
    'nom': d('Nom affiché ("" = nom par défaut). ~16 caractères max sur la dalle.', type='string', maxLength=40),
    'icone': d('Emoji aujourd\'hui (affiché dans le menu). v2 : clé du catalogue SVG (salon, cuisine, chambre…), '
               'conformément à la règle « pas d\'emoji dans les GUI ».', type='string'),
    'actif': d('false = pièce absente du GUI et du programme.', type='boolean', default=True),
    'intersystem': d('Bloc EISC vers le slot 2 (backend csharp seulement).', 'processeur', type='boolean'),
    'niveau': d('Étage (Appartement, plan 3D).', 'inutilise', type='integer'),
    'plan3d': d('Position dans le plan 3D du site vitrine.', 'inutilise', type='object'),
    'interface': obj('Surcharges d\'affichage propres à la pièce.', {
        'controlesGlobaux': arr('Boutons de l\'entête sur cette pièce (remplace interface.controlesGlobaux.parDefaut).',
                                REF('controleGlobal'), 'prevu', uniqueItems=True),
    }, 'prevu'),
    'pilotages': obj('Modules de la pièce. Module absent ou actif=false = retiré.', {
        'eclairages': ECLAIRAGES,
        'moteurs': MOTEURS,
        'cvc': CVC,
        'controlesGeneraux': obj('Accès aux commandes globales depuis la pièce.', {
            'actif': REF('actif'),
            'partitionsAlarme': d('Nombre de partitions affichées.', 'inutilise', type='integer', minimum=0, maximum=4),
        }),
        'audioVideo': obj('Sources audio / vidéo.', {
            'actif': REF('actif'),
            'sources': arr('Identifiants de sourcesAudioVideo proposés dans la pièce.',
                           {'type': 'integer', 'minimum': 1, 'maximum': 5}, uniqueItems=True),
        }),
        'wellness': obj('Sauna / hammam.', {'sauna': WELL('Sauna'), 'hammam': WELL('Hammam')}),
    }),
}, required=['id', 'nom', 'pilotages'])

# ---------------------------------------------------------------- reste
VALEURS = obj('Valeurs de repli quand un nom ou une liste manque dans une pièce.', {
    'iconesDisponibles': d('Aide-mémoire emoji → libellé.', 'inutilise', type='object', additionalProperties=TXT),
    'scenesEclairage': arr('Noms de scènes par défaut.', TXT, maxItems=4),
    'circuits': arr('Noms de circuits par défaut.', TXT, maxItems=20),
    'moteurs': arr('Moteurs par défaut (aussi lu par le générateur SIMPL).', MOTEUR_ITEM, maxItems=12),
    'scenesStores': arr('Noms des commandes groupées par défaut.', TXT, 'inutilise', maxItems=4),
    'cvc': obj('Bornes de consigne par défaut.', {
        'consigneMinC': {'type': 'number'}, 'consigneMaxC': {'type': 'number'}, 'pasC': {'type': 'number'},
    }, 'inutilise'),
    'stores': obj('Conventions des stores (à fixer avant d\'implémenter position et angle).', {
        'position': d('Sens du pourcentage de position (convention Crestron : 100 = ouvert).', 'prevu',
                      type='string', enum=['100=ouvert', '0=ouvert']),
        'angleLamelles': d('Sens du pourcentage d\'angle.', 'prevu', type='string', enum=['0=fermees', '0=ouvertes']),
    }, 'prevu'),
})

WIDGETS = obj('Widgets du GUI. Surcharge par appareil dans parPeripherique.', {
    'meteoActualites': obj('Météo de la colonne de gauche.', {
        'actif': BOOL, 'ville': {'type': 'string'}, 'latitude': {'type': 'number'}, 'longitude': {'type': 'number'},
        'description': TXT,
    }),
    'bandeauActualites': obj('Bandeau « État de la villa ».', {'actif': BOOL, 'description': TXT}),
    'parPeripherique': d('Surcharges par appareil, clé = IP-ID hexadécimal sur 2 caractères (03, 1A…).', type='object',
                         properties={'description': TXT},
                         patternProperties={'^[0-9A-Fa-f]{2}$': {'type': 'object', 'properties': {
                             'nom': TXT,
                             'meteoActualites': BOOL, 'bandeauActualites': BOOL,
                         }}}),
    'description': TXT,
})

MONITORING = obj('Supervision du projet résidentiel (XPanel de monitoring, vue d\'ensemble de l\'iPad général, alertes). '
                 'Les e-mails et tout identifiant d\'envoi sont lus par le PROCESSEUR et doivent être retirés de la copie '
                 'embarquée dans le GUI (villa_config.json est lisible depuis tout XPanel).', {
    'actif': d('Active la supervision.', 'prevu', type='boolean'),
    'vueEnsemble': obj('Page d\'accueil type Crestron Home : état de toutes les zones, sans commandes.', {
        'actif': d('Affiche la vue d\'ensemble.', 'prevu', type='boolean'),
        'pageAccueil': d('Démarrer sur la vue d\'ensemble plutôt que sur une pièce.', 'prevu', type='boolean'),
    }, 'prevu'),
    'elements': arr('Ce qui est supervisé.', d('Élément supervisé.', 'prevu', type='string',
                    enum=['eclairage', 'audioVideo', 'cvc', 'moteurs', 'alarme', 'processeur', 'ecrans', 'wellness']),
                    'prevu', uniqueItems=True),
    'alertes': obj('Alertes par e-mail.', {
        'emails': arr('Destinataires.', d('Adresse e-mail.', 'prevu', type='string', format='email',
                      pattern='^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'), 'prevu', uniqueItems=True),
        'evenements': arr('Événements déclencheurs (liste à définir à la conception).', TXT, 'prevu', uniqueItems=True),
    }, 'prevu'),
}, 'prevu')

SCHEMA = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'https://crestrongui.vercel.app/schemas/villa_config.schema.json',
    'title': 'villa_config.json — configuration d\'un projet Fréquence TV (Core Villa FTV)',
    'description': 'Généré par tools/build-config-schema.py. Les clés [PRÉVU v2] décrivent la feuille de route : '
                   'elles sont acceptées mais sans effet tant qu\'elles ne sont pas implémentées. '
                   'Guide : docs/02_CONFIG_JSON.md ; inventaire et cible : docs/10_CONFIG_JSON_V2.md.',
    'type': 'object',
    'required': ['meta', 'pieces'],
    'definitions': DEFS,
    'properties': {
        '$schema': {'type': 'string'},
        'meta': META,
        'interface': INTERFACE,
        'valeursParDefaut': VALEURS,
        'sourcesAudioVideo': arr('Sources audio / vidéo du projet (5 max, joins 151-155).', obj('Une source.', {
            'id': {'type': 'integer', 'minimum': 1, 'maximum': 5},
            'nom': {'type': 'string'},
            'type': d('Famille de source (appletv, skyq, swisscom, iptv, musique) — à lire par le GUI et le générateur.',
                      'prevu', type='string'),
        }, required=['id', 'nom']), maxItems=5),
        'scenesStores': obj('Commandes groupées des stores. Lu par l\'interface Connect ; le GUI standard a ses libellés en dur.', {
            'nombre': {'type': 'integer', 'minimum': 0, 'maximum': 4},
            'noms': arr('Noms.', TXT, maxItems=4),
        }),
        'widgets': WIDGETS,
        'pieces': arr('Pièces du projet.', PIECE, minItems=1, maxItems=30),
        'pagesSpeciales': d('Pages Jeux / Animation / Vidéo du menu.', type='object', properties={
            'description': TXT,
            'jeux': {'type': 'object', 'properties': {'actif': BOOL, 'nom': TXT, 'icone': TXT}},
            'animation': {'type': 'object', 'properties': {'actif': BOOL, 'nom': TXT, 'icone': TXT}},
            'video': {'type': 'object', 'properties': {'actif': BOOL, 'nom': TXT, 'icone': TXT, 'youtubeRecherche': TXT}},
        }),
        'traductions': d('Une table par langue (en, es, de, ru…) : nom écrit dans langueReference → traduction. '
                         'Jamais deux clés qui ne diffèrent que par la casse (PowerShell 5.1 refuse le fichier).',
                         type='object', additionalProperties={'type': 'object', 'additionalProperties': TXT}),
        'monitoring': MONITORING,
        'contrat': d('Contrat de joins entre GUI et processeur. Réservé au programmeur : ne pas modifier à la légère '
                     '(voir docs/03_CONTRAT_JOINS.md).', 'processeur', type='object'),
    },
}

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'villa_config.schema.json')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(SCHEMA, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('écrit :', os.path.normpath(out))
