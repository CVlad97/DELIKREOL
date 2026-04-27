# DELIKREOL - Guide des Intégrations Externes

## Vue d'ensemble

Ce document décrit toutes les intégrations externes préparées dans DELIKREOL et comment les activer.

---

## 1. Stripe (Paiements)

**Statut:** ✅ Configuré si clé présente
**Priorité:** Haute (MVP)

### Configuration

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez votre clé publique dans le Dashboard
3. Ajoutez à `.env`:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_...
   ```

### Utilisation

Le système de paiement est déjà intégré dans:
- `src/utils/stripe.ts`
- CheckoutModal pour les paiements clients
- Split payments automatiques (vendeur, livreur, relais, plateforme)

---

## 2. Qonto (Banque Pro)

**Statut:** ⏳ À configurer
**Priorité:** Moyenne

### Configuration

1. Ouvrez un compte Qonto Business
2. Activez l'API dans les paramètres
3. Récupérez vos credentials API
4. Ajoutez à `.env`:
   ```
   VITE_QONTO_API_URL=https://thirdparty.qonto.com/v2
   VITE_QONTO_API_KEY=...
   ```

### Cas d'usage

- Versements automatiques aux vendeurs
- Comptabilité en temps réel
- Export des transactions
- Gestion multi-comptes

---

## 3. Revolut Business

**Statut:** ⏳ À configurer
**Priorité:** Moyenne

### Configuration

1. Créez un compte Revolut Business
2. Activez l'API dans les paramètres
3. Ajoutez à `.env`:
   ```
   VITE_REVOLUT_API_URL=https://b2b.revolut.com/api
   VITE_REVOLUT_API_KEY=...
   ```

### Cas d'usage

- Paiements internationaux
- Change multi-devises
- Cartes virtuelles pour dépenses
- Alternative à Qonto

---

## 4. Zapier (Automatisation)

**Statut:** ⏳ À configurer
**Priorité:** Faible (post-MVP)

### Configuration

1. Créez un compte sur [zapier.com](https://zapier.com)
2. Créez un Zap avec webhook trigger
3. Récupérez l'URL du webhook
4. Ajoutez à `.env`:
   ```
   VITE_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
   ```

### Cas d'usage

- Notifications automatiques (Slack, Email, SMS)
- Export vers CRM (Notion, Airtable, etc.)
- Synchronisation calendrier
- Alertes personnalisées

### Événements à envoyer

```typescript
// Nouvelle commande
{
  event: 'order.created',
  data: {
    order_id: '...',
    customer: '...',
    total: 45.50,
    delivery_address: '...'
  }
}

// Candidature partenaire
{
  event: 'application.received',
  data: {
    type: 'vendor',
    business_name: '...',
    contact: '...'
  }
}
```

---

## 5. Make (Integromat)

**Statut:** ⏳ À configurer
**Priorité:** Faible (post-MVP)

### Configuration

1. Créez un compte sur [make.com](https://make.com)
2. Créez un scénario avec webhook
3. Récupérez l'URL du webhook
4. Ajoutez à `.env`:
   ```
   VITE_MAKE_WEBHOOK_URL=https://hook.integromat.com/...
   ```

### Cas d'usage

Similaire à Zapier, mais plus puissant pour:
- Workflows complexes multi-étapes
- Traitement de données avancé
- Intégrations avec +1000 services

---

## 6. Google Sheets (Export données)

**Statut:** ⏳ À configurer
**Priorité:** Moyenne

### Configuration

1. Créez un projet Google Cloud
2. Activez l'API Google Sheets
3. Créez des credentials (Service Account)
4. Ajoutez à `.env`:
   ```
   VITE_SHEETS_API_URL=https://sheets.googleapis.com/v4
   VITE_SHEETS_API_KEY=...
   ```

### Cas d'usage

- Export automatique des commandes
- Reporting quotidien/hebdomadaire
- Dashboard partagé avec l'équipe
- Archivage des données

### Fonctions à implémenter

```typescript
// src/utils/sheets.ts
export async function exportOrdersToSheet(orders: Order[]) {
  // TODO: Implémenter l'export
}

export async function syncMetricsDaily() {
  // TODO: Sync automatique des métriques
}
```

---

## 7. OpenAI (Intelligence Artificielle)

**Statut:** ⏳ À configurer
**Priorité:** Haute (pour Admin Copilot)

### Configuration

1. Créez un compte sur [platform.openai.com](https://platform.openai.com)
2. Générez une API key
3. Ajoutez à `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

### Utilisation actuelle

- **Admin Copilot** (`src/services/adminCopilot.ts`)
  - Mode démo sans clé → affiche données brutes
  - Avec clé → analyse intelligente + suggestions

