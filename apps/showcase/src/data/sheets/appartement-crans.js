// Fiche détaillée « Appartement Crans-Montana » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/appartement-crans/ (faites par
// scripts/shoot-appartement-crans.cjs sur .device-screen des routes dalle / tablette / smartphone,
// puis réduites à 1400 px / 256 couleurs par scripts/helpers/png-1400-256.py).
const IMG = "/sheets/appartement-crans/";

export default {
  fr: {
    intro:
      "Duplex de 350 m² sur deux niveaux, 17 zones. Cette interface est la deuxième GUI CH5 réelle issue du Core Villa Crans : même page, même contrat de signaux, mêmes programmes ; seul le fichier de configuration JSON change (pièces, circuits Lutron, scènes, moteurs, climat, sources). Les niveaux de chaque scène d'éclairage reprennent la séquence d'opérations de l'éclairagiste (OFF = Scene Off, JOUR = CELS Day, SOIR = CELS Night, NUIT = Low Scene). Chaque bouton reçoit son état depuis le processeur, jamais depuis l'écran.",
    sections: [
      {
        title: "Menu des pièces sur deux niveaux",
        image: IMG + "01-accueil-salon.png",
        image2: IMG + "02-menu-niveau-1.png",
        text: "Le menu de gauche liste les 17 zones dans l'ordre des deux niveaux : salon, salle à manger, cuisine, entrée, WC, buanderie, chambre principale et sa salle de bains, bureau, salle TV et sa salle de bains au premier niveau ; hall et escalier, chambre Twin, chambre VIP et leurs salles de bains au second ; balcons et terrasses en dernier. Ci-contre le Salon en scène SOIR, puis le menu défilé jusqu'aux pièces du second niveau avec la Chambre VIP active.",
        buttons: [
          ["Menu des pièces", "Un appui sélectionne la zone ; toutes les cartes se recalculent pour elle (scènes, circuits, moteurs, consigne, sources). Les flèches haut / bas font défiler la liste."],
          ["Alarme · Caméras · Contrôle global", "Fonctions communes à tout l'appartement, identiques à la Villa Crans."],
          ["Bandeau « État de la villa »", "Alarme, portes, source active, température et consigne, consommation, processeur."],
        ],
      },
      {
        title: "Éclairage Lutron : scènes d'une chambre",
        image: IMG + "03-eclairages-chambre.png",
        text: "La Chambre principale compte dix circuits DALI (spots, corniche LED, tête de lit, chevets, niches, veilleuses, dressings, terrasse). La scène SOIR active reproduit les niveaux de la séquence d'opérations : spots à 75 %, chevets à 100 %, corniche à 20 %, veilleuses éteintes. Le processeur Lutron HomeWorks QS confirme chaque niveau ; le bouton de scène ne s'allume qu'à sa confirmation.",
        buttons: [
          ["OFF · JOUR · SOIR · NUIT", "Rappel des quatre scènes de la pièce. Appui long ≈ 1,2 s : mémorise les niveaux du moment dans la scène."],
          ["Réglage (carte Luminosité)", "Ouvre la fenêtre Circuits pour régler chaque gradateur."],
          ["LUMIÈRES / STORES", "Bascule entre les scènes d'éclairage et les motorisations de la pièce."],
        ],
      },
      {
        title: "Circuits d'une salle de bains",
        image: IMG + "04-circuits-salle-de-bains.png",
        text: "La Salle de bains TV est la zone la plus équipée : onze circuits (appliques miroir en phase, spots vasque, spots, corniche LED, spots et corniche de douche, niches, spots et appliques WC, sèche-serviettes en contact). Chaque curseur affiche le niveau réel renvoyé par Lutron ; un réglage manuel désélectionne la scène en cours. Au-delà de dix circuits, la liste défile dans la fenêtre.",
        buttons: [
          ["Curseurs", "Niveau de 0 à 100 % de chaque circuit ; un circuit en contact (sèche-serviettes, cheminée) ne connaît que 0 ou 100 %."],
          ["NUIT · SOIR · JOUR · OFF", "Rappel de la scène depuis la fenêtre."],
          ["Enregistrer (à côté de chaque scène)", "Mémorise les niveaux actuels dans la scène ; un message confirme."],
          ["Fermer", "Retour à l'écran principal."],
        ],
      },
      {
        title: "Rideaux et voilages du salon",
        image: IMG + "05-stores-salon.png",
        image2: IMG + "06-moteurs-salon.png",
        text: "Le Salon possède deux rideaux (baie sud, baie est) et deux voilages motorisés Lutron. L'onglet STORES de la carte Luminosité donne les commandes groupées par famille ; la fenêtre Moteurs (ci-contre) détaille chaque motorisation avec ses commandes individuelles puis les commandes de groupe.",
        buttons: [
          ["Ouvrir · Stop · Fermer (rideaux)", "Flèches horizontales pour un rideau à ouverture centrale ; l'ordre part au processeur qui gère la course."],
          ["Monter · Stop · Descendre (voilages)", "Commande d'un voilage à enroulement."],
          ["Tout ouvrir · Demi-ouverture · Tout fermer", "Commande simultanée de tous les rideaux ou de tous les voilages de la pièce."],
        ],
      },
      {
        title: "Climat pièce par pièce",
        image: IMG + "07-cvc-bureau.png",
        text: "Chaque pièce climatisée dispose de sa carte HVAC : température mesurée, mode actif, consigne de 16 à 28 °C par pas de 0,5 °C, marche / arrêt et ventilation. Le Bureau ci-contre n'a pas d'audio-vidéo : la carte Source disparaît, le reste de l'écran est inchangé. Les pièces sans climat (entrée, WC, buanderie, hall, balcons) n'affichent pas la carte.",
        buttons: [
          ["− / +", "Baisse ou monte la consigne ; la valeur affichée est celle confirmée par le régulateur."],
          ["ON / OFF", "Marche ou arrêt du climat de la pièce ; la vitesse reste mémorisée."],
          ["AUTO · 1 · 2 · 3", "Ventilation automatique, faible, moyenne ou forte (ici : 2)."],
        ],
      },
      {
        title: "Audio-vidéo Bang & Olufsen",
        image: IMG + "08-apple-tv-telecommande.png",
        image2: IMG + "09-lecteur-media.png",
        text: "Sept pièces (salon, salle à manger, cuisine, chambre principale, salle TV, chambres Twin et VIP) sont équipées en audio-vidéo B&O. Les sources vidéo sont en interlock ; le premier appui active la source et ouvre sa télécommande (ci-contre : Apple TV dans la Salle TV). MUSIQUE envoie la musique sur les enceintes en gardant la vidéo à l'écran et ouvre le lecteur média.",
        buttons: [
          ["APPLE TV · SKY Q · SWISSCOM · IPTV", "Sources vidéo, une seule active à la fois ; un badge indique la source qui joue sur les enceintes."],
          ["MUSIQUE", "Source audio indépendante ; un nouvel appui sur une source vidéo demande de garder la musique ou de revenir à l'audio de la vidéo."],
          ["Menu · croix · OK", "Télécommande Apple TV (Siri Remote)."],
          ["Précédent · Lecture / pause · Suivant", "Commandes du lecteur média, avec titre, artiste, album et progression."],
          ["Volume · Muet · Extinction", "Volume de la pièce, coupure du son, arrêt de toutes les sources de la pièce."],
        ],
      },
      {
        title: "Contrôle global",
        image: IMG + "10-controle-global.png",
        text: "Commandes groupées sur tout l'appartement : éclairage, climat, motorisations et mode vacances. Un seul bouton vert par section, les autres restent gris, avec les mêmes libellés sur dalle, tablette et smartphone.",
        buttons: [
          ["TOUT ALLUMER · MODE ÉCO · TOUT ÉTEINDRE", "Tous les circuits d'éclairage à 100 %, à 30 %, ou éteints."],
          ["CONFORT · NUIT · HORS GEL", "Consigne de toutes les pièces climatisées."],
          ["TOUT OUVRIR · TOUT FERMER", "Toutes les motorisations de l'appartement."],
          ["ACTIVER / DÉSACTIVER (vacances)", "Arme l'alarme, éteint l'éclairage, ferme les rideaux et passe le climat en hors gel."],
          ["Réglage (chaque carte)", "Configuration du preset : circuits ou moteurs inclus par pièce et leur niveau."],
        ],
      },
      {
        title: "Thèmes graphiques et tablette",
        image: IMG + "11-theme-clair.png",
        image2: IMG + "13-tablette-chambre-twin.png",
        text: "Trois habillages pour la même interface : Sombre premium, Clair élégant (ci-contre) et Verre dépoli. Sur l'iPad 11\" (à droite, Chambre Twin en scène NUIT) la page est identique à la dalle TSW-1070 : un seul GUI, un seul contrat de signaux.",
        buttons: [],
      },
      {
        title: "Version smartphone",
        image: IMG + "14-iphone-eclairages.png",
        image2: IMG + "17-iphone-apple-tv.png",
        portrait: true,
        text: "Sur smartphone, l'interface se réorganise en trois onglets : Éclairages (scènes, circuits, moteurs), HVAC et Source. La pièce active se choisit dans la liste déroulante ; Alarme, Caméras et Global restent accessibles en tête. Ci-contre : la Chambre principale en scène SOIR, puis la télécommande Apple TV ouverte au premier appui sur la source.",
        buttons: [
          ["Pièce active", "Liste déroulante des 17 zones."],
          ["Circuits (réglage)", "Ouvre la fenêtre Circuits : un curseur par circuit, avec les scènes en bas (défilement autorisé sur smartphone)."],
          ["Moteurs", "Commandes par famille, deux familles par page."],
          ["Onglets bas", "Éclairages, HVAC (marche, consigne, ventilation), Source (sources, volume, muet, extinction)."],
        ],
      },
    ],
  },

  en: {
    intro:
      "350 m² duplex on two levels, 17 zones. This interface is the second real CH5 GUI built from the Villa Crans Core: same page, same signal contract, same programs; only the JSON configuration file changes (rooms, Lutron circuits, scenes, motors, climate, sources). Each lighting scene level comes from the lighting designer's sequence of operations (OFF = Scene Off, DAY = CELS Day, EVENING = CELS Night, NIGHT = Low Scene). Every button receives its state from the processor, never from the screen.",
    sections: [
      {
        title: "Room menu on two levels",
        image: IMG + "01-accueil-salon.png",
        image2: IMG + "02-menu-niveau-1.png",
        text: "The left menu lists the 17 zones in level order: living room, dining room, kitchen, entrance, WC, laundry, master bedroom and its bathroom, office, TV room and its bathroom on the first level; hall and staircase, Twin bedroom, VIP bedroom and their bathrooms on the second; balconies and terraces last. Shown: the living room in the EVENING scene, then the menu scrolled to the second level with the VIP bedroom active.",
        buttons: [
          ["Room menu", "One tap selects the zone; every card recomputes for it (scenes, circuits, motors, setpoint, sources). Up / down arrows scroll the list."],
          ["Alarm · Cameras · Global control", "Apartment-wide functions, identical to the Villa Crans."],
          ["“Status” banner", "Alarm, doors, active source, temperature and setpoint, consumption, processor."],
        ],
      },
      {
        title: "Lutron lighting: scenes of a bedroom",
        image: IMG + "03-eclairages-chambre.png",
        text: "The master bedroom has ten DALI circuits (spots, LED cove, headboard, bedside lamps, niches, night lights, dressing rooms, terrace). The active EVENING scene reproduces the sequence-of-operations levels: spots at 75%, bedside lamps at 100%, cove at 20%, night lights off. The Lutron HomeWorks QS processor confirms each level; the scene button only lights up once confirmed.",
        buttons: [
          ["OFF · DAY · EVENING · NIGHT", "Recalls the four scenes of the room. Long press ≈ 1.2 s: stores the current levels into the scene."],
          ["Settings (Lighting card)", "Opens the Circuits window to adjust each dimmer."],
          ["LIGHTS / BLINDS", "Switches between the lighting scenes and the room motors."],
        ],
      },
      {
        title: "Circuits of a bathroom",
        image: IMG + "04-circuits-salle-de-bains.png",
        text: "The TV bathroom is the most equipped zone: eleven circuits (phase-dimmed mirror sconces, basin spots, spots, LED cove, shower spots and cove, niches, WC spots and sconces, towel rail as a contact). Each slider shows the real level reported by Lutron; a manual change deselects the current scene. Beyond ten circuits, the list scrolls inside the window.",
        buttons: [
          ["Sliders", "0–100% level of each circuit; a contact circuit (towel rail, fireplace) only knows 0 or 100%."],
          ["NIGHT · EVENING · DAY · OFF", "Scene recall from the window."],
          ["Save (next to each scene)", "Stores the current levels into the scene; a message confirms."],
          ["Close", "Back to the main screen."],
        ],
      },
      {
        title: "Living-room curtains and sheers",
        image: IMG + "05-stores-salon.png",
        image2: IMG + "06-moteurs-salon.png",
        text: "The living room has two curtains (south bay, east bay) and two Lutron motorised sheers. The BLINDS tab of the Lighting card gives the group commands per family; the Motors window (shown) details each motor with its individual commands, then the group commands.",
        buttons: [
          ["Open · Stop · Close (curtains)", "Horizontal arrows for a centre-opening curtain; the command goes to the processor, which manages the travel."],
          ["Up · Stop · Down (sheers)", "Roller sheer control."],
          ["Open all · Half open · Close all", "Simultaneous command of every curtain or every sheer of the room."],
        ],
      },
      {
        title: "Room-by-room climate",
        image: IMG + "07-cvc-bureau.png",
        text: "Each air-conditioned room has its HVAC card: measured temperature, active mode, 16–28 °C setpoint in 0.5 °C steps, on / off and fan speed. The office shown has no audio-video: the Source card disappears, the rest of the screen is unchanged. Rooms without climate (entrance, WC, laundry, hall, balconies) do not show the card.",
        buttons: [
          ["− / +", "Lowers or raises the setpoint; the displayed value is the one confirmed by the controller."],
          ["ON / OFF", "Room climate on or off; the fan speed stays stored."],
          ["AUTO · 1 · 2 · 3", "Automatic, low, medium or high fan speed (here: 2)."],
        ],
      },
      {
        title: "Bang & Olufsen audio-video",
        image: IMG + "08-apple-tv-telecommande.png",
        image2: IMG + "09-lecteur-media.png",
        text: "Seven rooms (living room, dining room, kitchen, master bedroom, TV room, Twin and VIP bedrooms) have B&O audio-video. Video sources are interlocked; the first tap activates the source and opens its remote (shown: Apple TV in the TV room). MUSIC sends music to the speakers while keeping the video on screen and opens the media player.",
        buttons: [
          ["APPLE TV · SKY Q · SWISSCOM · IPTV", "Video sources, only one active at a time; a badge marks the source playing on the speakers."],
          ["MUSIC", "Independent audio source; tapping a video source again asks whether to keep the music or return to the video audio."],
          ["Menu · pad · OK", "Apple TV remote (Siri Remote)."],
          ["Previous · Play / pause · Next", "Media player controls, with title, artist, album and progress."],
          ["Volume · Mute · Power off", "Room volume, mute, switch-off of every source in the room."],
        ],
      },
      {
        title: "Global control",
        image: IMG + "10-controle-global.png",
        text: "Group commands for the whole apartment: lighting, climate, motors and holiday mode. One green button per section, the others stay grey, with the same labels on wall panel, tablet and smartphone.",
        buttons: [
          ["ALL ON · ECO MODE · ALL OFF", "Every lighting circuit at 100%, 30%, or off."],
          ["COMFORT · NIGHT · FROST PROTECTION", "Setpoint of every air-conditioned room."],
          ["OPEN ALL · CLOSE ALL", "Every motor of the apartment."],
          ["ACTIVATE / DEACTIVATE (holiday)", "Arms the alarm, switches the lights off, closes the curtains and sets the climate to frost protection."],
          ["Settings (each card)", "Preset configuration: circuits or motors included per room and their level."],
        ],
      },
      {
        title: "Themes and tablet",
        image: IMG + "11-theme-clair.png",
        image2: IMG + "13-tablette-chambre-twin.png",
        text: "Three skins for the same interface: Premium dark, Elegant light (shown) and Frosted glass. On the 11\" iPad (right, Twin bedroom in the NIGHT scene) the page is identical to the TSW-1070 wall panel: one GUI, one signal contract.",
        buttons: [],
      },
      {
        title: "Smartphone version",
        image: IMG + "14-iphone-eclairages.png",
        image2: IMG + "17-iphone-apple-tv.png",
        portrait: true,
        text: "On a smartphone the interface reorganises into three tabs: Lighting (scenes, circuits, motors), HVAC and Source. The active room is chosen from the drop-down list; Alarm, Cameras and Global stay at the top. Shown: the master bedroom in the EVENING scene, then the Apple TV remote opened on the first tap on the source.",
        buttons: [
          ["Active room", "Drop-down list of the 17 zones."],
          ["Circuits (settings)", "Opens the Circuits window: one slider per circuit, scenes at the bottom (scrolling allowed on smartphone)."],
          ["Motors", "Commands per family, two families per page."],
          ["Bottom tabs", "Lighting, HVAC (power, setpoint, fan), Source (sources, volume, mute, power off)."],
        ],
      },
    ],
  },

  de: {
    intro:
      "350 m² Duplex auf zwei Ebenen, 17 Zonen. Diese Oberfläche ist die zweite reale CH5-GUI aus dem Core Villa Crans: gleiche Seite, gleicher Signalvertrag, gleiche Programme; nur die JSON-Konfigurationsdatei ändert sich (Räume, Lutron-Stromkreise, Szenen, Motoren, Klima, Quellen). Die Stufen jeder Lichtszene stammen aus der Betriebssequenz des Lichtplaners (AUS = Scene Off, TAG = CELS Day, ABEND = CELS Night, NACHT = Low Scene). Jede Taste erhält ihren Zustand vom Prozessor, nie vom Bildschirm.",
    sections: [
      {
        title: "Raummenü auf zwei Ebenen",
        image: IMG + "01-accueil-salon.png",
        image2: IMG + "02-menu-niveau-1.png",
        text: "Das linke Menü listet die 17 Zonen nach Ebenen: Wohnzimmer, Esszimmer, Küche, Eingang, WC, Waschküche, Hauptschlafzimmer mit Bad, Büro, TV-Zimmer mit Bad auf der ersten Ebene; Halle und Treppe, Twin-Zimmer, VIP-Zimmer und ihre Bäder auf der zweiten; Balkone und Terrassen zuletzt. Abgebildet: das Wohnzimmer in der Szene ABEND, dann das zur zweiten Ebene gescrollte Menü mit aktivem VIP-Zimmer.",
        buttons: [
          ["Raummenü", "Ein Tipp wählt die Zone; alle Karten werden für sie neu berechnet (Szenen, Kreise, Motoren, Sollwert, Quellen). Pfeile auf / ab blättern die Liste."],
          ["Alarm · Kameras · Globale Steuerung", "Wohnungsweite Funktionen, identisch mit der Villa Crans."],
          ["Statusband", "Alarm, Türen, aktive Quelle, Temperatur und Sollwert, Verbrauch, Prozessor."],
        ],
      },
      {
        title: "Lutron-Beleuchtung: Szenen eines Schlafzimmers",
        image: IMG + "03-eclairages-chambre.png",
        text: "Das Hauptschlafzimmer hat zehn DALI-Kreise (Spots, LED-Voute, Kopfteil, Nachttischlampen, Nischen, Nachtlichter, Ankleiden, Terrasse). Die aktive Szene ABEND gibt die Stufen der Betriebssequenz wieder: Spots 75 %, Nachttischlampen 100 %, Voute 20 %, Nachtlichter aus. Der Lutron-HomeWorks-QS-Prozessor bestätigt jede Stufe; die Szenentaste leuchtet erst nach der Bestätigung.",
        buttons: [
          ["AUS · TAG · ABEND · NACHT", "Abruf der vier Szenen des Raums. Lang drücken ≈ 1,2 s: speichert die aktuellen Stufen in die Szene."],
          ["Einstellung (Karte Helligkeit)", "Öffnet das Fenster Kreise zur Regelung jedes Dimmers."],
          ["LICHT / STOREN", "Wechselt zwischen Lichtszenen und Motoren des Raums."],
        ],
      },
      {
        title: "Kreise eines Badezimmers",
        image: IMG + "04-circuits-salle-de-bains.png",
        text: "Das TV-Bad ist die am besten ausgestattete Zone: elf Kreise (Spiegelleuchten mit Phasenanschnitt, Waschtisch-Spots, Spots, LED-Voute, Dusch-Spots und -Voute, Nischen, WC-Spots und -Leuchten, Handtuchheizkörper als Kontakt). Jeder Regler zeigt die von Lutron gemeldete reale Stufe; eine manuelle Änderung hebt die aktuelle Szene auf. Ab elf Kreisen scrollt die Liste im Fenster.",
        buttons: [
          ["Regler", "0–100 % je Kreis; ein Kontaktkreis (Handtuchheizkörper, Kamin) kennt nur 0 oder 100 %."],
          ["NACHT · ABEND · TAG · AUS", "Szenenabruf aus dem Fenster."],
          ["Speichern (neben jeder Szene)", "Speichert die aktuellen Stufen in die Szene; eine Meldung bestätigt."],
          ["Schliessen", "Zurück zum Hauptbildschirm."],
        ],
      },
      {
        title: "Vorhänge und Stores des Wohnzimmers",
        image: IMG + "05-stores-salon.png",
        image2: IMG + "06-moteurs-salon.png",
        text: "Das Wohnzimmer hat zwei Vorhänge (Süd- und Ostfenster) und zwei motorisierte Lutron-Stores. Der Reiter STOREN der Karte Helligkeit bietet die Gruppenbefehle je Familie; das Fenster Motoren (abgebildet) zeigt jeden Antrieb mit Einzelbefehlen und danach die Gruppenbefehle.",
        buttons: [
          ["Öffnen · Stopp · Schliessen (Vorhänge)", "Horizontale Pfeile für einen mittig öffnenden Vorhang; der Befehl geht an den Prozessor, der den Lauf steuert."],
          ["Auf · Stopp · Ab (Stores)", "Steuerung eines Rollstores."],
          ["Alle öffnen · Halb öffnen · Alle schliessen", "Gleichzeitiger Befehl an alle Vorhänge oder alle Stores des Raums."],
        ],
      },
      {
        title: "Klima Raum für Raum",
        image: IMG + "07-cvc-bureau.png",
        text: "Jeder klimatisierte Raum hat seine HVAC-Karte: gemessene Temperatur, aktiver Modus, Sollwert 16–28 °C in Schritten von 0,5 °C, Ein / Aus und Lüfterstufe. Das abgebildete Büro hat kein Audio/Video: die Karte Quelle verschwindet, der Rest des Bildschirms bleibt gleich. Räume ohne Klima (Eingang, WC, Waschküche, Halle, Balkone) zeigen die Karte nicht.",
        buttons: [
          ["− / +", "Senkt oder erhöht den Sollwert; angezeigt wird der vom Regler bestätigte Wert."],
          ["ON / OFF", "Klima des Raums ein oder aus; die Lüfterstufe bleibt gespeichert."],
          ["AUTO · 1 · 2 · 3", "Automatische, niedrige, mittlere oder hohe Lüfterstufe (hier: 2)."],
        ],
      },
      {
        title: "Bang-&-Olufsen-Audio/Video",
        image: IMG + "08-apple-tv-telecommande.png",
        image2: IMG + "09-lecteur-media.png",
        text: "Sieben Räume (Wohnzimmer, Esszimmer, Küche, Hauptschlafzimmer, TV-Zimmer, Twin- und VIP-Zimmer) sind mit B&O-Audio/Video ausgestattet. Die Videoquellen sind verriegelt; der erste Tipp aktiviert die Quelle und öffnet ihre Fernbedienung (abgebildet: Apple TV im TV-Zimmer). MUSIK schickt die Musik auf die Lautsprecher, das Video bleibt auf dem Bildschirm, und öffnet den Medienplayer.",
        buttons: [
          ["APPLE TV · SKY Q · SWISSCOM · IPTV", "Videoquellen, nur eine aktiv; ein Abzeichen zeigt die Quelle auf den Lautsprechern."],
          ["MUSIK", "Unabhängige Audioquelle; ein erneuter Tipp auf eine Videoquelle fragt, ob die Musik bleiben oder der Videoton zurückkehren soll."],
          ["Menü · Kreuz · OK", "Apple-TV-Fernbedienung (Siri Remote)."],
          ["Zurück · Wiedergabe / Pause · Weiter", "Medienplayer mit Titel, Interpret, Album und Fortschritt."],
          ["Lautstärke · Stumm · Ausschalten", "Raumlautstärke, Stummschaltung, Ausschalten aller Quellen des Raums."],
        ],
      },
      {
        title: "Globale Steuerung",
        image: IMG + "10-controle-global.png",
        text: "Gruppenbefehle für die ganze Wohnung: Beleuchtung, Klima, Motoren und Ferienmodus. Pro Bereich ist nur eine Taste grün, die anderen bleiben grau, mit denselben Beschriftungen auf Wandpanel, Tablet und Smartphone.",
        buttons: [
          ["ALLES EIN · ECO · ALLES AUS", "Alle Lichtkreise auf 100 %, 30 % oder aus."],
          ["KOMFORT · NACHT · FROSTSCHUTZ", "Sollwert aller klimatisierten Räume."],
          ["ALLE ÖFFNEN · ALLE SCHLIESSEN", "Alle Antriebe der Wohnung."],
          ["AKTIVIEREN / DEAKTIVIEREN (Ferien)", "Schaltet den Alarm scharf, das Licht aus, schliesst die Vorhänge und stellt das Klima auf Frostschutz."],
          ["Einstellung (jede Karte)", "Preset-Konfiguration: je Raum die einbezogenen Kreise oder Motoren und ihre Stufe."],
        ],
      },
      {
        title: "Themen und Tablet",
        image: IMG + "11-theme-clair.png",
        image2: IMG + "13-tablette-chambre-twin.png",
        text: "Drei Gestaltungen derselben Oberfläche: Premium dunkel, Elegant hell (abgebildet) und Milchglas. Auf dem 11\"-iPad (rechts, Twin-Zimmer in der Szene NACHT) ist die Seite identisch mit dem Wandpanel TSW-1070: eine GUI, ein Signalvertrag.",
        buttons: [],
      },
      {
        title: "Smartphone-Version",
        image: IMG + "14-iphone-eclairages.png",
        image2: IMG + "17-iphone-apple-tv.png",
        portrait: true,
        text: "Auf dem Smartphone gliedert sich die Oberfläche in drei Reiter: Beleuchtung (Szenen, Kreise, Motoren), HVAC und Quelle. Der aktive Raum wird in der Auswahlliste gewählt; Alarm, Kameras und Global bleiben oben erreichbar. Abgebildet: das Hauptschlafzimmer in der Szene ABEND, dann die beim ersten Tipp auf die Quelle geöffnete Apple-TV-Fernbedienung.",
        buttons: [
          ["Aktiver Raum", "Auswahlliste der 17 Zonen."],
          ["Kreise (Einstellung)", "Öffnet das Fenster Kreise: ein Regler je Kreis, Szenen unten (Scrollen auf dem Smartphone erlaubt)."],
          ["Motoren", "Befehle je Familie, zwei Familien pro Seite."],
          ["Reiter unten", "Beleuchtung, HVAC (Betrieb, Sollwert, Lüfter), Quelle (Quellen, Lautstärke, Stumm, Ausschalten)."],
        ],
      },
    ],
  },
};
