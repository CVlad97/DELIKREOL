# DELIKREOL

**Marketplace logistique multi-acteurs pour la Martinique**

Une plateforme complète qui connecte restaurants, producteurs locaux, commerces, points relais mutualisés et livreurs auto-entrepreneurs pour créer un écosystème alimentaire local durable.

---

## 🎯 Vision & Objectifs

Delikreol permet aux clients martiniquais de :
- Commander des plats créoles authentiques et des produits locaux
- Choisir entre livraison à domicile, retrait en restaurant/commerce ou retrait en point relais
- Suivre leurs commandes en temps réel avec géolocalisation des livreurs

Pour les acteurs locaux :
- **Vendeurs (restaurants, producteurs, commerçants)** : augmentez votre visibilité et vos ventes (80% de revenus)
- **Points relais (particuliers, commerces)** : générez des revenus complémentaires (2-5€ par colis)
- **Livreurs auto-entrepreneurs** : travaillez en liberté avec paiements immédiats (70% des frais)

---

## 🚀 DELIKREOL Differentiation - Hub Logistique Intelligent

**DELIKREOL n'est pas un simple marketplace de livraison** - c'est une plateforme d'orchestration logistique avec intelligence artificielle intégrée.

### Trois Agents IA Spécialisés

**🧠 Agent 1 : Operations Copilot**
- Assistant IA conversationnel pour les administrateurs
- Analyse en temps réel des métriques opérationnelles
- Recommandations automatiques d'optimisation
- Chat interactif pour questions ad-hoc

**🚚 Agent 2 : Route Optimizer**
- Affectation automatique des livreurs aux commandes
- Tournées optimisées par algorithme de scoring
- Prise en compte distance, charge de travail, disponibilité
- Génération de plans de livraison en < 1 seconde

**⭐ Agent 3 : Partner Scoring**
- Évaluation automatique des candidatures de partenaires
- Notation A/B/C selon complétude et conformité
- Génération de réponses personnalisées
- Réduction du temps de traitement de 7 jours à 48h

### Hub Logistique Centralisé

**Admin Hub** (`/admin/hub`)
- Vue d'ensemble temps réel : commandes, livreurs, relais, candidatures
- Cartographie interactive avec saturation des zones
- Panneau assistant IA avec actions rapides
- Gestion des candidatures avec scoring automatique

### Infrastructure Mutualisée

- **Points relais partagés** entre tous les vendeurs
- **Capacités multi-types** : froid, chaud, sec, congelé
- **Optimisation automatique** des affectations
- **Réduction des coûts** logistiques pour petits acteurs

### Documentation Technique

- `docs/agents.md` - Architecture des 3 agents IA
- `docs/admin-operations.md` - Guide opérationnel
- `docs/concept-partners.md` - Modèle d'affaires

---

## 🏗️ Architecture & Stack Technique

### Frontend
- **React 18** + **TypeScript** - Interface utilisateur moderne et typée
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Styling utility-first avec design system cohérent
- **Lucide React** - Bibliothèque d'icônes

### Cartographie
- **React Leaflet** + **Leaflet** - Cartographie interactive
- **OpenStreetMap** - Tiles de carte gratuites
- Zones polygonales de livraison configurables
- Tracking en temps réel des livreurs

### Backend & Infrastructure
- **Supabase** (BaaS complet)
  - PostgreSQL avec Row Level Security (RLS)
  - Authentication multi-rôles
  - Realtime subscriptions pour le tracking
  - Edge Functions pour logique serveur
  - Storage pour images de produits

### Paiements
- **Stripe Connect** via Edge Functions Supabase
- Paiements sécurisés côté serveur uniquement
- Support de comptes connectés pour vendeurs
- Commission automatique (20% plateforme, 80% vendeur)

---

## 👥 Rôles Utilisateurs

### 🛒 Client
- Navigation des vendeurs avec filtres intelligents
- Panier multi-vendeurs
- Checkout avec choix de mode de livraison
- Suivi de commande en temps réel
- Historique et favoris

### 🍴 Vendeur (Restaurant, Producteur, Commerçant)
- Gestion des produits (nom, prix, stock, photos)
- Réception et traitement des commandes
- Statistiques de vente en temps réel
- Gestion des horaires d'ouverture
- Configuration du rayon de livraison

### 📍 Hôte de Point Relais
- Gestion de capacité de stockage (réfrigéré, sec, chaud, congelé)
- Réception et distribution de colis
- Configuration des horaires d'accueil
- Suivi des gains (rémunération par colis)
- Notifications de dépôts/retraits

