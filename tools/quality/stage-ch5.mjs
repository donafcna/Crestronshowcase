import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateConfig } from './validate-config.mjs';
import { validateRuntimeCompatibility, readRuntimeProfile } from './runtime-compatibility.mjs';

// Préparation seule : pas de deploy.ps1, de connexion CP4 ou d'incrément de version.
export function stageCh5({ source, configFile, out, development = false }) {
  source = path.resolve(source); out = path.resolve(out);
  const normalizedSource = process.platform === 'win32' ? source.toLowerCase() : source;
  const normalizedOut = process.platform === 'win32' ? out.toLowerCase() : out;
  if (normalizedOut === normalizedSource || normalizedOut.startsWith(normalizedSource + path.sep) || normalizedSource.startsWith(normalizedOut + path.sep)) throw new Error('La sortie doit être indépendante des sources');
  if (fs.existsSync(out)) throw new Error('La sortie doit être un dossier neuf');
  const raw = fs.readFileSync(configFile, 'utf8');
  const config = JSON.parse(raw);
  const issues = validateConfig(config, { release: !development });
  if (issues.some(i => i.severity === 'error')) throw new Error('Configuration refusée : ' + JSON.stringify(issues));
  const runtimeProfile = readRuntimeProfile();
  const compatibility = validateRuntimeCompatibility(config, runtimeProfile);
  if (compatibility.length) throw new Error('Socle incompatible : ' + JSON.stringify(compatibility));
  for (const filename of ['index.html', 'iphone.html']) {
    const html = fs.readFileSync(path.join(source, filename), 'utf8');
    if (html.includes('src="js/local-feedback.js"')) throw new Error('Une GUI de simulation ne peut pas devenir une livraison matérielle');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) if (!/\bsrc\s*=|\btype\s*=\s*["'](?:module|application\/)/i.test(m[1]) && m[2].trim()) new vm.Script(m[2], { filename });
  }
  const manifest = { toolVersion: '0.2.0', runtime: runtimeProfile.id, runtimeSourcesVerified: false, createdAt: new Date().toISOString(), status: 'staged-not-qualified', development, source, configSource: path.resolve(configFile), version: config.meta.version, issues, hardwareReady: false, reason: 'Utiliser prepare-project pour vérifier les sources du socle. Compilation CH5Z/CPZ/LPZ et recette matérielle requises', files: [] };
  const hash = b => createHash('sha256').update(b).digest('hex');
  const entries = [];
  function walk(dir, rel = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Lien symbolique non autorisé dans la source : ' + entry.name);
      const name = path.join(rel, entry.name), full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, name);
      else entries.push({ name, full, sha256: hash(fs.readFileSync(full)) });
    }
  }
  walk(source);
  fs.mkdirSync(out, { recursive: true });
  for (const e of entries) {
    const dest = path.join(out, 'src', e.name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(e.full, dest);
    if (hash(fs.readFileSync(dest)) !== e.sha256 || hash(fs.readFileSync(e.full)) !== e.sha256) throw new Error('Source modifiée pendant la préparation ; dossier non qualifié : ' + e.name);
  }
  const formatted = JSON.stringify(config, null, 2) + '\n';
  fs.writeFileSync(path.join(out, 'villa_config.json'), formatted);
  fs.writeFileSync(path.join(out, 'src/villa_config.json'), formatted);
  fs.writeFileSync(path.join(out, 'src/villa_config.js'), 'window.villaConfigEmbedded = ' + JSON.stringify(config) + ';\n');
  fs.writeFileSync(path.join(out, 'src/version.js'), `window.appVersion = ${JSON.stringify('v' + config.meta.version)};\n`);
  fs.writeFileSync(path.join(out, 'src/build_date.json'), JSON.stringify({ compileDate: null, stagedAt: manifest.createdAt, status: 'non compile' }));
  for (const e of entries) if (hash(fs.readFileSync(e.full)) !== e.sha256) throw new Error('Source modifiée pendant la préparation : ' + e.name);
  if (fs.readFileSync(configFile, 'utf8') !== raw) throw new Error('Configuration modifiée pendant la préparation');
  const names = new Set([...entries.map(e => e.name), 'villa_config.json', 'villa_config.js', 'version.js', 'build_date.json']);
  for (const name of names) {
    const data = fs.readFileSync(path.join(out, 'src', name));
    manifest.files.push({ path: 'src/' + name.replaceAll('\\', '/'), sha256: hash(data), bytes: data.length });
  }
  manifest.configSha256 = hash(formatted);
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(out, 'LIRE-AVANT-INSTALLATION.md'), '# Candidat de préparation CH5\n\n**Non qualifié pour installation.** Aucun matériel contacté.\n\nLa configuration canonique est injectée dans les deux copies embarquées et la version est alignée sans modifier le dépôt source. Le manifeste donne les empreintes exactes. Aucun CPZ/LPZ historique n’est recopié comme s’il correspondait à cette source.\n\n' + (development ? '**Profil de développement interne : ne pas transmettre comme package client.**\n' : 'Profil configuration client validé ; cela ne valide pas le routage ou les binaires.\n'));
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = key => { const i = process.argv.indexOf(key); return i < 0 ? null : process.argv[i + 1]; };
  try {
    if (!arg('--config') || !arg('--out')) throw new Error('Usage : node stage-ch5.mjs --config <villa_config.json> --out <nouveau dossier> [--development] [--source <src>]');
    const source = arg('--source') || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../projects/villa-crans/ch5/src');
    const r = stageCh5({ source, configFile: arg('--config'), out: arg('--out'), development: process.argv.includes('--development') });
    console.log(JSON.stringify({ status: r.status, version: r.version, files: r.files.length, hardwareReady: r.hardwareReady }));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
