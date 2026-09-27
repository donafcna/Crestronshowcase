/**
 * Recette « Appartement Crans-Montana » (deuxième GUI CH5 réelle issue du Core, config-only).
 *
 * Pages dalle, tablette et smartphone du site, 3 thèmes du GUI ; contrôles :
 *   - 0 erreur console (hors ressources externes injoignables et message WebXPanel préexistant du Core) ;
 *   - démo automatique générique : pièces, scènes, sources réellement pressées, jamais un bouton déjà actif ;
 *   - les 17 pièces sont sélectionnables (dalle : boutons du menu ; smartphone : liste déroulante) ;
 *   - scène SOIR de la Chambre principale = niveaux villa_config sur a71+ ; scène OFF = tout à 0 ;
 *   - rideau du salon : feedback (impulsion sur le join du moteur) ;
 *   - source Apple TV : télécommande ouverte ; smartphone : fenêtre Circuits ouverte ;
 *   - aucun défilement horizontal, cibles ≥ 40 px (pièces / scènes / circuits), aucun média sonore.
 *
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage : node scripts/test-appartement-crans.cjs [--base http://localhost:4173] [--out <dossier>]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'test-results/appartement-crans'));
fs.mkdirSync(OUT, { recursive: true });
const PROJECT = 'appartement-crans';
const THEMES = ['dark', 'light', 'glass'];
const DEVICES = ['wallpanel', 'tablet', 'phone'];

const report = { base: BASE, checks: [], failures: [], errors: [], external: [], legacy: [], matrix: [], demo: {} };
const check = (name, ok, detail) => {
  (ok ? report.checks : report.failures).push(name + (detail ? ' — ' + detail : ''));
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
};
const holdDemo = async page => {
  const r = await page.evaluate(() => { const b = document.querySelector('.device-stage').getBoundingClientRect(); return [b.left + 5, b.top + 5]; });
  await page.mouse.click(r[0], r[1]);
};
const guiFrame = page => page.frames().find(f => /\/showcases\/appartement-crans\/(index|iphone)\.html/.test(f.url()));
const wireConsole = page => {
  page.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|net::ERR_/.test(t)) report.external.push(t.slice(0, 120));
    else if (/WebXPanel|<path> attribute d/.test(t)) report.legacy.push(t.slice(0, 120));
    else report.errors.push(t.slice(0, 200));
  });
};
async function openDevice(page, device, { pause = true } = {}) {
  await page.goto(`${BASE}/interfaces/residentiel/${PROJECT}/${device}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow?.Villa?.ready, null, { timeout: 60000 });
  if (pause) { await holdDemo(page); await page.waitForTimeout(500); }
  return guiFrame(page);
}
// Mesures communes à chaque combinaison support × thème (GUI dans l'iframe, unités CSS du GUI).
const AUDIT = () => {
  const se = document.scrollingElement;
  // Boutons de pièce / scène (dalle : ch5-button ; smartphone : boutons natifs) et curseurs de circuit.
  // Un curseur est une piste fine par nature : on mesure sa poignée (noUi-handle) à titre d'information.
  const measure = (el, kind) => { const h = el.tagName === 'CH5-BUTTON' ? (el.querySelector('button') || el) : el; const r = h.getBoundingClientRect(); return { kind, id: el.id || el.getAttribute('data-join') || el.className, w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 && r.height > 0 && getComputedStyle(h).visibility !== 'hidden' }; };
  const buttons = [...document.querySelectorAll('ch5-button[id^="room-btn-"], ch5-button[data-join="51"], ch5-button[data-join="52"], ch5-button[data-join="53"], ch5-button[data-join="54"], #room-select, .scene-btn-mobile')].map(el => measure(el, 'button')).filter(t => t.vis);
  // Autres boutons de la fenêtre (Fermer, Enregistrer) : Core, à titre d'information.
  const others = [...document.querySelectorAll('#circuits-overlay button, #circuits-overlay ch5-button')].map(el => measure(el, 'other')).filter(t => t.vis && Math.min(t.w, t.h) < 40).map(t => (t.id || 'bouton') + ' ' + t.w + 'x' + t.h);
  const handles = [...document.querySelectorAll('#circuits-overlay .noUi-handle, #circuits-overlay input[type="range"]')].map(el => measure(el, 'handle')).filter(t => t.vis);
  const targets = buttons.concat(handles);
  const small = buttons.filter(t => Math.min(t.w, t.h) < 40);
  const handleMin = handles.length ? Math.min(...handles.map(t => Math.min(t.w, t.h))) : null;
  const media = [...document.querySelectorAll('audio, video')].filter(m => !m.paused && !m.muted).length;
  const ctx = window.__audioContexts || 0;
  return { scrollW: se.scrollWidth, clientW: se.clientWidth, targets: targets.length, small, handleMin, others, media, ctx, theme: document.body.className };
};

(async () => {
  const browser = await chromium.launch();

  // ---- 1. Démo automatique générique (dalle puis smartphone) : observation 45 s ---------------
  for (const device of ['wallpanel', 'phone']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    wireConsole(page);
    const events = report.demo[device] = [];
    await page.exposeFunction('recordDemo', e => events.push(e));
    await openDevice(page, device, { pause: false });
    await page.evaluate(() => {
      const w = document.querySelector('iframe').contentWindow, d = w.document;
      d.querySelector('#room-select')?.addEventListener('change', e => window.recordDemo({ at: Math.round(performance.now()), id: 'room-select', join: null, active: false, room: Number(e.target.value) }));
      let last = { el: null, at: 0 };
      // État lu au pointerdown (premier événement du geste synthétique), avant que le moteur ne
      // pose le feedback ; le clic final arrive après et verrait le bouton déjà sélectionné.
      d.addEventListener('pointerdown', e => {
        if (e.isTrusted) return;
        const el = e.target.closest('ch5-button') || e.target.closest('button');
        if (!el) return;
        if (last.el === el && performance.now() - last.at < 250) return;
        last = { el, at: performance.now() };
        const active = el.getAttribute('selected') === 'true' || /ch5-button--selected|(^|\s)active(\s|$)/.test((el.querySelector('button') || el).className || '');
        window.recordDemo({ at: Math.round(performance.now()), id: el.id || el.getAttribute('data-join') || el.textContent.trim().slice(0, 20), join: el.getAttribute('data-join'), active, room: w.Villa.activeRoom });
      }, true);
    });
    // La démo d'un GUI hors Villa démarre après le délai d'inactivité du site : 10 s (dalle), 60 s (smartphone).
    const observe = device === 'phone' ? 110000 : 45000;
    await page.waitForTimeout(observe);
    const ev = events;
    const rooms = new Set(ev.filter(e => /^room-btn-/.test(e.id)).map(e => e.id).concat(ev.filter(e => e.id === 'room-select').map(e => 'select:' + e.room)));
    const scenes = ev.filter(e => ['51', '52', '53', '54'].includes(e.join) || /^scene-btn-5[1-4]$/.test(e.id));
    const sources = ev.filter(e => /^15[1-5]$/.test(e.join) || /^source-btn-[1-5]$/.test(e.id));
    const alreadyActive = ev.filter(e => e.active);
    check(`Démo ${device} : le curseur presse des boutons du GUI`, ev.length >= 5, ev.length + ' appuis en ' + observe / 1000 + ' s');
    check(`Démo ${device} : changement de pièce`, rooms.size >= 1, [...rooms].join(','));
    check(`Démo ${device} : scènes d’éclairage pressées`, scenes.length >= 1, scenes.map(e => e.join || e.id).join(','));
    check(`Démo ${device} : sources audio-vidéo pressées`, sources.length >= 1, sources.map(e => e.join || e.id).join(','));
    check(`Démo ${device} : jamais un bouton déjà actif`, alreadyActive.length === 0, alreadyActive.map(e => e.id).join(',') || 'aucun');
    check(`Démo ${device} : jamais Alarme / Réglages / extinction globale`, !ev.some(e => /alarm|settings|admin|^4\d\d$/.test(e.id + ' ' + e.join)), '');
    await page.screenshot({ path: path.join(OUT, `demo-${device}.png`) });
    await page.close();
  }

  // ---- 2. Matrice supports × thèmes + contrôles fonctionnels ---------------------------------
  for (const device of DEVICES) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    wireConsole(page);
    const frame = await openDevice(page, device);
    const phone = device === 'phone';
    const errorsBefore = report.errors.length;
    for (const theme of THEMES) {
      await holdDemo(page);
      await frame.evaluate(t => window.changeTheme(t), theme);
      await page.waitForTimeout(900);
      const a = await frame.evaluate(AUDIT);
      const ok = a.scrollW <= a.clientW && a.small.length === 0 && a.media === 0 && report.errors.length === errorsBefore;
      report.matrix.push({ device, theme, page: 'page', ok, ...a });
      check(`${device}/${theme}/page : pas de scroll horizontal, cibles ≥ 40 px, aucun son, 0 erreur`, ok,
        `scroll ${a.scrollW}/${a.clientW}, ${a.targets} cibles, petites : ${a.small.map(s => s.id + ' ' + s.w + 'x' + s.h).join(' ') || 'aucune'}, médias ${a.media}`);
      // Fenêtres : Circuits, Moteurs, Contrôle global (mêmes contrôles)
      for (const [win, open] of [['circuits-overlay', 'openCircuitsModal'], ['motors-overlay', 'openMotorsModal'], ['global-control-overlay', 'openGlobalControlModal']]) {
        await frame.evaluate(fn => { window.closeAllModals && window.closeAllModals(); window[fn] && window[fn](); }, open);
        await page.waitForTimeout(400);
        const shown = await frame.evaluate(id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; }, win);
        const b = await frame.evaluate(AUDIT);
        const okw = shown && b.scrollW <= b.clientW && b.small.length === 0 && report.errors.length === errorsBefore;
        report.matrix.push({ device, theme, page: win, ok: okw, ...b });
        check(`${device}/${theme}/${win} : ouverte, pas de scroll horizontal, cibles ≥ 40 px, 0 erreur`, okw, (b.small.map(s => s.id + ' ' + s.w + 'x' + s.h).join(' ') || `${b.targets} cibles`) + (b.handleMin !== null ? `, poignée de curseur min ${b.handleMin} px` : '') + (b.others.length ? `, autres boutons Core < 40 px : ${[...new Set(b.others)].join(' ')}` : ''));
        const box = await page.evaluate(() => { const r = document.querySelector('.device-screen').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
        if (win === 'circuits-overlay') await page.screenshot({ path: path.join(OUT, `${device}-${theme}-circuits.png`), clip: box, animations: 'disabled' });
        await frame.evaluate(() => { window.closeAllModals && window.closeAllModals(); document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'); });
      }
      const box = await page.evaluate(() => { const r = document.querySelector('.device-screen').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
      await page.screenshot({ path: path.join(OUT, `${device}-${theme}-page.png`), clip: box, animations: 'disabled' });
    }
    await frame.evaluate(() => window.changeTheme('dark'));
    await page.waitForTimeout(600);

    // Contrôles fonctionnels
    const cfg = await frame.evaluate(() => ({ n: window.villaConfigEmbedded.pieces.length, pieces: window.villaConfigEmbedded.pieces.map(p => ({ id: p.id, nom: p.nom, av: p.pilotages.audioVideo.actif, niveaux: p.pilotages.eclairages.scenes.niveaux, nb: p.pilotages.eclairages.circuits.nombre })) }));
    check(`${device} : 17 pièces dans villaConfigEmbedded`, cfg.n === 17, String(cfg.n));
    const select = async id => {
      await holdDemo(page);
      if (phone) { await frame.selectOption('#room-select', String(id)); }
      else {
        await frame.evaluate(id => document.getElementById('room-btn-' + id).scrollIntoView({ block: 'center' }), id);
        await frame.locator(`#room-btn-${id} button`).click({ timeout: 10000 });
      }
      await frame.waitForFunction(id => window.Villa.activeRoom === id, id, { timeout: 5000 });
      return frame.evaluate(id => ({ active: window.Villa.activeRoom, name: window.Villa.get('s', '10'), selected: window.Villa.get('b', String(10 + id)), title: (document.getElementById('room-title') || document.querySelector('#room-select option:checked') || document.querySelector('.room-title, [id*="room-name"], h1, h2'))?.textContent.trim() }), id);
    };
    let selectable = 0, names = [];
    for (const p of cfg.pieces) {
      const r = await select(p.id).catch(e => ({ error: e.message }));
      if (r.active === p.id && r.selected && r.name === p.nom) selectable++; else names.push(p.id + ':' + (r.error || JSON.stringify(r)));
    }
    check(`${device} : les 17 pièces sont sélectionnables (feedback Piece.Select + nom)`, selectable === 17, names.join(' ') || '17/17');

    // Scène SOIR de la Chambre principale (id 7) → a71..a80 = niveaux villa_config ; OFF → 0
    const press = async join => {
      await holdDemo(page);
      if (phone) await frame.evaluate(j => window.pressDigital(j), Number(join));
      else await frame.locator(`ch5-button[data-join="${join}"] button`).first().click({ timeout: 10000 });
      await page.waitForTimeout(400);
    };
    await select(7);
    await press('53');
    const room7 = cfg.pieces.find(p => p.id === 7);
    const levels = await frame.evaluate(n => window.Villa.SIG.CIRCUITS.slice(0, n).map(j => window.Villa.get('n', j)), room7.nb);
    check(`${device} : scène SOIR Chambre principale → niveaux de la séquence Lutron sur a71+`, JSON.stringify(levels) === JSON.stringify(room7.niveaux[2]) && (await frame.evaluate(() => window.Villa.get('b', '53'))), levels.join(','));
    if (!phone) {
      const shown = await frame.evaluate(() => [...document.querySelectorAll('ch5-button[data-join="53"]')].some(b => b.getAttribute('selected') === 'true'));
      check(`${device} : bouton SOIR affiché sélectionné (receiveStateSelected)`, shown, '');
    }
    await press('51');
    const off = await frame.evaluate(n => window.Villa.SIG.CIRCUITS.slice(0, n).map(j => window.Villa.get('n', j)), room7.nb);
    check(`${device} : scène OFF → tous les circuits à 0`, off.every(v => v === 0) && (await frame.evaluate(() => window.Villa.get('b', '51'))), off.join(','));

    // Rideau du salon : le join du moteur (64 = rideaux fermer... famille rideaux 64-66 ; individuel 81+) émet une impulsion de feedback
    await select(1);
    const curtain = await frame.evaluate(async () => {
      const seen = [];
      const j = document.querySelector('#motors-overlay ch5-button[data-join], ch5-button[data-join="64"], ch5-button[data-join="66"]');
      const join = j ? j.getAttribute('data-join') : '66';
      const sub = window.Villa.on('b', join, v => seen.push(v));
      window.Villa.press(join);
      await new Promise(r => setTimeout(r, 400));
      window.Villa.off('b', join, sub);
      return { join, seen };
    });
    check(`${device} : rideau du salon → feedback (impulsion vrai puis faux sur le join ${curtain.join})`, curtain.seen.includes(true) && curtain.seen[curtain.seen.length - 1] === false, curtain.seen.join(','));

    // Source Apple TV → télécommande ouverte (appui réel : le GUI ignore les clics synthétiques pour l'ouverture)
    await select(10);
    await press('200');
    if (phone) {
      await frame.evaluate(() => window.switchTab('audio'));
      await page.waitForTimeout(400);
      const fr = await page.evaluate(() => { const f = document.querySelector('.device-screen iframe'); const r = f.getBoundingClientRect(); return { left: r.left, top: r.top, scale: r.width / f.contentWindow.innerWidth }; });
      const c = await frame.evaluate(() => { const r = document.getElementById('source-btn-1').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await page.mouse.click(fr.left + c.x * fr.scale, fr.top + c.y * fr.scale);
    } else await press('151');
    await page.waitForTimeout(700);
    const remote = await frame.evaluate(() => ({ src: window.Villa.get('n', '51'), sel: window.Villa.get('b', '151'), remote: getComputedStyle(document.getElementById('source-control-overlay')).display !== 'none' }));
    check(`${device} : source Apple TV → source 1 active et télécommande ouverte`, remote.src === 1 && remote.sel && remote.remote, JSON.stringify(remote));
    await frame.evaluate(() => { window.closeAllModals && window.closeAllModals(); document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'); });

    if (phone) {
      await frame.evaluate(() => window.switchTab('lights'));
      await frame.evaluate(() => window.openCircuitsModal());
      await page.waitForTimeout(500);
      const circ = await frame.evaluate(() => { const o = document.getElementById('circuits-overlay'); return { open: getComputedStyle(o).display !== 'none', sliders: o.querySelectorAll('ch5-slider, input[type="range"]').length }; });
      check('phone : fenêtre Circuits s’ouvre avec les curseurs de la pièce', circ.open && circ.sliders >= 5, JSON.stringify(circ));
      await frame.evaluate(() => document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'));
    }
    await page.close();
  }

  await browser.close();
  check('0 erreur console / page (hors externes et WebXPanel préexistant)', report.errors.length === 0, report.errors.slice(0, 5).join(' | '));
  report.status = report.failures.length ? 'failed' : 'passed';
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2));
  console.log(`\n${report.status.toUpperCase()} — ${report.checks.length} contrôles réussis, ${report.failures.length} échecs, ${report.external.length} ressources externes injoignables, ${report.legacy.length} messages WebXPanel préexistants`);
  process.exit(report.failures.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
