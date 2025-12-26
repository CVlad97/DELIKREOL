# 🔐 Configuration Google SSO (Sign in with Google)

**Objectif :** Permettre aux utilisateurs de se connecter avec leur compte Google via OAuth 2.0

---

## ✅ CHECKLIST COMPLÈTE

### Étape 1 : Créer un projet Google Cloud (5 min)

1. **Aller sur Google Cloud Console**
   - URL : https://console.cloud.google.com/
   - Se connecter avec votre compte Google Workspace

2. **Créer un nouveau projet**
   - Cliquer sur le sélecteur de projet en haut
   - Cliquer sur "Nouveau projet"
   - Nom : `Delikreol Production`
   - Cliquer sur "Créer"

3. **Activer l'API Google+ (obligatoire pour OAuth)**
   - Dans le menu, aller à "APIs & Services" > "Library"
   - Rechercher "Google+ API"
   - Cliquer sur "Enable" (Activer)

---

### Étape 2 : Configurer l'écran de consentement OAuth (10 min)

1. **Accéder à la configuration OAuth**
   - Menu : "APIs & Services" > "OAuth consent screen"

2. **Choisir le type d'utilisateur**
   - Sélectionner **"External"** (pour permettre à tous les utilisateurs de se connecter)
   - Cliquer sur "Create"

