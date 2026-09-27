# Boutique, Restaurant et Yacht — entrée de démonstration

Demande du 27 septembre 2026 : démarrer Boutique après 3 secondes au lieu de 5, puis presser la première scène 1 seconde après la première zone ; suite inchangée. Extension demandée à Restaurant, puis même séquence pour Yacht.

- Entrée des trois projets : délai initial 3000 ms. L'interface doit également être prête ; un chargement lent peut retarder l'arrivée du curseur, mais ne déclenche pas de commandes dans un GUI indisponible.
- Première zone → première scène : 1000 ms entre les pressions, déplacement du curseur compris. Pas 1 seconde de pause PLUS un déplacement supplémentaire.
- Actions suivantes : cadence 5000 ms conservée, y compris la scène suivante et les changements de zone. Priorité manuelle et délai de reprise existant conservés.
- Boutique : Hall puis autres salons, Rendez-vous privé → Réception → Ouverture ; fin en vue globale / Fermeture.
- Restaurant : quinze pavillons, Dîner → Rooftop → Accueil ; fin Extérieur / Fermeture générale.
- Yacht : même parcours lumineux sur les 37 zones du catalogue, à partir du Beach club ; Sunset → Dîner à bord → Croisière, puis vue globale / Nuit. Remplace son ancien parcours court lumière/audio. Aucun démarrage de son.

Les presets du curseur sont programmatiques et ne passent pas l'extérieur en Manuel. Le moteur jour/nuit du yacht, la géométrie, les caméras, la molette et les interfaces graphiques ne sont pas modifiés. À la base cba3e83e, le cycle est **30 s jour / 30 s nuit**, suivant la décision ultérieure du 26/09 ; ne pas lui substituer l'ancien réglage 10/10. Villa Crans et Hotel Brassus inchangés.

## Vérification

12 tests unitaires : délais communs, trois parcours complets utilisant les vrais catalogues, ordre des scènes, première seconde, intervalles suivants de cinq secondes, annulation, sélecteur absent, cible reconstruite par une scène et absence de rafale de rattrapage.

Banc Chromium : véritables clics dans le menu et mesure des événements des interfaces ; Boutique/Yacht dans les trois thèmes, Restaurant avec sa présentation existante ; Mode normal et Mode Scène, arrêt sur action réelle, Auto extérieur conservé. Rapport et captures dans `guided-entry-review`. Densité de pixels réduite sur serveur CPU ; pas de mesure des performances du laptop. Les résultats des workflows doivent être consultés avant toute déclaration de réussite.

Publication par main → Vercel après revue du diff et recette ciblée. Le workflow main rejoue les trois entrées sur le domaine public. Aucun programme matériel CH5/C#/SIMPL ni fichier Windows non synchronisé touché. Ce changement de comportement n'ajoute pas d'écran ou de design à documenter dans les fiches commerciales.
