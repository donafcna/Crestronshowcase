# Boutique Auralis — contexte de reprise (< 150 lignes)

Mis à jour le 27.09.2026 (v1.0.1 : première livraison v1.0.0 par sous-agent, puis revue critique du même jour).

## Ce que c'est
Backend Crestron du GUI showcase « Maison Auralis » (`boutique-hermes`, socle web `apps/showcase/public/ftv-luxury/gui.js` +
`catalog.js`, partagé avec le yacht). Même architecture que `projects/ftv-home/` et `projects/yacht-asteria/` : C# SIMPL# Pro
slot 1 + SIMPL Windows slot 2 reliés par EISC F0 / 127.0.0.2, contrat propre écrit d'un bloc.

Règle de Donatien : **tout le code de ce projet reste dans `projects/boutique-auralis/`**, rien d'éparpillé.

## Les trois décisions structurantes (brief commun du 27.09)
1. Un **JSON** (`config/boutique-auralis_config.json`) sélectionne les fonctionnalités de chaque espace (`pilotages.*.actif`,
   `actif` par circuit) et les fonctions boutique (`boutique.stores/blanc/parfum/horaires/eclairageGeneral.actif`).
2. **`Room_Select#` (a10)** = espace visé (0 = toute la boutique), posé avant chaque action, avec `Room_Active_00/nn`
   (d100-117, un seul haut) pour valider des buffers côté slot 2.
3. **Chaque action a un join global identique pour tous les espaces** et remonte sous son nom nu dans le Debugger.

## Fichiers
- `config/boutique-auralis_config.json` : `meta`, `boutique` (scènes, éclairage général, stores, blanc, parfum, horaires,
  sources), `etages` (2 niveaux), `pieces` (15, ids 1..15 = hall, r1-r6, u1-u8), `contrat` (globaux, bloc maison, blocs
  espace 1000 + 100, EISC, limites).
- `simpl-sharp/BoutiqueAuralis/` : `Joins.cs`, `BoutiqueAuralisConfig.cs` (parse JSON), `BoutiqueAuralisState.cs`, `ControlSystem.cs`.
- `simpl/simpl-windows/BoutiqueAuralis_Slot2.smw` : généré par `tools/generate_slot2.js` (659 signaux, 15 Analog Buffers).
- `tools/check-contract.js` : JSON ↔ Joins.cs, chevauchements, limites, capacité EISC, bloc maison. Vert au 27.09.
- `docs/CONTRAT-JOINS.md` : contrat lisible + recette Debugger à faire.

## État au 27.09.2026
- C# : **jamais compilé** (aucun compilateur dans l'environnement du lot). Niveau de langage identique à ftv-home (pas de
  `$""`, `?.`, tuples, `out var`). À compiler dans Visual Studio (net47) pour produire le CPZ.
- SMW : généré et vérifié structurellement (765 références de signaux résolues, 568 index EISC uniques, CRLF, aucun doublon,
  noms ASCII). **Jamais ouvert dans SIMPL Windows** : première action à faire, puis F12 → LPZ.
- GUI CH5 de déploiement : inexistant (la GUI web du showcase est la seule). Contrat prêt (`Joins.cs` / `CONTRAT-JOINS.md`).
- Drivers slot 2 : aucun câblé (gradateurs, moteurs de stores, blanc réglable, diffuseur de parfum, audio : marques inconnues).

