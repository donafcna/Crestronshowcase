#!/usr/bin/env node
/* Villa Crans v6.0 — programme SIMPL UNIQUE (slot 1), sans C#, généré depuis villa_config.json.
 *
 *   node simpl/direct/generate_simpl.js [--config ../../ch5/villa_config.json] [--out .]
 *
 * Produit dans simpl/direct/ :
 *   VillaCrans_Direct.smw        programme SIMPL Windows (CP4 + dalles + modules SIMPL+ + signaux)
 *   VillaPiece_Rnn.usp           un module SIMPL+ par pièce (logique + valeurs de la config, figées)
 *   VillaGlobal.usp              alarme, partitions, centralisation 401-411
 *   SIGNAUX.md                   table join -> signal pour l'équipe (Debugger, câblage des pilotes)
 *
 * Contrat S (villa_config.json > contrat.simplDirect) : chaque écran émet et reçoit les joins de la pièce
 * qu'il affiche sur le bloc de cette pièce, join = baseBloc + (id - 1) * tailleBloc + offset (626..2500).
 * Toutes les dalles partagent les MÊMES signaux (comme dans les programmes FTV : TSW + Crestron One d'une
 * même zone sur les mêmes handles) : un appui sur n'importe quel écran arrive sur R07_Scene1, un retour
 * R07_Scene1_fb s'affiche sur tous les écrans qui montrent la pièce 7.
 *
 * « Joins vides » (TV, audio, pilotes d'éclairage, de moteurs, CVC, alarme) : les modules SIMPL+ sortent
 * des signaux PILOTE_* et lisent des signaux RETOUR_* que l'équipe câble à ses modules habituels.
 *
 * Formats de symboles repris à l'identique de programmes FTV compilés (Hôtel des Horlogers PRO4 v9,
 * SIMPL 4.32) : TSW-770, XPanel 3.0 Crestron HTML5, Crestron One, SIMPL+ (SmC 103). La dalle 0x03 est
 * déclarée en TSW-770 : dans SIMPL, clic droit > Replace Device > TSW-1070 (les signaux sont conservés).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const HERE = __dirname;
const CONFIG = path.resolve(arg('--config', path.join(HERE, '..', '..', 'ch5', 'villa_config.json')));
const OUT = path.resolve(arg('--out', HERE));
const SOCLE = path.join(HERE, '_socle_cp4.smw');
const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const SD = cfg.contrat && cfg.contrat.simplDirect;
if (!SD) { console.error('contrat.simplDirect absent de ' + CONFIG); process.exit(1); }
const B = SD.baseBloc, T = SD.tailleBloc, PMAX = SD.pieceMax;
const MAPD = SD.mapping.digital, MAPA = SD.mapping.analog, MAPS = SD.mapping.serial;
const PIECES = (cfg.pieces || []).filter(p => p.id >= 1 && p.id <= PMAX);
const NC = 20, NM = 12;
const phys = (map, L, room) => { const o = map[String(L)]; if (o === undefined) throw new Error('join ' + L + ' hors mapping'); return B + (room - 1) * T + o; };
const pad2 = n => String(n).padStart(2, '0');
const ascii = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'et').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

/* =====================================================================================
 * 1. Module SIMPL+ de pièce : liste ordonnée des entrées / sorties (l'ordre fait l'index SIMPL)
 *    join : join LOGIQUE du GUI relié au port (d = digital, a = analogique, s = série)
 * ===================================================================================== */
