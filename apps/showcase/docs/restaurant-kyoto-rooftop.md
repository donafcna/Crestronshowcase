# Kyoto Rooftop — restaurant 3D

Version 2.2.0, 26 septembre 2026.

Le projet Sushi Bar Kyoto devient un restaurant gastronomique de trois niveaux inspiré des deux références visuelles fournies par Donatien : une salle sombre avec bar architectural et un restaurant isométrique avec rooftop. La maquette reste une création conceptuelle originale et ne reproduit pas un bâtiment réel.

La maquette devient Kyoto Gardens, un ensemble paysager d'environ 88 × 53 unités, soit plus de quatre fois l'emprise de la première étude. Quinze pavillons remplacent le volume rectangulaire : formes rondes, ovales, hexagonales, triangulaires, en L, en éventail, en croissant et en îlots, reliées par trois promenades. Chaque pavillon combine une architecture, une implantation de mobilier et une couverture différentes. Il reçoit au minimum quatre tables, seize chaises, huit balises au sol, huit appliques et plusieurs sources de plafond.

Chaque choix du GUI possède un cadrage de caméra propre et isole visuellement le pavillon ciblé. La molette descendante revient au domaine complet ; la molette montante retourne à la dernière zone. Le GUI pilote aussi cinq scènes et les circuits des tables, du bar, des pergolas et des plantations.

Le fond 3D est réservé au support Smartphone. Dalle TSW, Tablette et autres grands supports conservent la vidéo d'arrière-plan. Le modèle est procédural et optimisé pour la démonstration web ; il ne constitue pas une étude architecturale.

Vérification locale : compilation et lint réussis, quinze architectures et quinze caméras distinctes, mobilier minimum par zone, éclairages de sol/mur/plafond, emprise, isolation des pavillons, deux sens de molette, scène Rooftop, synchronisation lumineuse, présence de la vidéo sur Dalle et Tablette, absence d'erreur navigateur.

## 27/09/2026 — Architecture extérieure et cadrages, vitrine 2.2.4

La vue générale devient un domaine fermé et paysager : enceintes minérales, façades vitrées, toitures complètes, pergolas, bassin, plantations, promenades balisées, appliques, bandeaux de rive et lanternes sur poteaux. Les coordonnées des quinze pavillons utilisent désormais correctement les axes hauteur et profondeur, ce qui supprime les salles enterrées ou flottantes et les artefacts de sol associés.

La Cave à vins reçoit deux grands rayonnages remplis de bouteilles et des tables de dégustation. Le Salon privé, la Salle signature, le Teppanyaki, le Lounge, la Galerie, le Belvédère et la Terrasse disposent de compositions dédiées. Le Lounge comprend cinq canapés, plusieurs tables basses, lampadaires et un bar. Pour les quinze vues rapprochées, les toitures, façades, enseignes, toiles et bandeaux susceptibles de masquer la pièce sont retirés. Chaque caméra surplombe l'espace et conserve au moins quatre tables visibles.

Restaurant ouvre désormais le support Smartphone par défaut avec la maquette 3D. Les grands supports conservent leur vidéo.

## 27/09/2026 — Façade frontale et éclairages par zone, vitrine 2.2.5

La vue générale regarde désormais le domaine depuis l’entrée principale. Le jardin et les clôtures reçoivent un réseau dense d’appliques, lampadaires, lanternes, spots de sol et balises de cheminement. L’interface ajoute « Extérieur » aux zones, avec quatre circuits et cinq scènes dont « Tout allumé ». Chacune des quinze pièces possède aussi ses propres circuits de suspensions, appliques et corniches, spots plafond et balises décoratives. Les réglages sont indépendants : modifier l’extérieur ou une pièce ne change pas les autres zones.

La vue extérieure 2.2.6 rapproche la caméra au maximum utile : le domaine remplit maintenant le cadre disponible tout en conservant la façade, les clôtures et les lampadaires entièrement visibles.

## 27/09/2026 — Sols visibles dans les vues rapprochées, vitrine 2.2.8

Les quinze cadrages de zone sont relevés pour offrir une vue plongeante plus lisible. Chaque espace reçoit un socle de sol clairement délimité sous son architecture propre. Un contrôle géométrique vérifie désormais que les quatre coins du sol restent visibles pour chaque vue zoomée.
