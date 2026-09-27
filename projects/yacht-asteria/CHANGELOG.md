# Yacht Asteria — journal

## 1.0.1 — 27.09.2026
- Revue critique du C# (relecture type compilateur, étalon ftv-home) : aucune erreur de compilation détectée ; corrections
  `Timeout.Infinite` (Crestron.SimplSharp), écho `Effect_Actual#` ignoré si effet inchangé, `CustomScene()` sans repousse
  inutile, `OnOnlineStatus` protégé, sources audio par id. Cohérence Joins.cs ↔ JSON ↔ CONTRAT-JOINS.md ↔ générateur
  vérifiée ; `check-contract` et `generate_slot2` verts (1248 signaux, SMW régénéré à l'identique).

## 1.0.0 — 27.09.2026
- Création du projet dans `projects/yacht-asteria/` (dossier unique), copie de l'architecture `ftv-home`.
- `config/yacht-asteria_config.json` : 5 ponts, 37 espaces (ids 1..37 = clés GUI "0".."36" + 1), 5 circuits gradables par
  espace (canal « Piscines » actif dans 4 espaces seulement), audio partout (4 sources), 4 scènes globales, 4 couleurs
  préréglées, 3 effets (séquences du simulateur), cycle jour/nuit, contrat v1.0 (blocs espace 500 + 50).
- SIMPL# Pro slot 1 (`simpl-sharp/`) : routage par écran (`_activeRoomPerDevice`, 0 = tout le yacht → action propagée aux
  37 espaces), a10 + `Room_Active_00/nn` posés avant chaque recopie EISC, feedback complet des écrans, blocs espace
  `_fb` / `_Actual`, scènes, couleur des bandeaux R/G/B + presets, effets calculés par CTimer (350 ms, loi du simulateur),
  cycle jour/nuit sur `Daylight_*_Actual`, transport de la configuration (s105/s106/d250/a250), console
  `yachtstate` / `yachtroom` / `yachttrace`.
- SIMPL Windows slot 2 (`simpl/simpl-windows/YachtAsteria_Slot2.smw`) généré : 1248 signaux nommés, 37 sous-systèmes
  « Espace nn - Nom » avec Analog Buffer validé par `Room_Active_nn`.
- Outils : `tools/generate_slot2.js` (garde-fous capacité EISC, circuits inactifs, doublons), `tools/check-contract.js` (vert).
- Non fait : compilation CPZ/LPZ sur le PC Windows, recette matériel, drivers LED/audio, GUI CH5.
