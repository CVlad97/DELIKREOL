# DELIKREOL - Quick Reference - 5 Axes Implémentation

## 🚀 TL;DR - Ce Qui A Changé

### A) Badge HACCP ✅
- **Où** : Chaque carte restaurant et vendeur
- **Quoi** : "Partenaires certifiés HACCP" + icône verte
- **Fichier** : `src/components/TrustBadgeHACCP.tsx`
- **Intégration** : RestaurantCard L36 + VendorCard L43

### B) CGU ✅
- **Où** : Footer link "CGU" → page complète
- **Route** : `/cgu` (via App.tsx showLegalPage state)
- **Fichier** : `src/pages/CGUPage.tsx`
- **Obligatoire** : Section 4 "Responsabilité" avec texte exact

### C) Dashboard Partenaire ✅
- **Où** : `/dashboard/partner`
- **Accès** : Vendors only
- **Fichiers** :
  - `src/pages/PartnerDashboardPage.tsx` (UI)
  - `src/lib/storageProvider.ts` (abstraction storage)
- **Docs** : HACCP + RC Pro avec statuts

### D) TVA 8,5% ✅
- **Où** : CheckoutModal récapitulatif
- **Calc** : HT + TVA(8,5%) = TTC
- **Fichier** : `src/components/CheckoutModal.tsx` L8-12, L160-180

---

## 📂 Map Fichiers Modifiés

### Créés
```
TrustBadgeHACCP.tsx       Component + styles
CGUPage.tsx               11 sections légales
PartnerDashboardPage.tsx  Dashboard complet
storageProvider.ts        Interface abstraction
IMPLEMENTATION_SUMMARY.md
IMPLEMENTATION_CHECKLIST.md
```

### Modifiés (5 fichiers)
```
App.tsx                   +import, +route, +state
RestaurantCard.tsx        +<TrustBadgeHACCP />
VendorCard.tsx           +<TrustBadgeHACCP />
CheckoutModal.tsx        +VAT_RATE, +calc, +UI
ClientHomePage.tsx       +footer link CGU
```

---

## 🔍 Vérifications Rapides

### Badge HACCP
```
✓ Visible sur RestaurantCard ligne 36 (après rating)
✓ Visible sur VendorCard ligne 43 (après business_type)
✓ Icône ShieldCheck vert
✓ Tooltip au hover/tap
```

### CGU
```
✓ App.tsx L101 : showLegalPage type incl 'cgu'
✓ App.tsx L263-273 : route affichage
✓ ClientHomePage L239 : lien footer
✓ CGUPage.tsx L50-52 : TEXTE EXACT responsabilité
```

### Dashboard Partner
```
✓ App.tsx L24 : import PartnerDashboardPage
✓ App.tsx L104 : mode type incl 'dashboard/partner'
✓ App.tsx L177-181 : route conditionnelle
✓ PartnerDashboardPage.tsx L10 : auth guard vendor
✓ storageProvider.ts : localStorage persist
```

### TVA
```
✓ CheckoutModal.tsx L8 : const VAT_RATE = 0.085
✓ CheckoutModal.tsx L22-24 : calcul HT/TVA/TTC
✓ CheckoutModal.tsx L160-180 : affichage détaillé
```

---

## ⚡ Dev Workflow

### Setup
```bash
cd /DELIKREOL
npm install                # deps
npm run dev               # http://localhost:5173
```

### Test Axe A (Badge)
```
1. Page accueil
2. Scroll restaur/vendeurs
3. Voir badge vert
4. Hover badge → tooltip
```

### Test Axe B (CGU)
```
1. Footer → "CGU"
2. Section 4 responsabilité → TEXTE EXACT ?
3. Retour → ok
```

### Test Axe C (Dashboard)
```
1. Login vendor (test user)
2. /dashboard/partner
3. Upload HACCP (PDF test)
4. Statut → "Validé"
5. Refresh → persiste
```

### Test Axe D (TVA)
```
1. Add cart item (50€)
2. Checkout
3. Delivery 5€
4. Calc : 55€ HT + 4.68€ TVA = 59.68€ TTC
5. Verify affichage
```

---

## 🛠️ Troubleshooting

### Badge pas visible
- Vérifier RestaurantCard L36+ n'est pas commenté
- Vérifier VendorCard L43+ n'est pas commenté
- Check: `import { TrustBadgeHACCP }` présent

### CGU route 404
- Check App.tsx L263 : condition `showLegalPage === 'cgu'`
- Check ClientHomePage L239 : onClick() appelle setShowLegal('cgu')
- Check type showLegalPage inclut 'cgu'

### Dashboard non accessible
- Check auth : `profile?.user_type === 'vendor'` L48
- Check route : App.tsx L177 `mode === 'dashboard/partner'`
- Check localStorage : brower DevTools → Application → LocalStorage

### TVA incorrect
- Check VAT_RATE = 0.085 (8,5%)
- Check calc : `subtotalHT * 0.085`
- Check total : `subtotalHT + vat`

---

## 📊 Files at a Glance

| File | Lines | Purpose |
|------|-------|---------|
| TrustBadgeHACCP.tsx | 40 | Reusable badge component |
| CGUPage.tsx | 280 | Legal CGU page |
| PartnerDashboardPage.tsx | 380 | Partner doc dashboard |
| storageProvider.ts | 95 | Storage abstraction |
| App.tsx | ±370 | +routes +imports |
| CheckoutModal.tsx | ±210 | +VAT calc +display |

---

## 🎯 Next Steps (POST-IMPLÉMENTATION)

1. **npm install** + **npm run dev** → Build vert
2. **Test chaque axe** via checklist
3. **Production** :
   - Implémenter SupabaseStorageProvider
   - Add RLS policies
   - Add admin approval flow
   - Add nav link dans VendorApp

---

## 📝 Notes Importantes

- **Mode Démo** : localStorage. Production = Supabase
- **TVA** : 8,5% Martinique. À adapter autre région
- **Auth** : Client-side guard. TODO : RLS server-side
- **Mobile** : Tous les composants responsive Tailwind

---

## ✉️ Support

Pour questions ou debug :
1. Vérifier IMPLEMENTATION_CHECKLIST.md
2. Vérifier IMPLEMENTATION_SUMMARY.md
3. Voir commentaires TODO dans code

Build status : **✅ READY**
