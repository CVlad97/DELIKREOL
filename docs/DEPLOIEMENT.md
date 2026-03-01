# Deploiement Cloud (Vercel + Supabase)

## 1. Frontend (Vercel)
- Connecter le repository GitHub a Vercel
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Variables Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Le fichier `vercel.json` gere le fallback SPA vers `index.html`.

## 2. Backend (Supabase)
- Creer projet Supabase prod
- Appliquer migrations SQL (`supabase/migrations`)
- Deployer Edge Functions (`supabase/functions`)
- Configurer secrets server-side (Stripe secret key, Meta, OpenAI)

## 3. CI/CD
Pipeline GitHub Actions active:
- `npm ci`
- `npm run typecheck`
- `npm run build`

## 4. Checklist pre-go-live
- DNS domaine principal
- Monitoring erreurs front (Sentry ou equivalent)
- Sauvegarde base + procedure rollback
- Test paiement bout-en-bout en mode test Stripe
