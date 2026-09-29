#!/usr/bin/env node
// Appartement Crans-Montana — génère le programme SIMPL Windows du slot 2 (AppartementCrans_Slot2.smw).
//
// Dérivé du générateur du Core Villa Crans (projects/villa-crans/simpl/contract/generate_slot2.js,
// contrat v4.1), avec une différence : il sait partir du SOCLE NU (CP4 + EISC 2732 joins, aucun
// signal) et écrit alors explicitement tous les signaux que le Core suppose « déjà câblés dans la
// base » (Room_Select1..10, Lighting_Scene1..4, Room_Selected#, Room_Selected$, Lighting_Master,
// HVAC_Setpoint a31, HVAC_Mode a33, HVAC_Setpoint_fb$ s34, Alarm_*, ...).
//
//   node tools/generate_slot2.js                       → simpl/simpl-windows/AppartementCrans_Slot2.smw
//   node tools/generate_slot2.js --dry-run             → rapport seul, rien d'écrit
//   options : --input <socle.smw> --output <sortie.smw> --config <villa_config.json>
//
// Sens des signaux sur le symbole EISC (convention du Core, à lire avant le Debugger) :
//   SORTIE du symbole = ce que le slot 2 REÇOIT (appui GUI relayé par le C#, état tenu par le C#) :
//                       suffixe _fb pour les appuis globaux, _Cmd pour CVC/wellness, Rxx_*_fb pour les blocs pièce.
//   ENTRÉE du symbole = ce que le slot 2 RENVOIE au C# : nom nu pour les globaux lus par le C#
//                       (Alarm_*, Global_Vacation_*), Rxx_*_Actual / Rxx_*# pour les mesures par pièce.
// Mapping des index du symbole « Ethernet Intersystem Communications (Packed) » :
//   digital  : index = join (entrées et sorties)
//   analog   : entrée = join + n1I + 1 ; sortie = join + n1O
//   série    : sortie = join + n1O + n2I - 1   (aucun sériel en entrée : les textes viennent du C#)
// Si la base contient déjà des signaux (SMW existant), ils sont réutilisés par nom et les câblages
// existants sont prioritaires, comme dans le Core.

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const DRY = process.argv.includes('--dry-run');
const SOCLE_LOCAL = path.join(ROOT, 'simpl', 'simpl-windows', '_socle_cp4_eisc.smw');
const SOCLE_FTVHOME = path.join(ROOT, '..', 'ftv-home', 'simpl', 'simpl-windows', '_socle_cp4_eisc.smw');
const BASE = path.resolve(arg('--input') || SOCLE_LOCAL);
const OUT = path.resolve(arg('--output') || path.join(ROOT, 'simpl', 'simpl-windows', 'AppartementCrans_Slot2.smw'));
const CONFIG = path.resolve(arg('--config') || path.join(ROOT, 'villa_config.json'));
const PROJECT_NAME = 'AppartementCrans_Slot2.smw';
const CLIENT_NAME = 'Appartement Crans-Montana';

// Socle local absent : copie depuis ftv-home (même fichier, socle nu partagé).
if (!fs.existsSync(BASE) && BASE === SOCLE_LOCAL && fs.existsSync(SOCLE_FTVHOME)) {
  fs.mkdirSync(path.dirname(BASE), { recursive: true });
  fs.copyFileSync(SOCLE_FTVHOME, BASE);
  console.log('Socle copié depuis ' + path.relative(ROOT, SOCLE_FTVHOME));
}
if (!fs.existsSync(BASE)) throw new Error('Socle introuvable : ' + BASE);

const configRaw = fs.readFileSync(CONFIG, 'utf8');
const cfg = JSON.parse(configRaw);
let raw = fs.readFileSync(BASE, 'latin1');
const original = raw;
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';

