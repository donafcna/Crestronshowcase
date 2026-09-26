# Auditorium Richmond — recette 2.1.7

Recette locale du 26 septembre 2026 sur Microsoft Edge, route Smartphone et décor 3D.

- Build Vite réussi et catalogue valide : 19 projets, 17 simulateurs, 8 secteurs.
- Lint réussi, avec les avertissements préexistants du dépôt.
- Page Caméras : absence de la carte Captation, bouton REC intégré, image d'estrade présente.
- Pan droite : transformation de `translate(0px, 0px)` à `translate(-5.5px, 0px)` ; Centre revient à l'origine.
- Page Écran : les quatre sources exposent `pc_lectern`, `regie_hdmi`, `cam_feed` et `logo` avec un rendu distinct. HDMI régie affiche une présentatrice fictive du journal de 20 h ; Logo reprend l'asset officiel Fréquence TV. Les deux visuels sont également reportés sur la texture du mur LED 3D.
- Modèle 3D : 16 bandeaux LED, 15 luminaires ponctuels et 15 faisceaux.
- Fondu Débat : actif à 0,15 s, intermédiaire à 2,16 s et terminé à 4,37 s sur la consigne exacte.
- Aucun message d'erreur JavaScript pendant la recette.
- Écran GUI 440 × 863 : aucune largeur ou hauteur défilante.
- Batterie générale : 39/43. Les quatre échecs préexistants concernent uniquement l'écart du profil de qualification `1.0.196` avec la configuration `1.0.201` ; aucun fichier de qualification n'a été modifié.

Les captures `03-cameras-ptz.png` et `06-mur-led.png` documentent les deux écrans Smartphone mis à jour.
