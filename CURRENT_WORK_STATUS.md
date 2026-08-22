# DeliKreol — statut de travail actuel

## Audit du 22 août 2026

Le site public `delikreol.com` est accessible. Le dépôt GitHub principal est `CVlad97/DELIKREOL`, branche `main`.

La branche de correction `fix/delikreol-go-live-20260822` sert à préparer un correctif vérifiable sans modifier `main`.

## Décision de lancement

- Pilote manuel assisté : possible après tests réels.
- Stripe live : désactivé.
- SumUp : non intégré.
- Paiement et coordination : WhatsApp / validation humaine pendant le pilote.
- Livraison éloignée : possible à partir de 40 €, selon validation et disponibilité.

## Points à vérifier avant annonce publique

1. Catalogue et panier avec une commande réelle de test.
2. Création serveur de commande et idempotence.
3. Réception de la commande par l'équipe.
4. Suivi de commande avec token.
5. Cohérence des coordonnées de contact.
6. Sécurité Supabase : six tables publiques sans RLS à classer et corriger.
7. Paiements : ne pas afficher Stripe ou SumUp comme disponibles avant validation.

## Limites connues

- La PR historique #8 est fermée sans merge.
- L'accès Hostinger Mail disponible dans l'environnement pointe actuellement vers `contactcvs@ikabay.store`, pas vers une boîte Delikreol confirmée.
- Aucun accès de gestion VPS/domaine Hostinger ni connecteur SumUp n'est disponible dans la session actuelle.
