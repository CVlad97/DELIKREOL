import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, CreditCard, TrendingUp, TrendingDown,
  Download, FileText, RefreshCw, AlertTriangle, Landmark, Truck,
  ChevronRight, Tag, Wallet, Settings, CheckCircle2, Clock,
  ArrowRightLeft, Receipt, Users, Shield, Package, Megaphone
} from 'lucide-react';

import {
  DELIKREOL_ORG,
  DELIKREOL_BANK_ACCOUNTS,
  DELIKREOL_CATEGORIES,
  DELIKREOL_LABELS,
  DELIKREOL_CARDS,
  DELIKREOL_RECONCILIATION_WORKFLOW,
  MARTINIQUE_VAT_RATES,
  QONTO_PLANS,
  DELIKREOL_RECOMMENDED_PLAN,
  type QontoPlan,
  type QontoCategoryConfig,
  type QontoBankAccountConfig,
  type QontoCardConfig,
  type QontoLabelConfig,
  type ReconciliationWorkflow,
} from '../../config/qontoConfig';

/* ─── Configuration ─── */
const QONTO_API_URL = import.meta.env.VITE_QONTO_API_URL;
const QONTO_ENABLED = import.meta.env.VITE_QONTO_ENABLED === 'true';
const qontoConfigured = !!(QONTO_API_URL && QONTO_ENABLED);

/* ─── Icône mapping ─── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, DollarSign, RotateCcw: CreditCard, FileText,
  ChefHat: Receipt, Truck, Megaphone, CreditCard, Landmark,
  Receipt, Users, Shield, Package, ArrowLeftRight: ArrowRightLeft,
};

/* ─── Onglets ─── */
type TabId = 'overview' | 'accounts' | 'categories' | 'cards' | 'workflow' | 'plan';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Landmark },
  { id: 'accounts', label: 'Comptes', icon: Wallet },
  { id: 'categories', label: 'Catégories', icon: Tag },
  { id: 'cards', label: 'Cartes', icon: CreditCard },
  { id: 'workflow', label: 'Rapprochement', icon: ArrowRightLeft },
  { id: 'plan', label: 'Plan & Tarifs', icon: Receipt },
];

/* ─── Helpers ─── */
const statusBadge = (status: string): string => {
  switch (status) {
    case 'active': case 'completed': case 'payé': return 'badge badge-success';
    case 'pending': case 'en_attente': return 'badge badge-warning';
    case 'suspended': case 'failed': return 'badge badge-danger';
    case 'en_attente_livreur': return 'badge badge-warning';
    case 'partiel': return 'badge badge-warning';
    default: return 'badge';
  }
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'Actif';
    case 'pending': return 'En attente';
    case 'suspended': return 'Suspendu';
    case 'completed': return 'Validé';
    case 'failed': return 'Échoué';
    case 'payé': return 'Payé';
    case 'en_attente': return 'En attente';
    case 'en_attente_livreur': return 'Attente livreur';
    case 'partiel': return 'Partiel';
    default: return status;
  }
};

const sideBadge = (side: string): string => {
  switch (side) {
    case 'credit': return 'text-emerald-600 bg-emerald-50';
    case 'debit': return 'text-red-600 bg-red-50';
    case 'both': return 'text-blue-600 bg-blue-50';
    default: return '';
  }
};

const sideLabel = (side: string): string => {
  switch (side) {
    case 'credit': return 'Crédit';
    case 'debit': return 'Débit';
    case 'both': return 'Les deux';
    default: return side;
  }
};

