// Fiche détaillée « Villa Léman » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/villa-leman/
// (dalle TSW-1070 pour 01-08, iPhone en portrait pour 09-10).
const IMG = "/sheets/villa-leman/";

export default {
  fr: {
    intro:
      "Villa au bord du Léman, à Cologny, pilotée depuis une dalle Crestron TSW-1070 encastrée, l'iPad du salon et l'iPhone du propriétaire. Thème « Obsidienne » : fond anthracite, un seul accent cyan pour tout ce qui est actif, capitales condensées, cadrans circulaires. Six pages — Accueil, Pièces, Éclairage, Climat, Médias, Sécurité — accessibles par le rail d'icônes à gauche, qui devient une barre d'onglets sur smartphone. L'interface est traduite en français, anglais et allemand.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        text:
          "La page d'accueil salue par « Bonsoir » ou « Bonjour » selon l'heure, résume la maison en une phrase (portes verrouillées, pièces éclairées, température de la piscine) et affiche la météo. En dessous : le climat de la pièce active, les quatre actions rapides et les tuiles photo de l'étage choisi.",
        buttons: [
          ["Rail : Accueil · Pièces · Éclairage · Climat · Médias · Sécurité", "Change de page ; l'icône active passe en cyan avec un trait souligné. En bas du rail, la date et l'heure."],
          ["Cadran Climat", "Température mesurée et consigne de la pièce sélectionnée, avec le mode en cours (Auto, Chauffage, Rafraîchissement). Lecture seule ici ; le réglage se fait sur les pages Pièces et Climat."],
          ["BONJOUR", "Action rapide : toutes les pièces intérieures à 70 %, extérieur éteint, tous les stores ouverts."],
          ["SOIRÉE", "Rez-de-chaussée à 55 %, home cinéma à 8 %, étage éteint, tous les stores fermés. L'action active reste encadrée en cyan."],
          ["ABSENT", "Toutes les lumières éteintes, stores fermés, alarme armée et les quatre serrures verrouillées."],
          ["NUIT", "Tout éteint sauf une veilleuse à 10 % dans la salle de bain, stores fermés, serrures verrouillées."],
          ["REZ-DE-CHAUSSÉE · ÉTAGE · EXTÉRIEUR", "Filtre les tuiles par étage ; l'onglet actif est souligné en cyan."],
          ["Tuiles des pièces", "Chaque tuile montre la température et l'activité de la pièce (Musique, Film en cours, Éclairée, Calme) ; un point cyan signale une lumière allumée. Un appui sélectionne la pièce et ouvre la page Pièces."],
        ],
      },
      {
        title: "Accueil — Étage",
        image: IMG + "02-accueil-etage.png",
        text: "Le même accueil après un appui sur ÉTAGE : la suite parentale, la chambre des enfants et la salle de bain. EXTÉRIEUR affiche la terrasse et la piscine.",
        buttons: [
          ["Tuiles Suite parentale · Chambre enfants · Salle de bain", "Sélection de la pièce et ouverture de sa page de détail."],
        ],
      },
      {
        title: "Pièces",
        image: IMG + "03-pieces.png",
        text: "Toutes les pièces en pastilles en haut ; la pièce active se détaille en cinq cartes : Éclairage, Climat, Audio, Stores, Sécurité.",
        buttons: [
          ["Pastilles des pièces", "Sélectionne la pièce ; la pastille active passe en cyan, un point marque les pièces éclairées."],
          ["⏻ ÉTEINT (en-tête)", "Éteint l'éclairage de la pièce et coupe sa source audio."],
          ["Curseur Éclairage", "Niveau de 0 à 100 %, valeur affichée en grand au-dessus."],
          ["ÉTEINT · TAMISÉ · PLEIN", "Préréglages 0 %, 30 % et 100 % ; le préréglage correspondant au niveau courant s'affiche en cyan."],
          ["− / + (cadran Climat)", "Consigne par pas de 0,5 °C entre 15 et 30 °C ; l'arc cyan et le curseur du cadran suivent la consigne. Sur la terrasse, seule la température est affichée."],
          ["SPOTIFY · APPLE TV · RADIO", "Source audio de la pièce ; un nouvel appui sur la source active la coupe (« — »)."],
          ["⌃ OUVRIR · STOP · ⌄ FERMER", "Store de la pièce : ouvert (0 %), arrêt à mi-course (50 %) ou fermé (100 %) ; l'état s'affiche en toutes lettres. Absent pour les pièces sans store."],
          ["ARMER · DÉSARMER", "Arme ou désarme l'alarme de la villa ; l'état « Armée » ou « Désarmée · prête » (en vert) s'affiche au-dessus."],
        ],
      },
      {
        title: "Éclairage",
        image: IMG + "04-eclairage.png",
        text: "Une ligne par pièce de l'étage sélectionné, avec badge ON / OFF, curseur, pourcentage et interrupteur, puis quatre scènes d'éclairage pour l'étage.",
        buttons: [
          ["ÉTAGE ÉTEINT", "Éteint toutes les lumières de l'étage affiché."],
          ["TOUT ÉTEINDRE", "Éteint toutes les lumières de la villa."],
          ["REZ-DE-CHAUSSÉE · ÉTAGE · EXTÉRIEUR", "Choix de l'étage affiché."],
          ["Curseur (par pièce)", "Niveau de 0 à 100 % ; la ligne s'allume et le badge passe à ON dès que le niveau dépasse 0."],
          ["Interrupteur (par pièce)", "Éteint la pièce, ou la rallume à 70 %."],
          ["TAMISÉ · LECTURE · DÎNER · PLEIN", "Scènes d'éclairage de l'étage : toutes les pièces de l'étage à 25 %, 70 %, 45 % ou 100 %."],
        ],
      },
      {
        title: "Climat",
        image: IMG + "05-climat.png",
        text: "Le mode général en haut à droite, puis un cadran par pièce intérieure avec l'humidité mesurée.",
        buttons: [
          ["AUTO · CHAUFFAGE · RAFRAÎCHISSEMENT · ÉTEINT", "Mode du système de climatisation ; le mode actif est en cyan et se reflète sur l'accueil."],
          ["− / + (par cadran)", "Consigne de la pièce par pas de 0,5 °C entre 15 et 30 °C."],
          ["Carte de pièce", "Un appui sur la carte sélectionne la pièce (cadre cyan), ce qui met à jour l'accueil et la page Médias."],
        ],
      },
      {
        title: "Médias",
        image: IMG + "06-medias.png",
        text: "Lecture en cours à gauche (source, titre, informations, transport, volume), sources et zones audio à droite.",
        buttons: [
          ["⏮ / ⏭", "Passe à la source précédente / suivante (Spotify, Apple TV, Radio, Platine)."],
          ["⏯", "Lecture / pause ; l'étiquette passe de « En lecture » à « En pause »."],
          ["🔇 / 🔊 + curseur", "Volume par pas de 5 % ou directement au curseur, valeur affichée à droite."],
          ["Sources : Spotify · Apple TV · Radio · Platine", "Sélectionne la source et relance la lecture ; la source active est en cyan avec son titre en cours."],
          ["Zones audio", "Active ou coupe la diffusion de la source courante dans chaque pièce ; une pièce active affiche un point cyan."],
        ],
      },
      {
        title: "Sécurité",
        image: IMG + "07-securite.png",
        text: "Clavier à code à gauche, serrures et caméras à droite. L'état de l'alarme (« Armée · Présence » ou « Désarmée · prête ») s'affiche en haut à droite.",
        buttons: [
          ["0 – 9", "Saisie du code (jusqu'à 6 chiffres) ; les quatre points se remplissent."],
          ["←", "Efface le dernier chiffre."],
          ["✓", "Avec au moins 4 chiffres, bascule l'alarme (armée ↔ désarmée) et vide la saisie."],
          ["🔓 / 🔒 (par serrure)", "Déverrouille ou verrouille la porte d'entrée, le garage, le portail et la baie terrasse ; l'état « Verrouillée » (vert) ou « Déverrouillée » s'affiche à côté."],
          ["Caméras", "Vignettes du portail, de la porte d'entrée, de la baie terrasse et du garage, avec témoin d'enregistrement."],
        ],
      },
      {
        title: "Sécurité — alarme désarmée",
        image: IMG + "08-securite-desarmee.png",
        text: "Après saisie d'un code à quatre chiffres et validation : l'état passe à « Désarmée · prête » en vert et le clavier se vide.",
        buttons: [
          ["✓", "Une nouvelle saisie suivie de ✓ réarme l'alarme."],
        ],
      },
      {
        title: "Version iPhone — Accueil",
        image: IMG + "09-iphone-accueil.png",
        portrait: true,
        text: "Sur smartphone, le rail devient une barre d'onglets en bas ; l'accueil garde le titre, la phrase d'état, le cadran, les actions rapides et les tuiles par étage.",
        buttons: [
          ["Barre d'onglets", "Accueil, Pièces, Éclairage, Climat, Médias, Sécurité."],
          ["BONJOUR · SOIRÉE · ABSENT · NUIT", "Mêmes actions rapides que sur la dalle."],
        ],
      },
      {
        title: "Version iPhone — Pièces",
        image: IMG + "10-iphone-pieces.png",
        portrait: true,
        text: "Les cartes de la pièce se placent en colonne ; les commandes sont identiques à la dalle.",
        buttons: [
          ["Cartes Éclairage · Climat · Audio · Stores · Sécurité", "Mêmes commandes que sur la dalle."],
        ],
      },
    ],
  },

  en: {
    intro:
      "A villa on Lake Geneva in Cologny, controlled from a flush-mounted Crestron TSW-1070, the living-room iPad and the owner's iPhone. “Obsidian” theme: charcoal background, a single cyan accent for everything active, condensed capitals, circular dials. Six pages — Home, Rooms, Lighting, Climate, Media, Security — reached through the icon rail on the left, which becomes a tab bar on the phone. The interface is translated into French, English and German.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        text: "The home page greets with “Good evening” or “Good morning” depending on the time, sums up the house in one sentence (doors locked, rooms lit, pool temperature) and shows the weather. Below: the climate of the active room, the four quick actions and the photo tiles of the chosen floor.",
        buttons: [
          ["Rail: Home · Rooms · Lighting · Climate · Media · Security", "Switches page; the active icon turns cyan with an underline. Date and time sit at the bottom of the rail."],
          ["Climate dial", "Measured temperature and setpoint of the selected room, with the current mode (Auto, Heating, Cooling). Read-only here; adjustment is on the Rooms and Climate pages."],
          ["MORNING", "Quick action: every indoor room to 70 %, outdoors off, all shades open."],
          ["EVENING", "Ground floor at 55 %, home cinema at 8 %, upstairs off, all shades closed. The active action stays outlined in cyan."],
          ["AWAY", "All lights off, shades closed, alarm armed and the four locks locked."],
          ["NIGHT", "Everything off except a 10 % night light in the bathroom, shades closed, locks locked."],
          ["GROUND FLOOR · UPSTAIRS · OUTDOORS", "Filters the tiles by floor; the active tab is underlined in cyan."],
          ["Room tiles", "Each tile shows the room temperature and activity (Music, Movie playing, Lit, Quiet); a cyan dot marks a light on. One tap selects the room and opens the Rooms page."],
        ],
      },
      {
        title: "Home — Upstairs",
        image: IMG + "02-accueil-etage.png",
        text: "The same home page after tapping UPSTAIRS: master suite, kids' room and bathroom. OUTDOORS shows the terrace and the pool.",
        buttons: [["Tiles Master suite · Kids' room · Bathroom", "Selects the room and opens its detail page."]],
      },
      {
        title: "Rooms",
        image: IMG + "03-pieces.png",
        text: "All rooms as pills at the top; the active room is detailed in five cards: Lighting, Climate, Audio, Shades, Security.",
        buttons: [
          ["Room pills", "Selects the room; the active pill turns cyan, a dot marks lit rooms."],
          ["⏻ OFF (header)", "Switches the room lighting off and cuts its audio source."],
          ["Lighting slider", "0 to 100 % level, value shown large above."],
          ["OFF · DIM · FULL", "Presets 0 %, 30 % and 100 %; the preset matching the current level shows in cyan."],
          ["− / + (Climate dial)", "Setpoint in 0.5 °C steps between 15 and 30 °C; the cyan arc and the dial knob follow the setpoint. On the terrace only the temperature is shown."],
          ["SPOTIFY · APPLE TV · RADIO", "Audio source of the room; tapping the active source again cuts it (“—”)."],
          ["⌃ OPEN · STOP · ⌄ CLOSE", "Room shade: open (0 %), stop mid-way (50 %) or closed (100 %); the state is spelled out. Absent for rooms without shades."],
          ["ARM · DISARM", "Arms or disarms the villa alarm; the state “Armed” or “Disarmed · ready” (green) is shown above."],
        ],
      },
      {
        title: "Lighting",
        image: IMG + "04-eclairage.png",
        text: "One line per room of the selected floor, with ON / OFF badge, slider, percentage and switch, then four lighting scenes for the floor.",
        buttons: [
          ["FLOOR OFF", "Switches off every light of the displayed floor."],
          ["ALL OFF", "Switches off every light of the villa."],
          ["GROUND FLOOR · UPSTAIRS · OUTDOORS", "Choice of the displayed floor."],
          ["Slider (per room)", "0 to 100 % level; the line lights up and the badge turns ON as soon as the level exceeds 0."],
          ["Switch (per room)", "Switches the room off, or back on at 70 %."],
          ["DIM · READING · DINNER · FULL", "Floor lighting scenes: every room of the floor to 25 %, 70 %, 45 % or 100 %."],
        ],
      },
      {
        title: "Climate",
        image: IMG + "05-climat.png",
        text: "General mode at the top right, then one dial per indoor room with the measured humidity.",
        buttons: [
          ["AUTO · HEATING · COOLING · OFF", "HVAC mode; the active mode is cyan and is reflected on the home page."],
          ["− / + (per dial)", "Room setpoint in 0.5 °C steps between 15 and 30 °C."],
          ["Room card", "Tapping the card selects the room (cyan outline), which updates the home page and the Media page."],
        ],
      },
      {
        title: "Media",
        image: IMG + "06-medias.png",
        text: "Now playing on the left (source, title, info, transport, volume), sources and audio zones on the right.",
        buttons: [
          ["⏮ / ⏭", "Previous / next source (Spotify, Apple TV, Radio, Turntable)."],
          ["⏯", "Play / pause; the label switches between “Playing” and “Paused”."],
          ["🔇 / 🔊 + slider", "Volume in 5 % steps or directly on the slider, value shown on the right."],
          ["Sources: Spotify · Apple TV · Radio · Turntable", "Selects the source and resumes playback; the active source is cyan with its current title."],
          ["Audio zones", "Turns the current source on or off in each room; an active room shows a cyan dot."],
        ],
      },
      {
        title: "Security",
        image: IMG + "07-securite.png",
        text: "Keypad on the left, locks and cameras on the right. The alarm state (“Armed · Stay” or “Disarmed · ready”) is shown at the top right.",
        buttons: [
          ["0 – 9", "Code entry (up to 6 digits); the four dots fill in."],
          ["←", "Deletes the last digit."],
          ["✓", "With at least 4 digits, toggles the alarm (armed ↔ disarmed) and clears the entry."],
          ["🔓 / 🔒 (per lock)", "Unlocks or locks the front door, garage, gate and terrace door; the state “Locked” (green) or “Unlocked” is shown next to it."],
          ["Cameras", "Thumbnails of the gate, front door, terrace door and garage, with a recording indicator."],
        ],
      },
      {
        title: "Security — alarm disarmed",
        image: IMG + "08-securite-desarmee.png",
        text: "After entering a four-digit code and confirming: the state turns to “Disarmed · ready” in green and the keypad clears.",
        buttons: [["✓", "A new entry followed by ✓ re-arms the alarm."]],
      },
      {
        title: "iPhone version — Home",
        image: IMG + "09-iphone-accueil.png",
        portrait: true,
        text: "On the phone the rail becomes a bottom tab bar; the home page keeps the title, status sentence, dial, quick actions and floor tiles.",
        buttons: [["Tab bar", "Home, Rooms, Lighting, Climate, Media, Security."], ["MORNING · EVENING · AWAY · NIGHT", "Same quick actions as on the panel."]],
      },
      {
        title: "iPhone version — Rooms",
        image: IMG + "10-iphone-pieces.png",
        portrait: true,
        text: "The room cards stack in one column; the controls are identical to the panel.",
        buttons: [["Cards Lighting · Climate · Audio · Shades · Security", "Same controls as on the panel."]],
      },
    ],
  },

  de: {
    intro:
      "Eine Villa am Genfersee in Cologny, gesteuert über ein eingebautes Crestron TSW-1070, das iPad im Wohnzimmer und das iPhone des Eigentümers. Thema «Obsidian»: anthrazitfarbener Hintergrund, ein einziger Cyan-Akzent für alles Aktive, schmale Versalien, runde Skalen. Sechs Seiten — Start, Räume, Licht, Klima, Medien, Sicherheit — über die Icon-Leiste links erreichbar, die auf dem Smartphone zur Tab-Leiste wird. Die Oberfläche ist auf Französisch, Englisch und Deutsch übersetzt.",
    sections: [
      {
        title: "Start",
        image: IMG + "01-accueil.png",
        text: "Die Startseite begrüsst je nach Uhrzeit mit «Guten Abend» oder «Guten Morgen», fasst das Haus in einem Satz zusammen (Türen verriegelt, beleuchtete Räume, Pooltemperatur) und zeigt das Wetter. Darunter: das Klima des aktiven Raums, die vier Schnellaktionen und die Fotokacheln der gewählten Etage.",
        buttons: [
          ["Leiste: Start · Räume · Licht · Klima · Medien · Sicherheit", "Wechselt die Seite; das aktive Symbol wird cyan mit Unterstrich. Unten in der Leiste Datum und Uhrzeit."],
          ["Klimaskala", "Gemessene Temperatur und Sollwert des gewählten Raums mit aktuellem Modus (Auto, Heizen, Kühlen). Hier nur Anzeige; die Einstellung erfolgt auf den Seiten Räume und Klima."],
          ["MORGEN", "Schnellaktion: alle Innenräume auf 70 %, Aussen aus, alle Storen offen."],
          ["ABEND", "Erdgeschoss auf 55 %, Heimkino auf 8 %, Obergeschoss aus, alle Storen geschlossen. Die aktive Aktion bleibt cyan umrandet."],
          ["ABWESEND", "Alle Lichter aus, Storen geschlossen, Alarm scharf und die vier Schlösser verriegelt."],
          ["NACHT", "Alles aus bis auf ein Nachtlicht mit 10 % im Bad, Storen geschlossen, Schlösser verriegelt."],
          ["ERDGESCHOSS · OBERGESCHOSS · AUSSEN", "Filtert die Kacheln nach Etage; der aktive Reiter ist cyan unterstrichen."],
          ["Raumkacheln", "Jede Kachel zeigt Temperatur und Aktivität des Raums (Musik, Film läuft, Beleuchtet, Ruhig); ein cyanfarbener Punkt markiert eingeschaltetes Licht. Ein Tipp wählt den Raum und öffnet die Seite Räume."],
        ],
      },
      {
        title: "Start — Obergeschoss",
        image: IMG + "02-accueil-etage.png",
        text: "Dieselbe Startseite nach einem Tipp auf OBERGESCHOSS: Elternsuite, Kinderzimmer und Bad. AUSSEN zeigt Terrasse und Pool.",
        buttons: [["Kacheln Elternsuite · Kinderzimmer · Bad", "Wählt den Raum und öffnet seine Detailseite."]],
      },
      {
        title: "Räume",
        image: IMG + "03-pieces.png",
        text: "Alle Räume als Pillen oben; der aktive Raum wird in fünf Karten detailliert: Licht, Klima, Audio, Storen, Sicherheit.",
        buttons: [
          ["Raumpillen", "Wählt den Raum; die aktive Pille wird cyan, ein Punkt markiert beleuchtete Räume."],
          ["⏻ AUS (Kopfzeile)", "Schaltet das Licht des Raums aus und trennt seine Audioquelle."],
          ["Regler Licht", "0 bis 100 %, Wert gross darüber angezeigt."],
          ["AUS · GEDIMMT · VOLL", "Voreinstellungen 0 %, 30 % und 100 %; die zum aktuellen Niveau passende Voreinstellung erscheint cyan."],
          ["− / + (Klimaskala)", "Sollwert in Schritten von 0,5 °C zwischen 15 und 30 °C; der cyanfarbene Bogen und der Knopf der Skala folgen dem Sollwert. Auf der Terrasse wird nur die Temperatur angezeigt."],
          ["SPOTIFY · APPLE TV · RADIO", "Audioquelle des Raums; ein erneuter Tipp auf die aktive Quelle trennt sie («—»)."],
          ["⌃ ÖFFNEN · STOPP · ⌄ SCHLIESSEN", "Store des Raums: offen (0 %), Stopp auf halber Höhe (50 %) oder geschlossen (100 %); der Zustand wird ausgeschrieben. Fehlt bei Räumen ohne Store."],
          ["SCHARF · UNSCHARF", "Schaltet die Alarmanlage der Villa scharf oder unscharf; der Zustand «Scharf» oder «Unscharf · bereit» (grün) steht darüber."],
        ],
      },
      {
        title: "Licht",
        image: IMG + "04-eclairage.png",
        text: "Eine Zeile pro Raum der gewählten Etage mit AN/AUS-Abzeichen, Regler, Prozentwert und Schalter, dann vier Lichtszenen für die Etage.",
        buttons: [
          ["ETAGE AUS", "Schaltet alle Lichter der angezeigten Etage aus."],
          ["ALLES AUS", "Schaltet alle Lichter der Villa aus."],
          ["ERDGESCHOSS · OBERGESCHOSS · AUSSEN", "Wahl der angezeigten Etage."],
          ["Regler (je Raum)", "0 bis 100 %; die Zeile leuchtet auf und das Abzeichen wechselt auf AN, sobald das Niveau über 0 liegt."],
          ["Schalter (je Raum)", "Schaltet den Raum aus oder wieder auf 70 % ein."],
          ["GEDIMMT · LESEN · ABENDESSEN · VOLL", "Lichtszenen der Etage: alle Räume der Etage auf 25 %, 70 %, 45 % oder 100 %."],
        ],
      },
      {
        title: "Klima",
        image: IMG + "05-climat.png",
        text: "Der allgemeine Modus oben rechts, dann eine Skala pro Innenraum mit gemessener Feuchte.",
        buttons: [
          ["AUTO · HEIZEN · KÜHLEN · AUS", "Modus der Klimaanlage; der aktive Modus ist cyan und spiegelt sich auf der Startseite."],
          ["− / + (je Skala)", "Sollwert des Raums in Schritten von 0,5 °C zwischen 15 und 30 °C."],
          ["Raumkarte", "Ein Tipp auf die Karte wählt den Raum (cyan Rahmen), was Startseite und Medienseite aktualisiert."],
        ],
      },
      {
        title: "Medien",
        image: IMG + "06-medias.png",
        text: "Aktuelle Wiedergabe links (Quelle, Titel, Infos, Transport, Lautstärke), Quellen und Audiozonen rechts.",
        buttons: [
          ["⏮ / ⏭", "Vorherige / nächste Quelle (Spotify, Apple TV, Radio, Plattenspieler)."],
          ["⏯", "Wiedergabe / Pause; die Beschriftung wechselt zwischen «Wiedergabe» und «Pause»."],
          ["🔇 / 🔊 + Regler", "Lautstärke in 5-%-Schritten oder direkt am Regler, Wert rechts angezeigt."],
          ["Quellen: Spotify · Apple TV · Radio · Plattenspieler", "Wählt die Quelle und startet die Wiedergabe; die aktive Quelle ist cyan mit ihrem aktuellen Titel."],
          ["Audiozonen", "Schaltet die aktuelle Quelle in jedem Raum ein oder aus; ein aktiver Raum zeigt einen cyanfarbenen Punkt."],
        ],
      },
      {
        title: "Sicherheit",
        image: IMG + "07-securite.png",
        text: "Codetastatur links, Schlösser und Kameras rechts. Der Alarmzustand («Scharf · Anwesend» oder «Unscharf · bereit») steht oben rechts.",
        buttons: [
          ["0 – 9", "Codeeingabe (bis 6 Ziffern); die vier Punkte füllen sich."],
          ["←", "Löscht die letzte Ziffer."],
          ["✓", "Mit mindestens 4 Ziffern wird der Alarm umgeschaltet (scharf ↔ unscharf) und die Eingabe geleert."],
          ["🔓 / 🔒 (je Schloss)", "Entriegelt oder verriegelt Haustür, Garage, Tor und Terrassentür; der Zustand «Verriegelt» (grün) oder «Entriegelt» steht daneben."],
          ["Kameras", "Kacheln von Tor, Haustür, Terrassentür und Garage mit Aufnahmeanzeige."],
        ],
      },
      {
        title: "Sicherheit — Alarm unscharf",
        image: IMG + "08-securite-desarmee.png",
        text: "Nach Eingabe eines vierstelligen Codes und Bestätigung: der Zustand wechselt grün auf «Unscharf · bereit» und die Tastatur wird geleert.",
        buttons: [["✓", "Eine neue Eingabe mit ✓ schaltet den Alarm wieder scharf."]],
      },
      {
        title: "iPhone-Version — Start",
        image: IMG + "09-iphone-accueil.png",
        portrait: true,
        text: "Auf dem Smartphone wird die Leiste zur unteren Tab-Leiste; die Startseite behält Titel, Statussatz, Skala, Schnellaktionen und Etagenkacheln.",
        buttons: [["Tab-Leiste", "Start, Räume, Licht, Klima, Medien, Sicherheit."], ["MORGEN · ABEND · ABWESEND · NACHT", "Dieselben Schnellaktionen wie auf dem Panel."]],
      },
      {
        title: "iPhone-Version — Räume",
        image: IMG + "10-iphone-pieces.png",
        portrait: true,
        text: "Die Raumkarten stapeln sich in einer Spalte; die Bedienung ist identisch mit dem Panel.",
        buttons: [["Karten Licht · Klima · Audio · Storen · Sicherheit", "Dieselben Bedienelemente wie auf dem Panel."]],
      },
    ],
  },
};
