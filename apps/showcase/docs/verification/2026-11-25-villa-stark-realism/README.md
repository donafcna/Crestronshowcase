# Villa Stark — 25 novembre 2026 — version 2.3.24

- TV : arrêt transparent pour conserver la TV photographiée ; projection du contenu Villa FTV par homographie sur les quatre coins de l'écran salon / cinéma. Capture locale : tv-perspective.png.
- Stores : deux couches indépendantes par pièce (bateau / blackout), arrêt testé à 30 %, positions identiques sur GUI et fond ; aucune commande de store au cinéma sans baie visible. Masque SVG sans déformation de ratio implicite.
- Éclairage : la photo ne change plus de filtre global ; chaque circuit agit sur des sources et des retombées localisées. Les dix pièces et les libellés de leurs faders ont été parcourus. Le RGBW reste réservé à la piscine.
- Recette : 4 châssis × 3 thèmes à 1280 × 800, deux cartes contenues dans leur espace dans les 12 cas. Contrôle TV à 1920 × 1080. Build et lint réussis (avertissements préexistants, aucune erreur).

Limites : rendu composé sur photographie, et non simulation photométrique 3D. Les occultations de mobilier utilisent des silhouettes manuelles ; les effets lumineux restent une approximation visuelle. Les outils latéraux peuvent recouvrir une partie du décor suivant la taille de la fenêtre.
