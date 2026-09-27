# Club Étoile — contexte de reprise (< 150 lignes)

Mis à jour le 27.09.2026 (v1.0.1 : première livraison v1.0.0 puis revue critique du C#, voir « Revue »).

## Ce que c'est
Backend Crestron du GUI showcase « Club Étoile » (`club-etoile`, simulateur `apps/showcase/src/components/simulators/ClubEtoile.jsx`,
3D `public/ftv-luxury/venues/venue.js`, salles `club-rooms.json`). Même architecture que `projects/ftv-home/` et
`projects/yacht-asteria/` : C# SIMPL# Pro slot 1 + SIMPL Windows slot 2 reliés par EISC F0 / 127.0.0.2, contrat propre écrit d'un bloc.

Règle de Donatien : **tout le code de ce projet reste dans `projects/club-etoile/`**, rien d'éparpillé.

## Les trois décisions structurantes (brief commun du 27.09)
1. Un **JSON** (`config/club-etoile_config.json`) sélectionne les fonctionnalités de chaque salle (`pilotages.*.actif`) et du club
   (`club.*.actif`).
2. **`Room_Select#` (a10)** = salle visée (0 = tout le club), posé avant chaque action, avec `Room_Active_00/nn` (d100-110, un seul
   haut) pour valider des buffers côté slot 2.
3. **Chaque action a un join global identique pour toutes les salles** et remonte sous son nom nu dans le Debugger.

## Fichiers
- `config/club-etoile_config.json` : `meta`, `club` (scènes, affluence, cvc, audio, effets, ecranDj, macros, navigation), `etages` (3),
  `pieces` (3, ids 1..3 = clés GUI original/neon/sky), `contrat` (globaux, bloc club 500, blocs salle 1000 + 100, EISC, limites).
- `simpl-sharp/ClubEtoile/` : `Joins.cs`, `ClubEtoileConfig.cs` (parse JSON), `ClubEtoileState.cs`, `ControlSystem.cs`.
- `simpl/simpl-windows/ClubEtoile_Slot2.smw` : généré par `tools/generate_slot2.js` (156 signaux, 3 Analog Buffers).
- `tools/check-contract.js` : JSON ↔ Joins.cs, chevauchements, limites, bloc club, capacité EISC. Vert au 27.09.
- `docs/CONTRAT-JOINS.md` : contrat lisible + recette Debugger à faire.

## État au 27.09.2026
- C# : **jamais compilé** (aucun compilateur dans l'environnement du lot). Niveau de langage identique à ftv-home (pas de `$""`,
  `?.`, tuples, `out var`). À compiler dans Visual Studio (net47) pour produire le CPZ.
- SMW : généré et vérifié structurellement (162 références de signaux résolues, index EISC uniques, CRLF, aucun doublon, noms ASCII).
  **Jamais ouvert dans SIMPL Windows** : première action à faire, puis F12 → LPZ.
- GUI CH5 de déploiement : inexistant (le simulateur React du showcase est la seule GUI). Contrat prêt (`Joins.cs` / `CONTRAT-JOINS.md`).
- Drivers slot 2 : aucun câblé (DMX/lyres, DSP, CTA, machine CO2, stroboscope, matrice vidéo : marques inconnues).

## Décisions prises par défaut (à confirmer)
- **Blocs salle : base 1000, taille 100** (3 × 100 → 1000..1299). `piecesMax` = **10** (1000 + 10 × 100 − 1 = 1999 ≤ 2732 ;
  17 aurait été le maximum du socle). `Room_Select_n` = d100 + n (d101-110), `Room_Select_All` = d100 (a10 = 0).
- **« Tout le club » = Room_Select# 0** : une action reçue d'un écran qui affiche tout le club est appliquée aux 3 salles ; sur
  l'EISC : a10 = 0, `Room_Active_00` haut, action recopiée une fois, puis les `Rnn_xxx_fb` des 3 salles. Feedback « Tout le club » :
  scène commune ou `Scene#` = 0 / « Ambiances mixtes », intensité = moyenne, circuits = moyenne par index. Pas de salle virtuelle
  dans l'état C# (contrairement au yacht) : rien à tenir puisque tout est dérivé.
- **Écran au démarrage sur la salle « original » (id 1), vue « Bâtiment »** (état initial du simulateur : `clubRoom` = original,
  `clubView` = building). `Room_Select_n` fait passer l'écran en vue « Salle » et pose l'étage (comportement `changeRoom()`).
- **Ambiance par salle** : `Scene_Signature/Party/Calm/Off` d51-54 tenus (interlock), `Room_Level#` a11 « Intensité » 0-65535,
  `Scene#` a12, `Scene_Name$` s12, `Room_Subtitle$` = « Signature · 75 % ». État initial : signature, 75.
- **4 circuits dérivés, jamais pilotés un par un** (le GUI n'a qu'un curseur d'intensité) : niveau = clamp(intensité × facteur de
  scène × coefficient), facteurs du simulateur (`venue.js` : party 1,25 / signature 0,8 / calm 0,3 / off 0), coefficients choisis
  (piste 1,0 · lyres 1,0 · barres 0,9 · boules 0,7 — à ajuster dans le JSON). Sur les écrans : `Light_n_Level#` a51-58 en lecture
  seule ; vers le slot 2 : `Rnn_Light_n_On/Level_fb`. Une mesure `_Actual` d'un circuit remplace le niveau dérivé jusqu'au
  prochain changement d'ambiance. Le circuit « Lyres » est la lumière des lyres ; `Lyres_On/Off` est leur mouvement.
