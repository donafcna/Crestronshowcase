# M/Y Jewel — recette du 28 novembre 2026

Version 2.3.39. Branche de travail isolée `codex/my-jewel`, dossier `C:/dev/crestron/my-jewel`.

## Résultats locaux

- Compilation Vite et contrôle de catalogue réussis. Lint sans erreur ; avertissements historiques du dépôt conservés.
- 270 contrôles GUI : trois thèmes × trois formats (1280 × 800, 1024 × 768 et 440 × 863), accueil, plans, dix espaces éclairage et climat, stores, musique, sécurité, interphone et les deux télécommandes TV. Aucun débordement de page, aucun contrôle hors cadre, aucune erreur JavaScript ou ressource manquante.
- 40 contrôles hôtes : quatre supports × trois thèmes en normal, Mode Scène Taille réelle et Responsive ; synchronisation de pièce, extinction, vue extérieure et progression du canvas de mer. `host-checks.json` et captures.
- 14 contrôles dynamiques : six scénarios, éclairage ON/OFF, arrêt intermédiaire d’un store, Apple TV, chaîne Swisscom, musique, climat et modification réelle des pixels de mer sans alpha sur le mobilier. Tous réussis ; `dynamic.json`.
- Contraste et cibles : 39 vues téléphone incluant les télécommandes, salon, climat et RGBW du beach club. Aucune cible de bouton sous 40 px, aucun contraste calculé sous 4:1 et aucun élément audio/vidéo sonore. Méthode DOM avec composition alpha des fonds unis ; le calcul ne certifie pas chaque variation des photos et dégradés. Contrôle visuel des captures en complément. Résultats dans `accessibility.json`.
- Les fenêtres modales ne font pas partie de ce moteur ; aucun nouvel overlay. GUI brute : même document panel que celui testé, sans le châssis. Le bouton Plein écran du site est masqué dans l’état actuel du site ; aucun Plein écran smartphone ajouté.

## Comparatif

Ouvrir `comparatif.html` ou `comparatif.png` : Villa Stark en référence, puis M/Y Jewel, thèmes en colonnes. Les images du projet et la fiche sont dans `public/showcases/my-jewel` et `public/sheets/my-jewel`.

## Décisions prises par défaut

Nouveau secteur `Yacht2`, projet `M/Y Jewel`, identifiant `my-jewel`. Direction Riviera ; deux propositions alternatives : Grand Bleu et Épure. Dix zones conservées à partir du moteur Villa Stark. Canal propre au yacht, aucun état échangé avec Villa Stark. Les corrections compactes téléphone s’appliquent au yacht.

## Limites

Concept fictif, commandes simulées. Mer procédurale animée à partir des photos ; aucune vidéo de navigation ni représentation nautique contractuelle. Atlas intérieur de résolution limitée et calques de lumière d’ambiance, sans détourage individuel de tous les luminaires. Voir `public/showcases/my-jewel/SOURCE.md`. Aucun déploiement Crestron matériel.

## Publication et retour arrière

Flux normal : commit Git vers main, puis déploiement Vercel automatique. Vérifier l’URL publique et les octets de `app.js` et `marine-scene.js`. En cas de régression de chargement ou de commandes, revenir au déploiement précédent ou annuler uniquement le commit M/Y Jewel ; ne pas restaurer les travaux Villa Stark indépendants.

## Relancer la recette sur ce poste

```powershell
$env:PLAYWRIGHT_MODULE='C:/dev/crestron/my-jewel-test/node_modules/playwright'
Set-Location 'C:/dev/crestron/my-jewel/apps/showcase'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-host.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-dynamic.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-accessibility.cjs'
```

Le serveur de développement doit écouter sur `http://127.0.0.1:5187`.

## Vérification publique

Déploiement Vercel `dpl_FDPG7NeXDm2PGrGUXhvtRqHuJQNr`, état READY, commit applicatif `aadfb6c35c1a14083fafcb5403ec3ad7f4b646b5`. URL : https://crestrongui.vercel.app/interfaces/yacht2/my-jewel/phone. Octets servis de `app.js`, `marine-scene.js` et `hero.png` identiques aux objets Git (comparaison SHA-256 canonique, indépendamment des fins de ligne Windows du checkout). Sélection SALON synchronisée avec le fond, canvas de mer actif, retour vue extérieure et aucune erreur JavaScript. Captures `production.png`, `production-salon.png`, rapport `production.json`.
