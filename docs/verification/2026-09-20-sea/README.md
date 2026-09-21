# Mer Sunrays — 20 septembre 2026

Demande : rendre la mer autour du yacht plus réaliste.

Houle animée et normales de petites rides calculées dans le shader, reflets de l’environnement ciel, variation subtile de couleur et horizon adouci. Une surface, un passage de rendu, subdivision 240 × 240 conservée. Les reflets ne reproduisent pas la coque ; aucune simulation hydrodynamique.

Validation Chromium logiciel 1280 × 800 : jour, coucher de soleil, nuit, aucune erreur JavaScript ou shader ; animation active, arrêt avec prefers-reduced-motion, masquage en coupe ; 37 espaces et 10 passages conservés. Comparaison avant/après : comparison.webp. Résultats : results.json. Build réussi ; lint sans erreur, avec avertissements préexistants. Aucun débit d’images mesuré ni essai matériel.

Modification limitée au décor 3D. Les thèmes et supports HTML/CSS ne changent pas ; la matrice complète des interfaces n’est pas répétée. Les dalles ne chargent toujours pas de 3D. Piscines et export du modèle conservent leur périmètre. Aucun changement CH5/C#/SIMPL. Publication autorisée sur main puis Vercel par Donatien dans cette conversation.
