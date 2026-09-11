// Fiche détaillée « Villa Nyon » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/villa-gemini/
// (dalle TSW-1070 et iPhone, simulateur React VillaGemini).
const IMG = "/sheets/villa-gemini/";

export default {
  fr: {
    intro:
      "Villa Nyon est une interface résidentielle sur une seule page : les quatre cartes d'une pièce (Éclairage, Climatisation, Sonorisation, Sécurité) sont toujours visibles, et la pièce se change dans la colonne de gauche. La même page est déclinée sur la dalle Crestron TSW-1070, l'iPad et le XPanel ; l'iPhone la réorganise en onglets. Chaque commande agit immédiatement et l'état affiché (niveau, consigne, mode, armement) est celui renvoyé par le processeur.",
    sections: [
      {
        title: "Écran principal — Salon Lounge",
        image: IMG + "01-accueil-salon.png",
        text:
          "L'en-tête affiche la marque, la pièce active, la météo et l'heure. À gauche, la liste des espaces et les quatre scénarios globaux ; au centre, les quatre cartes de la pièce sélectionnée. Le Salon Lounge est la pièce affichée à l'ouverture.",
        buttons: [
          ["Salon Lounge · Suite Parentale · Cuisine · Spa & Wellness", "Sélection de la pièce : le bouton s'allume en violet, le nom de la pièce s'inscrit dans l'en-tête et les cartes Éclairage et Climatisation se recalculent pour cette pièce."],
          ["Lustre Principal · Ruban LED RGB · Spots Lectures (curseurs)", "Gradation de chaque circuit du salon de 0 à 100 % ; la valeur en pourcentage à droite suit le curseur en temps réel. Le curseur du ruban LED est bleu-cyan pour le distinguer."],
          ["Cadran de température", "Consigne demandée en grand (21,5 °C au départ) et température mesurée en dessous ; l'arc coloré représente la consigne."],
          ["− / +", "Baisse ou monte la consigne de la pièce par pas de 0,5 °C."],
          ["❄ Clim · 🔥 Chaud · ⏻ Off", "Mode du thermostat : le mode actif s'entoure de bleu (Clim), de rouge (Chaud) ou de gris (Off). Un seul mode à la fois."],
          ["Spotify · AirPlay 2 · Sonos", "Source audio de la villa ; la source choisie s'encadre en violet."],
          ["Pochette, titre, artiste", "Morceau en cours ; la barre 0:24 / 3:15 se remplit à 35 % quand la lecture est active."],
          ["⏮ ▶ / ⏸ ⏭", "Piste précédente, lecture / pause (le bouton central devient violet et passe en icône Pause pendant la lecture), piste suivante."],
          ["🔊 + curseur 65 %", "Volume de la zone audio."],
          ["Système désarmé / Off · Home · Away", "État de l'alarme et trois commandes d'armement : Off désarme (bouclier vert), Home arme en partiel « Nuit » (bouclier orange), Away arme en total « Absent » (bouclier rouge). Le bouton du mode actif reste en surbrillance."],
          ["Jardin · Piscine · Entrée", "Choix de la caméra affichée dans le visualiseur ; l'onglet actif est souligné en cyan."],
          ["Visualiseur caméra", "Flux de la caméra choisie avec le badge REC, son identifiant (CAM_JARDIN…) et le format du flux (H.264, 1080p, 30 FPS)."],
        ],
      },
      {
        title: "Suite Parentale",
        image: IMG + "02-suite-parentale.png",
        text: "La même page pour la chambre : deux circuits d'éclairage et une consigne propre à la pièce (20 °C, mesuré 19,8 °C). Les cartes Sonorisation et Sécurité sont communes à toute la villa.",
        buttons: [
          ["Plafonnier · Lampes de chevet", "Gradation de 0 à 100 % des deux circuits de la chambre."],
          ["− / + · Clim · Chaud · Off", "Consigne et mode de la chambre, indépendants des autres pièces."],
        ],
      },
      {
        title: "Cuisine",
        image: IMG + "03-cuisine.png",
        text: "Éclairage général et suspensions du bar, consigne 21 °C.",
        buttons: [
          ["Général · Suspensions Bar", "Gradation de 0 à 100 % des deux circuits de la cuisine."],
          ["− / + · Clim · Chaud · Off", "Consigne et mode de la cuisine."],
        ],
      },
      {
        title: "Spa & Wellness",
        image: IMG + "04-spa-wellness.png",
        text: "L'espace bien-être : éclairage subaquatique de la piscine et plafond étoilé, consigne 28,5 °C (mesuré 28,1 °C).",
        buttons: [
          ["Piscine (Subaquatique)", "Gradation de l'éclairage immergé de 0 à 100 % ; curseur de couleur eau."],
          ["Plafond Étoilé LED", "Gradation du ciel étoilé de 0 à 100 %."],
          ["− / + · Clim · Chaud · Off", "Consigne et mode du spa."],
        ],
      },
      {
        title: "Scénario Cinema",
        image: IMG + "05-scene-cinema.png",
        text: "Les scénarios globaux agissent sur plusieurs pièces à la fois, quelle que soit la pièce affichée. Cinema prépare le salon pour un film.",
        buttons: [
          ["🎬 Cinema", "Lustre Principal à 15 %, Ruban LED à 10 %, Spots à 0 % ; la consigne du salon passe à 21 °C ; la lecture audio démarre sur « Sci-Fi Cinematic Intro » (pochette et titre mis à jour, barre de progression à 35 %)."],
        ],
      },
      {
        title: "Scénario Soirée",
        image: IMG + "06-scene-soiree.png",
        text: "Ambiance festive : lustre éteint, ruban LED et spots à fond, piscine et ciel étoilé à 100 %.",
        buttons: [
          ["🎵 Soirée", "Lustre 0 %, Ruban LED 100 %, Spots 70 %, Piscine 100 %, Plafond étoilé 100 % ; consigne du salon 20 °C ; lecture de « Deep House Summer Session » (Ibiza Club Mix)."],
        ],
      },
      {
        title: "Scénario Nuit",
        image: IMG + "07-scene-nuit.png",
        text: "Extinction douce et mise en sécurité pour la nuit.",
        buttons: [
          ["🌙 Nuit", "Éteint le salon et la cuisine, laisse les lampes de chevet à 10 %, coupe la musique (bouton Play) et arme l'alarme en partiel : la carte Sécurité affiche « Armé partiel (Nuit) » avec le bouclier orange et le bouton Home en surbrillance."],
        ],
      },
      {
        title: "Scénario Éteindre",
        image: IMG + "08-tout-eteindre.png",
        text: "Départ de la villa : tout à zéro et alarme totale.",
        buttons: [
          ["⏻ Éteindre", "Tous les circuits de toutes les pièces à 0 %, arrêt de la musique et armement total : « Armé total (Absent) », bouclier rouge, bouton Away actif."],
        ],
      },
      {
        title: "iPhone — Lumières",
        image: IMG + "09-iphone-lumieres.png",
        portrait: true,
        text: "Sur smartphone, la colonne des espaces devient une rangée de pastilles et les quatre cartes deviennent quatre onglets. Les scénarios globaux ne sont pas proposés sur ce support.",
        buttons: [
          ["Salon · Suite · Cuisine · Spa", "Pastilles de sélection de la pièce ; la pastille active est violette."],
          ["Lumières · Climat · Audio · Sécurité", "Onglets de service : un seul affiché à la fois, l'onglet actif s'allume en vert."],
          ["Curseurs d'éclairage", "Mêmes circuits et mêmes réglages 0–100 % que sur la dalle."],
        ],
      },
      {
        title: "iPhone — Climat",
        image: IMG + "10-iphone-climat.png",
        portrait: true,
        text: "La carte Climatisation en plein écran.",
        buttons: [
          ["− / +", "Consigne par pas de 0,5 °C."],
          ["Clim · Chaud · Off", "Mode du thermostat de la pièce."],
        ],
      },
      {
        title: "iPhone — Audio",
        image: IMG + "11-iphone-audio.png",
        portrait: true,
        text: "Le lecteur audio de la villa.",
        buttons: [
          ["Spotify · AirPlay 2 · Sonos", "Source audio."],
          ["⏮ ▶ ⏭ · Volume", "Transport et volume, identiques à la dalle."],
        ],
      },
      {
        title: "iPhone — Sécurité",
        image: IMG + "12-iphone-securite.png",
        portrait: true,
        text: "Alarme et caméras.",
        buttons: [
          ["Off · Home · Away", "Désarmement, armement partiel, armement total ; le libellé et la couleur du bouclier suivent l'état."],
          ["Jardin · Piscine · Entrée", "Caméra affichée."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Villa Nyon is a single-page residential interface: the four cards of a room (Lighting, Climate, Audio, Security) are always visible, and the room is changed in the left column. The same page is delivered on the Crestron TSW-1070 panel, the iPad and the XPanel; the iPhone rearranges it into tabs. Every command acts immediately, and the state shown (level, setpoint, mode, arming) is the one reported by the processor.",
    sections: [
      {
        title: "Main screen — Salon Lounge",
        image: IMG + "01-accueil-salon.png",
        text: "The header shows the brand, the active room, the weather and the time. On the left, the list of spaces and the four global scenes; in the centre, the four cards of the selected room. The Salon Lounge is displayed at start-up.",
        buttons: [
          ["Salon Lounge · Suite Parentale · Cuisine · Spa & Wellness", "Room selection: the button lights up purple, the room name appears in the header and the Lighting and Climate cards recompute for that room."],
          ["Lustre Principal · Ruban LED RGB · Spots Lectures (sliders)", "0–100 % dimming of each lounge circuit; the percentage on the right follows the slider in real time. The LED strip slider is cyan to stand out."],
          ["Temperature dial", "Requested setpoint in large type (21.5 °C at start) and measured temperature below; the coloured arc represents the setpoint."],
          ["− / +", "Lowers or raises the room setpoint in 0.5 °C steps."],
          ["❄ Clim · 🔥 Chaud · ⏻ Off", "Thermostat mode: the active mode is outlined in blue (cooling), red (heating) or grey (off). Only one mode at a time."],
          ["Spotify · AirPlay 2 · Sonos", "Audio source of the villa; the chosen source is framed in purple."],
          ["Artwork, title, artist", "Current track; the 0:24 / 3:15 bar fills to 35 % while playback is active."],
          ["⏮ ▶ / ⏸ ⏭", "Previous track, play / pause (the centre button turns purple and shows a Pause icon while playing), next track."],
          ["🔊 + 65 % slider", "Audio zone volume."],
          ["Système désarmé / Off · Home · Away", "Alarm state and three arming commands: Off disarms (green shield), Home arms partial “Night” (orange shield), Away arms fully “Absent” (red shield). The active mode button stays highlighted."],
          ["Jardin · Piscine · Entrée", "Camera shown in the viewer; the active tab is underlined in cyan."],
          ["Camera viewer", "Feed of the chosen camera with the REC badge, its identifier (CAM_JARDIN…) and the stream format (H.264, 1080p, 30 FPS)."],
        ],
      },
      { title: "Suite Parentale", image: IMG + "02-suite-parentale.png", text: "The same page for the bedroom: two lighting circuits and a room-specific setpoint (20 °C, measured 19.8 °C). The Audio and Security cards are shared by the whole villa.", buttons: [["Plafonnier · Lampes de chevet", "0–100 % dimming of the two bedroom circuits."], ["− / + · Clim · Chaud · Off", "Bedroom setpoint and mode, independent of the other rooms."]] },
      { title: "Cuisine", image: IMG + "03-cuisine.png", text: "General lighting and bar pendants, setpoint 21 °C.", buttons: [["Général · Suspensions Bar", "0–100 % dimming of the two kitchen circuits."], ["− / + · Clim · Chaud · Off", "Kitchen setpoint and mode."]] },
      { title: "Spa & Wellness", image: IMG + "04-spa-wellness.png", text: "The wellness area: underwater pool lighting and star ceiling, setpoint 28.5 °C (measured 28.1 °C).", buttons: [["Piscine (Subaquatique)", "0–100 % dimming of the underwater lighting; water-coloured slider."], ["Plafond Étoilé LED", "0–100 % dimming of the star ceiling."], ["− / + · Clim · Chaud · Off", "Spa setpoint and mode."]] },
      { title: "Cinema scene", image: IMG + "05-scene-cinema.png", text: "Global scenes act on several rooms at once, whatever room is displayed. Cinema prepares the lounge for a film.", buttons: [["🎬 Cinema", "Main chandelier to 15 %, LED strip to 10 %, spots to 0 %; lounge setpoint to 21 °C; playback starts on “Sci-Fi Cinematic Intro” (artwork and title updated, progress bar at 35 %)."]] },
      { title: "Party scene", image: IMG + "06-scene-soiree.png", text: "Festive mood: chandelier off, LED strip and spots up, pool and star ceiling at 100 %.", buttons: [["🎵 Soirée", "Chandelier 0 %, LED strip 100 %, spots 70 %, pool 100 %, star ceiling 100 %; lounge setpoint 20 °C; plays “Deep House Summer Session” (Ibiza Club Mix)."]] },
      { title: "Night scene", image: IMG + "07-scene-nuit.png", text: "Gentle shut-down and securing for the night.", buttons: [["🌙 Nuit", "Switches off the lounge and kitchen, leaves the bedside lamps at 10 %, stops the music (Play button) and arms the alarm partially: the Security card shows “Armé partiel (Nuit)” with the orange shield and the Home button highlighted."]] },
      { title: "Off scene", image: IMG + "08-tout-eteindre.png", text: "Leaving the villa: everything to zero and full arming.", buttons: [["⏻ Éteindre", "Every circuit of every room to 0 %, music stopped and full arming: “Armé total (Absent)”, red shield, Away button active."]] },
      { title: "iPhone — Lights", image: IMG + "09-iphone-lumieres.png", portrait: true, text: "On a smartphone the spaces column becomes a row of pills and the four cards become four tabs. Global scenes are not offered on this device.", buttons: [["Salon · Suite · Cuisine · Spa", "Room selection pills; the active pill is purple."], ["Lumières · Climat · Audio · Sécurité", "Service tabs: one shown at a time, the active tab lights up green."], ["Lighting sliders", "Same circuits and same 0–100 % adjustment as on the panel."]] },
      { title: "iPhone — Climate", image: IMG + "10-iphone-climat.png", portrait: true, text: "The Climate card full screen.", buttons: [["− / +", "Setpoint in 0.5 °C steps."], ["Clim · Chaud · Off", "Thermostat mode of the room."]] },
      { title: "iPhone — Audio", image: IMG + "11-iphone-audio.png", portrait: true, text: "The villa audio player.", buttons: [["Spotify · AirPlay 2 · Sonos", "Audio source."], ["⏮ ▶ ⏭ · Volume", "Transport and volume, identical to the panel."]] },
      { title: "iPhone — Security", image: IMG + "12-iphone-securite.png", portrait: true, text: "Alarm and cameras.", buttons: [["Off · Home · Away", "Disarm, partial arming, full arming; the label and shield colour follow the state."], ["Jardin · Piscine · Entrée", "Camera displayed."]] },
    ],
  },

  de: {
    intro:
      "Villa Nyon ist eine Wohn-Oberfläche auf einer einzigen Seite: die vier Karten eines Raums (Beleuchtung, Klima, Audio, Sicherheit) sind immer sichtbar, der Raum wird in der linken Spalte gewechselt. Dieselbe Seite läuft auf dem Crestron-Panel TSW-1070, dem iPad und dem XPanel; das iPhone gliedert sie in Reiter. Jeder Befehl wirkt sofort, und der angezeigte Zustand (Niveau, Sollwert, Modus, Scharfschaltung) ist der vom Prozessor gemeldete.",
    sections: [
      {
        title: "Hauptbildschirm — Salon Lounge",
        image: IMG + "01-accueil-salon.png",
        text: "Die Kopfzeile zeigt Marke, aktiven Raum, Wetter und Uhrzeit. Links die Liste der Bereiche und die vier globalen Szenen; in der Mitte die vier Karten des gewählten Raums. Beim Start wird der Salon Lounge angezeigt.",
        buttons: [
          ["Salon Lounge · Suite Parentale · Cuisine · Spa & Wellness", "Raumwahl: die Taste leuchtet violett, der Raumname erscheint in der Kopfzeile, und die Karten Beleuchtung und Klima werden für diesen Raum neu berechnet."],
          ["Lustre Principal · Ruban LED RGB · Spots Lectures (Regler)", "Dimmen jedes Kreises des Salons von 0 bis 100 %; der Prozentwert rechts folgt dem Regler in Echtzeit. Der Regler des LED-Bands ist cyan, um sich abzuheben."],
          ["Temperaturskala", "Gewünschter Sollwert gross (21,5 °C beim Start) und gemessene Temperatur darunter; der farbige Bogen stellt den Sollwert dar."],
          ["− / +", "Senkt oder erhöht den Sollwert des Raums in Schritten von 0,5 °C."],
          ["❄ Clim · 🔥 Chaud · ⏻ Off", "Thermostatmodus: der aktive Modus ist blau (Kühlen), rot (Heizen) oder grau (Aus) umrandet. Nur ein Modus gleichzeitig."],
          ["Spotify · AirPlay 2 · Sonos", "Audioquelle der Villa; die gewählte Quelle ist violett eingerahmt."],
          ["Cover, Titel, Interpret", "Laufender Titel; der Balken 0:24 / 3:15 füllt sich bei aktiver Wiedergabe auf 35 %."],
          ["⏮ ▶ / ⏸ ⏭", "Vorheriger Titel, Wiedergabe / Pause (die mittlere Taste wird violett und zeigt während der Wiedergabe ein Pause-Symbol), nächster Titel."],
          ["🔊 + Regler 65 %", "Lautstärke der Audiozone."],
          ["Système désarmé / Off · Home · Away", "Alarmzustand und drei Schaltbefehle: Off schaltet unscharf (grüner Schild), Home schaltet teilweise scharf „Nacht“ (oranger Schild), Away schaltet voll scharf „Abwesend“ (roter Schild). Die Taste des aktiven Modus bleibt hervorgehoben."],
          ["Jardin · Piscine · Entrée", "Im Viewer angezeigte Kamera; der aktive Reiter ist cyan unterstrichen."],
          ["Kamera-Viewer", "Bild der gewählten Kamera mit REC-Abzeichen, Kennung (CAM_JARDIN…) und Streamformat (H.264, 1080p, 30 FPS)."],
        ],
      },
      { title: "Suite Parentale", image: IMG + "02-suite-parentale.png", text: "Dieselbe Seite für das Schlafzimmer: zwei Lichtkreise und ein raumeigener Sollwert (20 °C, gemessen 19,8 °C). Die Karten Audio und Sicherheit gelten für die ganze Villa.", buttons: [["Plafonnier · Lampes de chevet", "Dimmen der beiden Schlafzimmerkreise von 0 bis 100 %."], ["− / + · Clim · Chaud · Off", "Sollwert und Modus des Schlafzimmers, unabhängig von den anderen Räumen."]] },
      { title: "Cuisine", image: IMG + "03-cuisine.png", text: "Allgemeinbeleuchtung und Barpendel, Sollwert 21 °C.", buttons: [["Général · Suspensions Bar", "Dimmen der beiden Küchenkreise von 0 bis 100 %."], ["− / + · Clim · Chaud · Off", "Sollwert und Modus der Küche."]] },
      { title: "Spa & Wellness", image: IMG + "04-spa-wellness.png", text: "Der Wellnessbereich: Unterwasserlicht des Pools und Sternenhimmel, Sollwert 28,5 °C (gemessen 28,1 °C).", buttons: [["Piscine (Subaquatique)", "Dimmen des Unterwasserlichts von 0 bis 100 %; wasserfarbener Regler."], ["Plafond Étoilé LED", "Dimmen des Sternenhimmels von 0 bis 100 %."], ["− / + · Clim · Chaud · Off", "Sollwert und Modus des Spas."]] },
      { title: "Szene Cinema", image: IMG + "05-scene-cinema.png", text: "Globale Szenen wirken auf mehrere Räume gleichzeitig, unabhängig vom angezeigten Raum. Cinema bereitet den Salon für einen Film vor.", buttons: [["🎬 Cinema", "Hauptleuchter auf 15 %, LED-Band auf 10 %, Spots auf 0 %; Sollwert des Salons auf 21 °C; die Wiedergabe startet mit „Sci-Fi Cinematic Intro“ (Cover und Titel aktualisiert, Fortschrittsbalken bei 35 %)."]] },
      { title: "Szene Soirée", image: IMG + "06-scene-soiree.png", text: "Feststimmung: Leuchter aus, LED-Band und Spots hoch, Pool und Sternenhimmel auf 100 %.", buttons: [["🎵 Soirée", "Leuchter 0 %, LED-Band 100 %, Spots 70 %, Pool 100 %, Sternenhimmel 100 %; Sollwert des Salons 20 °C; spielt „Deep House Summer Session“ (Ibiza Club Mix)."]] },
      { title: "Szene Nuit", image: IMG + "07-scene-nuit.png", text: "Sanftes Abschalten und Sichern für die Nacht.", buttons: [["🌙 Nuit", "Schaltet Salon und Küche aus, lässt die Nachttischlampen auf 10 %, stoppt die Musik (Play-Taste) und schaltet den Alarm teilweise scharf: die Karte Sicherheit zeigt „Armé partiel (Nuit)“ mit orangem Schild und hervorgehobener Home-Taste."]] },
      { title: "Szene Éteindre", image: IMG + "08-tout-eteindre.png", text: "Verlassen der Villa: alles auf null und volle Scharfschaltung.", buttons: [["⏻ Éteindre", "Alle Kreise aller Räume auf 0 %, Musik gestoppt und volle Scharfschaltung: „Armé total (Absent)“, roter Schild, Away-Taste aktiv."]] },
      { title: "iPhone — Licht", image: IMG + "09-iphone-lumieres.png", portrait: true, text: "Auf dem Smartphone wird die Bereichsspalte zu einer Reihe von Pillen und die vier Karten zu vier Reitern. Globale Szenen werden auf diesem Gerät nicht angeboten.", buttons: [["Salon · Suite · Cuisine · Spa", "Pillen zur Raumwahl; die aktive Pille ist violett."], ["Lumières · Climat · Audio · Sécurité", "Dienst-Reiter: nur einer sichtbar, der aktive Reiter leuchtet grün."], ["Lichtregler", "Dieselben Kreise und dieselbe 0–100-%-Einstellung wie auf dem Panel."]] },
      { title: "iPhone — Klima", image: IMG + "10-iphone-climat.png", portrait: true, text: "Die Klimakarte im Vollbild.", buttons: [["− / +", "Sollwert in Schritten von 0,5 °C."], ["Clim · Chaud · Off", "Thermostatmodus des Raums."]] },
      { title: "iPhone — Audio", image: IMG + "11-iphone-audio.png", portrait: true, text: "Der Audioplayer der Villa.", buttons: [["Spotify · AirPlay 2 · Sonos", "Audioquelle."], ["⏮ ▶ ⏭ · Lautstärke", "Transport und Lautstärke, identisch mit dem Panel."]] },
      { title: "iPhone — Sicherheit", image: IMG + "12-iphone-securite.png", portrait: true, text: "Alarm und Kameras.", buttons: [["Off · Home · Away", "Unscharf, teilweise scharf, voll scharf; Beschriftung und Schildfarbe folgen dem Zustand."], ["Jardin · Piscine · Entrée", "Angezeigte Kamera."]] },
    ],
  },
};