const motorJ = (i, k) => (i <= 6 ? 81 + (i - 1) * 3 : 129 + (i - 7) * 3) + k;
const slatsJ = (i, k) => (i <= 6 ? 111 + (i - 1) * 3 : 157 + (i - 7) * 3) + k;
const arr = (n, f) => Array.from({ length: n }, (_, k) => f(k + 1));
const GLOB = ['Tout_Allumer', 'Tout_Eteindre', 'Eco', 'Stores_Ouvrir', 'Stores_Fermer', 'Stores_Inter', 'Confort', 'Nuit', 'HorsGel', 'Vacances'];
const GROUPES = ['Volets_Ouvrir', 'Volets_Demi', 'Volets_Fermer', 'Rideaux_Ouvrir', 'Rideaux_Demi', 'Rideaux_Fermer', 'Stores_Ouvrir', 'Stores_Demi', 'Stores_Fermer'];
// port : { n: nom SIMPL+, c: taille (tableau) ou 0, d: 'panel' | 'pilote' | 'retour' | 'global', j: (k) => join logique, sig: (k) => nom de signal sans préfixe }
const P = {
  din: [
    { n: 'Btn_Scene', c: 4, j: k => 50 + k, sig: k => 'Scene' + k },
    { n: 'Btn_Memoriser', c: 4, j: k => 430 + k, sig: k => 'Scene' + k + '_Memoriser' },
    { n: 'Btn_Consigne_Plus', j: () => 49, sig: () => 'Consigne_Plus' },
    { n: 'Btn_Consigne_Moins', j: () => 50, sig: () => 'Consigne_Moins' },
    { n: 'Btn_CVC_Marche', j: () => 610, sig: () => 'CVC_Marche' },
    { n: 'Btn_CVC_Arret', j: () => 611, sig: () => 'CVC_Arret' },
    { n: 'Btn_Ventilation', c: 4, j: k => 611 + k, sig: k => 'Ventilation' + (k - 1) },
    { n: 'Btn_Sauna_Marche', j: () => 620, sig: () => 'Sauna_Marche' },
    { n: 'Btn_Sauna_Arret', j: () => 621, sig: () => 'Sauna_Arret' },
    { n: 'Btn_Sauna_Plus', j: () => 622, sig: () => 'Sauna_Plus' },
    { n: 'Btn_Sauna_Moins', j: () => 623, sig: () => 'Sauna_Moins' },
    { n: 'Btn_Hammam_Marche', j: () => 624, sig: () => 'Hammam_Marche' },
    { n: 'Btn_Hammam_Arret', j: () => 625, sig: () => 'Hammam_Arret' },
    { n: 'Btn_Hammam_Plus', j: () => 626, sig: () => 'Hammam_Plus' },
    { n: 'Btn_Hammam_Moins', j: () => 627, sig: () => 'Hammam_Moins' },
    { n: 'Btn_Groupe', c: 9, j: k => 60 + k, sig: k => 'Groupe_' + GROUPES[k - 1] },
    { n: 'Btn_Monter', c: NM, j: k => motorJ(k, 0), sig: k => 'Moteur' + pad2(k) + '_Monter' },
    { n: 'Btn_Stop', c: NM, j: k => motorJ(k, 1), sig: k => 'Moteur' + pad2(k) + '_Stop' },
    { n: 'Btn_Descendre', c: NM, j: k => motorJ(k, 2), sig: k => 'Moteur' + pad2(k) + '_Descendre' },
    { n: 'Btn_Lam_Horaire', c: NM, j: k => slatsJ(k, 0), sig: k => 'Lamelles' + pad2(k) + '_Horaire' },
    { n: 'Btn_Lam_Stop', c: NM, j: k => slatsJ(k, 1), sig: k => 'Lamelles' + pad2(k) + '_Stop' },
    { n: 'Btn_Lam_Antihoraire', c: NM, j: k => slatsJ(k, 2), sig: k => 'Lamelles' + pad2(k) + '_Antihoraire' },
    { n: 'Btn_Scene_Stores', c: 4, j: k => 200 + k, sig: k => 'Scene_Stores' + k },
    { n: 'Btn_Source', c: 5, j: k => 149 + k, sig: k => 'Source' + (k - 1) },
    { n: 'Btn_Musique', j: () => 155, sig: () => 'Musique' },
    { n: 'Btn_Suivre_Video', j: () => 156, sig: () => 'Audio_Suit_Video' },
    { n: 'Btn_Mute', j: () => 55, sig: () => 'Mute' },
    { n: 'Btn_AV_Off', j: () => 200, sig: () => 'AV_Off' },
    { n: 'Btn_Media_Lecture', j: () => 251, sig: () => 'Media_LecturePause' },
    { n: 'Btn_Media_Suivant', j: () => 252, sig: () => 'Media_Suivant' },
    { n: 'Btn_Media_Precedent', j: () => 253, sig: () => 'Media_Precedent' },
    { n: 'G', c: GLOB.length, d: 'global', sig: k => 'CENTRAL_' + GLOB[k - 1] },
  ],
  // entrées analogiques ET série, dans l'ordre de déclaration (même famille d'index SIMPL)
  ain: [
    { n: 'In_Consigne', t: 'a', j: () => 31, sig: () => 'Consigne' },
    { n: 'In_Source', t: 'a', j: () => 51, sig: () => 'Source' },
    { n: 'In_Volume', t: 'a', j: () => 52, sig: () => 'Volume' },
    { n: 'In_Volume_Media', t: 'a', j: () => 254, sig: () => 'Volume_Media' },
    { n: 'In_Circuit', t: 'a', c: NC, j: k => 70 + k, sig: k => 'Circuit' + pad2(k) },
    { n: 'In_Ventilation', t: 'a', j: () => 61, sig: () => 'Ventilation' },
    { n: 'In_Sauna_Consigne', t: 'a', j: () => 62, sig: () => 'Sauna_Consigne' },
    { n: 'In_Hammam_Consigne', t: 'a', j: () => 63, sig: () => 'Hammam_Consigne' },
    { n: 'Retour_Circuit', t: 'a', c: NC, d: 'retour', sig: k => 'RETOUR_Circuit' + pad2(k) },
    { n: 'Retour_Temperature', t: 'a', d: 'retour', sig: () => 'RETOUR_Temperature' },
    { n: 'Retour_Sauna_Mesure', t: 'a', d: 'retour', sig: () => 'RETOUR_Sauna_Mesure' },
    { n: 'Retour_Hammam_Mesure', t: 'a', d: 'retour', sig: () => 'RETOUR_Hammam_Mesure' },
    { n: 'Retour_Mode$', t: 's', len: 40, d: 'retour', sig: () => 'RETOUR_CVC_Mode' },
  ],
  dout: [
    { n: 'Fb_Scene', c: 4, j: k => 50 + k, sig: k => 'Scene' + k + '_fb' },
    { n: 'Fb_Memorisee', c: 4, j: k => 420 + k, sig: k => 'Scene' + k + '_Memorisee_fb' },
    { n: 'Fb_CVC_Marche', j: () => 610, sig: () => 'CVC_Marche_fb' },
    { n: 'Fb_CVC_Arret', j: () => 611, sig: () => 'CVC_Arret_fb' },
    { n: 'Fb_Ventilation', c: 4, j: k => 611 + k, sig: k => 'Ventilation' + (k - 1) + '_fb' },
    { n: 'Fb_Sauna_Marche', j: () => 620, sig: () => 'Sauna_Marche_fb' },
    { n: 'Fb_Sauna_Arret', j: () => 621, sig: () => 'Sauna_Arret_fb' },
    { n: 'Fb_Hammam_Marche', j: () => 624, sig: () => 'Hammam_Marche_fb' },
    { n: 'Fb_Hammam_Arret', j: () => 625, sig: () => 'Hammam_Arret_fb' },
    { n: 'Fb_Scene_Stores', c: 4, j: k => 200 + k, sig: k => 'Scene_Stores' + k + '_fb' },
    { n: 'Fb_Source', c: 5, j: k => 149 + k, sig: k => 'Source' + (k - 1) + '_fb' },
    { n: 'Fb_Musique', j: () => 155, sig: () => 'Musique_fb' },
    { n: 'Fb_Suivre_Video', j: () => 156, sig: () => 'Audio_Suit_Video_fb' },
    { n: 'Fb_Mute', j: () => 55, sig: () => 'Mute_fb' },
    { n: 'Fb_AV_Off', j: () => 200, sig: () => 'AV_Off_fb' },
    { n: 'Pilote_Scene', c: 4, d: 'pilote', sig: k => 'PILOTE_Scene' + k },
    { n: 'Pilote_Monter', c: NM, d: 'pilote', sig: k => 'PILOTE_Moteur' + pad2(k) + '_Monter' },
    { n: 'Pilote_Stop', c: NM, d: 'pilote', sig: k => 'PILOTE_Moteur' + pad2(k) + '_Stop' },
    { n: 'Pilote_Descendre', c: NM, d: 'pilote', sig: k => 'PILOTE_Moteur' + pad2(k) + '_Descendre' },
    { n: 'Pilote_Lam_Horaire', c: NM, d: 'pilote', sig: k => 'PILOTE_Lamelles' + pad2(k) + '_Horaire' },
    { n: 'Pilote_Lam_Stop', c: NM, d: 'pilote', sig: k => 'PILOTE_Lamelles' + pad2(k) + '_Stop' },
    { n: 'Pilote_Lam_Antihoraire', c: NM, d: 'pilote', sig: k => 'PILOTE_Lamelles' + pad2(k) + '_Antihoraire' },
    { n: 'Pilote_Groupe', c: 9, d: 'pilote', sig: k => 'PILOTE_Groupe_' + GROUPES[k - 1] },
    { n: 'Pilote_Scene_Stores', c: 4, d: 'pilote', sig: k => 'PILOTE_Scene_Stores' + k },
    { n: 'Pilote_CVC_Marche', d: 'pilote', sig: () => 'PILOTE_CVC_Marche' },
    { n: 'Pilote_Sauna_Marche', d: 'pilote', sig: () => 'PILOTE_Sauna_Marche' },
    { n: 'Pilote_Hammam_Marche', d: 'pilote', sig: () => 'PILOTE_Hammam_Marche' },
    { n: 'Pilote_Mute', d: 'pilote', sig: () => 'PILOTE_Mute' },
    { n: 'Pilote_Musique', d: 'pilote', sig: () => 'PILOTE_Musique' },
    { n: 'Pilote_AV_Off', d: 'pilote', sig: () => 'PILOTE_AV_Off' },
    { n: 'Pilote_Media_Lecture', d: 'pilote', sig: () => 'PILOTE_Media_LecturePause' },
    { n: 'Pilote_Media_Suivant', d: 'pilote', sig: () => 'PILOTE_Media_Suivant' },
    { n: 'Pilote_Media_Precedent', d: 'pilote', sig: () => 'PILOTE_Media_Precedent' },
  ],
  aout: [
    { n: 'Fb_Consigne', t: 'a', j: () => 31, sig: () => 'Consigne_fb' },
    { n: 'Fb_Source_Active', t: 'a', j: () => 51, sig: () => 'Source_fb' },
    { n: 'Fb_Volume', t: 'a', j: () => 52, sig: () => 'Volume_fb' },
    { n: 'Fb_Source_Audio', t: 'a', j: () => 53, sig: () => 'Source_Audio_fb' },
    { n: 'Fb_Volume_Media', t: 'a', j: () => 254, sig: () => 'Volume_Media_fb' },
    { n: 'Fb_Circuit', t: 'a', c: NC, j: k => 70 + k, sig: k => 'Circuit' + pad2(k) + '_fb' },
    { n: 'Fb_Ventilation_A', t: 'a', j: () => 61, sig: () => 'Ventilation_fb' },
    { n: 'Fb_Sauna_Consigne', t: 'a', j: () => 62, sig: () => 'Sauna_Consigne_fb' },
    { n: 'Fb_Hammam_Consigne', t: 'a', j: () => 63, sig: () => 'Hammam_Consigne_fb' },
    { n: 'Fb_Sauna_Mesure', t: 'a', j: () => 64, sig: () => 'Sauna_Mesure_fb' },
    { n: 'Fb_Hammam_Mesure', t: 'a', j: () => 65, sig: () => 'Hammam_Mesure_fb' },
    { n: 'Pilote_Circuit', t: 'a', c: NC, d: 'pilote', sig: k => 'PILOTE_Circuit' + pad2(k) },
    { n: 'Pilote_Consigne', t: 'a', d: 'pilote', sig: () => 'PILOTE_Consigne' },
    { n: 'Pilote_Ventilation', t: 'a', d: 'pilote', sig: () => 'PILOTE_Ventilation' },
    { n: 'Pilote_Sauna_Consigne', t: 'a', d: 'pilote', sig: () => 'PILOTE_Sauna_Consigne' },
    { n: 'Pilote_Hammam_Consigne', t: 'a', d: 'pilote', sig: () => 'PILOTE_Hammam_Consigne' },
    { n: 'Pilote_Source', t: 'a', d: 'pilote', sig: () => 'PILOTE_Source' },
    { n: 'Pilote_Volume', t: 'a', d: 'pilote', sig: () => 'PILOTE_Volume' },
    { n: 'Pilote_Volume_Media', t: 'a', d: 'pilote', sig: () => 'PILOTE_Volume_Media' },
    { n: 'Txt_Temperature$', t: 's', j: () => 32, sig: () => 'Temperature_txt' },
    { n: 'Txt_Mode$', t: 's', j: () => 33, sig: () => 'CVC_Mode_txt' },
    { n: 'Txt_Consigne$', t: 's', j: () => 34, sig: () => 'Consigne_txt' },
    { n: 'Txt_Sauna_Consigne$', t: 's', j: () => 62, sig: () => 'Sauna_Consigne_txt' },
    { n: 'Txt_Hammam_Consigne$', t: 's', j: () => 63, sig: () => 'Hammam_Consigne_txt' },
    { n: 'Txt_Sauna_Mesure$', t: 's', j: () => 64, sig: () => 'Sauna_Mesure_txt' },
    { n: 'Txt_Hammam_Mesure$', t: 's', j: () => 65, sig: () => 'Hammam_Mesure_txt' },
  ],
};
// Déploie une liste de ports en entrées individuelles (index SIMPL 1..n dans l'ordre)
// SIMPL+ (erreur 1307) : dans une même famille d'E/S, tous les signaux simples avant les tableaux.
// L'ordre ainsi obtenu fait aussi les index du symbole dans le .smw (même liste pour les deux).
const scalarsFirst = list => list.filter(p => !p.c).concat(list.filter(p => p.c));
['din', 'ain', 'dout', 'aout'].forEach(k => { P[k] = scalarsFirst(P[k]); });
const flat = list => { const out = []; list.forEach(p => { const n = p.c || 1; for (let k = 1; k <= n; k++) out.push({ port: p, k, t: p.t || 'd', j: p.j ? p.j(k) : null, sig: p.sig(k), d: p.d || 'panel' }); }); return out; };
const RIN_D = flat(P.din), RIN_A = flat(P.ain), ROUT_D = flat(P.dout), ROUT_A = flat(P.aout);

