# Rapport — ControlSystem.cs, passage au contrat v3

Fichier : `/home/claude/work/repo/projects/villa-crans/ch5/Backend/Backend/ControlSystem.cs`
(1683 → 1975 lignes). Configuration : `villa_config.json`, section `contrat` (v3).
Tous les changements sont commentés `// v3` ou `// P1-n` dans le code.

---

## 1. Modifications, par méthode

| Méthode / zone | Ligne env. | Modification | Raison |
|---|---|---|---|
| `RoomState` | 23, 42 | Ajout de `MediaVolume` (défaut 25000) | analogique logique 254 = offset +54, absent du modèle |
| Champs de classe | 209 | `RoomBlockMaxRoom = 30` | borne de routage = `contrat.blocsPiecesGui.pieceMax` |
| Champs de classe | 212-220 | `_mirrorDigital/_mirrorAnalog/_mirrorSerial` + `_mirrorWhitelistLoaded` | liste blanche du miroir EISC issue de `contrat.signauxGlobaux` |
| Champs de classe | 222-236 | Joins 43/44/45/46, `_alarmReferenceCode`, `_alarmPanelReplyMs`, `_alarmCodeTimer`, `_alarmCodeRequester` | validation du code d'alarme |
| `InitializeSystem` | 287-302 | `BuildVillaRoomsDatabase()` sous try/catch + repli si registre vide | **P1-1** |
| `InitializeSystem` | 383 | `PushAllRoomsFeedback()` au démarrage | premier remplissage des blocs ≥ 1000 |
| `LoadVillaConfiguration` | 422-425 | Appel de `BuildGlobalMirrorWhitelist()` et `LoadAlarmReferenceCode()` | rien en dur, tout lu dans le contrat |
| `BuildGlobalMirrorWhitelist` *(nouveau)* | 440 | Construit 3 tables de joins < 1000 depuis `contrat.signauxGlobaux` (`join` ou `joinDebut`+`nombre`) | point 3 |
| `LoadAlarmReferenceCode` *(nouveau)* | 502 | Lit `contrat.alarme.codeParDefaut` et `delaiReponseCentraleMs` (borné 200-2200 ms) | point 4 |
| `MirrorSignalToEisc` | 636 | ≥ 1000 → **passe-plat** (seul filtre : flag `intersystem` de la pièce décodée) ; < 1000 → liste blanche ; sériel 43 exclu (relais explicite) | point 3 |
| `IsGlobalMirrorSignal` *(nouveau)* | 686 | Test de la liste blanche ; si la config n'a pas pu être lue, comportement v2 conservé | robustesse |
| `OnTouchPanelOnlineStatusChange` | 730-736 | `PushAllRoomsFeedback()` à chaque arrivée (panel ou slot 2) | un panel qui navigue doit trouver tous les blocs à jour |
| `SendFeedbackBool/UShort/StringToRoom` | — | **supprimées** | c'étaient elles qui écrasaient les joins partagés entre supports |
| `BroadcastFeedbackToRoom` | — | **supprimée**, remplacée par `PushRoomFeedback` | idem |
| `BroadcastFeedbackToAll` | 765 | Partie globale par panel + `PushAllRoomsFeedback()` | point 2 |
| `PulseGlobalDigitalToPanels` *(nouveau)* | 781 | Impulsion d'un digital global, ciblée sur un panel ou diffusée | verdict de code d'alarme |
| `PulseRoomDigital` *(nouveau)* | 803 | Impulsion `RoomBlockStart(id)+offset`, **toujours remise à false** | **P1-2** |
| `BuildVillaRoomsDatabase` | 817 | try/catch par pièce, contrôle `1..30`, repli si aucune pièce exploitable | **P1-1** |
| `BuildFallbackRoomsDatabase` *(nouveau)* | 867 | Repli historique extrait, réutilisable | **P1-1** |
| `PulseAllMotorsInAllRooms` *(nouveau)* | 896 | Monter (+61+3n) / Descendre (+63+3n) sur toutes les pièces | **P1-2** (remplace l'écriture sur 81-98) |
| `MirrorRoomStateToEisc` → `PushRoomFeedback` | 913 | Renommée ; ajout de `+45` (extinction A/V) et analogique `+54` (volume média) | point 2 + joins v3 |
| `MirrorAllRoomsToEisc` → `PushAllRoomsFeedback` | 969 | Renommée, garde `null` | — |
| `ProcessEiscRoomSignal` → `ProcessRoomBlockSignal` | 982 | Point d'entrée **unique** des joins ≥ 1000 : `room = (join-1000)/100+1`, `offset = (join-1000)%100`, bornes 1..30 | points 1 et 6 |
| `ApplyRoomDigitalCommand` *(nouveau)* | 1010 | Toute la logique digitale de pièce, **en offsets** : +1..+9 / +58..+78 (impulsions relayées), +21..+24, +35/+36, +41..+44, **+45**, +50, +51..+55, +56, +57, +81..+92 | factorisation : plus de double implémentation join logique / offset |
| `ApplyRoomAnalogCommand` *(nouveau)* | 1083 | +21, +31, +51, +52, **+53**, **+54**, +71..+80 | point 6 (ana 53) + join v3 (254) |
| `ApplyAlarmPartition` *(nouveau)* | 1111 | Partitions appliquées à **toutes** les pièces | `exceptionsGlobales` : partitions communes à la villa |
| `StopAlarmCodeTimer` / `ProcessAlarmCodeEntry` / `OnAlarmCodeTimeout` / `OnAlarmCodeVerdictFromPanelSystem` *(nouveaux)* | 1128-1192 | Chaîne complète 43 → EISC → 44/45, repli local temporisé, 46 = effacement | point 4 |
| `OnTouchPanelSignalReceived` | 1197-1234 | Miroir d'abord, puis routage ≥ 1000 ; sériel 43 traité ; code jamais journalisé en clair | points 1, 3, 4 |
| `ProcessDigitalSignal` | 1302 | Ne garde que les joins **globaux** (11-40, 41/42, **44/45/46**, 56, 103, 250, 261, 301-312, 401-411) ; accès `_activeRoomPerDevice`/`_roomsRegistry` gardés | points 1, 5 |
| `ProcessAnalogSignal` | 1521 | Ne garde que 10, 250, 260 ; accès gardé | point 1, **P1-4** |
| `UpdateScreenStateForPanel` | 1563 | Garde `ContainsKey` + ajout du **sériel 33** (mode CVC) | **P1-4**, point 6 |
| `DispatchAudioRouting` / `DispatchIpCommandToSonyTv` | ~1700 | Gardes `ContainsKey` | **P1-4** |
| `SavePresetConfig` | 1769 | Nom assaini avant composition du chemin | **P1-5** |
| `SanitizePresetName` *(nouveau)* | 1811 | Liste blanche `[A-Za-z0-9_-]`, 40 caractères max | **P1-5** |
| `ApplyPreset` | 1824 | Assainissement aussi à la lecture ; `shade_*` pulse le bloc de la pièce ; replis `vacation` corrigés | **P1-2**, **P1-3**, **P1-5** |

### villa_config.json
Ajout de `contrat.alarme` : `codeParDefaut` (« 1234 », valeur qui était en dur dans le JavaScript),
`delaiReponseCentraleMs` (1200), plus la note indiquant qu'il faut le changer sur site ou le vider
pour n'accepter que le verdict de la centrale. JSON revalidé.

### Choix documenté — validation du code d'alarme
La saisie (sériel 43) est relayée telle quelle à l'EISC du slot 2, avec purge du sériel avant
écriture (deux saisies identiques successives produiraient sinon zéro événement côté SIMPL).
Un `CTimer` de 1200 ms attend le verdict de la vraie centrale (digital 44 ou 45). Passé ce délai —
slot 2 arrêté, non chargé ou muet — le C# compare au code lu dans la configuration et impulse
lui-même 44 ou 45, **uniquement vers le panel qui a saisi** (les autres écrans ne doivent pas
changer de page). Le GUI abandonne à 2500 ms : le repli tranche donc toujours avant. Si
`codeParDefaut` est vide, toute validation locale est refusée — un pavé inopérant vaut mieux qu'un
code en dur dans le programme.

---

## 2. État final des 6 points P1

| # | Point | État | Où |
|---|---|---|---|
| 1 | try/catch autour de `BuildVillaRoomsDatabase` | **Corrigé** | try/catch à l'appel (l. 292) + try/catch par pièce (l. 829) + `BuildFallbackRoomsDatabase` (l. 867) si le registre reste vide. L'enregistrement des panels ne peut plus être empêché par un JSON mal typé. |
| 2 | Joins moteurs pulsés remis à false | **Corrigé** | Les 5 sites (ex-1133, 1147, 1199, 1600, 1658) n'écrivent plus sur la plage d'entrée 81-98 : ils passent par `PulseRoomDigital` / `PulseAllMotorsInAllRooms`, qui écrivent `true` puis `false` sur le bloc de la pièce (+61/+63 +3n). Les échos 61-69 / 81-98 arrivant d'un panel sont, eux, relayés par le passe-plat du miroir (donc avec le front descendant émis par le GUI). |
| 3 | Boucles de presets bornées à 10 | **Corrigé** | `light_all`, `light_off`, `vacation` (cas 410 et repli de `ApplyPreset("vacation")`) bouclent sur `i < 10`. `light_eco` l'était déjà. |
| 4 | Gardes `ContainsKey` manquantes | **Corrigé** | ex-891 et ex-1237 : lecture protégée avec repli `DefaultRoomForPanel` ; ex-1309 `UpdateScreenStateForPanel` ; ex-1393 `DispatchAudioRouting` ; ex-1407 `DispatchIpCommandToSonyTv` ; plus `PushRoomFeedback`, `PulseRoomDigital`, `ProcessRoomBlockSignal`, navigation 11-40 et analogique 10. |
| 5 | Nom de preset assaini | **Corrigé** | `SanitizePresetName` : liste blanche `[A-Za-z0-9_-]`, 40 caractères max, appliquée à l'écriture **et** à la lecture. Aucun `/`, `\` ni `..` ne peut atteindre `/user/preset_cfg_*.json`. |
| 6 | Borne de routage ≥ 1000 cohérente | **Corrigé** | Même décodage dans `OnTouchPanelSignalReceived`, `MirrorSignalToEisc` et `ProcessRoomBlockSignal` : pièce 1..`RoomBlockMaxRoom` (30) puis présence au registre. Les joins réservés firmware (29731…) sont éliminés par la borne haute, plus seulement par le registre. |

### Deux correctifs complémentaires demandés
- **Sériel 33 (mode CVC)** : ajouté à `UpdateScreenStateForPanel` (l. ~1610). Le libellé
  CHAUFFAGE / CLIMATISATION n'est plus vide à la connexion ni au changement de pièce.
- **Analogique 53 (AV.SourceAudio)** : entrée créée dans `ApplyRoomAnalogCommand` (offset +53) :
  `5` = musique sur les haut-parleurs, `0..4` = l'audio suit la source vidéo, suivi de
  `DispatchAudioRouting`.

---

## 3. Reste à faire côté SIMPL Windows (slot 2)

1. **Blocs pièces** : le slot 2 reçoit désormais les joins ≥ 1000 tels que la GUI les émet
   (base = 1000 + (id-1)×100). Câbler les offsets nouvellement actifs, absents de `blocsPieces` v2 :
   `+45` extinction A/V, `+54` volume du lecteur média (analogique), `+58/+59/+60` transport média
   (précédent / lecture-pause / suivant). Les offsets `+1..+9` et `+61..+78` restent des impulsions
   sortantes, le front descendant est maintenant garanti.
2. **Signaux globaux** : ne plus compter sur la recopie des joins de pièce en dessous de 1000. Seuls
   les joins listés dans `contrat.signauxGlobaux` traversent encore le miroir 1:1. Les télécommandes
   (211-220, 500-527, 530-557, 560-600) restent entièrement à la charge du slot 2 : aucune logique
   ni aucun feedback côté C#.
3. **Centrale d'alarme** : implémenter la réception du sériel 43 et répondre par une **impulsion**
   sur le digital 44 (accepté) ou 45 (refusé) en moins de 1200 ms, sinon le C# tranche en local avec
   `contrat.alarme.codeParDefaut`. Le digital 46 (touche C) est relayé et doit annuler la saisie en
   cours côté centrale. Une fois la vraie centrale câblée, vider `codeParDefaut` pour interdire toute
   validation locale.
4. **Partitions** : les joins 301-312 sont désormais traités comme communs à toute la villa (et non
   plus par pièce). Les offsets `+81..+92` de chaque bloc restent disponibles et reflètent le même
   état pour toutes les pièces — à ne plus utiliser comme état par pièce côté SIMPL.
5. **Température mesurée** : `RoomState.CurrentTemperature` reste figée à 22,4 °C. Rien ne permet au
   slot 2 de pousser une température réelle : il faudra ajouter au contrat un analogique entrant par
   pièce (offset libre, p. ex. `+32`) et l'implémenter des deux côtés.
6. **Nom de pièce** : les sériels de bloc (`+10`, `+32`, `+33`, `+34`) restent en sortie seule ; le
   slot 2 ne peut ni renommer une pièce ni pousser un libellé. À arbitrer si le besoin existe.
7. **Vérification terrain** : contrôler que le flag `intersystem` de chaque pièce est correctement
   positionné — il conditionne à la fois le passe-plat entrant et le feedback sortant vers le slot 2.
