// Fiche détaillée « Boardroom Siège » : chaque écran du GUI de régie, avec capture et
// explication de chaque bouton. Captures : public/sheets/boardroom-futureav/ (dalle Crestron).
const IMG = "/sheets/boardroom-futureav/";

export default {
  fr: {
    intro:
      "Régie d'une salle de conseil sur dalle tactile Crestron, reprise à l'identique sur le XPanel d'administration. Quatre pages : la matrice vidéo DM-NVX, le module de visioconférence, les micros de table Shure et les motorisations (écran, stores). Trois raccourcis dans la colonne de gauche enchaînent tous les réglages d'une réunion en un appui. L'en-tête affiche l'heure et, pendant un appel, un compteur « CONF » avec sa durée.",
    sections: [
      {
        title: "Matrice vidéo",
        image: IMG + "01-matrice-video.png",
        text:
          "Page par défaut : le routage des sources vers le projecteur principal et la dalle latérale, avec le rapport d'état de la matrice DM-NVX. Une seule source par afficheur ; le bouton actif est surligné.",
        buttons: [
          ["Matrice Vidéo · Visioconférence · Micros Shure · Occultation & Stores", "Menu des pages de régie ; la page ouverte est surlignée en vert."],
          ["Démarrer Teams Call (raccourci)", "Prépare la salle pour une visio : appel Teams lancé (compteur CONF), codec sur le projecteur, ClickShare sur la dalle latérale, écran descendu, stores fermés."],
          ["Présentation Locale (raccourci)", "Raccroche, ClickShare sur le projecteur, dalle latérale éteinte, écran remonté, stores ouverts."],
          ["Éteindre Système (raccourci, rouge)", "Raccroche, éteint les deux afficheurs, remonte l'écran et ouvre les stores."],
          ["Projecteur Principal : Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Source affichée sur le projecteur : partage sans fil, prise HDMI murale, codec de visioconférence, ou extinction."],
          ["Dalle Latérale : Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Même choix de source pour l'écran latéral, indépendant du projecteur."],
          ["Rapport d'État Matriciel", "Informations remontées par le DM-NVX : résolution 4K UHD à 60 Hz, latence inférieure à une image."],
        ],
      },
      {
        title: "Visioconférence",
        image: IMG + "02-visioconference.png",
        text:
          "Lancement d'appel et caméra PTZ. Au repos, le codec est en veille et le cadrage automatique actif.",
        buttons: [
          ["Appeler / Raccrocher", "Démarre ou termine l'appel. Le statut passe de « Codec : Veille » à « Codec : Connecté », le bouton devient rouge « Raccrocher » et le compteur CONF apparaît dans l'en-tête."],
          ["Microsoft Teams · Zoom Rooms", "Plateforme utilisée pour l'appel ; le choix actif est surligné en violet."],
          ["Cadrage Intelligent (Auto Framing)", "Interrupteur du tracking orateur : vert = la caméra suit le micro actif ; gris = contrôle manuel de la caméra. Le statut sous l'interrupteur confirme le mode."],
        ],
      },
      {
        title: "Micros Shure",
        image: IMG + "03-micros-shure.png",
        text:
          "Coupure générale des micros et suivi de faisceau du plafonnier Shure MXA920 : la zone où quelqu'un parle est surlignée en vert en temps réel.",
        buttons: [
          ["MUTER / DÉMUTER", "Coupe ou rétablit tous les micros de la table ; l'état passe de « Actif » à « Sourdine »."],
          ["Micro Zone 1 – 4", "Indicateurs des quatre zones de captation ; la zone de l'orateur affiche « (Speaker) » en vert et pilote l'orientation de la caméra lorsque le cadrage intelligent est actif."],
        ],
      },
      {
        title: "Micros en sourdine",
        image: IMG + "04-micros-mute.png",
        text:
          "Après un appui sur MUTER : le bouton s'allume en rouge et propose DÉMUTER, l'état indique « Sourdine ». Le suivi de faisceau continue d'afficher l'orateur.",
        buttons: [
          ["DÉMUTER", "Rétablit les micros."],
        ],
      },
      {
        title: "Occultation & stores",
        image: IMG + "05-occultation-stores.png",
        text:
          "Écran de projection motorisé et stores occultants, avec l'état courant de chaque motorisation.",
        buttons: [
          ["▲ / ▼ (Écran Motorisé)", "Remonte ou descend l'écran de projection ; l'état affiche « Monté » ou « Descendu » et le bouton actif est surligné."],
          ["☀ / ☾ (Stores Blackout)", "Ouvre ou ferme les stores occultants ; l'état affiche « Ouverts » ou « Fermés »."],
        ],
      },
      {
        title: "Raccourci Teams – motorisations",
        image: IMG + "06-teams-call-stores.png",
        text:
          "État après « Démarrer Teams Call » : le compteur CONF tourne dans l'en-tête, l'écran est descendu et les stores sont fermés.",
        buttons: [
          ["CONF: mm:ss", "Durée de l'appel en cours, mise à jour chaque seconde."],
        ],
      },
      {
        title: "Raccourci Teams – matrice",
        image: IMG + "07-teams-call-matrice.png",
        text:
          "Même scénario, page Matrice : le codec de visioconférence est routé sur le projecteur principal et le ClickShare sur la dalle latérale.",
        buttons: [
          ["Codec Visioconf (actif) · Barco ClickShare (actif)", "Routage appliqué par le raccourci ; modifiable à tout moment source par source."],
        ],
      },
      {
        title: "Raccourci Teams – visioconférence",
        image: IMG + "08-teams-call-visio.png",
        text:
          "Page Visioconférence pendant l'appel : codec connecté, bouton rouge « Raccrocher », plateforme Microsoft Teams sélectionnée et cadrage intelligent actif.",
        buttons: [
          ["Raccrocher", "Termine l'appel et remet le compteur à zéro."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Control of a boardroom on a Crestron touch panel, mirrored identically on the admin XPanel. Four pages: the DM-NVX video matrix, the video-conference module, the Shure table microphones and the motorisations (screen, blinds). Three shortcuts in the left column chain every meeting setting in one tap. The header shows the time and, during a call, a “CONF” counter with its duration.",
    sections: [
      {
        title: "Video matrix",
        image: IMG + "01-matrice-video.png",
        text: "Default page: source routing to the main projector and the side display, with the DM-NVX matrix status report. One source per display; the active button is highlighted.",
        buttons: [
          ["Matrice Vidéo · Visioconférence · Micros Shure · Occultation & Stores", "Control page menu; the open page is highlighted in green."],
          ["Démarrer Teams Call (shortcut)", "Prepares the room for a call: Teams call started (CONF counter), codec on the projector, ClickShare on the side display, screen down, blinds closed."],
          ["Présentation Locale (shortcut)", "Hangs up, ClickShare on the projector, side display off, screen up, blinds open."],
          ["Éteindre Système (shortcut, red)", "Hangs up, switches both displays off, raises the screen and opens the blinds."],
          ["Projecteur Principal: Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Source shown on the projector: wireless sharing, wall HDMI socket, video-conference codec, or off."],
          ["Dalle Latérale: Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Same source choice for the side display, independent of the projector."],
          ["Rapport d'État Matriciel", "Information reported by the DM-NVX: 4K UHD resolution at 60 Hz, latency under one frame."],
        ],
      },
      {
        title: "Video conference",
        image: IMG + "02-visioconference.png",
        text: "Call launch and PTZ camera. At rest the codec is in standby and auto framing is on.",
        buttons: [
          ["Appeler / Raccrocher", "Starts or ends the call. The status goes from “Codec : Veille” to “Codec : Connecté”, the button turns red “Raccrocher” and the CONF counter appears in the header."],
          ["Microsoft Teams · Zoom Rooms", "Platform used for the call; the active choice is highlighted in purple."],
          ["Cadrage Intelligent (Auto Framing)", "Speaker-tracking switch: green = the camera follows the active microphone; grey = manual camera control. The status under the switch confirms the mode."],
        ],
      },
      {
        title: "Shure microphones",
        image: IMG + "03-micros-shure.png",
        text: "Master microphone mute and beam tracking of the Shure MXA920 ceiling array: the zone where someone speaks is highlighted in green in real time.",
        buttons: [
          ["MUTER / DÉMUTER", "Mutes or restores every table microphone; the state goes from “Actif” to “Sourdine”."],
          ["Micro Zone 1 – 4", "Indicators of the four pickup zones; the speaker's zone shows “(Speaker)” in green and steers the camera while auto framing is on."],
        ],
      },
      {
        title: "Microphones muted",
        image: IMG + "04-micros-mute.png",
        text: "After tapping MUTER: the button lights up red and offers DÉMUTER, the state reads “Sourdine”. Beam tracking keeps showing the speaker.",
        buttons: [
          ["DÉMUTER", "Restores the microphones."],
        ],
      },
      {
        title: "Blackout & blinds",
        image: IMG + "05-occultation-stores.png",
        text: "Motorised projection screen and blackout blinds, with the current state of each motor.",
        buttons: [
          ["▲ / ▼ (Écran Motorisé)", "Raises or lowers the projection screen; the state shows “Monté” or “Descendu” and the active button is highlighted."],
          ["☀ / ☾ (Stores Blackout)", "Opens or closes the blackout blinds; the state shows “Ouverts” or “Fermés”."],
        ],
      },
      {
        title: "Teams shortcut – motors",
        image: IMG + "06-teams-call-stores.png",
        text: "State after “Démarrer Teams Call”: the CONF counter runs in the header, the screen is down and the blinds are closed.",
        buttons: [
          ["CONF: mm:ss", "Duration of the current call, refreshed every second."],
        ],
      },
      {
        title: "Teams shortcut – matrix",
        image: IMG + "07-teams-call-matrice.png",
        text: "Same scenario, Matrix page: the video-conference codec is routed to the main projector and ClickShare to the side display.",
        buttons: [
          ["Codec Visioconf (active) · Barco ClickShare (active)", "Routing applied by the shortcut; adjustable at any time source by source."],
        ],
      },
      {
        title: "Teams shortcut – video conference",
        image: IMG + "08-teams-call-visio.png",
        text: "Video-conference page during the call: codec connected, red “Raccrocher” button, Microsoft Teams selected and auto framing on.",
        buttons: [
          ["Raccrocher", "Ends the call and resets the counter."],
        ],
      },
    ],
  },

  de: {
    intro:
      "Regie eines Sitzungszimmers auf einem Crestron-Touchpanel, identisch auf dem Admin-XPanel gespiegelt. Vier Seiten: die DM-NVX-Videomatrix, das Videokonferenzmodul, die Shure-Tischmikrofone und die Antriebe (Leinwand, Storen). Drei Schnellzugriffe in der linken Spalte verketten alle Einstellungen einer Sitzung mit einem Tipp. Die Kopfzeile zeigt die Uhrzeit und während eines Anrufs einen „CONF“-Zähler mit der Dauer.",
    sections: [
      {
        title: "Videomatrix",
        image: IMG + "01-matrice-video.png",
        text: "Standardseite: Quellenrouting auf den Hauptprojektor und das Seitendisplay, mit dem Statusbericht der DM-NVX-Matrix. Eine Quelle pro Anzeige; die aktive Taste ist hervorgehoben.",
        buttons: [
          ["Matrice Vidéo · Visioconférence · Micros Shure · Occultation & Stores", "Menü der Regieseiten; die geöffnete Seite ist grün hervorgehoben."],
          ["Démarrer Teams Call (Schnellzugriff)", "Bereitet den Raum für einen Videocall vor: Teams-Anruf gestartet (CONF-Zähler), Codec auf dem Projektor, ClickShare auf dem Seitendisplay, Leinwand unten, Storen geschlossen."],
          ["Présentation Locale (Schnellzugriff)", "Legt auf, ClickShare auf dem Projektor, Seitendisplay aus, Leinwand oben, Storen offen."],
          ["Éteindre Système (Schnellzugriff, rot)", "Legt auf, schaltet beide Anzeigen aus, fährt die Leinwand hoch und öffnet die Storen."],
          ["Projecteur Principal: Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Auf dem Projektor gezeigte Quelle: drahtlose Freigabe, HDMI-Wanddose, Videokonferenz-Codec oder aus."],
          ["Dalle Latérale: Barco ClickShare · HDMI Mural · Codec Visioconf · Éteint", "Gleiche Quellenwahl für das Seitendisplay, unabhängig vom Projektor."],
          ["Rapport d'État Matriciel", "Vom DM-NVX gemeldete Informationen: 4K-UHD-Auflösung bei 60 Hz, Latenz unter einem Bild."],
        ],
      },
      {
        title: "Videokonferenz",
        image: IMG + "02-visioconference.png",
        text: "Anrufstart und PTZ-Kamera. Im Ruhezustand ist der Codec im Standby und das Auto-Framing aktiv.",
        buttons: [
          ["Appeler / Raccrocher", "Startet oder beendet den Anruf. Der Status wechselt von „Codec : Veille“ zu „Codec : Connecté“, die Taste wird rot „Raccrocher“ und der CONF-Zähler erscheint in der Kopfzeile."],
          ["Microsoft Teams · Zoom Rooms", "Für den Anruf genutzte Plattform; die aktive Wahl ist violett hervorgehoben."],
          ["Cadrage Intelligent (Auto Framing)", "Schalter für das Sprecher-Tracking: grün = die Kamera folgt dem aktiven Mikrofon; grau = manuelle Kamerasteuerung. Der Status unter dem Schalter bestätigt den Modus."],
        ],
      },
      {
        title: "Shure-Mikrofone",
        image: IMG + "03-micros-shure.png",
        text: "Zentrale Stummschaltung der Mikrofone und Beam-Tracking des Shure-MXA920-Deckenarrays: die Zone, in der jemand spricht, wird in Echtzeit grün hervorgehoben.",
        buttons: [
          ["MUTER / DÉMUTER", "Schaltet alle Tischmikrofone stumm oder wieder ein; der Status wechselt von „Actif“ zu „Sourdine“."],
          ["Micro Zone 1 – 4", "Anzeigen der vier Aufnahmezonen; die Zone des Sprechers zeigt „(Speaker)“ in Grün und steuert die Kamera, solange das Auto-Framing aktiv ist."],
        ],
      },
      {
        title: "Mikrofone stumm",
        image: IMG + "04-micros-mute.png",
        text: "Nach einem Tipp auf MUTER: die Taste leuchtet rot und bietet DÉMUTER an, der Status zeigt „Sourdine“. Das Beam-Tracking zeigt weiterhin den Sprecher.",
        buttons: [
          ["DÉMUTER", "Schaltet die Mikrofone wieder ein."],
        ],
      },
      {
        title: "Verdunkelung & Storen",
        image: IMG + "05-occultation-stores.png",
        text: "Motorisierte Leinwand und Verdunkelungsstoren, mit dem aktuellen Zustand jedes Antriebs.",
        buttons: [
          ["▲ / ▼ (Écran Motorisé)", "Fährt die Leinwand hoch oder herunter; der Status zeigt „Monté“ oder „Descendu“ und die aktive Taste ist hervorgehoben."],
          ["☀ / ☾ (Stores Blackout)", "Öffnet oder schliesst die Verdunkelungsstoren; der Status zeigt „Ouverts“ oder „Fermés“."],
        ],
      },
      {
        title: "Teams-Schnellzugriff – Antriebe",
        image: IMG + "06-teams-call-stores.png",
        text: "Zustand nach „Démarrer Teams Call“: der CONF-Zähler läuft in der Kopfzeile, die Leinwand ist unten und die Storen sind geschlossen.",
        buttons: [
          ["CONF: mm:ss", "Dauer des laufenden Anrufs, jede Sekunde aktualisiert."],
        ],
      },
      {
        title: "Teams-Schnellzugriff – Matrix",
        image: IMG + "07-teams-call-matrice.png",
        text: "Gleiches Szenario, Seite Matrix: der Videokonferenz-Codec ist auf den Hauptprojektor geroutet, ClickShare auf das Seitendisplay.",
        buttons: [
          ["Codec Visioconf (aktiv) · Barco ClickShare (aktiv)", "Vom Schnellzugriff angewandtes Routing; jederzeit Quelle für Quelle änderbar."],
        ],
      },
      {
        title: "Teams-Schnellzugriff – Videokonferenz",
        image: IMG + "08-teams-call-visio.png",
        text: "Seite Videokonferenz während des Anrufs: Codec verbunden, rote Taste „Raccrocher“, Microsoft Teams gewählt und Auto-Framing aktiv.",
        buttons: [
          ["Raccrocher", "Beendet den Anruf und setzt den Zähler zurück."],
        ],
      },
    ],
  },
};
