# VCA / Sunrays — validation du 20 septembre 2026

Les deux concepts approuvés sont intégrés au véritable site React/Vite. Les routes historiques sont conservées, avec ajout du support iPhone (`phone` et démo mobile `#demo/<projet>`).

- `results.json` : 117 états d’interface, cinq dimensions (1280×800, 1024×768, 402×781, 390×844, 320×740), trois thèmes aux formats dalle et iPhone, autres dimensions en Sombre. Pages Lumière, Musique, Ambiances et Vue 3D, sous-pages et états lecture/sourdine.
- 33 contrôles réussis : sélection bidirectionnelle, éclairage, sept supports au total en Mode normal et Mode Scène, routes iPhone, absence d’erreur JavaScript, contraste du texte ≥4:1, débordements et cibles tactiles.
- `tour-results.json` : test du parcours automatique et de la priorité manuelle, exécuté séparément avec pointeur de bureau : 11 contrôles réussis, trois espaces par projet, deux sources musicales, variation de volume et arrêt de lecture.
- `comparaison.png` et `comparison.html` : avant (commit initial `3a64d146`) et après, trois thèmes en colonnes.
- `build.log`, `lint.log` : build réussi et lint sans erreur. Les avertissements résiduels concernent des fichiers préexistants.
- `quality.log` : 39/43 tests du contrat général réussis ; quatre échecs préexistants de version avec le socle CH5 1.0.196. Les fichiers correspondants n’ont pas été modifiés. La CI initiale était déjà en échec : https://github.com/donafcna/Crestronshowcase/actions/runs/35425435756.

Les essais sont faits sous Chromium avec WebGL logiciel. Les fontes Google du site hôte sont bloquées pour rendre les essais indépendants du réseau ; les GUI utilisent Arial et Georgia locales. Les captures des fiches sont des PNG indexés 256 couleurs. Le moteur de test de contraste provient du script existant `check-contrast-dom.mjs` et compose les fonds transparents.

Safari, iPhone physique, plein écran du navigateur F11 et matériel Crestron ne sont pas testés. Le plein écran GUI `/3` ne concerne pas le smartphone. Aucun écran modal nouveau dans ces GUI ; aucune nouvelle fenêtre d’alarme. Le modèle 3D est une proposition conceptuelle, pas un relevé architectural ou naval. Aucun son ni raccordement à une installation physique.

Reproduction : depuis `apps/showcase`, exécuter `npm run build`, `npm run lint`, puis `node scripts/test-luxury-3d.mjs` et `node scripts/test-luxury-tour.mjs` avec Playwright disponible. `PLAYWRIGHT_MODULE`, `BROWSER_EXE`, `BROWSER_ARGS`, `BASE_URL` et `TEST_OUTPUT` permettent d’adapter le runtime et de contrôler une URL déployée. `BASELINE_DIST` est réservé au dossier compilé du commit de départ pour la comparaison avant/après.

Les chemins absolus du runtime ont été remplacés par `<checkout>` dans les logs partagés.
