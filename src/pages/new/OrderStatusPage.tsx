import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { CheckCircle2, Clock, Package, Truck, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';

export default function OrderStatusPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    document.title = orderId ? `Commande ${orderId} — DeliKreol` : 'Suivi de commande — DeliKreol';
    try {
      const saved = JSON.parse(localStorage.getItem('delikreol_local_orders_v1') || '[]');
      const found = saved.find((o: any) => o.id === orderId);
      if (found) setOrder(found);
    } catch { /* empty */ }
  }, [orderId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      {orderId ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h1 className="text-xl font-black text-gray-900">Commande enregistrée</h1>
            <p className="text-sm text-gray-500 mt-1">Référence : <span className="font-bold text-orange-600">{orderId}</span></p>
          </div>

          {order && (
            <div className="space-y-3 text-sm mb-6">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total estimé</span>
                <span className="text-orange-600">{order.total?.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {order?.commune && <p className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3 h-3" />{order.commune}</p>}
            {order?.mode && <p className="flex items-center gap-2 text-xs text-gray-500"><Package className="w-3 h-3" />{order.mode === 'retrait' ? 'Retrait' : order.mode === 'relais' ? 'Point relais' : 'Livraison'}</p>}
            {order?.creneaux && <p className="flex items-center gap-2 text-xs text-gray-500"><Clock className="w-3 h-3" />{order.creneaux}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">Votre demande n'est pas encore confirmée</p>
            <p className="text-xs text-amber-700">Elle sera validée par WhatsApp. Nous vous contacterons sur ce numéro.</p>
          </div>

          <a
            href={`https://wa.me/596696653589?text=${encodeURIComponent(`Bonjour, j'ai besoin d'aide pour ma commande ${orderId}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-sm"
          >
            <MessageCircle className="w-4 h-4" fill="white" /> Contacter le support
          </a>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-black text-gray-900 mb-2">Suivi de commande</h1>
          <p className="text-sm text-gray-500 mb-4">Entrez votre numéro de commande pour suivre son statut.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm">
            Retour à l'accueil
          </Link>
        </div>
      )}
    </div>
  );
}