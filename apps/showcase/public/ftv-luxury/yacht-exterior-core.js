/* Asteria showcase: pure lighting/geometry data, shared by the model, GUI and tests.
 * Yacht-only timing: 10 s daylight + 10 s night, each including a 1 s closing fade.
 * Villa Crans keeps its independent 30 / 10 / 30 / 10 s environment cycle.
 * This is a demonstration, not a navigation-light or electrical installation design.
 */
(function (root) {
  'use strict';
  const warm = '#ffd5a0', water = '#15cfff', party = '#aaa3ff';
  const rows = [
    ['name_port', 'ASTERIA · bâbord', 'signature', 100],
    ['name_starboard', 'ASTERIA · tribord', 'signature', 100],
    ['name_stern', 'ASTERIA · poupe', 'signature', 85],
    ['underwater_port', 'Sous-marin · bâbord', 'water', 100],
    ['underwater_starboard', 'Sous-marin · tribord', 'water', 100],
    ['underwater_stern', 'Sous-marin · poupe', 'water', 100],
    ['underwater_bow', 'Sous-marin · étrave', 'water', 90],
    ['led_swim', 'LED · plateforme de baignade', 'signature', 85],
    ['led_main', 'LED · pont principal', 'signature', 90],
    ['led_owner', 'LED · pont propriétaire', 'signature', 90],
    ['led_bridge', 'LED · pont passerelle', 'signature', 85],
    ['led_sundeck', 'LED · sun deck', 'signature', 90],
    ['led_roof', 'LED · couronne du pavillon', 'signature', 85],
    ['walk_main_port', 'Passage principal · bâbord', 'paths', 80],
    ['walk_main_starboard', 'Passage principal · tribord', 'paths', 80],
    ['walk_owner_port', 'Passage propriétaire · bâbord', 'paths', 75],
    ['walk_owner_starboard', 'Passage propriétaire · tribord', 'paths', 75],
    ['walk_bridge_port', 'Passage passerelle · bâbord', 'paths', 75],
    ['walk_bridge_starboard', 'Passage passerelle · tribord', 'paths', 75],
    ['walk_sundeck_port', 'Passage sun deck · bâbord', 'paths', 75],
    ['walk_sundeck_starboard', 'Passage sun deck · tribord', 'paths', 75],
    ['stairs_stern_port', 'Marches arrière · bâbord', 'paths', 90],
    ['stairs_stern_starboard', 'Marches arrière · tribord', 'paths', 90],
    ['stairs_upper_port', 'Escalier supérieur · bâbord', 'paths', 80],
    ['stairs_upper_starboard', 'Escalier supérieur · tribord', 'paths', 80],
    ['jacuzzi_water', 'Jacuzzi · lumière dans l’eau', 'water', 100],
    ['jacuzzi_rim', 'Jacuzzi · couronne lumineuse', 'water', 90],
    ['pool_sundeck', 'Piscine supérieure · lumière', 'water', 100],
    ['mast_uplight', 'Mât · projecteurs ascendants', 'signature', 90],
    ['mast_crown', 'Mât · accents des traverses', 'signature', 80],
    ['foredeck_spots', 'Pont avant · spots', 'paths', 85],
    ['foredeck_perimeter', 'Pont avant · contour LED', 'signature', 85],
    ['upper_rail', 'Pont supérieur · garde-corps', 'signature', 80],
    ['lounge_main', 'Salon extérieur · pont principal', 'hospitality', 70],
    ['lounge_owner', 'Dîner extérieur · propriétaire', 'hospitality', 70],
    ['lounge_bridge', 'Terrasse panoramique · passerelle', 'hospitality', 65],
    ['bar_sundeck', 'Bar du sun deck · lumière', 'hospitality', 75],
    ['party_beams', 'Lyres · faisceaux mobiles', 'party', 80],
    ['party_wash', 'Soirée · nappes de couleur', 'party', 65],
    ['party_pinspots', 'Soirée · spots décoratifs', 'party', 75]
  ];
  const circuits = rows.map(([id, name, group, night]) => Object.freeze({
    id, name, group, night,
    color: group === 'water' && id !== 'jacuzzi_rim' ? water : group === 'party' ? party : warm
  }));
  const byId = Object.fromEntries(circuits.map(c => [c.id, c]));
  const groups = { signature: 'Signature & ponts', paths: 'Passages & escaliers', water: 'Eau & bien-être', hospitality: 'Terrasses & bar', party: 'Soirée & lyres' };
  // 9 s hold + 1 s transition per half: dinner at 10 s, cruise at 20 s.
  const timing = Object.freeze({ day: 9, dusk: 1, night: 9, dawn: 1, total: 20 });
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const ease = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
  function cycle(seconds) {
    const p = ((Number.isFinite(seconds) ? seconds : 0) % timing.total + timing.total) % timing.total;
    const duskAt = timing.day, nightAt = duskAt + timing.dusk, dawnAt = nightAt + timing.night;
    const stage = p < duskAt ? 'day' : p < nightAt ? 'dusk' : p < dawnAt ? 'night' : 'dawn';
    const day = p < duskAt ? 1 : p < nightAt ? 1 - ease((p - duskAt) / timing.dusk)
      : p < dawnAt ? 0 : ease((p - dawnAt) / timing.dawn);
    return { seconds: p, stage, day, night: 1 - day };
  }
  function preset(name) {
    return Object.fromEntries(circuits.map(c => {
      let v = c.night;
      if (name === 'off' || name === 'cruise') v = 0;
      else if (name === 'sunset') v *= c.group === 'party' ? .35 : .6;
      else if (name === 'dinner') v *= c.group === 'party' ? .3 : .85;
      return [c.id, Math.round(v)];
    }));
  }
  function createController() {
    let automatic = true, manual = preset('off'), seconds = 0;
    const levels = () => automatic ? Object.fromEntries(circuits.map(c => [c.id, c.night * cycle(seconds).night])) : { ...manual };
    return {
      tick(s) { if (Number.isFinite(s) && s >= 0) seconds = s; return levels(); },
      setAutomatic(on) { if (typeof on !== 'boolean') return false; manual = levels(); automatic = on; return true; },
      setLevel(id, value) {
        if (!Object.hasOwn(byId, id) || !Number.isFinite(value)) return false;
        if (automatic) manual = levels();
        automatic = false; manual[id] = clamp(value); return true;
      },
      setPreset(name) {
        if (!['cruise', 'sunset', 'dinner', 'night', 'off'].includes(name)) return false;
        automatic = false; manual = preset(name); return true;
      },
      state() { return { automatic, ...cycle(seconds), levels: Object.fromEntries(Object.entries(levels()).map(([k, v]) => [k, Math.round(v)])) }; }
    };
  }
  /** Seal the real sheer boundary, below the existing visible teak surfaces.
   * Reuses the original side/end-cap vertices: no enlarged box, inverted depth test
   * or camera-facing overlay. Both end fans are joined to the new recessed closure.
   */
  function closeHull(positions, indices, longitudinal = 156, cross = 48) {
    const stride = cross + 1, originalRings = (longitudinal + 1) * stride;
    if (positions.length !== (originalRings + 2) * 3) throw new Error('Unexpected Asteria hull topology; closure not applied.');
    const p = Array.from(positions), idx = Array.from(indices), centers = [];
    // The original two end fans face inward. Reverse them before joining the
    // sheer closure; front-face depth then occludes the sea from bow AND stern.
    for (let i = longitudinal * cross * 6; i < idx.length; i += 3) {
      [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    }
    for (let i = 0; i <= longitudinal; i++) {
      const a = i * stride, x = p[a * 3], top = p[a * 3 + 1];
      const floor = x < -38 ? .36 : x < 24 ? 3.63 : 7.15;
      centers.push(p.length / 3); p.push(x, Math.min(top - .08, floor), 0);
    }
    for (let i = 0; i < longitudinal; i++) {
      const a = i * stride, b = a + stride, c = centers[i], d = centers[i + 1];
      idx.push(a, b, c, b, d, c);
      idx.push(a + cross, c, b + cross, b + cross, c, d);
    }
    const stern = originalRings, bow = originalRings + 1;
    idx.push(stern, 0, centers[0], stern, centers[0], cross);
    const end = longitudinal * stride;
    idx.push(bow, centers[longitudinal], end, bow, end + cross, centers[longitudinal]);
    return { positions: new Float32Array(p), indices: new Uint32Array(idx) };
  }
  /** Actual horizontal intersections of the existing raked hull, not its bounding box. */
  function hullSections(positions, longitudinal = 156, cross = 48, count = 32, low = -1.47, high = -.83) {
    const stride = cross + 1;
    function intersect(ring, height) {
      for (let j = 0; j < cross / 2; j++) {
        const a = (ring * stride + j) * 3, b = a + 3;
        const ya = positions[a + 1], yb = positions[b + 1];
        if (height <= ya && height >= yb) {
          const t = (height - ya) / (yb - ya);
          return [positions[a] + (positions[b] - positions[a]) * t, positions[a + 2] + (positions[b + 2] - positions[a + 2]) * t];
        }
      }
      throw new Error('Hull section does not cross the animated waterline.');
    }
    return Array.from({ length: count }, (_, n) => {
      const ring = Math.round(n * longitudinal / (count - 1));
      return [...intersect(ring, low), ...intersect(ring, high)];
    });
  }
  root.FTV_YACHT_EXTERIOR = Object.freeze({ circuits: Object.freeze(circuits), byId: Object.freeze(byId), groups: Object.freeze(groups), timing, cycle, preset, createController, closeHull, hullSections });
})(globalThis);