/* ---------- Valeurs de config figées dans chaque module ---------- */
function pieceValues(p) {
  const pl = p.pilotages || {}, ecl = pl.eclairages || {}, mot = pl.moteurs || {}, cvc = pl.cvc || {};
  const nbC = Math.min(NC, (ecl.circuits && ecl.circuits.nombre) || 4);
  const niv = (ecl.scenes && ecl.scenes.niveaux) || [];
  const scenes = arr(4, s => arr(NC, c => (niv[s - 1] && niv[s - 1][c - 1] !== undefined && c <= nbC) ? Number(niv[s - 1][c - 1]) : (s === 1 ? 0 : 0)));
  const nbM = mot.actif === false ? 0 : Math.min(NM, mot.nombre || 6);
  const liste = mot.liste || (cfg.valeursParDefaut && cfg.valeursParDefaut.moteurs) || [];
  const types = arr(NM, i => { const t = (liste[i - 1] && liste[i - 1].type) || 'volet'; return i > nbM ? 0 : t === 'rideau' ? 2 : t === 'store' ? 3 : 1; });
  const cons = cvc.consigne || {};
  return { nbC, scenes, types, nbM, cmin: Math.round((cons.min || 16) * 10), cmax: Math.round((cons.max || 28) * 10),
    pas: Math.round((cons.pas || 0.5) * 10), marche: !(cvc.etatInitial && cvc.etatInitial.marche === false),
    vent: (cvc.etatInitial && cvc.etatInitial.ventilation) || 0 };
}
// Empreinte des valeurs par défaut : si la config change, les scènes NON mémorisées reprennent les nouveaux niveaux.
const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 65000; return h + 1; };

/* =====================================================================================
 * 2. Écriture des modules SIMPL+
 * ===================================================================================== */
function decl(kind, list) {
  const items = list.map(p => {
    if (kind === 'STRING_INPUT') return p.n + (p.c ? '[' + p.c + ']' : '') + '[' + (p.len || 40) + ']';
    return p.n + (p.c ? '[' + p.c + ']' : '');
  });
  const lines = []; let line = '';
  items.forEach((it, i) => { const piece = it + (i < items.length - 1 ? ', ' : ';'); if ((line + piece).length > 110) { lines.push(line); line = ''; } line += piece; });
  lines.push(line);
  return kind + ' ' + lines.join('\r\n    ');
}
// Ordre de déclaration = ordre des index : on regroupe par famille en respectant l'ordre de P.ain / P.aout.
function declSeq(list, kA, kS) {
  const out = []; let cur = null;
  list.forEach(p => { const k = p.t === 's' ? kS : kA; if (!cur || cur.k !== k) { cur = { k, items: [] }; out.push(cur); } cur.items.push(p); });
  return out.map(g => decl(g.k, g.items)).join('\r\n');
}

