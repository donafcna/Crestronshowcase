// Complète Project_Slot2.smw (candidat courant, 17.09.2026 ; l'historique VillaCrans_Slot2.smw a été supprimé).
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
// IMPORTANT : fermer Project_Slot2.smw dans SIMPL Windows avant de lancer ce script.
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const BASE = path.resolve(arg('--input') || path.join(__dirname, '..', 'simpl-windows', 'Project_Slot2.smw'));
const OUT = path.resolve(arg('--output') || BASE);
const CONFIG = path.resolve(arg('--config') || path.join(__dirname, '..', '..', 'ch5', 'villa_config.json'));
const configRaw = fs.readFileSync(CONFIG, 'utf8');
const villaCfg = JSON.parse(configRaw);
const sameFile = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
if (!sameFile(OUT, BASE) && fs.existsSync(OUT)) throw new Error('La sortie SIMPL doit être un fichier neuf');

let raw = fs.readFileSync(BASE, 'latin1');
const original = raw;
// Never delete user backups. A separate output leaves the working SIMPL project untouched.
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
const capM = raw.match(/ObjTp=Sm\r?\nH=\d+\r?\nSmC=1160[\s\S]*?mI=(\d+)[\s\S]*?mO=(\d+)[\s\S]*?tO=(\d+)/);
if (!capM) { console.error('Compteurs mI/mO/tO introuvables sur le symbole EISC'); process.exit(1); }
const mIcap = parseInt(capM[1], 10), mOcap = parseInt(capM[2], 10), tOcap = parseInt(capM[3], 10);
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
// Consigne CVC (49/50) — EN SORTIE : le slot 2 RECOIT les appuis +/- de la GUI (comme les stores
// groupes). Correctif 16.09.2026 : ils etaient cables en entree (sens slot 2 -> GUI), l'appui
// arrivait sur l'EISC sans aucun nom cote slot 2 : invisible dans le debugger. Les anciennes
// entrees I49/I50 sont purgees ci-dessous.
dout(49, 'HVAC_Setpoint_Up');
dout(50, 'HVAC_Setpoint_Down');
const HVAC = ['On', 'Off', 'Fan_Auto', 'Fan_Low', 'Fan_Medium', 'Fan_High'];
HVAC.forEach((name, i) => dout(610 + i, 'HVAC_' + name + '_Cmd'));
aout(61, 'HVAC_FanSpeed_Cmd#');
const WELLNESS=['Sauna_On','Sauna_Off','Sauna_Up','Sauna_Down','Hammam_On','Hammam_Off','Hammam_Up','Hammam_Down'];
WELLNESS.forEach((name,i)=>dout(620+i,name+'_Cmd'));
aout(62,'Sauna_Setpoint_Cmd#');aout(63,'Hammam_Humidity_Cmd#');
// Scènes 51-54 : déjà câblées dans la base (Lighting_Scene1..4 + fb)
// Mute (55)
din(55, 'Audio_Mute'); dout(55, 'Audio_Mute_fb');
// Extinction A/V (200, AV.Extinction) : bouton OFF de la dalle. Manquait dans toutes les generations
// (seul le bloc piece R*_AV_Off, desactive en v4, le portait) : l'appui n'apparaissait pas dans le
// debugger (17.09.2026). L'iPhone emet 150 (Source_Select_0), deja cable.
din(200, 'AV_Off'); dout(200, 'AV_Off_fb');
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
const purgeInputs = [49, 50, 61, 62, 63, 64, 65, 66, 67, 68, 69];
// Moteurs 1..6 (81-98) : commandes + écho des appuis GUI
for (let mo = 1; mo <= 6; mo++) {
  const b = 81 + (mo - 1) * 3;
  din(b, 'Motor_' + mo + '_Up'); dout(b, 'Motor_' + mo + '_Up_fb');
  din(b + 1, 'Motor_' + mo + '_Stop'); dout(b + 1, 'Motor_' + mo + '_Stop_fb');
  din(b + 2, 'Motor_' + mo + '_Down'); dout(b + 2, 'Motor_' + mo + '_Down_fb');
}
// Sources A/V 0..5 (150-155)
for (let s = 0; s <= 5; s++) { din(150 + s, 'Source_Select_' + s); dout(150 + s, 'Source_Select_' + s + '_fb'); }
// 156 : l'audio revient a la source video (v1.0.166) — manquait dans toutes les generations.
din(156, 'Source_AudioReturn'); dout(156, 'Source_AudioReturn_fb');
// Lecteur media (251-253 transport, a254 volume) : manquaient aussi dans les signaux globaux
// (seuls les blocs pieces, desactives en v4, les portaient). Recus de la GUI = sorties du symbole.
dout(251, 'Media_PlayPause'); dout(252, 'Media_Next'); dout(253, 'Media_Prev');
ain(254, 'Media_Volume#'); aout(254, 'Media_Volume_fb#');
// Partitions d'alarme 1..4 (301-312, triplets Armer / Partiel / Desarmer, bidirectionnels) et
// commandes globales 401-411 : absents de toutes les generations (recette TSW du 16.09.2026,
// « aucun bouton de la fenetre Systeme de securite ne remonte »). Appuis recus = sorties ;
// l'etat renvoye par le slot 2 (nom nu, entree) est facultatif : le C# tient deja ce feedback.
const PART = ['Arm', 'Partial', 'Disarm'];
for (let pa = 1; pa <= 4; pa++) for (let k = 0; k < 3; k++) {
  const j = 301 + (pa - 1) * 3 + k;
  din(j, 'Alarm_Part' + pa + '_' + PART[k]); dout(j, 'Alarm_Part' + pa + '_' + PART[k] + '_fb');
}
const GLOBAL = { 401: 'Global_Lights_AllOn', 402: 'Global_Lights_AllOff', 403: 'Global_Lights_Eco',
  404: 'Global_Shades_AllOpen', 405: 'Global_Shades_AllClose', 406: 'Global_Shades_Preset',
  407: 'Global_HVAC_Comfort', 408: 'Global_HVAC_Night', 409: 'Global_HVAC_Frost',
  410: 'Global_Vacation_On', 411: 'Global_Vacation_Off' };
