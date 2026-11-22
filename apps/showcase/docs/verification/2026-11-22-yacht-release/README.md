# Livraison Yacht — 22 novembre 2026

Périmètre : public/ftv-luxury/models/yacht.html, model-bridge.js, yacht-exterior-gui.js et yacht-night-finish.js. Base distante origin/main ; aucun changement d’un autre projet ajouté à cette livraison.

Pièces : caméra plus latérale (34,4°), cadrage rapproché avec enveloppe projetée de 0,975, matériaux originaux de la pièce active et voisins grisés, noms cliquables prioritaires et sans chevauchement. Matériaux détaillés : noyer, tissus, panneaux et marbre, détails filtrés. Teck et petites rides de mer filtrés. Pas de nouveau mobilier ou de lumière.

Extérieur : entrée dédiée dans la liste des espaces, vue globale et 40 circuits accessibles en huit familles. Variations manuelles, extinction, allumage, reprise Auto et indépendance des circuits vérifiés sur le modèle réel. Le contrôleur et les éclairages 3D déjà présents sont réutilisés.

Bateau entier : limites structurelles opaques mises en cache ; ajustement analytique du centre et de la distance en perspective, sans calcul supplémentaire dans la boucle de rendu. Coque et mât visibles dans les quatre formats de test. Largeur 97,5 % de l’espace libre : gain relatif de 3,23 à 15,68 % selon le format. Les halos ne font pas partie des limites navales.

Preuves locales avant publication : 37 pièces contrôlées (interior-report.json et rooms-report.json ; le dernier resserrement à 0,975 est vérifié dans exterior-section-report.json). 40 circuits distincts accessibles, niveaux natifs 23/61/47 %, indépendance, ON/OFF/Auto et retour aux pièces réussis. Dix tests du noyau extérieur et quatre tests ciblés de présentation réussis.

Fluidité : matériaux intérieurs ≈59,87 images/s avant/après. Dernier cadrage extérieur : sur UN même modèle et contexte WebGL, nuit et eau figées, alternance A/B/B/A, chauffe 3,5 s puis mesure 6,5 s : 58,68 images/s avant, 57,52 après (-1,97 % ; tolérance 3 %). Même budget : 1738 appels, 307054 triangles, 529 géométries, 8 textures. Le premier banc à contextes successifs a mesuré -20,9 %, cause non isolée ; son rapport est conservé, ses projections de cadrage restent valides. Aucune garantie de FPS identiques sur tous les GPU. Pas de réduction de résolution, de détails ou d’éclairages pour la publication.

Trois thèmes en mode normal et Scène vérifiés dans l’aperçu local. Contraste et modales GUI exhaustifs non refaits ; GUI commun inchangé. Dalle/tablette sans fond 3D : pas de changement de présentation 3D dans ces supports, panneau existant conservé.

Reproduction : après build, copier les scripts verify-yacht-*.html nécessaires dans dist. Les pages de banc ne font pas partie de public et ne sont pas déployées. Pour le cadrage extérieur, copier before-exterior-fit.html dans dist/yacht-fit-before.html en ajoutant une base /ftv-luxury/models/ dans head ; lancer verify-yacht-exterior-fit-single.html pour le banc sur une même scène. Pour les contrôles, verify-yacht-exterior-section.html guide les valeurs à régler au clavier. Pour les matériaux, utiliser room-before-interior.html comme dist/yacht-room-before.html (même base) puis verify-yacht-interior.html. Rapports et images sont des preuves des essais locaux ; la vérification de publication est consignée séparément.
