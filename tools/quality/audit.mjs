import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expandSignals, validateConfig } from './validate-config.mjs';

const arg = key => { const i = process.argv.indexOf(key); return i < 0 ? null : process.argv[i + 1]; };
const repo = path.resolve(arg('--repo') || path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const out = arg('--out');
if (!out) throw new Error('Usage : node audit.mjs --out <nouveau dossier> [--repo <dépôt>]');
if (fs.existsSync(out)) throw new Error('Le dossier de preuves doit être neuf : ' + out);
fs.mkdirSync(out, { recursive: true });
const report = { toolVersion: '0.1.0', startedAt: new Date().toISOString(), repo, scope: 'Audit statique ; aucune connexion matériel ni simulation de recette physique', checks: [], files: [], artifacts: [] };
const sha = b => createHash('sha256').update(b).digest('hex');
const read = rel => {
  const buffer = fs.readFileSync(path.join(repo, rel));
  if (!report.files.some(x => x.path === rel)) report.files.push({ path: rel, sha256: sha(buffer), bytes: buffer.length });
  return buffer.toString('utf8');
};
const check = (id, status, detail, evidence) => report.checks.push({ id, status, detail, ...(evidence ? { evidence } : {}) });
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
report.commit = git('rev-parse', 'HEAD');
report.workingTree = git('status', '--porcelain').split(/\r?\n/).filter(Boolean);
const ch5 = 'projects/villa-crans/ch5', showcase = 'apps/showcase/public/showcases/villa-gemini-frequencetv';
const config = JSON.parse(read(ch5 + '/villa_config.json'));
const demo = JSON.parse(read(showcase + '/villa_config.json'));
for (const [name, c, mode] of [['deployment', config, 'deploiement'], ['showcase', demo, 'showcase']]) {
  const issues = validateConfig(c, { mode });
  check('config.' + name, issues.some(x => x.severity === 'error') ? 'failed' : issues.length ? 'warning' : 'passed', issues);
}
const releaseIssues = validateConfig(config, { release: true }).filter(i => i.path === 'contrat.alarme.codeParDefaut');
check('release.alarmFallback', releaseIssues.length ? 'failed' : 'passed', releaseIssues.length ? 'Repli local présent dans la configuration de développement : définir un profil client sans repli. Aucune valeur secrète recopiée.' : 'Aucun repli local');

const version = JSON.parse(read(ch5 + '/version.json')).version;
report.sourceVersion = version;
for (const [name, actual] of [['canonical', config.meta.version], ['embedded', JSON.parse(read(ch5 + '/src/villa_config.json')).meta.version], ['gui', read(ch5 + '/src/version.js').match(/v(\d+\.\d+\.\d+)/)?.[1]], ['showcase', demo.meta.version.replace(/-showcase$/, '')], ['showcaseGui', read(showcase + '/version.js').match(/v(\d+\.\d+\.\d+)/)?.[1]]]) check('version.' + name, actual === version ? 'passed' : 'failed', { expected: version, actual });
check('source.generatedConfig', read(ch5 + '/villa_config.json') === read(ch5 + '/src/villa_config.json') ? 'passed' : 'failed', 'Comparaison exacte config canonique / copie embarquée');

let scripts = 0;
for (const root of [ch5 + '/src', showcase]) for (const file of ['index.html', 'iphone.html']) {
  const rel = root + '/' + file, html = read(rel), errors = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=|\btype\s*=\s*["'](?:module|application\/|text\/template)/i.test(m[1]) || !m[2].trim()) continue;
    scripts++;
    try { new vm.Script(m[2], { filename: rel }); } catch (e) { errors.push({ line: html.slice(0, m.index).split('\n').length, error: e.message }); }
  }
  check('syntax.' + rel, errors.length ? 'failed' : 'passed', errors);
  check('mode.' + rel, root === showcase ? (!html.includes('src="js/webxpanel.js"') && html.includes('src="js/local-feedback.js"') ? 'passed' : 'failed') : (!html.includes('src="js/local-feedback.js"') && html.includes('src="js/webxpanel.js"') ? 'passed' : 'failed'), 'Adaptateur de transport attendu');
}
report.inlineScriptsChecked = scripts;
const backend = read(ch5 + '/Backend/Backend/ControlSystem.cs');
const globals = expandSignals(config.contrat.signauxGlobaux);
const contractRows = globals.map(s => ({ name: s.contractName, type: s.type, guiJoin: s.join, direction: s.direction, eiscJoin: s.join, roomOffset: config.contrat.blocsPiecesGui.mapping[s.type]?.[s.join] ?? null }));
fs.writeFileSync(path.join(out, 'contract-v4.json'), JSON.stringify({ sourceConfigSha256: report.files.find(f => f.path === ch5 + '/villa_config.json').sha256, directionReference: 'entree = GUI vers slot 1 ; sortie = slot 1 vers GUI. Le symbole SIMPL inverse entrée/sortie.', signals: contractRows }, null, 2));
const csv = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
fs.writeFileSync(path.join(out, 'contract-v4.csv'), '\uFEFF' + ['nom,type,joinGUI,directionGUI,joinEISC,offsetPiece', ...contractRows.map(r => Object.values(r).map(csv).join(','))].join('\n'));
for (const [type, name] of [['digital', 'V4DigitalOffsets'], ['analog', 'V4AnalogOffsets']]) {
  const match = backend.match(new RegExp(name + '\\s*=\\s*new Dictionary<ushort, uint>\\s*\\{([\\s\\S]*?)\\};'));
  const actual = Object.fromEntries([...(match?.[1] || '').matchAll(/\{\s*(\d+)\s*,\s*(\d+)\s*\}/g)].map(m => [m[1], +m[2]]));
  const expected = Object.fromEntries(Object.entries(config.contrat.blocsPiecesGui.mapping[type]).filter(([j]) => globals.some(s => s.type === type && s.join === +j && s.direction !== 'sortie')));
  const fullMapping = config.contrat.blocsPiecesGui.mapping[type];
  const differences = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].filter(k => expected[k] !== actual[k] && !(expected[k] === undefined && actual[k] === fullMapping[k])).map(k => ({ join: +k, expected: expected[k], actual: actual[k] }));
  check('contract.csharp.' + type, match && !differences.length ? 'passed' : 'failed', differences);
}
const mirror = backend.slice(backend.indexOf('private void MirrorSignalToEisc'), backend.indexOf('private bool IsGlobalMirrorSignal'));
check('routing.multiPanel', 'unverified', 'Recette obligatoire : A sélectionne pièce 1, B pièce 2, A émet 151 puis 51 et un ordre de store. Vérifier la pièce de destination réelle et le relâchement. La pièce est suivie par IP-ID côté C#, mais le transport EISC global partage a10.', ch5 + '/Backend/Backend/ControlSystem.cs');
if (mirror.includes('join >= 610 && join <= 615') && !mirror.includes('V4DigitalOffsets') && !mirror.includes('V4AnalogOffsets')) check('routing.eiscContext', 'failed', 'Le rafraîchissement a10 dans MirrorSignalToEisc ne couvre que HVAC/Wellness, pas toutes les commandes de pièce. Risque de mauvais routage SIMPL entre deux écrans ; revue et recette requises.', ch5 + '/Backend/Backend/ControlSystem.cs');

