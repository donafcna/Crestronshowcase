#!/usr/bin/env node
// FTV Home — vérifie que config/ftvhome_config.json (contrat) et simpl-sharp/FtvHome/Joins.cs
// racontent la même chose, et qu'aucun join ne se chevauche.
//   node tools/check-contract.js   → code de sortie 0 si tout est cohérent.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'ftvhome_config.json'), 'utf8'));
const cs = fs.readFileSync(path.join(ROOT, 'simpl-sharp', 'FtvHome', 'Joins.cs'), 'utf8');
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
    'Room_Select_{n}': 'RoomSelectBase', Scene_Arrive: 'SceneArrive', Scene_Morning: 'SceneMorning', Scene_Night: 'SceneNight', Scene_Leave: 'SceneLeave', Room_Off: 'RoomOff',
    Lights_AllOn: 'LightsAllOn', Lights_AllOff: 'LightsAllOff', Lights_DimUp: 'LightsDimUp', Lights_DimDown: 'LightsDimDown', 'Light_{n}_Toggle': 'LightToggleBase',
    Shades_AllOpen: 'ShadesAllOpen', Shades_AllClose: 'ShadesAllClose', 'Shade_{n}_Up': 'ShadeUpBase', 'Shade_{n}_Stop': 'ShadeStopBase', 'Shade_{n}_Down': 'ShadeDownBase',
    HVAC_Setpoint_Up: 'HvacSetpointUp', HVAC_Setpoint_Down: 'HvacSetpointDown', HVAC_Mode_Heat: 'HvacModeHeat', HVAC_Mode_Cool: 'HvacModeCool', HVAC_Mode_Auto: 'HvacModeAuto', HVAC_Mode_Next: 'HvacModeNext',
    HVAC_Fan_Auto: 'HvacFanAuto', HVAC_Fan_On: 'HvacFanOn', HVAC_Schedule_Run: 'HvacScheduleRun', HVAC_Schedule_Hold: 'HvacScheduleHold', HVAC_Humidity_On: 'HvacHumidityOn', HVAC_Humidity_Off: 'HvacHumidityOff',
    Lock_Lock: 'LockLock', Lock_Unlock: 'LockUnlock',
    Access_FrontDoor_Lock: 'AccessFrontDoorLock', Access_FrontDoor_Unlock: 'AccessFrontDoorUnlock', Access_Gate_Close: 'AccessGateClose', Access_Gate_Open: 'AccessGateOpen', Access_Garage_Open: 'AccessGarageOpen', Access_Garage_Close: 'AccessGarageClose', Access_Garage_Closing: 'AccessGarageClosing',
    Pool_On: 'PoolOn', Pool_Off: 'PoolOff', Spa_On: 'SpaOn', Spa_Off: 'SpaOff',
    'Video_Display_{n}_Select': 'VideoDisplaySelectBase', 'Video_Display_{n}_On': 'VideoDisplayOnBase', 'Video_Display_{n}_Off': 'VideoDisplayOffBase', 'Video_Source_{n}': 'VideoSourceBase', 'Video_Channel_{n}': 'VideoChannelBase',
    'Music_Service_{n}': 'MusicServiceBase', 'Music_Fav_{n}': 'MusicFavBase', Music_Prev: 'MusicPrev', Music_PlayPause: 'MusicPlayPause', Music_Next: 'MusicNext', Music_Mute: 'MusicMute', Config_Resync: 'ConfigResync',
  },
  analog: {
    'Room_Select#': 'RoomSelect', 'Light_{n}_Level#': 'LightLevelBase', 'Shade_{n}_Position#': 'ShadePositionBase', 'Video_Display_Target#': 'VideoDisplayTarget', 'Video_Display_{n}_Volume#': 'VideoDisplayVolumeBase', 'Video_Volume#': 'VideoVolume',
    'Video_Display_{n}_Source#': 'VideoDisplaySourceBase', 'Video_Channel#': 'VideoChannel', 'HVAC_Setpoint#': 'HvacSetpoint', 'HVAC_Temperature#': 'HvacTemperature', 'HVAC_Mode#': 'HvacMode', 'HVAC_Fan#': 'HvacFan', 'HVAC_Humidity#': 'HvacHumidity',
    'Music_Volume#': 'MusicVolume', 'House_LightsOn#': 'HouseLightsOn', 'House_ShadesOpen#': 'HouseShadesOpen', 'Room_LightsOn#': 'RoomLightsOn', 'Room_ShadesOpen#': 'RoomShadesOpen', 'Config_ChunkAck#': 'ConfigChunkAck',
  },
  serial: {
    'Room_Name$': 'RoomName', 'Room_Subtitle$': 'RoomSubtitle', 'Music_Title$': 'MusicTitle', 'Music_Sub$': 'MusicSub', 'Music_Tint$': 'MusicTint', 'Video_Source_Name$': 'VideoSourceName', 'House_Status$': 'HouseStatus',
    'Systeme_IpId$': 'SystemIpId', 'Systeme_CpzNom$': 'SystemCpzName', 'Systeme_CpzDate$': 'SystemCpzDate', 'Config_Json$': 'ConfigJson', 'Config_Hash$': 'ConfigHash',
  },
  room: {
    'Light_{n}_On': 'Room.LightOnBase', 'Shade_{n}_Up': 'Room.ShadeUpBase', 'Shade_{n}_Stop': 'Room.ShadeStopBase', 'Shade_{n}_Down': 'Room.ShadeDownBase', Lock_Locked: 'Room.LockLocked', HVAC_Heat: 'Room.HvacHeat', HVAC_Cool: 'Room.HvacCool', HVAC_Auto: 'Room.HvacAuto',
    HVAC_FanOn: 'Room.HvacFanOn', HVAC_Hold: 'Room.HvacHold', HVAC_Humidity: 'Room.HvacHumidity', Room_Displayed: 'Room.Displayed', Music_Playing: 'Room.MusicPlaying', Music_Muted: 'Room.MusicMuted',
    'Light_{n}_Level': 'Room.LightLevelBase', 'Shade_{n}_Position': 'Room.ShadePositionBase', HVAC_Setpoint: 'Room.HvacSetpoint', HVAC_Temperature: 'Room.HvacTemperature', 'HVAC_Humidity#': 'Room.HvacHumidityMeasure', Music_Volume: 'Room.MusicVolume', Music_Service: 'Room.MusicService', Music_Fav: 'Room.MusicFav', Room_Name: 'Room.Name',
  },
};
const start = r => +String(r).split('-')[0];
const end = r => { const p = String(r).split('-'); return +(p[1] || p[0]); };

