// Fiche détaillée « Suite Palace Montreux » : chaque écran de la tablette de suite, avec
// capture et explication de chaque bouton. Captures : public/sheets/suite-palace-montreux/
// (iPad ; version iPhone en portrait).
const IMG = "/sheets/suite-palace-montreux/";

export default {
  fr: {
    intro:
      "Tablette de chambre d'une suite de palace : l'hôte la trouve sur sa table de chevet, dans sa langue. L'interface embarque son propre sélecteur à six langues (FR, EN, DE, IT, ES, JA), indépendant du site et du programme Crestron. Six pages accessibles depuis le menu de gauche : Accueil, Climat, Lumières, Rideaux, Médias et Services. La même interface tourne sur la dalle murale Crestron ; sur iPhone, le menu passe en barre d'onglets en bas.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        text:
          "Page d'accueil : message de bienvenue au nom de l'hôte, heure, date et météo de Montreux, les quatre ambiances, les trois demandes à l'étage et un rappel de l'état de la suite (consigne, lumières, voilage, musique).",
        buttons: [
          ["🇫🇷 FR · 🇬🇧 EN · 🇩🇪 DE · 🇮🇹 IT · 🇪🇸 ES · 🇯🇵 JA", "Sélecteur de langue de la tablette : toute l'interface, la date, l'heure et le nom de la playlist basculent immédiatement ; la langue active est surlignée en doré."],
          ["Accueil · Climat · Lumières · Rideaux · Médias · Services", "Menu des pages ; la page ouverte est surlignée en doré."],
          ["Réveil", "Ambiance matin : plafond 70 %, chevets 40 %, salle de bain 60 %, terrasse éteinte ; voilage et occultant ouverts ; consigne 21,5 °C."],
          ["Lecture", "Plafond 20 %, chevets 85 %, salle de bain et terrasse éteintes ; voilage à 40 %, occultant ouvert ; consigne 22 °C."],
          ["Détente", "Ambiance par défaut : plafond 35 %, chevets 50 %, salle de bain 30 %, terrasse 60 % ; voilage 70 %, occultant ouvert ; consigne 22,5 °C."],
          ["Nuit", "Plafond éteint, chevets 8 %, salle de bain 10 % (veilleuse) ; voilage et occultant fermés ; consigne 20 °C."],
          ["Tout éteindre", "Éteint les quatre zones d'éclairage, la télévision et la musique ; aucune ambiance ne reste sélectionnée."],
          ["Ne pas déranger", "Active ou désactive le mode « Ne pas déranger » (voir ci-dessous) ; exclut « Faire la chambre »."],
          ["Faire la chambre", "Signale à l'étage que la chambre peut être faite : bouton vert et pastille « Faire la chambre » dans l'en-tête ; exclut « Ne pas déranger »."],
          ["Appeler le majordome", "Envoie la demande : le bouton passe en doré et affiche « Le majordome arrive » pendant 6 secondes."],
          ["Consigne · Lumières · Voilage · Musique", "Rappel en direct : consigne de température, niveau moyen des quatre zones d'éclairage, ouverture du voilage, volume de la musique (« — » si la musique est arrêtée)."],
        ],
      },
      {
        title: "Ne pas déranger",
        image: IMG + "02-accueil-ne-pas-deranger.png",
        text:
          "Mode activé : le bouton devient bordeaux, une pastille « Ne pas déranger » apparaît dans l'en-tête et le fond de l'interface se teinte légèrement. La même information est transmise au voyant de porte et au service d'étage.",
        buttons: [
          ["Ne pas déranger (actif)", "Un nouvel appui désactive le mode et retire la pastille."],
        ],
      },
      {
        title: "Climat",
        image: IMG + "03-climat.png",
        text:
          "Consigne de température sur un cadran, avec la température mesurée en dessous, et le choix de la vitesse de ventilation.",
        buttons: [
          ["− / +", "Baisse ou monte la consigne par pas de 0,5 °C entre 17 et 28 °C ; l'arc doré du cadran suit la consigne."],
          ["Cadran", "Consigne en grand, température mesurée (22,1 °C) en petit."],
          ["Auto · Faible · Forte", "Vitesse de ventilation du ventilo-convecteur ; le mode actif est surligné et l'hélice tourne plus ou moins vite."],
        ],
      },
      {
        title: "Lumières",
        image: IMG + "04-lumieres.png",
        text:
          "Quatre zones d'éclairage gradables : Plafond, Chevets, Salle de bain, Terrasse. La carte d'une zone s'éclaire lorsqu'elle est allumée.",
        buttons: [
          ["Curseurs", "Niveau de 0 à 100 % de chaque zone ; le pourcentage s'affiche à droite du nom. Un réglage manuel désélectionne l'ambiance en cours."],
          ["⏻ (par zone)", "Éteint la zone (0 %) ou la rallume à 60 % ; le bouton est doré lorsque la zone est allumée."],
          ["Tous 100 % · Tous 30 % · Tout éteindre", "Les quatre zones ensemble : plein feu, éclairage doux ou extinction."],
        ],
      },
      {
        title: "Rideaux",
        image: IMG + "05-rideaux.png",
        text:
          "Voilage et occultant motorisés, chacun avec une fenêtre schématique qui montre la position du tissu et un curseur de position.",
        buttons: [
          ["▲ Ouvrir", "Ouverture complète (100 %) ; un indicateur de mouvement apparaît 1,5 s."],
          ["■ Stop", "Arrête le mouvement en cours."],
          ["▼ Fermer", "Fermeture complète (0 %)."],
          ["Curseur", "Position intermédiaire de 0 à 100 % ; le pourcentage est repris dans le titre de la carte et le dessin de la fenêtre se met à jour."],
        ],
      },
      {
        title: "Médias",
        image: IMG + "06-medias.png",
        text:
          "Télévision Samsung 65\" et système musical Bang & Olufsen. Ici la TV est allumée sur RTS 1 et la musique est en lecture.",
        buttons: [
          ["⏻ (TV)", "Allume ou éteint le téléviseur ; le bouton est doré quand la TV est allumée et l'écran affiche la chaîne en cours."],
          ["‹ Chaînes ›", "Chaîne précédente / suivante dans la liste (inactifs quand la TV est éteinte)."],
          ["RTS 1 · BBC One · ARD · Rai 1 · CNN · Eurosport · NHK World · Sky News", "Accès direct à la chaîne ; allume la TV si nécessaire. La chaîne en cours est affichée en noir."],
          ["▶ / ⏸ (Musique)", "Lecture ou pause de la playlist « Jazz au bord du lac » ; le disque tourne pendant la lecture."],
          ["Volume", "Curseur 0–100 du volume de la suite ; la valeur est reprise dans le titre."],
        ],
      },
      {
        title: "Services",
        image: IMG + "07-services.png",
        text:
          "Commande des services de l'hôtel depuis la tablette. Chaque carte se coche après l'appui ; ici le petit-déjeuner est commandé.",
        buttons: [
          ["Petit-déjeuner en chambre (07:30 – 10:30)", "Commander → « ✔ Commandé » ; un second appui annule."],
          ["Room service (24 h / 24)", "Commander → « ✔ Commandé »."],
          ["Massage 60 min · Sauna privé", "Réserver au Spa & bien-être → « ✔ Réservé »."],
          ["Ménage · Blanchisserie · Taxi · Départ (12:00)", "Réserver → « ✔ Demandé » : la demande est transmise à la réception."],
        ],
      },
      {
        title: "Langue : English",
        image: IMG + "08-langue-anglais.png",
        text:
          "Après un appui sur EN : menu, ambiances, demandes, date et heure passent en anglais (« Lake Geneva Suite · 512 », « Wake up », « Do not disturb »…).",
        buttons: [
          ["EN (actif)", "Langue mémorisée pour la suite jusqu'au prochain changement."],
        ],
      },
      {
        title: "Langue : 日本語",
        image: IMG + "09-langue-japonais.png",
        text:
          "Version japonaise : l'hôte est salué par « ようこそ, 田中様 », la date suit le format japonais et toutes les commandes sont traduites.",
        buttons: [
          ["JA (actif)", "Toutes les pages (空調, 照明, カーテン, メディア, サービス) sont traduites."],
        ],
      },
      {
        title: "Version iPhone",
        image: IMG + "10-iphone-accueil.png",
        image2: IMG + "11-iphone-lumieres.png",
        portrait: true,
        text:
          "Sur iPhone, le sélecteur de langue ne montre que les drapeaux et le menu devient une barre d'onglets en bas de l'écran ; les cartes se réorganisent en colonne. Toutes les fonctions restent identiques.",
        buttons: [
          ["Barre d'onglets", "Accueil, Climat, Lumières, Rideaux, Médias, Services ; l'onglet actif est doré."],
          ["Drapeaux", "Même sélecteur de langue, sans le code de langue."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Bedroom tablet of a palace suite: the guest finds it on the bedside table, in their own language. The interface embeds its own six-language selector (FR, EN, DE, IT, ES, JA), independent from the website and from the Crestron program. Six pages are reachable from the left menu: Home, Climate, Lights, Curtains, Media and Services. The same interface runs on the Crestron wall panel; on iPhone the menu becomes a bottom tab bar.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        text: "Home page: welcome message with the guest's name, time, date and Montreux weather, the four scenes, the three floor requests and a live recap of the suite (setpoint, lights, sheer, music).",
        buttons: [
          ["🇫🇷 FR · 🇬🇧 EN · 🇩🇪 DE · 🇮🇹 IT · 🇪🇸 ES · 🇯🇵 JA", "Tablet language selector: the whole interface, date, time and playlist name switch immediately; the active language is highlighted in gold."],
          ["Home · Climate · Lights · Curtains · Media · Services", "Page menu; the open page is highlighted in gold."],
          ["Wake up", "Morning scene: ceiling 70 %, bedside 40 %, bathroom 60 %, terrace off; sheer and blackout open; setpoint 21.5 °C."],
          ["Reading", "Ceiling 20 %, bedside 85 %, bathroom and terrace off; sheer 40 %, blackout open; setpoint 22 °C."],
          ["Relax", "Default scene: ceiling 35 %, bedside 50 %, bathroom 30 %, terrace 60 %; sheer 70 %, blackout open; setpoint 22.5 °C."],
          ["Night", "Ceiling off, bedside 8 %, bathroom 10 % (nightlight); sheer and blackout closed; setpoint 20 °C."],
          ["All off", "Switches off the four lighting zones, the TV and the music; no scene stays selected."],
          ["Do not disturb", "Turns the “Do not disturb” mode on or off (see below); excludes “Make up room”."],
          ["Make up room", "Tells housekeeping the room can be serviced: green button and “Make up room” chip in the header; excludes “Do not disturb”."],
          ["Call the butler", "Sends the request: the button turns gold and reads “Your butler is on the way” for 6 seconds."],
          ["Setpoint · Lights · Sheer · Music", "Live recap: temperature setpoint, average level of the four lighting zones, sheer opening, music volume (“—” when music is stopped)."],
        ],
      },
      {
        title: "Do not disturb",
        image: IMG + "02-accueil-ne-pas-deranger.png",
        text: "Mode active: the button turns burgundy, a “Do not disturb” chip appears in the header and the interface background is slightly tinted. The same information goes to the door indicator and to housekeeping.",
        buttons: [
          ["Do not disturb (active)", "Another tap turns the mode off and removes the chip."],
        ],
      },
      {
        title: "Climate",
        image: IMG + "03-climat.png",
        text: "Temperature setpoint on a dial, with the measured temperature below, and the fan speed choice.",
        buttons: [
          ["− / +", "Lowers or raises the setpoint in 0.5 °C steps between 17 and 28 °C; the gold arc of the dial follows the setpoint."],
          ["Dial", "Setpoint in large type, measured temperature (22.1 °C) in small type."],
          ["Auto · Low · High", "Fan-coil speed; the active mode is highlighted and the fan icon spins faster or slower."],
        ],
      },
      {
        title: "Lights",
        image: IMG + "04-lumieres.png",
        text: "Four dimmable lighting zones: Ceiling, Bedside, Bathroom, Terrace. A zone card lights up when the zone is on.",
        buttons: [
          ["Sliders", "0–100 % level of each zone; the percentage shows to the right of the name. A manual adjustment deselects the current scene."],
          ["⏻ (per zone)", "Switches the zone off (0 %) or back on at 60 %; the button is gold when the zone is on."],
          ["All 100 % · All 30 % · All off", "The four zones together: full, soft lighting or off."],
        ],
      },
      {
        title: "Curtains",
        image: IMG + "05-rideaux.png",
        text: "Motorised sheer and blackout, each with a schematic window showing the fabric position and a position slider.",
        buttons: [
          ["▲ Open", "Fully open (100 %); a movement indicator shows for 1.5 s."],
          ["■ Stop", "Stops the current movement."],
          ["▼ Close", "Fully closed (0 %)."],
          ["Slider", "Intermediate position from 0 to 100 %; the percentage is repeated in the card title and the window drawing updates."],
        ],
      },
      {
        title: "Media",
        image: IMG + "06-medias.png",
        text: "Samsung 65\" television and Bang & Olufsen music system. Here the TV is on RTS 1 and music is playing.",
        buttons: [
          ["⏻ (TV)", "Switches the TV on or off; the button is gold when the TV is on and the screen shows the current channel."],
          ["‹ Channels ›", "Previous / next channel in the list (inactive while the TV is off)."],
          ["RTS 1 · BBC One · ARD · Rai 1 · CNN · Eurosport · NHK World · Sky News", "Direct channel access; switches the TV on if needed. The current channel is shown in black."],
          ["▶ / ⏸ (Music)", "Plays or pauses the “Lakeside jazz” playlist; the disc spins during playback."],
          ["Volume", "0–100 slider for the suite volume; the value is repeated in the title."],
        ],
      },
      {
        title: "Services",
        image: IMG + "07-services.png",
        text: "Hotel services ordered from the tablet. Each card gets ticked after the tap; here breakfast has been ordered.",
        buttons: [
          ["In-room breakfast (07:30 – 10:30)", "Order → “✔ Ordered”; a second tap cancels."],
          ["Room service (24 h / 24)", "Order → “✔ Ordered”."],
          ["60-min massage · Private sauna", "Book at the Spa & wellness → “✔ Booked”."],
          ["Housekeeping · Laundry · Taxi · Check-out (12:00)", "Book → “✔ Requested”: the request is sent to the front desk."],
        ],
      },
      {
        title: "Language: English",
        image: IMG + "08-langue-anglais.png",
        text: "After tapping EN: menu, scenes, requests, date and time switch to English (“Lake Geneva Suite · 512”, “Wake up”, “Do not disturb”…).",
        buttons: [
          ["EN (active)", "Language kept for the suite until the next change."],
        ],
      },
      {
        title: "Language: 日本語",
        image: IMG + "09-langue-japonais.png",
        text: "Japanese version: the guest is greeted with “ようこそ, 田中様”, the date follows the Japanese format and every command is translated.",
        buttons: [
          ["JA (active)", "Every page (空調, 照明, カーテン, メディア, サービス) is translated."],
        ],
      },
      {
        title: "iPhone version",
        image: IMG + "10-iphone-accueil.png",
        image2: IMG + "11-iphone-lumieres.png",
        portrait: true,
        text: "On iPhone the language selector shows only the flags and the menu becomes a tab bar at the bottom of the screen; cards reflow into one column. Every function stays identical.",
        buttons: [
          ["Tab bar", "Home, Climate, Lights, Curtains, Media, Services; the active tab is gold."],
          ["Flags", "Same language selector, without the language code."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Zimmer-Tablet einer Palace-Suite: der Gast findet es auf dem Nachttisch, in seiner Sprache. Die Oberfläche hat einen eigenen Sprachwähler mit sechs Sprachen (FR, EN, DE, IT, ES, JA), unabhängig von der Website und vom Crestron-Programm. Sechs Seiten sind über das linke Menü erreichbar: Start, Klima, Licht, Vorhänge, Medien und Service. Dieselbe Oberfläche läuft auf dem Crestron-Wandpanel; auf dem iPhone wird das Menü zur Tab-Leiste unten.",
    sections: [
      {
        title: "Start",
        image: IMG + "01-accueil.png",
        text: "Startseite: Begrüssung mit dem Namen des Gastes, Uhrzeit, Datum und Wetter in Montreux, die vier Szenen, die drei Etagenwünsche und eine Live-Übersicht der Suite (Sollwert, Licht, Store, Musik).",
        buttons: [
          ["🇫🇷 FR · 🇬🇧 EN · 🇩🇪 DE · 🇮🇹 IT · 🇪🇸 ES · 🇯🇵 JA", "Sprachwähler des Tablets: die gesamte Oberfläche, Datum, Uhrzeit und Playlist-Name wechseln sofort; die aktive Sprache ist gold hervorgehoben."],
          ["Start · Klima · Licht · Vorhänge · Medien · Service", "Seitenmenü; die geöffnete Seite ist gold hervorgehoben."],
          ["Aufwachen", "Morgenszene: Decke 70 %, Nachttische 40 %, Bad 60 %, Terrasse aus; Store und Verdunkelung offen; Sollwert 21,5 °C."],
          ["Lesen", "Decke 20 %, Nachttische 85 %, Bad und Terrasse aus; Store 40 %, Verdunkelung offen; Sollwert 22 °C."],
          ["Entspannen", "Standardszene: Decke 35 %, Nachttische 50 %, Bad 30 %, Terrasse 60 %; Store 70 %, Verdunkelung offen; Sollwert 22,5 °C."],
          ["Nacht", "Decke aus, Nachttische 8 %, Bad 10 % (Nachtlicht); Store und Verdunkelung geschlossen; Sollwert 20 °C."],
          ["Alles aus", "Schaltet die vier Lichtzonen, den Fernseher und die Musik aus; keine Szene bleibt gewählt."],
          ["Bitte nicht stören", "Schaltet den Modus „Bitte nicht stören“ ein oder aus (siehe unten); schliesst „Zimmer aufräumen“ aus."],
          ["Zimmer aufräumen", "Meldet der Etage, dass das Zimmer gereinigt werden kann: grüne Taste und Chip „Zimmer aufräumen“ in der Kopfzeile; schliesst „Bitte nicht stören“ aus."],
          ["Butler rufen", "Sendet die Anfrage: die Taste wird gold und zeigt 6 Sekunden lang „Ihr Butler ist unterwegs“."],
          ["Sollwert · Licht · Store · Musik", "Live-Übersicht: Temperatursollwert, mittleres Niveau der vier Lichtzonen, Öffnung der Store, Musiklautstärke („—“ bei gestoppter Musik)."],
        ],
      },
      {
        title: "Bitte nicht stören",
        image: IMG + "02-accueil-ne-pas-deranger.png",
        text: "Modus aktiv: die Taste wird bordeauxrot, ein Chip „Bitte nicht stören“ erscheint in der Kopfzeile und der Hintergrund der Oberfläche wird leicht getönt. Dieselbe Information geht an die Türanzeige und das Housekeeping.",
        buttons: [
          ["Bitte nicht stören (aktiv)", "Ein weiterer Tipp schaltet den Modus aus und entfernt den Chip."],
        ],
      },
      {
        title: "Klima",
        image: IMG + "03-climat.png",
        text: "Temperatursollwert auf einer Skala, darunter die gemessene Temperatur, und die Wahl der Lüfterstufe.",
        buttons: [
          ["− / +", "Senkt oder erhöht den Sollwert in 0,5-°C-Schritten zwischen 17 und 28 °C; der goldene Bogen der Skala folgt dem Sollwert."],
          ["Skala", "Sollwert gross, gemessene Temperatur (22,1 °C) klein."],
          ["Auto · Niedrig · Hoch", "Lüfterstufe des Gebläsekonvektors; der aktive Modus ist hervorgehoben und das Lüftersymbol dreht schneller oder langsamer."],
        ],
      },
      {
        title: "Licht",
        image: IMG + "04-lumieres.png",
        text: "Vier dimmbare Lichtzonen: Decke, Nachttische, Bad, Terrasse. Die Karte einer Zone leuchtet, wenn sie eingeschaltet ist.",
        buttons: [
          ["Regler", "Niveau 0–100 % jeder Zone; der Prozentwert steht rechts neben dem Namen. Eine manuelle Einstellung hebt die aktuelle Szene auf."],
          ["⏻ (je Zone)", "Schaltet die Zone aus (0 %) oder mit 60 % wieder ein; die Taste ist gold, wenn die Zone eingeschaltet ist."],
          ["Alle 100 % · Alle 30 % · Alles aus", "Die vier Zonen gemeinsam: volles, sanftes Licht oder aus."],
        ],
      },
      {
        title: "Vorhänge",
        image: IMG + "05-rideaux.png",
        text: "Motorisierte Store und Verdunkelung, jeweils mit einem schematischen Fenster, das die Stoffposition zeigt, und einem Positionsregler.",
        buttons: [
          ["▲ Öffnen", "Vollständig öffnen (100 %); eine Bewegungsanzeige erscheint 1,5 s."],
          ["■ Stopp", "Stoppt die laufende Bewegung."],
          ["▼ Schliessen", "Vollständig schliessen (0 %)."],
          ["Regler", "Zwischenposition von 0 bis 100 %; der Prozentwert steht im Kartentitel und die Fensterzeichnung aktualisiert sich."],
        ],
      },
      {
        title: "Medien",
        image: IMG + "06-medias.png",
        text: "Samsung-65\"-Fernseher und Bang-&-Olufsen-Musiksystem. Hier läuft der Fernseher auf RTS 1 und die Musik spielt.",
        buttons: [
          ["⏻ (TV)", "Schaltet den Fernseher ein oder aus; die Taste ist gold, wenn der Fernseher läuft, und der Bildschirm zeigt den aktuellen Sender."],
          ["‹ Sender ›", "Vorheriger / nächster Sender in der Liste (inaktiv bei ausgeschaltetem Fernseher)."],
          ["RTS 1 · BBC One · ARD · Rai 1 · CNN · Eurosport · NHK World · Sky News", "Direktwahl des Senders; schaltet den Fernseher bei Bedarf ein. Der aktuelle Sender ist schwarz dargestellt."],
          ["▶ / ⏸ (Musik)", "Wiedergabe oder Pause der Playlist „Jazz am See“; die Scheibe dreht sich während der Wiedergabe."],
          ["Lautstärke", "Regler 0–100 für die Lautstärke der Suite; der Wert steht im Titel."],
        ],
      },
      {
        title: "Service",
        image: IMG + "07-services.png",
        text: "Bestellung der Hotelservices vom Tablet aus. Jede Karte wird nach dem Tipp abgehakt; hier ist das Frühstück bestellt.",
        buttons: [
          ["Frühstück im Zimmer (07:30 – 10:30)", "Bestellen → „✔ Bestellt“; ein zweiter Tipp storniert."],
          ["Zimmerservice (24 h / 24)", "Bestellen → „✔ Bestellt“."],
          ["Massage 60 Min. · Private Sauna", "Buchen im Spa & Wellness → „✔ Gebucht“."],
          ["Housekeeping · Wäscherei · Taxi · Abreise (12:00)", "Buchen → „✔ Angefragt“: die Anfrage geht an die Rezeption."],
        ],
      },
      {
        title: "Sprache: English",
        image: IMG + "08-langue-anglais.png",
        text: "Nach einem Tipp auf EN: Menü, Szenen, Wünsche, Datum und Uhrzeit wechseln auf Englisch („Lake Geneva Suite · 512“, „Wake up“, „Do not disturb“ …).",
        buttons: [
          ["EN (aktiv)", "Sprache bleibt für die Suite bis zum nächsten Wechsel gespeichert."],
        ],
      },
      {
        title: "Sprache: 日本語",
        image: IMG + "09-langue-japonais.png",
        text: "Japanische Version: der Gast wird mit „ようこそ, 田中様“ begrüsst, das Datum folgt dem japanischen Format und alle Befehle sind übersetzt.",
        buttons: [
          ["JA (aktiv)", "Alle Seiten (空調, 照明, カーテン, メディア, サービス) sind übersetzt."],
        ],
      },
      {
        title: "iPhone-Version",
        image: IMG + "10-iphone-accueil.png",
        image2: IMG + "11-iphone-lumieres.png",
        portrait: true,
        text: "Auf dem iPhone zeigt der Sprachwähler nur die Flaggen und das Menü wird zur Tab-Leiste am unteren Bildschirmrand; die Karten ordnen sich in einer Spalte an. Alle Funktionen bleiben identisch.",
        buttons: [
          ["Tab-Leiste", "Start, Klima, Licht, Vorhänge, Medien, Service; der aktive Reiter ist gold."],
          ["Flaggen", "Derselbe Sprachwähler, ohne Sprachcode."],
        ],
      },
    ],
  },
};
