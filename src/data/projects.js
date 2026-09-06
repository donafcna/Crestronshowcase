// ============================================================================
// SOURCE DE VÉRITÉ DU CONTENU DU SITE
// ----------------------------------------------------------------------------
// Ce fichier est le seul endroit à modifier pour ajouter / retirer / corriger
// un secteur, un support ou un projet. Voir docs/GUIDE-MARKETING.md pour la
// marche à suivre pas à pas (sans connaissance de React).
//
// Chaque projet possède :
//   id            identifiant technique, sans accent ni espace (sert dans l'URL)
//   status        "realisation" (projet réellement livré par Fréquence TV)
//                 ou "concept" (démonstration / étude de style)
//   client        libellé affiché (générique pour les concepts)
//   sectors       liste d'ids de `sectors`
//   devices       liste d'ids de `devices` (ordre = ordre des boutons)
//   year          année affichée
//   thumbnailUrl  vignette (600 px de large environ)
//   text          textes FR / EN / DE : name (facultatif), description
//                 (1 phrase), details (paragraphe), features (liste)
//   isInteractive true = simulateur React ; false = interface CH5 réelle
//                 embarquée via embedUrl / embedPhoneUrl
// ============================================================================

export const sectors = [
  { id: `residentiel`, name: `Résidentiel`, iconName: `Home` },
  { id: `hotellerie`, name: `Hôtellerie`, iconName: `Hotel` },
  { id: `meeting`, name: `Salle de Réunion`, iconName: `Briefcase` },
  { id: `conference`, name: `Salle de Conférence`, iconName: `Tv` },
  { id: `discoteque`, name: `Discothèque`, iconName: `Music` },
  { id: `yacht`, name: `Yacht`, iconName: `Ship` },
  { id: `boutique`, name: `Boutique`, iconName: `ShoppingBag` },
  { id: `restaurant`, name: `Restaurant`, iconName: `Utensils` },
];

// Supports d'affichage. `viewport` fait le lien avec les gabarits physiques
// définis dans devices.js (DEVICES). `simulatorType` est ce que reçoivent les
// simulateurs React (un TSW-1080 affiche la même GUI qu'un TSW-1070, à
// l'échelle 1,5).
export const devices = [
  { id: `xpanel`, name: `Xpanel`, viewport: `desktop`, simulatorType: `desktop`, iconName: `Monitor`,
    label: { fr: `PC / Xpanel`, en: `PC / Xpanel`, de: `PC / Xpanel` } },
  { id: `crestron`, name: `TSW-1070`, viewport: `wallpanel`, simulatorType: `wallpanel`, iconName: `LayoutGrid`,
    label: { fr: `Dalle TSW-1070`, en: `TSW-1070 panel`, de: `TSW-1070 Panel` } },
  { id: `crestron_1080`, name: `TSW-1080`, viewport: `wallpanel_hd`, simulatorType: `wallpanel`, iconName: `LayoutGrid`,
    label: { fr: `Dalle TSW-1080`, en: `TSW-1080 panel`, de: `TSW-1080 Panel` } },
  { id: `ios_tablet`, name: `iPad`, viewport: `tablet`, simulatorType: `tablet`, iconName: `Tablet`,
    label: { fr: `Tablette`, en: `Tablet`, de: `Tablet` } },
  { id: `android_tablet`, name: `Tablette Android`, viewport: `tablet`, simulatorType: `tablet`, iconName: `Tablet`,
    label: { fr: `Tablette`, en: `Tablet`, de: `Tablet` } },
  { id: `ios_phone`, name: `iPhone`, viewport: `phone`, simulatorType: `phone`, iconName: `Smartphone`,
    label: { fr: `Smartphone`, en: `Smartphone`, de: `Smartphone` } },
  { id: `android_phone`, name: `Smartphone Android`, viewport: `phone`, simulatorType: `phone`, iconName: `Smartphone`,
    label: { fr: `Smartphone`, en: `Smartphone`, de: `Smartphone` } },
];

export const PROJECT_STATUS = {
  realisation: { fr: `Réalisation Fréquence TV`, en: `Delivered by Fréquence TV`, de: `Realisiert von Fréquence TV` },
  concept: { fr: `Concept de démonstration`, en: `Demo concept`, de: `Demo-Konzept` },
};