### 🚚 Livreur
- Visualisation des courses disponibles
- Acceptation/refus de livraisons
- Navigation GPS intégrée
- Gestion de disponibilité
- Historique et revenus

### 🔧 Administrateur
- Vue d'ensemble de la plateforme
- Gestion des utilisateurs et validations
- Modération des vendeurs et points relais
- Analytics et statistiques globales
- Configuration des zones de livraison

---

## 🚀 Installation & Configuration

### Prérequis
- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Compte Stripe (mode test pour développement)

### 1. Cloner le projet

```bash
git clone <repo-url>
cd delikreol
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Remplissez les variables suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_REPLACE_ME

VITE_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY_REPLACE_ME_cle_publique_stripe
```

**IMPORTANT** : Ne JAMAIS ajouter de clé secrète Stripe dans le `.env` frontend !

### 3. Configuration Supabase

#### A. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé ANON dans Settings > API

#### B. Appliquer les migrations
Les migrations SQL sont dans `supabase/migrations/`. Elles créent :
- Tables (users, vendors, products, orders, relay_points, drivers, etc.)
- Politiques RLS pour sécurité
- Indexes pour performance
- Triggers pour automatisation

Appliquez-les via le Supabase Dashboard > SQL Editor ou via CLI.

#### C. Configurer les Edge Functions
Les fonctions pour Stripe sont automatiquement déployées. Configurez la clé secrète Stripe dans Supabase :

1. Dashboard > Project Settings > Edge Functions
2. Ajoutez le secret : `STRIPE_SECRET_KEY` = `STRIPE_SECRET_KEY_REPLACE_ME_cle_secrete`

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### 5. Build de production

```bash
npm run build
npm run preview
```

---

## 📁 Structure du Projet

```
delikreol/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Map/          # Composants de cartographie
│   │   ├── AuthModal.tsx
│   │   ├── Cart.tsx
│   │   ├── Navigation.tsx
│   │   └── ...
│   ├── contexts/         # Contexts React (Auth, Cart, Theme)
│   ├── pages/            # Pages principales par rôle
│   │   ├── CustomerApp.tsx
│   │   ├── VendorApp.tsx
│   │   ├── DriverApp.tsx
│   │   ├── RelayHostApp.tsx
│   │   └── AdminApp.tsx
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires (orders, stripe)
│   ├── data/             # Données statiques (zones)
│   ├── lib/              # Configuration (supabase)
│   └── main.tsx          # Point d'entrée
├── supabase/
│   ├── migrations/       # Migrations SQL
│   └── functions/        # Edge Functions (créées automatiquement)
├── public/               # Assets statiques
└── package.json
```

---

## 🗄️ Schéma de Base de Données

### Tables principales

**profiles** - Profils utilisateurs
- `id` (FK users.id)
- `full_name`, `phone`, `user_type`
- RLS : users can only read/update their own profile

**vendors** - Vendeurs
- `user_id`, `business_name`, `business_type`
- `address`, `phone`, `opening_hours`
- `commission_rate`, `is_active`
- RLS : vendors can manage their own data

**products** - Produits
- `vendor_id`, `name`, `description`, `price`
- `category`, `stock_quantity`, `image_url`
- `is_available`
- RLS : vendors can manage their products

**orders** - Commandes
- `customer_id`, `vendor_id`, `relay_point_id`
- `total_amount`, `delivery_fee`, `status`
- `delivery_type`, `delivery_address`
- RLS : customers see their orders, vendors see orders for them

**relay_points** - Points relais
- `name`, `address`, `latitude`, `longitude`
- `type`, `hours`, `capacity_notes`
- `is_active`, `owner_id`

**drivers** - Livreurs
- `user_id`, `vehicle_type`, `license_number`
- `is_available`, `current_location`

**delivery_zones** - Zones de livraison (polygones)
- `name`, `polygon_coordinates`, `delivery_fee`
- `is_active`

---

## 🔐 Sécurité

### Row Level Security (RLS)
Toutes les tables sont protégées par RLS. Exemples :

```sql
-- Customers can only see their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Vendors can only manage their own products
CREATE POLICY "Vendors can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = products.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );
```

### Stripe Payments
- ✅ Clé secrète stockée dans Edge Functions uniquement
- ✅ Création de PaymentIntent côté serveur
- ✅ Webhook signature verification
- ❌ Aucune clé secrète dans le code frontend

