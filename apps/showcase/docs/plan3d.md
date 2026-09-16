# Plan 3D du showcase — 16 septembre 2026

Ce moteur concerne uniquement le fond de page du site. Il ne modifie aucun fichier de la GUI CH5, ni ses joins. Point de départ de ce lot : `571f7c76`.

## Commandes et cadrage

- Smartphone : à gauche en Mode normal et en Mode Scène, bouton d'angle conservé près du châssis.
- La villa entière est cadrée dans le rectangle libre entre le boîtier complet et la colonne de droite. Le cadrage rapproché privilégie désormais le volume habité, avec une distance réduite de 15 % après ajustement : une bordure de dalle peut sortir du cadre pour mieux lire les détails.
- Molette vers le bas sur le décor : vue globale. Vers le haut : dernière pièce sélectionnée. Les gestes dans le téléphone, les commandes, la colonne latérale et Ctrl/Cmd + molette sont préservés.
- La sélection de pièce et la vue de caméra sont indépendantes : les commandes continuent de cibler la pièce choisie lorsque la villa entière est affichée.
- En vue globale, les façades sud/est complètent les murs nord/ouest existants. Un premier clic sur le décor retire les façades ; un clic sur une pièce lance son zoom et appelle le sélecteur existant du Smartphone. Les étages restent éclatés, sans toit ajouté.
- Depuis une vue globale fermée, la façade disparaît en 0,48 s **avant** le déplacement de caméra (1,35 s). Au dézoom, les façades reviennent après le trajet de 1,4 s. Une nouvelle sélection reprend la pose courante ; aucune file de sélections anciennes ni saut instantané après un dézoom.
- `PLAN3D_RULES` conserve la règle existante Smartphone. Aucun nouveau support ni seuil supposé pour un écran « 14 pouces » n'a été ajouté.

## Assets et rendu

- `public/plan3d/plan3d.js` : scènes, caméra, animation, feedbacks et cycle de vie.
- `interiors.js` : matériaux partagés, mobilier et accessoires selon le type de pièce, rideaux plissés, regroupement des surfaces statiques par matériau.
- `landscape.js` : terrain continu, neige colorée sur la même surface que la roche, jardin, cheminement, arbres instanciés. Feuillage à trois plans avec anticrénelage MSAA ; aucune neige superposée ni bruit animé.
- `envelope.js` : façades instanciées, quatre matériaux partagés, aucune texture supplémentaire ; masquées entièrement en vue pièce.
- `textures/` : trois WebP de chêne issus de Poly Haven, licence CC0 détaillée dans `textures/LICENSE.md`. Total 111 392 octets. Les autres textures sont produites localement sur canvas.
- Matériaux rugueux et normaux de parquet, assises adoucies, textiles, plinthes, corniches, tableaux, plantes, tables dressées, cuisine équipée, fauteuils, livres et literie. Claviers muraux à touches gravées inspirés de la disposition des claviers résidentiels, sans marque affichée. Thermostat live à texture 512².
- Haut-parleurs : colonnes, barre de son, enceintes encastrées et enceintes surround dans le cinéma. Éclairages : suspensions, spots sur rail, lampes de chevet/table, rubans indirects et appliques.
- La caméra reste immobile au repos. Seules les transitions et les équipements actifs s'animent.
- Une seule ombre directionnelle de 1024², recalculée au changement de pièce et pendant le mouvement des occultations. Instanciation du paysage, regroupement des surfaces statiques, résolution plafonnée à 1,5× et réduite progressivement à 1× si les images prennent trop longtemps. Pause lorsque l'onglet est masqué.
- Les groupes des autres pièces sont masqués en vue rapprochée. La vue globale conserve les niveaux éclatés du projet d'origine.
- OFF coupe les lampes et leur halo, même si un preset local OFF contient un niveau mémorisé non nul. Les niveaux bruts sont conservés ; une action sur un circuit ou une autre scène les rétablit normalement. La copie de la GUI et ses réglages enregistrés ne sont pas modifiés. À chaque changement de pièce, le plan relit le snapshot du feedback local : les valeurs analogiques identiques ne sont pas toujours réémises.
- Occultations fermées : lumière du jour nulle, aucun plancher lumineux résiduel. Une TV allumée conserve son écran et une faible lumière bleutée locale ; elle ne remplace plus l'éclairage de la pièce. L'indication de souffle de la climatisation suit la lumière disponible.
- Home cinéma : mur nord plein réservé à l'écran, fenêtre et trois motorisations sur le mur ouest. Thermostat, clavier, acoustique et enceintes latérales dégagés de la fenêtre. Éclairage périphérique, sans rail suspendu traversant visuellement l'écran dans la vue en coupe.

## Chargement et maintenance

