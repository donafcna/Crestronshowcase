# Residential — vue complète dès la première image

Demande de Donatien, capture du 27/09/2026 : supprimer le dézoom au clic sur Residential et afficher directement la villa complète au cadrage final.

Cause vérifiée : createPlan3D place initialement la caméra pour tout le canvas (goOverview(true), sans fenêtre de cadrage). Le premier setWindow de Plan3DBackground lance ensuite goOverview(false), un déplacement de 1,4 s vers l'espace situé à droite de l'iPhone.

Correction limitée à l'entrée : toile masquée pendant l'initialisation ; mesure du châssis et de la colonne de commandes ; application de setWindow puis jump avant affichage. Attente de stabilité géométrique (160 ms), des polices et d'au moins une véritable image rendue après ce cadrage. Aucun changement de dimensions, géométrie ou pose finale. L'API publique et plan3d-ready sont publiés après cette première image, afin que la visite automatique ne consomme pas son délai de vue générale pendant le chargement.

Un nouveau clic sur Residential alors que la villa est déjà montée relance seulement cette présentation, grâce à la nouvelle session créée par Showcase : masque avant peinture, retour immédiat à l'enveloppe complète, cadrage mesuré, puis affichage. Le modèle n'est pas reconstruit. La sélection des pièces, l'éclatement, la molette et les autres retours en vue globale conservent leurs animations.

GUI CH5 source, copie générée, C# et SIMPL non modifiés.

Vérification : cinq tests du contrôleur, puis quatre entrées réelles Chromium (premier clic, retour du menu, redimensionnement pendant l'initialisation, nouveau clic dans Residential depuis une pièce). Comparaison caméra/cible dès la première image visible et sur les images disponibles avant la visite ; le nombre de captures effectivement échantillonnées figure au rapport, sans condition artificielle de FPS. Contrôle séparé des déplacements ultérieurs. Résultats/captures : artifact guided-entry-review, villa-entry.

Pour les parcours Boutique/Restaurant/Yacht, le banc garde le vrai rendu actif et mesure séparément l'attente programmée, les retards des callbacks et les autres délais d'exécution sur le serveur WebGL logiciel. Ne pas confondre une temporisation réglée à 1 s avec une garantie de latence sous toute charge matérielle. Les commandes et horloges de l'application ne sont pas remplacées ; les mesures brutes et tous les échecs restent dans les rapports.
