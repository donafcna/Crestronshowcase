# Restaurant Kyoto Gardens — contexte de reprise (< 150 lignes)

Mis à jour le 27.09.2026 (v1.0.1 : première livraison v1.0.0 par sous-agent, puis revue critique v1.0.1).

## Ce que c'est
Backend Crestron du GUI showcase « Kyoto Gardens » (`sushi-bar-kyoto`, simulateur React
`apps/showcase/src/components/simulators/SushiBarKyoto.jsx` — la fiche produit décrit une autre GUI : ignorée, seul le code
fait foi). Même architecture que `projects/ftv-home/` : C# SIMPL# Pro slot 1 + SIMPL Windows slot 2 reliés par EISC F0 /
127.0.0.2, contrat propre écrit d'un bloc, style aligné sur `projects/yacht-asteria/` (projet frère).

Règle de Donatien : **tout le code de ce projet reste dans `projects/restaurant-kyoto/`**, rien d'éparpillé.

## Les trois décisions structurantes (brief commun du 27.09)
1. Un **JSON** (`config/restaurant-kyoto_config.json`) sélectionne les fonctionnalités de chaque zone (`pilotages.*.actif`,
   `actif` par circuit) et les globaux restaurant (`restaurant.climat/musique/service.actif`).
2. **`Room_Select#` (a10)** = zone visée (0 = tout le restaurant), posé avant chaque action, avec `Room_Active_00/nn`
   (d100-117, un seul haut) pour valider des buffers côté slot 2.
3. **Chaque action a un join global identique pour toutes les zones** et remonte sous son nom nu dans le Debugger.

## Fichiers
- `config/restaurant-kyoto_config.json` : `meta`, `restaurant` (scènes + libellés extérieurs, climat, musique, service),
  `etages` (1), `pieces` (16, ids 1..16 dans l'ordre du GUI, Extérieur = 1), `contrat` (globaux, blocs zone 1000 + 100,
  `signauxMaisonEisc` = bloc restaurant, EISC, limites).
- `simpl-sharp/RestaurantKyoto/` : `Joins.cs`, `RestaurantKyotoConfig.cs` (parse JSON), `RestaurantKyotoState.cs`, `ControlSystem.cs`.
- `simpl/simpl-windows/RestaurantKyoto_Slot2.smw` : généré par `tools/generate_slot2.js` (443 signaux, 16 Analog Buffers).
- `tools/check-contract.js` : JSON ↔ Joins.cs, chevauchements, limites, plages {n}, capacité EISC. Vert au 27.09.
- `docs/CONTRAT-JOINS.md` : contrat lisible + recette Debugger à faire.

## État au 27.09.2026
- C# : **jamais compilé** (aucun compilateur dans l'environnement du lot). Niveau de langage identique à ftv-home (pas de
  `$""`, `?.`, tuples, `out var`). À compiler dans Visual Studio (net47) pour produire le CPZ.
- SMW : généré et vérifié structurellement (523 références de signaux résolues, 379 index EISC uniques, CRLF, aucun
  doublon, noms ASCII). **Jamais ouvert dans SIMPL Windows** : première action à faire, puis F12 → LPZ.
- GUI CH5 de déploiement : inexistant (la GUI web du showcase est la seule). Contrat prêt (`Joins.cs` / `CONTRAT-JOINS.md`).
- Drivers slot 2 : aucun câblé (DALI/DMX, CVC, Sonos/Dante, appel de service : marques inconnues).

## Décisions prises par défaut (à confirmer)
- **Blocs zone : base 1000, taille 100** (16 × 100 → 1000..2599 ≤ 2732). `piecesMax` = 17 (1000 + 17 × 100 − 1 = 2699) :
  `Room_Select_{n}` = d101-117, `MaxRooms` = 17. Une 18e zone impose taille 50 (ou base plus basse) — le générateur refuse.
  Offsets : d+1-8 Light_n_On, d+11 Room_Displayed ; a+1-8 Light_n_Level, a+20 Scene ; s+10 Room_Name. Pas d'audio ni de
  climat par zone (globaux).