Object.keys(GLOBAL).forEach(j => { dout(+j, GLOBAL[j] + '_fb'); if (+j >= 410) din(+j, GLOBAL[j]); });
// Scènes de stores 1..4 (201-204)
for (let s = 1; s <= 4; s++) { din(200 + s, 'Shades_Scene_' + s); dout(200 + s, 'Shades_Scene_' + s + '_fb'); }
// --- TELECOMMANDES DES SOURCES (contrat v4, 15.09.2026) ---
// Appuis emis par la GUI -> le slot 2 les RECOIT, donc en SORTIE du symbole (comme les stores
// groupes). Joins IDENTIQUES quelle que soit la piece : c'est SIMPL qui route vers le bon
// decodeur, a partir de Room_Select# (a10) et Source_Active# (a51), avec ses buffers.
// Ces 107 signaux n'existaient dans AUCUNE generation precedente : c'est la raison pour
// laquelle aucun appui de telecommande ne remontait dans le debugger.
const TEL_STB = ['Up', 'Down', 'Left', 'Right', 'Ok', 'Back', 'Menu', 'Exit', 'Live', 'Dvr',
  'Guide', 'Info', 'Last', 'PgUp', 'PgDn', 'ChUp', 'ChDn', 'Rew', 'Play', 'Fwd', 'Pause',
  'Stop', 'Replay', 'Rec', 'Yellow', 'Blue', 'Red', 'Green'];
