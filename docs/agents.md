# DELIKREOL - Système d'Agents Intelligents

Ce document décrit l'architecture et le fonctionnement des trois agents IA qui transforment DELIKREOL en une plateforme logistique intelligente.

---

## Vue d'ensemble

DELIKREOL intègre trois agents spécialisés qui automatisent et optimisent les opérations logistiques :

1. **Agent Operations Copilot** - Assistant IA pour les administrateurs
2. **Agent Route Optimizer** - Optimisation automatique des tournées de livraison
3. **Agent Partner Scoring** - Évaluation automatique des candidatures de partenaires

Ces agents fonctionnent de manière autonome mais peuvent être supervisés et ajustés par les administrateurs via le Hub Logistique.

---

## Agent 1 : Operations Copilot

### Objectif

Fournir aux administrateurs une analyse en temps réel de la plateforme avec des recommandations actionnables basées sur les données opérationnelles.

### Fichier Source

`src/agents/adminCopilot.ts`

### Fonctionnalités

#### 1. Agrégation de Métriques (`aggregateDailyMetrics`)

Collecte automatique des données opérationnelles :
- Nombre total de commandes du jour
- Répartition par statut (pending, confirmed, preparing, etc.)
- Revenus générés
- Nombre de livreurs disponibles
- Utilisation des points relais (taux de remplissage)
- Commandes par zone géographique
- Temps moyen de livraison

**Sources de données :**
- Table `orders` (commandes du jour)
- Table `drivers` (disponibilité en temps réel)
- Table `relay_points` avec `storage_capacities` (capacités)
- Table `deliveries` (temps de livraison)

#### 2. Génération de Résumés (`generateCopilotSummary`)

Utilise OpenAI GPT-4 pour générer :
- **Résumé de la situation** : Vue d'ensemble en langage naturel
- **Alertes prioritaires** : Problèmes nécessitant une action immédiate
  - Points relais saturés (>80% capacité)
  - Pénurie de livreurs (<3 disponibles)
  - Accumulation de commandes en attente (>5)
- **Suggestions d'optimisation** : Recommandations concrètes
  - Redirection vers relais moins chargés
  - Recrutement de livreurs
  - Réorganisation des zones

**Gestion des erreurs :**
Si l'API OpenAI est indisponible, le système retourne un résumé basique basé sur les métriques brutes.

#### 3. Chat Interactif (`askCopilot`)

Interface conversationnelle permettant aux admins de poser des questions en langage naturel :

**Exemples de questions :**
- "Quels relais sont proches de la saturation ?"
- "Quelle zone est la plus rentable aujourd'hui ?"
- "Combien de livreurs dois-je recruter ?"
- "Quel est le temps de livraison moyen ?"

Le contexte (métriques actuelles) est automatiquement fourni à l'IA pour des réponses pertinentes.

### Intégration dans le Hub

L'Operations Copilot est accessible via le panneau latéral du Hub Logistique (`src/pages/AdminHub.tsx`).

**Actions rapides pré-configurées :**
- Analyser les relais saturés
- Identifier la zone la plus rentable
- Générer un rapport de performance

### Évolution Future

**Court terme :**
- Notifications proactives (push) quand des seuils critiques sont atteints
- Historique des conversations pour suivi temporel
- Export des recommandations en PDF

**Long terme :**
- Prédictions basées sur l'historique (ML)
- Suggestions automatiques d'actions (avec approbation admin)
- Intégration avec systèmes externes (comptabilité, CRM)

---

## Agent 2 : Route Optimizer

### Objectif

Générer automatiquement des tournées optimisées pour les livreurs en fonction de la distance, de la charge de travail et de la disponibilité.

### Fichier Source

`src/agents/routeOptimizer.ts`

### Algorithme d'Optimisation

#### 1. Collecte des Données

**Commandes éligibles :**
- Statut : `confirmed`, `preparing`, `ready`
- Possède des coordonnées GPS (`delivery_latitude`, `delivery_longitude`)

