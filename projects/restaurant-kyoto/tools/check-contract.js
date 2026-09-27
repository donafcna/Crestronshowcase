#!/usr/bin/env node
// Restaurant Kyoto Gardens — vérifie que config/restaurant-kyoto_config.json (contrat) et
// simpl-sharp/RestaurantKyoto/Joins.cs racontent la même chose, et qu'aucun join ne se chevauche.
//   node tools/check-contract.js   → code de sortie 0 si tout est cohérent.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'restaurant-kyoto_config.json'), 'utf8'));
const cs = fs.readFileSync(path.join(ROOT, 'simpl-sharp', 'RestaurantKyoto', 'Joins.cs'), 'utf8');
const errors = [];

// ---- constantes C#
const consts = {};
let scope = '';
for (const line of cs.split(/\r?\n/)) {
  const s = line.match(/public static class (\w+)/); if (s) scope = s[1] === 'Joins' ? '' : s[1] + '.';
  const m = line.match(/public const (?:uint|int) (\w+) = (\d+);/); if (m) consts[scope + m[1]] = +m[2];
}

// ---- JSON nom → constante C# (les noms {n} pointent sur une base = début − 1)
const MAP = {
  digital: {
    Scene_Welcome: 'SceneWelcome', Scene_Dinner: 'SceneDinner', Scene_Rooftop: 'SceneRooftop', Scene_Cleaning: 'SceneCleaning', Scene_Closed: 'SceneClosed',
    Room_Select_All: 'RoomSelectAll', 'Room_Select_{n}': 'RoomSelectBase',
    Lights_AllOn: 'LightsAllOn', Lights_AllOff: 'LightsAllOff', 'Light_{n}_Toggle': 'LightToggleBase',
    HVAC_Setpoint_Up: 'HvacSetpointUp', HVAC_Setpoint_Down: 'HvacSetpointDown',
    Music_PlayPause: 'MusicPlayPause', 'Music_EQ_{n}': 'MusicEqBase', Config_Resync: 'ConfigResync',
    Service_Fluide: 'ServiceFluide', Service_Sommelier: 'ServiceSommelier', Service_Accueil: 'ServiceAccueil', Service_Cuisine: 'ServiceCuisine',
  },
  analog: {
    'Room_Select#': 'RoomSelect', 'Light_{n}_Level#': 'LightLevelBase', 'Scene#': 'Scene', 'Music_Volume#': 'MusicVolume',
    'Room_LightsAvg#': 'RoomLightsAvg', 'Room_LightsOn#': 'RoomLightsOn', 'Restaurant_LightsOn#': 'RestaurantLightsOn',
    'HVAC_Setpoint#': 'HvacSetpoint', 'HVAC_Temperature#': 'HvacTemperature', 'HVAC_FreshAir#': 'HvacFreshAir',
    'Service_State#': 'ServiceState', 'Covers#': 'Covers', 'Config_ChunkAck#': 'ConfigChunkAck',
  },
  serial: {
    'Room_Name$': 'RoomName', 'Room_Subtitle$': 'RoomSubtitle', 'Scene_Name$': 'SceneName', 'Restaurant_Summary$': 'RestaurantSummary',
    'Music_Title$': 'MusicTitle', 'Music_Sub$': 'MusicSub', 'Service_Text$': 'ServiceText',
    'Systeme_IpId$': 'SystemIpId', 'Systeme_CpzNom$': 'SystemCpzName', 'Systeme_CpzDate$': 'SystemCpzDate', 'Config_Json$': 'ConfigJson', 'Config_Hash$': 'ConfigHash',
  },
  roomDigital: { 'Light_{n}_On': 'Room.LightOnBase', Room_Displayed: 'Room.Displayed' },
  roomAnalog: { 'Light_{n}_Level': 'Room.LightLevelBase', Scene: 'Room.Scene' },
  roomSerial: { Room_Name: 'Room.Name' },
};
const start = r => +String(r).split('-')[0];
const end = r => { const p = String(r).split('-'); return +(p[1] || p[0]); };

