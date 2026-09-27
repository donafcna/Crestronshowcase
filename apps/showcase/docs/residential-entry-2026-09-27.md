# Residential — vue complète dès la première image

Demande de Donatien, capture du 27/09/2026 : supprimer le dézoom au clic sur Residential et afficher directement la villa complète au cadrage final.

Cause vérifiée : createPlan3D place initialement la caméra pour tout le canvas (goOverview(true), sans fenêtre de cadrage). Le premier setWindow de Plan3DBackground lance ensuite goOverview(false), un déplacement de 1,4 s vers l'espace situé à droite de l'iPhone.

Correction limitée à la présentation initiale : toile masquée pendant l'initialisation ; mesure du châssis et de la colonne de commandes ; application de setWindow puis jump avant affichage. Attente de stabilité géométrique (160 ms), des polices et d'au moins une véritable image rendue après ce cadrage. Aucun changement de dimensions, géométrie ou pose finale. L'API publique et plan3d-ready sont publiés après cette première image, afin que la visite automatique ne consomme pas son délai de vue générale pendant le chargement.

Après affichage, le contrôleur d'entrée cesse d'intervenir : sélection des pièces, éclatement, retour en vue globale, molette et recadrages ultérieurs conservent leurs animations. GUI CH5 source, copie générée, C# et SIMPL non modifiés.

Vérification : cinq tests du contrôleur, puis trois entrées réelles Chromium (premier clic, retour du menu, redimensionnement pendant l'initialisation). Comparaison caméra/cible dès la première image visible et sur les images suivantes ; contrôle séparé que les déplacements ultérieurs restent animés. Résultats/captures : artifact guided-entry-review, villa-entry. Une première image masquée n'est jamais décrite comme la première image visible.

Pour les parcours Boutique/Restaurant/Yacht, le banc de temporisation garde désormais le vrai rendu actif. Il mesure séparément l'attente programmée et les retards effectifs des callbacks sur le serveur WebGL logiciel ; ne pas confondre une temporisation réglée à 1 s avec une garantie de latence sous toute charge matérielle. Les commandes et horloges de l'application ne sont pas remplacées. Les mesures brutes et tous les échecs restent dans les rapports.
