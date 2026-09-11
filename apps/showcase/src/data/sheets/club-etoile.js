// Fiche détaillée « Club L'Étoile » : chaque écran de la régie, avec capture et
// explication de chaque bouton. Captures : public/sheets/club-etoile/
const IMG = "/sheets/club-etoile/";

export default {
  fr: {
    intro:
      "Régie technique d'un établissement de nuit, sur iPad pour le régisseur et le gérant, et sur le XPanel du PC de sécurité. Trois pages : climatisation asservie à l'affluence, limiteur de décibels multi-zones, effets DMX et fumée. Trois raccourcis en colonne gauche enchaînent plusieurs commandes en un appui. Le niveau sonore mesuré sur la piste est affiché en permanence dans l'en-tête et vire au rouge dès que le limiteur intervient.",
    sections: [
      {
        title: "Ventilation & Clim (écran d'accueil)",
        image: IMG + "01-ventilation-clim.png",
        text: "Page ouverte au démarrage. L'affluence estimée pilote automatiquement la vitesse des centrales de traitement d'air et la consigne de température. L'en-tête affiche le niveau sonore mesuré (dB) et l'heure.",
        buttons: [
          ["Ventilation & Clim · Limiteur Audio · Effets DMX & Fumée", "Menu latéral : chaque appui ouvre la page correspondante ; le bouton actif est surligné en vert."],
          ["Alerte Peak Affluence", "Raccourci : passe l'affluence en Peak (ventilateurs 100 %, consigne 17 °C), lance le stroboscope et la machine à fumée."],
          ["Calme / Fin Service", "Raccourci : arrête le stroboscope et la fumée, repasse l'affluence en Calme (ventilateurs 35 %, consigne 21 °C)."],
          ["Extinction Son & Effets", "Raccourci rouge : stroboscope et fumée arrêtés, volumes Dancefloor et Zone Bars à 0 %, affluence Calme."],
          ["Calme (<200 p.) · Normal (500 p.) · Peak (>1000 p.)", "Affluence estimée, en interlock. Chaque niveau règle les ventilateurs et la consigne : Calme 35 % / 21 °C, Normal 65 % / 19 °C, Peak 100 % / 17 °C. Le bouton actif est surligné."],
          ["CTA-1 & CTA-2 (Renouvellement) · En ligne", "État des deux centrales de traitement d'air remonté par le processeur, et consigne CVC en cours."],
          ["Ventilateurs", "Curseur 0 – 100 % de la vitesse d'extraction ; ajustable manuellement après le choix de l'affluence."],
          ["xx dB (en-tête)", "Niveau sonore mesuré sur la piste, rafraîchi chaque seconde ; le badge devient rouge à partir de 105 dB."],
        ],
      },
      {
        title: "Affluence Peak",
        image: IMG + "02-ventilation-peak.png",
        text: "Après un appui sur Peak (>1000 p.) : ventilateurs à 100 % et consigne CVC abaissée à 17 °C pour compenser la chaleur dégagée par le public.",
        buttons: [
          ["Peak (>1000 p.)", "Bouton surligné ; le curseur Ventilateurs et le texte de consigne se mettent à jour immédiatement."],
        ],
      },
      {
        title: "Limiteur Audio",
        image: IMG + "03-limiteur-audio.png",
        text: "Capteur acoustique de la piste et niveaux de puissance par zone. Le seuil maximal légal (105 dB) est rappelé sous la mesure.",
        buttons: [
          ["Capteur Acoustique Piste", "Mesure en direct en violet ; passe en rouge avec le message « ALERTE : BRUIT EXCESSIF (ATTÉNUATION ACTIVE) » dès 105 dB."],
          ["Dancefloor", "Curseur 0 – 100 % de la puissance de la piste (90 % par défaut). Le niveau mesuré suit ce réglage."],
          ["Zone Bars", "Curseur 0 – 100 % de la puissance des bars (60 % par défaut), indépendant de la piste."],
        ],
      },
      {
        title: "Limiteur déclenché",
        image: IMG + "04-limiteur-alerte.png",
        text: "Dancefloor poussé à 100 % : la mesure dépasse 105 dB, la bulle et le badge d'en-tête passent en rouge et l'alerte d'atténuation s'affiche.",
        buttons: [
          ["Dancefloor", "Ramener le curseur sous ≈ 95 % fait retomber la mesure sous le seuil ; l'alerte disparaît et l'affichage revient en violet."],
        ],
      },
      {
        title: "Effets DMX & Fumée",
        image: IMG + "05-effets-dmx.png",
        text: "Commandes des machines d'effets : jet de CO2 et stroboscope de la piste, avec sa fréquence.",
        buttons: [
          ["LANCER JET / STOP JET", "Marche / arrêt de la machine CO2. Le texte passe de « Prêt » à « Jet Actif » et le bouton devient vert puis rouge STOP JET."],
          ["LANCER / STOP", "Marche / arrêt du stroboscope. Le fond de l'écran se met à clignoter légèrement tant que le strobe est actif."],
          ["Fréquence", "Curseur 1 – 15 Hz de la fréquence du stroboscope ; grisé et inactif tant que le strobe est éteint."],
        ],
      },
      {
        title: "Effets actifs",
        image: IMG + "06-effets-actifs.png",
        text: "Jet CO2 et stroboscope lancés, fréquence réglée à 12 Hz : les deux boutons sont en rouge STOP et le curseur de fréquence est déverrouillé.",
        buttons: [
          ["STOP JET · STOP", "Arrêtent chaque effet individuellement ; le raccourci Calme / Fin Service les arrête tous les deux."],
        ],
      },
      {
        title: "XPanel de sécurité",
        image: IMG + "07-xpanel-ventilation.png",
        text: "Sur le PC, le XPanel affiche la même régie avec les mêmes pages et raccourcis que l'iPad.",
        buttons: [
          ["Toutes les commandes", "Identiques à l'iPad ; les deux supports partagent le même contrat de signaux vers le processeur."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Technical control desk for a nightclub, on iPad for the stage manager and owner, and on the XPanel of the security PC. Three pages: attendance-driven climate control, multi-zone decibel limiter, DMX effects and fog. Three shortcuts in the left column chain several commands in one tap. The sound level measured on the dance floor is shown permanently in the header and turns red as soon as the limiter kicks in.",
    sections: [
      {
        title: "Ventilation & Clim (home screen)",
        image: IMG + "01-ventilation-clim.png",
        text: "Page opened at start-up. The estimated attendance automatically drives the air-handling-unit speed and the temperature setpoint. The header shows the measured sound level (dB) and the time.",
        buttons: [
          ["Ventilation & Clim · Limiteur Audio · Effets DMX & Fumée", "Side menu: each tap opens the matching page; the active button is highlighted in green."],
          ["Alerte Peak Affluence", "Shortcut: sets attendance to Peak (fans 100 %, setpoint 17 °C), starts the strobe and the fog machine."],
          ["Calme / Fin Service", "Shortcut: stops strobe and fog, sets attendance back to Calm (fans 35 %, setpoint 21 °C)."],
          ["Extinction Son & Effets", "Red shortcut: strobe and fog stopped, Dancefloor and Bar volumes to 0 %, attendance Calm."],
          ["Calme (<200 p.) · Normal (500 p.) · Peak (>1000 p.)", "Interlocked estimated attendance. Each level sets fans and setpoint: Calm 35 % / 21 °C, Normal 65 % / 19 °C, Peak 100 % / 17 °C. The active button is highlighted."],
          ["CTA-1 & CTA-2 (Renouvellement) · En ligne", "State of both air-handling units reported by the processor, plus the current HVAC setpoint."],
          ["Ventilateurs", "0–100 % slider of the extraction speed; manually adjustable after choosing the attendance."],
          ["xx dB (header)", "Sound level measured on the floor, refreshed every second; the badge turns red from 105 dB."],
        ],
      },
      {
        title: "Peak attendance",
        image: IMG + "02-ventilation-peak.png",
        text: "After tapping Peak (>1000 p.): fans at 100 % and HVAC setpoint lowered to 17 °C to compensate for the heat of the crowd.",
        buttons: [
          ["Peak (>1000 p.)", "Button highlighted; the Fans slider and the setpoint text update immediately."],
        ],
      },
      {
        title: "Audio limiter",
        image: IMG + "03-limiteur-audio.png",
        text: "Dance-floor acoustic sensor and power levels per zone. The legal maximum threshold (105 dB) is shown under the reading.",
        buttons: [
          ["Capteur Acoustique Piste", "Live reading in purple; turns red with the message “ALERTE : BRUIT EXCESSIF (ATTÉNUATION ACTIVE)” from 105 dB."],
          ["Dancefloor", "0–100 % slider of the dance-floor power (90 % by default). The measured level follows this setting."],
          ["Zone Bars", "0–100 % slider of the bars power (60 % by default), independent from the floor."],
        ],
      },
      {
        title: "Limiter tripped",
        image: IMG + "04-limiteur-alerte.png",
        text: "Dancefloor pushed to 100 %: the reading exceeds 105 dB, the bubble and the header badge turn red and the attenuation alert appears.",
        buttons: [
          ["Dancefloor", "Bringing the slider back under ≈ 95 % drops the reading below the threshold; the alert disappears and the display returns to purple."],
        ],
      },
      {
        title: "DMX effects & fog",
        image: IMG + "05-effets-dmx.png",
        text: "Effect machine controls: CO2 jet and dance-floor strobe, with its frequency.",
        buttons: [
          ["LANCER JET / STOP JET", "Start / stop of the CO2 machine. The text switches from “Prêt” to “Jet Actif” and the button turns green then red STOP JET."],
          ["LANCER / STOP", "Start / stop of the strobe. The screen background flickers slightly while the strobe is active."],
          ["Fréquence", "1–15 Hz slider of the strobe frequency; greyed out and inactive while the strobe is off."],
        ],
      },
      {
        title: "Effects running",
        image: IMG + "06-effets-actifs.png",
        text: "CO2 jet and strobe started, frequency set to 12 Hz: both buttons show red STOP and the frequency slider is unlocked.",
        buttons: [
          ["STOP JET · STOP", "Stop each effect individually; the Calme / Fin Service shortcut stops both."],
        ],
      },
      {
        title: "Security XPanel",
        image: IMG + "07-xpanel-ventilation.png",
        text: "On the PC, the XPanel shows the same control desk with the same pages and shortcuts as the iPad.",
        buttons: [
          ["All controls", "Identical to the iPad; both devices share the same signal contract to the processor."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Technische Regie eines Nachtclubs, auf dem iPad für Regie und Betreiber sowie auf dem XPanel des Sicherheits-PCs. Drei Seiten: besucherabhängige Klimatisierung, Mehrzonen-Dezibel-Limiter, DMX-Effekte und Nebel. Drei Kurzbefehle in der linken Spalte verketten mehrere Befehle mit einem Tipp. Der auf der Tanzfläche gemessene Schallpegel wird dauerhaft in der Kopfzeile angezeigt und wird rot, sobald der Limiter eingreift.",
    sections: [
      {
        title: "Ventilation & Clim (Startbildschirm)",
        image: IMG + "01-ventilation-clim.png",
        text: "Beim Start geöffnete Seite. Die geschätzte Besucherzahl steuert automatisch die Drehzahl der Lüftungszentralen und den Temperatursollwert. Die Kopfzeile zeigt den gemessenen Schallpegel (dB) und die Uhrzeit.",
        buttons: [
          ["Ventilation & Clim · Limiteur Audio · Effets DMX & Fumée", "Seitenmenü: jeder Tipp öffnet die entsprechende Seite; die aktive Taste ist grün hervorgehoben."],
          ["Alerte Peak Affluence", "Kurzbefehl: setzt die Besucherzahl auf Peak (Lüfter 100 %, Sollwert 17 °C), startet Stroboskop und Nebelmaschine."],
          ["Calme / Fin Service", "Kurzbefehl: stoppt Stroboskop und Nebel, setzt die Besucherzahl auf Ruhig zurück (Lüfter 35 %, Sollwert 21 °C)."],
          ["Extinction Son & Effets", "Roter Kurzbefehl: Stroboskop und Nebel aus, Lautstärke Dancefloor und Bars auf 0 %, Besucherzahl Ruhig."],
          ["Calme (<200 p.) · Normal (500 p.) · Peak (>1000 p.)", "Geschätzte Besucherzahl mit Verriegelung. Jede Stufe setzt Lüfter und Sollwert: Ruhig 35 % / 21 °C, Normal 65 % / 19 °C, Peak 100 % / 17 °C. Die aktive Taste ist hervorgehoben."],
          ["CTA-1 & CTA-2 (Renouvellement) · En ligne", "Zustand der beiden Lüftungszentralen vom Prozessor sowie aktueller HLK-Sollwert."],
          ["Ventilateurs", "Regler 0–100 % der Abluftdrehzahl; nach der Wahl der Besucherzahl manuell nachstellbar."],
          ["xx dB (Kopfzeile)", "Auf der Tanzfläche gemessener Schallpegel, jede Sekunde aktualisiert; das Abzeichen wird ab 105 dB rot."],
        ],
      },
      {
        title: "Besucherzahl Peak",
        image: IMG + "02-ventilation-peak.png",
        text: "Nach einem Tipp auf Peak (>1000 p.): Lüfter auf 100 % und HLK-Sollwert auf 17 °C gesenkt, um die Abwärme des Publikums auszugleichen.",
        buttons: [
          ["Peak (>1000 p.)", "Taste hervorgehoben; der Lüfterregler und der Sollwerttext aktualisieren sich sofort."],
        ],
      },
      {
        title: "Audio-Limiter",
        image: IMG + "03-limiteur-audio.png",
        text: "Akustiksensor der Tanzfläche und Leistungspegel je Zone. Der gesetzliche Höchstwert (105 dB) steht unter der Messung.",
        buttons: [
          ["Capteur Acoustique Piste", "Live-Messung in Violett; wird ab 105 dB rot mit der Meldung „ALERTE : BRUIT EXCESSIF (ATTÉNUATION ACTIVE)“."],
          ["Dancefloor", "Regler 0–100 % der Tanzflächenleistung (Standard 90 %). Der gemessene Pegel folgt dieser Einstellung."],
          ["Zone Bars", "Regler 0–100 % der Barleistung (Standard 60 %), unabhängig von der Tanzfläche."],
        ],
      },
      {
        title: "Limiter ausgelöst",
        image: IMG + "04-limiteur-alerte.png",
        text: "Dancefloor auf 100 %: die Messung überschreitet 105 dB, Blase und Kopfzeilen-Abzeichen werden rot und der Dämpfungsalarm erscheint.",
        buttons: [
          ["Dancefloor", "Den Regler unter ≈ 95 % zurückziehen senkt die Messung unter die Schwelle; der Alarm verschwindet und die Anzeige wird wieder violett."],
        ],
      },
      {
        title: "DMX-Effekte & Nebel",
        image: IMG + "05-effets-dmx.png",
        text: "Steuerung der Effektmaschinen: CO2-Jet und Stroboskop der Tanzfläche mit Frequenz.",
        buttons: [
          ["LANCER JET / STOP JET", "Start / Stopp der CO2-Maschine. Der Text wechselt von „Prêt“ zu „Jet Actif“, die Taste wird grün, dann rot STOP JET."],
          ["LANCER / STOP", "Start / Stopp des Stroboskops. Der Bildschirmhintergrund flackert leicht, solange das Stroboskop aktiv ist."],
          ["Fréquence", "Regler 1–15 Hz der Stroboskopfrequenz; ausgegraut und inaktiv, solange das Stroboskop aus ist."],
        ],
      },
      {
        title: "Effekte aktiv",
        image: IMG + "06-effets-actifs.png",
        text: "CO2-Jet und Stroboskop gestartet, Frequenz auf 12 Hz: beide Tasten zeigen rot STOP und der Frequenzregler ist freigegeben.",
        buttons: [
          ["STOP JET · STOP", "Stoppen jeden Effekt einzeln; der Kurzbefehl Calme / Fin Service stoppt beide."],
        ],
      },
      {
        title: "Sicherheits-XPanel",
        image: IMG + "07-xpanel-ventilation.png",
        text: "Auf dem PC zeigt das XPanel dieselbe Regie mit denselben Seiten und Kurzbefehlen wie das iPad.",
        buttons: [
          ["Alle Bedienelemente", "Identisch mit dem iPad; beide Geräte teilen denselben Signalvertrag zum Prozessor."],
        ],
      },
    ],
  },
};
