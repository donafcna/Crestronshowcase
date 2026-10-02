/* Journal de chantier Villa Crans — les trois espaces de la Console Web :
 *   • À faire / À tester   (journal/todo.json)
 *   • Rapport de test      (journal/tests.json)
 *   • Spécification        (journal/specs.json)
 *
 * Les entrées sont écrites dans des fichiers JSON du dépôt, pas dans le
 * navigateur : un rapport de test signé n'a d'intérêt que si l'équipe le voit,
 * et Git en garde l'historique sans qu'on ait à y penser.
 *
 * Les initiales sont retenues dans ce navigateur — on les saisit une fois par
 * poste, pas à chaque ligne — mais elles sont écrites dans le fichier avec
 * l'entrée : c'est la signature, elle doit voyager avec.
 */
(function () {
  'use strict';

  var CLE_INITIALES = 'villa_initiales';

  /* ---------- utilitaires ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function deuxCh(n) { return String(n).padStart(2, '0'); }
  function horodatage(v) {
    if (!v) return '';
    var d = new Date(v);
    if (isNaN(d)) return String(v);
    return deuxCh(d.getDate()) + '.' + deuxCh(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2)
      + ' ' + deuxCh(d.getHours()) + ':' + deuxCh(d.getMinutes());
  }
  function jourSeul(v) {
    if (!v) return '';
    var p = String(v).split('-');
    return p.length === 3 ? (p[2] + '.' + p[1] + '.' + p[0].slice(2)) : String(v);
  }
  function aujourdhui() {
    var d = new Date();
    return d.getFullYear() + '-' + deuxCh(d.getMonth() + 1) + '-' + deuxCh(d.getDate());
  }
  function initiales() {
    try { return (localStorage.getItem(CLE_INITIALES) || '').trim(); } catch (e) { return ''; }
  }
  function retenirInitiales(v) {
    try { localStorage.setItem(CLE_INITIALES, v); } catch (e) {}
  }

  function api(type, corps) {
    var opts = corps
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) }
      : {};
    return fetch('/api/journal/' + type, opts).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || r.status); });
      return r.json();
    });
  }

  /* ---------- état ---------- */

  var DONNEES = { todo: null, tests: null, specs: null };
  var FILTRE_TODO = 'ouverts';

  function signaler(type, message, erreur) {
    var el = document.getElementById('jr-msg-' + type);
    if (!el) return;
    el.textContent = message || '';
    el.style.color = erreur ? '#fca5a5' : 'var(--muted)';
    if (message && !erreur) setTimeout(function () { if (el.textContent === message) el.textContent = ''; }, 3500);
  }

  async function charger(type) {
    try {
      var r = await api(type);
      DONNEES[type] = r.items || [];
      rendre(type);
    } catch (e) {
      DONNEES[type] = [];
      rendre(type);
      signaler(type, 'Lecture impossible : ' + e.message, true);
    }
  }

  async function ecrire(type, action, item) {
    try {
      var r = await api(type, { action: action, item: item });
      DONNEES[type] = r.items || [];
      rendre(type);
      return true;
    } catch (e) {
      signaler(type, 'Enregistrement impossible : ' + e.message, true);
      return false;
    }
  }

  /* ---------- espace « À faire / À tester » ---------- */

  var STATUTS = [
    ['a-faire', 'À faire'],
    ['a-tester', 'À tester'],
    ['teste', 'Testé'],
    ['bloque', 'Bloqué']
  ];
  var PRIORITES = [['haute', 'Haute'], ['moyenne', 'Moyenne'], ['basse', 'Basse']];
  var libelle = function (paires, v) {
    for (var i = 0; i < paires.length; i++) if (paires[i][0] === v) return paires[i][1];
    return v || '';
  };

  function rendreTodo() {
    var items = DONNEES.todo || [];
    var compte = {};
    STATUTS.forEach(function (s) { compte[s[0]] = 0; });
    items.forEach(function (it) { if (compte[it.statut] !== undefined) compte[it.statut]++; });

    var barre = document.getElementById('jr-filtres-todo');
    if (barre) {
      var choix = [['ouverts', 'Ouverts', compte['a-faire'] + compte['a-tester'] + compte['bloque']],
                   ['tous', 'Tous', items.length]]
        .concat(STATUTS.map(function (s) { return [s[0], s[1], compte[s[0]]]; }));
      barre.innerHTML = choix.map(function (c) {
        return '<button class="btn mini jr-filtre' + (FILTRE_TODO === c[0] ? ' primary' : '') +
          '" data-f="' + c[0] + '">' + esc(c[1]) + ' <b>' + c[2] + '</b></button>';
      }).join('');
      barre.querySelectorAll('.jr-filtre').forEach(function (b) {
        b.onclick = function () { FILTRE_TODO = b.dataset.f; rendreTodo(); };
      });
    }

    var vus = items.filter(function (it) {
      if (FILTRE_TODO === 'tous') return true;
      if (FILTRE_TODO === 'ouverts') return it.statut !== 'teste';
      return it.statut === FILTRE_TODO;
    });
    // Le plus urgent en haut, puis le plus récemment touché.
    var rang = { haute: 0, moyenne: 1, basse: 2 };
    vus.sort(function (a, b) {
      var d = (rang[a.priorite] === undefined ? 1 : rang[a.priorite]) - (rang[b.priorite] === undefined ? 1 : rang[b.priorite]);
      return d !== 0 ? d : String(b.maj_le || b.cree_le || '').localeCompare(String(a.maj_le || a.cree_le || ''));
    });

    var corps = document.getElementById('jr-liste-todo');
    if (!corps) return;
    if (!vus.length) {
      corps.innerHTML = '<p class="hint" style="padding:14px">Aucune entrée dans ce filtre.</p>';
      return;
    }
    corps.innerHTML = '<table><thead><tr>' +
      '<th style="width:34%">Point</th><th style="width:14%">Catégorie</th><th style="width:9%">Priorité</th>' +
      '<th style="width:13%">Statut</th><th style="width:22%">Suivi</th><th style="width:8%"></th>' +
      '</tr></thead><tbody>' +
      vus.map(function (it) {
        return '<tr data-id="' + esc(it.id) + '">' +
          '<td><b>' + esc(it.titre) + '</b>' +
            (it.detail ? '<div class="hint" style="margin-top:3px;white-space:pre-wrap">' + esc(it.detail) + '</div>' : '') + '</td>' +
          '<td>' + esc(it.categorie || '—') + '</td>' +
          '<td><span class="jr-prio jr-prio-' + esc(it.priorite || 'moyenne') + '">' + esc(libelle(PRIORITES, it.priorite)) + '</span></td>' +
          '<td><select class="jr-statut">' + STATUTS.map(function (s) {
              return '<option value="' + s[0] + '"' + (it.statut === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
            }).join('') + '</select></td>' +
          '<td class="hint">créé ' + horodatage(it.cree_le) + (it.auteur ? ' · ' + esc(it.auteur) : '') +
            (it.maj_le && it.maj_le !== it.cree_le
              ? '<br>maj ' + horodatage(it.maj_le) + (it.maj_par ? ' · ' + esc(it.maj_par) : '') : '') + '</td>' +
          '<td><button class="btn mini danger jr-suppr">✕</button></td></tr>';
      }).join('') + '</tbody></table>';

    corps.querySelectorAll('tr[data-id]').forEach(function (tr) {
      var id = tr.dataset.id;
      tr.querySelector('.jr-statut').onchange = function (e) {
        ecrire('todo', 'update', { id: id, statut: e.target.value, maj_par: initiales() });
      };
      tr.querySelector('.jr-suppr').onclick = function () {
        if (confirm('Supprimer ce point ?')) ecrire('todo', 'delete', { id: id });
      };
    });
  }

  /* ---------- espace « Rapport de test » ---------- */

  var RESULTATS = [['ok', 'Conforme'], ['partiel', 'Réserve'], ['ko', 'Non conforme']];

  function rendreTests() {
    var items = (DONNEES.tests || []).slice();
    // Le dernier test passé en premier : c'est celui qu'on vient d'écrire ou
    // celui qu'on relit après une intervention.
    items.sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || '')) ||
             String(b.cree_le || '').localeCompare(String(a.cree_le || ''));
    });
    var corps = document.getElementById('jr-liste-tests');
    if (!corps) return;
    if (!items.length) {
      corps.innerHTML = '<p class="hint" style="padding:14px">Aucun test consigné.</p>';
      return;
    }
    corps.innerHTML = '<table><thead><tr>' +
      '<th style="width:10%">Date</th><th style="width:8%">Initiales</th><th style="width:26%">Périmètre testé</th>' +
      '<th style="width:12%">Résultat</th><th style="width:36%">Observations</th><th style="width:8%"></th>' +
      '</tr></thead><tbody>' +
      items.map(function (it) {
        return '<tr data-id="' + esc(it.id) + '">' +
          '<td class="hint" style="white-space:nowrap">' + jourSeul(it.date) + '</td>' +
          '<td><span class="jr-init">' + esc(it.initiales || '—') + '</span></td>' +
          '<td>' + esc(it.perimetre) + '</td>' +
          '<td><span class="jr-res jr-res-' + esc(it.resultat || 'ok') + '">' + esc(libelle(RESULTATS, it.resultat)) + '</span></td>' +
          '<td style="white-space:pre-wrap">' + esc(it.observations || '') + '</td>' +
          '<td><button class="btn mini danger jr-suppr">✕</button></td></tr>';
      }).join('') + '</tbody></table>';

    corps.querySelectorAll('tr[data-id]').forEach(function (tr) {
      tr.querySelector('.jr-suppr').onclick = function () {
        if (confirm('Supprimer cette ligne du rapport ?')) ecrire('tests', 'delete', { id: tr.dataset.id });
      };
    });
  }

  /* ---------- espace « Spécification » ---------- */

  function rendreSpecs() {
    var items = (DONNEES.specs || []).slice();
    items.sort(function (a, b) { return String(b.cree_le || '').localeCompare(String(a.cree_le || '')); });
    var corps = document.getElementById('jr-liste-specs');
    if (!corps) return;
    if (!items.length) {
      corps.innerHTML = '<p class="hint" style="padding:14px">Aucune spécification consignée.</p>';
      return;
    }
    corps.innerHTML = items.map(function (it) {
      return '<article class="jr-spec" data-id="' + esc(it.id) + '">' +
        '<div class="jr-spec-tete"><b>' + esc(it.titre) + '</b>' +
          '<span class="hint">' + horodatage(it.cree_le) + ' · ' + esc(it.auteur || '—') +
          (it.maj_le && it.maj_le !== it.cree_le
            ? ' · revu ' + horodatage(it.maj_le) + (it.maj_par ? ' par ' + esc(it.maj_par) : '') : '') + '</span>' +
          '<button class="btn mini jr-editer">Modifier</button>' +
          '<button class="btn mini danger jr-suppr">✕</button></div>' +
        '<div class="jr-spec-corps">' + esc(it.corps) + '</div></article>';
    }).join('');

    corps.querySelectorAll('.jr-spec').forEach(function (art) {
      var id = art.dataset.id;
      var item = items.filter(function (x) { return x.id === id; })[0];
      art.querySelector('.jr-suppr').onclick = function () {
        if (confirm('Supprimer cette spécification ?')) ecrire('specs', 'delete', { id: id });
      };
      art.querySelector('.jr-editer').onclick = function () {
        var zone = art.querySelector('.jr-spec-corps');
        if (art.dataset.edition === '1') return;
        art.dataset.edition = '1';
        zone.innerHTML = '<textarea class="jr-zone" rows="8"></textarea>' +
          '<div class="row" style="margin-top:8px">' +
          '<button class="btn primary mini jr-ok">Enregistrer</button>' +
          '<button class="btn mini jr-annuler">Annuler</button></div>';
        var ta = zone.querySelector('.jr-zone');
        ta.value = item.corps || '';
        ta.focus();
        zone.querySelector('.jr-annuler').onclick = function () { art.dataset.edition = ''; rendreSpecs(); };
        zone.querySelector('.jr-ok').onclick = function () {
          var v = ta.value.trim();
          if (!v) { alert('Le texte est vide.'); return; }
          ecrire('specs', 'update', { id: id, corps: v, maj_par: initiales() });
        };
      };
    });
  }

  function rendre(type) {
    if (type === 'todo') rendreTodo();
    else if (type === 'tests') rendreTests();
    else if (type === 'specs') rendreSpecs();
  }

  /* ---------- formulaires d'ajout ---------- */

  var CHAMPS_INITIALES = ['jr-todo-auteur', 'jr-tests-initiales', 'jr-specs-auteur'];

  function champInitiales(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = initiales();
    el.addEventListener('change', function () {
      el.value = el.value.trim().toUpperCase();
      retenirInitiales(el.value);
      prefixerInitiales();   // les trois champs sont la même signature
    });
  }

  // Les trois onglets partagent une seule signature : la saisir dans l'un doit
  // la poser dans les autres, sans écraser une valeur qu'on vient d'y taper.
  function prefixerInitiales() {
    var v = initiales();
    if (!v) return;
    CHAMPS_INITIALES.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.value.trim()) el.value = v;
    });
  }

  function cablerFormulaires() {
    champInitiales('jr-todo-auteur');
    champInitiales('jr-tests-initiales');
    champInitiales('jr-specs-auteur');

    var dateTest = document.getElementById('jr-tests-date');
    if (dateTest && !dateTest.value) dateTest.value = aujourdhui();

    var bTodo = document.getElementById('jr-todo-ajouter');
    if (bTodo) bTodo.onclick = async function () {
      var titre = document.getElementById('jr-todo-titre').value.trim();
      if (!titre) { signaler('todo', 'Indiquez au moins l’intitulé du point.', true); return; }
      var auteur = document.getElementById('jr-todo-auteur').value.trim().toUpperCase();
      retenirInitiales(auteur);
      var ok = await ecrire('todo', 'add', {
        titre: titre,
        detail: document.getElementById('jr-todo-detail').value.trim(),
        categorie: document.getElementById('jr-todo-categorie').value.trim(),
        priorite: document.getElementById('jr-todo-priorite').value,
        statut: document.getElementById('jr-todo-statut').value,
        auteur: auteur
      });
      if (ok) {
        document.getElementById('jr-todo-titre').value = '';
        document.getElementById('jr-todo-detail').value = '';
        signaler('todo', 'Point ajouté.');
      }
    };

    var bTest = document.getElementById('jr-tests-ajouter');
    if (bTest) bTest.onclick = async function () {
      var perimetre = document.getElementById('jr-tests-perimetre').value.trim();
      var init = document.getElementById('jr-tests-initiales').value.trim().toUpperCase();
      if (!perimetre) { signaler('tests', 'Indiquez ce qui a été testé.', true); return; }
      if (!init) { signaler('tests', 'Indiquez vos initiales : le rapport doit être signé.', true); return; }
      retenirInitiales(init);
      var ok = await ecrire('tests', 'add', {
        date: document.getElementById('jr-tests-date').value || aujourdhui(),
        initiales: init,
        perimetre: perimetre,
        resultat: document.getElementById('jr-tests-resultat').value,
        observations: document.getElementById('jr-tests-observations').value.trim()
      });
      if (ok) {
        document.getElementById('jr-tests-perimetre').value = '';
        document.getElementById('jr-tests-observations').value = '';
        signaler('tests', 'Test consigné.');
      }
    };

    var bSpec = document.getElementById('jr-specs-ajouter');
    if (bSpec) bSpec.onclick = async function () {
      var titre = document.getElementById('jr-specs-titre').value.trim();
      var corps = document.getElementById('jr-specs-corps').value.trim();
      var auteur = document.getElementById('jr-specs-auteur').value.trim().toUpperCase();
      if (!titre || !corps) { signaler('specs', 'Titre et texte sont requis.', true); return; }
      if (!auteur) { signaler('specs', 'Indiquez l’auteur.', true); return; }
      retenirInitiales(auteur);
      var ok = await ecrire('specs', 'add', { titre: titre, corps: corps, auteur: auteur });
      if (ok) {
        document.getElementById('jr-specs-titre').value = '';
        document.getElementById('jr-specs-corps').value = '';
        signaler('specs', 'Spécification enregistrée.');
      }
    };
  }

  /* ---------- exposition ---------- */

  window.Journal = {
    // Appelé à l'ouverture d'un onglet : on relit le fichier plutôt que de se
    // fier au cache, un collègue a pu écrire entre-temps.
    ouvrir: function (type) { prefixerInitiales(); charger(type); },
    demarrer: function () {
      cablerFormulaires();
      ['todo', 'tests', 'specs'].forEach(charger);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.Journal.demarrer);
  else window.Journal.demarrer();
})();
