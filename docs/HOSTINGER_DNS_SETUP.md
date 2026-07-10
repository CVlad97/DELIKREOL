# DELIKREOL — Configuration DNS Hostinger → delikreol.com

## 1. Ajouter les enregistrements DNS dans Hostinger

Va dans Hostinger → hPanel → DNS Zone Editor → ajoute :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| **CNAME** | @ | `cvlad97.github.io` | 3600 |
| **CNAME** | www | `cvlad97.github.io` | 3600 |
| **TXT** | @ | `github-pages-verify=...` (voir étape 3) | 3600 |

> ⚠️ Supprime les anciens enregistrements A qui pointent vers Hostinger (sauf MX pour les emails)

## 2. Attendre la propagation DNS (5-30 min)

Vérifier avec :
```bash
ping delikreol.com
# ou
nslookup delikreol.com
```

## 3. Configurer GitHub Pages

Va sur https://github.com/CVlad97/DELIKREOL/settings/pages

- **Source** : Deploy from GitHub Actions (déjà configuré)
- **Custom domain** : `delikreol.com`
- **Enforce HTTPS** : ✅ Coche la case

GitHub va te donner un **TXT record** à ajouter dans Hostinger — copie-le dans l'étape 1.

## 4. Modifier la base URL dans le code

Le fichier `vite.config.ts` utilise déjà `VITE_BASE_PATH` avec fallback `'/'`.
Pour GitHub Pages, le build utilise `VITE_BASE_PATH=/DELIKREOL/`.
Pour le .com, on passe à `VITE_BASE_PATH=/`.

## 5. Mettre à jour les variables GitHub

Dans https://github.com/CVlad97/DELIKREOL/settings/secrets/actions :

| Variable | Valeur |
|----------|--------|
| `VITE_BASE_PATH` | `/` |
| `VITE_MARKET` | `intl` |
| `VITE_SUPABASE_URL` | `https://boihlgodmclljtckhmgz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(ta clé actuelle)* |
| `VITE_WHATSAPP_NUMBER` | `596696653589` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | *(si Stripe activé)* |

## 6. Rebuild et déploiement

```bash
# Le push déclenchera GitHub Actions
git add .
git commit -m "🚀 Migration delikreol.com"
git push origin main
```

## 7. Vérifier

```bash
curl -sI https://delikreol.com | grep HTTP
# Doit retourner : HTTP/2 200
```

## 8. Appliquer les migrations SQL

Dashboard Supabase → SQL Editor → coller les fichiers de `supabase/migrations/` → Run

## 9. Déployer les Edge Functions

```bash
npx supabase login
npx supabase link --project-ref boihlgodmclljtckhmgz
for fn in checkout-order create-payment-intent qonto-finance qonto-sync stripe-connect-onboard stripe-payout stripe-webhook; do
  npx supabase functions deploy $fn
done
```