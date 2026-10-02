# 05 — Recette et tests

Ce document distingue trois états :

| Marque | Signification |
|---|---|
| ✅ | **Le code le prouve.** Vérifié par lecture du code : le chemin complet existe et est cohérent |
| ⚠️ | **Le code prouve le contraire.** Non implémenté, implémenté à vide, ou cassé |
| ⬜ | **Non déterminable par lecture du code.** Nécessite un test sur site |

⬜ **À compléter par Donatien** : les colonnes « Testé sur site » sont vierges. Cocher au
fur et à mesure et dater.

---

## 1. Ce que la lecture du code établit

### 1.1 Chaînes fonctionnelles complètes (GUI → C# → feedback)

| Fonction | Joins | État |
|---|---|---|
| Sélection de pièce (1..30) | d11-40 + a10 | ✅ chemin complet, feedback natif `receiveStateSelected` |
| Nom de la pièce active | s10 | ✅ |
| Scènes d'éclairage 1..4 | d51-54 | ✅ commande + feedback, paliers appliqués aux circuits |
| Niveau master éclairage | a21 | ✅ |
| Circuits 1..10 | a71-80 | ✅ |
| Consigne CVC ± | d49/50 → a31, s33/s34 | ✅ bornes 16-28 °C appliquées |
| Température actuelle / mode | s32 / s33 | ✅ |
| Sélection de source A/V | d150-155 + a51 | ✅ interverrouillage côté C# et côté GUI |
| Volume A/V | a52 | ✅ |
| Mute A/V | d55 | ✅ |
| Moteurs 1..6 | d81-98 | ✅ |
| Stores groupés | d61-69 | ✅ relayés vers l'EISC |
| Scènes de stores | d201-204 | ✅ |
| Armement / désarmement général | d41/42 | ✅ *(booléen global uniquement, voir 1.2)* |
| Partitions d'alarme 1..4 | d301-312 | ✅ côté C#, ⚠️ non câblé côté SIMPL |
| Volume matériel de la dalle | a260 / d261 | ✅ avec mémorisation du dernier volume |
| Distribution de la config | s105/s106, d250, a250 | ✅ protocole complet, chunké et acquitté |
| Métadonnées CPZ | s101/s102 | ✅ |
| Date de dernière validation | s104 | ✅ persistée par périphérique côté CP4 |
| Terminal console CP4 | s103 | ✅ **côté index.html** — ⚠️ cassé côté iPhone, voir 1.3 |
| Remontée des logs GUI | s100 | ✅ tronqué à 250 caractères |
| Presets globaux | s420 | ✅ persistés dans `/user/preset_cfg_*.json` |
| Miroir EISC des signaux globaux | tous < 1000 | ✅ 1:1, avec garde anti-boucle |
| Blocs pièces EISC | ≥ 1000 | ✅ côté C#, ⚠️ écarts de câblage SIMPL |
| Flag `intersystem` par pièce | — | ✅ coupe bien le bloc dans les 3 sens |

### 1.2 Implémenté à vide ou partiel — ne fonctionnera pas en exploitation

| Fonction | Ce qui manque |
|---|---|
| `Global.Stores.PositionInter` (d406) | ⚠️ le C# ne fait qu'un log, aucune action |
| `Meteo.EasterEgg` (d56) | ⚠️ log seul ; le `funny.mp3` annoncé n'est jamais joué |
| Pilotage IP des sources | ⚠️ `DispatchIpCommandToSonyTv` ne fait que journaliser. Aucun driver réel. La source 5 est loggée « Power Off » |
| Partitions d'alarme | ⚠️ l'armement général (41/42) ne touche **pas** les `PartitionStates` des pièces. Les deux mondes sont disjoints |
| `applySceneLevels` (GUI) | ⚠️ **fonction vide** dans `index.html` : les rappels de scène ne recalent jamais les sliders |
| Presets « tout éteindre » / « tout allumer » / vacances | ⚠️ ne traitent que les **circuits 1 à 6** sur 10. Les circuits 7-10 gardent leur valeur |
| Commandes globales 401-411 | ⚠️ traitées côté C# mais **non câblées côté SIMPL** : aucun effet matériel |
| Type de moteur (`volet`/`rideau`/`store`) | ⚠️ ignoré, icônes en dur par position |
| `audioVideo.sources[]` par pièce | ⚠️ ignoré, les 5 sources sont toujours proposées |
| Bornes CVC de `villa_config.json` | ⚠️ ignorées, bornes en dur dans le C# |
| Widget météo — clic | ⚠️ `window.openWeatherWebsite()` appelé mais jamais défini → `TypeError` à chaque appui |

### 1.3 Cassé — bugs confirmés par le code

