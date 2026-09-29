#!/usr/bin/env python3
"""
Génère villa_config.json de l'Appartement Crans-Montana (duplex niv. 9/10) à partir :
  - du Core Villa Crans (sections meta / contrat / valeursParDefaut / scenesStores / widgets /
    pagesSpeciales reprises telles quelles : même GUI CH5, même C#, même générateur SIMPL) ;
  - de la séquence d'opérations Lutron du client (tools/lutron-seq-of-op.json, niveaux par circuit
    et par scène) ;
  - de la table des zones ci-dessous (ROOMS), tracée depuis les plans architecte (niveau d'entrée et
    niveau supérieur) et le plan multimédia.

Usage :  python3 tools/build_config.py            (écrit ../villa_config.json)
Sortie : projects/appartement-crans/villa_config.json  (source canonique du projet)
"""
import copy
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJ = HERE.parent
CORE = PROJ.parent / "villa-crans" / "ch5" / "villa_config.json"
SEQ = json.loads((HERE / "lutron-seq-of-op.json").read_text(encoding="utf-8"))
SEQ_BY_NAME = {r["circuit"].replace("  ", " ").strip(): r for r in SEQ}

SCENES = ["OFF", "JOUR", "SOIR", "NUIT"]
# Colonne de la séquence Lutron utilisée pour chaque scène du GUI (4 scènes max, joins 51-54)
SCENE_COL = {"OFF": "off", "JOUR": "celsDay", "SOIR": "celsNight", "NUIT": "low"}


def lvl(v):
    """Pourcentage (0..1) -> 0..65535 ; 'UA' (non affecté) -> 0."""
    if v == "UA" or v is None:
        return 0
    return int(round(max(0.0, min(1.0, float(v))) * 65535))


def C(lutron, nom, fixe=None):
    """Circuit du GUI : nom FR affiché + ligne de la séquence Lutron (ou niveaux fixes ON/OFF)."""
    return {"lutron": lutron, "nom": nom, "fixe": fixe}


ONOFF = {"OFF": 0, "JOUR": 65535, "SOIR": 65535, "NUIT": 0}     # cheminée, sèche-serviettes
NIGHT = {"OFF": 0, "JOUR": 0, "SOIR": 0, "NUIT": 65535}          # veilleuse forcée en NUIT

M = lambda nom, typ: {"nom": nom, "type": typ}

