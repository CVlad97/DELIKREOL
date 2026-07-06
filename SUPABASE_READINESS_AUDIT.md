# DELIKREOL — Supabase Readiness Audit

Date: 2026-07-06
Source de verification: changelog Supabase consulte le 2026-07-06.

## Constats

- Le projet contient des migrations, Edge Functions Stripe/Qonto et stockage Supabase.
- RLS est activee sur les tables sensibles detectees.
- Des migrations historiques utilisent `auth.role()`, qui est a eviter dans les policies modernes.
- Certaines policies UPDATE historiques n'avaient pas toujours un `WITH CHECK` symetrique.

## Correction preparee

Migration ajoutee:

- `supabase/migrations/20260706000001_rls_policy_hardening.sql`

Elle durcit:

- Policies `storage.objects` du bucket `caterer-photos`.
- Policies `payments`, `payouts`, `stripe_webhook_events`.
- Policies `orders`, `partners`, `drivers`.

## Verification obligatoire avant paiement auto

1. Lancer les advisors Supabase.
2. Appliquer la migration sur environnement de test.
3. Tester role `anon`: lecture publique photos uniquement, insert public seulement sur formulaires prevus.
4. Tester role `authenticated`: acces limite aux lignes autorisees.
5. Tester admin: lecture/update backoffice.
6. Tester service role: webhooks Stripe uniquement cote serveur.
7. Ne pas activer Stripe production tant que ces tests ne sont pas passes.

