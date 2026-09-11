// Génère VillaCrans_Slot2.smw à partir de VillaCrans.smw (base créée dans SIMPL Windows).
// - Corrige l'IP de l'EISC : 172.0.0.2 -> 127.0.0.2 (boucle inter-slots du CP4)
// - Complète le symbole EISC (H=21) avec les signaux du contrat global villa_config.json
// Mapping du symbole EISC "Packed" (dimensions 232/233, vérifié sur le câblage existant) :
//   digital  : index = join  (entrées et sorties)
//   analog   : entrée = join + 233, sortie = join + 232
//   série    : sortie = join + 464
// Relancer :  node generate_slot2.js   (fichier de sortie écrasé à chaque exécution)

const fs = require('fs');
const path = require('path');

// Le fichier est modifié EN PLACE (la base VillaCrans.smw d'origine a été supprimée).
// Une copie de sécurité horodatée est créée à chaque exécution.
// IMPORTANT : fermer VillaCrans_Slot2.smw dans SIMPL Windows avant de lancer ce script.
const BASE = path.join(__dirname, 'VillaCrans_Slot2.smw');
const OUT = BASE;

let raw = fs.readFileSync(BASE, 'latin1');
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
fs.writeFileSync(path.join(__dirname, 'VillaCrans_Slot2.backup-' + stamp + '.smw'), raw, 'latin1');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';

// --- 1. Corrections globales (sans effet si déjà appliquées) ---
raw = raw.replace('IPA=172.0.0.2', 'IPA=127.0.0.2');
raw = raw.replace('PrNm=VillaCrans.smw', 'PrNm=VillaCrans_Slot2.smw');

// --- 2. Inventaire des signaux existants ---
const sgRe = /\[\r?\nObjTp=Sg\r?\nH=(\d+)\r?\nNm=([^\r\n]+)\r?\n(?:SgTp=(\d+)\r?\n)?\]/g;
const existingByName = {};
let maxSgH = 0;
let m;
while ((m = sgRe.exec(raw)) !== null) {
  existingByName[m[2]] = parseInt(m[1], 10);
  maxSgH = Math.max(maxSgH, parseInt(m[1], 10));
}

let nextH = maxSgH + 1;
const newSignals = []; // {h, name, sgTp}
function sig(name, sgTp) {
  if (existingByName[name] !== undefined) return existingByName[name];
  const h = nextH++;
  existingByName[name] = h;
  newSignals.push({ h, name, sgTp });
  return h;
}

// --- 3. Plan de câblage (contrat v2) ---
// Offsets analog/série auto-calibrés sur les dimensions du symbole EISC :
//   analog in = n1I + 1 ; analog out = n1O ; série out = n1O + (n2I - 1)
// Vérifiés empiriquement sur les signaux déjà câblés quand ils existent.
const dimsM = raw.match(/ObjTp=Sm\r?\nH=\d+\r?\nSmC=1160[\s\S]*?n1I=(\d+)[\s\S]*?n2I=(\d+)[\s\S]*?n1O=(\d+)/);
if (!dimsM) { console.error('Symbole EISC (SmC=1160) introuvable'); process.exit(1); }
const N1I = parseInt(dimsM[1], 10), N2I = parseInt(dimsM[2], 10), N1O = parseInt(dimsM[3], 10);
let IN_A = N1I + 1, OUT_A = N1O, OUT_S = N1O + (N2I - 1);
// Calibration empirique si les signaux de référence sont déjà câblés
(function calibrate() {
  const smM = raw.match(/\[\r?\nObjTp=Sm\r?\nH=\d+\r?\nSmC=1160[\s\S]*?\r?\n\]/);
  if (!smM) return;
  const gI = {}, gO = {};
  for (const l of smM[0].split(/\r?\n/)) {
    let y;
    if ((y = l.match(/^I(\d+)=(\d+)$/))) gI[y[2]] = parseInt(y[1], 10);
    if ((y = l.match(/^O(\d+)=(\d+)$/))) gO[y[2]] = parseInt(y[1], 10);
  }
  const sgH = {};
  const re2 = /ObjTp=Sg\r?\nH=(\d+)\r?\nNm=([^\r\n]+)/g;
  let y2;
  while ((y2 = re2.exec(raw)) !== null) sgH[y2[2]] = y2[1];
  if (sgH['Lighting_Master'] && gI[sgH['Lighting_Master']]) IN_A = gI[sgH['Lighting_Master']] - 21;
  if (sgH['Room_Selected#'] && gO[sgH['Room_Selected#']]) OUT_A = gO[sgH['Room_Selected#']] - 10;
  if (sgH['Room_Selected$'] && gO[sgH['Room_Selected$']]) OUT_S = gO[sgH['Room_Selected$']] - 10;
})();
console.log('Dimensions EISC : ' + N1I + ' digitaux / ' + N2I + ' analog-série | offsets : analogIn=' + IN_A + ' analogOut=' + OUT_A + ' serieOut=' + OUT_S);
const inputs = {};  // index -> sgH
const outputs = {}; // index -> sgH
const din = (join, name) => { inputs[join] = sig(name, 0); };
const dout = (join, name) => { outputs[join] = sig(name, 0); };
const ain = (join, name) => { inputs[join + IN_A] = sig(name, 2); };
const aout = (join, name) => { outputs[join + OUT_A] = sig(name, 2); };
const sout = (join, name) => { outputs[join + OUT_S] = sig(name, 4); };

