// Fiche détaillée « Appartement Carouge » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/appartement-carouge/
// (iPhone en portrait pour 01-08, iPad pour 09-10).
const IMG = "/sheets/appartement-carouge/";

export default {
  fr: {
    intro:
      "Appartement familial à Carouge, piloté d'abord depuis l'iPhone, puis sur l'iPad, la dalle Crestron et le smartphone Android. Thème « Spectre » : fond anthracite et une couleur par système, reconnaissable avant même de lire — médias cyan, éclairage ambre, climat ardoise, stores rose, accès violet, sécurité vert, routines indigo. Sept pages : Accueil, Médias, Éclairage, Climat, Stores, Accès, Routines. Les quatre pilules d'ambiance (Bonjour, Soirée, Absent, Nuit) restent en haut de chaque page. L'interface est traduite en français, anglais et allemand.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        portrait: true,
        text:
          "Mosaïque de tuiles colorées avec leurs commandes directes : médias avec transport et volume, éclairage, climat avec ± consigne, stores, accès, interphone et routines. Un appui sur le corps d'une tuile ouvre la page correspondante.",
        buttons: [
          ["Bonjour", "Ambiance : toutes les pièces à 70 %, stores ouverts, Radio en lecture. La pilule active est blanche."],
          ["Soirée", "55 % partout sauf chambre des parents éteinte, stores fermés, Spotify en lecture."],
          ["Absent", "Tout éteint, stores fermés, lecture en pause, alarme armée et les quatre accès verrouillés."],
          ["Nuit", "Tout éteint sauf 5 % dans la chambre des enfants, stores fermés, pause, accès verrouillés."],
          ["⏮ ⏯ ⏭ (tuile Médias)", "Source précédente / suivante et lecture-pause ; le titre et l'état « En lecture / En pause » se mettent à jour."],
          ["Curseur volume", "Volume de la zone audio, 0 à 100."],
          ["Tuile Éclairage", "Niveau moyen des six pièces, scène active et nombre de pièces éclairées ; ouvre la page Éclairage."],
          ["− / + (tuile Climat)", "Consigne de la pièce sélectionnée par pas de 0,5 °C entre 16 et 26 °C ; le mode (Auto, Chauffage, Éco) s'affiche à côté."],
          ["Ouvrir · Stop · Fermer (tuile Stores)", "Tous les stores de l'appartement à 0 %, 50 % ou 100 % ; l'état global s'affiche (Ouverts, Mi-ouverts, Fermés)."],
          ["Tuile Accès", "État de l'alarme et nombre d'accès verrouillés ; ouvre la page Accès."],
          ["Sonnerie · Ouvrir la porte (tuile Interphone)", "Sonnerie simule un appel à la porte (la tuile affiche « Sonnerie ») ; Ouvrir la porte déverrouille la porte d'entrée et arrête la sonnerie."],
          ["Tuile Routines", "Routine active et son heure ; ouvre la page Routines."],
          ["Pièces (bas de page)", "Sélectionne la pièce de référence pour les médias et le climat (Salon, Cuisine, Chambre parents, Chambre enfants, Salle de bain, Bureau)."],
          ["Barre d'onglets", "Accueil, Médias, Éclairage, Climat, Stores, Accès ; sur smartphone, Routines s'ouvre depuis sa tuile."],
        ],
      },
      {
        title: "Médias",
        image: IMG + "02-medias.png",
        portrait: true,
        text: "Panneau cyan de lecture en cours, puis les quatre sources et les zones audio de l'appartement.",
        buttons: [
          ["⏮ ⏯ ⏭", "Source précédente / suivante (Spotify, Radio, TV, Enfants) et lecture-pause."],
          ["Curseur volume", "Volume, valeur affichée à droite."],
          ["Spotify · Radio · TV · Enfants", "Sélectionne la source et relance la lecture ; la source active est surlignée en cyan avec son titre en cours."],
          ["Zones", "Active ou coupe la diffusion dans chaque pièce ; une zone active affiche un point cyan."],
        ],
      },
      {
        title: "Éclairage",
        image: IMG + "03-eclairage.png",
        portrait: true,
        text: "Une carte ambre par pièce avec curseur et préréglages, puis les scènes globales.",
        buttons: [
          ["Curseur (par pièce)", "Niveau de 0 à 100 % ; la carte s'éclaire en ambre dès que la pièce est allumée."],
          ["Éteint · 40 % · 100 %", "Préréglages de la pièce ; celui qui correspond au niveau courant est mis en évidence."],
          ["Bonjour · Dîner · Film · Éteint", "Scènes globales : toutes les pièces à 70 %, 45 %, 8 % ou 0 %."],
          ["Tout éteindre", "Toutes les lumières à 0 %."],
        ],
      },
      {
        title: "Climat",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "Mode général, puis une carte ardoise par pièce : température mesurée, consigne, humidité et barre de 16 à 26 °C.",
        buttons: [
          ["Auto · Chauffage · Éco · Éteint", "Mode de la régulation ; le mode actif est mis en évidence et repris sur la tuile Climat de l'accueil."],
          ["− / + (par pièce)", "Consigne par pas de 0,5 °C entre 16 et 26 °C ; la flèche « → » indique la consigne visée."],
        ],
      },
      {
        title: "Stores",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Commande groupée en haut, puis une carte rose par pièce avec un visuel de lamelles qui descend avec la position.",
        buttons: [
          ["⌃ Ouvrir · Stop · ⌄ Fermer (Toutes les pièces)", "Tous les stores à 0 %, 50 % ou 100 %."],
          ["Curseur (par pièce)", "Position du store de 0 à 100 % ; l'état s'écrit Ouverts / Fermés ou en pourcentage."],
          ["⌃ / ⌄ (par pièce)", "Store entièrement ouvert ou fermé."],
        ],
      },
      {
        title: "Accès",
        image: IMG + "06-acces.png",
        portrait: true,
        text: "Interphone violet avec vue caméra de la porte et du portail, alarme en vert, puis la liste des quatre accès avec leur interrupteur.",
        buttons: [
          ["🔔 Sonnerie / Stop", "Simule ou arrête un appel à l'interphone."],
          ["📞 Répondre", "Prend l'appel et arrête la sonnerie."],
          ["🔓 Ouvrir la porte", "Déverrouille la porte d'entrée et arrête la sonnerie."],
          ["Armer · Désarmer", "Arme ou désarme l'alarme ; l'intitulé passe de « Alarme désarmée » à « Alarme armée »."],
          ["Interrupteurs Porte d'entrée · Portail · Garage · Cave", "Verrouille (violet) ou déverrouille chaque accès ; l'état s'affiche sous le nom."],
        ],
      },
      {
        title: "Accès — appel à l'interphone",
        image: IMG + "07-acces-sonnerie.png",
        portrait: true,
        text: "Pendant une sonnerie, le panneau Interphone affiche « Sonnerie », un témoin s'allume sur la vue caméra et le bouton Sonnerie devient Stop.",
        buttons: [
          ["Stop · Répondre · Ouvrir la porte", "Arrête la sonnerie, répond, ou ouvre la porte d'entrée."],
        ],
      },
      {
        title: "Routines",
        image: IMG + "08-routines.png",
        portrait: true,
        text: "Six routines familiales en cartes indigo, chacune avec son heure planifiée et son interrupteur. Sur smartphone, cette page s'ouvre depuis la tuile Routines de l'accueil.",
        buttons: [
          ["▶ Lancer / Active", "Lance la routine : Réveil = ambiance Bonjour ; Devoirs = chambre enfants 90 % stores ouverts, bureau 80 %, pause ; Dîner = cuisine 100 %, salon 45 %, Spotify ; Coucher = chambre enfants 10 % stores fermés, source Enfants à volume 25 ; Film = salon 8 % stores fermés, TV ; Week-end = ambiance Bonjour. La routine active affiche « Active »."],
          ["Interrupteur (routines planifiées)", "Active ou désactive la programmation (06:45, 16:30, 19:00, 20:30, 08:30) ; une routine désactivée apparaît estompée. Film n'a pas d'horaire."],
        ],
      },
      {
        title: "Version iPad / dalle — Accueil",
        image: IMG + "09-tablette-accueil.png",
        text: "Sur tablette et dalle, la navigation passe dans un rail à gauche avec les sept pages (Routines comprise) et les tuiles s'étalent sur trois colonnes, les pièces en pastilles en bas.",
        buttons: [
          ["Rail Accueil · Médias · Éclairage · Climat · Stores · Accès · Routines", "Change de page ; chaque entrée prend la couleur de son système."],
          ["Tuiles", "Mêmes commandes directes que sur le smartphone."],
        ],
      },
      {
        title: "Version iPad / dalle — Routines",
        image: IMG + "10-tablette-routines.png",
        text: "Les six routines sur une grille de trois colonnes.",
        buttons: [
          ["▶ Lancer · interrupteur", "Fonctionnement identique à la version smartphone."],
        ],
      },
    ],
  },

  en: {
    intro:
      "A family apartment in Carouge, run first from the iPhone, then on the iPad, the Crestron panel and the Android phone. “Spectrum” theme: charcoal background and one colour per system, recognisable before reading — cyan media, amber lighting, slate climate, pink shades, purple access, green security, indigo routines. Seven pages: Home, Media, Lighting, Climate, Shades, Access, Routines. The four mood pills (Morning, Evening, Away, Night) stay at the top of every page. The interface is translated into French, English and German.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        portrait: true,
        text: "A mosaic of coloured tiles with direct controls: media with transport and volume, lighting, climate with ± setpoint, shades, access, intercom and routines. Tapping the body of a tile opens the matching page.",
        buttons: [
          ["Morning", "Mood: every room to 70 %, shades open, Radio playing. The active pill is white."],
          ["Evening", "55 % everywhere except parents' room off, shades closed, Spotify playing."],
          ["Away", "Everything off, shades closed, playback paused, alarm armed and the four accesses locked."],
          ["Night", "Everything off except 5 % in the kids' room, shades closed, paused, accesses locked."],
          ["⏮ ⏯ ⏭ (Media tile)", "Previous / next source and play-pause; title and “Playing / Paused” state update."],
          ["Volume slider", "Audio zone volume, 0 to 100."],
          ["Lighting tile", "Average level of the six rooms, active scene and number of lit rooms; opens the Lighting page."],
          ["− / + (Climate tile)", "Setpoint of the selected room in 0.5 °C steps between 16 and 26 °C; the mode (Auto, Heating, Eco) is shown next to it."],
          ["Open · Stop · Close (Shades tile)", "Every shade of the apartment to 0 %, 50 % or 100 %; the global state is shown (Open, Half open, Closed)."],
          ["Access tile", "Alarm state and number of locked accesses; opens the Access page."],
          ["Ringing · Open door (Intercom tile)", "Ringing simulates a call at the door (the tile shows “Ringing”); Open door unlocks the front door and stops the ringing."],
          ["Routines tile", "Active routine and its time; opens the Routines page."],
          ["Rooms (bottom)", "Selects the reference room for media and climate (Living room, Kitchen, Parents' room, Kids' room, Bathroom, Office)."],
          ["Tab bar", "Home, Media, Lighting, Climate, Shades, Access; on the phone, Routines opens from its tile."],
        ],
      },
      {
        title: "Media",
        image: IMG + "02-medias.png",
        portrait: true,
        text: "Cyan now-playing panel, then the four sources and the apartment's audio zones.",
        buttons: [
          ["⏮ ⏯ ⏭", "Previous / next source (Spotify, Radio, TV, Kids) and play-pause."],
          ["Volume slider", "Volume, value shown on the right."],
          ["Spotify · Radio · TV · Kids", "Selects the source and resumes playback; the active source is highlighted in cyan with its current title."],
          ["Zones", "Turns playback on or off in each room; an active zone shows a cyan dot."],
        ],
      },
      {
        title: "Lighting",
        image: IMG + "03-eclairage.png",
        portrait: true,
        text: "One amber card per room with slider and presets, then the global scenes.",
        buttons: [
          ["Slider (per room)", "0 to 100 % level; the card lights up amber as soon as the room is on."],
          ["Off · 40 % · 100 %", "Room presets; the one matching the current level is highlighted."],
          ["Morning · Dinner · Movie · Off", "Global scenes: every room to 70 %, 45 %, 8 % or 0 %."],
          ["All off", "Every light to 0 %."],
        ],
      },
      {
        title: "Climate",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "General mode, then one slate card per room: measured temperature, setpoint, humidity and a 16–26 °C bar.",
        buttons: [
          ["Auto · Heating · Eco · Off", "Control mode; the active mode is highlighted and echoed on the home Climate tile."],
          ["− / + (per room)", "Setpoint in 0.5 °C steps between 16 and 26 °C; the “→” arrow shows the target setpoint."],
        ],
      },
      {
        title: "Shades",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Group command at the top, then one pink card per room with a slat visual that drops with the position.",
        buttons: [
          ["⌃ Open · Stop · ⌄ Close (All rooms)", "Every shade to 0 %, 50 % or 100 %."],
          ["Slider (per room)", "Shade position 0 to 100 %; the state reads Open / Closed or a percentage."],
          ["⌃ / ⌄ (per room)", "Shade fully open or closed."],
        ],
      },
      {
        title: "Access",
        image: IMG + "06-acces.png",
        portrait: true,
        text: "Purple intercom with the camera view of door and gate, alarm in green, then the list of four accesses with their switch.",
        buttons: [
          ["🔔 Ringing / Stop", "Simulates or stops an intercom call."],
          ["📞 Answer", "Takes the call and stops the ringing."],
          ["🔓 Open door", "Unlocks the front door and stops the ringing."],
          ["Arm · Disarm", "Arms or disarms the alarm; the title switches between “Alarm off” and “Alarm armed”."],
          ["Switches Front door · Gate · Garage · Cellar", "Locks (purple) or unlocks each access; the state is shown under the name."],
        ],
      },
      {
        title: "Access — intercom call",
        image: IMG + "07-acces-sonnerie.png",
        portrait: true,
        text: "While ringing, the Intercom panel shows “Ringing”, an indicator lights on the camera view and the Ringing button becomes Stop.",
        buttons: [["Stop · Answer · Open door", "Stops the ringing, answers, or opens the front door."]],
      },
      {
        title: "Routines",
        image: IMG + "08-routines.png",
        portrait: true,
        text: "Six family routines as indigo cards, each with its scheduled time and switch. On the phone this page opens from the Routines tile on the home screen.",
        buttons: [
          ["▶ Run / Active", "Runs the routine: Wake up = Morning mood; Homework = kids' room 90 % shades open, office 80 %, paused; Dinner = kitchen 100 %, living room 45 %, Spotify; Bedtime = kids' room 10 % shades closed, Kids source at volume 25; Movie = living room 8 % shades closed, TV; Weekend = Morning mood. The active routine shows “Active”."],
          ["Switch (scheduled routines)", "Enables or disables the schedule (06:45, 16:30, 19:00, 20:30, 08:30); a disabled routine is dimmed. Movie has no schedule."],
        ],
      },
      {
        title: "iPad / panel version — Home",
        image: IMG + "09-tablette-accueil.png",
        text: "On tablet and panel, navigation moves to a left rail with all seven pages (Routines included) and the tiles spread over three columns, rooms as pills at the bottom.",
        buttons: [
          ["Rail Home · Media · Lighting · Climate · Shades · Access · Routines", "Switches page; each entry takes its system colour."],
          ["Tiles", "Same direct controls as on the phone."],
        ],
      },
      {
        title: "iPad / panel version — Routines",
        image: IMG + "10-tablette-routines.png",
        text: "The six routines on a three-column grid.",
        buttons: [["▶ Run · switch", "Same behaviour as the phone version."]],
      },
    ],
  },

  de: {
    intro:
      "Eine Familienwohnung in Carouge, zuerst vom iPhone aus gesteuert, dann auf iPad, Crestron-Panel und Android-Smartphone. Thema «Spektrum»: anthrazitfarbener Hintergrund und eine Farbe pro System, erkennbar noch vor dem Lesen — Medien cyan, Licht bernstein, Klima schiefer, Storen rosa, Zugang violett, Sicherheit grün, Routinen indigo. Sieben Seiten: Start, Medien, Licht, Klima, Storen, Zugang, Routinen. Die vier Stimmungs-Pillen (Morgen, Abend, Abwesend, Nacht) bleiben oben auf jeder Seite. Die Oberfläche ist auf Französisch, Englisch und Deutsch übersetzt.",
    sections: [
      {
        title: "Start",
        image: IMG + "01-accueil.png",
        portrait: true,
        text: "Ein Mosaik farbiger Kacheln mit direkter Bedienung: Medien mit Transport und Lautstärke, Licht, Klima mit ± Sollwert, Storen, Zugang, Gegensprechanlage und Routinen. Ein Tipp auf den Kachelkörper öffnet die passende Seite.",
        buttons: [
          ["Morgen", "Stimmung: alle Räume auf 70 %, Storen offen, Radio läuft. Die aktive Pille ist weiss."],
          ["Abend", "55 % überall ausser Elternzimmer aus, Storen geschlossen, Spotify läuft."],
          ["Abwesend", "Alles aus, Storen geschlossen, Wiedergabe pausiert, Alarm scharf und die vier Zugänge verriegelt."],
          ["Nacht", "Alles aus bis auf 5 % im Kinderzimmer, Storen geschlossen, Pause, Zugänge verriegelt."],
          ["⏮ ⏯ ⏭ (Kachel Medien)", "Vorherige / nächste Quelle und Wiedergabe-Pause; Titel und Zustand «Wiedergabe / Pause» aktualisieren sich."],
          ["Lautstärkeregler", "Lautstärke der Audiozone, 0 bis 100."],
          ["Kachel Licht", "Mittleres Niveau der sechs Räume, aktive Szene und Anzahl beleuchteter Räume; öffnet die Seite Licht."],
          ["− / + (Kachel Klima)", "Sollwert des gewählten Raums in Schritten von 0,5 °C zwischen 16 und 26 °C; der Modus (Auto, Heizen, Eco) steht daneben."],
          ["Öffnen · Stopp · Schliessen (Kachel Storen)", "Alle Storen der Wohnung auf 0 %, 50 % oder 100 %; der Gesamtzustand wird angezeigt (Offen, Halb offen, Geschlossen)."],
          ["Kachel Zugang", "Alarmzustand und Anzahl verriegelter Zugänge; öffnet die Seite Zugang."],
          ["Klingelt · Tür öffnen (Kachel Gegensprechanlage)", "Klingelt simuliert einen Ruf an der Tür (die Kachel zeigt «Klingelt»); Tür öffnen entriegelt die Haustür und beendet das Klingeln."],
          ["Kachel Routinen", "Aktive Routine und ihre Uhrzeit; öffnet die Seite Routinen."],
          ["Räume (unten)", "Wählt den Referenzraum für Medien und Klima (Wohnzimmer, Küche, Elternzimmer, Kinderzimmer, Bad, Büro)."],
          ["Tab-Leiste", "Start, Medien, Licht, Klima, Storen, Zugang; auf dem Smartphone öffnen sich die Routinen über ihre Kachel."],
        ],
      },
      {
        title: "Medien",
        image: IMG + "02-medias.png",
        portrait: true,
        text: "Cyanfarbenes Wiedergabefeld, dann die vier Quellen und die Audiozonen der Wohnung.",
        buttons: [
          ["⏮ ⏯ ⏭", "Vorherige / nächste Quelle (Spotify, Radio, TV, Kinder) und Wiedergabe-Pause."],
          ["Lautstärkeregler", "Lautstärke, Wert rechts angezeigt."],
          ["Spotify · Radio · TV · Kinder", "Wählt die Quelle und startet die Wiedergabe; die aktive Quelle ist cyan hervorgehoben mit ihrem aktuellen Titel."],
          ["Zonen", "Schaltet die Wiedergabe in jedem Raum ein oder aus; eine aktive Zone zeigt einen cyanfarbenen Punkt."],
        ],
      },
      {
        title: "Licht",
        image: IMG + "03-eclairage.png",
        portrait: true,
        text: "Eine bernsteinfarbene Karte pro Raum mit Regler und Voreinstellungen, dann die globalen Szenen.",
        buttons: [
          ["Regler (je Raum)", "0 bis 100 %; die Karte leuchtet bernsteinfarben, sobald der Raum eingeschaltet ist."],
          ["Aus · 40 % · 100 %", "Voreinstellungen des Raums; die zum aktuellen Niveau passende ist hervorgehoben."],
          ["Morgen · Abendessen · Film · Aus", "Globale Szenen: alle Räume auf 70 %, 45 %, 8 % oder 0 %."],
          ["Alles aus", "Alle Lichter auf 0 %."],
        ],
      },
      {
        title: "Klima",
        image: IMG + "04-climat.png",
        portrait: true,
        text: "Allgemeiner Modus, dann eine schieferfarbene Karte pro Raum: gemessene Temperatur, Sollwert, Feuchte und Balken von 16 bis 26 °C.",
        buttons: [
          ["Auto · Heizen · Eco · Aus", "Regelmodus; der aktive Modus ist hervorgehoben und wird auf der Klima-Kachel der Startseite übernommen."],
          ["− / + (je Raum)", "Sollwert in Schritten von 0,5 °C zwischen 16 und 26 °C; der Pfeil «→» zeigt den Zielsollwert."],
        ],
      },
      {
        title: "Storen",
        image: IMG + "05-stores.png",
        portrait: true,
        text: "Gruppenbefehl oben, dann eine rosa Karte pro Raum mit einer Lamellengrafik, die mit der Position absinkt.",
        buttons: [
          ["⌃ Öffnen · Stopp · ⌄ Schliessen (Alle Räume)", "Alle Storen auf 0 %, 50 % oder 100 %."],
          ["Regler (je Raum)", "Storenposition 0 bis 100 %; der Zustand lautet Offen / Geschlossen oder Prozent."],
          ["⌃ / ⌄ (je Raum)", "Store ganz offen oder geschlossen."],
        ],
      },
      {
        title: "Zugang",
        image: IMG + "06-acces.png",
        portrait: true,
        text: "Violette Gegensprechanlage mit Kamerabild von Tür und Tor, Alarm in Grün, dann die Liste der vier Zugänge mit Schalter.",
        buttons: [
          ["🔔 Klingelt / Stopp", "Simuliert oder beendet einen Ruf an der Gegensprechanlage."],
          ["📞 Antworten", "Nimmt den Ruf an und beendet das Klingeln."],
          ["🔓 Tür öffnen", "Entriegelt die Haustür und beendet das Klingeln."],
          ["Scharf · Unscharf", "Schaltet den Alarm scharf oder unscharf; der Titel wechselt zwischen «Alarm aus» und «Alarm scharf»."],
          ["Schalter Haustür · Tor · Garage · Keller", "Verriegelt (violett) oder entriegelt jeden Zugang; der Zustand steht unter dem Namen."],
        ],
      },
      {
        title: "Zugang — Ruf an der Gegensprechanlage",
        image: IMG + "07-acces-sonnerie.png",
        portrait: true,
        text: "Während des Klingelns zeigt das Feld Gegensprechanlage «Klingelt», eine Anzeige leuchtet im Kamerabild und die Taste Klingelt wird zu Stopp.",
        buttons: [["Stopp · Antworten · Tür öffnen", "Beendet das Klingeln, antwortet oder öffnet die Haustür."]],
      },
      {
        title: "Routinen",
        image: IMG + "08-routines.png",
        portrait: true,
        text: "Sechs Familienroutinen als indigofarbene Karten, jede mit geplanter Uhrzeit und Schalter. Auf dem Smartphone öffnet sich diese Seite über die Kachel Routinen der Startseite.",
        buttons: [
          ["▶ Starten / Aktiv", "Startet die Routine: Aufstehen = Stimmung Morgen; Hausaufgaben = Kinderzimmer 90 % Storen offen, Büro 80 %, Pause; Abendessen = Küche 100 %, Wohnzimmer 45 %, Spotify; Schlafenszeit = Kinderzimmer 10 % Storen geschlossen, Quelle Kinder mit Lautstärke 25; Film = Wohnzimmer 8 % Storen geschlossen, TV; Wochenende = Stimmung Morgen. Die aktive Routine zeigt «Aktiv»."],
          ["Schalter (geplante Routinen)", "Aktiviert oder deaktiviert die Planung (06:45, 16:30, 19:00, 20:30, 08:30); eine deaktivierte Routine erscheint abgeblendet. Film hat keine Uhrzeit."],
        ],
      },
      {
        title: "iPad-/Panel-Version — Start",
        image: IMG + "09-tablette-accueil.png",
        text: "Auf Tablet und Panel wandert die Navigation in eine Leiste links mit allen sieben Seiten (inklusive Routinen), die Kacheln verteilen sich auf drei Spalten, die Räume als Pillen unten.",
        buttons: [
          ["Leiste Start · Medien · Licht · Klima · Storen · Zugang · Routinen", "Wechselt die Seite; jeder Eintrag nimmt die Farbe seines Systems an."],
          ["Kacheln", "Dieselbe direkte Bedienung wie auf dem Smartphone."],
        ],
      },
      {
        title: "iPad-/Panel-Version — Routinen",
        image: IMG + "10-tablette-routines.png",
        text: "Die sechs Routinen in einem dreispaltigen Raster.",
        buttons: [["▶ Starten · Schalter", "Gleiches Verhalten wie in der Smartphone-Version."]],
      },
    ],
  },
};
