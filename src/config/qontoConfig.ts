/**
 * @module qontoConfig
 *
 * Configuration Qonto pour DeliKreol — Structure inspirée du modèle
 * Qonto pour entreprises en Martinique (972, DOM-TOM France).
 *
 * Référence : https://qonto.com/fr/pricing
 * Plans 2024/2025 — Solo (9/19/39€ HT) · Team (49/99/199€ HT)
 * IBAN FR · Mastercard · API REST v2
 */

// ─── Plans tarifaires Qonto 2024/2025 ───────────────────────────────────────

export interface QontoPlan {
  id: string;
  slug: string;
  name: string;
  tier: 'solo' | 'team';
  priceMonthly: number;       // € HT/mois (annuel)
  priceYearly: number;        // € HT/an
  ibanCount: number;          // IBAN inclus
  cardsIncluded: number;      // Cartes incluses
  cardExtraPrice: number;     // € HT/carte supplémentaire
  transfersIncluded: number;  // Virements SEPA inclus/mois
  transferExtraPrice: number; // € HT/virement supplémentaire
  cashbackRate: number;       // % cashback
  features: string[];
  recommended: boolean;       // Plan recommandé pour DeliKreol
}

export const QONTO_PLANS: QontoPlan[] = [
  {
    id: 'solo_basic_2024',
    slug: 'solo-basic',
    name: 'Solo Basic',
    tier: 'solo',
    priceMonthly: 9,
    priceYearly: 108,
    ibanCount: 1,
    cardsIncluded: 1,
    cardExtraPrice: 5,
    transfersIncluded: 20,
    transferExtraPrice: 0.20,
    cashbackRate: 0,
    features: [
      '1 IBAN français',
      '1 carte Mastercard virtuelle',
      '20 virements SEPA/mois',
      'Catégorisation auto des dépenses',
      'Reçu photographique intelligent',
    ],
    recommended: false,
  },
  {
    id: 'solo_smart_2024',
    slug: 'solo-smart',
    name: 'Solo Smart',
    tier: 'solo',
    priceMonthly: 19,
    priceYearly: 228,
    ibanCount: 1,
    cardsIncluded: 1,
    cardExtraPrice: 5,
    transfersIncluded: 50,
    transferExtraPrice: 0.20,
    cashbackRate: 0,
    features: [
      '1 IBAN français',
      '1 carte Mastercard (physique ou virtuelle)',
      '50 virements SEPA/mois',
      'Catégorisation auto des dépenses',
      'Reçu photographique intelligent',
      'Rapprochement bancaire',
      'Export comptable CSV/OFX',
    ],
    recommended: false,
  },
  {
    id: 'solo_premium_2024',
    slug: 'solo-premium',
    name: 'Solo Premium',
    tier: 'solo',
    priceMonthly: 39,
    priceYearly: 468,
    ibanCount: 2,
    cardsIncluded: 2,
    cardExtraPrice: 5,
    transfersIncluded: 150,
    transferExtraPrice: 0.20,
    cashbackRate: 0.5,
    features: [
      '2 IBAN français',
      '2 cartes Mastercard',
      '150 virements SEPA/mois',
      'Toutes les fonctionnalités Smart',
      '0,5 % de cashback',
      'Notes de frais intégrées',
      'Intégrations comptables (Sage, Pennylane…)',
      'Dépôts de cash',
    ],
    recommended: true, // ← Recommandé pour DeliKreol (2 IBAN = principal + commissions)
  },
  {
    id: 'team_essential_2024',
    slug: 'team-essential',
    name: 'Team Essential',
    tier: 'team',
    priceMonthly: 49,
    priceYearly: 588,
    ibanCount: 3,
    cardsIncluded: 3,
    cardExtraPrice: 5,
    transfersIncluded: 150,
    transferExtraPrice: 0.20,
    cashbackRate: 0.5,
    features: [
      '3 IBAN français',
      '3 cartes Mastercard',
      '150 virements SEPA/mois',
      'Toutes les fonctionnalités Solo Premium',
      'Accès multi-membres (jusqu\'à 5)',
      'Approbation de dépenses',
      'Budgets par équipe',
      'Intégrations comptables',
    ],
    recommended: false,
  },
  {
    id: 'team_business_2024',
    slug: 'team-business',
    name: 'Team Business',
    tier: 'team',
    priceMonthly: 99,
    priceYearly: 1188,
    ibanCount: 5,
    cardsIncluded: 5,
    cardExtraPrice: 5,
    transfersIncluded: 500,
    transferExtraPrice: 0.10,
    cashbackRate: 1.0,
    features: [
      '5 IBAN français',
      '5 cartes Mastercard',
      '500 virements SEPA/mois',
      'Toutes les fonctionnalités Team Essential',
      'Membres illimités',
      '1 % de cashback',
      'API accès complet',
      'Rapprochement automatique',
      'Facturation fournisseurs',
    ],
    recommended: false,
  },
  {
    id: 'team_enterprise_2024',
    slug: 'team-enterprise',
    name: 'Team Enterprise',
    tier: 'team',
    priceMonthly: 199,
    priceYearly: 2388,
    ibanCount: 10,
    cardsIncluded: 10,
    cardExtraPrice: 5,
    transfersIncluded: 2000,
    transferExtraPrice: 0.05,
    cashbackRate: 1.5,
    features: [
      '10 IBAN français',
      '10 cartes Mastercard',
      '2000 virements SEPA/mois',
      'Toutes les fonctionnalités Team Business',
      '1,5 % de cashback',
      'Account manager dédié',
      'SLA garanti',
      'Onboarding personnalisé',
      'Multi-entités',
    ],
    recommended: false,
  },
];

