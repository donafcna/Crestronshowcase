# Villa Stark — vérification du 25 novembre 2026

Base de publication : origin/main c520032b, copie isolée C:/dev/crestron/villa-stark-site. Les travaux locaux préexistants du showroom Nyon ne sont pas inclus.

## Vérifications effectuées
- Catalogue, build Vite et lint réussis. Avertissements préexistants ; aucun avertissement propre à Villa Stark après nettoyage.
- Navigation des huit rubriques dans les trois thèmes, captures Sombre / Clair élégant / Verre dépoli.
- Scénario Mon film : Apple TV affichée sur le cinéma, stores fermés, notification explicative.
- Store Salon : descente puis arrêt, position intermédiaire observée à 52 %.
- Je pars puis intrusion : état ALARME ; réinitialisation puis visiteur et réponse : EN LIGNE.
- Smartphone 440×956 : page Musique sans commande hors écran, aucun débordement horizontal, cibles de cette page ≥44 px. Accueil et huit rubriques parcourus ; le tableau musical initial a été remplacé par des cartes après détection de boutons hors écran.
- Intégration dans Résidentiel et fiche FR ; contenus de fiche également fournis en EN/DE. Commandes de démonstration en français dans toutes les langues du site.
- Aucune erreur JavaScript constatée dans les journaux du navigateur pendant les essais finaux. Pas d’audio ni de transport matériel.

## Présentations et limites
- Projet concept, présentation immersive intégrée : pas de deuxième châssis autour de la scène qui contient déjà sa dalle. Le châssis de démonstration original reste visible dans la scène. Les modes de dimension physique des autres projets ne s’appliquent donc pas.
- Bouton Agrandir les commandes pour isoler la dalle sur ordinateur. Sur petit écran, villa et commandes empilées avec défilement vertical volontaire ; ce choix remplace l’absence de défilement des GUI matérielles pour cette démo web.
- Les palettes de texte et surfaces sont renforcées ; cette recette ne constitue pas un audit WCAG exhaustif de chaque état translucide ou de la photo de fond.
- La comparaison montre la référence publique au-dessus, Villa Stark au-dessous. Les captures sont des observations de cette session, pas des résultats matériels.
- Médias et code de la démonstration Home Tech Supervision / NG Integration repris à la demande de Donatien ; origine documentée dans public/showcases/villa-stark/SOURCE.md.
