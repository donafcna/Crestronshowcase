// Console Web — onglet « Configuration » : lecture / contrôle / enregistrement de villa_config.json,
// liste des appareils (appareils.json), test de connexion, envoi vers processeurs et dalles.
// Module CommonJS chargé par tools/console_server.js. Aucun mot de passe ne sort d'ici vers le navigateur.
'use strict';
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { pathToFileURL } = require('url');
const { patcherTexte, egalProfond } = require('./json-patch-texte');

module.exports = function creerApiConfig(ROOT, options = {}) {
  const FICHIER_CONFIG = path.join(ROOT, 'villa_config.json');
  const FICHIER_SCHEMA = path.join(ROOT, 'villa_config.schema.json');
  const FICHIER_APPAREILS = path.join(ROOT, 'appareils.json');
  const GENERATEUR_SIMPL = path.join(ROOT, '..', 'simpl', 'direct', 'generate_simpl.js');
  const DOSSIER_SIMPL = path.dirname(GENERATEUR_SIMPL);
  const lireSecrets = options.lireSecrets || (() => ({}));
  const TYPES = ['processeur', 'ts', 'xpanel', 'mobile'];

  const lire = f => fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
  function ecrireAtomique(f, texte) {
    const tmp = f + '.tmp';
    fs.writeFileSync(tmp, texte, 'utf8');
    fs.renameSync(tmp, f);
  }

  let checkConfig = null;
  async function verifier(cfg) {
    if (!checkConfig) checkConfig = (await import(pathToFileURL(path.join(__dirname, 'check-config.mjs')).href)).checkConfig;
    return checkConfig(cfg, JSON.parse(lire(FICHIER_SCHEMA)));
  }

  // ---- impact sur le programme SIMPL (backend simpl : réglages des pièces figés dans le SIMPL+)
  // On génère le programme depuis l'ancienne et la nouvelle config, à numéro de version égal :
  // s'ils diffèrent, le processeur ne verra le changement qu'après recompilation dans SIMPL Windows.
  const FICHIERS_SIMPL = ['VillaPiece.usp', 'VillaGlobal.usp', 'VillaCrans_Direct.smw'];
  function generer(cfg) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'villa-simpl-'));
    const f = path.join(dir, 'villa_config.json');
    fs.writeFileSync(f, JSON.stringify(cfg));
    const r = spawnSync(process.execPath, [GENERATEUR_SIMPL, '--config', f, '--out', dir], { encoding: 'utf8', windowsHide: true });
    const sortie = {};
    if (r.status === 0) for (const n of FICHIERS_SIMPL) { try { sortie[n] = fs.readFileSync(path.join(dir, n), 'latin1').replace(/\r\n/g, '\n'); } catch (e) {} }
    fs.rmSync(dir, { recursive: true, force: true });
    return r.status === 0 ? sortie : null;
  }
  function impactSimpl(ancien, neuf) {
    if ((neuf.meta || {}).backend !== 'simpl' || !fs.existsSync(GENERATEUR_SIMPL)) return { concerne: false };
    const a = JSON.parse(JSON.stringify(ancien)), b = JSON.parse(JSON.stringify(neuf));
    a.meta = Object.assign({}, a.meta, { version: '0' }); b.meta = Object.assign({}, b.meta, { version: '0' });
    const ga = generer(a), gb = generer(b);
    if (!ga || !gb) return { concerne: true, erreur: 'générateur SIMPL en échec' };
    const fichiers = FICHIERS_SIMPL.filter(n => ga[n] !== gb[n]);
    return { concerne: true, recompilation: fichiers.length > 0, fichiers };
  }
  // Le programme du dépôt (simpl/direct) correspond-il encore à la config enregistrée ?
  function etatProgrammeSimpl(cfg) {
    if ((cfg.meta || {}).backend !== 'simpl' || !fs.existsSync(GENERATEUR_SIMPL)) return { concerne: false };
    const g = generer(cfg);
    if (!g) return { concerne: true, erreur: 'générateur SIMPL en échec' };
    const sansVersion = t => t.replace(/version \d+\.\d+\.\d+[^\s)"]*/g, 'version X');
    const ecarts = FICHIERS_SIMPL.filter(n => {
      try { return sansVersion(fs.readFileSync(path.join(DOSSIER_SIMPL, n), 'latin1').replace(/\r\n/g, '\n')) !== sansVersion(g[n]); }
      catch (e) { return true; }
    });
    let lpz = null, smw = null;
    try { lpz = fs.statSync(path.join(DOSSIER_SIMPL, 'VillaCrans_Direct.lpz')).mtime; } catch (e) {}
    try { smw = fs.statSync(path.join(DOSSIER_SIMPL, 'VillaCrans_Direct.smw')).mtime; } catch (e) {}
    // .lpz absent ou plus ancien que le .smw régénéré : compilation SIMPL Windows (F12) à faire
    const aCompiler = !lpz || (smw && smw > lpz);
    return { concerne: true, aJour: ecarts.length === 0, ecarts, lpz: lpz && lpz.toISOString(), aCompiler };
  }

  // ---- appareils.json
  function lireAppareils() {
    if (fs.existsSync(FICHIER_APPAREILS)) return JSON.parse(lire(FICHIER_APPAREILS));
    // Premier lancement : liste amorcée depuis deploy.secrets.psd1 (adresses seulement)
    const s = lireSecrets();
    const appareils = [];
    if (s.cp4) appareils.push({ id: 'processeur-1', nom: 'Processeur', type: 'processeur', modele: 'CP4', ip: s.cp4.host, ipId: '', cleHote: (s.cp4.hostKeys || [])[0] || '' });
    if (s.tsw) appareils.push({ id: 'ts-1', nom: 'Dalle tactile', type: 'ts', modele: 'TSW-1070', ip: s.tsw.host, ipId: '03', cleHote: (s.tsw.hostKeys || [])[0] || '' });
    appareils.push({ id: 'xpanel', nom: 'XPanel navigateur', type: 'xpanel', modele: 'XPanel', ip: '', ipId: '04', cleHote: '' });
    appareils.push({ id: 'ipad', nom: 'iPad (Crestron One)', type: 'mobile', modele: 'iPad', ip: '', ipId: '05', cleHote: '' });
    appareils.push({ id: 'iphone', nom: 'iPhone (Crestron One)', type: 'mobile', modele: 'iPhone', ip: '', ipId: '06', cleHote: '' });
    return { description: 'Appareils du projet pour la Console Web (onglet Configuration). Adresses, IP-ID et empreintes SSH ; jamais de mot de passe (deploy.secrets.psd1).', appareils, amorce: true };
  }
  function validerAppareils(liste) {
    const erreurs = [], ids = new Set();
    const ipOk = ip => !ip || /^(\d{1,3})(\.\d{1,3}){3}$/.test(ip) && ip.split('.').every(n => +n <= 255) || /^[a-z0-9.-]+$/i.test(ip);
    (liste || []).forEach((a, i) => {
      const p = `appareil ${i + 1}`;
      if (!/^[a-z0-9-]{1,40}$/.test(a.id || '')) erreurs.push(`${p} : identifiant en minuscules, chiffres et tirets`);
      if (ids.has(a.id)) erreurs.push(`${p} : identifiant ${a.id} en double`); ids.add(a.id);
      if (!TYPES.includes(a.type)) erreurs.push(`${p} : type inconnu`);
      if (!ipOk(a.ip)) erreurs.push(`${p} : adresse IP invalide`);
      if ((a.type === 'processeur' || a.type === 'ts') && !a.ip) erreurs.push(`${p} : adresse IP requise pour un ${a.type === 'ts' ? 'écran tactile' : 'processeur'}`);
      if (a.ipId && !/^[0-9A-Fa-f]{2}$/.test(a.ipId)) erreurs.push(`${p} : IP-ID sur 2 caractères hexadécimaux`);
      if (a.cleHote && !/^SHA256:[A-Za-z0-9+/=]{20,}$|^ssh-[a-z0-9-]+ [0-9]+ [0-9a-f:]+$/.test(a.cleHote)) erreurs.push(`${p} : empreinte SSH au format SHA256:…`);
    });
    return erreurs;
  }
  function ecrireAppareils(doc) {
    const propre = {
      description: doc.description || 'Appareils du projet pour la Console Web (onglet Configuration). Adresses, IP-ID et empreintes SSH ; jamais de mot de passe (deploy.secrets.psd1).',
      appareils: (doc.appareils || []).map(a => ({
        id: String(a.id || '').trim(), nom: String(a.nom || '').slice(0, 60), type: a.type, modele: String(a.modele || '').slice(0, 40),
        ip: String(a.ip || '').trim(), ipId: String(a.ipId || '').trim().toUpperCase(), cleHote: String(a.cleHote || '').trim(),
      })),
    };
    const erreurs = validerAppareils(propre.appareils);
    if (erreurs.length) { const e = new Error(erreurs.join(' ; ')); e.code = 422; throw e; }
    ecrireAtomique(FICHIER_APPAREILS, JSON.stringify(propre, null, 2) + '\n');
    return propre;
  }

  // ---- test de connexion : ports SSH (22), web (443) et CIP (41794) ; aucune authentification
  function port(hote, p, ms = 1500) {
    return new Promise(res => {
      const s = net.connect({ host: hote, port: p });
      const fin = ok => { s.destroy(); res(ok); };
      s.setTimeout(ms, () => fin(false));
      s.on('connect', () => fin(true));
      s.on('error', () => fin(false));
    });
  }
  async function tester(ip) {
    const [ssh, web, cip] = await Promise.all([port(ip, 22), port(ip, 443), port(ip, 41794)]);
    return { ip, ssh, web, cip, joignable: ssh || web || cip };
  }
  // Empreinte de la clé d'hôte (OpenSSH de Windows 10+ : ssh-keyscan + ssh-keygen). À vérifier puis enregistrer.
  function empreinte(ip) {
    const scan = spawnSync('ssh-keyscan', ['-T', '4', '-t', 'ed25519,ecdsa,rsa', ip], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    if (scan.error || !scan.stdout) return { erreur: 'ssh-keyscan indisponible ou appareil muet' };
    const lignes = scan.stdout.split(/\r?\n/).filter(l => l && !l.startsWith('#'));
    const res = [];
    for (const l of lignes) {
      const g = spawnSync('ssh-keygen', ['-l', '-E', 'sha256', '-f', '-'], { input: l + '\n', encoding: 'utf8', windowsHide: true });
      const m = /(SHA256:[A-Za-z0-9+/=]+)\s.*\((\w+)\)/.exec(g.stdout || '');
      if (m) res.push({ empreinte: m[1], type: m[2] });
    }
    return res.length ? { ip, cles: res } : { erreur: 'aucune clé lue' };
  }

  // ---- envoi : enchaîne deploy.ps1 (même chaîne que l'onglet Déploiement), sortie en flux
  function shell() {
    if (process.platform === 'win32') return 'powershell.exe';
    return process.env.PWSH || 'pwsh';
  }
  function envoyer(res, demande) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    let liste;
    try { liste = lireAppareils().appareils; } catch (e) { res.end('appareils.json illisible : ' + e.message + '\n'); return; }
    const ids = (demande.appareils || []).filter(id => liste.some(a => a.id === id));
    const parType = t => ids.filter(id => liste.find(a => a.id === id).type === t);
    const procs = parType('processeur'), dalles = parType('ts');
    const etapes = [];
    const base = demande.simulation ? ['-Simulation'] : [];
    if (procs.length) etapes.push(['config', procs]);
    if (procs.length && demande.rechargerSimpl) etapes.push(['simpl', procs]);
    if (dalles.length) etapes.push(['tsw', dalles]);
    if (!etapes.length) { res.end('Aucun processeur ni écran tactile coché.\n'); return; }
    let code = 0;
    const suivante = () => {
      const e = etapes.shift();
      if (!e) { res.end(`\n[envoi terminé${code ? ' AVEC ERREUR' : ''}${demande.simulation ? ' — simulation' : ''}]\n`); return; }
      const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'deploy.ps1'), '-Target', e[0], '-Appareils', e[1].join(','), ...base];
      res.write(`\n> deploy.ps1 -Target ${e[0]} -Appareils ${e[1].join(',')}${demande.simulation ? ' -Simulation' : ''}\n\n`);
      const child = spawn(shell(), args, { cwd: ROOT, windowsHide: true });
      child.stdout.on('data', d => res.write(d));
      child.stderr.on('data', d => res.write(d));
      child.on('close', c => { if (c) { code = c; res.write(`\n[étape ${e[0]} en échec, code ${c} : envoi interrompu]\n`); res.end(); return; } suivante(); });
      child.on('error', err => { res.write('\nERREUR : ' + err.message + '\n'); res.end(); });
    };
    suivante();
  }

  // ---- routes
  const json = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
  async function get(url, res) {
    if (url === '/config-editor.js') { res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' }); res.end(fs.readFileSync(path.join(__dirname, 'config-editor.js'))); return true; }
    if (url === '/api/config') {
      const config = JSON.parse(lire(FICHIER_CONFIG));
      json(res, 200, { config, schema: JSON.parse(lire(FICHIER_SCHEMA)), verification: await verifier(config), simpl: etatProgrammeSimpl(config) });
      return true;
    }
    if (url === '/api/appareils') { json(res, 200, lireAppareils()); return true; }
    return false;
  }
  async function post(url, body, res) {
    if (url === '/api/config/verifier') {
      const ancien = JSON.parse(lire(FICHIER_CONFIG));
      json(res, 200, { verification: await verifier(body.config), simpl: impactSimpl(ancien, body.config), modifie: !egalProfond(ancien, body.config) });
      return true;
    }
    if (url === '/api/config') {
      const texte = fs.readFileSync(FICHIER_CONFIG, 'utf8');
      const ancien = JSON.parse(texte.replace(/^﻿/, ''));
      const v = await verifier(body.config);
      if (v.errors.length) { json(res, 422, { verification: v, message: 'Configuration refusée : corriger les erreurs.' }); return true; }
      const neuf = patcherTexte(texte, body.config);
      if (neuf === texte) { json(res, 200, { ecrit: false, verification: v, message: 'Aucune modification.' }); return true; }
      fs.writeFileSync(FICHIER_CONFIG + '.bak', texte, 'utf8');
      ecrireAtomique(FICHIER_CONFIG, neuf);
      const lignes = (() => { const a = texte.split('\n'), b = neuf.split('\n'); let n = 0; const m = Math.max(a.length, b.length); for (let i = 0; i < m; i++) if (a[i] !== b[i]) n++; return n; })();
      json(res, 200, { ecrit: true, verification: v, simpl: impactSimpl(ancien, body.config), lignes, message: 'villa_config.json enregistré (copie précédente : villa_config.json.bak).' });
      return true;
    }
    if (url === '/api/simpl/regenerer') {
      const r = spawnSync(process.execPath, [GENERATEUR_SIMPL], { cwd: DOSSIER_SIMPL, encoding: 'utf8', windowsHide: true });
      json(res, r.status === 0 ? 200 : 500, { sortie: (r.stdout || '') + (r.stderr || ''), simpl: etatProgrammeSimpl(JSON.parse(lire(FICHIER_CONFIG))) });
      return true;
    }
    if (url === '/api/appareils') {
      try { json(res, 200, ecrireAppareils(body)); } catch (e) { json(res, e.code || 500, { message: e.message }); }
      return true;
    }
    if (url === '/api/appareils/tester' || url === '/api/appareils/empreinte') {
      const ip = String(body.ip || '');
      if (!/^[a-z0-9][a-z0-9.-]{0,252}$/i.test(ip)) { json(res, 400, { message: 'Adresse invalide' }); return true; }
      json(res, 200, url.endsWith('tester') ? await tester(ip) : empreinte(ip));
      return true;
    }
    if (url === '/api/envoi') { envoyer(res, body); return true; }
    return false;
  }
  return { get, post, impactSimpl, etatProgrammeSimpl, lireAppareils, validerAppareils };
};
