// Fiche détaillée « FTV Home » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/crestron-home/
// (dalle TSW-1070 et iPhone, simulateur React CrestronHome).
const IMG = "/sheets/crestron-home/";

export default {
  fr: {
    intro:
      "FTV Home reprend les parcours d'une application domotique moderne : un Accueil avec les scènes et les contrôles de la maison, une liste des Pièces par étage, puis le détail de chaque pièce organisé en services (Lumières, Occultants, Thermostat, Serrure, Musique, Vidéo). Les réglages fins s'ouvrent dans des feuilles glissantes qui recouvrent l'écran. La même interface est livrée sur iPhone, iPad, dalle TSW-1070 et Xpanel, en français, anglais et allemand ; chaque pièce n'affiche que les services réellement configurés.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        text:
          "La page d'accueil résume l'état de la maison (portail, portes, alarme) puis présente les quatre scènes de vie et les tuiles de contrôle. Le bandeau bas indique la musique en cours ; la barre d'onglets permet de passer aux Pièces.",
        buttons: [
          ["⚙ (en haut à droite)", "Ouvre la feuille Gérez : thème, contrôles affichés, pièces favorites."],
          ["J'arrive", "Scène d'arrivée : séjour et cuisine à 65 %, tout le reste éteint. La tuile devient violette et affiche « Scène appliquée » pendant 1,4 s."],
          ["Bonjour", "Cuisine et salle à manger à 85 %, autres éclairages éteints, tous les occultants ouverts à 100 %."],
          ["Bonne nuit", "Tous les éclairages éteints, tous les occultants fermés, porte, portail et garage verrouillés / fermés, musique arrêtée."],
          ["Je pars", "Tous les éclairages éteints, accès verrouillés, musique arrêtée ; les occultants gardent leur position."],
          ["Lumières", "Nombre d'éclairages allumés dans la maison (icône ambre si au moins un). Un appui ouvre la feuille Lumières du Séjour."],
          ["Musique", "Titre en cours ou « Pas en lecture ». Ouvre la feuille Sélectionner la musique."],
          ["Occultants", "« Ouvert » dès qu'un occultant est ouvert à plus de 5 %. Ouvre la feuille Occultants du Séjour."],
          ["Thermostat", "Température mesurée du séjour. Ouvre la feuille Thermostat du Séjour."],
          ["Accès : Porte d'entrée · Portail · Garage", "Trois boutons à bascule : vert quand la porte est verrouillée / le portail fermé / le garage fermé, gris sinon. Garage : un appui ouvre, un second lance « Fermeture en cours… » puis repasse à fermé après 1,8 s. L'icône de la tuile passe en cadenas ouvert corail dès qu'un accès est ouvert."],
          ["Piscine · Spa", "Bascule Activé / Désactivé de la filtration piscine et du spa ; l'icône se colore (cyan, corail) quand actif."],
          ["Couleur 3 — Radio · Séjour (bandeau)", "Mini-lecteur affiché tant qu'une musique joue ; l'appui ouvre la feuille Musique."],
          ["Accueil · Pièces", "Onglets de navigation ; l'onglet actif est surligné en violet."],
        ],
      },
      {
        title: "Scène appliquée",
        image: IMG + "02-scene-appliquee.png",
        text: "Feedback d'une scène : la tuile se remplit de violet et son libellé devient « Scène appliquée » ; le compteur de la tuile Lumières se met à jour (ici 5 éclairages allumés après J'arrive).",
        buttons: [
          ["Tuile de scène", "Confirmation visuelle pendant 1,4 s, puis retour au libellé de la scène."],
        ],
      },
      {
        title: "Pièces",
        image: IMG + "03-pieces.png",
        text: "Liste des huit pièces sur photo, regroupées par étage (Rez-de-chaussée, Extérieur, Étage). Chaque carte indique le nombre d'éclairages allumés et des badges d'état.",
        buttons: [
          ["Toutes · Favoris · Rez-de-chaussée · Extérieur · Étage", "Filtres de la liste ; la puce active est violette."],
          ["En-tête d'étage (▲)", "Replie ou déplie les pièces de l'étage."],
          ["★ (coin de carte)", "Ajoute ou retire la pièce des favoris (étoile pleine quand favorite)."],
          ["Carte de pièce", "Ouvre le détail de la pièce. Badges : ampoule ambre (éclairage allumé), store cyan (occultant ouvert), thermomètre (pièce climatisée), cadenas corail (porte déverrouillée)."],
        ],
      },
      {
        title: "Pièces — Favoris",
        image: IMG + "04-pieces-favoris.png",
        text: "Le filtre Favoris ne conserve que les pièces marquées d'une étoile (Séjour, Piscine, Chambre parentale par défaut).",
        buttons: [
          ["Favoris", "Filtre par favoris ; la sélection se gère aussi dans Gérez › Afficher les pièces."],
        ],
      },
      {
        title: "Détail d'une pièce — Séjour",
        image: IMG + "05-detail-sejour.png",
        text: "Le détail affiche la photo, un résumé (éclairages, occultants, température), l'action Éteindre la pièce et une carte par service configuré.",
        buttons: [
          ["‹ (retour)", "Retour à la liste des pièces."],
          ["Éteindre la pièce", "Éteint tous les éclairages de la pièce, arrête la musique et éteint tous les écrans vidéo."],
          ["Lumières : ⏻ / 💡", "Tout éteindre (le bouton s'allume en violet quand tout est éteint) ou tout allumer à 100 % (ambre). L'icône curseurs ouvre la feuille Lumières."],
          ["Occultants : ■ / ☰", "Tout fermer ou tout ouvrir (le bouton actif est cyan). L'icône curseurs ouvre la feuille Occultants."],
          ["Thermostat", "Cadran miniature avec la consigne, mode (Chauffage, Rafraîchissement, Automatique) et état de planification. L'appui sur l'en-tête ouvre la feuille Thermostat."],
          ["− / + (Consigne)", "Consigne par pas de 0,5 °C, entre 16 et 30 °C."],
          ["Serrure : 🔒 / 🔓", "Verrouille (violet) ou déverrouille (corail) la porte d'entrée ; l'état passe en rouge « Déverrouillé »."],
          ["Musique", "Titre en cours avec égaliseur animé ; ouvre la feuille Musique."],
          ["Vidéo", "« Activé » si un écran est allumé ; ouvre la feuille Vidéo."],
        ],
      },
      {
        title: "Feuille Lumières",
        image: IMG + "06-feuille-lumieres.png",
        text: "Pilotage circuit par circuit : les charges gradables ont un curseur, les charges tout-ou-rien un interrupteur.",
        buttons: [
          ["⏻ / 💡 (segment)", "Tout éteindre ou tout allumer à 100 % ; le segment actif est ambre."],
          ["Baisser / Monter (soleil)", "Baisse ou monte tous les circuits de la pièce de 20 % à la fois."],
          ["Curseurs (Spots plafond, Corniche LED…)", "Niveau de 0 à 100 % ; le pourcentage s'affiche en ambre dès que le circuit est allumé."],
          ["Interrupteur (Liseuses)", "Bascule 0 / 100 % des circuits non gradables."],
          ["✕", "Ferme la feuille ; un appui hors de la feuille la ferme aussi."],
        ],
      },
      {
        title: "Feuille Occultants",
        image: IMG + "07-feuille-occultants.png",
        text: "Position de chaque occultant en pourcentage, avec commandes de course.",
        buttons: [
          ["■ / ☰ (segment)", "Tout fermer ou tout ouvrir."],
          ["Curseur", "Position de 0 (Fermé) à 100 % (Ouvert) ; les positions intermédiaires s'affichent en %."],
          ["▲ Monter · Stop · ▼ Descendre", "Ouverture complète, arrêt en position mi-course (50 %), fermeture complète."],
          ["✕", "Ferme la feuille."],
        ],
      },
      {
        title: "Feuille Thermostat",
        image: IMG + "08-feuille-thermostat.png",
        text: "Cadran dégradé cyan → corail avec le curseur de consigne, température actuelle au centre, puis mode, ventilateur, planification et hygrométrie.",
        buttons: [
          ["− / +", "Consigne par pas de 0,5 °C (16–30 °C) ; le libellé indique « Chauffer à » ou « Refroidir à » selon le mode."],
          ["Mode", "Chaque appui fait tourner Chauffage → Rafraîchissement → Automatique ; l'icône du cadran (flamme / flocon) suit."],
          ["Ventilateur", "Automatique ou Continu."],
          ["Planification", "En cours ou En pause (maintien manuel de la consigne)."],
          ["Humidité + interrupteur", "Hygrométrie mesurée et activation du contrôle de l'humidité."],
        ],
      },
      {
        title: "Feuille Vidéo",
        image: IMG + "09-feuille-video.png",
        text: "Distribution vidéo : quatre écrans de la maison, cinq sources, et la grille des chaînes quand la source TV est sélectionnée.",
        buttons: [
          ["Écrans (liste)", "Sélectionne l'écran à piloter ; la ligne violette est l'écran ciblé, le sous-titre indique la source ou « Désactivé »."],
          ["⏻ (par écran)", "Allume l'écran sur TV / IPTV ou l'éteint."],
          ["TV / IPTV · Box streaming · Lecteur Blu-ray · PC / Présentation · Vidéosurveillance", "Route la source vers l'écran ciblé (et l'allume) ; une coche violette marque la source active."],
          ["Chaînes RTS 1 … Musique (201–208)", "Raccourcis de chaînes, affichés uniquement en TV / IPTV ; la chaîne active est encadrée de violet."],
        ],
      },
      {
        title: "Feuille Musique",
        image: IMG + "10-feuille-musique.png",
        text: "Services audio, favoris et lecteur en cours pour le multiroom.",
        buttons: [
          ["Multiroom · Radio · Streaming · Bibliothèque · Entrée ligne", "Choix du service ; démarre la lecture dans le Séjour, le service actif est surligné."],
          ["Favoris (Couleur 3, Jazz du soir, Playlist Terrasse…)", "Lance le favori : titre, sous-titre et couleur de pochette mis à jour dans le lecteur et le bandeau bas."],
          ["⏮ ⏯ ⏭", "Précédent, lecture / pause (l'icône alterne), suivant."],
          ["🔊 + curseur", "Volume 0–100 ; l'icône haut-parleur coupe le son (volume 0)."],
        ],
      },
      {
        title: "Gérez (réglages)",
        image: IMG + "11-reglages.png",
        text: "Personnalisation locale de l'application : apparence, tuiles affichées sur l'accueil et pièces favorites.",
        buttons: [
          ["Thème clair / Thème sombre", "Interrupteur de thème ; toute l'interface bascule immédiatement."],
          ["Afficher les contrôles", "Six interrupteurs (Lumières, Occultants, Thermostat, Musique, Accès, Piscine) qui masquent ou affichent les tuiles correspondantes de l'accueil."],
          ["Afficher les pièces", "Un interrupteur par pièce : définit les favoris utilisés par le filtre Favoris."],
        ],
      },
      {
        title: "Thème sombre",
        image: IMG + "12-theme-sombre.png",
        text: "Le même accueil en thème sombre : fond anthracite, tuiles en relief, accents violet, cyan et ambre conservés.",
        buttons: [],
      },
      {
        title: "iPhone — Accueil",
        image: IMG + "13-iphone-accueil.png",
        portrait: true,
        text: "Sur smartphone, la page défile en colonne unique ; les onglets Accueil / Pièces sont réduits à leurs icônes et le mini-lecteur reste au-dessus.",
        buttons: [
          ["Scènes et tuiles", "Mêmes fonctions que sur la dalle."],
          ["⌂ / ▦", "Onglets Accueil et Pièces."],
        ],
      },
      {
        title: "iPhone — Détail de pièce",
        image: IMG + "14-iphone-detail-sejour.png",
        portrait: true,
        text: "Les services s'empilent sur deux colonnes ; le thermostat occupe toute la largeur.",
        buttons: [
          ["‹", "Retour à la liste des pièces."],
          ["Cartes de services", "Identiques à la dalle : Lumières, Occultants, Thermostat, Serrure, Musique, Vidéo."],
        ],
      },
    ],
  },

  en: {
    intro:
      "FTV Home follows the flows of a modern home-automation app: a Home page with the house scenes and controls, a Rooms list by floor, then each room's detail organised into services (Lights, Shades, Thermostat, Lock, Music, Video). Fine adjustments open in sliding sheets over the screen. The same interface is delivered on iPhone, iPad, TSW-1070 panel and Xpanel, in French, English and German; each room shows only the services actually configured.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        text: "The home page sums up the house state (gate, doors, alarm), then shows the four lifestyle scenes and the control tiles. The bottom strip shows the music playing; the tab bar switches to Rooms.",
        buttons: [
          ["⚙ (top right)", "Opens the Manage sheet: theme, displayed controls, favourite rooms."],
          ["Arriving", "Arrival scene: living room and kitchen to 65 %, everything else off. The tile turns purple and reads “Scene applied” for 1.4 s."],
          ["Good morning", "Kitchen and dining room to 85 %, other lights off, every shade opened to 100 %."],
          ["Good night", "All lights off, all shades closed, door, gate and garage locked / closed, music stopped."],
          ["Leaving", "All lights off, accesses locked, music stopped; shades keep their position."],
          ["Lights", "Number of lights on in the house (amber icon when at least one). Tapping opens the Living room Lights sheet."],
          ["Music", "Current title or “Not playing”. Opens the Select music sheet."],
          ["Shades", "“Open” as soon as one shade is open beyond 5 %. Opens the Living room Shades sheet."],
          ["Thermostat", "Measured living-room temperature. Opens the Living room Thermostat sheet."],
          ["Access: Front door · Gate · Garage", "Three toggle buttons: green when the door is locked / gate closed / garage closed, grey otherwise. Garage: one tap opens, a second shows “Closing…” then returns to closed after 1.8 s. The tile icon turns into a coral open padlock as soon as an access is open."],
          ["Pool · Spa", "Active / Inactive toggle of the pool filtration and the spa; the icon turns cyan or coral when active."],
          ["Couleur 3 — Radio · Living room (strip)", "Mini player shown while music plays; tapping opens the Music sheet."],
          ["Home · Rooms", "Navigation tabs; the active tab is highlighted in purple."],
        ],
      },
      { title: "Scene applied", image: IMG + "02-scene-appliquee.png", text: "Scene feedback: the tile fills with purple and its label becomes “Scene applied”; the Lights tile counter updates (here 5 lights on after Arriving).", buttons: [["Scene tile", "Visual confirmation for 1.4 s, then back to the scene label."]] },
      { title: "Rooms", image: IMG + "03-pieces.png", text: "List of the eight rooms on photos, grouped by floor (Ground floor, Outside, First floor). Each card shows the number of lights on and status badges.", buttons: [["All · Favourites · Ground floor · Outside · First floor", "List filters; the active chip is purple."], ["Floor header (▲)", "Collapses or expands the floor's rooms."], ["★ (card corner)", "Adds or removes the room from favourites (filled star when favourite)."], ["Room card", "Opens the room detail. Badges: amber bulb (light on), cyan blind (shade open), thermometer (climate-controlled room), coral padlock (door unlocked)."]] },
      { title: "Rooms — Favourites", image: IMG + "04-pieces-favoris.png", text: "The Favourites filter keeps only starred rooms (Living room, Pool, Master bedroom by default).", buttons: [["Favourites", "Favourite filter; the selection is also managed in Manage › Show rooms."]] },
      { title: "Room detail — Living room", image: IMG + "05-detail-sejour.png", text: "The detail shows the photo, a summary (lights, shades, temperature), the Turn room off action and one card per configured service.", buttons: [["‹ (back)", "Back to the room list."], ["Turn room off", "Switches off every light of the room, stops the music and turns off every video display."], ["Lights: ⏻ / 💡", "All off (the button lights purple when everything is off) or all on at 100 % (amber). The sliders icon opens the Lights sheet."], ["Shades: ■ / ☰", "Close all or open all (the active button is cyan). The sliders icon opens the Shades sheet."], ["Thermostat", "Mini dial with the setpoint, mode (Heating, Cooling, Auto) and schedule state. Tapping the header opens the Thermostat sheet."], ["− / + (Setpoint)", "Setpoint in 0.5 °C steps, between 16 and 30 °C."], ["Lock: 🔒 / 🔓", "Locks (purple) or unlocks (coral) the front door; the state turns red “Unlocked”."], ["Music", "Current title with animated equaliser; opens the Music sheet."], ["Video", "“Active” if a display is on; opens the Video sheet."]] },
      { title: "Lights sheet", image: IMG + "06-feuille-lumieres.png", text: "Circuit-by-circuit control: dimmable loads have a slider, on/off loads a switch.", buttons: [["⏻ / 💡 (segment)", "All off or all on at 100 %; the active segment is amber."], ["Dim down / Dim up (sun)", "Lowers or raises every circuit of the room by 20 % at a time."], ["Sliders (Spots plafond, Corniche LED…)", "0–100 % level; the percentage turns amber as soon as the circuit is on."], ["Switch (Liseuses)", "0 / 100 % toggle of non-dimmable circuits."], ["✕", "Closes the sheet; tapping outside the sheet also closes it."]] },
      { title: "Shades sheet", image: IMG + "07-feuille-occultants.png", text: "Position of each shade in percent, with travel commands.", buttons: [["■ / ☰ (segment)", "Close all or open all."], ["Slider", "Position from 0 (Closed) to 100 % (Open); intermediate positions show in %."], ["▲ Up · Stop · ▼ Down", "Full open, stop at mid-travel (50 %), full close."], ["✕", "Closes the sheet."]] },
      { title: "Thermostat sheet", image: IMG + "08-feuille-thermostat.png", text: "Cyan → coral gradient dial with the setpoint cursor, current temperature in the centre, then mode, fan, schedule and humidity.", buttons: [["− / +", "Setpoint in 0.5 °C steps (16–30 °C); the label reads “Heat to” or “Cool to” depending on the mode."], ["Mode", "Each tap cycles Heating → Cooling → Auto; the dial icon (flame / snowflake) follows."], ["Fan", "Auto or On."], ["Schedule", "Running or Hold (manual setpoint hold)."], ["Humidity + switch", "Measured humidity and humidity control activation."]] },
      { title: "Video sheet", image: IMG + "09-feuille-video.png", text: "Video distribution: four displays of the house, five sources, and the channel grid when the TV source is selected.", buttons: [["Displays (list)", "Selects the display to control; the purple row is the targeted display, the subtitle shows the source or “Inactive”."], ["⏻ (per display)", "Turns the display on to TV / IPTV or off."], ["TV / IPTV · Box streaming · Lecteur Blu-ray · PC / Présentation · Vidéosurveillance", "Routes the source to the targeted display (and turns it on); a purple tick marks the active source."], ["Channels RTS 1 … Musique (201–208)", "Channel shortcuts, shown only on TV / IPTV; the active channel is outlined in purple."]] },
      { title: "Music sheet", image: IMG + "10-feuille-musique.png", text: "Audio services, favourites and now-playing player for the multiroom.", buttons: [["Multiroom · Radio · Streaming · Bibliothèque · Entrée ligne", "Service choice; starts playback in the Living room, the active service is highlighted."], ["Favourites (Couleur 3, Jazz du soir, Playlist Terrasse…)", "Plays the favourite: title, subtitle and artwork colour updated in the player and the bottom strip."], ["⏮ ⏯ ⏭", "Previous, play / pause (the icon alternates), next."], ["🔊 + slider", "Volume 0–100; the speaker icon mutes (volume 0)."]] },
      { title: "Manage (settings)", image: IMG + "11-reglages.png", text: "Local customisation of the app: appearance, tiles shown on the home page and favourite rooms.", buttons: [["Light theme / Dark theme", "Theme switch; the whole interface changes immediately."], ["Show controls", "Six switches (Lights, Shades, Thermostat, Music, Access, Pool) that hide or show the corresponding home tiles."], ["Show rooms", "One switch per room: defines the favourites used by the Favourites filter."]] },
      { title: "Dark theme", image: IMG + "12-theme-sombre.png", text: "The same home page in dark theme: charcoal background, raised tiles, purple, cyan and amber accents kept.", buttons: [] },
      { title: "iPhone — Home", image: IMG + "13-iphone-accueil.png", portrait: true, text: "On a smartphone the page scrolls in a single column; the Home / Rooms tabs are reduced to icons and the mini player stays above.", buttons: [["Scenes and tiles", "Same functions as on the panel."], ["⌂ / ▦", "Home and Rooms tabs."]] },
      { title: "iPhone — Room detail", image: IMG + "14-iphone-detail-sejour.png", portrait: true, text: "Services stack in two columns; the thermostat spans the full width.", buttons: [["‹", "Back to the room list."], ["Service cards", "Identical to the panel: Lights, Shades, Thermostat, Lock, Music, Video."]] },
    ],
  },

  de: {
    intro:
      "FTV Home folgt den Abläufen einer modernen Smart-Home-App: eine Startseite mit den Szenen und Steuerungen des Hauses, eine Raumliste nach Etagen, dann das Detail jedes Raums nach Diensten (Licht, Beschattung, Thermostat, Schloss, Musik, Video). Feineinstellungen öffnen sich in Blättern, die über den Bildschirm gleiten. Dieselbe Oberfläche wird auf iPhone, iPad, TSW-1070-Panel und Xpanel geliefert, auf Französisch, Englisch und Deutsch; jeder Raum zeigt nur die tatsächlich konfigurierten Dienste.",
    sections: [
      {
        title: "Start",
        image: IMG + "01-accueil.png",
        text: "Die Startseite fasst den Hauszustand zusammen (Tor, Türen, Alarm) und zeigt dann die vier Lebensszenen und die Steuerkacheln. Die untere Leiste zeigt die laufende Musik; die Reiterleiste wechselt zu den Räumen.",
        buttons: [
          ["⚙ (oben rechts)", "Öffnet das Blatt Verwalten: Thema, angezeigte Steuerungen, Lieblingsräume."],
          ["Ankunft", "Ankunftsszene: Wohnzimmer und Küche auf 65 %, alles andere aus. Die Kachel wird violett und zeigt 1,4 s lang „Szene aktiviert“."],
          ["Guten Morgen", "Küche und Esszimmer auf 85 %, übrige Lichter aus, alle Behänge auf 100 % geöffnet."],
          ["Gute Nacht", "Alle Lichter aus, alle Behänge geschlossen, Tür, Tor und Garage verriegelt / geschlossen, Musik gestoppt."],
          ["Abwesend", "Alle Lichter aus, Zugänge verriegelt, Musik gestoppt; die Behänge behalten ihre Position."],
          ["Licht", "Anzahl der eingeschalteten Lichter im Haus (bernsteinfarbenes Symbol ab einem Licht). Ein Tipp öffnet das Blatt Licht des Wohnzimmers."],
          ["Musik", "Laufender Titel oder „Keine Wiedergabe“. Öffnet das Blatt Musik wählen."],
          ["Beschattung", "„Offen“, sobald ein Behang über 5 % geöffnet ist. Öffnet das Blatt Beschattung des Wohnzimmers."],
          ["Thermostat", "Gemessene Temperatur des Wohnzimmers. Öffnet das Blatt Thermostat des Wohnzimmers."],
          ["Zugang: Haustür · Tor · Garage", "Drei Umschalttasten: grün, wenn die Tür verriegelt / das Tor geschlossen / die Garage geschlossen ist, sonst grau. Garage: ein Tipp öffnet, ein zweiter zeigt „Schliesst…“ und kehrt nach 1,8 s zu geschlossen zurück. Das Kachelsymbol wird zum korallenfarbenen offenen Schloss, sobald ein Zugang offen ist."],
          ["Pool · Spa", "Umschalter Aktiv / Inaktiv der Poolfilterung und des Spas; das Symbol wird bei aktiv cyan bzw. korallenfarben."],
          ["Couleur 3 — Radio · Wohnzimmer (Leiste)", "Miniplayer, solange Musik läuft; ein Tipp öffnet das Blatt Musik."],
          ["Start · Räume", "Navigationsreiter; der aktive Reiter ist violett hervorgehoben."],
        ],
      },
      { title: "Szene aktiviert", image: IMG + "02-scene-appliquee.png", text: "Szenen-Feedback: die Kachel füllt sich violett und ihre Beschriftung wird „Szene aktiviert“; der Zähler der Kachel Licht aktualisiert sich (hier 5 Lichter an nach Ankunft).", buttons: [["Szenenkachel", "Visuelle Bestätigung für 1,4 s, dann zurück zur Szenenbeschriftung."]] },
      { title: "Räume", image: IMG + "03-pieces.png", text: "Liste der acht Räume auf Fotos, gruppiert nach Etage (Erdgeschoss, Aussenbereich, Obergeschoss). Jede Karte zeigt die Anzahl eingeschalteter Lichter und Statusabzeichen.", buttons: [["Alle · Favoriten · Erdgeschoss · Aussenbereich · Obergeschoss", "Listenfilter; der aktive Chip ist violett."], ["Etagenkopf (▲)", "Klappt die Räume der Etage ein oder aus."], ["★ (Kartenecke)", "Fügt den Raum zu den Favoriten hinzu oder entfernt ihn (gefüllter Stern bei Favorit)."], ["Raumkarte", "Öffnet das Raumdetail. Abzeichen: bernsteinfarbene Glühbirne (Licht an), cyanfarbener Behang (Beschattung offen), Thermometer (klimatisierter Raum), korallenfarbenes Schloss (Tür entriegelt)."]] },
      { title: "Räume — Favoriten", image: IMG + "04-pieces-favoris.png", text: "Der Filter Favoriten behält nur die mit Stern markierten Räume (standardmässig Wohnzimmer, Pool, Hauptschlafzimmer).", buttons: [["Favoriten", "Favoritenfilter; die Auswahl wird auch unter Verwalten › Räume anzeigen verwaltet."]] },
      { title: "Raumdetail — Wohnzimmer", image: IMG + "05-detail-sejour.png", text: "Das Detail zeigt das Foto, eine Zusammenfassung (Lichter, Beschattung, Temperatur), die Aktion Raum ausschalten und eine Karte pro konfiguriertem Dienst.", buttons: [["‹ (zurück)", "Zurück zur Raumliste."], ["Raum ausschalten", "Schaltet alle Lichter des Raums aus, stoppt die Musik und schaltet alle Video-Displays aus."], ["Licht: ⏻ / 💡", "Alles aus (die Taste leuchtet violett, wenn alles aus ist) oder alles ein auf 100 % (bernstein). Das Reglersymbol öffnet das Blatt Licht."], ["Beschattung: ■ / ☰", "Alle schliessen oder alle öffnen (die aktive Taste ist cyan). Das Reglersymbol öffnet das Blatt Beschattung."], ["Thermostat", "Mini-Skala mit Sollwert, Modus (Heizen, Kühlen, Automatik) und Zeitplanstatus. Ein Tipp auf den Kopf öffnet das Blatt Thermostat."], ["− / + (Sollwert)", "Sollwert in Schritten von 0,5 °C, zwischen 16 und 30 °C."], ["Schloss: 🔒 / 🔓", "Verriegelt (violett) oder entriegelt (korall) die Haustür; der Status wird rot „Entriegelt“."], ["Musik", "Laufender Titel mit animiertem Equalizer; öffnet das Blatt Musik."], ["Video", "„Aktiv“, wenn ein Display eingeschaltet ist; öffnet das Blatt Video."]] },
      { title: "Blatt Licht", image: IMG + "06-feuille-lumieres.png", text: "Steuerung Kreis für Kreis: dimmbare Lasten haben einen Regler, Ein/Aus-Lasten einen Schalter.", buttons: [["⏻ / 💡 (Segment)", "Alles aus oder alles ein auf 100 %; das aktive Segment ist bernsteinfarben."], ["Dunkler / Heller (Sonne)", "Senkt oder erhöht alle Kreise des Raums um jeweils 20 %."], ["Regler (Spots plafond, Corniche LED…)", "Niveau 0–100 %; der Prozentwert wird bernsteinfarben, sobald der Kreis an ist."], ["Schalter (Liseuses)", "0 / 100 %-Umschalter der nicht dimmbaren Kreise."], ["✕", "Schliesst das Blatt; ein Tipp ausserhalb des Blatts schliesst es ebenfalls."]] },
      { title: "Blatt Beschattung", image: IMG + "07-feuille-occultants.png", text: "Position jedes Behangs in Prozent, mit Fahrbefehlen.", buttons: [["■ / ☰ (Segment)", "Alle schliessen oder alle öffnen."], ["Regler", "Position von 0 (Geschlossen) bis 100 % (Offen); Zwischenpositionen in %."], ["▲ Auf · Stopp · ▼ Ab", "Ganz öffnen, Stopp in Mittelstellung (50 %), ganz schliessen."], ["✕", "Schliesst das Blatt."]] },
      { title: "Blatt Thermostat", image: IMG + "08-feuille-thermostat.png", text: "Skala mit Verlauf cyan → korall und Sollwertcursor, aktuelle Temperatur in der Mitte, dann Modus, Lüfter, Zeitplan und Luftfeuchtigkeit.", buttons: [["− / +", "Sollwert in Schritten von 0,5 °C (16–30 °C); die Beschriftung lautet je nach Modus „Heizen auf“ oder „Kühlen auf“."], ["Modus", "Jeder Tipp wechselt Heizen → Kühlen → Automatik; das Skalensymbol (Flamme / Schneeflocke) folgt."], ["Lüfter", "Automatik oder Dauerlauf."], ["Zeitplan", "Aktiv oder Pausiert (manuelles Halten des Sollwerts)."], ["Luftfeuchtigkeit + Schalter", "Gemessene Feuchte und Aktivierung der Feuchteregelung."]] },
      { title: "Blatt Video", image: IMG + "09-feuille-video.png", text: "Videoverteilung: vier Displays des Hauses, fünf Quellen und das Senderraster, wenn die TV-Quelle gewählt ist.", buttons: [["Displays (Liste)", "Wählt das zu steuernde Display; die violette Zeile ist das Zieldisplay, der Untertitel zeigt die Quelle oder „Inaktiv“."], ["⏻ (pro Display)", "Schaltet das Display auf TV / IPTV ein oder aus."], ["TV / IPTV · Box streaming · Lecteur Blu-ray · PC / Présentation · Vidéosurveillance", "Leitet die Quelle auf das Zieldisplay (und schaltet es ein); ein violettes Häkchen markiert die aktive Quelle."], ["Sender RTS 1 … Musique (201–208)", "Senderkurzwahl, nur bei TV / IPTV sichtbar; der aktive Sender ist violett umrandet."]] },
      { title: "Blatt Musik", image: IMG + "10-feuille-musique.png", text: "Audiodienste, Favoriten und laufender Player für das Multiroom.", buttons: [["Multiroom · Radio · Streaming · Bibliothèque · Entrée ligne", "Dienstwahl; startet die Wiedergabe im Wohnzimmer, der aktive Dienst ist hervorgehoben."], ["Favoriten (Couleur 3, Jazz du soir, Playlist Terrasse…)", "Startet den Favoriten: Titel, Untertitel und Coverfarbe werden im Player und in der unteren Leiste aktualisiert."], ["⏮ ⏯ ⏭", "Zurück, Wiedergabe / Pause (das Symbol wechselt), Weiter."], ["🔊 + Regler", "Lautstärke 0–100; das Lautsprechersymbol schaltet stumm (Lautstärke 0)."]] },
      { title: "Verwalten (Einstellungen)", image: IMG + "11-reglages.png", text: "Lokale Anpassung der App: Darstellung, auf der Startseite angezeigte Kacheln und Lieblingsräume.", buttons: [["Helles Thema / Dunkles Thema", "Themenschalter; die ganze Oberfläche wechselt sofort."], ["Steuerungen anzeigen", "Sechs Schalter (Licht, Beschattung, Thermostat, Musik, Zugang, Pool), die die entsprechenden Startkacheln aus- oder einblenden."], ["Räume anzeigen", "Ein Schalter pro Raum: legt die Favoriten für den Filter Favoriten fest."]] },
      { title: "Dunkles Thema", image: IMG + "12-theme-sombre.png", text: "Dieselbe Startseite im dunklen Thema: anthrazitfarbener Hintergrund, erhabene Kacheln, Akzente in Violett, Cyan und Bernstein bleiben erhalten.", buttons: [] },
      { title: "iPhone — Start", image: IMG + "13-iphone-accueil.png", portrait: true, text: "Auf dem Smartphone scrollt die Seite in einer Spalte; die Reiter Start / Räume sind auf Symbole reduziert und der Miniplayer bleibt darüber.", buttons: [["Szenen und Kacheln", "Dieselben Funktionen wie auf dem Panel."], ["⌂ / ▦", "Reiter Start und Räume."]] },
      { title: "iPhone — Raumdetail", image: IMG + "14-iphone-detail-sejour.png", portrait: true, text: "Die Dienste stapeln sich in zwei Spalten; das Thermostat nimmt die ganze Breite ein.", buttons: [["‹", "Zurück zur Raumliste."], ["Dienstkarten", "Identisch mit dem Panel: Licht, Beschattung, Thermostat, Schloss, Musik, Video."]] },
    ],
  },
};
