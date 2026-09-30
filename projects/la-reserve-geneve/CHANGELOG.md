# La Réserve Genève — journal

Livrables : un CH5 par panneau (`reserve-bar.ch5z`, `reserve-fitness.ch5z`, `reserve-lodge.ch5z`) + `reserve_config.json`.
Programmes SIMPL existants conservés (une modification : sources du smart object → joins du panneau).

## 1.0.1 — 30.09.2026

- Source du Bar « iPod » renommée « Lecteur radio » (GUI, fiche du site). Joins inchangés (b82, `Ipad_1_Input_4`).
  `sources[].aliasRetour` (nouveau) : si le processeur renvoie encore « iPod » sur le sériel de source, la source est
  reconnue. Icône inchangée (baladeur).
- Batteries : GUI 342/342 vitrine, 234/234 déploiement ; site 177/177. Site 2.3.4.

## 1.0.0 — 30.09.2026 (CH5 source 1.0.0 ; rien compilé ni installé sur matériel)

- GUI refait depuis les 10 captures Vision Tools (Bar ×4, Fitness ×3, Lodge ×3) : accueil (nom de l'hôtel, groupes en
  diffusion), dock des sources + Tout éteindre, vue zones (Bar : Rez-de-chaussée / Sous-sol), cartes de zone (niveau,
  Vol + / Vol − maintenus, Mute), groupes (Diffuser = Distribute, Arrêt = Off), confirmation d'extinction, « Veuillez
  patienter » avec progression, Fermer = Exit. Smartphone : mêmes commandes en lignes, sans défilement.
- Trois thèmes (Lac, Nuit, Spa) choisis par le client dans Réglages, mémorisés sur l'appareil ; `?theme=` les force.
- Joins extraits des .smw (`Reserve Bar prg06` : Bar IP-ID 04 + Lodge IP-ID 05 ; `Reserve prg005` : Fitness IP-ID 04),
  `tools/verifier_smw.py` : 0 écart.
- Vitrine : sélecteur d'espace, feedback simulé (`local-feedback.js`). Site 2.3.3, secteur Hôtellerie, fiche FR/EN/DE.
- Batteries : GUI 342/342 vitrine, 234/234 déploiement (3 espaces × 3 thèmes × 6 châssis) ; site 177/177.
  Preuves : `docs/verification/2026-09-30/`.

**Décisions prises par défaut.** Libellés du GUI en français (noms de zones et de sources d'origine conservés).
Sources déplacées sur les joins libres 80-84 (Bar), 61-65 (Lodge), 61-66 (Fitness). Le Loft = `Restaurant`, Le Loft
Fond = `Lotti`. Exterior et Exterior Sub réunis sous « Distribute to Exterior » ; Micro en niveau seul. Groupes à une
zone : pas de titre de groupe (le nom de la zone suffit). Tablette en paysage (dalle, XPanel, iPad) ; le VT Pro était
en portrait. Polices libres OFL embarquées : Cormorant Garamond (nom de l'hôtel, en texte, sans reproduire le logo)
et Manrope.
