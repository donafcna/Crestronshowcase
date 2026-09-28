# Appartement Crans-Montana — contexte de reprise (< 100 lignes)

Mis à jour le 27.09.2026 (v1.0.1 : noms courts, météo, vitrine publiée ; v1.0.0 premier assemblage). Dépôt public : le projet s'appelle uniquement
« Appartement Crans-Montana » (`appartement-crans`), jamais de nom de client, d'opérateur ni d'adresse.

## Ce que c'est
Premier projet client dérivé du **Core Villa Crans** (`projects/villa-crans`) : GUI CH5 (dalle / iPad / XPanel /
iPhone), C# SIMPL# Pro slot 1 et SIMPL Windows slot 2 reliés par EISC F0 / 127.0.0.2, contrat de joins v4.1.
**Rien n'est réécrit** : `villa_config.json` dimensionne tout (17 pièces, 101 circuits Lutron, 18 moteurs,
13 pièces CVC, 8 pièces A/V), `tools/assemble.py` copie le Core et `tools/generate_slot2.js` génère le SMW.

Règle : tout le projet reste dans `projects/appartement-crans/` ; le Core et `apps/showcase` ne sont pas touchés.

## Décisions structurantes
1. **Source unique = `villa_config.json`**, lui-même généré par `tools/build_config.py` depuis le Core et
   `tools/lutron-seq-of-op.json`. Pour changer une pièce ou un niveau : modifier le script, régénérer, ne jamais
   éditer le JSON à la main.
2. **Copies, pas forks** : `ch5/src`, `ch5/deploy.ps1`, `simpl-sharp/AppartementCrans/*.cs` sont produits par
   `assemble.py` (en-tête « Copie générée du Core … ne pas éditer ici »). Une correction se fait dans le Core puis
   se propage par `python3 tools/assemble.py` (idempotent, < 1 s).
3. **SMW généré depuis le socle nu** (`_socle_cp4_eisc.smw` de ftv-home, EISC 2732 joins), pas patché sur
   `Project_Slot2.smw` : aucun résidu v3 (`R01_..R15_`), tous les signaux « déjà câblés dans la base » du Core
   sont écrits explicitement. Mêmes noms que le Core (vérifié par diff : identique hors wellness).
