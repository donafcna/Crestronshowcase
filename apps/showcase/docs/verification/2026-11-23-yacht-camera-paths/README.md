# Yacht — trajets de caméra, 23 novembre 2026

## Déplacement

Entre pièces, trajet en coordonnées monde avec accélération/décélération quintique et courbe cubique. Trajet droit si dégagé ; légère prise de hauteur si nécessaire. Enveloppes conservatrices du pont construites une fois à partir des murs/meubles, du plancher, du flanc de coque et du garde-corps ; marge caméra de 40 cm. Test segment/enveloppe sur 64 segments lors de la sélection, aucune collision recalculée par image. La courbe, la cible de regard et la position anticipée utilisée par les murs sont évaluées sans allocation de géométrie.

Changement de pont au milieu dégagé du trajet : le pont de départ reste visible pendant le départ, le pont d'arrivée prend le relais à mi-course. Étiquettes des ponts masqués cachées. Durée proportionnelle à la distance, bornée entre 0,9 et 1,65 s. Le cadrage latéral final reste celui du fit existant. Nouveau clic en vol : reprise depuis la position courante ; changement de format : nouveau fit et trajet continu. Réduction des animations : arrivée immédiate. Vue extérieure initiale et orbite manuelle hors trajet gardent leur comportement.

## Vérification géométrique

verify-yacht-camera-paths.html : 37 × 36 trajets dans deux zones libres (1280 × 800 et 420 × 600 décalée), soit 2664 cas. 124 trajets nécessitent une prise de hauteur ; aucun échec de planification ni point caméra dans l'enveloppe visible sur 120 pas par trajet. Aucune bascule de pont prématurée. Erreur de position à l'arrivée : zéro ; durées 0,9 à 1,532 s. La vérification par points est indépendante du test par segments du planificateur. Les enveloppes englobent les meubles et murs entiers, même quand les murs sont abaissés.

interruptions.json contrôle la continuité d'un changement de destination en cours de route, l'arrivée exacte, le redimensionnement portrait en vol, une nouvelle sélection de la même pièce et l'annulation par vue extérieure. Toutes les assertions passent. Les derniers ajustements ne modifient pas le planificateur validé : mise en cache d'un vecteur et masquage d'étiquettes sur pont invisible.

## Fluidité

Comparaison de l'ancienne interpolation orbitale et des trajets, A/B/B/A, dans le même contexte WebGL. Séquence répétée : Grand salon → Salle à manger → Salon avant → Cabine capitaine → Sky lounge → Lounge couvert → Grand salon. 1,8 s par sélection, chauffe 1,5 s ; temps de planification inclus dans la mesure. Eau figée pour comparaison stable, viewport 1280 × 800 avec zone libre 420 × 600. 59,83 → 59,89 images/s (+0,10 %). Pas de nouvelle géométrie, matériau, texture ou lumière ; calcul des volumes à la demande et boucle de déplacement légère. Résultats locaux, pas une garantie universelle. Build/lint et contrôle visuel dans l'interface réelle complètent le banc.
