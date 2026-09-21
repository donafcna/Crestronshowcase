# TSW HTML/CSS et circulations Sunrays — 20 septembre 2026

Demande reprise de la conversation « Maquette 3D bijouterie » : conserver la TSW-1070 en HTML/CSS et ajouter les passages bâbord/tribord de l'arrière à l'avant sur les cinq ponts du yacht.

## Réalisation

- TSW (`wallpanel`, `wallpanel_hd`) : aucun chargement du modèle ni de Three.js, même avec un paramètre `background=1`. Niveaux, espaces, pagination de six cartes, sélection bidirectionnelle liste/cartes et affichage du niveau moyen des circuits. Scènes, circuits, musique et ambiances restent disponibles. Signal `gui-ready` indépendant de WebGL.
- Smartphone showcase : fond 3D et commandes synchronisées conservés ; tablette et démo iPhone autonome conservent le modèle intégré.
- Sunrays : dix passages continus de 1,05 m dans les coupes conceptuelles (deux par pont), balisage, sols et bordures. Recul proportionnel des pièces et du mobilier, pavillons extérieurs resserrés. Les passages canoniques sont exportés une seule fois en glTF ; les copies de présentation extérieures sont exclues.
- Fiches FR/EN/DE et captures du site actualisées. Source GUI CH5, C# et SIMPL non modifiés.

## Vérification de cette session

- `npm run build` réussi ; `npm run lint` réussi avec avertissements préexistants.
- `test-luxury-panels-passages.mjs` : 214 contrôles réussis. Deux projets × trois formats (1280×800, 1920×1200, 1024×640) × trois thèmes × quatre onglets et état Circuits ; contraste texte ≥4:1, cibles ≥40 px, absence de débordement. Sélection d'un espace en deuxième page, changement de circuit et scène globale vérifiés.
- Dix passages contrôlés par intersection des volumes des pièces/meubles avec la bande de circulation jusqu'à 1,9 m au-dessus du sol. Cette mesure porte sur les coupes ; ce n'est pas une validation navale de la coque extérieure.
- Export glTF exécuté, dix nœuds de passages canoniques présents. Cinq ponts et extérieur capturés.
- `test-luxury-background.mjs` : 43 contrôles, 50 états, trois thèmes et modes normal/Scène, synchronisation sélection/éclairage, molette, changement de support et démo téléphone autonome ; aucune exception JavaScript.
- Chromium 153 avec rendu logiciel. Aucun essai sur TSW ou iPhone physique. Les interfaces restent des démonstrations locales, sans équipement connecté.

## Preuves

- [Comparaison des dalles, thèmes en colonnes](comparaison-panneaux.png)
- [Comparaison des passages](comparaison-passages.png)
- `panels-passages.json`, `smartphone-background.json`, `build.log`, `lint.log`
- `yacht-pont-0.png` à `yacht-pont-4.png`, `yacht-exterieur.png`

Point de départ distant : `d33f4b7c45438a4229774d69a6220b00219fcd11`. Publication explicitement autorisée par Donatien (« oui go ») après le contrôle automatique initial. Ces résultats concernent les fichiers testés localement ; le statut Vercel sera vérifié après publication.