export const projects = [
  {
    id: `villa-gemini-frequencetv`,
    name: `Villa Crans-Montana`,
    status: `realisation`,
    client: `Propriétaire privé`,
    sectors: [`residentiel`],
    devices: [`crestron`, `crestron_1080`, `ios_tablet`, `ios_phone`],
    isInteractive: false,
    embedUrl: `/showcases/villa-gemini-frequencetv/index.html`,
    embedPhoneUrl: `/showcases/villa-gemini-frequencetv/iphone.html`,
    thumbnailUrl: `https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80`,
    year: `2025`,
    text: {
      fr: {
        description: `L'interface Crestron CH5 réellement livrée par Fréquence TV pour une villa à Crans-Montana.`,
        details: `Ce projet présente l'intégration réelle réalisée par Fréquence TV pour le pilotage domotique d'une villa à Crans-Montana. L'interface exploite pleinement les contrôles HTML5 de Crestron (CH5). Elle permet le pilotage des éclairages, des scénarios de vie, de la sonorisation multi-zones et de la climatisation. Une version est dédiée aux dalles murales et tablettes, une autre aux smartphones.`,
        features: [
          `Interface CH5 originale, livrée et en service`,
          `Version dalle Crestron TSW-1070 / TSW-1080 et iPad`,
          `Version smartphone dédiée`,
          `Pilotage domotique KNX / Crestron complet`,
          `Icônes et thèmes graphiques sur mesure`,
        ],
      },
      en: {
        description: `The Crestron CH5 interface actually delivered by Fréquence TV for a villa in Crans-Montana.`,
        details: `This project shows the real integration delivered by Fréquence TV to control a villa in Crans-Montana. The interface makes full use of Crestron's HTML5 controls (CH5): lighting, living scenes, multi-zone audio and climate. One layout is dedicated to wall panels and tablets, another to smartphones.`,
        features: [
          `Original CH5 interface, delivered and in daily use`,
          `Crestron TSW-1070 / TSW-1080 panel and iPad layout`,
          `Dedicated smartphone layout`,
          `Full KNX / Crestron home-automation control`,
          `Custom icon set and graphic themes`,
        ],
      },
      de: {
        description: `Die von Fréquence TV tatsächlich gelieferte Crestron-CH5-Oberfläche für eine Villa in Crans-Montana.`,
        details: `Dieses Projekt zeigt die reale Integration, die Fréquence TV für die Steuerung einer Villa in Crans-Montana umgesetzt hat. Die Oberfläche nutzt die HTML5-Steuerelemente von Crestron (CH5) vollständig: Beleuchtung, Wohnszenen, Mehrzonen-Audio und Klima. Ein Layout ist für Wandpanels und Tablets, ein weiteres für Smartphones ausgelegt.`,
        features: [
          `Originale CH5-Oberfläche, geliefert und im täglichen Einsatz`,
          `Layout für Crestron TSW-1070 / TSW-1080 und iPad`,
          `Eigenes Smartphone-Layout`,
          `Vollständige KNX-/Crestron-Gebäudesteuerung`,
          `Massgeschneiderte Icons und Grafikthemen`,
        ],
      },
    },
  },
  {
    id: `villa-gemini`,
    name: `Villa Nyon`,
    status: `concept`,
    client: `Résidence privée`,
    sectors: [`residentiel`],
    devices: [`ios_phone`, `ios_tablet`, `xpanel`, `crestron`, `crestron_1080`],
    isInteractive: true,
    interactiveComponent: `villa-gemini`,
    thumbnailUrl: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Domotique complète de prestige avec interfaces sur mesure pour iPhone, iPad, Xpanel et dalle murale.`,
        details: `Le concept "Villa Nyon" incarne la maison connectée haut de gamme. L'ensemble du système est piloté par un processeur Crestron 4-Series. L'utilisateur bénéficie d'un contrôle fluide de l'éclairage, de la climatisation par zone, de la sonorisation multi-pièces, du home cinéma, des stores motorisés et de la surveillance (caméras IP, alarme). Les interfaces partagent une charte épurée avec effets de transparence et de flou de verre.`,
        features: [
          `Éclairage avec variation fine (DALI / KNX)`,
          `Climatisation et chauffage au sol avec thermostat virtuel`,
          `Audio multi-zones AirPlay 2 et Sonos`,
          `Caméras de sécurité en streaming H.264`,
          `Scénarios de vie (Arrivée, Cinéma, Nuit)`,
          `Retour d'état bidirectionnel instantané`,
        ],
      },
      en: {
        description: `Complete high-end home automation with custom interfaces for iPhone, iPad, Xpanel and wall panel.`,
        details: `The "Villa Nyon" concept embodies the premium connected home. The whole system runs on a Crestron 4-Series processor. Users get seamless control of lighting, zoned climate, multi-room audio, home cinema, motorised blinds and security (IP cameras, alarm). All interfaces share a clean design language with transparency and frosted-glass effects.`,
        features: [
          `Precision lighting dimming (DALI / KNX)`,
          `HVAC and underfloor heating with virtual thermostats`,
          `AirPlay 2 and Sonos multi-zone audio`,
          `H.264 security camera streaming`,
          `Living scenes (Welcome, Movie, Night)`,
          `Instant two-way status feedback`,
        ],
      },
      de: {
        description: `Komplette Premium-Hausautomation mit massgeschneiderten Oberflächen für iPhone, iPad, Xpanel und Wandpanel.`,
        details: `Das Konzept "Villa Nyon" steht für das vernetzte Zuhause der Spitzenklasse. Das gesamte System läuft auf einem Crestron-4-Series-Prozessor. Beleuchtung, Zonenklima, Multiroom-Audio, Heimkino, Motorjalousien und Sicherheit (IP-Kameras, Alarm) lassen sich nahtlos steuern. Alle Oberflächen teilen eine klare Designsprache mit Transparenz- und Milchglaseffekten.`,
        features: [
          `Feinstufiges Dimmen (DALI / KNX)`,
          `Klima und Fussbodenheizung mit virtuellen Thermostaten`,
          `AirPlay-2- und Sonos-Mehrzonen-Audio`,
          `H.264-Streaming der Sicherheitskameras`,
          `Wohnszenen (Ankunft, Kino, Nacht)`,
          `Sofortige bidirektionale Rückmeldung`,
        ],
      },
    },
  },
  {
    id: `crestron-home`,
    name: `Crestron Home`,
    status: `concept`,
    client: `Application Crestron Home OS`,
    sectors: [`residentiel`],
    devices: [`ios_phone`, `ios_tablet`, `xpanel`, `crestron`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Simulation interactive de l'application Crestron Home OS pour le pilotage résidentiel.`,
        details: `Une réplique interactive de l'application Crestron Home. Elle permet la gestion complète de la maison : navigation par pièces ou favoris, commande des éclairages et occultants, contrôle des thermostats multizones, accès sécurisés (garage, portails) et panneau de sécurité avec pavé numérique.`,
        features: [
          `Ergonomie de l'application Crestron Home OS`,
          `Tableau de bord interactif (piscine, spa, garage)`,
          `Clavier de sécurité avec code d'armement (code : 1234)`,
          `Réglage des thermostats par pièce`,
          `Navigation fluide par pièces et scénarios`,
        ],
      },
      en: {
        description: `Interactive simulation of the Crestron Home OS app for residential control.`,
        details: `An interactive replica of the Crestron Home app: room and favourite navigation, lighting and shade control, multi-zone thermostats, secure access (garage, gates) and a security panel with keypad.`,
        features: [
          `Crestron Home OS app ergonomics`,
          `Interactive dashboard (pool, spa, garage)`,
          `Security keypad with arming code (code: 1234)`,
          `Per-room thermostat adjustment`,
          `Smooth navigation by rooms and scenes`,
        ],
      },
      de: {
        description: `Interaktive Simulation der Crestron-Home-OS-App für die Wohnhaussteuerung.`,
        details: `Eine interaktive Nachbildung der Crestron-Home-App: Navigation nach Räumen oder Favoriten, Steuerung von Licht und Beschattung, Mehrzonen-Thermostate, gesicherte Zugänge (Garage, Tore) und ein Sicherheitspanel mit Tastenfeld.`,
        features: [
          `Bedienlogik der Crestron-Home-OS-App`,
          `Interaktives Dashboard (Pool, Spa, Garage)`,
          `Sicherheitstastatur mit Scharfschaltcode (Code: 1234)`,
          `Thermostatregelung pro Raum`,
          `Flüssige Navigation nach Räumen und Szenen`,
        ],
      },
    },
  },
  {
    id: `chalet-zermatt`,
    name: `Chalet Zermatt`,
    status: `concept`,
    client: `Résidence de montagne`,
    sectors: [`residentiel`],
    devices: [`ios_phone`, `ios_tablet`, `crestron`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Régulation climatique avancée, gestion de spa / piscine et domotique haut de gamme pour chalet d'exception.`,
        details: `Face au Cervin, ce chalet de cinq étages dispose d'une automatisation complète. L'interface gère les spas intérieurs et extérieurs (température, jets, éclairage subaquatique), la couverture de piscine motorisée, le déneigement automatique de la rampe d'accès et le climat intérieur par poêle de masse et géothermie.`,
        features: [
          `Contrôle complet de spa et piscine (filtration, chauffage, LED)`,
          `Déneigement automatisé des rampes selon la météo`,
          `Chauffage géothermique et dalles chauffantes régulés`,
          `Audio Sonos multi-zones`,
          `Accès biométrique et portails motorisés`,
        ],
      },
      en: {
        description: `Advanced climate control, spa / pool management and premium home automation for an exceptional chalet.`,
        details: `Facing the Matterhorn, this five-storey chalet is fully automated. The interface manages indoor and outdoor spas (temperature, jets, underwater lighting), the motorised pool cover, automatic snow-melting of the driveway and indoor climate via masonry heater and geothermal heating.`,
        features: [
          `Full spa and pool control (filtration, heating, LED)`,
          `Weather-driven automatic driveway snow melting`,
          `Regulated geothermal and underfloor heating`,
          `Sonos multi-zone audio`,
          `Biometric access and motorised gates`,
        ],
      },
      de: {
        description: `Fortschrittliche Klimaregelung, Spa-/Pool-Management und Premium-Hausautomation für ein aussergewöhnliches Chalet.`,
        details: `Mit Blick auf das Matterhorn ist dieses fünfstöckige Chalet vollständig automatisiert. Die Oberfläche steuert Innen- und Aussen-Spas (Temperatur, Düsen, Unterwasserlicht), die motorisierte Poolabdeckung, die automatische Schneeschmelze der Zufahrt sowie das Raumklima über Speicherofen und Erdwärme.`,
        features: [
          `Komplette Spa- und Poolsteuerung (Filter, Heizung, LED)`,
          `Wettergesteuerte Schneeschmelze der Zufahrt`,
          `Geregelte Erdwärme- und Fussbodenheizung`,
          `Sonos-Mehrzonen-Audio`,
          `Biometrischer Zugang und Motortore`,
        ],
      },
    },
  },
  {
    id: `yacht-monaco`,
    name: `MY Sunrise`,
    status: `concept`,
    client: `Armateur privé`,
    sectors: [`yacht`],
    devices: [`ios_tablet`, `xpanel`, `crestron`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Interface haut de gamme pour le pilotage de la domotique à bord d'un superyacht.`,
        details: `Cette interface reproduit un système Crestron CH5 embarqué sur un superyacht. Elle gère l'ambiance musicale du bord (Party Mode avec volumes multi-zones et subwoofer) et lance des scénarios de jeux de lumières spectaculaires (projecteurs asservis, machines à fumée, dimmer et vitesse) sur le Sundeck, le Music Deck et le Music Salon.`,
        features: [
          `Audio multi-zones Party Mode`,
          `Jeux de lumières asservis façon discothèque`,
          `Colorations dynamiques de la coque et du mât`,
          `Machines à fumée et dimmers`,
          `Scénarios chromatiques et presets`,
        ],
      },
      en: {
        description: `Premium interface for on-board automation control of a superyacht.`,
        details: `This interface reproduces a Crestron CH5 system aboard a superyacht. It manages the on-board music mood (Party Mode with multi-zone volumes and subwoofer) and launches spectacular light shows (moving heads, fog machines, dimmer and speed) on the Sundeck, Music Deck and Music Salon.`,
        features: [
          `Party Mode multi-zone audio`,
          `Club-style moving-head light shows`,
          `Dynamic hull and mast colouring`,
          `Fog machines and dimmers`,
          `Colour scenes and presets`,
        ],
      },
      de: {
        description: `Premium-Oberfläche für die Bordautomation einer Superyacht.`,
        details: `Diese Oberfläche bildet ein Crestron-CH5-System an Bord einer Superyacht nach. Sie steuert die Musikstimmung (Party-Modus mit Mehrzonen-Lautstärke und Subwoofer) und startet spektakuläre Lichtshows (Moving Heads, Nebelmaschinen, Dimmer und Geschwindigkeit) auf Sonnendeck, Musikdeck und Musiksalon.`,
        features: [
          `Party-Modus mit Mehrzonen-Audio`,
          `Lichtshows mit Moving Heads`,
          `Dynamische Rumpf- und Mastbeleuchtung`,
          `Nebelmaschinen und Dimmer`,
          `Farbszenen und Presets`,
        ],
      },
    },
  },
  {
    id: `hotel-geneva`,
    name: `Palace 5* Genève`,
    status: `concept`,
    client: `Hôtel de luxe (concept)`,
    sectors: [`hotellerie`],
    devices: [`xpanel`, `crestron`, `ios_tablet`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80`,
    year: `2025`,
    text: {
      fr: {
        description: `Supervision de 120 chambres et suites inspirée du tableau de bord d'administration Crestron.`,
        details: `Interface d'administration et de commande globale pour un palace genevois. Elle permet la supervision en direct de la température, du statut CVC, de la ventilation, de l'humidité et de l'occupation de chaque chambre, ainsi que le contrôle direct des éclairages et des rideaux motorisés.`,
        features: [
          `Supervision de l'occupation et des alertes`,
          `Éclairage multizone et gradation par pièce`,
          `Commande des rideaux motorisés`,
          `Suivi des mises à jour firmware`,
          `Filtres avancés par numéro de chambre`,
          `Serrures connectées`,
        ],
      },
      en: {
        description: `Supervision of 120 rooms and suites inspired by the Crestron administration dashboard.`,
        details: `Global administration and control interface for a Geneva palace hotel. It provides live supervision of temperature, HVAC status, ventilation, humidity and occupancy for every room, plus direct control of lighting and motorised curtains.`,
        features: [
          `Occupancy and alert supervision`,
          `Multi-zone lighting and per-room dimming`,
          `Motorised curtain control`,
          `Firmware update tracking`,
          `Advanced filters by room number`,
          `Connected door locks`,
        ],
      },
      de: {
        description: `Überwachung von 120 Zimmern und Suiten, inspiriert vom Crestron-Administrations-Dashboard.`,
        details: `Globale Administrations- und Steueroberfläche für ein Genfer Luxushotel. Sie bietet Live-Überwachung von Temperatur, HLK-Status, Lüftung, Luftfeuchtigkeit und Belegung jedes Zimmers sowie die direkte Steuerung von Beleuchtung und Motorvorhängen.`,
        features: [
          `Belegungs- und Alarmüberwachung`,
          `Mehrzonen-Beleuchtung und Dimmen pro Raum`,
          `Steuerung der Motorvorhänge`,
          `Firmware-Update-Verfolgung`,
          `Erweiterte Filter nach Zimmernummer`,
          `Vernetzte Türschlösser`,
        ],
      },
    },
  },
  {
    id: `boardroom-futureav`,
    name: `Boardroom Siège`,
    status: `concept`,
    client: `Siège d'entreprise (concept)`,
    sectors: [`meeting`],
    devices: [`crestron`, `crestron_1080`, `xpanel`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80`,
    year: `2025`,
    text: {
      fr: {
        description: `Gestion de salle de conseil avec automatisation des caméras de visioconférence et routage des micros.`,
        details: `Conçu pour les salles de réunion exécutives, ce système centralise le contrôle sur dalle tactile Crestron et un Xpanel d'administration. Lors d'un appel Teams ou Zoom, les caméras s'orientent automatiquement vers l'orateur grâce au tracking des micros de table. Le partage d'écran sans fil et le routage des matrices de présentation sont automatisés.`,
        features: [
          `Intégration native Microsoft Teams Rooms`,
          `Tracking caméra automatique par faisceau micro`,
          `Routage vidéo 4K HDR via Crestron DM-NVX`,
          `Écran motorisé et stores occultants`,
          `Affichage d'occupation de salle`,
        ],
      },
      en: {
        description: `Boardroom management with automated video-conference cameras and microphone routing.`,
        details: `Designed for executive meeting rooms, this system centralises control on a Crestron touch panel and an admin Xpanel. During a Teams or Zoom call, cameras automatically frame the active speaker thanks to table-microphone tracking. Wireless screen sharing and presentation matrix routing are automated.`,
        features: [
          `Native Microsoft Teams Rooms integration`,
          `Automatic camera tracking by microphone beam`,
          `4K HDR video routing via Crestron DM-NVX`,
          `Motorised screen and blackout blinds`,
          `Room occupancy display`,
        ],
      },
      de: {
        description: `Sitzungszimmer-Management mit automatisierten Videokonferenz-Kameras und Mikrofon-Routing.`,
        details: `Für Executive-Sitzungsräume konzipiert, bündelt dieses System die Steuerung auf einem Crestron-Touchpanel und einem Admin-Xpanel. Während eines Teams- oder Zoom-Anrufs richten sich die Kameras dank Tischmikrofon-Tracking automatisch auf den Sprecher aus. Kabelloses Screen-Sharing und Matrix-Routing laufen automatisch.`,
        features: [
          `Native Microsoft-Teams-Rooms-Integration`,
          `Automatisches Kamera-Tracking per Mikrofonstrahl`,
          `4K-HDR-Videorouting über Crestron DM-NVX`,
          `Motorleinwand und Verdunkelung`,
          `Raumbelegungsanzeige`,
        ],
      },
    },
  },
  {
    id: `auditorium-richmond`,
    name: `Auditorium 1000 places`,
    status: `concept`,
    client: `Campus universitaire (concept)`,
    sectors: [`conference`],
    devices: [`crestron`, `crestron_1080`, `xpanel`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80`,
    year: `2024`,
    text: {
      fr: {
        description: `Régie technique pour grands auditoriums avec routage audio / vidéo complexe.`,
        details: `Un environnement technique exigeant une interface robuste pour les ingénieurs du son et techniciens. Le système contrôle les projecteurs scéniques, les caméras PTZ, la console Dante et la diffusion sur écran LED géant. Un mode "Enseignant" simplifié est disponible sur un écran secondaire.`,
        features: [
          `Réseau audio Dante pour 64 micros`,
          `Pilotage de 4 caméras PTZ avec presets`,
          `Éclairage de scène DMX / Art-Net`,
          `Console d'administration Xpanel en régie`,
          `Enregistrement et streaming en un clic`,
        ],
      },
      en: {
        description: `Technical control room for large auditoriums with complex audio / video routing.`,
        details: `A demanding technical environment needing a robust interface for sound engineers and technicians. The system controls stage projectors, PTZ cameras, the Dante console and playback on a giant LED screen. A simplified "Teacher" mode is available on a secondary screen.`,
        features: [
          `Dante audio network for 64 microphones`,
          `4 PTZ cameras with presets`,
          `DMX / Art-Net stage lighting`,
          `Xpanel admin console in the control room`,
          `One-click recording and streaming`,
        ],
      },
      de: {
        description: `Technische Regie für grosse Auditorien mit komplexem Audio-/Video-Routing.`,
        details: `Ein anspruchsvolles technisches Umfeld, das eine robuste Oberfläche für Tontechniker verlangt. Das System steuert Bühnenprojektoren, PTZ-Kameras, das Dante-Pult und die Wiedergabe auf einer riesigen LED-Wand. Ein vereinfachter "Dozenten"-Modus steht auf einem Zweitbildschirm bereit.`,
        features: [
          `Dante-Audionetz für 64 Mikrofone`,
          `4 PTZ-Kameras mit Presets`,
          `DMX-/Art-Net-Bühnenlicht`,
          `Xpanel-Admin-Konsole in der Regie`,
          `Aufnahme und Streaming mit einem Klick`,
        ],
      },
    },
  },
  {
    id: `club-etoile`,
    name: `Club L'Étoile`,
    status: `concept`,
    client: `Établissement de nuit (concept)`,
    sectors: [`discoteque`],
    devices: [`ios_tablet`, `xpanel`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80`,
    year: `2024`,
    text: {
      fr: {
        description: `Supervision et contrôle pour discothèque : climatisation de zone, sonorisation et flux caméras.`,
        details: `Pour cet établissement de nuit, l'interface offre au régisseur et au gérant un contrôle centralisé. L'accent est mis sur la climatisation intensive (régulation selon l'affluence), le volume des différents bars et du dancefloor (avec limiteurs dB) et l'affichage des caméras de sécurité sur un Xpanel dédié.`,
        features: [
          `Régulation HVAC asservie à l'affluence`,
          `Limiteur de volume de sécurité multi-zones`,
          `Éclairages architecturaux d'ambiance et secours`,
          `Grille de caméras IP temps réel`,
          `Machines à fumée et effets à distance`,
        ],
      },
      en: {
        description: `Nightclub supervision and control: zoned climate, sound system and camera feeds.`,
        details: `For this nightclub, the interface gives the stage manager and owner centralised control. The focus is on intensive climate control (regulated by attendance), the volume of each bar and the dance floor (with dB limiters) and security camera display on a dedicated Xpanel.`,
        features: [
          `Attendance-driven HVAC regulation`,
          `Multi-zone safety volume limiter`,
          `Architectural mood and emergency lighting`,
          `Real-time IP camera grid`,
          `Remote fog machines and effects`,
        ],
      },
      de: {
        description: `Überwachung und Steuerung für Diskotheken: Zonenklima, Beschallung und Kamerabilder.`,
        details: `Für diesen Nachtclub bietet die Oberfläche Betreiber und Regie eine zentrale Steuerung. Im Fokus stehen die intensive Klimatisierung (geregelt nach Besucherzahl), die Lautstärke der Bars und der Tanzfläche (mit dB-Limitern) sowie die Anzeige der Sicherheitskameras auf einem eigenen Xpanel.`,
        features: [
          `Besucherabhängige HLK-Regelung`,
          `Mehrzonen-Sicherheitslimiter`,
          `Architektur- und Notbeleuchtung`,
          `IP-Kameraraster in Echtzeit`,
          `Nebelmaschinen und Effekte aus der Ferne`,
        ],
      },
    },
  },
  {
    id: `boutique-hermes`,
    name: `Boutique Luxe Genève`,
    status: `concept`,
    client: `Maison de luxe (concept)`,
    sectors: [`boutique`],
    devices: [`crestron`, `ios_tablet`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80`,
    year: `2025`,
    text: {
      fr: {
        description: `Éclairage circadien et ambiance olfactive / sonore pour showroom haut de gamme.`,
        details: `Cette boutique de luxe utilise des drivers LED Tunable White (DALI Type 8) pour reproduire la lumière naturelle du jour en magasin, d'un blanc chaud le matin à un blanc froid à midi. Le personnel dispose d'une interface simplifiée sur iPad pour modifier l'ambiance selon les saisons ou lors de soirées privées.`,
        features: [
          `Régulation circadienne de l'éclairage (Tunable White)`,
          `Musiques d'ambiance multi-zones`,
          `Diffuseurs de parfum automatisés`,
          `Scénarios de vitrines par horloge astronomique`,
          `Alertes techniques (inondation, surchauffe)`,
        ],
      },
      en: {
        description: `Circadian lighting and scent / sound ambience for a high-end showroom.`,
        details: `This luxury boutique uses Tunable White LED drivers (DALI Type 8) to reproduce natural daylight in store, from warm white in the morning to cool white at noon. Staff have a simplified iPad interface to change the mood by season or for private events.`,
        features: [
          `Circadian lighting regulation (Tunable White)`,
          `Multi-zone background music`,
          `Automated scent diffusers`,
          `Window scenes driven by astronomical clock`,
          `Technical alerts (flood, overheating)`,
        ],
      },
      de: {
        description: `Zirkadiane Beleuchtung sowie Duft- und Klangstimmung für einen Premium-Showroom.`,
        details: `Diese Luxusboutique nutzt Tunable-White-LED-Treiber (DALI Typ 8), um das natürliche Tageslicht im Laden nachzubilden – von Warmweiss am Morgen bis Kaltweiss am Mittag. Das Personal verfügt über eine vereinfachte iPad-Oberfläche, um die Stimmung je nach Saison oder für private Events zu ändern.`,
        features: [
          `Zirkadiane Lichtregelung (Tunable White)`,
          `Mehrzonen-Hintergrundmusik`,
          `Automatisierte Duftspender`,
          `Schaufensterszenen per astronomischer Uhr`,
          `Technische Alarme (Wasser, Überhitzung)`,
        ],
      },
    },
  },
  {
    id: `sushi-bar-kyoto`,
    name: `Sushi Bar Kyoto`,
    status: `concept`,
    client: `Restaurant gastronomique (concept)`,
    sectors: [`restaurant`, `boutique`],
    devices: [`android_tablet`, `crestron`],
    isInteractive: true,
    thumbnailUrl: `https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80`,
    year: `2025`,
    text: {
      fr: {
        description: `Ambiances d'éclairage par table, ventilation de cuisine et sélection musicale zonée.`,
        details: `Dans ce restaurant japonais haut de gamme, le personnel contrôle facilement l'ambiance générale. L'éclairage de chaque table peut être adapté aux couples ou aux groupes. La cuisine ouverte dispose de variateurs pour les hottes afin de minimiser le bruit en salle tout en assurant l'extraction.`,
        features: [
          `Éclairage précis par table (luminosité, température)`,
          `Audio multi-zones (bar, salle, salon privé)`,
          `Hotte d'extraction et apport d'air neuf asservis`,
          `Mode Service pour appeler le sommelier`,
          `Extinction centralisée en fin de service`,
        ],
      },
      en: {
        description: `Per-table lighting moods, kitchen ventilation and zoned music selection.`,
        details: `In this high-end Japanese restaurant, staff easily control the overall mood. Each table's lighting can be adapted to couples or groups. The open kitchen has variable-speed hoods to minimise dining-room noise while ensuring extraction.`,
        features: [
          `Precise per-table lighting (brightness, colour temperature)`,
          `Multi-zone audio (bar, dining room, private lounge)`,
          `Controlled extraction hood and fresh-air supply`,
          `Service mode to call the sommelier`,
          `Centralised shutdown at end of service`,
        ],
      },
      de: {
        description: `Lichtstimmungen pro Tisch, Küchenlüftung und zonierte Musikauswahl.`,
        details: `In diesem gehobenen japanischen Restaurant steuert das Personal die Gesamtstimmung mühelos. Die Beleuchtung jedes Tisches lässt sich an Paare oder Gruppen anpassen. Die offene Küche verfügt über regelbare Hauben, um den Lärm im Gastraum zu minimieren und dennoch abzusaugen.`,
        features: [
          `Präzises Licht pro Tisch (Helligkeit, Farbtemperatur)`,
          `Mehrzonen-Audio (Bar, Gastraum, Séparée)`,
          `Geregelte Abzugshaube und Frischluftzufuhr`,
          `Service-Modus zum Rufen des Sommeliers`,
          `Zentrales Abschalten nach Dienstschluss`,
        ],
      },
    },
  },
  {
    id: `home-cinema-cologny`,
    name: `Home Cinéma Cologny`,
    status: `concept`,
    client: `Salle de cinéma privée`,
    sectors: [`residentiel`],
    devices: [`crestron`, `ios_tablet`, `ios_phone`],
    isInteractive: true,
    interactiveComponent: `home-cinema-cologny`,
    thumbnailUrl: `https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Salle de cinéma dédiée : activités en un geste, projecteur laser 4K, masquage d'écran, éclairage d'ambiance, audio Atmos et sièges motorisés.`,
        details: `Sept fauteuils, un projecteur laser 4K, un écran acoustiquement transparent avec masquage motorisé 16:9 / 2.39 et un processeur Dolby Atmos 9.4.6. L'interface réunit tout ce qu'il faut pour une soirée : les activités (Film, Sport, Concert, Jeux) préparent la salle en un appui — source, projecteur, masquage, mode sonore et lumières — puis chaque détail reste ajustable : quatre zones d'éclairage graduées, molette de volume, niveau du caisson, inclinaison et chauffage de chaque siège.`,
        features: [
          `Activités en un appui (Film, Sport, Concert, Jeux, Tout éteindre)`,
          `Projecteur laser 4K avec préchauffage et mémoires optiques`,
          `Masquage d'écran motorisé 16:9 / 2.39`,
          `Quatre zones d'éclairage graduées (ambiance, marches, appliques, ciel étoilé)`,
          `Audio Dolby Atmos / DTS:X, volume et caisson`,
          `Fauteuils motorisés : inclinaison et chauffage par siège`,
        ],
      },
      en: {
        description: `Dedicated cinema room: one-touch activities, 4K laser projector, screen masking, ambience lighting, Atmos audio and motorised seats.`,
        details: `Seven recliners, a 4K laser projector, an acoustically transparent screen with motorised 16:9 / 2.39 masking and a Dolby Atmos 9.4.6 processor. The interface gathers everything needed for a movie night: activities (Movie, Sports, Concert, Gaming) prepare the room in one tap — source, projector, masking, sound mode and lights — and every detail stays adjustable: four dimmable lighting zones, a volume dial, subwoofer trim, recline and heating for each seat.`,
        features: [
          `One-tap activities (Movie, Sports, Concert, Gaming, All off)`,
          `4K laser projector with warm-up and lens memories`,
          `Motorised 16:9 / 2.39 screen masking`,
          `Four dimmable lighting zones (ambience, steps, sconces, star ceiling)`,
          `Dolby Atmos / DTS:X audio, volume and subwoofer`,
          `Motorised recliners: recline and heating per seat`,
        ],
      },
      de: {
        description: `Dediziertes Heimkino: Aktivitäten per Fingertipp, 4K-Laserprojektor, Leinwandmaskierung, Ambientelicht, Atmos-Audio und Motorsitze.`,
        details: `Sieben Sessel, ein 4K-Laserprojektor, eine akustisch transparente Leinwand mit motorisierter 16:9-/2.39-Maskierung und ein Dolby-Atmos-9.4.6-Prozessor. Die Oberfläche bündelt alles für den Filmabend: Aktivitäten (Film, Sport, Konzert, Gaming) bereiten den Saal mit einem Tipp vor — Quelle, Projektor, Maskierung, Klangmodus und Licht — und jedes Detail bleibt einstellbar: vier dimmbare Lichtzonen, Lautstärkerad, Subwoofer-Pegel, Neigung und Heizung jedes Sitzes.`,
        features: [
          `Aktivitäten per Tipp (Film, Sport, Konzert, Gaming, Alles aus)`,
          `4K-Laserprojektor mit Aufwärmphase und Objektivspeichern`,
          `Motorisierte Leinwandmaskierung 16:9 / 2.39`,
          `Vier dimmbare Lichtzonen (Ambiente, Stufen, Wandleuchten, Sternenhimmel)`,
          `Dolby Atmos / DTS:X, Lautstärke und Subwoofer`,
          `Motorsessel: Neigung und Heizung pro Sitz`,
        ],
      },
    },
  },
  {
    id: `huddle-room-nyon`,
    name: `Huddle Room Nyon`,
    status: `concept`,
    client: `Nyon Innovation Hub`,
    sectors: [`meeting`],
    devices: [`crestron`, `ios_tablet`, `xpanel`, `ios_phone`],
    isInteractive: true,
    interactiveComponent: `huddle-room-nyon`,
    thumbnailUrl: `https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Petite salle de réunion « one-touch » : rejoindre Teams ou Zoom en un geste, partage sans fil, caméra à cadrage automatique, réservation depuis la dalle.`,
        details: `Une huddle room de six places pensée pour ne jamais faire perdre de temps : la dalle affiche l'agenda de la salle, le bouton « Rejoindre » lance la visioconférence programmée en un appui (Crestron Flex, Logitech Rally Bar, micro Shure), le partage sans fil AirMedia affiche un code de session, et la salle se réserve ou se prolonge directement depuis l'écran. Le thème clair, inspiré des espaces de travail lumineux, contraste avec les interfaces résidentielles sombres.`,
        features: [
          `Rejoindre la réunion programmée en un appui (Teams, Zoom, Meet)`,
          `Agenda de la salle synchronisé et réunion instantanée`,
          `Partage sans fil AirMedia avec code de session, entrée HDMI`,
          `Caméra à cadrage automatique et préréglages`,
          `Coupure micro, volume, écran, ambiances lumineuses, stores`,
          `Occupation, température et qualité de l'air en temps réel`,
        ],
      },
      en: {
        description: `One-touch huddle room: join Teams or Zoom in a tap, wireless presenting, auto-framing camera, room booking from the panel.`,
        details: `A six-seat huddle room designed to waste no time: the panel shows the room agenda, the "Join" button starts the scheduled video call in one tap (Crestron Flex, Logitech Rally Bar, Shure microphone), AirMedia wireless presenting shows a session code, and the room can be booked or extended right from the screen. The light theme, inspired by bright workspaces, contrasts with the dark residential interfaces.`,
        features: [
          `Join the scheduled meeting in one tap (Teams, Zoom, Meet)`,
          `Synchronised room agenda and instant meeting`,
          `AirMedia wireless presenting with session code, HDMI input`,
          `Auto-framing camera and presets`,
          `Mic mute, volume, display, lighting scenes, blinds`,
          `Live occupancy, temperature and air quality`,
        ],
      },
      de: {
        description: `One-Touch-Huddle-Room: Teams oder Zoom mit einem Tipp beitreten, drahtlos präsentieren, Auto-Framing-Kamera, Buchung direkt am Panel.`,
        details: `Ein Huddle Room mit sechs Plätzen, der keine Zeit verschwendet: Das Panel zeigt die Raumagenda, die Schaltfläche „Beitreten“ startet den geplanten Videocall mit einem Tipp (Crestron Flex, Logitech Rally Bar, Shure-Mikrofon), AirMedia zeigt einen Sitzungscode zum drahtlosen Präsentieren, und der Raum lässt sich direkt am Bildschirm buchen oder verlängern. Das helle Thema, inspiriert von lichtdurchfluteten Arbeitsräumen, kontrastiert mit den dunklen Wohn-Oberflächen.`,
        features: [
          `Geplantes Meeting mit einem Tipp beitreten (Teams, Zoom, Meet)`,
          `Synchronisierte Raumagenda und Sofort-Meeting`,
          `AirMedia-Drahtlospräsentation mit Sitzungscode, HDMI-Eingang`,
          `Auto-Framing-Kamera und Voreinstellungen`,
          `Mikrofon stumm, Lautstärke, Display, Lichtszenen, Jalousien`,
          `Belegung, Temperatur und Luftqualität in Echtzeit`,
        ],
      },
    },
  },
  {
    id: `suite-palace-montreux`,
    name: `Suite Palace Montreux`,
    status: `concept`,
    client: `Hôtel 5 étoiles`,
    sectors: [`hotellerie`],
    devices: [`ios_tablet`, `crestron`, `ios_phone`],
    isInteractive: true,
    interactiveComponent: `suite-palace-montreux`,
    thumbnailUrl: `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Tablette de suite multilingue (6 langues) : accueil personnalisé, ambiances, ne pas déranger, climat, rideaux, TV, musique et services de l'hôtel.`,
        details: `Chaque hôte trouve la tablette dans sa langue : l'interface embarque son propre sélecteur (français, anglais, allemand, italien, espagnol, japonais), indépendant du site. L'écran d'accueil salue l'hôte par son nom, propose quatre ambiances (Réveil, Lecture, Détente, Nuit) et les demandes classiques (ne pas déranger, faire la chambre, majordome). Les pages Climat, Lumières, Rideaux (voilage et occultant motorisés) et Médias pilotent la suite ; la page Services commande petit-déjeuner, room service, spa, blanchisserie ou taxi.`,
        features: [
          `Sélecteur de langue intégré à l'interface (FR, EN, DE, IT, ES, JA)`,
          `Accueil personnalisé au nom de l'hôte`,
          `Ambiances Réveil / Lecture / Détente / Nuit`,
          `Ne pas déranger, faire la chambre, appel majordome`,
          `Climat, quatre zones d'éclairage, voilage et occultant motorisés`,
          `TV, musique et commande des services de l'hôtel`,
        ],
      },
      en: {
        description: `Multilingual suite tablet (6 languages): personalised welcome, scenes, do-not-disturb, climate, curtains, TV, music and hotel services.`,
        details: `Every guest finds the tablet in their own language: the interface embeds its own selector (French, English, German, Italian, Spanish, Japanese), independent from the website. The home screen greets the guest by name, offers four scenes (Wake up, Reading, Relax, Night) and the usual requests (do not disturb, make up room, butler). The Climate, Lights, Curtains (motorised sheer and blackout) and Media pages control the suite; the Services page orders breakfast, room service, spa, laundry or a taxi.`,
        features: [
          `Language selector built into the interface (FR, EN, DE, IT, ES, JA)`,
          `Personalised welcome with the guest's name`,
          `Wake up / Reading / Relax / Night scenes`,
          `Do not disturb, make up room, butler call`,
          `Climate, four lighting zones, motorised sheer and blackout curtains`,
          `TV, music and hotel services ordering`,
        ],
      },
      de: {
        description: `Mehrsprachiges Suite-Tablet (6 Sprachen): persönliche Begrüssung, Szenen, Nicht stören, Klima, Vorhänge, TV, Musik und Hotelservices.`,
        details: `Jeder Gast findet das Tablet in seiner Sprache: Die Oberfläche hat einen eigenen Sprachwähler (Französisch, Englisch, Deutsch, Italienisch, Spanisch, Japanisch), unabhängig von der Website. Der Startbildschirm begrüsst den Gast mit Namen, bietet vier Szenen (Aufwachen, Lesen, Entspannen, Nacht) und die üblichen Wünsche (Nicht stören, Zimmer aufräumen, Butler). Die Seiten Klima, Licht, Vorhänge (motorisierte Store und Verdunkelung) und Medien steuern die Suite; die Seite Service bestellt Frühstück, Zimmerservice, Spa, Wäscherei oder Taxi.`,
        features: [
          `In die Oberfläche integrierter Sprachwähler (FR, EN, DE, IT, ES, JA)`,
          `Persönliche Begrüssung mit dem Namen des Gastes`,
          `Szenen Aufwachen / Lesen / Entspannen / Nacht`,
          `Nicht stören, Zimmer aufräumen, Butler-Ruf`,
          `Klima, vier Lichtzonen, motorisierte Store und Verdunkelung`,
          `TV, Musik und Bestellung der Hotelservices`,
        ],
      },
    },
  },
  {
    id: `appartement-eaux-vives`,
    name: `Appartement Eaux-Vives`,
    status: `concept`,
    client: `Appartement connecté`,
    sectors: [`residentiel`],
    devices: [`ios_phone`, `ios_tablet`, `crestron`, `android_phone`],
    isInteractive: true,
    interactiveComponent: `appartement-eaux-vives`,
    thumbnailUrl: `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80`,
    year: `2026`,
    text: {
      fr: {
        description: `Appartement genevois : pièces, scènes de vie avec programme hebdomadaire éditable, climat par zone, stores motorisés (position et orientation) et énergie solaire.`,
        details: `Un appartement de 124 m² aux Eaux-Vives, piloté au quotidien depuis le smartphone. Les six pièces affichent leur état d'un coup d'œil (présence, lumières, température, stores). Sept scènes rythment la journée — Réveil, Départ, Retour, Soirée, Cinéma, Nuit, Invités — et le programme hebdomadaire se modifie directement sur l'écran : heure à ± 15 min, jours de la semaine, activation. Le climat se règle zone par zone, chaque store motorisé a sa position et l'orientation de ses lamelles, et la page Énergie suit la production solaire, la batterie et l'autoconsommation.`,
        features: [
          `Vue pièces avec présence, lumières, température et stores`,
          `Sept scènes de vie activables en un appui`,
          `Programme hebdomadaire éditable sur l'écran (heure, jours, actif)`,
          `Climat zone par zone avec pompe à chaleur`,
          `Stores motorisés : position et orientation des lamelles`,
          `Énergie : solaire, réseau, batterie, autoconsommation`,
        ],
      },
      en: {
        description: `Geneva apartment: rooms, living scenes with an editable weekly programme, zoned climate, motorised blinds (position and tilt) and solar energy.`,
        details: `A 124 m² apartment in Eaux-Vives, run every day from the phone. The six rooms show their status at a glance (presence, lights, temperature, blinds). Seven scenes shape the day — Wake up, Leave, Back home, Evening, Movie, Night, Guests — and the weekly programme is edited right on the screen: time in ± 15 min steps, weekdays, on/off. Climate is set zone by zone, every motorised blind has its position and slat tilt, and the Energy page tracks solar production, battery and self-consumption.`,
        features: [
          `Rooms view with presence, lights, temperature and blinds`,
          `Seven living scenes in one tap`,
          `Weekly programme editable on screen (time, days, enabled)`,
          `Zone-by-zone climate with heat pump`,
          `Motorised blinds: position and slat tilt`,
          `Energy: solar, grid, battery, self-consumption`,
        ],
      },
      de: {
        description: `Genfer Wohnung: Räume, Wohnszenen mit editierbarem Wochenprogramm, Zonenklima, Motorstoren (Position und Lamellen) und Solarenergie.`,
        details: `Eine 124-m²-Wohnung in Eaux-Vives, täglich vom Smartphone aus gesteuert. Die sechs Räume zeigen ihren Zustand auf einen Blick (Anwesenheit, Licht, Temperatur, Storen). Sieben Szenen prägen den Tag — Aufstehen, Verlassen, Zurück, Abend, Kino, Nacht, Gäste — und das Wochenprogramm wird direkt am Bildschirm bearbeitet: Uhrzeit in ± 15-Minuten-Schritten, Wochentage, Aktivierung. Das Klima wird Zone für Zone geregelt, jede Motorstore hat Position und Lamellenwinkel, und die Seite Energie verfolgt Solarproduktion, Batterie und Eigenverbrauch.`,
        features: [
          `Raumansicht mit Anwesenheit, Licht, Temperatur und Storen`,
          `Sieben Wohnszenen per Tipp`,
          `Am Bildschirm editierbares Wochenprogramm (Zeit, Tage, aktiv)`,
          `Zonenklima mit Wärmepumpe`,
          `Motorstoren: Position und Lamellenwinkel`,
          `Energie: Solar, Netz, Batterie, Eigenverbrauch`,
        ],
      },
    },
  },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
