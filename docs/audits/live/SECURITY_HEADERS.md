# SÉCURITÉ — Headers et exposition

**Date:** 2026-07-15

## HTTPS

- ✅ delikreol.com servé en HTTPS (GitHub Pages gère le certificat)
- ✅ Aucun mixed content détecté (toutes les assets en `/assets/` ou `https://`)

## Clés exposées dans le bundle

| Élément | Exposé | Risque |
|---------|--------|--------|
| VITE_SUPABASE_URL | ✅ (publique par design) | Aucun — URL publique |
| VITE_SUPABASE_ANON_KEY | ✅ (publique par design) | Aucun — clé publishable, RLS protège |
| VITE_STRIPE_PUBLISHABLE_KEY | ✅ (publique par design) | Aucun — clé publishable |
| Supabase service_role | ❌ Non présente | ✅ |
| Stripe secret key | ❌ Non présente | ✅ |
| GitHub token | ❌ Non présent | ✅ |

## Headers manquants (limitation GitHub Pages)

| Header | Impact | Mitigation |
|--------|--------|------------|
| X-Content-Type-Options: nosniff | MIME sniffing | — |
| Referrer-Policy | Fuite de referer | Ajouté via meta si possible |
| Permissions-Policy | Accès API non restreint | — |
| Content-Security-Policy | XSS, injection | — |
| Strict-Transport-Security | Downgrade SSL | — |
| X-Frame-Options | Clickjacking | — |

**Recommandation:** Pour ajouter ces headers, configurer Cloudflare devant GitHub Pages (plan gratuit suffit).

## target="_blank"

Tous les liens `target="_blank"` vérifiés ont `rel="noopener noreferrer"` ✅

## Formulaires

- Aucune donnée personnelle envoyée en clair vers une URL non-HTTPS
- Les formulaires utilisent Supabase (HTTPS) ou construisent un message WhatsApp (URL encode)
- Protection anti-double-envoi présente sur le panier (checkoutStatus guard)

## Routes admin

- ✅ Protégées par `ProtectedAdminRoute` (vérifie le rôle admin)
- ✅ Non accessibles sans authentification
