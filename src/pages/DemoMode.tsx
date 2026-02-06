import { useState } from 'react';
import {
  X, ShoppingBag, Store, Truck, MapPin, Shield,
  Star, Clock, TrendingUp, Package, Users, Eye,
  ChevronRight, CircleDot, CheckCircle2, Timer, Bike, Car
} from 'lucide-react';
import {
  demoVendors, demoProducts, demoOrders, demoDrivers,
  demoRelayPoints, demoStats, orderStatusLabels, orderStatusColors,
  deliveryTypeLabels
} from '../data/demoData';

type DemoRole = 'client' | 'vendor' | 'driver' | 'relay' | 'admin';

const roles: { id: DemoRole; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'client', label: 'Client', icon: ShoppingBag },
  { id: 'vendor', label: 'Vendeur', icon: Store },
  { id: 'driver', label: 'Livreur', icon: Truck },
  { id: 'relay', label: 'Point Relais', icon: MapPin },
  { id: 'admin', label: 'Admin', icon: Shield },
];

function ClientDemo() {
  const featured = demoProducts.filter(p => p.is_available).slice(0, 6);
  const activeOrders = demoOrders.filter(o => o.status !== 'delivered').slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="bg-primary rounded-3xl p-8 text-primary-foreground">
        <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Bienvenue sur</p>
        <h2 className="text-3xl font-black tracking-tight mb-2">DELIKREOL</h2>
        <p className="opacity-80">Decouvrez les saveurs de la Martinique, livrees chez vous</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Produits populaires</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {featured.map(p => (
            <div key={p.id} className="bg-card rounded-2xl border border-border/50 p-4 hover:shadow-soft transition-all group">
              <div className="w-full h-24 bg-muted rounded-xl mb-3 flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h4 className="font-bold text-foreground text-sm leading-tight">{p.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.vendor_name}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-primary font-black">{p.price.toFixed(2)} EUR</span>
                <button className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Suivi de commandes</h3>
        <div className="space-y-3">
          {activeOrders.map(o => (
            <div key={o.id} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground text-sm">{o.order_number}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${orderStatusColors[o.status]}`}>
                  {orderStatusLabels[o.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{o.vendor_name} - {o.items.length} article(s)</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{deliveryTypeLabels[o.delivery_type]}</span>
                <span className="font-bold text-foreground">{o.total_amount.toFixed(2)} EUR</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorDemo() {
  const vendorProducts = demoProducts.filter(p => p.vendor_id === 'v1');
  const vendorOrders = demoOrders.filter(o => o.vendor_name === 'Chez Tatie Mireille');

  return (
    <div className="space-y-8">
      <div className="bg-foreground rounded-3xl p-8 text-background">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Store className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Chez Tatie Mireille</h2>
            <p className="text-sm opacity-60">Restaurant creole - Fort-de-France</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{vendorOrders.length}</div>
            <div className="text-xs opacity-60">Commandes</div>
          </div>
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{vendorOrders.reduce((s, o) => s + o.total_amount, 0).toFixed(0)} EUR</div>
            <div className="text-xs opacity-60">CA du jour</div>
          </div>
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black flex items-center justify-center gap-1">4.8 <Star className="w-4 h-4 text-secondary fill-secondary" /></div>
            <div className="text-xs opacity-60">Note</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Commandes en cours</h3>
        <div className="space-y-3">
          {vendorOrders.filter(o => o.status !== 'delivered').map(o => (
            <div key={o.id} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-foreground">{o.order_number}</span>
                  <span className="text-xs text-muted-foreground ml-2">{o.customer_name}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${orderStatusColors[o.status]}`}>
                  {orderStatusLabels[o.status]}
                </span>
              </div>
              <div className="space-y-1">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.qty}x {item.name}</span>
                    <span className="font-medium text-foreground">{(item.qty * item.price).toFixed(2)} EUR</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{deliveryTypeLabels[o.delivery_type]}</span>
                <span className="font-black text-foreground">{o.total_amount.toFixed(2)} EUR</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Mes produits ({vendorProducts.length})</h3>
        <div className="space-y-2">
          {vendorProducts.map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground text-sm">{p.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-primary">{p.price.toFixed(2)} EUR</span>
                <span className={`w-3 h-3 rounded-full ${p.is_available ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DriverDemo() {
  const activeDeliveries = demoOrders.filter(o => o.status === 'in_delivery');
  const driver = demoDrivers[0];
  const vehicleIcons = { bike: Bike, scooter: Bike, car: Car };

  return (
    <div className="space-y-8">
      <div className="bg-primary rounded-3xl p-8 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{driver.name}</h2>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Star className="w-4 h-4 fill-current" /> {driver.rating}
              <span className="mx-1">-</span>
              {driver.total_deliveries} livraisons
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black">{driver.today_earnings.toFixed(2)} EUR</div>
            <div className="text-xs opacity-70 mt-1">Gains du jour</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black">{activeDeliveries.length}</div>
            <div className="text-xs opacity-70 mt-1">Livraisons actives</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Livraisons en cours</h3>
        <div className="space-y-3">
          {activeDeliveries.map(o => (
            <div key={o.id} className="bg-card rounded-2xl border-2 border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CircleDot className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-bold text-foreground">{o.order_number}</span>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-auto">EN COURS</span>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store className="w-4 h-4" />
                  <span>{o.vendor_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{o.delivery_address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{o.customer_name}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between">
                <span className="text-sm text-muted-foreground">{o.items.length} article(s)</span>
                <span className="font-black text-foreground">{o.total_amount.toFixed(2)} EUR</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Courses disponibles</h3>
        <div className="space-y-3">
          {demoOrders.filter(o => o.status === 'ready').map(o => (
            <div key={o.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground text-sm">{o.vendor_name}</div>
                <div className="text-xs text-muted-foreground mt-1">{o.delivery_address}</div>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">Accepter</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelayDemo() {
  const activeRelays = demoRelayPoints.filter(r => r.is_active);
  const relay = activeRelays[0];

  return (
    <div className="space-y-8">
      <div className="bg-accent rounded-3xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{relay.name}</h2>
            <p className="text-sm opacity-80">{relay.address}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{relay.deposits_waiting}</div>
            <div className="text-xs opacity-70">En attente</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{relay.today_pickups}</div>
            <div className="text-xs opacity-70">Retraits</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{relay.capacity_pct}%</div>
            <div className="text-xs opacity-70">Capacite</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Colis en attente de retrait</h3>
        <div className="space-y-3">
          {demoOrders.filter(o => o.delivery_type === 'relay_point' && o.status !== 'delivered').map(o => (
            <div key={o.id} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground text-sm">{o.order_number}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${orderStatusColors[o.status]}`}>
                  {orderStatusLabels[o.status]}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Client : {o.customer_name}</div>
                <div>Vendeur : {o.vendor_name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Tous les points relais</h3>
        <div className="space-y-3">
          {demoRelayPoints.map(r => (
            <div key={r.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.address}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <span className="text-xs text-muted-foreground">{r.is_active ? 'Actif' : 'Ferme'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDemo() {
  const stats = demoStats;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CA du jour</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.revenue_today.toFixed(0)} EUR</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">+12% vs hier</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-secondary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commandes</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.orders_today}</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">+8% vs hier</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Livreurs actifs</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.active_drivers}</div>
          <div className="text-xs text-muted-foreground mt-1">sur {demoDrivers.length} inscrits</div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Temps moyen</span>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.avg_delivery_time} min</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">-3 min vs semaine</div>
        </div>
      </div>

      <div className="bg-foreground rounded-3xl p-6 text-background">
        <h3 className="font-black text-lg mb-1">Performance semaine</h3>
        <p className="text-sm opacity-60 mb-4">{stats.orders_week} commandes - {stats.revenue_week.toFixed(0)} EUR CA</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-xl font-black">{stats.active_vendors}</div>
            <div className="text-xs opacity-60">Vendeurs</div>
          </div>
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-xl font-black">{stats.active_relay_points}</div>
            <div className="text-xs opacity-60">Relais</div>
          </div>
          <div className="bg-background/10 rounded-2xl p-3 text-center">
            <div className="text-xl font-black">{stats.total_customers}</div>
            <div className="text-xs opacity-60">Clients</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Dernieres commandes</h3>
        <div className="space-y-2">
          {demoOrders.slice(0, 5).map(o => (
            <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${orderStatusColors[o.status]}`}>
                  {orderStatusLabels[o.status]}
                </span>
                <div>
                  <span className="font-bold text-foreground text-sm">{o.order_number}</span>
                  <span className="text-xs text-muted-foreground ml-2">{o.customer_name}</span>
                </div>
              </div>
              <span className="font-black text-foreground text-sm">{o.total_amount.toFixed(2)} EUR</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Vendeurs partenaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoVendors.map(v => (
            <div key={v.id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground text-sm">{v.business_name}</div>
                <div className="text-xs text-muted-foreground">{v.address}</div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="font-bold text-foreground text-sm">{v.rating}</span>
                <span className={`w-3 h-3 rounded-full ${v.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const roleViews: Record<DemoRole, () => JSX.Element> = {
  client: ClientDemo,
  vendor: VendorDemo,
  driver: DriverDemo,
  relay: RelayDemo,
  admin: AdminDemo,
};

export default function DemoMode({ onExit }: { onExit: () => void }) {
  const [activeRole, setActiveRole] = useState<DemoRole>('client');
  const RoleView = roleViews[activeRole];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-secondary" />
              <span className="font-black text-sm uppercase tracking-widest">Mode Demo</span>
            </div>
            <span className="text-xs opacity-40 hidden sm:inline">Presentation interactive de la plateforme</span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-xl font-bold text-sm transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Quitter la demo</span>
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roles.map(role => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-elegant'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-fadeIn">
          <RoleView />
        </div>
      </div>
    </div>
  );
}