// ---------------------------------------------------------------- 1. socle : symbole EISC et inventaire
raw = raw.replace('IPA=172.0.0.2', 'IPA=127.0.0.2');
const smRe = /\[\r?\nObjTp=Sm\r?\nH=(\d+)\r?\nSmC=1160[\s\S]*?\r?\n\]/;
const sm = raw.match(smRe);
if (!sm) throw new Error('Symbole EISC (SmC=1160) introuvable dans ' + BASE);
const EISC_H = +sm[1];
const dim = k => { const m = sm[0].match(new RegExp('^' + k + '=(\\d+)$', 'm')); return m ? +m[1] : 0; };
const N1I = dim('n1I'), N2I = dim('n2I'), N1O = dim('n1O'), TO = dim('tO');
const IN_A = N1I + 1, OUT_A = N1O, OUT_S = N1O + N2I - 1;
const CAP = { d: Math.min(N1I, N1O), a: N2I - 1, s: Math.min(N2I - 1, TO - OUT_S) };

const existingByName = {};
let maxSgH = 0;
for (const m of raw.matchAll(/\[\r?\nObjTp=Sg\r?\nH=(\d+)\r?\nNm=([^\r\n]+)\r?\n(?:SgTp=(\d+)\r?\n)?\]/g)) {
  existingByName[m[2]] = +m[1];
  maxSgH = Math.max(maxSgH, +m[1]);
}
const socleNu = maxSgH === 0;

// ---------------------------------------------------------------- 2. signaux
let nextH = maxSgH + 1;
const newSignals = [];            // {h, name, sgTp} 0 digital, 2 analog, 4 série
const typeByName = {};
function sig(name, sgTp) {
  if (typeByName[name] !== undefined && typeByName[name] !== sgTp) throw new Error('Type incohérent pour ' + name);
  typeByName[name] = sgTp;
  if (existingByName[name] !== undefined) return existingByName[name];
  const h = nextH++;
  existingByName[name] = h;
  newSignals.push({ h, name, sgTp });
  return h;
}
const inputs = {}, outputs = {};  // index EISC -> handle
const nameOfH = h => (newSignals.find(s => s.h === h) || { name: Object.keys(existingByName).find(k => existingByName[k] === h) }).name;
function setIdx(map, idx, h, what) {
  if (map[idx] !== undefined && map[idx] !== h) throw new Error('COLLISION ' + what + ' index ' + idx + ' : ' + nameOfH(map[idx]) + ' / ' + nameOfH(h));
  map[idx] = h;
}
const report = { dOut: 0, dIn: 0, aOut: 0, aIn: 0, sOut: 0, rooms: [] };
const din = (j, n) => { if (j > CAP.d) throw new Error('digital ' + j + ' hors capacité (' + n + ')'); setIdx(inputs, j, sig(n, 0), 'entrée digitale'); report.dIn++; };
const dout = (j, n) => { if (j > CAP.d) throw new Error('digital ' + j + ' hors capacité (' + n + ')'); setIdx(outputs, j, sig(n, 0), 'sortie digitale'); report.dOut++; };
const ain = (j, n) => { if (j > CAP.a) throw new Error('analog ' + j + ' hors capacité (' + n + ')'); setIdx(inputs, j + IN_A, sig(n, 2), 'entrée analogique'); report.aIn++; };
const aout = (j, n) => { if (j > CAP.a) throw new Error('analog ' + j + ' hors capacité (' + n + ')'); setIdx(outputs, j + OUT_A, sig(n, 2), 'sortie analogique'); report.aOut++; };
const sout = (j, n) => { if (j > CAP.s) throw new Error('série ' + j + ' hors capacité (' + n + ')'); setIdx(outputs, j + OUT_S, sig(n, 4), 'sortie série'); report.sOut++; };

// ---------------------------------------------------------------- 3. signaux globaux (joins < 1000, contrat v4.1)
const wellnessActif = !!(cfg.contrat && cfg.contrat.wellness && cfg.contrat.wellness.actif);
// 29.09.2026 : A/V et alarme câblés seulement s'ils existent dans la configuration (interface Connect : aucun)
const avActif = (cfg.pieces || []).some(p => p.actif !== false && p.pilotages && p.pilotages.audioVideo && p.pilotages.audioVideo.actif);
const alarmeActif = !(cfg.contrat && cfg.contrat.alarme && cfg.contrat.alarme.actif === false);
const MAX_ROOMS = 30, MAX_CIRCUITS = 20, MAX_MOTORS = 6;

