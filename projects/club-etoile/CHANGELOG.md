# Club Étoile — journal

## 1.0.1 — 27.09.2026 — revue critique du C# (relecture « compilateur », sans compilateur)
- `ControlSystem.cs` : `using Crestron.SimplSharpPro.EthernetCommunication` (nom du namespace, pas de la DLL) et
  `System.Threading.Timeout.Infinite` qualifié pour le CTimer dB (levée d'ambiguïté avec `Crestron.SimplSharp`).
- `ControlSystem.cs` `PushAudioLevelToPanel` : `Audio_Db#` borné 0..65535 avant le cast `ushort` et forcé à 0 quand
  `club.audio.actif` est faux (plus de dB affiché sur une fonction non déclarée).
- `ClubEtoileConfig.cs` : `strobeFrequenceMin` plancher à 1 (contrat 1-15 Hz ; un JSON à 0 ne pouvait plus être refusé).
- `docs/CONTRAT-JOINS.md` : plage du bloc club corrigée (500..750, occupés d611-654 / a520-541 ; « 754 » était faux).
- Relecture ligne à ligne des 4 .cs contre ftv-home (compilé) : usings, conversions uint/ushort/int, `out`, signatures
  SDK 2.21 (CTimer, Reset, Pulse, BasicTriList, EISC), verrous try/finally, timer arrêté et libéré à l'arrêt, `System.Random`
  en champ (jamais instancié dans le callback), aucune syntaxe > C# 5. Logique validée : chaque contrôle de l'inventaire §4 a
  join + handler + feedback ; macros décomposées ; affluence → ventilation/consigne ; dB simulé puis `_Actual` ; limiteur ;
  a10 + `Room_Active` avant chaque recopie ; analogiques bornés ; noms de signaux identiques Joins.cs / JSON / doc / SMW.
- `check-contract.js` et `generate_slot2.js` verts (156 signaux, SMW régénéré identique). Version 1.0.1 (JSON + AssemblyInfo).

## 1.0.0 — 27.09.2026
- Création du projet dans `projects/club-etoile/` (dossier unique), copie de l'architecture `ftv-home` / `yacht-asteria`.
- `config/club-etoile_config.json` : 3 étages, 3 salles (ids 1..3 = original / neon / sky de `club-rooms.json`), ambiance par
  salle (4 scènes Signature / Festif / Doux / Éteint + intensité) avec 4 circuits d'éclairage dérivés (piste, lyres, barres LED
  murales, boules à facettes), globaux club (affluence → CVC, audio piste/bar + dB + limiteur, effets fumée/strobe/lyres,
  écran DJ 4 sources, 4 raccourcis régie, navigation 3D), contrat v1.0 (globaux ≤ 250, bloc club 500 + join, blocs salle 1000 + 100).
- SIMPL# Pro slot 1 (`simpl-sharp/`) : routage par écran (`_activeRoomPerDevice`, 0 = tout le club → action propagée aux
  3 salles), a10 + `Room_Active_00/nn` posés avant chaque recopie EISC, feedback complet des écrans, blocs salle `_fb` / `_Actual`,
  bloc club `Club_xxx_fb`, macros décomposées en impulsions 250 ms, simulation dB par CTimer 1 s tant que le DSP ne parle pas,
  navigation bâtiment / étage / salle par écran (jamais sur l'EISC), transport de la configuration (s105/s106/d250/a250),
  console `clubstate` / `clubroom` / `clubtrace`.
- SIMPL Windows slot 2 (`simpl/simpl-windows/ClubEtoile_Slot2.smw`) généré : 156 signaux nommés, 3 sous-systèmes
  « Salle nn - Nom » avec Analog Buffer (`Room_Level#`) validé par `Room_Active_nn`.
- Outils : `tools/generate_slot2.js` (bloc club, garde-fous capacité EISC / chevauchements / doublons), `tools/check-contract.js` (vert).
- Non fait : compilation CPZ/LPZ sur le PC Windows, recette matériel, drivers (DMX, DSP, CTA, matrice vidéo), GUI CH5.
