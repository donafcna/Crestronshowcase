# Showroom FTV Nyon — journal

Quatre artefacts : CH5 `showroomnyon.ch5z`, CPZ slot 1 `ShowroomNyon.cpz`, LPZ slot 2 `ShowroomNyon_Slot2.lpz`, `showroom_config.json`.

## 1.0.0 — 29.09.2026 (CH5 source 1.0.0, C# 1.0.0.0, SMW généré, JSON meta.version 1.0.0 ; rien compilé sur matériel)

| Artefact | État |
|---|---|
| CH5 source | `ch5/src` : index.html (dalle, XPanel, iPad) + iphone.html, 3 thèmes, **à compiler** (`deploy.ps1`) |
| CPZ slot 1 | `simpl-sharp/ShowroomNyon` : compile en C# 7.3 contre des stubs de l'API Crestron ; **à compiler dans Visual Studio** |
| LPZ slot 2 | `ShowroomNyon_Slot2.smw` généré (277 signaux, EISC 186 sorties / 63 entrées, 6 Analog Buffers), `check_slot2` VERT ; **jamais ouvert dans SIMPL Windows** |
| Config | `showroom_config.json` : 6 pièces, 24 circuits, 6 actions maison, 2 services, 3 favoris, 1 source vidéo, 1 caméra, contrat 1.0 |
| Vitrine | `apps/showcase/public/showcases/showroom-ftv-nyon/` (site 2.3.1), fiche FR/EN/DE |

- GUI recréé depuis les 42 photos de la tablette : accueil « Fréquence TV » (Actions, Controls), Rooms (All / Favorites / étages,
  favoris par appui long, illustration « No favorites added »), pièce (Actions, Services Lights / Music / Video), fenêtre
  Lights (scènes, All Lights −/+, interrupteur + curseur par circuit, 2/3/4 colonnes selon le nombre), Select Music, lecteur
  (transport, j'aime, aléatoire, répétition, Parcourir, minuterie de veille), Apple TV (télécommande), Video, Cameras, Manage
  (Panel Settings : thème, IP-ID, versions), menu « … », confirmation d'extinction générale.
- Photos des pièces recadrées dans les photos de la dalle (redressement, retrait des pastilles d'interface par inpainting,
  débruitage, correction des niveaux) ; pochettes et image de caméra factices.
- C# slot 1 sur l'architecture FTV Home, réécrit pour ce contrat ; règles identiques à `local-feedback.js` : 5 séquences,
  158-160 joins comparés, 0 écart (`tools/parity/parity.js`). Écarts trouvés et corrigés en route : arrondi des niveaux
  (Math.Round au pair côté C#) et retour `Room_Select` absent côté vitrine.
- Batteries : `ch5/tools/qa-showroom.cjs` 720/720 sur la vitrine (3 thèmes × dalle 1920×1200, dalle 1280×800, iPad 1180×776,
  XPanel 1920×1080, iPhone 440×863 et 402×874 × 40 écrans / fenêtres / états) et 180/180 sur `ch5/src` en mode déploiement ;
  `apps/showcase/scripts/test-showroom-ftv-nyon-modes.cjs` 177/177 (3 thèmes × 4 modes × 3 châssis).

**Décisions prises par défaut.** Textes du GUI en anglais comme la dalle d'origine. Pas de crayon d'édition dans la fenêtre
Lights (il n'aurait rien commandé). Plus de 8 circuits : 3 colonnes, plus de 12 : 4 colonnes (le showroom B&O en a 13 ; la
dalle d'origine faisait défiler). Smartphone : la liste des circuits défile (exception Circuits). Pièce sans média : « Turn
on this media room » affiche « No media in this room ». Bouton Marche/Arrêt de l'accueil : confirmation avant de tout
éteindre. Police Poppins (OFL) embarquée, la police Crestron Home n'étant pas libre. Classe dalle `Tsw1070GV` comme Villa Crans.