const TEL_APPLE = ['Up', 'Down', 'Left', 'Right', 'Ok', 'Back', 'Home', 'Play', 'Rew', 'Fwd'];
const TEL_SW = ['Power', 'Assistant', 'Input', 'Mute', 'Rew', 'Rec', 'Fwd', 'Replay', 'Play',
  'Skip', 'Back', 'Home', 'Guide', 'Option', 'Up', 'Down', 'Left', 'Right', 'Ok', 'VolUp',
  'VolDn', 'Mic', 'PUp', 'PDn', 'Pip', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
  'D9', 'Txt', 'Radio', 'Red', 'Green', 'Yellow', 'Blue'];
TEL_APPLE.forEach((k, i) => dout(211 + i, 'Remote_AppleTV_' + k));
TEL_STB.forEach((k, i) => dout(500 + i, 'Remote_SkyQ_' + k));
TEL_STB.forEach((k, i) => dout(530 + i, 'Remote_IPTV_' + k));
TEL_SW.forEach((k, i) => dout(560 + i, 'Remote_Swisscom_' + k));
// Le mute de la telecommande Swisscom (offset +3) agit sur AV.Mute global (55), deja cable.

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

// Chaîne d'alarme v3 (contrat.alarme) : le pavé de la GUI envoie le code en sériel 43, le slot 2
// répond OK/KO en digital 44/45, la GUI demande l'effacement en digital 46.
sout(43, 'Alarm_Code$');        // le slot 2 REÇOIT le code saisi
din(44, 'Alarm_Code_OK');       // le slot 2 répond : code valide
din(45, 'Alarm_Code_KO');       // le slot 2 répond : code refusé
dout(46, 'Alarm_Code_Clear');   // le slot 2 REÇOIT la demande d'effacement

// --- 3b. BLOCS PIÈCES : tous les boutons de toutes les pièces (contrat v3) ---
// joinPhysique = 1000 + (pieceId - 1) * 100 + offset, offsets = contrat.blocsPiecesGui.mapping.
// Chaque offset est câblé dans les deux sens : SORTIE (reçue par le slot 2, nom nu) et
// ENTREE (émise par le slot 2, suffixe _CMD). Les sériels n'existent qu'en sortie.
const ROOM_BASE = 1000, ROOM_SIZE = 100;

// Nom métier de chaque offset, dérivé du mapping du contrat (join logique -> offset).
const OFF_D = {};
HVAC.forEach((name, i) => { OFF_D[93 + i] = 'HVAC_' + name; });
['Volets', 'Rideaux', 'Stores'].forEach((g, gi) => {          // joins logiques 61-69
  OFF_D[1 + gi * 3] = 'Shades_' + g + '_Up';
  OFF_D[2 + gi * 3] = 'Shades_' + g + '_Stop';
  OFF_D[3 + gi * 3] = 'Shades_' + g + '_Down';
});
for (let n = 1; n <= 4; n++) OFF_D[20 + n] = 'Lighting_Scene' + n;   // 51-54
OFF_D[35] = 'HVAC_Setpoint_Up';                                     // 49
OFF_D[36] = 'HVAC_Setpoint_Down';                                   // 50
for (let n = 1; n <= 4; n++) OFF_D[40 + n] = 'Shades_Scene' + n;    // 201-204
OFF_D[45] = 'AV_Off';                                               // 200
OFF_D[50] = 'Audio_Mute';                                           // 55
OFF_D[51] = 'Source_Off';                                           // 150
OFF_D[52] = 'Source_AppleTV';                                       // 151
OFF_D[53] = 'Source_SkyQ';                                          // 152
OFF_D[54] = 'Source_Swisscom';                                      // 153
OFF_D[55] = 'Source_IPTV';                                          // 154
OFF_D[56] = 'Source_Music';                                         // 155
OFF_D[57] = 'Source_AudioReturn';                                   // 156
OFF_D[58] = 'Media_PlayPause';                                      // 251
OFF_D[59] = 'Media_Next';                                           // 252
OFF_D[60] = 'Media_Prev';                                           // 253
for (let mo = 1; mo <= 6; mo++) {                                   // 81-98
  const b0 = 61 + (mo - 1) * 3;
  OFF_D[b0] = 'Motor_' + mo + '_Up';
  OFF_D[b0 + 1] = 'Motor_' + mo + '_Stop';
  OFF_D[b0 + 2] = 'Motor_' + mo + '_Down';
}