// Sélection de pièces 1..30 (d11-40) — dans le Core, 1..10 étaient « déjà câblés dans la base »
for (let r = 1; r <= MAX_ROOMS; r++) { din(10 + r, 'Room_Select' + r); dout(10 + r, 'Room_Select' + r + '_fb'); }
// Alarme : armement 41/42 (lus par le C#), code v3 s43 / d44-46
if (alarmeActif) {
din(41, 'Alarm_Arm'); dout(41, 'Alarm_Arm_fb');
din(42, 'Alarm_Disarm'); dout(42, 'Alarm_Disarm_fb');
sout(43, 'Alarm_Code$');            // le slot 2 REÇOIT le code saisi
din(44, 'Alarm_Code_OK');           // le slot 2 répond : code valide
din(45, 'Alarm_Code_KO');           // le slot 2 répond : code refusé
dout(46, 'Alarm_Code_Clear');       // le slot 2 REÇOIT la demande d'effacement
}
// Consigne CVC +/- (49/50) : appuis reçus
dout(49, 'HVAC_Setpoint_Up');
dout(50, 'HVAC_Setpoint_Down');
// Scènes d'éclairage 1..4 (51-54) — « déjà câblées » dans le Core
for (let s = 1; s <= 4; s++) { din(50 + s, 'Lighting_Scene' + s); dout(50 + s, 'Lighting_Scene' + s + '_fb'); }
// Mute (55)
if (avActif) { din(55, 'Audio_Mute'); dout(55, 'Audio_Mute_fb'); }
// Stores groupés de la pièce active (61-69) : appuis reçus
['Volets', 'Rideaux', 'Stores'].forEach((g, gi) => {
  dout(61 + gi * 3, 'Shades_' + g + '_Up');
  dout(62 + gi * 3, 'Shades_' + g + '_Stop');
  dout(63 + gi * 3, 'Shades_' + g + '_Down');
});
// Moteurs 1..6 (81-98)
for (let mo = 1; mo <= MAX_MOTORS; mo++) {
  const b = 81 + (mo - 1) * 3;
  ['Up', 'Stop', 'Down'].forEach((k, i) => { din(b + i, 'Motor_' + mo + '_' + k); dout(b + i, 'Motor_' + mo + '_' + k + '_fb'); });
}
// Lamelles 111-128 (Core v5.0, 28.09.2026) : triplets Horaire / Stop / Antihoraire, cables seulement pour les
// moteurs qui ont `lamelles: true` dans au moins une piece (aucun ici : rideaux et voilages Lutron sans lamelles).
const slatsMotors = new Set();
(cfg.pieces || []).filter(p => p.actif !== false && p.pilotages && p.pilotages.moteurs && p.pilotages.moteurs.actif !== false)
  .forEach(p => ((p.pilotages.moteurs.liste) || [])
  .forEach((m, i) => { if (m && m.lamelles === true && i < MAX_MOTORS) slatsMotors.add(i + 1); }));
