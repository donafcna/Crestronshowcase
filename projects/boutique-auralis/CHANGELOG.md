# Boutique Auralis — journal

## 1.0.1 — 27.09.2026 (revue critique)
- C# : relecture « compilateur » complète (aucune erreur de compilation trouvée) ; `OnOnlineStatus` protégé par try/catch ;
  scène déclenchée par le cycle horaire recopiée sur l'EISC (a10 = 0 + `Room_Active_00` + impulsion `Scene_x`) ;
  `boutiqueroom` refuse un espace inconnu. AssemblyVersion 1.0.1.0, `meta.version` 1.0.1.
- Générateur : regex d'accents explicite (`\u0300-\u036f`) ; SMW régénéré, identique (659 signaux).
- Docs : `CONTRAT-JOINS.md` §2 et recette 10, `desc` horaires du JSON (recopie EISC de l'action automatique).

## 1.0.0 — 27.09.2026
- Création du projet dans `projects/boutique-auralis/` (dossier unique), copie de l'architecture `ftv-home`, style `yacht-asteria`.
- `config/boutique-auralis_config.json` : 2 niveaux, 15 espaces (hall, r1-r6, u1-u8 → ids 1..15), 6 circuits gradables par
  espace (« Lustre d'apparat » actif dans le hall seulement), audio partout (3 sources), 4 scènes par espace (Ouverture /
  Réception / Rendez-vous privé / Fermeture, niveaux du simulateur), stores 4 façades, éclairage général, blanc 2700-6500 K
  avec loi horaire, parfum (3 fragrances, diffusion), horaires 09:00-19:00 pas 15 min, contrat v1.0 (blocs espace 1000 + 100,
  bloc maison d301-324 / entrées _Actual).
- SIMPL# Pro slot 1 (`simpl-sharp/`) : routage par écran (`_activeRoomPerDevice`, 0 = toute la boutique → action propagée aux
  15 espaces), a10 + `Room_Active_00/nn` posés avant chaque recopie EISC, scènes appliquées à l'espace visé (ou à tous),
  feedback complet des écrans, blocs espace `_fb` / `_Actual` (+ `Rnn_Scene_fb#`), stores (position tenue + impulsions
  Up/Stop/Down 250 ms), blanc (kelvins directs, White_Auto par CTimer 1 min : 3500 / 4500 / 3000 K), parfum (interlocks),
  cycle horaire réel (CTimer 30 s, ouverture → Ouverture, fermeture → Fermeture sur toute la boutique), transport de la
  configuration (s105/s106/d250/a250), console `boutiquestate` / `boutiqueroom` / `boutiquetrace`.
- SIMPL Windows slot 2 (`simpl/simpl-windows/BoutiqueAuralis_Slot2.smw`) généré : 659 signaux nommés, 15 sous-systèmes
  « Espace nn - Nom » avec Analog Buffer validé par `Room_Active_nn`, bloc maison 23 signaux.
- Outils : `tools/generate_slot2.js` (garde-fous capacité EISC, circuits inactifs, doublons, impulsions maison),
  `tools/check-contract.js` (vert : globaux, bloc maison, blocs espace, limites, espaces, scènes, stores, blanc, parfum, horaires).
- Non fait : compilation CPZ/LPZ sur le PC Windows, recette matériel, drivers (gradateurs, moteurs de stores, blanc réglable,
  diffuseur, audio), GUI CH5.