function roomUsp(p) {
  const v = pieceValues(p);
  const id = pad2(p.id);
  const sig = JSON.stringify(v.scenes) + '|' + v.nbC;
  const lines = [];
  const L = s => lines.push(s);
  L('/* Villa Crans v6.0 — module de la pièce ' + p.id + ' « ' + ascii(p.nom) + ' » (GÉNÉRÉ par simpl/direct/generate_simpl.js,');
  L('   ne pas modifier à la main : modifier villa_config.json puis relancer le générateur).');
  L('   Entrées Btn_* / In_* : appuis et valeurs des écrans (bloc de joins de la pièce, tous écrans confondus).');
  L('   Sorties Fb_* / Txt_* : retours vers les écrans. Pilote_* / Retour_* : à câbler aux pilotes réels (joins vides).');
  L('   G[1..10] : commandes de centralisation venant de VillaGlobal.usp. */');
  L('#SYMBOL_NAME "Villa Crans - Piece ' + id + ' ' + ascii(p.nom) + '"');
  L('#DEFAULT_VOLATILE');
  L('#ENABLE_STACK_CHECKING');
  L('#DEFINE_CONSTANT NBC ' + NC);
  L('#DEFINE_CONSTANT NBM ' + NM);
  L('#DEFINE_CONSTANT NB_CIRCUITS ' + v.nbC);
  L('#DEFINE_CONSTANT EMPREINTE ' + hash(sig));
  L('#DEFINE_CONSTANT CONS_MIN ' + v.cmin);
  L('#DEFINE_CONSTANT CONS_MAX ' + v.cmax);
  L('#DEFINE_CONSTANT CONS_PAS ' + v.pas);
  L('');
  L(decl('DIGITAL_INPUT', P.din));
  L(declSeq(P.ain, 'ANALOG_INPUT', 'STRING_INPUT'));
  L(decl('DIGITAL_OUTPUT', P.dout));
  L(declSeq(P.aout, 'ANALOG_OUTPUT', 'STRING_OUTPUT'));
  L('');
  L('NONVOLATILE INTEGER Initialise;');
  L('NONVOLATILE INTEGER Niveaux[4][NBC], Memorisee[4];');
  L('INTEGER SceneActive, Consigne, Marche, Vent, Source, Musique, Mute, Volume, VolumeMedia;');
  L('INTEGER SaunaOn, HammamOn, SaunaCons, HammamCons, SaunaMes, HammamMes, TempMes, TempRecue, SaunaRecue, HammamRecue, StoresScene;');
  L('INTEGER Niveau[NBC], TypeMoteur[NBM];');
  L('');
  L('FUNCTION DefautsScenes()');
  L('{');
  v.scenes.forEach((row, s) => row.forEach((x, c) => { if (c < v.nbC) L('    if (Memorisee[' + (s + 1) + '] = 0) Niveaux[' + (s + 1) + '][' + (c + 1) + '] = ' + x + ';'); }));
  L('}');
  L('');
  L('STRING_FUNCTION Texte10(INTEGER x)');
  L('{');
  L('    STRING t[16];');
  L('    MakeString(t, "%u.%u", x / 10, x MOD 10);');
  L('    return (t);');
  L('}');
  L('');
  L('FUNCTION MajCVC()');
  L('{');
  L('    STRING t[16];');
  L('    Fb_Consigne = Consigne;');
  L('    Pilote_Consigne = Consigne;');
  L('    Txt_Consigne$ = Texte10(Consigne);');
  L('    Fb_CVC_Marche = Marche;');
  L('    Fb_CVC_Arret = !Marche;');
  L('    Pilote_CVC_Marche = Marche;');
  L('    Fb_Ventilation_A = Vent;');
  L('    Pilote_Ventilation = Vent;');
  L('    Fb_Ventilation[1] = (Vent = 0); Fb_Ventilation[2] = (Vent = 1); Fb_Ventilation[3] = (Vent = 2); Fb_Ventilation[4] = (Vent = 3);');
  L('    if (TempRecue) { Txt_Temperature$ = Texte10(TempMes); } else { Txt_Temperature$ = "--"; }');
  L('    if (Len(Retour_Mode$) > 0) { Txt_Mode$ = Retour_Mode$; }');
  L('    else if (!Marche) { Txt_Mode$ = "ARRET"; }');
  L('    else if (TempRecue && (Consigne > TempMes)) { Txt_Mode$ = "CHAUFFAGE"; }');
  L('    else if (TempRecue) { Txt_Mode$ = "CLIMATISATION"; }');
  L('    else { Txt_Mode$ = ""; }');
  L('}');
  L('');
  L('FUNCTION MajWellness()');
  L('{');
  L('    STRING t[16];');
  L('    Fb_Sauna_Marche = SaunaOn; Fb_Sauna_Arret = !SaunaOn; Pilote_Sauna_Marche = SaunaOn;');
  L('    Fb_Hammam_Marche = HammamOn; Fb_Hammam_Arret = !HammamOn; Pilote_Hammam_Marche = HammamOn;');
  L('    Fb_Sauna_Consigne = SaunaCons; Pilote_Sauna_Consigne = SaunaCons; Txt_Sauna_Consigne$ = Texte10(SaunaCons);');
  L('    Fb_Hammam_Consigne = HammamCons; Pilote_Hammam_Consigne = HammamCons;');
  L('    MakeString(t, "%u", HammamCons); Txt_Hammam_Consigne$ = t;');
  L('    Fb_Sauna_Mesure = SaunaMes; Fb_Hammam_Mesure = HammamMes;');
  L('    if (SaunaRecue) { Txt_Sauna_Mesure$ = Texte10(SaunaMes); } else { Txt_Sauna_Mesure$ = "--"; }');
  L('    if (HammamRecue) { MakeString(t, "%u", HammamMes); Txt_Hammam_Mesure$ = t; } else { Txt_Hammam_Mesure$ = "--"; }');
  L('}');
  L('');
  L('FUNCTION MajAV()');
  L('{');
  L('    INTEGER i;');
  L('    for (i = 1 to 5) { Fb_Source[i] = (Source = (i - 1)); }');
  L('    Fb_Source_Active = Source; Pilote_Source = Source;');
  L('    Fb_Musique = Musique; Fb_Suivre_Video = !Musique; Pilote_Musique = Musique;');
  L('    if (Musique) { Fb_Source_Audio = 5; } else { Fb_Source_Audio = Source; }');
  L('    Fb_AV_Off = ((Source = 0) && (Musique = 0));');
  L('    Fb_Mute = Mute; Pilote_Mute = Mute;');
  L('    Fb_Volume = Volume; Pilote_Volume = Volume;');
  L('    Fb_Volume_Media = VolumeMedia; Pilote_Volume_Media = VolumeMedia;');
  L('}');
  L('');
  L('FUNCTION PoserCircuit(INTEGER c, INTEGER x)');
  L('{');
  L('    if ((c < 1) || (c > NBC)) return;');
  L('    Niveau[c] = x; Fb_Circuit[c] = x; Pilote_Circuit[c] = x;');
  L('}');
  L('');
  L('FUNCTION MajScenes()');
  L('{');
  L('    INTEGER s;');
  L('    for (s = 1 to 4) { Fb_Scene[s] = (SceneActive = s); Fb_Memorisee[s] = Memorisee[s]; }');
  L('}');
  L('');
  L('FUNCTION RappelScene(INTEGER s)');
  L('{');
  L('    INTEGER c;');
  L('    for (c = 1 to NB_CIRCUITS) { PoserCircuit(c, Niveaux[s][c]); }');
  L('    SceneActive = s; MajScenes();');
  L('    Pulse(30, Pilote_Scene[s]);');
  L('}');
  L('');
  L('FUNCTION TousMoteurs(INTEGER sens)');
  L('{');
  L('    INTEGER i;');
  L('    for (i = 1 to NBM)');
  L('    {');
  L('        if (TypeMoteur[i] > 0)');
  L('        {');
  L('            if (sens = 1) { Pulse(50, Pilote_Monter[i]); } else { Pulse(50, Pilote_Descendre[i]); }');
  L('        }');
  L('    }');
  L('}');
  L('');
  L('FUNCTION TousCircuits(INTEGER x)');
  L('{');
  L('    INTEGER c;');
  L('    for (c = 1 to NB_CIRCUITS) { PoserCircuit(c, x); }');
  L('    SceneActive = 0; MajScenes();');
  L('}');
  L('');
  L('/* ---------- Éclairage ---------- */');
  L('PUSH Btn_Scene { RappelScene(GetLastModifiedArrayIndex()); }');
  L('PUSH Btn_Memoriser');
  L('{');
  L('    INTEGER s, c;');
  L('    s = GetLastModifiedArrayIndex();');
  L('    for (c = 1 to NBC) { Niveaux[s][c] = Niveau[c]; }');
  L('    Memorisee[s] = 1; MajScenes();');
  L('}');
  L('CHANGE In_Circuit');
  L('{');
  L('    INTEGER c;');
  L('    c = GetLastModifiedArrayIndex();');
  L('    PoserCircuit(c, In_Circuit[c]);');
  L('    SceneActive = 0; MajScenes();');
  L('}');
  L('CHANGE Retour_Circuit');
  L('{');
  L('    INTEGER c;');
  L('    c = GetLastModifiedArrayIndex();');
  L('    Niveau[c] = Retour_Circuit[c]; Fb_Circuit[c] = Retour_Circuit[c];');
  L('}');
  L('');
  L('/* ---------- CVC ---------- */');
  L('PUSH Btn_Consigne_Plus { if (Consigne + CONS_PAS <= CONS_MAX) Consigne = Consigne + CONS_PAS; MajCVC(); }');
  L('PUSH Btn_Consigne_Moins { if (Consigne >= CONS_MIN + CONS_PAS) Consigne = Consigne - CONS_PAS; MajCVC(); }');
  L('CHANGE In_Consigne { if ((In_Consigne >= CONS_MIN) && (In_Consigne <= CONS_MAX)) { Consigne = In_Consigne; MajCVC(); } }');
  L('PUSH Btn_CVC_Marche { Marche = 1; MajCVC(); }');
  L('PUSH Btn_CVC_Arret { Marche = 0; MajCVC(); }');
  L('PUSH Btn_Ventilation { Vent = GetLastModifiedArrayIndex() - 1; MajCVC(); }');
  L('CHANGE In_Ventilation { if (In_Ventilation <= 3) { Vent = In_Ventilation; MajCVC(); } }');
  L('CHANGE Retour_Temperature { TempMes = Retour_Temperature; TempRecue = 1; MajCVC(); }');
  L('CHANGE Retour_Mode$ { MajCVC(); }');
  L('');
  L('/* ---------- Sauna / hammam ---------- */');
  L('PUSH Btn_Sauna_Marche { SaunaOn = 1; MajWellness(); }');
  L('PUSH Btn_Sauna_Arret { SaunaOn = 0; MajWellness(); }');
  L('PUSH Btn_Sauna_Plus { if (SaunaCons + 10 <= 1000) SaunaCons = SaunaCons + 10; MajWellness(); }');
  L('PUSH Btn_Sauna_Moins { if (SaunaCons >= 610) SaunaCons = SaunaCons - 10; MajWellness(); }');
  L('PUSH Btn_Hammam_Marche { HammamOn = 1; MajWellness(); }');
  L('PUSH Btn_Hammam_Arret { HammamOn = 0; MajWellness(); }');
  L('PUSH Btn_Hammam_Plus { if (HammamCons < 100) HammamCons = HammamCons + 1; MajWellness(); }');
  L('PUSH Btn_Hammam_Moins { if (HammamCons > 90) HammamCons = HammamCons - 1; MajWellness(); }');
  L('CHANGE In_Sauna_Consigne { if ((In_Sauna_Consigne >= 600) && (In_Sauna_Consigne <= 1000)) { SaunaCons = In_Sauna_Consigne; MajWellness(); } }');
  L('CHANGE In_Hammam_Consigne { if ((In_Hammam_Consigne >= 90) && (In_Hammam_Consigne <= 100)) { HammamCons = In_Hammam_Consigne; MajWellness(); } }');
  L('CHANGE Retour_Sauna_Mesure { SaunaMes = Retour_Sauna_Mesure; SaunaRecue = 1; MajWellness(); }');
  L('CHANGE Retour_Hammam_Mesure { HammamMes = Retour_Hammam_Mesure; HammamRecue = 1; MajWellness(); }');
  L('');
  L('/* ---------- Moteurs et lamelles : les appuis suivent le doigt, les groupes pulsent ---------- */');
  L('PUSH Btn_Monter { Pilote_Monter[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Monter { Pilote_Monter[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Stop { Pilote_Stop[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Stop { Pilote_Stop[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Descendre { Pilote_Descendre[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Descendre { Pilote_Descendre[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Lam_Horaire { Pilote_Lam_Horaire[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Lam_Horaire { Pilote_Lam_Horaire[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Lam_Stop { Pilote_Lam_Stop[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Lam_Stop { Pilote_Lam_Stop[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Lam_Antihoraire { Pilote_Lam_Antihoraire[GetLastModifiedArrayIndex()] = 1; }');
  L('RELEASE Btn_Lam_Antihoraire { Pilote_Lam_Antihoraire[GetLastModifiedArrayIndex()] = 0; }');
  L('PUSH Btn_Groupe');
  L('{');
  L('    INTEGER g, famille, action, i;');
  L('    g = GetLastModifiedArrayIndex();');
  L('    famille = ((g - 1) / 3) + 1;      // 1 volets, 2 rideaux, 3 stores');
  L('    action = ((g - 1) MOD 3) + 1;     // 1 ouvrir, 2 demi, 3 fermer');
  L('    Pulse(50, Pilote_Groupe[g]);');
  L('    for (i = 1 to NBM)');
  L('    {');
  L('        if (TypeMoteur[i] = famille)');
  L('        {');
  L('            if (action = 1) { Pulse(50, Pilote_Monter[i]); }');
  L('            else if (action = 3) { Pulse(50, Pilote_Descendre[i]); }');
  L('        }');
  L('    }');
  L('}');
  L('PUSH Btn_Scene_Stores');
  L('{');
  L('    INTEGER i;');
  L('    StoresScene = GetLastModifiedArrayIndex();');
  L('    for (i = 1 to 4) { Fb_Scene_Stores[i] = (StoresScene = i); }');
  L('    Pulse(50, Pilote_Scene_Stores[StoresScene]);');
  L('}');
  L('');
  L('/* ---------- Audio / vidéo (sorties vers les modules TV / audio de l\'équipe) ---------- */');
  L('PUSH Btn_Source { Source = GetLastModifiedArrayIndex() - 1; if (Source = 0) Musique = 0; MajAV(); }');
  L('CHANGE In_Source { if (In_Source <= 4) { Source = In_Source; if (Source = 0) Musique = 0; MajAV(); } }');
  L('PUSH Btn_Musique { Musique = 1; MajAV(); }');
  L('PUSH Btn_Suivre_Video { Musique = 0; MajAV(); }');
  L('PUSH Btn_Mute { Mute = !Mute; MajAV(); }');
  L('PUSH Btn_AV_Off { Source = 0; Musique = 0; MajAV(); Pulse(50, Pilote_AV_Off); }');
  L('CHANGE In_Volume { Volume = In_Volume; MajAV(); }');
  L('CHANGE In_Volume_Media { VolumeMedia = In_Volume_Media; MajAV(); }');
  L('PUSH Btn_Media_Lecture { Pulse(20, Pilote_Media_Lecture); }');
  L('PUSH Btn_Media_Suivant { Pulse(20, Pilote_Media_Suivant); }');
  L('PUSH Btn_Media_Precedent { Pulse(20, Pilote_Media_Precedent); }');
  L('');
  L('/* ---------- Centralisation (VillaGlobal.usp) ---------- */');
  L('PUSH G');
  L('{');
  L('    INTEGER g;');
  L('    g = GetLastModifiedArrayIndex();');
  L('    if (g = 1) { TousCircuits(65535); }');
  L('    else if (g = 2) { TousCircuits(0); }');
  L('    else if (g = 3) { TousCircuits(32768); }');
  L('    else if (g = 4) { TousMoteurs(1); }');
  L('    else if (g = 5) { TousMoteurs(0); }');
  L('    else if (g = 7) { Consigne = 210; Marche = 1; MajCVC(); }');
  L('    else if (g = 8) { Consigne = 180; Marche = 1; MajCVC(); }');
  L('    else if (g = 9) { Consigne = 120; Marche = 1; MajCVC(); }');
  L('    else if (g = 10) { Consigne = 120; Marche = 1; MajCVC(); TousCircuits(0); TousMoteurs(0); }');
  L('}');
  L('');
  L('FUNCTION Main()');
  L('{');
  L('    INTEGER s;');
  v.types.forEach((t, i) => L('    TypeMoteur[' + (i + 1) + '] = ' + t + ';'));
  L('    WaitForInitializationComplete();');
  L('    if (Initialise <> EMPREINTE) { DefautsScenes(); Initialise = EMPREINTE; }');
  L('    Consigne = ' + Math.max(v.cmin, Math.min(v.cmax, 210)) + '; Marche = ' + (v.marche ? 1 : 0) + '; Vent = ' + v.vent + ';');
  L('    SaunaCons = 800; HammamCons = 95;');
  L('    MajScenes(); MajCVC(); MajWellness(); MajAV();');
  L('}');
  return lines.join('\r\n') + '\r\n';
}