// Sélection de pièces 1..30 (joins 11-40) — 1..10 déjà câblés dans la base
for (let r = 11; r <= 30; r++) { din(10 + r, 'Room_Select' + r); dout(10 + r, 'Room_Select' + r + '_fb'); }
// Alarme (41/42)
din(41, 'Alarm_Arm'); dout(41, 'Alarm_Arm_fb');
din(42, 'Alarm_Disarm'); dout(42, 'Alarm_Disarm_fb');
// Consigne CVC (49/50)
din(49, 'HVAC_Setpoint_Up');
din(50, 'HVAC_Setpoint_Down');
// Scènes 51-54 : déjà câblées dans la base (Lighting_Scene1..4 + fb)
// Mute (55)
din(55, 'Audio_Mute'); dout(55, 'Audio_Mute_fb');
// Stores groupés de la pièce active (61-69) — EN SORTIE : le slot 2 REÇOIT les appuis
// de la dalle (miroir du slot 1) pour piloter les moteurs réels. (Correctif : ces
// signaux étaient auparavant câblés à tort en entrée.)
const grp = ['Volets', 'Rideaux', 'Stores'];
grp.forEach((g, gi) => {
  dout(61 + gi * 3, 'Shades_' + g + '_Up');
  dout(62 + gi * 3, 'Shades_' + g + '_Stop');
  dout(63 + gi * 3, 'Shades_' + g + '_Down');
});
// Purge des anciennes entrées I61..I69 issues des générations précédentes
const purgeInputs = [61, 62, 63, 64, 65, 66, 67, 68, 69];
// Moteurs 1..6 (81-98) : commandes + écho des appuis GUI
for (let mo = 1; mo <= 6; mo++) {
  const b = 81 + (mo - 1) * 3;
  din(b, 'Motor_' + mo + '_Up'); dout(b, 'Motor_' + mo + '_Up_fb');
  din(b + 1, 'Motor_' + mo + '_Stop'); dout(b + 1, 'Motor_' + mo + '_Stop_fb');
  din(b + 2, 'Motor_' + mo + '_Down'); dout(b + 2, 'Motor_' + mo + '_Down_fb');
}
// Sources A/V 0..5 (150-155)
for (let s = 0; s <= 5; s++) { din(150 + s, 'Source_Select_' + s); dout(150 + s, 'Source_Select_' + s + '_fb'); }
// Scènes de stores 1..4 (201-204)
for (let s = 1; s <= 4; s++) { din(200 + s, 'Shades_Scene_' + s); dout(200 + s, 'Shades_Scene_' + s + '_fb'); }
// Analogiques : pièce active (10) en entrée (sortie déjà câblée : Room_Selected#)
ain(10, 'Room_Select#');
// Source active (51) et volume (52)
ain(51, 'Source_Active#'); aout(51, 'Source_Active_fb#');
ain(52, 'Audio_Volume#'); aout(52, 'Audio_Volume_fb#');
// Circuits d'éclairage 1..10 (71-80)
for (let ci = 1; ci <= 10; ci++) {
  ain(70 + ci, 'Circuit_' + ci + '#');
  aout(70 + ci, 'Circuit_' + ci + '_fb#');
}
// Séries (sorties) : température actuelle (32) et mode CVC (33) — nom pièce (10) et consigne (34) déjà câblés
sout(32, 'HVAC_Temperature_fb$');
sout(33, 'HVAC_Mode_fb$');

// --- 3b. BLOCS PIÈCES : scènes d'éclairage par pièce (nécessite un symbole EISC redimensionné) ---
// Join digital = 1000 + (pieceId - 1) * 100 + 20 + numéro de scène (offsets +21..24 du contrat).
// Lighting_Scene<s>_Room<r> = commande depuis le slot 2 ; _fb = retour d'état.
const DIG_CAPACITY = N1I;
let villaCfg = null;
try { villaCfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'VillaCrans', 'villa_config.json'), 'utf8')); } catch (e) {}
const pieces = (villaCfg && villaCfg.pieces) ? villaCfg.pieces.filter(p => p.intersystem !== false) : [];
const roomBase = id => 1000 + (id - 1) * 100;
let roomScenesWired = 0, roomScenesSkipped = 0;
for (const p of pieces) {
  const b = roomBase(p.id);
  if (b + 24 > DIG_CAPACITY) { roomScenesSkipped++; continue; }
  for (let s = 1; s <= 4; s++) {
    din(b + 20 + s, 'Lighting_Room' + p.id + '_Scene' + s);
    dout(b + 20 + s, 'Lighting_Room' + p.id + '_Scene' + s + '_fb');
  }
  // Écho par pièce des commandes groupées Volets/Rideaux/Stores (offsets +1..+9)
  grp.forEach((g, gi) => {
    dout(b + 1 + gi * 3, 'Shades_Room' + p.id + '_' + g + '_Up');
    dout(b + 2 + gi * 3, 'Shades_Room' + p.id + '_' + g + '_Stop');
    dout(b + 3 + gi * 3, 'Shades_Room' + p.id + '_' + g + '_Down');
  });
  // Circuits d'éclairage par pièce (analogiques, offsets +71..+80) :
  // commande depuis le slot 2 + retour d'état du niveau réel
  if (b + 80 <= N2I) {
    for (let ci = 1; ci <= 10; ci++) {
      ain(b + 70 + ci, 'Lighting_Room' + p.id + '_Circuit' + ci);
      aout(b + 70 + ci, 'Lighting_Room' + p.id + '_Circuit' + ci + '_fb');
    }
  }
  roomScenesWired++;
}

