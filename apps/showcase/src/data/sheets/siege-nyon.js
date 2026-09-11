// Fiche détaillée « Siège Lakeside Nyon » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/siege-nyon/
// (dalle TSW-1070 pour 01-06, iPhone en portrait pour 07-08).
const IMG = "/sheets/siege-nyon/";

export default {
  fr: {
    intro:
      "Siège d'entreprise à Nyon : six salles de réunion pilotées depuis les dalles Crestron des couloirs, l'iPad de la réception et le smartphone des collaborateurs. Thème « Atelier clair » : cartes blanches sur gris chaud, accent dégradé bleu → rose, police Outfit. Cinq pages — Accueil, Salles, Présentation, Visio, Agenda — dans la barre du haut, qui devient une barre d'onglets sur smartphone. Toutes les commandes s'appliquent à la salle sélectionnée. L'interface est traduite en français, anglais et allemand.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        text:
          "Tout le bâtiment sur un seul écran : heure, date et météo, nombre de salles libres, puis pour la salle sélectionnée le climat sur cadran dégradé, la réunion en cours, l'éclairage par scène, les stores et l'écran avec ses sources. La bande du bas permet de changer de salle.",
        buttons: [
          ["Accueil · Salles · Présentation · Visio · Agenda", "Barre de navigation ; la page active est sur fond noir."],
          ["− / + (Climat)", "Consigne de la salle par pas de 0,5 °C entre 16 et 26 °C ; l'arc dégradé du cadran et l'indication « Chaud → » ou « Froid → » suivent la consigne."],
          ["Prolonger 30 min", "Sur une salle occupée : repousse la fin de la réunion à 12:00."],
          ["Terminer", "Libère la salle : le badge passe de « Occupée » (rose) à « Libre » (vert)."],
          ["Réserver maintenant", "Sur une salle libre : la passe en « Occupée » pour 30 minutes."],
          ["Curseur Éclairage", "Niveau d'éclairage de la salle, 0 à 100 %."],
          ["Réunion · Présentation · Visioconférence · Nettoyage", "Scènes d'éclairage : Réunion 70 % / stores 30 % ; Présentation 30 % / stores fermés, écran allumé ; Visioconférence 80 % / stores 70 %, écran allumé sur Teams ; Nettoyage 100 % / stores ouverts. La scène active est en bleu."],
          ["⌃ · ■ · ⌄ (Stores)", "Ouvre (0 %), arrête à mi-course (50 %) ou ferme (100 %) les stores de la salle ; la position s'affiche en tête de carte."],
          ["PC portable · Sans fil · Teams · Apple TV", "Sélectionne la source et allume l'écran ; la source active est sur fond noir et nommée en tête de carte."],
          ["🔊 + curseur", "Coupe ou rétablit le son (le curseur retombe à 0 quand le son est coupé) ; le curseur règle le volume de la salle."],
          ["Salles : Léman · Jura · Salève · Dôle · Mont-Blanc · Rhône", "Sélectionne la salle pilotée ; point rose = occupée, vert = libre."],
        ],
      },
      {
        title: "Salles",
        image: IMG + "02-salles.png",
        text: "Vue d'ensemble des six salles avec statut, capacité et équipement, puis le détail de la salle sélectionnée avec réservation rapide.",
        buttons: [
          ["Cartes des salles", "Un appui sélectionne la salle. Chaque carte affiche Libre / Occupée, le nombre de places, les icônes d'équipement (écran, caméra, micro, projecteur) et la réunion en cours ou la prochaine."],
          ["30 min · 1 h · 1 h 30", "Réservation rapide : passe la salle en « Occupée » pour la durée choisie."],
          ["Libérer", "Sur une salle occupée : met fin à la réunion et libère la salle."],
          ["Climat · Éclairage", "Rappel de la température, de la consigne, du niveau d'éclairage et de la position des stores."],
        ],
      },
      {
        title: "Présentation",
        image: IMG + "03-presentation.png",
        text: "Les quatre sources en grandes tuiles avec leur mode de connexion, le volume, les scènes d'éclairage et les stores.",
        buttons: [
          ["PC portable (HDMI · USB-C) · Sans fil (AirMedia · code 4821) · Teams (Teams Rooms) · Apple TV (AirPlay)", "Sélectionne la source et allume l'écran ; la tuile active passe sur fond noir."],
          ["⏻ Démarrer / Arrêter", "Allume ou éteint l'écran ; l'état « Allumé / Éteint » s'affiche en tête de carte."],
          ["Tout éteindre", "Éteint l'écran, coupe la source, raccroche l'appel, éteint l'éclairage, ouvre les stores et libère la salle."],
          ["− / + (Volume)", "Volume par pas de 5 % ; le curseur permet un réglage direct."],
          ["Muet", "Coupe le son (le bouton passe en bleu) ; un nouvel appui ou un mouvement du curseur le rétablit."],
          ["Réunion · Présentation · Visioconférence · Nettoyage", "Mêmes scènes d'éclairage que sur l'accueil."],
          ["⌃ Ouvrir · ⌄ Fermer", "Stores de la salle à 0 % ou 100 %."],
        ],
      },
      {
        title: "Visio",
        image: IMG + "04-visio.png",
        text: "Avant l'appel : la prochaine visioconférence planifiée, la barre d'appel, la caméra PTZ et l'audio.",
        buttons: [
          ["Micro actif / Micro coupé", "Coupe ou rétablit le micro de la salle ; coupé, le bouton apparaît barré."],
          ["Caméra active / Caméra coupée", "Coupe ou rétablit la caméra."],
          ["PC portable", "Partage l'écran du PC : sélectionne la source PC portable et allume l'écran."],
          ["Rejoindre l'appel", "Démarre l'appel et applique la scène Visioconférence (éclairage 80 %, stores 70 %, écran sur Teams)."],
          ["⌃ ⌄ ‹ › (PTZ)", "Orientation manuelle de la caméra ; la position mémorisée n'est alors plus sélectionnée."],
          ["⌂ (centre)", "Retour à la position Large."],
          ["Large · Orateur · Table · Tableau", "Positions mémorisées de la caméra ; la position active est en bleu."],
          ["🔊 + curseur (Audio)", "Coupure du son et volume de la salle."],
          ["Réunion · Visioconférence", "Scènes d'éclairage adaptées à l'appel."],
        ],
      },
      {
        title: "Visio — appel en cours",
        image: IMG + "05-visio-appel.png",
        text: "Pendant l'appel : la mosaïque des six participants avec la vignette de la salle, l'état « Appel en cours · 6 participants » en vert et le bouton Raccrocher en rouge.",
        buttons: [
          ["Raccrocher", "Termine l'appel et revient à l'écran d'attente."],
        ],
      },
      {
        title: "Agenda",
        image: IMG + "06-agenda.png",
        text: "Les réunions du jour dans toutes les salles : horaire, intitulé, salle, nombre de participants et organisateur. La réunion en cours est marquée « En cours ».",
        buttons: [
          ["Libérer (par créneau)", "Supprime la réservation de l'agenda."],
          ["Réserver · <salle> · 17:30", "Ajoute un créneau de 30 minutes à 17:30 dans la salle sélectionnée."],
        ],
      },
      {
        title: "Version iPhone — Accueil",
        image: IMG + "07-iphone-accueil.png",
        portrait: true,
        text: "Sur smartphone, les cartes de l'accueil s'empilent et la navigation passe dans la barre d'onglets du bas.",
        buttons: [
          ["Barre d'onglets", "Accueil, Salles, Présentation, Visio, Agenda."],
          ["Cartes", "Mêmes commandes que sur la dalle : climat, réunion, éclairage, stores, écran."],
        ],
      },
      {
        title: "Version iPhone — Visio",
        image: IMG + "08-iphone-visio.png",
        portrait: true,
        text: "La page Visio sur smartphone : vue d'appel, barre d'appel, caméra PTZ et audio en colonne.",
        buttons: [
          ["Barre d'appel · PTZ · Positions", "Mêmes fonctions que sur la dalle."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Corporate headquarters in Nyon: six meeting rooms controlled from the Crestron corridor panels, the reception iPad and employees' phones. “Light studio” theme: white cards on warm grey, blue → pink gradient accent, Outfit typeface. Five pages — Home, Rooms, Present, Video call, Agenda — in the top bar, which becomes a tab bar on the phone. Every control applies to the selected room. The interface is translated into French, English and German.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        text: "The whole building on one screen: time, date and weather, number of free rooms, then for the selected room the climate on a gradient dial, the current meeting, lighting by scene, shades and the display with its sources. The bottom strip switches room.",
        buttons: [
          ["Home · Rooms · Present · Video call · Agenda", "Navigation bar; the active page has a black background."],
          ["− / + (Climate)", "Room setpoint in 0.5 °C steps between 16 and 26 °C; the gradient arc and the “Heat →” or “Cool →” label follow the setpoint."],
          ["Extend 30 min", "On a busy room: pushes the meeting end to 12:00."],
          ["End", "Releases the room: the badge turns from “Busy” (pink) to “Free” (green)."],
          ["Book now", "On a free room: sets it to “Busy” for 30 minutes."],
          ["Lighting slider", "Room light level, 0 to 100 %."],
          ["Meeting · Presentation · Video call · Cleaning", "Lighting scenes: Meeting 70 % / shades 30 %; Presentation 30 % / shades closed, display on; Video call 80 % / shades 70 %, display on Teams; Cleaning 100 % / shades open. The active scene is blue."],
          ["⌃ · ■ · ⌄ (Shades)", "Opens (0 %), stops mid-way (50 %) or closes (100 %) the room shades; the position is shown in the card header."],
          ["Laptop · Wireless · Teams · Apple TV", "Selects the source and switches the display on; the active source has a black background and is named in the card header."],
          ["🔊 + slider", "Mutes or restores the sound (the slider drops to 0 when muted); the slider sets the room volume."],
          ["Rooms: Léman · Jura · Salève · Dôle · Mont-Blanc · Rhône", "Selects the controlled room; pink dot = busy, green = free."],
        ],
      },
      {
        title: "Rooms",
        image: IMG + "02-salles.png",
        text: "Overview of the six rooms with status, capacity and equipment, then the detail of the selected room with quick booking.",
        buttons: [
          ["Room cards", "One tap selects the room. Each card shows Free / Busy, the number of seats, equipment icons (display, camera, mic, projector) and the current or next meeting."],
          ["30 min · 1 h · 1 h 30", "Quick booking: sets the room to “Busy” for the chosen duration."],
          ["Release", "On a busy room: ends the meeting and frees the room."],
          ["Climate · Lighting", "Reminder of temperature, setpoint, light level and shade position."],
        ],
      },
      {
        title: "Present",
        image: IMG + "03-presentation.png",
        text: "The four sources as large tiles with their connection mode, the volume, lighting scenes and shades.",
        buttons: [
          ["Laptop (HDMI · USB-C) · Wireless (AirMedia · code 4821) · Teams (Teams Rooms) · Apple TV (AirPlay)", "Selects the source and switches the display on; the active tile turns black."],
          ["⏻ Start / Stop", "Switches the display on or off; the “On / Off” state is shown in the card header."],
          ["All off", "Switches the display off, clears the source, hangs up, switches lighting off, opens the shades and releases the room."],
          ["− / + (Volume)", "Volume in 5 % steps; the slider allows direct adjustment."],
          ["Mute", "Mutes the sound (button turns blue); another tap or a slider move restores it."],
          ["Meeting · Presentation · Video call · Cleaning", "Same lighting scenes as on the home page."],
          ["⌃ Open · ⌄ Close", "Room shades to 0 % or 100 %."],
        ],
      },
      {
        title: "Video call",
        image: IMG + "04-visio.png",
        text: "Before the call: the next scheduled video meeting, the call bar, the PTZ camera and audio.",
        buttons: [
          ["Mic on / Mic muted", "Mutes or restores the room microphone; muted, the button shows a struck-out icon."],
          ["Camera on / Camera off", "Switches the camera off or back on."],
          ["Laptop", "Shares the laptop screen: selects the Laptop source and switches the display on."],
          ["Join call", "Starts the call and applies the Video call scene (lighting 80 %, shades 70 %, display on Teams)."],
          ["⌃ ⌄ ‹ › (PTZ)", "Manual camera steering; the stored preset is then deselected."],
          ["⌂ (centre)", "Back to the Wide position."],
          ["Wide · Speaker · Table · Whiteboard", "Stored camera presets; the active one is blue."],
          ["🔊 + slider (Audio)", "Mute and room volume."],
          ["Meeting · Video call", "Lighting scenes suited to the call."],
        ],
      },
      {
        title: "Video call — call in progress",
        image: IMG + "05-visio-appel.png",
        text: "During the call: the mosaic of six participants with the room's own thumbnail, the “Call in progress · 6 participants” state in green and the red Hang up button.",
        buttons: [["Hang up", "Ends the call and returns to the idle screen."]],
      },
      {
        title: "Agenda",
        image: IMG + "06-agenda.png",
        text: "Today's meetings in every room: time, title, room, number of participants and organiser. The current meeting is marked “Now”.",
        buttons: [
          ["Release (per slot)", "Removes the booking from the agenda."],
          ["Book · <room> · 17:30", "Adds a 30-minute slot at 17:30 in the selected room."],
        ],
      },
      {
        title: "iPhone version — Home",
        image: IMG + "07-iphone-accueil.png",
        portrait: true,
        text: "On the phone the home cards stack and navigation moves to the bottom tab bar.",
        buttons: [["Tab bar", "Home, Rooms, Present, Video call, Agenda."], ["Cards", "Same controls as on the panel: climate, meeting, lighting, shades, display."]],
      },
      {
        title: "iPhone version — Video call",
        image: IMG + "08-iphone-visio.png",
        portrait: true,
        text: "The Video call page on the phone: call view, call bar, PTZ camera and audio in one column.",
        buttons: [["Call bar · PTZ · Presets", "Same functions as on the panel."]],
      },
    ],
  },

  de: {
    intro:
      "Firmensitz in Nyon: sechs Sitzungszimmer, gesteuert über die Crestron-Flurpanels, das iPad am Empfang und die Smartphones der Mitarbeitenden. Thema «Helles Atelier»: weisse Karten auf warmem Grau, Verlaufsakzent blau → rosa, Schrift Outfit. Fünf Seiten — Start, Räume, Präsentation, Videocall, Agenda — in der oberen Leiste, die auf dem Smartphone zur Tab-Leiste wird. Jede Bedienung gilt für den gewählten Raum. Die Oberfläche ist auf Französisch, Englisch und Deutsch übersetzt.",
    sections: [
      {
        title: "Start",
        image: IMG + "01-accueil.png",
        text: "Das ganze Gebäude auf einem Bildschirm: Uhrzeit, Datum und Wetter, Anzahl freier Räume, dann für den gewählten Raum das Klima auf einer Verlaufsskala, die laufende Besprechung, Licht nach Szene, Storen und das Display mit seinen Quellen. Die untere Leiste wechselt den Raum.",
        buttons: [
          ["Start · Räume · Präsentation · Videocall · Agenda", "Navigationsleiste; die aktive Seite hat schwarzen Hintergrund."],
          ["− / + (Klima)", "Sollwert des Raums in Schritten von 0,5 °C zwischen 16 und 26 °C; der Verlaufsbogen und die Angabe «Warm →» oder «Kalt →» folgen dem Sollwert."],
          ["30 Min. verlängern", "Bei belegtem Raum: verschiebt das Ende der Besprechung auf 12:00."],
          ["Beenden", "Gibt den Raum frei: das Abzeichen wechselt von «Belegt» (rosa) auf «Frei» (grün)."],
          ["Jetzt buchen", "Bei freiem Raum: setzt ihn für 30 Minuten auf «Belegt»."],
          ["Regler Licht", "Lichtniveau des Raums, 0 bis 100 %."],
          ["Besprechung · Präsentation · Videocall · Reinigung", "Lichtszenen: Besprechung 70 % / Storen 30 %; Präsentation 30 % / Storen geschlossen, Display an; Videocall 80 % / Storen 70 %, Display auf Teams; Reinigung 100 % / Storen offen. Die aktive Szene ist blau."],
          ["⌃ · ■ · ⌄ (Storen)", "Öffnet (0 %), stoppt auf halber Höhe (50 %) oder schliesst (100 %) die Storen des Raums; die Position steht im Kartenkopf."],
          ["Laptop · Kabellos · Teams · Apple TV", "Wählt die Quelle und schaltet das Display ein; die aktive Quelle hat schwarzen Hintergrund und wird im Kartenkopf genannt."],
          ["🔊 + Regler", "Schaltet den Ton stumm oder wieder ein (der Regler fällt bei stumm auf 0); der Regler stellt die Raumlautstärke."],
          ["Räume: Léman · Jura · Salève · Dôle · Mont-Blanc · Rhône", "Wählt den gesteuerten Raum; rosa Punkt = belegt, grün = frei."],
        ],
      },
      {
        title: "Räume",
        image: IMG + "02-salles.png",
        text: "Übersicht der sechs Räume mit Status, Kapazität und Ausstattung, dann das Detail des gewählten Raums mit Schnellbuchung.",
        buttons: [
          ["Raumkarten", "Ein Tipp wählt den Raum. Jede Karte zeigt Frei / Belegt, die Platzzahl, Ausstattungssymbole (Display, Kamera, Mikrofon, Projektor) und die laufende oder nächste Besprechung."],
          ["30 Min. · 1 Std. · 1,5 Std.", "Schnellbuchung: setzt den Raum für die gewählte Dauer auf «Belegt»."],
          ["Freigeben", "Bei belegtem Raum: beendet die Besprechung und gibt den Raum frei."],
          ["Klima · Licht", "Anzeige von Temperatur, Sollwert, Lichtniveau und Storenposition."],
        ],
      },
      {
        title: "Präsentation",
        image: IMG + "03-presentation.png",
        text: "Die vier Quellen als grosse Kacheln mit Anschlussart, Lautstärke, Lichtszenen und Storen.",
        buttons: [
          ["Laptop (HDMI · USB-C) · Kabellos (AirMedia · Code 4821) · Teams (Teams Rooms) · Apple TV (AirPlay)", "Wählt die Quelle und schaltet das Display ein; die aktive Kachel wird schwarz."],
          ["⏻ Starten / Stoppen", "Schaltet das Display ein oder aus; der Zustand «An / Aus» steht im Kartenkopf."],
          ["Alles aus", "Schaltet das Display aus, trennt die Quelle, legt auf, schaltet das Licht aus, öffnet die Storen und gibt den Raum frei."],
          ["− / + (Lautstärke)", "Lautstärke in 5-%-Schritten; der Regler erlaubt die direkte Einstellung."],
          ["Stumm", "Schaltet den Ton stumm (Taste wird blau); ein weiterer Tipp oder eine Reglerbewegung stellt ihn wieder her."],
          ["Besprechung · Präsentation · Videocall · Reinigung", "Dieselben Lichtszenen wie auf der Startseite."],
          ["⌃ Öffnen · ⌄ Schliessen", "Storen des Raums auf 0 % oder 100 %."],
        ],
      },
      {
        title: "Videocall",
        image: IMG + "04-visio.png",
        text: "Vor dem Anruf: der nächste geplante Videocall, die Anrufleiste, die PTZ-Kamera und Audio.",
        buttons: [
          ["Mikrofon an / Mikrofon aus", "Schaltet das Raummikrofon stumm oder wieder ein; stumm zeigt die Taste ein durchgestrichenes Symbol."],
          ["Kamera an / Kamera aus", "Schaltet die Kamera aus oder wieder ein."],
          ["Laptop", "Teilt den Laptop-Bildschirm: wählt die Quelle Laptop und schaltet das Display ein."],
          ["Anruf beitreten", "Startet den Anruf und wendet die Szene Videocall an (Licht 80 %, Storen 70 %, Display auf Teams)."],
          ["⌃ ⌄ ‹ › (PTZ)", "Manuelle Kamerasteuerung; die gespeicherte Position ist dann nicht mehr gewählt."],
          ["⌂ (Mitte)", "Zurück zur Position Weit."],
          ["Weit · Sprecher · Tisch · Whiteboard", "Gespeicherte Kamerapositionen; die aktive ist blau."],
          ["🔊 + Regler (Audio)", "Stummschaltung und Raumlautstärke."],
          ["Besprechung · Videocall", "Für den Anruf geeignete Lichtszenen."],
        ],
      },
      {
        title: "Videocall — Anruf läuft",
        image: IMG + "05-visio-appel.png",
        text: "Während des Anrufs: das Mosaik der sechs Teilnehmer mit dem eigenen Raumbild, der Zustand «Anruf läuft · 6 Teilnehmer» in Grün und die rote Taste Auflegen.",
        buttons: [["Auflegen", "Beendet den Anruf und kehrt zum Wartebildschirm zurück."]],
      },
      {
        title: "Agenda",
        image: IMG + "06-agenda.png",
        text: "Die heutigen Besprechungen in allen Räumen: Zeit, Titel, Raum, Teilnehmerzahl und Organisator. Die laufende Besprechung ist mit «Jetzt» markiert.",
        buttons: [
          ["Freigeben (je Termin)", "Entfernt die Buchung aus der Agenda."],
          ["Buchen · <Raum> · 17:30", "Fügt im gewählten Raum einen 30-Minuten-Termin um 17:30 hinzu."],
        ],
      },
      {
        title: "iPhone-Version — Start",
        image: IMG + "07-iphone-accueil.png",
        portrait: true,
        text: "Auf dem Smartphone stapeln sich die Startkarten und die Navigation wandert in die untere Tab-Leiste.",
        buttons: [["Tab-Leiste", "Start, Räume, Präsentation, Videocall, Agenda."], ["Karten", "Dieselbe Bedienung wie auf dem Panel: Klima, Besprechung, Licht, Storen, Display."]],
      },
      {
        title: "iPhone-Version — Videocall",
        image: IMG + "08-iphone-visio.png",
        portrait: true,
        text: "Die Seite Videocall auf dem Smartphone: Anrufansicht, Anrufleiste, PTZ-Kamera und Audio in einer Spalte.",
        buttons: [["Anrufleiste · PTZ · Positionen", "Dieselben Funktionen wie auf dem Panel."]],
      },
    ],
  },
};
