# DELIKREOL — Rollback paiements

## Désactiver Stripe public

1. Mettre `VITE_ENABLE_STRIPE_PUBLIC=false` dans les secrets GitHub Pages.
2. Relancer le workflow Pages.
3. Vérifier que le bouton Stripe n’apparaît plus dans le panier.

## Conserver le business

- WhatsApp-first reste opérationnel.
- Les commandes peuvent continuer avec `payment_provider = manual`.
- Les encaissements SumUp restent manuels hors plateforme.

## En cas d’incident webhook

- Ne pas supprimer les événements Stripe.
- Vérifier `stripe_webhook_events.processing_status`.
- Corriger la fonction, redéployer, puis laisser Stripe retry si l’événement est en échec.