for (const mo of [...slatsMotors].sort()) {
  const b = 111 + (mo - 1) * 3;
  ['Tilt_CW', 'Tilt_Stop', 'Tilt_CCW'].forEach((t, k) => { din(b + k, 'Motor_' + mo + '_' + t); dout(b + k, 'Motor_' + mo + '_' + t + '_fb'); });
}
console.log('Lamelles (v5.0) : moteurs ' + ([...slatsMotors].sort().join(', ') || 'aucun') + ' -> joins 111-128.');
// Sources A/V 0..5 (150-155) + retour audio (156)
if (avActif) {
for (let s = 0; s <= 5; s++) { din(150 + s, 'Source_Select_' + s); dout(150 + s, 'Source_Select_' + s + '_fb'); }
din(156, 'Source_AudioReturn'); dout(156, 'Source_AudioReturn_fb');
// Extinction A/V (200)
din(200, 'AV_Off'); dout(200, 'AV_Off_fb');
}
// Scènes de stores 1..4 (201-204)
for (let s = 1; s <= 4; s++) { din(200 + s, 'Shades_Scene_' + s); dout(200 + s, 'Shades_Scene_' + s + '_fb'); }
// Télécommandes (appuis reçus, joins identiques quelle que soit la pièce ; routage SIMPL par a10 + a51)
const TEL_STB = ['Up', 'Down', 'Left', 'Right', 'Ok', 'Back', 'Menu', 'Exit', 'Live', 'Dvr',
  'Guide', 'Info', 'Last', 'PgUp', 'PgDn', 'ChUp', 'ChDn', 'Rew', 'Play', 'Fwd', 'Pause',
  'Stop', 'Replay', 'Rec', 'Yellow', 'Blue', 'Red', 'Green'];
const TEL_APPLE = ['Up', 'Down', 'Left', 'Right', 'Ok', 'Back', 'Home', 'Play', 'Rew', 'Fwd'];
const TEL_SW = ['Power', 'Assistant', 'Input', 'Mute', 'Rew', 'Rec', 'Fwd', 'Replay', 'Play',
  'Skip', 'Back', 'Home', 'Guide', 'Option', 'Up', 'Down', 'Left', 'Right', 'Ok', 'VolUp',
  'VolDn', 'Mic', 'PUp', 'PDn', 'Pip', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
  'D9', 'Txt', 'Radio', 'Red', 'Green', 'Yellow', 'Blue'];
if (avActif) {
TEL_APPLE.forEach((k, i) => dout(211 + i, 'Remote_AppleTV_' + k));
TEL_STB.forEach((k, i) => dout(500 + i, 'Remote_SkyQ_' + k));
TEL_STB.forEach((k, i) => dout(530 + i, 'Remote_IPTV_' + k));
TEL_SW.forEach((k, i) => dout(560 + i, 'Remote_Swisscom_' + k));
// Lecteur média (251-253, a254)
dout(251, 'Media_PlayPause'); dout(252, 'Media_Next'); dout(253, 'Media_Prev');
ain(254, 'Media_Volume#'); aout(254, 'Media_Volume_fb#');
}
// Partitions d'alarme 1..4 (301-312) : appuis reçus (_fb) ; état renvoyé (nom nu) lu par le C#
const PART = ['Arm', 'Partial', 'Disarm'];
if (alarmeActif) for (let pa = 1; pa <= 4; pa++) for (let k = 0; k < 3; k++) {
  const j = 301 + (pa - 1) * 3 + k;
  din(j, 'Alarm_Part' + pa + '_' + PART[k]); dout(j, 'Alarm_Part' + pa + '_' + PART[k] + '_fb');
}
// Commandes globales 401-411 : appuis reçus ; seuls 410/411 sont lus en retour par le C#
const GLOBAL = { 401: 'Global_Lights_AllOn', 402: 'Global_Lights_AllOff', 403: 'Global_Lights_Eco',
  404: 'Global_Shades_AllOpen', 405: 'Global_Shades_AllClose', 406: 'Global_Shades_Preset',
  407: 'Global_HVAC_Comfort', 408: 'Global_HVAC_Night', 409: 'Global_HVAC_Frost',
  410: 'Global_Vacation_On', 411: 'Global_Vacation_Off' };
