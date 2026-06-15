import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, CreditCard, TrendingUp, TrendingDown,
  Download, FileText, RefreshCw, AlertTriangle, Landmark, Truck
} from 'lucide-react';

/* ─── Configuration ─── */
const QONTO_API_URL = import.meta.env.VITE_QONTO_API_URL;
const QONTO_ENABLED = import.meta.env.VITE_QONTO_ENABLED === 'true';
const qontoConfigured = !!(QONTO_API_URL && QONTO_ENABLED);

/* ─── Données démo (Qonto API est backend-only) ─── */
const DEMO_BALANCE = 24_580.42;

interface DemoTransaction {
  date: string;
  label: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { date: '2026-06-14', label: 'Virement client — Commande #C-2406', amount: 189.50, category: 'Revenus clients', status: 'completed' },
  { date: '2026-06-13', label: 'Commission Delikreol — #C-2405', amount: 18.95, category: 'Commissions', status: 'completed' },
  { date: '2026-06-12', label: 'Paiement traiteur — Les Délices de Ninice', amount: -120.00, category: 'Dépenses fournisseurs', status: 'completed' },
  { date: '2026-06-12', label: 'Frais livraison — Livreur Jean-Marc', amount: -15.00, category: 'Livraisons', status: 'completed' },
  { date: '2026-06-11', label: 'Virement client — Commande #C-2404', amount: 245.00, category: 'Revenus clients', status: 'completed' },
  { date: '2026-06-10', label: 'Commission Delikreol — #C-2404', amount: 24.50, category: 'Commissions', status: 'pending' },
  { date: '2026-06-09', label: 'Paiement traiteur — Coco\'s Food', amount: -175.00, category: 'Dépenses fournisseurs', status: 'completed' },
  { date: '2026-06-08', label: 'Frais livraison — Livreur Marie-Ange', amount: -12.00, category: 'Livraisons', status: 'failed' },
];

interface DemoReconciliation {
  orderNumber: string;
  montantClient: number;
  commission: number;
  montantTraiteur: number;
  montantLivreur: number;
  statutPaiement: 'payé' | 'en_attente' | 'en_attente_livreur' | 'partiel';
  referenceBancaire: string;
}

const DEMO_RECONCILIATIONS: DemoReconciliation[] = [
  { orderNumber: '#C-2406', montantClient: 189.50, commission: 18.95, montantTraiteur: 150.00, montantLivreur: 15.00, statutPaiement: 'payé', referenceBancaire: 'QNTO-2406-001' },
  { orderNumber: '#C-2405', montantClient: 245.00, commission: 24.50, montantTraiteur: 200.00, montantLivreur: 18.00, statutPaiement: 'payé', referenceBancaire: 'QNTO-2405-002' },
  { orderNumber: '#C-2404', montantClient: 320.00, commission: 32.00, montantTraiteur: 260.00, montantLivreur: 22.00, statutPaiement: 'en_attente', referenceBancaire: 'QNTO-2404-003' },
  { orderNumber: '#C-2403', montantClient: 150.00, commission: 15.00, montantTraiteur: 115.00, montantLivreur: 15.00, statutPaiement: 'partiel', referenceBancaire: 'QNTO-2403-004' },
  { orderNumber: '#C-2402', montantClient: 410.00, commission: 41.00, montantTraiteur: 330.00, montantLivreur: 30.00, statutPaiement: 'en_attente_livreur', referenceBancaire: 'QNTO-2402-005' },
];

/* ─── Stats cartes (4 cartes) ─── */
const DEMO_STATS = {
  revenusClients: 2_845.00,
  commissionsDelikreol: 284.50,
  depensesFournisseurs: 1_920.00,
  livraisonsPayees: 312.00,
};

/* ─── Helpers ─── */
const statusBadge = (status: string): string => {
  switch (status) {
    case 'completed': case 'payé': return 'badge badge-success';
    case 'pending': case 'en_attente': return 'badge badge-warning';
    case 'failed': return 'badge badge-danger';
    case 'en_attente_livreur': return 'badge badge-warning';
    case 'partiel': return 'badge badge-warning';
    default: return 'badge';
  }
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'Validé';
    case 'pending': return 'En attente';
    case 'failed': return 'Échoué';
    case 'payé': return 'Payé';
    case 'en_attente': return 'En attente';
    case 'en_attente_livreur': return 'Attente livreur';
    case 'partiel': return 'Partiel';
    default: return status;
  }
};