| Bug | Preuve | Impact |
|---|---|---|
| **GUI iPhone entièrement mort** | `node --check` sur le script principal de `iphone.html` : `SyntaxError` ligne 1478 (chaîne non terminée). ~1700 lignes rejetées | **Aucun** abonnement ni thème ni re-modelage sur iPhone. Cause du bug « console CP4 iPhone n'affiche pas la réponse » |
| Liste des pièces illisible en thème light | `color: #ffffff !important` sur sidebar `rgba(255,255,255,0.85)` | Menu blanc sur blanc |
| Roue crantée invisible en thème glass (iPhone) | bouton blanc translucide sur panneau blanc translucide + `backdrop-filter: blur(25px)` en WKWebView | Réglages inaccessibles |
| Interlock des sources jamais souscrit au boot | bloc collé **dans** `sendDateToCrestron` | + re-souscription ×6 à chaque changement de date |
| Pièces d'`id` ≥ 9 ignorées | `subscribeState('n','10')` plafonné à `value <= 8` | Remontées admin cassées pour 7 pièces sur 15 |
| Indicateur mute du panneau admin figé | `src/config.js` surveille le join **53**, résidu v1 (devrait être 55) | Toujours à 0 |
| Joins moteurs latchés | cas 404/405/410 et `ApplyPreset` mettent des digitaux à `true` sans jamais les remettre à `false` | Le slot 2 voit un ordre Monter/Descendre **permanent** |
| Deux ressources 404 au chargement | `themes/dark-theme.css` et `themes/villa_bg.jpg`, `src/themes/` n'existe pas | Fond de villa absent |

### 1.4 Cohérence du contrat v2

| Composant | Alignement v2 |
|---|---|
| C# slot 1 | ✅ **aligné partout**, vérifié signal par signal |
| SIMPL slot 2 | ✅ aligné v2 sur les signaux globaux — ⚠️ 4 écarts sur les blocs pièces |
| `index.html` | ⚠️ un bloc de souscription reste sur les joins v1 21-24 |
| `src/config.js` | ⚠️ mute encore sur le join 53 |
| `CONFIG_PROCESS.md` | ⚠️ dit encore « 53 (mute) » |

---

## 2. Matrice de recette par périphérique

⬜ **À dérouler sur site.** Colonnes : noter `OK`, `KO` + observation, ou `N/A`.

Légende du bandeau : **TSW** = dalle 0x03 · **XP** = XPanel navigateur 0x04 ·
**iPad** = 0x05 · **iPh** = iPhone 0x06 · **S2** = commande depuis le slot 2 (SIMPL).

### 2.1 Socle

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| A1 | Le panel se connecte, pastille « Online (xx) » verte | | | | | — |
| A2 | L'IP-ID affiché correspond au périphérique | | | | | — |
| A3 | La liste des pièces se construit depuis `villa_config.json` | | | | | — |
| A4 | Les icônes de pièces sont les bonnes | | | | | — |
| A5 | Modifier `villa_config.json` + `deploy.ps1 -Target config` → GUI à jour après reboot | | | | | — |
| A6 | Digital 250 depuis le panel → resynchronisation complète de la config | | | | | — |
| A7 | Le transfert des ~279 chunks aboutit sans blocage | | | | | — |
| A8 | Version et date de build affichées et correctes | | | | | — |

### 2.2 Navigation et découplage

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| B1 | Sélectionner chaque pièce → titre, modules et noms corrects | | | | | |
| B2 | Le bouton de la pièce active est bien mis en évidence | | | | | — |
| B3 | **Pas de scintillement** de la sélection (conflit JS / `receiveStateSelected`) | | | | | — |
| B4 | Deux panels sur deux pièces différentes : chacun pilote la sienne | | | | | — |
| B5 | Pièces d'`id` ≥ 9 : sélection **et** remontées admin correctes | | | | | — |
| B6 | Une pièce avec un module désactivé masque bien toute la section | | | | | — |
| B7 | Le slot 2 pilote une pièce **non affichée** sur les dalles | — | — | — | — | |