# id, nom, icône, niveau (0 = entrée / niv. 9, 1 = niv. 10), circuits, moteurs, cvc, av, plan3d
ROOMS = [
    dict(id=1, nom="Salon", icone="🛋️", niveau=0, av=True, cvc=True,
         circuits=[C("Living - Spots coté vallée", "Spots côté vallée"), C("Living - Spots corner", "Spots coin lecture"),
                   C("Living - Cove", "Corniche LED"), C("Living - Floor Lamps", "Lampadaires"),
                   C(None, "Cheminée", ONOFF)],
         moteurs=[M("Rideau baie sud", "rideau"), M("Rideau baie est", "rideau"), M("Voilage sud", "store"), M("Voilage est", "store")],
         plan3d=dict(type="salon", x=12.3, z=11.8, w=8.2, d=6.2, windowWall="north")),
    dict(id=2, nom="Salle à manger", icone="🍽️", niveau=0, av=True, cvc=True,
         circuits=[C("Dining - Spots", "Spots"), C("Dining - Suspensions", "Suspensions"), C("Dining - Cove", "Corniche LED")],
         moteurs=[M("Rideau terrasse", "rideau"), M("Voilage", "store")],
         plan3d=dict(type="repas", x=6.3, z=11.8, w=5.7, d=6.2, windowWall="north")),
    dict(id=3, nom="Cuisine", icone="🍳", niveau=0, av=True, cvc=True,
         circuits=[C("Kitchen - Spots ceiling", "Spots plafond"), C("Kitchen - Spots passage", "Spots passage"),
                   C("Kitchen - Illot lustre", "Lustre îlot"), C("Kitchen - Illot spots", "Spots îlot"),
                   C("Kitchen - Cove", "Corniche LED"), C("Kitchen - Comptoir", "Plan de travail")],
         moteurs=[M("Store fenêtre", "store")],
         plan3d=dict(type="cuisine", x=0, z=11.8, w=6, d=6.2, windowWall="north")),
    dict(id=4, nom="Entrée", icone="🚪", niveau=0, av=False, cvc=False,
         circuits=[C("Entrance - Spots", "Spots"), C("Entrance - Painting", "Éclairage tableau"), C("Entrance - Wall Lights", "Appliques")],
         moteurs=[], plan3d=dict(type="entree", x=0, z=6.4, w=6, d=5.1, windowWall="none")),
    dict(id=5, nom="WC invités", icone="🚻", niveau=0, av=False, cvc=False,
         circuits=[C("Entrance - WC Spots", "Spots")],
         moteurs=[], plan3d=dict(type="wc", x=9.6, z=6.4, w=1.5, d=2.4, windowWall="none")),
    dict(id=6, nom="Buanderie", icone="🧺", niveau=0, av=False, cvc=False,
         circuits=[C("Laundry - Spots", "Spots"), C("Laundry - Cove", "Corniche LED")],
         moteurs=[], plan3d=dict(type="buanderie", x=0, z=0, w=3.4, d=6, windowWall="none")),
    dict(id=7, nom="Suite parentale", icone="🛏️", niveau=0, av=True, cvc=True,
         circuits=[C("Masterbed - Spots", "Spots"), C("Masterbed - Cove", "Corniche LED"), C("Masterbed - Bedhead", "Tête de lit"),
                   C("Masterbed - Bedhead left", "Chevet gauche"), C("Masterbed - Bedhead right", "Chevet droit"),
                   C("Masterbed - Niches Besides", "Niches"), C("Masterbed - Nightlights", "Veilleuses", NIGHT),
                   C("Masterbed - His Dressing", "Dressing Monsieur"), C("Masterbed - Her Dressing", "Dressing Madame"),
                   C("Masterbed - Terrasse by Living", "Terrasse")],
         moteurs=[M("Rideau terrasse", "rideau"), M("Voilage", "store"), M("Rideau dressing", "rideau")],
         plan3d=dict(type="suite", x=11.3, z=6.4, w=8, d=5.1, windowWall="north")),
    dict(id=8, nom="Bain parental", icone="🛁", niveau=0, av=False, cvc=True,
         circuits=[C("Masterbath - Spots", "Spots"), C("Masterbath - Cove", "Corniche LED"), C("Masterbath - Shower", "Douche vapeur"),
                   C("Masterbath - Wall Lights", "Appliques miroir"), C("Masterbath - WC Spots", "Spots WC"),
                   C("Masterbath - WC niche", "Niche WC"), C("Masterbath - Terrasse by Office", "Terrasse"),
                   C(None, "Sèche-serviettes", ONOFF)],
         moteurs=[], plan3d=dict(type="sdb", x=3.7, z=0, w=4.6, d=6, windowWall="north")),
    dict(id=9, nom="Bureau", icone="💼", niveau=0, av=False, cvc=True,
         circuits=[C("Living - Spots corner", "Spots"), C("Living - Cove", "Corniche LED")],
         moteurs=[M("Rideau", "rideau")],
         plan3d=dict(type="bureau", x=19.6, z=6.4, w=3.4, d=5.1, windowWall="north")),
    dict(id=10, nom="Salle TV", icone="📺", niveau=0, av=True, cvc=True,
         circuits=[C("TV Room - Spots entrée", "Spots entrée"), C("TV Room - Spots", "Spots"), C("TV Room - Painting", "Éclairage tableau"),
                   C("TV Room - Cove", "Corniche LED"), C("TV Room - Bedhead left", "Chevet gauche"),
                   C("TV Room - Bedhead right", "Chevet droit"), C("TV Room - Nightlights", "Veilleuses", NIGHT),
                   C("TV Room - Terrace", "Terrasse")],
         moteurs=[M("Rideau", "rideau"), M("Voilage", "store")],
         plan3d=dict(type="chambre", x=8.6, z=0, w=7.4, d=6, windowWall="north")),
    dict(id=11, nom="Bain salle TV", icone="🛁", niveau=0, av=False, cvc=True,
         circuits=[C("TV Room Bath - Mirror wall lights", "Appliques miroir"), C("TV Room Bath - Sink spots", "Spots vasque"),
                   C("TV Room Bath - Spots", "Spots"), C("TV Room Bath - Cove", "Corniche LED"),
                   C("TV Room Bath - Shower Spots", "Spots douche"), C("TV Room Bath - Shower Cove", "Corniche douche"),
                   C("TV Room Bath - Shower niche", "Niche douche"), C("TV Room Bath - WC spot", "Spot WC"),
                   C("TV Room Bath - WC Wall Lights", "Appliques WC"), C("TV Room Bath - WC niche", "Niche WC"),
                   C(None, "Sèche-serviettes", ONOFF)],
         moteurs=[], plan3d=dict(type="sdb", x=6.3, z=6.4, w=3, d=5.1, windowWall="none")),
    dict(id=12, nom="Hall étage", icone="🪜", niveau=1, av=False, cvc=False,
         circuits=[C("Entrance - Spots", "Spots escalier"), C("Entrance - Wall Lights", "Appliques hall"), C("Entrance - Painting", "Corniche LED")],
         moteurs=[], plan3d=dict(type="escalier", x=0, z=6.4, w=6, d=5.1, windowWall="none")),
    dict(id=13, nom="Chambre Twin", icone="🛏️", niveau=1, av=True, cvc=True,
         circuits=[C("Twin Room - Spots", "Spots"), C("Twin Room - Cove", "Corniche LED"), C("Twin Room - Bedhead", "Tête de lit"),
                   C("Twin Room - Bedhead left", "Chevet gauche"), C("Twin Room - Bedhead right", "Chevet droit"),
                   C("Twin Room - Dressing", "Dressing"), C("Twin Room - Nightlights", "Veilleuses", NIGHT), C("Twin Room - Terrace", "Terrasse")],
         moteurs=[M("Rideau", "rideau"), M("Voilage", "store")],
         plan3d=dict(type="chambre", x=0, z=0, w=7, d=6, windowWall="north")),
    dict(id=14, nom="Bain Twin", icone="🛁", niveau=1, av=False, cvc=True,
         circuits=[C("Twin Room Bath - Wall lights", "Appliques"), C("Twin Room Bath - Spots", "Spots"), C("Twin Room Bath - Cove", "Corniche LED"),
                   C("Twin Room Bath - Shower Spots", "Spots douche"), C("Twin Room Bath - Shower cove", "Corniche douche"),
                   C("Twin Room Bath - Shower niche", "Niche douche"), C("Twin Room Bath - WC spot", "Spot WC"),
                   C("Twin Room Bath - WC cove", "Corniche WC"), C("Twin Room Bath - WC niche", "Niche WC"),
                   C(None, "Sèche-serviettes", ONOFF)],
         moteurs=[], plan3d=dict(type="sdb", x=7.3, z=0, w=4.4, d=6, windowWall="north")),
    dict(id=15, nom="Chambre VIP", icone="🛏️", niveau=1, av=True, cvc=True,
         circuits=[C("VIP Room - Entrance", "Spots entrée"), C("VIP Room - Spot by Entrance", "Spots dressing"), C("VIP Room - Spot by Bed", "Spots lit"),
                   C("VIP Room - Bedhead", "Tête de lit"), C("VIP Room - Bedhead Left", "Chevet gauche"), C("VIP room - Bedhead Right", "Chevet droit"),
                   C("VIP Room - Nightlights", "Veilleuses", NIGHT), C("VIP Room - Terrace", "Terrasse")],
         moteurs=[M("Rideau", "rideau"), M("Voilage", "store")],
         plan3d=dict(type="suite", x=12, z=0, w=7, d=6, windowWall="north")),
    dict(id=16, nom="Bain VIP", icone="🛁", niveau=1, av=False, cvc=True,
         circuits=[C("VIP Room Bath - Mirror wall lights", "Appliques miroir"), C("VIP Room Bath - Sink spots", "Spots vasque"),
                   C("VIP Room Bath - spots", "Spots"), C("VIP Room Bath - Dressing spots", "Spots dressing"),
                   C("VIP Room Bath - WC+ Shower Coves", "Corniches"), C("VIP Room Bath - Shower niche", "Niche douche"),
                   C("VIP Room Bath - WC spot", "Spot WC"), C("VIP Room Bath - WC niche", "Niche WC"),
                   C("VIP Room Bath - Wall Lights", "Appliques"), C(None, "Sèche-serviettes", ONOFF)],
         moteurs=[], plan3d=dict(type="sdb", x=6.3, z=6.4, w=4, d=5.1, windowWall="none")),
    dict(id=17, nom="Balcons", icone="🌿", niveau=0, av=False, cvc=False,
         circuits=[C("Masterbed - Terrasse by Living", "Balcon sud"), C("TV Room - Terrace", "Balcon est"), C("Twin Room - Terrace", "Balcon nord")],
         moteurs=[M("Store banne", "store")],
         plan3d=dict(type="terrasse", x=20.8, z=11.8, w=4.2, d=6.2, windowWall="north")),
]