// ─── Plan recommandé pour DeliKreol ─────────────────────────────────────────

export const DELIKREOL_RECOMMENDED_PLAN = QONTO_PLANS.find(p => p.recommended)!;

// ─── Structure Organisation DeliKreol (Martinique 972) ─────────────────────

export interface QontoOrganizationConfig {
  /** Nom légal de l'entreprise */
  legalName: string;
  /** Nom commercial */
  brandName: string;
  /** Email de contact principal */
  contactEmail: string;
  /** Téléphone (format international) */
  phone: string;
  /** Adresse postale complète */
  address: {
    street: string;
    city: string;
    postalCode: string;
    department: string;
    country: string;
  };
  /** Numéro SIREN */
  siren: string;
  /** Numéro SIRET (établissement siège) */
  siret: string;
  /** Code NAF/APE */
  nafCode: string;
  /** Forme juridique */
  legalForm: string;
  /** Capital social (€) */
  capitalSocial: number;
  /** Département DOM-TOM */
  domTom: string;
  /** Numéro TVA intracommunautaire */
  tvaIntracom: string;
  /** Plan Qonto actif */
  planId: string;
  /** Devise par défaut */
  defaultCurrency: string;
  /** Statut */
  status: 'active' | 'pending' | 'suspended';
}

export const DELIKREOL_ORG: QontoOrganizationConfig = {
  legalName: 'DELIKREOL',
  brandName: 'DeliKreol',
  contactEmail: 'contact@delikreol.mq',
  phone: '+596 696 00 00 00',
  address: {
    street: 'Rue principale',
    city: 'Fort-de-France',
    postalCode: '97200',
    department: 'Martinique',
    country: 'FR',
  },
  siren: 'XXX XXX XXX',     // À compléter
  siret: 'XXX XXX XXX XXXXX', // À compléter
  nafCode: '56.10C',        // Restauration traditionnelle
  legalForm: 'SAS',         // ou SARL / micro-entreprise
  capitalSocial: 1000,
  domTom: '972 - Martinique',
  tvaIntracom: 'FR XX XXX XXX XXX', // À compléter
  planId: DELIKREOL_RECOMMENDED_PLAN.id,
  defaultCurrency: 'EUR',
  status: 'pending',        // En attente de création du compte Qonto
};

// ─── Comptes bancaires DeliKreol ────────────────────────────────────────────

export interface QontoBankAccountConfig {
  /** Nom d'affichage du compte */
  name: string;
  /** Slug identifiant */
  slug: string;
  /** Type de compte Qonto */
  type: 'checking' | 'savings' | 'external';
  /** Devise */
  currency: string;
  /** Description / usage */
  description: string;
  /** Labels personnalisés */
  labels: string[];
  /** Rôle dans le workflow DeliKreol */
  role: string;
  /** IBAN format attendu (FR76 XXXX XXXX XXXX XXXX XXXX XXX) */
  ibanPattern: string;
  /** BIC attendu */
  bicPattern: string;
}