### 2.3 Éclairage

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| C1 | Les 4 scènes commandent et donnent leur feedback | | | | | |
| C2 | Rappel de scène → les sliders de circuits se recalent | | | | | |
| C3 | Chaque circuit (jusqu'à 10) pilote le bon canal | | | | | |
| C4 | Niveau master | | | | | |
| C5 | Pièce à 10 circuits : les 10 sont présents et pilotables | | | | | |
| C6 | Tout allumer / tout éteindre / mode éco → **effet matériel réel** | | | | | |
| C7 | Tout éteindre coupe bien les circuits **7 à 10** | | | | | |

### 2.4 Moteurs et stores

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| D1 | Chaque moteur Monter / Stop / Descendre | | | | | |
| D2 | Les icônes correspondent au `type` déclaré | | | | | — |
| D3 | Commandes groupées Volets / Rideaux / Stores | | | | | |
| D4 | Les 4 scènes de stores | | | | | |
| D5 | Tout ouvrir / tout fermer → effet matériel réel | | | | | |
| D6 | Position intermédiaire | | | | | |
| D7 | **Aucun join moteur ne reste latché à `true`** après une commande globale | — | — | — | — | |

### 2.5 CVC

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| E1 | Température actuelle affichée et rafraîchie | | | | | |
| E2 | Mode CHAUFFAGE / CLIMATISATION | | | | | |
| E3 | Consigne ± 0,5 °C, bornée à 16-28 °C | | | | | |
| E4 | Confort / Nuit / Hors gel → effet matériel réel | | | | | |

### 2.6 Audio / Vidéo

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| F1 | Sélection de chacune des 5 sources + OFF | | | | | |
| F2 | Interverrouillage : une seule source sélectionnée à la fois | | | | | |
| F3 | **Pas de double-sélection fugace** au changement de source | | | | | — |
| F4 | Volume | | | | | |
| F5 | Mute (join **55**, pas 53) | | | | | |
| F6 | Volume matériel de la dalle + mute avec restauration | | — | — | — | |
| F7 | La source 5 (« MUSIQUE ») se comporte comme les autres | | | | | |

### 2.7 Alarme

| # | Test | TSW | XP | iPad | iPh | S2 |
|---|---|---|---|---|---|---|
| G1 | Armement / désarmement général + feedback | | | | | |
| G2 | Les 4 partitions Armer / Partiel / Désarmer | | | | | |
| G3 | Cohérence entre armement général et état des partitions | | | | | |

### 2.8 Interface et service

| # | Test | TSW | XP | iPad | iPh |
|---|---|---|---|---|---|
| H1 | Les 4 thèmes s'appliquent et **restent lisibles** (liste des pièces incluse) | | | | |
| H2 | La roue crantée Réglages est visible dans les 4 thèmes | | | | |
| H3 | Les 5 langues traduisent l'interface **et** les noms de la config | | | | |
| H4 | La langue et le thème sont mémorisés après redémarrage | | | | |
| H5 | Appui long 3 s → modale admin | | | | |
| H6 | Terminal console CP4 : `ver` renvoie une réponse affichée | | | | |
| H7 | Terminal console CP4 : `ipt` (réponse longue) s'affiche entièrement | | | | |
| H8 | Deux fois la **même** commande → l'affichage se met bien à jour | | | | |
| H9 | Date de dernière validation : saisie, envoi, relecture au reboot | | | | |
| H10 | Grille de monitoring admin : valeurs cohérentes pour la pièce active | | | | |
| H11 | Widgets météo / actualités selon les surcharges configurées | | | | |
| H12 | Pages spéciales Jeux / Animation / Vidéo | | | | |
| H13 | Aucune erreur remontée sur le String 100 en usage normal | | | | |
| H14 | Aucun 404 dans la console du navigateur | — | | — | — |

### 2.9 Intersystem — spécifique slot 2

| # | Test | Résultat |
|---|---|---|
| I1 | L'EISC F0 apparaît ONLINE dans `ipt -p:01` | |
| I2 | Pièces 1-2-3 : état poussé en temps réel vers le slot 2 | |
| I3 | Pièces à `intersystem: false` : **aucun** signal côté SIMPL | |
| I4 | Commande slot 2 sur un bloc pièce → appliquée + feedback vers les panels | |
| I5 | Écho des appuis moteurs (+61..78) et stores (+1..9) reçu côté SIMPL | |
| I6 | **Les signaux `Motor_Room1_*` ne reçoivent pas les états de partition** (écart §5.1 du doc 04) | |
| I7 | Sources par pièce : le rang correspond au libellé (écart §5.2) | |
| I8 | Coupure/rétablissement du slot 2 → resynchronisation complète à la remontée | |

---

## 3. Tests de robustesse recommandés

⬜ À dérouler avant toute mise en production.

| # | Scénario | Attendu |
|---|---|---|
| R1 | Déployer un `villa_config.json` **volontairement malformé** | Le processeur doit rester opérationnel et retomber sur la config de repli. **Aujourd'hui il devient muet** — voir [06 — To-do](06_TODO.md) priorité 2 |
| R2 | Config avec `"id": "1"` en chaîne | Idem R1 |
| R3 | Config sans pièce d'`id` 1 | Idem R1 |
| R4 | Config avec 5 scènes dans une pièce | Attendu : avertissement au chargement. Aujourd'hui : la scène 5 coupe le son, silencieusement |
| R5 | Redémarrage du CP4 avec 4 panels connectés | Tous se resynchronisent, sans blocage du transfert de config |
| R6 | Couper le réseau d'un panel pendant le transfert de config | Le panel doit pouvoir redemander la config (Digital 250) et repartir proprement |
| R7 | Deux panels demandent la config simultanément | Les deux transferts aboutissent |
| R8 | Glisser un curseur de circuit en continu 30 s | Pas de saturation CPU ni de latence de feedback (le C# réécrit ~62 signaux EISC par échantillon) |
| R9 | Laisser tourner 48 h | Pas de fuite d'abonnements ni de dérive de l'affichage |

---

## 4. Journal de recette

⬜ À tenir à jour.

| Date | Version | Périphérique | Tests déroulés | Résultat | Par |
|---|---|---|---|---|---|
| | | | | | |
