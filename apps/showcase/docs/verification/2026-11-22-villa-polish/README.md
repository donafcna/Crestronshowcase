# Villa FTV — candidat 2.3.16, avant/après 2.3.15

Comparaison locale du 22 novembre 2026, aucune publication.

## Corrections
- Blancs des murs, équipements, tissus et pierre adoucis par matériaux propres aux six pièces ; exposition générale inchangée.
- Golf : projecteur au-dessus de l’écran, rampe et suspension latérales ; le modèle de parcours affiché reste inchangé.
- Pool House / piscine : couronnes sphériques remplacées par feuilles pliées avec tiges, 160 triangles contre 352 par couronne. Les arbres du paysage et les autres plantes ne sont pas remplacés.
- Pas de texture, lumière ou boucle d’animation supplémentaire. Matériaux regroupés avant rendu.

## Fluidité
Banc navigateur local, 1280 × 720, DPR 1,5. Compteur réel des images rendues, transition 1,6 s, fondu 3,2 s, stabilisé 1,2 s. Une série de six pièces avant puis après ; les résultats ne garantissent pas la cadence sur chaque périphérique.

| Pièce | Transition avant → après (i/s) | Fondu avant → après | Stabilisé avant → après | Appels avant → après | Triangles avant → après |
|---|---:|---:|---:|---:|---:|
| 11 | 58.68 → 58.06 | 60.15 → 60.13 | 59.91 → 59.91 | 65 → 65 | 196732 → 196156 |
| 12 | 59.99 → 59.95 | 59.90 → 59.89 | 59.86 → 59.85 | 69 → 69 | 198662 → 198470 |
| 13 | 58.03 → 56.84 | 59.89 → 59.89 | 59.93 → 59.89 | 73 → 73 | 197288 → 197288 |
| 15 | 59.94 → 59.93 | 59.88 → 59.88 | 59.89 → 59.92 | 73 → 73 | 215710 → 215710 |
| 16 | 59.94 → 59.95 | 59.89 → 55.56 | 59.92 → 59.91 | 77 → 77 | 195206 → 195206 |
| 17 | 59.94 → 59.96 | 59.89 → 59.88 | 59.87 → 59.93 | 71 → 71 | 199092 → 199092 |

Le premier fondu du golf après modification a enregistré une pause isolée de 249,9 ms (moyenne 55,56 i/s). Contrôle supplémentaire A/B/B/A conservé dans golf-repeat.json : fondus entre 59,81 et 59,90 i/s, pause maximale 21,8 ms. La pause initiale n’a pas été reproduite ; sa cause n’est pas établie. Les transitions à froid de cette répétition restent entre 56,62 et 59,15 i/s, avant/après se recouvrant. Aucune accélération revendiquée. Nombre de textures conservé pour chaque paire.

## Vérifications
- Build de production et lint réussis (avertissements existants du dépôt conservés dans test-results/villa-polish-lint.log).
- Syntaxe JavaScript des trois modules modifiés valide.
- Attributs de toutes les géométries finis, attributs couleur présents : aucune anomalie.
- Six captures avant/après à caméra, niveau 70 % et heure identiques. Phase des vagues non figée.
- Intégration Smartphone : golf contrôlé en Sombre, Clair et Verre, Mode normal et Mode Scène ; aucune erreur console observée. Le projecteur ne masque plus l’image.
- GUI, pages/modalités non modifiées : pas de nouvelle recette exhaustive des contrôles ni des périphériques physiques. Aucune vérification TSW/iOS physique.

Ouvrir comparison.html, ou http://127.0.0.1:4336/villa-polish/comparison.html pendant que le serveur local fonctionne. Banc interactif : /verify-villa-polish.html. Les captures de la version précédente sont conservées dans ../2026-11-22-villa-special/.
