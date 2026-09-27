# Restaurant Kyoto Gardens — journal

## 1.0.1 — 27.09.2026 (revue critique)
- Relecture « compilateur » de tous les .cs (C# 5 / .NET 4.7, API SDK 2.21 confrontées à ftv-home) : aucune erreur de
  compilation trouvée (usings, conversions uint/ushort/int, `out`, lambdas console, ordre d'initialisation, verrous try/finally).
- Correctif logique : la zone virtuelle « Tout le restaurant » (a10 = 0) n'était mise à jour que par les actions lancées
  depuis « tout » ; un écran sur « tout » affichait des niveaux périmés après une action sur une zone. Elle est désormais
  toujours dérivée des 16 zones (`SyncAll` : moyenne par circuit, scène commune sinon « Personnalisée ») ; `Room_LightsOn#`
  sur « tout » = total du restaurant.
- `OnOnlineStatus` : exception attrapée et journalisée (verrou toujours libéré).
- Vérifié : joins / handlers / feedbacks de chaque contrôle de l'inventaire, a10 + Room_Active posés avant chaque recopie,
  bornes (volume ≤ 80, consigne 18-25 au pas 0,5), `_Actual` prioritaires, libellés extérieur / intérieur, noms de signaux
  identiques dans Joins.cs, JSON, CONTRAT-JOINS.md et le SMW généré. `check-contract` et `generate_slot2` verts.

## 1.0.0 — 27.09.2026
- Création du projet dans `projects/restaurant-kyoto/` (dossier unique), copie de l'architecture `ftv-home`, style
  `yacht-asteria` (Room_Select_n = d100+n, Room_Select# 0 = tout, Room_Active_00, Scene# / Scene_Name$).
- `config/restaurant-kyoto_config.json` : 1 étage « Restaurant », 16 zones (ids 1..16, Extérieur = 1, ordre du GUI),
  4 circuits gradables par zone (libellés intérieur / extérieur du GUI), 5 scènes PAR ZONE avec niveaux et libellés
  extérieurs, globaux restaurant (climat 18-25 °C pas 0,5, musique 0-80 + lecture + 3 égaliseurs, service 4 états,
  couverts), contrat v1.0 (blocs zone 1000 + 100).
- SIMPL# Pro slot 1 (`simpl-sharp/`) : routage par écran (`_activeRoomPerDevice`, 0 = tout le restaurant → action
  propagée aux 16 zones), a10 + `Room_Active_00/nn` posés avant chaque recopie EISC, scènes par zone (curseur → « Personnalisée »),
  feedback complet des écrans, blocs zone `_fb` / `_Actual` (+ `Rnn_Scene`), globaux restaurant tenus sur l'EISC (a60, a30)
  et renvoyés par `_Actual`, transport de la configuration (s105/s106/d250/a250), console `kyotostate` / `kyotoroom` / `kyototrace`.
- SIMPL Windows slot 2 (`simpl/simpl-windows/RestaurantKyoto_Slot2.smw`) généré : 443 signaux nommés, 16 sous-systèmes
  « Espace nn - Nom » avec Analog Buffer validé par `Room_Active_nn`.
- Outils : `tools/generate_slot2.js` (garde-fous capacité EISC, circuits inactifs, doublons, ASCII), `tools/check-contract.js` (vert).
- Non fait : compilation CPZ/LPZ sur le PC Windows, recette matériel, drivers DALI/DMX, CVC, audio, appel de service, GUI CH5.