### WhatsApp Business Integration
- ✅ Bot conversationnel automatique
- ✅ Prise de commandes via WhatsApp
- ✅ Notifications en temps réel (confirmation, livraison)
- ✅ Support multi-langues (français)
- ✅ Webhook sécurisé avec vérification

---

## 📱 WhatsApp Business

Delikreol intègre WhatsApp Business pour permettre aux clients de commander directement via l'application de messagerie la plus populaire en Martinique.

### Fonctionnalités WhatsApp

**Pour les clients :**
- 💬 Commandes directes par messages
- 🤖 Réponses automatiques intelligentes
- 📋 Consultation du menu et des restaurants
- 📦 Suivi de commande en temps réel
- 🔔 Notifications de statut

**Pour les vendeurs :**
- 📬 Notifications de nouvelles commandes
- ✅ Confirmation de préparation
- 🚚 Mise à jour de statut

**Pour les livreurs :**
- 🛵 Assignation de livraisons
- 📍 Informations de livraison
- ✔️ Confirmation de livraison

### Configuration WhatsApp Business

1. **Créer un compte Meta Business**
   - Allez sur [business.facebook.com](https://business.facebook.com)
   - Créez un compte Business

2. **Configurer WhatsApp Business API**
   - Accédez à [developers.facebook.com](https://developers.facebook.com)
   - Créez une application WhatsApp Business
   - Obtenez votre Phone Number ID et Access Token

3. **Ajouter la clé API dans Delikreol**
   - Connectez-vous en tant qu'admin
   - Allez dans "Clés API"
   - Ajoutez votre Meta Access Token
   - Dans metadata, ajoutez : `{"phone_number_id": "VOTRE_ID"}`

4. **Configurer le Webhook**
   - URL : `https://votre-domaine.com/functions/v1/whatsapp-webhook`
   - Verify Token : `delikreol_2024`
   - Événements : `messages`, `message_status`

### Utilisation pour les Clients

Les clients peuvent :

1. **Démarrer une conversation**
   ```
   Envoyer "menu" ou "start" au +596 696 XX XX XX
   ```

2. **Commander via WhatsApp**
   ```
   1 - Voir les restaurants
   2 - Voir les producteurs
   3 - Mes commandes
   4 - Mon panier
   5 - Aide
   ```

3. **Recevoir des notifications**
   - ✅ Commande confirmée
   - 👨‍🍳 En préparation
   - 🚚 Livreur assigné
   - 📍 En route
   - 🎉 Livrée

### Templates de Messages

Les templates suivants sont préconfigurés :
- `order_confirmation` - Confirmation de commande
- `order_preparing` - Commande en préparation
- `order_ready` - Commande prête
- `driver_assigned` - Livreur assigné
- `order_delivered` - Commande livrée
- `welcome_message` - Message de bienvenue

### Intégration dans le Code

```typescript
import { notifyOrderConfirmed, openWhatsAppChat } from '@/utils/whatsapp';

// Envoyer une notification
await notifyOrderConfirmed('+596696123456', order);

// Ouvrir une conversation
openWhatsAppChat('+596696000000', 'Bonjour, je veux commander!');
```

---

## 🧪 Tests

Pour lancer les tests (à venir) :

```bash
npm run test
```

Tests recommandés :
- Calculs de commande (total, frais)
- Filtres et recherche de produits
- Logique de zones de livraison

---

## 🚢 Déploiement

### Option 1 : Vercel / Netlify
1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Build command : `npm run build`
4. Output directory : `dist`

### Option 2 : Supabase Hosting (à venir)

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## 📝 Roadmap

### Phase 1 - MVP ✅
- [x] Authentification multi-rôles
- [x] CRUD vendeurs et produits
- [x] Panier et checkout
- [x] Points relais avec capacité
- [x] Cartographie interactive
- [x] Paiement Stripe sécurisé

### Phase 2 - Optimisation 🚧
- [ ] Notifications push
- [ ] Chat client-livreur
- [ ] Programme de fidélité
- [ ] Analytics avancées
- [ ] Application mobile native

### Phase 3 - Scale 🔮
- [ ] Multi-îles (Guadeloupe, Guyane)
- [ ] API publique pour partenaires
- [ ] Intégration comptabilité
- [ ] Mode hors-ligne

---

## 📄 Licence

MIT License - Voir le fichier LICENSE

---

## 📞 Support

Pour toute question ou problème :
- Email : support@delikreol.com
- Discord : [Rejoindre la communauté](#)
- Issues GitHub : [Ouvrir un ticket](#)

---

**Fait avec ❤️ en Martinique 🌴**
