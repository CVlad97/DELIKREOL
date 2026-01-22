# DELIKREOL - Implémentation Complète - Checklist de Vérification

## ✅ Fichiers Créés/Modifiés

### A) Badge HACCP - Confiance Sanitaire

#### Créés :
- `src/components/TrustBadgeHACCP.tsx` - Composant réutilisable badge HACCP avec tooltip accessible
  - Icône ShieldCheck (vert)
  - Tooltip au survol + fallback title pour mobile
  - Classes Tailwind responsive

#### Modifiés :
- `src/components/RestaurantCard.tsx` - Ajout TrustBadgeHACCP sous le nom
- `src/components/VendorCard.tsx` - Ajout TrustBadgeHACCP sous le nom

**Style** : Badge vert `bg-green-100 text-green-700` avec icône `ShieldCheck`

---

### B) Conditions Générales d'Utilisation (CGU)

#### Créés :
- `src/pages/CGUPage.tsx` - Page CGU complète avec :
  - Section "Responsabilité" OBLIGATOIRE (copie conforme du texte demandé)
  - 11 sections légales (Définitions, Acceptation, Services, Responsabilité, Compte, Paiements, Commandes, PI, Limitations, Modifications, Loi)
  - Design cohérent avec le reste du projet (dark theme)

#### Modifiés :
- `src/App.tsx` :
  - Importe `CGUPage`
  - Ajoute `'cgu'` aux types `showLegalPage`
  - Ajoute route conditionnelle pour afficher CGUPage
- `src/pages/ClientHomePage.tsx` :
  - Ajoute bouton "CGU" dans le footer avec lien vers `/cgu`

---

### C) Dashboard Partenaire avec Gestion Documentaire

#### Créés :
- `src/lib/storageProvider.ts` - Interface abstraite pour stockage :
  - `StorageProvider` interface (4 méthodes : upload, get, updateStatus, delete)
  - `DemoStorageProvider` impl. localStorage (dev mode)
  - TODO : SupabaseStorageProvider pour production
  - Métadonnées : id, partner_id, doc_type, status, uploaded_at, expires_at, file_name

- `src/pages/PartnerDashboardPage.tsx` - Dashboard complet :
  - Authentification : réservé aux vendeurs (`profile?.user_type === 'vendor'`)
  - 2 blocs : HACCP + RC Pro avec statuts (En attente/Validé/Expiré)
  - Upload multi-format : PDF + PNG + JPG (max 10MB)
  - Métadonnées : date upload, expiration (RC Pro), statut, suppression
  - Mode démo actif banner pour clarifier stockage local
  - Mobile-first responsive

#### Modifiés :
- `src/App.tsx` :
  - Importe `PartnerDashboardPage`
  - Ajoute `'dashboard/partner'` aux types mode
  - Ajoute route : `if (mode === 'dashboard/partner')` → affiche dashboard via MainShell

---

### D) TVA 8,5% - Checkout

#### Modifiés :
- `src/components/CheckoutModal.tsx` :
  - Ajoute `const VAT_RATE = 0.085` (configurable)
  - Calcul : `subtotalHT = total + deliveryFee`
  - Calcul TVA : `vat = subtotalHT * VAT_RATE`
  - Total TTC : `finalTotal = subtotalHT + vat`
  - Affichage détaillé :
    - Articles (€)
    - Frais livraison (€)
    - **Sous-total HT** (€)
    - **TVA (8,5%)** (€) - en gras
    - **Total TTC** (€) - gros titre

---

## 📋 Commandes de Test/Build

```bash
# 1. Installation des dépendances (si pas encore fait)
npm install

# 2. Vérification TypeScript
npm run typecheck

# 3. Linting
npm run lint

# 4. Build production
npm run build

# 5. Dev server local
npm run dev
```

---

## ✔️ Checklist Manuelle de Vérification

### A) Badge HACCP ✓
- [ ] Visible sur chaque carte de restaurant (RestaurantCard)
- [ ] Visible sur chaque carte de vendeur (VendorCard)
- [ ] Icône verte `ShieldCheck` présente
- [ ] Texte "Partenaires certifiés HACCP" lisible
- [ ] Tooltip s'affiche au survol (hover)
- [ ] Tooltip fonctionne au tap sur mobile
- [ ] Pas de débordement de layout sur mobile
- [ ] Texte tooltip exact : "Ce partenaire garantit le respect strict des normes d'hygiène et de sécurité alimentaire en vigueur."

### B) Page CGU ✓
- [ ] Route /cgu accessible (click bouton footer "CGU")
- [ ] Titre principal "Conditions Générales d'Utilisation" visible
- [ ] 11 sections affichées
- [ ] Section 4 "Responsabilité" avec TEXTE EXACT présent :
  ```
  "DELIKREOL agit exclusivement en tant que plateforme technique de mise en relation. La responsabilité de la production alimentaire (normes HACCP), de la sécurité sanitaire et de la logistique de livraison incombe exclusivement au partenaire traiteur sélectionné."
  ```