export const DELIKREOL_BANK_ACCOUNTS: QontoBankAccountConfig[] = [
  {
    name: 'Compte Principal DeliKreol',
    slug: 'principal',
    type: 'checking',
    currency: 'EUR',
    description: 'Compte courant principal — réception paiements clients, décaissements fournisseurs',
    labels: ['principal', 'martinique', 'delikreol'],
    role: 'Flux principal : clients → DeliKreol → traiteurs/livreurs',
    ibanPattern: 'FR76 XXXX XXXX XXXX XXXX XXXX XX1',
    bicPattern: 'QONTFRP1XXX',
  },
  {
    name: 'Compte Commissions DeliKreol',
    slug: 'commissions',
    type: 'checking',
    currency: 'EUR',
    description: 'Compte secondaire — rétention commissions plateforme (~10%)',
    labels: ['commissions', 'marge', 'delikreol'],
    role: 'Séparation marge DeliKreol vs. fonds traiteurs/livreurs',
    ibanPattern: 'FR76 XXXX XXXX XXXX XXXX XXXX XX2',
    bicPattern: 'QONTFRP1XXX',
  },
];

// ─── Catégories de transactions — Adaptées food-tech Martinique ─────────────

export interface QontoCategoryConfig {
  /** ID catégorie Qonto (format API) */
  id: string;
  /** Nom affiché */
  name: string;
  /** Slug unique */
  slug: string;
  /** Type de transaction */
  side: 'debit' | 'credit' | 'both';
  /** Icône (Lucide) */
  icon: string;
  /** Couleur */
  color: string;
  /** Description */
  description: string;
  /** Priorité d'affichage (0 = haut) */
  priority: number;
  /** Spécifique DeliKreol */
  delikreolSpecific: boolean;
}

export const DELIKREOL_CATEGORIES: QontoCategoryConfig[] = [
  // ── Crédits (revenus) ──
  {
    id: '11', name: 'Revenus clients', slug: 'revenus-clients',
    side: 'credit', icon: 'TrendingUp', color: '#10b981',
    description: 'Paiements reçus des clients (commandes DeliKreol)',
    priority: 0, delikreolSpecific: true,
  },
  {
    id: '12', name: 'Commissions DeliKreol', slug: 'commissions-delikreol',
    side: 'credit', icon: 'DollarSign', color: '#6366f1',
    description: 'Commission plateforme ~10% sur chaque commande',
    priority: 1, delikreolSpecific: true,
  },
  {
    id: '13', name: 'Remboursements', slug: 'remboursements',
    side: 'credit', icon: 'RotateCcw', color: '#f59e0b',
    description: 'Remboursements clients (annulations, erreurs)',
    priority: 5, delikreolSpecific: false,
  },
  {
    id: '14', name: 'Avoirs fournisseurs', slug: 'avoirs-fournisseurs',
    side: 'credit', icon: 'FileText', color: '#8b5cf6',
    description: 'Avoirs reçus des fournisseurs/traiteurs',
    priority: 8, delikreolSpecific: false,
  },

  // ── Débits (dépenses) ──
  {
    id: '21', name: 'Paiements traiteurs', slug: 'paiements-traiteurs',
    side: 'debit', icon: 'ChefHat', color: '#ef4444',
    description: 'Reversement aux traiteurs (montant commande - commission)',
    priority: 2, delikreolSpecific: true,
  },
  {
    id: '22', name: 'Frais de livraison', slug: 'frais-livraison',
    side: 'debit', icon: 'Truck', color: '#f97316',
    description: 'Paiement livreurs et frais de transport',
    priority: 3, delikreolSpecific: true,
  },
  {
    id: '23', name: 'Marketing & Publicité', slug: 'marketing',
    side: 'debit', icon: 'Megaphone', color: '#ec4899',
    description: 'Publicité réseaux sociaux, flyers, événements Martinique',
    priority: 6, delikreolSpecific: false,
  },
  {
    id: '24', name: 'Abonnements & Logiciels', slug: 'abonnements',
    side: 'debit', icon: 'CreditCard', color: '#0ea5e9',
    description: 'Stripe, Qonto, Supabase, domaine, hébergement',
    priority: 7, delikreolSpecific: false,
  },
  {
    id: '25', name: 'Frais bancaires', slug: 'frais-bancaires',
    side: 'debit', icon: 'Landmark', color: '#64748b',
    description: 'Frais Qonto, commissions virements, frais carte',
    priority: 9, delikreolSpecific: false,
  },
  {
    id: '26', name: 'TVA collectée', slug: 'tva-collectee',
    side: 'both', icon: 'Receipt', color: '#14b8a6',
    description: 'TVA collectée sur ventes (8,5% Antilles / 20% métropole)',
    priority: 10, delikreolSpecific: true,
  },
  {
    id: '27', name: 'Charges sociales', slug: 'charges-sociales',
    side: 'debit', icon: 'Users', color: '#a855f7',
    description: 'Cotisations URSSAF, RSI, CFE Martinique',
    priority: 11, delikreolSpecific: false,
  },
  {
    id: '28', name: 'Assurances', slug: 'assurances',
    side: 'debit', icon: 'Shield', color: '#06b6d4',
    description: 'RC Pro, assurance livraison, responsabilité civile',
    priority: 12, delikreolSpecific: false,
  },
  {
    id: '29', name: 'Fournitures & Équipement', slug: 'fournitures',
    side: 'debit', icon: 'Package', color: '#84cc16',
    description: 'Emballages, matériel, fournitures bureau',
    priority: 13, delikreolSpecific: false,
  },
  {
    id: '30', name: 'Transferts internes', slug: 'transferts-internes',
    side: 'both', icon: 'ArrowLeftRight', color: '#78716c',
    description: 'Virements entre comptes DeliKreol (principal ↔ commissions)',
    priority: 4, delikreolSpecific: true,
  },
];

