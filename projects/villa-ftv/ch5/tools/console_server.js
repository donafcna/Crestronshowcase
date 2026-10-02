// Console Web Villa Crans — serveur local (127.0.0.1 uniquement)
// - Boutons de déploiement (deploy.ps1)
// - Terminal console Crestron (CP4 / TSW) via plink
// - Sert la page debugger de joins (WebXPanel vers le CP4)
// Lancement :  node tools/console_server.js   →  http://localhost:8090

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SECRETS_FILE = path.join(ROOT, 'deploy.secrets.psd1');
const PORT = 8090;

// --- Journal de chantier : à faire / à tester, rapports de test, spécifications ---
// Un fichier JSON par espace, versionné avec le code. Le dépôt plutôt que le
// navigateur, délibérément : un rapport signé doit suivre le projet, et Git en
// garde l'historique sans qu'on ait à s'en occuper.
const JOURNAL_DIR = path.join(ROOT, 'journal');
const JOURNAL_TYPES = ['todo', 'tests', 'specs'];

function journalFile(type) { return path.join(JOURNAL_DIR, type + '.json'); }

function lireJournal(type) {
  try {
    const o = JSON.parse(fs.readFileSync(journalFile(type), 'utf8'));
    return Array.isArray(o.items) ? o.items : [];
  } catch (e) {
    return [];   // fichier absent au premier passage : liste vide, pas une erreur
  }
}

function ecrireJournal(type, items) {
  fs.mkdirSync(JOURNAL_DIR, { recursive: true });
  // Écriture en deux temps : fichier temporaire puis renommage. Une coupure au
  // milieu laisse alors l'ancien fichier intact, plutôt qu'un JSON tronqué que
  // plus personne ne saurait relire.
  const cible = journalFile(type);
  const tmp = cible + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ items }, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, cible);
}

const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 500);
const nouvelId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

// Ce que chaque espace accepte. Le serveur ne recopie que ces champs : la page
// est modifiable par qui l'ouvre, la forme des données se décide ici.
const CHAMPS = {
  todo: it => ({
    titre: texte(it.titre, 300),
    detail: texte(it.detail, 4000),
    categorie: texte(it.categorie, 60),
    priorite: ['haute', 'moyenne', 'basse'].indexOf(it.priorite) >= 0 ? it.priorite : 'moyenne',
    statut: ['a-faire', 'a-tester', 'teste', 'bloque'].indexOf(it.statut) >= 0 ? it.statut : 'a-faire',
    auteur: texte(it.auteur, 12).toUpperCase()
  }),
  tests: it => ({
    date: /^\d{4}-\d{2}-\d{2}$/.test(it.date) ? it.date : new Date().toISOString().slice(0, 10),
    initiales: texte(it.initiales, 12).toUpperCase(),
    perimetre: texte(it.perimetre, 300),
    resultat: ['ok', 'partiel', 'ko'].indexOf(it.resultat) >= 0 ? it.resultat : 'ok',
    observations: texte(it.observations, 4000)
  }),
  specs: it => ({
    titre: texte(it.titre, 300),
    corps: texte(it.corps, 20000),
    auteur: texte(it.auteur, 12).toUpperCase()
  })
};

// Champs qu'une modification a le droit de toucher. L'auteur et la date de
// création n'en font pas partie : une signature qu'on peut réécrire ne signe rien.
const MODIFIABLES = {
  todo: ['titre', 'detail', 'categorie', 'priorite', 'statut'],
  tests: ['date', 'perimetre', 'resultat', 'observations'],
  specs: ['titre', 'corps']
};

function appliquerAction(type, action, item) {
  const items = lireJournal(type);
  const maintenant = new Date().toISOString();
  item = item || {};

  if (action === 'add') {
    const entree = CHAMPS[type](item);
    if (!entree.titre && !entree.perimetre) throw new Error('Entrée vide');
    entree.id = nouvelId();
    entree.cree_le = maintenant;
    entree.maj_le = maintenant;
    items.push(entree);
  } else if (action === 'update') {
    const i = items.findIndex(x => x.id === item.id);
    if (i < 0) throw new Error('Entrée introuvable');
    const propre = CHAMPS[type](Object.assign({}, items[i], item));
    MODIFIABLES[type].forEach(c => { if (item[c] !== undefined) items[i][c] = propre[c]; });
    items[i].maj_le = maintenant;
    if (item.maj_par !== undefined) items[i].maj_par = texte(item.maj_par, 12).toUpperCase();
  } else if (action === 'delete') {
    const i = items.findIndex(x => x.id === item.id);
    if (i < 0) throw new Error('Entrée introuvable');
    items.splice(i, 1);
  } else {
    throw new Error('Action inconnue');
  }

  ecrireJournal(type, items);
  return items;
}

