# 08 — Workflow : version Déploiement ↔ version Crestronshowcase

Le GUI Villa Crans existe en **deux versions dérivées d'une seule source**. Toute
amélioration ou correction doit être prise en compte dans les deux, dans cet ordre.

| | **Déploiement** | **Crestronshowcase** |
|---|---|---|
| Où | ce dépôt (`src/`), livré chez les clients par `deploy.ps1` | dépôt `donafcna/Crestronshowcase`, dossier `public/showcases/villa-gemini-frequencetv/`, site https://crestrongui.vercel.app |
| `villa_config.json` → `meta.mode` | `"deploiement"` | `"showcase"` (posé par le script de sync) |
| Feedback des boutons | **backend** : appui → CrComLib / WebXPanel → C# slot 1 → SIMPL slot 2 (interlocks, drivers) → C# → GUI | **frontend** : `js/local-feedback.js` simule l'automate dans le navigateur ; chaque appui produit son feedback |
| Curseur de démonstration automatique | **jamais** (absent de `src/`) | géré par le site React (`useAutoDemo`), à l'extérieur du GUI |
| Connexion CP4, console admin, indicateur Online/Offline | présents | retirés par le script |
| Pièces / scènes / sources | celles du client | noms de démonstration (le fichier de développement contient des noms de test) |

## Règle

**On ne modifie jamais la copie showcase à la main.** La source de vérité est `src/`
de ce dépôt ; la copie showcase est régénérée par un script. Une modification faite
seulement dans le showcase serait perdue à la synchronisation suivante ; une
modification faite seulement ici n'apparaîtrait jamais sur le site.

## À chaque modification du GUI

1. **Développer dans `src/`** (`index.html`, `iphone.html`, `villa_config.json`…).
   Vérifier que rien de « showcase » n'y entre : pas de `local-feedback.js`, pas de
   simulation de feedback, `meta.mode` reste `"deploiement"`.
2. **Tester en déploiement** : `deploy.ps1` (CPZ / web), console web ou dalle réelle ;
   le feedback doit venir du CP4 (C# + SIMPL), jamais du navigateur.
3. **Régénérer la vitrine** depuis le dossier Crestronshowcase :
   ```
   python3 scripts/sync-villa-crans.py "C:\Users\donat\Desktop\VillaCrans\src"
   npm run build
   ```
   Le script copie `index.html` / `iphone.html` / `version.js` / `build_date.json`,
   remplace `js/webxpanel.js` par `js/local-feedback.js`, masque l'indicateur de
   connexion et la console admin, et génère un `villa_config` vitrine
   (`meta.mode = "showcase"`, noms de démonstration, tous les pilotages actifs).
4. **Si la modification touche le contrat de joins ou ajoute un signal**, mettre à jour
   à la main `js/local-feedback.js` dans le dépôt showcase (seul fichier maintenu à la
   main ; le script ne l'écrase jamais) pour que le nouveau bouton ait son feedback simulé.
5. **Tester la vitrine** : `/interfaces/residentiel/villa-gemini-frequencetv/wallpanel`,
   `/tablet`, `/phone`, `#demo/villa-gemini-frequencetv` (curseur, changement de pièce,
   scènes, sources, mute, consigne).
6. **Commit + push `main`** du dépôt showcase → Vercel déploie automatiquement.

## Garde-fous

- `local-feedback.js` refuse de démarrer si `meta.mode !== "showcase"` : copié par erreur
  sur un CP4, il reste inerte.
- Le script de sync échoue si la balise `js/webxpanel.js` n'est pas trouvée exactement une
  fois dans chaque HTML : ne pas renommer / dupliquer cette balise sans adapter le script.
- Bugs de `src/` contournés dans la copie showcase (à corriger ici, cf. `06_TODO.md`) :
  dictionnaire `ru` tronqué dans `iphone.html`, overlays `circuits/motors/cameras/global-control`
  en `display: flex` inline, `sendPowerOff()` qui publie encore le digital 50 et
  `toggleMute()` le digital 201 (joins réaffectés en v2).
