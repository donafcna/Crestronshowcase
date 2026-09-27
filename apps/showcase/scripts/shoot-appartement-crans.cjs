/**
 * Captures de la fiche « Appartement Crans-Montana » (public/sheets/appartement-crans/NN-nom.png).
 * Chaque capture est faite sur `.device-screen` des routes du site (dalle, tablette, smartphone),
 * la GUI étant pilotée à travers l'iframe (clics sur ch5-button[data-join], API du GUI, Villa.*)
 * pour montrer un état parlant : scène SOIR active, fenêtre Circuits ouverte, télécommande Apple TV…
 *
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage     : node scripts/shoot-appartement-crans.cjs [--base http://localhost:4173] [--out public/sheets/appartement-crans]
 * Sortie    : PNG bruts ; la réduction à 1400 px / 256 couleurs est faite par scripts/helpers/png-1400-256.py.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'public/sheets/appartement-crans'));
const PROJECT = 'appartement-crans';
fs.mkdirSync(OUT, { recursive: true });

const route = device => `${BASE}/interfaces/residentiel/${PROJECT}/${device}`;
const guiFrame = page => page.frames().find(f => /\/showcases\/appartement-crans\/(index|iphone)\.html/.test(f.url()));

async function openDevice(page, device) {
  await page.goto(route(device), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow?.Villa?.ready, null, { timeout: 60000 });
  // Pause de la démo automatique : un vrai geste sur la scène (isTrusted).
  await holdDemo(page);
  await page.waitForTimeout(600);
  const frame = guiFrame(page);
  await frame.evaluate(() => { window.closeAllModals && window.closeAllModals(); });
  return frame;
}

// La démo automatique reprend après 10 s (60 s sur Smartphone) d'inactivité : un geste réel sur
// la scène avant chaque capture la maintient en pause.
// page.mouse : geste réel (isTrusted) sans attente d'« actionabilité », que le fond 3D du châssis
// Smartphone (rendu logiciel lent) ne satisfait pas toujours.
const holdDemo = async page => {
  const r = await page.evaluate(() => { const b = document.querySelector('.device-stage').getBoundingClientRect(); return [b.left + 5, b.top + 5]; });
  await page.mouse.click(r[0], r[1]);
};

async function shoot(page, name) {
  await holdDemo(page);
  // Le toast « Scène … activée » disparaît après 2,5 s : on attend qu'il soit éteint.
  const frame = guiFrame(page);
  if (frame) await frame.waitForFunction(() => { const t = document.getElementById('custom-toast'); return !t || t.style.opacity === '0'; }, null, { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(700);
  const file = path.join(OUT, name + '.png');
  // Capture par découpe de la page : la capture d'élément attend un rectangle « stable », ce que le
  // châssis Smartphone repositionné par le fond 3D ne fournit jamais.
  const box = await page.evaluate(() => { const r = document.querySelector('.device-screen').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  await page.screenshot({ path: file, clip: box, animations: 'disabled' });
  console.log('capture', file);
}

// Dalle / tablette : sélection de pièce par le bouton du menu (défilement compris).
async function selectRoom(frame, id) {
  await holdDemo(frame.page());
  await frame.evaluate(id => {
    const btn = document.getElementById('room-btn-' + id);
    btn.scrollIntoView({ block: 'center' });
  }, id);
  await frame.locator(`#room-btn-${id} button`).click();
  await frame.waitForFunction(id => window.Villa.activeRoom === id, id);
  await frame.waitForTimeout(400);
}
// Geste réel (isTrusted) sur un élément du GUI dans l'iframe mise à l'échelle par le châssis :
// même conversion que centerOf() dans useAutoDemo. Nécessaire quand le GUI n'agit que sur un
// vrai appui (ouverture automatique des télécommandes : avOpenRemote ignore isTrusted === false).
async function realTap(page, frame, selector) {
  const fr = await page.evaluate(() => { const f = document.querySelector('.device-screen iframe'); const r = f.getBoundingClientRect(); return { left: r.left, top: r.top, scale: r.width / f.contentWindow.innerWidth }; });
  const c = await frame.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, selector);
  await page.mouse.click(fr.left + c.x * fr.scale, fr.top + c.y * fr.scale);
  await frame.waitForTimeout(500);
}
const pressJoin = async (frame, join) => {
  await holdDemo(frame.page());
  await frame.locator(`ch5-button[data-join="${join}"] button`).first().click();
  await frame.waitForTimeout(350);
};

(async () => {
  const browser = await chromium.launch();
  const notes = [];

  // ---- Dalle TSW-1070 (1280 × 800 CSS) ------------------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 2300, height: 1400 }, deviceScaleFactor: 2 });
    const frame = await openDevice(page, 'wallpanel');
    // 01 : écran principal du Salon, scène SOIR, menu des pièces du niveau 0
    await selectRoom(frame, 1);
    await pressJoin(frame, '53');
    await shoot(page, '01-accueil-salon');
    // 02 : menu des pièces défilé vers le niveau 1 (Hall & escalier → Salle de bains VIP), Chambre VIP active
    await selectRoom(frame, 15);
    await pressJoin(frame, '52');
    await frame.evaluate(() => { const c = document.getElementById('rooms-container'); c.scrollTop = c.scrollHeight; });
    await shoot(page, '02-menu-niveau-1');
    // 03 : Chambre principale, scène SOIR (10 circuits Lutron)
    await selectRoom(frame, 7);
    await pressJoin(frame, '53');
    notes.push({ room: 7, scene: '53', levels: await frame.evaluate(() => window.Villa.SIG.CIRCUITS.slice(0, 10).map(j => window.Villa.get('n', j))) });
    await shoot(page, '03-eclairages-chambre');
    // 04 : fenêtre Circuits de la Salle de bains TV (11 circuits), scène SOIR
    await selectRoom(frame, 11);
    await pressJoin(frame, '53');
    await frame.evaluate(() => window.openCircuitsModal());
    await shoot(page, '04-circuits-salle-de-bains');
    await frame.evaluate(() => window.closeAllModals());
    // 05 : onglet Stores du Salon, rideau baie sud fermé (feedback), puis fenêtre Moteurs
    await selectRoom(frame, 1);
    await frame.evaluate(() => window.switchTab('shades'));
    await frame.waitForTimeout(400);
    const closeBtn = frame.locator('#lights-shades-tab ch5-button[data-join], #shades-tab ch5-button[data-join], .shades-tab ch5-button[data-join]');
    if (await closeBtn.count()) notes.push({ shadesButtons: await closeBtn.count() });
    await shoot(page, '05-stores-salon');
    await frame.evaluate(() => window.openMotorsModal());
    await shoot(page, '06-moteurs-salon');
    await frame.evaluate(() => { window.closeAllModals(); window.switchTab('lights'); });
    // 07 : CVC du Bureau (pièce avec climat mais sans audio-vidéo), ventilation 2
    await selectRoom(frame, 9);
    await pressJoin(frame, '52');
    await pressJoin(frame, '614');
    await shoot(page, '07-cvc-bureau');
    // 08 : Salle TV (audio-vidéo B&O), extinction puis source Apple TV → télécommande ouverte automatiquement
    await selectRoom(frame, 10);
    await pressJoin(frame, '200');
    await pressJoin(frame, '151');
    await frame.waitForTimeout(500);
    await shoot(page, '08-apple-tv-telecommande');
    await frame.evaluate(() => window.closeAllModals());
    // 09 : Salle TV, MUSIQUE sur les haut-parleurs (la vidéo reste à l'écran) → lecteur média
    await pressJoin(frame, '155');
    await frame.waitForTimeout(500);
    await shoot(page, '09-lecteur-media');
    await frame.evaluate(() => window.closeAllModals());
    // 10 : contrôle global
    await frame.evaluate(() => window.openGlobalControlModal());
    await shoot(page, '10-controle-global');
    await frame.evaluate(() => window.closeAllModals());
    // 11 / 12 : thèmes Clair élégant et Verre dépoli (Salon, SOIR)
    await selectRoom(frame, 1);
    await frame.evaluate(() => window.changeTheme('light'));
    await page.waitForTimeout(1000);
    await shoot(page, '11-theme-clair');
    await frame.evaluate(() => window.changeTheme('glass'));
    await page.waitForTimeout(1000);
    await shoot(page, '12-theme-verre');
    await frame.evaluate(() => window.changeTheme('dark'));
    await page.close();
  }

  // ---- Tablette iPad 11" (1180 × 820 CSS) ---------------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 2300, height: 1400 }, deviceScaleFactor: 2 });
    const frame = await openDevice(page, 'tablet');
    await selectRoom(frame, 13);
    await pressJoin(frame, '54');
    await shoot(page, '13-tablette-chambre-twin');
    await page.close();
  }

  // ---- Smartphone (440 × 956 CSS, GUI 440 × 863) --------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 1800, height: 1500 }, deviceScaleFactor: 2 });
    const frame = await openDevice(page, 'phone');
    await frame.selectOption('#room-select', '7');
    await frame.waitForFunction(() => window.Villa.activeRoom === 7);
    // Châssis Smartphone : le fond 3D repositionne l'iframe en continu, Playwright n'obtient jamais
    // un élément « stable » ; on déclenche donc les onclick du GUI par un clic DOM.
    const tap = async id => { await holdDemo(page); await frame.evaluate(id => document.getElementById(id).click(), id); await frame.waitForTimeout(500); };
    await tap('scene-btn-53');
    await shoot(page, '14-iphone-eclairages');
    await frame.evaluate(() => window.openCircuitsModal());
    await frame.waitForTimeout(500);
    await shoot(page, '15-iphone-circuits');
    await frame.evaluate(() => { document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'); });
    await tap('nav-hvac');
    await shoot(page, '16-iphone-hvac');
    await tap('nav-audio');
    await tap('power-off-btn-mobile');
    await realTap(page, frame, '#source-btn-1');   // appui réel : ouvre la télécommande Apple TV
    await shoot(page, '17-iphone-apple-tv');
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(notes, null, 2));
  console.log(JSON.stringify(notes));
})().catch(e => { console.error(e); process.exit(1); });
