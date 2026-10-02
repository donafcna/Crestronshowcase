# 01 — Spécification de l'interface Villa Crans

## 1. Périmètre

Interface de pilotage domotique d'une villa, en trois briques :

| Brique | Emplacement | Rôle |
|---|---|---|
| GUI CH5 | `src/index.html`, `src/iphone.html` | Interface utilisateur, HTML/CSS/JS, empaquetée en `.ch5z` |
| Programme slot 1 | `Backend/Backend/ControlSystem.cs` | SIMPL# Pro : état de la villa, logique, distribution de la config |
| Programme slot 2 | `..\VillaCrans SIMPL\VillaCrans_Slot2.smw` | SIMPL Windows : pilotage du matériel réel, relié au slot 1 par EISC |

Le GUI ne parle **jamais** au matériel directement : il publie et lit des joins Crestron.
Toute la logique d'état vit dans le slot 1 ; le pilotage physique vit dans le slot 2.

## 2. Périphériques

| IP-ID | Périphérique | Type Crestron | Fichier GUI | Notes |
|---|---|---|---|---|
| `0x03` | Dalle tactile TSW-1070 | `Tsw1070` | `index.html` | Extenders audio / toolbar / appControl. Diffuse sa pièce active sur l'analogique 240 |
| `0x04` | XPanel navigateur | `XpanelForHtml5` | `index.html` | ⚠️ **Même IP-ID que le debugger de `tools/console.html`** — ne pas ouvrir les deux en même temps |
| `0x05` | iPad | `CrestronApp` (`villaftv`) | `index.html` | |
| `0x06` | iPhone | `CrestronApp` (`villaftv`) | `iphone.html` | Redirection automatique depuis `index.html` sur détection d'UA iPhone/iPod |
| `0xF0` | EISC vers slot 2 | `EthernetIntersystemCommunications` | — | `127.0.0.2` (boucle inter-slots du CP4) |

Le slot 1 traite l'EISC **comme un panel** : il est ajouté à `_touchPanels` et reçoit tout
le feedback global. C'est voulu, mais cela veut dire qu'un signal global écrit par le
slot 2 est traité exactement comme un appui sur une dalle.

### Découplage par périphérique

Chaque IP-ID a **sa propre pièce affichée** (`_activeRoomPerDevice`). La TSW peut être sur
le Salon pendant que l'iPad est sur la Chambre 2 ; les commandes de chacun s'appliquent à
sa pièce. Le slot 2, lui, pilote n'importe quelle pièce sans dépendre de l'affichage, via
les blocs de joins ≥ 1000 (voir [03 — Contrat de joins](03_CONTRAT_JOINS.md)).

## 3. Structure de l'écran principal (`index.html`)

```
┌──────────────┬────────────────────────────────────────────────────────┐
│ SIDEBAR      │ EN-TÊTE : contrôles globaux (#header-global-controls)  │
│              ├────────────────────────────────────────────────────────┤
│ ⚙️ Réglages   │  ÉCLAIRAGES (#card-eclairages)                         │
│ ● Online(04) │    onglet LUMIÈRES / onglet STORES                     │
│              │    4 scènes · jusqu'à 10 circuits + sliders            │
│ Liste des    │    jusqu'à 6 moteurs (volet / rideau / store)          │
│ pièces       ├────────────────────────────────────────────────────────┤
│ (#rooms-     │  CVC (#card-cvc) : temp. actuelle, mode, consigne ±    │
│  container)  ├────────────────────────────────────────────────────────┤
│ ▲▼ scroll    │  AUDIO/VIDÉO (#card-av) : 5 sources + OFF, volume, mute│
│              ├────────────────────────────────────────────────────────┤
│ Widget météo │  BANDEAU ACTUALITÉS (#news-banner)                     │
│ / actualités │                                                        │
│ v1.0.165     │                                                        │
└──────────────┴────────────────────────────────────────────────────────┘
```

### Modales

| Overlay | Ouverture | Contenu |
|---|---|---|
| `#settings-overlay` | roue crantée de la sidebar | choix de la langue, choix du thème |
| `#admin-overlay` | appui long 3 s sur le libellé de version | monitoring des joins, terminal console CP4, date de dernière validation, grille par pièce |
| `#circuits-overlay` | roue crantée de la carte Éclairages | détail des circuits |
| `#motors-overlay` | roue crantée de la carte Stores | détail des moteurs |
| `#alarm-overlay` | contrôles globaux | armement général + 4 partitions |
| `#cameras-overlay` | contrôles globaux | vidéosurveillance |
| `#source-control-overlay` | carte A/V | transport de la source sélectionnée |
| `#media-player-overlay` | carte A/V | lecteur média |
| `#global-control-overlay` | contrôles globaux | tout allumer / éteindre / éco / stores / CVC / vacances |
| `#global-preset-custom-overlay` | dans les contrôles globaux | éditeur des presets globaux (persistés côté CP4) |

