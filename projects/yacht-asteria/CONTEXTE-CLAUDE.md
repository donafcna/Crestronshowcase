# Yacht Asteria — contexte de reprise (< 150 lignes)

Mis à jour le 27.09.2026 (v1.0.1 : première livraison v1.0.0 puis revue critique du C#, voir section « Revue »).

## Ce que c'est
Backend Crestron du GUI showcase « M/Y Asteria » (`yacht-monaco`, socle web `apps/showcase/public/ftv-luxury/gui.js` +
`catalog.js`, cycle jour/nuit `yacht-scene-cycle.js`). Même architecture que `projects/ftv-home/` : C# SIMPL# Pro slot 1 +
SIMPL Windows slot 2 reliés par EISC F0 / 127.0.0.2, contrat propre écrit d'un bloc.

Règle de Donatien : **tout le code de ce projet reste dans `projects/yacht-asteria/`**, rien d'éparpillé.

## Les trois décisions structurantes (brief commun du 27.09)
1. Un **JSON** (`config/yacht-asteria_config.json`) sélectionne les fonctionnalités de chaque espace (`pilotages.*.actif`,
   et `actif` par circuit).
2. **`Room_Select#` (a10)** = espace visé (0 = tout le yacht), posé avant chaque action, avec `Room_Active_00/nn`
   (d100-140, un seul haut) pour valider des buffers côté slot 2.
3. **Chaque action a un join global identique pour tous les espaces** et remonte sous son nom nu dans le Debugger.

## Fichiers
- `config/yacht-asteria_config.json` : `meta`, `yacht` (scènes, couleurs, effets, cycle, sources), `etages` (5 ponts),
  `pieces` (37, ids 1..37 = clé GUI + 1), `contrat` (globaux, blocs espace 500 + 50, EISC, limites).
- `simpl-sharp/YachtAsteria/` : `Joins.cs`, `YachtAsteriaConfig.cs` (parse JSON), `YachtAsteriaState.cs`, `ControlSystem.cs`.
- `simpl/simpl-windows/YachtAsteria_Slot2.smw` : généré par `tools/generate_slot2.js` (1248 signaux, 37 Analog Buffers).
- `tools/check-contract.js` : JSON ↔ Joins.cs, chevauchements, limites, capacité EISC. Vert au 27.09.
- `docs/CONTRAT-JOINS.md` : contrat lisible + recette Debugger à faire.

## État au 27.09.2026
- C# : **jamais compilé** (aucun compilateur dans l'environnement de production du lot). Niveau de langage identique à
  ftv-home (pas de `$""`, `?.`, tuples, `out var`). À compiler dans Visual Studio (net47) pour produire le CPZ.
- SMW : généré et vérifié structurellement (1474 références de signaux résolues, index EISC uniques, CRLF, aucun doublon).
  **Jamais ouvert dans SIMPL Windows** : première action à faire, puis F12 → LPZ.
- GUI CH5 de déploiement : inexistant (la GUI web du showcase est la seule). Contrat prêt (`Joins.cs` / `CONTRAT-JOINS.md`).
- Drivers slot 2 : aucun câblé (LED RGB, audio : marques inconnues).

## Décisions prises par défaut (à confirmer)
- **Blocs espace : base 500, taille 50** (37 × 50 → 500..2349 ; base 1000 × 50 aurait dépassé 2732 dès l'espace 35).
  Offsets : d+1-8 Light_n_On, d+11 Room_Displayed, d+21/22 Music_Playing/Muted ; a+1-8 Light_n_Level, a+21 Music_Volume,
  a+22 Music_Source ; s+10 Room_Name. `piecesMax` = 40 (500 + 40 × 50 − 1 = 2499 ≤ 2732).
- **`Room_Select_n` = d100 + n (d101-140)** ; `Room_Select_All` = d100 (a10 = 0). Les familles Lights_* ont donc glissé :
  Lights_AllOn/AllOff d151/152, Light_n_Toggle d161-168 (circuitsMax = 8, 5 utilisés).
- **« Tout le yacht » = Room_Select# 0** (pas d'id dédié) : espace virtuel en C# (`_all`, miroir de `state.zones.all` du
  GUI, jamais sur l'EISC). Une action reçue d'un écran qui affiche « Tout le yacht » est appliquée aux 37 espaces + au
  virtuel ; sur l'EISC : a10 = 0, `Room_Active_00` haut, action recopiée une fois, puis les `Rnn_xxx_fb` des 37 espaces.
  Le slot 2 doit combiner `Room_Active_00` en OR avec chaque `Room_Active_nn` s'il route par buffers (non généré).
- **Canal « pool »** : déclaré dans les 37 espaces (index 5 stable → `Light_5_Level#` = Piscines partout) mais
  `actif: false` hors des espaces à bassin (clés GUI 0, 10, 26, 36 → ids 1, 11, 27, 37). Un circuit inactif : niveau
  forcé à 0, ignoré par le C#, absent du SMW (26 signaux par bloc au lieu de 30). Le GUI l'affiche partout : à masquer
  côté CH5 selon la config transportée.
- **Couleur des bandeaux = option (a)** : `Color_R#/G#/B#` a21-23 (0-255) ↔ + `Color_Preset_1..4` d201-204 + `Color_Hex$`
  s22 (écrans seulement). L'utilisateur garde sa couleur (`UserRGB`) ; un effet actif pousse sa propre séquence sur
  `ColorRGB`, `Effect_Off` restaure la couleur choisie (comportement du simulateur).
- **Effets** : `Effect_Off/BlueWave/Rainbow/Champagne` d211-214 interlock, `Speed#` a24, `Effect#` a25 (fb). Cycle en C#
  par un CTimer unique (Reset/Stop), période 350 ms, pas += 0,012 + vitesse × 0,0003, séquences hex du simulateur dans
  le JSON. Couleurs poussées sur les analogiques a21-23 de l'EISC (fb) et des écrans ; tick ignoré si la couleur ne change pas.
- **Scènes globales** (scope toujours « all » dans le GUI) : d51-54 tenus = scène active, `Scene#` a26, `Scene_Name$` s12.
  Tout curseur / Toggle / AllOn / AllOff → « Ambiance personnalisée » (`Scene#` = 0). Une mesure `_Actual` du slot 2 ne
  change pas la scène affichée.
- **Cycle jour/nuit** : flag JSON `cycleAutomatique` (true) + entrées EISC `Daylight_Day_Actual` d221 /
  `Daylight_Night_Actual` d222 (horloge astronomique à poser dans le slot 2). Front montant seulement : jour → Croisière,
  nuit → Dîner à bord (clés `cycleJourNuit.jour/nuit`). Feedback d221/222 sur les écrans, aucun bouton de bascule.
- **Audio** : `Music_Source_1..4` d231-234 (sourcesMax 8), `Music_PlayPause` d241, `Music_Mute` d242 (réversible, volume
  conservé comme dans le GUI), `Music_Volume#` a30. Prev/Next absents du GUI → pas de join.
- **Lights_AllOn/AllOff et Light_n_Toggle** : absents du GUI yacht mais demandés → gardés, bascule 0/100 % comme ftv-home.
- **Tuile** : `Room_Subtitle$` = « Éteint » / « Éclairage moyen N % » (moyenne des circuits actifs), `Room_LightsAvg#` a41,
  `Yacht_Summary$` s13 = « 5 ponts · 37 espaces » calculé du JSON.
- Écran au démarrage sur « Tout le yacht » (zone initiale du GUI) ; état initial : scène Croisière, volume 35, source 1,
  lecture off, couleur #ffd7a2, effet off, vitesse 35.
- Commandes console `yachtstate` / `yachtroom` / `yachttrace` (préfixe court comme `ftv*`, le slug contient un tiret).
- csproj : copie ftv-home avec GUID neuf, `TargetFrameworkVersion` v4.6.1 (comme ftv-home, qui compile).
- Clé `signauxMaisonEisc` conservée dans le JSON (structure ftv-home) pour les signaux yacht renvoyés par le slot 2.
- Limite connue (héritée) : deux écrans qui pressent le même bouton en même temps ne produisent qu'un front sur l'EISC.

## Revue critique du 27.09.2026 (v1.0.1, relecture « compilateur » sans compilateur)
- Relecture ligne à ligne des 4 .cs contre ControlSystem.cs de ftv-home (SDK 2.21) : aucune erreur de type ni de
  signature trouvée (conversions ushort/int/uint/long, `out`, iterateurs `yield`, JToken `??`, CTimer 4 args, Reset/Stop).
- Corrigé : `Timeout.Infinite` de `Crestron.SimplSharp` (comme ftv-home) au lieu de `System.Threading` ;
  `Effect_Actual#` renvoyé par le slot 2 ne relance plus le cycle si l'effet est déjà celui-là (écho) ;
  `CustomScene()` ne repousse le bloc yacht que si la scène change (curseurs) ; `OnOnlineStatus` attrape ses exceptions ;
  sources audio cherchées par id (`SourceById`) et non par index de liste.
- Vérifié : chaque contrôle de l'inventaire §A/§1 a join + handler + feedback ; a10 + `Room_Active_nn` posés avant chaque
  recopie ; analogiques bornés (0-255, 0-100, 0-65535→%) ; `_Actual` font foi sans changer la scène ; noms identiques
  Joins.cs ↔ JSON ↔ CONTRAT-JOINS.md ↔ generate_slot2.js ; check-contract et generate_slot2 verts (1248 signaux).
- Limites assumées (non corrigées) : l'espace virtuel « Tout le yacht » n'est pas recalculé quand un espace seul change
  (miroir du GUI) ; un appui `Daylight_*` venant d'un écran serait recopié sur l'EISC mais n'y est pas câblé.

## Points douteux
- `CTimer(cb, obj, long, long)`, `Reset(long, long)` et `Stop()` : signatures du SDK 2.21 supposées ; à vérifier à la
  compilation (ftv-home n'utilise que `CTimer(cb, long)` + `Reset(long)`).
- Noms de sous-systèmes SIMPL avec « & » (« Spa & massage ») : accepté par Villa Crans, à confirmer à l'ouverture du SMW.

## À faire ensuite
1. Ouvrir/compiler `YachtAsteria_Slot2.smw` dans SIMPL Windows ; corriger le générateur si SIMPL refuse quelque chose.
2. Compiler le CPZ dans Visual Studio ; charger JSON + CPZ + LPZ ; recette Debugger (§5 du contrat).
3. Horloge astronomique dans le slot 2 → `Daylight_Day/Night_Actual` ; drivers LED (a21-23) et audio derrière les signaux.
4. Portage CH5 du GUI showcase (lot séparé), puis `meta.mode` deploiement/showcase comme Villa Crans.
