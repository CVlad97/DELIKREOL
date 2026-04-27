import {
  TrendingUp, Package, Truck, MapPin, Store, Users,
  AlertTriangle, Snowflake, CheckCircle, Clock, Bell, DollarSign,
} from 'lucide-react';
import { useSimulation } from './SimulationContext';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS, STORAGE_LABELS, STORAGE_COLORS } from './data';

export function AdminView() {
  const { vendors, orders, drivers, relayPoints, notifications, getRelayLoad } = useSimulation();

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
  const platformCommission = totalRevenue * 0.2;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => !['delivered', 'pending'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const coldChainOrders = orders.filter(o => o.requiresColdChain && !['delivered'].includes(o.status));
  const availableDrivers = drivers.filter(d => d.available);
  const adminNotifs = notifications.filter(n => n.role === 'admin').slice(0, 8);

  const saturatedRelays = relayPoints.filter(r => {
    const { pct } = getRelayLoad(r.id);
    return pct >= 70;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CA Total</span>
          </div>
          <div className="text-xl font-black text-foreground">{totalRevenue.toFixed(0)} EUR</div>
          <div className="text-[10px] text-emerald-600 font-bold">Commission: {platformCommission.toFixed(0)} EUR</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Commandes</span>
          </div>
          <div className="text-xl font-black text-foreground">{orders.length}</div>
          <div className="text-[10px] text-muted-foreground">{deliveredOrders.length} livrees - {activeOrders.length} en cours</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Livreurs</span>
          </div>
          <div className="text-xl font-black text-foreground">{availableDrivers.length}/{drivers.length}</div>
          <div className="text-[10px] text-muted-foreground">Disponibles</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Relais</span>
          </div>
          <div className="text-xl font-black text-foreground">{relayPoints.filter(r => r.active).length}</div>
          <div className={`text-[10px] font-bold ${saturatedRelays.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {saturatedRelays.length > 0 ? `${saturatedRelays.length} sature(s)` : 'Capacite OK'}
          </div>
        </div>
      </div>

      {(coldChainOrders.length > 0 || saturatedRelays.length > 0) && (
        <div className="space-y-2">
          {coldChainOrders.length > 0 && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3">
              <Snowflake className="w-5 h-5 text-sky-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-sky-700">Chaine du froid active</p>
                <p className="text-xs text-sky-600">{coldChainOrders.length} commande(s) avec produits frais en cours</p>
              </div>
            </div>
          )}
          {saturatedRelays.map(r => {
            const { pct } = getRelayLoad(r.id);
            return (
              <div key={r.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700">{r.name} - {pct}%</p>
                  <p className="text-xs text-amber-600">Capacite critique - Rediriger les livraisons</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adminNotifs.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Activite en temps reel
          </h3>
          <div className="space-y-2">
            {adminNotifs.map(n => (
              <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
                {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : n.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <Bell className="w-4 h-4 flex-shrink-0" />}
                <span className="font-bold flex-1">{n.message}</span>
                <span className="text-[10px] opacity-60 whitespace-nowrap">
                  {n.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Toutes les commandes</h3>
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${ORDER_STATUS_COLORS[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{o.orderNumber}</span>
                      {o.requiresColdChain && <Snowflake className="w-3 h-3 text-sky-500" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{o.vendorName} - {DELIVERY_TYPE_LABELS[o.deliveryType]}</span>
                  </div>
                </div>
                <span className="font-black text-sm text-foreground whitespace-nowrap ml-2">{o.totalAmount.toFixed(2)} EUR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Vendeurs
          </h3>
          <div className="space-y-2">
            {vendors.map(v => {
              const vOrders = orders.filter(o => o.vendorId === v.id);
              return (
                <div key={v.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground text-sm">{v.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{v.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{vOrders.length} cmd</span>
                    <span className={`w-2 h-2 rounded-full ${v.active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Points Relais - Capacite
          </h3>
          <div className="space-y-2">
            {relayPoints.filter(r => r.active).map(r => {
              const { pct } = getRelayLoad(r.id);
              return (
                <div key={r.id} className="bg-card rounded-xl border border-border/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-foreground text-sm">{r.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct > 80 ? 'bg-red-100 text-red-700' : pct > 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {r.capacities.map((c, i) => (
                      <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STORAGE_COLORS[c.storageType]}`}>
                        {STORAGE_LABELS[c.storageType]}: {c.used}/{c.total}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="bg-foreground rounded-3xl p-8 text-background text-center">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="text-xl font-black mb-2">Simulation en attente</h3>
          <p className="text-sm opacity-60">Passez une commande depuis l'onglet Client pour voir l'activite ici</p>
        </div>
      )}
    </div>
  );
}
