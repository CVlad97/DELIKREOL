# 🔧 Configuration des Variables d'Environnement - DELIKREOL

## ✅ Status Actuel

Le fichier `.env` a été configuré avec les variables nécessaires. **Vous devez maintenant remplir les valeurs manquantes.**

## 📋 Variables à Configurer

### 1. Supabase (✅ Déjà configuré)

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_REPLACE_ME (présent)
```

✅ **Aucune action requise** - Supabase est déjà configuré.

### 2. Stripe (⚠️ À configurer)

```env
VITE_STRIPE_PUBLISHABLE_KEY=<<<COLLER_ICI_LA_CLE_PUBLIQUE_STRIPE>>>
```

**Actions requises :**

1. Va sur [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copie ta **clé publique** (commence par `pk_test_` ou `pk_live_`)
3. Remplace `<<<COLLER_ICI_LA_CLE_PUBLIQUE_STRIPE>>>` dans `.env`

**Exemple :**
```env
VITE_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY_REPLACE_ME_REPLACE_ME
```

⚠️ **Important :** N'utilise JAMAIS ta clé secrète Stripe (sk_...) dans le frontend !

### 3. WhatsApp (⚠️ À configurer)

```env
WHATSAPP_VERIFY_TOKEN=<<<CHOISIR_UN_TOKEN_SECRET_POUR_WHATSAPP>>>
```

**Actions requises :**

1. **Choisis un token secret personnalisé** (exemple: `delikreol_secure_2024_abc123xyz`)
2. Remplace `<<<CHOISIR_UN_TOKEN_SECRET_POUR_WHATSAPP>>>` dans `.env`
3. **Configure ce MÊME token dans 2 endroits :**

   **a) Supabase Edge Functions Secrets :**
   - Va dans Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Ajoute une variable : `WHATSAPP_VERIFY_TOKEN` avec ton token

   **b) Meta Developer Console :**
   - Va dans [Meta Developers](https://developers.facebook.com/)
   - Configure ton webhook WhatsApp
   - Entre le même token dans le champ "Verify Token"

**Exemple :**
```env
WHATSAPP_VERIFY_TOKEN=delikreol_secure_2024_abc123xyz
```

## 🔄 Après Configuration

Une fois que tu as rempli toutes les valeurs, **redémarre le serveur de développement** :

Dans Bolt :
- Arrête le preview (Stop)
- Relance (Run / Restart)

Ou en ligne de commande :
```bash
npm run dev
```

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Supabase** : L'app devrait se charger sans afficher "Configuration requise"
2. **Stripe** : Tu devrais pouvoir accéder aux fonctionnalités de paiement
3. **WhatsApp** : Le webhook devrait être vérifié par Meta

## 📁 Fichiers Utilisant ces Variables

### Frontend (React + Vite)
- `src/lib/supabase.ts` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `src/utils/stripe.ts` → `VITE_STRIPE_PUBLISHABLE_KEY`
- `src/config/integrations.ts` → `VITE_STRIPE_PUBLISHABLE_KEY`

### Backend (Supabase Edge Functions)
- `supabase/functions/whatsapp-webhook/index.ts` → `WHATSAPP_VERIFY_TOKEN`
- `supabase/functions/create-payment-intent/index.ts` → Utilise `STRIPE_SECRET_KEY` (côté serveur)

## ⚠️ Sécurité

**Ne JAMAIS commiter dans Git :**
- Le fichier `.env` avec les vraies valeurs
- Les clés secrètes Stripe (`sk_...`)
- Les tokens d'accès Meta/WhatsApp

**Utilisez `.env.example`** comme template pour les autres développeurs.

## 🆘 Support

Si tu rencontres des problèmes :
1. Vérifie que les valeurs sont bien entre guillemets si elles contiennent des caractères spéciaux
2. Vérifie qu'il n'y a pas d'espaces avant/après le `=`
3. Redémarre complètement le serveur de dev

---

**Note :** Les variables préfixées par `VITE_` sont exposées au navigateur. Ne mets JAMAIS de secrets sensibles dans ces variables !