// L'analogique +21 (Lighting_Master) a été retiré du bloc pièce le 13.09.2026 : la GUI ne le
// lisait pas et il ne portait aucune information que les niveaux de circuits ne donnent déjà.
// Le signal GLOBAL 'Lighting_Master' (a21) reste en place : il sert au calibrage ci-dessus.
WELLNESS.forEach((name,i)=>OFF_D[11+i]=name);
const OFF_A = { 34:'Sauna_Setpoint',35:'Hammam_Humidity_Setpoint',36:'Sauna_Temperature',37:'Hammam_Humidity', 31: 'HVAC_Setpoint', 33: 'HVAC_FanSpeed', 51: 'Source_Active',
                52: 'Audio_Volume', 53: 'Source_Audio', 54: 'Media_Volume' };
for (let ci = 1; ci <= 10; ci++) OFF_A[70 + ci] = 'Circuit_' + ci;  // 71-80

const OFF_S = { 44:'Sauna_Setpoint_Text',45:'Hammam_Setpoint_Text',46:'Sauna_Temperature_Text',47:'Hammam_Humidity_Text', 10: 'Room_Name', 32: 'HVAC_Temperature', 33: 'HVAC_Mode', 34: 'HVAC_Setpoint_Text' };

// Controle du plan par rapport au mapping du contrat : aucun offset ne doit manquer.
const mapping = (villaCfg.contrat && villaCfg.contrat.blocsPiecesGui && villaCfg.contrat.blocsPiecesGui.mapping) || {};
const manquants = [];
for (const [type, table, plan] of [['digital', mapping.digital, OFF_D], ['analog', mapping.analog, OFF_A], ['serial', mapping.serial, OFF_S]]) {
  for (const off of Object.values(table || {})) if (plan[off] === undefined) manquants.push(type + ' offset +' + off);
}
if (manquants.length) { console.error('Offsets du contrat sans nom dans le plan : ' + manquants.join(', ')); process.exit(1); }

// Capacites reelles du symbole, deduites des dimensions et des offsets calibres.
const CAP = {
  dIn: N1I, dOut: N1O,
  aIn: mIcap - IN_A, aOut: mOcap - OUT_A,
  sOut: tOcap - OUT_S,
};
// Contrat v4 : blocsPiecesGui.actif = false -> plus aucun bloc par piece. Les pilotages
// utilisent des joins globaux et SIMPL route par buffers ; cela retire ~1035 signaux du
// debugger Toolbox. Les R01_* .. R15_* deja presents dans le .smw ne sont PAS supprimes
// par ce script (il ajoute, il n'enleve jamais) : les retirer se fait dans SIMPL Windows.
const blocsActifs = !!(villaCfg.contrat && villaCfg.contrat.blocsPiecesGui
  && villaCfg.contrat.blocsPiecesGui.actif === true);
