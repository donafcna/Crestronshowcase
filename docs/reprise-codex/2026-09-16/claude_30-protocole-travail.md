# 30 — Protocole de travail

Version de référence des règles permanentes du projet (identique aux instructions personnalisées du projet Cowork, conservée ici pour l'historique et la relecture).

## Démarrage de session

Lire uniquement `CONTEXTE-CLAUDE.md` et le CHANGELOG. Ne rien ouvrir d'autre tant que le plan n'est pas validé.
Mettre `CONTEXTE-CLAUDE.md` à jour en fin de session, en condensant (< 150 lignes).

## Règles permanentes

1. **Auto-vérification bloquante.** Avant toute livraison visuelle, exécuter la batterie Playwright : 3 thèmes × {Mode normal, Mode Scène taille réelle, Mode Scène responsive, Plein écran} × {dalle 1920×1200, iPad 11″, iPhone 16 Pro}, chaque page **et** chaque fenêtre modale, états dynamiques inclus. Contrôles : contraste ≥ 4:1, aucun texte tronqué ou débordant, aucun scroll horizontal parasite, aucune cible tactile < 40 px, aucune erreur console, aucun son. Ne livrer que si le rapport est 100 % vert ; sinon corriger et relancer en autonomie. Joindre le tableau de résultats.
2. **Planche-contact.** Chaque livraison visuelle inclut une grille PNG avant/après des écrans touchés (thèmes en colonnes).
3. **Correction au niveau du système** : variable de thème, token ou composant partagé, jamais en dur sur un écran. Ensuite, lister les autres interfaces utilisant ce composant et les revérifier. Une exception se justifie avant d'être écrite.
4. **Source unique.** Développement dans `VillaCrans/src`, propagation par `sync-villa-crans.py`, les deux modes vérifiés. Finir par le push automatique : aucun fichier à cliquer, aucun `.cmd` / `.bundle` qui s'accumule.
5. **Autonomie.** Aller jusqu'au bout sans redemander confirmation à mi-parcours. Décision ambiguë : choisir l'option la plus raisonnable, l'appliquer, la signaler sous « Décisions prises par défaut ». Jamais plus de 3 questions, chacune avec la réponse par défaut.
6. **Contrat d'acceptation.** Toute tâche de plus de 30 min commence par 10 lignes max : ce qui change, fichiers touchés, critères de réussite mesurables, décisions ambiguës + choix par défaut. Attendre le « ok ».
7. **Questions de goût** : jamais une seule version — 2 ou 3 variantes côte à côte avec une recommandation.
8. **Retours groupés.** Les défauts arrivent en un lot (liste numérotée ou `retours.json` du mode Dev). Traiter tout le lot en un cycle et rendre la liste avec le statut et la capture de preuve de chaque point.
9. **Économie de tokens.** Pas de code recollé dans la réponse : diff résumé en 5 lignes, chemins, version. Lecture ciblée au grep plutôt que fichiers entiers. Sous-agents parallèles pour le répétitif (fiches produits, FR/EN/DE, revue par thème).
10. **Terminé** = batterie verte + version incrémentée + CHANGELOG + règles consignées dans `CLAUDE.md` / `CONTEXTE-CLAUDE.md` + poussé et vérifié en ligne + captures fournies.

## Langue et style

Français, concis, pas de récapitulatif de ce qui vient d'être lu. Icônes SVG (pas d'emoji dans les GUI), aucun son dans la GUI.

## Workflow de livraison

```
VillaCrans/src  →  test en mode déploiement  →  scripts/sync-villa-crans.py  →  showcase  →  push main  →  Vercel
                                                                              ↘  deploy.ps1  →  dalle TSW + XPanel + CP4
```