/* ─── Composant principal ─── */
export function AdminQonto() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = 'Finance / Qonto — Admin DeliKreol';
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  /* ─── Rendu onglet ─── */
  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'accounts': return <AccountsTab />;
      case 'categories': return <CategoriesTab />;
      case 'cards': return <CardsTab />;
      case 'workflow': return <WorkflowTab />;
      case 'plan': return <PlanTab />;
    }
  };

  return (
    <div className="pageSection p-6 max-w-7xl mx-auto space-y-6">
      {/* Alerte config */}
      {!qontoConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm">⚠️ Connexion Qonto API requise — voir .env.example</p>
            <p className="text-xs text-amber-700 mt-1">
              Configurez <code className="bg-amber-100 px-1 rounded text-xs">VITE_QONTO_API_URL</code> et{' '}
              <code className="bg-amber-100 px-1 rounded text-xs">VITE_QONTO_ENABLED=true</code> dans votre fichier <code className="bg-amber-100 px-1 rounded text-xs">.env</code>.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="sectionTitle text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <Landmark className="w-6 h-6 text-primary" />
            Finance Delikreol — Qonto Martinique
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {DELIKREOL_ORG.brandName} · {DELIKREOL_ORG.domTom} · {DELIKREOL_ORG.legalForm} · SIREN {DELIKREOL_ORG.siren}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusBadge(DELIKREOL_ORG.status)}>
            {statusLabel(DELIKREOL_ORG.status)}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btnPrimary inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      {renderTab()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Vue d'ensemble
   ═══════════════════════════════════════════════════════════════════════════════ */
function OverviewTab() {
  const creditCategories = DELIKREOL_CATEGORIES.filter(c => c.side === 'credit' || c.side === 'both');
  const debitCategories = DELIKREOL_CATEGORIES.filter(c => c.side === 'debit' || c.side === 'both');

  return (
    <div className="space-y-6">
      {/* Organisation */}
      <div className="card bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Organisation DeliKreol
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            ['Nom légal', DELIKREOL_ORG.legalName],
            ['Marque', DELIKREOL_ORG.brandName],
            ['Email', DELIKREOL_ORG.contactEmail],
            ['Téléphone', DELIKREOL_ORG.phone],
            ['Adresse', `${DELIKREOL_ORG.address.street}, ${DELIKREOL_ORG.address.postalCode} ${DELIKREOL_ORG.address.city}`],
            ['Département', DELIKREOL_ORG.domTom],
            ['Forme juridique', DELIKREOL_ORG.legalForm],
            ['Code NAF', DELIKREOL_ORG.nafCode],
            ['SIREN', DELIKREOL_ORG.siren],
            ['TVA Intracom', DELIKREOL_ORG.tvaIntracom],
            ['Devise', DELIKREOL_ORG.defaultCurrency],
            ['Plan Qonto', DELIKREOL_RECOMMENDED_PLAN.name],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Comptes bancaires', value: DELIKREOL_BANK_ACCOUNTS.length, icon: Wallet, color: 'text-primary' },
          { label: 'Catégories', value: DELIKREOL_CATEGORIES.length, icon: Tag, color: 'text-emerald-500' },
          { label: 'Cartes', value: DELIKREOL_CARDS.length, icon: CreditCard, color: 'text-amber-500' },
          { label: 'Labels', value: DELIKREOL_LABELS.length, icon: Tag, color: 'text-violet-500' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card bg-card rounded-2xl border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* TVA Martinique */}
      <div className="card bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Taux TVA — Martinique (DOM)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Taux</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">S'applique à</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {MARTINIQUE_VAT_RATES.map((vat, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-black text-foreground">{vat.rate}%</td>
                  <td className="px-4 py-3 text-sm text-foreground">{vat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{vat.appliesTo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{vat.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Labels */}
      <div className="card bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Labels personnalisés
        </h2>
        <div className="flex flex-wrap gap-2">
          {DELIKREOL_LABELS.map(label => (
            <span
              key={label.slug}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border"
              style={{
                backgroundColor: `${label.color}10`,
                borderColor: `${label.color}30`,
                color: label.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Comptes bancaires
   ═══════════════════════════════════════════════════════════════════════════════ */
function AccountsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        Comptes bancaires — {DELIKREOL_ORG.defaultCurrency}
      </h2>
      <div className="grid gap-4">
        {DELIKREOL_BANK_ACCOUNTS.map(account => (
          <div key={account.slug} className="card bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{account.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{account.description}</p>
                  <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {account.role}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase">IBAN</span>
                <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">{account.ibanPattern}</code>
                <span className="text-xs text-muted-foreground mt-1">BIC: {account.bicPattern}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase mr-2">Labels:</span>
              {account.labels.map(label => {
                const labelConfig = DELIKREOL_LABELS.find(l => l.slug === label);
                return (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: labelConfig ? `${labelConfig.color}10` : '#f3f4f6',
                      color: labelConfig?.color ?? '#6b7280',
                    }}
                  >
                    {labelConfig?.name ?? label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Catégories
   ═══════════════════════════════════════════════════════════════════════════════ */
function CategoriesTab() {
  const creditCategories = DELIKREOL_CATEGORIES.filter(c => c.side === 'credit' || c.side === 'both');
  const debitCategories = DELIKREOL_CATEGORIES.filter(c => c.side === 'debit' || c.side === 'both');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        Catégories de transactions — Food-tech Martinique
      </h2>

      {/* Crédits */}
      <div>
        <h3 className="font-bold text-emerald-600 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Crédits (Revenus)
        </h3>
        <div className="card bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">DeliKreol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {creditCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{cat.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-bold text-foreground">{cat.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{cat.description}</td>
                  <td className="px-4 py-3 text-center">
                    {cat.delikreolSpecific ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Débits */}
      <div>
        <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Débits (Dépenses)
        </h3>
        <div className="card bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">DeliKreol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {debitCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{cat.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-bold text-foreground">{cat.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{cat.description}</td>
                  <td className="px-4 py-3 text-center">
                    {cat.delikreolSpecific ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Cartes
   ═══════════════════════════════════════════════════════════════════════════════ */
function CardsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        Cartes Mastercard — {DELIKREOL_CARDS.length} cartes
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {DELIKREOL_CARDS.map((card, i) => (
          <div key={i} className="card bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                card.type === 'physical' ? 'bg-gradient-to-br from-primary to-primary/70' : 'bg-gradient-to-br from-violet-500 to-violet-400'
              }`}>
                {card.type === 'physical' ? '💳' : '🖥️'}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{card.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{card.type === 'physical' ? 'Physique' : 'Virtuelle'} · {card.design}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assignée à</span>
                <span className="text-foreground font-medium">{card.assignedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plafond mensuel</span>
                <span className="text-foreground font-bold">{card.monthlyLimit.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plafond/paiement</span>
                <span className="text-foreground">{card.paymentLimit.toLocaleString('fr-FR')} €</span>
              </div>
              {card.type === 'physical' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plafond/retrait</span>
                  <span className="text-foreground">{card.withdrawalLimit.toLocaleString('fr-FR')} €</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">{card.purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Workflow de rapprochement
   ═══════════════════════════════════════════════════════════════════════════════ */
function WorkflowTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-primary" />
        Workflow de rapprochement — Commandes DeliKreol
      </h2>

      <div className="space-y-4">
        {DELIKREOL_RECONCILIATION_WORKFLOW.map((step, i) => (
          <div key={step.step} className="flex gap-4 items-start">
            {/* Numéro d'étape */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                step.autoReconcile ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {step.step}
              </div>
              {i < DELIKREOL_RECONCILIATION_WORKFLOW.length - 1 && (
                <div className="w-0.5 h-8 bg-border/30 mt-1" />
              )}
            </div>

            {/* Contenu */}
            <div className="card bg-card rounded-2xl border border-border/50 p-5 flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-bold text-foreground">{step.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    step.autoReconcile ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {step.autoReconcile ? (
                      <><CheckCircle2 className="w-3 h-3" /> Auto</>
                    ) : (
                      <><Clock className="w-3 h-3" /> Manuel</>
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-3 text-xs">
                <span className="bg-muted/50 px-2 py-1 rounded font-mono">→ {step.accountUsed}</span>
                <span className="bg-muted/50 px-2 py-1 rounded font-mono">🏷 {step.categoryUsed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export */}
      <div className="card bg-card rounded-2xl border border-border/50 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Exports comptables</h3>
              <p className="text-xs text-muted-foreground">Relevés mensuels CSV — compatible Pennylane / Sage</p>
            </div>
          </div>
          <button
            className="btn btnPrimary inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
            onClick={() => {
              const headers = 'Étape;Nom;Compte;Catégorie;Auto';
              const rows = DELIKREOL_RECONCILIATION_WORKFLOW.map(s =>
                `${s.step};${s.name};${s.accountUsed};${s.categoryUsed};${s.autoReconcile ? 'Oui' : 'Non'}`
              );
              const csv = [headers, ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `qonto_workflow_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ONGLET : Plans & Tarifs
   ═══════════════════════════════════════════════════════════════════════════════ */
function PlanTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <Receipt className="w-5 h-5 text-primary" />
        Plans Qonto 2024/2025 — Martinique
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QONTO_PLANS.map(plan => {
          const isRecommended = plan.recommended;
          return (
            <div
              key={plan.id}
              className={`card rounded-2xl border p-6 relative ${
                isRecommended
                  ? 'bg-primary/5 border-primary/50 ring-2 ring-primary/20'
                  : 'bg-card border-border/50'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  ★ Recommandé DeliKreol
                </div>
              )}

              <div className="mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  plan.tier === 'solo' ? 'text-emerald-600' : 'text-violet-600'
                }`}>
                  {plan.tier === 'solo' ? 'Solo' : 'Team'}
                </span>
                <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-black text-foreground">{plan.priceMonthly} €</span>
                <span className="text-sm text-muted-foreground"> HT/mois</span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN inclus</span>
                  <span className="text-foreground font-bold">{plan.ibanCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cartes incluses</span>
                  <span className="text-foreground font-bold">{plan.cardsIncluded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Virements SEPA/mois</span>
                  <span className="text-foreground font-bold">{plan.transfersIncluded}</span>
                </div>
                {plan.cashbackRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cashback</span>
                    <span className="text-emerald-600 font-bold">{plan.cashbackRate}%</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 mb-4">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={`https://welcome.qonto.com/signup/select-country?website_plan=${plan.id}&website_period=annual&company_creation=no`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isRecommended
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-muted/50 text-foreground hover:bg-muted/70 border border-border/30'
                }`}
              >
                {isRecommended ? 'Choisir ce plan' : 'Voir sur Qonto'}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminQonto;
