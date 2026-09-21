/* Asteria: scene changes on stable day/night edges, not on every render tick.
 * The exterior model remains the clock and lighting authority. No extra timer.
 */
(function (root) {
  'use strict';
  function create(applyPreset) {
    if (typeof applyPreset !== 'function') throw new TypeError('A preset callback is required.');
    let previousStage = null, wasAutomatic = false;
    return Object.freeze({
      update(state) {
        if (!state || typeof state.automatic !== 'boolean' ||
            !['day', 'dusk', 'night', 'dawn'].includes(state.stage)) return null;
        const changed = state.stage !== previousStage;
        const resumed = state.automatic && !wasAutomatic;
        // Record the edge before calling the GUI: its feedback may be synchronous.
        previousStage = state.stage;
        wasAutomatic = state.automatic;
        const preset = state.stage === 'night' ? 'dinner' : state.stage === 'day' ? 'cruise' : null;
        if (!state.automatic || !preset || (!changed && !resumed)) return null;
        applyPreset(preset);
        return preset;
      }
    });
  }
  root.FTV_YACHT_SCENE_CYCLE = Object.freeze({ create });
})(typeof window === 'undefined' ? globalThis : window);
