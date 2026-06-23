import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, LogOut, MessageCircle, PackageSearch, ShoppingBag, UserRound } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';

type ClientOrder = {
  id: string;
  order_number?: string;
  total?: number;
  total_amount?: number;
  subtotal?: number;
  commune?: string;
  mode?: string;
  order_mode?: string;
  status?: string;
  created_at?: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  in_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

function readLocalOrders(): ClientOrder[] {
  try {
    const raw = localStorage.getItem('delikreol_local_orders_v1');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return 'Date inconnue';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

export default function ClientAccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Mon espace client — DeliKreol';
  }, []);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      if (isSupabaseConfigured && !isDemoMode) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('id,order_number,status,total_amount,subtotal,commune,order_mode,created_at')
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;
          if (data && data.length > 0) {
            setOrders(data as ClientOrder[]);
            setSource('supabase');
            return;
          }
        } catch (err: any) {
          console.warn('[ClientAccount] Supabase orders unavailable, fallback local', err);
          setLoadError(err?.message || 'Commandes Supabase indisponibles. Affichage local.');
        }
      }

      setOrders(readLocalOrders().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
      setSource('local');
    }

    void loadOrders();
  }, [user]);

  const latestOrder = useMemo(() => orders[0] || null, [orders]);

  if (!loading && !user) {
    return <Navigate to="/connexion?next=/compte" replace />;
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Client DeliKreol';
  const whatsappText = encodeURIComponent('Bonjour, j’ai besoin d’aide depuis mon espace client DeliKreol.');

  return (
    <Layout>
      <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Espace client</p>
                <h1 className="mt-2 text-3xl font-black text-gray-900">Bonjour {displayName}</h1>
                <p className="mt-2 text-sm text-gray-600">Retrouve tes commandes, ton suivi, tes raccourcis et le support DeliKreol.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/catalogue" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600"><ShoppingBag className="h-4 w-4" /> Commander</Link>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-black text-white hover:bg-green-600"><MessageCircle className="h-4 w-4" /> Support</a>
                <button onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"><LogOut className="h-4 w-4" /> Déconnexion</button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-orange-100 p-3 text-orange-600"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xs text-gray-500">Commandes</p><p className="text-2xl font-black text-gray-900">{orders.length}</p></div></div></div>
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-green-100 p-3 text-green-600"><CheckCircle2 className="h-5 w-5" /></div><div><p className="text-xs text-gray-500">Dernier statut</p><p className="text-lg font-black text-gray-900">{latestOrder ? STATUS_LABEL[latestOrder.status || 'pending'] || latestOrder.status || 'En attente' : 'Aucune'}</p></div></div></div>
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-100 p-3 text-blue-600"><UserRound className="h-5 w-5" /></div><div><p className="text-xs text-gray-500">Compte</p><p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p></div></div></div>
          </div>

          {loadError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{loadError}</div>}

          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-black text-gray-900">Mes commandes</h2><p className="text-xs text-gray-500">Source : {source === 'supabase' ? 'Supabase' : 'commandes locales du navigateur'}</p></div>
              <Link to="/statut-commande" className="text-sm font-bold text-orange-600 hover:underline">Suivre une commande</Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center"><PackageSearch className="mx-auto h-10 w-10 text-gray-400" /><h3 className="mt-3 font-black text-gray-900">Aucune commande trouvée</h3><p className="mt-2 text-sm text-gray-600">Passe une commande test depuis le catalogue ou contacte-nous sur WhatsApp.</p><Link to="/catalogue" className="mt-4 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">Voir le catalogue</Link></div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const number = order.order_number || order.id;
                  const total = order.total_amount ?? order.total ?? order.subtotal;
                  const status = order.status || 'pending';
                  return (
                    <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="font-mono text-lg font-black text-orange-600">{number}</p><p className="text-xs text-gray-500">{formatDate(order.created_at)}</p><p className="mt-1 text-sm text-gray-600">{order.commune || 'Commune non précisée'} · {order.order_mode || order.mode || 'Mode non précisé'}</p></div>
                        <div className="text-left sm:text-right"><span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{STATUS_LABEL[status] || status}</span><p className="mt-2 text-lg font-black text-gray-900">{money(total)}</p></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2"><Link to={`/statut-commande?order=${encodeURIComponent(number)}`} className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-50">Voir le suivi</Link><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, j’ai besoin d’aide pour la commande ${number}.`)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-green-200 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50">WhatsApp</a></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/feedback" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700 hover:bg-red-100"><AlertTriangle className="mb-3 h-6 w-6" /><h3 className="font-black">Signaler un problème</h3><p className="mt-1 text-sm">Décris un bug et ajoute une capture si besoin.</p></Link>
            <Link to="/aide" className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-orange-700 hover:bg-orange-100"><MessageCircle className="mb-3 h-6 w-6" /><h3 className="font-black">Aide & informations</h3><p className="mt-1 text-sm">Comprendre la livraison, le retrait et les commandes.</p></Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
