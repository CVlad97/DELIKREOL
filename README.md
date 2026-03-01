# DELIKREOL - Le Gout de la Martinique

Plateforme e-commerce et logistique pour produits martiniquais: marketplace, fournisseurs locaux, livraison mutualisee, et outillage operationnel.

## Stack
- React 18 + TypeScript + Vite + TailwindCSS
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Stripe (paiements)
- Leaflet (cartographie et tracking)

## Demarrage rapide
```bash
npm install
cp .env.example .env
npm run dev
```

## Qualite
```bash
npm run typecheck
npm run build
```

## Deploiement
- Frontend: Vercel
- Backend: Supabase
- CI: GitHub Actions (`.github/workflows/webpack.yml`)

## Documentation
- Rapport mission: `docs/RAPPORT_MISSION_2026-03-01.md`
- Roadmap: `docs/ROADMAP_TECHNIQUE_2026.md`
- Installation: `docs/INSTALLATION.md`
- Deploiement: `docs/DEPLOIEMENT.md`
- Architecture agents: `docs/agents.md`
- Operations admin: `docs/admin-operations.md`

## Categories prioritaires UX
- Rhums
- Epices
- Artisanat
- Produits agricoles
- Produits transformes

## Notes
- Le mode demo est actif sans configuration Supabase.
- Les cles secretes ne doivent jamais etre stockees cote frontend.
