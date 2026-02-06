import { useState } from 'react';
import {
  Truck, Navigation, MapPin, Store, Package, Snowflake, Star,
  MessageCircle, ExternalLink, Bike, Car, CheckCircle,
  AlertTriangle, Clock, DollarSign,
} from 'lucide-react';
import { useSimulation } from './SimulationContext';
import { ORDER_STATUS_LABELS, DELIVERY_TYPE_LABELS } from './data';

export function DriverView() {
  const {
    drivers, orders, vendors, relayPoints,
    assignDriver, driverPickUp, driverDeliver, driverDeliverToRelay,
    getRouteInfo, notifications,
  } = useSimulation();

  const [selectedDriver, setSelectedDriver] = useState(drivers[0]?.id || '');
  const [tab, setTab] = useState<'available' | 'active' | 'earnings'>('available');

  const driver = drivers.find(d => d.id === selectedDriver);
  const availableOrders = orders.filter(o => o.status === 'ready' && !o.assignedDriverId);
  const myOrders = orders.filter(o => o.assignedDriverId === selectedDriver && !['delivered', 'at_relay'].includes(o.status));
  const completedByMe = orders.filter(o => o.assignedDriverId === selectedDriver && ['delivered', 'at_relay'].includes(o.status));
  const driverNotifs = notifications.filter(n => n.role === 'driver').slice(0, 5);

  const vehicleIcons: Record<string, typeof Truck> = { bike: Bike, scooter: Bike, car: Car };

  const getVendor = (vendorId: string) => vendors.find(v => v.id === vendorId);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {drivers.map(d => {
          const VIcon = vehicleIcons[d.vehicleType] || Truck;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDriver(d.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedDriver === d.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
            >
              <VIcon className="w-4 h-4" />
              {d.name}
            </button>
          );
        })}
      </div>

      {driver && (
        <div className="bg-primary rounded-3xl p-6 text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{driver.name}</h2>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Star className="w-3 h-3 fill-current" /> {driver.rating} - {driver.totalDeliveries} livraisons
                {driver.hasColdBox && <span className="flex items-center gap-1 ml-2"><Snowflake className="w-3 h-3" />Caisse froid</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{driver.todayEarnings.toFixed(0)} EUR</div>
              <div className="text-[10px] opacity-70">Gains du jour</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{myOrders.length}</div>
              <div className="text-[10px] opacity-70">En cours</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{driver.available ? 'OUI' : 'NON'}</div>
              <div className="text-[10px] opacity-70">Disponible</div>
            </div>
          </div>
        </div>
      )}

      {driverNotifs.length > 0 && (
        <div className="space-y-2">
          {driverNotifs.slice(0, 3).map(n => (
            <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
              {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              <span className="font-bold">{n.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(['available', 'active', 'earnings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
          >
            {t === 'available' ? `Dispo (${availableOrders.length})` : t === 'active' ? `En cours (${myOrders.length})` : 'Gains'}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        <div className="space-y-3">
          {availableOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">Aucune course disponible</p>
              <p className="text-xs">Les commandes pretes apparaitront ici</p>
            </div>
          )}
          {availableOrders.map(o => {
            const vendor = getVendor(o.vendorId);
            const route = driver && vendor ? getRouteInfo(driver.gps, vendor.gps, `Pickup ${o.orderNumber}`) : null;
            const coldWarning = o.requiresColdChain && driver && !driver.hasColdBox;
            return (
              <div key={o.id} className={`bg-card rounded-2xl border-2 ${coldWarning ? 'border-amber-300' : 'border-border/50'} p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground">{o.orderNumber}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">Prete</span>
                </div>
                <div className="text-sm space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-2"><Store className="w-3.5 h-3.5" />{o.vendorName}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{o.deliveryAddress}</div>
                  <div className="flex items-center gap-2"><Package className="w-3.5 h-3.5" />{o.items.length} article(s) - {DELIVERY_TYPE_LABELS[o.deliveryType]}</div>
                  {route && (
                    <div className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-primary" /><span className="text-primary font-bold">{route.distanceKm} km - ~{route.estimatedMinutes} min</span></div>
                  )}
                </div>
                {o.requiresColdChain && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${coldWarning ? 'bg-amber-50 border border-amber-200' : 'bg-sky-50 border border-sky-200'}`}>
                    {coldWarning ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <Snowflake className="w-4 h-4 text-sky-500" />}
                    <span className={`text-xs font-bold ${coldWarning ? 'text-amber-700' : 'text-sky-700'}`}>
                      {coldWarning ? 'Vous n\'avez pas de caisse isotherme !' : 'Produit frais - Caisse isotherme OK'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="font-bold text-primary">{(o.deliveryFee * 0.7).toFixed(2)} EUR</span>
                  <button
                    onClick={() => assignDriver(o.id, selectedDriver)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all ${coldWarning ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'}`}
                  >
                    {coldWarning ? 'Accepter (sans froid)' : 'Accepter la course'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'active' && (
        <div className="space-y-4">
          {myOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">Aucune course en cours</p>
            </div>
          )}
          {myOrders.map(o => {
            const vendor = getVendor(o.vendorId);
            const isPickedUp = ['picked_up', 'in_transit'].includes(o.status);
            const destination = o.deliveryType === 'relay_point' && o.assignedRelayId
              ? relayPoints.find(r => r.id === o.assignedRelayId)
              : null;

            const routeToPickup = driver && vendor ? getRouteInfo(driver.gps, vendor.gps, `Pickup ${o.orderNumber}`) : null;
            const routeToDelivery = driver ? getRouteInfo(
              vendor?.gps || driver.gps,
              destination ? destination.gps : o.deliveryGPS,
              o.deliveryType === 'relay_point' ? `Depot relais ${o.orderNumber}` : `Livraison ${o.orderNumber}`
            ) : null;

            const activeRoute = isPickedUp ? routeToDelivery : routeToPickup;

            return (
              <div key={o.id} className="bg-card rounded-2xl border-2 border-primary/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground">{o.orderNumber}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {ORDER_STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${isPickedUp ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                      <div className="w-0.5 h-6 bg-border" />
                      <div className={`w-3 h-3 rounded-full ${isPickedUp ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground font-bold">RECUPERATION</p>
                        <p className="text-sm font-bold text-foreground">{o.vendorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold">
                          {o.deliveryType === 'relay_point' ? 'DEPOT RELAIS' : 'LIVRAISON'}
                        </p>
                        <p className="text-sm font-bold text-foreground">{o.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {activeRoute && (
                  <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">
                        {isPickedUp ? 'Vers destination' : 'Vers recuperation'}
                      </span>
                      <span className="text-sm font-black text-primary">{activeRoute.distanceKm} km - ~{activeRoute.estimatedMinutes} min</span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={activeRoute.wazeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-sky-500 text-white rounded-lg font-bold text-xs text-center flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        Waze
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={activeRoute.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs text-center flex items-center justify-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://wa.me/?text=${activeRoute.whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs text-center flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {o.requiresColdChain && (
                  <div className="flex items-center gap-2 p-2 bg-sky-50 rounded-lg border border-sky-200">
                    <Snowflake className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-sky-700">Chaine du froid - Maintenir au frais</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {!isPickedUp && (
                    <button
                      onClick={() => driverPickUp(o.id)}
                      className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Colis recupere
                    </button>
                  )}
                  {isPickedUp && o.deliveryType === 'relay_point' && (
                    <button
                      onClick={() => driverDeliverToRelay(o.id)}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Depose au relais
                    </button>
                  )}
                  {isPickedUp && o.deliveryType !== 'relay_point' && (
                    <button
                      onClick={() => driverDeliver(o.id)}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Livre au client
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'earnings' && driver && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-black text-foreground">Gains du jour</h3>
            </div>
            <div className="text-4xl font-black text-primary">{driver.todayEarnings.toFixed(2)} EUR</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="text-lg font-black">{completedByMe.length}</div>
                <div className="text-xs text-muted-foreground">Courses faites</div>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="text-lg font-black">{completedByMe.length > 0 ? (driver.todayEarnings / completedByMe.length).toFixed(2) : '0.00'} EUR</div>
                <div className="text-xs text-muted-foreground">Moy / course</div>
              </div>
            </div>
          </div>

          {completedByMe.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Historique</h3>
              <div className="space-y-2">
                {completedByMe.map(o => (
                  <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-sm text-foreground">{o.orderNumber}</span>
                        <span className="text-xs text-muted-foreground ml-2">{o.vendorName}</span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-emerald-600">+{(o.deliveryFee * 0.7).toFixed(2)} EUR</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
