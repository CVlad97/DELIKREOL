import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, MapPin, Home, Store, Package, Snowflake, ChevronRight, CheckCircle2, Clock, Truck } from 'lucide-react';
import { useSimulation } from './SimulationContext';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS } from './data';
import type { SimDeliveryType } from './types';

export function ClientView() {
  const {
    vendors, products, cart, orders, relayPoints,
    addToCart, removeFromCart, updateCartQty, cartTotal, cartCount,
    placeOrder, clientPickUpFromRelay,
  } = useSimulation();

  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryType, setDeliveryType] = useState<SimDeliveryType>('home_delivery');
  const [address, setAddress] = useState('Rue de la Liberte, Fort-de-France');
  const [selectedRelay, setSelectedRelay] = useState('');
  const [tab, setTab] = useState<'shop' | 'orders'>('shop');

  const filteredProducts = selectedVendor
    ? products.filter(p => p.vendorId === selectedVendor && p.available)
    : products.filter(p => p.available);

  const clientOrders = orders.filter(o => o.status !== 'delivered').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const handlePlaceOrder = () => {
    if (cartCount === 0) return;
    const addr = deliveryType === 'relay_point'
      ? relayPoints.find(r => r.id === selectedRelay)?.name || 'Point relais'
      : deliveryType === 'pickup'
        ? vendors.find(v => v.id === cart[0]?.product.vendorId)?.address || 'Sur place'
        : address;
    placeOrder(deliveryType, addr, deliveryType === 'relay_point' ? selectedRelay : undefined);
    setShowCheckout(false);
    setShowCart(false);
    setTab('orders');
  };

  const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered'];
  const relayStatusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'at_relay', 'delivered'];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('shop')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${tab === 'shop' ? 'bg-primary text-primary-foreground shadow-elegant' : 'bg-muted text-muted-foreground'}`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Boutique
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all relative ${tab === 'orders' ? 'bg-primary text-primary-foreground shadow-elegant' : 'bg-muted text-muted-foreground'}`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Commandes
          {clientOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {clientOrders.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'shop' && (
        <>
          <div className="bg-primary rounded-3xl p-6 text-primary-foreground">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Simulation Client</p>
            <h2 className="text-2xl font-black tracking-tight">Passez une commande test</h2>
            <p className="text-sm opacity-80 mt-1">Selectionnez des produits et suivez le parcours complet</p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Vendeurs</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedVendor(null)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${!selectedVendor ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
              >
                Tous
              </button>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(p => {
              const inCart = cart.find(c => c.product.id === p.id);
              return (
                <div key={p.id} className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col">
                  <div className="w-full h-20 bg-muted rounded-xl mb-3 flex items-center justify-center text-3xl">
                    {p.imageEmoji}
                  </div>
                  <h4 className="font-bold text-foreground text-sm leading-tight">{p.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.vendorName}</p>
                  {p.requiresColdChain && (
                    <div className="flex items-center gap-1 mt-1">
                      <Snowflake className="w-3 h-3 text-sky-500" />
                      <span className="text-[10px] text-sky-600 font-bold">Produit frais</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-primary font-black text-sm">{p.price.toFixed(2)} EUR</span>
                    {inCart ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateCartQty(p.id, inCart.quantity - 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-black w-5 text-center">{inCart.quantity}</span>
                        <button onClick={() => addToCart(p)} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {cartCount > 0 && !showCart && (
            <button
              onClick={() => setShowCart(true)}
              className="sticky bottom-4 w-full py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-3 shadow-elegant hover:scale-[1.02] transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Voir le panier ({cartCount}) - {cartTotal.toFixed(2)} EUR
            </button>
          )}

          {showCart && (
            <div className="bg-card rounded-3xl border-2 border-primary/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-foreground">Panier</h3>
                <button onClick={() => setShowCart(false)} className="text-muted-foreground text-sm font-bold">Fermer</button>
              </div>
              {cart.map(c => (
                <div key={c.product.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.product.imageEmoji}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">{c.product.name}</p>
                      <p className="text-xs text-muted-foreground">{c.product.price.toFixed(2)} EUR x {c.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground text-sm">{(c.product.price * c.quantity).toFixed(2)} EUR</span>
                    <button onClick={() => removeFromCart(c.product.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-muted-foreground">Total articles</span>
                <span className="text-xl font-black text-foreground">{cartTotal.toFixed(2)} EUR</span>
              </div>
              <button
                onClick={() => { setShowCheckout(true); setShowCart(false); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg hover:shadow-elegant transition-all active:scale-95"
              >
                Commander
              </button>
            </div>
          )}

          {showCheckout && (
            <div className="bg-card rounded-3xl border-2 border-primary/20 p-6 space-y-5">
              <h3 className="text-lg font-black text-foreground">Finaliser la commande</h3>

              <div className="space-y-3">
                <p className="text-sm font-bold text-muted-foreground">Mode de livraison</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'home_delivery' as SimDeliveryType, icon: Home, label: 'Domicile', fee: '3.50 EUR' },
                    { type: 'relay_point' as SimDeliveryType, icon: MapPin, label: 'Relais', fee: '1.50 EUR' },
                    { type: 'pickup' as SimDeliveryType, icon: Store, label: 'Retrait', fee: 'Gratuit' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => setDeliveryType(opt.type)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${deliveryType === opt.type ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <opt.icon className={`w-5 h-5 mx-auto mb-1 ${deliveryType === opt.type ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.fee}</p>
                    </button>
                  ))}
                </div>
              </div>

              {deliveryType === 'home_delivery' && (
                <div>
                  <label className="text-sm font-bold text-muted-foreground block mb-1">Adresse de livraison</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm"
                    placeholder="Votre adresse..."
                  />
                </div>
              )}

              {deliveryType === 'relay_point' && (
                <div>
                  <label className="text-sm font-bold text-muted-foreground block mb-2">Choisir un point relais</label>
                  <div className="space-y-2">
                    {relayPoints.filter(r => r.active).map(r => {
                      const load = r.capacities.reduce((s, c) => s + c.used, 0);
                      const cap = r.capacities.reduce((s, c) => s + c.total, 0);
                      const pct = Math.round((load / cap) * 100);
                      const hasCold = r.capacities.some(c => c.storageType === 'cold' && c.used < c.total);
                      const needsCold = cart.some(c => c.product.requiresColdChain);
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRelay(r.id)}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${selectedRelay === r.id ? 'border-primary bg-primary/5' : 'border-border'} ${needsCold && !hasCold ? 'opacity-50' : ''}`}
                          disabled={needsCold && !hasCold}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-foreground">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.address}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Ouvert: {r.openHours}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct > 80 ? 'bg-red-100 text-red-700' : pct > 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {pct}%
                              </span>
                              {needsCold && !hasCold && <p className="text-[10px] text-red-500 font-bold mt-1">Pas de froid dispo</p>}
                              {hasCold && <p className="text-[10px] text-sky-500 font-bold mt-1">Froid disponible</p>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {cart.some(c => c.product.requiresColdChain) && (
                <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <Snowflake className="w-5 h-5 text-sky-500 flex-shrink-0" />
                  <p className="text-xs text-sky-700 font-bold">Produits frais - Chaine du froid assuree</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Articles ({cartCount})</span>
                  <span className="font-bold">{cartTotal.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-bold">{deliveryType === 'home_delivery' ? '3.50' : deliveryType === 'relay_point' ? '1.50' : '0.00'} EUR</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span className="font-black">Total</span>
                  <span className="font-black text-primary">{(cartTotal + (deliveryType === 'home_delivery' ? 3.50 : deliveryType === 'relay_point' ? 1.50 : 0)).toFixed(2)} EUR</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-sm"
                >
                  Retour
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-black text-sm hover:shadow-elegant transition-all active:scale-95"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="space-y-6">
          {clientOrders.length === 0 && deliveredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold">Aucune commande</p>
              <p className="text-sm">Passez une commande depuis la boutique</p>
            </div>
          )}

          {clientOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">En cours</h3>
              <div className="space-y-4">
                {clientOrders.map(o => {
                  const steps = o.deliveryType === 'relay_point' ? relayStatusSteps : statusSteps;
                  const currentIdx = steps.indexOf(o.status);
                  return (
                    <div key={o.id} className="bg-card rounded-2xl border-2 border-primary/20 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-foreground">{o.orderNumber}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ORDER_STATUS_COLORS[o.status] || ''}`}>
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {steps.map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentIdx ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2"><Store className="w-3 h-3" />{o.vendorName}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{o.deliveryAddress}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3 h-3" />{DELIVERY_TYPE_LABELS[o.deliveryType]}</div>
                        {o.requiresColdChain && <div className="flex items-center gap-2"><Snowflake className="w-3 h-3 text-sky-500" /><span className="text-sky-600 font-bold">Chaine du froid</span></div>}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-sm text-muted-foreground">{o.items.length} article(s)</span>
                        <span className="font-black text-foreground">{o.totalAmount.toFixed(2)} EUR</span>
                      </div>
                      {o.status === 'at_relay' && (
                        <button
                          onClick={() => clientPickUpFromRelay(o.id)}
                          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm active:scale-95 transition-all"
                        >
                          Confirmer le retrait au relais
                        </button>
                      )}
                      {o.assignedDriverId && o.status !== 'at_relay' && (
                        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
                          <Truck className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-primary">
                            Livreur assigne : {o.assignedDriverId ? 'En route' : 'En attente'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {deliveredOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Livrees</h3>
              <div className="space-y-2">
                {deliveredOrders.map(o => (
                  <div key={o.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-bold text-foreground text-sm">{o.orderNumber}</span>
                        <span className="text-xs text-muted-foreground ml-2">{o.vendorName}</span>
                      </div>
                    </div>
                    <span className="font-black text-foreground text-sm">{o.totalAmount.toFixed(2)} EUR</span>
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
