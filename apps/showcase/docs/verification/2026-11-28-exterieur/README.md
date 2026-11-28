# Villa Stark 2.3.37 — animations extérieures et toutes les baies

## Végétation, nuages et brume
Complément local de vent sur les prises Runway existantes : groupes indépendants, amplitude de 1,4 à 3,2 pixels à 1280 × 720, mouvements périodiques à plusieurs phases. Déplacement du ciel et de la brume limité à leurs zones naturelles. Masque extérieur étendu aux pointes des fougères. Villa, marches et rochers ne reçoivent pas ces déformations locales. Vidéo silencieuse de 383 images à 24 images/seconde.

## Écran du cinéma vu de l’extérieur
Vidéo journal-tv.mp4 déjà présente, présentatrice Runway. Projection sur les quatre coins intérieurs de l’écran photographié, conservation du cadre. Pause hors vue et à la fermeture complète des stores, arrêt avec Tout éteindre. L’état initial de la vue extérieure lance cette ambiance TV, même sans sélection préalable dans la télécommande.

## Tour des fenêtres
Living, Dining, Kitchen, Office, Fitness, Entry, Master, Bedroom : vidéos v2 chargées et jouant, readyState 4, aucune erreur média, masque de vitrage non vide. Les trois premières prises Runway sont complétées ; Kitchen, Office, Fitness, Entry, Bedroom utilisent leur photo originale avec un champ de vent local sur les groupes de feuilles. Un seul paysage joue à la fois. Les éléments photographiques intérieurs restent au premier plan grâce aux masques existants. Cinema n’a pas de baie visible dans sa vue intérieure ; Pool utilise la vue extérieure. Fermeture du store de Bedroom : vidéo masquée et en pause. Captures des huit vues et résultats dans windows-checks.json ; encodages dans window-media.json.

## Recette ciblée
Vue extérieure en mode scène, trois thèmes : paysage et TV chargés, muets et jouant ; retour de boucle observé sur le paysage. Tout éteindre : TV cachée et en pause. Aucune erreur console pendant le tour des pièces. Build, lint et syntaxe avant publication ; les avertissements lint antérieurs restent présents. Aucun composant GUI ni dimension du châssis modifié par ce lot. Les captures ne prouvent pas à elles seules la qualité temporelle : les animations doivent rester discrètes et pourront nécessiter un réglage visuel selon l’écran.
