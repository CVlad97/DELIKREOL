# 🚀 Quick Start - DELIKREOL

Guide de démarrage rapide pour développeurs et administrateurs.

---

## 📦 Installation

```bash
# Cloner le projet
git clone <repo-url>
cd delikreol

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés
```

---

## ⚙️ Configuration Minimale

### 1. Supabase
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publique
```

### 2. Stripe (optionnel pour paiements)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Dans Supabase Edge Functions > Secrets :
```
STRIPE_SECRET_KEY=sk_test_...
```

### 3. OpenAI (optionnel pour IA)
Via Admin Panel > Clés API :
- Service : `openai`
- Clé : `sk-...`

---

## 🏃 Lancement

```bash
# Développement
npm run dev

# Production build
npm run build
npm run preview

# Vérification types
npm run typecheck

# Lint
npm run lint
```

---

## 🗄️ Base de Données

### Appliquer les migrations
1. Ouvrir Supabase Dashboard
2. SQL Editor
3. Copier/coller chaque fichier `supabase/migrations/*.sql`
4. Exécuter dans l'ordre chronologique

### Tables principales
- `profiles` - Utilisateurs
- `vendors` - Vendeurs
- `products` - Produits
- `orders` - Commandes
- `order_items` - Détails commandes
- `relay_points` - Points relais
- `drivers` - Livreurs
- `deliveries` - Livraisons
- `whatsapp_messages` - Messages WhatsApp
- `api_keys` - Clés API (admin)

---

## 👥 Créer des Comptes de Test

### 1. Client
```sql
-- S'inscrire via l'interface (par défaut = client)
```

### 2. Vendeur
```sql
-- 1. S'inscrire
-- 2. Mettre à jour le profil :
UPDATE profiles
SET user_type = 'vendor'
WHERE email = 'vendeur@test.com';

-- 3. Créer l'entrée vendeur :
INSERT INTO vendors (user_id, business_name, business_type, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'vendeur@test.com'),
  'Restaurant Test',
  'restaurant',
  true
);
```

### 3. Admin
```sql
UPDATE profiles
SET user_type = 'admin'
WHERE email = 'admin@test.com';
```

### 4. Livreur
```sql
UPDATE profiles
SET user_type = 'driver'
WHERE email = 'livreur@test.com';

INSERT INTO drivers (user_id, vehicle_type, is_available)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'livreur@test.com'),
  'scooter',
  true
);
```

### 5. Hôte de Relais
```sql
UPDATE profiles
SET user_type = 'relay_host'
WHERE email = 'relais@test.com';

INSERT INTO relay_points (name, address, latitude, longitude, capacity, is_active, owner_id)
VALUES (
  'Point Relais Test',
  '1 Rue Test, Fort-de-France',
  14.6104,
  -61.0733,
  30,
  true,
  (SELECT id FROM auth.users WHERE email = 'relais@test.com')
);
```

---

## 🧪 Tester les Fonctionnalités

### 1. Passer une commande
1. Connexion client
2. Parcourir les vendeurs
3. Ajouter produits au panier
4. Checkout
5. Choisir mode de livraison

### 2. Accepter une commande (Vendeur)
1. Connexion vendeur
2. Voir commandes entrantes
3. Cliquer "Accepter"
4. Marquer "En préparation"

### 3. Livrer (Livreur)
1. Connexion livreur
2. Voir courses disponibles
3. Accepter une course
4. Mettre à jour localisation
5. Confirmer livraison

### 4. Gérer un relais
1. Connexion hôte de relais
2. Scanner QR dépôt (vendeur/livreur)
3. Scanner QR retrait (client)

### 5. Administration
1. Connexion admin
2. Dashboard → Vue d'ensemble
3. Carte → Zones/Relais/Livreurs
4. AI Insights → Poser questions
5. Exports → Google Sheets

---

## 🤖 Tester l'IA

### Assistant Admin
```
Menu Admin > AI Insights

Questions à tester :
1. "Analyser les commandes du jour"
2. "Identifier les relais saturés"
3. "Proposer une optimisation des zones"
4. "Quels sont mes meilleurs vendeurs ?"
```

### Affectation Automatique
```typescript
import { autoAssignDriver } from '@/utils/logistics';

// Dans le code ou console navigateur
const result = await autoAssignDriver('order-uuid');
console.log(result); // { success: true, driverId: '...' }
```

### Suggestion de Relais
```typescript
import { suggestBestRelay } from '@/utils/logistics';

const order = {
  id: 'test',
  delivery_latitude: 14.6104,
  delivery_longitude: -61.0733,
  delivery_type: 'relay_point',
};

const result = await suggestBestRelay(order);
console.log(result); // { success: true, relayPoint: {...} }
```

---

## 📱 WhatsApp Business (optionnel)

### Configuration
1. Créer compte Meta Business
2. Obtenir Phone Number ID + Access Token
3. Admin Panel > Clés API :
   - Service: `meta`
   - Clé: Access Token
   - Metadata: `{"phone_number_id": "123..."}`
4. Configurer webhook :
   - URL: `https://votre-domaine.com/functions/v1/whatsapp-webhook`
   - Token: `delikreol_2024`

### Tester
1. Envoyer message au numéro configuré
2. Taper "menu" ou "start"
3. Interagir avec le bot

---

## 🐛 Résolution de Problèmes

### Erreur: Cannot find module
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur: Supabase connection
```bash
# Vérifier .env
cat .env | grep SUPABASE

# Tester connexion
curl https://votre-projet.supabase.co
```

### Erreur: Build failed
```bash
# Vérifier types
npm run typecheck

# Vérifier lint
npm run lint
```

### Toast ne s'affiche pas
```typescript
// Vérifier que ToastProvider est bien dans App.tsx
import { ToastProvider } from './contexts/ToastContext';

// Dans le composant
import { useToast } from '../contexts/ToastContext';
const { showSuccess } = useToast();
showSuccess('Test !');
```

---

## 📚 Ressources

### Documentation
- **Concept Partenaires** : `docs/concept-partners.md`
- **Guide Admin** : `docs/admin-operations.md`
- **Améliorations** : `IMPROVEMENTS.md`
- **README** : `README.md`

### Code Important
- **Logistique** : `src/utils/logistics.ts`
- **API Integrations** : `src/utils/apiIntegrations.ts`
- **Admin Insights** : `src/pages/AdminInsights.tsx`
- **Supabase Client** : `src/lib/supabase.ts`

### Supabase
- **Dashboard** : https://supabase.com/dashboard
- **Docs** : https://supabase.com/docs
- **Edge Functions** : https://supabase.com/docs/guides/functions

### Stripe
- **Dashboard** : https://dashboard.stripe.com
- **Docs** : https://stripe.com/docs
- **Testing** : https://stripe.com/docs/testing

---

## 🎯 Checklist de Déploiement

### Avant Production
- [ ] Variables d'environnement configurées
- [ ] Migrations Supabase appliquées
- [ ] RLS policies activées
- [ ] Stripe webhooks configurés
- [ ] WhatsApp webhook configuré (optionnel)
- [ ] OpenAI API key ajoutée (optionnel)
- [ ] Build réussit sans erreurs
- [ ] Tests manuels sur toutes les fonctionnalités

### Après Déploiement
- [ ] Créer compte admin
- [ ] Ajouter zones de livraison
- [ ] Créer 2-3 vendeurs de test
- [ ] Créer 2-3 points relais
- [ ] Tester une commande complète
- [ ] Vérifier emails/notifications
- [ ] Monitorer logs Supabase

---

## 🆘 Support

- **Email** : support@delikreol.com
- **GitHub Issues** : [lien]
- **Documentation** : Ce repo `/docs`

---

**Bon développement ! 🚀**