3. **Remplir les informations de l'application**

   **Onglet 1 : OAuth consent screen**
   ```
   App name: Delikreol
   User support email: contact@delikreol.com

   App logo: (optionnel, 120x120px minimum)

   Application home page: https://delikreol.com

   Application privacy policy: https://delikreol.com/legal/privacy
   Application terms of service: https://delikreol.com/legal/terms

   Authorized domains:
   - delikreol.com
   - votre-projet.supabase.co

   Developer contact email: contact@delikreol.com
   ```

   - Cliquer sur "Save and Continue"

   **Onglet 2 : Scopes**
   - Cliquer sur "Add or Remove Scopes"
   - Sélectionner les scopes suivants :
     - `userinfo.email` (voir l'adresse email)
     - `userinfo.profile` (voir les infos de profil basiques)
   - Cliquer sur "Update" puis "Save and Continue"

   **Onglet 3 : Test users** (si mode Test)
   - Ajouter quelques emails pour tester
   - Cliquer sur "Save and Continue"

   **Onglet 4 : Summary**
   - Vérifier les informations
   - Cliquer sur "Back to Dashboard"

4. **Publier l'application (IMPORTANT)**
   - Sur l'écran "OAuth consent screen"
   - Cliquer sur "Publish App"
   - Confirmer en cliquant sur "Confirm"
   - Status doit passer à "In production"

---

### Étape 3 : Créer les identifiants OAuth 2.0 (5 min)

1. **Créer un OAuth Client ID**
   - Menu : "APIs & Services" > "Credentials"
   - Cliquer sur "+ Create Credentials" > "OAuth client ID"

2. **Configuration du client**
   ```
   Application type: Web application

   Name: Delikreol Web Client

   Authorized JavaScript origins:
   - https://delikreol.com
   - https://www.delikreol.com
   - http://localhost:5173 (pour dev local)

   Authorized redirect URIs:
   - https://VOTRE_PROJECT_REF.supabase.co/auth/v1/callback
   - http://localhost:54321/auth/v1/callback (pour dev local)
   ```

   **⚠️ IMPORTANT :** Remplacer `VOTRE_PROJECT_REF` par votre vrai Project Ref Supabase

   Pour trouver votre Project Ref:
   - Aller sur Supabase Dashboard
   - Project Settings > General
   - Copier le "Reference ID"

3. **Récupérer les clés**
   - Après création, une popup affiche :
     - ✅ **Client ID** : `12345678.apps.googleusercontent.com`
     - ✅ **Client Secret** : `GOCSPX-xxxxxxxxxxxxx`

   - **🚨 COPIER ET SAUVEGARDER CES CLÉS IMMÉDIATEMENT**
   - Vous pouvez aussi les retrouver dans "Credentials" > nom du client

---

### Étape 4 : Configurer Supabase (5 min)

1. **Aller dans Supabase Dashboard**
   - URL : https://supabase.com/dashboard/project/VOTRE_PROJECT_REF

2. **Activer Google Provider**
   - Menu : Authentication > Providers
   - Trouver "Google" dans la liste
   - Activer le toggle

3. **Saisir les identifiants**
   ```
   Client ID (for OAuth): [Coller votre Client ID]
   Client Secret (for OAuth): [Coller votre Client Secret]
   ```

4. **Sauvegarder**
   - Cliquer sur "Save"

---

### Étape 5 : Mettre à jour votre code (15 min)

1. **Vérifier que Supabase est configuré**

   Fichier `.env` :
   ```bash
   VITE_SUPABASE_URL=https://VOTRE_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_REPLACE_ME
   ```

2. **Ajouter le bouton "Sign in with Google"**

   Dans votre composant de login (ex: `AuthModal.tsx`) :

   ```typescript
   import { supabase } from '../lib/supabase';

   const handleGoogleLogin = async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: `${window.location.origin}/auth/callback`,
       },
     });

     if (error) {
       console.error('Error logging in with Google:', error.message);
     }
   };

   // Dans le JSX :
   <button
     onClick={handleGoogleLogin}
     className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
   >
     <svg className="h-5 w-5" viewBox="0 0 24 24">
       <path
         fill="currentColor"
         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
       />
       <path
         fill="currentColor"
         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
       />
       <path
         fill="currentColor"
         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
       />
       <path
         fill="currentColor"
         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
       />
     </svg>
     Continuer avec Google
   </button>
   ```

3. **Créer une page de callback (optionnel mais recommandé)**

   Créer `src/pages/AuthCallback.tsx` :
   ```typescript
   import { useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { supabase } from '../lib/supabase';

   export default function AuthCallback() {
     const navigate = useNavigate();

     useEffect(() => {
       supabase.auth.onAuthStateChange((event, session) => {
         if (event === 'SIGNED_IN' && session) {
           navigate('/customer');
         }
       });
     }, [navigate]);

     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
           <p className="mt-4 text-gray-600">Connexion en cours...</p>
         </div>
       </div>
     );
   }
   ```

4. **Ajouter la route dans App.tsx**
   ```typescript
   import AuthCallback from './pages/AuthCallback';

   // Dans les routes :
   <Route path="/auth/callback" element={<AuthCallback />} />
   ```

---

### Étape 6 : Tester (10 min)

1. **Test en local**
   ```bash
   npm run dev
   ```

2. **Tester le flow complet**
   - Cliquer sur "Continuer avec Google"
   - Sélectionner un compte Google
   - Autoriser l'application
   - Vérifier la redirection vers `/customer`

3. **Vérifier dans Supabase**
   - Dashboard > Authentication > Users
   - Un nouvel utilisateur doit apparaître avec :
     - Provider: `google`
     - Email du compte Google
     - Avatar (optionnel)

4. **Test en production**
   - Déployer sur delikreol.com
   - Tester à nouveau le flow complet

---

## 🔒 SÉCURITÉ : NE JAMAIS EXPOSER LES SECRETS

### ✅ CORRECT : Utiliser les variables d'environnement

```typescript
// .env (JAMAIS commité dans Git)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_REPLACE_ME

// Dans le code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### ❌ INCORRECT : Hardcoder les clés

```typescript
// ❌ NE JAMAIS FAIRE ÇA
const supabase = createClient(
  'https://xxxxx.supabase.co',
  'eyJhbGc...' // EXPOSÉ DANS LE CODE !
);
```

### .gitignore doit contenir :
```
.env
.env.local
.env.production
```

---

## 🐛 TROUBLESHOOTING

### Erreur : "Redirect URI mismatch"
**Solution :**
- Vérifier que l'URI de callback dans Google Cloud Console correspond exactement à :
  `https://VOTRE_PROJECT_REF.supabase.co/auth/v1/callback`
- Pas d'espace, pas de slash à la fin

### Erreur : "Access blocked: This app's request is invalid"
**Solution :**
- L'application OAuth n'est pas publiée
- Aller dans "OAuth consent screen" > "Publish App"

### Erreur : "Invalid client"
**Solution :**
- Vérifier que Client ID et Client Secret sont corrects dans Supabase
- Re-copier depuis Google Cloud Console > Credentials

### L'utilisateur n'est pas redirigé après connexion
**Solution :**
- Vérifier que `redirectTo` est bien configuré
- Vérifier que la route `/auth/callback` existe

### L'utilisateur est créé mais sans profil
**Solution :**
- Créer un trigger Supabase pour auto-créer le profil :

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📋 CHECKLIST FINALE

Avant de considérer Google SSO comme opérationnel :

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth consent screen configuré et **publié**
- [ ] Client ID et Client Secret créés
- [ ] Redirect URIs correctement configurés
- [ ] Identifiants ajoutés dans Supabase
- [ ] Code du bouton Google ajouté
- [ ] Page callback créée
- [ ] Test en local réussi
- [ ] Test en production réussi
- [ ] Profil utilisateur créé automatiquement
- [ ] .env dans .gitignore
- [ ] Aucun secret hardcodé dans le code

---

## 🎉 C'EST PRÊT !

Une fois tous ces points validés, vos utilisateurs peuvent se connecter avec leur compte Google en un clic !
