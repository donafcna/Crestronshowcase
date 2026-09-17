import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateConfig } from './validate-config.mjs';
import { stageCh5 } from './stage-ch5.mjs';
import { SIMULATORS, getSimulator, validateSimulatorRegistry } from '../../apps/showcase/src/components/simulatorRegistry.js';
import { projects } from '../../apps/showcase/src/data/projects.js';
import { fileURLToPath } from 'node:url';
const deploymentFixture = () => { const c = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../../projects/villa-crans/ch5/villa_config.json', import.meta.url)))); c.contrat.alarme.codeParDefaut = ''; return c; };

function removeTestDirectory(dir) {
  const resolved = path.resolve(dir), parent = path.resolve(os.tmpdir());
  assert.equal(path.dirname(resolved), parent);
  assert.ok(path.basename(resolved).startsWith('ftv-quality-'));
  fs.rmSync(resolved, { recursive: true, force: true });
}

const fixture = () => ({ meta: { mode: 'deploiement', version: '1.0.0' }, sourcesAudioVideo: [{ id: 1, nom: 'Source' }], pieces: [{ id: 1, nom: 'Salon', pilotages: { eclairages: { actif: true, scenes: { nombre: 1, noms: ['OFF'], niveaux: [[0]] }, circuits: { nombre: 1, noms: ['Plafond'] } }, moteurs: { nombre: 1, liste: [{ type: 'store', nom: 'Store' }] }, audioVideo: { sources: [1] }, cvc: { consigne: { min: 16, max: 28, pas: 0.5 } } } }], contrat: { version: 'v4', blocsPieces: { tailleBloc: 100, offsets: [{ type: 'digital', offset: 21 }] }, blocsPiecesGui: { actif: false, tailleBloc: 100, mapping: { digital: { 51: 21 } } }, signauxGlobaux: [{ type: 'digital', join: 51, direction: 'bidirectionnel' }] } });
test('configuration minimale valide', () => assert.deepEqual(validateConfig(fixture()), []));
const cases = [
  ['identifiants pièces dupliqués', c => c.pieces.push(structuredClone(c.pieces[0]))],
  ['nombre pièces dépassé', c => c.pieces[0].id = 31],
  ['type booléen erroné', c => c.pieces[0].actif = 'false'],
  ['source inexistante', c => c.pieces[0].pilotages.audioVideo.sources = [9]],
  ['trop de circuits', c => c.pieces[0].pilotages.eclairages.circuits.nombre = 11],
  ['niveau analogique hors plage', c => c.pieces[0].pilotages.eclairages.scenes.niveaux[0][0] = 65536],
  ['table de niveaux incohérente', c => c.pieces[0].pilotages.eclairages.scenes.niveaux[0].push(5)],
  ['pas CVC nul', c => c.pieces[0].pilotages.cvc.consigne.pas = 0],
  ['réactivation v3', c => c.contrat.blocsPiecesGui.actif = true],
  ['collision de joins par plage', c => c.contrat.signauxGlobaux.push({ type: 'digital', joinDebut: 50, nombre: 3, direction: 'entree' })],
  ['miroir remappé sans support runtime', c => c.contrat.signauxGlobaux[0].eiscJoin = 55],
  ['mapping sans déclaration', c => c.contrat.blocsPiecesGui.mapping.digital[52] = 22],
  ['moteur inconnu', c => c.pieces[0].pilotages.moteurs.liste[0].type = 'banne-inconnue'],
  ['mauvais mode', c => c.meta.mode = 'showcase'],
  ['signal null', c => c.contrat.signauxGlobaux.push(null)],
];
for (const [name, mutate] of cases) test('refus : ' + name, () => { const c = fixture(); mutate(c); assert.ok(validateConfig(c).some(i => i.severity === 'error')); });
test('les espaces de joins digital/analog sont distincts', () => { const c = fixture(); c.contrat.signauxGlobaux.push({ type: 'analog', join: 51, direction: 'sortie' }); assert.deepEqual(validateConfig(c), []); });
test('profil client refuse un repli alarme sans exposer sa valeur', () => { const c = fixture(); c.contrat.alarme = { codeParDefaut: 'SECRET-TEST' }; const result = validateConfig(c, { release: true }); assert.ok(result.some(i => i.path === 'contrat.alarme.codeParDefaut')); assert.ok(!JSON.stringify(result).includes('SECRET-TEST')); });
test('catalogue complet et GUI embarquée sans simulateur', () => { assert.deepEqual(validateSimulatorRegistry(projects), []); assert.equal(getSimulator(projects.find(p => !p.isInteractive)), null); });
test('oubli de simulateur détecté sans repli vers une autre villa', () => { const copy = { ...SIMULATORS }; delete copy['villa-leman']; assert.ok(validateSimulatorRegistry(projects, copy).some(e => e.includes('villa-leman'))); assert.throws(() => getSimulator({ id: 'inconnu', isInteractive: true }), /non enregistré/); });
test('entrées dupliquées et simulateurs orphelins refusés', () => { assert.ok(validateSimulatorRegistry([...projects, projects[0]]).some(e => e.includes('dupliqué'))); assert.ok(validateSimulatorRegistry(projects, { ...SIMULATORS, inconnu: {} }).some(e => e.includes('sans projet'))); });

test('préparation injecte la config canonique sans modifier ni écraser les sources', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ftv-quality-'));
  t.after(() => removeTestDirectory(dir));
  const source = path.join(dir, 'source'), out = path.join(dir, 'candidate'), configFile = path.join(dir, 'config.json');
  fs.mkdirSync(source);
  const html = '<script src="js/webxpanel.js"></script><script>window.ready=true;</script>';
  for (const filename of ['index.html', 'iphone.html']) fs.writeFileSync(path.join(source, filename), html);
  fs.writeFileSync(path.join(source, 'villa_config.json'), '{"ancienne":true}');
  fs.writeFileSync(configFile, JSON.stringify(deploymentFixture()));
  const m = stageCh5({ source, out, configFile });
  assert.equal(m.hardwareReady, false);
  assert.equal(fs.readFileSync(path.join(source, 'villa_config.json'), 'utf8'), '{"ancienne":true}');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out, 'src/villa_config.json'))), deploymentFixture());
  assert.ok(fs.readFileSync(path.join(out, 'src/version.js'), 'utf8').includes('v' + deploymentFixture().meta.version));
  assert.throws(() => stageCh5({ source, out, configFile }), /dossier neuf/);
  assert.throws(() => stageCh5({ source, out: path.join(source, 'nested'), configFile }), /indépendante/);
});

test('une source vitrine ne peut être empaquetée comme déploiement', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ftv-quality-'));
  t.after(() => removeTestDirectory(dir));
  const source = path.join(dir, 'source'), configFile = path.join(dir, 'config.json');
  fs.mkdirSync(source); fs.writeFileSync(configFile, JSON.stringify(deploymentFixture()));
  fs.writeFileSync(path.join(source, 'index.html'), '<script src="js/local-feedback.js"></script>');
  assert.throws(() => stageCh5({ source, out: path.join(dir, 'out'), configFile }), /simulation/);
  assert.equal(fs.existsSync(path.join(dir, 'out')), false);
});
