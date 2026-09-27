import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('dist');
const out = path.resolve(process.env.TEST_OUTPUT || '../../work/restaurant-220');
fs.mkdirSync(out, { recursive: true });
const mime = { '.js':'application/javascript', '.css':'text/css', '.html':'text/html', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.mp4':'video/mp4' };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(root, name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (path.extname(name)) return res.writeHead(404).end();
    file = path.join(root, 'index.html');
  }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
if (!process.env.BASE_URL) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXE, args: JSON.parse(process.env.BROWSER_ARGS || '[]'), headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 960 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && !response.url().includes('google')) errors.push(`${response.status()} ${response.url()}`); });
try {
  await page.goto(`${base}/interfaces/restaurant/sushi-bar-kyoto/phone`, { waitUntil: 'domcontentloaded' });
  await page.locator('.restaurant-background[data-ready="true"]').waitFor({ timeout: 30_000 });
  assert.equal(await page.locator('.restaurant-background iframe').count(), 1);
  assert.equal(await page.locator('.bg-video-container').count(), 0);
  const frame = page.frames().find(item => item.url().includes('/restaurant-lumiere/model.html'));
  assert.ok(frame, 'Le modèle 3D restaurant est chargé');
  await frame.waitForFunction(() => window.__restaurant3d?.building);
  assert.ok(await frame.evaluate(() => { let count=0;window.__restaurant3d.building.traverse(()=>count++);return count>1200 }), 'Le modèle contient le mobilier et l’architecture');
  assert.equal(await page.locator('.rk-zone option').count(), 16, 'Le GUI propose l’extérieur et quinze espaces');
  const dimensions = await frame.evaluate(() => { const size=new THREE.Vector3();new THREE.Box3().setFromObject(window.__restaurant3d.building).getSize(size);return size.toArray() });
  assert.ok(dimensions[0] * dimensions[2] >= 4400, 'Le restaurant couvre plus de quatre fois l’emprise initiale');
  const roomDesigns = await frame.evaluate(() => ({
    combinations:new Set(window.__restaurant3d.specs.map(item => `${item[7]}-${item[8]}-${item[10]}`)).size,
    furniture:Object.fromEntries(Object.entries(window.__restaurant3d.roomGroups).map(([id,group]) => { let tables=0,chairs=0;group.traverse(item => { if(item.name==='table')tables++;if(item.name==='chair')chairs++ });return [id,{tables,chairs}] })),
    lights:window.__restaurant3d.zoneLights,
  }));
  assert.equal(roomDesigns.combinations, 15, 'Les quinze zones ont une architecture et une implantation uniques');
  assert.ok(Object.values(roomDesigns.furniture).every(room => room.tables >= 4 && room.chairs >= 16), 'Chaque zone contient plusieurs tables et chaises');
  assert.ok(Object.values(roomDesigns.lights).every(room => room.floor >= 8 && room.wall >= 8 && room.ceiling >= 8), 'Chaque zone reçoit des éclairages de sol, mur et plafond');
  const architecturalDetails = await frame.evaluate(() => {
    const countNamed = (id,name) => { let count=0;window.__restaurant3d.roomGroups[id].traverse(item => { if(item.name===name)count++ });return count };
    return { exterior:window.__restaurant3d.overviewArchitecture.children.length, wineRacks:countNamed('cellar','wine-rack'), loungeSofas:countNamed('lounge','sofa') };
  });
  assert.ok(architecturalDetails.exterior > 100, 'La vue générale comprend façades, jardin et éclairages extérieurs');
  assert.ok(architecturalDetails.wineRacks >= 2, 'La cave à vins contient des rayonnages modélisés');
  assert.ok(architecturalDetails.loungeSofas >= 5, 'Le lounge contient plusieurs ensembles de canapés');
  assert.deepEqual(await frame.evaluate(() => window.__restaurant3d.desiredPosition), [0,38,82], 'La vue générale est cadrée de face et remplit le cadre');
  await page.locator('.rk-zone select').selectOption('exterior');
  const circuitBefore = await frame.evaluate(() => ({ exterior:window.__restaurant3d.circuitMaterials.exterior.tables.emissiveIntensity, dining:window.__restaurant3d.circuitMaterials.dining.tables.emissiveIntensity }));
  await page.locator('.rk-slider input').first().fill('0');
  await page.waitForTimeout(100);
  const circuitAfter = await frame.evaluate(() => ({ exterior:window.__restaurant3d.circuitMaterials.exterior.tables.emissiveIntensity, dining:window.__restaurant3d.circuitMaterials.dining.tables.emissiveIntensity }));
  assert.ok(circuitAfter.exterior < .03 && Math.abs(circuitAfter.dining-circuitBefore.dining) < .001, 'Le circuit extérieur varie sans modifier les pièces');
  await page.locator('.rk-scenes button').filter({ hasText: 'Accueil' }).click();
  const cameraGoals = new Set();
  const floorFailures = [];
  const visualZones = new Set(['cellar','private','signature','teppanyaki','lounge','gallery','belvedere','terrace']);
  for (const option of await page.locator('.rk-zone option').evaluateAll(items => items.map(item => item.value))) {
    await page.locator('.rk-zone select').selectOption(option);
    await page.waitForTimeout(25);
    cameraGoals.add(await frame.evaluate(() => window.__restaurant3d.desiredPosition.join(',')));
    if (option === 'exterior') continue;
    const composition = await frame.evaluate(id => {
      const model=window.__restaurant3d,group=model.roomGroups[id],zone=model.zones[id],camera=new THREE.PerspectiveCamera(35,1.65,.1,340);
      camera.position.fromArray(model.desiredPosition);camera.lookAt(new THREE.Vector3(...zone.target));camera.updateMatrixWorld(true);camera.updateProjectionMatrix();group.updateMatrixWorld(true);
      let tables=0,visibleTables=0,visibleOccluders=0,floorCorners=0,floor;group.traverse(item=>{if(item.userData.cameraOccluder&&item.visible)visibleOccluders++;if(item.name==='room-floor')floor=item;if(item.name==='table'){tables++;const p=new THREE.Vector3();item.getWorldPosition(p);p.project(camera);if(Math.abs(p.x)<.92&&Math.abs(p.y)<.92&&p.z>-1&&p.z<1)visibleTables++;}});if(floor){const box=new THREE.Box3().setFromObject(floor),min=box.min,max=box.max;for(const x of [min.x,max.x])for(const z of [min.z,max.z]){const p=new THREE.Vector3(x,max.y,z).project(camera);if(Math.abs(p.x)<.96&&Math.abs(p.y)<.96&&p.z>-1&&p.z<1)floorCorners++;}}return {tables,visibleTables,visibleOccluders,floorCorners};
    }, option);
    assert.equal(composition.visibleOccluders, 0, `${option}: les panneaux et la toiture ne masquent pas l’intérieur`);
    assert.ok(composition.visibleTables >= 4, `${option}: le cadrage montre au moins quatre tables`);
    if(composition.floorCorners!==4)floorFailures.push({zone:option,corners:composition.floorCorners});
    if (visualZones.has(option)) {
      await page.waitForTimeout(1800);
      await page.screenshot({ path: path.join(out, `restaurant-${option}.png`), fullPage: true });
    }
  }
  assert.deepEqual(floorFailures, [], 'Les quatre coins du sol restent visibles dans chaque cadrage');
  assert.equal(cameraGoals.size, 16, 'L’extérieur et chaque espace possèdent un cadrage distinct');
  await page.locator('.rk-zone select').selectOption('rooftop');
  await page.waitForTimeout(700);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.zone), 'rooftop');
  assert.equal(await frame.evaluate(() => Object.keys(window.__restaurant3d.roomGroups).length), 15, 'Le modèle contient quinze espaces distincts');
  assert.equal(await frame.evaluate(() => Object.values(window.__restaurant3d.roomGroups).filter(group => group.visible).length), 1, 'La zone ciblée est isolée pendant le zoom');
  await page.locator('.device-stage').dispatchEvent('wheel', { deltaY: 120 });
  await page.waitForTimeout(100);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.view), 'overview', 'La molette descendante affiche le bâtiment complet');
  assert.equal(await frame.evaluate(() => Object.values(window.__restaurant3d.roomGroups).filter(group => group.visible).length), 15, 'La vue générale remonte les quinze espaces');
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, 'restaurant-overview.png'), fullPage: true });
  await page.waitForTimeout(600);
  await page.locator('.device-stage').dispatchEvent('wheel', { deltaY: -120 });
  await page.waitForTimeout(100);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.view), 'focus', 'La molette montante revient à la dernière zone');
  await page.locator('.rk-scenes button').filter({ hasText: 'Rooftop' }).click();
  await page.waitForTimeout(2400);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.zoneLevels.rooftop.pergola), 88);
  await page.screenshot({ path: path.join(out, 'restaurant-phone.png'), fullPage: true });

  for (const device of ['wallpanel', 'tablet']) {
    await page.goto(`${base}/interfaces/restaurant/sushi-bar-kyoto/${device}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.restaurant-background').count(), 0, `${device}: pas de modèle 3D`);
    assert.equal(await page.locator('.bg-video-container').count(), 1, `${device}: vidéo conservée`);
  }

  await page.goto(`${base}/interfaces/boutique/boutique-hermes/phone`, { waitUntil: 'domcontentloaded' });
  await page.locator('.luxury-background[data-ready="true"]').waitFor({ timeout: 30_000 });
  const boutiqueFrame = page.frames().find(item => item.url().includes('/ftv-luxury/models/boutique.html'));
  assert.ok(boutiqueFrame, 'La maquette Boutique est chargée');
  await boutiqueFrame.waitForFunction(() => window.__ftvModel?.state);
  const boutiqueEntryState = await boutiqueFrame.evaluate(() => window.__ftvModel.state());
  assert.deepEqual(
    { room:boutiqueEntryState.room,floor:boutiqueEntryState.floor,view:boutiqueEntryState.view },
    { room:'all',floor:'both',view:'overview' }
  );
  assert.equal(await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.desiredPosition[0]), 0, 'La vue générale Boutique est strictement frontale');
  assert.equal(await boutiqueFrame.locator('.j-loader').textContent(), '', 'Aucun message de préparation interne n’est affiché');
  const boutiqueCameraA = await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.camera.position.toArray());
  await page.waitForTimeout(450);
  const boutiqueCameraB = await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.camera.position.toArray());
  assert.ok(boutiqueCameraA.every((value,index) => Math.abs(value-boutiqueCameraB[index]) < .02), 'La Boutique apparaît directement sur sa vue générale stable');
  const boutiqueGui = page.frames().find(item => item.url().includes('/ftv-luxury/gui.html') && item.url().includes('boutique-hermes'));
  assert.ok(boutiqueGui, 'Le GUI Boutique est disponible pour la démonstration');
  await boutiqueGui.evaluate(() => window.ftvGui.selectRoom('hall'));
  await page.waitForTimeout(100);
  assert.equal((await boutiqueFrame.evaluate(() => window.__ftvModel.state())).room, 'hall', 'La démonstration peut sélectionner le Hall et escalier d’apparat');
  const fadeStart = await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.vals.cove);
  await boutiqueGui.evaluate(() => window.ftvGui.applyPreset('closed'));
  await page.waitForTimeout(120);
  assert.equal((await boutiqueFrame.evaluate(() => window.__ftvModel.state())).lightFade?.duration, 3000, 'Chaque scène Boutique utilise une variation de trois secondes');
  await page.waitForTimeout(1400);
  const fadeMiddle = await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.vals.cove);
  assert.ok(fadeMiddle < fadeStart && fadeMiddle > 5, 'La lumière Boutique varie progressivement entre les scènes');
  await page.waitForTimeout(1800);
  assert.ok(Math.abs(await boutiqueFrame.evaluate(() => document.querySelector('#ftv-jewel').__jewel.vals.cove)-5) < .2, 'La variation Boutique atteint sa valeur finale après trois secondes');
  await boutiqueGui.evaluate(() => window.ftvGui.selectRoom('all'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(out, 'boutique-stable-entry.png'), fullPage: true });
  await page.locator('a[href="/interfaces/restaurant"]').click();
  await page.waitForFunction(() => location.pathname.endsWith('/interfaces/restaurant/sushi-bar-kyoto/phone'));
  assert.equal(await page.locator('.phone-device-frame').count(), 1, 'Restaurant ouvre le châssis Smartphone');
  await page.locator('.restaurant-background[data-ready="true"]').waitFor({ timeout: 30_000 });

  await page.goto(`${base}/interfaces/hotellerie/hotel-brassus/phone`, { waitUntil: 'domcontentloaded' });
  const phoneElement = await page.locator('iframe[src*="/showcases/hotel-brassus/phone.html"]').first().elementHandle({ timeout: 30_000 });
  const phone = await phoneElement?.contentFrame();
  assert.ok(phone, 'L’interface iPhone Hotel Brassus est chargée');
  await phone.waitForSelector('.scene');
  const hotelModel = page.frames().find(item => item.url().includes('/showcases/hotel-brassus/model.html'));
  assert.ok(hotelModel, 'La maquette Hotel Brassus est chargée');
  await hotelModel.waitForFunction(() => window.HDH_MODEL?.roomLighting?.get('bar'));
  await phone.locator('.scene[data-scene="3"]').click();
  await page.waitForTimeout(4200);
  const hotelOn = await hotelModel.evaluate(() => { const room=window.HDH_MODEL.roomLighting.get('bar');return { level:room.level, intensity:room.materials[0].material.emissiveIntensity } });
  await phone.locator('.scene[data-scene="0"]').click();
  await page.waitForTimeout(4200);
  const hotelOff = await hotelModel.evaluate(() => { const room=window.HDH_MODEL.roomLighting.get('bar');return { level:room.level, intensity:room.materials[0].material.emissiveIntensity } });
  assert.ok(hotelOn.level > 99 && hotelOff.level < 1 && hotelOn.intensity > hotelOff.intensity * 20, 'Les scènes iPhone pilotent visiblement les éclairages du plan 3D');
  await phone.locator('nav button[data-tab="blinds"]').click();
  for (const button of await phone.locator('button[data-action="2"]').all()) await button.click();
  await page.waitForTimeout(5300);
  const hotelDark = await hotelModel.evaluate(() => { const room=window.HDH_MODEL.roomLighting.get('bar');return { blinds:room.blinds, darkness:room.darkness[0].material.opacity, natural:room.natural[0].intensity, beam:room.beams[0].material.opacity } });
  assert.ok(hotelDark.blinds > 99 && hotelDark.darkness > .92 && hotelDark.natural < .05 && hotelDark.beam < .005, 'Rideaux fermés et scène éteinte plongent la pièce dans le noir');
  await page.screenshot({ path: path.join(out, 'hotel-dark-curtains.png'), fullPage: true });
  for (const button of await phone.locator('button[data-action="0"]').all()) await button.click();
  await page.waitForTimeout(5300);
  const hotelNatural = await hotelModel.evaluate(() => { const room=window.HDH_MODEL.roomLighting.get('bar');return { blinds:room.blinds, darkness:room.darkness[0].material.opacity, natural:room.natural[0].intensity, beam:room.beams[0].material.opacity } });
  assert.ok(hotelNatural.blinds < 1 && hotelNatural.darkness < .01 && hotelNatural.natural > .4 && hotelNatural.beam > .005, 'L’ouverture des rideaux rétablit la lumière naturelle');
  await page.screenshot({ path: path.join(out, 'hotel-natural-light.png'), fullPage: true });
  const palette = await phone.evaluate(() => ({
    bg: getComputedStyle(document.body).getPropertyValue('--bg').trim(),
    ink: getComputedStyle(document.body).getPropertyValue('--ink').trim(),
    gold: getComputedStyle(document.body).getPropertyValue('--gold').trim(),
  }));
  assert.deepEqual(palette, { bg:'#eef1ef', ink:'#283b32', gold:'#d2ab21' });
  const buttonStates = [];
  for (const tab of ['lighting', 'audio', 'blinds', 'temperature']) {
    await phone.locator(`nav button[data-tab="${tab}"]`).click();
    await page.waitForTimeout(220);
    const states = await phone.locator('button:not(:disabled)').evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return { pressed:button.getAttribute('aria-pressed'), background:style.backgroundColor, image:style.backgroundImage, border:style.borderTopColor };
    }));
    buttonStates.push(...states);
  }
  assert.ok(buttonStates.filter(state => state.pressed === 'false' || state.pressed === null).every(state => state.background === 'rgb(38, 63, 54)'));
  assert.ok(buttonStates.filter(state => state.pressed === 'true').every(state => state.image.startsWith('radial-gradient') && state.border === 'rgb(210, 171, 33)'));
  await page.screenshot({ path: path.join(out, 'hotel-brassus-phone.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks: 43, dimensions, cameraGoals:cameraGoals.size, roomDesigns:{combinations:roomDesigns.combinations,zones:Object.keys(roomDesigns.furniture).length}, architecturalDetails, hotelLighting:{on:hotelOn,off:hotelOff,dark:hotelDark,natural:hotelNatural}, palette, buttonStates:buttonStates.length, errors }, null, 2));
} finally {
  await browser.close();
  if (server.listening) server.close();
}
