# Prompt de démarrage — transfertFACT 3D (à coller dans Claude Code)

> Copie tout ce qui suit la ligne de séparation dans ton premier message à Claude Code, lancé dans ce dossier.

---

Tu travailles dans le dossier `transfertfact-3d`. Lis d'abord `CLAUDE.md` (règles du projet), puis ouvre `reference/maquette-multipa.html` dans un navigateur pour voir la maquette existante.

## Objectif

Transformer la maquette `reference/maquette-multipa.html` en **vitrine web 3D photoréaliste**, présentée comme un film d'environ une minute qui se lance seul. Le rendu doit approcher celui d'une vidéo produit tournée en studio, et rester fluide (60 images/s) sur un ordinateur portable récent sans carte graphique dédiée.

Public visé : **cabinets d'expertise comptable** inquiets face à la facture électronique, dont les clients choisissent chacun une Plateforme Agréée (PA) différente. Message : **transfertFACT centralise toutes les PA**, récupère les factures d'achat et de vente, permet de suivre les statuts depuis l'application mobile et automatise les imputations.

## Le scénario (7 chapitres, à conserver)

Reprends les textes exacts de la maquette (tableau `CH` dans le script). Résumé :

1. **Échéance (8 s)** : un calendrier de bureau affiche « mardi 1er septembre 2026 · facture électronique · réception obligatoire ». Un téléphone vibre à chaque mail de client annonçant sa PA.
2. **Le casse-tête (9 s)** : 5 plaques de PA (Qonto, Pennylane, jefacture.com, Cegid, Sage) au fond, 12 dossiers clients éparpillés devant. Des câbles colorés se déroulent et s'emmêlent de chaque dossier vers sa PA.
3. **Centralisation (9 s)** : un ordinateur transfertFACT entre dans le champ. Les câbles se démêlent et se branchent tous dessus, les dossiers se rangent en pile, et l'écran passe les 5 PA en « Connectée ».
4. **Achats et ventes (8 s)** : les factures sortent de l'ordinateur vers deux bacs, « ACHATS » et « VENTES », et des compteurs défilent à l'écran.
5. **Application mobile (9 s)** : gros plan sur un téléphone posé sur un support en aluminium. Les statuts évoluent : Déposée → Mise à disposition → Prise en charge → Approuvée, Mise en paiement → Encaissée, une Rejetée, une Refusée. On voit les boutons Approuver/Refuser et le toast « Statut transmis à la plateforme ».
6. **Traitement (9 s)** : un scanner lit une facture pendant que les lignes d'un journal comptable équilibré se posent sur la page.
7. **Sérénité (10 s)** : un bureau rangé, un portefeuille « 12 dossiers · 5 PA · 0 facture en attente », et les boutons Demander une démo, Contactez-nous et Souscrire.

Interface à conserver : header blanc avec le menu du site, texte du chapitre à gauche (en bas sur mobile), timeline cliquable par chapitre avec bouton pause, raccourcis clavier (espace, ← →). Les étiquettes HTML restent ancrées sur les objets 3D.

## Direction artistique (identité du site transfertfact.fr)

- Couleurs : vert `#4AAC35` (principal), vert foncé `#3C940C`, turquoise `#4EBBB7`, turquoise foncé `#086666`, jaune `#FFD43A`, texte `#444444` / `#6A6A6A`, fond blanc.
- Polices : **Sometype Mono** pour les titres (letter-spacing −2px), **Roboto** pour le texte.
- Décor : un bureau en chêne clair filmé en studio, lumière douce et chaude venant de l'arrière-gauche, aucune forme abstraite (pas d'anneaux, d'hexagones ni de particules). Uniquement des objets réels.

## Stack technique

- **Vite + React + TypeScript**, **React Three Fiber**, **@react-three/drei**, **@react-three/postprocessing** (bibliothèque pmndrs), **N8AO** pour l'occlusion ambiante. Utilise les versions stables actuelles.
- Animation pilotée par **une seule horloge de film** (temps T en secondes) : chaque chapitre lit `T - début` et en déduit tout son état. Il ne doit jamais y avoir d'état d'animation accumulé, pour que la timeline puisse sauter n'importe où.
- Caméra : chemins de caméra par chapitre (position et cible au début et à la fin) avec un transit courbe entre chapitres, comme dans la maquette. Cadrage adapté à la largeur de l'écran, avec la zone de texte à gauche exclue du cadre.

## Réalisme : les leviers, par ordre d'impact

