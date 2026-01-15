import { useState } from 'react';
import { X, MapPin, Store, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Configurable VAT rate (8.5% for Martinique)
const VAT_RATE = 0.085;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'pickup'>('home_delivery');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = deliveryType === 'home_delivery' ? 5.0 : 0;
  const subtotalHT = total + deliveryFee; // HT = before tax
  const vat = subtotalHT * VAT_RATE; // Calculate VAT (8.5%)
  const finalTotal = subtotalHT + vat; // TTC = Total with tax

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (deliveryType === 'home_delivery' && !address.trim()) {
      setError('Veuillez saisir votre adresse de livraison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderNumber = `DK${Date.now().toString().slice(-8)}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'home_delivery' ? address : null,
          delivery_fee: deliveryFee,
          total_amount: finalTotal,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        vendor_commission: (item.price * item.quantity * 0.2),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      alert(`Commande ${orderNumber} passée avec succès !`);
      onClose();
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Finaliser la commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-3">Type de livraison</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('home_delivery')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  deliveryType === 'home_delivery'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="mx-auto mb-2 text-emerald-600" size={32} />
                <p className="font-medium">Livraison</p>
                <p className="text-sm text-gray-600">À domicile</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Store className="mx-auto mb-2 text-emerald-600" size={32} />
                <p className="font-medium">Retrait</p>
                <p className="text-sm text-gray-600">Sur place</p>
              </button>
            </div>
          </div>

          {deliveryType === 'home_delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse de livraison *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: 12 Rue Victor Hugo, Fort-de-France"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Informations supplémentaires pour votre commande..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <Package className="mr-2 text-emerald-600" size={20} />
              Récapitulatif
            </h3>
            <div className="flex justify-between text-gray-600">
              <span>Articles ({items.length})</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span>{deliveryFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 py-2 border-t border-gray-300">
              <span>Sous-total HT</span>
              <span>{subtotalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (8,5%)</span>
              <span className="font-semibold">{vat.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
              <span>Total TTC</span>
              <span>{finalTotal.toFixed(2)} €</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Traitement...' : `Confirmer et payer ${finalTotal.toFixed(2)} €`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            En passant commande, vous acceptez nos conditions générales de vente
          </p>
        </form>
      </div>
    </div>
  );
}
