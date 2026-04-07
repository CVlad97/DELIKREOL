# DELIKREOL - Lite premium (WhatsApp-first)

DELIKREOL Lite premium est une experience locale premium, WhatsApp-first, concue pour commander des menus et offres locales en Martinique.
Le tunnel principal est: Home -> Vendeur/Menu -> Panier -> Checkout -> Validation WhatsApp -> Suivi.

## Stack
- React 18 + TypeScript + Vite + TailwindCSS
- Donnees catalogue via Google Sheets (CSV public) + fallback mock
- WhatsApp pour la confirmation et l'operationnel

## Demarrage rapide
```bash
npm install
cp .env.example .env
npm run dev
```

## Variables d'environnement (Lite premium)
Obligatoires:
- `VITE_LITE_MODE=true`
- `VITE_SHEETS_PUBLIC_URL="<url csv produits>"`

Recommandees:
- `VITE_WHATSAPP_NUMBER=59669653589`
- `VITE_BASE_PATH=/`

Optionnelles:
- `VITE_SHEETS_ORDERS_URL="<endpoint post commandes>"`

Important: avec Vite, les variables `VITE_*` sont lues au build. Sur GitHub Pages, le redeploiement est necessaire apres modification.

## Qualite
```bash
npm run typecheck
npm run build
npx playwright test
```

## Preview production locale
```bash
npm run build
npm run preview
```

## Fonctionnement Lite premium
- Catalogue charge depuis Google Sheets (CSV public), fallback mock si indisponible
- Checkout structure avec planification, entreprise, fidelite pilote
- Validation finale par WhatsApp (confirmation manuelle)

## Limites actuelles (connues)
- Paiement non integre (WhatsApp-first)
- ETA indicatif et confirmation manuelle
- Fidelite en mode pilote (activation manuelle)

## Documentation utile
- Tunnel Lite: `docs/LITE_TUNNEL.md`
- Google Sheets: `docs/GOOGLE_SHEETS_SETUP.md`
- Notes securite: `docs/SECURITY_NOTES.md`
- Operations: `docs/OPERATIONS.md`
- Installation generale: `docs/INSTALLATION.md`
- Deploiement: `docs/DEPLOIEMENT.md`

## Notes
- Ne jamais exposer de secret dans le frontend.
- Les donnees sensibles doivent passer par des variables GitHub/CI.
