// Shared by entry orchestration and the ordered lighting tours only.
export const GUIDED_DEMO_TIMING = Object.freeze({
  startDelay: 3000,
  firstSceneDelay: 1000,
  stepDelay: 5000,
});
const projects = new Set(['boutique-hermes', 'sushi-bar-kyoto', 'yacht-monaco']);
export const isGuidedProject = projectId => projects.has(projectId);
// Délai avant que le curseur ne prenne la main : quatre secondes pour Boutique
// et Restaurant, dix pour le Yacht (demandes du 27/09/2026).
const entryDelays = { 'boutique-hermes': 4000, 'sushi-bar-kyoto': 4000, 'yacht-monaco': 10000 };
export const guidedStartDelay = projectId =>
  entryDelays[projectId] ?? GUIDED_DEMO_TIMING.startDelay;
