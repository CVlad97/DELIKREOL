# Notes de Sécurité - DELIKREOL PRO MVP

## Configuration Requise (Actions Manuelles)

### 1. Protection des Mots de Passe Compromis

**Action requise dans le Dashboard Supabase :**

1. Ouvrir le Dashboard Supabase du projet
2. Naviguer vers : **Authentication** → **Settings** → **Password**  
3. Activer : **"Leaked password protection"** (HaveIBeenPwned)

**Pourquoi ?**
Cette fonctionnalité vérifie automatiquement si les mots de passe des utilisateurs apparaissent dans des bases de données de mots de passe compromis (HaveIBeenPwned.org). Cela empêche les utilisateurs professionnels d'utiliser des mots de passe faibles comme "password123".

**Priorité :** HAUTE (sécurité Pro)

---

## Politiques RLS (Row Level Security)

### Tables Critiques Déjà Sécurisées

Les politiques RLS sont déjà en place et documentées dans les migrations Supabase :

#### 1. `client_requests`
- **SELECT** : Les utilisateurs voient uniquement leurs propres demandes
- **INSERT** : Les utilisateurs authentifiés peuvent créer des demandes
- **ADMIN** : Accès complet pour modération

#### 2. `partner_applications`
- **SELECT** : Partenaires voient leurs candidatures, admins voient tout
- **INSERT** : Utilisateurs authentifiés peuvent candidater
- **UPDATE** : Seuls les admins peuvent changer le statut

#### 3. `profiles`
- **SELECT** : Chaque utilisateur voit son propre profil
- **UPDATE** : Chaque utilisateur peut mettre à jour son profil

#### 4. `partner_documents` & `partner_catalog_files`
- **SELECT/INSERT** : Propriétaire uniquement
- **ADMIN** : Accès complet pour vérification

### Vérification des Politiques

Pour vérifier que toutes les politiques sont actives :

```sql
-- Lister toutes les policies sur une table
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier qu'une table a RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'client_requests',
  'partner_applications',
  'profiles',
  'partner_documents'
);
```

---

## Sécurité de l'API

### Edge Functions

Toutes les Edge Functions Supabase doivent :

1. **Vérifier l'authentification** :
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 });
}
```

2. **Utiliser les CORS headers** :
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

3. **Ne JAMAIS exposer** :
   - `SUPABASE_SERVICE_ROLE_KEY` (backend uniquement)
   - Clés API tierces (Stripe, WhatsApp)
   - Données sensibles non filtrées par RLS

---

## Bonnes Pratiques pour le Code Pro

### 1. Frontend

**Toujours utiliser `auth.uid()` pour filtrer les données :**

```typescript
// BON ✅
const { data } = await supabase
  .from('partner_applications')
  .select('*')
  .eq('user_id', user.id);

// MAUVAIS ❌ (RLS le bloquera mais c'est moins clair)
const { data } = await supabase
  .from('partner_applications')
  .select('*');
```

### 2. Gestion des Rôles

**Vérifier le rôle côté client ET serveur :**

```typescript
// Vérification client (UX)
if (profile?.user_type !== 'admin') {
  showError('Accès réservé aux administrateurs');
  return;
}

// Vérification serveur (sécurité)
// RLS le fait automatiquement via policies
```

### 3. Validation des Données

**Toujours valider les inputs avant soumission :**

```typescript
// Validation d'adresse
if (!geocodeData || !addressVerified) {
  setAddressError('Veuillez sélectionner une adresse valide');
  return;
}

// Validation de fichiers
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  showError('Fichier trop volumineux (max 5MB)');
  return;
}
```

---

## Audit de Sécurité (Checklist MVP)

### Avant la Mise en Production

- [ ] **Leaked password protection** activé dans Supabase Auth
- [ ] Toutes les tables sensibles ont RLS activé
- [ ] Les policies ne contiennent pas `USING (true)` sauf pour données publiques
- [ ] `SUPABASE_SERVICE_ROLE_KEY` n'est JAMAIS dans le code frontend
- [ ] Les Edge Functions vérifient l'authentification
- [ ] Les fichiers uploadés sont dans des buckets avec policies
- [ ] Les logs ne contiennent pas de données sensibles
- [ ] HTTPS uniquement (géré par Supabase)
- [ ] CORS configuré correctement sur Edge Functions

### Monitoring (Post-MVP)

**À surveiller régulièrement :**
- Tentatives d'accès non autorisées (logs Supabase)
- Uploads de fichiers suspects
- Requêtes anormales (rate limiting futur)

---

## Limites Actuelles (MVP)

### Ce Qui N'Est PAS Encore Implémenté

1. **Rate Limiting** :
   - Les APIs ne sont pas protégées contre les abus (DoS)
   - À implémenter via Edge Functions + Redis (post-MVP)

2. **2FA (Authentification à deux facteurs)** :
   - Supabase le supporte mais non activé pour le MVP
   - Recommandé pour les comptes admin en production

3. **Logs d'audit complets** :
   - Pas de traçabilité des actions admin
   - À implémenter via triggers Supabase (post-MVP)

4. **Chiffrement des données sensibles** :
   - Les données sont chiffrées at-rest par Supabase
   - Mais pas de chiffrement additionnel côté application

---

## Ressources

**Documentation Supabase :**
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Best Practices](https://supabase.com/docs/guides/auth)
- [Security & Compliance](https://supabase.com/security)

**Standards de Sécurité :**
- OWASP Top 10
- GDPR (si utilisateurs européens)
- PCI-DSS (si paiements Stripe activés)

---

## Contact Sécurité

Pour reporter une vulnérabilité :
- Email : security@delikreol.com (à créer)
- Process : Responsible disclosure (ne pas poster publiquement)

---

**Dernière mise à jour :** 2024-11-24  
**Statut :** MVP - Sécurité de base opérationnelle  
**Prochaine revue :** Avant lancement production
