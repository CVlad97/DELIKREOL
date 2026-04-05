# DEPLOYMENT_RUNBOOK

## Objectif
Deployer une version test/soft launch de DELIKREOL (front + ERP) avec cout minimal.

## ERP (local)
1. `cd /root/work/DELIKREOL/erp-backend`
2. `npm run db:generate`
3. `npm run db:migrate`
4. `npm run seed`
5. `npm run dev`
6. Healthcheck: `curl http://localhost:3001/health`

## Front (local)
1. `cd /root/work/DELIKREOL`
2. `VITE_ERP_API_URL=http://localhost:3001 npm run dev -- --host 0.0.0.0 --port 5173`
3. Verifier: `http://localhost:5173`

## GitHub Pages
1. Config `VITE_BASE_PATH="/<repo>/"` via workflow (deja en place).
2. Build: `npm run build`
3. Deploy via Actions `pages-deploy.yml`.

## Variables d'environnement
- `VITE_LITE_MODE` (optionnel)
- `VITE_WHATSAPP_NUMBER` (optionnel)
- `VITE_ERP_API_URL` (front)
- `VITE_ERP_FALLBACK_DEMO` (optionnel)
- `VITE_SHEETS_PUBLIC_URL` (optionnel)
- `VITE_SHEETS_ORDERS_URL` (optionnel)
- `ADMIN_TOKEN` (ERP, optionnel)
- `DB_FILE` (ERP, optionnel)

## Notes
Si GitHub Pages est utilise, `VITE_ERP_API_URL` doit pointer vers une API accessible publiquement.
