# SumUp — Vérification + Tuto (DELIKREOL)

**Date vérification :** 2026-09-09  
**Projet :** DELIKREOL (branch `main`, HEAD `162428c`)  
**Règle stricte :** pas de clé réelle dans le dépôt, pas d'invention.

---

## 1. Constats de vérification (physiques, pas supposés)

| Élément | Etat vérifié | Source / commande |
|---|---|---|
| `VITE_SUMUP_PUBLIC_KEY` dans `.env` | **ABSENTE** (fichier inexistant ou variable manquante) | `grep SUMUP .env` → rien |
| `.env.example` | Pas de ligne `VITE_SUMUP_PUBLIC_KEY` | lecture ligne 83 (fin) |
| `src/config/paymentProviders.ts` | `sumup` présent (`status: manual` si clé présente, sinon `disabled`) | ligne 94-101 |
| `src/services/sumupService.ts` | **Framework uniquement**, pas d'appel réseau réel | lignes 43-53 (`isSumUpEnabled` → false si clé absente ; `createSumUpCheckout` → erreur sécurisée) |
| `PartnerTerminalPage.tsx` (terminal partenaire) | Deux modes manuels : `sumup_manual`, `sumup_payment_link` (pas de checkout auto) | lignes 42, 102, 194-195 |
| `supabase/functions/checkout-order/index.ts` | `sumup_*` rejeté si non activé côté serveur | ligne 263 |
| Tests (`tests/supabase/backend-hardening.spec.ts`) | Pattern `sumup_` contrôlé (pas de fuite) | ligne 42 |
| Build / audit | ✅ `77/77` tests, audit liens OK, audit secrets OK (`0` secret) | `npm run audit:all` (précédent run) |

**Conclusion :** SumUp n'est pas fonctionnel comme paiement automatisé. Il n'y a **aucune clé publique** → statut `disabled`. Le service est un stub sécurisé (pas d'appel API sans clé). Le terminal partenaire permet un encaissement **manuel** (le partenaire valide dans l'app SumUp ou génère un lien) et rappelle une référence externe (`SUMUP-XXXX`).

---

## 2. Pourquoi ça ne marche pas (causes réelles)

1. **Clé publique SumUp manquante** : `VITE_SUMUP_PUBLIC_KEY` n'est ni dans `.env`, ni dans `.env.example`. Sans cela, `isSumUpEnabled()` renvoie `false`, `paymentProviders` met `sumup` à `disabled`, et `PartnerTerminalPage` ne propose que le mode manuel (pas d'appel réseau).
2. **Service stub volontaire** : `sumupService.ts` ligne 52-53 : `// TODO : appel API SumUp — bloqué volontairement tant que clé sandbox non validée`. C'est une protection, pas un bug.
3. **Pas d'appel réseau dans le dépôt** : aucune URL d'API SumUp harcodée (pas de secret exfiltrable).
4. **Checkout backend (Supabase)** : rejette `sumup_*` si pas activé par feature flag (ligne 263). Même si la clé client était présente, le serveur doit valider.

---

## 3. Tuto — Comment activer SumUp (étapes, pas d'invention)

**Prérequis :** avoir un compte SumUp sandbox (test) et obtenir la clé publique (`public_key` dans le dashboard SumUp). Ne jamais mettre la clé secrète (`secret_key`) dans `VITE_*` (exposé côté client) — la clé publique est la seule requise ici.

### Étape 1 — Clé dans l'environnement
```bash
# Copier .env.example si pas déjà fait
cp .env.example .env

# Ajouter (valeur réelle à remplacer — non inventée ici)
VITE_SUMUP_PUBLIC_KEY=<votre_public_key_sumup_sandbox>
```

### Étape 2 — Relancer / builder
```bash
npm run build
# Vérifier que sumup passe à 'manual' dans le config généré
```

### Étape 3 — Vérifier le service
```typescript
import { isSumUpEnabled } from './src/services/sumupService';
console.log(isSumUpEnabled()); // doit être true si clé présente
```

### Étape 4 — Activer côté serveur (Supabase / Edge Function)
Dans `supabase/functions/checkout-order/index.ts`, s'assurer que le feature-flag `sumup_*` est autorisé si clé validée (ligne 56/263). À faire avec validation manuelle admin, pas automatique.

### Étape 5 — Test manuel (PartnerTerminalPage)
Accéder à `/partenaire/terminal` (ou la route équivalente), choisir `sumup_manual` ou `sumup_payment_link`, générer la facture, puis valider dans l'app SumUp et mettre à jour le statut (`paid_external`) manuellement dans le terminal.

---

## 4. Limites et règles (mémorisées dans le projet)

- **Pas d'appel API SumUp sans clé validée.** Le code le bloque explicitement.
- **Pas de clé réelle dans le dépôt.** `.env` est ignoré par git (`.gitignore` standard) ; `.env.example` ne contient pas la clé.
- **Pas de force-push** sur le root `6d1afbb` (règle du profil bestia).
- **SumUp reste manuel** même après activation clé publique : pas d'encaissement direct côté site, le partenaire encaisse dans SumUp et confirme. L'intégration automatique est un `TODO` futur.

---

## 5. Fichiers concernés (pour audit rapide)

- `src/services/sumupService.ts` (framework)
- `src/config/paymentProviders.ts` (fournisseur)
- `src/pages/new/PartnerTerminalPage.tsx` (UI terminal)
- `supabase/functions/checkout-order/index.ts` (backend validation)
- `.env.example` (template sans clé)
- `tests/supabase/backend-hardening.spec.ts` (contrôle fuite)

---
*Document généré après vérification physique des fichiers et du build (pas de donnée inventée).*  
*Pour activer : obtenir clé sandbox SumUp → `.env` → build → validation admin → pas d'auto-push sans vérification.*