const pieces = blocsActifs ? (villaCfg.pieces || []).filter(p => p.intersystem !== false) : [];
if (!blocsActifs) console.log('Blocs pieces desactives (contrat v4) : seuls les signaux globaux sont cables.');
const roomBase = id => ROOM_BASE + (id - 1) * ROOM_SIZE;
let wired = 0; const skipped = [];
for (const p of pieces) {
  const b = roomBase(p.id);
  const R = 'R' + String(p.id).padStart(2, '0') + '_';
  const maxD = b + Math.max(...Object.keys(OFF_D).map(Number));
  const maxA = b + Math.max(...Object.keys(OFF_A).map(Number));
  const maxS = b + Math.max(...Object.keys(OFF_S).map(Number));
  const pb = [];
  if (maxD > CAP.dIn || maxD > CAP.dOut) pb.push('digital ' + maxD + ' > ' + Math.min(CAP.dIn, CAP.dOut));
  if (maxA > CAP.aIn || maxA > CAP.aOut) pb.push('analog ' + maxA + ' > ' + Math.min(CAP.aIn, CAP.aOut));
  if (maxS > CAP.sOut) pb.push('serie ' + maxS + ' > ' + CAP.sOut);
  if (pb.length) { skipped.push('piece ' + p.id + ' (' + pb.join(', ') + ')'); continue; }
  for (const [off, nom] of Object.entries(OFF_D)) {
    dout(b + Number(off), R + nom);            // ce que le slot 2 recoit (appui GUI + etat)
    din(b + Number(off), R + nom + '_CMD');    // ce que le slot 2 envoie
  }
  for (const [off, nom] of Object.entries(OFF_A)) {
    aout(b + Number(off), R + nom + '#');
    ain(b + Number(off), R + nom + '_CMD#');
  }
  for (const [off, nom] of Object.entries(OFF_S)) sout(b + Number(off), R + nom + '$');
  wired++;
}

// --- 3b. Bloc CVC réduit par pièce (v4, demande du 16.09.2026) ---------------------------
// La fenêtre Contrôle global (Confort / Nuit / Hors gel) agit sur toutes les pièces : le slot 2
// doit voir et piloter CHAQUE consigne séparément. On garde donc, par pièce 'intersystem',
// uniquement les joins CVC du bloc (base 1000 + (id-1)*100) : analogique +31 (consigne x10, dans
// les deux sens) et sériels +32/+33/+34 (température, mode, consigne texte). Le C# les pousse
// déjà (PushRoomFeedback) et applique une consigne reçue du slot 2 sur +31.
const piecesCvc = (villaCfg.pieces || []).filter(p => p.intersystem !== false && p.actif !== false
  && p.pilotages && p.pilotages.cvc && p.pilotages.cvc.actif !== false);
let cvcWired = 0;
for (const p of piecesCvc) {
  const b = roomBase(p.id), R = 'R' + String(p.id).padStart(2, '0') + '_';
  if (b + 34 > CAP.aIn || b + 34 > CAP.aOut || b + 34 > CAP.sOut || b + 98 > CAP.dIn || b + 98 > CAP.dOut) { skipped.push('piece ' + p.id + ' (CVC hors capacite)'); continue; }
  // Per-room state/driver targets, separate from the global GUI command pulses.
  for (let h=0;h<6;h++) aHvac(h);
  function aHvac(h) { dout(b + 93 + h, R + 'HVAC_' + HVAC[h] + '_fb'); }
  din(b + 93, R + 'HVAC_On_Actual'); // true AND false are meaningful measured returns
  aout(b + 33, R + 'HVAC_FanSpeed_fb#');
  ain(b + 33, R + 'HVAC_FanSpeed_Actual#');
  aout(b + 31, R + 'HVAC_Setpoint_fb#');      // consigne renvoyee par le C# (x10 : 215 = 21,5 C)
  ain(b + 31, R + 'HVAC_Setpoint#');          // consigne imposee par le slot 2 (thermostat reel)
  ain(b + 32, R + 'HVAC_Temperature#');       // temperature mesuree, envoyee par le slot 2 (x10)
  sout(b + 32, R + 'HVAC_Temperature_fb$');
  sout(b + 33, R + 'HVAC_Mode_fb$');
  sout(b + 34, R + 'HVAC_Setpoint_fb$');
  cvcWired++;
}
console.log('Bloc CVC par piece (v4) : ' + cvcWired + ' piece(s) x (consigne bidirectionnelle, temperature mesuree, 3 seriels).');