// ─── Labels personnalisés Qonto pour DeliKreol ─────────────────────────────

export interface QontoLabelConfig {
  slug: string;
  name: string;
  color: string;
  description: string;
}

export const DELIKREOL_LABELS: QontoLabelConfig[] = [
  { slug: 'martinique', name: 'Martinique', color: '#002654', description: 'Transactions liées à l\'activité en Martinique (972)' },
  { slug: 'traiteur', name: 'Traiteur', color: '#dc2626', description: 'Paiements aux traiteurs partenaires' },
  { slug: 'livreur', name: 'Livreur', color: '#f97316', description: 'Frais de livraison et paiements livreurs' },
  { slug: 'commission', name: 'Commission', color: '#6366f1', description: 'Commission plateforme DeliKreol (~10%)' },
  { slug: 'client', name: 'Client', color: '#10b981', description: 'Paiements reçus des clients' },
  { slug: 'remboursement', name: 'Remboursement', color: '#eab308', description: 'Remboursements et avoirs' },
  { slug: 'stripe', name: 'Stripe', color: '#635bff', description: 'Transactions via Stripe (paiements en ligne)' },
  { slug: 'whatsapp', name: 'WhatsApp', color: '#25d366', description: 'Commandes passées via WhatsApp' },
  { slug: 'tva-antilles', name: 'TVA Antilles', color: '#14b8a6', description: 'TVA spécifique DOM (8,5% / 2,1%)' },
  { slug: 'recurrent', name: 'Récurrent', color: '#a855f7', description: 'Dépenses mensuelles récurrentes' },
];

// ─── Cartes Mastercard DeliKreol ────────────────────────────────────────────

export interface QontoCardConfig {
  name: string;
  type: 'virtual' | 'physical';
  design: string;
  monthlyLimit: number;     // €/mois
  paymentLimit: number;     // €/paiement
  withdrawalLimit: number;  // €/retrait
  allowedCategories: string[];
  blockedCategories: string[];
  assignedTo: string;
  purpose: string;
}

export const DELIKREOL_CARDS: QontoCardConfig[] = [
  {
    name: 'Carte Principale DeliKreol',
    type: 'physical',
    design: 'Qonto Standard',
    monthlyLimit: 3000,
    paymentLimit: 500,
    withdrawalLimit: 300,
    allowedCategories: ['marketing', 'fournitures', 'abonnements'],
    blockedCategories: [],
    assignedTo: 'Vladimir Claveau (gérant)',
    purpose: 'Dépenses courantes entreprise — marketing, fournitures, abonnements',
  },
  {
    name: 'Carte Virtuelle Stripe & Fournisseurs',
    type: 'virtual',
    design: 'Virtuelle',
    monthlyLimit: 1500,
    paymentLimit: 300,
    withdrawalLimit: 0,
    allowedCategories: ['abonnements', 'marketing'],
    blockedCategories: [],
    assignedTo: 'DeliKreol (automatique)',
    purpose: 'Paiements en ligne : Stripe fees, Supabase, domaine, hébergement, SaaS',
  },
];

// ─── Taux TVA Martinique (DOM) ──────────────────────────────────────────────

export interface VatRateConfig {
  name: string;
  rate: number;
  appliesTo: string;
  zone: string;
}

