# Hotel des Horlogers — terrain, 23 novembre 2026

Dix pâtures/parcelles, dont quatre fauchées, et quatre tracés de chemins raccordés ; teintes mêlées au grain photographique existant, limites irrégulières et légères traces de fauche. Atlas local 1024² préparé au chargement, intégré au matériau du terrain existant : aucun maillage superposé, aucun ajout d’appel de rendu ou de triangle. La carte remplace la texture d’herbe répétée 512² : environ 4 Mio RGBA avant mipmaps contre 1 Mio pour la texture précédente ; la texture photographique déjà chargée reste disponible pour fabriquer l’atlas. Aucun nouveau fichier distant.

Collines : sommets asymétriques et plis à plusieurs échelles, surface centrale de l’hôtel préservée. Même grille de 3705 sommets ; les cent sapins sont recalés sur la surface réellement triangulée. Arbres proches des chemins décalés latéralement. Paysage interprété, sans prétention de correspondance cadastrale/topographique au site réel. Toitures et bâtiment conservés ; la capture de réflexion unique reflète automatiquement ce nouveau paysage.

## Vérification de la fluidité

animation-performance.json : séquence A/B/B/A, rotations et transitions hôtel/Bar. Nouvelle version autour de 59,9 images/s, aucune image >33,4 ms sur les deux passages ; version précédente fluctuante ~55,1 et 58,5 images/s. Ce banc ne permet pas de conclure à un gain de vitesse, mais ne montre pas de régression. night-performance.json fournit le banc nocturne séparé et les appels/triangles. Aucun calcul agricole ou de relief à chaque image ; atlas, normales, positions des arbres et reflet préparés une fois. Mesures locales uniquement, cadence non garantie sur tous les appareils.

## Contrôles géométriques et fonctionnels

exterior.json : cent arbres à 194 triangles, 3705 sommets de terrain, contacts racinaires vérifiés au rayon (erreur maximale ~0,0000027 m), 1521 touffes de toiture sans flottement, 27 panneaux avec garde minimale 0,1224 m ; géométrie finie, six toitures extérieures. Vérification jour/nuit et paysage masqué dans les pièces. matrix.json couvre les trois thèmes en normal/Scène et les sept lieux ; live.json contrôle la livraison locale 4319. Build/lint réussis avec avertissements hérités. Les captures landscape-day utilisent la même caméra initiale avant/après, avec les commandes masquées pour comparer le paysage.

Livraison locale uniquement sur 4319. Brume supprimée et améliorations de nuit conservées. Aucun matériel ou programme CH5 modifié ; pas de nouvelle publication Vercel.

Recette finale nocturne A/B/B/A : avant 59,88–59,89 i/s ; après 59,22 et 59,89 i/s, p95 16,9–17,3 ms, aucune image >33,4 ms. Appels identiques (641), triangles identiques (182314), 42 lumières, 28 programmes, une capture de paysage ; aucune erreur. Contrôle final 4319 : Restaurant et Bar, programmes stables et aucune erreur HTTP/JavaScript.
