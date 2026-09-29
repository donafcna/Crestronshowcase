// Fiche détaillée « Showroom Fréquence TV Nyon » : chaque écran du GUI, avec capture et explication de chaque
// bouton. Captures : public/sheets/showroom-ftv-nyon/ (batterie projects/showroom-ftv-nyon/ch5/tools/qa-showroom.cjs,
// dalle 1280 × 800 et iPhone 440 × 863, puis scripts/helpers/png-1400-256.py).
const IMG = "/sheets/showroom-ftv-nyon/";

export default {
  fr: {
    intro:
      "L'interface Crestron Home de la dalle TSW-1070 posée à l'entrée de notre showroom de Nyon, recréée à l'identique en CH5 pour la dalle, l'iPad, l'iPhone et le XPanel. Six espaces sur deux niveaux (Aquarium, bureaux JURA et LAC, Open Space, showroom Bang & Olufsen, stock). Un seul fichier JSON décrit les pièces, les photos, les actions, les circuits, les services et les signaux : il est lu par le GUI, par le programme C# du slot 1 et par le générateur du programme SIMPL du slot 2. Chaque bouton reçoit son état du processeur, jamais de l'écran.",
    sections: [
      {
        title: "Accueil « Fréquence TV »",
        image: IMG + "01-accueil.png",
        image2: IMG + "02-accueil-en-marche.png",
        text: "L'accueil reprend la photo du showroom et les six actions de la maison. La rangée Controls résume l'état de tout le bâtiment : nombre de circuits allumés, musique en lecture, caméras. En bas, la barre commune à toutes les pages ; quand une pièce joue, la pastille « Deezer in … » ramène à son lecteur en un appui.",
        buttons: [
          ["Welcome · Goodbye · Party Time ! · Default Lights · Relax · B&O Products", "Actions maison : chacune applique une scène dans les pièces qui la possèdent (ou un niveau par défaut), Goodbye éteint tout, Party Time lance aussi la musique au showroom B&O."],
          ["Lights", "Liste des pièces avec leur état ; extinction ou allumage pièce par pièce, et extinction générale."],
          ["Music · Cameras", "Ouvre le lecteur de la pièce en cours de lecture, ou la liste des caméras."],
          ["Home · Rooms · Marche/Arrêt", "Navigation principale. Sur l'accueil, le bouton Marche/Arrêt demande confirmation avant d'éteindre toute la maison."],
        ],
      },
      {
        title: "Rooms : étages et favoris",
        image: IMG + "03-rooms.png",
        image2: IMG + "04-favoris.png",
        text: "Les pièces sont groupées par étage (First Floor, Main Floor), chacune avec sa photo. Une ampoule jaune signale une pièce éclairée. Les favoris se choisissent par un appui long sur une carte et sont mémorisés sur l'écran ; sans favori, l'illustration « No favorites added » s'affiche comme sur la dalle d'origine.",
        buttons: [
          ["All · Favorites · First Floor · Main Floor", "Filtres de la liste."],
          ["Titre d'étage", "Replie ou déplie l'étage."],
          ["Carte de pièce", "Ouvre la pièce ; appui long : ajoute ou retire des favoris."],
        ],
      },
      {
        title: "Une pièce : actions et services",
        image: IMG + "05-piece-bo.png",
        text: "Le showroom Bang & Olufsen après « Party Time ! » : scène d'éclairage Party Lights, Deezer en lecture (la tuile Music prend la pochette) et Apple TV sur l'écran. La ligne sous le nom résume l'état (« Lights are on. Deezer is on. »). Le curseur de la barre du bas règle le volume de la pièce.",
        buttons: [
          ["Actions de la pièce", "Scène d'éclairage et/ou source musicale, définies pièce par pièce dans le JSON."],
          ["Lights (deux ronds)", "Tout éteindre / tout allumer ; appui sur la tuile : fenêtre Lights."],
          ["Music · Video", "Lecteur ou choix de la musique ; sources vidéo et télécommande."],
          ["Marche/Arrêt", "Éteint la pièce : éclairages, musique et vidéo."],
        ],
      },
      {
        title: "Fenêtre Lights",
        image: IMG + "06-lights-bo.png",
        text: "Treize circuits au showroom B&O, en quatre colonnes pour tout voir sans défilement. La scène active est entourée ; un réglage manuel la désélectionne. Chaque circuit affiche son niveau réel et se commande par l'interrupteur ou le curseur.",
        buttons: [
          ["Scenes", "B&O Products Lights, Default Lights, My scene 7, Party Lights, Relax Lights : niveaux circuit par circuit dans le JSON."],
          ["All Lights − / +", "Baisse ou monte tous les circuits de 10 %."],
          ["Interrupteur", "Éteint le circuit ou le rallume à son dernier niveau."],
          ["Curseur", "Niveau de 0 à 100 %."],
        ],
      },
      {
        title: "Musique : choix, lecteur, minuterie",
        image: IMG + "07-select-music.png",
        image2: IMG + "08-lecteur.png",
        text: "Select Music propose les services de la pièce (Deezer, Apple TV) et les favoris. Le lecteur affiche pochette, titre, progression et commandes ; la barre du bas donne accès à Parcourir (Flow, Charts, New Releases, Mixes, Genres, My Library), au lecteur, aux réglages et au volume. La minuterie de veille éteint tous les médias de la pièce au bout du temps réglé.",
        buttons: [
          ["Transport", "Piste précédente, recul de 15 s, lecture/pause, avance de 15 s, piste suivante."],
          ["Je n'aime pas · Répéter · Aléatoire · J'aime", "Je n'aime pas, répétition, lecture aléatoire, j'aime."],
          ["Lune · Marche/Arrêt", "Minuterie de veille ; arrêt de la musique de la pièce."],
        ],
      },
      {
        title: "Vidéo et Apple TV",
        image: IMG + "10-video.png",
        image2: IMG + "11-apple-tv.png",
        text: "La fenêtre Vidéo du showroom B&O liste les sources ; la source active est entourée de vert et sa télécommande apparaît. Dans l'Aquarium, Apple TV est choisi comme service audio et ouvre la même télécommande.",
        buttons: [
          ["Menu · Lecture/Pause · TV", "Touches de la télécommande Apple TV."],
          ["Croix et OK", "Navigation dans les menus de l'Apple TV."],
          ["Marche/Arrêt · volume", "Arrêt de la vidéo, volume de la pièce."],
        ],
      },
      {
        title: "Caméras",
        image: IMG + "12-cameras.png",
        image2: IMG + "13-camera.png",
        text: "Les caméras sont classées par étage ; un appui affiche l'image en direct (flux déclaré dans le JSON, image fixe en démonstration).",
        buttons: [
          ["All · Main Floor", "Filtre par étage."],
          ["Carte de caméra", "Vue plein cadre ; flèche retour vers la liste."],
        ],
      },
      {
        title: "iPhone et réglages",
        image: IMG + "14-iphone-piece.png",
        image2: IMG + "15-iphone-lights.png",
        portrait: true,
        text: "L'iPhone reprend les mêmes commandes, les mêmes libellés et les mêmes couleurs que la dalle, en une colonne ; seule la liste des circuits défile. Le menu « … » ouvre Manage : réglages de l'écran (thème Sombre, Clair ou Verre dépoli, IP-ID, versions), santé des équipements, aide et mentions.",
        buttons: [
          ["…", "Edit Actions et Settings (Manage)."],
          ["Panel Settings", "Thème de l'écran et informations de connexion."],
        ],
      },
    ],
  },
  en: {
    intro:
      "The Crestron Home interface of the TSW-1070 panel at the entrance of our Nyon showroom, recreated identically in CH5 for the wall panel, iPad, iPhone and XPanel. Six spaces on two floors (Aquarium, JURA and LAC offices, Open Space, Bang & Olufsen showroom, stock room). A single JSON file describes rooms, photos, actions, circuits, services and signals: it is read by the GUI, the slot 1 C# program and the generator of the slot 2 SIMPL program. Every button gets its state from the processor, never from the screen.",
    sections: [
      {
        title: "\"Fréquence TV\" home page",
        image: IMG + "01-accueil.png",
        image2: IMG + "02-accueil-en-marche.png",
        text: "The home page shows the showroom photo and the six house actions. The Controls row sums up the whole building: circuits on, music playing, cameras. At the bottom, the bar shared by every page; when a room is playing, the \"Deezer in …\" chip takes you back to its player in one tap.",
        buttons: [
          ["Welcome · Goodbye · Party Time ! · Default Lights · Relax · B&O Products", "House actions: each recalls a scene in the rooms that have it (or a default level); Goodbye turns everything off; Party Time also starts music in the B&O showroom."],
          ["Lights", "List of rooms with their state; per-room on/off and a global off."],
          ["Music · Cameras", "Opens the player of the room currently playing, or the camera list."],
          ["Home · Rooms · Power", "Main navigation. On the home page, Power asks for confirmation before turning the whole house off."],
        ],
      },
      {
        title: "Rooms: floors and favourites",
        image: IMG + "03-rooms.png",
        image2: IMG + "04-favoris.png",
        text: "Rooms are grouped by floor (First Floor, Main Floor), each with its photo. A yellow bulb marks a room with lights on. Favourites are set with a long press on a card and stored on the panel; without favourites, the \"No favorites added\" illustration appears as on the original panel.",
        buttons: [
          ["All · Favorites · First Floor · Main Floor", "List filters."],
          ["Floor title", "Collapses or expands the floor."],
          ["Room card", "Opens the room; long press: adds or removes it from favourites."],
        ],
      },
      {
        title: "A room: actions and services",
        image: IMG + "05-piece-bo.png",
        text: "The Bang & Olufsen showroom after \"Party Time !\": Party Lights scene, Deezer playing (the Music tile takes the cover art) and Apple TV on screen. The line under the name sums up the state (\"Lights are on. Deezer is on.\"). The slider in the bottom bar sets the room volume.",
        buttons: [
          ["Room actions", "Lighting scene and/or music source, defined room by room in the JSON."],
          ["Lights (two circles)", "All off / all on; tapping the tile opens the Lights window."],
          ["Music · Video", "Player or music choice; video sources and remote."],
          ["Power", "Turns the room off: lights, music and video."],
        ],
      },
      {
        title: "Lights window",
        image: IMG + "06-lights-bo.png",
        text: "Thirteen circuits in the B&O showroom, in four columns so everything is visible without scrolling. The active scene is outlined; a manual adjustment deselects it. Each circuit shows its real level and is controlled by its switch or slider.",
        buttons: [
          ["Scenes", "B&O Products Lights, Default Lights, My scene 7, Party Lights, Relax Lights: per-circuit levels in the JSON."],
          ["All Lights − / +", "Lowers or raises every circuit by 10 %."],
          ["Switch", "Turns the circuit off or back on at its last level."],
          ["Slider", "Level from 0 to 100 %."],
        ],
      },
      {
        title: "Music: choice, player, sleep timer",
        image: IMG + "07-select-music.png",
        image2: IMG + "08-lecteur.png",
        text: "Select Music offers the room's services (Deezer, Apple TV) and favourites. The player shows cover art, title, progress and controls; the bottom bar gives access to Browse (Flow, Charts, New Releases, Mixes, Genres, My Library), the player, settings and volume. The sleep timer turns off all media in the room after the set time.",
        buttons: [
          ["Transport", "Previous track, back 15 s, play/pause, forward 15 s, next track."],
          ["Dislike · Repeat · Shuffle · Like", "Dislike, repeat, shuffle, like."],
          ["Moon · Power", "Sleep timer; stops the room's music."],
        ],
      },
      {
        title: "Video and Apple TV",
        image: IMG + "10-video.png",
        image2: IMG + "11-apple-tv.png",
        text: "The Video window of the B&O showroom lists the sources; the active one is outlined in green and its remote appears. In the Aquarium, Apple TV is chosen as an audio service and opens the same remote.",
        buttons: [
          ["Menu · Play/Pause · TV", "Apple TV remote keys."],
          ["D-pad and OK", "Navigation in the Apple TV menus."],
          ["Power · volume", "Stops the video, room volume."],
        ],
      },
      {
        title: "Cameras",
        image: IMG + "12-cameras.png",
        image2: IMG + "13-camera.png",
        text: "Cameras are sorted by floor; a tap shows the live picture (stream declared in the JSON, still picture in the demo).",
        buttons: [
          ["All · Main Floor", "Floor filter."],
          ["Camera card", "Full-frame view; back arrow to the list."],
        ],
      },
      {
        title: "iPhone and settings",
        image: IMG + "14-iphone-piece.png",
        image2: IMG + "15-iphone-lights.png",
        portrait: true,
        text: "The iPhone has the same controls, labels and colours as the wall panel, in a single column; only the circuit list scrolls. The \"…\" menu opens Manage: panel settings (Dark, Light or Frosted glass theme, IP-ID, versions), device health, help and legal.",
        buttons: [
          ["…", "Edit Actions and Settings (Manage)."],
          ["Panel Settings", "Panel theme and connection details."],
        ],
      },
    ],
  },
  de: {
    intro:
      "Die Crestron-Home-Oberfläche des TSW-1070-Panels am Eingang unseres Showrooms in Nyon, in CH5 originalgetreu nachgebaut für Wandpanel, iPad, iPhone und XPanel. Sechs Räume auf zwei Ebenen (Aquarium, Büros JURA und LAC, Open Space, Bang-&-Olufsen-Showroom, Lager). Eine einzige JSON-Datei beschreibt Räume, Fotos, Aktionen, Kreise, Dienste und Signale: GUI, das C#-Programm in Slot 1 und der Generator des SIMPL-Programms in Slot 2 lesen sie. Jede Taste erhält ihren Zustand vom Prozessor, nie vom Bildschirm.",
    sections: [
      {
        title: "Startseite „Fréquence TV“",
        image: IMG + "01-accueil.png",
        image2: IMG + "02-accueil-en-marche.png",
        text: "Die Startseite zeigt das Foto des Showrooms und die sechs Hausaktionen. Die Zeile Controls fasst das ganze Gebäude zusammen: eingeschaltete Kreise, laufende Musik, Kameras. Unten die Leiste aller Seiten; spielt ein Raum, führt die Plakette „Deezer in …“ mit einem Tipp zu seinem Player.",
        buttons: [
          ["Welcome · Goodbye · Party Time ! · Default Lights · Relax · B&O Products", "Hausaktionen: jede ruft eine Szene in den Räumen auf, die sie besitzen (sonst eine Standardstufe); Goodbye schaltet alles aus; Party Time startet zusätzlich Musik im B&O-Showroom."],
          ["Lights", "Raumliste mit Zustand; Ein/Aus je Raum und Gesamt-Aus."],
          ["Music · Cameras", "Öffnet den Player des spielenden Raums oder die Kameraliste."],
          ["Home · Rooms · Ein/Aus", "Hauptnavigation. Auf der Startseite fragt Ein/Aus vor dem Ausschalten des ganzen Hauses nach."],
        ],
      },
      {
        title: "Rooms: Ebenen und Favoriten",
        image: IMG + "03-rooms.png",
        image2: IMG + "04-favoris.png",
        text: "Die Räume sind nach Ebenen gruppiert (First Floor, Main Floor), jeder mit Foto. Eine gelbe Lampe markiert einen beleuchteten Raum. Favoriten werden durch langes Drücken auf eine Karte gesetzt und im Panel gespeichert; ohne Favoriten erscheint wie auf dem Original die Illustration „No favorites added“.",
        buttons: [
          ["All · Favorites · First Floor · Main Floor", "Listenfilter."],
          ["Ebenentitel", "Klappt die Ebene ein oder aus."],
          ["Raumkarte", "Öffnet den Raum; langes Drücken: Favorit hinzufügen oder entfernen."],
        ],
      },
      {
        title: "Ein Raum: Aktionen und Dienste",
        image: IMG + "05-piece-bo.png",
        text: "Der Bang-&-Olufsen-Showroom nach „Party Time !“: Szene Party Lights, Deezer spielt (die Kachel Music übernimmt das Cover) und Apple TV auf dem Bildschirm. Die Zeile unter dem Namen fasst den Zustand zusammen („Lights are on. Deezer is on.“). Der Regler in der unteren Leiste stellt die Raumlautstärke ein.",
        buttons: [
          ["Raumaktionen", "Lichtszene und/oder Musikquelle, je Raum im JSON festgelegt."],
          ["Lights (zwei Kreise)", "Alles aus / alles ein; Tipp auf die Kachel: Fenster Lights."],
          ["Music · Video", "Player oder Musikauswahl; Videoquellen und Fernbedienung."],
          ["Ein/Aus", "Schaltet den Raum aus: Licht, Musik und Video."],
        ],
      },
      {
        title: "Fenster Lights",
        image: IMG + "06-lights-bo.png",
        text: "Dreizehn Kreise im B&O-Showroom, in vier Spalten, damit alles ohne Scrollen sichtbar ist. Die aktive Szene ist umrandet; eine manuelle Einstellung hebt sie auf. Jeder Kreis zeigt seine reale Stufe und wird per Schalter oder Regler gesteuert.",
        buttons: [
          ["Scenes", "B&O Products Lights, Default Lights, My scene 7, Party Lights, Relax Lights: Stufen je Kreis im JSON."],
          ["All Lights − / +", "Senkt oder erhöht alle Kreise um 10 %."],
          ["Schalter", "Schaltet den Kreis aus oder mit seiner letzten Stufe wieder ein."],
          ["Regler", "Stufe von 0 bis 100 %."],
        ],
      },
      {
        title: "Musik: Auswahl, Player, Sleep-Timer",
        image: IMG + "07-select-music.png",
        image2: IMG + "08-lecteur.png",
        text: "Select Music bietet die Dienste des Raums (Deezer, Apple TV) und die Favoriten. Der Player zeigt Cover, Titel, Fortschritt und Bedienung; die untere Leiste führt zu Browse (Flow, Charts, New Releases, Mixes, Genres, My Library), zum Player, zu den Einstellungen und zur Lautstärke. Der Sleep-Timer schaltet nach der eingestellten Zeit alle Medien des Raums aus.",
        buttons: [
          ["Transport", "Vorheriger Titel, 15 s zurück, Wiedergabe/Pause, 15 s vor, nächster Titel."],
          ["Gefällt nicht · Wiederholen · Zufall · Gefällt", "Gefällt nicht, Wiederholung, Zufallswiedergabe, gefällt."],
          ["Mond · Ein/Aus", "Sleep-Timer; stoppt die Musik des Raums."],
        ],
      },
      {
        title: "Video und Apple TV",
        image: IMG + "10-video.png",
        image2: IMG + "11-apple-tv.png",
        text: "Das Fenster Video des B&O-Showrooms listet die Quellen; die aktive ist grün umrandet und ihre Fernbedienung erscheint. Im Aquarium wird Apple TV als Audiodienst gewählt und öffnet dieselbe Fernbedienung.",
        buttons: [
          ["Menu · Wiedergabe/Pause · TV", "Tasten der Apple-TV-Fernbedienung."],
          ["Steuerkreuz und OK", "Navigation in den Apple-TV-Menüs."],
          ["Ein/Aus · Lautstärke", "Stoppt das Video, Raumlautstärke."],
        ],
      },
      {
        title: "Kameras",
        image: IMG + "12-cameras.png",
        image2: IMG + "13-camera.png",
        text: "Die Kameras sind nach Ebenen geordnet; ein Tipp zeigt das Live-Bild (Stream im JSON festgelegt, Standbild in der Demo).",
        buttons: [
          ["All · Main Floor", "Ebenenfilter."],
          ["Kamerakarte", "Vollbildansicht; Pfeil zurück zur Liste."],
        ],
      },
      {
        title: "iPhone und Einstellungen",
        image: IMG + "14-iphone-piece.png",
        image2: IMG + "15-iphone-lights.png",
        portrait: true,
        text: "Das iPhone bietet dieselben Bedienelemente, Beschriftungen und Farben wie das Wandpanel, einspaltig; nur die Kreisliste scrollt. Das Menü „…“ öffnet Manage: Panel-Einstellungen (Thema Dunkel, Hell oder Milchglas, IP-ID, Versionen), Gerätezustand, Hilfe und rechtliche Hinweise.",
        buttons: [
          ["…", "Edit Actions und Settings (Manage)."],
          ["Panel Settings", "Thema des Panels und Verbindungsdaten."],
        ],
      },
    ],
  },
};