# Traductions des libellés FR (noms de pièces, scènes, circuits, moteurs) — dictionnaire texte FR -> texte.
TR = {
    "en": {"Salon": "Living room", "Salle à manger": "Dining room", "Cuisine": "Kitchen", "Entrée": "Entrance",
           "WC invités": "Guest WC", "Buanderie": "Laundry", "Suite parentale": "Master suite", "Bain parental": "Master bathroom",
           "Bureau": "Office", "Salle TV": "TV room", "Bain salle TV": "TV room bathroom", "Hall étage": "Upper hall",
           "Chambre Twin": "Twin room", "Bain Twin": "Twin bathroom", "Chambre VIP": "VIP room", "Bain VIP": "VIP bathroom",
           "Balcons": "Balconies",
           "OFF": "OFF", "JOUR": "DAY", "SOIR": "EVENING", "NUIT": "NIGHT",
           "Spots côté vallée": "Valley-side spots", "Spots coin lecture": "Reading corner spots", "Corniche LED": "LED cove", "Lampadaires": "Floor lamps",
           "Cheminée": "Fireplace", "Spots": "Spots", "Suspensions": "Pendants", "Spots plafond": "Ceiling spots", "Spots passage": "Passage spots",
           "Lustre îlot": "Island chandelier", "Spots îlot": "Island spots", "Plan de travail": "Worktop", "Éclairage tableau": "Painting light",
           "Appliques": "Wall lights", "Tête de lit": "Bedhead", "Chevet gauche": "Left bedside", "Chevet droit": "Right bedside", "Niches": "Niches",
           "Veilleuses": "Nightlights", "Dressing Monsieur": "His dressing", "Dressing Madame": "Her dressing", "Terrasse": "Terrace",
           "Douche vapeur": "Steam shower", "Appliques miroir": "Mirror lights", "Spots WC": "WC spots", "Niche WC": "WC niche", "Sèche-serviettes": "Towel heater",
           "Spots entrée": "Entrance spots", "Spots vasque": "Basin spots", "Spots douche": "Shower spots", "Corniche douche": "Shower cove",
           "Niche douche": "Shower niche", "Spot WC": "WC spot", "Appliques WC": "WC wall lights", "Spots escalier": "Staircase spots",
           "Appliques hall": "Hall wall lights", "Dressing": "Dressing", "Spots dressing": "Dressing spots", "Spots lit": "Bed spots",
           "Corniches": "Coves", "Corniche WC": "WC cove", "Balcon sud": "South balcony", "Balcon est": "East balcony", "Balcon nord": "North balcony",
           "Rideau baie sud": "South bay curtain", "Rideau baie est": "East bay curtain", "Voilage sud": "South sheer", "Voilage est": "East sheer",
           "Rideau terrasse": "Terrace curtain", "Voilage": "Sheer", "Store fenêtre": "Window blind", "Rideau dressing": "Dressing curtain",
           "Rideau": "Curtain", "Store banne": "Awning", "Appartement Crans-Montana": "Crans-Montana apartment"},
    "de": {"Salon": "Wohnzimmer", "Salle à manger": "Esszimmer", "Cuisine": "Küche", "Entrée": "Eingang",
           "WC invités": "Gäste-WC", "Buanderie": "Waschküche", "Suite parentale": "Elternsuite", "Bain parental": "Elternbad",
           "Bureau": "Büro", "Salle TV": "TV-Zimmer", "Bain salle TV": "Bad TV-Zimmer", "Hall étage": "Halle Obergeschoss",
           "Chambre Twin": "Twin-Zimmer", "Bain Twin": "Bad Twin", "Chambre VIP": "VIP-Zimmer", "Bain VIP": "Bad VIP",
           "Balcons": "Balkone",
           "OFF": "AUS", "JOUR": "TAG", "SOIR": "ABEND", "NUIT": "NACHT",
           "Spots côté vallée": "Spots Talseite", "Spots coin lecture": "Spots Leseecke", "Corniche LED": "LED-Voute", "Lampadaires": "Stehleuchten",
           "Cheminée": "Kamin", "Spots": "Spots", "Suspensions": "Pendelleuchten", "Spots plafond": "Deckenspots", "Spots passage": "Spots Durchgang",
           "Lustre îlot": "Insel-Leuchter", "Spots îlot": "Insel-Spots", "Plan de travail": "Arbeitsfläche", "Éclairage tableau": "Bildbeleuchtung",
           "Appliques": "Wandleuchten", "Tête de lit": "Kopfteil", "Chevet gauche": "Nachttisch links", "Chevet droit": "Nachttisch rechts", "Niches": "Nischen",
           "Veilleuses": "Nachtlichter", "Dressing Monsieur": "Ankleide Herr", "Dressing Madame": "Ankleide Dame", "Terrasse": "Terrasse",
           "Douche vapeur": "Dampfdusche", "Appliques miroir": "Spiegelleuchten", "Spots WC": "WC-Spots", "Niche WC": "WC-Nische", "Sèche-serviettes": "Handtuchwärmer",
           "Spots entrée": "Spots Eingang", "Spots vasque": "Spots Waschtisch", "Spots douche": "Duschspots", "Corniche douche": "Voute Dusche",
           "Niche douche": "Duschnische", "Spot WC": "WC-Spot", "Appliques WC": "WC-Wandleuchten", "Spots escalier": "Treppenspots",
           "Appliques hall": "Wandleuchten Halle", "Dressing": "Ankleide", "Spots dressing": "Spots Ankleide", "Spots lit": "Spots Bett",
           "Corniches": "Vouten", "Corniche WC": "Voute WC", "Balcon sud": "Balkon Süd", "Balcon est": "Balkon Ost", "Balcon nord": "Balkon Nord",
           "Rideau baie sud": "Vorhang Südfenster", "Rideau baie est": "Vorhang Ostfenster", "Voilage sud": "Store Süd", "Voilage est": "Store Ost",
           "Rideau terrasse": "Vorhang Terrasse", "Voilage": "Store", "Store fenêtre": "Fensterrollo", "Rideau dressing": "Vorhang Ankleide",
           "Rideau": "Vorhang", "Store banne": "Markise", "Appartement Crans-Montana": "Wohnung Crans-Montana"},
    "es": {"Salon": "Salón", "Salle à manger": "Comedor", "Cuisine": "Cocina", "Entrée": "Entrada",
           "WC invités": "Aseo", "Buanderie": "Lavandería", "Suite parentale": "Suite principal", "Bain parental": "Baño principal",
           "Bureau": "Despacho", "Salle TV": "Sala de TV", "Bain salle TV": "Baño sala de TV", "Hall étage": "Hall superior",
           "Chambre Twin": "Habitación Twin", "Bain Twin": "Baño Twin", "Chambre VIP": "Habitación VIP", "Bain VIP": "Baño VIP",
           "Balcons": "Balcones",
           "OFF": "OFF", "JOUR": "DÍA", "SOIR": "TARDE", "NUIT": "NOCHE",
           "Spots côté vallée": "Focos lado valle", "Spots coin lecture": "Focos rincón lectura", "Corniche LED": "Cornisa LED", "Lampadaires": "Lámparas de pie",
           "Cheminée": "Chimenea", "Spots": "Focos", "Suspensions": "Colgantes", "Spots plafond": "Focos techo", "Spots passage": "Focos paso",
           "Lustre îlot": "Lámpara isla", "Spots îlot": "Focos isla", "Plan de travail": "Encimera", "Éclairage tableau": "Luz cuadro",
           "Appliques": "Apliques", "Tête de lit": "Cabecero", "Chevet gauche": "Mesita izquierda", "Chevet droit": "Mesita derecha", "Niches": "Nichos",
           "Veilleuses": "Luces nocturnas", "Dressing Monsieur": "Vestidor él", "Dressing Madame": "Vestidor ella", "Terrasse": "Terraza",
           "Douche vapeur": "Ducha de vapor", "Appliques miroir": "Apliques espejo", "Spots WC": "Focos WC", "Niche WC": "Nicho WC", "Sèche-serviettes": "Toallero",
           "Spots entrée": "Focos entrada", "Spots vasque": "Focos lavabo", "Spots douche": "Focos ducha", "Corniche douche": "Cornisa ducha",
           "Niche douche": "Nicho ducha", "Spot WC": "Foco WC", "Appliques WC": "Apliques WC", "Spots escalier": "Focos escalera",
           "Appliques hall": "Apliques hall", "Dressing": "Vestidor", "Spots dressing": "Focos vestidor", "Spots lit": "Focos cama",
           "Corniches": "Cornisas", "Corniche WC": "Cornisa WC", "Balcon sud": "Balcón sur", "Balcon est": "Balcón este", "Balcon nord": "Balcón norte",
           "Rideau baie sud": "Cortina ventanal sur", "Rideau baie est": "Cortina ventanal este", "Voilage sud": "Visillo sur", "Voilage est": "Visillo este",
           "Rideau terrasse": "Cortina terraza", "Voilage": "Visillo", "Store fenêtre": "Estor ventana", "Rideau dressing": "Cortina vestidor",
           "Rideau": "Cortina", "Store banne": "Toldo", "Appartement Crans-Montana": "Apartamento Crans-Montana"},
    "ru": {"Salon": "Гостиная", "Salle à manger": "Столовая", "Cuisine": "Кухня", "Entrée": "Прихожая",
           "WC invités": "Гостевой туалет", "Buanderie": "Прачечная", "Suite parentale": "Главная спальня", "Bain parental": "Главная ванная",
           "Bureau": "Кабинет", "Salle TV": "ТВ-комната", "Bain salle TV": "Ванная ТВ-комнаты", "Hall étage": "Верхний холл",
           "Chambre Twin": "Спальня Twin", "Bain Twin": "Ванная Twin", "Chambre VIP": "Спальня VIP", "Bain VIP": "Ванная VIP",
           "Balcons": "Балконы",
           "OFF": "ВЫКЛ", "JOUR": "ДЕНЬ", "SOIR": "ВЕЧЕР", "NUIT": "НОЧЬ",
           "Spots côté vallée": "Споты у долины", "Spots coin lecture": "Споты уголка чтения", "Corniche LED": "LED-карниз", "Lampadaires": "Торшеры",
           "Cheminée": "Камин", "Spots": "Споты", "Suspensions": "Подвесы", "Spots plafond": "Потолочные споты", "Spots passage": "Споты прохода",
           "Lustre îlot": "Люстра острова", "Spots îlot": "Споты острова", "Plan de travail": "Столешница", "Éclairage tableau": "Подсветка картины",
           "Appliques": "Бра", "Tête de lit": "Изголовье", "Chevet gauche": "Левая тумба", "Chevet droit": "Правая тумба", "Niches": "Ниши",
           "Veilleuses": "Ночники", "Dressing Monsieur": "Гардероб (он)", "Dressing Madame": "Гардероб (она)", "Terrasse": "Терраса",
           "Douche vapeur": "Паровой душ", "Appliques miroir": "Подсветка зеркала", "Spots WC": "Споты WC", "Niche WC": "Ниша WC", "Sèche-serviettes": "Полотенцесушитель",
           "Spots entrée": "Споты входа", "Spots vasque": "Споты раковины", "Spots douche": "Споты душа", "Corniche douche": "Карниз душа",
           "Niche douche": "Ниша душа", "Spot WC": "Спот WC", "Appliques WC": "Бра WC", "Spots escalier": "Споты лестницы",
           "Appliques hall": "Бра холла", "Dressing": "Гардероб", "Spots dressing": "Споты гардероба", "Spots lit": "Споты кровати",
           "Corniches": "Карнизы", "Corniche WC": "Карниз WC", "Balcon sud": "Южный балкон", "Balcon est": "Восточный балкон", "Balcon nord": "Северный балкон",
           "Rideau baie sud": "Штора южного окна", "Rideau baie est": "Штора восточного окна", "Voilage sud": "Тюль юг", "Voilage est": "Тюль восток",
           "Rideau terrasse": "Штора террасы", "Voilage": "Тюль", "Store fenêtre": "Рулонная штора", "Rideau dressing": "Штора гардероба",
           "Rideau": "Штора", "Store banne": "Маркиза", "Appartement Crans-Montana": "Апартаменты Кран-Монтана"},
}


