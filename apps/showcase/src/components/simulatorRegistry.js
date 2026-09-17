import { lazy } from "react";

// Un seul registre pour les châssis et la démo mobile : un oubli ne doit jamais
// afficher silencieusement l'interface d'une autre villa.
const lazyNamed = (loader, name) => lazy(() => loader().then(m => ({ default: m[name] })));
export const SIMULATORS = Object.freeze({
  "villa-gemini": lazyNamed(() => import("./simulators/VillaGemini"), "VillaGemini"),
  "hotel-geneva": lazyNamed(() => import("./simulators/HotelGeneva"), "HotelGeneva"),
  "crestron-home": lazyNamed(() => import("./simulators/CrestronHome"), "CrestronHome"),
  "yacht-monaco": lazyNamed(() => import("./simulators/YachtMonaco"), "YachtMonaco"),
  "chalet-zermatt": lazyNamed(() => import("./simulators/ChaletZermatt"), "ChaletZermatt"),
  "boardroom-futureav": lazyNamed(() => import("./simulators/BoardroomFutureAV"), "BoardroomFutureAV"),
  "club-etoile": lazyNamed(() => import("./simulators/ClubEtoile"), "ClubEtoile"),
  "boutique-hermes": lazyNamed(() => import("./simulators/BoutiqueHermes"), "BoutiqueHermes"),
  "sushi-bar-kyoto": lazyNamed(() => import("./simulators/SushiBarKyoto"), "SushiBarKyoto"),
  "auditorium-richmond": lazyNamed(() => import("./simulators/AuditoriumRichmond"), "AuditoriumRichmond"),
  "home-cinema-cologny": lazyNamed(() => import("./simulators/HomeCinemaCologny"), "HomeCinemaCologny"),
  "huddle-room-nyon": lazyNamed(() => import("./simulators/HuddleRoomNyon"), "HuddleRoomNyon"),
  "suite-palace-montreux": lazyNamed(() => import("./simulators/SuitePalaceMontreux"), "SuitePalaceMontreux"),
  "appartement-eaux-vives": lazyNamed(() => import("./simulators/AppartementEauxVives"), "AppartementEauxVives"),
  "villa-leman": lazyNamed(() => import("./simulators/VillaLeman"), "VillaLeman"),
  "siege-nyon": lazyNamed(() => import("./simulators/SiegeNyon"), "SiegeNyon"),
  "appartement-carouge": lazyNamed(() => import("./simulators/AppartementCarouge"), "AppartementCarouge"),
});

export function validateSimulatorRegistry(projects, registry = SIMULATORS) {
  const errors = [], ids = new Set();
  for (const project of projects) {
    if (ids.has(project.id)) errors.push(`Projet dupliqué : ${project.id}`);
    ids.add(project.id);
    if (project.isInteractive && !Object.hasOwn(registry, project.id)) errors.push(`Simulateur manquant : ${project.id}`);
    if (!project.isInteractive && !project.embedUrl) errors.push(`GUI embarquée manquante : ${project.id}`);
  }
  for (const id of Object.keys(registry)) if (!projects.some(p => p.id === id && p.isInteractive)) errors.push(`Simulateur sans projet interactif : ${id}`);
  return errors;
}

export function getSimulator(project) {
  if (!project.isInteractive) return null;
  if (!Object.hasOwn(SIMULATORS, project.id)) throw new Error(`Simulateur non enregistré : ${project.id}`);
  return SIMULATORS[project.id];
}