4. Wellness désactivé (`contrat.wellness.actif=false`) : 620-627 / a62-63 non câblés, aucun bloc wellness.
5. Noms : CH5 `appartementcrans` (ch5z, projet Crestron ONE, URL XPanel `/appartementcrans/`), assembly / namespace
   `AppartementCrans` 1.0.0.0, SMW `AppartementCrans_Slot2.smw`, `PrNm` idem, `CltNm=Appartement Crans-Montana`.
   Le fichier de config garde son nom `villa_config.json` (le C# lit `/user/villa_config.json`).

## Vitrine et fond 3D (apps/showcase)
- `scripts/sync-appartement-crans.py ../../projects/appartement-crans/ch5/src` → `public/showcases/appartement-crans/`
  (noms réels conservés, contrôle bloquant des termes interdits) ; `js/local-feedback.js` maintenu à la main
  (presets de scène lus dans `pilotages.eclairages.scenes.niveaux`).
- Fond 3D : `public/plan3d/appartement-crans.json` régénéré par `scripts/build-plan3d-appartement.mjs` depuis
  `pieces[].plan3d` de ce projet (source unique) ; enveloppe `residence.js`.
- Batteries : `scripts/test-appartement-crans.cjs` (GUI, 70) et `scripts/test-appartement-crans-modes.cjs`
  (site : 3 thèmes × 4 modes × 3 châssis, 159) ; contraste `check-contrast-dom.mjs --root .../showcases/appartement-crans`.
- Règle apprise : les noms de pièces doivent tenir en ~16 caractères (menu dalle), sinon le Core tronque.

## Fichiers qui comptent
- `villa_config.json` (racine) ; `tools/build_config.py` + `lutron-seq-of-op.json` (ne pas modifier sauf bug).
- `tools/assemble.py` (a : CH5, b : C#, c : SMW, d : contrôles node --check comme deploy.ps1), `tools/generate_slot2.js`
  (`--input/--output/--config/--dry-run`), `tools/check_slot2.js`.
- `simpl/simpl-windows/AppartementCrans_Slot2.smw` + `.signals.txt` + `LIRE.md` ; `docs/CONTRAT-JOINS.md`.
- `ch5/deploy.ps1` : ASCII + BOM conservés (règle 1 des pièges du Core) ; lit `..\villa_config.json` (racine du
  projet) et `..\simpl-sharp\AppartementCrans\bin\Debug\AppartementCrans.cpz`. Identifiants dans
  `ch5/deploy.secrets.psd1` (gabarit `deploy.secrets.example.psd1`, jamais commité).

## État au 27.09.2026
- `validate-config.mjs` : passed. `assemble.py` : VERT (855 fichiers CH5, 6 + 8 blocs `<script>` OK,
  `villa_config.js` embarqué 17 pièces mode `deploiement`). `check_slot2.js` : VERT (880 signaux, 327 entrées,
  553 sorties EISC, aucun doublon, EOL homogène LF).
- **Rien n'est compilé** : pas de SDK dotnet dans l'environnement (C# non compilé), SMW jamais ouvert dans SIMPL
  Windows, aucun CH5Z/CPZ/LPZ, aucun matériel. Le C# est le Core 1.0.195.0 renommé : il compile dans le Core, le
  rename est vérifié par grep (aucune référence `Villaftv` / `VillaFrequenceTvAutomation` résiduelle).
- Drivers slot 2 : aucun (Lutron HomeWorks QS, moteurs, B&O, CVC, alarme à câbler, voir `LIRE.md`).

## Décisions prises par défaut (à confirmer)
- `ch5/src` (41 Mo, copie du Core) n'est PAS versionné (`.gitignore`) : après un clone, `python3 tools/assemble.py`
  est l'étape obligatoire avant `deploy.ps1` (< 1 s, idempotent).
- `ch5/version.json` créé à 1.0.0 puis laissé à `deploy.ps1` (non réinitialisé par `assemble.py`) ;
  `meta.version` du JSON s'aligne à la main (avertissement affiché sinon).
- `config.js` / `config.json` (liste de pièces historique du Core) copiés tels quels : le GUI les remplace par
  `villa_config` 300 ms après le chargement, comme dans le Core.
- `Room_Select1..30` câblés (comme le Core) alors que 17 pièces existent ; blocs pièce jusqu'à la 17 : c'est la
  dernière possible sur un EISC de 2732 joins (d2698), agrandir le symbole avant toute pièce 18.
- Pas de sous-systèmes Buffer par pièce dans le SMW (le Core n'en génère pas ; FTV Home oui) : à poser dans
  SIMPL Windows sur `Room_Selected#` (a10).
- Pièces sans moteur : 6 moteurs de repli `actif=false` (choix de `build_config.py`, non modifié).

## À faire ensuite
1. PC Windows : `npm install` dans `ch5/`, `deploy.secrets.psd1`, ouvrir `AppartementCrans.sln` (Visual Studio,
   NuGet 2.21.274) → CPZ ; ouvrir le SMW dans SIMPL Windows → LPZ ; corriger le générateur si SIMPL refuse.
2. Recette Debugger (`docs/CONTRAT-JOINS.md` § recette) sur le banc bureau (CP4 192.168.3.109).
3. Marques réelles des rideaux / stores et du CVC → drivers slot 2 ; modules Lutron HomeWorks QS avec les noms
   de zones de `circuits.lutron`.
4. Recette visuelle : faite le 27.09 sur la vitrine (Core 1.0.209) ; à refaire sur matériel (dalle, iPad, iPhone).
5. Quand le Core évolue : `python3 tools/assemble.py`, puis recompiler les trois artefacts.
