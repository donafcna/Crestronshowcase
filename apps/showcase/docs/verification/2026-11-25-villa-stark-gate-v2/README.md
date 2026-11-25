# Villa Stark 2.3.20 — portail photographique

Le passage SVG en aplats et la compression horizontale du vantail donnaient un rendu artificiel. Remplacement par un passage photographique généré à partir de la même vue et limité à l'ouverture entre les piliers. Le décor d'origine reste fixe ; le vantail texturé pivote en perspective sur sa charnière, avec accélération et décélération progressives (3,2 s).

Contrôles locaux réalisés dans Chrome : ouverture par les deux commandes de l'interphone, état à mi-course (−41°, EN OUVERTURE), état ouvert (−88°, OUVERT), fermeture automatique puis retour à FERMÉ. Contrôle visuel à mi-course et ouvert, en paysage et à 440 × 863 pour smartphone ; calque et photographie alignés. Aucune erreur console capturée. Build et lint réussis (avertissements historiques du dépôt).

Captures : `before.png` fournie par Donatien, `opening.png`, `open.png`, `phone-open.png`. Comparaison : `comparison.html`. Génération et provenance : `PROMPT.md`, manifeste des assets.

Limite : animation photographique composée pour cette caméra fixe, pas une vidéo réelle ni une simulation physique complète. La matrice exhaustive des autres pages et modales n'a pas été répétée pour cette correction locale.
