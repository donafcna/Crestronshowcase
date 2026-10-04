// Réécriture minimale d'un fichier JSON : applique au TEXTE d'origine les seules différences entre
// l'ancien et le nouvel objet. Le reste du fichier (mise en forme, objets sur une ligne, ordre des
// clés numériques que JSON.stringify trierait) reste octet pour octet identique : un « git diff »
// après un enregistrement depuis la Console Web ne montre que ce que le technicien a changé.
'use strict';

// ---- analyse : chaque valeur avec sa position dans le texte
function analyser(txt) {
  let i = 0;
  const ws = () => { while (i < txt.length && /\s/.test(txt[i])) i++; };
  const err = m => { throw new Error('JSON illisible (' + m + ') au caractère ' + i); };
  function chaine() {
    const d = i; i++;
    while (i < txt.length && txt[i] !== '"') { if (txt[i] === '\\') i++; i++; }
    if (txt[i] !== '"') err('chaîne non fermée');
    i++;
    return { debut: d, fin: i, valeur: JSON.parse(txt.slice(d, i)) };
  }
  function valeur() {
    ws();
    const d = i, c = txt[i];
    if (c === '{') {
      i++; const membres = []; ws();
      if (txt[i] === '}') { i++; return { type: 'objet', debut: d, fin: i, membres }; }
      for (;;) {
        ws(); if (txt[i] !== '"') err('clé attendue');
        const cle = chaine(); ws();
        if (txt[i] !== ':') err('« : » attendu'); i++;
        const v = valeur();
        membres.push({ cle: cle.valeur, cleDebut: cle.debut, noeud: v });
        ws();
        if (txt[i] === ',') { i++; continue; }
        if (txt[i] === '}') { i++; break; }
        err('« , » ou « } » attendu');
      }
      return { type: 'objet', debut: d, fin: i, membres };
    }
    if (c === '[') {
      i++; const elements = []; ws();
      if (txt[i] === ']') { i++; return { type: 'liste', debut: d, fin: i, elements }; }
      for (;;) {
        elements.push(valeur()); ws();
        if (txt[i] === ',') { i++; continue; }
        if (txt[i] === ']') { i++; break; }
        err('« , » ou « ] » attendu');
      }
      return { type: 'liste', debut: d, fin: i, elements };
    }
    if (c === '"') { const s = chaine(); return { type: 'scalaire', debut: s.debut, fin: s.fin }; }
    const m = /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(txt.slice(i, i + 40));
    if (!m) err('valeur inattendue');
    i += m[0].length;
    return { type: 'scalaire', debut: d, fin: i };
  }
  const racine = valeur(); ws();
  if (i < txt.length) err('texte après la fin');
  return racine;
}

const estObjet = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function egalProfond(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, k) => egalProfond(x, b[k]));
  if (estObjet(a) && estObjet(b)) {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && egalProfond(a[k], b[k]));
  }
  return false;
}

// ---- écriture d'une valeur neuve, dans le style du fichier : listes de scalaires sur une ligne
function ecrire(v, indent) {
  const pas = '  ';
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every(x => x === null || typeof x !== 'object')) return '[' + v.map(x => JSON.stringify(x)).join(', ') + ']';
    if (v.every(x => Array.isArray(x) && x.every(y => y === null || typeof y !== 'object'))) {
      return '[\n' + v.map(x => indent + pas + ecrire(x, indent + pas)).join(',\n') + '\n' + indent + ']';
    }
    return '[\n' + v.map(x => indent + pas + ecrire(x, indent + pas)).join(',\n') + '\n' + indent + ']';
  }
  if (estObjet(v)) {
    const k = Object.keys(v);
    if (!k.length) return '{}';
    return '{\n' + k.map(c => indent + pas + JSON.stringify(c) + ': ' + ecrire(v[c], indent + pas)).join(',\n') + '\n' + indent + '}';
  }
  return JSON.stringify(v);
}

function indentationDe(txt, pos) {
  const d = txt.lastIndexOf('\n', pos - 1) + 1;
  const m = /^[ \t]*/.exec(txt.slice(d, pos));
  return m ? m[0] : '';
}