**Livreurs disponibles :**
- `is_available = true`
- Possède position actuelle (`current_latitude`, `current_longitude`)
- Maximum 3 livraisons actives simultanées

#### 2. Scoring de Compatibilité

Pour chaque paire (livreur, commande), un score est calculé :

```
score = (distanceScore × 0.6) + (loadScore × 0.4)

où :
- distanceScore = max(0, 100 - distance_km × 10)
- loadScore = max(0, 100 - livraisons_actives × 30)
```

**Pondération :**
- Distance (60%) : Proximité du livreur
- Charge (40%) : Nombre de livraisons en cours

#### 3. Affectation Greedy

Pour chaque livreur (ordre aléatoire) :
1. Sélectionner les commandes non assignées
2. Calculer le score pour chaque commande
3. Trier par score décroissant
4. Assigner jusqu'à `MAX_ORDERS_PER_DRIVER - livraisons_actives`

#### 4. Calcul de Temps

```
temps_estimé = (distance_km / vitesse_moyenne_kmh) × 60 + temps_préparation_min

où :
- vitesse_moyenne = 25 km/h (scooter en ville)
- temps_préparation = 5 minutes
```

### Fonctions Principales

#### `optimizeRoutes(timeWindowMinutes)`

Génère des tournées pour la prochaine période (par défaut 60 min).

**Retour :**
```typescript
{
  assignments: [
    {
      driverId: string,
      driverName: string,
      orders: [
        {
          orderId: string,
          orderNumber: string,
          address: string,
          distance: number,
          estimatedTime: number
        }
      ],
      totalDistance: number,
      estimatedTotalTime: number
    }
  ],
  unassignedOrders: string[],
  summary: {
    totalOrders: number,
    assignedOrders: number,
    driversUsed: number,
    averageOrdersPerDriver: number
  }
}
```

#### `assignRouteToDriver(driverId, orderIds)`

Applique physiquement les affectations en base de données :
- Crée ou met à jour les entrées dans `deliveries`
- Change le statut des commandes à `in_delivery`
- Enregistre `assigned_at` timestamp

### Contraintes

- Maximum 3 commandes simultanées par livreur
- Distance calculée à vol d'oiseau (formule de Haversine)
- Ne prend pas encore en compte :
  - Les horaires de livraison demandés
  - Les zones interdites ou difficiles
  - Le trafic en temps réel

### Intégration dans le Hub

Accessible via le bouton "Générer les tournées" dans le Hub Logistique.

**Affichage :**
- Liste par livreur avec séquence de livraisons
- Distances et temps estimés
- Possibilité de réaffecter manuellement

### Évolution Future

**Court terme :**
- Intégrer les horaires de livraison souhaités
- Considérer le type de véhicule (capacité, vitesse)
- Prioriser les commandes urgentes

**Long terme :**
- Algorithme génétique pour optimisation globale
- Intégration API Google Maps/Waze pour trafic réel
- Regroupement de commandes proches (tournées multi-pickup)

---

## Agent 3 : Partner Scoring

### Objectif

Évaluer automatiquement la qualité et la complétude des candidatures de partenaires (vendeurs, livreurs, hôtes de relais) et générer des réponses personnalisées.

### Fichier Source

`src/agents/partnerScoring.ts`

### Système d'Évaluation

#### 1. Champs Requis par Type

**Vendeurs :**
| Champ | Requis | Poids |
|-------|--------|-------|
| business_name | Oui | 10 |
| business_type | Oui | 10 |
| siret | Oui | 15 |
| health_compliance | Oui | 20 |
| address | Oui | 10 |
| phone | Oui | 10 |
| description | Oui | 5 |
| product_categories | Oui | 10 |
| opening_hours | Oui | 5 |
| delivery_radius | Non | 5 |

**Livreurs :**
| Champ | Requis | Poids |
|-------|--------|-------|
| siret | Oui | 20 |
| insurance_proof | Oui | 20 |
| vehicle_type | Oui | 15 |
| license_number | Oui | 15 |
| full_name | Oui | 10 |
| phone | Oui | 10 |
| availability | Oui | 10 |

