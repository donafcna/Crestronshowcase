/* Console Web — onglet « Configuration ».
 * Formulaire construit à partir de villa_config.schema.json : toute option du schéma apparaît ici sans
 * code supplémentaire. Éditeurs dédiés : pièces (scènes × circuits en %, moteurs), traductions, appareils.
 * Enregistrement : le serveur contrôle (check-config), garde villa_config.json.bak et ne réécrit que les
 * lignes modifiées. Envoi : deploy.ps1 vers les processeurs et dalles cochés (mode simulation possible).
 */
(function () {
  'use strict';
  const E = {
    charge: false, config: null, reference: '', schema: null, verif: { errors: [], warnings: [] }, simpl: null, impact: null,
    appareils: null, appareilsRef: '', section: 'meta', piece: 0, voirPrevu: false, disposition: 'a', envoiEnCours: false,
  };
  try { E.voirPrevu = localStorage.getItem('cfg_voir_prevu') === '1'; E.disposition = localStorage.getItem('cfg_disposition') || 'a'; } catch (e) {}

  // ---------------------------------------------------------------- outils
  const $ = (sel, r) => (r || document).querySelector(sel);
  function h(tag, attrs, ...enfants) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of enfants.flat()) if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const clone = o => JSON.parse(JSON.stringify(o));
  const estObjet = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const INFO = /(^|[a-z])(description|Description|note|notes|aide)$/;
  function lireChemin(o, p) { for (const k of p) { if (o == null) return undefined; o = o[k]; } return o; }
  function ecrireChemin(o, p, v) {
    for (let i = 0; i < p.length - 1; i++) {
      if (o[p[i]] == null || typeof o[p[i]] !== 'object') o[p[i]] = typeof p[i + 1] === 'number' ? [] : {};
      o = o[p[i]];
    }
    if (v === undefined) { if (Array.isArray(o)) o.splice(p[p.length - 1], 1); else delete o[p[p.length - 1]]; }
    else o[p[p.length - 1]] = v;
  }
  const cheminTexte = p => p.reduce((s, k) => typeof k === 'number' ? `${s}[${k}]` : (s ? s + '.' + k : k), '');
  function resoudre(s) {
    if (!s) return {};
    if (s.$ref) return Object.assign({}, E.schema.definitions[s.$ref.split('/').pop()]);
    if (s.allOf && s.allOf.length === 1 && s.allOf[0].$ref) {
      const base = resoudre(s.allOf[0]); const r = Object.assign({}, base, s); delete r.allOf;
      r.description = s.description || base.description; r['x-etat'] = s['x-etat'] || base['x-etat'];
      return r;
    }
    return s;
  }
  const descSansEtat = d => String(d || '').replace(/^\[[^\]]+\]\s*/, '');
  const types = s => [].concat(s.type || []);
  // Champ texte d'une ligne qui s'agrandit en hauteur plutôt que de tronquer (tables étroites)
  function texteAuto(attrs, valeur, surChange) {
    const t = h('textarea', Object.assign({ class: 'cfg-auto', rows: 1, spellcheck: 'false' }, attrs));
    t.value = valeur ?? '';
    t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); t.blur(); } });
    t.addEventListener('change', () => { t.value = t.value.replace(/\s*\n\s*/g, ' '); surChange(t.value); });
    return t;
  }

  const LIBELLES = {
    meta: 'Projet', interface: 'Interface', pieces: 'Pièces', sourcesAudioVideo: 'Sources audio / vidéo', scenesStores: 'Commandes groupées des stores',
    widgets: 'Widgets', valeursParDefaut: 'Valeurs par défaut', pagesSpeciales: 'Pages spéciales', traductions: 'Traductions', monitoring: 'Monitoring',
    contrat: 'Contrat de joins', projet: 'Nom du projet', integrateur: 'Intégrateur', version: 'Version', mode: 'Mode', backend: 'Programme processeur',
    tracesConsole: 'Traces console', tracesLatence: 'Traces de latence', dateModification: 'Date de modification', langueReference: 'Langue des noms',
    languesDisponibles: 'Langues disponibles (ancien)', aide: 'Aide', menuPieces: 'Menu des pièces', visible: 'Visible', pieceParDefaut: 'Pièce par défaut',
    recherche: 'Bouton Recherche', actif: 'Actif', suggestions: 'Suggestions', themes: 'Thèmes', langues: 'Langues', disponibles: 'Proposés', parDefaut: 'Par défaut',
    controlesGlobaux: 'Contrôles globaux', general: 'Page Général', etats: 'Pastilles d’état', audioVideo: 'Audio / vidéo', eclairage: 'Éclairage',
    iconesDisponibles: 'Icônes (aide-mémoire)', scenesEclairage: 'Scènes d’éclairage', circuits: 'Circuits', moteurs: 'Moteurs', cvc: 'CVC', stores: 'Stores',
    consigneMinC: 'Consigne min (°C)', consigneMaxC: 'Consigne max (°C)', pasC: 'Pas (°C)', position: 'Position en %', angleLamelles: 'Angle des lamelles en %',
    nom: 'Nom', id: 'Id', type: 'Type', nombre: 'Nombre', noms: 'Noms', meteoActualites: 'Météo', bandeauActualites: 'Bandeau « État de la villa »',
    parPeripherique: 'Par appareil (IP-ID)', ville: 'Ville', latitude: 'Latitude', longitude: 'Longitude', jeux: 'Jeux', animation: 'Animation', video: 'Vidéo',
    icone: 'Icône', youtubeRecherche: 'Recherche YouTube', vueEnsemble: 'Vue d’ensemble', pageAccueil: 'Page d’accueil', elements: 'Éléments supervisés',
    alertes: 'Alertes', emails: 'Destinataires', evenements: 'Événements', lamelles: 'Lamelles', marcheArret: 'Marche / Arrêt', ventilation: 'Ventilation',
    vitesses: 'Vitesses', etatInitial: 'État initial', marche: 'Marche', consigne: 'Consigne', min: 'Min', max: 'Max', pas: 'Pas', modes: 'Modes',
    deriveC: 'Dérive tolérée (°C)', controlesGeneraux: 'Commandes générales', partitionsAlarme: 'Partitions d’alarme', sources: 'Sources', wellness: 'Wellness',
    sauna: 'Sauna', hammam: 'Hammam', intersystem: 'Intersystem (EISC)', niveau: 'Étage', plan3d: 'Plan 3D', pilotages: 'Modules', eclairages: 'Éclairage',
    scenes: 'Scènes', liste: 'Liste', commande: 'Commande', technologie: 'Technologie', lutron: 'Nom Lutron', kelvinMin: 'Kelvin min', kelvinMax: 'Kelvin max',
    interfaceObj: 'Interface', fonctionsRetirees: 'Fonctions retirées', coreOrigine: 'Core d’origine', description: 'Description',
  };
  const libelle = k => LIBELLES[k] || String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
  const ETATS = { prevu: ['prévu', 'Prévu par la feuille de route : accepté mais sans effet aujourd’hui'], inutilise: ['inutilisé', 'Lu par personne aujourd’hui'], processeur: ['processeur', 'Lu par le programme du processeur, sans effet sur l’écran'] };
  function badge(etat) { const b = ETATS[etat]; return b ? h('span', { class: 'cfg-badge cfg-badge-' + etat, title: b[1] }, b[0]) : null; }

  // ---------------------------------------------------------------- styles
  const STYLE = `
  #sec-config { padding:0; gap:0; }
  .cfg-barre { display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:12px 20px; border-bottom:1px solid var(--border); }
  .cfg-barre .titre { font-weight:700; color:var(--txt); margin-right:6px; }
  .cfg-etat { font-size:.8rem; font-weight:700; padding:4px 10px; border-radius:999px; background:rgba(148,163,184,.14); color:#cbd5e1; }
  .cfg-etat.ok { background:rgba(16,185,129,.14); color:#6ee7b7; } .cfg-etat.ko { background:rgba(239,68,68,.16); color:#fca5a5; } .cfg-etat.mod { background:rgba(196,154,69,.16); color:#e9c46a; }
  .cfg-corps { flex:1; display:flex; min-height:0; }
  .cfg-nav { margin:0; width:250px; flex:none; overflow-y:auto; border-right:1px solid var(--border); padding:10px 8px; display:flex; flex-direction:column; gap:2px; }
  .cfg-nav button { text-align:left; background:transparent; border:1px solid transparent; color:#cbd5e1; padding:9px 12px; min-height:40px; border-radius:8px; cursor:pointer; font-size:.86rem; font-weight:600; display:flex; align-items:center; gap:8px; }
  .cfg-nav button:hover { background:rgba(255,255,255,.05); }
  .cfg-nav button.active { background:rgba(16,185,129,.14); border-color:rgba(16,185,129,.5); color:#6ee7b7; }
  .cfg-nav button.sous { padding-left:26px; font-weight:500; font-size:.82rem; }
  .cfg-nav button .n { margin-left:auto; font-size:.72rem; color:#cbd5e1; background:rgba(239,68,68,.25); border-radius:999px; padding:1px 7px; }
  .cfg-nav .sep { height:1px; background:var(--border); margin:6px 4px; }
  .cfg-form { flex:1; overflow-y:auto; padding:16px 22px 60px; min-width:0; }
  .cfg-panneau { width:300px; flex:none; overflow-y:auto; border-left:1px solid var(--border); padding:12px 14px; font-size:.8rem; }
  .cfg-panneau h4 { margin:4px 0 8px; font-size:.78rem; text-transform:uppercase; color:#cbd5e1; letter-spacing:.04em; }
  .cfg-msg { padding:7px 9px; border-radius:7px; margin-bottom:6px; cursor:pointer; line-height:1.35; }
  .cfg-msg.err { background:rgba(239,68,68,.12); color:#fecaca; } .cfg-msg.warn { background:rgba(196,154,69,.12); color:#f5deb3; } .cfg-msg.info { background:rgba(56,189,248,.1); color:#bae6fd; }
  .cfg-msg code { color:inherit; opacity:.85; font-size:.74rem; word-break:break-all; }
  .cfg-form h2 { font-size:1.15rem; margin:0 0 4px; color:var(--txt); } .cfg-form .intro { color:#cbd5e1; font-size:.82rem; margin:0 0 14px; max-width:900px; }
  fieldset.cfg-groupe { border:1px solid var(--border); border-radius:10px; padding:10px 14px 12px; margin:0 0 12px; min-width:0; }
  fieldset.cfg-groupe > legend { padding:0 6px; font-weight:700; font-size:.88rem; color:var(--txt); display:flex; align-items:center; gap:8px; }
  fieldset.cfg-groupe.prevu { border-style:dashed; border-color:rgba(167,139,250,.55); }
  .cfg-champ { display:grid; grid-template-columns:minmax(170px,240px) minmax(0,1fr); gap:4px 14px; align-items:start; padding:7px 0; border-bottom:1px solid rgba(255,255,255,.04); }
  .cfg-champ:last-child { border-bottom:none; }
  .cfg-champ > .lib { font-size:.84rem; font-weight:600; color:var(--txt); padding-top:9px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
  .cfg-champ .aide { grid-column:2; font-size:.76rem; color:#cbd5e1; line-height:1.35; }
  .cfg-champ.prevu > .lib { color:#ddd6fe; }
  .cfg-champ.erreur input, .cfg-champ.erreur select, .cfg-champ.erreur textarea { border-color:var(--red); }
  .cfg-champ.flash { animation:cfgflash 1.6s ease-out; }
  @keyframes cfgflash { 0% { background:rgba(56,189,248,.25); } 100% { background:transparent; } }
  .cfg-val { display:flex; gap:8px; align-items:center; flex-wrap:wrap; min-width:0; }
  .cfg-val input[type=text], .cfg-val input[type=number], .cfg-val select { min-height:40px; min-width:0; }
  .cfg-val input[type=text] { width:min(100%, 420px); } .cfg-val input[type=number] { width:130px; }
  .cfg-val textarea { width:100%; min-height:140px; font-family:'Cascadia Mono','Consolas',monospace; font-size:.78rem; }
  .cfg-bascule { display:inline-flex; align-items:center; gap:8px; min-height:40px; cursor:pointer; font-size:.84rem; }
  .cfg-bascule input { width:20px; height:20px; accent-color:#10b981; }
  .cfg-cases { display:flex; flex-wrap:wrap; gap:6px; }
  .cfg-cases label { display:inline-flex; align-items:center; gap:6px; border:1px solid var(--border); border-radius:8px; padding:0 10px; min-height:40px; cursor:pointer; font-size:.82rem; }
  .cfg-cases label.on { border-color:rgba(16,185,129,.6); background:rgba(16,185,129,.1); }
  .cfg-cases input { width:18px; height:18px; accent-color:#10b981; }
  .cfg-x { background:transparent; border:1px solid var(--border); color:#cbd5e1; border-radius:8px; min-width:40px; min-height:40px; cursor:pointer; font-size:.8rem; }
  .cfg-x:hover { color:#fca5a5; border-color:var(--red); }
  .cfg-badge { font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; padding:2px 7px; border-radius:999px; }
  .cfg-badge-prevu { background:rgba(167,139,250,.18); color:#ddd6fe; } .cfg-badge-inutilise { background:rgba(148,163,184,.18); color:#e2e8f0; } .cfg-badge-processeur { background:rgba(56,189,248,.15); color:#bae6fd; }
  .cfg-info { font-size:.76rem; color:#cbd5e1; background:rgba(255,255,255,.03); border-radius:8px; padding:8px 10px; margin:6px 0; white-space:pre-wrap; }
  .cfg-liste { display:flex; flex-direction:column; gap:6px; width:100%; }
  .cfg-ligne { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .cfg-carte { border:1px solid var(--border); border-radius:10px; padding:8px 12px; background:rgba(255,255,255,.02); }
  .cfg-carte-tete { display:flex; align-items:center; gap:10px; font-weight:700; font-size:.84rem; margin-bottom:4px; }
  .cfg-carte-tete .cfg-x { margin-left:auto; }
  .cfg-table { width:100%; border-collapse:collapse; font-size:.82rem; }
  .cfg-table th { font-size:.72rem; color:#cbd5e1; text-transform:none; padding:6px; border-bottom:1px solid var(--border); text-align:left; white-space:nowrap; }
  .cfg-table td { padding:4px 6px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; }
  .cfg-table input[type=text], .cfg-table input[type=number], .cfg-table select { width:100%; min-height:40px; }
  .cfg-table input.pct { width:76px; text-align:right; }
  .cfg-matrice { overflow-x:auto; max-width:100%; }
  .cfg-matrice th.circ { max-width:130px; white-space:normal; font-weight:600; }
  .cfg-manque { background:rgba(196,154,69,.12); }
  .cfg-alerte { border:1px solid rgba(239,68,68,.5); background:rgba(239,68,68,.08); border-radius:10px; padding:10px 14px; margin:0 0 12px; font-size:.84rem; color:#fecaca; }
  .cfg-alerte.ok { border-color:rgba(16,185,129,.5); background:rgba(16,185,129,.08); color:#a7f3d0; }
  .cfg-alerte.info { border-color:rgba(56,189,248,.45); background:rgba(56,189,248,.07); color:#bae6fd; }
  .cfg-alerte .row { margin-top:8px; }
  .cfg-term { background:#0a0d12; border:1px solid var(--border); border-radius:10px; padding:10px 12px; font-family:'Cascadia Mono','Consolas',monospace; font-size:.76rem; white-space:pre-wrap; max-height:340px; overflow-y:auto; color:#e2e8f0; }
  .cfg-point { width:10px; height:10px; border-radius:50%; display:inline-block; background:#64748b; }
  .cfg-point.ok { background:#10b981; } .cfg-point.ko { background:#ef4444; }
  .cfg-barre .btn, .cfg-form .btn { min-height:40px; }
  .cfg-recherche { width:220px; }
  .cfg-table select { min-width:110px; }
  .cfg-connexion { min-width:108px; } .cfg-connexion .btn { margin:3px 6px 3px 0 !important; }
  @media (max-width: 1500px) { .cfg-connexion { width:108px; } }
  #sec-config select, #sec-config input[type=text], #sec-config input[type=number] { min-height:40px; }
  textarea.cfg-auto { field-sizing:content; min-height:40px; width:100%; min-width:120px; resize:none; font-family:inherit; font-size:.85rem; line-height:1.35; padding:9px 10px; white-space:pre-wrap; overflow:hidden; }
  /* Variante B : sections en onglets au-dessus du formulaire */
  #sec-config.cfg-b .cfg-corps { flex-direction:column; }
  #sec-config.cfg-b .cfg-nav { width:auto; flex-direction:row; flex-wrap:nowrap; overflow-x:auto; overflow-y:hidden; border-right:none; border-bottom:1px solid var(--border); padding:6px 10px; }
  #sec-config.cfg-b .cfg-nav button { white-space:nowrap; flex:none; }
  #sec-config.cfg-b .cfg-nav button.sous, #sec-config.cfg-b .cfg-nav .sep { display:none; }
  #sec-config.cfg-b .cfg-bas { display:flex; flex:1; min-height:0; }
  #sec-config.cfg-b .cfg-piece-choix { display:flex; }
  .cfg-bas { display:contents; }
  .cfg-piece-choix { display:none; gap:8px; align-items:center; margin-bottom:12px; }
  .cfg-champ.large { grid-template-columns:minmax(0,1fr); } .cfg-champ.large > .lib { padding-top:2px; } .cfg-champ.large .aide { grid-column:1; }
  @media (max-width: 1500px) {
    .cfg-panneau { width:200px; padding:10px; } .cfg-nav { width:200px; } .cfg-form { padding:14px 14px 60px; }
    .cfg-table td { padding:4px 3px; } .cfg-table select { min-width:96px; }
    .cfg-champ { grid-template-columns:minmax(150px,190px) minmax(0,1fr); }
  }
  `;

  // ---------------------------------------------------------------- squelette
  let sec;
  function monter() {
    sec = document.getElementById('sec-config');
    if (!sec || sec.dataset.monte) return;
    sec.dataset.monte = '1';
    document.head.append(h('style', { id: 'cfg-style' }, STYLE));
    sec.append(
      h('div', { class: 'cfg-barre' },
        h('span', { class: 'titre' }, 'villa_config.json'),
        h('span', { id: 'cfg-etat', class: 'cfg-etat' }, 'Chargement…'),
        h('button', { class: 'btn primary', id: 'cfg-enregistrer', onclick: enregistrer }, 'Enregistrer'),
        h('button', { class: 'btn', id: 'cfg-annuler', onclick: annuler }, 'Annuler les modifications'),
        h('button', { class: 'btn', onclick: () => charger(true) }, 'Recharger le fichier'),
        h('label', { class: 'cfg-bascule', style: 'margin-left:auto', title: 'Options de la feuille de route : validées mais sans effet aujourd’hui' },
          h('input', { type: 'checkbox', id: 'cfg-voir-prevu', checked: E.voirPrevu, onchange: e => { E.voirPrevu = e.target.checked; try { localStorage.setItem('cfg_voir_prevu', E.voirPrevu ? '1' : '0'); } catch (x) {} rendre(); } }),
          'Afficher les options prévues'),
        h('select', { id: 'cfg-disposition', title: 'Disposition de la page', onchange: e => { E.disposition = e.target.value; try { localStorage.setItem('cfg_disposition', E.disposition); } catch (x) {} appliquerDisposition(); } },
          h('option', { value: 'a' }, 'Disposition A — sections à gauche'), h('option', { value: 'b' }, 'Disposition B — onglets'))),
      h('div', { class: 'cfg-corps' },
        h('nav', { class: 'cfg-nav', id: 'cfg-nav', 'aria-label': 'Sections de la configuration' }),
        h('div', { class: 'cfg-bas' },
          h('div', { class: 'cfg-form', id: 'cfg-form' }),
          h('aside', { class: 'cfg-panneau', id: 'cfg-panneau' }))));
    $('#cfg-disposition').value = E.disposition;
    appliquerDisposition();
    window.addEventListener('beforeunload', e => { if (modifie()) { e.preventDefault(); e.returnValue = ''; } });
  }
  function appliquerDisposition() { sec.classList.toggle('cfg-b', E.disposition === 'b'); }

  async function charger(force) {
    if (E.charge && !force) return;
    if (force && modifie() && !confirmerDeux('cfg-recharger', 'Des modifications non enregistrées seront perdues.')) return;
    try {
      const [r, a] = await Promise.all([fetch('/api/config'), fetch('/api/appareils')]);
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      E.config = d.config; E.reference = JSON.stringify(d.config); E.schema = d.schema; E.verif = d.verification; E.simpl = d.simpl; E.impact = null;
      E.appareils = await a.json(); E.appareilsRef = JSON.stringify(E.appareils.appareils);
      E.charge = true;
      rendre();
    } catch (e) {
      $('#cfg-etat').textContent = 'Erreur de chargement';
      $('#cfg-form').replaceChildren(h('div', { class: 'cfg-alerte' }, 'Impossible de lire la configuration : ' + e.message));
    }
  }
  const modifie = () => E.charge && JSON.stringify(E.config) !== E.reference;
  const appareilsModifies = () => E.appareils && JSON.stringify(E.appareils.appareils) !== E.appareilsRef;
  // Confirmation sans boîte de dialogue : le même bouton doit être pressé deux fois en 4 s.
  const confirmations = {};
  function confirmerDeux(cle, message) {
    const t = Date.now();
    if (confirmations[cle] && t - confirmations[cle] < 4000) { delete confirmations[cle]; return true; }
    confirmations[cle] = t; info(message + ' Appuyer de nouveau pour confirmer.');
    return false;
  }
  let infoMsg = '';
  function info(m) { infoMsg = m; rendrePanneau(); }

  // ---------------------------------------------------------------- modification + contrôle
  let minuterie = null;
  function changer(p, v) {
    ecrireChemin(E.config, p, v);
    majEtat();
    clearTimeout(minuterie);
    minuterie = setTimeout(verifier, 450);
  }
  async function verifier() {
    try {
      const r = await fetch('/api/config/verifier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: E.config }) });
      const d = await r.json();
      E.verif = d.verification; E.impact = d.simpl;
      rendrePanneau(); rendreNav(); marquerErreurs(); majEtat();
    } catch (e) { info('Contrôle impossible : ' + e.message); }
  }
  function majEtat() {
    const el = $('#cfg-etat'); if (!el) return;
    const n = E.verif.errors.length;
    el.className = 'cfg-etat ' + (n ? 'ko' : modifie() ? 'mod' : 'ok');
    el.textContent = n ? `${n} erreur${n > 1 ? 's' : ''}` : modifie() ? 'Modifié, non enregistré' : 'Enregistré';
    $('#cfg-enregistrer').disabled = !modifie() || n > 0;
    $('#cfg-annuler').disabled = !modifie();
  }
  async function enregistrer() {
    if (!modifie()) return true;
    const r = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: E.config }) });
    const d = await r.json();
    E.verif = d.verification || E.verif;
    if (!r.ok) { info(d.message || 'Enregistrement refusé'); rendrePanneau(); majEtat(); return false; }
    E.reference = JSON.stringify(E.config); E.impact = d.simpl || null;
    if (d.simpl && d.simpl.concerne) { try { E.simpl = (await (await fetch('/api/config')).json()).simpl; } catch (e) {} }
    info(d.message + (d.lignes ? ` ${d.lignes} ligne(s) modifiée(s).` : ''));
    rendre();
    return true;
  }
  function annuler() {
    if (!modifie()) return;
    if (!confirmerDeux('cfg-annuler', 'Toutes les modifications non enregistrées seront perdues.')) return;
    E.config = JSON.parse(E.reference); E.impact = null; verifier(); rendre();
  }

  // ---------------------------------------------------------------- navigation
  function sections() {
    const props = E.schema.properties;
    const liste = ['meta', 'interface', 'pieces', 'sourcesAudioVideo', 'scenesStores', 'widgets', 'valeursParDefaut', 'pagesSpeciales', 'traductions'];
    if (E.voirPrevu || E.config.monitoring) liste.push('monitoring');
    liste.push('contrat');
    for (const k of Object.keys(E.config)) if (k !== '$schema' && !liste.includes(k) && !(k === 'monitoring')) liste.push(k);
    return liste.filter(k => props[k] || k in E.config);
  }
  function erreursDe(prefixe) { return E.verif.errors.filter(x => x.path === prefixe || x.path.startsWith(prefixe + '.') || x.path.startsWith(prefixe + '[')).length; }
  function rendreNav() {
    const nav = $('#cfg-nav'); if (!nav) return;
    const enfants = [];
    for (const k of sections()) {
      const n = erreursDe(k);
      enfants.push(h('button', { class: E.section === k ? 'active' : '', onclick: () => aller(k) }, libelle(k), n ? h('span', { class: 'n' }, n) : null));
      if (k === 'pieces' && E.section === 'pieces') {
        (E.config.pieces || []).forEach((p, i) => {
          const ne = erreursDe(`pieces[${i}]`);
          enfants.push(h('button', { class: 'sous' + (E.piece === i ? ' active' : ''), onclick: () => { E.piece = i; aller('pieces'); } },
            `${p.id} · ${p.nom || '(sans nom)'}${p.actif === false ? ' — inactive' : ''}`, ne ? h('span', { class: 'n' }, ne) : null));
        });
      }
    }
    enfants.push(h('div', { class: 'sep' }));
    enfants.push(h('button', { class: E.section === 'appareils' ? 'active' : '', onclick: () => aller('appareils') }, 'Appareils et envoi'));
    nav.replaceChildren(...enfants);
  }
  function aller(k, champ) {
    E.section = k; rendre();
    if (champ) {
      const el = document.querySelector(`[data-chemin="${CSS.escape(champ)}"]`);
      if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1700); }
    }
  }

  // ---------------------------------------------------------------- panneau des messages
  function rendrePanneau() {
    const pan = $('#cfg-panneau'); if (!pan) return;
    const err = E.verif.errors, warn = E.verif.warnings.filter(x => !x.message.startsWith('clé prévue'));
    const prevues = E.verif.warnings.length - warn.length;
    const msg = (cls, x) => h('div', { class: 'cfg-msg ' + cls, onclick: () => allerChemin(x.path) }, x.message, h('br'), h('code', {}, x.path || '(racine)'));
    pan.replaceChildren(
      infoMsg ? h('div', { class: 'cfg-msg info', onclick: () => { infoMsg = ''; rendrePanneau(); } }, infoMsg) : '',
      h('h4', {}, `Erreurs (${err.length})`), ...(err.length ? err.map(x => msg('err', x)) : [h('div', { class: 'hint' }, 'Aucune.')]),
      h('h4', {}, `Avertissements (${warn.length})`), ...(warn.length ? warn.map(x => msg('warn', x)) : [h('div', { class: 'hint' }, 'Aucun.')]),
      prevues ? h('div', { class: 'hint', style: 'margin-top:8px' }, `${prevues} option(s) prévue(s) renseignée(s) : sans effet tant qu’elles ne sont pas implémentées.`) : '',
      impactBloc());
  }
  function impactBloc() {
    const i = E.impact;
    if (!i || !i.concerne) return '';
    if (i.erreur) return h('div', { class: 'cfg-msg err' }, 'Programme SIMPL : ' + i.erreur);
    return i.recompilation
      ? h('div', { class: 'cfg-msg err', onclick: () => aller('appareils') }, 'Ces modifications changent le programme SIMPL (' + i.fichiers.join(', ') + ') : régénérer puis recompiler dans SIMPL Windows avant d’envoyer au processeur. Voir « Appareils et envoi ».')
      : h('div', { class: 'cfg-msg info' }, 'Aucun effet sur le programme SIMPL : l’envoi aux écrans et le redémarrage du programme suffisent.');
  }
  function allerChemin(chemin) {
    const m = /^pieces\[(\d+)\]/.exec(chemin);
    if (m) { E.piece = +m[1]; return aller('pieces', chemin); }
    const racine = chemin.split(/[.[]/)[0];
    aller(sections().includes(racine) ? racine : 'meta', chemin);
  }
  function marquerErreurs() {
    document.querySelectorAll('#cfg-form .cfg-champ.erreur').forEach(e => e.classList.remove('erreur'));
    for (const x of E.verif.errors) {
      let p = x.path;
      while (p) {
        const el = document.querySelector(`#cfg-form [data-chemin="${CSS.escape(p)}"]`);
        if (el) { el.classList.add('erreur'); break; }
        p = p.replace(/(\.[^.[\]]+|\[\d+\])$/, '');
        if (!/[.[]/.test(p)) { const el2 = document.querySelector(`#cfg-form [data-chemin="${CSS.escape(p)}"]`); if (el2) el2.classList.add('erreur'); break; }
      }
    }
  }

  // ---------------------------------------------------------------- rendu générique piloté par le schéma
  function visible(s) { return E.voirPrevu || resoudre(s)['x-etat'] !== 'prevu'; }
  function ligne(cle, s, p, valeur, contenu, options = {}) {
    s = resoudre(s);
    const etat = s['x-etat'];
    const present = valeur !== undefined;
    const reinit = present && options.reinit !== false
      ? h('button', { class: 'cfg-x', title: 'Retirer cette clé (retour au comportement par défaut)', 'aria-label': 'Retirer ' + cle, onclick: () => { changer(p, undefined); rendre(); } }, '×') : null;
    return h('div', { class: 'cfg-champ' + (etat === 'prevu' ? ' prevu' : ''), 'data-chemin': cheminTexte(p) },
      h('div', { class: 'lib' }, options.titre || libelle(cle), badge(etat)),
      h('div', { class: 'cfg-val' }, contenu, options.requis ? null : reinit),
      s.description ? h('div', { class: 'aide' }, descSansEtat(s.description)) : null);
  }
  function entree(s, p, valeur, opts = {}) {
    s = resoudre(s);
    const t = types(s);
    if (s.enum) {
      return h('select', { 'aria-label': p.join('.'), onchange: e => changer(p, e.target.value === '' ? undefined : e.target.value) },
        (opts.requis && valeur !== undefined) ? null : h('option', { value: '' }, valeur === undefined ? '— (non défini)' : '— retirer —'),
        ...s.enum.map(v => h('option', { value: v, selected: v === valeur }, String(v))));
    }
    if (t.includes('boolean')) {
      const effectif = valeur === undefined ? s.default === true : valeur === true;
      return h('label', { class: 'cfg-bascule' }, h('input', { type: 'checkbox', checked: effectif, onchange: e => changer(p, e.target.checked) }),
        valeur === undefined ? (s.default === undefined ? 'non défini' : `par défaut : ${s.default ? 'oui' : 'non'}`) : valeur ? 'oui' : 'non');
    }
    if (t.includes('integer') || t.includes('number')) {
      const entier = t.includes('integer') && !t.includes('number');
      return h('input', { type: 'number', value: valeur ?? '', step: entier ? '1' : 'any', min: s.minimum, max: s.maximum, 'aria-label': p.join('.'),
        onchange: e => { const v = e.target.value; changer(p, v === '' ? (t.includes('null') ? null : undefined) : (entier ? parseInt(v, 10) : parseFloat(v))); } });
    }
    if (!opts.multi && !s.pattern && String(valeur ?? '').length > 40) return texteAuto({ 'aria-label': p.join('.'), maxlength: s.maxLength, style: 'width:min(100%,760px)' }, valeur, v => changer(p, v === '' && valeur === undefined ? undefined : v));
    if (opts.multi) return texteAuto({ 'aria-label': p.join('.'), maxlength: s.maxLength }, valeur, v => changer(p, v === '' && valeur === undefined ? undefined : v));
    return h('input', { type: 'text', value: valeur ?? '', 'aria-label': p.join('.'), maxlength: s.maxLength, placeholder: s.pattern ? 'format : ' + s.pattern.replace(/[\\^$]/g, '') : '',
      onchange: e => changer(p, e.target.value === '' && valeur === undefined ? undefined : e.target.value) });
  }
  // Listes de valeurs : cases à cocher quand les valeurs possibles sont connues
  function choixListe(s, p) {
    const it = resoudre(resoudre(s).items || {});
    const k = p[p.length - 1];
    if (it.enum) return it.enum.map(v => [v, v]);
    if (k === 'sources') return (E.config.sourcesAudioVideo || []).map(x => [x.id, `${x.id} · ${x.nom}`]);
    if (k === 'vitesses') return [[0, 'Auto'], [1, 'Faible'], [2, 'Moyen'], [3, 'Fort']];
    if (it.$ref === '#/definitions/idPiece' || resoudre(s).items?.$ref === '#/definitions/idPiece') return (E.config.pieces || []).map(x => [x.id, `${x.id} · ${x.nom || '(sans nom)'}`]);
    if (it.pattern === '^[a-z]{2}$' || (resoudre(s).items || {}).$ref === '#/definitions/langue') {
      const l = new Set(['fr', 'en', 'es', 'de', 'ru', ...Object.keys(E.config.traductions || {})]);
      return [...l].map(x => [x, x]);
    }
    return null;
  }
  function editeurListe(s, p, valeur) {
    s = resoudre(s);
    const it = resoudre(s.items || {});
    const choix = choixListe(s, p);
    if (choix) {
      const cur = Array.isArray(valeur) ? valeur : [];
      return h('div', { class: 'cfg-cases' }, ...choix.map(([v, lib]) => {
        const on = cur.includes(v);
        return h('label', { class: on ? 'on' : '' }, h('input', { type: 'checkbox', checked: on, onchange: e => {
          const n = (Array.isArray(lireChemin(E.config, p)) ? lireChemin(E.config, p) : []).filter(x => x !== v);
          if (e.target.checked) n.push(v);
          changer(p, n); e.target.parentNode.classList.toggle('on', e.target.checked);
        } }), lib);
      }));
    }
    const cur = Array.isArray(valeur) ? valeur : [];
    if (types(it).includes('object')) {
      return h('div', { class: 'cfg-liste' },
        ...cur.map((x, i) => h('div', { class: 'cfg-carte' },
          h('div', { class: 'cfg-carte-tete' }, `${i + 1}. ${x && x.nom ? x.nom : ''}`,
            h('button', { class: 'cfg-x', title: 'Supprimer', 'aria-label': 'Supprimer ' + (i + 1), onclick: () => { const n = clone(cur); n.splice(i, 1); changer(p, n); rendre(); } }, '×')),
          ...champsObjet(it, p.concat(i), x))),
        h('div', {}, h('button', { class: 'btn mini', onclick: () => { const n = clone(cur); n.push(modeleObjet(it, cur)); changer(p, n); rendre(); } }, '+ Ajouter')));
    }
    if (types(it).includes('array')) return editeurJson(s, p, valeur);
    // liste de textes / nombres : une ligne par élément
    const num = types(it).includes('integer') || types(it).includes('number');
    return h('div', { class: 'cfg-liste' },
      ...cur.map((x, i) => h('div', { class: 'cfg-ligne' },
        h('input', { type: num ? 'number' : 'text', value: x, 'aria-label': `${p.join('.')}[${i}]`, style: 'width:min(100%,420px)', onchange: e => { const n = clone(lireChemin(E.config, p) || []); n[i] = num ? +e.target.value : e.target.value; changer(p, n); } }),
        h('button', { class: 'cfg-x', title: 'Supprimer', 'aria-label': 'Supprimer la ligne ' + (i + 1), onclick: () => { const n = clone(cur); n.splice(i, 1); changer(p, n); rendre(); } }, '×'))),
      (s.maxItems === undefined || cur.length < s.maxItems) ? h('div', {}, h('button', { class: 'btn mini', onclick: () => { changer(p, cur.concat(num ? 0 : '')); rendre(); } }, '+ Ajouter')) : '');
  }
  function modeleObjet(it, voisins) {
    const o = {};
    for (const [k, s] of Object.entries(it.properties || {})) {
      const r = resoudre(s);
      if (!(it.required || []).includes(k)) continue;
      if (k === 'id') o.id = Math.max(0, ...voisins.map(v => v.id || 0)) + 1;
      else if (r.enum) o[k] = r.enum[0];
      else if (types(r).includes('boolean')) o[k] = false;
      else if (types(r).includes('integer') || types(r).includes('number')) o[k] = r.minimum || 0;
      else o[k] = '';
    }
    return o;
  }
  function editeurJson(s, p, valeur) {
    return h('textarea', { 'aria-label': p.join('.'), spellcheck: 'false', onchange: e => {
      const t = e.target.value.trim();
      if (!t) { changer(p, undefined); return; }
      try { changer(p, JSON.parse(t)); e.target.style.borderColor = ''; } catch (x) { e.target.style.borderColor = 'var(--red)'; info('JSON invalide : ' + x.message); }
    } }, valeur === undefined ? '' : JSON.stringify(valeur, null, 2));
  }
  function editeurDictionnaire(s, p, valeur) {
    const add = resoudre(s.additionalProperties || {});
    const cur = estObjet(valeur) ? valeur : {};
    const nouvelle = h('input', { type: 'text', placeholder: 'nouvelle clé', 'aria-label': 'Nouvelle clé', style: 'width:180px' });
    return h('div', { class: 'cfg-liste' },
      h('table', { class: 'cfg-table' }, h('tbody', {}, ...Object.entries(cur).map(([k, v]) => h('tr', {},
        h('td', { style: 'width:30%' }, k),
        h('td', {}, types(add).includes('object') ? editeurJson(add, p.concat(k), v) : entree(add, p.concat(k), v)),
        h('td', { style: 'width:48px' }, h('button', { class: 'cfg-x', 'aria-label': 'Supprimer ' + k, onclick: () => { changer(p.concat(k), undefined); rendre(); } }, '×')))))),
      h('div', { class: 'cfg-ligne' }, nouvelle, h('button', { class: 'btn mini', onclick: () => { const k = nouvelle.value.trim(); if (!k || k in cur) return; changer(p.concat(k), types(add).includes('object') ? {} : ''); rendre(); } }, '+ Ajouter')));
  }
  function editeurPeripheriques(s, p, valeur) {
    const [motif, sch] = Object.entries(s.patternProperties || {})[0] || [];
    const cur = estObjet(valeur) ? valeur : {};
    const cles = Object.keys(cur).filter(k => new RegExp(motif).test(k));
    const nouvelle = h('input', { type: 'text', placeholder: 'IP-ID (ex. 07)', maxlength: 2, 'aria-label': 'Nouvel IP-ID', style: 'width:130px' });
    const appareil = id => (E.appareils?.appareils || []).find(a => (a.ipId || '').toUpperCase() === id.toUpperCase());
    return h('div', { class: 'cfg-liste' },
      ...(cur.description ? [h('div', { class: 'cfg-info' }, cur.description)] : []),
      ...cles.map(k => h('div', { class: 'cfg-carte' },
        h('div', { class: 'cfg-carte-tete' }, `IP-ID ${k}${appareil(k) ? ' — ' + appareil(k).nom : ''}`,
          h('button', { class: 'cfg-x', 'aria-label': 'Supprimer ' + k, onclick: () => { changer(p.concat(k), undefined); rendre(); } }, '×')),
        ...champsObjet(resoudre(sch), p.concat(k), cur[k]))),
      h('div', { class: 'cfg-ligne' }, nouvelle, h('button', { class: 'btn mini', onclick: () => { const k = nouvelle.value.trim().toUpperCase(); if (!/^[0-9A-F]{2}$/.test(k) || k in cur) return; changer(p.concat(k), { nom: appareil(k)?.nom || '' }); rendre(); } }, '+ Ajouter un appareil')));
  }
  function champ(cle, s, p, valeur, opts = {}) {
    s = resoudre(s);
    if (!visible(s) && valeur === undefined) return null;
    const t = types(s);
    if (t.includes('object') && s.properties && !opts.plat) {
      if (s.patternProperties) return ligne(cle, s, p, valeur, editeurPeripheriques(s, p, valeur));
      return groupe(cle, s, p, valeur);
    }
    if (t.includes('object') && s.additionalProperties && typeof s.additionalProperties === 'object') return ligne(cle, s, p, valeur, editeurDictionnaire(s, p, valeur));
    if (t.includes('object')) return ligne(cle, s, p, valeur, editeurJson(s, p, valeur));
    if (t.includes('array')) return ligne(cle, s, p, valeur, editeurListe(s, p, valeur));
    if (s.anyOf) return ligne(cle, s, p, valeur, editeurJson(s, p, valeur));
    return ligne(cle, s, p, valeur, entree(s, p, valeur, { requis: opts.requis }), { requis: opts.requis });
  }
  function champsObjet(s, p, valeur) {
    s = resoudre(s);
    const v = estObjet(valeur) ? valeur : {};
    const sortie = [];
    for (const [k, ks] of Object.entries(s.properties || {})) {
      if (INFO.test(k)) continue;
      if (k === '$schema') continue;
      sortie.push(champ(k, ks, p.concat(k), v[k], { requis: (s.required || []).includes(k) }));
    }
    for (const [k, x] of Object.entries(v)) {
      if (s.properties && s.properties[k]) continue;
      if (s.patternProperties && Object.keys(s.patternProperties).some(m => new RegExp(m).test(k))) continue;
      if (INFO.test(k)) { if (typeof x === 'string') sortie.push(h('div', { class: 'cfg-info' }, x)); continue; }
      if (s.additionalProperties && typeof s.additionalProperties === 'object') continue;
      sortie.push(ligne(k, { description: 'Clé hors schéma : modifiable en JSON.' }, p.concat(k), x, editeurJson({}, p.concat(k), x)));
    }
    return sortie.filter(Boolean);
  }
  function groupe(cle, s, p, valeur) {
    s = resoudre(s);
    const contenu = champsObjet(s, p, valeur);
    if (!contenu.length) return null;
    return h('fieldset', { class: 'cfg-groupe' + (s['x-etat'] === 'prevu' ? ' prevu' : ''), 'data-chemin': cheminTexte(p) },
      h('legend', {}, libelle(cle), badge(s['x-etat'])),
      s.description ? h('div', { class: 'cfg-info', style: 'margin-top:0' }, descSansEtat(s.description)) : null,
      ...contenu);
  }

  // ---------------------------------------------------------------- pièces
  const PCT = v => Math.round((v || 0) / 655.35 * 10) / 10;
  const BRUT = pct => Math.max(0, Math.min(65535, Math.round(pct * 655.35)));
  function piecesSchema() { return resoudre(E.schema.properties.pieces.items); }
  function redimensionner(arr, n, remplissage) { const a = Array.isArray(arr) ? arr.slice(0, n) : []; while (a.length < n) a.push(typeof remplissage === 'function' ? remplissage(a.length) : remplissage); return a; }
  function nouvellePiece() {
    const ids = (E.config.pieces || []).map(p => p.id);
    const id = Math.max(0, ...ids) + 1;
    const d = E.config.valeursParDefaut || {};
    const sc = (d.scenesEclairage || ['OFF', '', '', '']).slice(0, 4);
    return { id, nom: '', icone: '🏠', actif: true, pilotages: {
      eclairages: { actif: true, scenes: { nombre: sc.length, noms: sc.map(() => ''), niveaux: sc.map(() => [0, 0, 0, 0]) }, circuits: { nombre: 4, noms: ['', '', '', ''] } },
      moteurs: { actif: false, nombre: 0, liste: [] },
      cvc: { actif: false, consigne: { min: 16, max: 28, pas: 0.5 } },
      controlesGeneraux: { actif: true },
      audioVideo: { actif: false, sources: [] } } };
  }
  function rendrePieces(form) {
    const pieces = E.config.pieces || [];
    if (E.piece >= pieces.length) E.piece = Math.max(0, pieces.length - 1);
    const i = E.piece, piece = pieces[i];
    const p = ['pieces', i];
    const choix = h('div', { class: 'cfg-piece-choix' }, h('span', { class: 'hint' }, 'Pièce :'),
      h('select', { 'aria-label': 'Pièce', onchange: e => { E.piece = +e.target.value; rendre(); } }, ...pieces.map((x, k) => h('option', { value: k, selected: k === i }, `${x.id} · ${x.nom || '(sans nom)'}`))));
    const actions = h('div', { class: 'row', style: 'margin-bottom:12px' },
      h('button', { class: 'btn mini', onclick: () => { const n = nouvellePiece(); changer(['pieces', pieces.length], n); E.piece = pieces.length - 1; rendre(); } }, '+ Nouvelle pièce'),
      piece ? h('button', { class: 'btn mini', onclick: () => { const n = clone(piece); n.id = Math.max(...pieces.map(x => x.id)) + 1; n.nom = (n.nom || '') + ' (copie)'; changer(['pieces', pieces.length], n); E.piece = pieces.length - 1; rendre(); } }, 'Dupliquer') : '',
      piece ? h('button', { class: 'btn mini danger', onclick: () => { if (!confirmerDeux('suppr-piece-' + i, `Supprimer la pièce ${piece.id} « ${piece.nom} » ?`)) return; const n = clone(pieces); n.splice(i, 1); changer(['pieces'], n); E.piece = Math.max(0, i - 1); rendre(); } }, 'Supprimer la pièce') : '');
    form.append(h('h2', {}, 'Pièces'), h('p', { class: 'intro' }, 'Chaque pièce : nom, icône, modules. Niveaux de scènes en % (0-100), convertis en 0-65535 dans le fichier. ' + (E.config.meta?.backend === 'simpl' ? 'Programme SIMPL : 15 pièces actives maximum, et tout changement de circuits, scènes, niveaux ou moteurs demande une recompilation.' : '')), choix, actions);
    if (!piece) { form.append(h('div', { class: 'cfg-alerte info' }, 'Aucune pièce.')); return; }
    const ps = piecesSchema();
    const generaux = h('fieldset', { class: 'cfg-groupe', 'data-chemin': cheminTexte(p) }, h('legend', {}, `Pièce ${piece.id}`));
    for (const k of ['id', 'nom', 'icone', 'actif', 'intersystem', 'niveau', 'plan3d', 'interface']) {
      if (ps.properties[k] && (k in piece || visible(ps.properties[k])) && !(k === 'plan3d' && !('plan3d' in piece)) && !(k === 'niveau' && !('niveau' in piece)) && !(k === 'intersystem' && !('intersystem' in piece))) {
        generaux.append(champ(k, ps.properties[k], p.concat(k), piece[k], { requis: (ps.required || []).includes(k) }) || '');
      }
    }
    for (const [k, x] of Object.entries(piece)) if (!ps.properties[k] && !INFO.test(k)) generaux.append(ligne(k, { description: 'Clé hors schéma.' }, p.concat(k), x, editeurJson({}, p.concat(k), x)));
    form.append(generaux);
    const pil = piece.pilotages || {};
    const pp = p.concat('pilotages');
    const pilS = resoudre(ps.properties.pilotages);
    form.append(moduleEclairage(pil.eclairages, pp.concat('eclairages'), resoudre(pilS.properties.eclairages)));
    form.append(moduleMoteurs(pil.moteurs, pp.concat('moteurs'), resoudre(pilS.properties.moteurs)));
    for (const k of ['cvc', 'audioVideo', 'controlesGeneraux', 'wellness']) {
      const g = groupe(k, pilS.properties[k], pp.concat(k), pil[k]);
      if (g) form.append(g);
    }
    for (const [k, x] of Object.entries(pil)) if (!pilS.properties[k]) form.append(ligne(k, { description: 'Module hors schéma.' }, pp.concat(k), x, editeurJson({}, pp.concat(k), x)));
  }
  function moduleEclairage(ecl, p, s) {
    ecl = ecl || {};
    const sc = ecl.scenes || {}, ci = ecl.circuits || {};
    const nS = sc.nombre || 0, nC = ci.nombre || 0;
    const g = h('fieldset', { class: 'cfg-groupe', 'data-chemin': cheminTexte(p) }, h('legend', {}, 'Éclairage'));
    g.append(champ('actif', s.properties.actif, p.concat('actif'), ecl.actif));
    const nb = (lib, cle, max, val, applique) => ligne(cle, { description: `0 à ${max}.` }, p.concat(cle, 'nombre'), val,
      h('input', { type: 'number', min: 0, max, step: 1, value: val ?? 0, 'aria-label': lib, onchange: e => { const n = Math.max(0, Math.min(max, parseInt(e.target.value || '0', 10))); applique(n); rendre(); } }), { titre: lib, reinit: false });
    g.append(nb('Nombre de scènes', 'scenes', 4, nS, n => {
      const o = clone(lireChemin(E.config, p) || {}); o.scenes = o.scenes || {};
      o.scenes.nombre = n; o.scenes.noms = redimensionner(o.scenes.noms, n, '');
      if (Array.isArray(o.scenes.niveaux) || n) o.scenes.niveaux = redimensionner(o.scenes.niveaux, n, () => new Array((o.circuits || {}).nombre || 0).fill(0));
      changer(p, o);
    }));
    g.append(nb('Nombre de circuits', 'circuits', 20, nC, n => {
      const o = clone(lireChemin(E.config, p) || {}); o.circuits = o.circuits || {};
      o.circuits.nombre = n; o.circuits.noms = redimensionner(o.circuits.noms, n, '');
      for (const k of ['type', 'lutron']) if (Array.isArray(o.circuits[k])) o.circuits[k] = redimensionner(o.circuits[k], n, '');
      if (Array.isArray(o.circuits.liste)) o.circuits.liste = redimensionner(o.circuits.liste, n, k => ({ nom: (o.circuits.noms || [])[k] || '' }));
      if (o.scenes && Array.isArray(o.scenes.niveaux)) o.scenes.niveaux = o.scenes.niveaux.map(r => redimensionner(r, n, 0));
      changer(p, o);
    }));
    // tableau circuits (lignes, nom en clair) × scènes (colonnes, 4 au plus)
    const defS = (E.config.valeursParDefaut || {}).scenesEclairage || [], defC = (E.config.valeursParDefaut || {}).circuits || [];
    const niveaux = sc.niveaux;
    const majNiveau = (r, c, pct) => {
      const base = lireChemin(E.config, p.concat('scenes', 'niveaux'));
      const m = Array.from({ length: nS }, (_, rr) => redimensionner(Array.isArray(base) ? base[rr] : [], nC, 0));
      m[r][c] = BRUT(Math.max(0, Math.min(100, parseFloat(pct || '0'))));
      changer(p.concat('scenes', 'niveaux'), m);
    };
    const tete = h('tr', {}, h('th', {}, 'Circuit \\ scène'), ...Array.from({ length: nS }, (_, r) => h('th', {},
      h('input', { type: 'text', value: (sc.noms || [])[r] || '', placeholder: defS[r] || `Scène ${r + 1}`, 'aria-label': `Nom de la scène ${r + 1}`, style: 'min-width:110px',
        onchange: e => { const n = redimensionner(lireChemin(E.config, p.concat('scenes', 'noms')), nS, ''); n[r] = e.target.value; changer(p.concat('scenes', 'noms'), n); } }))));
    const corps = Array.from({ length: nC }, (_, c) => h('tr', {},
      h('td', { style: 'min-width:240px' }, texteAuto({ placeholder: defC[c] || `Circuit ${c + 1}`, 'aria-label': `Nom du circuit ${c + 1}` }, (ci.noms || [])[c] || '',
        v => { const n = redimensionner(lireChemin(E.config, p.concat('circuits', 'noms')), nC, ''); n[c] = v; changer(p.concat('circuits', 'noms'), n); })),
      ...Array.from({ length: nS }, (_, r) => {
        const v = Array.isArray(niveaux) && Array.isArray(niveaux[r]) ? niveaux[r][c] : 0;
        if (v !== null && typeof v === 'object') return h('td', { title: JSON.stringify(v) }, 'couleur');
        return h('td', { 'data-chemin': cheminTexte(p.concat('scenes', 'niveaux', r)) }, h('input', { type: 'number', class: 'pct', min: 0, max: 100, step: 0.1, value: PCT(v), 'aria-label': `Niveau du circuit ${c + 1} dans la scène ${r + 1}, en %`,
          onchange: e => majNiveau(r, c, e.target.value) }), ' %');
      })));
    if (nS || nC) g.append(h('div', { class: 'cfg-champ large', 'data-chemin': cheminTexte(p.concat('scenes')) },
      h('div', { class: 'lib' }, 'Circuits et niveaux des scènes'),
      h('div', { class: 'cfg-val cfg-matrice' }, h('table', { class: 'cfg-table', style: 'width:auto' }, h('thead', {}, tete), h('tbody', {}, ...corps))),
      h('div', { class: 'aide' }, 'Nom vide = nom par défaut (en grisé). Niveaux en %, convertis en 0-65535 dans le fichier. Le programme SIMPL reprend le niveau d’un circuit dès qu’il le fait remonter.')));
    // circuits : détails v2 (commande, technologie…)
    const ciS = resoudre(s.properties.circuits);
    for (const k of ['type', 'lutron', 'liste']) if (ci[k] !== undefined || (k === 'liste' && E.voirPrevu)) g.append(champ(k, ciS.properties[k], p.concat('circuits', k), ci[k]) || '');
    return g;
  }
  function moduleMoteurs(mot, p, s) {
    mot = mot || {};
    const n = mot.nombre || 0;
    const g = h('fieldset', { class: 'cfg-groupe', 'data-chemin': cheminTexte(p) }, h('legend', {}, 'Moteurs'));
    g.append(champ('actif', s.properties.actif, p.concat('actif'), mot.actif));
    g.append(ligne('nombre', { description: '0 à 12. Liste plus courte : complétée par les valeurs par défaut.' }, p.concat('nombre'), n,
      h('input', { type: 'number', min: 0, max: 12, step: 1, value: n, 'aria-label': 'Nombre de moteurs', onchange: e => {
        const k = Math.max(0, Math.min(12, parseInt(e.target.value || '0', 10)));
        const o = clone(lireChemin(E.config, p) || {}); const def = (E.config.valeursParDefaut || {}).moteurs || [];
        o.nombre = k; o.liste = redimensionner(o.liste, k, j => clone(def[j] || { nom: `Moteur ${j + 1}`, type: 'volet', lamelles: false }));
        changer(p, o); rendre();
      } }), { titre: 'Nombre de moteurs', reinit: false }));
    const itS = resoudre(resoudre(s.properties.liste).items);
    const cols = Object.keys(itS.properties).filter(k => visible(itS.properties[k]) || (mot.liste || []).some(m => m && k in m));
    const liste = mot.liste || [];
    if (n) g.append(h('div', { class: 'cfg-champ large', 'data-chemin': cheminTexte(p.concat('liste')) },
      h('div', { class: 'lib' }, 'Liste des moteurs'),
      h('div', { class: 'cfg-val cfg-matrice' }, h('table', { class: 'cfg-table' },
        h('thead', {}, h('tr', {}, h('th', {}, '#'), ...cols.map(k => h('th', {}, libelle(k), badge(resoudre(itS.properties[k])['x-etat']))))),
        h('tbody', {}, ...Array.from({ length: n }, (_, j) => h('tr', { 'data-chemin': cheminTexte(p.concat('liste', j)) }, h('td', {}, j + 1),
          ...cols.map(k => h('td', {}, entree(itS.properties[k], p.concat('liste', j, k), (liste[j] || {})[k], { multi: true, requis: (itS.required || []).includes(k) })))))))),
      h('div', { class: 'aide' }, liste.length > n ? `${liste.length - n} moteur(s) décrit(s) au-delà du nombre : ignoré(s) par le GUI.` : '')));
    return g;
  }

  // ---------------------------------------------------------------- traductions
  function nomsAtraduire() {
    const c = E.config, noms = new Set();
    const add = x => { if (typeof x === 'string' && x.trim()) noms.add(x); };
    (c.pieces || []).forEach(p => {
      add(p.nom); const e = (p.pilotages || {}).eclairages || {};
      ((e.scenes || {}).noms || []).forEach(add); ((e.circuits || {}).noms || []).forEach(add);
      (((p.pilotages || {}).moteurs || {}).liste || []).forEach(m => add(m && m.nom));
    });
    (c.sourcesAudioVideo || []).forEach(s => add(s.nom));
    const d = c.valeursParDefaut || {}; (d.scenesEclairage || []).forEach(add); (d.circuits || []).forEach(add); (d.moteurs || []).forEach(m => add(m && m.nom));
    ((c.scenesStores || {}).noms || []).forEach(add);
    return noms;
  }
  let filtreTrad = '', seulementManquants = false;
  function rendreTraductions(form) {
    const tr = E.config.traductions || {};
    const langues = [...new Set([...Object.keys(tr), ...((E.config.interface || {}).langues || {}).disponibles || []])].filter(l => l !== (E.config.meta || {}).langueReference);
    const cles = new Set(nomsAtraduire()); Object.values(tr).forEach(t => Object.keys(t || {}).forEach(k => cles.add(k)));
    const utilises = nomsAtraduire();
    let lignes = [...cles].sort((a, b) => a.localeCompare(b, 'fr'));
    if (filtreTrad) lignes = lignes.filter(k => (k + ' ' + langues.map(l => (tr[l] || {})[k] || '').join(' ')).toLowerCase().includes(filtreTrad.toLowerCase()));
    if (seulementManquants) lignes = lignes.filter(k => langues.some(l => !(tr[l] || {})[k]));
    const manquants = [...utilises].reduce((n, k) => n + langues.filter(l => !(tr[l] || {})[k]).length, 0);
    form.append(h('h2', {}, 'Traductions'),
      h('p', { class: 'intro' }, `Noms écrits en « ${(E.config.meta || {}).langueReference || 'fr'} » dans le fichier → traduction par langue. ${manquants} traduction(s) manquante(s) pour les noms utilisés (surlignées). Clé inutilisée = grisée en italique.`),
      h('div', { class: 'row', style: 'margin-bottom:10px' },
        h('input', { type: 'text', class: 'cfg-recherche', placeholder: 'Filtrer…', value: filtreTrad, 'aria-label': 'Filtrer les traductions', oninput: e => { filtreTrad = e.target.value; const pos = e.target.selectionStart; rendre(); const n = $('#cfg-form .cfg-recherche'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } }),
        h('label', { class: 'cfg-bascule' }, h('input', { type: 'checkbox', checked: seulementManquants, onchange: e => { seulementManquants = e.target.checked; rendre(); } }), 'Seulement les manquantes')),
      h('div', { class: 'cfg-matrice', 'data-chemin': 'traductions' }, h('table', { class: 'cfg-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Nom'), ...langues.map(l => h('th', {}, l.toUpperCase())))),
        h('tbody', {}, ...lignes.slice(0, 400).map(k => h('tr', {},
          h('td', { style: utilises.has(k) ? '' : 'font-style:italic;color:#cbd5e1' }, k),
          ...langues.map(l => { const v = (tr[l] || {})[k]; return h('td', { class: !v && utilises.has(k) ? 'cfg-manque' : '' },
            texteAuto({ 'aria-label': `${k} en ${l}` }, v || '', x => changer(['traductions', l, k], x === '' ? undefined : x))); })))))),
      lignes.length > 400 ? h('p', { class: 'hint' }, `${lignes.length - 400} ligne(s) masquée(s) : filtrer.`) : '');
  }

  // ---------------------------------------------------------------- appareils et envoi
  const TYPES = [['processeur', 'Processeur'], ['ts', 'Écran tactile (TS)'], ['xpanel', 'XPanel'], ['mobile', 'Smartphone / tablette']];
  const etatsTest = {};
  let selection = null, simulation = true, rechargerSimpl = false;
  function rendreAppareils(form) {
    const liste = E.appareils.appareils;
    if (!selection) selection = new Set(liste.filter(a => a.type === 'processeur' || a.type === 'ts').map(a => a.id));
    const maj = (i, k, v) => { liste[i][k] = v; majBoutonsAppareils(); };
    const tbl = h('table', { class: 'cfg-table' },
      h('thead', {}, h('tr', {}, ...['Nom', 'Type', 'Modèle', 'Adresse IP', 'IP-ID', 'Empreinte SSH', 'Connexion', ''].map(t => h('th', {}, t)))),
      h('tbody', {}, ...liste.map((a, i) => {
        const t = etatsTest[a.id];
        return h('tr', {},
          h('td', {}, texteAuto({ 'aria-label': 'Nom' }, a.nom, v => maj(i, 'nom', v))),
          h('td', {}, h('select', { 'aria-label': 'Type', onchange: e => { maj(i, 'type', e.target.value); rendre(); } }, ...TYPES.map(([v, l]) => h('option', { value: v, selected: v === a.type }, l)))),
          h('td', { style: 'min-width:110px' }, texteAuto({ 'aria-label': 'Modèle', placeholder: 'CP4, TSW-1070…' }, a.modele || '', v => maj(i, 'modele', v))),
          h('td', { style: 'min-width:140px' }, h('input', { type: 'text', value: a.ip || '', 'aria-label': 'Adresse IP', placeholder: '192.168.1.10', onchange: e => maj(i, 'ip', e.target.value.trim()) })),
          h('td', { style: 'min-width:64px;width:64px' }, h('input', { type: 'text', value: a.ipId || '', maxlength: 2, 'aria-label': 'IP-ID', placeholder: '03', onchange: e => maj(i, 'ipId', e.target.value.trim().toUpperCase()) })),
          h('td', { style: 'min-width:130px' }, texteAuto({ 'aria-label': 'Empreinte SSH', placeholder: 'SHA256:…', style: 'word-break:break-all' }, a.cleHote || '', v => maj(i, 'cleHote', v.trim()))),
          h('td', { class: 'cfg-connexion' },
            t ? h('span', { title: t.detail || '' }, h('span', { class: 'cfg-point ' + (t.ok === undefined ? '' : t.ok ? 'ok' : 'ko') }), ' ', t.texte) : '',
            a.ip ? h('button', { class: 'btn mini', style: 'margin-left:6px', onclick: () => testerAppareil(a) }, 'Tester') : '',
            a.ip && (a.type === 'processeur' || a.type === 'ts') ? h('button', { class: 'btn mini', style: 'margin-left:6px', onclick: () => lireEmpreinte(a, i) }, 'Empreinte') : ''),
          h('td', {}, h('button', { class: 'cfg-x', 'aria-label': 'Supprimer ' + a.nom, onclick: () => { if (!confirmerDeux('suppr-app-' + a.id, `Retirer ${a.nom} de la liste ?`)) return; liste.splice(i, 1); selection.delete(a.id); rendre(); } }, '×')));
      })));
    form.append(h('h2', {}, 'Appareils et envoi'),
      h('p', { class: 'intro' }, 'Adresses des processeurs et écrans du projet (appareils.json, versionné, sans mot de passe : les identifiants restent dans deploy.secrets.psd1). L’empreinte SSH rend les transferts non interactifs : vérifier qu’elle est celle de l’appareil avant d’enregistrer.'),
      h('fieldset', { class: 'cfg-groupe' }, h('legend', {}, 'Appareils'),
        h('div', { class: 'cfg-matrice' }, tbl),
        h('div', { class: 'row', style: 'margin-top:10px' },
          h('button', { class: 'btn mini', onclick: () => { const n = liste.length + 1; let id = 'appareil-' + n; while (liste.some(a => a.id === id)) id += '-b'; liste.push({ id, nom: 'Nouvel appareil', type: 'ts', modele: '', ip: '', ipId: '', cleHote: '' }); rendre(); } }, '+ Ajouter un appareil'),
          h('button', { class: 'btn primary', id: 'cfg-app-enregistrer', onclick: enregistrerAppareils }, 'Enregistrer les appareils'),
          E.appareils.amorce ? h('span', { class: 'hint' }, 'Liste amorcée depuis deploy.secrets.psd1 : à compléter puis enregistrer.') : '')),
      blocSimpl(),
      blocEnvoi(liste));
    majBoutonsAppareils();
  }
  function majBoutonsAppareils() { const b = $('#cfg-app-enregistrer'); if (b) b.disabled = !appareilsModifies() && !E.appareils.amorce; }
  async function enregistrerAppareils() {
    const r = await fetch('/api/appareils', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(E.appareils) });
    const d = await r.json();
    if (!r.ok) { info(d.message); return false; }
    E.appareils = d; E.appareilsRef = JSON.stringify(d.appareils); info('appareils.json enregistré.'); rendre();
    return true;
  }
  async function testerAppareil(a) {
    etatsTest[a.id] = { texte: 'test…' }; rendre();
    try {
      const d = await (await fetch('/api/appareils/tester', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: a.ip }) })).json();
      const ports = [d.ssh && 'SSH', d.web && 'web', d.cip && 'CIP'].filter(Boolean);
      etatsTest[a.id] = { ok: d.joignable, texte: d.joignable ? ports.join(' · ') : 'injoignable', detail: `SSH 22 : ${d.ssh ? 'ouvert' : 'fermé'} · HTTPS 443 : ${d.web ? 'ouvert' : 'fermé'} · CIP 41794 : ${d.cip ? 'ouvert' : 'fermé'}` };
    } catch (e) { etatsTest[a.id] = { ok: false, texte: 'erreur' }; }
    rendre();
  }
  async function lireEmpreinte(a, i) {
    const d = await (await fetch('/api/appareils/empreinte', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: a.ip }) })).json();
    if (d.erreur) { info(`${a.nom} : ${d.erreur}.`); return; }
    const c = d.cles.find(x => /ED25519/i.test(x.type)) || d.cles[0];
    E.appareils.appareils[i].cleHote = c.empreinte;
    info(`${a.nom} : empreinte ${c.type} lue (${c.empreinte}). Comparer avec l’écran de l’appareil, puis « Enregistrer les appareils ».`);
    rendre();
  }
  function blocSimpl() {
    const s = E.simpl;
    if (!s || !s.concerne) return '';
    const imp = E.impact && E.impact.recompilation;
    const regenerer = h('button', { class: 'btn warn', onclick: async () => {
      if (modifie()) { info('Enregistrer d’abord la configuration.'); return; }
      const d = await (await fetch('/api/simpl/regenerer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).json();
      E.simpl = d.simpl; E.impact = null; info('Programme SIMPL régénéré dans simpl/direct. Ouvrir VillaCrans_Direct.smw dans SIMPL Windows et compiler (F12).'); rendre();
    } }, 'Régénérer le programme SIMPL');
    const date = s.lpz ? new Date(s.lpz).toLocaleString('fr-CH') : null;
    if (s.aJour && !imp && !s.aCompiler) return h('div', { class: 'cfg-alerte ok' }, `Programme SIMPL (simpl/direct) à jour avec la configuration enregistrée. Dernier .lpz compilé : ${date}.`);
    if (s.aJour && !imp) return h('div', { class: 'cfg-alerte info' }, h('b', {}, 'Compilation SIMPL à faire. '),
      `Le programme régénéré (simpl\\direct\\VillaCrans_Direct.smw) est plus récent que le .lpz${date ? ' du ' + date : ' (aucun .lpz trouvé)'} : l’ouvrir dans SIMPL Windows, F12, puis envoyer avec « Recharger le programme SIMPL » coché.`);
    return h('div', { class: 'cfg-alerte' },
      h('b', {}, 'Recompilation SIMPL requise. '),
      'Les réglages des pièces (circuits, scènes, niveaux, moteurs…) sont figés dans le programme SIMPL : l’envoi de la configuration ne les change pas sur le processeur. ',
      (s.ecarts || []).length ? `Fichiers à régénérer : ${s.ecarts.join(', ')}. ` : '',
      'Étapes : 1) Régénérer ; 2) ouvrir simpl\\direct\\VillaCrans_Direct.smw dans SIMPL Windows, F12 ; 3) envoyer avec « Recharger le programme SIMPL » coché.',
      h('div', { class: 'row' }, regenerer));
  }
  function blocEnvoi(liste) {
    const sortie = h('div', { class: 'cfg-term', id: 'cfg-envoi-sortie', role: 'log' }, 'Prêt.');
    const cases = liste.map(a => {
      const envoyable = a.type === 'processeur' || a.type === 'ts';
      const on = envoyable && selection.has(a.id);
      return h('label', { class: on ? 'on' : '', title: envoyable ? '' : 'XPanel et Crestron One : onglet Déploiement (le mot de passe SFTP y est demandé)' },
        h('input', { type: 'checkbox', checked: on, disabled: !envoyable || !a.ip, onchange: e => { e.target.checked ? selection.add(a.id) : selection.delete(a.id); e.target.parentNode.classList.toggle('on', e.target.checked); } }),
        `${a.nom}${a.ip ? ' · ' + a.ip : ''}${envoyable ? '' : ' (onglet Déploiement)'}`);
    });
    const simplOpt = E.config.meta?.backend === 'simpl'
      ? h('label', { class: 'cfg-bascule' }, h('input', { type: 'checkbox', checked: rechargerSimpl, onchange: e => { rechargerSimpl = e.target.checked; } }), 'Recharger aussi le programme SIMPL (.lpz) sur les processeurs') : '';
    return h('fieldset', { class: 'cfg-groupe' }, h('legend', {}, 'Envoyer'),
      h('div', { class: 'cfg-info', style: 'margin-top:0' }, 'Processeur : villa_config.json dans /user puis redémarrage du programme (progreset). Écran tactile : reconstruction du projet CH5 (la configuration y est embarquée), transfert puis rechargement (PROJECTLOAD). La configuration est enregistrée avant l’envoi.'),
      h('div', { class: 'cfg-cases', style: 'margin:8px 0' }, ...cases),
      h('div', { class: 'row' },
        h('label', { class: 'cfg-bascule' }, h('input', { type: 'checkbox', checked: simulation, onchange: e => { simulation = e.target.checked; $('#cfg-envoyer').textContent = simulation ? 'Simuler l’envoi' : 'Enregistrer et envoyer'; } }), 'Simulation (affiche les commandes sans rien envoyer)'),
        simplOpt),
      h('div', { class: 'row', style: 'margin:10px 0' }, h('button', { class: 'btn primary', id: 'cfg-envoyer', disabled: E.envoiEnCours, onclick: () => envoyer(sortie) }, simulation ? 'Simuler l’envoi' : 'Enregistrer et envoyer')),
      sortie);
  }
  async function envoyer(sortie) {
    if (E.envoiEnCours) return;
    if (E.verif.errors.length) { info('Corriger les erreurs avant l’envoi.'); return; }
    const ids = [...selection].filter(id => E.appareils.appareils.some(a => a.id === id && a.ip && (a.type === 'processeur' || a.type === 'ts')));
    if (!ids.length) { info('Cocher au moins un processeur ou un écran tactile.'); return; }
    if (appareilsModifies() && !(await enregistrerAppareils())) return;
    if (!simulation && modifie() && !(await enregistrer())) return;
    if (!simulation && E.impact && E.impact.recompilation && !rechargerSimpl) info('Rappel : les réglages des pièces modifiés n’atteindront le processeur qu’après recompilation SIMPL.');
    E.envoiEnCours = true;
    const bouton = $('#cfg-envoyer'); if (bouton) bouton.disabled = true;
    const out = $('#cfg-envoi-sortie') || sortie;
    out.textContent = simulation && modifie() ? '(Simulation : la configuration modifiée n’est pas enregistrée ; la simulation porte sur le fichier actuel.)\n' : '';
    try {
      const r = await fetch('/api/envoi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appareils: ids, simulation, rechargerSimpl }) });
      const lecteur = r.body.getReader(); const dec = new TextDecoder();
      for (;;) {
        const { value, done } = await lecteur.read();
        if (done) break;
        out.textContent += dec.decode(value, { stream: true }).replace(/\x1b\[[0-9;]*m/g, '');
        out.scrollTop = out.scrollHeight;
      }
    } catch (e) { out.textContent += '\nERREUR : ' + e.message; }
    E.envoiEnCours = false;
    const b2 = $('#cfg-envoyer'); if (b2) b2.disabled = false;
  }

  // ---------------------------------------------------------------- rendu de la section courante
  function rendre() {
    if (!E.charge) return;
    const form = $('#cfg-form');
    const haut = form.scrollTop;
    form.replaceChildren();
    const k = E.section;
    if (k === 'pieces') rendrePieces(form);
    else if (k === 'traductions') rendreTraductions(form);
    else if (k === 'appareils') rendreAppareils(form);
    else {
      const s = resoudre(E.schema.properties[k] || {});
      form.append(h('h2', {}, libelle(k), badge(s['x-etat'])));
      if (s.description) form.append(h('p', { class: 'intro' }, descSansEtat(s.description)));
      if (k === 'contrat') form.append(h('div', { class: 'cfg-alerte' }, 'Réservé au programmeur : toute modification du contrat doit être répercutée dans le programme SIMPL (et le C# en backend csharp). Voir docs/03_CONTRAT_JOINS.md.'));
      const v = E.config[k];
      if (types(s).includes('array')) form.append(champ(k, s, [k], v) || '');
      else if (s.properties) form.append(...champsObjet(s, [k], v));
      else form.append(ligne(k, s, [k], v, editeurJson(s, [k], v), { reinit: false }));
    }
    form.scrollTop = haut;
    rendreNav(); rendrePanneau(); marquerErreurs(); majEtat();
  }

  window.ConfigEditor = {
    ouvrir() { monter(); charger(false); },
    etat: () => E,
  };
})();

// Ouverture directe : http://localhost:8090/#config
const ouvrirSiAncre = () => { if (location.hash === '#config' && typeof window.showTab === 'function') window.showTab('config'); };
document.addEventListener('DOMContentLoaded', ouvrirSiAncre);
window.addEventListener('hashchange', ouvrirSiAncre);
