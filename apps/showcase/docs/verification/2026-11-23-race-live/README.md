# Vérification publiée — programme automobile — 23 novembre 2026

## TV sur le site public
Adresse : https://crestrongui.vercel.app/interfaces/residentiel/villa-gemini-frequencetv/phone
11 pièces équipées contrôlées par sélection de la pièce puis SKY Q : Salon, Cuisine, Salle à manger, Suite parentale, Chambres 1/2/3, Bureau, Home Cinéma, Suite invités, Bar & Lounge. La course est visible dans toutes les captures room-*.jpg, avec voitures, circuit et décors de la nouvelle version. Les détails des textures restent plus lisibles sur le grand écran du Home Cinéma ; les petites TV ne permettent pas de distinguer chaque grain à ce cadrage. OFF puis TOTAL commandés dans le GUI du Home Cinéma : l'écran reste allumé et la course continue. Aucun écran masqué ou noir constaté.

Les six autres pièces n'ont pas cette TV de programme dans le modèle : Pool House (terrasse id11), Piscine & Spa, Sauna & Hammam, Garage & Ateliers, Simulateur de golf, Local technique. L'écran de golf est une autre animation, non une TV de la course.

## Mesure instrumentée distincte
Le site public n'expose pas de compteur FPS dans le DOM. Relais local 127.0.0.1:4343 : tous les fichiers demandés sont récupérés depuis Vercel, sans reconstruction locale ; seule une sonde est ajoutée à la page HTML pour compter les images réellement rendues. Chromium intégré, viewport 1280×800, DPR indiqué dans performance.json. Le comptage inclut le moteur de fond et le site complet. Navigation et niveaux sont exercés via l'API 3D exposée. Cela ne constitue pas une mesure d'un iPhone physique, de la TSW, ni du temps réseau Vercel.

Une première campagne était perturbée par la démonstration automatique (programmes film/tennis). Elle est conservée comme invalide pour l'évaluation de la course. Campagne retenue : pause de démonstration déclenchée par clic navigateur, rafraîchie pendant la mesure, moteur stabilisé ; chaque pièce confirme programme race et matériaux textured. Phases : transition 1,6 s, extinction 2,2 s, allumage 2,2 s. Résultats dans performance.json.

## Console et limites
console-live.json contient une erreur MutationObserver au chargement (observe reçoit une cible non Node), sans URL/stack permettant de l'attribuer. Non reproduite dans la sonde instrumentée ; aucun blocage TV constaté. Ne pas déclarer une console parfaitement vierge. Aucun correctif ou déploiement réalisé dans cette session de contrôle.

production-assets.json confirme HTTP 200 et identité avec les fichiers validés pour les quatre modules et la configuration. Preuves du site public : captures ; preuves de performance : rapport distinct via relais. Les métriques anciennes ne sont pas réutilisées.

## Résultats instrumentés (images/s)

| Pièce ID | Transition | Extinction | Allumage |
|---|---:|---:|---:|
| 1 | 60.3 | 59.8 | 59.9 |
| 2 | 59.9 | 59.9 | 58.9 |
| 3 | 59.7 | 60.2 | 59.9 |
| 4 | 59.9 | 59.8 | 59.9 |
| 5 | 52.2 | 55.8 | 59.8 |
| 6 | 58.7 | 59.9 | 59.9 |
| 7 | 59.9 | 59.9 | 59.9 |
| 8 | 59.9 | 59.9 | 60.0 |
| 9 | 59.7 | 59.8 | 59.9 |
| 10 | 59.8 | 59.9 | 59.9 |
| 14 | 59.9 | 59.9 | 59.8 |

Contre-test ciblé : Chambre 1 en transition 56,8 puis 60,0 i/s ; fondus 59,9 i/s. Suite parentale 53,7 i/s lors de la première transition du contre-test. Variabilité ponctuelle de navigation confirmée ; ne pas garantir 60 i/s constants. Aucun changement de programme dans les campagnes retenues, aucune erreur de la sonde.
