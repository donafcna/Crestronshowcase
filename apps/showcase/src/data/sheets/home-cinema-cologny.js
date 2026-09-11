// Fiche détaillée « Home Cinéma Cologny » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/home-cinema-cologny/
// (dalle TSW-1070 et iPhone, simulateur React HomeCinemaCologny).
const IMG = "/sheets/home-cinema-cologny/";

export default {
  fr: {
    intro:
      "L'interface de la salle de cinéma est pensée pour une soirée sans effort : une activité (Film, Sport, Concert, Jeux) prépare toute la salle en un appui, puis cinq onglets (Regarder, Sources, Lumières, Audio, Sièges) donnent accès à chaque détail. L'en-tête rappelle en permanence l'état du projecteur et propose l'extinction générale. Même interface sur la dalle TSW-1070 et l'iPad ; sur iPhone les onglets passent en bas d'écran. Traduite en français, anglais et allemand.",
    sections: [
      {
        title: "Regarder — salle en veille",
        image: IMG + "01-regarder-veille.png",
        text: "État initial : projecteur en veille, aucune source, éclairage de service (plafond 70 %, marches 60 %, appliques 50 %). La zone « En lecture » reste vide tant qu'aucune source n'est choisie.",
        buttons: [
          ["Regarder · Sources · Lumières · Audio · Sièges", "Navigation latérale ; l'onglet actif s'encadre de doré."],
          ["Veille / Préchauffage… / Prêt (pastille)", "État du projecteur remonté en permanence dans l'en-tête."],
          ["⏻ Tout éteindre (en-tête)", "Extinction générale : source coupée, projecteur en veille, lumières de service rétablies, masquage 16:9, sièges remis à plat et chauffage coupé."],
          ["Film · Sport · Concert · Jeux", "Activités en un appui : chacune sélectionne sa source (Kaleidescape, Sky Q, Apple TV 4K, PlayStation 5), son masquage, son mode sonore et, après 0,9 s de « Préparation de la salle… », ses niveaux d'éclairage, puis lance la lecture. Le projecteur passe en préchauffage s'il était en veille."],
          ["Tout éteindre (tuile)", "Même fonction que le bouton de l'en-tête."],
          ["⏮ ▶ ⏭", "Recule de 30 s, lecture / pause (inactif sans source), avance de 30 s ; le chrono et la barre de progression avancent en lecture."],
          ["Projecteur · JVC NZ9 — ON / OFF", "Allume le projecteur (Préchauffage… ≈ 3 s puis Prêt, en vert) ou le met en veille."],
          ["Écran · Masquage — 16:9 / 2.39", "Commande le masquage motorisé de l'écran ; le format actif est doré."],
        ],
      },
      {
        title: "Préchauffage du projecteur",
        image: IMG + "02-preparation-salle.png",
        text: "Juste après l'appui sur Film : la tuile s'allume en doré, la source Kaleidescape est chargée, le masquage passe en 2.39 et le projecteur affiche « Préchauffage… » en ambre.",
        buttons: [
          ["Film (active)", "Reste surlignée tant que l'activité est en cours."],
        ],
      },
      {
        title: "Regarder — film en cours",
        image: IMG + "03-regarder-film.png",
        text: "Projecteur « Prêt » : l'interface s'assombrit automatiquement (mode salle obscure) pour ne pas gêner la projection. Le titre, le format et le chrono du film sont affichés.",
        buttons: [
          ["⏸ (doré)", "Met en pause ; l'état « Lecture » / « Pause » s'affiche à droite des commandes."],
          ["OFF (projecteur)", "Remet le projecteur en veille sans couper la source."],
        ],
      },
      {
        title: "Sources",
        image: IMG + "04-sources.png",
        text: "Les quatre sources de la salle avec le contenu en cours sur chacune.",
        buttons: [
          ["Kaleidescape · Apple TV 4K · Sky Q · PlayStation 5", "Sélectionne la source et lance la lecture ; une coche verte marque la source active. Si le projecteur est en veille, il passe en préchauffage."],
        ],
      },
      {
        title: "Lumières",
        image: IMG + "05-lumieres.png",
        text: "Quatre zones graduées : plafond d'ambiance, marches LED, appliques et ciel étoilé, avec des raccourcis d'ambiance.",
        buttons: [
          ["100 % · Ambiance · Regarder · OFF (raccourcis)", "Presets des quatre zones : service (70/60/50/0), ambiance tamisée (15/25/10/40), projection (0/10/0/30) ou tout éteint."],
          ["− / +", "Ajuste la zone par pas de 10 %."],
          ["Curseur", "Réglage continu de 0 à 100 % ; la carte de la zone s'allume quand le niveau est supérieur à 0."],
          ["⏻ (par zone)", "Éteint la zone ou la rallume à 60 %."],
        ],
      },
      {
        title: "Audio",
        image: IMG + "06-audio.png",
        text: "Processeur Trinnov Altitude 32 : molette de volume, modes sonores, niveau du caisson et vumètre animé pendant la lecture.",
        buttons: [
          ["− / +", "Volume par pas de 2 ; la molette tourne avec la valeur."],
          ["🔊 / 🔇", "Coupure du son : la valeur devient « — » et le vumètre s'éteint."],
          ["Dolby Atmos · DTS:X · Musique · Jeu · Stéréo", "Mode sonore du processeur ; le mode actif est doré (les activités le règlent automatiquement)."],
          ["Caisson (curseur −10 / +10 dB)", "Correction du niveau du caisson de basses, affichée en dB."],
        ],
      },
      {
        title: "Sièges",
        image: IMG + "07-sieges.png",
        text: "Plan des sept fauteuils Cineak sur deux rangées face à l'écran. Ici le siège 5 est sélectionné, incliné en position 2 et chauffé.",
        buttons: [
          ["Fauteuils 1 – 7", "Sélectionne le fauteuil à régler (cadre doré) ; un fauteuil chauffé est teinté."],
          ["Inclinaison — OFF · 1 · 2 · 3", "Position du dossier motorisé du fauteuil sélectionné."],
          ["Chauffage (interrupteur)", "Chauffage de l'assise du fauteuil sélectionné."],
          ["Tous — Inclinaison 2 · Chauffage ON · OFF", "Commande groupée des sept fauteuils : inclinaison 2, chauffage pour tous, ou remise à plat et chauffage coupé."],
        ],
      },
      {
        title: "iPhone — Regarder",
        image: IMG + "08-iphone-regarder.png",
        portrait: true,
        text: "Sur smartphone, les activités passent en grille compacte et la navigation devient une barre d'onglets en bas ; le bouton Tout éteindre de l'en-tête est remplacé par la tuile.",
        buttons: [
          ["Onglets bas", "Regarder, Sources, Lumières, Audio, Sièges."],
          ["Activités · lecteur · projecteur · masquage", "Mêmes fonctions que sur la dalle."],
        ],
      },
      {
        title: "iPhone — Sièges",
        image: IMG + "09-iphone-sieges.png",
        portrait: true,
        text: "Le plan des fauteuils et les réglages du siège sélectionné en colonne.",
        buttons: [
          ["Fauteuils · Inclinaison · Chauffage · Tous", "Identiques à la dalle."],
        ],
      },
    ],
  },

  en: {
    intro:
      "The cinema room interface is designed for an effortless evening: an activity (Movie, Sports, Concert, Gaming) prepares the whole room in one tap, then five tabs (Watch, Sources, Lights, Audio, Seats) give access to every detail. The header always shows the projector state and offers the all-off command. Same interface on the TSW-1070 panel and the iPad; on iPhone the tabs move to the bottom. Translated into French, English and German.",
    sections: [
      {
        title: "Watch — room in standby",
        image: IMG + "01-regarder-veille.png",
        text: "Initial state: projector in standby, no source, service lighting (ceiling 70 %, steps 60 %, sconces 50 %). The “Now playing” area stays empty until a source is chosen.",
        buttons: [
          ["Watch · Sources · Lights · Audio · Seats", "Side navigation; the active tab is outlined in gold."],
          ["Standby / Warming up… / Ready (pill)", "Projector state permanently reported in the header."],
          ["⏻ All off (header)", "General shutdown: source cleared, projector to standby, service lights restored, 16:9 masking, seats flattened and heating off."],
          ["Movie · Sports · Concert · Gaming", "One-tap activities: each selects its source (Kaleidescape, Sky Q, Apple TV 4K, PlayStation 5), its masking, its sound mode and, after 0.9 s of “Preparing the room…”, its lighting levels, then starts playback. The projector starts warming up if it was in standby."],
          ["All off (tile)", "Same function as the header button."],
          ["⏮ ▶ ⏭", "Back 30 s, play / pause (inactive without a source), forward 30 s; the timer and progress bar advance during playback."],
          ["Projector · JVC NZ9 — ON / OFF", "Turns the projector on (Warming up… ≈ 3 s then Ready, in green) or puts it in standby."],
          ["Screen · Masking — 16:9 / 2.39", "Drives the motorised screen masking; the active format is gold."],
        ],
      },
      { title: "Projector warming up", image: IMG + "02-preparation-salle.png", text: "Right after tapping Movie: the tile lights up gold, the Kaleidescape source is loaded, masking switches to 2.39 and the projector shows “Warming up…” in amber.", buttons: [["Movie (active)", "Stays highlighted while the activity is running."]] },
      { title: "Watch — movie playing", image: IMG + "03-regarder-film.png", text: "Projector “Ready”: the interface dims automatically (dark-room mode) so as not to disturb the projection. Title, format and movie timer are displayed.", buttons: [["⏸ (gold)", "Pauses; the “Playing” / “Paused” state shows to the right of the controls."], ["OFF (projector)", "Puts the projector back to standby without clearing the source."]] },
      { title: "Sources", image: IMG + "04-sources.png", text: "The four sources of the room with the content currently on each.", buttons: [["Kaleidescape · Apple TV 4K · Sky Q · PlayStation 5", "Selects the source and starts playback; a green tick marks the active source. If the projector is in standby, it starts warming up."]] },
      { title: "Lights", image: IMG + "05-lumieres.png", text: "Four dimmable zones: ceiling ambience, LED steps, sconces and star ceiling, with mood shortcuts.", buttons: [["100 % · Ambience · Watch · OFF (shortcuts)", "Presets of the four zones: service (70/60/50/0), dimmed mood (15/25/10/40), projection (0/10/0/30) or all off."], ["− / +", "Adjusts the zone in 10 % steps."], ["Slider", "Continuous 0–100 % adjustment; the zone card lights up when the level is above 0."], ["⏻ (per zone)", "Switches the zone off or back on at 60 %."]] },
      { title: "Audio", image: IMG + "06-audio.png", text: "Trinnov Altitude 32 processor: volume dial, sound modes, subwoofer trim and animated VU meter during playback.", buttons: [["− / +", "Volume in steps of 2; the dial turns with the value."], ["🔊 / 🔇", "Mute: the value becomes “—” and the VU meter goes off."], ["Dolby Atmos · DTS:X · Music · Game · Stéréo", "Processor sound mode; the active mode is gold (activities set it automatically)."], ["Subwoofer (slider −10 / +10 dB)", "Subwoofer level trim, shown in dB."]] },
      { title: "Seats", image: IMG + "07-sieges.png", text: "Map of the seven Cineak recliners on two rows facing the screen. Here seat 5 is selected, reclined to position 2 and heated.", buttons: [["Seats 1 – 7", "Selects the seat to adjust (gold frame); a heated seat is tinted."], ["Recline — OFF · 1 · 2 · 3", "Motorised backrest position of the selected seat."], ["Heating (switch)", "Seat heating of the selected seat."], ["All — Recline 2 · Heating ON · OFF", "Group command of the seven seats: recline 2, heating for all, or flatten and heating off."]] },
      { title: "iPhone — Watch", image: IMG + "08-iphone-regarder.png", portrait: true, text: "On a smartphone the activities become a compact grid and navigation turns into a bottom tab bar; the header All off button is replaced by the tile.", buttons: [["Bottom tabs", "Watch, Sources, Lights, Audio, Seats."], ["Activities · player · projector · masking", "Same functions as on the panel."]] },
      { title: "iPhone — Seats", image: IMG + "09-iphone-sieges.png", portrait: true, text: "The seat map and the selected seat settings in a column.", buttons: [["Seats · Recline · Heating · All", "Identical to the panel."]] },
    ],
  },

  de: {
    intro:
      "Die Oberfläche des Kinosaals ist für einen mühelosen Abend gedacht: eine Aktivität (Film, Sport, Konzert, Gaming) bereitet den ganzen Saal mit einem Tipp vor, dann geben fünf Reiter (Ansehen, Quellen, Licht, Audio, Sitze) Zugriff auf jedes Detail. Die Kopfzeile zeigt stets den Projektorstatus und bietet das Gesamt-Aus. Dieselbe Oberfläche auf dem TSW-1070-Panel und dem iPad; auf dem iPhone wandern die Reiter nach unten. Übersetzt in Französisch, Englisch und Deutsch.",
    sections: [
      {
        title: "Ansehen — Saal im Standby",
        image: IMG + "01-regarder-veille.png",
        text: "Ausgangszustand: Projektor im Standby, keine Quelle, Servicebeleuchtung (Decke 70 %, Stufen 60 %, Wandleuchten 50 %). Der Bereich „Läuft gerade“ bleibt leer, bis eine Quelle gewählt ist.",
        buttons: [
          ["Ansehen · Quellen · Licht · Audio · Sitze", "Seitliche Navigation; der aktive Reiter ist gold umrandet."],
          ["Standby / Aufwärmen… / Bereit (Pille)", "Projektorstatus, dauerhaft in der Kopfzeile gemeldet."],
          ["⏻ Alles aus (Kopfzeile)", "Gesamtabschaltung: Quelle gelöscht, Projektor im Standby, Servicelicht wiederhergestellt, Maskierung 16:9, Sitze flach und Heizung aus."],
          ["Film · Sport · Konzert · Gaming", "Aktivitäten per Tipp: jede wählt ihre Quelle (Kaleidescape, Sky Q, Apple TV 4K, PlayStation 5), ihre Maskierung, ihren Klangmodus und nach 0,9 s „Saal wird vorbereitet…“ ihre Lichtniveaus, dann startet die Wiedergabe. Der Projektor beginnt aufzuwärmen, wenn er im Standby war."],
          ["Alles aus (Kachel)", "Dieselbe Funktion wie die Taste in der Kopfzeile."],
          ["⏮ ▶ ⏭", "30 s zurück, Wiedergabe / Pause (ohne Quelle inaktiv), 30 s vor; Zeit und Fortschrittsbalken laufen während der Wiedergabe."],
          ["Projektor · JVC NZ9 — EIN / AUS", "Schaltet den Projektor ein (Aufwärmen… ≈ 3 s, dann Bereit in Grün) oder in den Standby."],
          ["Leinwand · Maskierung — 16:9 / 2.39", "Steuert die motorisierte Leinwandmaskierung; das aktive Format ist gold."],
        ],
      },
      { title: "Projektor wärmt auf", image: IMG + "02-preparation-salle.png", text: "Direkt nach dem Tipp auf Film: die Kachel leuchtet gold, die Quelle Kaleidescape ist geladen, die Maskierung wechselt auf 2.39 und der Projektor zeigt „Aufwärmen…“ in Bernstein.", buttons: [["Film (aktiv)", "Bleibt hervorgehoben, solange die Aktivität läuft."]] },
      { title: "Ansehen — Film läuft", image: IMG + "03-regarder-film.png", text: "Projektor „Bereit“: die Oberfläche dunkelt automatisch ab (Dunkelsaal-Modus), um die Projektion nicht zu stören. Titel, Format und Filmzeit werden angezeigt.", buttons: [["⏸ (gold)", "Pausiert; der Status „Wiedergabe“ / „Pause“ erscheint rechts neben den Tasten."], ["AUS (Projektor)", "Schaltet den Projektor in den Standby, ohne die Quelle zu löschen."]] },
      { title: "Quellen", image: IMG + "04-sources.png", text: "Die vier Quellen des Saals mit dem jeweils laufenden Inhalt.", buttons: [["Kaleidescape · Apple TV 4K · Sky Q · PlayStation 5", "Wählt die Quelle und startet die Wiedergabe; ein grünes Häkchen markiert die aktive Quelle. Ist der Projektor im Standby, beginnt er aufzuwärmen."]] },
      { title: "Licht", image: IMG + "05-lumieres.png", text: "Vier dimmbare Zonen: Deckenlicht, LED-Stufen, Wandleuchten und Sternenhimmel, mit Stimmungs-Schnellzugriffen.", buttons: [["100 % · Ambiente · Ansehen · AUS (Schnellzugriff)", "Presets der vier Zonen: Service (70/60/50/0), gedimmte Stimmung (15/25/10/40), Projektion (0/10/0/30) oder alles aus."], ["− / +", "Stellt die Zone in 10-%-Schritten ein."], ["Regler", "Stufenlose Einstellung 0–100 %; die Zonenkarte leuchtet, wenn das Niveau über 0 liegt."], ["⏻ (pro Zone)", "Schaltet die Zone aus oder wieder auf 60 % ein."]] },
      { title: "Audio", image: IMG + "06-audio.png", text: "Prozessor Trinnov Altitude 32: Lautstärkerad, Klangmodi, Subwoofer-Pegel und animierte VU-Anzeige während der Wiedergabe.", buttons: [["− / +", "Lautstärke in 2er-Schritten; das Rad dreht sich mit dem Wert."], ["🔊 / 🔇", "Stummschaltung: der Wert wird „—“ und die VU-Anzeige erlischt."], ["Dolby Atmos · DTS:X · Musik · Spiel · Stéréo", "Klangmodus des Prozessors; der aktive Modus ist gold (Aktivitäten setzen ihn automatisch)."], ["Subwoofer (Regler −10 / +10 dB)", "Pegelkorrektur des Subwoofers, in dB angezeigt."]] },
      { title: "Sitze", image: IMG + "07-sieges.png", text: "Plan der sieben Cineak-Sessel in zwei Reihen vor der Leinwand. Hier ist Sitz 5 gewählt, in Position 2 geneigt und beheizt.", buttons: [["Sitze 1 – 7", "Wählt den einzustellenden Sessel (goldener Rahmen); ein beheizter Sessel ist getönt."], ["Neigung — AUS · 1 · 2 · 3", "Motorisierte Rückenlehnenposition des gewählten Sessels."], ["Heizung (Schalter)", "Sitzheizung des gewählten Sessels."], ["Alle — Neigung 2 · Heizung EIN · AUS", "Gruppenbefehl für die sieben Sessel: Neigung 2, Heizung für alle, oder flach und Heizung aus."]] },
      { title: "iPhone — Ansehen", image: IMG + "08-iphone-regarder.png", portrait: true, text: "Auf dem Smartphone werden die Aktivitäten zu einem kompakten Raster und die Navigation zu einer unteren Reiterleiste; die Taste Alles aus der Kopfzeile wird durch die Kachel ersetzt.", buttons: [["Reiter unten", "Ansehen, Quellen, Licht, Audio, Sitze."], ["Aktivitäten · Player · Projektor · Maskierung", "Dieselben Funktionen wie auf dem Panel."]] },
      { title: "iPhone — Sitze", image: IMG + "09-iphone-sieges.png", portrait: true, text: "Der Sitzplan und die Einstellungen des gewählten Sitzes in einer Spalte.", buttons: [["Sitze · Neigung · Heizung · Alle", "Identisch mit dem Panel."]] },
    ],
  },
};
