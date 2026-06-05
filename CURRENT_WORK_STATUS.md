# DeliKreol — statut de travail actuel

## Priorite en cours

Brancher progressivement la structure simple type Hostinger sans casser la page principale :

- menu simple ;
- categories visibles ;
- filtres multiples ;
- ville/commune ;
- panier visible ;
- confirmation des saisies ;
- livraison eloignee a partir de 40 EUR ;
- verification WhatsApp si hors zone ou horaire limite depasse ;
- espace partenaire pour preparer/simuler ses produits.

## Deja pousse

- `src/data/martiniqueCommunes.ts` : 34 communes + alias, dont Fort de France / FDF.
- `src/data/simpleHostingerStyleStructure.ts` : menu, categories, filtres, messages humains, seuil 40 EUR.
- `HOSTINGER_STYLE_UI_INTEGRATION_PLAN.md` : plan de branchement interface.
- `DEPLOY_TRIGGER_GITHUB_PAGES.md` : declencheur rebuild Pages avec seuil 40 EUR.

## Decision seuil livraison eloignee

Seuil retenu : 40 EUR.

Regle : livraison eloignee possible a partir de 40 EUR, seulement selon validation du prestataire et disponibilite DeliKreol.

## Points a brancher dans l interface

1. Recherche commune tolerante.
2. Liste deroulante commune.
3. Message visible apres saisie/formulaire.
4. Bouton Voir le panier centre sur le panier.
5. Message livraison eloignee 40 EUR.
6. Bouton verification WhatsApp.
7. Formulaire partenaire produit en brouillon.

## Limites

Ne pas publier officiellement `delikreol.mq` tant que GitHub Pages n est pas teste et valide.
Ne pas activer paiement ou titre-restaurant comme si c etait disponible.
