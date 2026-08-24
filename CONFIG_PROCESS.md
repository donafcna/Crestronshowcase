# Villa Crans — Configuration & Dimensionnement du projet

Le fichier **`villa_config.json`** (racine du projet) est la source unique de vérité pour
dimensionner le GUI CH5 : pièces, pilotages par pièce, noms des scènes/circuits/moteurs,
sources A/V, traductions et contrat de joins.

## Process équipe Fréquence TV

1. **Remplir** `villa_config.json` :
   - `pieces[]` : une entrée par pièce (id séquentiel, nom en français).
     Le champ **`icone`** (un emoji, ex. `"🎮"`) choisit l'icône affichée à gauche
     du nom dans le menu de navigation ; absent = icône déduite du nom ou 🏠.
   - Pour chaque pièce, la section `pilotages` active ou non chaque module :
     `eclairages`, `moteurs` (volets/stores/rideaux), `cvc`, `controlesGeneraux`, `audioVideo`.
   - Éclairages : `scenes.nombre` (max **4**) + noms, `circuits.nombre` (max **10**) + noms.
   - Moteurs : `nombre` (max **6**) + liste `{nom, type}` avec type ∈ `volet | rideau | store`
     (le type choisit l'icône du GUI).
   - Un nom vide `""` ⇒ le nom par défaut de `valeursParDefaut` est utilisé.
2. **Envoyer le fichier dans la conversation Claude** : Claude complète la section
   `traductions` pour toutes les langues du GUI (actuellement **fr, en, es, de, ru**).
   Les traductions sont indexées par la chaîne française de référence.
3. **Déployer** : `.\deploy.ps1` copie automatiquement `villa_config.json` dans
   `/user/villa_config.json` du CP4 (en plus du programme et du ch5z).
4. **Au boot du CP4** : le programme C# lit `/user/villa_config.json`, dimensionne son
   registre de pièces, puis **envoie la configuration au CH5** (String Join 105, chunks
   acquittés par l'Analog Join 250). Le GUI se modèle dynamiquement à réception et
   retraduit les noms à chaque changement de langue.
   - Le panel peut redemander la config à tout moment : Digital Join 250.

## Contrat de joins (section `contrat`)

Le contrat est structuré en deux familles — c'est la référence unique, GUI, C# et
SIMPL doivent s'y conformer :

1. **`contrat.signauxGlobaux[]`** : les joins système, globaux et d'interface
   (tous < 1000). Un `contractName` par signal ou famille (`joinDebut`/`nombre`).
   Ils sont répliqués **1:1** vers l'EISC du slot 2.
2. **`contrat.blocsPieces`** : les joins sont **listés par pièce**. Chaque pièce
   expose un bloc de **100 joins** sur l'EISC : **base = 1000 + (id − 1) × 100**
   (pièce 1 = 1000-1099, pièce 2 = 1100-1199, … pièce 15 = 2400-2499). Les
   `offsets[]` du contrat (à ajouter à la base) donnent le contractName de chaque
   signal du bloc : scènes (+21..24), consigne CVC (+31/+35/+36), scènes stores
   (+41..44), mute (+50), sources (+51..56), moteurs (+61..78), circuits (+71..80),
   partitions (+81..92), textes CVC (+32..34), nom de pièce (+10).

### Sélection des pièces remontées en intersystem

Chaque pièce du fichier de configuration porte un flag **`"intersystem": true|false`** :

- `true` : le bloc EISC de la pièce est actif — états poussés vers le slot 2 et
  commandes du slot 2 acceptées.
- `false` : le bloc est coupé — **aucun signal de cette pièce n'apparaît côté
  SIMPL**, ce qui limite le nombre de signaux à monitorer dans le debugger.

### Pont intersystem vers le slot 2 (SIMPL)

- Côté C# (déjà géré) : EISC déclaré avec `contrat.eisc.ipid` (**0xF0**) vers
  `127.0.0.2` (boucle inter-slots du CP4).
- Côté SIMPL (slot 2) : déclarer un symbole **Intersystem Communications**,
  IP-ID **F0**, IP **127.0.0.2**, et câbler les joins des blocs pièces voulus.
- Sens des signaux :
  - Slot 1 → slot 2 : état complet de chaque pièce exposée (feedback temps réel),
    signaux globaux 1:1, écho des appuis moteurs.
  - Slot 2 → slot 1 : toute commande écrite sur un bloc pièce (scène, consigne,
    source, circuit, partition…) est appliquée à la pièce visée et le feedback
    repart vers les panels et l'EISC — le SIMPL pilote n'importe quelle pièce sans
    dépendre de la pièce affichée sur la dalle.

### Conflit résolu (v1.0.150)

Les joins **201/202** étaient utilisés à la fois par le lecteur média du GUI
(mute/volume) et par les scènes de stores du C#. Le lecteur média utilise désormais
**53 (mute)** et **52 (volume)** — alignés sur le contrat ; **201–204** restent les
scènes de stores.

## Widgets (section `widgets`)

Réglage global villa (pas par pièce) — `"actif": false` masque le widget :

- `meteoActualites` : le widget météo Nyon / actualités RSS de la colonne de gauche.
- `bandeauActualites` : le bandeau défilant « Dernières Actualités » du bloc multimédia.

### Surcharges par périphérique (`widgets.parPeripherique`)

Chaque appareil peut avoir son propre réglage, clé = **IP-ID hexadécimal** :

```json
"parPeripherique": {
  "03": { "nom": "TSW dalle tactile", "meteoActualites": false },
  "04": { "nom": "XPanel navigateur" },
  "05": { "nom": "iPad" },
  "06": { "nom": "iPhone", "bandeauActualites": false }
}
```

### Surcharges par pièce (`pieces[].widgets`)

Chaque pièce peut aussi imposer son réglage — appliqué quand cette pièce est
affichée, sur tous les appareils ou pour un appareil précis :

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

### Règle de résolution (du général au particulier, le plus précis gagne)

1. `widgets.<widget>.actif` — réglage global villa
2. `widgets.parPeripherique[ipid]` — réglage de l'appareil
3. `pieces[].widgets.<widget>` — réglage de la pièce affichée
4. `pieces[].widgets.parPeripherique[ipid]` — réglage pièce + appareil

Le GUI identifie son IP-ID via le String Join 99 et ré-évalue le masquage à chaque
changement de pièce. Structure extensible à d'autres paramètres d'affichage.

## Limites à respecter

| Élément            | Maximum |
|--------------------|---------|
| Scènes d'éclairage | 4       |
| Circuits par pièce | 10      |
| Moteurs par pièce  | 6       |
| Sources A/V        | 6 (0=OFF + 5) |
| Partitions alarme  | 4       |
| Pièces | **30** en digital (joins 11-40, join = 10 + id), illimité via Analog 10 |

### Contrat v2 — renumérotation (22.08.2026)

`Piece.Select` couvre désormais 30 pièces (digitaux **11-40**). Signaux décalés en
conséquence : scènes d'éclairage **21-24 → 51-54**, mute **53 → 55**, consigne CVC
**35/36 → 49/50**, easter egg météo **37 → 56**. GUI, C# et blocs EISC sont alignés
(les offsets des blocs pièces, eux, ne changent pas).
