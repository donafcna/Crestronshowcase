# Vérification du candidat C1

## Résultats exécutés dans cette session

- 14 scénarios JavaScript réussis sur le bloc exact inséré dans iphone.html : retard de 20 s, minuteurs, appui déjà sélectionné, superposition, annulation, retour avant relâchement, callback/DOM/frame séparés, absence de DOM, timeout, arrière-plan, déconnexion, reprise partielle des abonnements, état initial inconnu et sorties limitées au sériel 100.
- 8 scripts inline de la page iPhone : `node --check` réussi.
- Comparaison avant/après : aucun changement de la page hors du bloc de diagnostic ; attributs CH5 et joins identiques.
- Inspection statique du C# : commandes métier et tables de routage inchangées ; PulseRoomDigital ne cible plus que l'EISC enregistré et autorisé, avec les deux fronts conservés ; compteur d'impulsions séparé.
- Empreintes des deux fichiers du candidat conformes au manifeste.

Les tests JavaScript utilisent un DOM minimal et une horloge contrôlée. Ils testent les transitions et les mesures de la sonde ; ils ne simulent pas le transport CIP ou le firmware Crestron.

## Organisation du paquet actualisée

Les deux empreintes des sources C1 sont inchangées. Les chemins des scripts, du manifeste et des commandes ont été contrôlés : installation dans `villa-crans/ch5/`, sauvegardes dans `villa-crans/_backups/`, paquet dans `villa-crans/Villa_Crans_Centralisation_C1/`. Aucune écriture de l'installateur n'est prévue en dehors de cette racine avec les paramètres documentés. Cette vérification est statique ; elle ne remplace pas une exécution PowerShell sous Windows.

## Contrôles non réalisés

Compilation du C# avec le SDK Crestron, production CPZ/CH5Z, exécution des scripts PowerShell sur Windows, recette du matériel et rendu dans les trois thèmes sur Safari/TSW/XPanel. Chromium n'était pas installé et son téléchargement a échoué. L'inspection du C# n'est pas une preuve de compilation.

## Rejouer les tests de la sonde sous Windows

```powershell
node "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\verification\test-diagnostics.cjs"
```

Le script réécrit `unit-results.json` dans son propre dossier. `source-checks.json` décrit les inspections statiques effectuées lors de la préparation.

## Référence de bibliothèque examinée

La bibliothèque `ch5-components.js` du dépôt GitHub, commit `04ec427a6c509fe34e622dff14cbc3014a7aa440`, publie les `repeatdigital` depuis `_subscribeToPressableIsPressed()` et applique `receiveStateSelected` via l'attribut/propriété `selected`. Cette lecture motive le départ de mesure sur pointerdown. La bibliothèque n'a pas été modifiée ni incluse dans ce paquet ; sa présence à l'identique sur le téléphone n'a pas été vérifiée.
