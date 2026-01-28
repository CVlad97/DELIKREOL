import { useEffect, useState } from 'react';
import { X, Check, Clock, Bike, Package, MapPin } from 'lucide-react';
import { blink } from '../lib/blink';
import { Order, Delivery } from '../types';

interface OrderTrackingProps {
  orderId: string;
  onClose: () => void;
}

const statusSteps = [
  { key: 'pending', label: 'Commande reçue', icon: Clock },
  { key: 'confirmed', label: 'Confirmée', icon: Check },
  { key: 'preparing', label: 'En préparation', icon: Package },
  { key: 'in_delivery', label: 'En livraison', icon: Bike },
  { key: 'delivered', label: 'Livrée', icon: MapPin },
];

export function OrderTracking({ orderId, onClose }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const orderData = await blink.db.orders.get(orderId) as Order | null;
      const deliveryData = (await blink.db.deliveries.list({ where: { orderId } }))[0] as Delivery | null;

      if (orderData) setOrder(orderData);
      if (deliveryData) setDelivery(deliveryData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Localisation du colis...</p>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="bg-card w-full rounded-[2.5rem] flex flex-col animate-fadeIn">
      <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Suivi Direct</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">#{order.order_number}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="p-10 space-y-10">
        <div className="relative space-y-8">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex items-start group">
                <div className="flex flex-col items-center mr-6">
                  <div
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground shadow-elegant'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'scale-110 ring-4 ring-primary/10' : ''}`}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-1 h-12 -mb-8 mt-2 rounded-full transition-colors duration-500 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 pt-3">
                  <p
                    className={`text-lg font-black uppercase tracking-tight transition-colors ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && delivery && step.key === 'in_delivery' && (
                    <div className="mt-4 bg-accent/10 rounded-2xl p-4 border border-accent/20 animate-pulse">
                      <div className="flex items-center text-accent">
                        <Bike size={18} className="mr-2" />
                        <span className="font-black text-xs uppercase tracking-widest">Livreur en approche</span>
                      </div>
                      {delivery.estimated_time && (
                        <p className="text-sm font-bold mt-1">~ {delivery.estimated_time} minutes</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {order.delivery_type === 'home_delivery' && order.delivery_address && (
            <div className="bg-muted p-6 rounded-3xl border border-border flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm text-secondary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destination</p>
                <p className="text-sm font-bold text-foreground leading-tight mt-1">{order.delivery_address}</p>
              </div>
            </div>
          )}

          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Réglé</span>
            <span className="text-xl font-black text-primary tracking-tighter">{order.total_amount.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