/* ---------- Module global : alarme, partitions, centralisation ---------- */
const G_IN_D = [
  { n: 'Btn_Armer', j: () => 41, sig: () => 'ALARME_Armer' },
  { n: 'Btn_Desarmer', j: () => 42, sig: () => 'ALARME_Desarmer' },
  { n: 'Btn_Code_Efface', j: () => 46, sig: () => 'ALARME_Code_Efface' },
  { n: 'Btn_Partition', c: 12, j: k => 300 + k, sig: k => 'ALARME_Partition' + (Math.floor((k - 1) / 3) + 1) + '_' + ['Armer', 'Partiel', 'Desarmer'][(k - 1) % 3] },
  { n: 'Btn_Central', c: 11, j: k => 400 + k, sig: k => 'CENTRAL_Btn_' + ['ToutAllumer', 'ToutEteindre', 'Eco', 'StoresOuvrir', 'StoresFermer', 'StoresInter', 'Confort', 'Nuit', 'HorsGel', 'VacancesOn', 'VacancesOff'][k - 1] },
  { n: 'Retour_Code_Accepte', d: 'retour', sig: () => 'RETOUR_ALARME_Code_Accepte' },
  { n: 'Retour_Code_Refuse', d: 'retour', sig: () => 'RETOUR_ALARME_Code_Refuse' },
];
const G_IN_A = [{ n: 'In_Code$', t: 's', len: 20, j: () => 43, sig: () => 'ALARME_Code_Saisi' }];
const G_OUT_D = [
  { n: 'Fb_Armer', j: () => 41, sig: () => 'ALARME_Armer_fb' },
  { n: 'Fb_Desarmer', j: () => 42, sig: () => 'ALARME_Desarmer_fb' },
  { n: 'Fb_Code_Valide', j: () => 44, sig: () => 'ALARME_Code_Valide' },
  { n: 'Fb_Code_Refuse', j: () => 45, sig: () => 'ALARME_Code_Refuse' },
  { n: 'Fb_Partition', c: 12, j: k => 300 + k, sig: k => 'ALARME_Partition' + (Math.floor((k - 1) / 3) + 1) + '_' + ['Armer', 'Partiel', 'Desarmer'][(k - 1) % 3] + '_fb' },
  { n: 'Fb_Central', c: 11, j: k => 400 + k, sig: k => 'CENTRAL_Btn_' + ['ToutAllumer', 'ToutEteindre', 'Eco', 'StoresOuvrir', 'StoresFermer', 'StoresInter', 'Confort', 'Nuit', 'HorsGel', 'VacancesOn', 'VacancesOff'][k - 1] + '_fb' },
  { n: 'G', c: GLOB.length, d: 'global', sig: k => 'CENTRAL_' + GLOB[k - 1] },
  { n: 'Pilote_Armer', d: 'pilote', sig: () => 'PILOTE_ALARME_Armer' },
  { n: 'Pilote_Desarmer', d: 'pilote', sig: () => 'PILOTE_ALARME_Desarmer' },
  { n: 'Pilote_Partition', c: 12, d: 'pilote', sig: k => 'PILOTE_ALARME_Partition' + (Math.floor((k - 1) / 3) + 1) + '_' + ['Armer', 'Partiel', 'Desarmer'][(k - 1) % 3] },
];
const G_OUT_A = [{ n: 'Pilote_Code$', t: 's', d: 'pilote', sig: () => 'PILOTE_ALARME_Code' }];
[G_IN_D, G_IN_A, G_OUT_D, G_OUT_A].forEach(l => { const o = scalarsFirst(l); l.length = 0; o.forEach(x => l.push(x)); });
const GIN_D = flat(G_IN_D), GIN_A = flat(G_IN_A), GOUT_D = flat(G_OUT_D), GOUT_A = flat(G_OUT_A);

