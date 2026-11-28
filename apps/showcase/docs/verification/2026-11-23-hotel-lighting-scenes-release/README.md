# Hotel des Horlogers — correction des scènes d’éclairage, 23 novembre 2026

Défaut reproduit par les boutons réels du GUI téléphone, Restaurant : les quatre scènes envoyaient au rendu 43,33 / 55 / 66,67 / 76,67 %, car le niveau était moyenné avec les zones WC300 et Inspiration restées à 65 %. L’identifiant de scène provenait pourtant de la zone active. La source ponctuelle unique était en outre trop faible pour les grandes pièces ; les changements affectaient surtout les luminaires, très peu le sol et le mobilier.

Correction : niveau et scène issus de la même zone active (0/35/70/100 %), synchronisation au changement de zone d’éclairage et conservation des états indépendants du GUI. Réglage des circuits conservé. Sources artificielles existantes renforcées (maximum 28 contre 4,5), empreinte indirecte chaude et diffuse ajoutée aux matériaux récepteurs de chaque pièce, uniformes partagés par zone. Textures existantes partagées ; contacts AO et matériaux physiques conservés. Les empreintes sont une approximation d’éclairage indirect, sans simulation de réverbération réelle. Fondu des scènes 1,1 s au lieu de 4 s ; extinction d’émission et sources à zéro pour Éteint, lumière naturelle indépendante des commandes.

## Vérification visuelle et commandes

scenes-avant-apres.jpg : caméra et nuit fixes, quatre boutons du vrai GUI. Avant presque aucune différence ; après paliers clairement visibles sur sols, tables et murs. pixel-levels.json mesure un recadrage fixe de l’image (luminance numérique, pas photométrie réelle). Comparaison de jour aussi jointe : Éteint conserve la lumière naturelle, Total ajoute la lumière artificielle. gui-scenes.json est réexécuté sur le build puis la production ; gui-scenes-day.json conserve la comparaison A/B de jour.

all-zones.json : 28 scènes sur les sept espaces, bons niveaux, émission et sources nulles pour Éteint. Changement de zone d’éclairage WC300 : Ambiance=35 %, un circuit à 47 et trois à 35 donne 38 % ; retour Restaurant restaure Total=100 %. La 3D reste une représentation simplifiée du lieu sélectionné, sans ajout d’une pièce WC absente de la maquette. Aucun transport ou programme matériel modifié.

## Vérification de la fluidité

Même nombre de sources (42 avec le soleil/hémisphère), appels (Restaurant 29) et triangles (37336) ; aucune texture, capture de reflet ou passe de rendu supplémentaire. Matériaux récepteurs propres aux pièces, textures partagées, trois programmes supplémentaires précompilés (34 → 37), puis nombre stable dans les sept espaces. Banc inter-pièces A/B/B/A à DPR1,6 : environ 59,88–59,89 images/s avant/après, p95 16,8–17 ms, aucune image >33,4 ms sur les quatre passages. Résultats locaux, cadence non garantie sur tous les appareils.

Build/lint réussis avec avertissements hérités. 37 contrôles trois thèmes × normal/Scène, sept espaces et commandes sans erreur. Livraison isolée depuis origin/main 91a67ed, cinq fichiers applicatifs de l’hôtel seulement, avec preuves et documentation. La nuit, la brume supprimée, la végétation et les transitions caméra restent conservées. Les contrôles publics complètent les rapports après publication.
