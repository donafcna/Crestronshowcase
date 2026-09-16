# Plan 3D du showcase — 16 septembre 2026

Ce moteur concerne uniquement le fond de page du site. Il ne modifie aucun fichier de la GUI CH5, ni ses joins. Point de départ de ce lot : `571f7c76`.

## Commandes et cadrage

- Smartphone : à gauche en Mode normal et en Mode Scène, bouton d'angle conservé près du châssis.
- La pièce **et la villa entière** sont cadrées dans le rectangle réellement libre entre le boîtier complet et la colonne de droite. Le calcul projette les huit coins du volume, avec une marge pour l'étiquette.
- Molette vers le bas sur le décor : vue globale. Vers le haut : dernière pièce sélectionnée. Les gestes dans le téléphone, les commandes, la colonne latérale et Ctrl/Cmd + molette sont préservés.
- La sélection de pièce et la vue de caméra sont indépendantes : les commandes continuent de cibler la pièce choisie lorsque la villa entière est affichée.
- `PLAN3D_RULES` conserve la règle existante Smartphone. Aucun nouveau support ni seuil supposé pour un écran « 14 pouces » n'a été ajouté.

## Assets et rendu

- `public/plan3d/plan3d.js` : scènes, caméra, animation, feedbacks et cycle de vie.
- `interiors.js` : matériaux partagés, mobilier et accessoires selon le type de pièce, rideaux plissés, regroupement des surfaces statiques par matériau.
- `landscape.js` : terrain continu, neige colorée sur la même surface que la roche, jardin, cheminement, arbres instanciés. Feuillage à trois plans avec anticrénelage MSAA ; aucune neige superposée ni bruit animé.
- `textures/` : trois WebP de chêne issus de Poly Haven, licence CC0 détaillée dans `textures/LICENSE.md`. Total 111 392 octets. Les autres textures sont produites localement sur canvas.
- Matériaux rugueux et normaux de parquet, assises adoucies, textiles, plinthes, corniches, tableaux, plantes, tables dressées, cuisine équipée, fauteuils, livres et literie. Claviers muraux à touches gravées inspirés de la disposition des claviers résidentiels, sans marque affichée. Thermostat live à texture 512².
- Haut-parleurs : colonnes, barre de son, enceintes encastrées et enceintes surround dans le cinéma. Éclairages : suspensions, spots sur rail, lampes de chevet/table, rubans indirects et appliques.
- La caméra reste immobile au repos. Seules les transitions et les équipements actifs s'animent.
- Une seule ombre directionnelle de 1024², recalculée au changement de pièce et pendant le mouvement des occultations. Instanciation du paysage, regroupement des surfaces statiques, résolution plafonnée à 1,5× et réduite progressivement à 1× si les images prennent trop longtemps. Pause lorsque l'onglet est masqué.
- Les groupes des autres pièces sont masqués en vue rapprochée. La vue globale conserve les niveaux éclatés du projet d'origine.

## Chargement et maintenance

Le moteur est importé uniquement lorsque la règle 3D s'applique. Les imports portent la version `2026-09-16-atlas-1` ; la modifier dans le chargeur React et les imports des modules lors d'une évolution. Vercel revalide les ressources `/plan3d/`, sans réécrire une ressource manquante vers du HTML. En cas d'échec WebGL/import, retour à la vidéo.

Les abonnements aux feedbacks, les fonctions enveloppées, les écouteurs, les temporisateurs et les ressources graphiques sont libérés à la sortie. Un rechargement du document de l'iframe déclenche une reconnexion.

L'enregistrement de `/sw.js`, absent du site, a été supprimé pour éliminer la requête invalide à chaque chargement. Aucun fonctionnement hors ligne n'a été ajouté.

## Vérifications reproductibles

Depuis `apps/showcase` : `npm run build`, `npm run lint`, puis un serveur Vite local et `node scripts/test-plan3d.cjs`. Playwright doit être accessible à Node (installation de développement ou `NODE_PATH`). Variables facultatives : `BASE_URL`, `BROWSER_EXE`, `TEST_OUTPUT`.

Le test pilote la sélection réelle du GUI, contrôle les deux sens de molette et les exclusions, les trois familles de moteurs et l'arrêt, l'obscurité, Apple TV, le thermostat, les quatorze pièces configurées, les trois thèmes, les Modes normal et Scène, plusieurs dimensions d'écran, le retour vidéo sur dalle/tablette et la reconnexion après remontage. Les contrôles directs du moteur servent à isoler les états visuels ; ils ne remplacent pas les contrôles du contrat CH5 sur du matériel Crestron.

Les erreurs de lint issues des deux bibliothèques tierces minifiées (Three.js et composants CH5) sont exclues de l'analyse ; le code applicatif, y compris les nouveaux modules 3D et les tests, reste analysé.

Captures et résultats locaux : `C:/dev/crestron/repo/Claude outputs/codex-plan3d/`. Les captures de la GUI ne constituent pas une nouvelle validation matérielle CH5/CP4/TSW.

Validation du 16/09 : 32 contrôles passent, 24 captures, aucune erreur JavaScript non interceptée, build et lint terminés avec code 0 (avertissements existants conservés). Vue Scène vérifiée en 1280×609, 1440×900 et 1920×1080. Mesure séparée sur AMD Radeon 890M / ANGLE Direct3D11 : 54,7 images/s sur six secondes, DPR 1,5, 68 appels de dessin et 72 412 triangles dans le salon. Le navigateur de test sans accélération utilisait SwiftShader et donnait des valeurs beaucoup plus faibles ; ces mesures logicielles ne sont pas une mesure du navigateur Chrome habituel de Donatien. Cette observation ne garantit pas 55 images/s sur tous les appareils ou toutes les vues.

Les scènes OFF et TOTAL ont aussi été isolées directement par l'API pour les captures. Les thèmes et supports non concernés ne reçoivent aucun changement graphique interne ; leurs captures sont des contrôles de non-régression du cadre. Ce lot ne constitue pas un audit exhaustif de contraste de toutes les anciennes modales du GUI.

## Limites visuelles

Cette livraison enrichit une visualisation architecturale temps réel. Elle n'est pas présentée comme un rendu photographique ni comme une maquette fidèle au bâtiment réel. Le mobilier reste procédural, les reflets et la lumière indirecte sont approximés ; il n'y a pas de ray tracing ni de calcul de lumière globale coûteux. Le nombre d'images par seconde dépend aussi du navigateur, de l'accélération graphique et du GPU.
