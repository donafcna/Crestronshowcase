# Asteria — cycle jour/nuit de 20 secondes

Demande de Donatien : 10 secondes de jour et 10 secondes de nuit, publication Vercel prise en charge. Ce réglage remplace uniquement le rythme du yacht ; Villa Crans reste inchangée.

## Séquence

- 0 à 9 s : jour stable, scène Croisière.
- 9 à 10 s : fondu vers la nuit, compris dans les dix secondes.
- À 10 s : scène Dîner à bord, une seule commande.
- 10 à 19 s : nuit stable, tous les circuits extérieurs en Auto à leur niveau nocturne.
- 19 à 20 s : fondu vers le jour, compris dans les dix secondes.
- À 20 s : scène Croisière, puis répétition.

Le libellé du panneau extérieur provient désormais de la durée du moteur. La priorité manuelle, les 40 circuits, les cadrages, la molette et la géométrie sont conservés. Aucun nouveau minuteur ni changement du cycle Villa Crans.

## Vérification et publication

Le paquet préparé a été repris sur la base main 0485d5fc5ccb9aaeeda9b1d17b1d8b95b99eb1ca, incluant la dernière publication Centralisation iPhone. Les 19 tests unitaires ont été réexécutés avec succès avant envoi. Les tests utilisent le véritable moteur de cycle et vérifient les déclenchements à 0, 10, 20, 30 et 40 secondes. Les instants des bancs navigateur sont adaptés ; leurs résultats doivent être consultés dans les workflows de cette PR, sans présumer de leur succès.

Après fusion autorisée, le workflow nocturne vérifie les ressources servies par Vercel et réexécute les tests de scènes sur le domaine principal. Le résultat de cette étape, distinct du build, est nécessaire avant de déclarer la publication vérifiée. Les quatre erreurs préexistantes de qualification Villa Crans ne sont ni modifiées ni neutralisées par ce lot. Aucun fichier matériel ou local Windows modifié.
