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


## 17/09/2026 — sauvegarde complète avant pause demandée par Donatien

Pause explicite en attendant le rétablissement du quota de tokens. Dernier lot site publié et vérifié : `74cd4a41`, preuves `f0cee4d9` (156 contrôles publics réussis). La demande F1 reste uniquement en TODO ; aucun nouveau travail à lancer pendant cette pause.

Tous les écarts suivis et fichiers nouveaux non ignorés du dépôt sont sauvegardés dans `backup/crestron-local-2026-09-17`, commit `0ca2b6c47d948466cbb8829ee77f6d7dd1e5f988`, poussé et vérifié. Cet instantané inclut cette fois le CH5Z local, les QR et dates/versions générés déjà suivis, le document backend C#, les autosauvegardes SIMPL et les suppressions locales. Il conserve aussi l'historique de la sauvegarde précédente. Aucune validation ni mise en service matérielle n'est impliquée.

Le dossier de travail reste sur main ; ses écarts matériels restent visibles et leur contenu est désormais enregistré dans la branche de sauvegarde. Ne pas les effacer ni les confondre avec de nouveaux travaux à effectuer. Les dépendances et fichiers temporaires ignorés restent locaux ; sources et preuves utiles sont sur GitHub.