const model = JSON.parse(read('apps/showcase/public/plan3d/villa-crans.json'));
const demoIds = demo.pieces.filter(p => p.actif !== false).map(p => p.id), planIds = model.pieces.map(p => p.id);
check('architecture.roomCoverage', new Set(planIds).size === planIds.length && demoIds.every(id => planIds.includes(id)) && planIds.every(id => demoIds.includes(id)) ? 'passed' : 'failed', { demoRooms: demoIds.length, planRooms: planIds.length, missing3d: demoIds.filter(id => !planIds.includes(id)), missingGui: planIds.filter(id => !demoIds.includes(id)) });
const basement = model.pieces.filter(p => p.niveau < 0 && p.windowWall && p.windowWall !== 'none');
check('architecture.basementWindows', basement.length ? 'unverified' : 'passed', basement.length ? { roomsToReview: basement.map(p => p.id), reason: 'Une ouverture de sous-sol doit avoir une justification explicite de terrain/cour anglaise ; revue visuelle requise.' } : 'Aucune fenêtre de sous-sol déclarée');
const smwPath = 'projects/villa-crans/simpl/simpl-windows/VillaCrans_Slot2.smw';
const smw = read(smwPath), symbol = [...smw.matchAll(/\[\r?\nObjTp=Sm\r?\n[\s\S]*?\r?\n\]/g)].find(m => /\bSmC=1160\b/.test(m[0]))?.[0];
const dims = Object.fromEntries(['n1I', 'n1O', 'n2I', 'n2O', 'mI', 'mO', 'tO'].map(k => [k, +(symbol?.match(new RegExp('(?:^|\\n)' + k + '=(\\d+)'))?.[1] || 0)]));
report.eisc = { dimensions: dims, note: 'Inventaire du symbole seulement : les dimensions ne prouvent pas la logique SIMPL câblée ni compilée.' };
check('simpl.eiscSymbol', symbol ? 'passed' : 'failed', report.eisc);
for (const [name, rel] of [['CH5Z', ch5 + '/dist/villaftv.ch5z'], ['CPZ', ch5 + '/Backend/Backend/bin/Release/Villaftv.cpz'], ['LPZ', 'projects/villa-crans/simpl/simpl-windows/VillaCrans_Slot2.lpz']]) {
  const full = path.join(repo, rel);
  report.artifacts.push({ name, path: rel, exists: fs.existsSync(full), ...(fs.existsSync(full) ? { sha256: sha(fs.readFileSync(full)), bytes: fs.statSync(full).size, modifiedAt: fs.statSync(full).mtime.toISOString() } : {}), sourceCorrespondence: 'unverified', hardwareInstallation: 'unverified' });
}
check('release.hardware', 'unverified', 'CPZ/LPZ associés à cette source et recette TSW/iPad/iPhone/XPanel non démontrés par cet audit. Aucun déploiement réalisé.');
const changed = report.files.filter(f => sha(fs.readFileSync(path.join(repo, f.path))) !== f.sha256).map(f => f.path);
check('snapshot.consistency', changed.length ? 'failed' : 'passed', changed.length ? changed : 'Les fichiers lus n’ont pas changé pendant l’audit');
report.finishedAt = new Date().toISOString();
report.counts = Object.fromEntries(['passed', 'warning', 'failed', 'unverified'].map(s => [s, report.checks.filter(c => c.status === s).length]));
report.releaseReady = !report.counts.failed && !report.counts.unverified;
fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(out, 'audit.md'), `# Audit pré-bêta — ${report.sourceVersion}\n\n${report.startedAt} · commit ${report.commit}\n\n**${report.releaseReady ? 'Prêt selon cet audit' : 'Non qualifié pour une livraison matérielle'}**. ${report.scope}.\n\n${JSON.stringify(report.counts)}\n\n| Contrôle | État | Résultat |\n|---|---|---|\n${report.checks.map(c => `| ${c.id} | ${c.status} | ${JSON.stringify(c.detail).replaceAll('|', '/')} |`).join('\n')}\n\nLes empreintes, l’état local et les quatre artefacts sont détaillés dans audit.json. Les tests graphiques doivent être ajoutés séparément.\n`);
console.log(JSON.stringify({ out: path.resolve(out), counts: report.counts, releaseReady: report.releaseReady }));
process.exitCode = report.counts.failed ? 1 : 0;
