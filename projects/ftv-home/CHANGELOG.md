# FTV Home — journal

## 1.0.0 — 27.09.2026
- Création du projet dans `projects/ftv-home/` (dossier unique, décision Donatien).
- `config/ftvhome_config.json` : 8 pièces du simulateur FTV Home avec fonctionnalités par pièce, scènes maison,
  accès / piscine / spa, vidéo (4 écrans, 5 sources, 8 chaînes), musique (5 services, 6 favoris), contrat v1.0.
- SIMPL# Pro slot 1 (`simpl-sharp/`) : routage par écran (`_activeRoomPerDevice`), a10 + `Room_Active_nn` posés
  avant chaque recopie EISC, feedback complet des écrans, blocs pièce `_fb` / `_Actual`, scènes, garage temporisé,
  transport de la configuration (s105/s106/d250/a250), console `ftvstate` / `ftvroom` / `ftvtrace`.
- SIMPL Windows slot 2 (`simpl/simpl-windows/FtvHome_Slot2.smw`) généré : 428 signaux, 8 Analog Buffers par pièce.
- Outils : `tools/generate_slot2.js`, `tools/check-contract.js` (vert).
- Non fait : compilation CPZ/LPZ sur le PC Windows, recette matériel, drivers, GUI CH5.
