# 02 — Guide de `villa_config.json`

`villa_config.json`, à la racine du projet, est la **source unique de vérité** pour
dimensionner le GUI : pièces, modules actifs, noms, sources A/V, traductions, widgets,
pages spéciales et contrat de joins.

Ni le GUI ni le C# ne contiennent la liste des pièces en dur — enfin, presque : voir
§ « Ce que le fichier ne pilote pas » à la fin.

---

## 1. Process d'équipe Fréquence TV

1. **Remplir** les sections `pieces`, `sourcesAudioVideo`, `scenesStores`, `widgets`,
   `pagesSpeciales`.
2. **Faire compléter les traductions** : envoyer le fichier dans la conversation Claude,
   qui remplit `traductions` pour les 5 langues à partir des chaînes françaises.
3. **Vérifier le JSON** avant de déployer (`Get-Content villa_config.json | ConvertFrom-Json`
   sous PowerShell, ou n'importe quel validateur). ⚠️ `deploy.ps1 -Target all` ne le fait
   **pas** — et un JSON malformé rend le processeur muet, voir § Pièges.
4. **Déployer** : `.\deploy.ps1 -Target config` (JSON seul, avec validation et
   `progreset`) ou `.\deploy.ps1` (tout).
5. Au boot, le CP4 lit `/user/villa_config.json`, dimensionne son registre de pièces et
   pousse la configuration aux panels. Le GUI se modèle à réception.

Le panel peut redemander la configuration à tout moment : **Digital 250**.

---

## 2. Structure générale

```json
{
  "meta":              { … },   // identité du projet, langues, aide-mémoire
  "valeursParDefaut":  { … },   // valeurs de repli + catalogue d'icônes
  "sourcesAudioVideo": [ … ],   // 5 sources max
  "scenesStores":      { … },   // 4 scènes de stores
  "widgets":           { … },   // affichage météo / bandeau, surcharges par appareil
  "pieces":            [ … ],   // LE cœur du fichier
  "traductions":       { … },   // en / es / de / ru, indexées par la chaîne fr
  "contrat":           { … },   // référence de joins — NE PAS MODIFIER à la légère
  "pagesSpeciales":    { … }    // Jeux / Animation / Vidéo
}
```

---

## 3. `meta`

```json
"meta": {
  "projet": "Villa Crans",
  "integrateur": "Fréquence TV",
  "version": "1.0.0",
  "mode": "deploiement",
  "dateModification": "2026-08-22",
  "langueReference": "fr",
  "languesDisponibles": ["fr", "en", "es", "de", "ru"],
  "aide": [ "…rappels du process et des limites…" ]
}
```

Purement documentaire, **sauf `mode`**. Tenir `dateModification` à jour aide à
corréler avec les versions déployées.

### `meta.mode` — déploiement client ou vitrine web (09.09.2026)

Le même GUI existe en deux versions qu'il ne faut jamais confondre :

| | `"deploiement"` (ce dépôt) | `"showcase"` (site crestrongui.vercel.app) |
|---|---|---|
| Feedback des boutons | **backend** : appui → CrComLib/WebXPanel → C# slot 1 → SIMPL slot 2 (interlocks, drivers) → C# → GUI. Aucun feedback simulé côté navigateur. | **frontend** : `js/local-feedback.js` simule l'automate dans le navigateur (chaque appui produit son feedback). |
| Curseur de démonstration automatique | **jamais** — n'existe pas dans `src/` | géré par le site React (hook `useAutoDemo`), hors du GUI |
| Connexion CP4, console admin, indicateur Online | présents | retirés |
| Noms des pièces / scènes / sources | ceux du client | noms de démonstration |

La valeur `"showcase"` est posée uniquement par `scripts/sync-villa-crans.py` du dépôt
Crestronshowcase, qui copie `src/index.html` + `iphone.html` et génère un
`villa_config` vitrine. Dans ce dépôt, `mode` vaut toujours `"deploiement"`.
Workflow complet : [08 — Workflow](08_WORKFLOW_SHOWCASE.md). Garde-fou : `local-feedback.js` refuse de démarrer si `meta.mode !== "showcase"`,
donc même copié par erreur sur un CP4 il reste inerte.

---

## 4. `valeursParDefaut`

Sert de repli : **un nom laissé vide (`""`) reprend la valeur par défaut correspondante**.

| Clé | Rôle |
|---|---|
| `iconesDisponibles` | catalogue emoji → libellé, à copier-coller dans `pieces[].icone` |
| `scenesEclairage` | 4 noms de scènes par défaut |
| `circuits` | 4 noms de circuits par défaut |
| `moteurs` | 6 entrées `{nom, type}` par défaut |
| `scenesStores` | 4 noms de scènes de stores par défaut |
| `cvc` | `consigneMinC`: 16, `consigneMaxC`: 28, `pasC`: 0.5 |

⚠️ **`valeursParDefaut.scenesEclairage` contient actuellement des noms de test grossiers**
(`"Sex"`, `"Baise"`, `"Alcool"`). Toute pièce dont une scène est laissée à `""` les
affichera. À remplacer avant toute démonstration ou livraison — voir
[06 — To-do](06_TODO.md).

⚠️ `cvc.consigneMinC` / `consigneMaxC` / `pasC` ne sont **pas lus** par le C#, qui applique
des bornes en dur (280 / 160 en dixièmes, pas de 5). Modifier ces valeurs ici ne change
rien tant que le C# n'a pas été adapté.

---

## 5. `pieces` — le cœur du fichier

Un objet par pièce. **30 pièces maximum** depuis le contrat v3 : chaque pièce consomme son
propre bloc de 100 joins côté GUI (`1000 + (id−1)×100`), et la pièce 30 atteint le join
3998, juste sous le plafond CH5 de 4000. La même limite vient de `Piece.Select`
(digitaux 11-40). Au-delà, `VillaJoins.setRoom()` refuse l'identifiant.

```json
{
  "id": 1,
  "nom": "Salle de Jeux",
  "icone": "🎮",
  "intersystem": true,
  "pilotages": {
    "eclairages": {
      "actif": true,
      "scenes":   { "nombre": 4,  "noms": ["OFF", "CINÉMA", "REPAS", "TOTAL"] },
      "circuits": { "nombre": 10, "noms": ["Spots Plafond Ouest", "…"] }
    },
    "moteurs": {
      "actif": false,
      "nombre": 6,
      "liste": [
        { "nom": "Volet ext. 1",  "type": "volet"  },
        { "nom": "Rideau ext. 1", "type": "rideau" },
        { "nom": "Store 1",       "type": "store"  }
      ]
    },
    "cvc":               { "actif": false },
    "controlesGeneraux": { "actif": true, "partitionsAlarme": 4 },
    "audioVideo":        { "actif": false, "sources": [1, 2, 3, 4, 5] }
  }
}
```

### Champs de premier niveau

| Champ | Type | Rôle |
|---|---|---|
| `id` | entier | **Séquentiel à partir de 1, sans trou.** Détermine le join de sélection (`10 + id`) et la base du bloc EISC (`1000 + (id−1)×100`) |
| `nom` | chaîne | Nom français de référence. Sert de clé dans `traductions` |
| `icone` | emoji | Icône affichée à gauche du nom dans le menu. Absente ⇒ déduite du nom, sinon 🏠 |
| `intersystem` | booléen | `true` = le bloc **EISC** de la pièce est actif. `false` = **aucun signal de cette pièce n'apparaît côté SIMPL**. Absent ⇒ `true`. ⚠️ Sans effet sur le GUI : depuis la v3, toute pièce écrit sur son propre bloc 1000+ |
| `widgets` | objet | *(optionnel)* surcharge d'affichage quand cette pièce est affichée |

⚠️ **`id` doit commencer à 1.** Le C# initialise la pièce active de chaque périphérique à
`1` avant même d'avoir lu la config ; si aucune pièce ne porte l'`id` 1, l'initialisation
lève et le processeur ne démarre pas.

### Modules (`pilotages`)

`"actif": false` masque **toute la section** correspondante dans le GUI pour cette pièce.

| Module | Sous-champs | Maximum |
|---|---|---|
| `eclairages` | `scenes.nombre` + `scenes.noms[]`, `circuits.nombre` + `circuits.noms[]` | **4** scènes, **10** circuits |
| `moteurs` | `nombre`, `liste[]` de `{nom, type}` | **6** moteurs |
| `cvc` | *(aucun)* | — |
| `controlesGeneraux` | `partitionsAlarme` | **4** partitions |
| `audioVideo` | `sources[]` (ids déclarés dans `sourcesAudioVideo`) | **5** sources + OFF |

`type` d'un moteur ∈ `volet` | `rideau` | `store` — censé choisir l'icône du GUI.

⚠️ **Le `type` n'est en réalité pas lu** : le GUI choisit l'icône en dur par position
(moteurs 1-2 = volet, 3-4 = rideau, 5-6 = store). Le champ est donc documentaire tant que
ce n'est pas corrigé. Pour l'instant, **ordonner la liste 2 volets / 2 rideaux / 2 stores**
si l'on veut les bonnes icônes.

⚠️ `audioVideo.sources[]` n'est pas lu non plus : les 5 sources sont toujours toutes
proposées.

### État actuel des 15 pièces

| id | Icône | Nom | intersystem | Écl. | Scènes | Circuits | Moteurs | CVC | Ctrl. gén. | A/V |
|---:|:--:|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 1 | 🎮 | Salle de Jeux | **oui** | oui | 4 | 10 | non | non | oui | non |
| 2 | 🛏️ | Chambre Maman | **oui** | oui | 4 | 4 | oui | non | non | oui |
| 3 | 🛏️ | Chambre Papa | **oui** | non | 4 | 4 | oui | oui | oui | oui |
| 4 | 🚪 | Suite amis | non | oui | 4 | 4 | non | oui | non | non |
| 5 | 🛏️ | Chambre Amis | non | oui | 4 | 4 | oui | oui | oui | oui |
| 6 | 🛏️ | Chambre 2 | non | oui | 4 | 4 | oui | oui | oui | oui |
| 7 | 💼 | Bureau | non | oui | 4 | 4 | oui | oui | oui | oui |
| 8 | 🎬 | Home Cinéma | non | oui | 4 | 4 | oui | oui | oui | oui |
| 9 | 🛏️ | Chambre 3 | non | oui | 4 | 4 | oui | oui | oui | oui |
| 10 | 🚪 | Suite Invités | non | oui | 4 | 4 | oui | oui | oui | oui |
| 11 | 🌿 | Terrasse & Jardin | non | oui | 4 | 4 | oui | oui | oui | oui |
| 12 | 🏊 | Piscine & Spa | non | oui | 4 | 4 | oui | oui | oui | oui |
| 13 | 🧖 | Sauna & Hammam | non | oui | 4 | 4 | oui | oui | oui | oui |
| 14 | 🏖️ | Pool House | non | oui | 4 | 4 | oui | oui | oui | oui |
| 15 | 🚗 | Garage & Ateliers | non | oui | 4 | 4 | oui | oui | oui | oui |

⬜ Ces 15 pièces et leurs noms sont manifestement une configuration de **maquette**
(« Chambre Maman », « Suite amis », « Chambre Amis » + « Chambre 2 »/« Chambre 3 »).
À remplacer par le plan réel de la villa.

Seules les pièces **1, 2 et 3** sont exposées à l'intersystem — c'est cohérent avec l'état
du câblage SIMPL (voir [04 — SIMPL slot 2](04_SIMPL_SLOT2.md)).

---

## 6. `sourcesAudioVideo`

```json
[ { "id": 1, "nom": "IPTV" },
  { "id": 2, "nom": "Box Pirate" },
  { "id": 3, "nom": "Humax" },
  { "id": 4, "nom": "Jukebox" },
  { "id": 5, "nom": "MUSIQUE" } ]
```

Maximum **5** (l'entrée 0 = OFF est implicite). Les joins de sélection sont 150 (OFF)
à 155 (source 5).

⚠️ Le C# ne connaît des libellés que pour les sources 1 à 4 (`DispatchIpCommandToSonyTv`) :
la source 5 est loggée comme « Power Off ». Sans effet fonctionnel aujourd'hui — cette
méthode ne fait que journaliser — mais à corriger avant d'y brancher un vrai pilote IP.

---

## 7. `scenesStores`

```json
"scenesStores": { "nombre": 4, "noms": ["Tout Ouvrir", "Position Été", "Position Hiver", "Tout Fermer"] }
```

Réglage **global villa** (pas par pièce). Joins 201-204.

---

## 8. `widgets`

```json
"widgets": {
  "meteoActualites":   { "actif": false },
  "bandeauActualites": { "actif": false },
  "parPeripherique": {
    "03": { "nom": "TSW dalle tactile", "meteoActualites": false },
    "04": { "nom": "XPanel navigateur" },
    "05": { "nom": "iPad" },
    "06": { "nom": "iPhone", "bandeauActualites": false }
  }
}
```

Clé = **IP-ID hexadécimal sur deux caractères**, sans `0x`.

Une pièce peut également imposer son réglage :

```json
{
  "id": 8,
  "nom": "Home Cinéma",
  "widgets": {
    "bandeauActualites": false,
    "parPeripherique": { "03": { "meteoActualites": false } }
  }
}
```

### Ordre de résolution (le plus précis gagne)

1. `widgets.<widget>.actif` — global villa
2. `widgets.parPeripherique[ipid].<widget>` — appareil
3. `pieces[].widgets.<widget>` — pièce affichée
4. `pieces[].widgets.parPeripherique[ipid].<widget>` — pièce + appareil

Le champ `nom` sous `parPeripherique` est purement documentaire. La structure est
extensible à d'autres paramètres d'affichage.

État actuel : les deux widgets sont **désactivés globalement**.

---

## 9. `pagesSpeciales`

```json
"jeux":      { "actif": true, "nom": "Jeux",      "icone": "🚀" },
"animation": { "actif": true, "nom": "Animation", "icone": "✨" },
"video":     { "actif": true, "nom": "Vidéo",     "icone": "⚽",
               "youtubeRecherche": "football highlights" }
```

`actif: false` retire l'entrée du menu de navigation. `youtubeRecherche` personnalise la
requête de la page Vidéo.

---

## 10. `traductions`

Objet à 4 clés (`en`, `es`, `de`, `ru`) — le français est la langue de référence et n'a pas
d'entrée. Chaque clé est un dictionnaire **indexé par la chaîne française exacte** :

```json
"traductions": {
  "en": { "Salle de Jeux": "Games Room", "Spots Plafond": "Ceiling Spots", … },
  …
}
```

Règles :

- La clé doit correspondre **au caractère près** au `nom` utilisé dans `pieces`,
  `circuits.noms`, `moteurs.liste[].nom`, `scenes.noms`, `sourcesAudioVideo[].nom` et
  `scenesStores.noms`. Une majuscule ou un accent qui diffère ⇒ pas de traduction, la
  chaîne française s'affiche telle quelle.
- Ajouter un nouveau nom dans `pieces` **sans** l'ajouter aux 4 langues est sans danger,
  mais ce nom restera en français dans les 4 autres langues.
- C'est cette section que Claude complète à l'étape 2 du process.

⚠️ Les libellés de l'**interface** (boutons, titres de sections, « FERMER »…) ne sont pas
ici : ils vivent dans des dictionnaires `translations` codés en dur **dans chacun des deux
fichiers HTML**. Une chaîne d'interface ajoutée dans `index.html` doit être répercutée à la
main dans `iphone.html`.

---

## 11. `contrat` — à ne pas modifier à la légère

Section de référence, décrite en détail dans [03 — Contrat de joins](03_CONTRAT_JOINS.md).
Version **3** depuis le 11.09.2026. Cinq clés :

| Clé | Rôle | Relue par du code ? |
|---|---|---|
| `version` | numéro de contrat (3) | non |
| `notes[]` | historique des renumérotations | non |
| `eisc` | `actif`, `ipid` (`"0xF0"`), `adresseIp` (`"127.0.0.2"`), `slotCible` | **oui** — C# au démarrage |
| `signauxGlobaux[]` | joins < 1000, miroir 1:1 vers l'EISC | non |
| `blocsPieces` | offsets du bloc de 100 joins **EISC** de chaque pièce | non |
| `blocsPiecesGui` | table de traduction des joins **du GUI** | **oui** — `js/villa-joins.js` |

Modifier un numéro dans `signauxGlobaux` ou `blocsPieces` **ne change rien au
comportement** : il faut modifier le C# et le GUI en même temps. Ces deux sections sont la
documentation de ce qui est codé, pas sa source.

`blocsPiecesGui` est l'exception : c'est une section **exécutable**, lue au démarrage du
GUI. La modifier change immédiatement le comportement des panels.

### 11.1 `contrat.blocsPiecesGui` — la seule section exécutable

Depuis le contrat v3, chaque pièce dispose côté GUI de son propre bloc de 100 joins,
identique au bloc EISC. Le HTML conserve ses joins « logiques » historiques ;
`js/villa-joins.js` les traduit à l'exécution en joins « physiques » :

```
joinPhysique = 1000 + (pieceId − 1) × 100 + offset
```

```json
"blocsPiecesGui": {
  "actif": true,
  "baseFormule": "1000 + (pieceId - 1) * 100",
  "tailleBloc": 100,
  "pieceMax": 30,
  "joinMaxTheorique": 3998,
  "appliqueEn": ["deploiement"],
  "exceptionsGlobales": [ { "plage": "digital 11-40", "nom": "Piece.Select", "raison": "…" } ],
  "mapping": {
    "digital": { "51": 21, "55": 50, "150": 51 },
    "analog":  { "21": 21, "52": 52 },
    "serial":  { "10": 10, "32": 32 }
  }
}
```

| Clé | Type | Rôle |
|---|---|---|
| `actif` | booléen | `false` ⇒ la couche `VillaJoins` est inerte, les joins logiques sont utilisés tels quels (comportement v2) |
| `description` | chaîne | documentaire |
| `baseFormule` | chaîne | documentaire — la formule est en dur dans `villa-joins.js` |
| `tailleBloc` | entier | pas entre deux bases (**100**). Lu par le JS |
| `pieceMax` | entier | identifiant de pièce maximum accepté par `setRoom()` (**30**) |
| `joinMaxTheorique` | entier | documentaire : `1000 + (pieceMax−1)×tailleBloc + 98` = 3998 |
| `appliqueEn` | tableau | modes (`meta.mode`) où la traduction s'applique. Vaut `["deploiement"]` : en **showcase**, un seul panel virtuel, aucune traduction |
| `note` | chaîne | documentaire |
| `exceptionsGlobales[]` | tableau | **documentaire uniquement** : liste des plages volontairement laissées globales, avec leur justification. Le code ne la lit pas — ce qui fait foi est l'absence de la clé dans `mapping` |
| `mapping` | objet | **le cœur exécutable** : trois tables `digital` / `analog` / `serial` |

#### `mapping` — lecture

Chaque table est un dictionnaire `"<join logique du HTML>": <offset dans le bloc>`.

| Écriture | Signification |
|---|---|
| `"digital": { "55": 50 }` | le digital **55** du HTML (`AV.Mute`) part sur **base + 50** |
| `"analog": { "52": 52 }` | l'analogique **52** (`AV.Volume`) part sur **base + 52** |
| `"serial": { "10": 10 }` | le sériel **10** (`Piece.Nom`) est reçu sur **base + 10** |

Un join **absent** de sa table n'est jamais traduit : il reste global. C'est ainsi que
`Piece.Select` (digitaux 11-40), l'alarme (41-48, 301-312), les presets globaux
(401-411, sériel 420), les télécommandes et les signaux système restent communs à toute la
villa.

Le type est déduit de l'attribut CH5 : `sendEventOnClick`/`OnTouch`/`OnUp`/`OnDown`,
`receiveStateSelected`/`Visible`/`Enabled` ⇒ digital ; `receiveStateValue`/`Brightness`
⇒ analogique ; `receiveStateLabel` ⇒ sériel. `sendEventOnChange` est analogique sur un
`ch5-slider`, digital ailleurs.

#### Ajouter un bouton et son join

1. **Choisir un offset libre** dans le bloc de 100. Consulter les offsets déjà pris dans
   [03 — Contrat de joins](03_CONTRAT_JOINS.md) § 3 ; rester sous **+98**.
2. **Choisir un join logique libre** (< 1000) pour le HTML — il ne doit collisionner avec
   aucun signal global de `signauxGlobaux`.
3. **Déclarer le couple** dans `blocsPiecesGui.mapping` :

   ```json
   "digital": { "…": …, "260": 47 }
   ```

4. **Déclarer le signal** dans `contrat.signauxGlobaux[]` (nom de contrat, type, direction)
   *et* dans `contrat.blocsPieces.offsets[]` (offset EISC) — sans quoi le slot 2 ne saura
   pas quoi câbler.
5. **Écrire le bouton** dans `index.html` **et** `iphone.html` avec le join **logique** :

   ```html
   <ch5-button label="…" sendEventOnClick="260"></ch5-button>
   ```

   Ne jamais écrire un join ≥ 1000 dans le HTML : la traduction s'en charge.
6. **Vérifier** dans la console du panel : `VillaJoins.phys('b', '260')` doit renvoyer
   `base + 47` pour la pièce affichée, et `VillaJoins.table()` doit lister le nouveau join.

⚠️ Un composant créé **dynamiquement** après le chargement est pris en charge
automatiquement (`setAttribute` est intercepté) ; en cas de sous-arbre injecté en
`innerHTML`, appeler `VillaJoins.rescan(element)`.

⚠️ Le join logique reste visible dans le DOM via les attributs miroir `data-join`,
`data-rjoin`, `data-cjoin`, `data-vjoin` : les règles CSS et les `querySelector` doivent
cibler **ceux-là**, jamais l'attribut `sendEventOnClick` dont la valeur change avec la
pièce.

⚠️ `exceptionsGlobales` n'étant pas lue par le code, elle peut diverger de `mapping`.
C'est le cas aujourd'hui pour le **sériel 10** : listé comme exception globale
(`Piece.Nom`) alors qu'il figure bien dans `mapping.serial` et est donc traduit en
`base + 10`. Le comportement réel est celui de `mapping`.

---

## 12. Pièges connus

| Piège | Conséquence | Parade |
|---|---|---|
| JSON malformé déployé par `-Target all` ou `-Target cp4` | `BuildVillaRoomsDatabase` lève, `InitializeSystem` avorte : **aucun panel enregistré, processeur muet** | Toujours valider le JSON avant. Préférer `-Target config` qui valide |
| `id` d'une pièce en chaîne (`"id": "1"`) au lieu d'entier | même effet : cast `(int)` qui lève | Respecter les types |
| `"intersystem": "true"` (chaîne) | même effet : cast `(bool)` qui lève | Booléen JSON, sans guillemets |
| Pas de pièce d'`id` 1 | plantage à l'initialisation | Numéroter à partir de 1 |
| 5ᵉ scène d'éclairage | join digital 55 = **mute audio** — la scène 5 coupe le son | Respecter la limite de 4 |
| 31ᵉ pièce | join digital 41 = **armement alarme** — sélectionner la pièce 31 arme l'alarme ; son bloc GUI tomberait à 4000, hors plage CH5 | Respecter la limite de 30 |
| `blocsPiecesGui.mapping` modifié sans toucher au HTML | le bouton part sur un autre offset du bloc, silencieusement | Toujours modifier mapping + HTML + `blocsPieces` ensemble (voir § 11.1) |
| Join ≥ 1000 écrit en dur dans le HTML | double traduction impossible : le join est laissé tel quel et vise une **autre pièce** | N'écrire que des joins logiques dans le HTML |
| `js/villa-joins.js` absent du `.ch5z` | repli inerte : retour au comportement v2, joins partagés entre pièces | Vérifier la présence du fichier, et la console (`[VillaJoins] couche absente`) |
| 11ᵉ circuit | analogique 81, dans la zone moteurs, silencieusement ignoré | Respecter la limite de 10 |
| 7ᵉ moteur | joins 99/100/101, hors contrat, ignorés | Respecter la limite de 6 |
| Fichier qui grossit | ~279 chunks aujourd'hui, chacun acquitté ; le temps de resynchronisation croît linéairement | Éviter les descriptions verbeuses dans le fichier |
| `-Target cp4` seul | `src/villa_config.js` n'est **pas** régénéré : la copie embarquée dans le `.ch5z` diverge de `/user/villa_config.json` | Utiliser `-Target config` ou `all` |

⚠️ Le C# n'émet **aucun avertissement** en cas de dépassement de limite. Les collisions
ci-dessus sont totalement silencieuses.

---

## 13. Ce que le fichier ne pilote pas

À savoir avant de promettre une configuration « 100 % fichier » :

- **Le dimensionnement côté C#** est en dur : `CircuitLevels[10]`, `PartitionStates[4]`,
  boucles 4 scènes / 6 moteurs. Le C# ne lit de `pieces[]` que `id`, `nom` et
  `intersystem`. Tout le reste (`pilotages`, `nombre`, `noms`) n'est exploité que par le
  GUI.
- **Les bornes CVC** (16-28 °C, pas 0,5) sont en dur dans le C#.
- **Les paliers de scènes d'éclairage** (0 / 19660 / 45875 / 65535) sont en dur, et
  dupliqués à deux endroits du C#.
- **Les IP-ID** des panels (`0x03`…`0x06`) et le nom de projet `villaftv` sont en dur.
- **Les 4 boutons de scène, les 5 sources, les 4 partitions et les caméras** sont statiques
  dans le HTML : ils ne sont pas générés à partir de la config.
- **Le type de moteur** et **`audioVideo.sources[]`** sont ignorés (voir § 5).

Exception notable dans l'autre sens : **`contrat.blocsPiecesGui` est réellement exécuté**
par le GUI (§ 11.1). C'est aujourd'hui la seule partie du fichier qui change le
comportement des joins sans recompiler quoi que ce soit.
