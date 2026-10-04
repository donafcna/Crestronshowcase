// Contrôle de villa_config.json contre villa_config.schema.json — sans dépendance npm.
// Usage : node tools/check-config.mjs [villa_config.json] [--schema chemin] [--json]
// Sortie : erreurs (bloquantes, code 1) et avertissements (non bloquants).
//   - erreurs : type, bornes, valeurs permises, champs requis, incohérences entre champs ;
//   - avertissements : clé inconnue (faute de frappe probable), clé [PRÉVU v2] sans effet aujourd'hui.
// Le schéma se régénère par : python tools/build-config-schema.py
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const INFO_KEY = /(^|[a-z])(description|Description|note|notes|aide)$/;

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}
const typeOk = (t, v) => t === typeOf(v) || (t === 'number' && typeOf(v) === 'integer');

export function checkConfig(cfg, schema) {
  const errors = [], warnings = [];
  const resolveRef = s => (s && s.$ref ? schema.definitions[s.$ref.replace('#/definitions/', '')] : s);

  function validate(v, s, path, out) {
    s = resolveRef(s);
    if (!s || typeof s !== 'object') return;
    const err = m => out.errors.push({ path, message: m });
    if (s['x-etat'] === 'prevu') out.warnings.push({ path, message: 'clé prévue (v2) : sans effet tant qu\'elle n\'est pas implémentée' });
    if (s.allOf) s.allOf.forEach(x => validate(v, x, path, out));
    if (s.anyOf) {
      const ok = s.anyOf.some(x => { const o = { errors: [], warnings: [] }; validate(v, x, path, o); return !o.errors.length; });
      if (!ok) err('aucune forme permise ne correspond');
      else s.anyOf.forEach(x => { const o = { errors: [], warnings: [] }; validate(v, x, path, o); if (!o.errors.length) out.warnings.push(...o.warnings); });
    }
    if (s.type) {
      const types = [].concat(s.type);
      if (!types.some(t => typeOk(t, v))) { err(`type ${types.join('|')} attendu, reçu ${typeOf(v)}`); return; }
    }
    if (s.enum && !s.enum.includes(v)) err(`valeur « ${v} » non permise (${s.enum.join(', ')})`);
    if (typeof v === 'number') {
      if (s.minimum !== undefined && v < s.minimum) err(`minimum ${s.minimum}`);
      if (s.maximum !== undefined && v > s.maximum) err(`maximum ${s.maximum}`);
      if (s.exclusiveMinimum !== undefined && v <= s.exclusiveMinimum) err(`doit être > ${s.exclusiveMinimum}`);
    }
    if (typeof v === 'string') {
      if (s.minLength !== undefined && v.length < s.minLength) err(`au moins ${s.minLength} caractère(s)`);
      if (s.maxLength !== undefined && v.length > s.maxLength) err(`au plus ${s.maxLength} caractères`);
      if (s.pattern && !new RegExp(s.pattern).test(v)) err(`format invalide (${s.pattern})`);
    }
    if (Array.isArray(v)) {
      if (s.minItems !== undefined && v.length < s.minItems) err(`au moins ${s.minItems} élément(s)`);
      if (s.maxItems !== undefined && v.length > s.maxItems) err(`au plus ${s.maxItems} éléments`);
      if (s.uniqueItems && new Set(v.map(x => JSON.stringify(x))).size !== v.length) err('éléments en double');
      if (s.items) v.forEach((x, i) => validate(x, s.items, `${path}[${i}]`, out));
    }
    if (typeOf(v) === 'object') {
      for (const r of s.required || []) if (!(r in v)) err(`champ requis manquant : ${r}`);
      const props = s.properties || {}, pats = Object.entries(s.patternProperties || {});
      for (const [k, x] of Object.entries(v)) {
        const p = path ? `${path}.${k}` : k;
        if (props[k]) { validate(x, props[k], p, out); continue; }
        const pp = pats.find(([re]) => new RegExp(re).test(k));
        if (pp) { validate(x, pp[1], p, out); continue; }
        if (s.additionalProperties === false) err(`clé non permise : ${k}`);
        else if (typeof s.additionalProperties === 'object') validate(x, s.additionalProperties, p, out);
        else if (s.properties && !INFO_KEY.test(k)) out.warnings.push({ path: p, message: 'clé inconnue du schéma (faute de frappe ?)' });
      }
    }
  }

  const out = { errors, warnings };
  validate(cfg, schema, '', out);

  // ---- cohérences entre champs (ce que JSON Schema ne sait pas dire)
  const e = (path, message) => errors.push({ path, message });
  const w = (path, message) => warnings.push({ path, message });
  const pieces = Array.isArray(cfg.pieces) ? cfg.pieces : [];
  const ids = new Set();
  pieces.forEach((p, i) => { if (ids.has(p?.id)) e(`pieces[${i}].id`, `identifiant ${p.id} en double`); ids.add(p?.id); });
  if (cfg.meta?.backend === 'simpl' && cfg.meta?.mode === 'deploiement' && pieces.some(p => p?.actif !== false && p?.id > 15)) e('pieces', 'backend simpl : 15 pièces actives maximum (ids 1-15)');
  const menu = cfg.interface?.menuPieces;
  (menu?.pieces || []).forEach((id, i) => { if (!ids.has(id)) e(`interface.menuPieces.pieces[${i}]`, `pièce ${id} inexistante`); });
  if (menu?.pieceParDefaut != null && !ids.has(menu.pieceParDefaut)) e('interface.menuPieces.pieceParDefaut', `pièce ${menu.pieceParDefaut} inexistante`);
  for (const k of ['themes', 'langues']) {
    const b = cfg.interface?.[k];
    if (b?.parDefaut && Array.isArray(b.disponibles) && !b.disponibles.includes(b.parDefaut)) e(`interface.${k}.parDefaut`, 'doit figurer dans « disponibles »');
  }
  const langs = cfg.interface?.langues?.disponibles || cfg.meta?.languesDisponibles || [];
  const ref = cfg.meta?.langueReference || 'fr';
  for (const l of langs) if (l !== ref && !cfg.traductions?.[l]) w(`traductions.${l}`, `langue ${l} proposée sans table de traduction`);
  for (const [lang, table] of Object.entries(cfg.traductions || {})) {
    const seen = new Map();
    for (const key of Object.keys(table || {})) {
      const low = key.toLowerCase();
      if (seen.has(low) && seen.get(low) !== key) e(`traductions.${lang}`, `clés « ${seen.get(low)} » et « ${key} » identiques à la casse près (refusé par PowerShell 5.1)`);
      else seen.set(low, key);
    }
  }
  const sources = new Set((cfg.sourcesAudioVideo || []).map(s => s?.id));
  pieces.forEach((p, i) => {
    const pil = p?.pilotages || {}, q = `pieces[${i}].pilotages`;
    const ecl = pil.eclairages;
    if (ecl?.circuits) {
      const n = ecl.circuits.nombre;
      for (const key of ['noms', 'type', 'lutron', 'liste']) {
        const a = ecl.circuits[key];
        if (Array.isArray(a) && a.length && a.length !== n) w(`${q}.eclairages.circuits.${key}`, `${a.length} entrée(s) pour ${n} circuit(s)`);
      }
      if (Array.isArray(ecl.scenes?.niveaux)) ecl.scenes.niveaux.forEach((row, j) => {
        if (Array.isArray(row) && row.length !== n) e(`${q}.eclairages.scenes.niveaux[${j}]`, `${row.length} niveau(x) pour ${n} circuit(s)`);
      });
      (ecl.circuits.liste || []).forEach((c, j) => {
        if (c?.kelvinMin && c?.kelvinMax && c.kelvinMin >= c.kelvinMax) e(`${q}.eclairages.circuits.liste[${j}]`, 'kelvinMin doit être < kelvinMax');
        if (c?.commande === 'tunableWhite' && !(c.kelvinMin && c.kelvinMax)) w(`${q}.eclairages.circuits.liste[${j}]`, 'tunableWhite sans kelvinMin / kelvinMax');
      });
    }
    if (ecl?.scenes && Array.isArray(ecl.scenes.noms) && ecl.scenes.noms.length !== ecl.scenes.nombre) w(`${q}.eclairages.scenes.noms`, `${ecl.scenes.noms.length} nom(s) pour ${ecl.scenes.nombre} scène(s)`);
    const mot = pil.moteurs;
    if (mot && Array.isArray(mot.liste) && mot.liste.length > mot.nombre) w(`${q}.moteurs.liste`, `${mot.liste.length} moteurs décrits pour nombre = ${mot.nombre} (les suivants sont ignorés)`);
    for (const [nm, r] of [['cvc.consigne', pil.cvc?.consigne], ['wellness.sauna', pil.wellness?.sauna], ['wellness.hammam', pil.wellness?.hammam]]) {
      if (!r || typeof r.min !== 'number' || typeof r.max !== 'number') continue;
      if (r.min >= r.max) e(`${q}.${nm}`, 'min doit être < max');
      if (typeof r.consigne === 'number' && (r.consigne < r.min || r.consigne > r.max)) e(`${q}.${nm}.consigne`, 'consigne hors plage');
    }
    (pil.audioVideo?.sources || []).forEach((id, j) => { if (!sources.has(id)) e(`${q}.audioVideo.sources[${j}]`, `source ${id} absente de sourcesAudioVideo`); });
  });
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const si = args.indexOf('--schema');
  const schemaPath = si >= 0 ? args[si + 1] : resolve(here, '..', 'villa_config.schema.json');
  const cfgPath = args.find((a, i) => !a.startsWith('--') && !(si >= 0 && i === si + 1)) || resolve(here, '..', 'villa_config.json');
  try {
    const strip = t => t.replace(/^﻿/, '');
    const res = checkConfig(JSON.parse(strip(readFileSync(cfgPath, 'utf8'))), JSON.parse(strip(readFileSync(schemaPath, 'utf8'))));
    if (args.includes('--json')) console.log(JSON.stringify(res, null, 2));
    else {
      // ASCII seul : la console PowerShell 5.1 de deploy.ps1 affiche mal l'UTF-8
      const ascii = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[«»]/g, '"').replace(/[^\x20-\x7E]/g, '?');
      const prevues = res.warnings.filter(x => x.message.startsWith('clé prévue'));
      const autres = res.warnings.filter(x => !x.message.startsWith('clé prévue'));
      for (const x of res.errors) console.log(ascii(`  ERREUR  ${x.path || '(racine)'} : ${x.message}`));
      for (const x of autres) console.log(ascii(`  attention  ${x.path} : ${x.message}`));
      if (prevues.length) console.log(ascii(`  ${prevues.length} cle(s) [PREVU v2] sans effet aujourd'hui : ${prevues.map(x => x.path).slice(0, 6).join(', ')}${prevues.length > 6 ? '...' : ''}`));
      console.log(ascii(`  ${cfgPath.split(/[\\/]/).pop()} : ${res.errors.length} erreur(s), ${res.warnings.length} avertissement(s)`));
    }
    process.exitCode = res.errors.length ? 1 : 0;
  } catch (err) { console.error('check-config : ' + err.message); process.exitCode = 2; }
}
