# DELIKREOL — Go-live checklist

## Pré-production obligatoire

- `npm ci --legacy-peer-deps`
- `npm run typecheck`
- `npm run lint`
- `npm run test --if-present`
- `npm run build`
- `npm run audit:secrets --if-present`
- `npm audit --omit=dev`

## Paiements

- Stripe public activé uniquement avec `VITE_ENABLE_STRIPE_PUBLIC=true` et une clé `pk_test`.
- Secrets Stripe serveur configurés uniquement dans Supabase Functions.
- Webhook non signé vérifié en `401 Signature webhook manquante`.
- Paiement test `4242` validé de bout en bout avant toute demande de live.
- WhatsApp-first conservé comme fallback principal.

## SumUp

- SumUp reste manuel : encaissement dans l’app SumUp ou lien généré dans SumUp.
- Statut payé confirmé manuellement par admin/partenaire autorisé.
- Future intégration server-side à traiter avant automatisation : API SumUp, webhook, mapping `payment_status`, notification partenaire.