/* ─── Dynamic / conditional Qonto service import (no secret leak) ─── */
async function getQontoService() {
  if (!qontoConfigured) return null;
  try {
    // Dynamic import — le service Qonto est côté backend uniquement
    // Le fichier n'existe que côté serveur, jamais exposé dans le bundle frontend
    const mod = await import(/* @vite-ignore */ '../../services/qontoApi');
    return mod;
  } catch {
    return null;
  }
}

/* ─── Composant principal ─── */
export function AdminQonto() {
  const [refreshing, setRefreshing] = useState(false);
  const [transactions] = useState<DemoTransaction[]>(DEMO_TRANSACTIONS);
  const [reconciliations] = useState<DemoReconciliation[]>(DEMO_RECONCILIATIONS);
  const [balance] = useState(DEMO_BALANCE);
  const [stats] = useState(DEMO_STATS);
  const [serviceReady, setServiceReady] = useState(false);

  useEffect(() => {
    document.title = 'Finance / Qonto — Admin DeliKreol';
    // Tentative dynamique (échec silencieux = pas de backend)
    getQontoService().then(svc => {
      if (svc) setServiceReady(true);
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (serviceReady) {
      try {
        // Si le service backend Qonto est disponible
        // Les données seraient rafraîchies ici
      } catch { /* silencieux */ }
    }
    // Simuler un délai de rafraîchissement
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  }, [serviceReady]);

  const handleExportCSV = useCallback(() => {
    const headers = 'Date;Libellé;Montant;Catégorie;Statut';
    const rows = transactions.map(t =>
      `${t.date};${t.label};${t.amount.toFixed(2)};${t.category};${statusLabel(t.status)}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qonto_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  return (
    <div className="pageSection p-6 max-w-7xl mx-auto space-y-6">
      {/* ⚠️ Alerte configuration Qonto */}
      {!qontoConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm">⚠️ Connexion Qonto API requise — voir .env.example</p>
            <p className="text-xs text-amber-700 mt-1">
              Configurez <code className="bg-amber-100 px-1 rounded text-xs">VITE_QONTO_API_URL</code> et{' '}
              <code className="bg-amber-100 px-1 rounded text-xs">VITE_QONTO_ENABLED=true</code> dans votre fichier <code className="bg-amber-100 px-1 rounded text-xs">.env</code>.
              Les clés API Qonto ne sont jamais exposées côté frontend.
            </p>
          </div>
        </div>
      )}

      {/* a. Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="sectionTitle text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <Landmark className="w-6 h-6 text-primary" />
            Finance Delikreol
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Compte professionnel Qonto</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btnPrimary inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* b. Solde disponible */}
      <div className="card bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solde disponible</p>
            <p className="text-3xl font-black text-foreground">
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <CreditCard className="w-3 h-3 inline mr-1" />
          Compte professionnel Qonto — Dernière mise à jour démo
        </p>
      </div>

      {/* c. 4 cartes stats */}
      <div className="cardGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Revenus clients</span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {stats.revenusClients.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Total encaissé</p>
        </div>

        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commissions Delikreol</span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {stats.commissionsDelikreol.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-primary font-medium mt-1">Marge brute</p>
        </div>

        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dépenses fournisseurs</span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {stats.depensesFournisseurs.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-destructive font-medium mt-1">Reversé aux traiteurs</p>
        </div>

        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Livraisons payées</span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {stats.livraisonsPayees.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-accent font-medium mt-1">Frais livreurs reversés</p>
        </div>
      </div>

      {/* d. Dernières transactions */}
      <div className="sectionTitle flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Dernières transactions
        </h2>
      </div>
      <div className="card bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Libellé</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{tx.label}</td>
                  <td className={`px-4 py-3 text-sm font-bold text-right whitespace-nowrap ${tx.amount >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{tx.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={statusBadge(tx.status)}>
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* e. Rapprochement commandes */}
      <div className="sectionTitle flex items-center justify-between mb-4 mt-6">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Rapprochement commandes
        </h2>
      </div>
      <div className="card bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Commande</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Client €</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Commission</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Traiteur €</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Livreur €</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Réf. bancaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {reconciliations.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{r.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">{r.montantClient.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-right text-primary font-bold">{r.commission.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden sm:table-cell">{r.montantTraiteur.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden sm:table-cell">{r.montantLivreur.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-center">
                    <span className={statusBadge(r.statutPaiement)}>
                      {statusLabel(r.statutPaiement)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs hidden lg:table-cell">{r.referenceBancaire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* f. Exports comptables */}
      <div className="card bg-card rounded-2xl border border-border/50 p-5 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Exports comptables</h3>
              <p className="text-xs text-muted-foreground">Téléchargez vos relevés mensuels au format CSV</p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn btnPrimary inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV mensuel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminQonto;