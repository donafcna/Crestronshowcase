# SIMPL compilé — GUI 1.0.181 / C# 1.0.180

LPZ compilé manuellement par Donatien le 17/09/2026 à 16:25, sans transfert au processeur. Les fichiers sont regroupés ici à sa demande ; utiliser désormais directement `C:/dev/crestron/repo/projects/villa-crans/simpl/simpl-windows` pour préparer et conserver les compilations. Les anciennes copies dans `builds` et `livraisons` sont des sauvegardes.

Ouvrir `Project_Slot2.smw`. `Project_Slot2.lpz` est le résultat compilé, et `Project_Slot2.sig` fournit les noms de signaux au Debugger. Les archives de sources/compilation sont conservées avec les autres fichiers produits par SIMPL.

Vérifications Codex : intégrité ZIP du LPZ ; SMW embarqué strictement identique au SMW préparé (SHA-256) ; lecture complète des 550 enregistrements du SIG, présence des commandes et retours Sauna/Hammam, HVAC ON/OFF et ventilation Auto/1/2/3. Avant compilation : 76 contrôles HVAC et 53 Wellness réussis sur ce SMW. Empreintes et statut dans `verification.json`.

`villa_config-banc.json` est le profil de banc associé, 15 pièces physiques ; le code d'alarme de repli y est vide. Le projet historique `VillaCrans_Slot2.smw`, présent dans ce même dossier, et ses modifications locales restent préservés. Le candidat nouvellement compilé s'appelle `Project_Slot2.smw`. La GUI de démonstration à 17 pièces est un profil distinct.

Cette compilation ne remplace pas la recette matérielle : drivers des équipements, transport EISC multi-écrans, appuis/relâchements et mesures réelles restent à vérifier. Le C# compatible est 1.0.180.0 ; la GUI est 1.0.181. Aucun appareil déployé ou testé dans cette reprise.