- [ ] Design dark cohérent
- [ ] Lien "Retour" fonctionne
- [ ] Footer avec "© 2024 DELIKREOL"
- [ ] Responsive (mobile, tablet, desktop)

### C) Dashboard Partenaire ✓
- [ ] Route /dashboard/partner accessible (navigation depuis VendorApp)
- [ ] Titre "Tableau de bord partenaire" visible
- [ ] Info banner "Mode démo actif" affichée
- [ ] 2 blocs : HACCP + RC Pro présents

**Bloc HACCP :**
- [ ] Titre "Attestation HACCP"
- [ ] Sous-titre "Formation hygiène et sécurité alimentaire"
- [ ] Badge de statut (En attente/Validé/Expiré) visible
- [ ] Bouton "Téléverser HACCP" ou "Mettre à jour"

**Bloc RC Pro :**
- [ ] Titre "Assurance RC Pro"
- [ ] Sous-titre "Responsabilité civile professionnelle à jour"
- [ ] Badge de statut (En attente/Validé/Expiré) visible
- [ ] Champ "Date d'expiration" après sélection RC Pro
- [ ] Bouton "Téléverser Assurance" ou "Mettre à jour"

**Upload Form :**
- [ ] Sélection type document (HACCP / RC Pro) - boutons radio style
- [ ] Input file accepte `.pdf, .png, .jpg, .jpeg`
- [ ] Message d'erreur si format non autorisé (ex: .docx)
- [ ] Message d'erreur si taille > 10MB
- [ ] Drag-drop possible
- [ ] Statut upload (En attente/Validé/Expiré) modifiable via `<select>`
- [ ] Bouton "Téléverser le document" actif/désactivé correctement
- [ ] Mobile-first : layout en colonne, boutons pleine largeur

**LocalStorage (Mode démo) :**
- [ ] Documents persistés dans localStorage
- [ ] Rechargement page → documents restent
- [ ] Suppression via bouton ✓ supprime
- [ ] Modification statut ✓ met à jour

### D) TVA 8,5% CheckoutModal ✓
- [ ] RecapitulatifCheckout affiche :
  - [ ] "Articles (n) €"
  - [ ] "Frais de livraison €"
  - [ ] "Sous-total HT €" (nouvelle ligne)
  - [ ] "TVA (8,5%) €" (nouvelle ligne, gras)
  - [ ] "Total TTC €" (gros titre)
- [ ] Calcul correct : subtotal = items + delivery, vat = subtotal * 0.085, total = subtotal + vat
- [ ] Exemple : 50€ articles + 5€ livraison = 55€ HT, TVA 4,68€, **Total 59,68€ TTC**
- [ ] Bouton confirmation affiche correct : "Confirmer et payer XX,XX €"
- [ ] Pas d'erreur TypeScript
- [ ] Fonctionne en mode pickup (0€ delivery) aussi

---

## 📊 État d'Implémentation

| Axe | Status | Details |
|-----|--------|---------|
| A) Badge HACCP | ✅ COMPLET | Composant réutilisable, intégré cartes |
| B) CGU | ✅ COMPLET | Page 11 sections, texte légal obligatoire |
| C) Dashboard Partner | ✅ COMPLET | Upload docs, statuts, demo localStorage |
| D) TVA 8,5% | ✅ COMPLET | Affichage HT/TVA/TTC détaillé |

---

## 🚀 Architecture - Notes de Production

### Storage Provider Pattern
- **Actuel** : `DemoStorageProvider` (localStorage)
- **Futur** : Basculer vers `SupabaseStorageProvider` quand prêt
- **Avantage** : Interface unique, facile changement backend

### TVA Configurable
- Constant `VAT_RATE = 0.085` centralisé
- Facile à modifier pour autre taux (ex: 5.5% pour autre région)
- Évite "magic numbers" éparpillés

### Authentification Dashboard
- Guard RLS via `profile?.user_type === 'vendor'`
- Affiche message "Accès refusé" si non-vendor
- TODO : Implémenter dans VendorApp navigation pour accès facile

---

## 🎯 Points de Contrôle Clés

1. **Badge visible partout** - Chercher sur page client, cartes restaurants/vendeurs
2. **Texte légal exact** - Section responsabilité mot-pour-mot
3. **Upload restrictions** - Tenter upload .docx → erreur
4. **TVA affichée** - Vérifier 8,5% calculé et visible
5. **Mobile-first** - Tous les éléments accessibles sur petit écran

---

## ⚠️ TODOs pour Production

- [ ] Implémenter `SupabaseStorageProvider` (s3-like bucket "partner-docs")
- [ ] Ajouter RLS policies pour partner_documents table
- [ ] Ajouter lien "Dashboard" dans menu VendorApp
- [ ] Tester upload réel avec Supabase Storage
- [ ] Ajouter validation côté serveur (Edge Functions)
- [ ] Tester expiration dates RC Pro (cron job pour marquer expiré)
- [ ] Intégrer admin UI pour approver/rejeter documents

