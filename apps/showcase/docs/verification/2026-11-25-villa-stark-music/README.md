# Villa Stark 2.3.21 — musique simplifiée

Le tableau de dix pièces et 70 boutons devient un lecteur de six boutons pour la pièce sélectionnée : quatre sources (Spotify, Radio, TV, AirPlay), Arrêter et Couper/Rétablir le son. Le volume utilise un seul curseur. Les dix pièces sont accessibles par un sélecteur natif accessible au clavier ; les réglages restent indépendants par pièce.

Changer la pièce sélectionnée ouvre son intérieur en fond sans quitter la page Musique. Un changement de source rétablit le son ; Arrêter ne touche qu'à la pièce courante. Aucun son réel n'est émis.

## Vérifications de cette session

- Spotify SALON à 99 %, Radio CUISINE avec son coupé ; aller-retour entre les pièces : états conservés.
- Arrêter SALON laisse Radio CUISINE avec son coupé.
- Sélection CUISINE dans le GUI : fond CUISINE et page MUSIQUE maintenue.
- Quatre supports × trois thèmes × normal/Scène : 24 contrôles sans débordement, sans défilement de page, six boutons. Les douze premiers éléments de checks.json correspondent au mode normal.
- Build et lint réussis ; aucune erreur console capturée sur le parcours.
- Portail photographique de 2.3.20 confirmé sur le site public avant publication de ce lot.

La recette porte sur la page Musique modifiée. Les autres pages, les contrastes exhaustifs et tous les modes Taille réelle/Responsive n'ont pas été retestés. Avant/après : comparison.html.
