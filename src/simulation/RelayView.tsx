import { useState } from 'react';
import { MapPin, Package, Snowflake, Thermometer, AlertTriangle, CheckCircle, Clock, BarChart3, Box } from 'lucide-react';
import { useSimulation } from './SimulationContext';
import { STORAGE_LABELS, STORAGE_COLORS, ORDER_STATUS_LABELS } from './data';

export function RelayView() {
  const { relayPoints, orders, getRelayLoad, notifications } = useSimulation();
  const [selectedRelay, setSelectedRelay] = useState(relayPoints[0]?.id || '');

  const relay = relayPoints.find(r => r.id === selectedRelay);
  const relayOrders = orders.filter(o => o.assignedRelayId === selectedRelay);
  const waitingOrders = relayOrders.filter(o => o.status === 'at_relay');
  const incomingOrders = relayOrders.filter(o => ['ready', 'picked_up', 'in_transit'].includes(o.status));
  const completedOrders = relayOrders.filter(o => o.status === 'delivered');
  const load = relay ? getRelayLoad(relay.id) : { totalUsed: 0, totalCapacity: 0, pct: 0 };
  const relayNotifs = notifications.filter(n => n.role === 'relay').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {relayPoints.filter(r => r.active).map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedRelay(r.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedRelay === r.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {relay && (
        <>
          <div className="bg-accent rounded-3xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">{relay.name}</h2>
                <p className="text-xs opacity-80">{relay.address} - {relay.openHours}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{relay.depositsWaiting}</div>
                <div className="text-[10px] opacity-70">En attente</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{relay.todayPickups}</div>
                <div className="text-[10px] opacity-70">Retraits</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className={`text-2xl font-black ${load.pct > 80 ? 'text-red-300' : ''}`}>{load.pct}%</div>
                <div className="text-[10px] opacity-70">Rempli</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Capacite de stockage
            </h3>
            <div className="space-y-3">
              {relay.capacities.map((cap, i) => {
                const pct = cap.total > 0 ? Math.round((cap.used / cap.total) * 100) : 0;
                const isFull = pct >= 90;
                const isHigh = pct >= 70;
                return (
                  <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cap.storageType === 'cold' && <Snowflake className="w-4 h-4 text-sky-500" />}
                        {cap.storageType === 'frozen' && <Snowflake className="w-4 h-4 text-blue-500" />}
                        {cap.storageType === 'ambient' && <Box className="w-4 h-4 text-emerald-500" />}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STORAGE_COLORS[cap.storageType]}`}>
                          {STORAGE_LABELS[cap.storageType]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">{cap.temperatureRange}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{cap.used} / {cap.total} emplacements</span>
                        <span className={`font-black ${isFull ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {isFull && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs font-bold">Stockage presque plein - Refuser les depots !</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {load.pct >= 80 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-red-700">Capacite critique ({load.pct}%)</p>
                  <p className="text-xs text-red-600">Prevenir les livreurs - Limiter les depots</p>
                </div>
              </div>
            )}
          </div>

          {relayNotifs.length > 0 && (
            <div className="space-y-2">
              {relayNotifs.slice(0, 3).map(n => (
                <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold">{n.message}</span>
                </div>
              ))}
            </div>
          )}

          {incomingOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                En approche ({incomingOrders.length})
              </h3>
              <div className="space-y-3">
                {incomingOrders.map(o => (
                  <div key={o.id} className="bg-card rounded-2xl border border-amber-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{o.orderNumber}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Vendeur: {o.vendorName}</div>
                      <div>Articles: {o.items.length} - {o.items.map(i => i.name).join(', ')}</div>
                    </div>
                    {o.requiresColdChain && (
                      <div className="flex items-center gap-1 text-sky-600">
                        <Snowflake className="w-3 h-3" />
                        <span className="text-xs font-bold">Produit frais - Stockage froid requis</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {waitingOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                En stock ({waitingOrders.length})
              </h3>
              <div className="space-y-3">
                {waitingOrders.map(o => (
                  <div key={o.id} className="bg-card rounded-2xl border border-emerald-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{o.orderNumber}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Au relais
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Client: {o.customerName}</div>
                      <div>Articles: {o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
                    </div>
                    {o.requiresColdChain && (
                      <div className="flex items-center gap-2 p-2 bg-sky-50 rounded-lg border border-sky-200">
                        <Snowflake className="w-4 h-4 text-sky-500" />
                        <div>
                          <span className="text-xs font-bold text-sky-700">Stockage froid actif</span>
                          <span className="text-[10px] text-sky-600 ml-2">Retrait prioritaire recommande</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-sm font-bold text-foreground">{o.totalAmount.toFixed(2)} EUR</span>
                      <span className="text-xs text-muted-foreground">En attente du client</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Retires ({completedOrders.length})</h3>
              <div className="space-y-2">
                {completedOrders.map(o => (
                  <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-sm text-foreground">{o.orderNumber}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{o.customerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relayOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold">Aucun colis</p>
              <p className="text-sm">Les colis en point relais apparaitront ici</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