export const getProjectText = (project, lang) => {
  if (!project) return { description: ``, details: ``, features: [] };
  const tx = project.text || {};
  return tx[lang] || tx.fr || tx.en || { description: ``, details: ``, features: [] };
};

export const getProjectName = (project, lang) => {
  const tx = getProjectText(project, lang);
  return tx.name || project.name;
};

export const getStatusLabel = (status, lang) => {
  const s = PROJECT_STATUS[status] || PROJECT_STATUS.concept;
  return s[lang] || s.fr;
};

export const getDeviceById = (id) => devices.find((d) => d.id === id);

export const bgVideos = {
  dashboard: 'https://assets.mixkit.co/videos/41541/41541-720.mp4',
  residentiel: 'https://assets.mixkit.co/videos/24728/24728-720.mp4',
  hotellerie: 'https://assets.mixkit.co/videos/4196/4196-720.mp4',
  meeting: 'https://assets.mixkit.co/videos/4547/4547-720.mp4',
  conference: 'https://assets.mixkit.co/videos/13222/13222-720.mp4',
  discoteque: 'https://assets.mixkit.co/videos/46722/46722-720.mp4',
  yacht: 'https://assets.mixkit.co/videos/47193/47193-720.mp4',
  boutique: '/videos/boutique.mp4',
  restaurant: 'https://assets.mixkit.co/videos/29050/29050-720.mp4'
};

export const bgGradients = {
  dashboard: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)',
  residentiel: 'linear-gradient(135deg, #e0f2fe 0%, #faf5ff 100%)',
  hotellerie: 'linear-gradient(135deg, #fef3c7 0%, #fafaf9 100%)',
  meeting: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
  conference: 'linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)',
  discoteque: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
  yacht: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
  boutique: 'linear-gradient(135deg, #fae8ff 0%, #fdf4ff 100%)',
  restaurant: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)'
};
