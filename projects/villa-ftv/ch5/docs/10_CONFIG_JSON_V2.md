# 10 — `villa_config.json` : inventaire et schéma cible v2 (04.10.2026)

Phase 1 de la feuille de route du 03.10.2026 (point technique avec Alexandre) : savoir ce que le JSON
pilote réellement, et donner au technicien un fichier qu'il peut remplir seul — code ouvert, aucune clé.
Le guide champ par champ reste `02_CONFIG_JSON.md` ; ce document-ci dit **ce qui marche, ce qui est mort,
ce qui manque**, et fixe la forme des clés à venir.

## 1. Outils pour le technicien

| Outil | Rôle |
|---|---|
| `villa_config.schema.json` | Schéma JSON (draft-07) : chaque clé décrite en français, bornes, valeurs permises. |
| `"$schema"` en tête de `villa_config.json` | VS Code charge le schéma : autocomplétion, survol = description, soulignement des erreurs. À ajouter dans chaque nouveau projet (chemin relatif vers ce fichier). |
| `node tools/check-config.mjs [fichier]` | Contrôle sans dépendance npm : **erreurs** (bloquantes) et **avertissements** (faute de frappe probable, clé prévue sans effet). |
| `deploy.ps1` | Appelle `check-config.mjs` juste après le contrôle « JSON OK » ; une erreur annule le déploiement. |
| `python tools/build-config-schema.py` | Régénère le schéma. **Ne jamais éditer `villa_config.schema.json` à la main.** |

Chaque clé porte un état (`x-etat`, repris en tête de sa description) :

- **actif** : lue par le GUI ;
- **[PROCESSEUR]** : lue seulement par le générateur SIMPL ou le C#, sans effet sur le GUI ;
- **[INUTILISÉ]** : lue par personne (information ou vestige) ;
- **[PRÉVU v2]** : acceptée et validée, mais **sans effet** tant qu'elle n'est pas implémentée. `check-config` la signale.

Résultat sur les configurations du dépôt : Villa FTV (racine et `src/`) 0 erreur et 0 avertissement ;
Appartement Crans-Montana 0 erreur et 8 avertissements (voir § 3) ; copies vitrine 0 erreur.

## 2. Inventaire — qui lit quoi

Recherche dans `src/index.html`, `src/iphone.html`, `src/js/*.js`, `simpl/direct/generate_simpl.js`, `Backend/**/*.cs`.