## Décisions prises par défaut (à confirmer)
- **Blocs espace : base 1000, taille 100** (15 × 100 → 1000..2499). `piecesMax` = 17 (1000 + 17 × 100 − 1 = 2699 ≤ 2732),
  donc `Room_Select_n` = d101-117. Offsets (style yacht) : d+1-8 Light_n_On, d+11 Room_Displayed, d+21/22 Music_Playing/Muted ;
  a+1-8 Light_n_Level, a+21 Music_Volume, a+22 Music_Source, **a+25 Scene (fb seul, scène active de l'espace)** ; s+10 Room_Name.
- **« Toute la boutique » = Room_Select# 0** (`Room_Select_All` d100) : espace virtuel `_all` en C# (miroir de `state.zones.all`),
  jamais sur l'EISC. Action depuis un écran sur « Toute la boutique » → 15 espaces + virtuel ; sur l'EISC a10 = 0,
  `Room_Active_00` haut, action recopiée une fois, puis les `Rnn_xxx_fb` de chaque espace.
- **Scènes par espace** (scope = zone du simulateur) : `Scene_Opening/Gala/Private/Closed` d51-54 s'appliquent à l'espace visé
  (tous si a10 = 0). Chaque espace garde `Scene` (0 = personnalisée) ; fb d51-54 / `Scene#` a26 / `Scene_Name$` s12 = scène de
  l'espace affiché ; pour « Toute la boutique » = scène commune aux 15 espaces, sinon 0. Curseur / Toggle / éclairage général →
  personnalisée sur les espaces visés. Une mesure `_Actual` du slot 2 ne change pas la scène. (Le simulateur garde un seul
  `preset` global : choix par espace jugé plus juste pour un vrai bâtiment.)
- **Lustre d'apparat (`chandelier`)** : déclaré dans les 15 espaces (index 6 stable → `Light_6_Level#` = Lustre partout) mais
  `actif: false` hors du hall (id 1). Circuit inactif : niveau forcé à 0, ignoré par le C#, absent du SMW (bloc hall 35 signaux,
  autres 31). Le GUI l'affiche partout : à masquer côté CH5 selon la config transportée. `check-contract.js` impose la règle.
- **Éclairage général** `Lights_AllOn/AllOff` d151/152 : tous les circuits actifs de **tous** les espaces (bouton du GUI, jamais
  limité à a10) ; a10 est quand même posé sur l'EISC avant la recopie (mécanisme générique). fb tenu = tout allumé / tout éteint.
- **Stores** : `Blinds_n_Open/Half/Close` d171-174 / 181-184 / 191-194 (n = façade 1 nord, 2 sud, 3 est, 4 ouest),
  `Blinds_All_*` d175/185/195 ; position tenue 100/50/0 % sur `Blinds_n_Position#` a31-34 (fb écrans + sortie EISC tenue, entrée
  `_Actual`), impulsions moteur `Blinds_n_Up/Stop/Down` d301-304/311-314/321-324 (250 ms, sortie EISC seule, `Joins.House`).
  Un curseur sur `Blinds_n_Position#` est ramené à Open (≥ 75 %), Close (≤ 25 %) ou Half. Position initiale ouverte (simulateur).
  Le simulateur ne tient qu'un état global de stores : ici un état par façade, « toutes » = fb quand les 4 façades concordent.
- **Blanc** : `White_Temperature#` a21 en kelvins directs (2700-6500, pas 100, arrondi au pas), `White_Auto` d201 bascule
  (fb tenu). Loi horaire du simulateur dans le JSON (`loiHoraire` : < 12 h 3500 K, < 16 h 4500 K, sinon 3000 K) recalculée par
  CTimer 1 min et immédiatement à l'activation ; un réglage manuel coupe l'automatisme (simulateur). Kelvin tenu sur l'EISC.
- **Parfum** : `Scent_On/Off` d211/212 interlock, `Scent_Fragrance_1..3` d221-223 (fragrancesMax 8), `Scent_Diffusion#` a22,
  `Scent_Fragrance_Name$` s16. État initial : diffusion active, Bois d'ambre, 30 %.
- **Horaires** : `Schedule_On/Off` d231/232, `Schedule_Opening/Closing_Up/Down` d233-236 (± 15 min, bouclage 24 h),
  `Schedule_Opening#/Closing#` a23/24 (0-1439, réglage direct possible), `Schedule_Opening$/Closing$` s14/15 « HH:MM ».
  Cycle réel : CTimer 30 s compare l'heure système (une fois par minute) ; ouverture → scène Ouverture sur **toute la
  boutique**, fermeture → Fermeture (brief ; le simulateur appliquait à la zone affichée). Pas d'entrée `_Actual` (état C# seul).
  Initial : off, 09:00-19:00.
