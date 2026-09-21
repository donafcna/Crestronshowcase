/* global hullMesh, sea, skin, M, halfBeam, yachtShape, sky, scene, hemisphere, sun, fill, skinGlass, pearlPaint, mode */
/* Asteria exterior adapter. Loaded by model-bridge AFTER the existing classic
 * yacht script and BEFORE model-ready. The legacy scene's lexical bindings are
 * intentionally reused: no duplicate model, renderer, camera or animation loop.
 */
(function () {
  'use strict';
  const api = window.__ftvModel, core = window.FTV_YACHT_EXTERIOR, T = window.THREE;
  if (api?.project !== 'yacht-monaco' || !core || window.__ftvYachtExterior) return;
  if (typeof hullMesh === 'undefined' || typeof sea === 'undefined') throw new Error('Asteria scene contract missing.');
  const originalPositions = hullMesh.geometry.attributes.position.array;
  const sections = core.hullSections(originalPositions);
  const sealed = core.closeHull(originalPositions, hullMesh.geometry.index.array);
  hullMesh.geometry.setAttribute('position', new T.BufferAttribute(sealed.positions, 3));
  hullMesh.geometry.setIndex(new T.BufferAttribute(sealed.indices, 1));
  hullMesh.geometry.computeVertexNormals();
  hullMesh.geometry.computeBoundingBox(); hullMesh.geometry.computeBoundingSphere();
  Object.assign(hullMesh.material, { transparent: false, opacity: 1, depthTest: true, depthWrite: true, side: T.FrontSide });
  hullMesh.material.needsUpdate = true;
  hullMesh.name = 'Asteria · closed opaque hull · outward end caps';

  const root = new T.Group(); root.name = 'Exterior lighting · 40 independent circuits'; skin.add(root);
  const controller = core.createController(), materials = new Map(), halos = new Map(), realLights = [], heads = [];
  const fixtures = Object.fromEntries(core.circuits.map(c => [c.id, 0]));
  const metal = new T.MeshStandardMaterial({ color: 0x5d747e, metalness: .7, roughness: .28 });
  const black = new T.MeshStandardMaterial({ color: 0x10202b, metalness: .35, roughness: .45 });
  const unitBox = new T.BoxGeometry(1, 1, 1), disc = new T.CylinderGeometry(.105, .105, .035, 10);
  function emission(id) {
    if (!materials.has(id)) {
      const color = core.byId[id].color;
      const material = new T.MeshStandardMaterial({ name: 'Exterior · ' + id, color, emissive: color, emissiveIntensity: 0, roughness: .35, metalness: .1 });
      materials.set(id, [material]);
    }
    return materials.get(id)[0];
  }
  function object(geometry, material, position, parent = root) {
    const m = new T.Mesh(geometry, material); m.position.set(...position); m.receiveShadow = true; m.castShadow = false; parent.add(m); return m;
  }
  function bar(id, position, size) {
    const m = object(unitBox, emission(id), position); m.scale.set(...size); fixtures[id]++; return m;
  }
  function tube(id, points, radius = .044, closed = false) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)), closed, 'centripetal');
    const segments = Math.max(16, Math.min(350, points.length * 2));
    const m = object(new T.TubeGeometry(curve, segments, radius, 6, closed), emission(id), [0, 0, 0]);
    m.name = core.byId[id].name; fixtures[id]++;
    // A small, depth-tested optical halo, never a render-order override.
    const hm = new T.MeshBasicMaterial({ color: core.byId[id].color, transparent: true, opacity: 0, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, toneMapped: false });
    object(new T.TubeGeometry(curve, segments, radius * 2.3, 5, closed), hm, [0, 0, 0]);
    (halos.get(id) || (halos.set(id, []), halos.get(id))).push(hm);
    return m;
  }
  function perimeter(id, a, b, width, y, nose = 4, tail = 2.8) {
    const pts = yachtShape(a, b, width, nose, tail).getSpacedPoints(100).slice(0, -1);
    return tube(id, pts.map(p => [p.x, y, p.y]), .046, true);
  }
  function wash(id, x, y, z, sx, sz, strength = .27) {
    const material = new T.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, toneMapped: false,
      uniforms: { tint: { value: new T.Color(core.byId[id].color) }, amount: { value: 0 } },
      vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 v;uniform vec3 tint;uniform float amount;void main(){vec2 p=(v-.5)*2.;float a=pow(max(0.,1.-dot(p,p)),2.);gl_FragColor=vec4(tint,amount*a);}' });
    const m = object(new T.PlaneGeometry(sx, sz), material, [x, y, z]); m.rotation.x = -Math.PI / 2;
    (halos.get(id) || (halos.set(id, []), halos.get(id))).push({ uniforms: material.uniforms, strength });
    return m;
  }
  function spot(id, x, y, z) {
    object(new T.CylinderGeometry(.16, .16, .04, 10), metal, [x, y, z]);
    object(disc, emission(id), [x, y + .025, z]); fixtures[id]++; wash(id, x, y + .047, z, 1.05, 1.15, .32);
  }
  function point(id, x, y, z, intensity, distance) {
    const light = new T.PointLight(core.byId[id].color, 0, distance, 2); light.position.set(x, y, z); root.add(light);
    realLights.push({ id, light, intensity }); return light;
  }

  // Retire only obsolete exterior name/perimeter meshes, not interior circuits.
  skin.children.forEach(m => {
    if (m === root || !m.isMesh) return;
    if (m.material?.name === 'Exterior recessed warm light' || (m.geometry.type === 'PlaneGeometry' && m.material?.map && m.userData.exportIgnore)) m.visible = false;
  });
  function nameplate(id, position, angle, width) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 192;
    const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = 'white';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 128px sans-serif'; ctx.fillText('ASTERIA', 512, 105);
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace;
    const material = emission(id).clone(); material.map = texture; material.emissiveMap = texture;
    material.transparent = true; material.alphaTest = .12; material.depthWrite = true; material.side = T.DoubleSide;
    materials.get(id).push(material);
    const m = object(new T.PlaneGeometry(width, width * 192 / 1024), material, position); m.rotation.y = angle;
    m.name = core.byId[id].name; m.userData.exportIgnore = true; fixtures[id]++;
  }
  nameplate('name_port', [-7, 5.9, -halfBeam(-7) - .06], Math.PI, 7.2);
  nameplate('name_starboard', [-7, 5.9, halfBeam(-7) + .06], 0, 7.2);
  nameplate('name_stern', [-42.81, .08, 0], -Math.PI / 2, 3.5);
  for (const values of [
    ['led_swim', -42.65, -37.45, 10.08, .49, 1.2, 1.8],
    ['led_main', -38.48, -24.72, 13.12, 3.79, 2, 3],
    ['led_owner', -33.18, 25.18, 13.21, 7.19],
    ['led_bridge', -26.98, 21.68, 11.91, 10.63],
    ['led_sundeck', -21.78, 15.68, 10.01, 14.04],
    ['led_roof', -7.08, 5.18, 9.21, 17.05, 4, 4.2],
    ['upper_rail', -21.48, 15.38, 9.71, 15.23]
  ]) perimeter(...values);

  const paths = [ ['main', -34.8, -25.5, 3.96, 5.9], ['owner', -29.5, 22.5, 7.43, 5.83], ['bridge', -23, 19, 10.86, 5.16], ['sundeck', -19.5, 13.4, 14.3, 4.43] ];
  for (const [deck, a, b, y, z] of paths) for (const side of [-1, 1]) {
    const id = `walk_${deck}_${side < 0 ? 'port' : 'starboard'}`;
    for (let x = a; x <= b; x += 2.5) spot(id, x, y, side * z);
  }
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'port' : 'starboard';
    for (let i = 0; i < 14; i++) {
      const t = i / 13; bar('stairs_stern_' + suffix, [-41.71 + 4.75 * t, .64 + 3.22 * t + .012, side * (4 + .9 * t)], [.045, .03, .91]);
    }
    // Compact upper flight on the OUTSIDE of the bridge pavilion, under the
    // upper deck's outer edge; avoids the lounge and pool footprints.
    for (let i = 0; i < 14; i++) {
      const t = i / 13, x = 7.1 + 4.8 * t, y = 10.89 + 3.4 * t, z = side * 4.62;
      const step = object(unitBox, M.teak, [x, y - .09, z]); step.scale.set(.41, .18, .72);
      bar('stairs_upper_' + suffix, [x - .15, y + .005, z], [.035, .025, .68]);
    }
    const fp = []; for (let x = 25; x < 41.6; x += .55) fp.push([x, 7.51, side * Math.max(.18, halfBeam(x) - .45)]);
    tube('foredeck_perimeter', fp);
    for (let x = 26; x < 38; x += 2.6) spot('foredeck_spots', x, 7.49, side * Math.max(.4, halfBeam(x) - 1));
  }
  function circle(id, x, y, z, radius) {
    tube(id, Array.from({ length: 64 }, (_, i) => [x + Math.cos(i * Math.PI / 32) * radius, y, z + Math.sin(i * Math.PI / 32) * radius]), .045, true);
  }
  // Match the actual basin centers (room position minus 7% of its length).
  circle('jacuzzi_rim', -32 - 10.5 * .07, 4.54, 0, 3.36);
  circle('jacuzzi_water', -32 - 10.5 * .07, 4.565, 0, 2.82);
  circle('jacuzzi_water', 26.5 - 6 * .07, 8.015, 0, 1.57);
  circle('pool_sundeck', 9 - 9 * .07, 14.915, 0, 2.18);
  wash('jacuzzi_water', -32.735, 4.568, 0, 5.4, 5.4, .47);
  wash('pool_sundeck', 8.37, 14.918, 0, 4.2, 4.2, .47);
  point('jacuzzi_water', -32.735, 4.9, 0, 40, 8);
  point('pool_sundeck', 8.37, 15.2, 0, 28, 7);

  for (const [y, w] of [[18.2, 7.2], [19.9, 5.7], [21.25, 3.8]]) bar('mast_crown', [-2.35, y + .11, 0], [1.08, .035, w]);
  for (const side of [-1, 1]) {
    spot('mast_uplight', -3.3, 17.3, side * 2.4);
    tube('mast_uplight', [[-4.65, 17.12, side * .31], [-2.48, 23.31, side * .31]], .035);
  }
  point('mast_uplight', -3.3, 19, .8, 90, 12);
  for (const [id, x, y, size] of [['lounge_main', -28, 3.96, 5.1], ['lounge_owner', -28, 7.44, 4.7], ['lounge_bridge', -22, 10.91, 4.1], ['bar_sundeck', -8, 14.35, 3.6]]) {
    for (const side of [-1, 1]) {
      const z = side * size;
      const base = object(unitBox, black, [x, y + .25, z]); base.scale.set(.27, .5, .27);
      bar(id, [x, y + .52, z], [.23, .16, .23]); wash(id, x, y + .02, z, 4, 3.1, .32);
    }
  }
  point('lounge_owner', -28, 9.1, 0, 42, 9);
  point('lounge_bridge', -22, 12.5, 0, 35, 8);
  point('bar_sundeck', -8, 16, 0, 32, 7);

  const emitters = [];
  function underwater(x, z, ch, strength = 1) {
    emitters.push([x, z, ch, strength]);
    const id = ['underwater_port', 'underwater_starboard', 'underwater_stern', 'underwater_bow'][ch];
    const m = object(unitBox, emission(id), [x, -1.65, z]); m.scale.set(.22, .16, .2); fixtures[id]++;
  }
  function waterBeamAt(x) {
    for (let i = 0; i < sections.length - 1; i++) {
      const a = sections[i], b = sections[i + 1], ax = (a[0] + a[2]) / 2, bx = (b[0] + b[2]) / 2;
      if (x >= ax && x <= bx) { const t = (x - ax) / (bx - ax); return ((a[1] + a[3]) * (1 - t) + (b[1] + b[3]) * t) / 2; }
    }
    return .3;
  }
  for (const side of [-1, 1]) for (let i = 0; i < 16; i++) { const x = -37 + i * 4.55; underwater(x, side * (waterBeamAt(x) + .17), side < 0 ? 0 : 1); }
  for (const z of [-3.5, -1.2, 1.2, 3.5]) underwater(-42.94, z, 2);
  for (const side of [-1, 1]) for (const x of [37.2, 39.2]) underwater(x, side * (waterBeamAt(x) + .16), 3, .8);
  sea.configureYacht(sections, emitters);

  // Four visible moving-head fixtures with bounded, non-strobing choreography.
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? -19 : -11, z = i % 2 ? 3.65 : -3.65;
    const base = object(unitBox, black, [x, 14.58, z]); base.scale.set(.55, .35, .55);
    const head = new T.Group(); head.position.set(x, 14.91, z); root.add(head);
    const body = object(new T.CylinderGeometry(.24, .28, .44, 12), black, [0, .05, 0], head); body.rotation.x = Math.PI / 2;
    const lens = object(new T.CircleGeometry(.20, 16), emission('party_beams'), [0, .05, -.23], head); lens.rotation.y = Math.PI;
    const bm = new T.ShaderMaterial({ transparent: true, side: T.DoubleSide, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, toneMapped: false,
      uniforms: { tint: { value: new T.Color(i % 2 ? '#aab8ff' : '#67d7ff') }, amount: { value: 0 } },
      vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 v;uniform vec3 tint;uniform float amount;void main(){float edge=pow(max(0.,sin(v.x*3.14159265)),2.);gl_FragColor=vec4(tint,amount*edge*v.y*v.y);}' });
    const geo = new T.CylinderGeometry(.15, 1.0, 9, 16, 1, true); geo.translate(0, -4.5, 0); geo.rotateX(Math.PI / 2);
    object(geo, bm, [0, .05, -.25], head);
    heads.push({ head, material: bm, x, z, i }); fixtures.party_beams++;
    wash('party_wash', x, 14.33, z * .45, 5.5, 4.5, .36); fixtures.party_wash++;
    for (const dz of [-.75, .75]) spot('party_pinspots', x + 1.0, 14.32, z + (z > 0 ? -.9 : .9) + dz * .3);
  }

  const colors = {
    day: { zenith: new T.Color('#287bb9'), horizon: new T.Color('#bed7de'), cloud: new T.Color('#f3f3e7') },
    night: { zenith: new T.Color('#030b20'), horizon: new T.Color('#111e36'), cloud: new T.Color('#25344e') },
    dusk: new T.Color('#d7997b')
  };
  let seconds = 0, last = performance.now(), externalSeconds = null, externalAt = last, fixed = null, sentAt = 0, signature = '';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function sendState(force = false) {
    const now = performance.now(); if (!force && now - sentAt < 350) return;
    const value = controller.state(), sig = JSON.stringify([value.automatic, value.stage, value.levels]);
    if (!force && sig === signature) return; sentAt = now; signature = sig;
    parent.postMessage({ channel: 'ftv-luxury/v1', project: api.project, type: 'exterior-state', ...value }, location.origin === 'null' ? '*' : location.origin);
  }
  function update() {
    const now = performance.now(), dt = Math.max(0, (now - last) / 1000); last = now;
    seconds = fixed !== null ? fixed : externalSeconds === null ? seconds + dt : externalSeconds + Math.min(.5, Math.max(0, (now - externalAt) / 1000));
    const levels = controller.tick(seconds), state = core.cycle(seconds), day = state.day, night = state.night;
    const twilight = 4 * day * night;
    sky.uniforms.zenith.value.copy(colors.night.zenith).lerp(colors.day.zenith, day);
    sky.uniforms.horizon.value.copy(colors.night.horizon).lerp(colors.day.horizon, day).lerp(colors.dusk, twilight * .55);
    sky.uniforms.cloudColor.value.copy(colors.night.cloud).lerp(colors.day.cloud, day);
    sky.uniforms.night.value = night; sky.uniforms.sunDirection.value.set(-.55, -.12 + .77 * day, .6).normalize();
    scene.fog.color.copy(sky.uniforms.horizon.value); scene.background.copy(sky.uniforms.horizon.value);
    hemisphere.intensity = .16 + 2.19 * day; sun.intensity = .035 + 3.165 * day; fill.intensity = .10 + day;
    sun.color.setRGB(1, .76 + .17 * day - .13 * twilight, .62 + .2 * day - .22 * twilight);
    for (const m of Object.values(M)) if ('envMapIntensity' in m) m.envMapIntensity = .055 + .445 * day;
    skinGlass.envMapIntensity = .09 + .71 * day; pearlPaint.envMapIntensity = .06 + .34 * day;
    for (const c of core.circuits) {
      const f = levels[c.id] / 100;
      for (const m of materials.get(c.id) || []) { m.emissiveIntensity = f * (c.group === 'water' ? 3.8 : 3.1); m.color.set(core.byId[c.id].color).multiplyScalar(.22 + .78 * f); }
      for (const h of halos.get(c.id) || []) { if (h.uniforms) h.uniforms.amount.value = f * h.strength; else h.opacity = f * .13; }
    }
    realLights.forEach(({ id, light, intensity }) => { light.intensity = intensity * levels[id] / 100; });
    sea.yacht.levels.value.set(...['underwater_port', 'underwater_starboard', 'underwater_stern', 'underwater_bow'].map(id => levels[id] / 100));
    sea.yacht.warm.value = (levels.led_owner + levels.led_bridge + levels.led_sundeck) / 300;
    sea.yacht.active.value = mode === 'exterior' ? 1 : 0;
    const t = motion.matches ? 0 : seconds;
    heads.forEach(({ head, material, z, i }) => {
      // Aim across the open aft sun deck, not through the lounge or at the GUI.
      const target = new T.Vector3(-15 + Math.sin(t * .37 + i * 1.7) * 3, 15.7 + .8 * Math.sin(t * .23 + i), -z * .75 + Math.sin(t * .29 + i) * .6);
      head.lookAt(target); head.rotateY(Math.PI); material.uniforms.amount.value = levels.party_beams / 100 * .13;
    });
    sendState();
  }
  const beforeRender = scene.onBeforeRender;
  scene.onBeforeRender = function (...args) { beforeRender?.apply(this, args); update(); };
  api.visibility = () => { last = performance.now(); };
  document.addEventListener('visibilitychange', api.visibility);
  api.environmentTime = value => { if (Number.isFinite(value) && value >= 0) { externalSeconds = value; externalAt = performance.now(); } };
  api.exteriorState = () => controller.state();
  api.exterior = command => {
    if (!command || typeof command !== 'object') return;
    const ok = command.action === 'level' ? controller.setLevel(command.id, command.value)
      : command.action === 'automatic' ? controller.setAutomatic(command.value)
      : command.action === 'preset' ? controller.setPreset(command.key) : false;
    if (ok) { update(); sendState(true); }
  };
  window.__ftvYachtExterior = { controller, fixtures, root, hull: hullMesh, sea, update,
    // Deliberate test/debug controls, never sent by the public GUI.
    setTestTime(value) { fixed = Number.isFinite(value) && value >= 0 ? value : null; update(); },
    inspect() { return { circuits: core.circuits.length, fixtures: { ...fixtures }, extraLights: realLights.length, state: controller.state(), closedHullVertices: sealed.positions.length / 3 }; }
  };
  update();
})();
