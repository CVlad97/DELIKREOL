# DELIKREOL - Manual Testing Guide

## 🎬 Setup Initial

```bash
cd c:\Users\ADMIN\Documents\GitHub\DELIKREOL
npm install           # Si dépendances pas installées
npm run dev          # Démarre http://localhost:5173
```

Attendre "ready on http://localhost:5173" dans le terminal.

---

## ✅ AXE A - Badge HACCP (Valorisation Sanitaire)

### Où tester
1. Ouvrir http://localhost:5173
2. Aller à la **page d'accueil client** (pas loggé)
3. Scroller vers **"Pépites locales du moment"** (section produits)

### Points de Contrôle

#### Badge Visuel
- [ ] Chaque produit local affiche un badge vert "Partenaires certifiés HACCP"
- [ ] Icône **verte** `ShieldCheck` présente à gauche du texte
- [ ] Texte blanc sur fond vert clair
- [ ] Pas de débordement sur petits écrans (mobile)

#### Tooltip Interactif
- **Desktop** : Hovrer sur badge → tooltip noir s'affiche avec texte exact
- **Mobile** : Tap sur badge → tooltip s'affiche/disparaît
- [ ] Texte tooltip : "Ce partenaire garantit le respect strict des normes d'hygiène et de sécurité alimentaire en vigueur."
- [ ] Flèche pointant vers le badge
- [ ] Tooltip disparaît en cliquant ailleurs

#### Positions Visibles
- [ ] **RestaurantCard** : Sous le nom/catégorie du restaurant (après rating)
- [ ] **VendorCard** : Sous le type de business (après "Restaurant/Producteur/Commerçant")
- [ ] **LocalProductCard** : Si produit local, badge visible

### Test Mobile
1. DevTools F12 → Mode responsive (iPhone 12)
2. Vérifier badge reste lisible (texte pas coupé, icône visible)
3. Tap badge → tooltip fonctionne

---

## ✅ AXE B - Conditions Générales (CGU)

### Où tester
1. Rester sur http://localhost:5173
2. **Footer** en bas de page → bouton **"CGU"** (à côté Mentions légales)
3. Click "CGU"

### Points de Contrôle

#### Affichage Page
- [ ] Page charge avec titre noir "Conditions Générales d'Utilisation"
- [ ] Sous-titre "DELIKREOL - Plateforme logistique martiniquaise"
- [ ] Date "Dernière mise à jour : [date aujourd'hui]"

#### 11 Sections Présentes
- [ ] 1. Définitions
- [ ] 2. Acceptation des Conditions
- [ ] 3. Description des Services
- [ ] 4. **Responsabilité** (ROUGE/IMPORTANT)
- [ ] 5. Compte Utilisateur
- [ ] 6. Paiements et Tarification
- [ ] 7. Commandes et Annulation
- [ ] 8. Propriété Intellectuelle
- [ ] 9. Limitations de Responsabilité
- [ ] 10. Modifications des Conditions
- [ ] 11. Loi Applicable
- [ ] 12. Contact

#### Section Responsabilité (CRITIQUE)
```
Vérifier EXACTEMENT ce texte présent :
"DELIKREOL agit exclusivement en tant que plateforme technique de mise en relation. 
La responsabilité de la production alimentaire (normes HACCP), de la sécurité sanitaire 
et de la logistique de livraison incombe exclusivement au partenaire traiteur sélectionné."
```
- [ ] Texte présent exactement (copie-collage ok)
- [ ] Encadré en rouge (bg-red-950/40, border rouge)
- [ ] Lisible et formellement présenté

#### Navigation
- [ ] Bouton "Retour" en haut-gauche fonctionne
- [ ] Retour → page d'accueil
- [ ] Footer en bas avec "© 2024 DELIKREOL"

### Test Mobile
1. DevTools F12 → iPhone 12
2. [ ] Page responsive (texte lisible, pas débordement)
3. [ ] Sections empilées verticalement
4. [ ] Bouton "Retour" accessible

---

## ✅ AXE C - Dashboard Partenaire (Espace Documentaire)

### Prérequis
Vous devez être **vendor** (vendeur) pour accéder.
Utiliser un compte test vendor ou créer un.

### Où tester
1. **Option A** : Direct `/dashboard/partner` dans URL
2. **Option B** : Depuis VendorApp (menu - TODO : nav link existe pas encore)

### Navigation
```
1. Login (ou créer compte)
2. Mode "Pro" → sélectionner "Vendeur"
3. Onboarding → créer profil vendor
4. Once vendor profile active → `/dashboard/partner`
```

### Points de Contrôle

#### Header
- [ ] Titre "Tableau de bord partenaire" visible (vert/emerald)
- [ ] Sous-titre "Gérez vos certifications et documents"

#### Info Banner
- [ ] Banneau bleu "Mode démo actif" visible en haut
- [ ] Texte : "Les documents sont stockés localement..."
- [ ] Clarité : utilisateur comprend fichiers NON sur serveur

#### Bloc HACCP
```
┌─────────────────────────┐
│ 📄 Attestation HACCP    │
│ Formation hygiène...    │
├─────────────────────────┤
│ Statut : [badge]        │
│ Téléchargé : -          │
│ [Dropdown statut]       │
│ [Delete button]         │
│ [Upload button]         │
└─────────────────────────┘
```
- [ ] Titre avec icône FileText
- [ ] Si PAS de doc : message "Aucun document" + bouton "Téléverser"
- [ ] Si doc EXISTS : voir statut, date, boutons Edit/Delete

**Actions** :
- [ ] Click "Téléverser HACCP" → docType HACCP sélectionné
- [ ] Upload PDF → statut changé "En attente"
- [ ] Dropdown statut change "Validé" → persiste en localStorage
- [ ] Button delete → demande confirmation

