# Bêta Alexandre — préparation du 18/09/2026 (P1)

**Statut : profil de banc préparé et validé ; aucun binaire compilé, aucun matériel contacté.**

## Contenu

- `villa_config-beta-alexandre.json` — profil `banc-beta-alexandre` généré par `tools/quality/prepare-beta-config.mjs` depuis `villa_config.json` 1.0.196 (contrat v4.1) : 15 identifiants, 14 pièces actives, libellés de démonstration (pièces, scènes, circuits, sources Apple TV / Sky Q / Swisscom TV / IPTV / Musique), `tracesConsole` faux, code d'alarme de repli vide. `validate-config --release` : 0 défaut.
- Socle de compatibilité : `tools/quality/runtime-v4.json`, id `crans-montana-v4.1-gui1.0.196-csharp1.0.192.0` (empreintes des 13 sources au 18/09 07:34).

## Ce qui reste à faire sur le PC de Donatien (dans l'ordre)

1. Préparer les sources depuis la racine du dépôt (dossier de sortie neuf) :
   `node tools/quality/prepare-project.mjs --config docs/verification/2026-09-18-beta-alexandre/villa_config-beta-alexandre.json --simpl-input projects/villa-crans/simpl/simpl-windows/Project_Slot2.smw --out "Claude outputs/beta-alexandre-1.0.196"`
   → `src/` complet avec la config injectée, `simpl/Project_Slot2.smw` régénéré, `manifest.json` (`sources-prepared-not-qualified`).
2. CH5Z : `npx ch5-cli archive` sur le `src/` préparé (ou `deploy.ps1 -Target web -SkipContrast` après copie du profil en `villa_config.json`, ce qui incrémente `version.json`).
3. CPZ : SIMPL# Pro, `Backend/Villaftv.sln`, assembly 1.0.192.0 (source actuelle ; 1.0.191.0 est chargé sur le CP4 de Donatien).
4. LPZ : ouvrir le SMW préparé, F12. Nettoyer les 2010 définitions `R01_..R15_` v3 si le temps le permet.
5. Compléter `manifest.json` avec les empreintes des trois binaires, puis suivre `docs/industrialisation/BETA-ALEXANDRE.md` (parcours en 6 étapes, recette A01-A12).

## Limites connues au moment de la préparation

- Recette matérielle du LPZ v4.1 jamais faite (scènes mémorisées, 20 circuits).
- Les entrées EISC `Source_Select_n`, `Audio_Mute`, `Motor_n_*`, `Shades_Scene_n`, `Circuit_n#` sont mortes (feedback fourni par le C#) ; les offsets +41..57 / +81..92 poussés par le C# n'ont pas de nom dans le générateur.
- Le type des sources (télécommande, driver) n'est pas paramétrable dans le JSON : Apple TV / Sky Q / Swisscom / IPTV sont figés dans le CH5, le C# et le générateur (chantier Core, P2).
