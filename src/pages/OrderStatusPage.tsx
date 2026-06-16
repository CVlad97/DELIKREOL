import { useEffect, useState } from 'react';
import { erpRequest, isErpConfigured } from '../lib/erpClient';
import { readDemoOrders, seedDemoData } from '../data/demoDb';
import { Layout } from '../components/layout/Layout';

const allowDemoFallback = import.meta.env.VITE_ERP_FALLBACK_DEMO !== 'false';
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

const statusCopy: Record<string, { label: string; message: string }> = {
  pending: {
    label: 'En attente',
    message: 'Commande reçue. Confirmation en cours.'
  },
  confirmed: {
    label: 'Confirmée',
    message: 'Commande confirmée. Préparation en cours.'
  },
  preparing: {
    label: 'En préparation',
    message: 'Le partenaire prépare votre commande.'
  },
  ready: {
    label: 'Prête',
    message: 'Commande prête. Livraison ou retrait à confirmer.'
  },
  in_delivery: {
    label: 'En livraison',
    message: 'Livraison en cours.'
  },
  delivered: {
    label: 'Livrée',
    message: 'Commande livrée. Merci ! 😊'
  },
  cancelled: {
    label: 'Annulée',
    message: 'Commande annulée. Contactez-nous si besoin.'
  }
};

function formatDate(value?: number | string | null) {
  if (!value) return '';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function OrderStatusPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order');
    if (order) setQuery(order);
  }, []);

  const handleLookup = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Entre ton numéro de commande.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isErpConfigured) {
        const res = await erpRequest<any>(`/orders/lookup?q=${encodeURIComponent(trimmed)}`);
        if (!res || res.error) {
          throw new Error('NOT_FOUND');
        }
        setResult({
          id: res.order.id,
          orderNumber: res.order.orderNumber,
          status: res.order.status,
          totalAmount: res.order.totalAmount,
          createdAt: res.order.createdAt,
          items: res.items || []
        });
        return;
      }

      if (allowDemoFallback) {
        seedDemoData();
        const orders = readDemoOrders();
        const order = orders.find((o) => o.id === trimmed || o.order_number === trimmed);
        if (!order) throw new Error('NOT_FOUND');
        setResult({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          items: order.items || []
        });
        return;
      }

      throw new Error('NOT_FOUND');
    } catch (err: any) {
      setError(
        err?.message === 'NOT_FOUND'
          ? 'Commande introuvable. Vérifie ton numéro.'
          : 'Erreur lors de la recherche.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('order')) return;
    if (!query.trim()) return;
    void handleLookup();
  }, [query]);

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Bonjour, je veux de l'aide pour la commande ${query.trim() || ''}.`
  )}`;

  const baseUrl = import.meta.env.BASE_URL || '/';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white/90 border border-orange-100 rounded-3xl p-6 shadow-lg">
          <h1 className="text-3xl font-black text-orange-700 mb-2">Suivre ma commande</h1>
          <p className="text-sm text-slate-600 mb-6">
            Entre ton numéro de commande pour suivre son statut.
          </p>
          <div className="text-xs text-slate-500 mb-4">
            Suivi mis à jour manuellement. Pour une question urgente, contacte-nous sur WhatsApp.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 border border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Ex: DK12345678 ou o1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleLookup}
              className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
            >
              Vérifier
            </button>
          </div>

          {loading && <div className="mt-4 text-sm text-slate-500">Recherche...</div>}
          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          {result && (
            <div className="mt-6 border border-orange-100 rounded-2xl p-5 bg-orange-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm text-slate-500">Commande</div>
                  <div className="text-xl font-black text-orange-700">{result.orderNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-lg font-bold">
                    {Number(result.totalAmount || 0).toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-slate-500">Statut</div>
                <div className="text-lg font-semibold">
                  {statusCopy[result.status]?.label ?? result.status}
                </div>
                <div className="text-sm text-slate-600">
                  {statusCopy[result.status]?.message ?? 'Suivi en cours.'}
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Date: {formatDate(result.createdAt)}
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Articles</div>
                <div className="space-y-2">
                  {(result.items || []).map((item: any) => (
                    <div
                      key={item.id || `${item.productId || item.product_id}-${item.quantity}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{item.productId || item.product_id}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink}
                  className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold text-center"
                >
                  WhatsApp support
                </a>
                <a
                  href={baseUrl}
                  className="px-5 py-3 rounded-xl border border-orange-300 text-orange-700 font-bold text-center"
                >
                  Retour accueil
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}