- **Bloc club `Club_xxx_fb` = 500 + join global** (nouveauté par rapport à ftv-home) : les macros et l'affluence changent des
  états sans impulsion écran, et la consigne CVC est calculée ; le slot 2 a donc besoin d'états tenus. Impossible de les mettre au
  même index que l'action (collision de sortie) → bloc dédié. `signauxMaisonEisc.digitalFb/analogFb` le décrivent ;
  `check-contract.js` impose base > dernier join global et blocs salle > bloc club.
- **Macros** (d161-164) : recopiées sous leur nom nu, puis actions élémentaires pulsées 250 ms sur l'EISC (`Crowd_*`, `Strobe_*`,
  `Smoke_*`) et volumes posés sur a30/a31. Feedbacks : PeakAlert = packed ∧ strobe ∧ fumée ; CalmEnd = ¬strobe ∧ ¬fumée (sans
  tester l'affluence, pour la scène rapide « Calme » du smartphone) ; AllOff = cozy ∧ ¬strobe ∧ ¬fumée ∧ volumes 0 ;
  PartyQuick = strobe ∧ fumée.
- **Affluence** (d111-113 interlock) pose `HVAC_Fan#` (ensuite réglable au curseur jusqu'au prochain changement) et
  `HVAC_Setpoint#` (calculée, ← écrans, poussée au slot 2 par `Club_HVAC_Setpoint_fb#`). Aucun bouton −/+ de consigne (le GUI
  n'en a pas). `HVAC_CTA_Online` haut par défaut (`ctaEnLigneParDefaut`), `HVAC_Temperature#` initial 19,0 °C = consigne.
- **dB** : `Audio_Db#` a32 simulé par un CTimer 1 s (10 + ⌊vol × 0,95⌋ ± 2, `System.Random`) tant que `Audio_Db_Actual#` n'a jamais
  été reçu (flag `DbFromSlot2`, définitif jusqu'au redémarrage) ; `Audio_Limiter` = dB ≥ 105 ∨ `Audio_Limiter_Actual`. Le tick ne
  pousse que si la valeur change (écrans + `Club_Audio_Limiter_fb`).
- **Effets** : paires On/Off (d141-146) avec fb tenus complémentaires ; `Strobe_Freq#` 1-15 direct, borné par le JSON.
  Le GUI phone utilise des Toggle : côté CH5, un toggle = appui sur On ou Off selon le fb.
- **Écran DJ** : `Screen_Source_1..4` d151-154 interlock + `Screen_Source#` a41 + `Screen_Source_Name$` s25 ; entrées
  `Screen_Source_n_Actual` (front montant).
- **Navigation** `Club_View_Building/Floor/Room` d171-173 + `Club_Floor#` a42 : état par écran (`_navPerDevice`), jamais recopié
  sur l'EISC (exclu dans `MirrorToEisc`). `Club_Floor#` reçu en vue « Salle » bascule en vue « Étage » sans changer la salle.
- Textes des tuiles (`HVAC_Status$`, `Smoke_Status$`, `Strobe_Status$`, `Audio_Limiter_Text$`, `Crowd_Name$`) dans le JSON ;
  `Room_Mood$` / `Room_Color$` reprennent `club-rooms.json`. Horloge : locale à l'écran, aucun join.
- Commandes console `clubstate` / `clubroom` / `clubtrace`. CH5 project name `clubetoile`. csproj = yacht (net47, GUID neuf).
- Limite connue (héritée) : deux écrans qui pressent le même bouton en même temps ne produisent qu'un front sur l'EISC.

## Revue du 27.09 (v1.0.1, relecture « compilateur » sans compilateur, étalon ftv-home compilé)
- Relu ligne à ligne : usings, uint/ushort/int, `out` C# 5, signatures SDK 2.21 (CTimer/Reset/Pulse/EISC/BasicTriList),
  try/finally sur `_lock`, timer Stop+Dispose à l'arrêt, `System.Random` en champ, rien au-delà de C# 5. Aucun défaut bloquant.
- Corrigé : namespace `EthernetCommunication` (singulier), `System.Threading.Timeout.Infinite` qualifié, `Audio_Db#` borné et
  nul si audio inactif, `strobeFrequenceMin` ≥ 1, plage du bloc club dans la doc (500..750).
- Validé : chaque contrôle de l'inventaire §4 a join + handler + feedback ; macros → impulsions élémentaires après a10 ;
  affluence → ventilation/consigne ; dB simulé jusqu'au premier `Audio_Db_Actual#` ; limiteur ; noms identiques dans
  Joins.cs / JSON / CONTRAT-JOINS.md / SMW (vérifié par script). Écart assumé : la scène rapide « Calme » du smartphone
  passe par `Macro_CalmEnd`, qui pose aussi l'affluence « Calme » (le simulateur ne touche que strobe/fumée).
- Reste vrai : `BoolInputSig.Pulse(int)` et `System.Random` n'ont jamais été compilés ici (identiques à ftv-home, qui compile).

## Points douteux
- Coefficients des circuits (0,9 / 0,7) inventés : le simulateur n'a qu'une intensité globale par salle.
- Noms de sous-systèmes SIMPL : le « · » des noms de salles est remplacé par « - » (`Salle 01 - Studio 77 - Disco`).

## À faire ensuite
1. Ouvrir/compiler `ClubEtoile_Slot2.smw` dans SIMPL Windows ; corriger le générateur si SIMPL refuse quelque chose.
2. Compiler le CPZ dans Visual Studio ; charger JSON + CPZ + LPZ ; recette Debugger (§5 du contrat).
3. Donner les marques (DMX, DSP, CTA, machine CO2, strobe, matrice) → câbler les drivers derrière le bloc club et les blocs salle.
4. Portage CH5 du simulateur (lot séparé), puis `meta.mode` deploiement/showcase comme Villa Crans.
