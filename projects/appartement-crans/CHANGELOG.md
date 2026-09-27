# Appartement Crans-Montana — journal

Quatre artefacts à suivre : CH5 `appartementcrans.ch5z`, CPZ slot 1 `AppartementCrans.cpz`, LPZ slot 2
`AppartementCrans_Slot2.lpz`, `villa_config.json`. Version source en tête de chaque entrée.

## 1.0.1 — 27.09.2026 (config + vitrine ; CH5 source Core 1.0.207 ; rien compilé)
- Noms de pièces raccourcis pour le menu de gauche du Core (dalle : 183 px de libellé) : Entrée, WC invités,
  Suite parentale, Bain parental, Bain salle TV, Hall étage, Bain Twin, Bain VIP, Balcons ; traductions EN/DE/ES/RU
  alignées. Contrôle « aucun libellé tronqué » vert (dalle, iPad, 3 thèmes, 4 modes).
- Météo : `widgets.meteoActualites` = Crans-Montana (46.3117 / 7.4806), lu par le Core v4.7.
- `plan3d` des pièces = source unique de la disposition du fond 3D du site (`apps/showcase/scripts/build-plan3d-appartement.mjs`
  sans surcharge) : escalier au-dessus de l'entrée, chambre VIP en façade nord du niveau 1, cuisine fenêtre nord.
- Vitrine publique : `public/showcases/appartement-crans/` (sync-appartement-crans.py), entrée `projects.js`,
  fiche FR/EN/DE (17 captures), fond 3D « résidence » (socle hôtelier + duplex + toiture pierre), démo automatique
  générique adaptée au Core. Batteries : 70/70 (GUI), 159/159 (modes du site), contraste 0 défaut.
- Reste à faire inchangé (compilation CPZ / LPZ / CH5Z, SIMPL Windows, drivers, recette matériel).

## 1.0.0 — 27.09.2026 (CH5 source 1.0.0, C# 1.0.0.0, SMW généré, JSON meta.version 1.0.0 ; rien compilé)
- Création du projet dans `projects/appartement-crans/` à partir du Core Villa Crans (contrat v4.1).
- `villa_config.json` : 17 pièces (101 circuits Lutron avec niveaux par scène OFF / JOUR / SOIR / NUIT,
  18 moteurs, 13 pièces CVC, 8 pièces A/V), généré par `tools/build_config.py` ; `validate-config.mjs` passed.
- `tools/assemble.py` : copie Core → `ch5/src` (+ `villa_config.js` embarqué, `version.js`), `deploy.ps1`
  (ASCII + BOM, noms `appartementcrans` / `AppartementCrans`, config lue à la racine du projet), outils du Core,
  C# renommé `AppartementCrans` 1.0.0.0 (`simpl-sharp/`), puis génération et contrôle du SMW ; contrôles
  `node --check` des blocs `<script>` (6 + 8 OK). Idempotent.
- `tools/generate_slot2.js` : générateur SIMPL depuis le socle nu (EISC 2732 joins) écrivant explicitement les
  signaux que le Core supposait présents ; `AppartementCrans_Slot2.smw` = 880 signaux, 327 entrées / 553 sorties
  EISC, blocs éclairage (17 pièces) et CVC (13 pièces) ; wellness non câblé. `.signals.txt` join → nom.
- `tools/check_slot2.js` : références, doublons d'index et de noms, parents, types, capacités, EOL ; VERT.
- Docs : `README.md`, `CONTEXTE-CLAUDE.md`, `docs/CONTRAT-JOINS.md` (tableau des pièces, recette Debugger),
  `simpl/simpl-windows/LIRE.md`, `.gitignore`.
- Non fait : compilation CPZ (pas de SDK dotnet ici) et LPZ, ouverture dans SIMPL Windows, build CH5Z, recette
  matériel, drivers slot 2, batterie Playwright sur le GUI à 17 pièces.
