# DELIKREOL - Fonds Communautaire / Investissement Participatif

## Vue d'ensemble

Le module **Fonds Communautaire** permet aux utilisateurs de DELIKREOL de soutenir le développement de l'infrastructure logistique (hubs relais, dark kitchens, entrepôts) en utilisant leurs **points de fidélité**.

---

## ⚠️ Important: Mode DEMO

**Ce module fonctionne actuellement en mode DÉMONSTRATION avec des points Delikreol.**

### Ce qu'il N'EST PAS:

- ❌ Un produit financier régulé
- ❌ Une promesse de rendement
- ❌ Un investissement en argent réel
- ❌ Une offre de titres ou parts sociales

### Ce qu'il EST:

- ✅ Un système de soutien communautaire basé sur les points de fidélité
- ✅ Une simulation pour tester le concept
- ✅ Une préparation pour une future offre régulée

### Évolution future:

Toute conversion en produit d'investissement réel nécessitera:
- Un partenaire financier régulé (AMF, ACPR)
- Un cadre juridique approprié (crowdfunding immobilier, SCI, etc.)
- Des documents d'information conformes
- Un système de KYC/AML

---

## Architecture Technique

### Tables Supabase

#### `investment_projects`

Projets d'investissement participatif.

```sql
CREATE TABLE investment_projects (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  project_type text NOT NULL, -- 'relay_hub' | 'dark_kitchen' | 'storage' | 'other'
  target_points numeric NOT NULL,
  collected_points numeric DEFAULT 0,
  status text DEFAULT 'draft', -- 'draft' | 'active' | 'funded' | 'closed'
  zone_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Statuts:**
- `draft`: Projet en préparation (visible admin only)
- `active`: Projet actif, ouvert aux contributions
- `funded`: Objectif atteint, projet en cours
- `closed`: Projet terminé

#### `investment_contributions`

Contributions des utilisateurs aux projets.

```sql
CREATE TABLE investment_contributions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  project_id uuid REFERENCES investment_projects(id),
  contribution_points numeric NOT NULL,
  source text DEFAULT 'loyalty_points',
  created_at timestamptz DEFAULT now()
);
```

#### `investment_preferences`

Préférences de réinvestissement automatique des utilisateurs.

```sql
CREATE TABLE investment_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  mode text DEFAULT 'manual', -- 'auto' | 'manual'
  auto_ratio numeric DEFAULT 0, -- 0.0 à 1.0 (ex: 0.5 = 50%)
  preferred_project_types text[], -- ['relay_hub', 'storage']
  updated_at timestamptz DEFAULT now()
);
```

### Service TypeScript

**Fichier:** `src/services/investmentService.ts`

#### Fonctions principales:

```typescript
// Liste les projets actifs
listActiveProjects(): Promise<InvestmentProject[]>

// Récupère un projet par ID
getProjectById(projectId: string): Promise<InvestmentProject | null>

// Crée une contribution depuis les points de fidélité
createDemoContributionFromLoyalty(
  userId: string,
  projectId: string,
  points: number
): Promise<{ success: boolean; error?: string }>

// Récupère les contributions d'un utilisateur
getUserContributions(userId: string): Promise<InvestmentContribution[]>

// Récupère les préférences d'un utilisateur
getUserInvestmentPreference(userId: string): Promise<InvestmentPreference | null>

// Enregistre les préférences d'un utilisateur
setUserInvestmentPreference(
  userId: string,
  input: { mode, autoRatio, preferredProjectTypes }
): Promise<{ success: boolean; error?: string }>

// Applique l'auto-investissement (appelé après gain de points)
applyAutoInvestmentForUser(
  userId: string,
  newlyEarnedPoints: number
): Promise<{ success: boolean; invested: number; error?: string }>

// Admin: Créer un projet
createProject(input): Promise<{ success: boolean; projectId?: string }>

// Admin: Changer le statut d'un projet
updateProjectStatus(projectId, newStatus): Promise<{ success: boolean }>