for (const j of Object.keys(GLOBAL)) { dout(+j, GLOBAL[j] + '_fb'); if (+j >= 410) din(+j, GLOBAL[j]); }
// CVC étendu (610-615, a61) : commandes reçues
const HVAC = ['On', 'Off', 'Fan_Auto', 'Fan_Low', 'Fan_Medium', 'Fan_High'];
HVAC.forEach((name, i) => dout(610 + i, 'HVAC_' + name + '_Cmd'));
aout(61, 'HVAC_FanSpeed_Cmd#');
// Wellness (620-627, a62/63) : uniquement si le contrat l'active
const WELLNESS = ['Sauna_On', 'Sauna_Off', 'Sauna_Up', 'Sauna_Down', 'Hammam_On', 'Hammam_Off', 'Hammam_Up', 'Hammam_Down'];
if (wellnessActif) {
  WELLNESS.forEach((name, i) => dout(620 + i, name + '_Cmd'));
  aout(62, 'Sauna_Setpoint_Cmd#'); aout(63, 'Hammam_Humidity_Cmd#');
}
// Analogiques globaux — « déjà câblés » dans le Core : a10 sortie, a21, a31, a33 (les deux sens)
ain(10, 'Room_Select#'); aout(10, 'Room_Selected#');
ain(21, 'Lighting_Master'); aout(21, 'Lighting_Master_fb');
ain(31, 'HVAC_Setpoint'); aout(31, 'HVAC_Setpoint_fb');
aout(32, 'HVAC_Temperature_fb');
ain(33, 'HVAC_Mode'); aout(33, 'HVAC_Mode_fb');
if (avActif) {
  ain(51, 'Source_Active#'); aout(51, 'Source_Active_fb#');
  ain(52, 'Audio_Volume#'); aout(52, 'Audio_Volume_fb#');
}
// Circuits 1..20 (a71-90) : curseur de la pièce affichée (entrée morte côté C#, niveau tenu par le C#)
for (let ci = 1; ci <= MAX_CIRCUITS; ci++) { ain(70 + ci, 'Circuit_' + ci + '#'); aout(70 + ci, 'Circuit_' + ci + '_fb#'); }
// Sériels — « déjà câblés » dans le Core : s10 et s34
sout(10, 'Room_Selected$');
sout(32, 'HVAC_Temperature_fb$');
sout(33, 'HVAC_Mode_fb$');
sout(34, 'HVAC_Setpoint_fb$');

// ---------------------------------------------------------------- 4. blocs pièce (joins >= 1000) : CVC, éclairage, wellness
const ROOM_BASE = 1000, ROOM_SIZE = 100;
const roomBase = id => ROOM_BASE + (id - 1) * ROOM_SIZE;
const pieces = (cfg.pieces || []).filter(p => p.actif !== false && p.intersystem !== false);
const trop = pieces.filter(p => p.id < 1 || p.id > MAX_ROOMS);
if (trop.length) throw new Error('Pièces hors 1..' + MAX_ROOMS + ' : ' + trop.map(p => p.id).join(', '));
for (const p of pieces) {
  const b = roomBase(p.id), R = 'R' + String(p.id).padStart(2, '0') + '_';
  const pil = p.pilotages || {};
  let n = 0, det = [];
  // CVC (v4, 16.09) : consigne bidirectionnelle, température mesurée, état marche / ventilation
  if (pil.cvc && pil.cvc.actif !== false) {
    HVAC.forEach((h, i) => dout(b + 93 + i, R + 'HVAC_' + h + '_fb'));   // état tenu par le C#
    din(b + 93, R + 'HVAC_On_Actual');                                    // vrai ET faux sont des mesures
    aout(b + 33, R + 'HVAC_FanSpeed_fb#'); ain(b + 33, R + 'HVAC_FanSpeed_Actual#');
    aout(b + 31, R + 'HVAC_Setpoint_fb#');                                // consigne renvoyée par le C# (x10)
    ain(b + 31, R + 'HVAC_Setpoint#');                                    // consigne imposée par le thermostat réel
    ain(b + 32, R + 'HVAC_Temperature#');                                 // mesure envoyée par le slot 2 (x10)
    sout(b + 32, R + 'HVAC_Temperature_fb$'); sout(b + 33, R + 'HVAC_Mode_fb$'); sout(b + 34, R + 'HVAC_Setpoint_fb$');
    n += 14; det.push('CVC');
  }
  // Éclairage (v4.1, 18.09) : scènes tenues par le C#, circuits 1..n vers les gradateurs
  if (pil.eclairages && pil.eclairages.actif !== false) {
    const nbC = Math.min(MAX_CIRCUITS, Math.max(1, (pil.eclairages.circuits && pil.eclairages.circuits.nombre) || 4));
    for (let s = 1; s <= 4; s++) {
      dout(b + 20 + s, R + 'Lighting_Scene' + s + '_fb');     // scène active (C#)
      din(b + 20 + s, R + 'Lighting_Scene' + s + '_Actual');  // scène imposée par un clavier (facultatif)
    }
    for (let ci = 1; ci <= nbC; ci++) {
      aout(b + 70 + ci, R + 'Circuit_' + ci + '_fb#');        // niveau imposé par le C# -> gradateur
      ain(b + 70 + ci, R + 'Circuit_' + ci + '_Actual#');     // niveau réel remonté par le gradateur
    }
    n += 8 + 2 * nbC; det.push(nbC + ' circuits');
  }
  // Wellness (17.09) : sauna + hammam
  const w = pil.wellness;
  if (wellnessActif && w && w.sauna && w.sauna.actif && w.hammam && w.hammam.actif) {
    for (const i of [0, 1, 4, 5]) dout(b + 11 + i, R + WELLNESS[i] + '_fb');
    din(b + 11, R + 'Sauna_On_Actual'); din(b + 15, R + 'Hammam_On_Actual');
    ['Sauna_Setpoint', 'Hammam_Humidity_Setpoint', 'Sauna_Temperature', 'Hammam_Humidity'].forEach((name, i) => {
      aout(b + 34 + i, R + name + '_fb#'); ain(b + 34 + i, R + name + '_Actual#'); sout(b + 44 + i, R + name + '_fb$');
    });
    n += 18; det.push('wellness');
  }
  report.rooms.push({ id: p.id, nom: p.nom, base: b, signaux: n, det: det.join(', ') || 'aucun bloc' });
}

// ---------------------------------------------------------------- 5. réécriture du symbole EISC
const curI = {}, curO = {};
for (const line of sm[0].split(/\r?\n/)) {
  let m;
  if ((m = line.match(/^I(\d+)=(\d+)$/))) curI[+m[1]] = +m[2];
  else if ((m = line.match(/^O(\d+)=(\d+)$/))) curO[+m[1]] = +m[2];
}
// Sur une base déjà câblée : les câblages existants sont prioritaires (comme dans le Core), sauf
// les entrées du Core historiquement fausses (49/50 et 61-69 en entrée).
for (const idx of [49, 50, 61, 62, 63, 64, 65, 66, 67, 68, 69]) delete curI[idx];
for (const k of Object.keys(inputs)) if (curI[k] === undefined) curI[k] = inputs[k];
for (const k of Object.keys(outputs)) if (curO[k] === undefined) curO[k] = outputs[k];
const head = sm[0].split(/\r?\n/).filter(l => l && l !== '[' && l !== ']' && !/^[IO]\d+=/.test(l) && !/^(mI|mO|tO)=/.test(l));
const miLine = sm[0].match(/^mI=\d+$/m)[0], moLine = sm[0].match(/^mO=\d+$/m)[0], toLine = sm[0].match(/^tO=\d+$/m)[0];
const iK = Object.keys(curI).map(Number).sort((a, b) => a - b), oK = Object.keys(curO).map(Number).sort((a, b) => a - b);
raw = raw.replace(smRe, ['[', ...head, miLine, ...iK.map(k => 'I' + k + '=' + curI[k]), moLine, toLine, ...oK.map(k => 'O' + k + '=' + curO[k]), ']'].join(EOL));

// ---------------------------------------------------------------- 6. en-tête + nouveaux signaux en fin de fichier
raw = raw.replace(/^PrNm=.*$/m, 'PrNm=' + PROJECT_NAME).replace(/^CltNm=.*$/m, 'CltNm=' + CLIENT_NAME);
const sgBlocks = newSignals.map(s => ['[', 'ObjTp=Sg', 'H=' + s.h, 'Nm=' + s.name, ...(s.sgTp ? ['SgTp=' + s.sgTp] : []), ']'].join(EOL));
raw = raw.replace(/\s*$/, EOL) + (sgBlocks.length ? sgBlocks.join(EOL) + EOL : '');

