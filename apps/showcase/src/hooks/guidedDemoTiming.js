// Shared by entry orchestration and the ordered lighting tours only.
export const GUIDED_DEMO_TIMING = Object.freeze({
  startDelay: 3000,
  firstSceneDelay: 1000,
  stepDelay: 5000,
});
const projects = new Set(['boutique-hermes', 'sushi-bar-kyoto', 'yacht-monaco']);
export const isGuidedProject = projectId => projects.has(projectId);
