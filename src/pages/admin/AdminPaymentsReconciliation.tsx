import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';
import { isDemoMode, isSupabaseConfigured, supabase } from '../../lib/supabase';

type PaymentStatus = 'pending' | 'proof_submitted' | 'under_review' | 'paid' | 'failed' | 'refunded' | 'cancelled';

type PaymentOrder = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number | null;
  total_cents: number | null;
  payment_amount: number | null;
  payment_currency: string | null;
  payment_provider: string | null;
  payment_status: PaymentStatus | string | null;
  payment_reference: string | null;
  payment_external_id: string | null;
  payment_proof_url: string | null;
  payment_verified_at: string | null;
  created_at: string | null;
};

const LOCAL_PAYMENTS_KEY = 'delikreol_admin_payment_reviews_v1';

function formatMoney(order: PaymentOrder) {
  const amount = Number(order.payment_amount || order.total_amount || (order.total_cents ? order.total_cents / 100 : 0));
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: order.payment_currency || 'EUR' });
}

function statusClass(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'bg-success/[0.15] text-success';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'proof_submitted':
    case 'under_review':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function readLocalReviews() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PAYMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalReview(entry: unknown) {
  const next = [entry, ...readLocalReviews()].slice(0, 200);
  localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(next));
}

export function AdminPaymentsReconciliation() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('Validation manuelle DELIKREOL');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured || isDemoMode) {
      setOrders([]);
      setError('Supabase non configuré : rapprochement disponible après connexion au backend.');
      setLoading(false);
      return;
    }
    try {
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('id,order_number,customer_name,customer_email,customer_phone,total_amount,total_cents,payment_amount,payment_currency,payment_provider,payment_status,payment_reference,payment_external_id,payment_proof_url,payment_verified_at,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (dbError) throw dbError;
      setOrders((data || []) as PaymentOrder[]);
    } catch (err: any) {
      setError(err?.message || 'Lecture des paiements impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Rapprochement paiements — Admin DeliKreol';
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter((order) => [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.payment_provider,
      order.payment_reference,
      order.payment_external_id,
    ].some((value) => String(value || '').toLowerCase().includes(normalized)));
  }, [orders, query]);

  const reviewPayment = async (order: PaymentOrder, status: PaymentStatus) => {
    setSavingId(order.id);
    setError(null);
    const entry = {
      order_id: order.id,
      order_number: order.order_number,
      old_status: order.payment_status,
      new_status: status,
      comment,
      created_at: new Date().toISOString(),
    };
    try {
      const { error: rpcError } = await supabase.rpc('admin_review_payment', {
        target_order_id: order.id,
        target_status: status,
        target_comment: comment,
      });
      if (rpcError) throw rpcError;
      writeLocalReview(entry);
      await loadOrders();
    } catch (err: any) {
      setError(err?.message || 'Validation paiement impossible.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="pageSection space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="sectionTitle flex items-center gap-2 text-2xl font-display font-bold text-foreground">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Rapprochement des paiements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Qonto, Revolut, paiement livraison, crypto et liens externes. Stripe reste désactivé.
          </p>
        </div>
        <button onClick={loadOrders} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Recherche</span>
          <div className="mt-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="DK, téléphone, référence, hash…" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Commentaire d’audit</span>
          <input value={comment} onChange={(event) => setComment(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[980px]">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Commande</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Référence / hash</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/10">
                <td className="px-4 py-3 text-sm font-black">{order.order_number || order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-sm">
                  <p className="font-semibold">{order.customer_name || 'Client'}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone || order.customer_email || '—'}</p>
                </td>
                <td className="px-4 py-3 text-sm font-bold">{formatMoney(order)}</td>
                <td className="px-4 py-3 text-sm">{order.payment_provider || 'qonto_transfer'}</td>
                <td className="px-4 py-3 text-xs">
                  <p className="font-semibold">{order.payment_reference || '—'}</p>
                  <p className="max-w-[260px] truncate text-muted-foreground">{order.payment_external_id || 'Aucun hash/id externe'}</p>
                  {order.payment_proof_url && <a href={order.payment_proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline"><FileText className="h-3 w-3" /> preuve</a>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass(order.payment_status)}`}>
                    {order.payment_status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => reviewPayment(order, 'paid')} disabled={savingId === order.id} className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-2 text-xs font-black text-white disabled:opacity-60">
                      <CheckCircle2 className="h-4 w-4" /> Valider
                    </button>
                    <button onClick={() => reviewPayment(order, 'failed')} disabled={savingId === order.id} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-60">
                      <XCircle className="h-4 w-4" /> Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredOrders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Aucune commande à rapprocher.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPaymentsReconciliation;