export const MARTINIQUE_VAT_RATES: VatRateConfig[] = [
  { name: 'TVA taux normal DOM', rate: 8.5, appliesTo: 'Restauration, alimentation, services', zone: 'Martinique (972)' },
  { name: 'TVA taux réduit DOM', rate: 2.1, appliesTo: 'Presse, médicaments, produits de 1ère nécessité', zone: 'Martinique (972)' },
  { name: 'TVA taux normal métropole', rate: 20, appliesTo: 'Services depuis la métropole (Stripe, Supabase…)', zone: 'France métropolitaine' },
  { name: 'TVA taux réduit métropole', rate: 5.5, appliesTo: 'Abonnements numériques B2C', zone: 'France métropolitaine' },
  { name: 'Exonération franchise de TVA', rate: 0, appliesTo: 'CA < 85 800€ (micro-entreprise) ou 34 400€ (services)', zone: 'Martinique (972)' },
];

// ─── Workflow de rapprochement DeliKreol ────────────────────────────────────

export interface ReconciliationWorkflow {
  step: number;
  name: string;
  description: string;
  accountUsed: string;
  categoryUsed: string;
  autoReconcile: boolean;
}

export const DELIKREOL_RECONCILIATION_WORKFLOW: ReconciliationWorkflow[] = [
  {
    step: 1,
    name: 'Client paie commande',
    description: 'Le client paie via Stripe/WhatsApp → crédit sur compte principal',
    accountUsed: 'principal',
    categoryUsed: 'revenus-clients',
    autoReconcile: true,
  },
  {
    step: 2,
    name: 'Commission DeliKreol prélevée',
    description: '~10% du montant client → transfert vers compte commissions',
    accountUsed: 'commissions',
    categoryUsed: 'commissions-delikreol',
    autoReconcile: true,
  },
  {
    step: 3,
    name: 'Paiement traiteur',
    description: 'Montant restant (hors commission) → virement au traiteur',
    accountUsed: 'principal',
    categoryUsed: 'paiements-traiteurs',
    autoReconcile: true,
  },
  {
    step: 4,
    name: 'Paiement livreur',
    description: 'Frais de livraison → virement au livreur',
    accountUsed: 'principal',
    categoryUsed: 'frais-livraison',
    autoReconcile: true,
  },
  {
    step: 5,
    name: 'Rapprochement mensuel',
    description: 'Vérification : total clients = commissions + traiteurs + livreurs',
    accountUsed: 'principal',
    categoryUsed: 'transferts-internes',
    autoReconcile: false,
  },
];

// ─── Intégrations comptables compatibles ────────────────────────────────────

export interface AccountingIntegration {
  name: string;
  type: 'french' | 'international';
  qontoSupported: boolean;
  delikreolRelevant: boolean;
  description: string;
}

export const ACCOUNTING_INTEGRATIONS: AccountingIntegration[] = [
  { name: 'Pennylane', type: 'french', qontoSupported: true, delikreolRelevant: true, description: 'Comptabilité française, facturation, liasse fiscale — idéal pour SAS/SARL en DOM' },
  { name: 'Sage', type: 'french', qontoSupported: true, delikreolRelevant: true, description: 'Suite comptable complète — référence en France' },
  { name: 'Doug', type: 'french', qontoSupported: true, delikreolRelevant: true, description: 'Expert-comptable en ligne — adapté auto-entrepreneurs' },
  { name: 'Freebe', type: 'french', qontoSupported: true, delikreolRelevant: false, description: 'Comptabilité suisse — non pertinent Martinique' },
  { name: 'Datev', type: 'international', qontoSupported: true, delikreolRelevant: false, description: 'Comptabilité allemande — non pertinent Martinique' },
  { name: 'QuickBooks', type: 'international', qontoSupported: true, delikreolRelevant: false, description: 'Comptabilité US/UK — non pertinent Martinique' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Calcule la commission DeliKreol (~10%) */
export function calcCommission(amountCents: number, rate: number = 0.10): number {
  return Math.round(amountCents * rate);
}

/** Calcule le montant traiteur (montant client - commission - livraison) */
export function calcTraiteurPayout(
  clientAmountCents: number,
  deliveryFeeCents: number,
  commissionRate: number = 0.10
): number {
  return clientAmountCents - calcCommission(clientAmountCents, commissionRate) - deliveryFeeCents;
}

/** Formate un montant en centimes → euros (fr-FR) */
export function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';
}

/** Retrouve une catégorie par slug */
export function getCategoryBySlug(slug: string): QontoCategoryConfig | undefined {
  return DELIKREOL_CATEGORIES.find(c => c.slug === slug);
}

/** Retrouve un plan par ID */
export function getPlanById(id: string): QontoPlan | undefined {
  return QONTO_PLANS.find(p => p.id === id);
}

/** Retrouve un compte bancaire par slug */
export function getAccountBySlug(slug: string): QontoBankAccountConfig | undefined {
  return DELIKREOL_BANK_ACCOUNTS.find(a => a.slug === slug);
}
