// Fiche détaillée « Chalet Zermatt » : chaque écran du GUI, avec capture et
// explication de chaque bouton. Captures : public/sheets/chalet-zermatt/
// (dalle TSW-1070 et iPhone, simulateur React ChaletZermatt).
const IMG = "/sheets/chalet-zermatt/";

export default {
  fr: {
    intro:
      "Chalet Zermatt est une interface de pilotage à navigation latérale : sept vues (Tableau de bord, Éclairages & DMX, Climatisation, Audio / Vidéo, Volets & Ombrage, Sécurité & Caméras, Spa & Wellness) accessibles depuis un menu fixe à gauche. L'en-tête affiche en permanence l'état de la liaison avec le processeur (CP4-ONLINE), la météo locale et l'heure. Chaque bouton est rattaché à un join Crestron identifié à l'écran ; sur smartphone le menu passe en barre d'onglets basse.",
    sections: [
      {
        title: "Tableau de bord",
        image: IMG + "01-tableau-de-bord.png",
        text:
          "Vue d'accueil : bannière du chalet, quatre scènes rapides et trois cartes de synthèse (statut de la résidence, audio multi-room, caméra du portail).",
        buttons: [
          ["Tableau de Bord · Éclairages & DMX · Climatisation · Audio / Vidéo · Volets & Ombrage · Sécurité & Caméras · Spa & Wellness", "Menu latéral : un appui affiche la vue correspondante, l'entrée active est encadrée de cyan."],
          ["Sélecteur (XPanel / iPad / TS-1070 / Smartphone)", "Liste déroulante de prévisualisation du gabarit d'affichage ; le rendu s'adapte au support choisi."],
          ["CP4-ONLINE (192.168.1.50)", "Indicateur de connexion au processeur Crestron CP4 (point vert)."],
          ["Accueil", "Scène « Lumières 70 %, HVAC 22 °C, Musique douce » : gradateur du salon à 70 %, consigne de la suite à 22 °C, source Apple TV 4K. La carte active se colore en cyan."],
          ["Cinéma", "Salon tamisé à 15 %, source « Apple TV 4K (Dolby Atmos) », ordre de fermeture des volets du salon."],
          ["Soirée", "Couleur d'ambiance RGB violette, volume multi-room à 80 %, consigne du spa à 38 °C."],
          ["Nuit & Départ", "Salon et suite à 0 %, alarme armée : le statut passe en rouge « ARMÉE (TOTAL) »."],
          ["Statut Résidence", "Nombre de zones d'éclairage actives sur 14, thermostat moyen, état de l'alarme (vert désarmée / rouge armée)."],
          ["Volume Zone (curseur)", "Volume du salon panoramique de 0 à 100 % ; la valeur s'affiche en cyan."],
          ["Surveillance Portail", "Flux en direct de la caméra CAM-01 avec indicateur d'enregistrement."],
        ],
      },
      {
        title: "Scène Cinéma",
        image: IMG + "02-scene-cinema.png",
        text: "Après un appui sur Cinéma : la carte de scène s'allume en cyan, la source audio devient « Apple TV 4K (Dolby Atmos) » et l'intensité du salon descend à 15 %.",
        buttons: [
          ["Carte de scène active", "Une seule scène active à la fois ; l'appui sur une autre scène la remplace."],
        ],
      },
      {
        title: "Éclairages & DMX",
        image: IMG + "03-eclairages-dmx.png",
        text: "Trois zones gradables (Salon & Séjour, Suite Royale, Terrasse Alpine) et le sélecteur de couleur DMX de l'éclairage d'ambiance.",
        buttons: [
          ["ON / OFF (par zone)", "Allume ou éteint la zone ; le bouton est cyan quand la zone est allumée et le compteur « Éclairages actifs » du tableau de bord est mis à jour."],
          ["Intensité Lumineuse (Join #1 / #2 / #3)", "Curseur de 0 à 100 % du gradateur de la zone ; la valeur s'affiche à droite."],
          ["Pastilles de couleur (cyan, violet, ambre, vert, rose)", "Sélection de la couleur RGBW envoyée au contrôleur DMX ; la pastille active est cerclée de blanc et le code couleur s'affiche."],
        ],
      },
      {
        title: "Climatisation",
        image: IMG + "04-climatisation.png",
        text: "Deux thermostats : la Suite Royale et l'espace Spa & Wellness, chacun avec son cadran de consigne.",
        buttons: [
          ["− / + (Suite Royale)", "Consigne par pas de 1 °C entre 16 et 30 °C ; le tableau de bord reprend cette valeur comme thermostat moyen."],
          ["− / + (Spa & Wellness)", "Consigne chauffée du spa, par pas de 1 °C entre 16 et 30 °C (cadran ambre)."],
        ],
      },
      {
        title: "Audio / Vidéo",
        image: IMG + "05-audio-video.png",
        text: "Matrice audio-vidéo multi-room : choix de la source et volume de l'amplificateur du home cinéma.",
        buttons: [
          ["Apple TV · Spotify · Kaleidescape · TV Satellite", "Sélection de la source en interlock ; la source active est en cyan et son nom s'inscrit dans la carte Audio multi-room du tableau de bord."],
          ["Volume Amplificateur DM NVX (curseur)", "Volume 0–100 % ; désactivé et affiché « MUTE » quand le son est coupé."],
          ["▶ Play · ⏸ Pause", "Commandes de transport envoyées à la source."],
          ["Mute / Muted", "Coupe ou rétablit le son ; le bouton rouge reste allumé tant que le son est coupé."],
        ],
      },
      {
        title: "Volets & Ombrage",
        image: IMG + "06-volets-ombrage.png",
        text: "Commande des motorisations Somfy RTS / Shade Bus du salon panoramique et de la suite royale.",
        buttons: [
          ["▲ Ouvrir · Stop · ▼ Fermer (Salon Panoramique)", "Montée, arrêt et descente des volets du salon (joins 301–303)."],
          ["▲ Ouvrir · Stop · ▼ Fermer (Suite Royale)", "Montée, arrêt et descente des volets de la suite (joins 304–306)."],
        ],
      },
      {
        title: "Sécurité & Caméras",
        image: IMG + "07-securite-portail.png",
        text: "Contrôle d'accès et alarme. Ici, juste après l'appui sur le portail : un bandeau cyan confirme l'envoi de l'impulsion.",
        buttons: [
          ["Déverrouiller le Portail Principal (Digital Join #40)", "Envoie une impulsion de 3 s au portail ; le bandeau « Signal Crestron Join #40 envoyé… » s'affiche pendant 3,5 s."],
          ["Armer / Désarmer l'Alarme (Digital Join #20)", "Bascule l'alarme : le statut passe de « DÉSARMÉE » (vert) à « ARMÉE (TOTAL) » (rouge) et le bouton rouge reste allumé tant que l'alarme est armée."],
        ],
      },
      {
        title: "Spa & Wellness",
        image: IMG + "08-spa-wellness.png",
        text: "Jacuzzi hydro-massage et sauna nordique, avec leurs températures.",
        buttons: [
          ["Activer Jets", "Marche / arrêt des jets du jacuzzi (bouton cyan quand actif) ; température de l'eau 38,5 °C."],
          ["Chauffe Sauna", "Marche / arrêt de la chauffe du sauna (cible 85 °C)."],
        ],
      },
      {
        title: "iPhone — Tableau de bord",
        image: IMG + "09-iphone-tableau-de-bord.png",
        portrait: true,
        text: "Sur smartphone, l'en-tête se réorganise sur deux lignes, les scènes et les cartes s'empilent en colonne et le menu devient une barre d'onglets défilante en bas d'écran.",
        buttons: [
          ["Barre d'onglets basse", "Mêmes sept vues que sur la dalle ; l'onglet actif est encadré de cyan."],
          ["Scènes rapides", "Identiques à la dalle."],
        ],
      },
      {
        title: "iPhone — Éclairages",
        image: IMG + "10-iphone-eclairages.png",
        portrait: true,
        text: "Les trois zones et le sélecteur DMX en colonne unique.",
        buttons: [
          ["ON / OFF · curseurs · pastilles", "Mêmes fonctions que sur la dalle."],
        ],
      },
    ],
  },

  en: {
    intro:
      "Chalet Zermatt is a side-navigation control interface: seven views (Dashboard, Lighting & DMX, Climate, Audio / Video, Shutters & Shading, Security & Cameras, Spa & Wellness) reached from a fixed left menu. The header permanently shows the link state with the processor (CP4-ONLINE), the local weather and the time. Every button is tied to a Crestron join identified on screen; on a smartphone the menu becomes a bottom tab bar.",
    sections: [
      {
        title: "Dashboard",
        image: IMG + "01-tableau-de-bord.png",
        text: "Home view: chalet banner, four quick scenes and three summary cards (residence status, multi-room audio, gate camera).",
        buttons: [
          ["Tableau de Bord · Éclairages & DMX · Climatisation · Audio / Vidéo · Volets & Ombrage · Sécurité & Caméras · Spa & Wellness", "Side menu: one tap shows the matching view, the active entry is outlined in cyan."],
          ["Selector (XPanel / iPad / TS-1070 / Smartphone)", "Drop-down to preview the display layout; the rendering adapts to the chosen device."],
          ["CP4-ONLINE (192.168.1.50)", "Connection indicator to the Crestron CP4 processor (green dot)."],
          ["Accueil", "“Lights 70 %, HVAC 22 °C, Soft music” scene: lounge dimmer to 70 %, suite setpoint to 22 °C, Apple TV 4K source. The active card turns cyan."],
          ["Cinéma", "Lounge dimmed to 15 %, source “Apple TV 4K (Dolby Atmos)”, close order for the lounge shutters."],
          ["Soirée", "Purple RGB mood colour, multi-room volume to 80 %, spa setpoint to 38 °C."],
          ["Nuit & Départ", "Lounge and suite to 0 %, alarm armed: the status turns red “ARMÉE (TOTAL)”."],
          ["Statut Résidence", "Number of active lighting zones out of 14, average thermostat, alarm state (green disarmed / red armed)."],
          ["Volume Zone (slider)", "Panoramic lounge volume 0–100 %; the value shows in cyan."],
          ["Surveillance Portail", "Live feed of camera CAM-01 with recording indicator."],
        ],
      },
      { title: "Cinema scene", image: IMG + "02-scene-cinema.png", text: "After tapping Cinéma: the scene card lights up cyan, the audio source becomes “Apple TV 4K (Dolby Atmos)” and the lounge level drops to 15 %.", buttons: [["Active scene card", "Only one scene active at a time; tapping another scene replaces it."]] },
      { title: "Lighting & DMX", image: IMG + "03-eclairages-dmx.png", text: "Three dimmable zones (Salon & Séjour, Suite Royale, Terrasse Alpine) and the DMX colour selector of the mood lighting.", buttons: [["ON / OFF (per zone)", "Switches the zone on or off; the button is cyan when the zone is on and the dashboard “Active lights” counter updates."], ["Intensité Lumineuse (Join #1 / #2 / #3)", "0–100 % slider of the zone dimmer; the value shows on the right."], ["Colour dots (cyan, purple, amber, green, pink)", "Selects the RGBW colour sent to the DMX controller; the active dot is ringed in white and the colour code is displayed."]] },
      { title: "Climate", image: IMG + "04-climatisation.png", text: "Two thermostats: the Suite Royale and the Spa & Wellness area, each with its setpoint dial.", buttons: [["− / + (Suite Royale)", "Setpoint in 1 °C steps between 16 and 30 °C; the dashboard shows this value as the average thermostat."], ["− / + (Spa & Wellness)", "Heated spa setpoint, 1 °C steps between 16 and 30 °C (amber dial)."]] },
      { title: "Audio / Video", image: IMG + "05-audio-video.png", text: "Multi-room audio-video matrix: source choice and home-cinema amplifier volume.", buttons: [["Apple TV · Spotify · Kaleidescape · TV Satellite", "Interlocked source selection; the active source is cyan and its name appears in the dashboard Multi-room audio card."], ["Volume Amplificateur DM NVX (slider)", "Volume 0–100 %; disabled and shown as “MUTE” while muted."], ["▶ Play · ⏸ Pause", "Transport commands sent to the source."], ["Mute / Muted", "Mutes or restores the sound; the red button stays lit while muted."]] },
      { title: "Shutters & Shading", image: IMG + "06-volets-ombrage.png", text: "Control of the Somfy RTS / Shade Bus motors of the panoramic lounge and the royal suite.", buttons: [["▲ Ouvrir · Stop · ▼ Fermer (Salon Panoramique)", "Up, stop and down of the lounge shutters (joins 301–303)."], ["▲ Ouvrir · Stop · ▼ Fermer (Suite Royale)", "Up, stop and down of the suite shutters (joins 304–306)."]] },
      { title: "Security & Cameras", image: IMG + "07-securite-portail.png", text: "Access control and alarm. Here, right after tapping the gate: a cyan banner confirms the pulse was sent.", buttons: [["Déverrouiller le Portail Principal (Digital Join #40)", "Sends a 3 s pulse to the gate; the banner “Signal Crestron Join #40 envoyé…” shows for 3.5 s."], ["Armer / Désarmer l'Alarme (Digital Join #20)", "Toggles the alarm: the status goes from “DÉSARMÉE” (green) to “ARMÉE (TOTAL)” (red) and the red button stays lit while armed."]] },
      { title: "Spa & Wellness", image: IMG + "08-spa-wellness.png", text: "Hydro-massage jacuzzi and Nordic sauna, with their temperatures.", buttons: [["Activer Jets", "Jacuzzi jets on / off (cyan button when active); water temperature 38.5 °C."], ["Chauffe Sauna", "Sauna heating on / off (target 85 °C)."]] },
      { title: "iPhone — Dashboard", image: IMG + "09-iphone-tableau-de-bord.png", portrait: true, text: "On a smartphone the header reflows on two lines, scenes and cards stack in a column and the menu becomes a scrolling tab bar at the bottom.", buttons: [["Bottom tab bar", "Same seven views as on the panel; the active tab is outlined in cyan."], ["Quick scenes", "Identical to the panel."]] },
      { title: "iPhone — Lighting", image: IMG + "10-iphone-eclairages.png", portrait: true, text: "The three zones and the DMX selector in a single column.", buttons: [["ON / OFF · sliders · dots", "Same functions as on the panel."]] },
    ],
  },

  de: {
    intro:
      "Chalet Zermatt ist eine Steueroberfläche mit seitlicher Navigation: sieben Ansichten (Dashboard, Licht & DMX, Klima, Audio / Video, Läden & Beschattung, Sicherheit & Kameras, Spa & Wellness), erreichbar über ein festes Menü links. Die Kopfzeile zeigt dauerhaft den Verbindungsstatus zum Prozessor (CP4-ONLINE), das lokale Wetter und die Uhrzeit. Jede Taste ist einem auf dem Bildschirm benannten Crestron-Join zugeordnet; auf dem Smartphone wird das Menü zu einer unteren Reiterleiste.",
    sections: [
      {
        title: "Dashboard",
        image: IMG + "01-tableau-de-bord.png",
        text: "Startansicht: Chalet-Banner, vier Schnellszenen und drei Übersichtskarten (Status des Hauses, Multiroom-Audio, Torkamera).",
        buttons: [
          ["Tableau de Bord · Éclairages & DMX · Climatisation · Audio / Vidéo · Volets & Ombrage · Sécurité & Caméras · Spa & Wellness", "Seitenmenü: ein Tipp zeigt die entsprechende Ansicht, der aktive Eintrag ist cyan umrandet."],
          ["Auswahl (XPanel / iPad / TS-1070 / Smartphone)", "Auswahlliste zur Vorschau des Anzeigelayouts; die Darstellung passt sich dem gewählten Gerät an."],
          ["CP4-ONLINE (192.168.1.50)", "Verbindungsanzeige zum Crestron-Prozessor CP4 (grüner Punkt)."],
          ["Accueil", "Szene „Licht 70 %, HVAC 22 °C, sanfte Musik“: Salon-Dimmer auf 70 %, Sollwert der Suite auf 22 °C, Quelle Apple TV 4K. Die aktive Karte wird cyan."],
          ["Cinéma", "Salon auf 15 % gedimmt, Quelle „Apple TV 4K (Dolby Atmos)“, Schliessbefehl für die Salonläden."],
          ["Soirée", "Violette RGB-Stimmungsfarbe, Multiroom-Lautstärke auf 80 %, Spa-Sollwert auf 38 °C."],
          ["Nuit & Départ", "Salon und Suite auf 0 %, Alarm scharf: der Status wird rot „ARMÉE (TOTAL)“."],
          ["Statut Résidence", "Anzahl aktiver Lichtzonen von 14, mittlerer Thermostat, Alarmzustand (grün unscharf / rot scharf)."],
          ["Volume Zone (Regler)", "Lautstärke des Panoramasalons 0–100 %; der Wert erscheint in Cyan."],
          ["Surveillance Portail", "Livebild der Kamera CAM-01 mit Aufnahmeanzeige."],
        ],
      },
      { title: "Szene Cinéma", image: IMG + "02-scene-cinema.png", text: "Nach dem Tipp auf Cinéma: die Szenenkarte leuchtet cyan, die Audioquelle wird „Apple TV 4K (Dolby Atmos)“ und das Salonniveau sinkt auf 15 %.", buttons: [["Aktive Szenenkarte", "Nur eine Szene gleichzeitig aktiv; ein Tipp auf eine andere Szene ersetzt sie."]] },
      { title: "Licht & DMX", image: IMG + "03-eclairages-dmx.png", text: "Drei dimmbare Zonen (Salon & Séjour, Suite Royale, Terrasse Alpine) und der DMX-Farbwähler der Stimmungsbeleuchtung.", buttons: [["ON / OFF (pro Zone)", "Schaltet die Zone ein oder aus; die Taste ist cyan, wenn die Zone an ist, und der Zähler „Aktive Lichter“ im Dashboard wird aktualisiert."], ["Intensité Lumineuse (Join #1 / #2 / #3)", "Regler 0–100 % des Zonendimmers; der Wert erscheint rechts."], ["Farbpunkte (Cyan, Violett, Bernstein, Grün, Rosa)", "Wählt die an den DMX-Controller gesendete RGBW-Farbe; der aktive Punkt ist weiss umrandet und der Farbcode wird angezeigt."]] },
      { title: "Klima", image: IMG + "04-climatisation.png", text: "Zwei Thermostate: die Suite Royale und der Bereich Spa & Wellness, jeweils mit Sollwertskala.", buttons: [["− / + (Suite Royale)", "Sollwert in 1-°C-Schritten zwischen 16 und 30 °C; das Dashboard zeigt diesen Wert als mittleren Thermostat."], ["− / + (Spa & Wellness)", "Beheizter Spa-Sollwert, 1-°C-Schritte zwischen 16 und 30 °C (bernsteinfarbene Skala)."]] },
      { title: "Audio / Video", image: IMG + "05-audio-video.png", text: "Multiroom-Audio-Video-Matrix: Quellenwahl und Lautstärke des Heimkino-Verstärkers.", buttons: [["Apple TV · Spotify · Kaleidescape · TV Satellite", "Verriegelte Quellenwahl; die aktive Quelle ist cyan und ihr Name erscheint in der Dashboard-Karte Multiroom-Audio."], ["Volume Amplificateur DM NVX (Regler)", "Lautstärke 0–100 %; bei Stummschaltung deaktiviert und als „MUTE“ angezeigt."], ["▶ Play · ⏸ Pause", "Transportbefehle an die Quelle."], ["Mute / Muted", "Schaltet den Ton stumm oder wieder ein; die rote Taste bleibt bei Stummschaltung an."]] },
      { title: "Läden & Beschattung", image: IMG + "06-volets-ombrage.png", text: "Steuerung der Somfy-RTS-/Shade-Bus-Antriebe des Panoramasalons und der königlichen Suite.", buttons: [["▲ Ouvrir · Stop · ▼ Fermer (Salon Panoramique)", "Auf, Stopp und Ab der Salonläden (Joins 301–303)."], ["▲ Ouvrir · Stop · ▼ Fermer (Suite Royale)", "Auf, Stopp und Ab der Suiteläden (Joins 304–306)."]] },
      { title: "Sicherheit & Kameras", image: IMG + "07-securite-portail.png", text: "Zutrittskontrolle und Alarm. Hier direkt nach dem Tipp auf das Tor: ein cyanfarbenes Banner bestätigt den gesendeten Impuls.", buttons: [["Déverrouiller le Portail Principal (Digital Join #40)", "Sendet einen 3-s-Impuls an das Tor; das Banner „Signal Crestron Join #40 envoyé…“ erscheint 3,5 s lang."], ["Armer / Désarmer l'Alarme (Digital Join #20)", "Schaltet den Alarm um: der Status wechselt von „DÉSARMÉE“ (grün) zu „ARMÉE (TOTAL)“ (rot), und die rote Taste bleibt an, solange scharf."]] },
      { title: "Spa & Wellness", image: IMG + "08-spa-wellness.png", text: "Hydromassage-Jacuzzi und nordische Sauna mit ihren Temperaturen.", buttons: [["Activer Jets", "Jacuzzi-Düsen ein / aus (cyanfarbene Taste bei aktiv); Wassertemperatur 38,5 °C."], ["Chauffe Sauna", "Saunaheizung ein / aus (Ziel 85 °C)."]] },
      { title: "iPhone — Dashboard", image: IMG + "09-iphone-tableau-de-bord.png", portrait: true, text: "Auf dem Smartphone bricht die Kopfzeile auf zwei Zeilen um, Szenen und Karten stapeln sich in einer Spalte, und das Menü wird zu einer scrollbaren Reiterleiste unten.", buttons: [["Untere Reiterleiste", "Dieselben sieben Ansichten wie auf dem Panel; der aktive Reiter ist cyan umrandet."], ["Schnellszenen", "Identisch mit dem Panel."]] },
      { title: "iPhone — Licht", image: IMG + "10-iphone-eclairages.png", portrait: true, text: "Die drei Zonen und der DMX-Wähler in einer Spalte.", buttons: [["ON / OFF · Regler · Punkte", "Dieselben Funktionen wie auf dem Panel."]] },
    ],
  },
};
