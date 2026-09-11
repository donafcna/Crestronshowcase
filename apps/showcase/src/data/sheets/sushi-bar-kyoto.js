// Fiche détaillée « Sushi Bar Kyoto » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/sushi-bar-kyoto/
const IMG = "/sheets/sushi-bar-kyoto/";

export default {
  fr: {
    intro:
      "Console de salle d'un restaurant japonais gastronomique, sur la tablette Android du sommelier et sur la dalle Crestron du passe. Quatre pages : gradation individuelle des tables, LED du comptoir sushi, hotte d'extraction de la cuisine ouverte et appels clientèle. Trois raccourcis en colonne gauche enchaînent lumière, comptoir et hotte pour le service du soir, le mode tamisé et la fermeture. Le nombre d'appels en attente est affiché en permanence dans l'en-tête.",
    sections: [
      {
        title: "Éclairage Tables (écran d'accueil)",
        image: IMG + "01-eclairage-tables.png",
        text: "Page ouverte au démarrage : choix de l'ambiance de lumière (chaude ou blanche) et un gradateur DALI par table. L'en-tête affiche le badge rouge « n APPELS SERVICE » tant qu'un appel est en attente, et l'heure.",
        buttons: [
          ["Éclairage Tables · Comptoir Sushi · Hotte Cuisine · Appels Clientèle", "Menu latéral : chaque appui ouvre la page correspondante ; le bouton actif est surligné en vert."],
          ["Service Actif (Soir)", "Raccourci : toutes les tables à 80 %, comptoir en rose cerisier, hotte à 70 %."],
          ["Mode Tamisé Cozy", "Raccourci : toutes les tables à 30 %, comptoir en vert bambou, hotte à 20 %."],
          ["Fermeture Établissement", "Raccourci rouge : tables à 0 %, comptoir éteint, hotte à l'arrêt et liste des appels vidée."],
          ["Or Chaud (Tamisé) / Blanc Pur (Service)", "Température de couleur des tables, en interlock. Les curseurs et les pourcentages passent en doré (chaud) ou en blanc (service)."],
          ["Table 1 · Table 2 · Table 3 · Table 4", "Curseur 0 – 100 % de chaque table (80 / 50 / 70 / 90 % par défaut), indépendant des autres."],
          ["n APPELS SERVICE", "Badge d'en-tête : nombre d'appels clients non acquittés ; disparaît quand la liste est vide."],
        ],
      },
      {
        title: "Ambiance Blanc Pur",
        image: IMG + "02-eclairage-tables-blanc.png",
        text: "Après un appui sur Blanc Pur (Service) : les curseurs et les valeurs passent en blanc, les niveaux de chaque table sont conservés.",
        buttons: [
          ["Or Chaud (Tamisé)", "Revient à la teinte dorée ; les niveaux ne changent pas."],
        ],
      },
      {
        title: "Comptoir Sushi",
        image: IMG + "03-comptoir-sushi.png",
        text: "Couleur et intensité du ruban LED (DMX) du comptoir. La lueur de fond de l'écran prend la couleur choisie.",
        buttons: [
          ["Pastilles rose · vert · bleu · orange · gris", "Cerisier Blossom, Bambou Vert, Océan Bleu, Or Soleil, Éteint. La pastille choisie est entourée ; le code couleur s'affiche sous « Glow actif »."],
          ["Luminosité", "Curseur 0 – 100 % de l'intensité du ruban (80 % par défaut) ; grisé et inactif quand la pastille Éteint est sélectionnée."],
        ],
      },
      {
        title: "Comptoir en vert bambou",
        image: IMG + "04-comptoir-bambou.png",
        text: "Après un appui sur la pastille verte : « Glow actif : #10b981 », la lueur de fond devient verte. C'est la couleur rappelée par Mode Tamisé Cozy.",
        buttons: [
          ["Pastille grise (Éteint)", "Coupe le ruban LED et verrouille le curseur de luminosité."],
        ],
      },
      {
        title: "Hotte Cuisine",
        image: IMG + "05-hotte-cuisine.png",
        text: "Régulateur de vitesse de la hotte d'extraction de la cuisine ouverte (Robata / Teppanyaki), pour concilier extraction des fumées et silence en salle.",
        buttons: [
          ["Vitesse Hotte", "Curseur 0 – 100 % de la vitesse d'aspiration (45 % par défaut). Fixé à 70 % par Service Actif, 20 % par Mode Tamisé, 0 % par Fermeture."],
        ],
      },
      {
        title: "Appels Clientèle",
        image: IMG + "06-appels-clientele.png",
        text: "Liste des appels envoyés depuis les tables : type (Sommelier en violet, Addition en doré, Service en cyan), numéro de table et temps d'attente. De nouveaux appels arrivent automatiquement (4 au maximum, une table à la fois).",
        buttons: [
          ["Acquitter", "Retire l'appel de la liste et décrémente le badge d'en-tête."],
        ],
      },
      {
        title: "Aucun appel en cours",
        image: IMG + "07-appels-acquittes.png",
        text: "Tous les appels acquittés : le message « Aucun appel client en cours. Tout est en ordre ! » s'affiche et le badge d'en-tête disparaît.",
        buttons: [
          ["Fermeture Établissement", "Vide aussi la liste des appels en fin de service."],
        ],
      },
      {
        title: "Preset Mode Tamisé",
        image: IMG + "08-preset-tamise.png",
        text: "Après un appui sur Mode Tamisé Cozy, retour sur Éclairage Tables : les quatre tables sont à 30 %, le comptoir en vert bambou et la hotte à 20 %.",
        buttons: [
          ["Service Actif (Soir)", "Rétablit les niveaux de service : tables 80 %, comptoir rose, hotte 70 %."],
        ],
      },
      {
        title: "Dalle Crestron du passe",
        image: IMG + "09-dalle-eclairage-tables.png",
        text: "Sur la dalle murale, la même console avec les mêmes pages et raccourcis que la tablette.",
        buttons: [
          ["Toutes les commandes", "Identiques à la tablette ; les deux supports partagent le même contrat de signaux vers le processeur."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Front-of-house console for a fine-dining Japanese restaurant, on the sommelier's Android tablet and on the Crestron panel at the pass. Four pages: individual table dimming, sushi counter LEDs, open-kitchen extraction hood and guest calls. Three shortcuts in the left column chain lighting, counter and hood for evening service, dimmed mode and closing. The number of pending calls is shown permanently in the header.",
    sections: [
      {
        title: "Éclairage Tables (home screen)",
        image: IMG + "01-eclairage-tables.png",
        text: "Page opened at start-up: choice of the light ambience (warm or white) and one DALI dimmer per table. The header shows the red “n APPELS SERVICE” badge while a call is pending, plus the time.",
        buttons: [
          ["Éclairage Tables · Comptoir Sushi · Hotte Cuisine · Appels Clientèle", "Side menu: each tap opens the matching page; the active button is highlighted in green."],
          ["Service Actif (Soir)", "Shortcut: every table at 80 %, counter in cherry-blossom pink, hood at 70 %."],
          ["Mode Tamisé Cozy", "Shortcut: every table at 30 %, counter in bamboo green, hood at 20 %."],
          ["Fermeture Établissement", "Red shortcut: tables at 0 %, counter off, hood stopped and call list cleared."],
          ["Or Chaud (Tamisé) / Blanc Pur (Service)", "Interlocked table colour temperature. Sliders and percentages turn gold (warm) or white (service)."],
          ["Table 1 · Table 2 · Table 3 · Table 4", "0–100 % slider for each table (80 / 50 / 70 / 90 % by default), independent from the others."],
          ["n APPELS SERVICE", "Header badge: number of unacknowledged guest calls; disappears when the list is empty."],
        ],
      },
      {
        title: "Pure white ambience",
        image: IMG + "02-eclairage-tables-blanc.png",
        text: "After tapping Blanc Pur (Service): sliders and values turn white, each table level is kept.",
        buttons: [
          ["Or Chaud (Tamisé)", "Returns to the golden tint; levels do not change."],
        ],
      },
      {
        title: "Comptoir Sushi",
        image: IMG + "03-comptoir-sushi.png",
        text: "Colour and intensity of the counter LED strip (DMX). The screen's background glow takes the chosen colour.",
        buttons: [
          ["Pink · green · blue · orange · grey pills", "Cherry Blossom, Bamboo Green, Ocean Blue, Sun Gold, Off. The chosen pill is outlined; the colour code appears under “Glow actif”."],
          ["Luminosité", "0–100 % slider of the strip intensity (80 % by default); greyed out and inactive when the Off pill is selected."],
        ],
      },
      {
        title: "Counter in bamboo green",
        image: IMG + "04-comptoir-bambou.png",
        text: "After tapping the green pill: “Glow actif : #10b981”, the background glow turns green. This is the colour recalled by Mode Tamisé Cozy.",
        buttons: [
          ["Grey pill (Off)", "Switches the LED strip off and locks the brightness slider."],
        ],
      },
      {
        title: "Hotte Cuisine",
        image: IMG + "05-hotte-cuisine.png",
        text: "Speed regulator of the open-kitchen extraction hood (Robata / Teppanyaki), balancing smoke extraction and dining-room quiet.",
        buttons: [
          ["Vitesse Hotte", "0–100 % slider of the extraction speed (45 % by default). Set to 70 % by Service Actif, 20 % by Mode Tamisé, 0 % by Fermeture."],
        ],
      },
      {
        title: "Appels Clientèle",
        image: IMG + "06-appels-clientele.png",
        text: "List of calls sent from the tables: type (Sommelier in purple, Addition in gold, Service in cyan), table number and waiting time. New calls arrive automatically (4 at most, one per table).",
        buttons: [
          ["Acquitter", "Removes the call from the list and decrements the header badge."],
        ],
      },
      {
        title: "No pending call",
        image: IMG + "07-appels-acquittes.png",
        text: "All calls acknowledged: the message “Aucun appel client en cours. Tout est en ordre !” is shown and the header badge disappears.",
        buttons: [
          ["Fermeture Établissement", "Also clears the call list at the end of service."],
        ],
      },
      {
        title: "Mode Tamisé preset",
        image: IMG + "08-preset-tamise.png",
        text: "After tapping Mode Tamisé Cozy, back on Éclairage Tables: the four tables are at 30 %, the counter in bamboo green and the hood at 20 %.",
        buttons: [
          ["Service Actif (Soir)", "Restores service levels: tables 80 %, pink counter, hood 70 %."],
        ],
      },
      {
        title: "Crestron panel at the pass",
        image: IMG + "09-dalle-eclairage-tables.png",
        text: "On the wall panel, the same console with the same pages and shortcuts as the tablet.",
        buttons: [
          ["All controls", "Identical to the tablet; both devices share the same signal contract to the processor."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Saalkonsole eines japanischen Gourmetrestaurants, auf dem Android-Tablet des Sommeliers und auf dem Crestron-Panel am Pass. Vier Seiten: Einzeldimmung der Tische, LEDs des Sushi-Tresens, Abzugshaube der offenen Küche und Gästerufe. Drei Kurzbefehle in der linken Spalte verketten Licht, Tresen und Haube für den Abendservice, den gedämpften Modus und die Schliessung. Die Zahl der offenen Rufe wird dauerhaft in der Kopfzeile angezeigt.",
    sections: [
      {
        title: "Éclairage Tables (Startbildschirm)",
        image: IMG + "01-eclairage-tables.png",
        text: "Beim Start geöffnete Seite: Wahl der Lichtstimmung (warm oder weiss) und ein DALI-Dimmer pro Tisch. Die Kopfzeile zeigt das rote Abzeichen „n APPELS SERVICE“, solange ein Ruf offen ist, sowie die Uhrzeit.",
        buttons: [
          ["Éclairage Tables · Comptoir Sushi · Hotte Cuisine · Appels Clientèle", "Seitenmenü: jeder Tipp öffnet die entsprechende Seite; die aktive Taste ist grün hervorgehoben."],
          ["Service Actif (Soir)", "Kurzbefehl: alle Tische auf 80 %, Tresen in Kirschblütenrosa, Haube auf 70 %."],
          ["Mode Tamisé Cozy", "Kurzbefehl: alle Tische auf 30 %, Tresen in Bambusgrün, Haube auf 20 %."],
          ["Fermeture Établissement", "Roter Kurzbefehl: Tische auf 0 %, Tresen aus, Haube gestoppt und Rufliste geleert."],
          ["Or Chaud (Tamisé) / Blanc Pur (Service)", "Farbtemperatur der Tische mit Verriegelung. Regler und Prozentwerte werden gold (warm) oder weiss (Service)."],
          ["Table 1 · Table 2 · Table 3 · Table 4", "Regler 0–100 % je Tisch (Standard 80 / 50 / 70 / 90 %), unabhängig von den anderen."],
          ["n APPELS SERVICE", "Abzeichen in der Kopfzeile: Zahl der nicht quittierten Gästerufe; verschwindet bei leerer Liste."],
        ],
      },
      {
        title: "Stimmung Reinweiss",
        image: IMG + "02-eclairage-tables-blanc.png",
        text: "Nach einem Tipp auf Blanc Pur (Service): Regler und Werte werden weiss, die Pegel jedes Tisches bleiben erhalten.",
        buttons: [
          ["Or Chaud (Tamisé)", "Zurück zum goldenen Farbton; die Pegel ändern sich nicht."],
        ],
      },
      {
        title: "Comptoir Sushi",
        image: IMG + "03-comptoir-sushi.png",
        text: "Farbe und Intensität des LED-Bands (DMX) am Tresen. Das Hintergrundleuchten des Bildschirms nimmt die gewählte Farbe an.",
        buttons: [
          ["Punkte rosa · grün · blau · orange · grau", "Kirschblüte, Bambusgrün, Ozeanblau, Sonnengold, Aus. Der gewählte Punkt ist umrandet; der Farbcode steht unter „Glow actif“."],
          ["Luminosité", "Regler 0–100 % der Bandintensität (Standard 80 %); ausgegraut und inaktiv, wenn der Punkt Aus gewählt ist."],
        ],
      },
      {
        title: "Tresen in Bambusgrün",
        image: IMG + "04-comptoir-bambou.png",
        text: "Nach einem Tipp auf den grünen Punkt: „Glow actif : #10b981“, das Hintergrundleuchten wird grün. Das ist die von Mode Tamisé Cozy abgerufene Farbe.",
        buttons: [
          ["Grauer Punkt (Aus)", "Schaltet das LED-Band aus und sperrt den Helligkeitsregler."],
        ],
      },
      {
        title: "Hotte Cuisine",
        image: IMG + "05-hotte-cuisine.png",
        text: "Drehzahlregler der Abzugshaube der offenen Küche (Robata / Teppanyaki), um Rauchabzug und Ruhe im Gastraum zu vereinen.",
        buttons: [
          ["Vitesse Hotte", "Regler 0–100 % der Absaugdrehzahl (Standard 45 %). Auf 70 % durch Service Actif, 20 % durch Mode Tamisé, 0 % durch Fermeture gesetzt."],
        ],
      },
      {
        title: "Appels Clientèle",
        image: IMG + "06-appels-clientele.png",
        text: "Liste der von den Tischen gesendeten Rufe: Typ (Sommelier violett, Addition gold, Service cyan), Tischnummer und Wartezeit. Neue Rufe treffen automatisch ein (höchstens 4, ein Tisch je Ruf).",
        buttons: [
          ["Acquitter", "Entfernt den Ruf aus der Liste und verringert das Abzeichen in der Kopfzeile."],
        ],
      },
      {
        title: "Kein offener Ruf",
        image: IMG + "07-appels-acquittes.png",
        text: "Alle Rufe quittiert: die Meldung „Aucun appel client en cours. Tout est en ordre !“ erscheint und das Abzeichen in der Kopfzeile verschwindet.",
        buttons: [
          ["Fermeture Établissement", "Leert am Ende des Service ebenfalls die Rufliste."],
        ],
      },
      {
        title: "Preset Mode Tamisé",
        image: IMG + "08-preset-tamise.png",
        text: "Nach einem Tipp auf Mode Tamisé Cozy, zurück auf Éclairage Tables: die vier Tische stehen auf 30 %, der Tresen auf Bambusgrün und die Haube auf 20 %.",
        buttons: [
          ["Service Actif (Soir)", "Stellt die Servicepegel wieder her: Tische 80 %, Tresen rosa, Haube 70 %."],
        ],
      },
      {
        title: "Crestron-Panel am Pass",
        image: IMG + "09-dalle-eclairage-tables.png",
        text: "Auf dem Wandpanel dieselbe Konsole mit denselben Seiten und Kurzbefehlen wie das Tablet.",
        buttons: [
          ["Alle Bedienelemente", "Identisch mit dem Tablet; beide Geräte teilen denselben Signalvertrag zum Prozessor."],
        ],
      },
    ],
  },
};