### Pages spéciales

Activées par `pagesSpeciales` de `villa_config.json` : **Jeux** (`#special-game`, jeu canvas),
**Animation** (`#special-anim`, ~20 animations particulaires), **Vidéo** (`#special-video`,
recherche YouTube paramétrable). Elles apparaissent dans le menu de navigation.

## 4. Modules par pièce

Chaque pièce active ou désactive cinq modules via `pilotages` dans `villa_config.json`.
Un module inactif est **masqué** dans le GUI pour cette pièce.

| Module | Contenu | Limite |
|---|---|---|
| `eclairages` | scènes + circuits à niveau (sliders) | **4** scènes, **10** circuits |
| `moteurs` | volets / rideaux / stores, Monter / Stop / Descendre + scènes de stores | **6** moteurs, **4** scènes de stores |
| `cvc` | température actuelle, mode (CHAUFFAGE/CLIMATISATION), consigne ± 0,5 °C | 16 → 28 °C, pas 0,5 |
| `controlesGeneraux` | armement alarme + partitions | **4** partitions |
| `audioVideo` | sélection de source, volume, mute | **6** entrées : 0 = OFF + 5 sources |

Ces limites sont **structurelles** : les dépasser provoque des collisions de joins
silencieuses (voir [03 — Contrat de joins](03_CONTRAT_JOINS.md) § Collisions).

## 5. Thèmes

Quatre thèmes, sélectionnés dans la modale Réglages, mémorisés en `localStorage`
(`crestron_theme`, `crestron_theme_iphone`) :