**Hôtes de Point Relais :**
| Champ | Requis | Poids |
|-------|--------|-------|
| security_measures | Oui | 15 |
| storage_types | Oui | 15 |
| location_name | Oui | 10 |
| address | Oui | 10 |
| owner_name | Oui | 10 |
| phone | Oui | 10 |
| total_capacity | Oui | 10 |
| opening_hours | Oui | 10 |
| parking_available | Non | 5 |
| pmr_accessible | Non | 5 |

#### 2. Calcul du Score de Complétude

```
complétude = (poids_cumulé_champs_remplis / poids_total) × 100
```

#### 3. Attribution de la Note

| Complétude | Note |
|------------|------|
| ≥ 85% | A |
| 70-84% | B |
| < 70% | C |

### Analyse Automatique

#### Identification des Forces

Pour les champs obligatoires de poids ≥ 15 qui sont remplis :
- "health_compliance complet et conforme" (vendeurs)
- "insurance_proof complet et conforme" (livreurs)
- "security_measures complet et conforme" (relais)

#### Identification des Faiblesses

Pour chaque champ obligatoire manquant :
- "siret manquant (requis)"
- "storage_types manquant (requis)"

### Génération de Réponses

#### Note A : Acceptation Immédiate

```
Sujet : Bienvenue chez DELIKREOL - Candidature acceptée

Bonjour [Nom],

Excellente nouvelle ! Votre candidature a été acceptée.
Votre dossier est complet et conforme...

Prochaines étapes :
1. Identifiants dans les 24h
2. Formation en ligne
3. Activation du profil
```

#### Note B : Complément d'Information

```
Sujet : DELIKREOL - Complément d'information requis

Bonjour [Nom],

Votre dossier est prometteur, mais nous avons besoin de :
- [Liste des faiblesses]

Merci de compléter ces éléments dans les 7 jours.
```

#### Note C : Refus Poli

```
Sujet : DELIKREOL - Candidature

Bonjour [Nom],

Votre candidature ne répond pas à nos critères actuels :
- [Liste des faiblesses]

Nous vous encourageons à re-postuler une fois complétée.
```

### Fonctions Principales

#### `scoreApplication(application)`

Évalue une candidature et retourne :
```typescript
{
  grade: 'A' | 'B' | 'C',
  completeness_score: number,
  strengths: string[],
  weaknesses: string[],
  response_template: {
    subject: string,
    body: string
  }
}
```

#### `submitApplication(application)`

Soumet une candidature :
1. Calcule le score automatiquement
2. Enregistre dans `partner_applications`
3. Retourne l'ID de la candidature

#### `getApplications(filters)`

Récupère les candidatures avec filtres optionnels :
- `partner_type`: 'vendor' | 'driver' | 'relay_host'
- `status`: 'submitted' | 'under_review' | 'approved' | 'rejected'
- `ai_score`: 'A' | 'B' | 'C'

### Intégration

**Frontend :**
- Formulaires dans `src/components/PartnerApplicationForm.tsx`
- Page "Devenir Partenaire" dans `src/pages/BecomePartner.tsx`

**Admin Hub :**
- Section "Candidatures en attente"
- Affichage du score IA
- Utilisation du template de réponse suggéré

### Évolution Future

**Court terme :**
- Vérification des numéros SIRET via API INSEE
- Validation des emails et téléphones
- Upload de documents (photos, certificats)

**Long terme :**
- Analyse avancée avec GPT-4 des descriptions textuelles
- Vérification automatique des antécédents
- Scoring prédictif de performance future

---

## Architecture Technique

### Dépendances

**Toutes les agents :**
- `@supabase/supabase-js` : Accès base de données
- OpenAI GPT-4 (via `src/utils/apiIntegrations.ts`)

**Agents Copilot & Partner Scoring uniquement :**
- Clé API OpenAI (stockée dans `api_keys` table)

