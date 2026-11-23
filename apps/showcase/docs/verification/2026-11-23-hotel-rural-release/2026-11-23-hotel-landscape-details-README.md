# Hotel des Horlogers — détails ruraux, 23 novembre 2026

Clôtures sur huit portions de bordure de pâtures : 105 piquets, deux fils légèrement fléchis et quelques croisillons de barbelé simplifiés. Les traversées de chemins sont laissées ouvertes. Piquets posés par lancer de rayon sur le maillage réel ; fils atténués la nuit. Petits fossés humides suggérés dans l’atlas existant le long de deux pistes (effet de matériau, sans tranchée supplémentaire dans la géométrie). 59 pierres calcaires et 30 buissons regroupés ; pierres partiellement enterrées, sans encombrer les chemins.

Petit ruisseau statique à l’est : douze points de trajet, descentes successives contrôlées sur le maillage réel, sans simulation de fluide. Fond humide/berges dans l’atlas ; ruban d’eau opaque légèrement réfléchissant, hauteur des bords échantillonnée sur le terrain. Aucune nouvelle capture de reflet, aucun tampon hors écran, aucune lumière supplémentaire ou ombre dynamique. Paysage interprété, sans prétention de correspondance topographique au site réel.

## Vérification de la fluidité

Cinq lots fixes : piquets instanciés, fils en segments, eau, pierres instanciées et buissons instanciés. Aucun mouvement ou recalcul de position à chaque image. Une affectation d’opacité pour atténuer les fils pendant le cycle de nuit. Aucun nouvel asset distant ; atlas 1024² conservé. animation-performance.json : banc séquentiel A/B/B/A, rotations et transitions hôtel/Bar, environ 59,9 images/s et zéro image >33,4 ms sur les quatre passages. night-performance.json documente le banc nocturne séparé. Résultats locaux, cadence non garantie sur tous les appareils.

## Contrôles géométriques et fonctionnels

details.json : 105 piquets, 59 pierres, 30 buissons ; contact des piquets exact à la précision de calcul, géométrie finie et ruisseau strictement descendant. exterior.json : cent arbres, 3705 sommets de terrain, contacts racinaires, toitures et panneaux conservés ; masquage du paysage dans les pièces. matrix.json couvre trois thèmes × normal/Scène et sept espaces. Build/lint réussis avec avertissements hérités ; live.json contrôle la livraison locale. Les captures landscape-day et paysage-avant-apres.jpg utilisent la même vue initiale avec les commandes masquées.

Version locale 4319 uniquement ; aucun matériel ou programme CH5 modifié, aucune nouvelle publication Vercel.

Recette finale : vue nocturne 641 → 646 appels, 182314 → 185376 triangles (+3062, ~1,68 %), 28 → 34 programmes précompilés ; 42 lumières et une capture de paysage conservées. Nouvelle version 59,88–59,89 i/s, p95 16,9 ms, aucune image >33,4 ms sur les deux passages nocturnes ; référence fluctuante 56,12 puis 59,89 i/s, sans conclusion de gain. 37 contrôles de matrice, zéro erreur. Restaurant et Bar vérifiés sur 4319 : 34 programmes stables, aucune erreur HTTP/JavaScript ; préparation initiale mesurée ~2,94 s sur cette recette. Source et copie servie identiques en SHA256.