// --- Lecture des identifiants (deploy.secrets.psd1) ---
// Les mots de passe restent côté serveur : jamais envoyés au navigateur.
function parseSecrets() {
  const raw = fs.readFileSync(SECRETS_FILE, 'utf8');
  const devices = {};
  const blockRe = /(\w+)\s*=\s*@\{([^}]*)\}/g;
  let m;
  while ((m = blockRe.exec(raw)) !== null) {
    const name = m[1];
    const body = m[2];
    const get = key => {
      const r = new RegExp(key + "\\s*=\\s*'([^']*)'");
      const mm = body.match(r);
      return mm ? mm[1] : null;
    };
    const hostKeys = [];
    const hkRe = /'(SHA256:[^']+)'/g;
    let hk;
    while ((hk = hkRe.exec(body)) !== null) hostKeys.push(hk[1]);
    if (get('Host')) {
      devices[name.toLowerCase()] = {
        host: get('Host'),
        user: get('User'),
        password: get('Password'),
        hostKeys: hostKeys
      };
    }
  }
  return devices;
}

// --- Exécution d'une commande console Crestron via plink ---
function runConsoleCommand(device, command, cb) {
  const args = ['-batch', '-ssh', '-no-antispoof'];
  device.hostKeys.forEach(k => { args.push('-hostkey', k); });
  args.push('-pw', device.password, device.user + '@' + device.host);

  const child = spawn('plink', args, { windowsHide: true });
  let out = '';
  const timer = setTimeout(() => { try { child.kill(); } catch (e) {} }, 30000);
  child.stdout.on('data', d => { out += d.toString('utf8'); });
  child.stderr.on('data', d => { out += d.toString('utf8'); });
  child.on('close', () => { clearTimeout(timer); cb(out); });
  child.on('error', err => { clearTimeout(timer); cb('ERREUR plink: ' + err.message); });
  // Ligne sacrificielle : la console Crestron corrompt la première ligne reçue pendant son init
  child.stdin.write('\r\n' + command + '\r\nbye\r\n');
  child.stdin.end();
}

// --- Nettoyage de la sortie console (retire bannière, échos et prompts) ---
function cleanConsoleOutput(raw, command) {
  // Pas de bannière console = échec de connexion : renvoyer la sortie brute (message d'erreur plink)
  if (!/Control Console/i.test(raw)) return raw.trim() || '(aucune réponse)';
  const lines = raw.split(/\r?\n/);
  const cleaned = [];
  const fallback = [];
  let promptSeen = 0;
  let sawCommandEcho = false;
  for (const line of lines) {
    const t = line.replace(/\[[0-9;]*m/g, '');
    if (/^Using username/i.test(t)) continue;
    if (/Control Console/i.test(t)) { promptSeen = 1; continue; }
    if (!promptSeen) continue; // écho de notre stdin avant la bannière
    if (/Disconnecting Bye/i.test(t)) break;
    const noPrompt = t.replace(/^[A-Za-z0-9-]+>\s?/, '');
    if (noPrompt !== 'bye' && !/^\s*$/.test(noPrompt)) fallback.push(noPrompt);
    // Tout ce qui precede l'ECHO de la commande (ligne sacrificielle et son erreur comprises)
    // est du bruit d'initialisation ; la vraie reponse commence apres.
    if (!sawCommandEcho) {
      if (noPrompt === command) sawCommandEcho = true;
      continue;
    }
    if (noPrompt === 'bye' || /^\s*$/.test(noPrompt)) continue;
    cleaned.push(noPrompt);
  }
  if (sawCommandEcho) {
    return cleaned.length ? cleaned.join('\n') : '(commande executee - aucune sortie)';
  }
  // Echo jamais detecte (cas limite) : rendu minimal sans les echos ni la 1re erreur sacrificielle
  const minimal = fallback.filter((l, i) => l !== command && !(i === 0 && /Bad or Incomplete/.test(l)));
  return minimal.length ? minimal.join('\n') : '(commande executee - aucune sortie)';
}

// --- Déploiement (deploy.ps1) en flux ---
function streamDeploy(res, target, skipBuild) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'deploy.ps1'), '-Target', target];
  if (skipBuild) args.push('-SkipBuild');
  res.write('> deploy.ps1 -Target ' + target + (skipBuild ? ' -SkipBuild' : '') + '\n\n');
  const child = spawn('powershell.exe', args, { cwd: ROOT, windowsHide: true });
  child.stdout.on('data', d => res.write(d));
  child.stderr.on('data', d => res.write(d));
  child.on('close', code => { res.write('\n[deploy termine, code ' + code + ']\n'); res.end(); });
  child.on('error', err => { res.write('\nERREUR: ' + err.message + '\n'); res.end(); });
}

