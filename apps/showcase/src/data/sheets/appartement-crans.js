const IMG = "/sheets/appartement-crans/";

export default {
  fr: {
    intro: "Six Senses A10 est un duplex de 350 m² équipé d’éclairages Lutron, de rideaux motorisés et d’une régulation par pièce. La démo Crestron CH5 simule les retours dans le navigateur.",
    sections: [
      {
        title: "XPanel principal · Éclairage",
        image: IMG + "a10-xpanel-lighting.png",
        text: "Choisissez une pièce pour rappeler ses scènes ou régler chaque circuit. « Save to scene » enregistre les niveaux courants dans la scène sans la rappeler.",
        buttons: [
          ["Bright · Evening · Night · Off", "Rappelle une scène de la pièce."],
          ["Molette", "Varie le circuit sélectionné ou bascule un circuit marche/arrêt."],
        ],
      },
      {
        title: "XPanel principal · Stores",
        image: IMG + "a10-xpanel-shades.png",
        text: "Les illustrations suivent l’ouverture simulée des stores et des rideaux. Les commandes de groupe agissent sur les motorisations de la pièce.",
        buttons: [["Open · Stop · Close", "Ouvre, arrête ou ferme la motorisation sélectionnée."]],
      },
      {
        title: "XPanel Climat",
        image: IMG + "a10-xpanel-climate.png",
        text: "Cette interface est dédiée aux pièces équipées d’un thermostat. Elle affiche la température simulée et la consigne.",
        buttons: [["− / +", "Ajuste la consigne par pas de 0,5 °C."], ["On · Off", "Active ou arrête la régulation."]],
      },
      {
        title: "Crestron ONE sur iPad et iPhone",
        image: IMG + "a10-ipad.png",
        image2: IMG + "a10-iphone.png",
        text: "La présentation s’adapte à chaque écran. Glissez verticalement sur une tuile pour varier son niveau, ou horizontalement sur la zone de pagination pour changer de page.",
        buttons: [],
      },
    ],
  },
  en: {
    intro: "Six Senses A10 is a 350 m² duplex with Lutron lighting, motorised curtains and room-by-room climate control. The Crestron CH5 demo simulates feedback in the browser.",
    sections: [
      {
        title: "Main XPanel · Lighting",
        image: IMG + "a10-xpanel-lighting.png",
        text: "Choose a room to recall its scenes or adjust individual circuits. Save to scene stores the current levels without recalling the scene.",
        buttons: [
          ["Bright · Evening · Night · Off", "Recalls a room scene."],
          ["Mouse wheel", "Dims the selected circuit or toggles a switched circuit."],
        ],
      },
      {
        title: "Main XPanel · Shades",
        image: IMG + "a10-xpanel-shades.png",
        text: "The illustrations follow the simulated opening of the shades and curtains. Group controls operate the motors in the room.",
        buttons: [["Open · Stop · Close", "Opens, stops or closes the selected shade."]],
      },
      {
        title: "Climate XPanel",
        image: IMG + "a10-xpanel-climate.png",
        text: "This interface is dedicated to rooms with a thermostat. It shows the simulated temperature and setpoint.",
        buttons: [["− / +", "Adjusts the setpoint in 0.5 °C steps."], ["On · Off", "Turns climate control on or off."]],
      },
      {
        title: "Crestron ONE on iPad and iPhone",
        image: IMG + "a10-ipad.png",
        image2: IMG + "a10-iphone.png",
        text: "The layout adapts to each screen. Swipe vertically on a tile to dim the circuit, or horizontally over the pagination area to change pages.",
        buttons: [],
      },
    ],
  },
  de: {
    intro: "Six Senses A10 ist eine 350 m² grosse Maisonette mit Lutron-Beleuchtung, motorisierten Vorhängen und Einzelraumregelung. Die Crestron-CH5-Demo simuliert die Rückmeldungen im Browser.",
    sections: [
      {
        title: "Haupt-XPanel · Beleuchtung",
        image: IMG + "a10-xpanel-lighting.png",
        text: "Wählen Sie einen Raum, um seine Szenen aufzurufen oder einzelne Lichtkreise einzustellen. Save to scene speichert die aktuellen Werte, ohne die Szene aufzurufen.",
        buttons: [
          ["Bright · Evening · Night · Off", "Ruft eine Szene des Raums auf."],
          ["Mausrad", "Dimmt den gewählten Lichtkreis oder schaltet einen Ein/Aus-Lichtkreis."],
        ],
      },
      {
        title: "Haupt-XPanel · Storen",
        image: IMG + "a10-xpanel-shades.png",
        text: "Die Abbildungen zeigen die simulierte Öffnung von Storen und Vorhängen. Gruppenbefehle steuern die Antriebe des Raums.",
        buttons: [["Open · Stop · Close", "Öffnet, stoppt oder schliesst den gewählten Antrieb."]],
      },
      {
        title: "Klima-XPanel",
        image: IMG + "a10-xpanel-climate.png",
        text: "Diese Oberfläche ist für Räume mit Thermostat vorgesehen. Sie zeigt die simulierte Temperatur und den Sollwert.",
        buttons: [["− / +", "Ändert den Sollwert in Schritten von 0,5 °C."], ["On · Off", "Schaltet die Regelung ein oder aus."]],
      },
      {
        title: "Crestron ONE auf iPad und iPhone",
        image: IMG + "a10-ipad.png",
        image2: IMG + "a10-iphone.png",
        text: "Das Layout passt sich dem Bildschirm an. Vertikales Wischen auf einer Kachel dimmt den Lichtkreis. Horizontales Wischen im Seitenbereich wechselt die Seite.",
        buttons: [],
      },
    ],
  },
};
