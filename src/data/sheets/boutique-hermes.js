// Fiche détaillée « Boutique Luxe Genève » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/boutique-hermes/
const IMG = "/sheets/boutique-hermes/";

export default {
  fr: {
    intro:
      "Interface de pilotage d'un showroom de luxe, sur la dalle Crestron de l'arrière-boutique et sur l'iPad du personnel de vente. Quatre pages : éclairage circadien Tunable White (DALI type 8), diffuseurs de parfum, musique d'ambiance et scénarios de vitrine liés à l'horloge astronomique. Trois presets en colonne gauche couvrent l'ouverture, la fermeture et l'extinction du magasin. La lueur de fond de l'écran suit la température de couleur en cours.",
    sections: [
      {
        title: "Éclairage Blanc (écran d'accueil)",
        image: IMG + "01-eclairage-blanc.png",
        text: "Page ouverte au démarrage. En mode automatique, la température de couleur suit l'heure de la journée (4000 K le matin, 5500 K à midi, 4500 K l'après-midi, 3000 K en soirée). L'en-tête rappelle que les commandes partent en diffusion DALI et affiche l'heure.",
        buttons: [
          ["Éclairage Blanc · Ambiance Olfactive · Musique de Fond · Horloge Astronomique", "Menu latéral : chaque appui ouvre la page correspondante ; le bouton actif est surligné en vert."],
          ["Ouverture Showroom", "Preset : vitrine en mode Jour, synchronisation solaire automatique réactivée, diffuseurs de parfum en marche."],
          ["Fermeture Éco Vitrine", "Preset : vitrine en Nuit Éco (30 % de lumière), mode manuel avec blanc chaud 2700 K, diffuseurs arrêtés. Le bouton s'allume en doré."],
          ["Éteindre Système", "Preset rouge : vitrine Off, synchronisation solaire coupée, diffuseurs arrêtés, volume musical à 0 %."],
          ["Synchronisation Solaire Auto (interrupteur)", "Active / désactive le cycle circadien. En marche (vert) le statut indique « Blanc dynamique ajusté automatiquement » ; à l'arrêt « Mode manuel activé »."],
          ["Chaud (2700K) – Froid (6500K)", "Curseur de température de couleur, par pas de 100 K. Tout réglage manuel bascule automatiquement en mode manuel ; la valeur en kelvins s'affiche sous le curseur et la lueur de fond passe de l'ambre au bleu."],
          ["Intensité Lumineuse", "Curseur 0 – 100 % de la gradation générale DALI du showroom (80 % par défaut)."],
          ["DALI Broadcast", "Indicateur d'en-tête : les commandes d'éclairage sont émises en broadcast sur le bus DALI."],
        ],
      },
      {
        title: "Mode manuel",
        image: IMG + "02-eclairage-manuel.png",
        text: "Après un déplacement du curseur à 5500 K : l'interrupteur de synchronisation passe à l'arrêt, le statut affiche « Mode manuel activé » et la lueur de fond devient froide.",
        buttons: [
          ["Synchronisation Solaire Auto", "Un appui remet le cycle automatique et recalcule immédiatement la température selon l'heure."],
        ],
      },
      {
        title: "Ambiance Olfactive",
        image: IMG + "03-ambiance-olfactive.png",
        text: "Choix de la fragrance diffusée, marche / arrêt des diffuseurs et intensité de diffusion.",
        buttons: [
          ["Bois d'Ambre · Fraîcheur Agrumes · Gousse de Vanille", "Fragrances en interlock : une seule active, surlignée en couleur."],
          ["DIFFUSER / STOP", "Marche / arrêt des diffuseurs. Le statut passe de « Actif » à « Éteint » et le bouton change de couleur."],
          ["Débit Parfum", "Curseur 0 – 100 % de l'intensité de diffusion (40 % par défaut) ; grisé et inactif quand les diffuseurs sont arrêtés."],
        ],
      },
      {
        title: "Diffuseurs arrêtés",
        image: IMG + "04-diffuseurs-arretes.png",
        text: "Après STOP : statut « Éteint », bouton DIFFUSER pour relancer et curseur de débit verrouillé.",
        buttons: [
          ["DIFFUSER", "Relance la diffusion avec la fragrance et le débit précédemment choisis."],
        ],
      },
      {
        title: "Musique de Fond",
        image: IMG + "05-musique-de-fond.png",
        text: "Sélection de l'ambiance sonore du showroom et volume général.",
        buttons: [
          ["Jazz & Bossa Nova · Lounge Minimaliste · Classique Acoustique", "Playlists en interlock ; la playlist active est surlignée (ici Lounge Minimaliste)."],
          ["Volume", "Curseur 0 – 100 % du volume du showroom (30 % par défaut) ; mis à 0 par le preset Éteindre Système."],
        ],
      },
      {
        title: "Horloge Astronomique",
        image: IMG + "06-horloge-astronomique.png",
        text: "Scénarios de vitrine que le processeur enclenche automatiquement selon l'heure du coucher du soleil à Genève ; la page permet de les forcer ou de les tester.",
        buttons: [
          ["Vitrine Jour", "Vitrine à pleine puissance ; scénario par défaut et celui rappelé par Ouverture Showroom."],
          ["Coucher de Soleil", "Scénario de transition déclenché à l'heure astronomique du coucher du soleil."],
          ["Nuit Éco (30% Lumière)", "Vitrine réduite à 30 % pour la nuit ; rappelé par Fermeture Éco Vitrine."],
          ["Vitrine Off", "Extinction de la vitrine ; rappelé par Éteindre Système."],
        ],
      },
      {
        title: "Preset Fermeture Éco",
        image: IMG + "07-preset-fermeture-eco.png",
        text: "Après un appui sur Fermeture Éco Vitrine : le scénario Nuit Éco est actif, le preset est surligné en doré, l'éclairage est passé en manuel à 2700 K et les diffuseurs sont arrêtés.",
        buttons: [
          ["Ouverture Showroom", "Rend le magasin opérationnel le lendemain : Vitrine Jour, cycle circadien et parfum réactivés."],
        ],
      },
      {
        title: "Version iPad",
        image: IMG + "08-ipad-eclairage.png",
        text: "Sur l'iPad du personnel, la même interface et les mêmes presets, sans écran secondaire à apprendre.",
        buttons: [
          ["Toutes les commandes", "Identiques à la dalle Crestron ; les deux supports partagent le même contrat de signaux vers le processeur."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Control interface for a luxury showroom, on the Crestron panel in the back office and on the sales staff iPad. Four pages: circadian Tunable White lighting (DALI type 8), scent diffusers, background music and window scenes tied to the astronomical clock. Three presets in the left column cover opening, closing and shutting down the store. The screen's background glow follows the current colour temperature.",
    sections: [
      {
        title: "Éclairage Blanc (home screen)",
        image: IMG + "01-eclairage-blanc.png",
        text: "Page opened at start-up. In automatic mode the colour temperature follows the time of day (4000 K in the morning, 5500 K at noon, 4500 K in the afternoon, 3000 K in the evening). The header recalls that commands go out as a DALI broadcast and shows the time.",
        buttons: [
          ["Éclairage Blanc · Ambiance Olfactive · Musique de Fond · Horloge Astronomique", "Side menu: each tap opens the matching page; the active button is highlighted in green."],
          ["Ouverture Showroom", "Preset: window in Day mode, automatic solar sync re-enabled, scent diffusers on."],
          ["Fermeture Éco Vitrine", "Preset: window in Night Eco (30 % light), manual mode with warm white 2700 K, diffusers off. The button lights up in gold."],
          ["Éteindre Système", "Red preset: window Off, solar sync off, diffusers off, music volume at 0 %."],
          ["Synchronisation Solaire Auto (switch)", "Enables / disables the circadian cycle. When on (green) the status reads “Blanc dynamique ajusté automatiquement”; when off, “Mode manuel activé”."],
          ["Chaud (2700K) – Froid (6500K)", "Colour temperature slider in 100 K steps. Any manual change switches automatically to manual mode; the kelvin value is shown under the slider and the background glow shifts from amber to blue."],
          ["Intensité Lumineuse", "0–100 % slider of the showroom's general DALI dimming (80 % by default)."],
          ["DALI Broadcast", "Header indicator: lighting commands are broadcast on the DALI bus."],
        ],
      },
      {
        title: "Manual mode",
        image: IMG + "02-eclairage-manuel.png",
        text: "After moving the slider to 5500 K: the sync switch turns off, the status reads “Mode manuel activé” and the background glow turns cool.",
        buttons: [
          ["Synchronisation Solaire Auto", "One tap restores the automatic cycle and immediately recomputes the temperature for the current hour."],
        ],
      },
      {
        title: "Ambiance Olfactive",
        image: IMG + "03-ambiance-olfactive.png",
        text: "Choice of the diffused fragrance, diffuser on / off and diffusion intensity.",
        buttons: [
          ["Bois d'Ambre · Fraîcheur Agrumes · Gousse de Vanille", "Interlocked fragrances: only one active, highlighted in colour."],
          ["DIFFUSER / STOP", "Diffusers on / off. The status switches from “Actif” to “Éteint” and the button changes colour."],
          ["Débit Parfum", "0–100 % slider of the diffusion intensity (40 % by default); greyed out and inactive while the diffusers are off."],
        ],
      },
      {
        title: "Diffusers stopped",
        image: IMG + "04-diffuseurs-arretes.png",
        text: "After STOP: status “Éteint”, DIFFUSER button to restart and locked flow slider.",
        buttons: [
          ["DIFFUSER", "Restarts diffusion with the previously chosen fragrance and flow."],
        ],
      },
      {
        title: "Musique de Fond",
        image: IMG + "05-musique-de-fond.png",
        text: "Selection of the showroom's sound ambience and master volume.",
        buttons: [
          ["Jazz & Bossa Nova · Lounge Minimaliste · Classique Acoustique", "Interlocked playlists; the active one is highlighted (here Lounge Minimaliste)."],
          ["Volume", "0–100 % slider of the showroom volume (30 % by default); set to 0 by the Éteindre Système preset."],
        ],
      },
      {
        title: "Horloge Astronomique",
        image: IMG + "06-horloge-astronomique.png",
        text: "Window scenes that the processor triggers automatically according to sunset time in Geneva; this page lets you force or test them.",
        buttons: [
          ["Vitrine Jour", "Window at full power; default scene and the one recalled by Ouverture Showroom."],
          ["Coucher de Soleil", "Transition scene triggered at the astronomical sunset time."],
          ["Nuit Éco (30% Lumière)", "Window reduced to 30 % for the night; recalled by Fermeture Éco Vitrine."],
          ["Vitrine Off", "Window switched off; recalled by Éteindre Système."],
        ],
      },
      {
        title: "Fermeture Éco preset",
        image: IMG + "07-preset-fermeture-eco.png",
        text: "After tapping Fermeture Éco Vitrine: the Night Eco scene is active, the preset is highlighted in gold, lighting is in manual mode at 2700 K and the diffusers are off.",
        buttons: [
          ["Ouverture Showroom", "Makes the store operational again the next morning: Day window, circadian cycle and scent re-enabled."],
        ],
      },
      {
        title: "iPad version",
        image: IMG + "08-ipad-eclairage.png",
        text: "On the staff iPad, the same interface and the same presets, with no secondary screen to learn.",
        buttons: [
          ["All controls", "Identical to the Crestron panel; both devices share the same signal contract to the processor."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Steueroberfläche eines Luxus-Showrooms, auf dem Crestron-Panel im Backoffice und auf dem iPad des Verkaufspersonals. Vier Seiten: zirkadianes Tunable-White-Licht (DALI Typ 8), Duftspender, Hintergrundmusik und Schaufensterszenen, die an die astronomische Uhr gekoppelt sind. Drei Presets in der linken Spalte decken Öffnung, Schliessung und Abschalten des Geschäfts ab. Das Hintergrundleuchten des Bildschirms folgt der aktuellen Farbtemperatur.",
    sections: [
      {
        title: "Éclairage Blanc (Startbildschirm)",
        image: IMG + "01-eclairage-blanc.png",
        text: "Beim Start geöffnete Seite. Im Automatikmodus folgt die Farbtemperatur der Tageszeit (4000 K morgens, 5500 K mittags, 4500 K nachmittags, 3000 K abends). Die Kopfzeile erinnert daran, dass die Befehle als DALI-Broadcast gesendet werden, und zeigt die Uhrzeit.",
        buttons: [
          ["Éclairage Blanc · Ambiance Olfactive · Musique de Fond · Horloge Astronomique", "Seitenmenü: jeder Tipp öffnet die entsprechende Seite; die aktive Taste ist grün hervorgehoben."],
          ["Ouverture Showroom", "Preset: Schaufenster im Tagmodus, automatische Sonnensynchronisation wieder aktiv, Duftspender ein."],
          ["Fermeture Éco Vitrine", "Preset: Schaufenster in Nacht-Eco (30 % Licht), manueller Modus mit Warmweiss 2700 K, Duftspender aus. Die Taste leuchtet gold."],
          ["Éteindre Système", "Rotes Preset: Schaufenster aus, Sonnensynchronisation aus, Duftspender aus, Musiklautstärke auf 0 %."],
          ["Synchronisation Solaire Auto (Schalter)", "Aktiviert / deaktiviert den zirkadianen Zyklus. Eingeschaltet (grün) meldet der Status „Blanc dynamique ajusté automatiquement“; ausgeschaltet „Mode manuel activé“."],
          ["Chaud (2700K) – Froid (6500K)", "Farbtemperaturregler in 100-K-Schritten. Jede manuelle Änderung schaltet automatisch in den manuellen Modus; der Kelvin-Wert steht unter dem Regler und das Hintergrundleuchten wechselt von Bernstein zu Blau."],
          ["Intensité Lumineuse", "Regler 0–100 % der allgemeinen DALI-Dimmung des Showrooms (Standard 80 %)."],
          ["DALI Broadcast", "Anzeige in der Kopfzeile: Lichtbefehle werden als Broadcast auf dem DALI-Bus gesendet."],
        ],
      },
      {
        title: "Manueller Modus",
        image: IMG + "02-eclairage-manuel.png",
        text: "Nach dem Verschieben des Reglers auf 5500 K: der Synchronisationsschalter geht aus, der Status zeigt „Mode manuel activé“ und das Hintergrundleuchten wird kalt.",
        buttons: [
          ["Synchronisation Solaire Auto", "Ein Tipp stellt den Automatikzyklus wieder her und berechnet die Temperatur sofort nach der Uhrzeit neu."],
        ],
      },
      {
        title: "Ambiance Olfactive",
        image: IMG + "03-ambiance-olfactive.png",
        text: "Wahl des verteilten Dufts, Ein / Aus der Duftspender und Verteilungsintensität.",
        buttons: [
          ["Bois d'Ambre · Fraîcheur Agrumes · Gousse de Vanille", "Düfte mit Verriegelung: nur einer aktiv, farbig hervorgehoben."],
          ["DIFFUSER / STOP", "Duftspender ein / aus. Der Status wechselt von „Actif“ zu „Éteint“ und die Taste ändert die Farbe."],
          ["Débit Parfum", "Regler 0–100 % der Verteilungsintensität (Standard 40 %); ausgegraut und inaktiv, solange die Duftspender aus sind."],
        ],
      },
      {
        title: "Duftspender gestoppt",
        image: IMG + "04-diffuseurs-arretes.png",
        text: "Nach STOP: Status „Éteint“, Taste DIFFUSER zum Neustart und gesperrter Durchflussregler.",
        buttons: [
          ["DIFFUSER", "Startet die Verteilung mit dem zuvor gewählten Duft und Durchfluss neu."],
        ],
      },
      {
        title: "Musique de Fond",
        image: IMG + "05-musique-de-fond.png",
        text: "Wahl der Klangstimmung des Showrooms und Gesamtlautstärke.",
        buttons: [
          ["Jazz & Bossa Nova · Lounge Minimaliste · Classique Acoustique", "Playlists mit Verriegelung; die aktive ist hervorgehoben (hier Lounge Minimaliste)."],
          ["Volume", "Regler 0–100 % der Showroom-Lautstärke (Standard 30 %); durch das Preset Éteindre Système auf 0 gesetzt."],
        ],
      },
      {
        title: "Horloge Astronomique",
        image: IMG + "06-horloge-astronomique.png",
        text: "Schaufensterszenen, die der Prozessor automatisch nach der Sonnenuntergangszeit in Genf auslöst; die Seite erlaubt, sie zu erzwingen oder zu testen.",
        buttons: [
          ["Vitrine Jour", "Schaufenster mit voller Leistung; Standardszene und die von Ouverture Showroom abgerufene."],
          ["Coucher de Soleil", "Übergangsszene, ausgelöst zur astronomischen Sonnenuntergangszeit."],
          ["Nuit Éco (30% Lumière)", "Schaufenster nachts auf 30 % reduziert; von Fermeture Éco Vitrine abgerufen."],
          ["Vitrine Off", "Schaufenster aus; von Éteindre Système abgerufen."],
        ],
      },
      {
        title: "Preset Fermeture Éco",
        image: IMG + "07-preset-fermeture-eco.png",
        text: "Nach einem Tipp auf Fermeture Éco Vitrine: die Szene Nacht-Eco ist aktiv, das Preset gold hervorgehoben, das Licht im manuellen Modus bei 2700 K und die Duftspender aus.",
        buttons: [
          ["Ouverture Showroom", "Macht das Geschäft am nächsten Morgen wieder betriebsbereit: Schaufenster Tag, zirkadianer Zyklus und Duft wieder aktiv."],
        ],
      },
      {
        title: "iPad-Version",
        image: IMG + "08-ipad-eclairage.png",
        text: "Auf dem iPad des Personals dieselbe Oberfläche und dieselben Presets, ohne zusätzlichen Bildschirm zu erlernen.",
        buttons: [
          ["Alle Bedienelemente", "Identisch mit dem Crestron-Panel; beide Geräte teilen denselben Signalvertrag zum Prozessor."],
        ],
      },
    ],
  },
};
