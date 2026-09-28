import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bell, BellOff, CheckCircle2, ChefHat, Loader, PackageCheck, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { formatMenuSelection, type MenuSelection } from '../../types/menu';
import { disableVendorPush, enableVendorPush, refreshVendorPushStatus, type VendorPushStatus } from '../../services/vendorPush';

interface VendorOrderLine {
  id: string;
  product_name: string | null;
  quantity: number;
  selected_options: MenuSelection | null;
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string | null;
    total_amount: number | null;
    customer_phone: string | null;
    notes: string | null;
    order_mode: string | null;
    delivery_type: string | null;
    creneaux: string | null;
    created_at: string;
  } | null;
}

type VendorOrder = NonNullable<VendorOrderLine['order']> & { lines: VendorOrderLine[] };

const statusLabels: Record<string, string> = {
  pending: 'À confirmer', confirmed: 'Confirmée', preparing: 'En préparation', ready: 'Prête',
  in_delivery: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
};

export function VendorOrders() {
  const { showError, showSuccess } = useToast();
  const [lines, setLines] = useState<VendorOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<VendorPushStatus>('default');
  const [pushBusy, setPushBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setQueryError('');
    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_name, quantity, selected_options, order:orders!order_items_order_id_fkey(id, order_number, status, payment_status, total_amount, customer_phone, notes, order_mode, delivery_type, creneaux, created_at)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) setQueryError(error.message);
    else setLines((data || []) as unknown as VendorOrderLine[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let active = true;
    refreshVendorPushStatus().then((status) => { if (active) setPushStatus(status); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const togglePush = async () => {
    try {
      setPushBusy(true);
      if (pushStatus === 'subscribed') {
        await disableVendorPush();
        setPushStatus(await refreshVendorPushStatus());
        showSuccess('Alertes commandes désactivées sur cet appareil.');
      } else {
        await enableVendorPush();
        setPushStatus('subscribed');
        showSuccess('Alertes commandes activées sur ce téléphone.');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Impossible de modifier les notifications.');
      setPushStatus(await refreshVendorPushStatus().catch(() => pushStatus));
    } finally {
      setPushBusy(false);
    }
  };

  const orders = useMemo(() => {
    const grouped = new Map<string, VendorOrder>();
    for (const line of lines) {
      if (!line.order?.id) continue;
      const existing = grouped.get(line.order.id);
      if (existing) existing.lines.push(line);
      else grouped.set(line.order.id, { ...line.order, lines: [line] });
    }
    return Array.from(grouped.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [lines]);

  const transition = async (order: VendorOrder, nextStatus: 'confirmed' | 'preparing' | 'ready' | 'cancelled') => {
    let reason: string | null = null;
    if (nextStatus === 'cancelled') {
      reason = window.prompt('Motif du refus / de l’annulation (obligatoire) :')?.trim() || null;
      if (!reason || reason.length < 3) return;
    }
    try {
      setUpdatingOrderId(order.id);
      const { error } = await supabase.rpc('vendor_transition_order', {
        target_order_id: order.id,
        target_status: nextStatus,
        target_reason: reason,
      });
      if (error) throw error;
      showSuccess(`Commande ${order.order_number} : ${statusLabels[nextStatus]}.`);
      await load();
    } catch (error) {
      console.error('Vendor order transition failed:', error);
      showError(error instanceof Error ? error.message : 'Mise à jour de commande impossible.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Commandes à préparer</h1><p className="text-sm text-muted-foreground">Uniquement les commandes de votre établissement.</p></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void togglePush()} disabled={pushBusy || pushStatus === 'unsupported'} className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-3 text-xs font-black disabled:opacity-50" aria-label="Notifications commandes">
            {pushStatus === 'subscribed' ? <Bell className="h-5 w-5 text-success" /> : <BellOff className="h-5 w-5" />}
            <span className="hidden sm:inline">{pushStatus === 'subscribed' ? 'Alertes actives' : pushStatus === 'denied' ? 'Notifications bloquées' : 'Activer les alertes'}</span>
          </button>
          <button type="button" onClick={() => void load()} className="rounded-xl border bg-white p-3" aria-label="Actualiser"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>
      {loading && <div className="flex justify-center py-16"><Loader className="h-6 w-6 animate-spin" /></div>}
      {!loading && queryError && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="h-5 w-5 shrink-0" /><span>Commandes indisponibles : {queryError}</span></div>}
      {!loading && !queryError && orders.length === 0 && <div className="rounded-2xl bg-white p-8 text-center text-muted-foreground">Aucune commande à préparer.</div>}

      <div className="space-y-5">
        {orders.map((order) => {
          const busy = updatingOrderId === order.id;
          return (
            <article key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="text-xs font-bold uppercase text-primary">{order.order_number}</div><h2 className="mt-1 text-lg font-black">{order.lines.length} ligne{order.lines.length > 1 ? 's' : ''} · {Number(order.total_amount || 0).toFixed(2)} €</h2></div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{statusLabels[order.status] || order.status}</span>
              </div>

              <div className="mt-4 space-y-3">
                {order.lines.map((line) => (
                  <div key={line.id} className="rounded-xl bg-orange-50 p-3">
                    <div className="font-black">{line.product_name || 'Article'} × {line.quantity}</div>
                    {formatMenuSelection(line.selected_options || undefined).length > 0
                      ? formatMenuSelection(line.selected_options || undefined).map((text) => <div key={text} className="text-sm font-semibold">{text}</div>)
                      : <div className="text-sm text-muted-foreground">Aucune composition particulière.</div>}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <span>{order.order_mode || order.delivery_type || 'Mode à confirmer'}{order.creneaux ? ` · ${order.creneaux}` : ''}</span>
                <span>Paiement : {order.payment_status || 'pending'}</span>
                {order.customer_phone && <span>Client : {order.customer_phone}</span>}
              </div>
              {order.notes && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs whitespace-pre-line">{order.notes}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === 'pending' && <>
                  <button disabled={busy} onClick={() => void transition(order, 'confirmed')} className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-black text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Accepter</button>
                  <button disabled={busy} onClick={() => void transition(order, 'cancelled')} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50"><XCircle className="h-4 w-4" />Refuser</button>
                </>}
                {order.status === 'confirmed' && <>
                  <button disabled={busy} onClick={() => void transition(order, 'preparing')} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white disabled:opacity-50"><ChefHat className="h-4 w-4" />Commencer la préparation</button>
                  <button disabled={busy} onClick={() => void transition(order, 'cancelled')} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-50">Annuler</button>
                </>}
                {order.status === 'preparing' && <button disabled={busy} onClick={() => void transition(order, 'ready')} className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-black text-white disabled:opacity-50"><PackageCheck className="h-4 w-4" />Prête pour retrait</button>}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
