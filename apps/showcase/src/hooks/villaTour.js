// Showcase-only tour. Deadlines are independent of cursor travel and camera tweens.
export const VILLA_PROJECT = 'villa-gemini-frequencetv';
export const VILLA_TOUR = { overview: 3000, room: 5000, phone: 60000, wallpanel: 10000 };

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

export async function runVillaTour({ gui, device, sessionRef, token, sleep, moveTo, act, collect, setCursor }) {
  const session = sessionRef.current;
  const phone = device === 'phone';
  // Wait for the real feedback initialization, not merely the iframe's load event.
  for (let i = 0; i < 180 && !token.cancelled; i++) {
    if (gui.win.Villa?.ready && (!phone || window.__plan3d)) break;
    await sleep(250, token);
  }
  if (token.cancelled || !gui.win.Villa?.ready) return false;
  const plan = phone ? window.__plan3d : null;
  if (session.started === null) session.started = performance.now();
  let lastAmbience = null;
  const ambience = () => {
    const phase = session.seconds() % 80;
    const night = phase >= 30 && phase < 70; // begin dusk / begin dawn, same 30/10/30/10 clock
    if (night === lastAmbience || token.cancelled) return;
    lastAmbience = night;
    const snapshot = gui.win.Villa.applyDemoAmbience(night);
    plan?.applyDemoAmbience(snapshot);
  };
  ambience();
  const timer = setInterval(ambience, 100);
  token.cancels.push(() => clearInterval(timer));
  try {
    if (phone && plan) {
      session.overview = true;
      plan.holdOverview(true);
      plan.overview();
      // A resumed manual visit returns smoothly before the three-second introduction.
      while (!token.cancelled && plan.navigation().phase !== 'overview-closed') await sleep(50, token);
    }
    if (token.cancelled) return false;
    const start = performance.now(), end = start + VILLA_TOUR[device];
    const until = async deadline => { if (deadline > performance.now()) await sleep(deadline - performance.now(), token); };
    const options = [...(gui.doc.querySelector('#room-select')?.options || [])].filter(o => o.value && !o.disabled);
    let bag = [], previous = Number(gui.win.Villa.activeRoom), visit = 0;
    let next = start + (phone ? VILLA_TOUR.overview : 0);
    while (!token.cancelled && performance.now() < end) {
      if (phone && options.length) {
        const select = gui.doc.querySelector('#room-select');
        await until(next - 810); // move the pointer first; change the room at the deadline
        if (token.cancelled) return false;
        await moveTo(select, gui);
        await until(next);
        if (token.cancelled || performance.now() >= end) break;
        if (!bag.length) bag = options.map(o => Number(o.value));
        const choices = bag.filter(id => id !== previous);
        const pool = choices.length ? choices : options.map(o => Number(o.value)).filter(id => id !== previous);
        const id = pool[Math.floor(Math.random() * pool.length)] ?? previous;
        bag = bag.filter(v => v !== id); previous = id;
        session.overview = false; plan?.holdOverview(false);
        setCursor(c => ({ ...c, pulse: c.pulse + 1 }));
        select.value = String(id);
        select.dispatchEvent(new gui.win.Event('change', { bubbles: true }));
        plan?.focusSelected();
      }
      // Show useful controls without undoing the day/night lighting or curtains.
      // Tabs, HVAC and volume stay inline: no settings, alarms or orphaned remote modal.
      const deadline = Math.min(end, next + VILLA_TOUR.room);
      const tab = phone ? gui.doc.querySelector(['#nav-hvac', '#nav-audio', '#nav-lights'][visit++ % 3]) : null;
      if (tab && !tab.classList.contains('active') && performance.now() + 1100 < deadline) {
        if (await moveTo(tab, gui) && !token.cancelled) await act(tab, gui);
      }
      await sleep(350, token);
      const candidates = collect(gui).actions.filter(el => {
        const join = Number(el.getAttribute('data-join'));
        return (join >= 612 && join <= 615) || join === 49 || join === 50 ||
          (el.tagName === 'CH5-SLIDER' && ['52', '254'].includes(el.getAttribute('sendeventonchange'))) ||
          (el.tagName === 'INPUT' && el.type === 'range' && /volume/i.test(el.id));
      });
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      if (target && !token.cancelled && performance.now() + 2300 < deadline) {
        if (await moveTo(target, gui) && !token.cancelled) await act(target, gui);
      }
      next += VILLA_TOUR.room;
      await until(Math.min(end, next - (phone ? 810 : 0)));
    }
    await until(end);
    return !token.cancelled;
  } finally {
    clearInterval(timer);
    session.overview = false;
    plan?.holdOverview(false);
    setCursor(c => ({ ...c, visible: false, pressed: false }));
  }
}