function globalUsp() {
  const code = String((cfg.contrat.alarme && cfg.contrat.alarme.codeParDefaut) || '').replace(/[^0-9]/g, '');
  const delai = Math.round(((cfg.contrat.alarme && cfg.contrat.alarme.delaiReponseCentraleMs) || 1200) / 10);
  const L = [];
  L.push('/* Villa Crans v6.0 — module global (GÉNÉRÉ par simpl/direct/generate_simpl.js). Alarme : le code saisi part');
  L.push('   sur PILOTE_ALARME_Code ; la centrale répond par RETOUR_ALARME_Code_Accepte / _Refuse. Sans réponse dans le délai');
  L.push('   de contrat.alarme.delaiReponseCentraleMs, repli local sur contrat.alarme.codeParDefaut (vide = refus).');
  L.push('   Centralisation 401-411 : retours en interlock par famille, et commandes G[1..10] vers tous les modules de pièce. */');
  L.push('#SYMBOL_NAME "Villa Crans - Global"');
  L.push('#DEFAULT_VOLATILE');
  L.push('#ENABLE_STACK_CHECKING');
  L.push('#DEFINE_CONSTANT DELAI ' + delai);
  L.push('');
  L.push(decl('DIGITAL_INPUT', G_IN_D));
  L.push(declSeq(G_IN_A, 'ANALOG_INPUT', 'STRING_INPUT'));
  L.push(decl('DIGITAL_OUTPUT', G_OUT_D));
  L.push(declSeq(G_OUT_A, 'ANALOG_OUTPUT', 'STRING_OUTPUT'));
  L.push('');
  L.push('STRING Saisie[20];');
  L.push('INTEGER Arme, Attente, Vacances;');
  L.push('NONVOLATILE INTEGER EtatPartition[4];');
  L.push('');
  L.push('FUNCTION MajAlarme()');
  L.push('{');
  L.push('    INTEGER p;');
  L.push('    Fb_Armer = Arme; Fb_Desarmer = !Arme;');
  L.push('    for (p = 1 to 4) { Fb_Partition[(p - 1) * 3 + 1] = (EtatPartition[p] = 1); Fb_Partition[(p - 1) * 3 + 2] = (EtatPartition[p] = 2); Fb_Partition[(p - 1) * 3 + 3] = (EtatPartition[p] = 0); }');
  L.push('}');
  L.push('CHANGE In_Code$');
  L.push('{');
  L.push('    Saisie = In_Code$;');
  L.push('    if (Len(Saisie) = 0) return;');
  L.push('    Pilote_Code$ = Saisie;');
  L.push('    Attente = 1;');
  L.push('    Wait(DELAI, Repli) { if (Attente) { Attente = 0; ' + (code ? 'if (Saisie = "' + code + '") { Pulse(50, Fb_Code_Valide); } else { Pulse(50, Fb_Code_Refuse); }' : 'Pulse(50, Fb_Code_Refuse);') + ' } }');
  L.push('}');
  L.push('PUSH Retour_Code_Accepte { if (Attente) { Attente = 0; CancelWait(Repli); Pulse(50, Fb_Code_Valide); } }');
  L.push('PUSH Retour_Code_Refuse { if (Attente) { Attente = 0; CancelWait(Repli); Pulse(50, Fb_Code_Refuse); } }');
  L.push('PUSH Btn_Code_Efface { Saisie = ""; }');
  L.push('PUSH Btn_Armer { Arme = 1; MajAlarme(); Pulse(50, Pilote_Armer); }');
  L.push('PUSH Btn_Desarmer { Arme = 0; MajAlarme(); Pulse(50, Pilote_Desarmer); }');
  L.push('PUSH Btn_Partition');
  L.push('{');
  L.push('    INTEGER k, p, a;');
  L.push('    k = GetLastModifiedArrayIndex(); p = ((k - 1) / 3) + 1; a = ((k - 1) MOD 3);');
  L.push('    if (a = 0) { EtatPartition[p] = 1; } else if (a = 1) { EtatPartition[p] = 2; } else { EtatPartition[p] = 0; }');
  L.push('    MajAlarme(); Pulse(50, Pilote_Partition[k]);');
  L.push('}');
  L.push('PUSH Btn_Central');
  L.push('{');
  L.push('    INTEGER k, i, deb, fin;');
  L.push('    k = GetLastModifiedArrayIndex();');
  L.push('    if (k <= 9)');
  L.push('    {');
  L.push('        deb = (((k - 1) / 3) * 3) + 1; fin = deb + 2;');
  L.push('        for (i = deb to fin) { Fb_Central[i] = (i = k); }');
  L.push('        Pulse(50, G[k]);');
  L.push('    }');
  L.push('    else if (k = 10) { Vacances = 1; Fb_Central[10] = 1; Fb_Central[11] = 0; Pulse(50, G[10]); }');
  L.push('    else { Vacances = 0; Fb_Central[10] = 0; Fb_Central[11] = 1; }');
  L.push('}');
  L.push('FUNCTION Main()');
  L.push('{');
  L.push('    WaitForInitializationComplete();');
  L.push('    Arme = 0; Vacances = 0; Fb_Central[11] = 1; MajAlarme();');
  L.push('}');
  return L.join('\r\n') + '\r\n';
}

/* =====================================================================================
 * 3. Programme SIMPL Windows (.smw)
 * ===================================================================================== */
const raw = fs.readFileSync(SOCLE, 'latin1').replace(/\r\n/g, '\n');
let objs = [];
{
  const re = /\[\n([\s\S]*?)\n\]/g; let m;
  while ((m = re.exec(raw))) objs.push(m[1].split('\n'));
}
const get = (o, k) => { const l = o.find(x => x.startsWith(k + '=')); return l ? l.slice(k.length + 1) : undefined; };
const set = (o, k, v) => { const i = o.findIndex(x => x.startsWith(k + '=')); if (i >= 0) o[i] = k + '=' + v; else o.push(k + '=' + v); };
const del = (o, k) => { const i = o.findIndex(x => x.startsWith(k + '=')); if (i >= 0) o.splice(i, 1); };
const tp = o => get(o, 'ObjTp');
const findH = (t, h) => objs.find(o => tp(o) === t && get(o, 'H') === String(h));
const maxH = t => Math.max(0, ...objs.filter(o => tp(o) === t).map(o => parseInt(String(get(o, 'H') || '0').split(/[.,]/).pop(), 10) || 0));

// 3a. Retrait de l'EISC du socle (plus de slot 2 ni de C#)
{
  const eisc = objs.find(o => tp(o) === 'Dv' && get(o, 'Nm') === 'Ethernet Intersystem Communications (Packed)');
  if (eisc) {
    const dvh = get(eisc, 'H'), smh = get(eisc, 'SmH');
    objs = objs.filter(o => !(
      (tp(o) === 'Dv' && get(o, 'H') === dvh) || (tp(o) === 'Sm' && get(o, 'H') === smh) ||
      (['Db', 'Cs', 'Et'].includes(tp(o)) && get(o, 'DvH') === dvh) || (tp(o) === 'Bw' && get(o, 'SH') === smh)));
    const slot = objs.find(o => tp(o) === 'Dv' && get(o, 'C1') === dvh);
    if (slot) { del(slot, 'mC'); del(slot, 'C1'); }
    const eth = findH('Sm', 7);
    if (eth) { const cs = []; for (let i = 1; get(eth, 'C' + i) !== undefined; i++) { if (get(eth, 'C' + i) !== smh) cs.push(get(eth, 'C' + i)); del(eth, 'C' + i); } del(eth, 'mC'); if (cs.length) { set(eth, 'mC', cs.length); cs.forEach((c, i) => set(eth, 'C' + (i + 1), c)); } }
  }
}
// 3b. En-tête
{
  const hd = objs.find(o => tp(o) === 'Hd');
  set(hd, 'PrNm', 'VillaCrans_Direct.smw'); set(hd, 'CltNm', 'VillaCrans'); set(hd, 'PIT', 'VillaCrans_Direct'); // Program ID Tag : 20 caractères max (SIMPL Windows)
}

// 3c. Signaux
const SIG = new Map(); let nextSg = Math.max(20, maxH('Sg')) + 1;
const SGTP = { d: undefined, a: 2, s: 4 };
function sg(name, t) {
  if (name.length > 60) name = name.slice(0, 60);
  if (SIG.has(name)) { const e = SIG.get(name); if (e.t !== t) throw new Error('signal ' + name + ' : types ' + e.t + '/' + t); return e.h; }
  const h = nextSg++; SIG.set(name, { h, t }); return h;
}

// 3d. Dalles
const PANELS = [{ ip: 0x03, kind: 'tsw', nom: 'Dalle TSW-1070 (salon)' }, { ip: 0x04, kind: 'xpanel', nom: 'XPanel' },
  { ip: 0x05, kind: 'one', nom: 'iPad Crestron One' }, { ip: 0x06, kind: 'one', nom: 'iPhone Crestron One' }]
  .concat(PIECES.map(p => ({ ip: 0x10 + p.id, kind: 'xpanel', nom: 'QR ' + ascii(p.nom) })));
