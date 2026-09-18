# Référence graphique et UX — Crans-Montana

Ce document capitalise les décisions existantes et les écarts observés. Il ne vaut pas validation graphique des 17 autres interfaces.

## Principes et tokens

| Règle | Référence actuelle | Vérification |
|---|---|---|
| Thèmes | Sombre, Clair élégant, Verre dépoli | Même fonction, même couleur sémantique et même libellé sur tous supports |
| Clair | Coque `#f8fafc`, texte `#0f172a`, secondaire `#475569`, panneaux `rgba(15,23,42,.06)` | Contraste composé réel, y compris couches translucides |
| Verre | Panneaux `rgba(15,23,42,.34)` ; `blur(18px) saturate(1.8) brightness(.40)` | Maintenir l'effet verre sans perdre le ratio minimal |
| Retour sélection | Attributs natifs CH5, booléen, `selected="true"` | Jamais le sélecteur nu `[selected]` qui matche aussi false |
| Surface CH5 | `.cb-btn` interne | Vérifier l'élément rendu, pas seulement l'hôte |
| Tactile | Au moins 40 px ; règles smartphone ≥44 px | Mesurer les rectangles affichés, après échelle |
| Fenêtres | Environ 92–94 % de hauteur selon le composant | Fermeture accessible, pas de contenu coupé |
| Icônes et son | SVG, absence de son | Pas d'emoji affiché comme icône GUI ; contrôler les chemins audio |
| Mouvement | Réponse immédiate des boutons, fondu lumière 3 s ; décor jour/nuit 30/10/30/10 s | Interruption depuis l'état visible, pas de saut ; vérifier performances sur support cible |

Les valeurs détaillées restent dans les thèmes et composants sources ; corriger à cet endroit, puis vérifier tous leurs usages. Ne pas créer une nouvelle couche de styles par projet pour masquer une divergence.

## Mise en page et modes

GUI sans défilement. Exceptions smartphone existantes : Caméras, Circuits, Configuration preset. Une nouvelle exception doit être liée à la nature de la liste et consignée. Il ne suffit pas de masquer une barre de défilement.

Mode normal : châssis à taille réelle si possible, sinon badge de réduction, aucun sélecteur Responsive. Mode Scène : châssis agrandi, colonne droite conservée, sélecteur Taille réelle/Responsive. Plein écran GUI : onglet sans châssis pour dalle/tablette seulement. F11 demeure le plein écran du navigateur. Les ouvertures directes smartphone de démonstration ne sont pas le bouton Plein écran du site.

Conserver séparément dimensions natives du matériel, canvas CSS et dimensions physiques. `devices.js` contient une contradiction de commentaire sur la TSW-1070 à résoudre explicitement ; ne pas modifier les dimensions validées sur la seule foi d'un commentaire.

## Cohérence architecturale du décor

La 3D reste un fond du showcase, jamais un poids supplémentaire du CH5 déployé. Elle doit représenter la liste et les fonctions réellement visibles dans la configuration de démonstration.

- Sous-sol : aucune fenêtre sans justification d'une ouverture vers l'extérieur ou d'une cour anglaise. Une demande ultérieure autorisant une cour anglaise reste une exception documentée, pas une règle générale.
- TV : orientation face à la zone d'écoute, dégagement du mobilier, mécanisme d'escamotage plausible.
- Sauna/hammam : géométrie, accès, équipement et commandes cohérents avec leur fonction ; toute mesure inconnue reste inconnue.
- Moteurs et éclairages : correspondance entre commande GUI, circuit/moteur configuré et objet animé ; aucune animation ne doit simuler un feedback matériel absent.
- Aucun nom de test de la configuration de développement dans la vitrine ou le profil bêta partagé.

## Matrice à industrialiser

Chaque interface devra déclarer supports, thèmes, langues, pages, fenêtres, états et exceptions. Le runner doit marquer les combinaisons non applicables avec une raison, puis produire : erreurs console, débordements, textes tronqués, cibles tactiles, contraste ≥4:1, absence de son, captures et identité du build. Ajouter les parcours métier, reconnexion et retour arrière.

Les tests actuels de contraste et centralisation ne couvrent pas automatiquement tous les états Wellness ni les 17 simulateurs. Leur succès constitue une preuve ciblée. Une capture de référence doit être approuvée avant de servir de comparaison graphique automatique.
