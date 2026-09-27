# FTV Home — contexte de reprise (< 150 lignes)

Mis à jour le 27.09.2026 (v1.0.0, première livraison).

## Ce que c'est
Backend Crestron du GUI « FTV Home » (simulateur React `apps/showcase/src/components/simulators/CrestronHome.jsx`,
page `/interfaces/residentiel/crestron-home`). Même architecture que Villa Crans : C# SIMPL# Pro slot 1 + SIMPL
Windows slot 2 reliés par EISC F0 / 127.0.0.2, mais **contrat propre, plus simple, écrit d'un bloc** (pas d'héritage v2/v3).

Règle de Donatien (27.09) : **tout le code de ce projet reste dans `projects/ftv-home/`**, rien d'éparpillé.

## Les trois décisions structurantes (demandées par Donatien le 27.09)
1. Un **JSON** (`config/ftvhome_config.json`) sélectionne les fonctionnalités de chaque pièce (`pilotages.*.actif`).
2. **`Room_Select#` (a10)** remonte dans le Debugger = pièce visée, posé avant chaque action, avec `Room_Active_nn`
   (d11-40, un seul haut) pour valider des buffers côté slot 2.
3. **Chaque action a un join global identique pour toutes les pièces** et remonte sous son nom nu dans le Debugger.

## Fichiers
- `config/ftvhome_config.json` : pièces (8, ids 1..8), maison (scènes, accès, piscine, spa, vidéo 4 écrans / 5 sources /
  8 chaînes, musique 5 services / 6 favoris), `contrat` (globaux, blocs pièce, EISC, limites).
- `simpl-sharp/FtvHome/` : `Joins.cs` (constantes = contrat), `HomeConfig.cs` (parse JSON), `HomeState.cs`,
  `ControlSystem.cs` (écrans 03/04/05/06, EISC, routage par écran, feedback, blocs pièce, transport config s105).
- `simpl/simpl-windows/FtvHome_Slot2.smw` : généré par `tools/generate_slot2.js` depuis le JSON + `_socle_cp4_eisc.smw`
  (socle nu = Villa Crans `Project_Slot2.smw` vidé de ses 2954 signaux, EISC 2732 joins conservé). 428 signaux nommés,
  8 sous-systèmes « Piece nn » avec un Analog Buffer validé par `Room_Active_nn`.
- `tools/check-contract.js` : JSON ↔ Joins.cs, chevauchements, limites. Vert au 27.09.
- `docs/CONTRAT-JOINS.md` : contrat lisible + recette Debugger à faire.

## État au 27.09.2026
- C# : compile (vérifié avec le SDK 2.21.274, cible net6.0 en environnement Linux ; à recompiler dans Visual Studio
  en net47 pour produire le CPZ — aucun CPZ produit, rien déployé).
- SMW : généré et vérifié structurellement (références de signaux, parents, CRLF, aucun doublon). **Jamais ouvert dans
  SIMPL Windows ni compilé** : première action à faire, puis F12 → LPZ.
- GUI CH5 de déploiement : **inexistant** (le showcase React est la seule GUI). Le portage CH5 est un lot séparé ;
  le contrat est prêt pour lui (`Joins.cs` / `docs/CONTRAT-JOINS.md`).
- Drivers slot 2 : aucun câblé (aucune marque donnée). Les signaux nommés attendent les drivers.

## Décisions prises par défaut (à confirmer)
- Musique **par pièce** (routée par a10) ; vidéo, accès, piscine, spa **maison** (écran cible par écran, a40).
- Occultants : Monter = 100 %, Stop = 50 %, Descendre = 0 % (comportement du simulateur) + impulsions `Rnn_Shade_n_*` 250 ms.
- Consigne CVC × 10 sur les joins (215 = 21,5 °C), niveaux/positions 0-65535 sur les joins, 0-100 % en interne.
- Les sériels ne sont pas câblés en entrée EISC (index non vérifié) ; les textes viennent du C#.
- Socle EISC 2732 joins → blocs pièce complets jusqu'à la pièce 17 (le générateur refuse au-delà) ; agrandir le
  symbole dans SIMPL Windows (double-clic, ré-indexation automatique) avant d'aller vers 30 pièces.
- Limite connue du contrat à joins partagés : deux écrans qui pressent le même bouton en même temps (avant relâché)
  ne produisent qu'un front sur l'EISC ; le second appui est perdu côté slot 2 (l'état C# reste juste).
- IP-ID : TSW 03, XPanel 04, iPad 05, iPhone 06 (Crestron ONE, projet `ftvhome`), comme Villa Crans.

## Revue du 27.09 (sous-agent) — corrigé
a40 posé sur l'EISC avant chaque action ; analogiques recopiés bornés ; `_fb` rafraîchis après `_Actual` ; CTimers
réutilisés (Reset) ; verrou dans OnOnlineStatus/ftvstate ; pas de consigne hors `pas` ; circuits non gradables 0/100 ;
mute réversible ; source TV = celle avec `chaines: true` ; ids écrans/sources/chaînes bornés au parsing.

## À faire ensuite
1. Ouvrir/compiler `FtvHome_Slot2.smw` dans SIMPL Windows ; corriger le générateur si SIMPL refuse quelque chose.
2. Compiler le CPZ dans Visual Studio ; charger JSON + CPZ + LPZ ; recette Debugger (§5 du contrat).
3. Donner les marques des équipements → câbler les drivers derrière les signaux nommés.
4. Portage CH5 du simulateur (lot séparé), puis `meta.mode` deploiement/showcase comme Villa Crans.
