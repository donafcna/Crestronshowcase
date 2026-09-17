# Sauvegarde Git — 17 septembre 2026

Demande de Donatien : vérifier que le travail est enregistré et poussé sur GitHub.

## Version livrée

Dépôt : `donafcna/Crestronshowcase`, branche `main`. Le code, les tests et la documentation du lot 3D feedback-1 sont dans `a62b6a0387e580d7488da1a4415bc7a1cfe8d92e` ; aucun écart constaté avec GitHub pour ces fichiers.

Le complément documentaire ajoute les consignes racine `AGENTS.md`, le contexte `CONTEXTE-CODEX.md`, le vocabulaire des modes, le suivi 3D, les huit exports Claude d'origine et leur manifeste. Les [preuves finales feedback-1](verification/2026-09-17-feedback-1/README.md) sont également versionnées : rapports, empreintes, planche et aperçu vidéo, environ 3 Mo au total.

## Sources locales préservées séparément

Branche : [backup/crestron-local-2026-09-17](https://github.com/donafcna/Crestronshowcase/tree/backup/crestron-local-2026-09-17).

Commit : `03840cedbcb64c675eec0d84e64fb02c5014a843`, issu du commit fonctionnel ci-dessus. Présence sur le dépôt distant vérifiée.

Cet instantané préserve les modifications locales préexistantes, sans les qualifier comme livraison :

- `projects/villa-crans/simpl/simpl-windows/Project_Slot2.smw`, notice, profil JSON de banc et rapport de vérification ; dossier de travail voulu par Donatien.
- Projet historique `VillaCrans_Slot2.smw`, autosauvegarde et sauvegarde SMW locale du 16 septembre.
- État local du README SIMPL et du contexte Claude CH5.
- Suppressions locales préexistantes de quatre anciennes sauvegardes SMW et d'un ancien patch ; leurs versions antérieures restent dans le commit parent.

Aucun changement de branche de travail, aucune remise à zéro et aucun écrasement du dossier local. Les modifications concernées apparaissent donc encore dans l'état de travail de `main`, mais leur contenu est sauvegardé dans la branche ci-dessus. La validation matérielle reste distincte ; aucun appareil déployé.

## Éléments générés conservés localement

Dépendances, builds, CH5Z/CPZ/LPZ, résultats internes de compilation SIMPL, archives ZIP dupliquées, QR générés et dates de build ne sont pas ajoutés par cette sauvegarde des sources. Les sorties temporaires `Claude outputs/` (environ 1,6 Go, essentiellement essais et captures intermédiaires) sont exclues par `.gitignore`. Les preuves utiles sont copiées dans `docs/verification/` avec contrôle SHA-256 ; aucun original local n'est supprimé.

Cette sauvegarde couvre les sources, consignes, contexte et preuves sélectionnées ; ce n'est pas une image intégrale du disque ni une mise en service matérielle.
