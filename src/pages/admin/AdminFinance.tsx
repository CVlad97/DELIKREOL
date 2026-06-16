import { useEffect, useCallback, useState } from 'react';
import {
  DollarSign, TrendingUp, Download, FileText,
  CreditCard, ArrowUpRight, ArrowDownRight, Landmark,
} from 'lucide-react';

/* ─── Données démo réalistes ─── */
const DEMO_BALANCE = 24_580.42;

interface DemoTransaction {
  date: string;
  label: string;
  amount: number;
  category: 'commission' | 'reversement' | 'client' | 'frais';
  status: 'completed' | 'pending';
}

const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { date: '2026-06-15', label: 'Commission Delikreol — Commande #C-2407', amount: 28.50, category: 'commission', status: 'completed' },
  { date: '2026-06-14', label: 'Virement client — Commande #C-2406', amount: 189.50, category: 'client', status: 'completed' },
  { date: '2026-06-13', label: 'Commission Delikreol — Commande #C-2405', amount: 18.95, category: 'commission', status: 'completed' },
  { date: '2026-06-12', label: 'Reversement traiteur — Les Délices de Ninice', amount: -120.00, category: 'reversement', status: 'completed' },
  { date: '2026-06-12', label: 'Frais livraison — Livreur Jean-Marc', amount: -15.00, category: 'frais', status: 'completed' },
  { date: '2026-06-11', label: 'Virement client — Commande #C-2404', amount: 245.00, category: 'client', status: 'completed' },
  { date: '2026-06-10', label: 'Commission Delikreol — Commande #C-2404', amount: 24.50, category: 'commission', status: 'pending' },
  { date: '2026-06-09', label: 'Reversement traiteur — Coco\'s Food', amount: -175.00, category: 'reversement', status: 'completed' },
  { date: '2026-06-08', label: 'Frais livraison — Livreur Marie-Ange', amount: -12.00, category: 'frais', status: 'completed' },
  { date: '2026-06-07', label: 'Commission Delikreol — Commande #C-2403', amount: 15.00, category: 'commission', status: 'completed' },
];

const COMMISSIONS_DELIKREOL = {
  total: 86.95,
  moisPrecedent: 312.40,
  tauxMoyen: 10,
  transactions: DEMO_TRANSACTIONS.filter(t => t.category === 'commission'),
};

const REVERSEMENTS_PARTENAIRES = {
  total: -295.00,
  enAttente: 120.00,
  partenaires: [
    { nom: 'Les Délices de Ninice', montant: -120.00, date: '2026-06-12', statut: 'payé' },
    { nom: 'Coco\'s Food', montant: -175.00, date: '2026-06-09', statut: 'payé' },
  ],
};

/* ─── Helpers ─── */
const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'commission': return '💰';
    case 'reversement': return '🏪';
    case 'client': return '👤';
    case 'frais': return '🚚';
    default: return '📄';
  }
};

const categoryLabel = (cat: string): string => {
  switch (cat) {
    case 'commission': return 'Commission';
    case 'reversement': return 'Reversement';
    case 'client': return 'Client';
    case 'frais': return 'Frais';
    default: return cat;
  }
};

const statusBadge = (status: string): string => {
  switch (status) {
    case 'completed': return 'badge badge-success';
    case 'pending': return 'badge badge-warning';
    default: return 'badge';
  }
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'Validé';
    case 'pending': return 'En attente';
    default: return status;
  }
};

export function AdminFinance() {
  const [transactions] = useState<DemoTransaction[]>(DEMO_TRANSACTIONS);
  const [balance] = useState(DEMO_BALANCE);

  useEffect(() => {
    document.title = 'Finance — Admin DeliKreol';
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = 'Date;Libellé;Montant;Catégorie;Statut';
    const rows = transactions.map(t =>
      `${t.date};${t.label};${t.amount.toFixed(2)};${categoryLabel(t.category)};${statusLabel(t.status)}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_delikreol_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  return (
    <div className="pageSection space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="sectionTitle text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <Landmark className="w-6 h-6 text-primary" />
            Finance Delikreol
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion financière &amp; commissions</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn btnPrimary inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Solde Qonto */}
      <div className="card bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solde Qonto</p>
            <p className="text-3xl font-black text-foreground">
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <CreditCard className="w-3 h-3 inline mr-1" />
          Compte professionnel — Données démo
        </p>
      </div>

      {/* Commissions Delikreol + Reversements partenaires */}
      <div className="cardGrid grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commissions */}
        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Commissions Delikreol</h2>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {COMMISSIONS_DELIKREOL.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mois précédent : {COMMISSIONS_DELIKREOL.moisPrecedent.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            {' · '}Taux moyen : {COMMISSIONS_DELIKREOL.tauxMoyen} %
          </p>
          <div className="mt-3 space-y-1.5">
            {COMMISSIONS_DELIKREOL.transactions.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[200px]">{t.label}</span>
                <span className="font-semibold text-emerald-600">+{t.amount.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reversements */}
        <div className="card bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-5 h-5 text-destructive" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Reversements partenaires</h2>
          </div>
          <p className="text-2xl font-black text-destructive">
            {Math.abs(REVERSEMENTS_PARTENAIRES.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            En attente : {REVERSEMENTS_PARTENAIRES.enAttente.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <div className="mt-3 space-y-1.5">
            {REVERSEMENTS_PARTENAIRES.partenaires.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[160px]">{p.nom}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-destructive">{p.montant.toFixed(2)} €</span>
                  <span className={statusBadge(p.statut === 'payé' ? 'completed' : 'pending')}>{p.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="sectionTitle flex items-center justify-between mt-2 mb-4">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Transactions récentes
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
                  <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">
                    <span className="mr-1.5">{categoryIcon(tx.category)}</span>
                    {tx.label}
                  </td>
                  <td className={`px-4 py-3 text-sm font-bold text-right whitespace-nowrap ${tx.amount >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{categoryLabel(tx.category)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={statusBadge(tx.status)}>
                      {tx.amount >= 0 ? <ArrowUpRight className="w-3 h-3 inline mr-0.5" /> : <ArrowDownRight className="w-3 h-3 inline mr-0.5" />}
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export CSV card */}
      <div className="card bg-card rounded-2xl border border-border/50 p-5 mt-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Export des données financières</h3>
              <p className="text-xs text-muted-foreground">Téléchargez les transactions au format CSV</p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn btnPrimary inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFinance;