def circuit_levels(c):
    if c["fixe"] is not None:
        return [c["fixe"][s] for s in SCENES]
    row = SEQ_BY_NAME.get(c["lutron"])
    if row is None:
        raise SystemExit("Ligne Lutron introuvable : " + str(c["lutron"]))
    return [lvl(row[SCENE_COL[s]]) for s in SCENES]


def build():
    core = json.loads(CORE.read_text(encoding="utf-8"))
    template = core["pieces"][0]
    cfg = {}
    cfg["meta"] = copy.deepcopy(core["meta"])
    cfg["meta"].update({
        "projet": "Appartement Crans-Montana",
        "version": "1.0.0",
        "mode": "deploiement",
        "tracesConsole": False,
        "tracesLatence": False,
        "description": "Duplex de 350 m² (niveaux 9 et 10) dans une résidence hôtelière de Crans-Montana : 17 zones, "
                       "éclairage Lutron HomeWorks QS (DALI + phase) avec niveaux par scène issus de la séquence "
                       "d'opérations Lutron, rideaux motorisés Lutron, CVC par pièce. Interface Connect (liste des pièces, tuiles-curseurs, "
                       "scènes, stores, climat) ; aucune fonction audio-vidéo, alarme ni caméra (29.09.2026). GUI CH5, C# et "
                       "générateur SIMPL = Core Villa Crans (contrat v4.1) ; seul ce fichier change.",
        "interface": "connect",
        "interfaceDescription": "'connect' = interface Connect du Core (themes/connect.css + js/connect-ui.js, v5.4) ; absent ou 'villa' = interface Villa Crans d'origine.",
        "fonctionsRetirees": ["audioVideo", "alarme", "cameras"],
        "coreOrigine": "projects/villa-crans/ch5 (GUI + C#) et projects/villa-crans/simpl/contract (générateur)",
    })
    cfg["valeursParDefaut"] = copy.deepcopy(core["valeursParDefaut"])
    cfg["valeursParDefaut"]["scenesEclairage"] = list(SCENES)
    cfg["valeursParDefaut"]["circuits"] = ["Spots", "Corniche LED", "Appliques", "Veilleuses"]
    cfg["sourcesAudioVideo"] = copy.deepcopy(core["sourcesAudioVideo"])
    cfg["scenesStores"] = copy.deepcopy(core["scenesStores"])
    cfg["widgets"] = copy.deepcopy(core["widgets"])
    cfg["widgets"]["bandeauActualites"]["actif"] = False
    cfg["widgets"]["meteoActualites"].update({"actif": True, "ville": "Crans-Montana", "latitude": 46.3117, "longitude": 7.4806,
        "description": "Widget meteo de la colonne de gauche ; ville/coordonnees lues par le Core (27.09.2026)"})
    pieces = []
    for r in ROOMS:
        p = copy.deepcopy(template)
        p["id"] = r["id"]; p["nom"] = r["nom"]; p["icone"] = r["icone"]; p["intersystem"] = True; p["actif"] = True
        p["niveau"] = r["niveau"]
        pil = p["pilotages"]
        noms = [c["nom"] for c in r["circuits"]]
        levels = [circuit_levels(c) for c in r["circuits"]]          # [circuit][scene]
        pil["eclairages"] = {
            "actif": True,
            "scenes": {"nombre": 4, "noms": list(SCENES),
                       "niveaux": [[levels[ci][si] for ci in range(len(noms))] for si in range(4)],
                       "niveauxDescription": template["pilotages"]["eclairages"]["scenes"]["niveauxDescription"],
                       "origine": "Séquence d'opérations Lutron du projet : OFF = Scene Off, JOUR = CELS Day, SOIR = CELS Night, NUIT = Low Scene (veilleuses forcées)."},
            "circuits": {"nombre": len(noms), "noms": noms,
                         "lutron": [c["lutron"] or "" for c in r["circuits"]],
                         "type": [(SEQ_BY_NAME[c["lutron"]]["type"] if c["lutron"] else "contact") for c in r["circuits"]]},
        }
        mots = r["moteurs"]
        pil["moteurs"] = {"actif": bool(mots), "nombre": len(mots) if mots else 6,
                          "liste": mots if mots else copy.deepcopy(template["pilotages"]["moteurs"]["liste"])}
        pil["cvc"]["actif"] = r["cvc"]
        pil["controlesGeneraux"]["actif"] = True
        pil["controlesGeneraux"]["partitionsAlarme"] = 0      # 29.09.2026 : alarme retirée du projet
        pil["audioVideo"]["actif"] = False                    # 29.09.2026 : A/V retiré du projet
        if "wellness" in pil:
            del pil["wellness"]
        p["plan3d"] = r["plan3d"]
        pieces.append(p)
    cfg["pieces"] = pieces
    # Traductions : celles du Core utiles (scènes stores, sources, CVC…) + celles du projet
    tr = {}
    keep = set(core["valeursParDefaut"].get("moteurs", []) and []) | {
        "Tout ouvrir", "Position été", "Position hiver", "Tout fermer", "MUSIQUE", "CHAUFFAGE", "CLIMATISATION"}
    for lang, d in core["traductions"].items():
        tr[lang] = {k: v for k, v in d.items() if k in keep}
        tr[lang].update(TR.get(lang, {}))
    cfg["traductions"] = tr
    cfg["contrat"] = copy.deepcopy(core["contrat"])
    cfg["contrat"]["wellness"]["actif"] = False
    cfg["contrat"]["alarme"]["actif"] = False
    cfg["pagesSpeciales"] = copy.deepcopy(core["pagesSpeciales"])
    return cfg


def main():
    cfg = build()
    out = PROJ / "villa_config.json"
    out.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n = sum(len(p["pilotages"]["eclairages"]["circuits"]["noms"]) for p in cfg["pieces"])
    print(f"{out} : {len(cfg['pieces'])} pièces, {n} circuits, {len(SCENES)} scènes par pièce")


if __name__ == "__main__":
    main()