function readBody(req, cb) {
  let body = '';
  req.on('data', d => { body += d; if (body.length > 1e6) req.destroy(); });
  req.on('end', () => {
    try { cb(JSON.parse(body || '{}')); } catch (e) { cb({}); }
  });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'GET') {
    if (url === '/' || url === '/console.html') return serveFile(res, path.join(__dirname, 'console.html'));
    if (url === '/journal.js') return serveFile(res, path.join(__dirname, 'journal.js'));
    if (url.startsWith('/api/journal/')) {
      const type = url.slice('/api/journal/'.length);
      if (JOURNAL_TYPES.indexOf(type) < 0) { res.writeHead(404); return res.end('Espace inconnu'); }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify({ items: lireJournal(type) }));
    }
    if (url === '/objectifs.html' || url === '/objectifs') return serveFile(res, path.join(__dirname, 'objectifs.html'));
    if (url === '/js/webxpanel.js') return serveFile(res, path.join(ROOT, 'src', 'js', 'webxpanel.js'));
    if (url === '/js/ch5-components.js') return serveFile(res, path.join(ROOT, 'src', 'js', 'ch5-components.js'));
    if (url.startsWith('/js/') && url.endsWith('.worker.js')) return serveFile(res, path.join(ROOT, 'src', 'js', path.basename(url)));
    if (url === '/villa_config.json') return serveFile(res, path.join(ROOT, 'villa_config.json'));
    if (url === '/api/devices') {
      try {
        const devices = parseSecrets();
        const pub = {};
        for (const k of Object.keys(devices)) pub[k] = { host: devices[k].host, user: devices[k].user };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(pub));
      } catch (e) {
        res.writeHead(500); return res.end(JSON.stringify({ error: e.message }));
      }
    }
    res.writeHead(404); return res.end('Not found');
  }

  if (req.method === 'POST' && url === '/api/console') {
    return readBody(req, body => {
      let devices;
      try { devices = parseSecrets(); } catch (e) { res.writeHead(500); return res.end('Identifiants illisibles: ' + e.message); }
      const device = devices[(body.device || 'cp4').toLowerCase()];
      const command = String(body.command || '').trim();
      if (!device) { res.writeHead(400); return res.end('Appareil inconnu'); }
      if (!command) { res.writeHead(400); return res.end('Commande vide'); }
      runConsoleCommand(device, command, out => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(body.raw ? out : cleanConsoleOutput(out, command));
      });
    });
  }

  if (req.method === 'POST' && url.startsWith('/api/journal/')) {
    const type = url.slice('/api/journal/'.length);
    if (JOURNAL_TYPES.indexOf(type) < 0) { res.writeHead(404); return res.end('Espace inconnu'); }
    return readBody(req, body => {
      try {
        const items = appliquerAction(type, body.action, body.item);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ items }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(e.message);
      }
    });
  }

  if (req.method === 'POST' && url === '/api/deploy') {
    return readBody(req, body => {
      const target = ['all', 'tsw', 'cp4', 'config'].indexOf(body.target) >= 0 ? body.target : 'all';
      streamDeploy(res, target, !!body.skipBuild);
    });
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Console Web Villa Crans sur http://localhost:' + PORT);
});
