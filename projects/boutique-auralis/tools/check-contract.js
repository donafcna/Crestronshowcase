#!/usr/bin/env node
// Boutique Auralis — vérifie que config/boutique-auralis_config.json (contrat) et
// simpl-sharp/BoutiqueAuralis/Joins.cs racontent la même chose, et qu'aucun join ne se chevauche.
//   node tools/check-contract.js   → code de sortie 0 si tout est cohérent.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'boutique-auralis_config.json'), 'utf8'));
const cs = fs.readFileSync(path.join(ROOT, 'simpl-sharp', 'BoutiqueAuralis', 'Joins.cs'), 'utf8');
const errors = [];

// ---- constantes C#
const consts = {};
let scope = '';
for (const line of cs.split(/\r?\n/)) {
  const s = line.match(/public static class (\w+)/); if (s) scope = s[1] === 'Joins' ? '' : s[1] + '.';
  if (/^ {8}\}\s*$/.test(line)) scope = '';                      // fin d'une classe imbriquée (House, Room)
  for (const m of line.matchAll(/(\w+) = (\d+)[;,]/g)) if (/public const/.test(line)) consts[scope + m[1]] = +m[2];
}

// ---- JSON nom → constante C# (les noms {n} pointent sur une base = début − 1)
const MAP = {
  digital: {
    Scene_Opening: 'SceneOpening', Scene_Gala: 'SceneGala', Scene_Private: 'ScenePrivate', Scene_Closed: 'SceneClosed',
    Room_Select_All: 'RoomSelectAll', 'Room_Select_{n}': 'RoomSelectBase',
    Lights_AllOn: 'LightsAllOn', Lights_AllOff: 'LightsAllOff', 'Light_{n}_Toggle': 'LightToggleBase',
    'Blinds_{n}_Open': 'BlindsOpenBase', Blinds_All_Open: 'BlindsAllOpen', 'Blinds_{n}_Half': 'BlindsHalfBase', Blinds_All_Half: 'BlindsAllHalf', 'Blinds_{n}_Close': 'BlindsCloseBase', Blinds_All_Close: 'BlindsAllClose',
    White_Auto: 'WhiteAuto',
    Scent_On: 'ScentOn', Scent_Off: 'ScentOff', 'Scent_Fragrance_{n}': 'ScentFragranceBase',
    Schedule_On: 'ScheduleOn', Schedule_Off: 'ScheduleOff', Schedule_Opening_Up: 'ScheduleOpeningUp', Schedule_Opening_Down: 'ScheduleOpeningDown', Schedule_Closing_Up: 'ScheduleClosingUp', Schedule_Closing_Down: 'ScheduleClosingDown',
    'Music_Source_{n}': 'MusicSourceBase', Music_PlayPause: 'MusicPlayPause', Music_Mute: 'MusicMute', Config_Resync: 'ConfigResync',
  },
  analog: {
    'Room_Select#': 'RoomSelect', 'Light_{n}_Level#': 'LightLevelBase', 'White_Temperature#': 'WhiteTemperature', 'Scent_Diffusion#': 'ScentDiffusion',
    'Schedule_Opening#': 'ScheduleOpening', 'Schedule_Closing#': 'ScheduleClosing', 'Scene#': 'Scene', 'Music_Volume#': 'MusicVolume', 'Blinds_{n}_Position#': 'BlindsPositionBase',
    'Room_LightsAvg#': 'RoomLightsAvg', 'Room_LightsOn#': 'RoomLightsOn', 'Boutique_LightsOn#': 'BoutiqueLightsOn', 'Config_ChunkAck#': 'ConfigChunkAck',
  },
  serial: {
    'Room_Name$': 'RoomName', 'Room_Subtitle$': 'RoomSubtitle', 'Scene_Name$': 'SceneName', 'Boutique_Summary$': 'BoutiqueSummary',
    'Schedule_Opening$': 'ScheduleOpeningText', 'Schedule_Closing$': 'ScheduleClosingText', 'Scent_Fragrance_Name$': 'ScentFragranceName', 'Music_Source_Name$': 'MusicSourceName',
    'Systeme_IpId$': 'SystemIpId', 'Systeme_CpzNom$': 'SystemCpzName', 'Systeme_CpzDate$': 'SystemCpzDate', 'Config_Json$': 'ConfigJson', 'Config_Hash$': 'ConfigHash',
  },
  housePulse: { 'Blinds_{n}_Up': 'House.BlindsUpBase', 'Blinds_{n}_Stop': 'House.BlindsStopBase', 'Blinds_{n}_Down': 'House.BlindsDownBase' },
  roomDigital: { 'Light_{n}_On': 'Room.LightOnBase', Room_Displayed: 'Room.Displayed', Music_Playing: 'Room.MusicPlaying', Music_Muted: 'Room.MusicMuted' },
  roomAnalog: { 'Light_{n}_Level': 'Room.LightLevelBase', Music_Volume: 'Room.MusicVolume', Music_Source: 'Room.MusicSource', Scene: 'Room.Scene' },
  roomSerial: { Room_Name: 'Room.Name' },
};
const start = r => +String(r).split('-')[0];
const end = r => { const p = String(r).split('-'); return +(p[1] || p[0]); };
const nameOf = d => typeof d === 'string' ? d : d.nom;

