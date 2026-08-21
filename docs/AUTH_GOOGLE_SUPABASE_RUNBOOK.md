# Auth Google Supabase — DELIKREOL

## Diagnostic confirmé

Le bouton Google peut être présent côté frontend, mais Supabase renvoie :

`Unsupported provider: provider is not enabled`

Cela signifie que le provider Google n’est pas activé dans Supabase Auth pour le projet `boihlgodmclljtckhmgz`.

## URLs à configurer

Dans Supabase Auth URL configuration :

- Site URL : `https://delikreol.com`
- Redirect URLs :
  - `https://delikreol.com/auth/callback`
  - `https://www.delikreol.com/auth/callback`
  - `http://localhost:5173/auth/callback`

Dans Google Cloud OAuth client :

- Authorized JavaScript origins :
  - `https://delikreol.com`
  - `https://www.delikreol.com`
- Authorized redirect URIs :
  - `https://boihlgodmclljtckhmgz.supabase.co/auth/v1/callback`

## Activation production

1. Créer ou ouvrir un OAuth Client ID Google de type Web.
2. Copier le Client ID et le Client Secret dans Supabase Auth > Providers > Google.
3. Activer Google provider.
4. Vérifier publiquement l'état avec :
   `curl -s https://boihlgodmclljtckhmgz.supabase.co/auth/v1/settings -H "apikey: <ANON_KEY>"`
   (`external.google` doit être `true`).
5. Redéployer GitHub Pages. Aucun feature flag Google n'est nécessaire : la page
   `/connexion` détecte automatiquement l'état réel du provider Supabase.

## Règle de sécurité

Le Client Secret Google reste uniquement dans Supabase. Il ne doit jamais être ajouté au repo ni à une variable `VITE_`.
