// Fiche détaillée « Appartement Eaux-Vives » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/appartement-eaux-vives/
// (iPhone en portrait pour les écrans 01-07, iPad pour 08-09).
const IMG = "/sheets/appartement-eaux-vives/";

export default {
  fr: {
    intro:
      "Appartement de 124 m² aux Eaux-Vives, piloté au quotidien depuis l'iPhone ; la même interface tourne sur l'iPad, la dalle Crestron et le smartphone Android. Cinq onglets — Pièces, Scènes, Climat, Stores, Énergie — regroupent toute l'installation. Sur smartphone, ils forment la barre d'onglets du bas ; sur tablette et dalle, un rail vertical à gauche. L'interface est traduite en français, anglais et allemand.",
    sections: [
      {
        title: "Pièces",
        image: IMG + "01-pieces.png",
        portrait: true,
        text:
          "L'écran d'accueil : l'en-tête résume l'appartement (surface, nombre de lumières allumées) et la présence ; les six pièces s'affichent en tuiles, la pièce sélectionnée se détaille en dessous avec ses trois commandes.",
        buttons: [
          ["Présent / Absent", "Bascule la présence. En vert « Présent » ; en orange « Absent », l'ensemble de l'interface passe alors sur un fond légèrement grisé."],
          ["Tuiles des pièces (Salon, Cuisine, Chambre, Bureau, Salle de bain, Chambre enfant)", "Un appui sélectionne la pièce (cadre noir) et affiche son panneau de réglage. Chaque tuile montre le niveau d'éclairage, la température mesurée et la position du store ; le point vert signale une présence détectée ; la tuile se teinte de jaune pâle quand une lumière est allumée."],
          ["Curseur Lumières", "Niveau d'éclairage de la pièce de 0 à 100 % ; la valeur s'affiche à droite en temps réel."],
          ["Arrêt · 40 % · 100 %", "Préréglages d'éclairage : extinction, niveau 40 % ou pleine puissance."],
          ["− / + (Consigne)", "Baisse ou monte la consigne de chauffage par pas de 0,5 °C, entre 16 et 26 °C ; la température mesurée reste affichée en dessous."],
          ["Curseur Stores", "Position du store de la pièce, 0 % ouvert à 100 % fermé."],
          ["⌃ Ouvrir / ⌄ Fermer", "Envoie le store en position 0 % (ouvert) ou 100 % (fermé)."],
          ["Pièces · Scènes · Climat · Stores · Énergie", "Barre d'onglets : l'onglet actif s'affiche en noir."],
        ],
      },
      {
        title: "Scènes de vie",
        image: IMG + "02-scenes.png",
        portrait: true,
        text:
          "Sept scènes, chacune avec sa couleur et son icône. Sous la grille, le programme hebdomadaire liste les scènes planifiées avec l'heure, les jours et leur activation, et annonce le prochain changement.",
        buttons: [
          ["Réveil · Départ · Retour · Soirée · Cinéma · Nuit · Invités", "Lance la scène : les lumières de chaque pièce, la position des stores et la consigne sont réglées selon la scène. La carte active prend un contour de sa couleur et affiche « Activée » ; les autres montrent leur heure programmée ou « Activer ». Départ passe la présence sur Absent, Réveil et Retour la repassent sur Présent."],
          ["🕒 (coin de chaque scène)", "Ouvre / ferme l'édition de la ligne correspondante dans le programme hebdomadaire."],
          ["Prochain changement", "Indique la prochaine scène planifiée du jour, calculée à partir de l'heure et des jours actifs."],
          ["Interrupteur (par ligne)", "Active ou désactive la scène planifiée ; désactivée, la ligne apparaît grisée et n'est plus prise en compte."],
          ["Modifier", "Passe la ligne en mode édition (voir ci-dessous)."],
        ],
      },
      {
        title: "Édition du programme",
        image: IMG + "03-planning-edition.png",
        portrait: true,
        text: "En mode édition, la ligne prend un contour de la couleur de la scène et libère l'heure et les jours.",
        buttons: [
          ["− / + (heure)", "Décale l'heure de déclenchement de 15 minutes en arrière ou en avant."],
          ["L M M J V S D", "Chaque jour de la semaine se coche ou se décoche ; les jours actifs sont remplis de la couleur de la scène. Hors édition, ces boutons sont verrouillés."],
          ["Interrupteur", "Active ou désactive la scène planifiée."],
          ["✓", "Termine l'édition et referme la ligne."],
        ],
      },
      {
        title: "Climat",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "Mode général de la pompe à chaleur, puis une carte par zone avec la température mesurée, l'humidité, la barre de consigne et son réglage.",
        buttons: [
          ["Auto · Chauffage · Rafraîchissement · Éco · Arrêt", "Mode de la pompe à chaleur ; le mode choisi s'affiche en noir. En Arrêt, la consommation de la pompe tombe à 0 kW sur la page Énergie."],
          ["Barre de température", "Le curseur blanc marque la température mesurée, la zone grisée la consigne, sur une échelle de 16 à 26 °C."],
          ["− / + (par zone)", "Consigne de la zone par pas de 0,5 °C, entre 16 et 26 °C."],
        ],
      },
      {
        title: "Stores",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Commande groupée de tous les stores, puis une carte par pièce avec un visuel des lamelles qui reflète la position et l'orientation.",
        buttons: [
          ["⌃ Ouvrir · 50 % · ⌄ Fermer (Tous les stores)", "Tous les stores de l'appartement à 0 %, à mi-hauteur (lamelles à 45°) ou à 100 %."],
          ["Curseur Position", "Hauteur du store de la pièce, 0 à 100 % ; les lamelles descendent dans le visuel."],
          ["Curseur Orientation", "Inclinaison des lamelles de 0 à 90° ; le visuel bascule les lamelles en conséquence."],
        ],
      },
      {
        title: "Énergie",
        image: IMG + "06-energie.png",
        portrait: true,
        text: "Flux d'énergie en temps réel (solaire, consommation, réseau, batterie), courbe de la journée et taux d'autoconsommation. Les valeurs se rafraîchissent toutes les 4 secondes.",
        buttons: [
          ["Production solaire · Consommation · Réseau · Batterie", "Indicateurs sans action : puissance solaire selon l'heure, consommation de l'appartement (dépend des lumières allumées et du mode climat), soutirage (+) ou injection (−) réseau, charge de la batterie."],
          ["Aujourd'hui", "Histogramme sur 24 h : production solaire en jaune, consommation en gris."],
          ["Autoconsommation", "Anneau du pourcentage d'énergie solaire consommée sur place ; en dessous, la puissance de la pompe à chaleur et de la recharge de la voiture (3,6 kW quand Présent, 0 quand Absent)."],
        ],
      },
      {
        title: "Scène Départ — mode Absent",
        image: IMG + "07-scene-depart-absent.png",
        portrait: true,
        text: "Après un appui sur Départ : toutes les lumières sont éteintes, les stores à 40 %, la consigne à 18,5 °C et la présence passe sur « Absent » (badge orange, fond grisé).",
        buttons: [
          ["Départ", "Scène active, signalée « Activée » avec son contour gris."],
          ["Absent", "Un nouvel appui remet la présence sur « Présent »."],
        ],
      },
      {
        title: "Version iPad / dalle — Pièces",
        image: IMG + "08-tablette-pieces.png",
        text: "Sur tablette et dalle Crestron, le rail de navigation passe à gauche et les six pièces s'affichent sur trois colonnes, les trois commandes de la pièce sur une ligne. Un bouton « Tout éteindre » s'ajoute dans l'en-tête.",
        buttons: [
          ["Rail Pièces · Scènes · Climat · Stores · Énergie", "Mêmes onglets que sur le smartphone ; l'onglet actif est sur fond noir."],
          ["⏻ Tout éteindre", "Lance la scène Départ : toutes les lumières éteintes, stores à 40 %, consigne 18,5 °C, présence sur Absent."],
        ],
      },
      {
        title: "Version iPad / dalle — Scènes",
        image: IMG + "09-tablette-scenes.png",
        text: "Les sept scènes sur quatre colonnes, et le programme hebdomadaire sur une ligne par scène : heure, nom, jours, interrupteur et bouton Modifier.",
        buttons: [
          ["Scènes et programme", "Fonctionnement identique à la version smartphone."],
        ],
      },
    ],
  },

  en: {
    intro:
      "A 124 m² apartment in Eaux-Vives, run every day from the iPhone; the same interface runs on the iPad, the Crestron panel and the Android phone. Five tabs — Rooms, Scenes, Climate, Blinds, Energy — cover the whole installation. On the phone they form the bottom tab bar; on tablet and panel, a vertical rail on the left. The interface is translated into French, English and German.",
    sections: [
      {
        title: "Rooms",
        image: IMG + "01-pieces.png",
        portrait: true,
        text: "The home screen: the header sums up the apartment (area, number of lights on) and presence; the six rooms appear as tiles, and the selected room is detailed below with its three controls.",
        buttons: [
          ["Home / Away", "Toggles presence. Green “Home”; orange “Away”, and the whole interface then switches to a slightly greyed background."],
          ["Room tiles (Living room, Kitchen, Bedroom, Office, Bathroom, Kids' room)", "One tap selects the room (black outline) and shows its control panel. Each tile shows the light level, measured temperature and blind position; the green dot marks detected presence; the tile turns pale yellow when a light is on."],
          ["Lights slider", "Room light level from 0 to 100 %; the value on the right updates live."],
          ["Off · 40 % · 100 %", "Lighting presets: off, 40 % or full."],
          ["− / + (Setpoint)", "Lowers or raises the heating setpoint by 0.5 °C, between 16 and 26 °C; the measured temperature stays displayed below."],
          ["Blinds slider", "Blind position of the room, 0 % open to 100 % closed."],
          ["⌃ Open / ⌄ Close", "Sends the blind to 0 % (open) or 100 % (closed)."],
          ["Rooms · Scenes · Climate · Blinds · Energy", "Tab bar: the active tab is shown in black."],
        ],
      },
      {
        title: "Living scenes",
        image: IMG + "02-scenes.png",
        portrait: true,
        text: "Seven scenes, each with its colour and icon. Below the grid, the weekly programme lists the scheduled scenes with time, days and on/off state, and announces the next change.",
        buttons: [
          ["Wake up · Leave · Back home · Evening · Movie · Night · Guests", "Runs the scene: each room's lights, the blind position and the setpoint are set according to the scene. The active card takes an outline in its colour and shows “Active”; the others show their scheduled time or “Activate”. Leave sets presence to Away, Wake up and Back home set it to Home."],
          ["🕒 (corner of each scene)", "Opens / closes editing of the matching row in the weekly programme."],
          ["Next change", "Shows the next scheduled scene of the day, computed from time and active days."],
          ["Switch (per row)", "Enables or disables the scheduled scene; when disabled the row is greyed out and ignored."],
          ["Edit", "Puts the row into edit mode (see below)."],
        ],
      },
      {
        title: "Programme editing",
        image: IMG + "03-planning-edition.png",
        portrait: true,
        text: "In edit mode the row takes an outline in the scene colour and unlocks the time and the days.",
        buttons: [
          ["− / + (time)", "Shifts the trigger time 15 minutes earlier or later."],
          ["M T W T F S S", "Each weekday can be checked or unchecked; active days are filled with the scene colour. Outside edit mode these buttons are locked."],
          ["Switch", "Enables or disables the scheduled scene."],
          ["✓", "Ends editing and closes the row."],
        ],
      },
      {
        title: "Climate",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "General heat-pump mode, then one card per zone with measured temperature, humidity, the setpoint bar and its adjustment.",
        buttons: [
          ["Auto · Heating · Cooling · Eco · Off", "Heat-pump mode; the chosen mode is shown in black. In Off, the heat-pump consumption drops to 0 kW on the Energy page."],
          ["Temperature bar", "The white marker shows the measured temperature, the grey area the setpoint, on a 16–26 °C scale."],
          ["− / + (per zone)", "Zone setpoint in 0.5 °C steps, between 16 and 26 °C."],
        ],
      },
      {
        title: "Blinds",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Group command for all blinds, then one card per room with a slat visual reflecting position and tilt.",
        buttons: [
          ["⌃ Open · 50 % · ⌄ Close (All blinds)", "Every blind of the apartment to 0 %, half way (slats at 45°) or 100 %."],
          ["Position slider", "Blind height of the room, 0 to 100 %; the slats drop in the visual."],
          ["Tilt slider", "Slat angle from 0 to 90°; the visual tilts the slats accordingly."],
        ],
      },
      {
        title: "Energy",
        image: IMG + "06-energie.png",
        portrait: true,
        text: "Live energy flow (solar, consumption, grid, battery), the day's curve and the self-consumption rate. Values refresh every 4 seconds.",
        buttons: [
          ["Solar production · Consumption · Grid · Battery", "Read-only indicators: solar power according to the time of day, apartment consumption (depends on lights on and climate mode), grid import (+) or export (−), battery charge."],
          ["Today", "24-hour histogram: solar production in yellow, consumption in grey."],
          ["Self-consumption", "Ring showing the share of solar energy used on site; below, the heat-pump power and car charging (3.6 kW when Home, 0 when Away)."],
        ],
      },
      {
        title: "Leave scene — Away mode",
        image: IMG + "07-scene-depart-absent.png",
        portrait: true,
        text: "After tapping Leave: all lights off, blinds at 40 %, setpoint 18.5 °C and presence set to “Away” (orange badge, greyed background).",
        buttons: [
          ["Leave", "Active scene, marked “Active” with its grey outline."],
          ["Away", "Another tap sets presence back to “Home”."],
        ],
      },
      {
        title: "iPad / panel version — Rooms",
        image: IMG + "08-tablette-pieces.png",
        text: "On tablet and Crestron panel the navigation rail moves to the left, the six rooms sit on three columns and the three room controls on one line. An “All off” button is added to the header.",
        buttons: [
          ["Rail Rooms · Scenes · Climate · Blinds · Energy", "Same tabs as on the phone; the active tab has a black background."],
          ["⏻ All off", "Runs the Leave scene: all lights off, blinds at 40 %, setpoint 18.5 °C, presence Away."],
        ],
      },
      {
        title: "iPad / panel version — Scenes",
        image: IMG + "09-tablette-scenes.png",
        text: "The seven scenes on four columns, and the weekly programme with one line per scene: time, name, days, switch and Edit button.",
        buttons: [
          ["Scenes and programme", "Same behaviour as the phone version."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Eine 124-m²-Wohnung in Eaux-Vives, täglich vom iPhone aus gesteuert; dieselbe Oberfläche läuft auf dem iPad, dem Crestron-Panel und dem Android-Smartphone. Fünf Reiter — Räume, Szenen, Klima, Storen, Energie — decken die ganze Anlage ab. Auf dem Smartphone bilden sie die untere Tab-Leiste, auf Tablet und Panel eine vertikale Leiste links. Die Oberfläche ist auf Französisch, Englisch und Deutsch übersetzt.",
    sections: [
      {
        title: "Räume",
        image: IMG + "01-pieces.png",
        portrait: true,
        text: "Der Startbildschirm: die Kopfzeile fasst die Wohnung zusammen (Fläche, Anzahl eingeschalteter Lichter) und die Anwesenheit; die sechs Räume erscheinen als Kacheln, der gewählte Raum wird darunter mit seinen drei Bedienelementen detailliert.",
        buttons: [
          ["Zuhause / Abwesend", "Schaltet die Anwesenheit um. Grün «Zuhause»; orange «Abwesend», die ganze Oberfläche wechselt dann auf einen leicht gegrauten Hintergrund."],
          ["Raumkacheln (Wohnzimmer, Küche, Schlafzimmer, Büro, Bad, Kinderzimmer)", "Ein Tipp wählt den Raum (schwarzer Rahmen) und zeigt sein Bedienfeld. Jede Kachel zeigt Lichtniveau, gemessene Temperatur und Storenposition; der grüne Punkt markiert erkannte Anwesenheit; die Kachel färbt sich blassgelb, wenn ein Licht an ist."],
          ["Regler Licht", "Lichtniveau des Raums von 0 bis 100 %; der Wert rechts aktualisiert sich live."],
          ["Aus · 40 % · 100 %", "Lichtvoreinstellungen: aus, 40 % oder volle Leistung."],
          ["− / + (Sollwert)", "Senkt oder erhöht den Heizsollwert in Schritten von 0,5 °C zwischen 16 und 26 °C; die gemessene Temperatur bleibt darunter sichtbar."],
          ["Regler Storen", "Position der Raumstore, 0 % offen bis 100 % geschlossen."],
          ["⌃ Öffnen / ⌄ Schliessen", "Fährt die Store auf 0 % (offen) oder 100 % (geschlossen)."],
          ["Räume · Szenen · Klima · Storen · Energie", "Tab-Leiste: der aktive Reiter wird schwarz dargestellt."],
        ],
      },
      {
        title: "Wohnszenen",
        image: IMG + "02-scenes.png",
        portrait: true,
        text: "Sieben Szenen, jede mit Farbe und Symbol. Unter dem Raster listet das Wochenprogramm die geplanten Szenen mit Uhrzeit, Tagen und Aktivierung und kündigt die nächste Änderung an.",
        buttons: [
          ["Aufstehen · Verlassen · Zurück · Abend · Kino · Nacht · Gäste", "Startet die Szene: Licht jedes Raums, Storenposition und Sollwert werden gemäss der Szene gesetzt. Die aktive Karte erhält einen Rahmen in ihrer Farbe und zeigt «Aktiv»; die anderen zeigen ihre geplante Uhrzeit oder «Aktivieren». Verlassen setzt die Anwesenheit auf Abwesend, Aufstehen und Zurück auf Zuhause."],
          ["🕒 (Ecke jeder Szene)", "Öffnet / schliesst die Bearbeitung der entsprechenden Zeile im Wochenprogramm."],
          ["Nächste Änderung", "Zeigt die nächste geplante Szene des Tages, berechnet aus Uhrzeit und aktiven Tagen."],
          ["Schalter (je Zeile)", "Aktiviert oder deaktiviert die geplante Szene; deaktiviert erscheint die Zeile grau und wird ignoriert."],
          ["Bearbeiten", "Versetzt die Zeile in den Bearbeitungsmodus (siehe unten)."],
        ],
      },
      {
        title: "Programm bearbeiten",
        image: IMG + "03-planning-edition.png",
        portrait: true,
        text: "Im Bearbeitungsmodus erhält die Zeile einen Rahmen in der Szenenfarbe und gibt Uhrzeit und Tage frei.",
        buttons: [
          ["− / + (Uhrzeit)", "Verschiebt die Auslösezeit um 15 Minuten nach vorn oder hinten."],
          ["M D M D F S S", "Jeder Wochentag lässt sich an- oder abwählen; aktive Tage sind in der Szenenfarbe gefüllt. Ausserhalb der Bearbeitung sind diese Tasten gesperrt."],
          ["Schalter", "Aktiviert oder deaktiviert die geplante Szene."],
          ["✓", "Beendet die Bearbeitung und schliesst die Zeile."],
        ],
      },
      {
        title: "Klima",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "Allgemeiner Modus der Wärmepumpe, dann eine Karte pro Zone mit gemessener Temperatur, Feuchte, Sollwertbalken und Einstellung.",
        buttons: [
          ["Auto · Heizen · Kühlen · Eco · Aus", "Modus der Wärmepumpe; der gewählte Modus wird schwarz dargestellt. Bei Aus fällt der Verbrauch der Wärmepumpe auf der Seite Energie auf 0 kW."],
          ["Temperaturbalken", "Die weisse Marke zeigt die gemessene Temperatur, der graue Bereich den Sollwert, auf einer Skala von 16 bis 26 °C."],
          ["− / + (je Zone)", "Sollwert der Zone in Schritten von 0,5 °C zwischen 16 und 26 °C."],
        ],
      },
      {
        title: "Storen",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Gruppenbefehl für alle Storen, dann eine Karte pro Raum mit einer Lamellengrafik, die Position und Winkel widerspiegelt.",
        buttons: [
          ["⌃ Öffnen · 50 % · ⌄ Schliessen (Alle Storen)", "Alle Storen der Wohnung auf 0 %, halbe Höhe (Lamellen 45°) oder 100 %."],
          ["Regler Position", "Höhe der Raumstore, 0 bis 100 %; die Lamellen senken sich in der Grafik."],
          ["Regler Lamellen", "Lamellenwinkel von 0 bis 90°; die Grafik kippt die Lamellen entsprechend."],
        ],
      },
      {
        title: "Energie",
        image: IMG + "06-energie.png",
        portrait: true,
        text: "Energiefluss in Echtzeit (Solar, Verbrauch, Netz, Batterie), Tageskurve und Eigenverbrauchsquote. Die Werte aktualisieren sich alle 4 Sekunden.",
        buttons: [
          ["Solarproduktion · Verbrauch · Netz · Batterie", "Anzeigen ohne Aktion: Solarleistung je nach Tageszeit, Verbrauch der Wohnung (abhängig von eingeschalteten Lichtern und Klimamodus), Netzbezug (+) oder Einspeisung (−), Batterieladung."],
          ["Heute", "24-Stunden-Histogramm: Solarproduktion gelb, Verbrauch grau."],
          ["Eigenverbrauch", "Ring mit dem Anteil vor Ort genutzter Solarenergie; darunter die Leistung der Wärmepumpe und der Autoladung (3,6 kW bei Zuhause, 0 bei Abwesend)."],
        ],
      },
      {
        title: "Szene Verlassen — Modus Abwesend",
        image: IMG + "07-scene-depart-absent.png",
        portrait: true,
        text: "Nach einem Tipp auf Verlassen: alle Lichter aus, Storen auf 40 %, Sollwert 18,5 °C und Anwesenheit auf «Abwesend» (oranges Abzeichen, gegrauter Hintergrund).",
        buttons: [
          ["Verlassen", "Aktive Szene, als «Aktiv» mit grauem Rahmen markiert."],
          ["Abwesend", "Ein weiterer Tipp setzt die Anwesenheit zurück auf «Zuhause»."],
        ],
      },
      {
        title: "iPad-/Panel-Version — Räume",
        image: IMG + "08-tablette-pieces.png",
        text: "Auf Tablet und Crestron-Panel wandert die Navigationsleiste nach links, die sechs Räume liegen auf drei Spalten und die drei Raumbedienelemente auf einer Zeile. In der Kopfzeile kommt die Taste «Alles aus» hinzu.",
        buttons: [
          ["Leiste Räume · Szenen · Klima · Storen · Energie", "Dieselben Reiter wie auf dem Smartphone; der aktive Reiter hat schwarzen Hintergrund."],
          ["⏻ Alles aus", "Startet die Szene Verlassen: alle Lichter aus, Storen auf 40 %, Sollwert 18,5 °C, Anwesenheit Abwesend."],
        ],
      },
      {
        title: "iPad-/Panel-Version — Szenen",
        image: IMG + "09-tablette-scenes.png",
        text: "Die sieben Szenen auf vier Spalten und das Wochenprogramm mit einer Zeile pro Szene: Uhrzeit, Name, Tage, Schalter und Taste Bearbeiten.",
        buttons: [
          ["Szenen und Programm", "Gleiches Verhalten wie in der Smartphone-Version."],
        ],
      },
    ],
  },
};
