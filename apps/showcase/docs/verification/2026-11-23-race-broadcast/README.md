# Course automobile 3D — candidat 2.3.17

23 novembre 2026. Choix confirmé par Donatien : refaire l’animation 3D avec caméra de retransmission, voitures et circuit plus crédibles. Candidat local uniquement, aucune publication.

## Changement
Nouveau module tv-race.js, circuit asymétrique, volumes de carrosserie arrondis, cockpit/pilote, ailerons, roues et jantes ; asphalte procédural et ombres de contact. Caméra de suivi basse et aérienne, changement de plan toutes les 12 s. Un rendu 640 × 360 commun aux écrans existants, cadence TV existante conservée. Pas de son, vidéo externe, passe d’ombres dynamiques ni nouveau contexte WebGL.

La caméra a été placée dans l’intérieur du circuit après détection d’une collision avec les stands depuis le premier emplacement. Captures à 0, 6, 12, 18, 24, 30, 36, 42 s. Le rendu reste une scène 3D simplifiée, pas du photoréalisme vidéo.

Le programme automobile partagé du moteur est modifié ; football, tennis et film restent sur leur construction précédente. Option raceBroadcast:false pour comparaison avant/après ; défaut activé. Aucun fichier GUI, join ou programme matériel changé.

## Coût du programme TV isolé
Banc A/B/B/A, 1280 × 800, DPR 1,5. Au cadrage comparé : 118 → 14 appels de dessin, 45 756 → 18 734 triangles. Les valeurs varient avec les objets visibles. Textures GPU 2 → 3 (cible comprise), canevas procéduraux 128² et 64². Cadence du banc limitée à 15 images/s, observée 14,8–15,3. Les temps submitMedianMs mesurent la soumission CPU, pas la durée GPU. Aucun gain de cadence globale ne peut en être déduit.

## Villa complète, course active
Compteur réel renderedFrames, même Home Cinéma, journée fixe, 1280 × 800. Alternance A/B/B/A ; chaque série inclut transition, fondu de 3 secondes et vue stabilisée. tv3D.currentKind=race confirmé.

| Version | Transition i/s | Fondu i/s | Stabilisé i/s |
|---|---:|---:|---:|
| Avant | 55.73 | 59.90 | 59.86 |
| Après | 54.21 | 59.89 | 59.83 |
| Après | 55.48 | 59.92 | 59.82 |
| Avant | 56.16 | 59.96 | 58.82 |

Les premières transitions après changement sont légèrement plus lentes (54,2–55,5 contre 55,7–56,2), sans recul observé sur les fondus/stabilisé (~60). Pas de promesse de cadence sur tous les appareils. Les captures/mesures ne remplacent pas une recette physique TSW/iPhone.

## Vérifications
Build et lint réussis (avertissements du dépôt conservés dans test-results/race-lint.log), syntaxe JS vérifiée. Banc villa : aucune erreur, attributs géométriques finis et couleur complète. Dans le vrai simulateur local : source SKY Q, commandes pause/lecture exercées, captures Sombre/Clair/Verre en Mode normal et Mode Scène. Sources film/football/tennis également ouvertes ; aucune erreur console recueillie. Pas de nouvelle recette exhaustive des GUI non modifiés. Le script test-tv-stadiums.cjs a été adapté au nouveau contrat de métriques automobile, mais pas exécuté via son lanceur navigateur externe ; contrôles réalisés dans le navigateur intégré.

Comparaison : http://127.0.0.1:4341/race-comparison/comparison.html
Animation interactive : http://127.0.0.1:4341/verify-race-broadcast.html
Preuves brutes : stage-performance.json, room-performance.json, console.json, captures d’angles et d’intégration.
