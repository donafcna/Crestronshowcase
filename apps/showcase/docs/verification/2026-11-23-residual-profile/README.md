# Diagnostic des pics résiduels — 23 novembre 2026

Candidat conservé en 2.3.20. Aucun changement fonctionnel ajouté, aucun commit/push/déploiement. Les expériences sont exclusivement dans test-results ; copies des sondes et résultats ici. L'état Git initial a été relevé et les modifications préexistantes préservées.

## Éclairage et transitions dans la GUI complète

Six alternances OFF/TOTAL dans Chambre 2 : 60,12 à 60,29 i/s sur les fenêtres de deux secondes, intervalles maximaux 17,9–19,3 ms. Aucun appel renderer.render >3 ms ni long-animation-frame dans les fenêtres de profilage de quatre secondes correspondantes. Le pic de 63,9 ms de la séance précédente n'est pas reproduit ; on ne peut pas lui attribuer rétroactivement une cause certaine.

En première visite de Chambre 1, une frame longue de 64,5 ms contient 41,3 ms dans loop de plan3d.js, dont un render intérieur de 40,3 ms avec deux nouveaux programmes. Le onchange de la GUI représente 5,5 ms, dont 1,3 ms de mise en page forcée. Preuve : transitions-profile.json, septième relevé. Les autres transitions sont moins coûteuses après création des variantes.

Lors d'une reprise contrôlée, material-attribution.json identifie deux variantes MeshBasicMaterial avec map, opaque et transparente (7 et 7,2 ms de render). Les noms d'objets sont vides : ne pas attribuer arbitrairement ces matériaux à un meuble précis.

## Essai de préparation progressive

Compilation via compileAsync objet par objet pendant requestIdleCallback. Le premier essai GUI se trouvait encore en vue générale : warm-startup-inapplicable.json n'est pas une preuve d'amélioration des transitions intérieures. Les reprises program-keys*.json incluent l'ouverture initiale et doivent être distinguées d'une transition pièce à pièce.

Comparaison dédiée warm-ab.json, quatre passages alternés : ~59,9–60 i/s dans les deux cas. Maxima d'intervalle sans préparation 28,6 puis 20,6 ms ; avec préparation 20,0 puis 19,8 ms. Mais zéro nouveau programme pendant toutes ces transitions, et préparation supplémentaire ~1,24 s étalée sur 75 objets. Gain causal non démontré : expérience non intégrée.

## Essai de stabilité des ombres

Deux variantes dans un même banc, reconstruites à chaque passage : candidat actuel et copie expérimentale gardant les lumières capables de projeter des ombres, avec shadow.intensity=0/1 pour conserver l'effet voulu. Aucune réduction de géométrie, de texture ou de résolution. Cette expérience n'a pas reçu de recette visuelle exhaustive et n'est pas intégrée.

Ouverture de la villa, fenêtre de quatre secondes, surface de rendu plein viewport :

| Passage | Actuel | Expérience |
|---|---:|---:|
| Programmes finaux | 71 | 45 |
| FPS moyen 1 | 49,82 | 51,19 |
| FPS moyen 2 | 48,94 | 50,68 |
| Intervalle max 1 | 291,9 ms | 271,3 ms |
| Intervalle max 2 | 327,3 ms | 318,1 ms |

Les compilations liées aux variantes d'ombres sont confirmées, mais stabiliser ce nombre ne suffit pas : la compilation initiale des matériaux reste dominante. Les chiffres du banc plein écran ne sont pas directement comparables aux FPS dans la GUI complète. Source : shadow-ab.json. Prochaine piste justifiée : préparer les variantes réellement nécessaires à l'ouverture, sans bloquer le premier affichage ni déplacer la pause sur une interaction. Ne pas généraliser la précompilation de toutes les pièces sans nouvelle preuve.

## MutationObserver

Aucune reproduction de l'erreur initiale. Dernier chargement complet : 578 appels observe dans l'iframe, zéro cible invalide, zéro erreur capturée ; page principale zéro appel. Compteurs de chargements séparés : ne pas additionner les snapshots. Les sondes réémettent les exceptions, sans masquage.

Une erreur distincte de la sonde expérimentale a été observée : accès à activeRoom avant disponibilité du moteur dans validation-ui.js. Le garde de disponibilité a été ajouté à cette sonde uniquement. console.json peut conserver cette entrée historique du même onglet ; elle ne vient pas du code publié et ne constitue pas une reproduction de MutationObserver. final-observer.json est le contrôle du document après cette correction.

## Limites et décision

La cause d'au moins une saccade est maintenant attribuée à la compilation dans le renderer, indépendamment de MutationObserver. Les deux optimisations expérimentales ne sont pas suffisamment concluantes pour être retenues. Aucun changement de la GUI, C#, SIMPL ni du rendu livré. Build/lint non relancés : code produit inchangé dans cette séance. Le diagnostic global n'est pas déclaré résolu. Ne rien publier.