### Fonctionnalités IA

1. **Analyse prédictive**
   - Prévision de demande par zone
   - Détection d'anomalies
   - Optimisation des tournées

2. **Assistant conversationnel**
   - Réponse aux questions admin
   - Génération de rapports
   - Recommandations stratégiques

3. **Scoring automatique**
   - Évaluation des candidatures partenaires
   - Notation des livreurs
   - Analyse de satisfaction client

---

## 8. Crypto Wallet (Points → Tokens)

**Statut:** ⏳ À configurer
**Priorité:** Faible (post-MVP)

### Configuration

#### Option A: Coinbase Commerce

1. Compte sur [commerce.coinbase.com](https://commerce.coinbase.com)
2. Créez une API key
3. Ajoutez à `.env`:
   ```
   VITE_CRYPTO_PROVIDER=coinbase
   VITE_CRYPTO_WALLET_ADDRESS=...
   VITE_COINBASE_API_KEY=...
   ```

#### Option B: Solana (Direct)

1. Créez un wallet Solana
2. Déployez un SPL Token
3. Ajoutez à `.env`:
   ```
   VITE_CRYPTO_PROVIDER=solana
   VITE_CRYPTO_WALLET_ADDRESS=...
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

#### Option C: Polygon (Ethereum L2)

1. Wallet Ethereum/Polygon
2. Déployez un ERC-20 token
3. Ajoutez à `.env`:
   ```
   VITE_CRYPTO_PROVIDER=polygon
   VITE_CRYPTO_WALLET_ADDRESS=...
   VITE_POLYGON_RPC_URL=https://polygon-rpc.com
   ```

### Système de Points actuel

Le système est déjà fonctionnel:
- Table `loyalty_points` (solde par user)
- Table `loyalty_events` (historique)
- Service `src/services/loyaltyService.ts`

### Conversion Points → Crypto

```typescript
// src/services/loyaltyService.ts
export async function syncLoyaltyToCryptoWallet(userId: string) {
  // TODO: Implémenter selon le provider choisi
  // 1. Récupérer le solde de points
  // 2. Calculer l'équivalent en tokens (ex: 100 points = 1 TOKEN)
  // 3. Mint ou transfer des tokens vers le wallet user
  // 4. Logger la transaction
}
```

### Cas d'usage

- Fidélité gamifiée (tokens échangeables)
- Staking pour réductions
- NFT badges pour super-users
- DAO gouvernance (plus tard)

---

## 9. WhatsApp Business API

**Statut:** ✅ Partiellement configuré
**Priorité:** Haute

### Configuration

Déjà préparé dans:
- `supabase/functions/whatsapp-webhook`
- `src/components/admin/WhatsAppManager.tsx`
- Tables: `whatsapp_messages`, `whatsapp_sessions`, `whatsapp_templates`

Pour activer complètement:
1. Créez un compte Meta Business
2. Configurez WhatsApp Business API
3. Ajoutez les credentials dans APIKeysManager

### Cas d'usage

- Notifications clients (commande, livraison)
- Support conversationnel
- Confirmation de rendez-vous
- Marketing ciblé

---

## Checklist d'activation

### Phase 1 - MVP (maintenant)

- [x] Stripe (paiements) → Priorité 1
- [ ] OpenAI (admin copilot) → Priorité 2
- [ ] WhatsApp (notifications) → Priorité 3

### Phase 2 - Post-MVP (mois 1-2)

- [ ] Qonto ou Revolut (banque pro)
- [ ] Google Sheets (reporting)
- [ ] Zapier ou Make (automatisation basique)

### Phase 3 - Scaling (mois 3+)

- [ ] Crypto wallet (points → tokens)
- [ ] Automatisations avancées
- [ ] Intégrations ERP/Comptabilité

---

## Sécurité

### Variables d'environnement

**JAMAIS** commiter les clés dans Git:

```bash
# .env (local uniquement)
VITE_STRIPE_PUBLIC_KEY=pk_...
VITE_OPENAI_API_KEY=sk-...
VITE_QONTO_API_KEY=...
```

Pour la production:
- Utiliser les secrets Vercel/Netlify/etc.
- Rotation des clés tous les 3 mois
- Monitoring des usages API

### Permissions

Chaque intégration doit avoir:
- Accès minimum requis (principle of least privilege)
- Rate limiting configuré
- Logs d'activité
- Alertes sur usage anormal

---

## Support

Pour toute question sur les intégrations:
- Email: tech@delikreol.com
- Slack: #integrations
- Doc officielle: `/docs/integrations.md`

---

**DELIKREOL - Intégrations pour l'abondance** 🔌✨