| Thème | Classe sur `<body>` | Caractère |
|---|---|---|
| Sombre Premium 🌙 | *(aucune — c'est `:root`)* | défaut |
| Clair Élégant ☀️ | `theme-light` | fond clair |
| Verre Dépoli ❄️ | `theme-glass` | translucide, `blur(25px)` |
| Bleu Cyberpunk 🌌 | `theme-cyber` | bleu nuit |

Mécanique : chaque classe redéfinit 8 variables CSS (`--bg-color`, `--container-bg`,
`--text-primary`, `--blur-val`…).

⚠️ **Le système de thèmes n'est appliqué qu'à une trentaine d'endroits sur ~2900 lignes de
CSS.** Tout le reste est en couleurs codées en dur avec `!important`. C'est la cause du
bug « liste des pièces illisible en thème light » et de la roue crantée invisible en
thème glass. Toute nouvelle règle de couleur doit passer par les variables.

## 6. Langues

Cinq langues : **fr** (référence), **en**, **es**, **de**, **ru**.

- Les libellés de l'interface sont portés par des attributs `data-i18n="clé"` et traduits
  par `applyLanguage(lang)`.
- Les noms issus de la configuration (pièces, circuits, moteurs, scènes, sources) sont
  traduits par la table `traductions` de `villa_config.json`, **indexée par la chaîne
  française de référence**.
- Le GUI retraduit intégralement à chaque changement de langue.
- ⚠️ Les deux fichiers GUI embarquent **chacun leur propre copie** des dictionnaires. Une
  traduction ajoutée dans `index.html` n'apparaît pas sur l'iPhone.

## 7. Distribution de la configuration

Le GUI ne lit jamais `villa_config.json` sur le CP4 en direct. Quatre sources, par priorité
croissante :

1. **Embarqué** — `src/villa_config.js`, généré par `deploy.ps1` (`window.villaConfigEmbedded`).
   Appliqué à T+300 ms. C'est le repli qui marche sur dalle, où `fetch()` local est bloqué.
2. **Cache navigateur** — `localStorage['villa_config_json']`, appliqué à T+700 ms.
3. **`fetch('villa_config.json')`** — uniquement en contexte XPanel navigateur.
4. **Push du CP4** — prioritaire, écrase tout, à tout moment.

### Protocole de push (le plus important à comprendre)

```
CP4                                          Panel
 │  String 106 : empreinte FNV-1a de la config │
 ├────────────────────────────────────────────►│  compare avec localStorage
 │                                             │  si identique → rien
 │◄────────────────────────────────────────────┤  Digital 250 (impulsion)
 │  String 105 : "VCFG|1|279|{payload…}"       │
 ├────────────────────────────────────────────►│
 │◄────────────────────────────────────────────┤  Analog 250 = 1  (ACK)
 │  String 105 : "VCFG|2|279|…"                │
 ├────────────────────────────────────────────►│
 │                       … 279 chunks …        │
 │                                             │  JSON.parse → cache → re-modelage du GUI
```

- Chunks de **180 caractères**, protocole *stop-and-wait* : chaque chunk est acquitté avant
  l'envoi du suivant.
- Tout le JSON est ré-échappé en `\uXXXX` (`EscapeNonAscii`) : les serials CIP natifs
  remplaceraient les emojis et accents par `?`. C'est ce qui fait passer le fichier de
  ~41 800 à ~50 100 caractères, soit **~279 chunks**.
- Le panel peut redemander la config à tout moment : **Digital 250**.
- ⚠️ Aucun timeout, aucune retransmission : un ACK perdu bloque le transfert
  définitivement jusqu'à un nouvel appui sur le Digital 250.

## 8. Widgets et surcharges d'affichage

Deux widgets pilotables : `meteoActualites` (météo Nyon + RSS, colonne de gauche) et
`bandeauActualites` (bandeau défilant). Résolution du plus général au plus précis, le
dernier gagne :

1. `widgets.<widget>.actif` — réglage global villa
2. `widgets.parPeripherique[ipid]` — par appareil (clé = IP-ID hexa, `"03"`, `"04"`…)
3. `pieces[].widgets.<widget>` — par pièce affichée
4. `pieces[].widgets.parPeripherique[ipid]` — pièce + appareil

Le GUI apprend son IP-ID par le **String 99** et réévalue le masquage à chaque changement
de pièce.

## 9. Fonctions de service

| Fonction | Mécanisme |
|---|---|
| Terminal console CP4 | modale admin → String 103 (commande) → `CrestronConsole.SendControlSystemCommand` → String 103 (réponse, diffusée à **tous** les panels) |
| Remontée des logs GUI | `console.log/warn/error` et `window.onerror` redirigés vers le **String 100** (tronqué à 250 caractères) |
| Métadonnées CPZ | Strings 101 (nom) / 102 (date de compilation) |
| Date de dernière validation | String 104, **par périphérique**, persistée côté CP4 dans `/user/last_validation_date_XX.txt` |
| Volume matériel de la dalle | Analog 260 / Digital 261 (mute avec mémorisation du dernier volume) |
| Presets globaux | payload JSON sur le String 420 → `/user/preset_cfg_<nom>.json` |
| Météo & actualités | XHR direct depuis le GUI (Open-Meteo Nyon, RSS Le Monde / BBC via proxy SSL) |

## 10. Chaîne de build et de déploiement

`deploy.ps1 -Target all|tsw|cp4|config [-SkipBuild]`

1. Incrémente le patch de `version.json`, écrit `src/version.js` et `src/build_date.json`.
2. Copie `villa_config.json` dans `src/` **et** génère `src/villa_config.js` (embarqué).
3. `npx ch5-cli archive -p villaftv -d src -o dist` → `dist/villaftv.ch5z`.
4. TSW : `pscp` vers `/display/villaftv.ch5z` puis console `PROJECTLOAD`.
5. CP4 : `pscp` de `villa_config.json` vers `/user/` et du `.cpz` vers `/program<slot>/`,
   puis `progload -p:<slot>`.
6. `-Target config` seul : valide le JSON, le pousse, puis `progreset -p:01`.

⚠️ Points connus : le `.cpz` est pris dans `bin\Debug` ; le JSON n'est **pas** validé sur
les cibles `all`/`cp4` ; **rien n'est déployé pour l'iPad et l'iPhone** — le `.ch5z` ne va
que sur la TSW, les clients Crestron Go peuvent donc tourner sur une version antérieure.

## 11. Outil de développement

`tools/console.html` + `tools/console_server.js`, serveur Node local sur `127.0.0.1:8090`
(lancé par `Console Web.cmd`) :

- **Debugger** : connexion WebXPanel sur IP-ID `0x04`, surveillance et forçage de n'importe
  quel join (pulse / ON / OFF / analogique / série), filtrage par pièce et par type.
- **Terminal** : SSH `plink` vers le CP4 ou la TSW, identifiants lus dans
  `deploy.secrets.psd1` (ils ne quittent pas le serveur local).
- **Déploiement** : lance `deploy.ps1` en streaming.

⚠️ Le debugger occupe l'IP-ID `0x04`, le même que le XPanel de production. Un seul client
par IP-ID.

## 12. Contraintes de développement (`.agents/AGENTS.md`)

Règles à respecter, issues de retours terrain sur la TS1070 :

1. Pas de manipulation DOM JS ni de souscription WebXPanel brute pour les **états visuels**.
2. Utiliser les attributs CH5 natifs : `receiveStateSelected`, `sendEventOnClick`,
   `data-ch5-textcontent`.
3. Feedback de sélection sur **joins digitaux**, jamais sur analogiques ni sur bascule
   manuelle de classe CSS (`is-active` est nommément proscrit).
4. Valeurs numériques : les formater **côté C#** en chaînes et les afficher par
   `data-ch5-textcontent`, pour éviter les problèmes de timing asynchrone.

⚠️ Le code actuel viole massivement ces quatre règles (13 `setAttribute('selected')`
manuels, 27 bascules de `ch5-button--selected`, 79 écritures `innerText` pour des valeurs
process, contre **4** usages de `data-ch5-textcontent`). Voir [06 — To-do](06_TODO.md).