const KINDS = {
  tsw: { DvC: 6393, SmC: 6838, Nm: 'TSW-770', ObjVer: 4, RelStat: 'Beta', nD: 2511, nA: 2510, nS: 2511, nSO: 390, Mdl: 'TSW-770', Tpe: '7" Touch Screen',
    child: { DvC: 6394, SmC: 6839, Nm: 'TSW-770 Buttons', RelStat: 'Release', sm: ['n1I=6', 'n1O=6', 'Cmn1=TSW-770 Buttons', 'mI=6', 'mO=6', 'tO=6'] } },
  xpanel: { DvC: 8890, SmC: 7140, Nm: 'XPanel 3.0 Crestron HTML5', ObjVer: 1, RelStat: 'Beta', nD: 2539, nA: 2539, nS: 2539, nSO: 390, Mdl: 'XPanel 3.0 Crestron HTML5', Tpe: 'HTML5 XPanel 3.0' },
  one: { DvC: 16456, SmC: 16459, Nm: 'Crestron One', ObjVer: 1, RelStat: 'Ignore', nD: 2511, nA: 2510, nS: 2511, nSO: 390, Mdl: 'Crestron One', Tpe: 'Crestron One',
    child: { DvC: 16457, SmC: 16460, Nm: 'Project Name', SmNm: 'Crestron One Project Name', RelStat: 'Ignore', noSmVr: false, sm: ['Cmn1=Project Name', 'mP=1', 'P1=villaftv'] } },
};

// Connexions communes à toutes les dalles : { dir: 'I'|'O', t, join, sig }
const PANEL_IO = [];
const prefix = p => 'R' + pad2(p.id) + '_';
PIECES.forEach(p => {
  const pre = prefix(p);
  const add = (list, dir) => list.forEach(e => {
    if (e.d !== 'panel' || e.j === null) return;
    const map = e.t === 'd' ? MAPD : e.t === 'a' ? MAPA : MAPS;
    if (map[String(e.j)] === undefined) return;               // ex. série 10 (nom de pièce) : le GUI a ses noms
    PANEL_IO.push({ dir, t: e.t, join: phys(map, e.j, p.id), sig: pre + e.sig });
  });
  add(RIN_D, 'O'); add(RIN_A, 'O'); add(ROUT_D, 'I'); add(ROUT_A, 'I');
});
[[GIN_D, 'O'], [GIN_A, 'O'], [GOUT_D, 'I'], [GOUT_A, 'I']].forEach(([list, dir]) => list.forEach(e => {
  if (e.d !== 'panel' || e.j === null) return;
  PANEL_IO.push({ dir, t: e.t, join: e.j, sig: e.sig });
}));
// Télécommandes (joins vides) + pièce émettrice
const REM = [['AppleTV', 211, ['Haut', 'Bas', 'Gauche', 'Droite', 'Select', 'Retour', 'Accueil', 'LecturePause', 'RetourRapide', 'AvanceRapide']],
  ['SkyQ', 500, null, 28], ['IPTV', 530, null, 28], ['Swisscom', 560, null, 41]];
REM.forEach(([nm, base, names, n]) => { const cnt = names ? names.length : n; for (let k = 0; k < cnt; k++) PANEL_IO.push({ dir: 'O', t: 'd', join: base + k, sig: 'TELECOMMANDE_' + nm + '_' + (names ? names[k] : pad2(k)) }); });
PANEL_IO.push({ dir: 'O', t: 'a', join: SD.telecommandes.pieceAnalog, sig: 'TELECOMMANDE_Piece' });

// Contrôles de capacité
Object.values(KINDS).forEach(K => PANEL_IO.forEach(c => {
  const cap = c.t === 'd' ? K.nD : c.t === 'a' ? K.nA : (c.dir === 'O' ? K.nSO : K.nS);
  if (c.join > cap) throw new Error(K.Nm + ' : join ' + c.t + c.join + ' > capacité ' + cap);
}));
// Un signal n'a qu'une source : entrées de dalles = sorties des modules, et inversement.
const panelIndex = (K, c) => c.dir === 'O'
  ? (c.t === 'd' ? c.join : c.t === 'a' ? K.nD + c.join : K.nD + K.nA + c.join)
  : (c.t === 'd' ? c.join : c.t === 'a' ? K.nD + c.join : K.nD + K.nA + c.join);

let nextDv = maxH('Dv') + 1, nextSm = maxH('Sm') + 1, nextDb = maxH('Db') + 1, nextEt = maxH('Et') + 1;
const newDv = [], newSm = [], newDb = [], newEt = [];
const ethSm = findH('Sm', 7), ethDvH = get(ethSm, 'DvH');
const ethChildren = []; for (let i = 1; get(ethSm, 'C' + i) !== undefined; i++) ethChildren.push(get(ethSm, 'C' + i));
// Plage d'emplacements Ethernet libres (entrée groupée « P4Ethernet »)
const range = objs.find(o => tp(o) === 'Dv' && get(o, 'Nm') === 'P4Ethernet' && /[.,]/.test(get(o, 'H')));
const ethBase = parseInt(ethDvH, 10);
let freeAds = get(range, 'Ad').split(',').map(a => parseInt(a, 16));
PANELS.forEach(pn => {
  if (!freeAds.includes(pn.ip)) throw new Error('IP-ID ' + pn.ip.toString(16) + ' déjà occupé dans le socle');
  const K = KINDS[pn.kind];
  const ad = pn.ip.toString(16).toUpperCase().padStart(2, '0');
  const slotH = ethBase + pn.ip;
  const dvH = nextDv++, smH = nextSm++, dbH = nextDb++, etH = nextEt++;
  freeAds = freeAds.filter(a => a !== pn.ip);
  newDv.push(['ObjTp=Dv', 'Nm=P4Ethernet', 'H=' + slotH, 'PrH=' + ethDvH, 'ObjVer=1', 'SlC=565', 'DvF=Sl', 'DvVr=1241', 'Ad=' + ad, 'mC=1', 'C1=' + dvH]);
  const dv = ['ObjTp=Dv', 'Nm=' + pn.nom, 'H=' + dvH, 'PrH=' + slotH, 'DvC=' + K.DvC, 'ObjVer=1', 'DvVr=1241', 'Ad=' + ad, 'SmH=' + smH, 'RelStat=' + K.RelStat, 'ProdLine=Smart Graphics', 'DbH=' + dbH, 'EtH=' + etH];
  const smChildren = [];
  if (K.child) {
    const fsH = nextDv++, chH = nextDv++, chSm = nextSm++;
    dv.push('mC=1', 'C1=' + fsH);
    newDv.push(['ObjTp=Dv', 'Nm=FixedSlot', 'H=' + fsH, 'PrH=' + dvH, 'ObjVer=1', 'SlC=144', 'DvF=Sl', 'DvVr=1241', 'Ad=01', 'mC=1', 'C1=' + chH]);
    newDv.push(['ObjTp=Dv', 'Nm=' + K.child.Nm, 'H=' + chH, 'PrH=' + fsH, 'DvC=' + K.child.DvC, 'ObjVer=1', 'SlC=144', 'DvVr=1241', 'Ad=01', 'SmH=' + chSm, 'RelStat=' + K.child.RelStat]);
    newSm.push(['ObjTp=Sm', 'H=' + chSm, 'SmC=' + K.child.SmC, 'Nm=' + (K.child.SmNm || K.child.Nm), 'ObjVer=1', 'SmVr=1241', 'DvH=' + chH, 'PrH=' + smH, 'CF=2'].concat(K.child.sm));
    smChildren.push(chSm);
  }
  newDv.push(dv);
  newDb.push(['ObjTp=Db', 'H=' + dbH, 'DvH=' + dvH, 'Whc=3', 'Mnf=Crestron', 'Mdl=' + K.Mdl, 'Tpe=' + K.Tpe]);
  newEt.push(['ObjTp=Et', 'H=' + etH, 'DvH=' + dvH, 'IPM=255.255.255.0', 'IPA=127.0.0.1']);
  const sm = ['ObjTp=Sm', 'H=' + smH, 'SmC=' + K.SmC, 'Nm=' + K.Nm, 'ObjVer=' + K.ObjVer, 'SmVr=1241', 'DvH=' + dvH, 'PrH=7', 'CF=2',
    'n1I=' + K.nD, 'n2I=' + K.nA, 'n1O=' + K.nD, 'Cmn1=' + pn.nom + '\\\\'];
  if (smChildren.length) { sm.push('mC=' + smChildren.length); smChildren.forEach((c, i) => sm.push('C' + (i + 1) + '=' + c)); }
  sm.push('mI=' + (K.nD + K.nA + K.nS));
  const ins = PANEL_IO.filter(c => c.dir === 'I').map(c => [panelIndex(K, c), sg(c.sig, c.t)]).sort((a, b) => a[0] - b[0]);
  ins.forEach(([i, h]) => sm.push('I' + i + '=' + h));
  sm.push('mO=' + (K.nD + K.nA), 'tO=' + (K.nD + K.nA + K.nSO));
  const outs = PANEL_IO.filter(c => c.dir === 'O').map(c => [panelIndex(K, c), sg(c.sig, c.t)]).sort((a, b) => a[0] - b[0]);
  outs.forEach(([i, h]) => sm.push('O' + i + '=' + h));
  sm.push('mP=1', 'P1=255d');
  newSm.push(sm);
  ethChildren.push(String(smH));
});
// Emplacements restants, regroupés comme SIMPL les écrit (handles consécutifs en « a.b »)
{
  const hs = freeAds.map(a => ethBase + a); const parts = []; let s = hs[0], p = hs[0];
  for (let i = 1; i <= hs.length; i++) { if (hs[i] === p + 1) { p = hs[i]; continue; } parts.push(s === p ? String(s) : s + '.' + p); s = p = hs[i]; }
  set(range, 'H', parts.join(','));
  set(range, 'Ad', freeAds.map(a => a.toString(16).toUpperCase().padStart(2, '0')).join(','));
  del(ethSm, 'mC'); for (let i = 1; get(ethSm, 'C' + i) !== undefined; i++) del(ethSm, 'C' + i);
  set(ethSm, 'mC', ethChildren.length); ethChildren.forEach((c, i) => set(ethSm, 'C' + (i + 1), c));
}

