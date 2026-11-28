# Yacht — fondu des ponts, 28 novembre 2026

## Résultat

Remplacement de la coupure visuelle au milieu du trajet par un fondu smoothstep de 320 ms. Le dernier rendu du pont quitté est copié une seule fois dans une texture GPU ; une surface plein écran de deux triangles le dissipe au-dessus du pont d'arrivée. Un seul pont 3D est rendu par image. Les trajets dégagés, l'anticipation des murs et le cadrage proche/latéral final ne changent pas. Les commandes directes de pont bénéficient du même fondu ; pas de fondu pour deux pièces du même pont.

Une texture de la taille du framebuffer, réutilisée entre transitions ; remplacement avec libération lors d'un changement de dimensions. Aucun téléchargement d'image, aucune lecture CPU du framebuffer dans le produit. Shader simple précompilé au chargement, aucune compilation au milieu du déplacement. Un appel de dessin et deux triangles supplémentaires pendant le fondu seulement. Les statistiques renderer.info additionnent bien la passe de composition. Réduction des animations : pas de capture ni fondu ; retour extérieur : annulation. Nouveau clic pendant le fondu : la composition courante peut servir d'image de départ, sans coupure.

## Vérifications

Douze contrôles réussis : fidélité de l'image au premier instant, alpha à mi-parcours, restitution exacte du nouveau rendu à la fin, fin du fondu, même pont sans effet, interruption sans remise à zéro prématurée, nouveau fondu sur clic rapide, retour extérieur, préférence réduction des animations, redimensionnement propre et absence d'erreur shader. Validation de 20 trajets dirigés couvrant les cinq ponts : fondu actif, texture réutilisée, trajectoire dégagée et arrivée exacte. Contrôle visuel dans la vraie interface en Mode Scène. transition.jpg extrait trois instants de cette séquence ; old/middle/new.jpg proviennent du test de pixels à caméra contrôlée, pas d'une lecture de l'animation réelle.

## Fluidité et limites

Banc verify-yacht-deck-blend.html, même contexte WebGL, fondu désactivé/activé en A/B/B/A. Six changements de pont par passage, 1,5 s par sélection et 1,2 s de chauffe. Seules les images de la scène 3D principale sont comptées, pour ne pas compter deux images lors de la composition. Planification comprise dans le temps mesuré ; eau figée pour comparaison stable. Viewport 1280 × 800 avec zone libre 420 × 600. 59,68 → 59,97 images/s (+0,49 %). Une texture GPU en plus, conservée pendant les deux témoins après initialisation ; pas d'allocation répétée entre ponts. Ces résultats sont locaux à cette machine. Build/lint réussis.
