# Hotel des Horlogers — végétation et caméra, publication du 23 novembre 2026

Publication des arbres/végétation explicitement autorisée, puis demande de transitions progressives entre pièces. Livraison isolée depuis origin/main a0b6719 ; trois fichiers applicatifs de l’hôtel uniquement, avec documentation et preuves.

Caméra : les pièces de départ et de destination restent visibles pendant le déplacement. Le centre visé, la distance et les angles partent de l’état courant ; une sélection rapide redirige le trajet depuis cette position. L’angle emprunte le chemin court, la rotation automatique est suspendue pendant le trajet, le glisser interrompt le mouvement. Les mises à jour de cadrage conservent la finalisation du trajet. Vue générale/pièce : conservation de la distance physique malgré le facteur de cadrage du fond. Nettoyage des pièces à l’arrivée. Les ombres sont recalculées au départ et à la fin du trajet, jamais à chaque image ; deux pièces peuvent donc être rendues ensemble pendant le trajet. Retour à la pièce isolée ensuite.

Preuve A/B (camera-continuity.json) : l’ancienne version cachait le Bar dès la sélection du Restaurant ; nouvelle version garde Bar + Restaurant pendant le trajet. Saut d’entrée depuis la vue générale : ~59,18 m auparavant, premier déplacement continu ~0,00094 m après correction. Position identique au moment de la commande ; première image inter-pièces ~0,000056 m de déplacement, puis arrivée sur Restaurant et redirection rapide vers Wellness contrôlées. Test avec horloge explicitement pausée pour éviter les écarts entre deux lectures.

Végétation : cent arbres, deux types de conifères et vingt feuillus ; buissons et proportions variés. Rapport et comparaison joints. La nuit, la suppression de brume et tous les détails ruraux déjà publiés sont conservés. Aucun matériel ou programme CH5 modifié.

## Vérification de la fluidité

Banc A/B/B/A dédié inter-pièces, 1440 × 900 DPR1,6 : Bar → Restaurant → Wellness → Séminaire → Entrée, ~59,89 avant et 59,60/59,89 après ; p95 16,9–17,3 ms, une image >33,4 ms sur un passage après, aucune sur les autres passages. Vue générale/Bar : ~59,89 avant/après sans image >33,4 ms. Mesures locales, pas une garantie de cadence sur tous les appareils. Les rapports de végétation détaillent le coût : +800 triangles et deux appels, sans nouvelle lumière ni texture.

## Vérification fonctionnelle

Build/lint réussis avec avertissements hérités. 37 contrôles trois thèmes × normal/Scène, sept espaces, cadrage et commandes, sans erreur. Test de continuité sur le build exact, puis Restaurant et Bar dans l’application complète ; les scripts sont réexécutés en production après déploiement. Les images travelling montrent le trajet en cours. Les JSON de publication sont actualisés après le contrôle public.