- **Audio** : `Music_Source_1..3` d241-243 (sourcesMax 8), `Music_PlayPause` d261, `Music_Mute` d262 (volume conservé),
  `Music_Volume#` a30 ; propagé à tous les espaces depuis « Toute la boutique » (audioSet du simulateur).
- **Tuile** : `Room_Subtitle$` = « Éteint » / « Éclairage moyen N % », `Room_LightsAvg#` a41, `Boutique_Summary$` s13 =
  « 2 niveaux · 15 espaces » calculé du JSON (le GUI affiche « 2 niveaux · 14 salons » en dur : hall compté ici).
- Écran au démarrage sur « Toute la boutique » ; état initial : scène Fermeture partout, stores ouverts, 3000 K, auto off,
  parfum on, volume 35, source 1, lecture off.
- Commandes console `boutiquestate` / `boutiqueroom` / `boutiquetrace` (préfixe court comme `yacht*`, le slug contient un tiret).
- csproj : copie yacht/ftv-home avec GUID neuf, `TargetFrameworkVersion` v4.6.1 (comme ftv-home, qui compile). CH5 project name `boutiqueauralis`.
- Clé `signauxMaisonEisc` (structure ftv-home) = bloc maison : `digitalActual`, `analogActual` + nouvelle table `digitalPulse`
  (impulsions moteurs), vérifiée par `check-contract.js` contre `Joins.House`.
- Limite connue (héritée) : deux écrans qui pressent le même bouton en même temps ne produisent qu'un front sur l'EISC.

## Revue du 27.09 (sous-agent, relecture « compilateur » C# 5 / .NET 4.7 + logique) — corrigé
Relecture ligne à ligne des 4 .cs contre ftv-home (étalon compilé) : usings, conversions uint/ushort/int, portées de
variables, `out`, iterators `yield`, signatures SDK (CTimer 4 args, Stop/Dispose, Pulse(int), AddNewConsoleCommand
lambda) : rien à corriger côté compilation. Logique vérifiée : chaque contrôle de l'inventaire a join + handler + fb ;
espace virtuel `_all` cohérent (union des circuits, propagation TargetsWithAll) ; a10 + Room_Active posés avant chaque
recopie (MirrorToEisc) ; analogiques recopiés bornés (BoundedAnalog) ; `_Actual` font foi puis `_fb` repoussés ;
loi horaire et cycle horaire (DateTime.Now, minute unique, bouclage 24 h) ; timers Stop+Dispose à l'arrêt ;
Joins.cs ↔ JSON ↔ CONTRAT-JOINS.md ↔ generate_slot2.js : noms identiques (vérifié par script).
Corrigé : `OnOnlineStatus` sans catch (exception d'un push remontait au thread Crestron) ; scène du cycle horaire
désormais recopiée sur l'EISC (a10 = 0, Room_Active_00, impulsion Scene_x) pour respecter la règle 3 ; `boutiqueroom`
refusait silencieusement un espace inconnu tout en annonçant le succès ; regex d'accents du générateur écrite en
`\u0300-\u036f` (caractères combinants littéraux fragiles). SMW régénéré : identique (659 signaux). Version 1.0.1.

## Points douteux
- `CTimer(callback, null, due, période)` et `Stop()` : signatures supposées identiques au SDK 2.21 (Villa Crans / yacht) ;
  à vérifier à la compilation. `DateTime.Now` supposé à l'heure locale du CP4.
- `Math.Round` arrondi bancaire pour le pas de 100 K (3050 → 3000) : sans conséquence visible.
- Noms de sous-systèmes SIMPL avec « & » et apostrophe droite (« Hall & escalier d'apparat ») : à confirmer à l'ouverture du SMW.

## À faire ensuite
1. Ouvrir/compiler `BoutiqueAuralis_Slot2.smw` dans SIMPL Windows ; corriger le générateur si SIMPL refuse quelque chose.
2. Compiler le CPZ dans Visual Studio ; charger JSON + CPZ + LPZ ; recette Debugger (§5 du contrat).
3. Drivers dans le slot 2 derrière les signaux nommés (gradateurs, moteurs, blanc, diffuseur, audio).
4. Portage CH5 du GUI showcase (lot séparé), puis `meta.mode` deploiement/showcase comme Villa Crans.
