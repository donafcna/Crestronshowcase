# Vocabulaire figé — Crestron CH5 Cowork

Référence fournie par Donatien le 16 septembre 2026, à partir de sa réponse Claude, puis explicitement confirmée pour les instructions du projet. Périmètre : site vitrine `https://crestrongui.vercel.app/`.

## Mode normal

La page du site telle qu'on l'ouvre : bandeau des projets en haut, colonne de droite (QR code, Fiche PDF, choix du support, légende), châssis au centre.

Le châssis est affiché à sa taille réelle de référence quand la fenêtre le permet, avec le badge « Taille réelle » seul ; sinon il est réduit et le badge indique « réduit à N % ». Pas de bouton Responsive dans ce mode.

## Mode Scène

Déclenché par le bouton d'angle du châssis (le « bouton Scène », flèches en diagonale). Le châssis est agrandi au maximum, la colonne de droite est conservée. C'est le seul mode où existe le sélecteur **Taille réelle / Responsive**.

## Plein écran

Bouton de la barre d'outils : la GUI brute s'ouvre seule dans un nouvel onglet, sans châssis ni colonnes. **Réservé à la dalle et à la tablette, jamais au smartphone.**

Par l'adresse : `/3` = GUI seule plein écran, `/4` = retour au Mode normal (Échap aussi), sur le modèle de `/1` et `/0` du Mode Dev.

## Plein écran navigateur (F11)

Simplement le navigateur en plein écran, rien de spécifique au site. Ne pas confondre ce mode avec Mode Scène ou Plein écran de la GUI.

## Taille réelle et Responsive

- **Taille réelle** = dimensions physiques calibrées de l'appareil : convention CSS 96 dpi ; calibrage à la carte bancaire mémorisé par navigateur, proposé dans le Mode Scène et le bandeau Dev.
- **Responsive** = le châssis remplit l'espace disponible.

## Châssis de référence

- TSW-1070 10,1 pouces, 1920 × 1200.
- iPad (A16) 11 pouces.
- iPhone 16 Pro.

## Mode Dev

Activation/désactivation par `/1` ou `/0` en fin d'adresse, `?dev=1`, Ctrl+Alt+D ou clic sur le badge. Bandeau de mesures superposé à la barre des projets, règle de contrôle 100 mm, fichier `retours.json` pour les lots de défauts.

## Distinction avec l'état du code

Les définitions ci-dessus font référence pour les échanges et les instructions. Lors de la reprise du 16 septembre, le code local avait `showEmbedTool=false` : le bouton Plein écran y était masqué. Cette observation ne remplace pas la définition de Donatien et n'autorise pas à modifier le site pour la rétablir. L'enregistrement du vocabulaire ne constitue pas une recette du comportement de chaque mode.
