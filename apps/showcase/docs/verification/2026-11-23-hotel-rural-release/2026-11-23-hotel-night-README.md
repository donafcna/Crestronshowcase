# Hotel des Horlogers — nuit et brume, 23 novembre 2026

Brume Three.js supprimée de jour et de nuit. Lumière froide nocturne : hémisphère .38, directionnel .24, couleurs interpolées sans nouvelle ombre. 48 luminaires fixes sous les débords ; un lot instancié, +576 triangles. Empreintes lumineuses chaudes procédurales sur bois et béton, sans ajouter de vrais points lumineux ou de passes de rendu. Vitrages : atténuation/refroidissement du reflet de paysage de jour et reflet chaud ponctuel en haut des vitres extérieures ; les vitres intérieures ne reçoivent pas ce reflet décoratif extérieur. Uniformes partagés et uniformes propres aux deux matériaux de verre, aucun changement de programme pendant la navigation. Une capture de paysage au démarrage conservée. Ces empreintes sont une approximation d’éclairage architectural, sans simulation photométrique ni réverbération calculée.

## Vérification de la fluidité

animation-performance.json : banc séquentiel A/B/B/A, rotations et transitions entre hôtel et Bar ; ~59,9 images/s, aucune image >33,4 ms sur les quatre passages. night-performance.json : comparaison nocturne séparée à DPR1,6, même rotation ; mesures détaillées dans le JSON. Un seul appel de rendu supplémentaire, même nombre de lumières et mêmes 28 programmes. Les mesures ne garantissent pas la cadence sur tous les appareils.

## Contrôles fonctionnels

matrix.json : trois thèmes × normal/Scène, sept espaces, zoom, éclairage et stores. night.json : extinction et stores fermés, lumière naturelle nulle, cache des ombres et textures PBR préservés. Aucun message JavaScript/compilation shader dans le banc nocturne final. Build/lint réussis, avertissements hérités. Les premiers essais parallèles et erreurs de compilation ont été corrigés avant la recette finale ; seuls les JSON actuels décrivent le résultat final.

nuit-avant-apres.jpg et les captures detail utilisent une caméra diagnostic rapprochée identique avant/après, sans modifier les caméras utilisateur. Les captures overview montrent l’interface 3D réelle. Effets extérieurs interprétés ; aucun matériel ou programme CH5 modifié. Livraison locale sur 4319, sans nouvelle publication Vercel.
