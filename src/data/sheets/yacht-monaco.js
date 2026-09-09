// Fiche détaillée « MY Sunrise » : chaque écran du GUI, avec capture et explication de
// chaque bouton. Captures : public/sheets/yacht-monaco/ (dalle murale Crestron).
const IMG = "/sheets/yacht-monaco/";

export default {
  fr: {
    intro:
      "Interface de pilotage du Main Deck d'un superyacht, identique sur la dalle murale Crestron, l'iPad et le XPanel du PC de bord. Trois secteurs se partagent l'écran : l'éclairage d'ambiance, les effets discothèque (lyres DMX) et le système audio multi-zones. Le bandeau supérieur affiche la vitesse du navire et l'heure ; la lueur colorée du fond d'écran suit en permanence la teinte d'éclairage active.",
    sections: [
      {
        title: "Éclairage d'ambiance",
        image: IMG + "01-eclairage-ambiance.png",
        text:
          "Écran par défaut. À gauche, le menu des trois secteurs et les raccourcis du pont ; au centre, les scènes d'ambiance, la palette de teintes et la gradation des trois zones du Main Deck.",
        buttons: [
          ["Éclairage Ambiance · Éclairage Discothèque · Système Audio", "Menu des secteurs : un appui affiche la page correspondante ; l'entrée active est surlignée en vert."],
          ["Ambiance Sunset (raccourci)", "Rappelle la scène Sunset Glow et le preset audio Ambiance Lounge en un seul appui (volume 40 %, lecture lancée)."],
          ["Mode Clubbing (raccourci)", "Lance le preset disco Rainbow Chase (vitesse 65 %) et le preset audio Club Dance (volume 85 %)."],
          ["Éteindre Tout (raccourci, rouge)", "Scène Éteint (trois zones à 0 %), désactivation des effets disco et sourdine audio (volume 0 %)."],
          ["Cozy Yacht", "Scène chaleureuse : plafonnier 50 %, bandeaux LED 40 %, LED sous-marines 30 %, teinte or. Le bouton s'allume en doré."],
          ["Sunset Glow", "Scène coucher de soleil : 70 / 80 / 90 %, teinte rose-rouge."],
          ["Dîner Pont", "Scène repas : plafonnier 85 %, bandeaux 50 %, sous-marines 40 %, teinte indigo."],
          ["Éteint", "Toutes les zones à 0 % et teinte sombre ; les curseurs redescendent à zéro."],
          ["Pastilles de couleur (6)", "Teinte personnalisée du pont : or, rouge, rose, cyan, bleu, vert. La pastille choisie est entourée de blanc, le code hexadécimal s'affiche sous « Teinte active » et la lueur d'arrière-plan change de couleur."],
          ["Plafonnier Salon · Bandeaux LED Aft · LED Sous-Marines", "Curseurs de gradation de 0 à 100 % ; le pourcentage s'affiche en vert à droite. Le rappel d'une scène repositionne les trois curseurs."],
          ["14.5 KTS · Heure", "Vitesse du navire et heure locale, mises à jour en continu."],
        ],
      },
      {
        title: "Scène Sunset Glow",
        image: IMG + "02-scene-sunset-glow.png",
        text:
          "Après un appui sur Sunset Glow : le bouton passe en surbrillance, les trois curseurs se placent sur 70, 80 et 90 % et la teinte rose se propage à la lueur du fond.",
        buttons: [
          ["Sunset Glow (actif)", "Bouton en surbrillance tant que la scène est sélectionnée ; un réglage manuel des curseurs conserve la scène affichée."],
          ["Curseurs", "Positions confirmées par la scène, ajustables individuellement."],
        ],
      },
      {
        title: "Éclairage discothèque",
        image: IMG + "03-eclairage-discotheque.png",
        text:
          "Presets DMX des lyres asservies et des gobos de la piste, et vitesse de balayage. À l'ouverture les effets sont désactivés : le curseur de vitesse est grisé.",
        buttons: [
          ["Stroboscope Gobo", "Effet stroboscopique blanc, vitesse de rotation des lyres à 95 %."],
          ["Lyres Blue Wave", "Vague bleue cyan, vitesse 40 %."],
          ["Rainbow Chase", "Chenillard arc-en-ciel violet, vitesse 65 %."],
          ["Show Laser RGB", "Show laser vert, vitesse 80 %."],
          ["Désactiver Effets Disco", "Arrête tous les effets : vitesse à 0 % et curseur désactivé. Le bouton reste en surbrillance quand les effets sont coupés."],
          ["Vitesse Rotation", "Curseur 0–100 % de la vitesse de balayage des lyres ; actif seulement lorsqu'un preset est lancé."],
        ],
      },
      {
        title: "Preset Rainbow Chase",
        image: IMG + "04-disco-rainbow-chase.png",
        text:
          "Preset lancé : le bouton s'allume, la vitesse passe à 65 % et le curseur devient réglable ; la teinte violette colore l'arrière-plan.",
        buttons: [
          ["Rainbow Chase (actif)", "Preset en cours ; un autre preset le remplace immédiatement (un seul effet à la fois)."],
          ["Vitesse Rotation", "Ajustement fin de la vitesse sans quitter le preset."],
        ],
      },
      {
        title: "Système audio",
        image: IMG + "05-systeme-audio.png",
        text:
          "Presets acoustiques, lecteur de la zone Main Deck et volume multi-zones. Le preset Ambiance Lounge est sélectionné par défaut.",
        buttons: [
          ["Ambiance Lounge", "Volume 40 % et lancement de la lecture."],
          ["Club Dance (Fort)", "Volume 85 % et lecture."],
          ["Chill Out Beats", "Volume 55 % et lecture."],
          ["Discours VIP", "Volume abaissé à 30 % et lecture mise en pause pour laisser la parole."],
          ["Sourdine (Mute)", "Volume à 0 % ; le bouton rouge reste en surbrillance."],
          ["⏮ ▶/⏸ ⏭", "Piste précédente, lecture / pause, piste suivante. Le bouton central devient vert pendant la lecture et la barre de progression avance."],
          ["Volume Pont", "Curseur 0–100 % du volume de toutes les zones du Main Deck ; la valeur s'affiche en vert."],
        ],
      },
      {
        title: "Preset Club Dance",
        image: IMG + "06-audio-club-dance.png",
        text:
          "Après un appui sur Club Dance (Fort) : le preset est surligné, le volume monte à 85 % et le lecteur passe en lecture (bouton pause vert).",
        buttons: [
          ["Club Dance (Fort) (actif)", "Preset en cours ; les autres presets restent disponibles en un appui."],
          ["⏸ (vert)", "Met la lecture en pause ; la barre de progression s'arrête."],
        ],
      },
      {
        title: "Tout éteint",
        image: IMG + "07-tout-eteint.png",
        text:
          "État après le raccourci Éteindre Tout : scène Éteint active, les trois zones à 0 %, effets disco coupés et audio en sourdine.",
        buttons: [
          ["Éteint (actif)", "Toutes les zones d'éclairage à 0 %."],
          ["Scènes et pastilles", "Un appui sur une scène ou une couleur rallume immédiatement le pont."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Main Deck control interface of a superyacht, identical on the Crestron wall panel, the iPad and the bridge PC XPanel. Three sectors share the screen: ambient lighting, disco effects (DMX moving heads) and the multi-zone audio system. The top bar shows the vessel speed and the time; the coloured glow of the background always follows the active lighting hue.",
    sections: [
      {
        title: "Ambient lighting",
        image: IMG + "01-eclairage-ambiance.png",
        text: "Default screen. On the left, the three-sector menu and the deck shortcuts; in the middle, the ambient scenes, the colour palette and the dimming of the three Main Deck zones.",
        buttons: [
          ["Éclairage Ambiance · Éclairage Discothèque · Système Audio", "Sector menu: one tap shows the matching page; the active entry is highlighted in green."],
          ["Ambiance Sunset (shortcut)", "Recalls the Sunset Glow scene and the Ambiance Lounge audio preset in one tap (volume 40 %, playback started)."],
          ["Mode Clubbing (shortcut)", "Starts the Rainbow Chase disco preset (speed 65 %) and the Club Dance audio preset (volume 85 %)."],
          ["Éteindre Tout (shortcut, red)", "Off scene (three zones at 0 %), disco effects disabled and audio muted (volume 0 %)."],
          ["Cozy Yacht", "Warm scene: ceiling 50 %, LED strips 40 %, underwater LEDs 30 %, gold hue. The button lights up in gold."],
          ["Sunset Glow", "Sunset scene: 70 / 80 / 90 %, rose-red hue."],
          ["Dîner Pont", "Dinner scene: ceiling 85 %, strips 50 %, underwater 40 %, indigo hue."],
          ["Éteint", "Every zone at 0 % and dark hue; the sliders drop to zero."],
          ["Colour dots (6)", "Custom deck hue: gold, red, pink, cyan, blue, green. The chosen dot gets a white ring, the hex code appears under “Teinte active” and the background glow changes colour."],
          ["Plafonnier Salon · Bandeaux LED Aft · LED Sous-Marines", "0–100 % dimming sliders; the percentage shows in green on the right. Recalling a scene repositions the three sliders."],
          ["14.5 KTS · Time", "Vessel speed and local time, continuously refreshed."],
        ],
      },
      {
        title: "Sunset Glow scene",
        image: IMG + "02-scene-sunset-glow.png",
        text: "After tapping Sunset Glow: the button is highlighted, the three sliders move to 70, 80 and 90 % and the rose hue spreads to the background glow.",
        buttons: [
          ["Sunset Glow (active)", "Button highlighted while the scene is selected; a manual slider adjustment keeps the scene shown."],
          ["Sliders", "Positions set by the scene, individually adjustable."],
        ],
      },
      {
        title: "Disco lighting",
        image: IMG + "03-eclairage-discotheque.png",
        text: "DMX presets for the moving heads and dance-floor gobos, plus sweep speed. On opening the effects are off: the speed slider is greyed out.",
        buttons: [
          ["Stroboscope Gobo", "White strobe effect, moving-head rotation speed 95 %."],
          ["Lyres Blue Wave", "Cyan blue wave, speed 40 %."],
          ["Rainbow Chase", "Purple rainbow chase, speed 65 %."],
          ["Show Laser RGB", "Green laser show, speed 80 %."],
          ["Désactiver Effets Disco", "Stops every effect: speed 0 % and slider disabled. The button stays highlighted while effects are off."],
          ["Vitesse Rotation", "0–100 % slider for the moving-head sweep speed; active only while a preset is running."],
        ],
      },
      {
        title: "Rainbow Chase preset",
        image: IMG + "04-disco-rainbow-chase.png",
        text: "Preset running: the button lights up, speed goes to 65 % and the slider becomes adjustable; the purple hue tints the background.",
        buttons: [
          ["Rainbow Chase (active)", "Current preset; another preset replaces it immediately (one effect at a time)."],
          ["Vitesse Rotation", "Fine speed adjustment without leaving the preset."],
        ],
      },
      {
        title: "Audio system",
        image: IMG + "05-systeme-audio.png",
        text: "Acoustic presets, Main Deck zone player and multi-zone volume. The Ambiance Lounge preset is selected by default.",
        buttons: [
          ["Ambiance Lounge", "Volume 40 % and playback started."],
          ["Club Dance (Fort)", "Volume 85 % and playback."],
          ["Chill Out Beats", "Volume 55 % and playback."],
          ["Discours VIP", "Volume lowered to 30 % and playback paused for speeches."],
          ["Sourdine (Mute)", "Volume 0 %; the red button stays highlighted."],
          ["⏮ ▶/⏸ ⏭", "Previous track, play / pause, next track. The centre button turns green during playback and the progress bar advances."],
          ["Volume Pont", "0–100 % slider for the volume of every Main Deck zone; the value shows in green."],
        ],
      },
      {
        title: "Club Dance preset",
        image: IMG + "06-audio-club-dance.png",
        text: "After tapping Club Dance (Fort): the preset is highlighted, volume rises to 85 % and the player starts playing (green pause button).",
        buttons: [
          ["Club Dance (Fort) (active)", "Current preset; the other presets stay one tap away."],
          ["⏸ (green)", "Pauses playback; the progress bar stops."],
        ],
      },
      {
        title: "All off",
        image: IMG + "07-tout-eteint.png",
        text: "State after the Éteindre Tout shortcut: Off scene active, the three zones at 0 %, disco effects off and audio muted.",
        buttons: [
          ["Éteint (active)", "Every lighting zone at 0 %."],
          ["Scenes and colour dots", "Tapping a scene or a colour relights the deck immediately."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Steueroberfläche des Main Deck einer Superyacht, identisch auf dem Crestron-Wandpanel, dem iPad und dem XPanel des Brücken-PCs. Drei Sektoren teilen sich den Bildschirm: Ambientebeleuchtung, Disco-Effekte (DMX-Moving-Heads) und das Mehrzonen-Audiosystem. Die Kopfzeile zeigt Schiffsgeschwindigkeit und Uhrzeit; das farbige Leuchten des Hintergrunds folgt stets dem aktiven Lichtfarbton.",
    sections: [
      {
        title: "Ambientebeleuchtung",
        image: IMG + "01-eclairage-ambiance.png",
        text: "Standardbildschirm. Links das Menü der drei Sektoren und die Deck-Schnellzugriffe; in der Mitte die Ambienteszenen, die Farbpalette und das Dimmen der drei Main-Deck-Zonen.",
        buttons: [
          ["Éclairage Ambiance · Éclairage Discothèque · Système Audio", "Sektormenü: ein Tipp zeigt die entsprechende Seite; der aktive Eintrag ist grün hervorgehoben."],
          ["Ambiance Sunset (Schnellzugriff)", "Ruft die Szene Sunset Glow und das Audio-Preset Ambiance Lounge mit einem Tipp ab (Lautstärke 40 %, Wiedergabe gestartet)."],
          ["Mode Clubbing (Schnellzugriff)", "Startet das Disco-Preset Rainbow Chase (Geschwindigkeit 65 %) und das Audio-Preset Club Dance (Lautstärke 85 %)."],
          ["Éteindre Tout (Schnellzugriff, rot)", "Szene Aus (drei Zonen auf 0 %), Disco-Effekte deaktiviert und Audio stumm (Lautstärke 0 %)."],
          ["Cozy Yacht", "Warme Szene: Deckenleuchte 50 %, LED-Bänder 40 %, Unterwasser-LEDs 30 %, Goldton. Die Taste leuchtet gold."],
          ["Sunset Glow", "Sonnenuntergangsszene: 70 / 80 / 90 %, rosarot."],
          ["Dîner Pont", "Dinner-Szene: Deckenleuchte 85 %, Bänder 50 %, Unterwasser 40 %, Indigo."],
          ["Éteint", "Alle Zonen auf 0 % und dunkler Farbton; die Regler fallen auf null."],
          ["Farbpunkte (6)", "Individueller Deck-Farbton: Gold, Rot, Rosa, Cyan, Blau, Grün. Der gewählte Punkt erhält einen weissen Ring, der Hex-Code erscheint unter „Teinte active“ und das Hintergrundleuchten wechselt die Farbe."],
          ["Plafonnier Salon · Bandeaux LED Aft · LED Sous-Marines", "Dimmregler 0–100 %; der Prozentwert steht grün rechts. Der Abruf einer Szene setzt die drei Regler neu."],
          ["14.5 KTS · Uhrzeit", "Schiffsgeschwindigkeit und Ortszeit, laufend aktualisiert."],
        ],
      },
      {
        title: "Szene Sunset Glow",
        image: IMG + "02-scene-sunset-glow.png",
        text: "Nach einem Tipp auf Sunset Glow: die Taste ist hervorgehoben, die drei Regler stehen auf 70, 80 und 90 % und der Rosaton färbt das Hintergrundleuchten.",
        buttons: [
          ["Sunset Glow (aktiv)", "Taste hervorgehoben, solange die Szene gewählt ist; eine manuelle Reglereinstellung lässt die Szene angezeigt."],
          ["Regler", "Von der Szene gesetzte Positionen, einzeln einstellbar."],
        ],
      },
      {
        title: "Disco-Beleuchtung",
        image: IMG + "03-eclairage-discotheque.png",
        text: "DMX-Presets für Moving Heads und Gobos der Tanzfläche sowie Schwenkgeschwindigkeit. Beim Öffnen sind die Effekte aus: der Geschwindigkeitsregler ist ausgegraut.",
        buttons: [
          ["Stroboscope Gobo", "Weisser Stroboskop-Effekt, Rotationsgeschwindigkeit der Moving Heads 95 %."],
          ["Lyres Blue Wave", "Cyanblaue Welle, Geschwindigkeit 40 %."],
          ["Rainbow Chase", "Violettes Regenbogen-Lauflicht, Geschwindigkeit 65 %."],
          ["Show Laser RGB", "Grüne Lasershow, Geschwindigkeit 80 %."],
          ["Désactiver Effets Disco", "Stoppt alle Effekte: Geschwindigkeit 0 % und Regler deaktiviert. Die Taste bleibt hervorgehoben, solange die Effekte aus sind."],
          ["Vitesse Rotation", "Regler 0–100 % für die Schwenkgeschwindigkeit der Moving Heads; nur aktiv, wenn ein Preset läuft."],
        ],
      },
      {
        title: "Preset Rainbow Chase",
        image: IMG + "04-disco-rainbow-chase.png",
        text: "Preset läuft: die Taste leuchtet, die Geschwindigkeit steht auf 65 % und der Regler wird einstellbar; der Violettton färbt den Hintergrund.",
        buttons: [
          ["Rainbow Chase (aktiv)", "Laufendes Preset; ein anderes Preset ersetzt es sofort (nur ein Effekt gleichzeitig)."],
          ["Vitesse Rotation", "Feineinstellung der Geschwindigkeit, ohne das Preset zu verlassen."],
        ],
      },
      {
        title: "Audiosystem",
        image: IMG + "05-systeme-audio.png",
        text: "Akustik-Presets, Player der Main-Deck-Zone und Mehrzonen-Lautstärke. Das Preset Ambiance Lounge ist standardmässig gewählt.",
        buttons: [
          ["Ambiance Lounge", "Lautstärke 40 % und Wiedergabe gestartet."],
          ["Club Dance (Fort)", "Lautstärke 85 % und Wiedergabe."],
          ["Chill Out Beats", "Lautstärke 55 % und Wiedergabe."],
          ["Discours VIP", "Lautstärke auf 30 % gesenkt und Wiedergabe pausiert für Ansprachen."],
          ["Sourdine (Mute)", "Lautstärke 0 %; die rote Taste bleibt hervorgehoben."],
          ["⏮ ▶/⏸ ⏭", "Vorheriger Titel, Wiedergabe / Pause, nächster Titel. Die mittlere Taste wird während der Wiedergabe grün und der Fortschrittsbalken läuft."],
          ["Volume Pont", "Regler 0–100 % für die Lautstärke aller Main-Deck-Zonen; der Wert steht grün."],
        ],
      },
      {
        title: "Preset Club Dance",
        image: IMG + "06-audio-club-dance.png",
        text: "Nach einem Tipp auf Club Dance (Fort): das Preset ist hervorgehoben, die Lautstärke steigt auf 85 % und der Player spielt (grüne Pausetaste).",
        buttons: [
          ["Club Dance (Fort) (aktiv)", "Laufendes Preset; die anderen Presets bleiben mit einem Tipp erreichbar."],
          ["⏸ (grün)", "Pausiert die Wiedergabe; der Fortschrittsbalken stoppt."],
        ],
      },
      {
        title: "Alles aus",
        image: IMG + "07-tout-eteint.png",
        text: "Zustand nach dem Schnellzugriff Éteindre Tout: Szene Aus aktiv, die drei Zonen auf 0 %, Disco-Effekte aus und Audio stumm.",
        buttons: [
          ["Éteint (aktiv)", "Alle Lichtzonen auf 0 %."],
          ["Szenen und Farbpunkte", "Ein Tipp auf eine Szene oder eine Farbe schaltet das Deck sofort wieder ein."],
        ],
      },
    ],
  },
};
