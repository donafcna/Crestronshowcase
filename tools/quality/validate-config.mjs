import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function expandSignals(signals, startKey = 'join', rangeKey = 'joinDebut') {
  return (Array.isArray(signals) ? signals : []).flatMap(s => {
    if (!s || typeof s !== 'object') return [];
    const start = s[startKey] ?? s[rangeKey];
    const count = s[startKey] === undefined ? s.nombre : 1;
    if (!Number.isInteger(start) || !Number.isInteger(count) || count < 1 || count > 4000) return [];
    return Array.from({ length: count }, (_, i) => ({ ...s, join: start + i }));
  });
}

// Contrat v4 existant : aucun changement de joins ou de configuration physique.
export function validateConfig(c, { mode = 'deploiement', release = false } = {}) {
  const issues = [];
  const add = (path, message, severity = 'error') => issues.push({ path, message, severity });
  const integer = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
  if (!c || typeof c !== 'object' || Array.isArray(c)) return [{ path: '$', message: 'Objet JSON attendu', severity: 'error' }];
  if (c.meta?.mode !== mode) add('meta.mode', `Mode attendu : ${mode}`);
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(c.meta?.version || '')) add('meta.version', 'Version explicite requise');
  if (!/^v4\b/.test(c.contrat?.version || '')) add('contrat.version', 'Ce validateur cible le contrat v4');
  if (c.contrat?.blocsPiecesGui?.actif !== false) add('contrat.blocsPiecesGui.actif', 'La réécriture v3 des joins doit rester désactivée');
  if (c.contrat?.blocsPiecesGui?.tailleBloc !== 100 || c.contrat?.blocsPieces?.tailleBloc !== 100) add('contrat', 'Le runtime actuel exige des blocs de 100');
  if (!Array.isArray(c.pieces) || !c.pieces.length) add('pieces', 'Au moins une pièce est requise');
  const roomIds = new Set(), sourceIds = new Set();
  for (const [i, s] of (Array.isArray(c.sourcesAudioVideo) ? c.sourcesAudioVideo : []).entries()) {
    if (!integer(s?.id, 1, 5) || sourceIds.has(s.id)) add(`sourcesAudioVideo[${i}].id`, 'Identifiant unique de 1 à 5 attendu');
    sourceIds.add(s?.id);
  }
  if (!sourceIds.size) add('sourcesAudioVideo', 'Sources requises');
  const countList = (o, max, key, p) => {
    if (!o || !integer(o.nombre, 0, max)) { add(p + '.nombre', `Entier entre 0 et ${max} requis`); return; }
    if (!Array.isArray(o[key]) || o[key].length !== o.nombre) add(p + '.' + key, 'Longueur différente du nombre déclaré');
  };
  for (const [i, r] of (Array.isArray(c.pieces) ? c.pieces : []).entries()) {
    const p = `pieces[${i}]`;
    if (!r || typeof r !== 'object') { add(p, 'Objet pièce requis'); continue; }
    if (!integer(r.id, 1, 30) || roomIds.has(r.id)) add(p + '.id', 'Identifiant unique de 1 à 30 attendu');
    roomIds.add(r.id);
    if (typeof r.nom !== 'string') add(p + '.nom', 'Nom texte requis, vide autorisé pour le repli');
    for (const key of ['actif', 'intersystem']) if (r[key] !== undefined && typeof r[key] !== 'boolean') add(p + '.' + key, 'Booléen attendu');
    const controls = r.pilotages;
    if (!controls || typeof controls !== 'object') { add(p + '.pilotages', 'Pilotages requis'); continue; }
    for (const [key, control] of Object.entries(controls)) if (control?.actif !== undefined && typeof control.actif !== 'boolean') add(p + '.pilotages.' + key + '.actif', 'Booléen attendu');
    if (controls.eclairages) {
      const e = controls.eclairages, q = p + '.pilotages.eclairages';
      countList(e.scenes, 4, 'noms', q + '.scenes'); countList(e.circuits, 10, 'noms', q + '.circuits');
      if (e.scenes?.niveaux !== undefined) {
        if (!Array.isArray(e.scenes.niveaux) || e.scenes.niveaux.length !== e.scenes.nombre) add(q + '.scenes.niveaux', 'Une ligne de niveaux par scène attendue');
        else e.scenes.niveaux.forEach((levels, n) => {
          if (!Array.isArray(levels) || levels.length !== e.circuits?.nombre || levels.some(v => !integer(v, 0, 65535))) add(q + `.scenes.niveaux[${n}]`, 'Un entier 0–65535 par circuit attendu');
        });
      }
    }
    if (controls.moteurs) {
      countList(controls.moteurs, 6, 'liste', p + '.pilotages.moteurs');
      for (const [j, motor] of (Array.isArray(controls.moteurs.liste) ? controls.moteurs.liste : []).entries()) if (!['volet', 'rideau', 'store'].includes(motor?.type)) add(p + `.pilotages.moteurs.liste[${j}].type`, 'Type moteur inconnu');
    }
    if (controls.audioVideo?.sources !== undefined && (!Array.isArray(controls.audioVideo.sources) || controls.audioVideo.sources.some(id => !sourceIds.has(id)) || new Set(controls.audioVideo.sources).size !== controls.audioVideo.sources.length)) add(p + '.pilotages.audioVideo.sources', 'Références de sources invalides ou dupliquées');
    const ranges = [controls.cvc?.consigne, controls.wellness?.sauna, controls.wellness?.hammam];
    ranges.forEach((range, j) => {
      if (!range) return;
      if (![range.min, range.max, range.pas].every(Number.isFinite) || range.min >= range.max || range.pas <= 0 || range.pas > range.max - range.min) add(p + `.plage[${j}]`, 'Bornes ou pas invalides');
      if (range.consigne !== undefined && (!Number.isFinite(range.consigne) || range.consigne < range.min || range.consigne > range.max)) add(p + `.plage[${j}].consigne`, 'Consigne hors plage');
    });
    if (controls.cvc?.etatInitial?.ventilation !== undefined && !integer(controls.cvc.etatInitial.ventilation, 0, 3)) add(p + '.pilotages.cvc.etatInitial.ventilation', 'Vitesse attendue entre 0 et 3');
  }
  const globals = c.contrat?.signauxGlobaux;
  if (!Array.isArray(globals) || !globals.length) add('contrat.signauxGlobaux', 'Liste de signaux requise');
  const keys = new Set();
  for (const [i, s] of (Array.isArray(globals) ? globals : []).entries()) {
    const p = `contrat.signauxGlobaux[${i}]`;
    if (!s || typeof s !== 'object') { add(p, 'Objet signal requis'); continue; }
    if (!['digital', 'analog', 'serial'].includes(s.type)) add(p + '.type', 'Type de signal inconnu');
    if (!['entree', 'sortie', 'bidirectionnel', 'entree/sortie'].includes(s.direction)) add(p + '.direction', 'Sens de signal inconnu');
    if (!integer(s.join ?? s.joinDebut, 1, 999) || (s.join === undefined && !integer(s.nombre, 1, 999))) add(p, 'Join global ou plage invalide');
    for (const x of expandSignals([s])) {
      const k = x.type + ':' + x.join;
      if (keys.has(k)) add(p, 'Collision de join ' + k);
      keys.add(k);
      if (x.join >= 1000) add(p, 'Une plage globale empiète sur les blocs pièces');
      const mapped = (s.eiscJoin ?? s.eiscJoinDebut ?? (s.join ?? s.joinDebut)) + x.join - (s.join ?? s.joinDebut);
      if (mapped !== x.join) add(p, 'Le miroir actuel exige un join EISC identique au join GUI');
    }
  }
  const offsets = expandSignals(c.contrat?.blocsPieces?.offsets, 'offset', 'offsetDebut');
  const offsetKeys = new Set();
  for (const s of offsets) {
    const key = s.type + ':' + s.join;
    if (offsetKeys.has(key)) add('contrat.blocsPieces.offsets', 'Collision ' + key);
    offsetKeys.add(key);
    if (!integer(s.join, 1, 99)) add('contrat.blocsPieces.offsets', 'Offset hors bloc : ' + key);
  }
  for (const type of ['digital', 'analog', 'serial']) for (const [join, offset] of Object.entries(c.contrat?.blocsPiecesGui?.mapping?.[type] || {})) {
    if (!integer(+join, 1, 999) || !integer(offset, 1, 99)) add('contrat.blocsPiecesGui.mapping.' + type, 'Mapping hors plage');
    if (!keys.has(type + ':' + join)) add('contrat.blocsPiecesGui.mapping.' + type + '.' + join, 'Join absent de la liste globale ; documenter explicitement un éventuel retour local', type === 'serial' ? 'warning' : 'error');
  }
  const eisc = c.contrat?.eisc;
  if (eisc?.actif && (!/^0x[\da-f]{2}$/i.test(eisc.ipid || '') || typeof eisc.adresseIp !== 'string' || !eisc.adresseIp)) add('contrat.eisc', 'IP-ID hexadécimal et adresse requis');
  if (release && mode === 'deploiement' && c.contrat?.alarme?.codeParDefaut) add('contrat.alarme.codeParDefaut', 'Le repli local doit être vide dans un package client');
  return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const filename = process.argv[2];
    if (!filename) throw new Error('Usage : node validate-config.mjs <villa_config.json> [--showcase] [--release]');
    const issues = validateConfig(JSON.parse(readFileSync(filename, 'utf8')), { mode: process.argv.includes('--showcase') ? 'showcase' : 'deploiement', release: process.argv.includes('--release') });
    console.log(JSON.stringify({ status: issues.some(i => i.severity === 'error') ? 'failed' : 'passed', issues }, null, 2));
    process.exitCode = issues.some(i => i.severity === 'error') ? 1 : 0;
  } catch (e) { console.error(e.message); process.exitCode = 2; }
}
