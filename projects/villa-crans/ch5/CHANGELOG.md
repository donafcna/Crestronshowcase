# Villa Crans CH5 — journal des versions

## v1.0.168 — 11.09.2026 — Logo des boutons de source : une seule couche

Le bouton **Apple TV** non sélectionné affichait une pomme déformée (feuille soudée au corps, bord
droit dentelé) alors que la même pomme était nette à l'état sélectionné.

Cause : deux logos étaient peints l'un sur l'autre. L'`<img class="src-overlay-img">` — seul logo de
l'état sélectionné, aspect respecté par `preserveAspectRatio` — et un fond CSS historique sur le
châssis CH5, étiré dans un carré de 44 × 44 px alors que le viewBox fait 384 × 512. La superposition
des deux formes produisait le contour dentelé. Le thème Clair cumulait en plus une pomme sombre (fond
CSS) et une pomme blanche (overlay). Swisscom avait le même doublon (34 × 34 sur un viewBox
200 × 290), moins visible.

Correction au niveau du composant, dans un unique bloc `<style id="logo-source-couche-unique">` en
fin de `<head>` :

- fond CSS supprimé sur les cinq boutons de source, dans tous les états → l'overlay est la source
  unique du logo, donc l'état non sélectionné affiche exactement l'image de l'état sélectionné ;
- logos monochromes blancs marqués `.logo-mono` : mis à l'échelle 1,28 (44 px de haut, la taille
  apparente validée le 10.09) et inversés en sombre sur le thème Clair ;