- **Zones = ids 1..16 dans l'ordre du GUI** (`exterior` = 1). `cle` = identifiant texte du GUI (pas la convention
  « clé = id − 1 » du yacht). `exterieur: true` sur la zone 1 → libellés de scène `libellesScenesExterieur` (objet par clé
  de scène, mêmes ids, mêmes niveaux que l'intérieur, comme dans le GUI).
- **Scènes PAR ZONE** : `Scene_Welcome..Closed` d51-55 ↔ appliquées à la zone a10 (0 = toutes = `applyAllScene`) ; fb tenu =
  scène de la zone affichée ; `Scene#` a26 ; `Scene_Name$` s12 (« Personnalisée » dès qu'un curseur / Toggle / AllOn / AllOff
  touche la zone). `Rnn_Scene_fb#` / `_Actual#` (+20) : un `_Actual` change le marqueur, pas les niveaux. Pas de join
  « Scene_All_n » séparé : a10 = 0 + `Scene_x` le remplace (Room_Active_00 haut).
- **« Tout le restaurant » = Room_Select# 0** (`Room_Select_All` d100) : zone virtuelle `_all` en C# (jamais sur l'EISC),
  libellés de circuits intérieurs, **toujours dérivée des zones réelles** (`SyncAll` à chaque `Room(0)` : niveau = moyenne
  par circuit, scène = commune aux 16 zones sinon « Personnalisée », `Room_LightsOn#` = total restaurant). Écran au
  démarrage sur la zone 1 (Extérieur, zone initiale du GUI), pas sur « tout ».
- **Climat global** : `HVAC_Setpoint_Up/Down` d181/182 (→), `HVAC_Setpoint#` a60 ↔ (× 10, borné 18-25, arrondi au pas
  0,5, tenu sur l'EISC après chaque +/−), `HVAC_Temperature#` a61 et `HVAC_FreshAir#` a62 fb seuls alimentés par
  `_Actual#` (défauts JSON 21,2 °C / 68 %). Pas de mode, ventilateur ni humidité (absents du GUI).
- **Musique globale** : `Music_Volume#` a30 (0..`volumeMax` = 80, borné avant recopie EISC), `Music_PlayPause` d241 ↔ (fb
  tenu = lecture ; entrée `Music_PlayPause_Actual` = lecture réelle — nom conservé égal à l'action, règle check-contract),
  `Music_EQ_1..3` d243-245 interlock (Lounge/Dining/Live), `Music_Title$` s20 / `Music_Sub$` s21 fixes du JSON. Lecture
  initiale = true (le GUI affiche « Pause »). Pas de mute / prev / next (absents du GUI).
- **Service** : `Service_Fluide/Sommelier/Accueil/Cuisine` d261-264 interlock fb tenu (« Tout traité » = Fluide),
  `Service_State#` a80 (0..3), `Service_Text$` s30 (« Service fluide » … texte du JSON) ; `_Actual` digitaux sur front
  montant, `Service_State_Actual#` aussi accepté. `Covers#` a81 fb seul, `Covers_Actual#` (défaut 32).
- **Lights_AllOn/AllOff d151/152 et Light_n_Toggle d161-168** : absents du GUI mais conservés (cohérence ftv-home / yacht),
  bascule 0/100 %, scène → personnalisée.
- **Tuile** : `Room_Subtitle$` = « Éteint » / « Éclairage moyen N % », `Room_LightsAvg#` a41, `Room_LightsOn#` a42,
  `Restaurant_LightsOn#` a43, `Restaurant_Summary$` s13 = `restaurant.sousTitre` du JSON (« Restaurant gastronomique · 15
  pavillons », texte du GUI, non calculé).
- **Aucun CTimer** : rien de périodique dans ce GUI (horloge côté écran, scènes tenues). Verrou `CCriticalSection` partout.
- Commandes console `kyotostate` / `kyotoroom` / `kyototrace` (préfixe court comme `yacht*`, le slug contient un tiret).
  CH5 project name `restaurantkyoto`.
- csproj : copie ftv-home avec GUID neuf, `TargetFrameworkVersion` v4.6.1 (comme ftv-home, qui compile).
- Clé `signauxMaisonEisc` conservée dans le JSON (structure ftv-home) pour le bloc « restaurant ».
- Limite connue (héritée) : deux écrans qui pressent le même bouton en même temps ne produisent qu'un front sur l'EISC.

## Revue critique du 27.09 (v1.0.1)
- Relecture ligne à ligne des 4 .cs comme compilateur C# 5 / .NET 4.7, API confrontées à `ftv-home/ControlSystem.cs`
  (compilé) : aucune erreur trouvée (usings, uint/ushort/int, `out`, lambdas console, init, try/finally).
- Défaut corrigé : `_all` n'était écrit que par les actions lancées depuis « tout » → écran sur « tout » périmé après une
  action de zone. Remplacé par `SyncAll` (dérivation) ; `TargetsWithAll` supprimé, `Targets` ne vise que les zones réelles.
- `OnOnlineStatus` : `catch` ajouté (journal) ; le verrou était déjà libéré en `finally`.
- Vérifié sans défaut : chaque contrôle de l'inventaire a join + handler + feedback ; a10 + `Room_Active_00/nn` posés avant
  chaque recopie (`MirrorToEisc`) ; bornes volume ≤ 80 / consigne 18-25 pas 0,5 avant recopie ; `_Actual` prioritaires ;
  libellés extérieur ; noms identiques Joins.cs ↔ JSON ↔ CONTRAT-JOINS.md ↔ SMW (script de comparaison, 0 écart).
- Écart assumé vis-à-vis de l'inventaire : pas de join `Scene_All_n` (remplacé par a10 = 0 + `Scene_x`) — à confirmer.

## Points douteux
- Le GUI n'a pas de bouton Pause ni d'égaliseur câblés (sans handler) : les joins existent, le comportement (toggle lecture,
  interlock EQ) est une interprétation.
- « Tout le restaurant » n'existe pas comme zone dans le GUI (seul `applyAllScene` est global) : la zone virtuelle 0 est une
  extension du contrat pour les curseurs et Toggle globaux.
- Noms de sous-systèmes SIMPL sans accents (« Salle vitree ») : à confirmer à l'ouverture du SMW.

## À faire ensuite
1. Ouvrir/compiler `RestaurantKyoto_Slot2.smw` dans SIMPL Windows ; corriger le générateur si SIMPL refuse quelque chose.
2. Compiler le CPZ dans Visual Studio ; charger JSON + CPZ + LPZ ; recette Debugger (§5 du contrat).
3. Drivers DALI/DMX (niveaux), CVC (consigne / mesure / air neuf), audio (volume, lecture, EQ), appel de service, comptage
   des couverts → derrière les signaux nommés.
4. Portage CH5 du GUI showcase (lot séparé), puis `meta.mode` deploiement/showcase comme Villa Crans.