Le moteur est importé uniquement lorsque la règle 3D s'applique. Les imports portent la version `2026-09-16-atlas-2` ; la modifier dans le chargeur React et les imports des modules lors d'une évolution. Vercel revalide les ressources `/plan3d/`, sans réécrire une ressource manquante vers du HTML. En cas d'échec WebGL/import, retour à la vidéo.

Les abonnements aux feedbacks, les fonctions enveloppées, les écouteurs, les temporisateurs et les ressources graphiques sont libérés à la sortie. Un rechargement du document de l'iframe déclenche une reconnexion.

L'enregistrement de `/sw.js`, absent du site, a été supprimé pour éliminer la requête invalide à chaque chargement. Aucun fonctionnement hors ligne n'a été ajouté.

## Vérifications reproductibles

Depuis `apps/showcase` : `npm run build`, `npm run lint`, puis un serveur Vite preview local et `node scripts/test-plan3d.cjs`, suivi de `node scripts/test-plan3d-navigation.cjs`. Playwright doit être accessible à Node (installation de développement ou `NODE_PATH`). Variables facultatives : `BASE_URL`, `BROWSER_EXE`, `TEST_OUTPUT`, `GPU=1` (ANGLE Direct3D11 sous Windows). Garder le build servi inchangé pendant les essais.

Le test pilote la sélection réelle du GUI, contrôle les deux sens de molette et les exclusions, les trois familles de moteurs et l'arrêt, l'obscurité, Apple TV, le thermostat, les quatorze pièces configurées, les trois thèmes, les Modes normal et Scène, plusieurs dimensions d'écran, le retour vidéo sur dalle/tablette et la reconnexion après remontage. Les contrôles directs du moteur servent à isoler les états visuels ; ils ne remplacent pas les contrôles du contrat CH5 sur du matériel Crestron.

Les erreurs de lint issues des deux bibliothèques tierces minifiées (Three.js et composants CH5) sont exclues de l'analyse ; le code applicatif, y compris les nouveaux modules 3D et les tests, reste analysé.

Captures et résultats locaux : `C:/dev/crestron/repo/Claude outputs/codex-plan3d/`. Les captures de la GUI ne constituent pas une nouvelle validation matérielle CH5/CP4/TSW.

Validation du 16/09 : 32 contrôles passent, 24 captures, aucune erreur JavaScript non interceptée, build et lint terminés avec code 0 (avertissements existants conservés). Vue Scène vérifiée en 1280×609, 1440×900 et 1920×1080. Mesure séparée sur AMD Radeon 890M / ANGLE Direct3D11 : 54,7 images/s sur six secondes, DPR 1,5, 68 appels de dessin et 72 412 triangles dans le salon. Le navigateur de test sans accélération utilisait SwiftShader et donnait des valeurs beaucoup plus faibles ; ces mesures logicielles ne sont pas une mesure du navigateur Chrome habituel de Donatien. Cette observation ne garantit pas 55 images/s sur tous les appareils ou toutes les vues.

Dans le premier lot, les scènes OFF et TOTAL avaient été isolées directement par l'API. Le second lot les teste avec les vrais boutons du GUI, y compris preset mémorisé, action manuelle et changement de pièce à niveaux identiques. Le test de navigation contrôle les phases de façade, le clic vers une pièce différente et le retour de sélection dans le GUI, les sélections rapides et le dégagement rideaux/TV du cinéma. Les thèmes et supports non concernés ne reçoivent aucun changement graphique interne ; leurs captures sont des contrôles de non-régression du cadre. Ce lot ne constitue pas un audit exhaustif de contraste de toutes les anciennes modales du GUI.

## Limites visuelles

Recette `atlas-2`, 16/09 : build et lint réussis, 38 contrôles de matrice + 22 contrôles de navigation/feedback réussis sur le build servi par Vite preview ; aucune erreur JavaScript non interceptée. Le test historique utilisait `frost`, alors que le GUI attend `glass` : corrigé, avec contrôle du sélecteur et attente de 900 ms avant capture dans les deux modes. Mesure locale accélérée ANGLE Direct3D11 en 1280×800, DPR 1,5 : 53,3 images/s sur quatre secondes dans le salon, 68 appels de dessin, 72 412 triangles. Ce relevé est ponctuel, pas une garantie tous appareils. Captures et rapports : `Claude outputs/codex-plan3d-navigation/`, planche `planche-navigation.png`. Les façades n'ajoutent aucune texture téléchargée.

Cette livraison enrichit une visualisation architecturale temps réel. Elle n'est pas présentée comme un rendu photographique ni comme une maquette fidèle au bâtiment réel. Le mobilier reste procédural, les reflets et la lumière indirecte sont approximés ; il n'y a pas de ray tracing ni de calcul de lumière globale coûteux. Le nombre d'images par seconde dépend aussi du navigateur, de l'accélération graphique et du GPU.
