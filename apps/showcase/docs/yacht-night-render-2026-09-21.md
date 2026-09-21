# Asteria — rendu nocturne, 21 septembre 2026

Le cadrage d'entrée est confirmé résolu par Donatien. Ne pas modifier caméra, zoom, `present` ni accusé de première image. Demande restante : rapprochement de la référence nocturne, éclairages extérieurs chauds, eau cyan et aucun faisceau dans le ciel.

## Diagnostic et modifications

- Le parcours automatique appelle les presets de la GUI. Le relais extérieur les traitait comme des actions manuelles et pouvait désactiver Auto, conservant ensuite les niveaux de jour. Distinguer un clic réel du visiteur des commandes de présentation.
- Les anciens liserés ne suivaient pas exactement les nez et arrondis des dalles et étaient partiellement cachés dans leur épaisseur. Reprendre les contours des six vrais plateaux, placer le diffuseur sur le chant et garder depthTest actif.
- Simuler un éclairage indirect local sur le teck, les surfaces claires, les sièges et les vitrages de l'extérieur uniquement. Champs lumineux liés aux niveaux de circuits ; extinction OFF conservée. C'est une approximation analytique de lumière précalculée, pas une illumination globale physique.
- Renforcer les sources réelles existantes, la surface des bassins et les optiques des enseignes. Ne pas multiplier les lumières dynamiques : six sources ponctuelles existantes réutilisées.
- Ajouter des reflets fragmentés chauds à partir des hauteurs des ponts sur la mer, atténuer le reflet blanc de type soleil pendant la nuit, conserver l'exclusion géométrique de la coque.
- Retirer les quatre volumes de faisceaux dans l'air. Corps, lentilles, nappes et spots de pont restent présents ; libellé GUI `Lyres · optiques de pont`, identifiant stable `party_beams`.

## Vérification

`node scripts/test-yacht-night.mjs` produit avant/après à caméra et résolution identiques, nuit / jour / crépuscule / aube, extinction et retour Auto. Contrôle également un preset programmatique du parcours puis un véritable clic utilisateur. Un accroissement des pixels chauds n'est pas une mesure de ressemblance à la référence : examen visuel des PNG indispensable.

Workflow `Asteria night render review` : construction, analyse statique, tests unitaires existants puis rendu Chromium/SwiftShader. Rendus arrêtés entre captures : aucune mesure de FPS matériel implicite. Les workflows première image et molette doivent rester réussis.

## Limites

La référence initiale est une image générée, pas une capture de cette géométrie. La maquette garde des meubles et vitrages simplifiés ; elle n'est pas devenue identique à une photographie. Pas de remplacement du modèle par une image fixe ni d'assombrissement global du GUI. La sensation de hauteur en vue pièce est un sujet distinct non traité par ce lot.

Branche de prévisualisation seulement ; pas de fusion main, pas de modification de la source CH5 ni des programmes C#/SIMPL ou des fichiers Windows non poussés.
