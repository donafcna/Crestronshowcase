# Villa Stark 2.3.28 — 26 novembre 2026

## Stores
Vitrages du bureau, du fitness et du salon relevés dans les photos 1672 × 941. Les points hors photo gardent leurs coordonnées négatives, afin de conserver la pente du rail. Un seul vitrage au bureau, trois dans le fitness et trois au salon. Projection homographique des positions intermédiaires, ourlets et plis. Masques de premier plan spécifiques pour le tapis de course, le vélo et le fauteuil.

Contrôles visuels en descente et à 100 % : bureau, fitness et salon ; commandes d'ouverture / arrêt / fermeture conservées. Les images fermées de ce dossier montrent le résultat. Les contours restent des détourages vectoriels manuels sur photographie, pas une simulation de tissu 3D.

## Roue piscine
Les boutons de couleurs primaires sont remplacés par une roue teinte/saturation, avec blanc et arrêt. Interaction pointeur au centre vérifiée (blanc), touches Début puis flèches vérifiées (rouge #ff2626, jaune #ffff26). Couleur identique confirmée dans les variables des spots immergés et de terrasse. Intensité zéro : tous les halos RGBW à zéro. Choix de couleur depuis zéro : intensité rétablie à 80 %, fader et texte actualisés. Les autres pièces ne proposent pas de roue RGBW.

Les quatre châssis ont été parcourus à 1280 × 800 : roue présente, actions dans la page, aucun débordement de hauteur (gui-piscine-tests.json). Les trois thèmes ont aussi été vérifiés sur smartphone. Pas d'erreur console relevée. Il ne s'agit pas d'une recette exhaustive de toutes les pages et fenêtres modales du site.

## Extinction
Retrait des ellipses opaques et gros traits noirs sur toutes les pièces. Entrée : atténuation du verre des huit tubes et tracés fins recalés sur les lèvres des marches. Contrôle des deux faders à zéro : aucune pastille noire en suspension ni barre traversant la pierre. Les retombées et le décor ambiant restent une approximation photographique ; le calcul ne remplace pas une scène photométrique.

## Compte à rebours
Le composant partagé Showcase est rendu dans la colonne d'outils. Vérification par intersection avec le rectangle de l'iframe GUI, et non avec son conteneur plein espace : aucun recouvrement à 1280 × 575 et 1280 × 800 en mode normal, ni en mode Scène à 1280 × 800. Une seule instance. Le délai reste de 120 secondes après interaction.

Build et lint réussis (avertissements préexistants, aucune erreur). Fichiers des anciennes recettes et travaux étrangers préservés.