function checkTable(label, table, map) {
  const used = [];
  for (const [range, def] of Object.entries(table)) {
    const a = start(range), b = end(range);
    for (const [ua, ub, un] of used) if (a <= ub && b >= ua) errors.push(label + ' : ' + def.nom + ' (' + range + ') chevauche ' + un + ' (' + ua + '-' + ub + ')');
    used.push([a, b, def.nom]);
    const c = map[def.nom];
    if (!c) { errors.push(label + ' : aucune constante C# associée à ' + def.nom); continue; }
    if (consts[c] === undefined) { errors.push(label + ' : constante ' + c + ' absente de Joins.cs'); continue; }
    const expected = def.nom.includes('{n}') ? a - 1 : a;
    if (consts[c] !== expected) errors.push(label + ' : ' + def.nom + ' = ' + a + ' dans le JSON, ' + c + ' = ' + consts[c] + ' dans Joins.cs');
    if (b - a + 1 > 40 && !def.nom.includes('{n}')) errors.push(label + ' : plage ' + range + ' suspecte pour ' + def.nom);
  }
  // toutes les constantes du C# doivent exister dans le JSON (pas de join fantôme)
  for (const c of Object.values(map)) if (!Object.values(table).some(d => map[d.nom] === c)) errors.push(label + ' : ' + c + ' (Joins.cs) absent du JSON');
}
const g = cfg.contrat.signauxGlobaux;
checkTable('digital', g.digital, MAP.digital);
checkTable('analog', g.analog, MAP.analog);
checkTable('serial', g.serial, MAP.serial);
const bp = cfg.contrat.blocsPieces;
checkTable('bloc digital', bp.digital, MAP.roomDigital);
checkTable('bloc analog', bp.analog, MAP.roomAnalog);
checkTable('bloc serial', bp.serial, MAP.roomSerial);
for (const t of [bp.digital, bp.analog, bp.serial]) for (const r of Object.keys(t)) if (end(r) >= bp.taille) errors.push('bloc zone : offset ' + r + ' ≥ taille ' + bp.taille);
if (consts.RoomBlockBase !== bp.base || consts.RoomBlockSize !== bp.taille) errors.push('RoomBlockBase/Size ≠ contrat.blocsPieces');
const L = cfg.contrat.limites;
for (const [k, c] of [['piecesMax', 'MaxRooms'], ['circuitsMax', 'MaxCircuits'], ['scenesMax', 'MaxScenes'], ['eqMax', 'MaxEq'], ['servicesMax', 'MaxServices']])
  if (consts[c] !== L[k]) errors.push('limite ' + k + ' = ' + L[k] + ' mais ' + c + ' = ' + consts[c]);
// plages {n} dimensionnées par les limites
const rangeLen = (table, nom) => { const e = Object.entries(table).find(([, d]) => d.nom === nom); return e ? end(e[0]) - start(e[0]) + 1 : -1; };
if (rangeLen(g.digital, 'Room_Select_{n}') !== L.piecesMax) errors.push('Room_Select_{n} : plage ≠ piecesMax');
if (rangeLen(g.digital, 'Light_{n}_Toggle') !== L.circuitsMax) errors.push('Light_{n}_Toggle : plage ≠ circuitsMax');
if (rangeLen(g.analog, 'Light_{n}_Level#') !== L.circuitsMax) errors.push('Light_{n}_Level# : plage ≠ circuitsMax');
if (rangeLen(g.digital, 'Music_EQ_{n}') !== L.eqMax) errors.push('Music_EQ_{n} : plage ≠ eqMax');
if (rangeLen(bp.digital, 'Light_{n}_On') !== L.circuitsMax || rangeLen(bp.analog, 'Light_{n}_Level') !== L.circuitsMax) errors.push('bloc zone : plages Light_{n} ≠ circuitsMax');
if (consts.SceneClosed - consts.SceneWelcome + 1 !== L.scenesMax) errors.push('Scene_Welcome..Scene_Closed ≠ scenesMax');
if (consts.ServiceCuisine - consts.ServiceFluide + 1 !== L.servicesMax) errors.push('Service_Fluide..Service_Cuisine ≠ servicesMax');

