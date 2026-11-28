# Salon photoréaliste intégré — 28 novembre 2026

Candidat local 2.3.21, non publié. Intégration du prototype validé au fond de Villa FTV (version smartphone), sans modification du code CH5 ni des joins.

## Fonctionnement

- Activation par `salonPhoto: true` dans villa-crans.json, uniquement dans le salon (pièce 1). Vue générale et autres pièces conservées en 3D.
- Photographies OFF/ON originales du prototype approuvé. Fondu piloté par la moyenne des niveaux des circuits reçus : ambiance globale, pas de masques photographiques indépendants par spot.
- Volet, store et rideaux suivent les positions animées du moteur existant, avec obscurcissement ambiant. Arrêt intermédiaire vérifié sur le store.
- TV : texture du moteur existant partagée, aucun second contexte WebGL. Sélection SKY Q/course, pause, lecture et extinction vérifiées depuis la GUI.
- Même renderer. Le dessin 3D principal est omis lorsque la photo est entièrement visible ; il reprend pendant les transitions. Si le chargement des images échoue, la 3D reste visible.
- Décor photographique à caméra fixe, cadrage conservé (sans étirement). Ce n'est pas une nouvelle géométrie 3D navigable.

## Recette locale

Build de production servi sur 127.0.0.1:4351 ; instrumentation uniquement avec `?verify=1` (hors sources livrées). Le mode Scène a également été contrôlé visuellement.

Cinq fenêtres de mesure de 3 secondes, dans performance.json :

1. Entrée initiale/salon : 58,87 i/s, p95 16,9 ms, intervalle maximal 83,4 ms.
2. Lumières et rideaux : 60,10 i/s, p95 16,8 ms.
3. Volet : 60,27 i/s, p95 17,1 ms.
4. Salon vers cuisine : 60,25 i/s, p95 17,2 ms.
5. Cuisine vers salon : 56,87 i/s, p95 32,7 ms, maximum 49,8 ms.

Ces mesures courtes décrivent ce navigateur local ; elles ne garantissent pas 60 i/s sur tous les appareils. Les retours au salon présentent encore quelques images plus longues. Aucun avertissement/erreur de console capturé dans cette recette. L'ancien problème MutationObserver n'a pas été reproduit ici : aucune affirmation de correction.

Vérifications de compilation et syntaxe réussies ; lint global sans erreur (avertissements existants). Aucune publication Vercel, aucun commit/push, aucun déploiement matériel.
