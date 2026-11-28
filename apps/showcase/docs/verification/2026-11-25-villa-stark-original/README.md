# Villa Stark — architecture originale et GUI blanc

## Architecture et médias
15 visuels créés avec image_gen intégré : façade allumée/éteinte, état mécanique, paysage sans bâtiment, dix vues d’espaces dont piscine, caméra d’interphone. Création de la première façade sans référence photographique ; variantes et intérieurs basés uniquement sur cette nouvelle création. 1672×941, export WebP sans recadrage. Fichiers, provenance, empreintes et brief dans public/showcases/villa-stark/assets/original/.

Nouvelle géométrie : neuf baies recalées, portail et garage à gauche, piscine à droite ; plan SVG original. Les anciennes photographies et l’ancien plan raster ont été retirés du contenu public. Le moteur et le GUI restent une adaptation du travail initial documenté dans SOURCE.md : aucune affirmation d’originalité globale du code.

## GUI blanc par défaut
Thème glacier par défaut, fond calculé rgb(255,255,255), sans photographie derrière l’accueil. Logo officiel noir/orange conservé, sans cartouche contrastant avec le fond. Préférence de thème mémorisée sous une nouvelle clé v2 ; les anciennes préférences sombres ne s’imposent pas au premier chargement de cette version. Les trois thèmes restent sélectionnables.

## Vérifications de cette session
- 24 combinaisons : quatre supports × trois thèmes × normal / Mode Scène Responsive. Neuf baies entre châssis et outils dans les 24 cas (checks.json).
- Neuf intérieurs ouverts depuis la façade ; URL de chaque pièce dans assets/original/ (room-checks.json).
- Extinction globale : neuf calques win-lit à zéro. Bleu d’ambiance intérieur : #3C7CFF.
- Fermeture globale : neuf stores scaleY(1). Garage ouvert : translateY(-97%). Couverture de piscine et nouveau visuel mécanique exercés.
- Interphone : camera-gate.webp et visiteur procédural affichés.
- Pas d’erreur console constatée. Build et lint réussis, avertissements préexistants uniquement.
- Captures de fiche renouvelées sur le GUI blanc à 1280×800.

Le navigateur a été interrompu avant la reprise ; seuls les contrôles réussis après reprise sont rapportés ici. Les limites du Mode Taille réelle restent celles de la recette précédente ; cette matrice concerne les présentations ajustées à la zone disponible.
