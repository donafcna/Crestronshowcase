# Transitions et MutationObserver — 23 novembre 2026

## MutationObserver : non reproduit, non déclaré corrigé
Trois chargements de la page publiée via relais instrumenté. Sonde placée au début du head de chaque document HTML, iframe comprise : intercepte les appels invalides à observe, conserve cible/readyState/stack, et les événements error. Zéro événement et zéro erreur navigateur lors des contrôles. Audit des observateurs propres au projet : cibles gardées ou attente DOMContentLoaded ; pas de source fautive confirmée. L'erreur isolée du contrôle précédent n'a ni URL ni stack. Ne pas lui attribuer une cause inventée, ni supprimer globalement les erreurs des observateurs. Aucun patch GUI ou bibliothèque CH5 appliqué.

## Optimisation locale 2.3.19, non publiée
Option visibleRoomMatrices activée uniquement dans la configuration 3D Villa. Mise à jour des branches visibles de la scène intérieure avant rendu, au lieu de recalculer les matrices de toutes les pièces masquées. Les autres projets gardent leur chemin existant. Ombres, géométrie, matériaux, nombre de triangles, animations et résolution ne sont pas réduits.

Matrices : comparaison aux mises à jour exhaustives forcées sur Salon, Suite parentale, Chambre 1, Home Cinéma et Suite invités, TV déployées et rideaux fermés : zéro matrice visible différente. 1191 objets parcourus avant, 73–96 après. Coût CPU isolé de cette étape : 0,084–0,229 ms avant ; 0,004–0,018 ms après (80 répétitions par cas ; micro-mesure, pas le coût total de l'image).

## Fluidité : gain global non démontré
Comparaison A/B/B/A, trois pièces, même machine et viewport 809×613 DPR1,5, 12 passages. Avant : transitions 57,4–60,1 i/s. Après : 49,9–60,2 i/s, avec baisse sur le premier passage de Suite parentale, 56,8 au second. Fondus autour de 60 dans les deux cas. Cette optimisation économise du CPU, mais ne démontre pas la réduction des baisses de cadence ; elle ne doit pas être publiée comme une correction garantie de ces baisses. Variabilité et coûts de première activation restent à profiler.

## Recette
Build et lint réussis (avertissements existants). Aucune erreur dans les campagnes. Géométries finies et attributs complets. Six captures GUI local : trois thèmes × normal/Scène, suite et TV escamotable visibles. Aucun changement au DOM GUI ; contraste et cibles inchangés. Matériel et autres projets non déployés. Rapports performance.json, matrices.json, observer-diagnostic.json et console-candidate.json.
