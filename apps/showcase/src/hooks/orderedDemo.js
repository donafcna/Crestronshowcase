// Ordered, capability-aware tour. No random control clicks.
import { GUIDED_DEMO_TIMING, isGuidedProject } from "./guidedDemoTiming.js";
const text = el => (el.getAttribute('aria-label') || el.getAttribute('label') || el.textContent || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const categories = {
  rooms: /^(pieces|rooms|raume)$/,
  lights: /^(eclairage|lumieres|luminosite|lighting|lights|licht|beleuchtung)/,
  hvac: /^(hvac|climat|temperature|chauffage|climate|klima|heizung)/,
  av: /^(audio|video|media|sources|musique|music|medien|sonorisation)/,
};
export async function runOrderedDemo({ gui, token, sleep, moveTo, act, setCursor, visible, active = () => false }) {
  const all = selector => [...gui.root.querySelectorAll(selector)];
  const shown = selector => all(selector).filter(el => {
    const r = el.getBoundingClientRect(), slider = el.matches('input[type="range"],ch5-slider');
    return Math.max(r.width, r.height) > 5 && (slider || Math.min(r.width, r.height) > 5)
      && gui.win.getComputedStyle(el).visibility !== 'hidden';
  });
  const q = selector => shown(selector)[0];
  let lastPressAt = 0;
  const perform = async (target, wait = 1300, click = true, deadline = Infinity) => {
    const resolve = () => typeof target === 'function' ? target() : target;
    let el = resolve();
    if (!el || token.cancelled) return false;
    const settle = visible(el, gui) ? 150 : 250;
    if (settle === 250) {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    }
    await sleep(Math.max(0, Math.min(settle, deadline - performance.now())), token);
    if (token.cancelled || !visible(el, gui)) return false;
    const moved = await moveTo(el, gui, deadline);
    if (token.cancelled) return false;
    // A day/night scene can rebuild the yacht controls during cursor travel.
    // Resolve guided buttons again rather than pressing a detached old node.
    const live = resolve();
    if (live !== el) {
      el = live;
      if (!el || !visible(el, gui) || !await moveTo(el, gui, deadline)) return false;
    } else if (!moved) return false;
    if (Number.isFinite(deadline)) await sleep(Math.max(0, deadline - performance.now()), token);
    if (token.cancelled) return false;
    if (click) { lastPressAt = performance.now(); await act(el, gui); }
    await sleep(wait, token);
    return !token.cancelled;
  };
  // Deadlines refer to presses, not to the end of their visual release. The
  // 1 s gap includes cursor travel; subsequent presses remain 5 s apart.
  const scheduleFromFirstZone = () => {
    let nextPress = lastPressAt + GUIDED_DEMO_TIMING.firstSceneDelay;
    return async action => {
      await sleep(Math.max(0, nextPress - performance.now() - 1000), token);
      if (token.cancelled) return false;
      const complete = await action(nextPress);
      nextPress = lastPressAt + GUIDED_DEMO_TIMING.stepDelay;
      return complete;
    };
  };
  const explicit = async (name, wait) => perform(all(`[data-demo-action="${name}"]`)[0], wait);
  const close = async () => { await explicit('close', 300); };
  const menu = async name => {
    const annotated = all(`[data-demo-action="${name}"]`)[0];
    if (annotated) return perform(annotated, 1400);
    const nav = shown('nav button, [role="tab"], [class*="nav"] button, [class*="tab"] button, button[class*="nav"], button[class*="tab"]');
    const el = nav.find(el => categories[name].test(text(el)));
    if (el) return perform(el, 1400, !el.matches('.active, [aria-selected="true"]'));
    const heading = shown('h2,h3,h4,.card-title,.ap-ctrl-head,.vl-label').find(el => categories[name].test(text(el)));
    return perform(heading, 1400, false);
  };
  // Interface Connect du Core (meta.interface = "connect", Appartement Crans-Montana) : trois pièces,
  // chacune : pièce → ambiance non active → tuile d'éclairage → store (descendre puis monter) →
  // onglet Climat (+0,5 °C) → retour Pièces. Jamais un bouton déjà actif, aucun A/V.
  if (gui.doc.getElementById('cx-root') && gui.win.ConnectUI?.active()) {
    const cx = gui.win.ConnectUI;
    const find = selector => [...gui.doc.querySelectorAll('#cx-root ' + selector)].find(el => visible(el, gui) && !active(el));
    const step = async (selector, dwell = 900) => {
      if (token.cancelled) return false;
      const el = find(selector);
      return el ? perform(el, dwell) : !token.cancelled;
    };
    const visited = [];
    for (let visit = 0; visit < 3 && !token.cancelled; visit++) {
      if (!await step('[data-cx-tab="rooms"]', 700)) return false;
      if (find('[data-cx-back]') && !await step('[data-cx-back]', 700)) return false;
      const room = find(`[data-cx-room]:not([aria-current="true"])${visited.map(v => `:not([data-cx-room="${v}"])`).join('')}`);
      if (!room) break;
      visited.push(room.getAttribute('data-cx-room'));
      if (!await perform(room, 1400)) return false;
      if (!await step('[data-cx-scene="2"], [data-cx-scene="3"], [data-cx-scene="4"]', 1600)) return false;
      if (!await step('[data-cx-tile]', 1200)) return false;
      if (!await step('[data-cx-motor$=":0:2"]', 1400)) return false;
      if (!await step('[data-cx-motor$=":0:0"]', 1000)) return false;
      if (!await step('[data-cx-tab="climate"]', 900)) return false;
      if (!await step('[data-cx-press="49"]', 1200)) return false;
      if (cx.state.tab !== 'climate') break;
    }
    return !token.cancelled;
  }
  // GUI CH5 issues du Core Villa Crans (moteur vitrine Villa.*) hors parcours villaTour :
  // pièces → éclairage (scène non active) → HVAC → sources → volume → OFF audio-vidéo, sans jamais
  // presser un bouton déjà actif. Dalle / tablette (index.html) et smartphone (iphone.html).
  if (gui.win.Villa && (gui.doc.querySelector('ch5-button[data-room-id]') || gui.doc.querySelector('#room-select'))) {
    const phone = !!gui.doc.querySelector('#room-select');
    const find = selector => [...gui.doc.querySelectorAll(selector)].find(el => visible(el, gui));
    const findInactive = selector => [...gui.doc.querySelectorAll(selector)].find(el => visible(el, gui) && !active(el));
    const step = async (selector, dwell = 900, inactiveOnly = true, click = true) => {
      if (token.cancelled) return false;
      const el = inactiveOnly ? findInactive(selector) : find(selector);
      if (!el) return !token.cancelled;
      return perform(el, dwell, click);
    };
    const hidden = id => { const el = gui.doc.getElementById(id); return !el || gui.win.getComputedStyle(el).display === 'none'; };
    const rooms = phone
      ? [...(gui.doc.querySelector('#room-select')?.options || [])].filter(o => o.value && !o.disabled).map(o => Number(o.value))
      : [...gui.doc.querySelectorAll('ch5-button[data-room-id]')].map(el => Number(el.dataset.roomId));
    if (!rooms.length) return false;
    const visited = [];
    for (let visit = 0; visit < 3 && !token.cancelled; visit++) {
      const current = Number(gui.win.Villa.activeRoom);
      let id;
      if (phone) id = rooms.find(r => r !== current && !visited.includes(r));
      else {
        // Le menu défile : préférer un bouton de pièce déjà visible, sinon amener le premier
        // non visité dans la fenêtre du menu (jamais un abandon du parcours pour une pièce).
        const buttons = [...gui.doc.querySelectorAll('ch5-button[data-room-id]')].filter(el => Number(el.dataset.roomId) !== current && !visited.includes(Number(el.dataset.roomId)));
        let el = buttons.find(b => visible(b, gui) && !active(b));
        if (!el && buttons[0]) { buttons[0].scrollIntoView({ block: 'center', behavior: 'instant' }); await sleep(250, token); el = buttons.find(b => visible(b, gui) && !active(b)); }
        id = el ? Number(el.dataset.roomId) : undefined;
      }
      if (id === undefined) { if (!visit) id = current; else break; }
      visited.push(id);
      if (id !== current) {
        if (phone) {
          const select = find('#room-select');
          if (!select || !await perform(select, 0, false)) return false;
          setCursor?.(c => ({ ...c, pulse: c.pulse + 1, pressed: true }));
          select.value = String(id);
          select.dispatchEvent(new gui.win.Event('change', { bubbles: true }));
          await sleep(160, token); setCursor?.(c => ({ ...c, pressed: false }));
        } else if (!await step(`ch5-button[data-room-id="${id}"]`, 150)) return false;
      }
      await sleep(1400, token);
      // L'onglet LUMIÈRES de la dalle n'expose son état que par un style en ligne : ne l'ouvrir que s'il est fermé.
      if (phone ? !await step('#nav-lights', 700) : (hidden('lights-control-content') && !await step('#tab-lights-btn', 700))) return false;
      // Une scène d'éclairage non active (JOUR / SOIR / NUIT… puis OFF en dernier recours).
      const scene = phone
        ? findInactive('#scene-btn-52, #scene-btn-53, #scene-btn-54') || findInactive('#scene-btn-51')
        : findInactive('#card-eclairages ch5-button[data-join="52"], #card-eclairages ch5-button[data-join="53"], #card-eclairages ch5-button[data-join="54"]')
          || findInactive('#card-eclairages ch5-button[data-join="51"]');
      if (scene && !await perform(scene, 1600)) return false;
      if (!await step(phone ? '#nav-hvac' : '#card-cvc [data-climate-tab="hvac"]', 1200)) return false;
      if (!await step(phone ? '#nav-audio' : '#card-av h2', 600, phone, phone)) return false;
      const source = async id => {
        if (!await step(phone ? `#source-btn-${id}` : `#card-av ch5-button[data-join="${150 + id}"]`, 1800)) return false;
        return step('#audio-confirm-video', 500, false);
      };
      if (!await source(1) || !await source(4)) return false;
      if (!await step('ch5-slider[sendeventonchange="52"], #volume-slider-mobile, input[type="range"][id*="volume"]', 1000, false)) return false;
      if (!await step(phone ? '#power-off-btn-mobile' : '#card-av ch5-button[data-join="200"]', 900)) return false;
    }
    return !token.cancelled;
  }
  if (gui.root.querySelector('.rk-ui')) {
    const selector = gui.root.querySelector('.rk-zone select');
    if (!selector) return false;
    const selectZone = async (id, deadline = Infinity) => {
      if (!await perform(selector, 0, false, deadline)) return false;
      setCursor?.(c => ({ ...c, pulse: c.pulse + 1, pressed: true }));
      lastPressAt = performance.now();
      if (gui.win.__restaurantGui?.selectZone) gui.win.__restaurantGui.selectZone(id);
      else {
        const setter = Object.getOwnPropertyDescriptor(gui.win.HTMLSelectElement.prototype, 'value')?.set;
        setter?.call(selector, id);
        selector.dispatchEvent(new gui.win.Event('input', { bubbles: true }));
        selector.dispatchEvent(new gui.win.Event('change', { bubbles: true }));
      }
      await sleep(160, token); setCursor?.(c => ({ ...c, pressed: false }));
      return !token.cancelled;
    };
    const rooms = [...selector.options].map(option => ({ id: option.value, name: option.textContent })).filter(zone => zone.id !== 'exterior');
    if (!rooms.length || !await selectZone(rooms[0].id)) return false;
    const waitForPress = scheduleFromFirstZone();
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      if (roomIndex > 0 && !await waitForPress(at => selectZone(rooms[roomIndex].id, at))) return false;
      for (const id of ['dinner', 'rooftop', 'welcome']) {
        if (!await waitForPress(at => perform(() => gui.root.querySelector(`[data-scene="${id}"]`), 0, true, at))) return false;
      }
    }
    if (!await waitForPress(at => selectZone('exterior', at))) return false;
    if (!await waitForPress(at => perform(() => gui.root.querySelector('[data-scene="closed"]'), 0, true, at))) return false;
    gui.win.__restaurantGui?.applyAllScene?.('closed');
    await sleep(GUIDED_DEMO_TIMING.stepDelay, token);
    return !token.cancelled;
  }
  // The luxury scenes use a native room selector and a same-origin GUI API.
  if (gui.win.ftvGui) {
    const api = gui.win.ftvGui;
    if (isGuidedProject(api.config.project)) {
      const yacht = api.config.project === 'yacht-monaco';
      const rooms = api.config.rooms;
      const selector = gui.doc.getElementById('zone');
      if (!selector || !rooms.length) return false;
      const selectRoom = async (id, deadline = Infinity) => {
        if (!await perform(selector, 0, false, deadline)) return false;
        setCursor?.(c => ({ ...c, pulse: c.pulse + 1, pressed: true }));
        lastPressAt = performance.now();
        api.selectRoom(id);
        await sleep(160, token);
        setCursor?.(c => ({ ...c, pressed: false }));
        return !token.cancelled;
      };
      // La GUI s'ouvre sur l'onglet Vue 3D : les scènes n'existent dans le DOM
      // qu'une fois l'onglet Lumière ouvert. Le curseur l'ouvre lui-même.
      const tabButton = name => () => [...(gui.doc.querySelectorAll?.(`[data-tab="${name}"]`) || [])]
        .find(el => { const r = el.getBoundingClientRect(); return r.width > 5 && r.height > 5; });
      if (api.state?.tab !== 'light' && tabButton('light')() && !await perform(tabButton('light'), 400)) return false;
      if (!await selectRoom(yacht ? rooms[0].id : 'hall')) return false;
      const waitForPress = scheduleFromFirstZone();
      const sceneOrder = yacht ? ['sunset', 'dinner', 'cruise'] : ['private', 'gala', 'opening'];
      for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        if (roomIndex > 0 && !await waitForPress(at => selectRoom(rooms[roomIndex].id, at))) return false;
        for (const id of sceneOrder) {
          if (!await waitForPress(at => perform(() => gui.doc.querySelector(`[data-preset="${id}"]`), 0, true, at))) return false;
        }
      }
      if (!await waitForPress(at => selectRoom('all', at))) return false;
      const closing = yacht ? 'night' : 'closed';
      if (!await waitForPress(at => perform(() => gui.doc.querySelector(`[data-preset="${closing}"]`), 0, true, at))) return false;
      await sleep(GUIDED_DEMO_TIMING.stepDelay, token);
      // Retour sur la Vue 3D, l'onglet d'accueil de ces deux GUI.
      if (tabButton('model')()) await perform(tabButton('model'), 400);
      return !token.cancelled;
    }
    for (const room of api.config.rooms.slice(0, 3)) {
      if (token.cancelled) return false;
      api.selectRoom(room.id);
      await sleep(1400, token);
      await menu('lights');
      await perform(q('[data-preset]:not([aria-pressed="true"])'), 1600);
      await menu('av');
      const sources = () => shown('[data-demo-source]');
      await perform(sources()[0], 1200);
      await perform(sources()[1], 1200);
      const play = q('[data-action="play"]');
      if (play?.getAttribute('aria-pressed') !== 'true') await perform(play, 900);
      await perform(q('[data-demo-action="volume"]'), 1000);
      await perform(q('[data-demo-action="av-off"]'), 900);
    }
    return !token.cancelled;
  }
  const roomSelector = '[data-demo-room], [data-demo-nav] button, .room-selector-btn, .room-nav-btn, .room-item, .room-btn, .room-button, .ap-room, .vl-room';
  const used = new Set();
  for (let visit = 0; visit < 3 && !token.cancelled; visit++) {
    await close();
    await menu('rooms');
    let rooms = shown('[data-demo-room]');
    if (!rooms.length) rooms = shown(roomSelector);
    const equipped = rooms.filter(el => el.dataset.demoAv === 'true');
    if (equipped.length) rooms = equipped;
    const room = rooms.find(el => !used.has(el.dataset.demoRoom || text(el)));
    if (room) {
      used.add(room.dataset.demoRoom || text(room));
      await perform(room, 1400);
    } else if (visit && !rooms.length) break;
    await menu('lights'); await close();
    await menu('hvac'); await close();
    await menu('av');
    const sources = () => shown('[data-demo-source], .source-btn, .av-source-btn, .source-card, .ac-src button, .vl-source-grid button, .vl-source-list button, .hc-source-grid button, .hc-source');
    const apple = sources().find(el => el.dataset.demoSource === 'apple' || /apple|stream/.test(text(el))) || sources()[0];
    const appleLabel = apple && text(apple);
    await perform(apple, 2200);
    const alternatives = sources().filter(el => text(el) !== appleLabel);
    const iptv = alternatives.find(el => el.dataset.demoSource === 'iptv' || /iptv|swisscom|television|\btv\b/.test(text(el))) || alternatives[0];
    if (iptv !== apple) await perform(iptv, 2200);
    await perform(q('[data-demo-action="volume"], [class*="volume"] input[type="range"], [class*="vol"] input[type="range"], input[aria-label="Volume"]'), 1000);
    // Only multimedia power; never global OFF, alarms, or unrelated settings.
    await perform(q('[data-demo-action="av-off"], .av-power-off, .audio-power-off'), 1000);
    await close();
  }
  return !token.cancelled;
}
