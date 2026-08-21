import { useEffect, useState } from'react';
import { Layout } from'../components/layout/Layout';
import { isSupabaseConfigured, supabase } from'../lib/supabase';
import { readDemoOrders, seedDemoData } from'../data/demoDb';

const allowDemoFallback = import.meta.env.VITE_ERP_FALLBACK_DEMO !=='false';
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ||'596696653589';

const statusCopy: Record<string, { label: string; message: string }> = {
 pending: { label:'En attente', message:'Commande reçue. Confirmation en cours.' },
 confirmed: { label:'Confirmée', message:'Commande confirmée. Préparation en cours.' },
 preparing: { label:'En préparation', message:'Le partenaire prépare votre commande.' },
 ready: { label:'Prête', message:'Commande prête. Livraison ou retrait à confirmer.' },
 in_delivery: { label:'En livraison', message:'Livraison en cours.' },
 delivered: { label:'Livrée', message:'Commande livrée. Merci ! 😊' },
 cancelled: { label:'Annulée', message:'Commande annulée. Contactez-nous si besoin.' }
};

function formatDate(value?: number | string | null) {
 if (!value) return'';
 const date = typeof value ==='number' ? new Date(value) : new Date(value);
 if (Number.isNaN(date.getTime())) return'';
 return date.toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function readLocalOrders(): any[] {
 try {
 const raw = localStorage.getItem('delikreol_local_orders_v1');
 const parsed = raw ? JSON.parse(raw) : [];
 return Array.isArray(parsed) ? parsed : [];
 } catch {
 return [];
 }
}

function normalizeLocalOrder(order: any) {
 return {
 id: order.id,
 orderNumber: order.order_number || order.id,
 status: order.status ||'pending',
 totalAmount: order.total_amount || order.total || order.subtotal || 0,
 createdAt: order.created_at,
 items: order.items || [],
 commune: order.commune,
 mode: order.order_mode || order.mode,
 };
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

 const handleLookup = async (forcedQuery?: string) => {
 const trimmed = (forcedQuery ?? query).trim();
 if (!trimmed) {
 setError('Entre ton numéro de commande.');
 return;
 }
 setLoading(true);
 setError(null);
 setResult(null);

 try {
     const localOrders = readLocalOrders();
     const localOrder = localOrders.find((o) => o.id === trimmed || o.order_number === trimmed);
     if (localOrder) {
       setResult(normalizeLocalOrder(localOrder));
       return;
     }

     if (isSupabaseConfigured) {
       if (!/^[0-9a-f]{32}$/i.test(trimmed)) throw new Error('TRACKING_TOKEN_REQUIRED');
       const { data, error: supabaseError } = await supabase.functions.invoke('public-order-status', {
         body: { tracking_token: trimmed },
       });

       if (supabaseError) throw supabaseError;
       const orderData = data?.order as {
         order_number?: string;
         status?: string;
         payment_status?: string;
         delivery_status?: string;
         total_amount?: number;
         created_at?: string;
         commune?: string;
         mode?: string;
         items?: Array<{ product_id?: string; name?: string; quantity?: number; unit_price?: number }>;
       } | undefined;
       if (!orderData?.order_number) throw new Error('NOT_FOUND');

       setResult({
         orderNumber: orderData.order_number,
         status: orderData.status,
         paymentStatus: orderData.payment_status,
         deliveryStatus: orderData.delivery_status,
         totalAmount: orderData.total_amount,
         createdAt: orderData.created_at,
         commune: orderData.commune,
         mode: orderData.mode,
         items: (orderData.items || []).map((item) => ({
           id: item.product_id,
           name: item.name,
           quantity: item.quantity,
           price: item.unit_price,
         })),
       });
       return;
     }

     if (allowDemoFallback) {
       seedDemoData();
       const orders = readDemoOrders();
       const order = orders.find((o) => o.id === trimmed || o.order_number === trimmed);
       if (!order) throw new Error('NOT_FOUND');
       setResult({ id: order.id, orderNumber: order.order_number, status: order.status, totalAmount: order.total_amount, createdAt: order.created_at, items: order.items || [] });
       return;
     }

     throw new Error('NOT_FOUND');
   } catch (err: unknown) {
 const message = err instanceof Error ? err.message :'';
 setError(
 message ==='TRACKING_TOKEN_REQUIRED'
 ?'Pour une commande en ligne, utilise le lien de suivi sécurisé reçu après validation. Le numéro seul ne permet pas d’accéder aux détails.'
 : message ==='NOT_FOUND'
 ?'Commande introuvable. Vérifie ton lien de suivi ou contacte le support WhatsApp.'
 :'Erreur lors de la recherche.',
 );
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const order = params.get('order');
 if (order) void handleLookup(order);
 }, []);

 const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour, je veux de l'aide pour la commande ${query.trim() ||''}.`)}`;
 const baseUrl = import.meta.env.BASE_URL ||'/';

 return (
 <Layout>
 <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 text-slate-900">
 <div className="max-w-3xl mx-auto px-6 py-12">
 <div className="bg-white/90 border border-primary/20 rounded-3xl p-6 shadow-lg">
 <h1 className="text-3xl font-black text-primary mb-2">Suivre ma commande</h1>
 <p className="text-sm text-slate-600 mb-6">Entre le token de suivi sécurisé reçu après ta commande.</p>
 <div className="text-xs text-slate-500 mb-4">Suivi mis à jour manuellement. Pour une question urgente, contacte-nous sur WhatsApp.</div>

 <div className="flex flex-col sm:flex-row gap-3">
 <input className="flex-1 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Token de suivi sécurisé" value={query} onChange={(e) => setQuery(e.target.value)} />
 <button onClick={() => handleLookup()} className="px-6 py-3 rounded-xl bg-primary text-white font-bold">Vérifier</button>
 </div>

 {loading && <div className="mt-4 text-sm text-slate-500">Recherche...</div>}
 {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

 {result && (
 <div className="mt-6 border border-primary/20 rounded-2xl p-5 bg-primary/[0.05]/40">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
 <div><div className="text-sm text-slate-500">Commande</div><div className="text-xl font-black text-primary">{result.orderNumber}</div></div>
 <div className="text-right"><div className="text-sm text-slate-500">Total</div><div className="text-lg font-bold">{Number(result.totalAmount || 0).toFixed(2)} €</div></div>
 </div>

 <div className="mt-4"><div className="text-sm text-slate-500">Statut</div><div className="text-lg font-semibold">{statusCopy[result.status]?.label ?? result.status}</div><div className="text-sm text-slate-600">{statusCopy[result.status]?.message ??'Suivi en cours.'}</div></div>
 <div className="mt-4 text-sm text-slate-500">Date: {formatDate(result.createdAt)}</div>

 {(result.commune || result.mode) && <div className="mt-2 text-sm text-slate-600">{result.commune ||''} {result.mode ? `· ${result.mode}` :''}</div>}

 <div className="mt-4"><div className="text-sm font-semibold mb-2">Articles</div><div className="space-y-2">{(result.items || []).map((item: any, index: number) => (<div key={item.id || index} className="flex items-center justify-between text-sm"><span>{item.name || item.productId || item.product_id ||'Article'}</span><span>x{item.quantity || 1}</span></div>))}</div></div>

 <div className="mt-6 flex flex-col sm:flex-row gap-3"><a href={whatsappLink} className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold text-center">WhatsApp support</a><a href={baseUrl} className="px-5 py-3 rounded-xl border border-orange-300 text-primary font-bold text-center">Retour accueil</a></div>
 </div>
 )}
 </div>
 </div>
 </div>
 </Layout>
 );
}