// ---- capacité EISC et séparation globaux / blocs
const EISC_CAP = 2732;
const maxGlobal = Math.max(...[...Object.keys(g.digital), ...Object.keys(g.analog)].map(end));
if (bp.base <= maxGlobal) errors.push('blocs zone : base ' + bp.base + ' ≤ dernier join global ' + maxGlobal);
if (bp.base + L.piecesMax * bp.taille - 1 > EISC_CAP) errors.push('blocs zone : ' + L.piecesMax + ' × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP + ' (piecesMax trop grand pour le socle)');
if (bp.base + cfg.pieces.length * bp.taille - 1 > EISC_CAP) errors.push('blocs zone : ' + cfg.pieces.length + ' zones × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP);

// ---- signaux restaurant renvoyés par le slot 2 : mêmes joins que le contrat global
const me = cfg.contrat.signauxMaisonEisc || {};
for (const [range, name] of Object.entries(me.digitalActual || {})) if (!Object.entries(g.digital).some(([r, d]) => r === range && d.nom === name)) errors.push('signauxMaisonEisc digital ' + range + ' ' + name + ' ≠ signauxGlobaux');
for (const [range, name] of Object.entries(me.analogActual || {})) if (!Object.entries(g.analog).some(([r, d]) => r === range && d.nom === name + '#')) errors.push('signauxMaisonEisc analog ' + range + ' ' + name + ' ≠ signauxGlobaux');

// ---- zones : ids uniques, clés uniques, dimensions dans les limites, circuits cohérents
const ids = new Set(), keys = new Set();
const floors = new Set((cfg.etages || []).map(e => e.id));
const circuitKeys = new Set();
let exteriors = 0;
for (const p of cfg.pieces) {
  if (ids.has(p.id)) errors.push('zone id ' + p.id + ' en double'); ids.add(p.id);
  if (!p.cle) errors.push('zone ' + p.id + ' sans cle');
  if (keys.has(p.cle)) errors.push('zone cle ' + p.cle + ' en double'); keys.add(p.cle);
  if (p.id < 1 || p.id > L.piecesMax) errors.push('zone ' + p.id + ' hors 1..' + L.piecesMax);
  if (!floors.has(p.etage)) errors.push('zone ' + p.id + ' : étage inconnu ' + p.etage);
  if (p.exterieur) exteriors++;
  if (p.pilotages && (p.pilotages.audio || p.pilotages.cvc || p.pilotages.climat)) errors.push('zone ' + p.id + ' : audio / climat par zone non prévus (globaux restaurant)');
  const circ = (p.pilotages && p.pilotages.eclairages && p.pilotages.eclairages.circuits) || [];
  if (circ.length > L.circuitsMax) errors.push('zone ' + p.id + ' : ' + circ.length + ' circuits > ' + L.circuitsMax);
  circ.forEach(c => { if (!c.cle) errors.push('zone ' + p.id + ' : circuit sans cle'); circuitKeys.add(c.cle); });
}
if (cfg.pieces[0] && cfg.pieces[0].id !== 1) errors.push('la première zone doit porter id 1 (ordre du GUI)');
const R = cfg.restaurant || {};
const sceneIds = new Set();
for (const s of R.scenes || []) {
  if (s.id < 1 || s.id > L.scenesMax) errors.push('scène ' + s.cle + ' : id ' + s.id + ' hors 1..' + L.scenesMax + ' (Scene_Welcome..Scene_Closed)');
  if (sceneIds.has(s.id)) errors.push('scène id ' + s.id + ' en double'); sceneIds.add(s.id);
  for (const k of Object.keys(s.niveaux || {})) if (!circuitKeys.has(k)) errors.push('scène ' + s.cle + ' : clé de circuit inconnue ' + k);
  if (exteriors && !(R.libellesScenesExterieur || {})[s.cle]) errors.push('scène ' + s.cle + ' : libellé extérieur absent (libellesScenesExterieur)');
}
if (!(R.scenes || []).some(s => s.cle === R.sceneInitiale)) errors.push('sceneInitiale : scène inconnue');
if (R.climat && R.climat.actif) {
  const c = R.climat.consigne || {}, i = R.climat.etatInitial || {};
  if (!(c.min < c.max) || !(c.pas > 0)) errors.push('climat.consigne : min/max/pas invalides');
  if (i.consigne < c.min || i.consigne > c.max) errors.push('climat.etatInitial.consigne hors bornes');
}
if (R.musique && R.musique.actif) {
  const m = R.musique, i = m.etatInitial || {};
  if (!(m.volumeMax >= 1 && m.volumeMax <= 100)) errors.push('musique.volumeMax hors 1..100');
  if (i.volume < 0 || i.volume > m.volumeMax) errors.push('musique.etatInitial.volume hors 0..volumeMax');
  if ((m.eq || []).length > L.eqMax) errors.push('musique.eq > ' + L.eqMax);
  for (const e of m.eq || []) if (e.id < 1 || e.id > L.eqMax) errors.push('eq ' + e.nom + ' : id hors 1..' + L.eqMax);
  if (!(m.eq || []).some(e => e.id === i.eq)) errors.push('musique.etatInitial.eq inconnu');
}
if (R.service && R.service.actif) {
  const st = R.service.etats || [];
  if (st.length > L.servicesMax) errors.push('service.etats > ' + L.servicesMax);
  for (const e of st) if (e.id < 0 || e.id >= L.servicesMax) errors.push('service ' + e.cle + ' : id hors 0..' + (L.servicesMax - 1));
  if (!st.some(e => e.cle === R.service.etatInitial)) errors.push('service.etatInitial inconnu');
}

if (errors.length) { console.error('Contrat INCOHÉRENT :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Contrat cohérent : ' + Object.keys(g.digital).length + ' familles digitales, ' + Object.keys(g.analog).length + ' analogiques, ' + Object.keys(g.serial).length + ' séries, blocs zone ' + bp.base + '+' + bp.taille + ' (' + cfg.pieces.length + ' × ' + bp.taille + ' → ' + (bp.base + cfg.pieces.length * bp.taille - 1) + ' ≤ ' + EISC_CAP + ') ; ' + cfg.pieces.length + ' zones (' + exteriors + ' extérieure) sur ' + (cfg.etages || []).length + ' étage.');
