// Fiche détaillée « La Réserve Genève » : chaque écran du GUI, avec capture et explication de chaque bouton.
// Captures : public/sheets/la-reserve-geneve/ (projects/la-reserve-geneve/tools/captures-fiche.cjs, dalle 1280 × 800
// et iPhone 440 × 863, puis scripts/helpers/png-1400-256.py).
const IMG = "/sheets/la-reserve-geneve/";

export default {
  fr: {
    intro:
      "Refonte en CH5 des trois panneaux audio de La Réserve Genève (Bar, Fitness, Lodge), jusque-là en VT Pro. Les commandes sont exactement celles d'origine ; le GUI se branche sur les joins des programmes SIMPL existants, sans C#, et remplace simplement le panneau. Le client choisit le thème (Lac, Nuit ou Spa) dans les Réglages ; le choix est mémorisé sur chaque appareil.",
    sections: [
      {
        title: "Accueil",
        image: IMG + "01-accueil.png",
        text: "Le nom de l'hôtel, l'espace piloté et la liste des groupes en diffusion avec leur source. En bas, le dock des sources, comme la barre d'icônes du panneau d'origine.",
        buttons: [
          ["Sources", "Sélectionne la source (Airplay Bar, DJ, Lecteur radio, Music Bar Lounge…) et ouvre les zones pour la diffuser."],
          ["Tout éteindre", "Demande l'extinction générale de l'espace, avec confirmation."],
          ["Réglages", "Thème Lac, Nuit ou Spa ; version du GUI, IP-ID et programme."],
        ],
      },
      {
        title: "Zones du Bar : Sous-sol et Rez-de-chaussée",
        image: IMG + "02-bar-sous-sol.png",
        image2: IMG + "03-bar-rez.png",
        text: "Les deux pages du panneau d'origine. Chaque zone a son niveau réel (retour analogique du processeur), Vol + / Vol − à maintenir et Mute. Les zones qui partagent une sortie sont réunies dans un groupe (All Bar, Lobby & WC, Le Loft), avec l'état de la source en cours.",
        buttons: [
          ["Rez-de-chaussée · Sous-sol", "Change de page de zones."],
          ["+ / −", "Monte ou baisse le volume tant que le bouton est maintenu (rampe faite par le programme)."],
          ["Haut-parleur", "Coupe ou rétablit le son de la zone ; rouge quand la zone est muette."],
          ["Diffuser", "Envoie la source sélectionnée vers le groupe (Distribute)."],
          ["Arrêt", "Arrête la diffusion du groupe (Off)."],
          ["Fermer", "Revient à l'accueil (Exit)."],
        ],
      },
      {
        title: "Fitness et Lodge",
        image: IMG + "04-fitness.png",
        image2: IMG + "05-lodge.png",
        text: "Même logique et mêmes composants pour les deux autres espaces : cinq zones et cinq sources au Fitness ; au Lodge, six zones dont Exterior et Exterior Sub réunies, et le micro, réglable en niveau seul.",
        buttons: [
          ["Accueil Cardio · Fonctional Zone · Room CC · Kinesis · Musculation", "Zones du Fitness."],
          ["Lodge Left · Lodge Right · Pool · Exterior · Micro", "Zones du Lodge."],
        ],
      },
      {
        title: "Réglages : thème au choix du client",
        image: IMG + "06-reglages.png",
        text: "Trois thèmes sur les mêmes écrans : Lac (clair, bronze), Nuit (anthracite, cuivre) et Spa (sable, vert sauge). Tous les textes restent lisibles (contraste contrôlé dans chaque thème).",
        buttons: [["Lac · Nuit · Spa", "Applique le thème immédiatement et le mémorise sur l'appareil."]],
      },
      {
        title: "Extinction générale",
        image: IMG + "07-confirmation.png",
        image2: IMG + "08-attente.png",
        text: "La confirmation s'ouvre sur le retour du processeur ; pendant l'extinction, la barre suit la progression envoyée par le programme.",
        buttons: [
          ["Annuler", "Referme la confirmation sans rien éteindre."],
          ["Éteindre", "Arrête toutes les zones de l'espace."],
        ],
      },
      {
        title: "Smartphone",
        image: IMG + "09-iphone.png",
        portrait: true,
        text: "Les mêmes commandes sur iPhone : une ligne par zone (niveau, −, Mute, +) sous l'en-tête de son groupe (Diffuser, Arrêt). Tout tient à l'écran, sans défilement.",
        buttons: [],
      },
    ],
  },
  en: {
    intro:
      "CH5 redesign of La Réserve Genève's three audio panels (Bar, Fitness, Lodge), previously in VT Pro. The controls are exactly the original ones; the GUI uses the joins of the existing SIMPL programs, with no C#, and simply replaces the panel. The client picks the theme (Lac, Nuit or Spa) in Settings; the choice is stored on each device.",
    sections: [
      {
        title: "Home",
        image: IMG + "01-accueil.png",
        text: "The hotel name, the space being controlled and the groups currently playing with their source. At the bottom, the source dock, like the icon bar of the original panel.",
        buttons: [
          ["Sources", "Selects the source (Airplay Bar, DJ, Lecteur radio, Music Bar Lounge…) and opens the zones to distribute it."],
          ["Tout éteindre (All off)", "Requests a global shutdown of the space, with confirmation."],
          ["Settings", "Lac, Nuit or Spa theme; GUI version, IP-ID and program."],
        ],
      },
      {
        title: "Bar zones: basement and ground floor",
        image: IMG + "02-bar-sous-sol.png",
        image2: IMG + "03-bar-rez.png",
        text: "The two pages of the original panel. Each zone shows its real level (analog feedback from the processor), press-and-hold Vol + / Vol − and Mute. Zones sharing an output are grouped (All Bar, Lobby & WC, Le Loft), with the current source.",
        buttons: [
          ["Rez-de-chaussée · Sous-sol", "Switches the zone page."],
          ["+ / −", "Raises or lowers the volume while held (ramp done by the program)."],
          ["Speaker", "Mutes or unmutes the zone; red when muted."],
          ["Diffuser (Distribute)", "Sends the selected source to the group."],
          ["Arrêt (Off)", "Stops the group."],
          ["Fermer (Close)", "Back to home (Exit)."],
        ],
      },
      {
        title: "Fitness and Lodge",
        image: IMG + "04-fitness.png",
        image2: IMG + "05-lodge.png",
        text: "Same logic and components for the other two spaces: five zones and five sources in the Fitness; in the Lodge, six zones with Exterior and Exterior Sub grouped, and the microphone with level control only.",
        buttons: [
          ["Accueil Cardio · Fonctional Zone · Room CC · Kinesis · Musculation", "Fitness zones."],
          ["Lodge Left · Lodge Right · Pool · Exterior · Micro", "Lodge zones."],
        ],
      },
      {
        title: "Settings: client-selectable theme",
        image: IMG + "06-reglages.png",
        text: "Three themes on the same screens: Lac (light, bronze), Nuit (charcoal, copper) and Spa (sand, sage green). All text stays readable (contrast checked in every theme).",
        buttons: [["Lac · Nuit · Spa", "Applies the theme immediately and stores it on the device."]],
      },
      {
        title: "Global shutdown",
        image: IMG + "07-confirmation.png",
        image2: IMG + "08-attente.png",
        text: "The confirmation opens on the processor's feedback; during shutdown, the bar follows the progress sent by the program.",
        buttons: [
          ["Annuler (Cancel)", "Closes the confirmation without switching anything off."],
          ["Éteindre (Switch off)", "Stops every zone of the space."],
        ],
      },
      {
        title: "Smartphone",
        image: IMG + "09-iphone.png",
        portrait: true,
        text: "The same controls on iPhone: one row per zone (level, −, Mute, +) under its group header (Distribute, Off). Everything fits on screen with no scrolling.",
        buttons: [],
      },
    ],
  },
  de: {
    intro:
      "CH5-Neugestaltung der drei Audio-Panels von La Réserve Genève (Bar, Fitness, Lodge), bisher in VT Pro. Die Bedienelemente sind genau die ursprünglichen; die GUI nutzt die Joins der bestehenden SIMPL-Programme ohne C# und ersetzt nur das Panel. Der Kunde wählt das Design (Lac, Nuit oder Spa) in den Einstellungen; die Wahl wird je Gerät gespeichert.",
    sections: [
      {
        title: "Startseite",
        image: IMG + "01-accueil.png",
        text: "Hotelname, gesteuerter Bereich und die aktiven Gruppen mit ihrer Quelle. Unten das Quellen-Dock, wie die Symbolleiste des ursprünglichen Panels.",
        buttons: [
          ["Quellen", "Wählt die Quelle (Airplay Bar, DJ, Lecteur radio, Music Bar Lounge…) und öffnet die Zonen zur Verteilung."],
          ["Tout éteindre (Alles aus)", "Fordert die Gesamtabschaltung des Bereichs mit Bestätigung an."],
          ["Einstellungen", "Design Lac, Nuit oder Spa; GUI-Version, IP-ID und Programm."],
        ],
      },
      {
        title: "Bar-Zonen: Untergeschoss und Erdgeschoss",
        image: IMG + "02-bar-sous-sol.png",
        image2: IMG + "03-bar-rez.png",
        text: "Die beiden Seiten des ursprünglichen Panels. Jede Zone zeigt ihren echten Pegel (analoge Rückmeldung des Prozessors), Vol + / Vol − zum Halten und Stummschaltung. Zonen mit gemeinsamem Ausgang sind gruppiert (All Bar, Lobby & WC, Le Loft), mit der aktuellen Quelle.",
        buttons: [
          ["Rez-de-chaussée · Sous-sol", "Wechselt die Zonenseite."],
          ["+ / −", "Lauter oder leiser, solange gedrückt (Rampe im Programm)."],
          ["Lautsprecher", "Schaltet die Zone stumm oder wieder ein; rot bei Stummschaltung."],
          ["Diffuser (Distribute)", "Sendet die gewählte Quelle an die Gruppe."],
          ["Arrêt (Off)", "Stoppt die Gruppe."],
          ["Fermer (Schliessen)", "Zurück zur Startseite (Exit)."],
        ],
      },
      {
        title: "Fitness und Lodge",
        image: IMG + "04-fitness.png",
        image2: IMG + "05-lodge.png",
        text: "Gleiche Logik und Komponenten für die beiden anderen Bereiche: fünf Zonen und fünf Quellen im Fitness; in der Lodge sechs Zonen, Exterior und Exterior Sub gruppiert, und das Mikrofon nur mit Pegel.",
        buttons: [
          ["Accueil Cardio · Fonctional Zone · Room CC · Kinesis · Musculation", "Zonen des Fitness."],
          ["Lodge Left · Lodge Right · Pool · Exterior · Micro", "Zonen der Lodge."],
        ],
      },
      {
        title: "Einstellungen: Design nach Wahl des Kunden",
        image: IMG + "06-reglages.png",
        text: "Drei Designs auf denselben Seiten: Lac (hell, Bronze), Nuit (Anthrazit, Kupfer) und Spa (Sand, Salbeigrün). Alle Texte bleiben lesbar (Kontrast in jedem Design geprüft).",
        buttons: [["Lac · Nuit · Spa", "Wendet das Design sofort an und speichert es auf dem Gerät."]],
      },
      {
        title: "Gesamtabschaltung",
        image: IMG + "07-confirmation.png",
        image2: IMG + "08-attente.png",
        text: "Die Bestätigung öffnet sich auf Rückmeldung des Prozessors; während der Abschaltung folgt der Balken dem vom Programm gesendeten Fortschritt.",
        buttons: [
          ["Annuler (Abbrechen)", "Schliesst die Bestätigung, ohne etwas auszuschalten."],
          ["Éteindre (Ausschalten)", "Stoppt alle Zonen des Bereichs."],
        ],
      },
      {
        title: "Smartphone",
        image: IMG + "09-iphone.png",
        portrait: true,
        text: "Dieselben Bedienelemente auf dem iPhone: eine Zeile je Zone (Pegel, −, Stumm, +) unter dem Kopf ihrer Gruppe (Distribute, Off). Alles passt ohne Scrollen auf den Bildschirm.",
        buttons: [],
      },
    ],
  },
};