// 3e. Modules SIMPL+ sous « Logic »
function uspSymbol(file, comment, IN_D, IN_A, OUT_D, OUT_A, sigName) {
  const h = nextSm++;
  const sm = ['ObjTp=Sm', 'H=' + h, 'SmC=103', 'Nm=' + file, 'ObjVer=1', 'PrH=4', 'CF=2',
    'n1I=' + IN_D.length, 'n2I=' + IN_A.length, 'n1O=' + OUT_D.length, 'Cmn1=' + comment + '\\\\',
    'mI=' + (IN_D.length + IN_A.length)];
  IN_D.forEach((e, i) => sm.push('I' + (i + 1) + '=' + sg(sigName(e), 'd')));
  IN_A.forEach((e, i) => sm.push('I' + (IN_D.length + i + 1) + '=' + sg(sigName(e), e.t)));
  sm.push('mO=' + (OUT_D.length + OUT_A.length), 'tO=' + (OUT_D.length + OUT_A.length));
  OUT_D.forEach((e, i) => sm.push('O' + (i + 1) + '=' + sg(sigName(e), 'd')));
  OUT_A.forEach((e, i) => sm.push('O' + (OUT_D.length + i + 1) + '=' + sg(sigName(e), e.t)));
  newSm.push(sm);
  return h;
}
const logicKids = [];
const gName = e => e.sig;
logicKids.push(uspSymbol('VillaGlobal.usp', 'Villa Crans - Global', GIN_D, GIN_A, GOUT_D, GOUT_A, gName));
PIECES.forEach(p => {
  const pre = prefix(p);
  const nm = e => e.d === 'global' ? e.sig : pre + e.sig;
  logicKids.push(uspSymbol('VillaPiece_R' + pad2(p.id) + '.usp', 'Piece ' + pad2(p.id) + ' ' + ascii(p.nom), RIN_D, RIN_A, ROUT_D, ROUT_A, nm));
});
{
  const logic = findH('Sm', 4);
  const kids = []; for (let i = 1; get(logic, 'C' + i) !== undefined; i++) { kids.push(get(logic, 'C' + i)); }
  for (let i = 1; i <= kids.length; i++) del(logic, 'C' + i); del(logic, 'mC');
  const all = kids.concat(logicKids.map(String));
  set(logic, 'mC', all.length); all.forEach((c, i) => set(logic, 'C' + (i + 1), c));
}

// 3f. Assemblage dans l'ordre SIMPL : Dv (par handle) , Db, Cs, FP, Bk, Bw, Et, Sm, Sg
const firstH = o => parseInt(String(get(o, 'H') || '0').split(/[.,]/)[0], 10);
const byType = t => objs.filter(o => tp(o) === t);
const head = objs.filter(o => !tp(o) || ['FSgntr', 'Hd'].includes(tp(o)));
const dvs = byType('Dv').concat(newDv).sort((a, b) => firstH(a) - firstH(b));
const sgs = [...SIG.entries()].sort((a, b) => a[1].h - b[1].h).map(([n, e]) => ['ObjTp=Sg', 'H=' + e.h, 'Nm=' + n].concat(SGTP[e.t] ? ['SgTp=' + SGTP[e.t]] : []));
const ordered = head.concat(dvs, byType('Cm'), byType('Db').concat(newDb), byType('Cs'), byType('FP'), byType('Bk'), byType('Bw'),
  byType('Et').concat(newEt), byType('Sm').concat(newSm).sort((a, b) => firstH(a) - firstH(b)), byType('Sg'), sgs);
const other = objs.filter(o => !ordered.includes(o));
if (other.length) throw new Error('objets non classés : ' + other.map(o => tp(o)).join(','));
const smw = ordered.map(o => '[\r\n' + o.join('\r\n') + '\r\n]').join('\r\n') + '\r\n';
fs.writeFileSync(path.join(OUT, 'VillaCrans_Direct.smw'), Buffer.from(smw, 'latin1'));

// 3g. Modules SIMPL+
// SIMPL+ : fichiers en ASCII pur (éditeur et compilateur SIMPL+ en code page locale).
const asciiText = t => t.replace(/—/g, '-').replace(/[«»]/g, '"').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7f]/g, '?');
fs.writeFileSync(path.join(OUT, 'VillaGlobal.usp'), asciiText(globalUsp()));
PIECES.forEach(p => fs.writeFileSync(path.join(OUT, 'VillaPiece_R' + pad2(p.id) + '.usp'), asciiText(roomUsp(p))));

/* =====================================================================================
 * 4. Table des signaux pour l'équipe
 * ===================================================================================== */
{
  const md = [];
  md.push('# Villa Crans v6.0 — programme SIMPL unique : joins et signaux (généré)', '');
  md.push('Contrat S : join de pièce = ' + B + ' + (id - 1) × ' + T + ' + offset. Généré par `simpl/direct/generate_simpl.js` depuis `villa_config.json` (version ' + cfg.meta.version + ').', '');
  md.push('Dalles déclarées : ' + PANELS.map(p => '0x' + p.ip.toString(16).toUpperCase().padStart(2, '0') + ' ' + p.nom + ' (' + KINDS[p.kind].Nm + ')').join(' ; ') + '.', '');
  md.push('## Pièces', '');
  PIECES.forEach(p => { md.push('- ' + prefix(p).slice(0, -1) + ' = ' + p.nom + ' : joins ' + (B + (p.id - 1) * T + 1) + '..' + (B + p.id * T) + ', module `VillaPiece_R' + pad2(p.id) + '.usp`.'); });
  md.push('', '## Bloc d\'une pièce (offsets, identiques pour toutes les pièces)', '', '| Type | Join logique GUI | Offset | Signal (préfixe Rnn_) | Sens |', '|---|---|---|---|---|');
  const rows = [];
  [[RIN_D, 'appui'], [RIN_A, 'appui / valeur'], [ROUT_D, 'retour'], [ROUT_A, 'retour']].forEach(([list, sens]) => list.forEach(e => {
    if (e.d !== 'panel' || e.j === null) return; const map = e.t === 'd' ? MAPD : e.t === 'a' ? MAPA : MAPS; const o = map[String(e.j)]; if (o === undefined) return;
    rows.push([e.t, e.j, o, e.sig, sens]);
  }));
  rows.sort((a, b) => (a[0] + a[2]).localeCompare(b[0] + b[2], undefined, { numeric: true })).forEach(r => md.push('| ' + r.join(' | ') + ' |'));
  md.push('', '## Signaux à câbler aux pilotes (joins vides), par pièce', '', 'Sorties des modules : ' + ROUT_D.concat(ROUT_A).filter(e => e.d === 'pilote').map(e => '`' + e.sig + '`').join(', ') + '.', '',
    'Entrées des modules (retours des pilotes, facultatifs) : ' + RIN_A.filter(e => e.d === 'retour').map(e => '`' + e.sig + '`').join(', ') + '.', '');
  md.push('## Global', '', 'Alarme, partitions, centralisation : module `VillaGlobal.usp`. Télécommandes : joins globaux inchangés (`TELECOMMANDE_*`), pièce émettrice sur l\'analogique ' + SD.telecommandes.pieceAnalog + ' (`TELECOMMANDE_Piece`).', '');
  md.push('Signaux : ' + SIG.size + ' ; symboles de dalle : ' + PANELS.length + ' ; modules SIMPL+ : ' + (PIECES.length + 1) + '.');
  fs.writeFileSync(path.join(OUT, 'SIGNAUX.md'), md.join('\n') + '\n');
}
console.log('OK : VillaCrans_Direct.smw (' + PANELS.length + ' dalles, ' + (PIECES.length + 1) + ' modules SIMPL+, ' + SIG.size + ' signaux, ' + PANEL_IO.length + ' joins par dalle)');