**Agent Route Optimizer :**
- Aucune dépendance externe (algorithme heuristique)

### Gestion des Erreurs

Tous les agents implémentent :

```typescript
try {
  // Logique métier
} catch (error) {
  console.error('Error in agent:', error);

  // Log dans error_logs table
  await logError('agent_name', 'error_type', error.message);

  // Fallback ou message utilisateur
  throw new Error('Message convivial pour l\'utilisateur');
}
```

**Table `error_logs` :**
```sql
CREATE TABLE error_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  function_name text NOT NULL,
  error_type text NOT NULL,
  error_message text NOT NULL,
  context_data jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Performance

**Optimisations implémentées :**
- Requêtes Supabase parallélisées avec `Promise.all`
- Indexes sur colonnes fréquemment filtrées
- Cache local des métriques (rafraîchi toutes les 5 min)

**Temps de réponse typiques :**
- Operations Copilot : 2-4 secondes (appel OpenAI)
- Route Optimizer : <1 seconde (100 commandes, 10 livreurs)
- Partner Scoring : <500ms (évaluation locale)

---

## Configuration

### Variables d'Environnement

**Frontend (.env) :**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
```

**Clés API (dans Supabase `api_keys` table) :**
- OpenAI API Key (service: 'openai')
- Accessible uniquement aux admins via `src/components/admin/APIKeysManager.tsx`

### Activation des Agents

**Agent Copilot :**
1. Configurer clé OpenAI dans Admin Panel > Clés API
2. Accéder au Hub Logistique
3. Le panneau assistant apparaît automatiquement

**Agent Route Optimizer :**
- Aucune configuration requise
- Disponible immédiatement via bouton "Générer les tournées"

**Agent Partner Scoring :**
- Aucune configuration requise
- S'active automatiquement à la soumission d'un formulaire

---

## Tests & Validation

### Tests Recommandés

**Operations Copilot :**
```typescript
// Tester l'agrégation de métriques
const metrics = await aggregateDailyMetrics();
expect(metrics.totalOrders).toBeGreaterThanOrEqual(0);

// Tester le fallback sans IA
process.env.OPENAI_API_KEY = '';
const summary = await generateCopilotSummary(metrics);
expect(summary.summary).toBeDefined();
```

**Route Optimizer :**
```typescript
// Tester l'optimisation
const result = await optimizeRoutes(60);
expect(result.assignments.length).toBeLessThanOrEqual(result.summary.totalOrders);

// Vérifier les contraintes
result.assignments.forEach(assignment => {
  expect(assignment.orders.length).toBeLessThanOrEqual(3);
});
```

**Partner Scoring :**
```typescript
// Tester le scoring
const score = await scoreApplication({
  applicant_name: 'Test Vendor',
  applicant_email: 'test@test.com',
  applicant_phone: '+596696000000',
  partner_type: 'vendor',
  application_data: { /* complet */ }
});
expect(score.grade).toBe('A');
```

---

## Monitoring

### Métriques à Surveiller

**Operations Copilot :**
- Nombre de requêtes OpenAI / jour
- Temps de réponse moyen
- Taux d'erreur API

**Route Optimizer :**
- Nombre d'optimisations / jour
- Commandes non assignées (%)
- Temps moyen de calcul

**Partner Scoring :**
- Candidatures par type / semaine
- Distribution des notes (A/B/C)
- Taux d'approbation finale vs score IA

### Logs

Tous les événements importants sont loggés dans `error_logs` :
```sql
SELECT function_name, COUNT(*) as errors
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY function_name
ORDER BY errors DESC;
```

---

## Support

**Documentation technique :**
- `docs/agents.md` (ce fichier)
- `docs/admin-operations.md` (guide utilisateur)

**Contact développement :**
- Email : tech@delikreol.com
- GitHub Issues

**Formation admin :**
- Vidéo tutoriel disponible dans le Hub
- Session en ligne mensuelle

---

**DELIKREOL - Intelligence Logistique pour l'Écosystème Local** 🚀🌴
