// Shared by entry orchestration and the ordered lighting tours only.
export const GUIDED_DEMO_TIMING = Object.freeze({
  startDelay: 3000,
  firstSceneDelay: 1000,
  stepDelay: 5000,
});
const projects = new Set(['boutique-hermes', 'sushi-bar-kyoto', 'yacht-monaco']);
export const isGuidedProject = projectId => projects.has(projectId);
// Yacht et Boutique laissent dix secondes au visiteur avant que le curseur ne
// prenne la main ; Restaurant garde l'entrée courte.
const slowEntry = new Set(['boutique-hermes', 'yacht-monaco']);
export const guidedStartDelay = projectId =>
  slowEntry.has(projectId) ? 10000 : GUIDED_DEMO_TIMING.startDelay;
