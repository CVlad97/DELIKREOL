# DELIKREOL — Migration vers delikreol.com
# === ÉTAPES ===

## 1. Acheter le domaine
# Va sur NIC.mq ou Gandi → achète delikreol.com

## 2. Configurer DNS (Cloudflare — gratuit)
# Dans Cloudflare Dashboard :
#   - CNAME  @     → cvlad97.github.io
#   - CNAME  www   → cvlad97.github.io
#   - TXT    @     → validation GitHub Pages

## 3. Configurer GitHub Pages
# Dans https://github.com/CVlad97/DELIKREOL/settings/pages
#   - Custom domain → delikreol.com
#   - Enforce HTTPS → ✅

## 4. Déployer les Edge Functions Supabase
npx supabase login
npx supabase link --project-ref boihlgodmclljtckhmgz

for fn in checkout-order create-payment-intent qonto-finance qonto-sync stripe-connect-onboard stripe-payout stripe-webhook; do
  npx supabase functions deploy $fn
done

## 5. Appliquer les migrations SQL
# Dashboard Supabase → SQL Editor → coller les fichiers supabase/migrations/*.sql

## 6. Build et déploiement
git add .
git commit -m "🚀 Migration delikreol.com"
git push origin main
# GitHub Actions build + déploie automatiquement

## 7. Configurer les secrets GitHub
# Settings → Secrets → Actions
#   VITE_MARKET = intl
#   VITE_SUPABASE_URL = https://boihlgodmclljtckhmgz.supabase.co
#   VITE_SUPABASE_ANON_KEY = <la clé>
#   VITE_WHATSAPP_NUMBER = 596696653589
