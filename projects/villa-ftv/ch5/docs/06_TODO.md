# 06 — To-do list

Classée par priorité. Chaque entrée porte le fichier et, quand c'est possible, la ligne.
Les lignes renvoient à l'état du dépôt au **02.09.2026** (GUI v1.0.165).

Convention : `[ ]` à faire · `[~]` en cours · `[x]` fait (dater et signer)

---

## P0 — Bloquant

- [ ] **Retours de la direction du 09.09.2026 (A. Dändliker) — voir [07 — Retours direction](07_RETOURS_DIRECTION_2026-09-09.md).**
  Appliqués dans `src/index.html`, `src/iphone.html`, `villa_config.json` le 09.09.2026 ;
  **à recompiler (`deploy.ps1`) et à valider sur la dalle / le XPanel** :
  - [x] scènes d'éclairage mémorisées (circuits + stores) avec confirmation à l'enregistrement et au rappel ;
  - [x] premier appui sur une source = activation + télécommande ;
  - [x] fil d'actualités remplacé par le bandeau « État de la villa » ;
  - [x] majuscules uniformisées (sentence case) + 32 clés de traduction ajoutées (5 langues) ;
  - [ ] point à organiser : Donatien / Alex / Antoine (demande d'Antoine).

- [x] **`src/iphone.html` ligne 1478 — chaîne de caractères non terminée.** *(corrigé le
  09.09.2026 — Claude, avec les retours d'Antoine : dictionnaire `ru` complété, `translations`
  refermé ; `node --check` des blocs `<script>` OK.)*
  Le dictionnaire `ru` est tronqué (`source_video: "А` sans guillemet fermant), le bloc
  `fallbackConfig` collé par-dessus, et il manque les 12 dernières clés de `ru`, l'accolade
  fermante de `ru` et le `};` de `translations`.
  → Le `<script>` des lignes 1336-3060 (~1700 lignes) est rejeté : **tout le code métier
  iPhone est mort**. Cause du bug n°1 du README, et blocage pour tous les autres bugs
  iPhone.
  Correctif complet dans `AUDIT_2026-09-02.md` §1.

- [x] **Ajouter un `node --check` des blocs `<script>` dans `deploy.ps1`**, avant
  `npx ch5-cli archive`. Trois sites de collage automatique raté ont été trouvés dans le
  projet ; sans garde-fou, le prochain passera aussi. *(fait le 09.09.2026 — Claude :
  fonction `Test-InlineScripts`, exécutée sur `src/index.html` et `src/iphone.html` avant
  l'incrément de version ; `villa_config.json` est aussi validé au build et sur la cible
  `cp4`, ce qui couvre le point P1 « valider le JSON sur les cibles `all` et `cp4` ».)*

---

## P1 — Sécurité d'exploitation

- [ ] **`ControlSystem.cs` L572-608 — `BuildVillaRoomsDatabase` sans `try/catch`.**
  Les casts `(int)piece["id"]` (L582) et `(bool)piece["intersystem"]` (L588) lèvent sur un
  type inattendu. L'exception remonte au catch global de `InitializeSystem` (L300) et
  **tout ce qui suit L234 est abandonné** : aucun panel enregistré, aucun EISC, processeur
  muet. Envelopper d'un `try/catch` avec repli sur la config par défaut.

- [x] **`deploy.ps1` L150-155 — valider le JSON sur les cibles `all` et `cp4`**, comme le
  fait déjà `-Target config` (L129). Combiné au point précédent, un JSON malformé peut
  aujourd'hui rendre le processeur inopérant. *(fait le 09.09.2026 — Claude, avec le garde-fou `node --check`.)*

- [ ] **`ControlSystem.cs` — gardes `ContainsKey` sur `_roomsRegistry`** (L836-837, L1159,
  L1188-1223, L1231). Et initialiser `_activeRoomPerDevice` sur le **premier `id`
  réellement présent** plutôt que sur `1` en dur (L297, L500, L760) : une config sans pièce
  d'`id` 1 plante à l'initialisation.

- [ ] **`ControlSystem.cs` — remettre à `false` les joins moteurs pulsés.**
  `case 404` (L1051-1057) → joins 81, 84, 87, 90, 93, 96 ; `case 405` (L1065) et
  `case 410` (L1117) → 83, 86, 89, 92, 95, 98 ; branche `shade_` de `ApplyPreset` (L1507).
  Aujourd'hui le slot 2 voit un ordre Monter/Descendre **permanent**. Le bon patron est
  déjà appliqué L961-962 et L979-980 (pulse `true` puis `false`).

- [ ] **`ControlSystem.cs` — presets : `for (i = 0; i < 6)` → `i < 10`** (L1015, L1028,
  L1115, L1554). Les circuits 7 à 10 ne sont pas éteints par « Tout éteindre ». Le mode Éco
  utilise déjà correctement `i < 10` (L1041).

- [ ] **`ControlSystem.cs` — avertir au chargement en cas de dépassement de limite**
  (4 scènes / 10 circuits / 6 moteurs / 30 pièces / 4 partitions). Les collisions
  (scène 5 = mute, pièce 31 = armement alarme) sont aujourd'hui totalement silencieuses.

- [ ] **`ControlSystem.cs` L1410-1418 — valider le nom de preset** avant d'écrire dans
  `/user/preset_cfg_<nom>.json`. Le nom vient du payload panel sans contrôle : un `../`
  échappe au répertoire.

- [ ] **`ControlSystem.cs` L753 — borner le routage des blocs pièces.** Tout join ≥ 1000
  est routé vers `ProcessEiscRoomSignal`, sans borne haute : un join firmware entre 1000 et
  2499 serait interprété comme une commande sur les pièces 1 à 15.

---

## P2 — Bugs du README

- [ ] **Bug 1 — console CP4 iPhone.** Réglé par P0. Vérifier ensuite sur cible.
  À faire au passage : sortir `sendConsoleCommand`, `refreshIptable`, `openAdminModal` du
  garde `if (typeof WebXPanel !== 'undefined')` (`iphone.html` L21, L72-118) et ajouter les
  appels `refreshIptable()` sur `CONNECT_CIP` et `DOMContentLoaded` (L129-139), comme dans
  `index.html` L92-101.

- [x] **Bug 3 — liste des pièces illisible en thème light.** *(corrigé le 09.09.2026 — Claude :
  couleurs thémables `--text-primary` / `--room-hover-color` / `--selection-bg`, bloc
  `<style id="theme-readability">` pour les thèmes Clair et Verre dépoli (titres, boutons d'entête,
  bandeau d'état, HVAC, version), scène active en texte sombre. Thème « Bleu Cyberpunk » retiré.)*
  **Règle permanente : aucun texte sous 3:1 de contraste dans aucun thème.** Garde-fou
  `tools/check_contrast.mjs` (Playwright : capture d'écran de chaque thème + calcul WCAG sur le
  fond réellement affiché) — lancé par `deploy.ps1` si Playwright est installé
  (`npm i -D playwright pngjs && npx playwright install chromium`), sinon avertissement.

- [ ] **Bug 4 — roue crantée invisible en thème glass sur iPhone.**
  Ajouter dans `iphone.html` une règle dédiée :
  ```css
  body.theme-glass button[onclick*="openSettingsModal"],
  body.theme-glass .popup-trigger-btn {
      background: rgba(0, 0, 0, 0.35) !important;
      border-color: rgba(255, 255, 255, 0.55) !important;
      color: #ffffff !important;
      position: relative;   /* sort le bouton de la couche backdrop iOS */
      z-index: 1;
      text-shadow: 0 1px 3px rgba(0,0,0,.8);
  }
  ```
  Remplacer aussi l'emoji `⚙️` par le SVG engrenage déjà présent dans le fichier (L2550).

- [ ] **Bug 2 — menu déroulant de la date de validation en XPanel.**
  Deux causes plausibles, à départager sur cible (`index.html` L107-218) :
  1. `WebXPanel.isActive` faux au `DOMContentLoaded` (L115) → les selects restent masqués
     et c'est l'`<input type="date">` natif qui s'affiche.
  2. Format de date non padé : les `<option>` sont générées `"01"`…`"31"`, mais si le CP4
     renvoie `3/9/2026`, `daySelect.value = "3"` ne matche aucune option.
  Test : logger `typeof WebXPanel`, `WebXPanel.isActive` et la valeur brute du join 104.

---

## P3 — Écarts de câblage SIMPL slot 2

Détails dans [04 — SIMPL slot 2](04_SIMPL_SLOT2.md) §5. Ces écarts viennent d'un câblage
manuel : `generate_slot2.js` ne les écrasera pas, il faut les supprimer dans SIMPL Windows
puis relancer le script.

- [ ] **Moteurs de la pièce 1 câblés sur +81..+98 au lieu de +61..+78.** Collision directe
  avec `Piece.1.Alarme.Partition` (+81..92) : les signaux `Motor_Room1_*_fb` reçoivent en
  réalité les états de partition d'alarme. Recâbler sur **1061-1078**.

- [ ] **Sources A/V de la pièce 1 décalées d'un rang.** `AV_Room1_Source1` est sur +51,
  qui est **OFF** au contrat. Renommer en `AV_Room1_Source_0..5` sur +51..+56 et ajouter
  les sources 4 et 5 (1055/1056), non câblées.

- [ ] **`AV_Room1_Volume` sur l'analogique +53 au lieu de +52.** Ajouter aussi
  `AV_Room1_SourceActive` sur +51, absent.

- [ ] **Supprimer l'entrée analogique 33 (`HVAC_Mode`).** Le join 33 est un **sériel** au
  contrat ; cet analogique n'est ni lu ni écrit par le C#.

- [ ] **Recompiler.** Le `.lpz` chargé date du 23.08 alors que le `.smw` a été modifié le
  24.08 — ce qui tourne sur le CP4 n'est pas le programme en cours d'édition.

- [ ] **Aligner les pièces 2 et 3 sur le niveau de câblage de la pièce 1** (aujourd'hui
  seules les scènes, l'écho stores et les circuits analogiques sont câblés).

- [ ] **Mettre `README_SLOT2.md` à jour** : il décrit encore le dimensionnement 232/233 et
  ses limitations, alors que le symbole EISC est passé à 2232/2233.

- [ ] **Versionner le dossier SIMPL.** Il vit sur le Bureau, hors git, et la base d'origine
  `VillaCrans.smw` a déjà été supprimée. Les sauvegardes horodatées sont le seul filet.

---

## P4 — Fonctions non raccordées au matériel

Traitées côté C# (l'état interne change, le feedback part) mais **sans aucun effet
matériel** faute de câblage SIMPL.

- [ ] **Partitions d'alarme (d301-312)** — non câblées côté slot 2.
- [ ] **Commandes globales éclairage (d401/402/403)** — non câblées.
- [ ] **Commandes globales stores (d404/405/406)** — non câblées.
- [ ] **Commandes globales CVC (d407/408/409)** — non câblées.
- [ ] **Mode vacances (d410/411)** — non câblé.
- [ ] **`Global.Stores.PositionInter` (d406)** — en plus, le C# ne fait qu'un log
  (`ControlSystem.cs` L1075-1077) : à implémenter des deux côtés.
- [ ] **Pilotage IP des sources** — `DispatchIpCommandToSonyTv` (L1308-1318) ne journalise
  que. Aucun driver. Et seules 4 sources sur 5 ont un libellé : la source 5 est loggée
  « Power Off ».
- [ ] **Cohérence alarme générale / partitions** — l'armement 41/42 n'agit que sur un
  booléen global (L921-931) et ne touche pas les `PartitionStates` des pièces. Décider du
  comportement attendu, puis l'implémenter.

---

## P5 — Bugs GUI hors README

- [ ] **`index.html` L140-169 — bloc « Interlock 5 Sources » collé à l'intérieur de
  `sendDateToCrestron`.** L'interlock n'est jamais souscrit au démarrage, et il est
  re-souscrit 6 fois à **chaque** changement de date de validation → fuite d'abonnements.
  Sortir le bloc et le placer dans `initCrestronSubscriptions`.

- [ ] **`index.html` L8566 et L6634 — `subscribeState('n','10')` plafonné à `value <= 8`.**
  Le contrat prévoit 30 pièces. Passer à `<= 30`. Aujourd'hui, 7 pièces sur 15 ne mettent
  jamais `activeRoomId` à jour, ce qui casse les remontées admin.

- [x] **`index.html` L5221-5236 — `applySceneLevels` est un stub vide** — remplacé le
  09.09.2026 par `VillaUX.recallScene` (module en fin de page) ; l'ancien stub reste en place
  mais est écrasé par la définition du module (à purger lors d'un nettoyage).

- [x] **`index.html` L8777 — abonnement sur les joins v1 21-24** — retiré le 09.09.2026.

- [x] **`index.html` L3391 — `window.openWeatherWebsite()` appelé mais jamais défini.** *(09.09.2026 :
  `onclick` et attribut `style` dupliqué retirés du widget météo, sons cachés supprimés.)*
  `TypeError` à chaque appui sur le widget météo, remontée « UNHANDLED » sur le String 100.
  Le même `<div>` porte en plus un **attribut `style` dupliqué** : le parseur ne garde que
  le premier et jette silencieusement fond, padding, `height: 95px` et `overflow: hidden`.

- [ ] **`index.html` L274 et L346 — `themes/dark-theme.css` et `themes/villa_bg.jpg`
  n'existent pas.** `src/themes/` est absent et `deploy.ps1` ne le génère jamais → deux 404
  à chaque chargement, et pas de fond de villa. Créer le répertoire ou retirer les
  références.

- [ ] **`index.html` L6712-6721 — listener global en phase de capture sur tous les clics,
  avec un corps de `if` vide.** À supprimer.

- [ ] **Type de moteur ignoré** (`index.html` L6340-6379 et L6776-6781). Les icônes sont
  choisies en dur par position au lieu de lire `type` (`volet`/`rideau`/`store`) de
  `villa_config.json`.

---

## P6 — Résidus du contrat v1

- [ ] **`src/config.js`** — `admin_monitors` surveille le join **53** pour le mute
  (« Statut Mute (Join 53) »). Le C# n'écrit jamais `BooleanInput[53]` : l'indicateur reste
  figé à 0. → **55**.
- [ ] **`CONFIG_PROCESS.md`** — le § « Conflit résolu (v1.0.150) » dit encore
  « 53 (mute) ». `contrat.notes` de `villa_config.json` dit bien « 55 (mute) ».
- [ ] **`ControlSystem.cs` L31** — commentaire `// contrat v2 : joins digitaux 45-48`,
  faux (ni v1 21-24, ni v2 51-54).
- [ ] **`ControlSystem.cs` L1134-1153** — `case 103:` **digital** : code mort (aucun GUI
  ne l'émet) qui duplique le chemin sériel avec une troncature différente (254 contre
  8000 caractères). À supprimer.

---

## P7 — Dette technique et robustesse

- [ ] **Extraire `js/villa-common.js`.** 42 fonctions sur 46 sont dupliquées entre
  `index.html` et `iphone.html`, dictionnaires de traduction et `fallbackConfig` compris.
  C'est la cause structurelle du bug P0 et de toutes les divergences futures.

- [ ] **Purger les fonctions redéfinies dans `index.html`** : `openSourceControlModal` ×3,
  `closeSourceControlModal` ×3, `selectSourceSim` ×3, `sendPowerOff` ×3, `updatePowerOffUI`
  ×2, `updateMuteUI` ×2, `closeAllModals` ×2, `openAlarmModal`/`closeAlarmModal` ×2,
  `openCamerasModal`/`closeCamerasModal` ×2, `openMediaPlayerModal`/`closeMediaPlayerModal`
  ×2, `refreshIptable` ×2. La queue du fichier (L9226-9526) empile trois générations du
  même contrôleur d'interlock.

- [ ] **Dédupliquer le CSS** : `.custom-overlay-panel` défini 3 fois (L959, 979, 1063) avec
  des `z-index` différents, `.modal-backdrop` 2 fois (L965, 1050), logo SVG en data-URI
  répété 7 fois (~1,5 ko chacun) dont 3 copies avec un `path` corrompu.

- [ ] **Timeout et retransmission sur le transfert de config** (`ControlSystem.cs`
  L394-407). Un ACK perdu bloque le transfert définitivement. Avec ~279 chunks par panel,
  la probabilité n'est pas négligeable. Ajouter un timer et un compteur de tentatives.

- [ ] **Réduire le flot de signaux EISC.** Chaque `SendFeedback*ToRoom` déclenche
  `MirrorRoomStateToEisc` (~62 signaux × N périphériques) ; un glissement de curseur en
  provoque un par échantillon, et `ProcessEiscRoomSignal` le fait **deux fois** (L727-728,
  L741-742).

- [ ] **Synchroniser `_activeRoomPerDevice` et `_configChunkCursor`.** Ce sont des
  `Dictionary` non protégés, mutés depuis les handlers `SigChange` multi-threads. Ajouter
  un `lock` ou une `CCriticalSection`.

- [ ] **Migrer vers les attributs CH5 natifs** conformément à `.agents/AGENTS.md` :
  supprimer les 13 `setAttribute('selected')` manuels, les 27 bascules de
  `ch5-button--selected`, les 2 `classList.add('is-active')` (L6259, L6262 — nommément
  proscrits **et** sans effet, aucune règle CSS ne les définit), et remplacer les 79
  écritures `innerText` de valeurs process par `data-ch5-textcontent` alimenté par des
  String Joins formatés côté C#. Cas prioritaire : L6166-6177, où le JS et le processeur
  écrivent concurremment le même attribut `selected` (source du scintillement de
  sélection).

- [ ] **`ControlSystem.cs` L481 — `if (result.ToString() == "Success")`** : comparaison de
  chaîne au lieu de l'énumération `eDeviceRegistrationUnRegistrationResponse.Success`. Un
  échec silencieux exclut le périphérique de `_touchPanels`.

- [ ] **Vider les `catch { }` silencieux** : `ControlSystem.cs` L166, L470, L669 (miroir
  EISC — un dysfonctionnement du pont serait invisible) et les 11 `catch (e) {}` vides de
  `index.html`.

- [ ] **`deploy.ps1`** : prendre le `.cpz` dans **Release** et non `bin\Debug` (L157) ;
  `progreset -p:01` codé en dur (L139) alors que `progload` utilise `$S.CP4.Slot` ;
  la version est incrémentée **avant** le build, donc un `ch5-cli archive` en échec brûle
  un numéro ; les mots de passe passent en clair via `-pw` (visibles dans la table des
  processus).

- [ ] **Déployer aussi pour l'iPad et l'iPhone.** `deploy.ps1` ne pousse le `.ch5z` que sur
  la TSW ; les clients Crestron Go (0x05, 0x06) peuvent tourner sur une version antérieure.

---

## P8 — Contenu et livraison

- [ ] **`villa_config.json` → `valeursParDefaut.scenesEclairage` contient des noms de test
  grossiers** (`"Sex"`, `"Baise"`, `"Alcool"`). Toute pièce dont une scène est laissée à
  `""` les affichera. À remplacer **avant toute démonstration ou livraison**.

- [ ] **Remplacer la configuration de maquette par le plan réel de la villa.** Les 15
  pièces actuelles (« Chambre Maman », « Suite amis », « Chambre Amis » + « Chambre 2 » et
  « Chambre 3 »…) sont manifestement provisoires.

- [ ] **`ControlSystem.cs` L598-601** — repli 10 pièces en dur, avec la coquille
  `"Terrasse extrieure"`.

- [ ] **Sortir les valeurs en dur du C# vers `villa_config.json`** : bornes CVC (280/160 en
  dixièmes, L707/709/904/911), paliers de scènes (0 / 19660 / 45875 / 65535, dupliqués
  L701-704 et L892-895), libellés de sources (L1310-1314), IP-ID des panels, nom de projet
  `villaftv`.

---

## P9 — Documentation

- [ ] **Retirer `CONFIG_PROCESS.md`** au profit de [`docs/02_CONFIG_JSON.md`](02_CONFIG_JSON.md),
  ou le réduire à un pointeur. Il contient un résidu de contrat v1 (voir P6).
- [ ] **Compléter les colonnes « testé sur site »** de [05 — Recette](05_RECETTE.md).
- [ ] **Tenir le journal de recette** (fin du document 05).
- [ ] **Mettre à jour `README.md`** à la racine : il annonce « Version 1.0.12 » alors que
  `version.json` est à 1.0.165, et sa liste de bugs fait double emploi avec ce document.
