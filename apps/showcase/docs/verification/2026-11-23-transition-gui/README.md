# Validation GUI complète — 23 novembre 2026

Candidat local 2.3.20, aucune publication. Interface complète servie sur localhost:4348, navigateur intégré, viewport des captures 1280 × 720. Les contrôles ont été actionnés par les boutons et sélecteurs de la GUI Smartphone. Instrumentation passive via deux scripts injectés, absents du build publié. Ce passage valide le candidat ; ce n'est pas une comparaison A/B avec la production.

## TV et transitions

75 fenêtres de mesure de deux secondes, certaines volontairement superposées : 58,27 à 60,54 images/s (le comptage aux bornes peut dépasser légèrement 60). Intervalle maximal relevé : 63,9 ms lors de TOTAL dans Chambre 2. Le gain ciblé du profil précédent est conservé fonctionnellement, mais les saccades ne sont pas toutes éliminées.

Parcours des 11 pièces TV : Salon, Cuisine, Salle à manger, Suite parentale, Chambres 1/2/3, Bureau, Home Cinéma, Suite invités, Bar & Lounge. Source SKY Q/course texturée détectée dans chaque pièce ; captures conservées. Séquence rapide 4→5→10→8 : état final active=selected=8, phase room. Trois PointLights visibles et écart nul entre l'ancrage TV et la lumière mutualisée dans les 75 mesures.

OFF/TOTAL essayé dans les onze pièces. Extinction/rallumage et rentrée/sortie des cinq TV escamotables vérifiés visuellement : pièces 4, 5, 6, 9 et 10. Planche lifts-contact.jpg.

## MutationObserver

Dernier relevé : 1448 appels observe dans l'iframe, aucune cible invalide, aucune exception ; zéro appel dans la page principale. Console finale sans avertissement ni erreur. Ces compteurs ne sont pas à additionner entre échantillons. L'erreur initiale reste non reproduite et son origine non attribuée : elle n'est PAS déclarée corrigée. Le diagnostic réémet toute exception ; aucune neutralisation.

## Présentation et périmètre

Trois thèmes contrôlés dans les modes normal et Scène, Suite invités : themes-contact.jpg (thèmes en colonnes). Aucun changement de la GUI ni des détails 3D dans ce passage. Dalle/tablette : non incluses dans cette validation de fond 3D Smartphone. Plein écran brut Smartphone : non applicable. Les autres pages/modales, contrastes et cibles tactiles ne font pas l'objet d'une nouvelle recette exhaustive ici, puisqu'aucun composant GUI n'a changé. Aucun test matériel TSW/iPhone et aucune mesure GPU exhaustive.

Le build et lint du candidat avaient passé lors de l'étape précédente ; pas relancés pour cette étape de preuves/documentation uniquement. Les pics résiduels demandent un profil séparé avant toute affirmation de fluidité constante. Aucun commit, push ou déploiement.