1. **Éclairage par photo panoramique (HDRI)** : télécharge sur **polyhaven.com** (licence CC0) une HDRI d'intérieur lumineux, type studio ou bureau, en 1K ou 2K. Utilise-la pour l'environnement et les reflets, sans l'afficher en fond.
2. **Vrais modèles 3D** (`.glb`, licence CC0 ou CC-BY, crédits notés dans `CREDITS.md`) : tasse et soucoupe, ordinateur portable, smartphone, stylo, calendrier de bureau, bac à courrier, plantes éventuelles. Sources prioritaires : Poly Haven, puis Sketchfab (filtrer « téléchargeable » et licence compatible). Si rien ne convient, modélise proprement en code (formes arrondies, assez de segments).
3. **Textures PBR photo** pour le bois du bureau (couleur, relief, rugosité), le papier et le carton des dossiers.
4. **Ombres de contact et occlusion** : `ContactShadows` ou `AccumulativeShadows` de drei pour le décor fixe, N8AO en post-traitement.
5. **Éclairage cuit (optionnel, gros gain)** : si Blender est installé, cuis la lumière et l'occlusion du décor fixe de chaque chapitre dans des lightmaps. Sinon, saute cette étape.
6. **Rendu caméra** : tone mapping AgX ou ACES, profondeur de champ légère sur le sujet, vignettage discret, grain très fin. Pas de flou excessif ni de voile.
7. **Papier crédible** : textures de facture en A4 à 150 dpi minimum, recto imprimé et verso uni, légère courbure commune à toutes les feuilles. Les feuilles empilées ne doivent jamais s'interpénétrer.

## Budget de performance (obligatoire)

- Objectif : **60 images/s** sur un portable Intel Iris ou Apple M1, et **30 images/s minimum** sur un mobile milieu de gamme.
- Résolution d'écran plafonnée (`dpr` max 1,5) et **qualité adaptative** avec `PerformanceMonitor` de drei : on coupe N8AO, puis la profondeur de champ, puis on baisse la résolution.
- `frameloop="demand"` quand le film est en pause, et pause automatique quand l'onglet est masqué.
- Ombres du décor fixe calculées une seule fois par chapitre, pas à chaque image.
- Modèles compressés (Draco ou meshopt) et textures en **KTX2**. Poids total des assets : **moins de 15 Mo**.
- Objets répétés (touches, feuilles, dossiers) en `InstancedMesh` ou géométries partagées.
- Pas de matière transparente réfractive (transmission) sur mobile.

## Contenu et contraintes

- Textes en **français**. Faits réglementaires à conserver tels quels : réception obligatoire pour toutes les entreprises depuis le **1er septembre 2026**, émission obligatoire pour les PME et TPE au **1er septembre 2027**, statuts obligatoires **déposée, rejetée, refusée, encaissée**.
- Clients, factures et montants : **fictifs**, comme dans la maquette.
- Logos des PA : **uniquement** les fichiers fournis dans `assets/logos/`. N'en télécharge et n'en redessine aucun autre. Le fichier `jefacture.png` est le symbole seul, suivi du nom « jefacture.com ».
- Mention « concept 3D » visible à côté du logo transfertFACT dans le header.
- Accessibilité : `prefers-reduced-motion` respecté (pas de transit de caméra, chapitres en fondu), focus clavier visible, et texte des chapitres lisible même si WebGL échoue.

## Méthode de travail

1. **Étape 1 : socle.** Projet Vite + R3F, header, timeline, horloge de film, caméra, bureau et HDRI. Rien d'autre. Montre-moi une capture.
2. **Étape 2 : assets.** Télécharge et prépare (compression) HDRI, textures et modèles. Liste-les avec leur licence dans `CREDITS.md`.
3. **Étape 3 : chapitres 1 à 7**, un par un. Après chaque chapitre, fais une **capture Playwright** au milieu et à la fin du chapitre et compare-la à la maquette de référence.
4. **Étape 4 : performance.** Mesure les images/s par chapitre (Playwright + `performance.now()`), applique le budget et donne-moi un tableau avant/après.
5. **Étape 5 : finitions.** Mobile, accessibilité, chargement progressif avec un écran d'attente aux couleurs du site.

À chaque étape : montre une capture, liste ce qui a changé et ce qui reste, puis attends mon accord avant de passer à la suivante.

## Fini quand

- Les 7 chapitres s'enchaînent sans saut, et chaque clic sur la timeline arrive au bon état.
- Aucune interpénétration, aucun scintillement d'ombre, aucun texte coupé.
- 60 images/s sur portable et 30 sur mobile (tableau de mesures fourni).
- `npm run build` produit un dossier `dist/` statique déployable tel quel.