- l'état est lu sur le châssis (`ch5-button:not([selected="true"]):not(.ch5-button--selected) ~
  .src-overlay-img`) et non sur la classe `.logo-active` de l'image : les deux se désynchronisent
  pendant la transition, et une pomme sombre sur fond violet en serait le prix ;
- bloc mort du 10.09 (`background-size: 44px 44px` sur `.src-appletv`) supprimé.

`iphone.html` ne porte pas ce motif (ni overlay ni fond CSS de logo de source) : rien à corriger.

Vérifié en mode déploiement : 3 thèmes × {non sélectionné, sélectionné} × {1920 × 1200, iPad 11"} —
une seule couche de logo, contraste 17,6:1 (Sombre, Contraste élevé) et 18,3:1 (Clair) non
sélectionné, 4,2:1 sélectionné (violet préexistant), cibles tactiles 282 × 104 et 166 × 104 px,
aucun scroll horizontal, comptage d'erreurs console identique à l'avant. Vitrine régénérée par
`sync-villa-crans.py` et échantillonnée 12 fois par thème sous curseur de démo : aucune couche CSS
en trop, aucune inversion pendant la sélection, aucune désynchronisation châssis / `.logo-active`.
Planches-contact avant/après (déploiement) et vitrine jointes.

Versions alignées en 1.0.168 : `version.json`, `src/version.js`, `villa_config.json` (racine et
`src/`), `src/villa_config.js` ; vitrine en `1.0.168-showcase`. **Reste à pousser sur Vercel**
(`apps/showcase/deployer-v2.bat`) et à compiler.

## v1.0.167 — 11.09.2026 — Contrat de joins v3 : un bloc de joins par pièce

Version préparée pour la **recette sur supports physiques** (dalle TSW-1070, iPad, iPhone, XPanel),
après des mois de mise au point sur le seul site vitrine.

### Changement structurant — fin des joins partagés entre pièces

Jusqu'en v2, les 15 pièces partageaient **un seul jeu de joins** ; la pièce courante était portée par
l'analogique 10 et mémorisée côté C# par périphérique. Invisible sur le showcase (un seul panneau
virtuel, feedback simulé en frontend), ce choix casse dès que deux supports physiques affichent deux
pièces différentes : ils écrivent sur les mêmes joins et se volent commandes et feedbacks.

Désormais chaque pièce dispose de **son propre bloc de 100 joins**, avec la même formule et les mêmes
offsets que les blocs EISC déjà en place :

```
joinPhysique = 1000 + (pieceId - 1) * 100 + offset
```

- Pièce 1 → 1000-1099 · pièce 7 → 1600-1699 · pièce 15 → 2400-2499 · plafond 30 pièces (3998 < 4000).
- Le HTML conserve ses joins « logiques » historiques : les règles CSS et les `querySelector` restent
  valables. La traduction se fait à l'exécution dans `src/js/villa-joins.js` (nouvelle couche
  `VillaJoins`), pilotée par `contrat.blocsPiecesGui.mapping` du `villa_config.json`.
- Attributs miroir `data-join` / `data-rjoin` / `data-cjoin` / `data-vjoin` ajoutés sur chaque
  composant CH5 : ils portent le join logique et ne bougent jamais, c'est sur eux que pointent
  désormais les sélecteurs CSS et JS.
- En mode `showcase`, la couche est inerte : le site vitrine continue de tourner sur les joins
  logiques avec `js/local-feedback.js`, sans aucune modification.

**Restent communs à toute la villa** (exceptions documentées et justifiées dans le JSON) :
sélection de pièce (dig 11-40, ana 10), **états des partitions d'alarme 1-4 (dig 301-312)**,
**presets globaux (dig 401-411, ser 420)**, centrale d'alarme (dig 41-48), télécommandes de sources
(dig 211-220, 500-527, 530-557, 560-600 — une commande vise l'appareil source, pas la pièce),
signaux système et transport de configuration (ser 99-106, dig/ana 250), matériel de la dalle
(ana 240, ana 260, dig 261), easter egg météo (dig 56).

### Boutons qui n'émettaient rien

- **Commandes groupées de stores** : les 9 boutons « Tout ouvrir / Demi-ouverture / Tout fermer »
  ne faisaient que l'animation CSS. Ils émettent désormais les joins 61-69 du contrat
  (volets 61/62/63, rideaux 64/65/66, stores 67/68/69), via `animateGroupBlinds`.
- **Pavé de code d'alarme** : le code était comparé à `'1234'` **en dur dans le JavaScript du panel**.
  La saisie part maintenant à la centrale (ser 43) qui répond par une impulsion sur dig 44 (accepté)
  ou dig 45 (refusé) ; la touche C envoie le dig 46. Repli local de mise en service dans
  `contrat.alarme.codeParDefaut`, à changer ou à vider sur site.
- **iPhone** : `window.toggleMute()` était appelé par deux boutons sans avoir jamais été défini ;
  le feedback de sélection de pièce s'arrêtait à la pièce 8 (boucle 11-18) ; les touches Apple TV
  rembobinage/avance (219/220) n'étaient pas câblées ; la touche mute de la télécommande Swisscom
  (563) était écrasée par le join 55 et n'était donc jamais émise.
- **Interlock des sources** (dalle) : le bloc d'abonnement était gardé par `typeof CrComLib !==
  'undefined'` alors qu'il s'exécute avant le chargement de `ch5-components.js` — il ne s'abonnait
  jamais sur la dalle. Différé par `VillaJoins.whenReady()`.

### Joins ajoutés au contrat

Utilisés par l'interface sans être déclarés : dig 200 (extinction A/V), dig 251-253 (transport du
lecteur média, ordre aligné sur le câblage réel des boutons : 251 lecture/pause, 252 suivant,
253 précédent), ana 254 (volume du lecteur média), ser 100 (console navigateur), et le pavé de code
d'alarme ser 43 / dig 44 / dig 45 / dig 46.

### C# slot 1 (`Backend/Backend/ControlSystem.cs`)

- Décodage unique des blocs ≥ 1000 (`room`, `offset`) pour l'EISC **comme** pour les panels ;
  logique métier factorisée en `ApplyRoomDigitalCommand` / `ApplyRoomAnalogCommand`.
- Les feedbacks sont écrits sur le bloc de la pièce concernée pour toutes les pièces : plus aucune
  logique « quel panneau regarde quoi ». `PushRoomFeedback(roomId)` remplace les envois ciblés.
- Miroir EISC : passe-plat au-dessus de 1000, liste blanche construite depuis `signauxGlobaux` en
  dessous.
- Chaîne d'alarme complète (43/44/45/46) avec relais vers le slot 2 et repli temporisé.
- Les 6 points P1 corrigés : try/catch sur `BuildVillaRoomsDatabase`, impulsions moteurs toujours
  remises à false, boucles de presets bornées à 10, gardes `ContainsKey`, nom de preset assaini
  (plus de traversée de chemin possible), borne de routage ≥ 1000 cohérente.
- Correctifs annexes : ser 33 (mode CVC) ajouté à `UpdateScreenStateForPanel`, entrée ana 53
  (source audio) créée.

### Rétroportage depuis le site vitrine

- Thème **Verre dépoli** : la version du site (voile blanc 0.10 + backdrop à 50 %) est plus jolie mais
  faisait tomber **33 textes sous 4:1**. Réglage retenu : flou réduit et saturation relevée du site
  (photo nette et colorée), voile ardoise allégé 0.42 → 0.34, backdrop à 40 %. Fond composite
  ≈ rgb(72,75,82) : blanc à 8,5:1, menthe #6ee7b7 à 5,5:1.
- Suppression définitive de `playSynthSound()` (synthétiseur Web Audio, 56 lignes dans chaque
  fichier) : plus aucun code sonore dans la GUI.
- Non rétroporté volontairement : la suppression de `sendConsoleCommand` / `quickConsoleCommand` /
  `refreshIptable`, qui pilotent le terminal du CP4 et n'ont de sens qu'en déploiement.

### Contraste

Défaut préexistant corrigé : le vert « Online » du bandeau d'état était à 2,5:1 sur fond clair et
3,4:1 en Verre dépoli. Accent foncé `#047857` en thème Clair, menthe `#a7f3d0` en Verre dépoli.
Batterie `tools/check_contrast_dom.mjs` : **aucun texte sous 4:1**, 3 thèmes × page + 10 fenêtres
× états dynamiques, dalle et smartphone.

### Divers

- Le libellé de version affiché était figé à `v1.0.149` dans les deux fichiers : corrigé.
- `scripts/sync-villa-crans.py` (dépôt showcase) copie désormais `js/villa-joins.js`.

---

## v1.0.166 — 09-10.09.2026
Télécommandes complètes (Apple TV, Sky Q, IPTV, Swisscom), sources vidéo en interlock avec musique
indépendante, fenêtres Contrôle global / Caméras / Système de sécurité / Réglages agrandies,
cohérence des 3 thèmes, engrenages en SVG, son caché retiré.

## v1.0.165 — 09.09.2026
Retours de direction du 09.09 appliqués, bandeau « État de la villa », contrat de joins v2.