function checkTable(label, table, map) {
  const used = [];
  for (const [range, def] of Object.entries(table)) {
    const a = start(range), b = end(range), nom = nameOf(def);
    for (const [ua, ub, un] of used) if (a <= ub && b >= ua) errors.push(label + ' : ' + nom + ' (' + range + ') chevauche ' + un + ' (' + ua + '-' + ub + ')');
    used.push([a, b, nom]);
    const c = map[nom];
    if (!c) { errors.push(label + ' : aucune constante C# associée à ' + nom); continue; }
    if (consts[c] === undefined) { errors.push(label + ' : constante ' + c + ' absente de Joins.cs'); continue; }
    const expected = nom.includes('{n}') ? a - 1 : a;
    if (consts[c] !== expected) errors.push(label + ' : ' + nom + ' = ' + a + ' dans le JSON, ' + c + ' = ' + consts[c] + ' dans Joins.cs');
    if (b - a + 1 > 40 && !nom.includes('{n}')) errors.push(label + ' : plage ' + range + ' suspecte pour ' + nom);
  }
  // toutes les constantes du C# doivent exister dans le JSON (pas de join fantôme)
  for (const c of Object.values(map)) if (!Object.values(table).some(d => map[nameOf(d)] === c)) errors.push(label + ' : ' + c + ' (Joins.cs) absent du JSON');
}
const g = cfg.contrat.signauxGlobaux;
checkTable('digital', g.digital, MAP.digital);
checkTable('analog', g.analog, MAP.analog);
checkTable('serial', g.serial, MAP.serial);
const me = cfg.contrat.signauxMaisonEisc || {};
checkTable('bloc maison impulsions', me.digitalPulse || {}, MAP.housePulse);
const bp = cfg.contrat.blocsPieces;
checkTable('bloc digital', bp.digital, MAP.roomDigital);
checkTable('bloc analog', bp.analog, MAP.roomAnalog);
checkTable('bloc serial', bp.serial, MAP.roomSerial);
for (const t of [bp.digital, bp.analog, bp.serial]) for (const r of Object.keys(t)) if (end(r) >= bp.taille) errors.push('bloc espace : offset ' + r + ' ≥ taille ' + bp.taille);
if (consts.RoomBlockBase !== bp.base || consts.RoomBlockSize !== bp.taille) errors.push('RoomBlockBase/Size ≠ contrat.blocsPieces');
const L = cfg.contrat.limites;
for (const [k, c] of [['piecesMax', 'MaxRooms'], ['circuitsMax', 'MaxCircuits'], ['sourcesMax', 'MaxSources'], ['facadesMax', 'MaxBlinds'], ['fragrancesMax', 'MaxFragrances']])
  if (consts[c] !== L[k]) errors.push('limite ' + k + ' = ' + L[k] + ' mais ' + c + ' = ' + consts[c]);
