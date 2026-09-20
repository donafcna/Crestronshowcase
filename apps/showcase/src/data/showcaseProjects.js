// Public concept updates; existing catalogue entries remain in their original module.
import { projects as existingProjects } from './projects.js';
export * from './projects.js';

const concepts = [
  {
    "id": "yacht-monaco",
    "name": "M/Y Sunrays",
    "status": "concept",
    "client": "Armateur privé",
    "sectors": [
      "yacht"
    ],
    "devices": [
      "ios_tablet",
      "xpanel",
      "crestron",
      "ios_phone"
    ],
    "isInteractive": true,
    "thumbnailUrl": "/sheets/yacht-monaco/04-3d.png",
    "year": "2026",
    "text": {
      "fr": {
        "description": "Superyacht inspiré de M/Y Sunrays : cinq ponts et 37 espaces en 3D.",
        "details": "Concept de superyacht avec silhouette extérieure affinée, salons, cabines et espaces de vie répartis sur cinq ponts. Les commandes d’éclairage par espace et les scènes globales modifient la 3D. Versions dalle, iPad, XPanel et iPhone ; simulation sans connexion à un yacht réel.",
        "features": [
          "Extérieur et 37 espaces sur cinq ponts",
          "Corniches, spots, appliques, balisage et bassins",
          "Scènes Jour, Sunset, Dîner et Nuit",
          "Musique par zone et effets de couleur doux",
          "Version iPhone et trois thèmes"
        ]
      },
      "en": {
        "description": "M/Y Sunrays-inspired superyacht: five decks and 37 spaces in 3D.",
        "details": "Superyacht concept with a refined exterior silhouette, lounges, cabins and living spaces across five decks. Per-space lighting controls and global scenes update the 3D model. Wall panel, iPad, XPanel and iPhone layouts; simulation without a connection to a real yacht.",
        "features": [
          "Exterior and 37 spaces across five decks",
          "Coves, spots, sconces, path lighting and pools",
          "Day, Sunset, Dinner and Night scenes",
          "Per-zone music and gentle colour effects",
          "iPhone layout and three themes"
        ]
      },
      "de": {
        "description": "Von M/Y Sunrays inspirierte Superyacht: fünf Decks und 37 Bereiche in 3D.",
        "details": "Superyachtkonzept mit schlanker Außenansicht, Salons, Kabinen und Aufenthaltsbereichen auf fünf Decks. Raumweise Lichtsteuerung und globale Szenen aktualisieren das 3D-Modell. Ansichten für Wandpanel, iPad, XPanel und iPhone; Simulation ohne Verbindung zu einer realen Yacht.",
        "features": [
          "Außenansicht und 37 Bereiche auf fünf Decks",
          "Vouten, Spots, Wandleuchten, Orientierungslicht und Becken",
          "Szenen Tag, Sunset, Dinner und Nacht",
          "Musik pro Zone und sanfte Farbeffekte",
          "iPhone-Ansicht und drei Designs"
        ]
      }
    }
  },
  {
    "id": "boutique-hermes",
    "name": "Boutique VCA Genève",
    "status": "concept",
    "client": "Maison de luxe (concept)",
    "sectors": [
      "boutique"
    ],
    "devices": [
      "crestron",
      "ios_tablet",
      "ios_phone"
    ],
    "isInteractive": true,
    "thumbnailUrl": "/sheets/boutique-hermes/04-3d.png",
    "year": "2026",
    "text": {
      "fr": {
        "description": "Bijouterie inspirée de Van Cleef & Arpels : visite 3D et commandes par salon.",
        "details": "Concept de boutique sur deux niveaux avec hall, grand escalier et 14 salons. La sélection d’un espace et ses éclairages sont synchronisés avec le modèle 3D. Interface tactile pour dalle, iPad et iPhone ; commandes simulées, sans installation physique connectée.",
        "features": [
          "Hall et 14 salons en 3D",
          "Vitrines, corniches, spots, appliques et balisage",
          "Scènes globales et réglages par espace",
          "Ambiances musicales et olfactives simulées",
          "Version iPhone et trois thèmes"
        ]
      },
      "en": {
        "description": "Van Cleef & Arpels-inspired jewellery boutique: 3D exploration and room controls.",
        "details": "Two-level concept boutique with an entrance hall, grand staircase and 14 salons. Space selection and lighting controls are synchronised with the 3D model. Touch interface for wall panel, iPad and iPhone; simulated controls without a connected physical installation.",
        "features": [
          "Entrance hall and 14 salons in 3D",
          "Showcases, coves, spots, sconces and path lighting",
          "Global scenes and per-space controls",
          "Simulated music and fragrance settings",
          "iPhone layout and three themes"
        ]
      },
      "de": {
        "description": "Von Van Cleef & Arpels inspirierte Schmuckboutique: 3D-Rundgang und Raumsteuerung.",
        "details": "Boutiquenkonzept auf zwei Ebenen mit Eingangshalle, repräsentativer Treppe und 14 Salons. Raumauswahl und Lichtsteuerung sind mit dem 3D-Modell synchronisiert. Touch-Oberfläche für Wandpanel, iPad und iPhone; simulierte Steuerung ohne angeschlossene Anlage.",
        "features": [
          "Eingangshalle und 14 Salons in 3D",
          "Vitrinen, Vouten, Spots, Wandleuchten und Orientierungslicht",
          "Globale Szenen und raumweise Steuerung",
          "Simulierte Musik- und Duftsteuerung",
          "iPhone-Ansicht und drei Designs"
        ]
      }
    }
  }
];
const conceptById = new Map(concepts.map(project => [project.id, project]));
export const projects = existingProjects.map(project => {
  const updated = conceptById.get(project.id) || project;
  if (['yacht-monaco', 'boutique-hermes'].includes(project.id)) return { ...updated, defaultViewport: 'phone' };
  if (['auditorium-richmond', 'club-etoile'].includes(project.id)) return { ...updated, devices: [...updated.devices, 'ios_phone'] };
  return updated;
});

