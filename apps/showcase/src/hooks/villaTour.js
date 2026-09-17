// Showcase-only tour. Finish each room's demonstration before changing chassis.
export const VILLA_PROJECT = 'villa-gemini-frequencetv';
export const VILLA_TOUR = { overview: 3000, phone: 60000, wallpanel: 10000 };

export function createVillaSession() {
  return {
    started: null, hiddenAt: null, overview: true,
    seconds() { return this.started === null ? 0 : ((this.hiddenAt ?? performance.now()) - this.started) / 1000; },
    visibility(hidden) {
      if (hidden) this.hiddenAt = performance.now();
      else if (this.hiddenAt !== null) {
        if (this.started !== null) this.started += performance.now() - this.hiddenAt;
        this.hiddenAt = null;
      }
    },
  };
}

// Complete a room before leaving it: the old 5 s slot cut off meaningful actions.
export async function runVillaTour({ gui, device, sessionRef, token, sleep, moveTo, act, setCursor, visible }) {
  const session = sessionRef.current, phone = device === 'phone';
  for (let i = 0; i < 180 && !token.cancelled; i++) {
    if (gui.win.Villa?.ready && (!phone || window.__plan3d)) break;
    await sleep(250, token);
  }
  if (token.cancelled || !gui.win.Villa?.ready) return false;
  const plan = phone ? window.__plan3d : null;
  if (session.started === null) session.started = performance.now();
  let lastAmbience = null, visiting = null;
  const isNight = () => { const t = session.seconds() % 80; return t >= 30 && t < 70; };
  const ambience = (force = false) => {
    const night = isNight();
    if (token.cancelled || (!force && night === lastAmbience)) return;
    lastAmbience = night;
    // The active demonstration owns its lighting and motors until AV OFF.
    plan?.applyDemoAmbience(gui.win.Villa.applyDemoAmbience(night, visiting));
    if (!plan) gui.win.Villa.applyDemoAmbience(night, visiting);
  };
  ambience();
  const timer = setInterval(ambience, 100);
  token.cancels.push(() => clearInterval(timer));
  const find = selector => [...gui.doc.querySelectorAll(selector)].find(el => visible(el, gui));
  const step = async (selector, dwell = 900, click = true) => {
    if (token.cancelled) return false;
    const el = find(selector);
    if (!el || !await moveTo(el, gui) || token.cancelled) return false;
    if (click) await act(el, gui);
    await sleep(dwell, token);
    return !token.cancelled;
  };
  const motors = async close => {
    const R = plan?.rooms[visiting];
    if (!R?.shades || !Object.keys(R.shades).length) return;
    // Use the actual GUI and its pagination; never click controls behind another page.
    while (!token.cancelled && find('#moteurs-pager .prev:not(:disabled)'))
      await step('#moteurs-pager .prev', 100);
    const families = [['volet', 61], ['rideau', 64], ['store', 67]];
    for (let page = 0; page < 6 && !token.cancelled; page++) {
      for (const [family, join] of families) {
        if (!R.shades[family] && !(family === 'store' && R.shades.banne)) continue;
        await step(`#iphone-shades-rows button[onclick*="pressDigital(${join + (close ? 2 : 0)})"]`, 180);
      }
      if (!find('#moteurs-pager .next:not(:disabled)')) break;
      await step('#moteurs-pager .next', 150);
    }
    // Four-second motors must finish before demonstrating the resulting light.
    const deadline = performance.now() + 5000;
    while (!token.cancelled && performance.now() < deadline &&
      Object.values(R.shades).some(m => Math.abs(m.pos - m.cible) > .002)) await sleep(100, token);
  };
  const source = async id => {
    await step(phone ? `#source-btn-${id}` : `#card-av ch5-button[data-join="${150 + id}"]`, 1800);
    // A room can already be playing music: explicitly choose the video's audio.
    await step('#audio-confirm-video', 500);
  };
  try {
    if (phone && plan) {
      session.overview = true; plan.holdOverview(true); plan.overview();
      while (!token.cancelled && plan.navigation().phase !== 'overview-closed') await sleep(50, token);
      await sleep(VILLA_TOUR.overview, token);
    }
    const start = performance.now();
    const minimum = phone ? VILLA_TOUR.phone - VILLA_TOUR.overview : VILLA_TOUR.wallpanel;
    let visits = 0;
    while (!token.cancelled && (performance.now() - start < minimum || (['tablet', 'desktop'].includes(device) && visits < 3))) {
      let options = phone
        ? [...(gui.doc.querySelector('#room-select')?.options || [])].filter(o => o.value && !o.disabled).map(o => Number(o.value))
        : [...gui.doc.querySelectorAll('ch5-button[data-room-id]')].filter(el => visible(el, gui)).map(el => Number(el.dataset.roomId));
      if (plan) options = options.filter(id => plan.rooms[id]?.tv && plan.rooms[id]?.speakers?.length);
      if (!options.length) break;
      session.roomBag ??= [];
      session.roomBag = session.roomBag.filter(id => options.includes(id));
      if (!session.roomBag.length) session.roomBag = options.slice();
      const choices = session.roomBag.filter(id => id !== Number(gui.win.Villa.activeRoom));
      const id = choices[Math.floor(Math.random() * choices.length)] ?? options[0];
      session.roomBag = session.roomBag.filter(n => n !== id);
      visiting = id;
      if (phone) {
        const select = find('#room-select');
        if (!select || !await moveTo(select, gui) || token.cancelled) break;
        session.overview = false; plan?.holdOverview(false);
        setCursor(c => ({ ...c, pulse:c.pulse + 1 }));
        select.value = String(id);
        select.dispatchEvent(new gui.win.Event('change', { bubbles:true }));
        plan?.focusSelected();
      } else await step(`ch5-button[data-room-id="${id}"]`, 150);
      await sleep(1600, token);
      await step(phone ? '#nav-lights' : '#tab-lights-btn', 800);
      if (phone) {
        // Freeze the branch for this visit; dusk must not interrupt a three-second fade.
        const night = isNight();
        await motors(true);
        if (night) await step('#scene-btn-54', 3400);
        await step('#scene-btn-52', 3400);
        if (!night) await motors(false);
      }
      await step(phone ? '#nav-hvac' : '#card-cvc [data-climate-tab="hvac"]', 1700);
      await step(phone ? '#nav-audio' : '#card-av h2', 800, phone);
      await source(1);
      await source(4);
      await step('ch5-slider[sendeventonchange="52"]', 1000);
      // OFF here is AV only: the room's low scene stays lit.
      await step(phone ? '#power-off-btn-mobile' : '#card-av ch5-button[data-join="200"]', 900);
      if (token.cancelled) break;
      visiting = null; ambience(true); visits++;
    }
    return !token.cancelled;
  } finally {
    clearInterval(timer);
    session.overview = false; plan?.holdOverview(false);
    setCursor(c => ({ ...c, visible:false, pressed:false }));
  }
}
