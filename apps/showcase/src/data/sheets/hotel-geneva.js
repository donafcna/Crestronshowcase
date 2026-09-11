// Fiche détaillée « Palace 5* Genève » : chaque écran du tableau de bord, avec capture et
// explication de chaque bouton. Captures : public/sheets/hotel-geneva/ (XPanel PC).
const IMG = "/sheets/hotel-geneva/";

export default {
  fr: {
    intro:
      "Tableau de bord d'administration d'un palace genevois, inspiré du Crestron Connect Dashboard. Il s'utilise d'abord sur le XPanel du PC de la réception ou de la maintenance, puis à l'identique sur la dalle tactile et l'iPad. Une colonne de navigation à gauche, une zone de travail à droite : liste des chambres, contrôle des équipements d'une chambre, liste des systèmes Crestron et alertes. L'interface est traduite dans la langue choisie sur le site (FR, EN, DE, ES, RU, AR, ZH).",
    sections: [
      {
        title: "Chambres d'hôtes",
        image: IMG + "01-chambres.png",
        text:
          "Écran d'accueil : la liste des chambres supervisées avec, pour chacune, la température mesurée, le mode CVC et sa consigne, la vitesse de ventilation, l'état d'occupation et l'humidité.",
        buttons: [
          ["‹ Palace Genève", "Sélecteur de propriété : rappelle l'établissement supervisé (une seule propriété dans cette configuration)."],
          ["Supervision", "Ouvre la liste des systèmes Crestron (processeurs et dalles) avec leur version et leur état de connexion."],
          ["Espaces", "Revient à la liste des chambres ; l'entrée est surlignée en bleu quand la liste est affichée."],
          ["Résumé des pièces", "Affiche également la liste des chambres (vue résumée)."],
          ["Alertes · 61", "Ouvre la page des alertes ; le badge rouge indique le nombre d'événements journalisés."],
          ["Partager · Configuration", "Partage du tableau de bord et paramètres de l'établissement (réservés à l'administrateur)."],
          ["Administrator · 🔔 · ⚙️ · DP", "Compte connecté, notifications, réglages et avatar de l'utilisateur."],
          ["Actualiser", "Demande une relecture de l'état de toutes les chambres au processeur ; l'heure de dernière mise à jour s'affiche à côté."],
          ["Rechercher un numéro de chambre…", "Filtre la liste en direct dès la première saisie (voir ci-dessous)."],
          ["Ligne de chambre", "Un appui sur une ligne ouvre le contrôle des équipements de la chambre. L'icône CVC indique le mode : 🔥 chauffage, ❄ refroidissement, ⏻ arrêt ; le point vert précède l'état d'occupation (Louée / Non Louée)."],
        ],
      },
      {
        title: "Recherche par numéro",
        image: IMG + "02-recherche-chambre.png",
        text:
          "La saisie de « 50 » ne conserve que les chambres dont le numéro contient ces chiffres : 500, 501, 502, 504. Effacer le champ rétablit la liste complète.",
        buttons: [
          ["Champ de recherche", "Filtre par correspondance partielle sur le numéro ; aucune validation nécessaire."],
        ],
      },
      {
        title: "Chambre – Éclairages",
        image: IMG + "03-chambre-eclairages.png",
        text:
          "Contrôle des équipements de la chambre sélectionnée (ici la 401). L'onglet Éclairages présente les neuf circuits de la chambre sous forme de vignettes ; le panneau de droite rappelle le statut climatique et l'occupation.",
        buttons: [
          ["← Retour", "Referme la chambre et revient à la liste."],
          ["Éclairages · Stores · Autres", "Trois onglets de la carte Contrôle Équipements ; l'onglet actif est souligné en bleu."],
          ["⏻ (sur chaque vignette)", "Allume ou éteint le circuit. Vignette et bouton passent en bleu lorsque le circuit est allumé ; « OFF » remplace le pourcentage quand il est éteint."],
          ["− / +", "Baisse ou monte le niveau du circuit par pas de 5 % (de 0 à 100 %) ; la barre de progression et le pourcentage suivent. Descendre à 0 % éteint le circuit, remonter le rallume."],
          ["C7 Right Bedside Lamp … C8 Corniche WC", "Identifiant et nom de chaque circuit tels que déclarés dans le programme Crestron (chevet, prises, spots plafond, miroir, veilleuse, niche, corniche WC)."],
          ["Statut Chambre", "Température CVC, consigne, ventilation et occupation de la chambre, remontées par le processeur."],
        ],
      },
      {
        title: "Chambre – Stores",
        image: IMG + "04-chambre-stores.png",
        text:
          "Commande des rideaux motorisés de la chambre : position en pourcentage, avec les deux fins de course en accès direct.",
        buttons: [
          ["Close", "Ferme complètement le rideau (0 %) ; l'état affiche « Fermé »."],
          ["Curseur", "Position intermédiaire de 0 à 100 % ; l'état affiche « Ouvert à n % »."],
          ["Open", "Ouvre complètement le rideau (100 %) ; l'état affiche « Ouvert »."],
        ],
      },
      {
        title: "Chambre – Autres",
        image: IMG + "05-chambre-autres.png",
        text:
          "Fonctions avancées réservées à la maintenance : mise à jour du micrologiciel de l'équipement de la chambre.",
        buttons: [
          ["Mettre à jour", "Lance la mise à jour du firmware de la dalle ou du processeur de la chambre (action administrateur)."],
        ],
      },
      {
        title: "Supervision des systèmes",
        image: IMG + "06-supervision-systemes.png",
        text:
          "Liste des systèmes Crestron de l'établissement : dalles TS-1070 par chambre et processeurs MC4-R partagés entre plusieurs chambres, avec version du micrologiciel et état de connexion.",
        buttons: [
          ["Nom Équipement · Modèle · Version Micrologiciel", "Identification de chaque système ; les versions différentes (ex. v1.002.0088) signalent une dalle à mettre à jour."],
          ["● Online", "Pastille verte : le système répond au serveur de supervision."],
        ],
      },
      {
        title: "Alertes",
        image: IMG + "07-alertes.png",
        text:
          "Page des alertes en cours. Lorsqu'aucun défaut n'est actif, l'écran confirme que tous les processeurs et dalles fonctionnent normalement.",
        buttons: [
          ["✔ Aucune Alerte en cours", "État de santé global ; toute anomalie (dalle hors ligne, capteur en défaut) apparaîtrait ici avec sa chambre."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Administration dashboard of a Geneva palace hotel, inspired by the Crestron Connect Dashboard. It is used first on the XPanel of the front-desk or maintenance PC, then identically on the touch panel and the iPad. A navigation column on the left, a work area on the right: room list, device control for one room, Crestron system list and alerts. The interface is translated into the language chosen on the site (FR, EN, DE, ES, RU, AR, ZH).",
    sections: [
      {
        title: "Guest Rooms",
        image: IMG + "01-chambres.png",
        text: "Home screen: the list of supervised rooms with, for each, the measured temperature, the HVAC mode and its setpoint, the fan speed, the occupancy status and the humidity.",
        buttons: [
          ["‹ Palace Genève", "Property selector: recalls the supervised property (a single property in this configuration)."],
          ["System Monitor", "Opens the list of Crestron systems (processors and panels) with their version and connection state."],
          ["Spaces", "Back to the room list; the entry is highlighted in blue while the list is shown."],
          ["Room Summaries", "Also shows the room list (summary view)."],
          ["Alerts · 61", "Opens the alerts page; the red badge shows the number of logged events."],
          ["Share · Place Settings", "Dashboard sharing and property settings (administrator only)."],
          ["Administrator · 🔔 · ⚙️ · DP", "Logged-in account, notifications, settings and user avatar."],
          ["Refresh", "Requests a re-read of every room state from the processor; the last refresh time shows next to it."],
          ["Search room numbers…", "Filters the list live from the first character (see below)."],
          ["Room row", "Tapping a row opens the room device control. The HVAC icon shows the mode: 🔥 heating, ❄ cooling, ⏻ off; the green dot precedes the occupancy state (Rented / Not Rented)."],
        ],
      },
      {
        title: "Search by number",
        image: IMG + "02-recherche-chambre.png",
        text: "Typing “50” keeps only the rooms whose number contains those digits: 500, 501, 502, 504. Clearing the field restores the full list.",
        buttons: [
          ["Search field", "Partial-match filter on the room number; no validation needed."],
        ],
      },
      {
        title: "Room – Lights",
        image: IMG + "03-chambre-eclairages.png",
        text: "Device control of the selected room (here 401). The Lights tab shows the nine circuits of the room as tiles; the right-hand panel recalls the climate status and occupancy.",
        buttons: [
          ["← Back", "Closes the room and returns to the list."],
          ["Lights · Shades · Others", "Three tabs of the Device Control card; the active tab is underlined in blue."],
          ["⏻ (on each tile)", "Switches the circuit on or off. Tile and button turn blue when the circuit is on; “OFF” replaces the percentage when it is off."],
          ["− / +", "Lowers or raises the circuit level in 5 % steps (0 to 100 %); the progress bar and percentage follow. Going down to 0 % switches the circuit off, going up switches it back on."],
          ["C7 Right Bedside Lamp … C8 Corniche WC", "Identifier and name of each circuit as declared in the Crestron program (bedside, sockets, ceiling spots, mirror, nightlight, niche, WC cornice)."],
          ["Room status", "HVAC temperature, setpoint, fan and occupancy of the room, reported by the processor."],
        ],
      },
      {
        title: "Room – Shades",
        image: IMG + "04-chambre-stores.png",
        text: "Control of the room's motorised drapes: position in percent, with both end positions one tap away.",
        buttons: [
          ["Close", "Fully closes the drape (0 %); the state shows “Fermé”."],
          ["Slider", "Intermediate position from 0 to 100 %; the state shows “Ouvert à n %”."],
          ["Open", "Fully opens the drape (100 %); the state shows “Ouvert”."],
        ],
      },
      {
        title: "Room – Others",
        image: IMG + "05-chambre-autres.png",
        text: "Advanced functions reserved for maintenance: firmware update of the room equipment.",
        buttons: [
          ["Upgrade Firmware", "Starts the firmware update of the room's panel or processor (administrator action)."],
        ],
      },
      {
        title: "System Monitor",
        image: IMG + "06-supervision-systemes.png",
        text: "List of the property's Crestron systems: TS-1070 panels per room and MC4-R processors shared between several rooms, with firmware version and connection state.",
        buttons: [
          ["Device name · Model · Firmware version", "Identification of each system; differing versions (e.g. v1.002.0088) flag a panel to update."],
          ["● Online", "Green dot: the system answers the supervision server."],
        ],
      },
      {
        title: "Alerts",
        image: IMG + "07-alertes.png",
        text: "Current alerts page. When no fault is active, the screen confirms that every processor and panel is running normally.",
        buttons: [
          ["✔ No current alert", "Global health state; any anomaly (panel offline, faulty sensor) would appear here with its room."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Administrations-Dashboard eines Genfer Luxushotels, inspiriert vom Crestron Connect Dashboard. Es wird zuerst auf dem XPanel des Rezeptions- oder Wartungs-PCs genutzt, dann identisch auf dem Touchpanel und dem iPad. Links eine Navigationsspalte, rechts der Arbeitsbereich: Zimmerliste, Gerätesteuerung eines Zimmers, Crestron-Systemliste und Meldungen. Die Oberfläche ist in die auf der Website gewählte Sprache übersetzt (FR, EN, DE, ES, RU, AR, ZH).",
    sections: [
      {
        title: "Gästezimmer",
        image: IMG + "01-chambres.png",
        text: "Startbildschirm: die Liste der überwachten Zimmer mit gemessener Temperatur, Klimamodus und Sollwert, Lüfterstufe, Belegungsstatus und Luftfeuchtigkeit.",
        buttons: [
          ["‹ Palace Genève", "Objektauswahl: ruft das überwachte Haus auf (in dieser Konfiguration ein einziges Objekt)."],
          ["Systemüberwachung", "Öffnet die Liste der Crestron-Systeme (Prozessoren und Panels) mit Version und Verbindungsstatus."],
          ["Räume", "Zurück zur Zimmerliste; der Eintrag ist blau hervorgehoben, solange die Liste angezeigt wird."],
          ["Zimmerübersicht", "Zeigt ebenfalls die Zimmerliste (Übersichtsansicht)."],
          ["Meldungen · 61", "Öffnet die Meldungsseite; das rote Abzeichen zeigt die Anzahl protokollierter Ereignisse."],
          ["Teilen · Einstellungen", "Freigabe des Dashboards und Objekteinstellungen (nur Administrator)."],
          ["Administrator · 🔔 · ⚙️ · DP", "Angemeldetes Konto, Benachrichtigungen, Einstellungen und Benutzer-Avatar."],
          ["Aktualisieren", "Fordert vom Prozessor ein erneutes Einlesen aller Zimmerzustände an; die Uhrzeit der letzten Aktualisierung steht daneben."],
          ["Zimmer suchen…", "Filtert die Liste live ab dem ersten Zeichen (siehe unten)."],
          ["Zimmerzeile", "Ein Tipp auf eine Zeile öffnet die Gerätesteuerung des Zimmers. Das Klimasymbol zeigt den Modus: 🔥 Heizen, ❄ Kühlen, ⏻ Aus; der grüne Punkt steht vor dem Belegungsstatus (Vermietet / Nicht vermietet)."],
        ],
      },
      {
        title: "Suche nach Nummer",
        image: IMG + "02-recherche-chambre.png",
        text: "Die Eingabe „50“ behält nur Zimmer, deren Nummer diese Ziffern enthält: 500, 501, 502, 504. Das Leeren des Felds stellt die vollständige Liste wieder her.",
        buttons: [
          ["Suchfeld", "Filter mit Teilübereinstimmung auf die Zimmernummer; keine Bestätigung nötig."],
        ],
      },
      {
        title: "Zimmer – Licht",
        image: IMG + "03-chambre-eclairages.png",
        text: "Gerätesteuerung des gewählten Zimmers (hier 401). Der Reiter Licht zeigt die neun Kreise des Zimmers als Kacheln; das rechte Panel wiederholt Klimastatus und Belegung.",
        buttons: [
          ["← Zurück", "Schliesst das Zimmer und kehrt zur Liste zurück."],
          ["Licht · Beschattung · Andere", "Drei Reiter der Karte Gerätesteuerung; der aktive Reiter ist blau unterstrichen."],
          ["⏻ (auf jeder Kachel)", "Schaltet den Kreis ein oder aus. Kachel und Taste werden blau, wenn der Kreis eingeschaltet ist; „OFF“ ersetzt den Prozentwert, wenn er aus ist."],
          ["− / +", "Senkt oder erhöht das Niveau des Kreises in 5-%-Schritten (0 bis 100 %); Fortschrittsbalken und Prozentwert folgen. Auf 0 % schaltet der Kreis aus, ein Erhöhen schaltet ihn wieder ein."],
          ["C7 Right Bedside Lamp … C8 Corniche WC", "Kennung und Name jedes Kreises, wie im Crestron-Programm deklariert (Nachttisch, Steckdosen, Deckenspots, Spiegel, Nachtlicht, Nische, WC-Gesims)."],
          ["Zimmerstatus", "Klimatemperatur, Sollwert, Lüfter und Belegung des Zimmers, vom Prozessor gemeldet."],
        ],
      },
      {
        title: "Zimmer – Beschattung",
        image: IMG + "04-chambre-stores.png",
        text: "Steuerung der Motorvorhänge des Zimmers: Position in Prozent, beide Endlagen direkt erreichbar.",
        buttons: [
          ["Close", "Schliesst den Vorhang vollständig (0 %); der Status zeigt „Fermé“."],
          ["Regler", "Zwischenposition von 0 bis 100 %; der Status zeigt „Ouvert à n %“."],
          ["Open", "Öffnet den Vorhang vollständig (100 %); der Status zeigt „Ouvert“."],
        ],
      },
      {
        title: "Zimmer – Andere",
        image: IMG + "05-chambre-autres.png",
        text: "Erweiterte Funktionen für die Wartung: Firmware-Update der Zimmergeräte.",
        buttons: [
          ["Firmware-Update", "Startet das Firmware-Update des Panels oder Prozessors des Zimmers (Administrator-Aktion)."],
        ],
      },
      {
        title: "Systemüberwachung",
        image: IMG + "06-supervision-systemes.png",
        text: "Liste der Crestron-Systeme des Hauses: TS-1070-Panels pro Zimmer und MC4-R-Prozessoren, die mehrere Zimmer teilen, mit Firmware-Version und Verbindungsstatus.",
        buttons: [
          ["Gerätename · Modell · Firmware-Version", "Identifikation jedes Systems; abweichende Versionen (z. B. v1.002.0088) kennzeichnen ein zu aktualisierendes Panel."],
          ["● Online", "Grüner Punkt: das System antwortet dem Überwachungsserver."],
        ],
      },
      {
        title: "Meldungen",
        image: IMG + "07-alertes.png",
        text: "Seite der aktuellen Meldungen. Liegt keine Störung vor, bestätigt der Bildschirm, dass alle Prozessoren und Panels normal arbeiten.",
        buttons: [
          ["✔ Keine aktuelle Meldung", "Globaler Gesundheitsstatus; jede Anomalie (Panel offline, defekter Sensor) würde hier mit ihrem Zimmer erscheinen."],
        ],
      },
    ],
  },
};
