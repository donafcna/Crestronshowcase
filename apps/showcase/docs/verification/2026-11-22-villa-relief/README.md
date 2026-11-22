# Villa FTV — relief et matériaux, candidat local 2.3.14

Demande : différence visible sur le mobilier, les ombres et les matériaux, fluidité conservée et avant/après avant publication. Aucun push ni publication de ce lot.

## Réalisation

Chanfreins géométriques légers sur les volumes de mobilier existants, ombrage des parties basses par couleurs de sommets, sol subdivisé 24×24 pour précalculer des ombres de contact et l’assombrissement aux murs. Noyer et chêne différenciés, tissus plus contrastés, rugosité ajustée. Ombres planes existantes renforcées et remontées au-dessus du tapis (elles étaient partiellement masquées). Rien n’est calculé en plus dans la boucle d’animation ; pas de lumière, texture ni passe de rendu supplémentaire. Deux variantes de shader supplémentaires utilisent les couleurs de sommets. Géométrie des meubles contenue dans leurs volumes existants ; TV et pièces mobiles exclues. Option active uniquement pour villa-crans.json, aucun GUI ou programme matériel modifié.

## Vérifications

Build et lint passent, avertissements React préexistants. Contrôles des 17 pièces : navigation, UV finis, attributs couleur complets. Le contrôle des couleurs a permis de corriger un cas de matériaux partagés qui noircissait les abat-jour : activation des attributs avant le premier regroupement, blanc explicite sur les surfaces non ombrées.

Banc : navigateur local, 1280×720, DPR ~1. Huit séquences A/B/B/A/A/B/B/A, 3 s de chauffe et 3 s mesurées chacune. Référence : 60,22 / 59,53 / 54,67 / 60,11 images/s. Candidat : 59,53 / 59,86 / 59,91 / 59,96. Médianes des runs ~59,82 / 59,88. Aucun gain de vitesse revendiqué : la charge de la machine varie, premier diagnostic conservé dans diagnostic-performance.json. Le candidat reste autour de 60 dans les quatre runs finaux. Les valeurs medianMs/p95Ms internes au moteur ont leur propre comptage : la comparaison FPS utilise les frames rendues et performance.now.

Salon : 19 textures, 95 géométries, 96–97 appels de dessin selon la présence d’un oiseau dans le champ ; 205042 → 207958 triangles, +2916 (+1,42 %). Programmes GPU 22 → 24. Ce n’est donc pas un budget strictement identique, mais aucun ralentissement observé sur cette recette. Mesures sur un ordinateur, pas une certification de tous les téléphones/GPU. Position de la couche de contact ajustée après la mesure, sans changement de nombre de sommets, textures, lumières ou passes.

Captures salon/chambre à la même caméra, même journée fixe, circuits 70 %. L’animation du paysage continue ; les oiseaux peuvent différer. comparison.html propose côte à côte et curseur superposé. Captures issues du moteur, sans retouche ni génération d’image.

## Reproduire

Depuis apps/showcase : npm exec vite build -- --outDir test-results/villa-preview ; copier scripts/verify-villa-materials.html dans cette sortie puis npm exec vite preview -- --outDir test-results/villa-preview --host 127.0.0.1 --port 4320. Le dossier de build est séparé de dist car d’autres travaux sur Hôtel/Club ont reconstruit dist pendant cette session. Ne pas supprimer ni inclure ces changements tiers dans ce lot.

Intégration finale : sélection Salon, scène TOTAL et fermeture des rideaux observées dans le GUI Smartphone complet ; capture integration.jpg et aucune erreur console. Comparatif : boutons Salon/Chambre et curseur 50 → 51 vérifiés. La matrice complète des thèmes/modales n’a pas été rejouée, les modifications portent uniquement sur le moteur 3D. La série précédente reste disponible dans villa-materials.


Statut actualisé : candidat validé par Donatien ; commit et publication GitHub → Vercel autorisés le 22/11/2026.
