# DELIKREOL Lite premium - Operations

## Mise a jour catalogue
1. Mettre a jour la feuille Google Sheets (onglet Produits)
2. Verifier l'URL CSV publiee
3. Redeployer si l'URL a change (VITE_SHEETS_PUBLIC_URL)

## Tests avant livraison
```bash
npm run typecheck
npm run build
npx playwright test
```

## Deploiement GitHub Pages
- Les variables `VITE_*` sont lues au build
- Modifier les variables dans le workflow GitHub Pages
- Relancer un build/deploiement apres modification
 - `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` doivent etre presentes pour activer Supabase
 - `SUPABASE_SERVICE_ROLE_KEY` reste serveur uniquement

## Verification post-deploiement
- Home charge correctement
- Vue vendeur via cartes et deep-link `?vendor=...`
- Ajout panier et ouverture checkout
- CTA "Valider sur WhatsApp" genere un lien `https://wa.me/`
- Catalogue charge depuis Google Sheets (ou fallback mock)

## Incident simple
- Catalogue vide: verifier publication CSV
- CTA WhatsApp vide: verifier `VITE_WHATSAPP_NUMBER`
- Assets 404: verifier `VITE_BASE_PATH`
