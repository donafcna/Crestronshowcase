# Lumière projetée par circuit — 27 novembre 2026

Version 2.3.35. Neuf pièces en complément du salon déjà corrigé : salle à manger, cuisine, bureau, cinéma, fitness, entrée, suite parentale, chambre amis et piscine.

18 références photographiques séparées par circuit, générées avec image_gen. Le moteur conserve la photo originale et en module uniquement la transmission lumineuse, à partir des rapports d'éclairement lissés. Contributions additives, limitées à un plancher ambiant pour éviter les aplats noirs dans les zones de recouvrement. À 100/100, transmission neutre, photo originale. Découpes des surfaces pour protéger les vitrages, écrans, bougies et pièces voisines. Cartes 836 × 471 recalées dans le repère photo 1672 × 941 ; pas de déplacement d'objet ni de substitution de texture.

## Vérification des circuits

Pour chaque pièce, actions via les commandes réelles du navigateur : 100/100, 100/0, 0/100, 0/0, 50/50. Captures et états enregistrés dans checks.json. Suppression de l'ancien double traitement des halos d'appliques du cinéma et des traits d'escalier. Halos synthétiques de radiance désactivés ; les luminaires précis du moteur existant restent synchronisés. Un spot de salle à manger manquant au repérage est ajouté.

## Vérification des formats

Écran éclairage de l'entrée, à 50/50, sur smartphone, tablette, TSW et XPanel, dans les trois thèmes : aucune erreur console ni débordement horizontal ou vertical du panneau. Résultats dans chassis.json. Contrôle de non-régression du faisceau en pierre du salon. Cette recette porte sur les circuits modifiés et cet écran de contrôle des formats ; elle ne constitue pas un nouvel audit de toutes les pages et fenêtres du site.

## Validation

Compilation et lint réussis (avertissements préexistants). Le champ d'éclairement reste une approximation photographique, avec conservation de l'ambiance naturelle ; il ne s'agit pas d'un calcul photométrique du bâtiment.
