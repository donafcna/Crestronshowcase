// Fiche détaillée « Auditorium 1000 places » : chaque écran de la régie, avec capture et
// explication de chaque bouton. Captures : public/sheets/auditorium-richmond/
const IMG = "/sheets/auditorium-richmond/";

export default {
  fr: {
    intro:
      "Console de régie pour un auditorium universitaire de 1000 places, affichée sur la dalle Crestron de la cabine technique et sur le XPanel du PC de régie. Quatre pages (éclairage DMX, caméras PTZ, mixage Dante, mur LED) et trois macros globales en un appui. L'habillage « néon » à fort contraste est pensé pour une cabine plongée dans le noir ; l'état de chaque commande est renvoyé par le processeur.",
    sections: [
      {
        title: "Éclairage DMX (écran d'accueil)",
        image: IMG + "01-eclairage-dmx.png",
        text: "Page ouverte au démarrage. À gauche, le menu des quatre pages (« console maps ») et les macros ; à droite, les presets de scène, la teinte du cyclorama et les trois gradateurs de la scène. L'en-tête affiche l'indicateur BROADCAST REC et l'heure.",
        buttons: [
          ["Éclairage DMX · Caméras PTZ · Dante Mix · Mur LED 15m", "Menu latéral : chaque appui ouvre la page correspondante, le bouton actif s'allume en cyan."],
          ["Macro Conf", "Macro « conférence » : rappelle le preset Discours (face 90 %, contre-jour 50 %, public 30 %, cyclo rose), route le PC Pupitre sur le mur LED et fixe sa luminosité à 90 %."],
          ["Macro Show", "Macro « spectacle » : preset Spectacle (face 60 %, contre-jour 90 %, public 15 %, cyclo vert), retour caméra live sur le mur LED à 100 %."],
          ["Total Blackout", "Extinction complète : preset Noir (tous les gradateurs à 0 %), logo de l'université sur le mur LED à 10 %, et arrêt de l'enregistrement (l'indicateur BROADCAST REC disparaît de l'en-tête)."],
          ["Discours · Débat · Spectacle · Noir", "Presets de scène en interlock : chaque preset fixe les trois gradateurs et la teinte du cyclo (Discours 90/50/30 rose, Débat 80/70/45 cyan, Spectacle 60/90/15 vert, Noir 0/0/0). Le preset actif est surligné en couleur."],
          ["Pastilles vert · rose · cyan · jaune", "Teinte DMX du cyclorama. La pastille choisie s'entoure d'un halo, le texte « Flux actif » affiche le code couleur et le fond de l'écran prend la même lueur."],
          ["Projecteurs Face", "Curseur de gradation 0 – 100 % des projecteurs de face ; valeur affichée en vert."],
          ["Contre-Jour / Cyclo", "Curseur 0 – 100 % du contre-jour et du cyclorama ; valeur en rose."],
          ["Éclairage Public", "Curseur 0 – 100 % de l'éclairage de la salle ; valeur en cyan."],
          ["BROADCAST REC", "Témoin d'enregistrement / streaming en cours, piloté par le processeur ; disparaît après Total Blackout."],
        ],
      },
      {
        title: "Preset Discours",
        image: IMG + "02-eclairage-preset-discours.png",
        text: "Après un appui sur Discours : les trois curseurs se repositionnent (90 / 50 / 30 %), la pastille rose est sélectionnée et la lueur d'ambiance passe au rose.",
        buttons: [
          ["Discours", "Rappelle le preset ; feedback immédiat sur les curseurs, la pastille de teinte et le halo de fond."],
          ["Curseurs", "Un réglage manuel après le preset modifie le circuit sans désélectionner le preset."],
        ],
      },
      {
        title: "Caméras PTZ",
        image: IMG + "03-cameras-ptz.png",
        text: "Sélection de la caméra envoyée à l'enregistrement et pilotage pan / tilt / zoom de la caméra active. La fenêtre de prévisualisation reflète les mouvements demandés.",
        buttons: [
          ["Cam 1 (Orateur) · Cam 2 (Chaire) · Cam 3 (Public)", "Choix de la caméra active (une seule à la fois, bouton surligné en cyan). Le nom de la caméra s'affiche dans la prévisualisation « STREAM FEED // CAMx »."],
          ["REC FEED", "Badge indiquant que ce flux est celui envoyé à l'enregistrement."],
          ["↑ ← → ↓ (JOY)", "Déplacement pan / tilt par pas de 10 ; limité à ± 50 dans chaque axe. L'image de prévisualisation se décale en conséquence."],
          ["Zoom − / +", "Zoom optique de 1x à 4x par pas de 1 ; la valeur s'affiche en cyan et la prévisualisation s'agrandit."],
        ],
      },
      {
        title: "Dante Mix",
        image: IMG + "04-dante-mix.png",
        text: "Console de mixage simplifiée des entrées du réseau audio Dante : un fader et un bouton de coupure par entrée.",
        buttons: [
          ["Micro Chaire", "Fader 0 – 100 % du micro de la chaire (80 % par défaut)."],
          ["Micros Sans Fil", "Fader 0 – 100 % du groupe de micros HF (70 % par défaut)."],
          ["Entrée Régie Aux", "Fader 0 – 100 % de l'entrée auxiliaire de la régie (50 % par défaut)."],
          ["ACTIF / MUTÉ", "Coupure de l'entrée : ACTIF (vert) → MUTÉ (rose). En mute, le fader tombe à 0 et se verrouille ; un nouvel appui rend le niveau précédent."],
        ],
      },
      {
        title: "Dante Mix — entrée coupée",
        image: IMG + "05-dante-mix-mute.png",
        text: "Micros Sans Fil en mute : le bouton passe en rose « MUTÉ », le fader est à zéro et grisé jusqu'au rétablissement.",
        buttons: [
          ["MUTÉ", "Rétablit l'entrée au niveau mémorisé (70 %) et repasse le bouton en vert ACTIF."],
        ],
      },
      {
        title: "Mur LED 15 m",
        image: IMG + "06-mur-led.png",
        text: "Routage de la source affichée sur le mur LED principal et gradation de sa luminosité.",
        buttons: [
          ["PC Pupitre · HDMI Régie · Retour Cam Live · Logo Uni", "Sources en interlock (une seule active, surlignée en cyan) : PC du pupitre, entrée HDMI de la régie, retour de la caméra active, logo de l'université."],
          ["Luminosité", "Curseur de 10 à 100 % de la luminosité du mur LED ; la valeur s'affiche en vert."],
        ],
      },
      {
        title: "Après Total Blackout",
        image: IMG + "07-macro-blackout.png",
        text: "État résultant de la macro Total Blackout : Logo Uni sur le mur LED, luminosité 10 %, enregistrement arrêté (plus de témoin BROADCAST REC), scène au noir.",
        buttons: [
          ["Macro Conf / Macro Show", "Rétablissent une configuration complète en un appui (éclairage + mur LED). L'enregistrement n'est pas relancé automatiquement."],
        ],
      },
      {
        title: "XPanel de régie",
        image: IMG + "08-xpanel-eclairage.png",
        text: "Sur le PC de régie, le XPanel reprend exactement la même page : mêmes menus, mêmes macros, mêmes retours d'état que sur la dalle de la cabine.",
        buttons: [
          ["Toutes les commandes", "Identiques à la dalle Crestron ; les deux supports partagent le même contrat de signaux vers le processeur."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Control-room console for a 1000-seat university auditorium, shown on the Crestron panel in the technical booth and on the XPanel of the control PC. Four pages (DMX lighting, PTZ cameras, Dante mix, LED wall) plus three one-touch global macros. The high-contrast “neon” skin is designed for a darkened booth; the state of every control is fed back by the processor.",
    sections: [
      {
        title: "DMX lighting (home screen)",
        image: IMG + "01-eclairage-dmx.png",
        text: "Page opened at start-up. On the left, the four-page menu (“console maps”) and the macros; on the right, the stage presets, the cyclorama tint and the three stage dimmers. The header shows the BROADCAST REC indicator and the time.",
        buttons: [
          ["Éclairage DMX · Caméras PTZ · Dante Mix · Mur LED 15m", "Side menu: each tap opens the matching page; the active button lights up in cyan."],
          ["Macro Conf", "“Conference” macro: recalls the Speech preset (face 90 %, backlight 50 %, audience 30 %, pink cyc), routes the Lectern PC to the LED wall and sets its brightness to 90 %."],
          ["Macro Show", "“Show” macro: Performance preset (face 60 %, backlight 90 %, audience 15 %, green cyc), live camera return on the LED wall at 100 %."],
          ["Total Blackout", "Full shutdown: Blackout preset (all dimmers at 0 %), university logo on the LED wall at 10 %, and recording stopped (the BROADCAST REC indicator disappears from the header)."],
          ["Discours · Débat · Spectacle · Noir", "Interlocked stage presets: each one sets the three dimmers and the cyc tint (Speech 90/50/30 pink, Debate 80/70/45 cyan, Performance 60/90/15 green, Blackout 0/0/0). The active preset is highlighted in colour."],
          ["Green · pink · cyan · yellow pills", "DMX tint of the cyclorama. The chosen pill gets a halo, the “Flux actif” text shows the colour code and the screen background takes the same glow."],
          ["Projecteurs Face", "0–100 % dimmer slider for the front spots; value shown in green."],
          ["Contre-Jour / Cyclo", "0–100 % slider for backlight and cyclorama; value in pink."],
          ["Éclairage Public", "0–100 % slider for the house lights; value in cyan."],
          ["BROADCAST REC", "Recording / streaming indicator driven by the processor; disappears after Total Blackout."],
        ],
      },
      {
        title: "Speech preset",
        image: IMG + "02-eclairage-preset-discours.png",
        text: "After tapping Discours: the three sliders move (90 / 50 / 30 %), the pink pill is selected and the ambient glow turns pink.",
        buttons: [
          ["Discours", "Recalls the preset; immediate feedback on the sliders, the tint pill and the background halo."],
          ["Sliders", "A manual adjustment after the preset changes the circuit without deselecting the preset."],
        ],
      },
      {
        title: "PTZ cameras",
        image: IMG + "03-cameras-ptz.png",
        text: "Selection of the camera sent to the recording and pan / tilt / zoom control of the active camera. The preview window mirrors the requested movements.",
        buttons: [
          ["Cam 1 (Orateur) · Cam 2 (Chaire) · Cam 3 (Public)", "Active camera choice (one at a time, button highlighted in cyan). The camera name appears in the “STREAM FEED // CAMx” preview."],
          ["REC FEED", "Badge showing that this feed is the one sent to the recording."],
          ["↑ ← → ↓ (JOY)", "Pan / tilt in steps of 10, limited to ± 50 on each axis. The preview image shifts accordingly."],
          ["Zoom − / +", "Optical zoom from 1x to 4x in steps of 1; the value is shown in cyan and the preview enlarges."],
        ],
      },
      {
        title: "Dante mix",
        image: IMG + "04-dante-mix.png",
        text: "Simplified mixing console for the Dante audio network inputs: one fader and one mute button per input.",
        buttons: [
          ["Micro Chaire", "0–100 % fader for the lectern microphone (80 % by default)."],
          ["Micros Sans Fil", "0–100 % fader for the wireless microphone group (70 % by default)."],
          ["Entrée Régie Aux", "0–100 % fader for the control-room auxiliary input (50 % by default)."],
          ["ACTIF / MUTÉ", "Input mute: ACTIF (green) → MUTÉ (pink). When muted the fader drops to 0 and locks; another tap restores the previous level."],
        ],
      },
      {
        title: "Dante mix — muted input",
        image: IMG + "05-dante-mix-mute.png",
        text: "Wireless mics muted: the button turns pink “MUTÉ”, the fader sits at zero and is greyed out until restored.",
        buttons: [
          ["MUTÉ", "Restores the input to the stored level (70 %) and turns the button back to green ACTIF."],
        ],
      },
      {
        title: "15 m LED wall",
        image: IMG + "06-mur-led.png",
        text: "Routing of the source displayed on the main LED wall and dimming of its brightness.",
        buttons: [
          ["PC Pupitre · HDMI Régie · Retour Cam Live · Logo Uni", "Interlocked sources (one active, highlighted in cyan): lectern PC, control-room HDMI input, active camera return, university logo."],
          ["Luminosité", "Slider from 10 to 100 % for the LED wall brightness; value shown in green."],
        ],
      },
      {
        title: "After Total Blackout",
        image: IMG + "07-macro-blackout.png",
        text: "Resulting state of the Total Blackout macro: university logo on the LED wall, 10 % brightness, recording stopped (no more BROADCAST REC indicator), stage dark.",
        buttons: [
          ["Macro Conf / Macro Show", "Restore a complete configuration in one tap (lighting + LED wall). Recording is not restarted automatically."],
        ],
      },
      {
        title: "Control-room XPanel",
        image: IMG + "08-xpanel-eclairage.png",
        text: "On the control PC, the XPanel shows exactly the same page: same menus, same macros, same feedback as on the booth panel.",
        buttons: [
          ["All controls", "Identical to the Crestron panel; both devices share the same signal contract to the processor."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Regiekonsole für ein Universitätsauditorium mit 1000 Plätzen, angezeigt auf dem Crestron-Panel der Technikkabine und auf dem XPanel des Regie-PCs. Vier Seiten (DMX-Licht, PTZ-Kameras, Dante-Mix, LED-Wand) plus drei globale Makros mit einem Tipp. Das kontrastreiche „Neon“-Design ist für eine abgedunkelte Kabine gedacht; der Zustand jeder Bedienung wird vom Prozessor zurückgemeldet.",
    sections: [
      {
        title: "DMX-Licht (Startbildschirm)",
        image: IMG + "01-eclairage-dmx.png",
        text: "Beim Start geöffnete Seite. Links das Menü der vier Seiten („console maps“) und die Makros; rechts die Bühnenpresets, die Farbe des Zykloramas und die drei Bühnendimmer. Die Kopfzeile zeigt die Anzeige BROADCAST REC und die Uhrzeit.",
        buttons: [
          ["Éclairage DMX · Caméras PTZ · Dante Mix · Mur LED 15m", "Seitenmenü: jeder Tipp öffnet die entsprechende Seite; die aktive Taste leuchtet cyan."],
          ["Macro Conf", "Makro „Konferenz“: ruft das Preset Rede ab (Front 90 %, Gegenlicht 50 %, Publikum 30 %, Zyklo rosa), schaltet den Pult-PC auf die LED-Wand und setzt deren Helligkeit auf 90 %."],
          ["Macro Show", "Makro „Show“: Preset Vorstellung (Front 60 %, Gegenlicht 90 %, Publikum 15 %, Zyklo grün), Live-Kamerabild auf der LED-Wand mit 100 %."],
          ["Total Blackout", "Komplettabschaltung: Preset Dunkel (alle Dimmer auf 0 %), Universitätslogo auf der LED-Wand mit 10 %, Aufnahme gestoppt (die Anzeige BROADCAST REC verschwindet aus der Kopfzeile)."],
          ["Discours · Débat · Spectacle · Noir", "Bühnenpresets mit Verriegelung: jedes setzt die drei Dimmer und die Zyklo-Farbe (Rede 90/50/30 rosa, Debatte 80/70/45 cyan, Vorstellung 60/90/15 grün, Dunkel 0/0/0). Das aktive Preset ist farbig hervorgehoben."],
          ["Punkte grün · rosa · cyan · gelb", "DMX-Farbe des Zykloramas. Der gewählte Punkt erhält einen Lichthof, der Text „Flux actif“ zeigt den Farbcode und der Bildschirmhintergrund nimmt dasselbe Leuchten an."],
          ["Projecteurs Face", "Dimmerregler 0–100 % der Frontscheinwerfer; Wert in Grün."],
          ["Contre-Jour / Cyclo", "Regler 0–100 % für Gegenlicht und Zyklorama; Wert in Rosa."],
          ["Éclairage Public", "Regler 0–100 % des Saallichts; Wert in Cyan."],
          ["BROADCAST REC", "Anzeige laufender Aufnahme / Streaming, vom Prozessor gesteuert; verschwindet nach Total Blackout."],
        ],
      },
      {
        title: "Preset Rede",
        image: IMG + "02-eclairage-preset-discours.png",
        text: "Nach einem Tipp auf Discours: die drei Regler fahren auf 90 / 50 / 30 %, der rosa Punkt ist gewählt und das Umgebungsleuchten wird rosa.",
        buttons: [
          ["Discours", "Ruft das Preset ab; sofortiges Feedback auf den Reglern, dem Farbpunkt und dem Hintergrundleuchten."],
          ["Regler", "Eine manuelle Einstellung nach dem Preset ändert den Kreis, ohne das Preset abzuwählen."],
        ],
      },
      {
        title: "PTZ-Kameras",
        image: IMG + "03-cameras-ptz.png",
        text: "Wahl der an die Aufnahme gesendeten Kamera und Pan-/Tilt-/Zoom-Steuerung der aktiven Kamera. Das Vorschaufenster spiegelt die angeforderten Bewegungen.",
        buttons: [
          ["Cam 1 (Orateur) · Cam 2 (Chaire) · Cam 3 (Public)", "Wahl der aktiven Kamera (nur eine, Taste cyan hervorgehoben). Der Kameraname erscheint in der Vorschau „STREAM FEED // CAMx“."],
          ["REC FEED", "Abzeichen: dieses Bild wird an die Aufnahme gesendet."],
          ["↑ ← → ↓ (JOY)", "Pan / Tilt in Schritten von 10, begrenzt auf ± 50 je Achse. Das Vorschaubild verschiebt sich entsprechend."],
          ["Zoom − / +", "Optischer Zoom von 1x bis 4x in Einerschritten; der Wert wird cyan angezeigt und die Vorschau vergrössert sich."],
        ],
      },
      {
        title: "Dante-Mix",
        image: IMG + "04-dante-mix.png",
        text: "Vereinfachtes Mischpult für die Eingänge des Dante-Audionetzes: ein Fader und eine Stummtaste je Eingang.",
        buttons: [
          ["Micro Chaire", "Fader 0–100 % des Pultmikrofons (Standard 80 %)."],
          ["Micros Sans Fil", "Fader 0–100 % der Funkmikrofon-Gruppe (Standard 70 %)."],
          ["Entrée Régie Aux", "Fader 0–100 % des Aux-Eingangs der Regie (Standard 50 %)."],
          ["ACTIF / MUTÉ", "Stummschaltung des Eingangs: ACTIF (grün) → MUTÉ (rosa). Bei Stumm fällt der Fader auf 0 und ist gesperrt; ein weiterer Tipp stellt den vorherigen Pegel wieder her."],
        ],
      },
      {
        title: "Dante-Mix — stummer Eingang",
        image: IMG + "05-dante-mix-mute.png",
        text: "Funkmikrofone stumm: die Taste wird rosa „MUTÉ“, der Fader steht auf null und ist bis zur Wiederherstellung ausgegraut.",
        buttons: [
          ["MUTÉ", "Stellt den Eingang auf den gespeicherten Pegel (70 %) zurück und schaltet die Taste wieder auf grün ACTIF."],
        ],
      },
      {
        title: "LED-Wand 15 m",
        image: IMG + "06-mur-led.png",
        text: "Routing der auf der Haupt-LED-Wand gezeigten Quelle und Dimmen ihrer Helligkeit.",
        buttons: [
          ["PC Pupitre · HDMI Régie · Retour Cam Live · Logo Uni", "Quellen mit Verriegelung (eine aktiv, cyan hervorgehoben): Pult-PC, HDMI-Eingang der Regie, Bild der aktiven Kamera, Universitätslogo."],
          ["Luminosité", "Regler von 10 bis 100 % für die Helligkeit der LED-Wand; Wert in Grün."],
        ],
      },
      {
        title: "Nach Total Blackout",
        image: IMG + "07-macro-blackout.png",
        text: "Ergebnis des Makros Total Blackout: Universitätslogo auf der LED-Wand, 10 % Helligkeit, Aufnahme gestoppt (keine Anzeige BROADCAST REC mehr), Bühne dunkel.",
        buttons: [
          ["Macro Conf / Macro Show", "Stellen mit einem Tipp eine vollständige Konfiguration wieder her (Licht + LED-Wand). Die Aufnahme startet nicht automatisch neu."],
        ],
      },
      {
        title: "XPanel der Regie",
        image: IMG + "08-xpanel-eclairage.png",
        text: "Auf dem Regie-PC zeigt das XPanel genau dieselbe Seite: gleiche Menüs, gleiche Makros, gleiche Rückmeldungen wie auf dem Panel der Kabine.",
        buttons: [
          ["Alle Bedienelemente", "Identisch mit dem Crestron-Panel; beide Geräte teilen denselben Signalvertrag zum Prozessor."],
        ],
      },
    ],
  },
};
