# transfertFACT 3D — règles du projet

## Contexte
Vitrine web 3D (film d'environ une minute) pour transfertFACT : centralisation des factures issues des différentes Plateformes Agréées, à destination des cabinets d'expertise comptable. La maquette de référence est `reference/maquette-multipa.html` (scénario, textes, cadrages). `reference/maquette-film.html` est une version antérieure, à titre d'inspiration seulement.

## Interlocuteur
Charly, comptable et CSM, perfectionniste. Avance par petites étapes validées. À chaque étape : une capture, ce qui a changé, ce qui reste. Pas de longs pavés.

## Règles
- Textes de l'interface en français. Code et commentaires : noms explicites, commentaires courts.
- Logos des PA : uniquement ceux de `assets/logos/`. Ne jamais en télécharger ni en redessiner d'autres.
- Assets tiers : licences CC0 ou CC-BY uniquement, toutes listées dans `CREDITS.md`.
- Données affichées (clients, factures, montants) : fictives.
- Faits réglementaires : ne pas les modifier sans source officielle (impots.gouv.fr, economie.gouv.fr).
- Animation : toujours dérivée du temps du film T (pas d'état accumulé), pour que la timeline puisse sauter n'importe où.
- Performance : respecter le budget de `PROMPT.md` ; mesurer avant d'affirmer qu'un réglage est « optimisé ».

## Commandes
- `npm run dev` : serveur de développement
- `npm run build` : build statique dans `dist/`
- Captures de vérification : script Playwright dans `scripts/`
