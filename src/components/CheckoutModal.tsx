import { useMemo, useState } from 'react';
import { Landmark, MessageCircle, X, MapPin, Store, Package, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersService } from '../services/ordersService';
import { shouldFallbackToDemo } from '../utils/supabaseFallback';
import { createConnectPaymentIntent } from '../utils/stripe';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMode = 'bank_transfer' | 'whatsapp' | 'stripe';

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'pickup'>('home_delivery');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stripe Connect : détection si le traiteur a un compte Connect
  const vendor = items[0]?.vendor;
  const hasStripeConnect = !!vendor?.stripe_connect_account_id;
  const vendorStripeAccountId = vendor?.stripe_connect_account_id ?? undefined;

  const deliveryFee = deliveryType === 'home_delivery' ? 5.0 : 0;
  const finalTotal = total + deliveryFee;
  const commissionDelikreol = total * 0.2;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
  const bankPaymentUrl = (import.meta.env.VITE_BANK_PAYMENT_URL as string | undefined) || '';
  const bankPaymentIban = (import.meta.env.VITE_BANK_IBAN as string | undefined) || '';
  const bankPaymentBic = (import.meta.env.VITE_BANK_BIC as string | undefined) || '';
  const bankPaymentLabel = (import.meta.env.VITE_BANK_PAYMENT_LABEL as string | undefined) || 'Virement / lien bancaire';

  const paymentOptions = useMemo(() => {
    const options: Array<{
      id: PaymentMode;
      title: string;
      subtitle: string;
      icon: React.ComponentType<{ size?: number }>;
    }> = [
      {
        id: 'bank_transfer',
        title: bankPaymentLabel,
        subtitle: bankPaymentUrl
          ? 'Ouvrir le lien bancaire (si disponible)'
          : 'Virement bancaire (IBAN/BIC) sur demande',
        icon: Landmark,
      },
      {
        id: 'whatsapp',
        title: 'Assistance WhatsApp',
        subtitle: 'Confirmation humaine et accompagnement client',
        icon: MessageCircle,
      },
    ];

    // Ajouter Stripe si le traiteur a un compte Connect
    if (hasStripeConnect) {
      options.unshift({
        id: 'stripe',
        title: 'Carte bancaire (Stripe)',
        subtitle: 'Paiement sécurisé par Stripe — votre plat, votre traiteur, votre livraison',
        icon: CreditCard,
      });
    }

    return options;
  }, [bankPaymentLabel, bankPaymentUrl, hasStripeConnect]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (deliveryType === 'home_delivery' && !address.trim()) {
      setError('Veuillez saisir votre adresse de livraison');
      return;
    }

    setLoading(true);
    setError('');

    const paymentLabel = paymentOptions.find((option) => option.id === paymentMode)?.title ?? 'WhatsApp';

    try {
      const orderNumber = `DK${Date.now().toString().slice(-8)}`;

      // Traitement Stripe Connect
      let stripePaymentInfo = '';
      if (paymentMode === 'stripe' && hasStripeConnect && vendorStripeAccountId) {
        const clientSecret = await createConnectPaymentIntent(
          finalTotal,
          orderNumber,
          vendorStripeAccountId,
        );
        if (clientSecret) {
          stripePaymentInfo = `Paiement Stripe initie (clientSecret: ${clientSecret.slice(0, 8)}...)`;
        } else {
          stripePaymentInfo = 'Paiement Stripe : echec de l initialisation, contactez le service client.';
        }
      }

      const paymentNotes = [
        `Mode de paiement souhaite: ${paymentLabel}`,
        stripePaymentInfo,
        `Assistance WhatsApp: https://wa.me/${whatsappNumber}`,
        bankPaymentUrl ? `Lien bancaire: ${bankPaymentUrl}` : '',
        bankPaymentIban ? `IBAN: ${bankPaymentIban}` : '',
        bankPaymentBic ? `BIC: ${bankPaymentBic}` : '',
        'Paiement final confirme avant preparation.',
      ]
        .filter(Boolean)
        .join('\n');

      const orderItems = items.map((item) => ({
        product_id: item.id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        vendor_commission: item.price * item.quantity * 0.2,
      }));

      await ordersService.create({
        customer_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'home_delivery' ? address : undefined,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        notes: [notes.trim(), paymentNotes].filter(Boolean).join('\n\n') || undefined,
        items: orderItems,
      });

      clearCart();
      alert(`Commande ${orderNumber} passée avec succès. Mode de paiement: ${paymentLabel}.`);
      onClose();
    } catch (err: any) {
      console.error('Error creating order:', err);
      // Si Supabase est en pause / indisponible, on ne bloque pas le client:
      // on garde le panier et on bascule vers une confirmation WhatsApp.
      if (shouldFallbackToDemo(err)) {
        const waText = [
          `Bonjour DELIKREOL, je souhaite confirmer une commande (${finalTotal.toFixed(2)} €).`,
          '',
          `Livraison: ${deliveryType === 'home_delivery' ? `domicile (${address || 'adresse à préciser'})` : 'retrait'}`,
          '',
          'Panier:',
          ...items.map((i) => `- ${i.name} x${i.quantity} (${(i.price * i.quantity).toFixed(2)} €)`),
          '',
          notes.trim() ? `Note: ${notes.trim()}` : '',
          '',
          `Paiement souhaité: ${paymentLabel}`,
        ]
          .filter(Boolean)
          .join('\n');
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
        setError("Backend indisponible: utilisez WhatsApp pour valider la commande (panier conservé).");
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        return;
      }
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

          <div>
            <h3 className="font-bold text-lg mb-3">Paiement</h3>
            <p className="text-sm text-gray-600 mb-3">
              Choisissez le mode le plus simple. La commande est confirmée avant préparation.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const active = paymentMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMode(option.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      active ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl p-2 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{option.title}</p>
                        <p className="text-sm text-gray-600">{option.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              La commande est enregistrée avec le mode choisi et peut être confirmée sur WhatsApp si besoin.
            </div>
            {hasStripeConnect && paymentMode === 'stripe' && (
              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2">
                <CreditCard size={14} />
                Paiement sécurisé par Stripe — votre plat, votre traiteur, votre livraison
              </div>
            )}
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
              <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Commission Delikreol (incluse)</span>
              <span>{commissionDelikreol.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span>{deliveryFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
              <span>Total</span>
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
            {loading ? 'Traitement...' : `Enregistrer la commande ${finalTotal.toFixed(2)} €`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            En passant commande, vous acceptez nos conditions générales de vente
          </p>
        </form>
      </div>
    </div>
  );
}