for(const p of villaCfg.pieces.filter(p=>p.actif!==false&&p.intersystem!==false&&p.pilotages?.wellness?.sauna?.actif&&p.pilotages?.wellness?.hammam?.actif)) {
 const b=roomBase(p.id),R='R'+String(p.id).padStart(2,'0')+'_';
 if(b+37>CAP.aIn||b+37>CAP.aOut||b+47>CAP.sOut||b+16>CAP.dIn||b+16>CAP.dOut){skipped.push('Wellness hors capacite '+p.id);continue;}
 for(const i of [0,1,4,5])dout(b+11+i,R+WELLNESS[i]+'_fb');
 din(b+11,R+'Sauna_On_Actual');din(b+15,R+'Hammam_On_Actual');
 for(const [i,name] of ['Sauna_Setpoint','Hammam_Humidity_Setpoint','Sauna_Temperature','Hammam_Humidity'].entries()){
  aout(b+34+i,R+name+'_fb#');ain(b+34+i,R+name+'_Actual#');sout(b+44+i,R+name+'_fb$');
 }
}
if (CAP.dOut < 627 || CAP.aOut < 63 || skipped.length) throw new Error('Capacite EISC insuffisante : aucun fichier ecrit. ' + skipped.join('; '));

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
// Purge des blocs pièces (>= 1000) : les générations précédentes y avaient posé des noms
// par famille (Lighting_Room1_Scene1...). On les remplace par le nommage uniforme R01_...,
// sinon les pièces 1 à 3 gardent un nommage différent des 12 autres dans le debugger.
const joinOfIn = i => (i <= N1I ? i : i - IN_A);
const joinOfOut = i => (i <= N1O ? i : (i <= OUT_S ? i - OUT_A : i - OUT_S));
let purgedRoom = 0;
for (const k of Object.keys(curI).map(Number)) {
  if (joinOfIn(k) >= ROOM_BASE && inputs[k] !== undefined) { delete curI[k]; purgedRoom++; }
}
for (const k of Object.keys(curO).map(Number)) {
  if (joinOfOut(k) >= ROOM_BASE && outputs[k] !== undefined) { delete curO[k]; purgedRoom++; }
}
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

if (fs.readFileSync(CONFIG, 'utf8') !== configRaw || fs.readFileSync(BASE, 'latin1') !== original) throw new Error('Sources modifiées pendant la génération : aucun fichier écrit');
if (sameFile(OUT, BASE)) {
  const stamp = new Date().toISOString().replace(/[:.T]/g, '-').replace('Z', '');
  fs.writeFileSync(path.join(path.dirname(BASE), path.basename(BASE, '.smw') + '.backup-' + stamp + '.smw'), original, {encoding:'latin1',flag:'wx'});
}
fs.writeFileSync(OUT, raw, {encoding:'latin1', flag: sameFile(OUT, BASE) ? 'w' : 'wx'});
console.log('OK : ' + path.basename(OUT));
console.log('Signaux ajoutés : ' + newSignals.length + ' (handles ' + (maxSgH + 1) + '..' + (nextH - 1) + ')');
console.log('Entrées EISC : ' + iKeys.length + ' | Sorties EISC : ' + oKeys.length
  + ' | anciens câblages de pièce remplacés : ' + purgedRoom);
console.log('Capacités du symbole EISC : digital ' + Math.min(CAP.dIn, CAP.dOut)
  + ' | analog ' + Math.min(CAP.aIn, CAP.aOut) + ' | série ' + CAP.sOut + ' joins');
console.log('Blocs pièces : ' + wired + ' pièce(s) câblée(s) sur ' + pieces.length
  + ' exposée(s) au slot 2, ' + skipped.length + ' hors capacité');
if (skipped.length) {
  console.log('>>> Hors capacité : ' + skipped.join(' ; '));
  console.log('>>> Dans SIMPL Windows, double-cliquer le symbole EISC et augmenter le nombre de joins,');
  console.log('>>> sauvegarder, puis relancer ce script.');
} else {
  console.log('Convention : R07_Lighting_Scene2 = reçu par le slot 2 (appui GUI + état) ;');
  console.log('             R07_Lighting_Scene2_CMD = émis par le slot 2 vers la GUI.');
}
