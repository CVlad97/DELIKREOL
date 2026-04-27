import { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Truck, Clock, MapPin,
  ChevronDown, RefreshCw, Loader, AlertCircle,
  CheckCircle2, Store, Users, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  delivery_type: string;
  delivery_address: string | null;
  total_amount: number;
  created_at: string;
  notes: string | null;
}

interface DeliveryRow {
  id: string;
  order_id: string;
  status: string;
  pickup_address: string;
  driver_fee: number;
  estimated_time: number | null;
  created_at: string;
  order?: { order_number: string; total_amount: number };
  driver?: { vehicle_type: string };
}

interface OperationsStats {
  orders_total: number;
  orders_pending: number;
  orders_active: number;
  orders_delivered: number;
  deliveries_active: number;
  revenue_total: number;
}

const statusLabels: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmee', preparing: 'Preparation',
  ready: 'Prete', in_delivery: 'En livraison', delivered: 'Livree', cancelled: 'Annulee',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-sky-100 text-sky-800',
  preparing: 'bg-orange-100 text-orange-800', ready: 'bg-teal-100 text-teal-800',
  in_delivery: 'bg-blue-100 text-blue-800', delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const deliveryLabels: Record<string, string> = {
  home_delivery: 'Domicile', relay_point: 'Point relais', pickup: 'Retrait',
};

const nextStatus: Record<string, string> = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'ready',
  ready: 'in_delivery', in_delivery: 'delivered',
};

export default function AdminOperations() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [stats, setStats] = useState<OperationsStats>({ orders_total: 0, orders_pending: 0, orders_active: 0, orders_delivered: 0, deliveries_active: 0, revenue_total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, deliveriesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('deliveries').select('*, order:orders(order_number, total_amount), driver:drivers(vehicle_type)').order('created_at', { ascending: false }).limit(20),
      ]);

      const ordersData = ordersRes.data || [];
      const deliveriesData = deliveriesRes.data || [];

      setOrders(ordersData);
      setDeliveries(deliveriesData);

      const activeStatuses = ['confirmed', 'preparing', 'ready', 'in_delivery'];
      setStats({
        orders_total: ordersData.length,
        orders_pending: ordersData.filter(o => o.status === 'pending').length,
        orders_active: ordersData.filter(o => activeStatuses.includes(o.status)).length,
        orders_delivered: ordersData.filter(o => o.status === 'delivered').length,
        deliveries_active: deliveriesData.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)).length,
        revenue_total: ordersData.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total_amount, 0),
      });
    } catch {
      showError('Erreur de chargement des operations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const advanceOrderStatus = async (order: OrderRow) => {
    const next = nextStatus[order.status];
    if (!next) return;

    const { error } = await supabase.from('orders').update({ status: next }).eq('id', order.id);
    if (error) {
      showError('Erreur de mise a jour');
      return;
    }
    showSuccess(`Commande passee a "${statusLabels[next]}"`);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
    setSelectedOrder(null);
  };

  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerez les commandes et livraisons en temps reel</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-2xl font-bold text-sm hover:border-primary/30 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.orders_total}</div>
          <div className="text-xs text-muted-foreground">commandes</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">En attente</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.orders_pending}</div>
          <div className="text-xs text-amber-600 font-bold">{stats.orders_pending > 0 ? 'A traiter' : 'Aucune'}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">En cours</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.orders_active}</div>
          <div className="text-xs text-muted-foreground">{stats.deliveries_active} livraisons</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CA livre</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.revenue_total.toFixed(0)} EUR</div>
          <div className="text-xs text-emerald-600 font-bold">{stats.orders_delivered} livrees</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-foreground">Filtrer :</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!statusFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Toutes ({orders.length})
          </button>
          {Object.entries(statusLabels).filter(([k]) => k !== 'cancelled').map(([key, label]) => {
            const count = orders.filter(o => o.status === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Aucune commande</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter ? `Aucune commande avec le statut "${statusLabels[statusFilter]}"` : 'Les commandes apparaitront ici'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Commande</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Livraison</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Montant</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground text-sm">{o.order_number}</div>
                      {o.delivery_address && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{o.delivery_address}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[o.status] || 'bg-muted text-muted-foreground'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{deliveryLabels[o.delivery_type] || o.delivery_type}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-foreground">{o.total_amount.toFixed(2)} EUR</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {nextStatus[o.status] ? (
                        <button
                          onClick={() => advanceOrderStatus(o)}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
                        >
                          {statusLabels[nextStatus[o.status]]}
                        </button>
                      ) : o.status === 'delivered' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deliveries.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-foreground mb-4">Livraisons recentes</h2>
          <div className="grid gap-3">
            {deliveries.slice(0, 5).map(d => (
              <div key={d.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-accent" />
                  <div>
                    <span className="font-bold text-foreground text-sm">{d.order?.order_number || d.order_id.slice(0, 8)}</span>
                    <div className="text-xs text-muted-foreground">{d.pickup_address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[d.status] || 'bg-muted text-muted-foreground'}`}>
                    {d.status}
                  </span>
                  {d.estimated_time && <div className="text-xs text-muted-foreground mt-1">{d.estimated_time} min</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
