import { useState } from 'react';
import { Store, Package, CheckCircle, ChefHat, Bell, Snowflake, Clock, MapPin } from 'lucide-react';
import { useSimulation } from './SimulationContext';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS } from './data';

export function VendorView() {
  const { vendors, orders, confirmOrder, markPreparing, markReady, notifications } = useSimulation();
  const [selectedVendor, setSelectedVendor] = useState(vendors[0]?.id || '');

  const vendor = vendors.find(v => v.id === selectedVendor);
  const vendorOrders = orders.filter(o => o.vendorId === selectedVendor);
  const pendingOrders = vendorOrders.filter(o => o.status === 'pending');
  const activeOrders = vendorOrders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
  const completedOrders = vendorOrders.filter(o => ['picked_up', 'in_transit', 'at_relay', 'delivered'].includes(o.status));
  const vendorNotifs = notifications.filter(n => n.role === 'vendor').slice(0, 5);
  const todayRevenue = vendorOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount * 0.8, 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {vendors.filter(v => v.active).map(v => (
          <button
            key={v.id}
            onClick={() => setSelectedVendor(v.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedVendor === v.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
          >
            {v.name}
          </button>
        ))}
      </div>

      {vendor && (
        <div className="bg-foreground rounded-3xl p-6 text-background">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{vendor.name}</h2>
              <p className="text-xs opacity-60">{vendor.type} - {vendor.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{vendorOrders.length}</div>
              <div className="text-[10px] opacity-60">Commandes</div>
            </div>
            <div className="bg-background/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{pendingOrders.length}</div>
              <div className="text-[10px] opacity-60">En attente</div>
            </div>
            <div className="bg-background/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{todayRevenue.toFixed(0)} EUR</div>
              <div className="text-[10px] opacity-60">Revenus (80%)</div>
            </div>
          </div>
        </div>
      )}

      {vendorNotifs.length > 0 && (
        <div className="space-y-2">
          {vendorNotifs.slice(0, 3).map(n => (
            <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold">{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Nouvelles commandes ({pendingOrders.length})
          </h3>
          <div className="space-y-3">
            {pendingOrders.map(o => (
              <div key={o.id} className="bg-card rounded-2xl border-2 border-amber-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground">{o.orderNumber}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ORDER_STATUS_COLORS[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
                <div className="space-y-1">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.qty}x {item.name}</span>
                      <span className="font-bold">{(item.qty * item.price).toFixed(2)} EUR</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{DELIVERY_TYPE_LABELS[o.deliveryType]}</span>
                  {o.requiresColdChain && <span className="flex items-center gap-1 text-sky-600"><Snowflake className="w-3 h-3" />Produit frais</span>}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="font-black text-foreground">{o.totalAmount.toFixed(2)} EUR</span>
                  <button
                    onClick={() => confirmOrder(o.id)}
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm active:scale-95 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Accepter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">En cours ({activeOrders.length})</h3>
          <div className="space-y-3">
            {activeOrders.map(o => (
              <div key={o.id} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground text-sm">{o.orderNumber}</span>
                    <span className="text-xs text-muted-foreground ml-2">{o.customerName}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ORDER_STATUS_COLORS[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {o.items.map((item, i) => (
                    <div key={i}>{item.qty}x {item.name}</div>
                  ))}
                </div>
                {o.requiresColdChain && (
                  <div className="flex items-center gap-1 text-sky-600">
                    <Snowflake className="w-3 h-3" />
                    <span className="text-xs font-bold">Produit frais - Preparation rapide requise</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {o.status === 'confirmed' && (
                    <button
                      onClick={() => markPreparing(o.id)}
                      className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      En preparation
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <button
                      onClick={() => markReady(o.id)}
                      className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Pret !
                    </button>
                  )}
                  {o.status === 'ready' && (
                    <div className="flex-1 py-2.5 bg-teal-50 text-teal-700 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      En attente du livreur
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Traitees ({completedOrders.length})</h3>
          <div className="space-y-2">
            {completedOrders.map(o => (
              <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-sm text-foreground">{o.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                </div>
                <span className="font-black text-sm text-foreground">{o.totalAmount.toFixed(2)} EUR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendorOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold">Aucune commande</p>
          <p className="text-sm">Les commandes passeees par le client apparaitront ici</p>
        </div>
      )}
    </div>
  );
}