#### Bloc RC Pro
- [ ] Même layout que HACCP
- [ ] Titre "Assurance RC Pro"
- [ ] Sous-titre "Responsabilité civile..."
- [ ] Identique fonctionnement

#### Upload Form
Après click "Téléverser" :
```
1. Select Doc Type (2 boutons : HACCP / RC Pro)
2. Select File (PDF/PNG/JPG max 10MB)
3. (Si RC Pro) Date d'expiration optional
4. Click "Téléverser le document"
```

**Validations** :
- [ ] Sélectionner .docx → erreur "Format non autorisé. Acceptés : PDF, PNG, JPG"
- [ ] Sélectionner 50MB file → erreur "Fichier trop volumineux (max 10MB)"
- [ ] Sélectionner PDF valide → upload success, doc visible dans bloc
- [ ] Date RC Pro : 2025-12-31 saisie ok

#### LocalStorage Persistence
1. Upload HACCP PDF
2. Refresh page (F5)
3. [ ] Document toujours visible
4. [ ] Statut conservé
5. [ ] Date upload conservée

### Test Mobile
1. DevTools iPhone 12
2. [ ] 2 blocs HACCP+RC en colonne
3. [ ] Upload form lisible
4. [ ] Boutons pleine largeur
5. [ ] Pas de scroll horizontal

---

## ✅ AXE D - TVA 8,5% (Checkout)

### Où tester
1. Page client accueil
2. Ajouter produit au panier (add to cart)
3. Click "Panier" ou "Checkout"
4. Modal s'ouvre "Finaliser la commande"

### Points de Contrôle

#### Récapitulatif Affichage
```
ANCIEN (AVANT) :
  Articles (1)        €50.00
  Frais livraison     €5.00
  Total              €55.00

NOUVEAU (APRÈS) :
  Articles (1)        €50.00
  Frais livraison     €5.00
  ─────────────────────────
  Sous-total HT      €55.00
  TVA (8,5%)         €4.68
  ═════════════════════════
  Total TTC          €59.68
```

**Vérifier** :
- [ ] "Sous-total HT" ligne nouvelle présente
- [ ] Calcul exact : 55 € × 0.085 = 4.675 → 4.68€ (2 decimales)
- [ ] TVA ligne en gras
- [ ] Total TTC ligne "Total TTC" (pas juste "Total")
- [ ] Montant final correct

#### Cas de Test

**Cas 1 : Avec livraison à domicile**
```
Articles         €50.00
Livraison        €5.00
─────────────────────
Sous-total HT    €55.00
TVA (8,5%)       €4.68
═════════════════════
Total TTC        €59.68
```
- [ ] Calc correct : (50+5) * 1.085 = 59.675 ≈ 59.68

**Cas 2 : Sans livraison (pickup)**
```
Articles         €50.00
Livraison        €0.00
─────────────────────
Sous-total HT    €50.00
TVA (8,5%)       €4.25
═════════════════════
Total TTC        €54.25
```
- [ ] Calc correct : 50 * 1.085 = 54.25

**Cas 3 : Montants différents**
```
Articles         €100.00
Livraison        €5.00
─────────────────────
Sous-total HT    €105.00
TVA (8,5%)       €8.93
═════════════════════
Total TTC        €113.93
```
- [ ] Calc correct : 105 * 0.085 = 8.925 → 8.93

#### Button Confirmation
- [ ] Button text : "Confirmer et payer €59.68" (montant TTC correct)

#### Test Pickup vs Delivery
1. Toggle "Livraison" → "Retrait"
2. [ ] Frais livraison = 0€
3. [ ] TVA recalculée (sur montant articles seulement)
4. [ ] Total TTC = articles + 0 + TVA

---

## 🔄 Test Flow Complet (5 min)

```bash
1. npm run dev
2. http://localhost:5173

A) BADGE HACCP (1 min)
   - Page accueil
   - Voir badge vert produits locaux
   - Hover tooltip → texte ok
   - Mobile test (F12 responsive) → responsive ok

B) CGU (1 min)
   - Footer "CGU"
   - Section 4 responsabilité texte EXACT ✓
   - Click "Retour" → ok

C) DASHBOARD PARTNER (2 min)
   - /dashboard/partner
   - Upload HACCP (PDF test)
   - Changez statut "Validé"
   - Refresh → persiste
   - Delete → confirmation

D) TVA (1 min)
   - Add cart item €50
   - Checkout
   - Voir "Sous-total HT" €50+5=€55
   - Voir "TVA (8,5%)" €4.68
   - Voir "Total TTC" €59.68
   - Montants exacts ✓
```

---

## 🐛 Debugging

### Badge pas visible
```
1. DevTools → Elements → rechercher "TrustBadgeHACCP"
2. Vérifier className="... px-3 py-1.5 bg-green-100 ..." présent
3. Si rien, vérifier import dans RestaurantCard/VendorCard
```

### CGU 404
```
1. Check URL : http://localhost:5173/#/cgu ?
2. Check Console (F12) pour erreurs routing
3. Vérifier App.tsx showLegalPage state
```

### Dashboard auth
```
1. Check localStorage user.user_type = 'vendor'
2. F12 → Application → Storage → LocalStorage
3. Vérifier profile?.user_type exact match
```

### TVA calc wrong
```
1. F12 → Console → 
   55 * 0.085 = 4.675
   55 + 4.675 = 59.675
2. Vérifier CheckoutModal.tsx L8 VAT_RATE = 0.085
3. Vérifier calc L22-24
```

---

## ✅ Validation Finale

Tous les tests PASS ? → **GO FOR PRODUCTION**

```
A) Badge ✓
B) CGU ✓
C) Dashboard ✓
D) TVA ✓
```

→ Code prêt à merger ! 🚀
