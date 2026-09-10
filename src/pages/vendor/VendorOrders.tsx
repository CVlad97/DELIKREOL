import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatMenuSelection, type MenuSelection } from '../../types/menu';

interface VendorOrderLine {
  id: string;
  product_name: string | null;
  quantity: number;
  selected_options: MenuSelection | null;
  order: {
    order_number: string;
    status: string;
    order_mode: string | null;
    delivery_type: string | null;
    creneaux: string | null;
    created_at: string;
  } | null;
}

export function VendorOrders() {
  const [lines, setLines] = useState<VendorOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('order_items')
      .select('id, product_name, quantity, selected_options, order:orders!order_items_order_id_fkey(order_number, status, order_mode, delivery_type, creneaux, created_at)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (queryError) setError(queryError.message);
    else setLines((data || []) as unknown as VendorOrderLine[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Commandes à préparer</h1><p className="text-sm text-muted-foreground">Uniquement les articles de votre établissement.</p></div>
        <button type="button" onClick={() => void load()} className="rounded-xl border bg-white p-3" aria-label="Actualiser"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {loading && <div className="flex justify-center py-16"><Loader className="h-6 w-6 animate-spin" /></div>}
      {!loading && error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="h-5 w-5 shrink-0" /><span>Commandes indisponibles : {error}</span></div>}
      {!loading && !error && lines.length === 0 && <div className="rounded-2xl bg-white p-8 text-center text-muted-foreground">Aucune commande à préparer.</div>}
      <div className="space-y-4">
        {lines.map((line) => (
          <article key={line.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase text-primary">{line.order?.order_number || 'Commande'}</div><h2 className="mt-1 text-lg font-black">{line.product_name || 'Article'} × {line.quantity}</h2></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{line.order?.status || 'pending'}</span></div>
            <div className="mt-3 rounded-xl bg-orange-50 p-3">
              {formatMenuSelection(line.selected_options || undefined).length > 0 ? formatMenuSelection(line.selected_options || undefined).map((text) => <div key={text} className="text-sm font-semibold">{text}</div>) : <div className="text-sm text-muted-foreground">Aucune composition particulière.</div>}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{line.order?.order_mode || line.order?.delivery_type || 'Mode à confirmer'}{line.order?.creneaux ? ` · ${line.order.creneaux}` : ''}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
