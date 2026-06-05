# DeliKreol — plan d'integration UI simple style Hostinger

## Objectif

Reprendre la structure simple vue dans Hostinger :

- menu clair avec liens directs ;
- categories visibles ;
- filtres multiples ;
- ville/commune visible ;
- espace partenaire pour simuler/preparer ses produits ;
- messages humains et rassurants ;
- phrase : Le meilleur est a venir.

## Fichiers deja pousses

- `src/data/martiniqueCommunes.ts`
- `src/data/simpleHostingerStyleStructure.ts`

## Elements a brancher dans `PublicHomePage.tsx`

### 1. Menu simple

Importer :

```ts
import { simpleMainMenuLinks } from '../data/simpleHostingerStyleStructure';
```

Afficher ces liens dans le header mobile/desktop :

- Commander ;
- Traiteurs ;
- Livraison ;
- Points relais ;
- Devenir partenaire ;
- Contact WhatsApp.

### 2. Categories visibles

Importer :

```ts
import { simpleCategoryFilters } from '../data/simpleHostingerStyleStructure';
```

Afficher les categories sous le hero ou au debut catalogue.

### 3. Filtres multiples

Importer :

```ts
import { simpleProductFilters } from '../data/simpleHostingerStyleStructure';
```

Afficher clairement :

- Ville / commune ;
- Categorie ;
- Traiteur ;
- Budget ;
- Retrait ou livraison ;
- Disponible / a confirmer.

### 4. Communes avec recherche tolerante

Importer :

```ts
import { martiniqueCommunes, findCommune, normalizeCommuneQuery } from '../data/martiniqueCommunes';
```

Remplacer les champs libres par une liste deroulante + saisie tolerante.

Cas a tester :

- Fort-de-France ;
- Fort de France ;
- FDF ;
- Riviere Pilote ;
- Rivière-Pilote ;
- Trois Ilets ;
- Trois-Îlets.

### 5. Espace partenaire pour simuler les produits

Importer :

```ts
import { partnerProductSimulatorFields } from '../data/simpleHostingerStyleStructure';
```

Afficher dans la zone partenaire :

- Nom du produit ;
- Ville / commune ;
- Categorie ;
- Prix ;
- Description courte ;
- Photo du plat ;
- Horaires de retrait ;
- Livraison possible ;
- Heure limite de commande ;
- Minimum de commande.

Message apres simulation :

`Produit enregistre en brouillon. DeliKreol le verifiera avant publication.`

### 6. Livraison eloignee win-win

Importer :

```ts
import { deliveryWinWinRules } from '../data/simpleHostingerStyleStructure';
```

Afficher :

`Livraison eloignee possible a partir de 100 EUR de commande, selon validation du prestataire et disponibilite DeliKreol.`

Ajouter bouton :

`Verifier la possibilite par WhatsApp`

### 7. Messages humains

Importer :

```ts
import { humanUxMessages } from '../data/simpleHostingerStyleStructure';
```

A utiliser :

- `Le meilleur est a venir.`
- `Votre demande a bien ete recue. Nous revenons vers vous rapidement par WhatsApp.`
- `Ajoutez un plat pour commencer.`
- `L heure limite est peut-etre depassee. On peut quand meme verifier avec le prestataire avant de refuser.`

## Tests avant publication

- Le menu est visible sur mobile.
- `Fort de France` trouve Fort-de-France.
- `FDF` trouve Fort-de-France.
- Le bouton Voir le panier centre le panier.
- Une saisie formulaire affiche un message visible.
- Le partenaire peut simuler un produit sans publication directe.
- Livraison eloignee affiche seuil 100 EUR et verification WhatsApp.
- Aucun paiement titre-restaurant n'est annonce comme actif.

## Decision

Ne pas publier officiellement `delikreol.mq` tant que ces elements ne sont pas branches et testes sur GitHub Pages.