// --- 4. Réécriture du symbole EISC (H=21) ---
const smRe = /\[\r?\nObjTp=Sm\r?\nH=21\r?\n[\s\S]*?\r?\n\]/;
const smMatch = raw.match(smRe);
if (!smMatch) { console.error('Symbole EISC H=21 introuvable'); process.exit(1); }
const smBlock = smMatch[0];

// Extraire les I/O existants du bloc
const curI = {}, curO = {};
let header = [];
for (const line of smBlock.split(/\r?\n/)) {
  let mm;
  if ((mm = line.match(/^I(\d+)=(\d+)$/))) curI[parseInt(mm[1], 10)] = parseInt(mm[2], 10);
  else if ((mm = line.match(/^O(\d+)=(\d+)$/))) curO[parseInt(mm[1], 10)] = parseInt(mm[2], 10);
  else if (!/^\[|^\]/.test(line) && !/^m[IO]=/.test(line) && line !== '') header.push(line);
}
// Purge des entrées obsolètes (Shades_* déplacés en sorties)
for (const idx of purgeInputs) delete curI[idx];
// Fusion (les entrées existantes sont prioritaires)
for (const k of Object.keys(inputs)) if (curI[k] === undefined) curI[k] = inputs[k];
for (const k of Object.keys(outputs)) if (curO[k] === undefined) curO[k] = outputs[k];

// Reconstruire le bloc : entête (avec mI/mO/tO d'origine à leur place), puis I croissants, puis O croissants
const origLines = smBlock.split(/\r?\n/).filter(l => l !== '[' && l !== ']' && l !== '');
const headLines = [];
let miLine = null, moLine = null, toLine = null;
for (const l of origLines) {
  if (/^I\d+=/.test(l) || /^O\d+=/.test(l)) continue;
  if (/^mI=/.test(l)) { miLine = l; continue; }
  if (/^mO=/.test(l)) { moLine = l; continue; }
  if (/^tO=/.test(l)) { toLine = l; continue; }
  headLines.push(l);
}
const iKeys = Object.keys(curI).map(Number).sort((a, b) => a - b);
const oKeys = Object.keys(curO).map(Number).sort((a, b) => a - b);
const newBlockLines = ['[', ...headLines, miLine, ...iKeys.map(k => 'I' + k + '=' + curI[k]), moLine, toLine, ...oKeys.map(k => 'O' + k + '=' + curO[k]), ']'];
raw = raw.replace(smRe, newBlockLines.join(EOL));

// --- 5. Ajout des nouveaux blocs de signaux en fin de fichier ---
let sgBlocks = '';
for (const s of newSignals) {
  sgBlocks += '[' + EOL + 'ObjTp=Sg' + EOL + 'H=' + s.h + EOL + 'Nm=' + s.name + EOL;
  if (s.sgTp) sgBlocks += 'SgTp=' + s.sgTp + EOL;
  sgBlocks += ']' + EOL;
}
raw = raw.replace(/\s*$/, EOL) + sgBlocks;

fs.writeFileSync(OUT, raw, 'latin1');
console.log('OK : ' + path.basename(OUT));
console.log('Signaux ajoutés : ' + newSignals.length + ' (handles ' + (maxSgH + 1) + '..' + (nextH - 1) + ')');
console.log('Entrées EISC : ' + iKeys.length + ' | Sorties EISC : ' + oKeys.length);
console.log('Capacité digitale du symbole EISC : ' + DIG_CAPACITY + ' joins');
console.log('Scènes par pièce : ' + roomScenesWired + ' pièces câblées, ' + roomScenesSkipped + ' pièces hors capacité');
if (roomScenesSkipped > 0) {
  console.log('>>> Pour câbler les blocs pièces : dans SIMPL Windows, ouvrir VillaCrans.smw,');
  console.log('>>> double-cliquer le symbole EISC et porter les digitaux à 4001 (et analog/série à 2587),');
  console.log('>>> sauvegarder, puis relancer ce script.');
}
