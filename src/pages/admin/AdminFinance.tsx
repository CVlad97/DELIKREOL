import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  Download,
  FileText,
  CreditCard,
  Landmark,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

type FinanceSource = 'supabase' | 'local';

type Invoice = {
  id: string;
  invoice_number?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  total_ht?: number | null;
  total_tva?: number | null;
  total_ttc?: number | null;
  currency?: string | null;
  status?: string | null;
  qonto_invoice_id?: string | null;
  created_at?: string | null;
};

const LOCAL_INVOICES_KEY = 'delikreol_admin_invoices_v1';

function readLocalInvoices(): Invoice[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_INVOICES_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalInvoices(invoices: Invoice[]) {
  localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
}

function formatMoney(value?: number | null, currency = 'EUR') {
  return (value || 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR');
}

function statusClass(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'issued':
      return 'bg-blue-100 text-blue-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function buildTestInvoice(): Omit<Invoice, 'id'> {
  const stamp = new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14);
  return {
    invoice_number: `DK-${stamp}`,
    customer_name: 'Client test admin',
    customer_email: 'client-test@delikreol.local',
    customer_phone: '0696000000',
    total_ht: 25,
    total_tva: 2.13,
    total_ttc: 27.13,
    currency: 'EUR',
    status: 'draft',
    qonto_invoice_id: null,
    created_at: new Date().toISOString(),
  };
}

export function AdminFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [source, setSource] = useState<FinanceSource>('local');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { data, error: dbError } = await supabase
          .from('invoices')
          .select('id,invoice_number,customer_name,customer_email,customer_phone,total_ht,total_tva,total_ttc,currency,status,qonto_invoice_id,created_at')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setInvoices(data || []);
        setSource('supabase');
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn('[AdminFinance] Supabase load failed', err);
        setError(err?.message || 'Lecture Supabase impossible. Affichage local uniquement.');
      }
    }

    setInvoices(readLocalInvoices());
    setSource('local');
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'Finance — Admin DeliKreol';
    void loadInvoices();
  }, [loadInvoices]);

  const stats = useMemo(() => {
    const totalTtc = invoices.reduce((sum, inv) => sum + Number(inv.total_ttc || 0), 0);
    const paid = invoices.filter((inv) => inv.status === 'paid');
    const pending = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'issued');
    const draft = invoices.filter((inv) => !inv.status || inv.status === 'draft');
    const qontoLinked = invoices.filter((inv) => Boolean(inv.qonto_invoice_id));

    return {
      totalTtc,
      count: invoices.length,
      paid: paid.length,
      pending: pending.length,
      draft: draft.length,
      qontoLinked: qontoLinked.length,
    };
  }, [invoices]);

  const handleCreateTestInvoice = useCallback(async () => {
    const invoice = buildTestInvoice();
    setSaving(true);
    setError(null);

    if (source === 'supabase' && isSupabaseConfigured && !isDemoMode) {
      try {
        const { error: dbError } = await supabase.from('invoices').insert(invoice);
        if (dbError) throw dbError;
        await loadInvoices();
        setSaving(false);
        return;
      } catch (err: any) {
        console.warn('[AdminFinance] Supabase insert failed', err);
        setError(err?.message || 'Création Supabase impossible. Création locale utilisée.');
      }
    }

    const localInvoice: Invoice = { ...invoice, id: `local_invoice_${Date.now()}` };
    const next = [localInvoice, ...readLocalInvoices()];
    writeLocalInvoices(next);
    setInvoices(next);
    setSource('local');
    setSaving(false);
  }, [loadInvoices, source]);

  const handleExportCSV = useCallback(() => {
    const headers = 'Numero;Client;Email;Telephone;Total HT;TVA;Total TTC;Devise;Statut;Qonto;Date';
    const rows = invoices.map((inv) => [
      inv.invoice_number || inv.id,
      inv.customer_name || '',
      inv.customer_email || '',
      inv.customer_phone || '',
      Number(inv.total_ht || 0).toFixed(2),
      Number(inv.total_tva || 0).toFixed(2),
      Number(inv.total_ttc || 0).toFixed(2),
      inv.currency || 'EUR',
      inv.status || 'draft',
      inv.qonto_invoice_id || '',
      inv.created_at || '',
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_delikreol_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [invoices]);

  return (
    <div className="pageSection space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="sectionTitle text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <Landmark className="w-6 h-6 text-primary" />
            Finance DeliKreol
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Facturation, suivi financier, export CSV et préparation Qonto.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Source : {source === 'supabase' ? 'Supabase' : 'localStorage'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadInvoices}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleCreateTestInvoice}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary disabled:opacity-60"
            disabled={saving}
          >
            <PlusCircle className="w-4 h-4" />
            Facture test
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total factures</p>
          <p className="mt-2 text-3xl font-black text-foreground">{stats.count}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total TTC</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{formatMoney(stats.totalTtc)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payées / attente</p>
          <p className="mt-2 text-3xl font-black text-foreground">{stats.paid} / {stats.pending}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qonto lié</p>
          <p className="mt-2 text-3xl font-black text-primary">{stats.qontoLinked}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Qonto ready</h2>
            <p className="text-xs text-muted-foreground">
              La page prépare les données. La synchronisation réelle doit rester côté backend Supabase Edge Function.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          Aucun secret Qonto n’est utilisé dans le frontend. Connecter ensuite <code>supabase/functions/qonto-sync</code> avec variables serveur.
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Factures
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">N°</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Contact</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Total TTC</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Qonto</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune facture pour le moment. Clique sur “Facture test” pour vérifier le module.
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number || inv.id}</td>
                  <td className="px-4 py-3 font-semibold">{inv.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>{inv.customer_email || '—'}</div>
                    <div>{inv.customer_phone || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(inv.total_ttc, inv.currency || 'EUR')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(inv.status)}`}>{inv.status || 'draft'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{inv.qonto_invoice_id || 'Non synchronisée'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminFinance;
