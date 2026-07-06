# DELIKREOL — Supabase Migration Test Plan

Date: 2026-07-06
Migration cible: `supabase/migrations/20260706000001_rls_policy_hardening.sql`

## Statut

La migration est preparee localement mais non appliquee a une base distante.
La CLI Supabase n'est pas installee dans cet environnement.

## Ordre de verification avant application production

1. Connecter Supabase CLI ou MCP Supabase.
2. Appliquer la migration sur une branche/projet de test.
3. Lancer les advisors Supabase.
4. Tester `anon`:
   - lecture publique du bucket `caterer-photos`.
   - aucune lecture des paiements, payouts, webhooks.
5. Tester `authenticated`:
   - lecture `orders` seulement si telephone profile correspond.
   - lecture/update `partners` seulement si email profile correspond.
   - lecture/update `drivers` seulement si email profile correspond.
6. Tester admin:
   - `public.is_delikreol_admin()` doit donner acces backoffice.
7. Tester service role:
   - webhooks Stripe et update paiement serveur uniquement.
8. Ne pas activer Stripe production tant que ces tests ne sont pas passes.

## Commandes a utiliser quand Supabase CLI est disponible

```bash
supabase --version
supabase db lint --help
supabase migration list --linked
supabase db push --dry-run
```

