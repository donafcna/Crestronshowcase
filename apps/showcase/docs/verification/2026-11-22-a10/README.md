# A10 — 22 novembre 2026

## Synchronisation GUI / 3D
100 circuits actifs, 100 luminaires représentatifs et 34 motorisations individuelles. Catalogue public A10 comme contrat des indices ; aucune modification CH5 matériel, C# ou SIMPL. Lecture des retours A10Bench toutes les 100 ms, conservation du fondu lumineux de trois secondes. Les commandes de groupe du moteur de démonstration mettent aussi à jour leurs membres.

Contrôles navigateur : parité des 100 valeurs, Bright/Off, arrêt intermédiaire, fermeture complète des 34 moteurs, trois thèmes ; aucune exception JavaScript. Captures normales et Mode Scène dans la planche index.html. Dalle/tablette : pas de fond 3D selon les règles actuelles, donc matrice 3D non applicable. Architecture représentative : les orientations multiples occupent des baies séparées dans l'ouverture du modèle existant ; ce modèle ne constitue pas un relevé architectural.

## Ambiance hivernale
Terrain et montagnes enneigés dans la surface existante, sapins chargés de neige, deux pistes balisées. Aucun polygone neige coplanaire, cycle jour/nuit conservé, faible réflexion bleutée nocturne. Option winter propre à A10 ; autres projets inchangés.

## Vérifications
Build et lint réussis (avertissements existants). Test test-a10-plan-sync.cjs réussi ; capture-a10-review.cjs : six vues des trois thèmes en normal/Scène.
Régression Villa : 19 contrôles des fondus lumineux réussis ; le script historique test-plan3d-lighting.cjs s'arrête ensuite sur le sélecteur absent du bouton global #global-control-overlay ch5-button[data-join="402"]. Ce parcours global n'est pas validé par cette exécution.

Les captures de référence avant proviennent de l'utilisateur ; les captures après ont été produites durant cette session.
