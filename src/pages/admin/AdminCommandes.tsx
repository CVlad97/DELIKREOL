import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_commune: string | null;
  order_mode: string | null;
  delivery_type: string | null;
  total_amount: number | string | null;
  status: string;
  payment_status: string | null;
  created_at: string;
}

interface LocalOrderRow {
  id?: string;
  order_number?: string;
  customer_name?: string;
  commune?: string;
  fulfillment_mode?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
}

function readUnsyncedLocalOrders(): LocalOrderRow[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem('delikreol_local_orders_v1') || '[]',
    );
    return Array.isArray(parsed) ? (parsed as LocalOrderRow[]) : [];
  } catch {
    return [];
  }
}

function formatAmount(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return `${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'} €`;
}

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('fr-FR');
}

export function AdminCommandes() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [localOrders, setLocalOrders] = useState<LocalOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    setLocalOrders(readUnsyncedLocalOrders());

    const { data, error: queryError } = await supabase
      .from('orders')
      .select(
        'id, order_number, customer_name, customer_commune, order_mode, delivery_type, total_amount, status, payment_status, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (queryError) {
      setError(`Impossible de charger les commandes Supabase : ${queryError.message}`);
      setOrders([]);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'Commandes — Admin DeliKreol';
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Commandes Supabase</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Source de vérité production — 100 dernières commandes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-muted/20 py-12 text-muted-foreground">
          <Loader className="h-5 w-5 animate-spin" /> Chargement Supabase…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Accès aux commandes refusé ou indisponible</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl bg-muted/20 py-12 text-center">
          <p className="text-muted-foreground">Aucune commande Supabase pour le moment.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                {['Commande', 'Client', 'Commune', 'Mode', 'Total', 'Date', 'Statut', 'Paiement'].map(
                  (label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/10">
                  <td className="px-4 py-3 text-sm font-bold">{order.order_number || order.id}</td>
                  <td className="px-4 py-3 text-sm">{order.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">{order.customer_commune || '—'}</td>
                  <td className="px-4 py-3 text-sm">{order.order_mode || order.delivery_type || '—'}</td>
                  <td className="px-4 py-3 text-sm">{formatAmount(order.total_amount)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-sm">{order.status || 'pending'}</td>
                  <td className="px-4 py-3 text-sm">{order.payment_status || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {localOrders.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-950">Commandes locales non synchronisées</h2>
          <p className="mt-1 text-sm text-amber-800">
            Données de secours présentes uniquement dans ce navigateur. Elles ne sont pas des commandes Supabase confirmées.
          </p>
          <div className="mt-4 space-y-2">
            {localOrders.map((order, index) => (
              <div key={order.id || order.order_number || `local-${index}`} className="rounded-lg bg-white p-3 text-sm">
                <span className="font-bold">{order.order_number || order.id || 'Commande locale'}</span>
                {' — '}{order.customer_name || 'Client non renseigné'}
                {' — '}{formatAmount(order.total_amount)}
                {' — '}{formatDate(order.created_at)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminCommandes;
