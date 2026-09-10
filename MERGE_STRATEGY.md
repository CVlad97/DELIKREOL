# DELIKREOL — Stratégie de Consolidation Production V1

**Date**: 2026-09-10  
**État**: EN EXÉCUTION  
**Objectif**: Site opérationnel type Uber Eats légal avec pilotage multi-vendeurs et points relais

---

## 📊 Etat des 17 PRs ouvertes

| Vague | PR  | Titre | Priorité | Status | Dépend de |
|-------|-----|-------|----------|--------|-----------|
| **CORE** | #79 | Menu composer Save Peyia | 🔴 IMMÉDIAT | ✅ Ready | main |
| **CORE** | #78 | SumUp pilot fields | 🔴 IMMÉDIAT | ✅ Ready | #79 |
| **CORE** | #47 | Security: brace-expansion | 🔴 IMMÉDIAT | ✅ Ready | main |
| **BUSINESS** | #49 | Cart: enforce vendor rules | 🟡 Haut | ✅ Ready | #79 |
| **BUSINESS** | #50 | Fulfillment: relay rules | 🟡 Haut | ✅ Ready | #49 |
| **BUSINESS** | #53 | Orders → driver missions | 🟡 Haut | ✅ Ready | #50 |
| **BUSINESS** | #54 | Logistics: partner billing | 🟡 Haut | ✅ Ready | #53 |
| **ADMIN** | #66 | Admin: real Supabase candidates | 🟢 Moyen | ✅ Ready | main |
| **ADMIN** | #61 | Public: jobs/cash routes | 🟢 Moyen | ✅ Ready | main |
| **CONTENT** | #69 | Docs: business plan 36mo | 🟢 Moyen | ✅ Ready | main |
| **CONTENT** | #70 | Campaign: 2026 fundraising | 🟢 Moyen | ✅ Ready | main |
| **INFRA** | #44 | Admin: payment reconciliation | 🟢 Moyen | ✅ Ready | main |
| **INFRA** | #45 | Banking: Qonto/Revolut adapters | 🟢 Moyen | ✅ Ready | main |
| **INFRA** | #46 | Marketing: SEO + 90-day plan | 🟢 Moyen | ✅ Ready | main |
| **OPTIONNEL** | #41 | Orders: WhatsApp idempotency | 🟢 Optionnel | ✅ Ready | main |
| **OPTIONNEL** | #31 | Fix: public bankability | 🟢 Optionnel | ✅ Ready | main |

---

## 🔄 Plan de Déploiement

### **VAGUE 1: CORE PRODUCTION** (Jour 1 — 1-2h)
✅ Validation rapide, déploiement = réduction risque  

**PRs à merger en cascade:**
1. **PR #79**: Menu composer → Validation menu côté client avant ajout panier
2. **PR #78**: SumUp config → Support paiement partenaire via SumUp public links
3. **PR #47**: Security → Corrections vulnérabilités `brace-expansion` + documenter React Router

**Tests attendus:**
- ✅ CI: PASSED
- ✅ Playwright: PASSED
- ✅ Aucun merge conflict

**Déploiement:**
```bash
git merge --squash origin/feat/menu-composer-save-peyia --ff-only
git merge --squash origin/feat/save-peyia-sumup-pilot --ff-only
git merge --squash origin/chore/security-dependency-upgrades --ff-only
git push origin main
# GitHub Actions → Deploy Production v1-core
```

---

### **VAGUE 2: MÉTIER MULTI-VENDEURS** (Jour 2 — 2-3h)
✅ Activation des commandes multi-vendeurs avec consolidation et points relais

**Branch**: `consolidate/business-multi-vendor`  
**PRs groupées:**
- #49 + #50 + #53 + #54 (cart rules → fulfillment → orders → logistics)

**Validations critiques:**
- Backend checkout refuse multi-vendeur en livraison directe ✅
- Point relais: capacité, types de stockage, fenêtres de créneau ✅
- Tests d'intégration: panier multi-traiteur → relais → commande ✅

---

### **VAGUE 3: ADMIN & CONTENU** (Jour 3+ — Optionnel)
- #66: Admin affichage candidatures réelles
- #61: Routes publiques emplois/cash
- #69/#70: Documentation business plan + campagne 2026
- #44/#45/#46: Paiements, banking, marketing SEO
- #31/#41: Bankability + WhatsApp idempotency

---

## ✅ Critères d'Acceptation Production

**Avant déploiement VAGUE 1:**
- [ ] Tous CI/Playwright PASSED
- [ ] Pas de erreurs TypeScript
- [ ] ProductCard supporte menu_options (côté client)
- [ ] Supabase migration #78 structure vendeurs (SumUp)
- [ ] Brace-expansion vulnérabilité corrigée + autres mitigées

**Avant VAGUE 2:**
- [ ] Validations multi-vendeur serveur actives
- [ ] Point relais tableau opérationnel
- [ ] Tests E2E panier multi → relais → commande

**Site opérationnel:**
- Type Uber Eats: catalogue, panier, commande
- Légal: RGPD, conditions, confidentialité
- Multi-vendeurs: livraison directe (1 traiteur) + programmée (N traiteurs + relais)
- Paiement: manuel + SumUp public links

---

## 🛑 Rollback

Si VAGUE 1 échoue:
```bash
git reset --hard origin/main
git push --force-with-lease origin main
# GitHub Actions annule automatiquement
```

Si VAGUE 2 échoue après VAGUE 1 OK:
```bash
git revert <commit-merge-vague2>
git push origin main
```

---

## 📞 Points de Contrôle

- **+15min**: PR #79 mergée, CI lancé
- **+45min**: PR #78 mergée, Supabase migration validée
- **+1h15**: PR #47 mergée, audit npm revalidé
- **+2h**: Tous tests Playwright OK, prêt production
- **+2h30**: Deployment production lancé, monitored