// Admin: Statistiques globales
getProjectStats(): Promise<stats>
```

---

## Parcours Utilisateur CLIENT

### Page: `CommunityFundPage`

**URL:** `/community-fund` (via menu client "Fonds")

**Sections:**

1. **Avertissement Mode Démo**
   - Badge jaune visible
   - Texte clair expliquant qu'il ne s'agit pas de finance réelle

2. **Mes Statistiques**
   - Solde de points disponible
   - Nombre de contributions
   - Total de points investis
   - Mode (auto/manuel)

3. **Mes Contributions**
   - Liste des projets soutenus
   - Montant par projet
   - Date de contribution

4. **Projets en Cours**
   - Liste des projets actifs
   - Pour chaque projet:
     - Titre, description, type, zone
     - Barre de progression (points collectés / objectif)
     - Bouton "Soutenir avec mes points"

5. **Préférences de Réinvestissement**
   - Mode: Manuel ou Automatique
   - Si auto:
     - Slider: Ratio d'auto-investissement (0-100%)
     - Checkboxes: Types de projets préférés

### Flow de Contribution:

1. Client clique sur "Soutenir ce projet"
2. Modal avec input pour le montant (en points)
3. Vérification du solde
4. Débit des points via `spendLoyaltyPoints`
5. Création de la contribution
6. Mise à jour automatique de `collected_points` (trigger SQL)
7. Toast de confirmation

---

## Parcours Utilisateur ADMIN

### Page: `CommunityFundAdmin`

**URL:** `/admin/community-fund` (via menu admin "Fonds")

**Sections:**

1. **Statistiques Globales**
   - Total des points investis
   - Nombre total de projets
   - Projets actifs
   - Nombre de contributeurs
   - Répartition par type

2. **Liste des Projets**
   - Tous les projets (tous statuts)
   - Pour chaque:
     - Titre, description, type, zone
     - Statut (draft/active/funded/closed)
     - Barre de progression
     - Bouton éditer statut

3. **Créer un Nouveau Projet**
   - Bouton "+ Nouveau projet"
   - Modal avec formulaire:
     - Titre *
     - Description *
     - Type (select) *
     - Objectif en points *
     - Zone (optionnel)
   - Créé avec statut 'draft'

4. **Gestion des Statuts**
   - Clic sur un projet
   - Modal pour changer le statut
   - Workflow: draft → active → funded → closed

---

## Intégration Auto-Investment

### Principe:

Quand un utilisateur gagne des points (ex: après une commande complétée), le système peut **automatiquement** investir une partie de ces points selon ses préférences.

### Implémentation Future:

Dans `loyaltyService.ts`, après `addLoyaltyPoints`:

```typescript
// Exemple d'intégration future
export async function addLoyaltyPoints(
  userId: string,
  amount: number,
  reason: string,
  relatedOrderId?: string
): Promise<boolean> {
  // ... code existant pour ajouter les points

  // Appliquer l'auto-investment si configuré
  if (reason === 'order_completed') {
    await applyAutoInvestmentForUser(userId, amount);
  }

  return true;
}
```

Ou via une **Edge Function** déclenchée sur `loyalty_events`:

```typescript
// supabase/functions/auto-invest/index.ts
Deno.serve(async (req) => {
  const { record } = await req.json();
  
  if (record.amount > 0) {
    await applyAutoInvestmentForUser(
      record.user_id,
      record.amount
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Logique Auto-Investment:

1. Récupérer les préférences user
2. Si `mode === 'auto'`:
   - Calculer: `pointsToInvest = newPoints * autoRatio`
   - Filtrer les projets actifs par `preferred_project_types`
   - Choisir un projet (ou répartir)
   - Créer la contribution

---

## RLS & Sécurité

### Policies `investment_projects`:

- **Public**: Voir les projets actifs/funded
- **Admin**: Voir/créer/modifier tous les projets

### Policies `investment_contributions`:

- **User**: Voir/créer ses propres contributions
- **Admin**: Voir toutes les contributions

### Policies `investment_preferences`:

- **User**: Gérer ses propres préférences
- **Admin**: N/A (pas besoin d'accès admin)

### Triggers SQL:

- **Auto-update `collected_points`**: Trigger AFTER INSERT sur `investment_contributions`
- **Auto-update `updated_at`**: Trigger BEFORE UPDATE sur projets et préférences

---

## Types de Projets

### `relay_hub` - Hub Relais

**Description:** Point de collecte/distribution pour mutualiser les livraisons.

**Exemples:**
- Hub relais Fort-de-France Nord
- Hub relais Schoelcher Centre
- Hub relais Le Lamentin

**Bénéfices communautaires:**
- Réduit les trajets individuels
- Optimise la logistique
- Crée de l'emploi local

### `dark_kitchen` - Dark Kitchen

**Description:** Cuisine professionnelle partagée pour restaurants virtuels.

**Exemples:**
- Dark Kitchen Fort-de-France
- Kitchen Partagée Schoelcher

**Bénéfices:**
- Facilite la création de restaurants
- Réduit les coûts d'infrastructure
- Permet de tester des concepts

### `storage` - Entrepôt

**Description:** Espace de stockage mutualisé (sec, froid, congelé).

**Exemples:**
- Entrepôt frigorifique Le Lamentin
- Stockage sec Fort-de-France

**Bénéfices:**
- Mutualise les coûts
- Améliore la chaîne du froid
- Réduit le gaspillage

### `other` - Autre

Projets d'infrastructure non catégorisés.

---

## Roadmap & Évolution

### Phase 1 - Actuelle (Points Demo)

**Statut:** ✅ Implémenté

- Module fonctionnel avec points de fidélité
- UI client + admin complètes
- Préférences auto-investment
- Mode DEMO clairement indiqué

### Phase 2 - Pilote Régulé (3-6 mois)

**Prérequis:**
- Partenaire financier agréé
- Structure juridique (SCIC, SCI, etc.)
- Document d'Information Clé (DIC)
- Plateforme de crowdfunding immo agrée

**Actions:**
- Conversion points → euros (ratio fixe)
- KYC/AML obligatoire
- Contrat d'investissement
- Suivi légal des parts

### Phase 3 - Tokenisation (6-12 mois)

**Concept:**
- Points → Tokens blockchain (Solana/Polygon)
- NFT badges pour contributeurs
- Smart contracts pour gouvernance
- Fractionnal ownership

**Bénéfices:**
- Liquidité secondaire
- Transparence blockchain
- Gouvernance DAO
- International-friendly

---

## API Reference

### Client Endpoints

```typescript
// Récupérer projets actifs
GET /investment_projects?status=eq.active

// Créer une contribution (RLS vérifie user_id)
POST /investment_contributions
Body: { user_id, project_id, contribution_points, source }

// Récupérer mes contributions
GET /investment_contributions?user_id=eq.<userId>

// Gérer mes préférences
UPSERT /investment_preferences
Body: { user_id, mode, auto_ratio, preferred_project_types }
```

### Admin Endpoints

```typescript
// Liste tous les projets
GET /investment_projects

// Créer un projet
POST /investment_projects
Body: { title, description, project_type, target_points, zone_label, status }

// Changer statut
PATCH /investment_projects?id=eq.<projectId>
Body: { status: 'active' }

// Stats globales
- Custom via investmentService.getProjectStats()
```

---

## Testing & QA

### Tests Manuels

1. **Contribution Client:**
   - ✅ Vérifier solde suffisant
   - ✅ Débit des points
   - ✅ Création contribution
   - ✅ Mise à jour collected_points
   - ✅ Toast confirmation

2. **Auto-Investment:**
   - ✅ Préférences enregistrées
   - ✅ Déclenchement après gain points
   - ✅ Respect du ratio
   - ✅ Filtrage par types

3. **Admin CRUD:**
   - ✅ Création projet
   - ✅ Changement statut
   - ✅ Stats globales

### Edge Cases

- Solde insuffisant → Error clair
- Projet inexistant → Error
- Projet non actif → Error
- Ratio auto 0% → Pas d'investissement
- Aucun projet actif → Pas d'erreur, log info

---

## FAQ

### Q: Les points deviennent de l'argent réel?

**R:** Non. Les points restent des points. C'est un système de soutien communautaire, pas un produit financier.

### Q: Puis-je récupérer mes points investis?

**R:** Non, les contributions sont définitives. Les points sont "dépensés" pour soutenir un projet.

### Q: Que se passe-t-il si un projet échoue?

**R:** Les points restent alloués au projet. C'est un soutien, pas un prêt.

### Q: Comment savoir si un projet est sérieux?

**R:** Tous les projets sont validés par l'équipe admin. Le mode démo sert à tester le concept, pas à collecter de vrais fonds.

### Q: Quand aura-t-on un vrai système d'investissement?

**R:** Dès qu'un partenaire régulé sera trouvé et que le cadre juridique sera établi. Aucune date fixée.

---

## Conformité & Légal

### Disclaimers Obligatoires

**Sur toutes les pages du module:**

> "Ce module fonctionne en mode DEMO avec des points Delikreol. Il ne s'agit pas d'un produit financier ni d'une promesse de rendement. Toute évolution vers un produit d'investissement réel nécessitera un partenaire régulé."

### Mentions Légales

- Pas de promesse de rendement
- Pas de garantie de capital
- Pas de droit de propriété
- Pas de conseil en investissement

### Protection des Données

- Contributions: Données personnelles (RGPD)
- Préférences: Stockées localement + Supabase
- Export possible via admin

---

## Support & Contact

Pour toute question sur le module Fonds Communautaire:

- **Documentation:** `/docs/community-fund.md`
- **Code:** `src/services/investmentService.ts`
- **Admin:** Page dédiée dans AdminApp

---

**DELIKREOL - Ensemble, construisons la logistique de demain** 💚🏗️
