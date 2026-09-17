# Projet SIMPL Windows — Villa Crans

Conserver les sources générées et les résultats de compilation **directement dans `simpl-windows/`**, conformément à la précision de Donatien du 17 septembre 2026. Dossier de travail : `C:/dev/crestron/repo/projects/villa-crans/simpl/simpl-windows`. Ne plus utiliser `builds` ni `livraisons` comme dossier de travail SIMPL.

- `simpl-windows/VillaCrans_Slot2.smw` : projet historique, avec les modifications locales de Donatien.
- `contract/` : contrat et générateur des signaux.
- `simpl-windows/Project_Slot2.smw` : candidat compilé par Donatien le 17/09/2026 à 16:25, sans transfert. Le LPZ, le SIG du Debugger, les archives, le profil de banc et les empreintes sont à côté du SMW. Voir `simpl-windows/LIRE.md`.

L'ancienne copie dans `livraisons/2026-09-17-gui181/` est conservée comme sauvegarde, pas comme dossier de travail. Les douze fichiers ont été copiés vers `simpl-windows` avec vérification SHA-256 avant actualisation des notices.

La compilation est compatible avec la GUI 1.0.181 et le C# 1.0.180.0. Les retours réels des équipements et la communication EISC restent à vérifier sur matériel. Les deux sources sont identifiées séparément pour préserver le projet historique ; ne pas les remplacer l'une par l'autre sans comparaison.
