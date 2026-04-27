# Installation Locale

## Prerequis
- Node.js 20 LTS recommande
- npm 10+
- Compte Supabase (optionnel en mode demo)

## Etapes
1. Installer les dependances:
```bash
npm install
```

2. Configurer l'environnement:
```bash
cp .env.example .env
```

3. Variables minimales:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY` (si checkout)

4. Lancer en local:
```bash
npm run dev
```

## Verification
```bash
npm run typecheck
npm run build
```

## Mode demo
Sans variables Supabase, l'application fonctionne en mode demo avec stockage local.
