# Audit UberEats vs DeliKreol — 2026-06-24

## Portée

Ce document consolide le chantier demandé :

1. analyser les fonctionnalités clés d'une app de livraison type UberEats ;
2. comparer avec l'état du repo `CVlad97/DELIKREOL` ;
3. prioriser les écarts ;
4. tracer les correctifs appliqués.

Note de vérification : l'analyse produit ci-dessous est basée sur les parcours standards observables des applications de livraison de repas et sur le code du repo. La vérification web live n'a pas été possible dans cette exécution ChatGPT, car l'accès web était désactivé côté environnement.

## Features clés attendues pour un parcours type UberEats

### Client

- géolocalisation ou adresse de livraison dès l'entrée ;
- recherche rapide par plat, restaurant, catégorie, disponibilité et prix ;
- fiches plats avec prix, image, disponibilité, vendeur, délai estimé ;
- panier persistant avec quantité, suppression, frais et total clair ;
- checkout avec adresse obligatoire si livraison à domicile ;
- choix du mode de paiement ;
- confirmation après création réelle de commande ;
- suivi commande avec statuts lisibles : reçue, confirmée, préparation, prête, livraison, livrée ;
- support ou fallback humain en cas de problème.

### Opérations / traiteurs / livreurs

- dashboard commandes par statut ;
- visibilité sur nouvelles commandes ;
- acceptation/refus ou préparation ;
- suivi livreur ou statut logistique ;
- preuve de contact client ;
- données exploitables pour facturation, commission et reporting.

## État repo avant correctifs du 2026-06-24

### Points déjà présents

- Catalogue client avec recherche, catégories, panier, carte et points relais.
- Checkout avec livraison/retrait, adresse obligatoire si livraison, frais, commission incluse et choix paiement.
- Création de commande via `ordersService.create`.
- Fallback WhatsApp en cas de backend indisponible.
- Page “Mes commandes” avec composant de suivi.

### Gaps critiques détectés

| Priorité | Écart | Impact |
|---|---|---|
| P0 | Le suivi commande utilisait encore `blink.db` au lieu du service commandes actuel. | Une commande créée pouvait ne pas être retrouvée dans le suivi. |
| P0 | Après checkout, la nouvelle commande n'était pas injectée immédiatement dans l'état client. | Le client pouvait ne pas voir sa commande sans rechargement. |
| P0 | Le succès checkout se limitait à une alerte, sans lien d'action visible si WhatsApp/paiement devait être finalisé. | Risque de perdre la conversion après création. |
| P1 | `ordersService.getById` ne chargeait pas les relations `items`/`delivery`. | Suivi incomplet et moins fiable. |
| P1 | Le mode démo ne conservait pas certains détails utiles comme l'adresse et les notes. | Simulation moins réaliste. |
| P2 | ETA, disponibilité temps réel, annulation/remboursement, notation, promotions et support structuré restent à renforcer. | Écart avec expérience UberEats mature. |

## Correctifs appliqués

### 1. Checkout sécurisé

Fichier : `src/components/CheckoutModal.tsx`

- Ajout de `onOrderCreated` pour notifier l'app client après création réelle.
- Création d'un écran de succès avec numéro de commande.
- Ajout d'un bouton “Confirmer sur WhatsApp” visible après création.
- Ajout d'un bouton lien bancaire si `VITE_BANK_PAYMENT_URL` existe.
- Conservation du panier en cas d'erreur backend ; le panier n'est vidé qu'après succès serveur/service.
- Bouton checkout désactivé si panier vide.

Commit : `5a380f9eece1cb0f33da9671fe03c27ff16318d4`

### 2. Affichage immédiat de la commande

Fichier : `src/pages/CustomerApp.tsx`

- Ajout de `handleOrderCreated(order)`.
- Insertion immédiate de la nouvelle commande dans `orders`.
- Redirection de l'utilisateur vers la vue `orders` après checkout.

Commit : `7e64cdd72c75545fa830534e15d386d7356ec480`

### 3. Suivi commande branché sur le bon service

Fichier : `src/components/OrderTracking.tsx`

- Remplacement de `blink.db` par `ordersService.getById`.
- Ajout du statut `ready`.
- Ajout d'un état d'erreur clair avec bouton “Réessayer”.
- Lecture de `order.delivery` si disponible.

Commit : `a683b250adaa18124359b4843702c043e4e3eaa9`

### 4. Service commandes renforcé

Fichier : `src/services/ordersService.ts`

- Ajout d'un normaliseur `normalizeOrder`.
- `listAll`, `listByUser`, `getById` et `updateStatus` chargent désormais `items` et `delivery` quand Supabase le permet.
- Le mode démo conserve désormais `delivery_address` et `notes`.
- La création Supabase insère les items puis retourne une commande normalisée.

Commit : `710ce70f607ea42740a4b9be882c43c5396b1ee4`

## Priorités restantes

### P1 — à faire ensuite

- vérifier en prod le parcours : ajout panier → checkout → commande créée → “Mes commandes” → suivi ;
- vérifier que les relations Supabase `orders -> order_items` et `orders -> deliveries` correspondent bien aux noms utilisés dans `orderSelect` ;
- ajouter une vraie page ou modale détail commande avec contenu du panier, traiteur, téléphone, paiement et statut ;
- rendre les frais de livraison dynamiques selon commune, zone, point relais ou distance ;
- ajouter des statuts côté traiteur/admin : accepter, préparer, prêt, assigner livreur, livré.

### P2 — différenciation DeliKreol

- créneaux antillais / traiteur / événement ;
- livraison mutualisée et points relais ;
- WhatsApp Business comme canal de confirmation premium ;
- sourcing produits locaux ;
- packs entreprises / événements / Ariane / croisière ;
- reporting commission, marge, paiement traiteur, paiement livreur.

## Test manuel recommandé

1. Ouvrir `https://cvlad97.github.io/DELIKREOL/?/customer-app&mode=simulation`.
2. Ajouter un produit au panier.
3. Passer à la caisse.
4. Choisir livraison, saisir une adresse.
5. Choisir WhatsApp.
6. Valider la commande.
7. Vérifier : écran succès, lien WhatsApp, panier vidé, vue “Mes commandes”.
8. Vérifier : carte de suivi visible avec numéro, total, adresse et statut.

## Limites non vérifiées automatiquement

- Build local non exécuté dans cette session, car le clone GitHub par réseau direct n'était pas accessible depuis l'environnement local.
- Déploiement GitHub Pages / Actions à contrôler dans GitHub après le dernier commit sur `main`.
- Test Supabase réel à faire avec les variables de production actives.