// ---------------------------------------------------------------- rapport
const all = Object.keys(existingByName);
console.log('Appartement Crans-Montana — slot 2 : socle ' + (socleNu ? 'nu' : 'déjà câblé (' + maxSgH + ' signaux)') + ', EISC ' + N1I + ' digitaux / ' + (N2I - 1) + ' analog-série ; offsets analogIn=' + IN_A + ' analogOut=' + OUT_A + ' serieOut=' + OUT_S + ' ; EOL ' + (EOL === '\r\n' ? 'CRLF' : 'LF'));
console.log('Sorties (reçues par le slot 2) : ' + report.dOut + ' digitales, ' + report.aOut + ' analogiques, ' + report.sOut + ' séries');
console.log('Entrées (renvoyées par le slot 2) : ' + report.dIn + ' digitales, ' + report.aIn + ' analogiques');
for (const r of report.rooms) console.log('  bloc pièce ' + String(r.id).padStart(2, ' ') + ' « ' + r.nom + ' » base ' + r.base + ' : ' + r.signaux + ' signaux (' + r.det + ')');
console.log('A/V : ' + (avActif ? 'câblé' : 'absent (150-156, 200, 211-600, 251-254, a51-52, 55 non câblés)') + ' ; alarme : ' + (alarmeActif ? 'câblée' : 'absente (41-46, 301-312 non câblés)'));
console.log('Pièces exposées au slot 2 : ' + pieces.length + ' ; wellness : ' + (wellnessActif ? 'actif' : 'inactif (620-627 / a62-63 non câblés)'));
console.log('Signaux nommés : ' + all.length + ' (' + newSignals.length + ' ajoutés, handles ' + (maxSgH + 1) + '..' + (nextH - 1) + ') ; I/O EISC : ' + iK.length + ' entrées, ' + oK.length + ' sorties');
if (DRY) { console.log('(dry-run : rien écrit)'); process.exit(0); }
if (fs.readFileSync(CONFIG, 'utf8') !== configRaw || fs.readFileSync(BASE, 'latin1') !== original) throw new Error('Sources modifiées pendant la génération : rien écrit');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, raw, 'latin1');
// Liste lisible join -> nom, par type, pour le Debugger
const lines = ['# ' + PROJECT_NAME + ' — signaux EISC (IP-ID F0). O = sortie du symbole (reçu par le slot 2), I = entrée (renvoyé par le slot 2).', ''];
const joinOfIn = i => (i <= N1I ? ['D', i] : ['A', i - IN_A]);
const joinOfOut = i => (i <= N1O ? ['D', i] : (i <= OUT_S ? ['A', i - OUT_A] : ['S', i - OUT_S]));
for (const [title, keys, map, fn] of [['SORTIES (slot 2 reçoit)', oK, curO, joinOfOut], ['ENTRÉES (slot 2 renvoie)', iK, curI, joinOfIn]]) {
  lines.push('## ' + title);
  for (const t of ['D', 'A', 'S']) {
    const rows = keys.map(k => [fn(k), map[k]]).filter(x => x[0][0] === t).sort((x, y) => x[0][1] - y[0][1]);
    if (!rows.length) continue;
    lines.push('', '### ' + ({ D: 'Digitaux', A: 'Analogiques', S: 'Séries' })[t] + ' (' + rows.length + ')');
    for (const [[, j], h] of rows) lines.push(t.toLowerCase() + String(j).padStart(4, ' ') + '  ' + nameOfH(h));
  }
  lines.push('');
}
fs.writeFileSync(OUT.replace(/\.smw$/, '.signals.txt'), lines.join('\n') + '\n', 'utf8');
console.log('Écrit : ' + path.relative(ROOT, OUT) + ' + ' + path.basename(OUT).replace(/\.smw$/, '.signals.txt'));