if (end(Object.entries(g.digital).find(([, d]) => d.nom === 'Room_Select_{n}')[0]) - consts.RoomSelectBase !== L.piecesMax) errors.push('Room_Select_{n} : plage ≠ piecesMax');

// ---- impulsions moteurs : jamais sur un écran, sous les blocs espace, sans chevaucher les globaux digitaux
const pulseRanges = Object.keys(me.digitalPulse || {});
for (const r of pulseRanges) {
  for (const [gr, d] of Object.entries(g.digital)) if (start(r) <= end(gr) && end(r) >= start(gr)) errors.push('impulsion ' + me.digitalPulse[r] + ' (' + r + ') chevauche le global ' + d.nom + ' (' + gr + ')');
  if (end(r) >= bp.base) errors.push('impulsion ' + me.digitalPulse[r] + ' (' + r + ') dans les blocs espace');
}
if (pulseRanges.length && (consts['House.PulseFirst'] !== Math.min(...pulseRanges.map(start)) || consts['House.PulseLast'] !== Math.max(...pulseRanges.map(end)))) errors.push('House.PulseFirst/PulseLast ≠ digitalPulse');

// ---- capacité EISC et séparation globaux / blocs
const EISC_CAP = 2732;
const maxGlobal = Math.max(...[...Object.keys(g.digital), ...Object.keys(g.analog), ...pulseRanges].map(end));
if (bp.base <= maxGlobal) errors.push('blocs espace : base ' + bp.base + ' ≤ dernier join global ' + maxGlobal);
if (bp.base + L.piecesMax * bp.taille - 1 > EISC_CAP) errors.push('blocs espace : ' + L.piecesMax + ' × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP + ' (piecesMax trop grand pour le socle)');
if (bp.base + cfg.pieces.length * bp.taille - 1 > EISC_CAP) errors.push('blocs espace : ' + cfg.pieces.length + ' espaces × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP);

// ---- signaux boutique renvoyés par le slot 2 : mêmes joins que le contrat global
for (const [range, name] of Object.entries(me.digitalActual || {})) if (!Object.entries(g.digital).some(([r, d]) => r === range && d.nom === name)) errors.push('signauxMaisonEisc digital ' + range + ' ' + name + ' ≠ signauxGlobaux');
for (const [range, name] of Object.entries(me.analogActual || {})) if (!Object.entries(g.analog).some(([r, d]) => r === range && d.nom === name + '#')) errors.push('signauxMaisonEisc analog ' + range + ' ' + name + ' ≠ signauxGlobaux');

// ---- espaces : ids uniques et consécutifs, clés uniques, niveaux connus, circuits cohérents
const ids = new Set(), keys = new Set();
const floors = new Set((cfg.etages || []).map(e => e.id));
const circuitKeys = new Set();
const bq = cfg.boutique;
cfg.pieces.forEach((p, idx) => {
  if (ids.has(p.id)) errors.push('espace id ' + p.id + ' en double'); ids.add(p.id);
  if (!p.cle || keys.has(p.cle)) errors.push('espace ' + p.id + ' : cle absente ou en double'); keys.add(p.cle);
  if (p.id !== idx + 1) errors.push('espace ' + p.id + ' : ids non consécutifs (attendu ' + (idx + 1) + ')');
  if (p.id < 1 || p.id > L.piecesMax) errors.push('espace ' + p.id + ' hors 1..' + L.piecesMax);
  if (!floors.has(p.etage)) errors.push('espace ' + p.id + ' : niveau inconnu ' + p.etage);
  const circ = (p.pilotages && p.pilotages.eclairages && p.pilotages.eclairages.circuits) || [];
  if (circ.length > L.circuitsMax) errors.push('espace ' + p.id + ' : ' + circ.length + ' circuits > ' + L.circuitsMax);
  circ.forEach(c => { if (!c.cle) errors.push('espace ' + p.id + ' : circuit sans cle'); circuitKeys.add(c.cle); });
  const ch = circ.find(c => c.cle === 'chandelier');
  if (ch && ch.actif !== (p.cle === 'hall')) errors.push('espace ' + p.id + ' : lustre d’apparat actif hors du hall (ou inactif dans le hall)');
  const src = p.pilotages && p.pilotages.audio && p.pilotages.audio.etatInitial ? p.pilotages.audio.etatInitial.source : 1;
  if (src !== undefined && (src < 1 || src > (bq.musique.sources || []).length)) errors.push('espace ' + p.id + ' : source initiale ' + src + ' inconnue');
});
for (const s of bq.scenes || []) {
  if (s.id < 1 || s.id > 4) errors.push('scène ' + s.cle + ' : id ' + s.id + ' hors 1..4 (Scene_Opening..Scene_Closed)');
  for (const k of Object.keys(s.niveaux || {})) if (!circuitKeys.has(k)) errors.push('scène ' + s.cle + ' : clé de circuit inconnue ' + k);
}
if (!(bq.scenes || []).some(s => s.cle === bq.sceneInitiale)) errors.push('sceneInitiale : scène inconnue');
if ((bq.musique.sources || []).length > L.sourcesMax) errors.push('sources > ' + L.sourcesMax);
if (bq.stores && bq.stores.actif) {
  const f = bq.stores.facades || [];
  if (f.length > L.facadesMax) errors.push('façades > ' + L.facadesMax);
  f.forEach((x, i) => { if (x.id !== i + 1) errors.push('façade ' + x.cle + ' : id ' + x.id + ' ≠ ' + (i + 1)); });
}
if (bq.blanc && bq.blanc.actif) {
  if (bq.blanc.min >= bq.blanc.max || bq.blanc.initial < bq.blanc.min || bq.blanc.initial > bq.blanc.max) errors.push('blanc : bornes / valeur initiale incohérentes');
  for (const st of bq.blanc.loiHoraire || []) if (st.avantHeure < 0 || st.avantHeure > 24 || st.kelvin < bq.blanc.min || st.kelvin > bq.blanc.max) errors.push('blanc : palier horaire invalide');
}
if (bq.parfum && bq.parfum.actif) {
  const fr = bq.parfum.fragrances || [];
  if (fr.length > L.fragrancesMax) errors.push('fragrances > ' + L.fragrancesMax);
  if (!fr.some(x => x.id === bq.parfum.etatInitial.fragrance)) errors.push('parfum : fragrance initiale inconnue');
}
if (bq.horaires && bq.horaires.actif) {
  for (const k of ['ouverture', 'fermeture']) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(bq.horaires.etatInitial[k])) errors.push('horaires : ' + k + ' invalide');
  for (const k of ['sceneOuverture', 'sceneFermeture']) if (!(bq.scenes || []).some(s => s.cle === bq.horaires[k])) errors.push('horaires : ' + k + ' inconnue');
}

if (errors.length) { console.error('Contrat INCOHÉRENT :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Contrat cohérent : ' + Object.keys(g.digital).length + ' familles digitales, ' + Object.keys(g.analog).length + ' analogiques, ' + Object.keys(g.serial).length + ' séries, ' + pulseRanges.length + ' familles d’impulsions maison, blocs espace ' + bp.base + '+' + bp.taille + ' (' + cfg.pieces.length + ' × ' + bp.taille + ' → ' + (bp.base + cfg.pieces.length * bp.taille - 1) + ' ≤ ' + EISC_CAP + ') ; ' + cfg.pieces.length + ' espaces sur ' + (cfg.etages || []).length + ' niveaux.');
