/**
 * Recette fonctionnelle « Appartement Crans-Montana » — interface Connect du Core (v5.4, 29.09.2026).
 *
 * Dalle, tablette et smartphone du site ; contrôles :
 *   - configuration : 17 pièces, meta.interface = "connect", aucune pièce A/V, alarme retirée ;
 *   - interface Connect active, Core d'origine masqué, aucun texte A/V / alarme / caméra ;
 *   - démo automatique : pièces, ambiances, tuiles, stores, climat réellement pressés ; jamais un bouton
 *     déjà actif ; jamais de commande globale ;
 *   - les 17 pièces sont sélectionnables (feedback Piece.Select a10) ;
 *   - ambiance SOIR de la Suite parentale = niveaux villa_config sur a71+ ; OFF = tout à 0 ;
 *   - tuile : glisser règle le niveau du circuit (a71), appui court bascule Éteint / 100 % ;
 *   - store : impulsion sur le join du moteur (81 + 3 × n + 0/1/2) ;
 *   - climat : +0,5 °C (d49 → a31), ventilation 2 (d614 → a61), arrêt (d611) ;
 *   - scène globale « Tout éteindre » (d402) → circuits de la pièce à 0 ;
 *   - langue EN : onglets traduits ;
 *   - 0 erreur console (hors ressources externes et message WebXPanel préexistant du Core).
 *
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage : node scripts/test-appartement-crans.cjs [--base http://localhost:4173] [--out <dossier>] [--no-demo]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'test-results/appartement-crans'));
const NO_DEMO = process.argv.includes('--no-demo');
fs.mkdirSync(OUT, { recursive: true });
const PROJECT = 'appartement-crans';
const DEVICES = ['wallpanel', 'tablet', 'phone'];

const report = { base: BASE, checks: [], failures: [], errors: [], external: [], legacy: [], demo: {} };
const check = (name, ok, detail) => {
  (ok ? report.checks : report.failures).push(name + (detail ? ' — ' + detail : ''));
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
};
const holdDemo = async page => {
  const r = await page.evaluate(() => { const b = document.querySelector('.device-stage'); if (!b) return [5, 5]; const q = b.getBoundingClientRect(); return [q.left + 5, q.top + 5]; });
  await page.mouse.click(r[0], r[1]);
};
const guiFrame = page => page.frames().find(f => /\/showcases\/appartement-crans\/(index|iphone)\.html/.test(f.url()));
const wireConsole = page => {
  page.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/net::ERR_/.test(t)) report.external.push(t.slice(0, 120));
    else if (/WebXPanel|<path> attribute d/.test(t)) report.legacy.push(t.slice(0, 120));
    else report.errors.push(t.slice(0, 200));
  });
};
async function openDevice(page, device, { pause = true } = {}) {
  await page.goto(`${BASE}/interfaces/residentiel/${PROJECT}/${device}`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const w = document.querySelector('iframe')?.contentWindow; return w?.Villa?.ready && w?.ConnectUI?.active(); }, null, { timeout: 60000 });
  if (pause) { await holdDemo(page); await page.waitForTimeout(500); }
  return guiFrame(page);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

  // ---- 1. Démo automatique (dalle puis smartphone) --------------------------------------------
  const ONLY = arg('--demo-only', null);
  if (!NO_DEMO) for (const device of (ONLY ? [ONLY] : ['wallpanel', 'phone'])) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    wireConsole(page);
    const events = report.demo[device] = [];
    await page.exposeFunction('recordDemo', e => events.push(e));
    await openDevice(page, device, { pause: false });
    await page.evaluate(() => {
      const w = document.querySelector('iframe').contentWindow, d = w.document;
      let last = { el: null, at: 0 };
      d.addEventListener('pointerdown', e => {
        if (e.isTrusted) return;
        const el = e.target.closest('button, [data-cx-tile]');
        if (!el || !el.closest('#cx-root')) return;
        if (last.el === el && performance.now() - last.at < 250) return;
        last = { el, at: performance.now() };
        const active = el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-current') === 'true' || el.getAttribute('aria-selected') === 'true';
        const attrs = [...el.attributes].filter(a => a.name.startsWith('data-cx-')).map(a => a.name.slice(8) + '=' + a.value).join(' ');
        window.recordDemo({ at: Math.round(performance.now()), attrs, active, room: w.Villa.activeRoom });
      }, true);
    });
    const observe = device === 'phone' ? 160000 : 50000;
    await page.waitForTimeout(observe);
    const ev = events;
    const has = re => ev.filter(e => re.test(e.attrs));
    check(`Démo ${device} : le curseur presse des commandes de l'interface`, ev.length >= 6, ev.length + ' appuis en ' + observe / 1000 + ' s');
    check(`Démo ${device} : changement de pièce`, has(/^room=/).length >= 1, has(/^room=/).map(e => e.attrs).join(','));
    check(`Démo ${device} : ambiances pressées`, has(/^scene=/).length >= 1, has(/^scene=/).map(e => e.attrs).join(','));
    check(`Démo ${device} : tuile d'éclairage, store et climat pressés`, has(/^tile=/).length >= 1 && has(/^motor=/).length >= 1 && has(/^press=49/).length >= 1, '');
    check(`Démo ${device} : jamais un bouton déjà actif`, ev.every(e => !e.active), ev.filter(e => e.active).map(e => e.attrs).join(',') || 'aucun');
    check(`Démo ${device} : jamais de commande globale ni de réglage`, !ev.some(e => /global=|theme=|lang=/.test(e.attrs)), '');
    await page.screenshot({ path: path.join(OUT, `demo-${device}.png`) });
    await page.close();
  }

  // ---- 2. Contrôles fonctionnels par support ---------------------------------------------------
  for (const device of (ONLY ? [] : DEVICES)) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    wireConsole(page);
    const frame = await openDevice(page, device);
    const errorsBefore = report.errors.length;
    const keep = setInterval(() => { holdDemo(page).catch(() => {}); }, 8000);
    const click = sel => frame.evaluate(s => { const el = document.querySelector('#cx-root ' + s); if (!el) return false; el.click(); return true; }, sel);

    const cfg = await frame.evaluate(() => { const c = window.villaConfigEmbedded; return { n: c.pieces.length, iface: c.meta.interface, av: c.pieces.filter(p => p.pilotages.audioVideo && p.pilotages.audioVideo.actif).length, alarme: c.contrat.alarme.actif, partitions: c.pieces.reduce((a, p) => a + ((p.pilotages.controlesGeneraux || {}).partitionsAlarme || 0), 0) }; });
    check(`${device} : config 17 pièces, interface connect, 0 pièce A/V, alarme retirée`, cfg.n === 17 && cfg.iface === 'connect' && cfg.av === 0 && cfg.alarme === false && cfg.partitions === 0, JSON.stringify(cfg));
    const ui = await frame.evaluate(() => ({ core: [...document.querySelectorAll('ch5-button, ch5-slider')].filter(e => e.getBoundingClientRect().width > 0).length, root: !!document.getElementById('cx-root'), tabs: document.querySelectorAll('#cx-root [data-cx-tab]').length }));
    check(`${device} : interface Connect affichée, Core masqué, 5 onglets`, ui.root && ui.core === 0 && ui.tabs === 5, JSON.stringify(ui));

    // 17 pièces sélectionnables
    const sel = await frame.evaluate(async () => {
      const ids = window.villaConfigEmbedded.pieces.map(p => p.id), ok = [];
      for (const id of ids) {
        window.ConnectUI.openRoom(id);
        await new Promise(r => setTimeout(r, 120));
        const title = document.querySelector('#cx-root .cx-head h1')?.textContent;
        if (window.Villa.activeRoom === id && window.Villa.get('n', '10') === id && title === window.villaConfigEmbedded.pieces.find(p => p.id === id).nom) ok.push(id);
      }
      return ok.length;
    });
    check(`${device} : les 17 pièces sont sélectionnables (a10 + titre)`, sel === 17, sel + '/17');

    // Ambiance SOIR Suite parentale (7), puis OFF
    await frame.evaluate(() => window.ConnectUI.openRoom(7)); await sleep(300);
    await click('[data-cx-scene="3"]'); await sleep(500);
    const soir = await frame.evaluate(() => { const p = window.villaConfigEmbedded.pieces.find(x => x.id === 7); const n = p.pilotages.eclairages.circuits.noms.length; return { got: Array.from({ length: n }, (_, i) => window.Villa.get('n', String(71 + i))), want: p.pilotages.eclairages.scenes.niveaux[2], pressed: document.querySelector('#cx-root [data-cx-scene="3"]').getAttribute('aria-pressed'), fill: document.querySelector('#cx-root [data-cx-tile="0"] .cx-fill').style.height }; });
    check(`${device} : ambiance SOIR Suite parentale → niveaux de la séquence Lutron sur a71+, pastille active, tuile remplie`, JSON.stringify(soir.got) === JSON.stringify(soir.want) && soir.pressed === 'true' && soir.fill !== '0%', JSON.stringify(soir));
    await click('[data-cx-scene="1"]'); await sleep(500);
    const off = await frame.evaluate(() => Array.from({ length: 10 }, (_, i) => window.Villa.get('n', String(71 + i))));
    check(`${device} : ambiance OFF → tous les circuits à 0`, off.every(v => !v), off.join(','));

    // Tuile : glisser à mi-hauteur puis appui court
    await frame.evaluate(() => window.ConnectUI.openRoom(1)); await sleep(300);
    const drag = await frame.evaluate(async () => {
      const t = document.querySelector('#cx-root [data-cx-tile="0"]'); t.scrollIntoView({ block: 'center' });
      const r = t.getBoundingClientRect(), x = r.left + r.width / 2;
      const fire = (type, y) => t.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
      fire('pointerdown', r.bottom - 10);
      for (let k = 1; k <= 6; k++) { fire('pointermove', r.bottom - 10 - k * (r.height / 2 - 10) / 6); await new Promise(z => setTimeout(z, 30)); }
      fire('pointerup', r.top + r.height / 2);
      await new Promise(z => setTimeout(z, 300));
      const mid = window.Villa.get('n', '71');
      fire('pointerdown', r.top + 20); fire('pointerup', r.top + 20);
      await new Promise(z => setTimeout(z, 300));
      const after = window.Villa.get('n', '71');
      return { mid: Math.round(mid * 100 / 65535), after: Math.round(after * 100 / 65535), label: t.querySelector('.cx-tile-val').textContent };
    });
    check(`${device} : tuile — glisser règle ~50 %, appui court bascule`, Math.abs(drag.mid - 50) <= 8 && (drag.after === 0 || drag.after === 100) && drag.after !== drag.mid, JSON.stringify(drag));

    // Store du salon : moteur 1 descendre → join 83
    const motor = await frame.evaluate(async () => {
      const seen = []; const id = CrComLib.subscribeState('b', '83', v => seen.push(v));
      document.querySelector('#cx-root [data-cx-motor="1:0:2"]').click();
      await new Promise(r => setTimeout(r, 400));
      CrComLib.unsubscribeState('b', '83', id);
      return seen;
    });
    check(`${device} : store « Rideau baie sud » descendre → impulsion sur le join 83`, motor.includes(true) && motor[motor.length - 1] === false, JSON.stringify(motor));

    // Climat
    await frame.evaluate(() => window.ConnectUI.setTab('climate')); await sleep(300);
    const sp0 = await frame.evaluate(() => window.Villa.get('n', '31'));
    await click('[data-cx-press="49"]'); await sleep(400);
    await click('[data-cx-fan="2"]'); await sleep(300);
    await click('[data-cx-hvac="611"]'); await sleep(300);
    const clim = await frame.evaluate(() => ({ sp: window.Villa.get('n', '31'), fan: window.Villa.get('n', '61'), off: window.Villa.get('b', '611'), shown: document.querySelector('#cx-setpoint').textContent, fanOn: document.querySelector('#cx-root [data-cx-fan="2"]').getAttribute('aria-pressed') }));
    check(`${device} : climat +0,5 °C, ventilation 2, arrêt`, clim.sp === sp0 + 5 && clim.fan === 2 && clim.off === true && clim.fanOn === 'true' && clim.shown.startsWith((clim.sp / 10).toFixed(1)), JSON.stringify({ sp0, ...clim }));
    await click('[data-cx-hvac="610"]');

    // Scène globale Tout éteindre
    await frame.evaluate(() => { window.ConnectUI.openRoom(1); }); await sleep(200);
    await click('[data-cx-scene="2"]'); await sleep(300);
    await frame.evaluate(() => window.ConnectUI.setTab('scenes')); await sleep(200);
    await click('[data-cx-global="402"]'); await sleep(600);
    const allOff = await frame.evaluate(() => Array.from({ length: 5 }, (_, i) => window.Villa.get('n', String(71 + i))));
    check(`${device} : scène globale « Tout éteindre » → circuits de la pièce à 0`, allOff.every(v => !v), allOff.join(','));

    // Langue
    await frame.evaluate(() => window.ConnectUI.setTab('settings')); await sleep(200);
    await click('[data-cx-lang="en"]'); await sleep(300);
    const en = await frame.evaluate(() => [...document.querySelectorAll('#cx-root [data-cx-tab]')].map(b => b.textContent.trim()).join('|'));
    check(`${device} : langue EN → onglets traduits`, en === 'Rooms|Scenes|Shades|Climate|Settings', en);
    await click('[data-cx-lang="fr"]'); await sleep(200);
    await frame.evaluate(() => window.ConnectUI.openRoom(1)); await sleep(300);
    await page.screenshot({ path: path.join(OUT, `fonctionnel-${device}.png`) });
    check(`${device} : 0 erreur console / page`, report.errors.length === errorsBefore, report.errors.slice(errorsBefore, errorsBefore + 3).join(' | ') || '0');
    clearInterval(keep);
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\n${report.failures.length ? 'FAILED' : 'PASSED'} — ${report.checks.length} contrôles réussis, ${report.failures.length} échecs`);
  process.exitCode = report.failures.length ? 1 : 0;
})();