function checkTable(label, table, map, roomAnalogHumidity) {
  const used = [];
  for (const [range, def] of Object.entries(table)) {
    const a = start(range), b = end(range);
    for (const [ua, ub, un] of used) if (a <= ub && b >= ua) errors.push(label + ' : ' + def.nom + ' (' + range + ') chevauche ' + un + ' (' + ua + '-' + ub + ')');
    used.push([a, b, def.nom]);
    let key = def.nom;
    if (roomAnalogHumidity && key === 'HVAC_Humidity') key = 'HVAC_Humidity#';
    const c = map[key];
    if (!c) { errors.push(label + ' : aucune constante C# associée à ' + def.nom); continue; }
    if (consts[c] === undefined) { errors.push(label + ' : constante ' + c + ' absente de Joins.cs'); continue; }
    const expected = def.nom.includes('{n}') ? a - 1 : a;
    if (consts[c] !== expected) errors.push(label + ' : ' + def.nom + ' = ' + a + ' dans le JSON, ' + c + ' = ' + consts[c] + ' dans Joins.cs');
    if (b - a + 1 > 30 && !def.nom.includes('{n}')) errors.push(label + ' : plage ' + range + ' suspecte pour ' + def.nom);
  }
}
const g = cfg.contrat.signauxGlobaux;
checkTable('digital', g.digital, MAP.digital);
checkTable('analog', g.analog, MAP.analog);
checkTable('serial', g.serial, MAP.serial);
const bp = cfg.contrat.blocsPieces;
checkTable('bloc digital', bp.digital, MAP.room);
checkTable('bloc analog', bp.analog, MAP.room, true);
checkTable('bloc serial', bp.serial, MAP.room);
for (const t of [bp.digital, bp.analog, bp.serial]) for (const r of Object.keys(t)) if (end(r) >= bp.taille) errors.push('bloc pièce : offset ' + r + ' ≥ taille ' + bp.taille);
if (consts.RoomBlockBase !== bp.base || consts.RoomBlockSize !== bp.taille) errors.push('RoomBlockBase/Size ≠ contrat.blocsPieces');
const L = cfg.contrat.limites;
for (const [k, c] of [['piecesMax', 'MaxRooms'], ['circuitsMax', 'MaxCircuits'], ['moteursMax', 'MaxShades'], ['ecransMax', 'MaxDisplays'], ['sourcesMax', 'MaxSources'], ['chainesMax', 'MaxChannels'], ['servicesMax', 'MaxServices'], ['favorisMax', 'MaxFavs']])
  if (consts[c] !== L[k]) errors.push('limite ' + k + ' = ' + L[k] + ' mais ' + c + ' = ' + consts[c]);

// ---- pièces : ids uniques, dimensions dans les limites
const ids = new Set();
for (const p of cfg.pieces) {
  if (ids.has(p.id)) errors.push('pièce id ' + p.id + ' en double'); ids.add(p.id);
  if (p.id < 1 || p.id > L.piecesMax) errors.push('pièce ' + p.id + ' hors 1..' + L.piecesMax);
  const nc = (p.pilotages?.eclairages?.circuits || []).length, nm = (p.pilotages?.occultants?.moteurs || []).length;
  if (nc > L.circuitsMax) errors.push('pièce ' + p.id + ' : ' + nc + ' circuits > ' + L.circuitsMax);
  if (nm > L.moteursMax) errors.push('pièce ' + p.id + ' : ' + nm + ' moteurs > ' + L.moteursMax);
  if (p.pilotages?.video?.actif && !cfg.maison.video.ecrans.some(e => e.id === p.pilotages.video.ecranParDefaut)) errors.push('pièce ' + p.id + ' : ecranParDefaut inconnu');
}
for (const s of cfg.maison.scenes) for (const k of Object.keys(s.eclairages?.pieces || {})) if (!cfg.pieces.some(p => p.cle === k)) errors.push('scène ' + s.cle + ' : pièce inconnue ' + k);

if (errors.length) { console.error('Contrat INCOHÉRENT :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Contrat cohérent : ' + Object.keys(g.digital).length + ' familles digitales, ' + Object.keys(g.analog).length + ' analogiques, ' + Object.keys(g.serial).length + ' séries, blocs pièce ' + bp.base + '+' + bp.taille + ' ; ' + cfg.pieces.length + ' pièces.');
