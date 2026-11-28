# M/Y Jewel Riviera — images individuelles et mer continue

Version 2.3.40, 28 novembre 2026. Riviera confirmé par Donatien.

## Images

Dix vues individuelles 1672 × 941 générées avec l’outil intégré imagegen, sans agrandissement interpolé de l’ancienne planche. Huit intérieurs disposent d’environ neuf fois plus de pixels que les anciennes cellules. Les vues du pont arrière et du beach club retrouvent un format 16:9 sans étirement. Matières : lin ivoire, teck, chêne et bronze. Une baie marine est ajoutée au cinéma pour que la mer soit visible et animée dans les dix espaces.

Fichiers : `public/showcases/my-jewel/assets/room-<id>-hd.png`. Descriptions de génération, références Git et correspondance des fichiers : `prompts.json`. Le visuel extérieur `hero.png` est conservé.

## Mer

Shader WebGL continu en deux dimensions, plusieurs directions et rythmes de houle, reflets et atténuation progressive près de l’horizon. Les polygones sont recalés individuellement, en tenant compte notamment du robinet de la cuisine, de la lampe et des fleurs du bureau, du vélo, des sièges du cinéma et des garde-corps. Les calages des stores et des TV sont actualisés avec les photographies. Les photos et le mouvement partagent `scene-manifest.js`.

Une pièce quittée ne peut pas afficher tardivement son ancien calque de mer sur la suivante. Repli Canvas disponible sans WebGL ; le mouvement est figé si la réduction des animations est demandée.

## Vérifications réalisées

- `gui-checks.json` : 270 vues GUI, trois thèmes et trois formats, aucun débordement, aucun contrôle hors cadre et aucune ressource manquante.
- `host-checks.json` : 40 contrôles hôtes sur quatre supports, normal et Mode Scène Taille réelle/Responsive, synchronisation et commandes du fond. Aucun échec ni erreur JavaScript.
- `dynamic.json` : 14 états et actions (scénarios, stores, médias, climat, pixels animés), tous réussis.
- `accessibility.json` : 39 vues téléphone, aucun bouton sous 40 px ni contraste DOM calculé sous 4:1. La méthode compose les fonds unis et ne certifie pas chaque variation d’un dégradé ou d’une photo.
- `water-checks.json` : pixels comparés aux mêmes coordonnées dans les dix vues, changements de couleur moyens de 4.93 à 16.67/255 entre deux instants. Eau opaque aux points de mer ; alpha nul aux points de côte, mobilier et objets protégés ; réduction des animations et absence de son validées.
- Cadence mesurée sur le navigateur local : 21.8 à 30.9 images/s, cible 30 images/s. Mesure indicative de ce poste et de cette session, pas une garantie pour tout appareil.
- `fallback.json` : repli Canvas vérifié en désactivant WebGL, mouvement présent et mobilier protégé.
- Build et lint réussis, sans nouvel avertissement dans les fichiers du yacht. Pas de nouvelle modale. La GUI brute est le document panel commun testé ; bouton Plein écran hôte déjà masqué, aucun Plein écran smartphone ajouté.

## Comparatifs

`comparatif-pieces.html` / `.png` : les dix espaces avant/après. Les captures avant proviennent de la version précédente et les captures après des vues individuelles intégrées.

`comparatif-themes.html` / `.png` : thèmes en colonnes. Pour comparer le détail de l’image dans le GUI inchangé, l’ancienne photographie du salon est réappliquée aux mêmes cadres et le calque animé est masqué dans la ligne « Avant ». Ce comparatif concerne l’image ; il ne sert pas de mesure du mouvement ancien.

## Limites

Concept fictif, pas des photographies d’un yacht existant. Les éclairages restent des calques d’ambiance, sans détourage individuel de chaque luminaire. Les stores et écrans sont recalés sur les nouvelles photos, avec une géométrie de présentation approximative. Aucun matériel Crestron ni équipement nautique modifié.

## Reproduction

```powershell
Set-Location 'C:/dev/crestron/my-jewel/apps/showcase'
$env:PLAYWRIGHT_MODULE='C:/dev/crestron/my-jewel-test/node_modules/playwright'
$env:JEWEL_VERIFY_DIR='docs/verification/2026-11-28-my-jewel-riviera-hd'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-water.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-host.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-dynamic.cjs'
node 'C:/dev/crestron/my-jewel/apps/showcase/scripts/verify-my-jewel-accessibility.cjs'
```

Serveur attendu : http://127.0.0.1:5187. Publication main → Vercel ; retour arrière par annulation de la seule révision Riviera, sans restaurer les modifications indépendantes d’autres projets.