| Section | Clé | Lue par | État |
|---|---|---|---|
| meta | projet, version, mode, backend, interface, tracesConsole, tracesLatence, langueReference | GUI (+ C# pour projet / traces) | actif |
| meta | integrateur, dateModification, aide, description, coreOrigine, fonctionsRetirees | personne | inutilisé |
| meta | **languesDisponibles** | personne : les 5 boutons de langue sont en dur (`index.html` l. 4587-4611, `iphone.html`) | inutilisé |
| interface | menuPieces {visible, pieces, pieceParDefaut}, recherche {actif, suggestions} | `nav-pieces.js`, `quick-actions.js` | actif |
| valeursParDefaut | scenesEclairage, circuits, moteurs | GUI ; moteurs aussi par `generate_simpl.js` | actif |
| valeursParDefaut | iconesDisponibles, cvc.{consigneMinC, consigneMaxC, pasC} | personne (le GUI lit `pieces[].pilotages.cvc.consigne`) | inutilisé |
| sourcesAudioVideo | id, nom | GUI, `quick-actions.js` | actif — libellés des boutons encore en dur dans `index.html` |
| scenesStores | nombre, noms | `connect-ui.js` seulement (GUI standard : libellés en dur) | actif (Connect) |
| widgets | meteoActualites, bandeauActualites, parPeripherique | GUI | actif |
| pieces[] | id, nom, icone, actif | GUI, pont SIMPL, générateur | actif — `icone` = emoji affiché |
| pieces[] | intersystem | C# / slot 2 (backend csharp) | processeur |
| eclairages | scenes {nombre, noms, niveaux}, circuits {nombre, noms} | GUI, générateur | actif |
| eclairages | circuits.type, circuits.lutron (Appartement) | personne | inutilisé |
| moteurs | nombre, liste[] {nom, type, lamelles} | GUI (`motors-controls.js`), générateur | actif |
| cvc | actif, consigne {min, max, pas}, ventilation.actif | GUI | actif |
| cvc | etatInitial | générateur, C# | processeur |
| cvc | marcheArret, ventilation.vitesses | personne (le GUI affiche toujours Auto / Faible / Moyen / Fort) | inutilisé |
| controlesGeneraux | actif | GUI | actif |
| controlesGeneraux | partitionsAlarme | personne | inutilisé |
| audioVideo | actif, sources | GUI | actif |
| wellness | sauna, hammam | GUI | actif |
| pagesSpeciales | jeux, animation, video | GUI | actif |
| traductions | en, es, de, ru | GUI | actif |
| contrat | simplDirect | pont `villa-joins.js`, générateur | actif (backend simpl) |
| contrat | cvcEtendu | `room-controls.js` | actif |
| contrat | signauxGlobaux, eisc, blocsPieces, alarme | C# (backend csharp) ; signauxGlobaux aussi lu par les moteurs | processeur |
| contrat | blocsPiecesGui | désactivé depuis v4 (`actif:false`) | vestige |

## 3. Constats

1. **Langues et thèmes ne se configurent pas.** Les 5 boutons de langue et les 3 options de thème sont en dur dans
   les deux HTML. Thème initial = `localStorage crestron_theme`, sinon `dark`. `meta.languesDisponibles` n'est lu nulle part.
2. **Tous les circuits sont des faders.** L'Appartement déclare déjà `circuits.type` = DALI / PHASE / **contact**
   (5 circuits contact) : c'est la *technologie*, pas la commande. Un circuit contact s'affiche aujourd'hui en fader.
   D'où deux clés distinctes en v2 : `technologie` (information) et `commande` (ce que le GUI propose).
3. **Moteurs : Monter / Stop / Descendre, lamelles Horaire / Stop / Antihoraire.** Aucune position, aucun angle en %.
4. **CVC : le mode n'est qu'affiché** (texte série CHAUFFAGE / CLIMATISATION envoyé par le processeur) ;
   les 4 vitesses sont fixes ; `vitesses` et `marcheArret` ne sont pas lus.
5. **Icônes de pièces en emoji**, contraire à la règle « icônes SVG, pas d'emoji dans les GUI ».
   `connect-ui.js` a déjà une table emoji → SVG de 13 icônes (canapé, lit, bain, cuisine, salle à manger,
   bureau, TV, porte, WC, buanderie, escalier, feuille, maison) ; `iconesDisponibles` en liste 20. Cible « deux fois plus » :
   **40 icônes SVG** sur la base des 20 libellés actuels.
6. **Plus aucun join digital libre par pièce** (backend simpl) : `contrat.simplDirect.mapping` occupe les
   125 offsets digitaux. Restent **95 offsets analogiques** et **117 offsets série**. Conséquence de conception :
   les nouvelles fonctions passent par des analogiques (position, angle, couleur, mode CVC) ou par une hausse
   de `tailleBloc` (plafond SIMPL 2511 digitaux sur la dalle → recalcul du nombre de pièces).
7. **Sécurité de la copie embarquée.** `villa_config.json` est copié dans le `.ch5z` et lisible depuis tout XPanel :
   `contrat.alarme.codeParDefaut` (« 1234 ») y figure, et les e-mails d'alerte du monitoring ne doivent pas y aller.
8. **Appartement : 8 pièces décrivent 12 moteurs pour `nombre = 6`** (les 6 derniers sont ignorés) — avertissement.
9. `tools/quality/validate-config.mjs` refusait toujours plus de 6 moteurs (règle d'avant v5.3) : borne passée à 12.
   La suite `tools/quality` garde 5 échecs anciens, sans lien avec ce lot (empreintes et profils de la bêta du 18.09).

## 4. Schéma cible v2 — nouvelles clés (toutes facultatives)

```jsonc
"interface": {
  "menuPieces": { "visible": true, "pieces": [], "pieceParDefaut": null,
                  "etats": { "audioVideo": true, "eclairage": true } },        // pastilles d'état, iPad général
  "themes":  { "disponibles": ["dark", "glass"], "parDefaut": "dark" },
  "langues": { "disponibles": ["fr", "en", "de"], "parDefaut": "fr" },
  "controlesGlobaux": { "parDefaut": ["alarme", "cameras", "controleGlobal", "recherche", "reglages"],
                        "general":   ["alarme", "controleGlobal"] }
},
"valeursParDefaut": { "stores": { "position": "100=ouvert", "angleLamelles": "0=fermees" } },
"pieces": [{
  "interface": { "controlesGlobaux": ["controleGlobal", "reglages"] },          // surcharge pour la pièce
  "pilotages": {
    "eclairages": { "circuits": { "nombre": 3, "liste": [
      { "nom": "Spots",  "commande": "variation",    "technologie": "DALI" },
      { "nom": "Prise",  "commande": "onoff",        "technologie": "contact" },
      { "nom": "Ruban",  "commande": "tunableWhite", "kelvinMin": 2700, "kelvinMax": 6500 } ] },
      "scenes": { "niveaux": [[0, 0, { "niveau": 0, "kelvin": 2700 }]] } },
    "moteurs": { "liste": [ { "nom": "Store séjour", "type": "store", "lamelles": true,
                              "position": true, "angleLamelles": true } ] },
    "cvc": { "modes": ["auto", "chauffage", "climatisation"], "ventilation": { "vitesses": [0, 1, 3] }, "deriveC": 0.5 }
  }
}],
"monitoring": { "actif": true, "vueEnsemble": { "actif": true, "pageAccueil": false },
                "elements": ["eclairage", "audioVideo", "cvc", "alarme", "processeur"],
                "alertes": { "emails": ["technique@exemple.ch"], "evenements": [] } }
```

Règles de compatibilité : absent = comportement actuel. `circuits.liste` prime sur `noms` / `type` / `lutron` ;
sans `commande`, technologie `contact` → `onoff`, sinon `variation`. `interface.langues` absent → `meta.languesDisponibles`.
Un niveau de scène reste un entier 0-65535, ou un objet `{niveau, kelvin}` / `{r, g, b, w}` pour un circuit couleur.

## 5. Feuille de route → clés

| Objectif | Clé v2 | Joins à prévoir (backend simpl) | Phase |
|---|---|---|---|
| Stores : position en % | `moteurs.liste[].position`, `valeursParDefaut.stores.position` | 12 analogiques / pièce | 2 |
| Lamelles : angle en % | `moteurs.liste[].angleLamelles`, `valeursParDefaut.stores.angleLamelles` | 12 analogiques / pièce | 2 |
| Type de circuit + commandes adaptées | `circuits.liste[].commande` (+ kelvin) | on/off : aucun (analogique 71-90 à 0 / 65535) ; tunable : +1 ana ; RGBW : +3 ana par circuit | 2 |
| Thèmes accessibles | `interface.themes` | aucun | 3 |
| Langues accessibles | `interface.langues` | aucun | 3 |
| Nouveaux thèmes, variantes | (catalogue à concevoir, puis `themes.disponibles`) | aucun | 3 bis |
| Icônes de pièces ×2 | `pieces[].icone` = clé SVG | aucun | 3 bis |
| Contrôles globaux par page | `interface.controlesGlobaux`, `pieces[].interface.controlesGlobaux` | aucun | 4 |
| États des zones, menu de l'iPad général | `interface.menuPieces.etats` | aucun : le pont v6 a déjà en cache les retours des autres pièces | 5 |
| HVAC : modes, vitesses, drift | `cvc.modes`, `cvc.ventilation.vitesses`, `cvc.deriveC` | mode en analogique (aucun digital libre) | 5 |
| Monitoring, vue d'ensemble, alertes e-mail | `monitoring.*` | à concevoir ; envoi par le processeur | 6 |
| Variante de disposition | `meta.interface` (existe : `connect`) | aucun | plus tard |
| Intercom, lecteur multimédia, presets, horloges / événements | aucune clé tant que le comportement n'est pas spécifié | — | à spécifier |
| Responsiveness, validation SIMPL, template corporate | hors JSON | — | — |

## 6. Décisions prises par défaut

- Position des stores : **100 % = ouvert** (convention Crestron) ; angle : **0 % = lamelles fermées** ; les deux inversables par `valeursParDefaut.stores`.
- « Drift » = **écart toléré autour de la consigne, en °C** (`cvc.deriveC`) — à confirmer avec Alexandre.
- `commande` (GUI) séparée de `technologie` (électrique), pour ne pas casser `circuits.type` de l'Appartement.
- E-mails d'alerte : lus par le processeur ; à retirer de la copie GUI au déploiement quand le monitoring sera implémenté.
- Clés inconnues : **avertissement**, pas d'erreur — on n'empêche jamais un technicien de déployer pour une clé en plus.
- Doc numérotée **10** (les numéros 09 sont déjà pris deux fois).

## 7. Console Web — onglet « Configuration » (04.10.2026)

Le technicien ne touche plus au JSON : `Console Web.cmd`, puis l'onglet **Configuration** (ou http://localhost:8090/#config).

| Zone | Ce qu'elle fait |
|---|---|
| Sections (gauche) | Projet, Interface, Pièces (une entrée par pièce), Sources, Stores, Widgets, Valeurs par défaut, Pages spéciales, Traductions, Monitoring (si options prévues affichées), Contrat (avancé), **Appareils et envoi**. |
| Formulaire | Construit depuis le schéma : une nouvelle clé du schéma apparaît sans code. Bouton × = retirer la clé (retour au défaut). |
| Messages (droite) | Erreurs et avertissements de `check-config`, cliquables ; impact sur le programme SIMPL. |
| Enregistrer | Refusé s'il reste une erreur ; ne réécrit que les lignes modifiées ; copie `villa_config.json.bak`. |
| Appareils | `appareils.json` : nom, type, modèle, IP, IP-ID, empreinte SSH. Identifiants : `deploy.secrets.psd1` (CP4 pour les processeurs, TSW pour les dalles). |
| Envoyer | Processeur : config + `progreset` (option : `.lpz` + `progload`). Dalles : un build CH5 puis transfert + `PROJECTLOAD` sur chacune. Simulation cochée par défaut. |

**Ce que « envoyer » ne fait pas.** En backend `simpl`, les réglages des pièces sont compilés dans le programme SIMPL :
la page le détecte, régénère `simpl/direct` sur demande, mais la compilation (F12 dans SIMPL Windows) reste manuelle.
XPanel et Crestron One : onglet Déploiement (le mot de passe SFTP y est demandé à la main).
