# DELIKREOL — Stripe test runbook

## Configuration attendue

- Frontend GitHub Pages : `VITE_ENABLE_STRIPE_PUBLIC=true` et clé publique `pk_test`.
- Supabase Functions : clé secrète Stripe test et secret webhook configurés côté secrets Supabase.
- Stripe live interdit tant que le test E2E n’est pas validé.

## Test E2E

1. Se connecter à `Mon espace`.
2. Ajouter un produit au panier.
3. Renseigner téléphone, commune et créneau.
4. Cliquer `Tester le paiement CB sécurisé`.
5. Utiliser la carte test Stripe `4242 4242 4242 4242`.
6. Vérifier le retour succès.
7. Vérifier en base :
   - `orders.payment_status = 'paid'`
   - `orders.payment_method = 'card'`
   - `orders.stripe_checkout_session_id` renseigné
   - `stripe_webhook_events.processing_status = 'processed'`
   - `order_events.event_type` contient `stripe_checkout_completed` ou `payment_succeeded`

## Contrôles négatifs

- Appel webhook sans signature : doit retourner `401`.
- Clé `pk_live` côté frontend : bouton Stripe non visible.
- Utilisateur non connecté : redirection vers connexion, WhatsApp reste disponible.
