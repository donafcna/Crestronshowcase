// Ordered, capability-aware tour. No random control clicks.
const text = el => (el.getAttribute('aria-label') || el.getAttribute('label') || el.textContent || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const categories = {
  rooms: /^(pieces|rooms|raume)$/,
  lights: /^(eclairage|lumieres|luminosite|lighting|lights|licht|beleuchtung)/,
  hvac: /^(hvac|climat|temperature|chauffage|climate|klima|heizung)/,
  av: /^(audio|video|media|sources|musique|music|medien|sonorisation)/,
};
export async function runOrderedDemo({ gui, token, sleep, moveTo, act, visible }) {
  const all = selector => [...gui.root.querySelectorAll(selector)];
  const shown = selector => all(selector).filter(el => {
    const r = el.getBoundingClientRect(), slider = el.matches('input[type="range"],ch5-slider');
    return Math.max(r.width, r.height) > 5 && (slider || Math.min(r.width, r.height) > 5)
      && gui.win.getComputedStyle(el).visibility !== 'hidden';
  });
  const q = selector => shown(selector)[0];
  const perform = async (el, wait = 1300, click = true) => {
    if (!el || token.cancelled) return false;
    if (!visible(el, gui)) {
      // Reveal the target before moving the pointer, including nested clipped
      // panels in a scaled chassis. Instant avoids racing CSS smooth scrolling.
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      await sleep(250, token);
    } else await sleep(150, token);
    if (token.cancelled || !visible(el, gui) || !await moveTo(el, gui)) return false;
    if (click && !token.cancelled) await act(el, gui);
    await sleep(wait, token);
    return !token.cancelled;
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
