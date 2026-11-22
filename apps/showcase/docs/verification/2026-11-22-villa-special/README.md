# Villa FTV — six espaces spécialisés, candidat 2.3.15

Candidat local du 22 novembre 2026, fond 3D uniquement. Référence publiée : a6c3cb209f60913c769dc698d4f8bbe608aef918. Aucun commit, push, déploiement Vercel ou matériel pour ce lot.

[Comparaison des six espaces](comparison.html) — même caméra, ambiance de jour fixe et cinq circuits à 70 %, après 3,5 secondes de stabilisation. Les vaguelettes restent animées.

## Modifications visuelles

- Pool House : dossier rembourré et serviettes tissées, accoudoirs, pieds et assemblages de pergola.
- Piscine : margelles rehaussées au-dessus des vagues, joints, drain périphérique, échelle et nuances de profondeur sur la grille d’eau existante.
- Sauna/hammam : bois adouci, dossiers/piétements des bancs, linge, grain et joints de mosaïque, ombres de contact.
- Garage : peinture et métaux, traits de carrosserie et ventilation, tiroirs d’atelier, ombres sous les véhicules.
- Golf : bandes de gazon, tapis de frappe, habillage latéral de l’écran, poignées/têtes de clubs.
- Local technique : sol minéral, montants des racks, brassage, aérations, chemin de câbles.

## Fluidité mesurée

Navigateur intégré visible, viewport 1280 × 720, DPR rendu ~1, limite 60 images/s. Compteur des images réellement rendues divisé par le temps écoulé ; pas de conversion du compteur interne medianMs en FPS. Navigation échantillonnée pendant 1,6 s (mouvement effectif confirmé), allumage pendant 3,2 s, stabilisé pendant 1,2 s. Référence conservant les améliorations de mobilier publiées ; seule l’option specialFinish est basculée. Dernière série après correction du cadrage du banc :

| Espace | Transition, i/s avant → après | Fondu, i/s avant → après | Stabilisé, i/s avant → après | Appels de dessin | Triangles |
|---|---:|---:|---:|---:|---:|
| Pool House | 57.9 → 57.9 | 60.2 → 60.1 | 59.9 → 59.9 | 64 → 65 | 192296 → 196732 |
| Piscine & Spa | 59.9 → 59.9 | 59.9 → 59.9 | 59.9 → 59.9 | 68 → 69 | 194634 → 198662 |
| Sauna & Hammam | 57.4 → 58.0 | 59.9 → 59.9 | 59.8 → 59.9 | 72 → 73 | 195892 → 197288 |
| Garage & Ateliers | 60.0 → 59.9 | 59.9 → 59.9 | 59.9 → 59.9 | 73 → 73 | 211570 → 215710 |
| Simulateur de golf | 59.9 → 60.0 | 59.9 → 59.9 | 59.9 → 59.9 | 76 → 77 | 191646 → 195206 |
| Local technique | 59.9 → 59.9 | 59.9 → 59.9 | 59.9 → 59.9 | 71 → 71 | 193660 → 199092 |

Pas de baisse systématique observée dans cette série. Aucune lumière ni texture GPU nouvelle ; zéro ou un appel supplémentaire par vue. Géométrie supplémentaire statique, fusionnée par matériau ; aucune nouvelle boucle d’animation. Mesure locale, pas une garantie sur tous les téléphones/GPU.

## Vérifications et corrections

Build et lint réussis (avertissements hérités ; contrôle ciblé des nouveaux modules sans avertissement). Contrôle de tous les attributs géométriques sur les 17 pièces. La dernière série de mesure a révélé une couleur non finie sur des coussins très fins : arrondi flottant donnant une hauteur légèrement négative avant une racine carrée. Hauteur bornée à [0,1], puis contrôle final sans anomalie dans geometry-final.json et captures renouvelées. Ce correctif concerne uniquement la préparation des couleurs au chargement, sans modifier les triangles, shaders ou boucles de rendu mesurés.

Intégration : six pièces parcourues via le GUI Smartphone ; trois thèmes Sombre/Clair/Verre et modes normal/Scène contrôlés sur le local technique. Aucune erreur ou alerte console relevée. Dalle/tablette : non applicables au fond 3D (vidéo de fond conservée). Contrastes et cibles du GUI non modifiés, pas de nouvelle recette exhaustive des modales ou du CH5.

## Traçabilité et limites

performance.json et sauna-performance.json conservent les premières séries de diagnostic, dont une entrée froide à 46,8 i/s lors des reconstructions répétées. Le sauna a ensuite perdu une subdivision de dalle cachée et une partie du maillage de contact. Un défaut du banc conservait l’aspect de caméra initial lors des reconstructions ; il a été corrigé en réinitialisant les dimensions du canvas. La série final-performance.json utilise le cadrage corrigé. Son statut complete indique la fin de mesure ; son contrôle attributs false a été résolu ensuite comme indiqué ci-dessus. Ne pas présenter les séries de diagnostic comme un gain de vitesse.

Les performances en production et sur TSW/téléphone physique ne sont pas mesurées ici. L’eau garde ses vagues existantes : teinte de profondeur précalculée, pas de réfraction ou réflexion temps réel supplémentaire. Validation visuelle demandée avant publication.
