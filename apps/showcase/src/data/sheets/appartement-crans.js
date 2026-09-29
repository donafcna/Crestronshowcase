// Fiche détaillée « Appartement Crans-Montana » — interface Connect du Core (v5.4, 29.09.2026) :
// chaque écran avec capture et explication de chaque commande. Captures : public/sheets/appartement-crans/
// (scripts/shoot-appartement-crans.cjs sur .device-screen des routes dalle / tablette / smartphone,
// puis scripts/helpers/png-1400-256.py : 1400 px, 256 couleurs).
const IMG = "/sheets/appartement-crans/";

export default {
  fr: {
    intro:
      "Duplex de 350 m² sur deux niveaux, 17 zones, entièrement consacré à la lumière, aux rideaux et au climat. L'interface adopte un style d'application résidentielle épurée : liste des pièces, tuiles d'éclairage que l'on glisse du doigt, ambiances en pastilles et barre d'onglets en bas. Elle reste une GUI CH5 issue du Core Villa Crans : même contrat de signaux, mêmes programmes ; seul le fichier de configuration JSON change. Les niveaux de chaque ambiance reprennent la séquence d'opérations de l'éclairagiste, et chaque état affiché est celui confirmé par le processeur.",
    sections: [
      {
        title: "Pièces et ambiances",
        image: IMG + "01-pieces-salon.png",
        image2: IMG + "02-ambiance-suite.png",
        text: "La colonne de gauche liste les 17 zones par niveau, avec le nombre de circuits de chacune et, pour la pièce affichée, les éclairages allumés. À droite : les ambiances de la pièce puis une tuile par circuit. Ci-contre le Salon en ambiance JOUR, puis la Suite parentale en SOIR : chaque tuile se remplit à son niveau réel.",
        buttons: [
          ["Liste des pièces", "Un appui affiche la pièce ; toutes les commandes se recalculent pour elle."],
          ["OFF · JOUR · SOIR · NUIT", "Rappel des quatre ambiances de la pièce ; la pastille active est pleine."],
          ["Sous-titre", "Niveau de la pièce et nombre d'éclairages allumés, mis à jour en direct."],
        ],
      },
      {
        title: "Tuiles d'éclairage",
        image: IMG + "03-bain-onze-circuits.png",
        text: "La salle de bains de la salle TV est la zone la plus équipée : onze circuits, tous visibles sans fenêtre supplémentaire (thème Sombre ci-contre). La hauteur dorée de chaque tuile indique le niveau ; un réglage manuel désélectionne l'ambiance en cours.",
        buttons: [
          ["Glisser verticalement", "Règle le niveau du circuit de 0 à 100 %."],
          ["Appui court", "Allume à 100 % un circuit éteint, éteint un circuit allumé."],
        ],
      },
      {
        title: "Rideaux, voilages et climat de la pièce",
        image: IMG + "04-stores-climat-salon.png",
        text: "Sous l'éclairage, la pièce regroupe ses motorisations et sa régulation : positions préenregistrées, commandes de chaque rideau ou voilage, température mesurée et consigne.",
        buttons: [
          ["Tout ouvrir · Position été · Position hiver · Tout fermer", "Positions de l'ensemble des motorisations de la pièce."],
          ["Monter · Arrêt · Descendre", "Commande d'une motorisation ; le processeur gère la course."],
          ["− / +", "Consigne de 16 à 28 °C par pas de 0,5 °C."],
        ],
      },
      {
        title: "Onglets Stores et Climat",
        image: IMG + "05-onglet-stores.png",
        image2: IMG + "06-onglet-climat.png",
        text: "L'onglet Stores rassemble toutes les motorisations de l'appartement, pièce par pièce ; une commande sur une autre pièce la sélectionne d'abord. L'onglet Climat affiche la régulation de la pièce choisie dans la rangée de pastilles.",
        buttons: [
          ["Pastilles de pièces (Climat)", "Choix de la pièce régulée."],
          ["Marche · Arrêt", "Mise en service de la régulation de la pièce."],
          ["Auto · 1 · 2 · 3", "Vitesse de ventilation."],
        ],
      },
      {
        title: "Scènes globales",
        image: IMG + "07-scenes-globales.png",
        text: "L'onglet Scènes agit sur tout l'appartement : éclairage, stores et climat. La carte active est entourée ; ici le mode Confort.",
        buttons: [
          ["Tout allumer · Éclairage doux · Tout éteindre", "Toutes les pièces à la fois."],
          ["Ouvrir · Position intermédiaire · Fermer les stores", "Toutes les motorisations."],
          ["Confort · Nuit · Hors-gel", "Consigne commune à toutes les pièces régulées."],
        ],
      },
      {
        title: "Réglages et thèmes",
        image: IMG + "08-reglages.png",
        image2: IMG + "09-theme-verre.png",
        text: "Trois thèmes : Clair (par défaut), Sombre et Verre dépoli (ci-contre, la Chambre VIP), et trois langues. Tous les textes restent lisibles (contraste au moins 4:1) dans chaque thème.",
        buttons: [
          ["Clair · Sombre · Verre dépoli", "Change le thème de l'écran."],
          ["Français · English · Deutsch", "Langue de l'interface et des noms de pièces."],
        ],
      },
      {
        title: "Version tablette",
        image: IMG + "10-tablette-chambre-twin.png",
        text: "Sur iPad, la même organisation se resserre : colonne des pièces plus étroite, tuiles et motorisations sur moins de colonnes. Ci-contre la Chambre Twin en ambiance JOUR.",
        buttons: [],
      },
      {
        title: "Version smartphone",
        image: IMG + "11-iphone-pieces.png",
        image2: IMG + "12-iphone-salon.png",
        portrait: true,
        text: "Sur smartphone, l'onglet Pièces ouvre d'abord la liste ; un appui affiche la pièce en plein écran, avec un retour vers la liste. Tuiles sur deux colonnes, mêmes onglets en bas.",
        buttons: [
          ["‹ Pièces", "Retour à la liste des pièces."],
          ["Onglets bas", "Pièces, Scènes, Stores, Climat, Réglages."],
        ],
      },
    ],
  },
  en: {
    intro:
      "A 350 m² duplex on two levels, 17 zones, dedicated to lighting, curtains and climate. The interface follows a clean residential app style: room list, lighting tiles you drag with a finger, scenes as pills and a bottom tab bar. It remains a CH5 GUI built on the Villa Crans Core: same signal contract, same programs; only the JSON configuration file changes. Every scene level comes from the lighting designer's sequence of operations, and every state shown is the one confirmed by the processor.",
    sections: [
      {
        title: "Rooms and scenes",
        image: IMG + "01-pieces-salon.png",
        image2: IMG + "02-ambiance-suite.png",
        text: "The left column lists the 17 zones by level, with each room's circuit count and, for the room shown, the lights that are on. On the right: the room's scenes, then one tile per circuit. Shown: the Living room in DAY, then the Master suite in EVENING; each tile fills to its actual level.",
        buttons: [
          ["Room list", "A tap shows the room; every control is recalculated for it."],
          ["OFF · DAY · EVENING · NIGHT", "Recalls the room's four scenes; the active pill is filled."],
          ["Subtitle", "Room level and number of lights on, updated live."],
        ],
      },
      {
        title: "Lighting tiles",
        image: IMG + "03-bain-onze-circuits.png",
        text: "The TV room bathroom is the most equipped zone: eleven circuits, all visible without an extra window (Dark theme shown). The golden height of each tile shows the level; a manual change deselects the current scene.",
        buttons: [
          ["Drag vertically", "Sets the circuit level from 0 to 100%."],
          ["Short tap", "Turns an off circuit on at 100%, turns a lit circuit off."],
        ],
      },
      {
        title: "Room curtains, sheers and climate",
        image: IMG + "04-stores-climat-salon.png",
        text: "Below the lighting, the room groups its motorised treatments and its climate control: preset positions, individual curtain and sheer commands, measured temperature and setpoint.",
        buttons: [
          ["Open all · Summer position · Winter position · Close all", "Positions for all of the room's motors."],
          ["Raise · Stop · Lower", "Controls one motor; the processor handles the travel."],
          ["− / +", "Setpoint from 16 to 28 °C in 0.5 °C steps."],
        ],
      },
      {
        title: "Shades and Climate tabs",
        image: IMG + "05-onglet-stores.png",
        image2: IMG + "06-onglet-climat.png",
        text: "The Shades tab gathers every motor in the apartment, room by room; a command in another room selects it first. The Climate tab shows the control of the room chosen in the row of pills.",
        buttons: [
          ["Room pills (Climate)", "Chooses the controlled room."],
          ["On · Off", "Switches the room's climate control."],
          ["Auto · 1 · 2 · 3", "Fan speed."],
        ],
      },
      {
        title: "Whole-home scenes",
        image: IMG + "07-scenes-globales.png",
        text: "The Scenes tab acts on the whole apartment: lighting, shades and climate. The active card is outlined; here Comfort mode.",
        buttons: [
          ["All lights on · Soft lighting · All lights off", "Every room at once."],
          ["Open · Mid position · Close all shades", "Every motor."],
          ["Comfort · Night · Frost protection", "Common setpoint for every controlled room."],
        ],
      },
      {
        title: "Settings and themes",
        image: IMG + "08-reglages.png",
        image2: IMG + "09-theme-verre.png",
        text: "Three themes: Light (default), Dark and Frosted glass (shown, the VIP bedroom), and three languages. All text stays readable (contrast of at least 4:1) in every theme.",
        buttons: [
          ["Light · Dark · Frosted glass", "Changes the screen theme."],
          ["Français · English · Deutsch", "Interface and room name language."],
        ],
      },
      {
        title: "Tablet version",
        image: IMG + "10-tablette-chambre-twin.png",
        text: "On iPad the same layout tightens: narrower room column, tiles and motors on fewer columns. Shown: the Twin bedroom in DAY.",
        buttons: [],
      },
      {
        title: "Smartphone version",
        image: IMG + "11-iphone-pieces.png",
        image2: IMG + "12-iphone-salon.png",
        portrait: true,
        text: "On smartphone the Rooms tab opens the list first; a tap shows the room full screen, with a way back to the list. Tiles on two columns, same bottom tabs.",
        buttons: [
          ["‹ Rooms", "Back to the room list."],
          ["Bottom tabs", "Rooms, Scenes, Shades, Climate, Settings."],
        ],
      },
    ],
  },
  de: {
    intro:
      "Duplex mit 350 m² auf zwei Ebenen, 17 Zonen, ganz auf Licht, Vorhänge und Klima ausgerichtet. Die Oberfläche folgt dem Stil einer schlichten Wohn-App: Raumliste, Lichtkacheln, die man mit dem Finger zieht, Stimmungen als Schaltflächen und eine Registerleiste unten. Sie bleibt eine CH5-GUI auf Basis des Villa-Crans-Core: gleicher Signalvertrag, gleiche Programme; nur die JSON-Konfigurationsdatei ändert sich. Die Stufen jeder Stimmung stammen aus der Betriebssequenz des Lichtplaners, und jeder angezeigte Zustand ist der vom Prozessor bestätigte.",
    sections: [
      {
        title: "Räume und Stimmungen",
        image: IMG + "01-pieces-salon.png",
        image2: IMG + "02-ambiance-suite.png",
        text: "Die linke Spalte listet die 17 Zonen nach Ebene, mit der Anzahl Stromkreise jedes Raums und, für den angezeigten Raum, den eingeschalteten Leuchten. Rechts: die Stimmungen des Raums, dann eine Kachel pro Stromkreis. Gezeigt: das Wohnzimmer in TAG, dann die Master-Suite in ABEND; jede Kachel füllt sich bis zur tatsächlichen Stufe.",
        buttons: [
          ["Raumliste", "Ein Tippen zeigt den Raum; alle Bedienelemente werden für ihn neu berechnet."],
          ["AUS · TAG · ABEND · NACHT", "Ruft die vier Stimmungen des Raums ab; die aktive Schaltfläche ist gefüllt."],
          ["Untertitel", "Ebene des Raums und Anzahl eingeschalteter Leuchten, live aktualisiert."],
        ],
      },
      {
        title: "Lichtkacheln",
        image: IMG + "03-bain-onze-circuits.png",
        text: "Das Bad des TV-Raums ist die am besten ausgestattete Zone: elf Stromkreise, alle ohne zusätzliches Fenster sichtbar (Design Dunkel). Die goldene Höhe jeder Kachel zeigt die Stufe; eine manuelle Änderung hebt die aktuelle Stimmung auf.",
        buttons: [
          ["Senkrecht ziehen", "Stellt die Stufe des Stromkreises von 0 bis 100 % ein."],
          ["Kurz tippen", "Schaltet einen ausgeschalteten Stromkreis auf 100 %, einen eingeschalteten aus."],
        ],
      },
      {
        title: "Vorhänge, Stores und Klima des Raums",
        image: IMG + "04-stores-climat-salon.png",
        text: "Unter der Beleuchtung fasst der Raum seine Motorisierungen und seine Regelung zusammen: gespeicherte Positionen, Befehle für jeden Vorhang und jede Store, gemessene Temperatur und Sollwert.",
        buttons: [
          ["Alles öffnen · Sommerposition · Winterposition · Alles schliessen", "Positionen aller Motoren des Raums."],
          ["Auf · Stopp · Ab", "Steuert einen Motor; der Prozessor verwaltet den Lauf."],
          ["− / +", "Sollwert von 16 bis 28 °C in Schritten von 0,5 °C."],
        ],
      },
      {
        title: "Register Storen und Klima",
        image: IMG + "05-onglet-stores.png",
        image2: IMG + "06-onglet-climat.png",
        text: "Das Register Storen vereint alle Motoren der Wohnung, Raum für Raum; ein Befehl in einem anderen Raum wählt diesen zuerst aus. Das Register Klima zeigt die Regelung des in der Reihe gewählten Raums.",
        buttons: [
          ["Raum-Schaltflächen (Klima)", "Wahl des geregelten Raums."],
          ["Ein · Aus", "Schaltet die Regelung des Raums."],
          ["Auto · 1 · 2 · 3", "Lüftungsstufe."],
        ],
      },
      {
        title: "Globale Szenen",
        image: IMG + "07-scenes-globales.png",
        text: "Das Register Szenen wirkt auf die ganze Wohnung: Licht, Storen und Klima. Die aktive Karte ist umrandet; hier der Komfortmodus.",
        buttons: [
          ["Alles einschalten · Sanftes Licht · Alles ausschalten", "Alle Räume gleichzeitig."],
          ["Storen öffnen · Zwischenposition · Storen schliessen", "Alle Motoren."],
          ["Komfort · Nacht · Frostschutz", "Gemeinsamer Sollwert für alle geregelten Räume."],
        ],
      },
      {
        title: "Einstellungen und Designs",
        image: IMG + "08-reglages.png",
        image2: IMG + "09-theme-verre.png",
        text: "Drei Designs: Hell (Standard), Dunkel und Milchglas (gezeigt, das VIP-Zimmer), und drei Sprachen. Alle Texte bleiben in jedem Design lesbar (Kontrast mindestens 4:1).",
        buttons: [
          ["Hell · Dunkel · Milchglas", "Ändert das Design des Bildschirms."],
          ["Français · English · Deutsch", "Sprache der Oberfläche und der Raumnamen."],
        ],
      },
      {
        title: "Tablet-Version",
        image: IMG + "10-tablette-chambre-twin.png",
        text: "Auf dem iPad verdichtet sich dieselbe Anordnung: schmalere Raumspalte, Kacheln und Motoren in weniger Spalten. Gezeigt: das Twin-Zimmer in TAG.",
        buttons: [],
      },
      {
        title: "Smartphone-Version",
        image: IMG + "11-iphone-pieces.png",
        image2: IMG + "12-iphone-salon.png",
        portrait: true,
        text: "Auf dem Smartphone öffnet das Register Räume zuerst die Liste; ein Tippen zeigt den Raum im Vollbild, mit einem Weg zurück zur Liste. Kacheln in zwei Spalten, gleiche Register unten.",
        buttons: [
          ["‹ Räume", "Zurück zur Raumliste."],
          ["Register unten", "Räume, Szenen, Storen, Klima, Einstellungen."],
        ],
      },
    ],
  },
};