// Remplace un nœud entier : garde le style sur une ligne s'il l'était.
function remplacer(txt, noeud, v, editions) {
  const surUneLigne = !txt.slice(noeud.debut, noeud.fin).includes('\n');
  let texte = ecrire(v, indentationDe(txt, noeud.debut));
  if (surUneLigne && (estObjet(v) || Array.isArray(v))) {
    const compact = JSON.stringify(v).replace(/":/g, '": ').replace(/,(?=["\[{\d-]|true|false|null)/g, ', ');
    if (compact.length <= 140) texte = compact;
  }
  editions.push({ debut: noeud.debut, fin: noeud.fin, texte });
}

function comparer(txt, noeud, ancien, neuf, editions) {
  if (egalProfond(ancien, neuf)) return;
  if (noeud.type === 'objet' && estObjet(ancien) && estObjet(neuf)) {
    const membres = noeud.membres;
    const retires = membres.filter(m => !Object.prototype.hasOwnProperty.call(neuf, m.cle));
    if (retires.length === membres.length && Object.keys(neuf).length) return remplacer(txt, noeud, neuf, editions);
    for (const m of membres) if (Object.prototype.hasOwnProperty.call(neuf, m.cle)) comparer(txt, m.noeud, ancien[m.cle], neuf[m.cle], editions);
    // suppressions : de la fin du membre précédent à la fin du membre retiré
    membres.forEach((m, k) => {
      if (Object.prototype.hasOwnProperty.call(neuf, m.cle)) return;
      if (k > 0) editions.push({ debut: membres[k - 1].noeud.fin, fin: m.noeud.fin, texte: '' });
      else editions.push({ debut: m.cleDebut, fin: membres[1] ? membres[1].cleDebut : m.noeud.fin, texte: '' });
    });
    // ajouts : à la suite du dernier membre conservé
    const ajouts = Object.keys(neuf).filter(c => !Object.prototype.hasOwnProperty.call(ancien, c));
    if (ajouts.length) {
      const gardes = membres.filter(m => Object.prototype.hasOwnProperty.call(neuf, m.cle));
      if (!gardes.length) {
        if (!membres.length) return remplacer(txt, noeud, neuf, editions);
        return remplacer(txt, noeud, neuf, editions);
      }
      const dernier = gardes[gardes.length - 1];
      const unaligne = !txt.slice(noeud.debut, noeud.fin).includes('\n');
      const ind = indentationDe(txt, dernier.cleDebut);
      const morceaux = ajouts.map(c => JSON.stringify(c) + ': ' + ecrire(neuf[c], unaligne ? '' : ind));
      const texte = unaligne ? ', ' + morceaux.map(x => x.replace(/\n\s*/g, ' ')).join(', ') : ',\n' + morceaux.map(x => ind + x).join(',\n');
      editions.push({ debut: dernier.noeud.fin, fin: dernier.noeud.fin, texte });
    }
    return;
  }
  if (noeud.type === 'liste' && Array.isArray(ancien) && Array.isArray(neuf) && ancien.length === neuf.length && ancien.length) {
    noeud.elements.forEach((e, k) => comparer(txt, e, ancien[k], neuf[k], editions));
    return;
  }
  remplacer(txt, noeud, neuf, editions);
}

// Renvoie le nouveau texte. Lève une erreur si le résultat ne relit pas exactement « neuf ».
function patcherTexte(txt, neuf) {
  const bom = txt.charCodeAt(0) === 0xFEFF ? '﻿' : '';
  const corps = bom ? txt.slice(1) : txt;
  const ancien = JSON.parse(corps);
  if (egalProfond(ancien, neuf)) return txt;
  const editions = [];
  comparer(corps, analyser(corps), ancien, neuf, editions);
  editions.sort((a, b) => b.debut - a.debut || b.fin - a.fin);
  let sortie = corps;
  for (const e of editions) sortie = sortie.slice(0, e.debut) + e.texte + sortie.slice(e.fin);
  if (!egalProfond(JSON.parse(sortie), neuf)) throw new Error('réécriture incohérente (relecture différente)');
  return bom + sortie;
}

module.exports = { patcherTexte, egalProfond, analyser };
