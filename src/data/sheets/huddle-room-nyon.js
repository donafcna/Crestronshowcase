// Fiche détaillée « Huddle Room Nyon » : chaque écran de la dalle de salle, avec capture et
// explication de chaque bouton. Captures : public/sheets/huddle-room-nyon/ (dalle Crestron ;
// version iPhone en portrait).
const IMG = "/sheets/huddle-room-nyon/";

export default {
  fr: {
    intro:
      "Dalle de salle d'une huddle room de six places : rejoindre la réunion programmée en un appui, présenter sans fil, régler caméra et micro, piloter la salle. Quatre pages dans le menu de gauche : Réunion, Présenter, Caméra & son, Salle. L'en-tête indique en permanence si la salle est libre ou occupée (pastille verte / rouge) et jusqu'à quelle heure. Le thème clair est pensé pour les espaces de travail lumineux ; l'interface est traduite en FR, EN et DE. Identique sur iPad, XPanel et iPhone.",
    sections: [
      {
        title: "Réunion",
        image: IMG + "01-reunion.png",
        text:
          "Page d'accueil : la prochaine réunion en grand (plateforme, compte à rebours, horaire, organisateur) avec le bouton « Rejoindre maintenant », l'agenda du jour, la réservation de la salle et l'assistance.",
        buttons: [
          ["Réunion · Présenter · Caméra & son · Salle", "Menu des pages ; la page ouverte est surlignée en vert."],
          ["Rejoindre maintenant", "Lance la visioconférence programmée sur le codec (Crestron Flex + Logitech Rally Bar) : allume l'écran, passe l'éclairage en ambiance Visio et affiche le bandeau « En réunion »."],
          ["Agenda du jour", "Réunions synchronisées avec le calendrier de la salle : horaire, titre, plateforme (couleur Teams, Zoom ou Meet) et organisateur. Les réunions passées sont grisées."],
          ["Rejoindre (par réunion)", "Rejoint directement cette réunion, même si ce n'est pas la prochaine."],
          ["+15 min · +30 min · +60 min", "Réserve la salle pour la durée choisie : la pastille de l'en-tête passe au rouge « Occupée jusqu'à … ». Un second appui annule."],
          ["⚡ Réunion instantanée", "Ouvre une réunion Teams ad hoc sans invitation ; grisé pendant un appel."],
          ["⚠ Signaler un problème", "Envoie un ticket au support IT ; le bouton passe en vert « Ticket envoyé au support IT »."],
          ["Pastille · Libre / Occupée", "État de la salle dans l'en-tête, mis à jour selon l'agenda, l'appel en cours ou la réservation."],
        ],
      },
      {
        title: "En réunion",
        image: IMG + "02-en-reunion.png",
        text:
          "Pendant l'appel, le bandeau devient sombre : durée de l'appel, titre, plateforme et équipements, commandes rapides et aperçu des participants. L'en-tête passe « Occupée jusqu'à » la fin de la réunion.",
        buttons: [
          ["Couper / Activer", "Coupe ou rétablit le micro Shure ; le bouton devient rouge, la vignette locale affiche le micro barré et une pastille « Couper » apparaît dans l'en-tête."],
          ["Cadrage automatique ✓", "Active ou désactive le cadrage automatique de la caméra Rally Bar ; la coche indique l'état."],
          ["Quitter", "Raccroche : arrête l'appel et le partage éventuel, remet l'éclairage en ambiance Réunion."],
          ["Vignettes", "Aperçu de la réunion : participants distants et vignette locale avec l'état du micro."],
        ],
      },
      {
        title: "Réservation",
        image: IMG + "03-reservation.png",
        text:
          "Après un appui sur +30 min : le bouton est surligné, la salle passe « Occupée jusqu'à » l'heure de fin dans l'en-tête (pastille rouge).",
        buttons: [
          ["+30 min (actif)", "Réservation en cours ; un nouvel appui la libère, un autre bouton change la durée."],
        ],
      },
      {
        title: "Présenter",
        image: IMG + "04-presenter.png",
        text:
          "Partage de contenu sur l'écran Samsung 75\" : sans fil via AirMedia (code de session à quatre chiffres) ou par la prise HDMI de la table. Un aperçu montre ce qui est affiché à l'écran.",
        buttons: [
          ["Présenter (AirMedia)", "Affiche le contenu du poste connecté à airmedia-nyon-01.local avec le code affiché ; le bouton devient « Arrêter »."],
          ["Présenter (HDMI table)", "Affiche la source branchée sur la prise HDMI de la table (4K · 60 Hz) ; le bouton devient « Arrêter »."],
          ["Allumé / Éteint (Écran)", "Allume ou éteint l'écran ; l'aperçu affiche l'heure et le nom du hub au repos, ou « Éteint »."],
        ],
      },
      {
        title: "Présentation AirMedia",
        image: IMG + "05-presentation-airmedia.png",
        text:
          "Partage sans fil en cours : la carte AirMedia est surlignée, l'aperçu indique « Présentation en cours · AirMedia » et une pastille apparaît dans l'en-tête.",
        buttons: [
          ["Arrêter", "Termine le partage ; l'écran revient à l'écran de veille."],
        ],
      },
      {
        title: "Caméra & son",
        image: IMG + "06-camera-son.png",
        text:
          "Réglages de la caméra Logitech Rally Bar et du micro de plafond Shure MXA920, avec un aperçu du cadrage.",
        buttons: [
          ["Cadrage automatique", "Interrupteur : la caméra cadre automatiquement les personnes présentes ; désactivé dès qu'un préréglage est choisi."],
          ["Large · Présentateur · Table", "Préréglages de cadrage manuels ; le choix actif est surligné et l'aperçu se recadre."],
          ["Couper / Activer", "Grand bouton de coupure du micro ; rouge lorsque le micro est coupé."],
          ["− / + et curseur", "Volume de la salle par pas de 5, ou position libre de 0 à 100 ; la valeur est reprise dans le titre."],
        ],
      },
      {
        title: "Préréglage caméra et micro coupé",
        image: IMG + "07-camera-preset-micro-coupe.png",
        text:
          "Après le choix « Présentateur » et un appui sur Couper : cadrage automatique désactivé, préréglage surligné, bouton micro rouge « Activer » et pastille « Couper » dans l'en-tête.",
        buttons: [
          ["Activer", "Rétablit le micro et retire la pastille."],
        ],
      },
      {
        title: "Salle",
        image: IMG + "08-salle.png",
        text:
          "État de la salle en temps réel (occupation, température, qualité de l'air) et commandes de confort : ambiance lumineuse et stores.",
        buttons: [
          ["Occupation · Température · Qualité de l'air", "Compteur de personnes, température mesurée et CO₂ en ppm, remontés par les capteurs de la salle."],
          ["Réunion · Visio · Éteint", "Ambiance lumineuse ; le fond de l'interface se teinte selon l'ambiance. « Visio » est appliquée automatiquement quand on rejoint un appel."],
          ["▲ Ouverts / ▼ Fermés", "Stores de la salle ; le dessin des lamelles suit l'état."],
        ],
      },
      {
        title: "Version iPhone",
        image: IMG + "09-iphone-reunion.png",
        image2: IMG + "10-iphone-camera-son.png",
        portrait: true,
        text:
          "Sur iPhone, les quatre pages passent dans une barre d'onglets en bas et les cartes s'empilent en colonne ; toutes les commandes restent identiques.",
        buttons: [
          ["Barre d'onglets", "Réunion, Présenter, Caméra & son, Salle."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Room panel of a six-seat huddle room: join the scheduled meeting in one tap, present wirelessly, adjust camera and microphone, control the room. Four pages in the left menu: Meeting, Present, Camera & audio, Room. The header always shows whether the room is available or in use (green / red dot) and until when. The light theme is designed for bright workspaces; the interface is translated into FR, EN and DE. Identical on iPad, XPanel and iPhone.",
    sections: [
      {
        title: "Meeting",
        image: IMG + "01-reunion.png",
        text: "Home page: the next meeting in large type (platform, countdown, time, organiser) with the “Join now” button, today's agenda, room booking and support.",
        buttons: [
          ["Meeting · Present · Camera & audio · Room", "Page menu; the open page is highlighted in green."],
          ["Join now", "Starts the scheduled video call on the codec (Crestron Flex + Logitech Rally Bar): switches the display on, sets lighting to the Video call scene and shows the “In meeting” banner."],
          ["Today's agenda", "Meetings synchronised with the room calendar: time, title, platform (Teams, Zoom or Meet colour) and organiser. Past meetings are greyed out."],
          ["Join (per meeting)", "Joins that meeting directly, even if it is not the next one."],
          ["+15 min · +30 min · +60 min", "Books the room for the chosen duration: the header dot turns red “In use until …”. A second tap cancels."],
          ["⚡ Instant meeting", "Opens an ad hoc Teams meeting without invitation; greyed out during a call."],
          ["⚠ Report an issue", "Sends a ticket to IT support; the button turns green “Ticket sent to IT support”."],
          ["Dot · Available / In use", "Room state in the header, updated from the agenda, the current call or the booking."],
        ],
      },
      {
        title: "In meeting",
        image: IMG + "02-en-reunion.png",
        text: "During the call the banner turns dark: call duration, title, platform and equipment, quick controls and participant preview. The header reads “In use until” the end of the meeting.",
        buttons: [
          ["Mute / Unmute", "Mutes or restores the Shure microphone; the button turns red, the local tile shows a crossed mic and a “Mute” chip appears in the header."],
          ["Auto framing ✓", "Turns the Rally Bar auto framing on or off; the tick shows the state."],
          ["Leave", "Hangs up: ends the call and any presentation, sets lighting back to the Meeting scene."],
          ["Tiles", "Meeting preview: remote participants and local tile with the microphone state."],
        ],
      },
      {
        title: "Booking",
        image: IMG + "03-reservation.png",
        text: "After tapping +30 min: the button is highlighted, the room reads “In use until” the end time in the header (red dot).",
        buttons: [
          ["+30 min (active)", "Current booking; another tap releases it, another button changes the duration."],
        ],
      },
      {
        title: "Present",
        image: IMG + "04-presenter.png",
        text: "Content sharing on the Samsung 75\" display: wirelessly via AirMedia (four-digit session code) or through the table HDMI socket. A preview shows what the display is showing.",
        buttons: [
          ["Present (AirMedia)", "Shows the content of the computer connected to airmedia-nyon-01.local with the displayed code; the button becomes “Stop”."],
          ["Present (Table HDMI)", "Shows the source plugged into the table HDMI socket (4K · 60 Hz); the button becomes “Stop”."],
          ["On / Off (Display)", "Switches the display on or off; at rest the preview shows the time and the hub name, or “Off”."],
        ],
      },
      {
        title: "AirMedia presentation",
        image: IMG + "05-presentation-airmedia.png",
        text: "Wireless sharing in progress: the AirMedia card is highlighted, the preview reads “Presenting · AirMedia” and a chip appears in the header.",
        buttons: [
          ["Stop", "Ends the sharing; the display returns to the idle screen."],
        ],
      },
      {
        title: "Camera & audio",
        image: IMG + "06-camera-son.png",
        text: "Settings of the Logitech Rally Bar camera and the Shure MXA920 ceiling microphone, with a framing preview.",
        buttons: [
          ["Auto framing", "Switch: the camera automatically frames the people present; turned off as soon as a preset is chosen."],
          ["Wide · Presenter · Table", "Manual framing presets; the active choice is highlighted and the preview reframes."],
          ["Mute / Unmute", "Large microphone mute button; red while the microphone is muted."],
          ["− / + and slider", "Room volume in steps of 5, or free position from 0 to 100; the value is repeated in the title."],
        ],
      },
      {
        title: "Camera preset and muted mic",
        image: IMG + "07-camera-preset-micro-coupe.png",
        text: "After choosing “Presenter” and tapping Mute: auto framing off, preset highlighted, red “Unmute” microphone button and “Mute” chip in the header.",
        buttons: [
          ["Unmute", "Restores the microphone and removes the chip."],
        ],
      },
      {
        title: "Room",
        image: IMG + "08-salle.png",
        text: "Live room state (occupancy, temperature, air quality) and comfort controls: lighting scene and blinds.",
        buttons: [
          ["Occupancy · Temperature · Air quality", "People counter, measured temperature and CO₂ in ppm, reported by the room sensors."],
          ["Meeting · Video call · Off", "Lighting scene; the interface background is tinted according to the scene. “Video call” is applied automatically when joining a call."],
          ["▲ Open / ▼ Closed", "Room blinds; the slat drawing follows the state."],
        ],
      },
      {
        title: "iPhone version",
        image: IMG + "09-iphone-reunion.png",
        image2: IMG + "10-iphone-camera-son.png",
        portrait: true,
        text: "On iPhone the four pages move to a bottom tab bar and the cards stack in one column; every control stays identical.",
        buttons: [
          ["Tab bar", "Meeting, Present, Camera & audio, Room."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Raumpanel eines Huddle Rooms mit sechs Plätzen: dem geplanten Meeting mit einem Tipp beitreten, drahtlos präsentieren, Kamera und Mikrofon einstellen, den Raum steuern. Vier Seiten im linken Menü: Meeting, Präsentieren, Kamera & Ton, Raum. Die Kopfzeile zeigt stets, ob der Raum frei oder belegt ist (grüner / roter Punkt) und bis wann. Das helle Thema ist für lichtdurchflutete Arbeitsräume gedacht; die Oberfläche ist in FR, EN und DE übersetzt. Identisch auf iPad, XPanel und iPhone.",
    sections: [
      {
        title: "Meeting",
        image: IMG + "01-reunion.png",
        text: "Startseite: das nächste Meeting gross (Plattform, Countdown, Uhrzeit, Organisator) mit der Schaltfläche „Jetzt beitreten“, die heutige Agenda, die Raumbuchung und der Support.",
        buttons: [
          ["Meeting · Präsentieren · Kamera & Ton · Raum", "Seitenmenü; die geöffnete Seite ist grün hervorgehoben."],
          ["Jetzt beitreten", "Startet den geplanten Videocall auf dem Codec (Crestron Flex + Logitech Rally Bar): schaltet das Display ein, setzt die Beleuchtung auf die Szene Videocall und zeigt das Band „Im Meeting“."],
          ["Heutige Agenda", "Mit dem Raumkalender synchronisierte Meetings: Uhrzeit, Titel, Plattform (Farbe Teams, Zoom oder Meet) und Organisator. Vergangene Meetings sind ausgegraut."],
          ["Beitreten (je Meeting)", "Tritt direkt diesem Meeting bei, auch wenn es nicht das nächste ist."],
          ["+15 Min. · +30 Min. · +60 Min.", "Bucht den Raum für die gewählte Dauer: der Punkt in der Kopfzeile wird rot „Belegt bis …“. Ein zweiter Tipp storniert."],
          ["⚡ Sofort-Meeting", "Öffnet ein spontanes Teams-Meeting ohne Einladung; während eines Anrufs ausgegraut."],
          ["⚠ Problem melden", "Sendet ein Ticket an den IT-Support; die Schaltfläche wird grün „Ticket an IT-Support gesendet“."],
          ["Punkt · Frei / Belegt", "Raumstatus in der Kopfzeile, aktualisiert nach Agenda, laufendem Anruf oder Buchung."],
        ],
      },
      {
        title: "Im Meeting",
        image: IMG + "02-en-reunion.png",
        text: "Während des Anrufs wird das Band dunkel: Anrufdauer, Titel, Plattform und Geräte, Schnellbefehle und Teilnehmervorschau. Die Kopfzeile zeigt „Belegt bis“ zum Ende des Meetings.",
        buttons: [
          ["Stumm / Ton an", "Schaltet das Shure-Mikrofon stumm oder wieder ein; die Taste wird rot, die lokale Kachel zeigt ein durchgestrichenes Mikrofon und ein Chip „Stumm“ erscheint in der Kopfzeile."],
          ["Auto-Framing ✓", "Schaltet das Auto-Framing der Rally Bar ein oder aus; das Häkchen zeigt den Zustand."],
          ["Verlassen", "Legt auf: beendet den Anruf und eine laufende Präsentation, setzt die Beleuchtung auf die Szene Meeting zurück."],
          ["Kacheln", "Meeting-Vorschau: entfernte Teilnehmer und lokale Kachel mit Mikrofonstatus."],
        ],
      },
      {
        title: "Buchung",
        image: IMG + "03-reservation.png",
        text: "Nach einem Tipp auf +30 Min.: die Taste ist hervorgehoben, der Raum zeigt „Belegt bis“ zur Endzeit in der Kopfzeile (roter Punkt).",
        buttons: [
          ["+30 Min. (aktiv)", "Laufende Buchung; ein weiterer Tipp gibt den Raum frei, eine andere Taste ändert die Dauer."],
        ],
      },
      {
        title: "Präsentieren",
        image: IMG + "04-presenter.png",
        text: "Inhalte auf dem Samsung-75\"-Display teilen: drahtlos über AirMedia (vierstelliger Sitzungscode) oder über die HDMI-Dose am Tisch. Eine Vorschau zeigt, was das Display anzeigt.",
        buttons: [
          ["Präsentieren (AirMedia)", "Zeigt den Inhalt des mit airmedia-nyon-01.local verbundenen Rechners mit dem angezeigten Code; die Taste wird zu „Beenden“."],
          ["Präsentieren (HDMI Tisch)", "Zeigt die an der HDMI-Dose am Tisch angeschlossene Quelle (4K · 60 Hz); die Taste wird zu „Beenden“."],
          ["Ein / Aus (Display)", "Schaltet das Display ein oder aus; im Ruhezustand zeigt die Vorschau Uhrzeit und Hub-Namen, sonst „Aus“."],
        ],
      },
      {
        title: "AirMedia-Präsentation",
        image: IMG + "05-presentation-airmedia.png",
        text: "Drahtlose Freigabe läuft: die AirMedia-Karte ist hervorgehoben, die Vorschau zeigt „Präsentation läuft · AirMedia“ und ein Chip erscheint in der Kopfzeile.",
        buttons: [
          ["Beenden", "Beendet die Freigabe; das Display kehrt zum Ruhebildschirm zurück."],
        ],
      },
      {
        title: "Kamera & Ton",
        image: IMG + "06-camera-son.png",
        text: "Einstellungen der Logitech-Rally-Bar-Kamera und des Shure-MXA920-Deckenmikrofons, mit einer Vorschau der Bildeinstellung.",
        buttons: [
          ["Auto-Framing", "Schalter: die Kamera erfasst die anwesenden Personen automatisch; wird deaktiviert, sobald eine Voreinstellung gewählt wird."],
          ["Weit · Referent · Tisch", "Manuelle Bildvoreinstellungen; die aktive Wahl ist hervorgehoben und die Vorschau passt den Ausschnitt an."],
          ["Stumm / Ton an", "Grosse Stummschalttaste; rot, solange das Mikrofon stumm ist."],
          ["− / + und Regler", "Raumlautstärke in 5er-Schritten oder freie Position von 0 bis 100; der Wert steht im Titel."],
        ],
      },
      {
        title: "Kameravoreinstellung und stummes Mikrofon",
        image: IMG + "07-camera-preset-micro-coupe.png",
        text: "Nach der Wahl „Referent“ und einem Tipp auf Stumm: Auto-Framing aus, Voreinstellung hervorgehoben, rote Mikrofontaste „Ton an“ und Chip „Stumm“ in der Kopfzeile.",
        buttons: [
          ["Ton an", "Schaltet das Mikrofon wieder ein und entfernt den Chip."],
        ],
      },
      {
        title: "Raum",
        image: IMG + "08-salle.png",
        text: "Raumstatus in Echtzeit (Belegung, Temperatur, Luftqualität) und Komfortbefehle: Lichtszene und Jalousien.",
        buttons: [
          ["Belegung · Temperatur · Luftqualität", "Personenzähler, gemessene Temperatur und CO₂ in ppm, von den Raumsensoren gemeldet."],
          ["Meeting · Videocall · Aus", "Lichtszene; der Hintergrund der Oberfläche wird je nach Szene getönt. „Videocall“ wird beim Beitreten zu einem Anruf automatisch angewandt."],
          ["▲ Offen / ▼ Geschlossen", "Jalousien des Raums; die Lamellenzeichnung folgt dem Zustand."],
        ],
      },
      {
        title: "iPhone-Version",
        image: IMG + "09-iphone-reunion.png",
        image2: IMG + "10-iphone-camera-son.png",
        portrait: true,
        text: "Auf dem iPhone wandern die vier Seiten in eine Tab-Leiste unten und die Karten stapeln sich in einer Spalte; alle Befehle bleiben identisch.",
        buttons: [
          ["Tab-Leiste", "Meeting, Präsentieren, Kamera & Ton, Raum."],
        ],
      },
    ],
  },
};
