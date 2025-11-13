import { useEffect, useState } from 'react';
import { X, Check, Clock, Bike, Package, MapPin } from 'lucide-react';
import { supabase, Order, Delivery } from '../lib/supabase';

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

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            setDelivery(payload.new as Delivery);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);

    const [orderResult, deliveryResult] = await Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase.from('deliveries').select('*').eq('order_id', orderId).maybeSingle(),
    ]);

    if (orderResult.data) setOrder(orderResult.data);
    if (deliveryResult.data) setDelivery(deliveryResult.data);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Suivi de commande
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-start mb-8 last:mb-0">
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-16 -ml-px transition-colors ${
                        isCompleted ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-200 dark:ring-emerald-900' : ''}`}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>

                  <div className="ml-4 flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && delivery && step.key === 'in_delivery' && (
                      <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                        <div className="flex items-center text-sm text-emerald-700 dark:text-emerald-400">
                          <Bike size={16} className="mr-2" />
                          <span>En route vers vous</span>
                        </div>
                        {delivery.estimated_time && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                            Temps estimé : {delivery.estimated_time} min
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {order.delivery_type === 'home_delivery' && order.delivery_address && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin size={20} className="text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Adresse de livraison</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {order.delivery_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Note</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{order.notes}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {order.total_amount.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
