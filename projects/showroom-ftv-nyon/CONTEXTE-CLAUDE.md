# Showroom FTV Nyon — contexte de reprise (< 150 lignes)

Mis à jour le 29.09.2026 (v1.0.0, première livraison).

## Ce que c'est
GUI CH5 recréant à l'identique l'interface Crestron Home de la dalle TSW-1070 d'entrée du showroom Fréquence TV de Nyon
(photos de référence : 42 clichés fournis par Donatien le 29.09, IMG_2449 à IMG_2490), pour dalle, XPanel, iPad et iPhone,
avec C# slot 1, SIMPL slot 2 et config JSON comme Villa Crans. Base choisie par Donatien : l'architecture FTV Home
(le GUI « Crestron Home » du showcase est un simulateur React : seul son principe et son backend ont servi).

Règle : tout le projet reste dans `projects/showroom-ftv-nyon/` ; côté site : `apps/showcase/scripts/sync-showroom-ftv-nyon.py`,
`scripts/test-showroom-ftv-nyon-modes.cjs`, `src/data/projects.js` (secteur Boutique), `src/data/sheets/showroom-ftv-nyon.js`,
`public/sheets/showroom-ftv-nyon/`, `public/showcases/showroom-ftv-nyon/` (généré, jamais édité à la main).

## Décisions structurantes
1. **Source unique = `showroom_config.json`** (racine du projet). Photos remplaçables par le JSON (chemins `img/...` ou URL).
   `tools/build.py` écrit les copies `ch5/src/showroom_config.{js,json}` et `version.js` ; `deploy.ps1` fait de même au build.
2. **Contrat de joins dans le JSON** (`contrat.signauxGlobaux`, `blocsPieces`). `tools/gen_joins.js` génère `Joins.cs` et
   `docs/CONTRAT-JOINS.md` ; `--check` échoue si l'un n'est plus aligné. Le GUI lit les numéros par nom (`Joins.of`).
3. **Moteur d'état en double, parité mesurée** : C# `ControlSystem.cs` (déploiement) et `js/local-feedback.js` (vitrine).
   Toute règle changée d'un côté se change de l'autre, puis `node tools/parity/parity.js` (SDK .NET 8, Linux/WSL) doit
   rester à 0 écart.
4. **SMW généré** depuis le socle nu (copie de celui de FTV Home) par `tools/generate_slot2.js`, contrôlé par `check_slot2.js`.
   Seules les plages réellement utilisées sont câblées (6 pièces, 13 circuits max, 5 scènes, 5 actions, 8 touches Apple TV).
5. **Mise en page en unités « u »** (`--u` posé par app.js : min(l/1280, h/800) ; smartphone min(l/440, h/863)) : pas de
   `min()` / `:has()` / `?.` (navigateur TSW). Couleurs uniquement par jetons de thème dans `css/showroom.css`.

## Pièges rencontrés
- Une `url()` dans une variable CSS se résout par rapport à la feuille (css/) : poser l'image en `background-image` en ligne.
- `style="…url("…")…"` casse l'attribut : `url('…')` avec apostrophes (fonction `url()` d'app.js).
- `Math.Round` C# arrondit au pair (19660,5 → 19660), `Math.round` JS vers le haut : `MidpointRounding.AwayFromZero`.
- Batterie : ne mesurer que les textes au premier plan (`elementFromPoint`), contraste mesuré sur les pixels du fond sans texte
  (rectangle du nœud texte, pas de la boîte : sinon les bordures colorées faussent le fond).
- Vidéo de fond du site en Chromium de test : `net::ERR_ABORTED` sur les .mp4, filtré dans la batterie site.

## État au 29.09.2026
- Vitrine en ligne après push (site 2.3.1) ; batteries vertes (voir CHANGELOG). Démo automatique du site : parcours
  générique `orderedDemo.js` (attributs `data-demo-*` posés par app.js).
- **Rien compilé ni installé** : CH5Z, CPZ, LPZ à produire sur le PC. Le processeur réel du showroom fait tourner Crestron
  Home : y charger ce programme remplace Crestron Home (à décider avant tout déploiement).
- Drivers slot 2 à câbler : Lutron / éclairage (circuits), Deezer / B&O (musique), Apple TV (IR/IP), caméra (flux RTSP/MJPEG
  à déclarer dans `cameras[].flux`).

## À faire ensuite
1. Donatien : valider la fidélité visuelle sur la planche-contact, trancher les décisions par défaut du CHANGELOG.
2. PC : `npm install` dans `ch5/`, `deploy.secrets.psd1`, Visual Studio → CPZ, SIMPL Windows → LPZ, `deploy.ps1`.
3. Recette Debugger (`docs/CONTRAT-JOINS.md`), puis drivers réels et flux caméra.
4. Remplacer les pochettes factices par les métadonnées réelles du lecteur (sériels s20-23 envoyés par le C#).
