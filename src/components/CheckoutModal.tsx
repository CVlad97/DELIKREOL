import { useMemo, useState } from'react';
import {
 CheckCircle,
 Landmark,
 MapPin,
 MessageCircle,
 Package,
 Store,
 X,
} from'lucide-react';
import { useCart } from'../contexts/CartContext';
import { useAuth } from'../contexts/AuthContext';
import { ordersService } from'../services/ordersService';
import { shouldFallbackToDemo } from'../utils/supabaseFallback';
import { Order } from'../types';

interface CheckoutModalProps {
 isOpen: boolean;
 onClose: () => void;
 onOrderCreated?: (order: Order) => void;
}

type PaymentMode ='bank_transfer' |'whatsapp';

interface SuccessState {
 orderNumber: string;
 paymentLabel: string;
 whatsappUrl: string;
 bankPaymentUrl?: string;
}

function errorMessage(error: unknown) {
 return error instanceof Error ? error.message :'Erreur inconnue';
}

export function CheckoutModal({ isOpen, onClose, onOrderCreated }: CheckoutModalProps) {
 const { items, total, clearCart } = useCart();
 const { user } = useAuth();
 const [deliveryType, setDeliveryType] = useState<'home_delivery' |'pickup'>('home_delivery');
 const [address, setAddress] = useState('');
 const [notes, setNotes] = useState('');
 const [paymentMode, setPaymentMode] = useState<PaymentMode>('whatsapp');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [fallbackWhatsappUrl, setFallbackWhatsappUrl] = useState('');
 const [success, setSuccess] = useState<SuccessState | null>(null);

 const deliveryFee = deliveryType ==='home_delivery' ? 5 : 0;
 const finalTotal = total + deliveryFee;
 const commissionDelikreol = total * 0.2;
 const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ||'596696653589';
 const bankPaymentUrl = (import.meta.env.VITE_EXTERNAL_PAYMENT_URL as string | undefined) ||'';
 const bankPaymentIban = (import.meta.env.VITE_QONTO_IBAN as string | undefined) ||'';
 const bankPaymentBic = (import.meta.env.VITE_QONTO_BIC as string | undefined) ||'';
 const bankPaymentLabel =
 (import.meta.env.VITE_QONTO_ACCOUNT_NAME as string | undefined) ||'Virement Qonto';

 const paymentOptions = useMemo(() => {
 const options: Array<{
 id: PaymentMode;
 title: string;
 subtitle: string;
 icon: React.ElementType;
 }> = [
 {
 id:'bank_transfer',
 title: bankPaymentLabel,
 subtitle: bankPaymentUrl
 ?'Ouvrir le lien bancaire après la commande'
 :'Virement bancaire (IBAN/BIC) sur demande',
 icon: Landmark,
 },
 {
 id:'whatsapp',
 title:'Assistance WhatsApp',
 subtitle:'Confirmation humaine et accompagnement client',
 icon: MessageCircle,
 },
 ];

 return options;
 }, [bankPaymentLabel, bankPaymentUrl]);

 if (!isOpen) return null;

 const handleClose = () => {
 setSuccess(null);
 setFallbackWhatsappUrl('');
 setError('');
 onClose();
 };

 const buildWhatsappUrl = (orderNumber: string, paymentLabel: string) => {
 const waText = [
 `Bonjour DELIKREOL, je souhaite confirmer la commande ${orderNumber} (${finalTotal.toFixed(2)} €).`,'',
 `Livraison: ${
 deliveryType ==='home_delivery' ? `domicile (${address ||'adresse à préciser'})` :'retrait'
 }`,'','Panier:',
 ...items.map(
 (item) => `- ${item.name} x${item.quantity} (${(item.price * item.quantity).toFixed(2)} €)`,
 ),'',
 notes.trim() ? `Note: ${notes.trim()}` :'','',
 `Paiement souhaité: ${paymentLabel}`,
 ]
 .filter(Boolean)
 .join('\n');

 return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
 };

 const handleSubmit = async (event: React.FormEvent) => {
 event.preventDefault();
 if (!user) return;

 if (deliveryType ==='home_delivery' && !address.trim()) {
 setError('Veuillez saisir votre adresse de livraison');
 return;
 }

 setLoading(true);
 setError('');
 setFallbackWhatsappUrl('');

 const paymentLabel =
 paymentOptions.find((option) => option.id === paymentMode)?.title ??'Assistance WhatsApp';
 const orderNumber = `DK${Date.now().toString().slice(-8)}`;
 const whatsappUrl = buildWhatsappUrl(orderNumber, paymentLabel);

 try {
 const paymentNotes = [
 `Mode de paiement souhaité: ${paymentLabel}`,
 `Assistance WhatsApp: https://wa.me/${whatsappNumber}`,
 bankPaymentUrl ? `Lien bancaire: ${bankPaymentUrl}` :'',
 bankPaymentIban ? `IBAN: ${bankPaymentIban}` :'',
 bankPaymentBic ? `BIC: ${bankPaymentBic}` :'','Préparation uniquement après confirmation du paiement ou validation humaine.',
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

 const createdOrder = await ordersService.create({
 customer_id: user.id,
 order_number: orderNumber,
 status:'pending',
 delivery_type: deliveryType,
 delivery_address: deliveryType ==='home_delivery' ? address.trim() : undefined,
 delivery_fee: deliveryFee,
 total_amount: finalTotal,
 notes: [notes.trim(), paymentNotes].filter(Boolean).join('\n\n') || undefined,
 items: orderItems,
 });

 onOrderCreated?.(createdOrder);

 clearCart();
 setSuccess({
 orderNumber,
 paymentLabel,
 whatsappUrl,
 bankPaymentUrl: bankPaymentUrl || undefined,
 });

 if (paymentMode ==='whatsapp') {
 window.open(whatsappUrl,'_blank','noopener,noreferrer');
 }
 } catch (submitError) {
 console.error('Error creating order:', submitError);
 if (shouldFallbackToDemo(submitError)) {
 const fallbackUrl = buildWhatsappUrl('non enregistrée', paymentLabel);
 setFallbackWhatsappUrl(fallbackUrl);
 setError('Backend indisponible : utilisez WhatsApp pour valider la commande (panier conservé).');
 window.open(fallbackUrl,'_blank','noopener,noreferrer');
 return;
 }
 setError(`Erreur lors de la création de la commande : ${errorMessage(submitError)}`);
 } finally {
 setLoading(false);
 }
 };

 if (success) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 <div className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="rounded-2xl bg-success/10 p-3 text-success">
 <CheckCircle size={28} />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-widest text-success">
 Commande enregistrée
 </p>
 <h2 className="text-2xl font-bold text-foreground">#{success.orderNumber}</h2>
 </div>
 </div>
 <button type="button" onClick={handleClose} className="text-muted-foreground hover:text-muted-foreground">
 <X size={24} />
 </button>
 </div>

 <div className="rounded-xl border border-success/25 bg-success/10 p-4 text-sm text-success">
 Mode choisi : <strong>{success.paymentLabel}</strong>.
 </div>

 <div className="grid gap-3">
 <a
 href={success.whatsappUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
 >
 <MessageCircle size={18} />
 Confirmer sur WhatsApp
 </a>
 {success.bankPaymentUrl && (
 <a
 href={success.bankPaymentUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 rounded-xl border border-input px-4 py-3 font-semibold text-foreground hover:bg-muted"
 >
 <Landmark size={18} />
 Ouvrir le lien bancaire
 </a>
 )}
 <button
 type="button"
 onClick={handleClose}
 className="rounded-xl border border-input px-4 py-3 font-semibold text-foreground hover:bg-muted"
 >
 Voir mes commandes
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
 <div className="sticky top-0 flex items-center justify-between border-b border-input bg-white p-6">
 <h2 className="text-2xl font-bold text-foreground">Finaliser la commande</h2>
 <button type="button" onClick={handleClose} className="text-muted-foreground hover:text-muted-foreground">
 <X size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6 p-6">
 <section>
 <h3 className="mb-3 text-lg font-bold">Type de livraison</h3>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setDeliveryType('home_delivery')}
 className={`rounded-lg border-2 p-4 transition-all ${
 deliveryType ==='home_delivery'
 ?'border-success bg-success/10'
 :'border-input hover:border-input'
 }`}
 >
 <MapPin className="mx-auto mb-2 text-success" size={32} />
 <p className="font-medium">Livraison</p>
 <p className="text-sm text-muted-foreground">À domicile</p>
 </button>
 <button
 type="button"
 onClick={() => setDeliveryType('pickup')}
 className={`rounded-lg border-2 p-4 transition-all ${
 deliveryType ==='pickup'
 ?'border-success bg-success/10'
 :'border-input hover:border-input'
 }`}
 >
 <Store className="mx-auto mb-2 text-success" size={32} />
 <p className="font-medium">Retrait</p>
 <p className="text-sm text-muted-foreground">Sur place</p>
 </button>
 </div>
 </section>

 <section>
 <h3 className="mb-3 text-lg font-bold">Paiement</h3>
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
 active ?'border-success bg-success/10' :'border-input hover:border-input'
 }`}
 >
 <div className="flex items-start gap-3">
 <div
 className={`rounded-xl p-2 ${
 active ?'bg-success/[0.15] text-success' :'bg-muted text-muted-foreground'
 }`}
 >
 <Icon size={18} />
 </div>
 <div>
 <p className="font-semibold text-foreground">{option.title}</p>
 <p className="text-sm text-muted-foreground">{option.subtitle}</p>
 </div>
 </div>
 </button>
 );
 })}
 </div>
 <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
 Stripe est désactivé : finalisation par virement ou WhatsApp avec validation humaine.
 </div>
 </section>

 {deliveryType ==='home_delivery' && (
 <div>
 <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="checkout-address">
 Adresse de livraison *
 </label>
 <input
 id="checkout-address"
 type="text"
 value={address}
 onChange={(event) => setAddress(event.target.value)}
 className="w-full rounded-lg border border-input px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-ring"
 placeholder="Ex. 12 rue Victor-Hugo, Fort-de-France"
 required
 />
 </div>
 )}

 <div>
 <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="checkout-notes">
 Instructions (optionnel)
 </label>
 <textarea
 id="checkout-notes"
 value={notes}
 onChange={(event) => setNotes(event.target.value)}
 rows={3}
 className="w-full resize-none rounded-lg border border-input px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-ring"
 placeholder="Informations supplémentaires pour votre commande…"
 />
 </div>

 <div className="space-y-2 rounded-lg bg-muted p-4">
 <h3 className="mb-3 flex items-center text-lg font-bold">
 <Package className="mr-2 text-success" size={20} />
 Récapitulatif
 </h3>
 <div className="flex justify-between text-muted-foreground">
 <span>
 Sous-total ({items.length} article{items.length > 1 ?'s' :''})
 </span>
 <span>{total.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-sm text-muted-foreground">
 <span>Commission DELIKREOL (incluse)</span>
 <span>{commissionDelikreol.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-muted-foreground">
 <span>Frais de livraison</span>
 <span>{deliveryFee.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between border-t border-input pt-3 text-xl font-bold text-foreground">
 <span>Total</span>
 <span>{finalTotal.toFixed(2)} €</span>
 </div>
 </div>

 {error && (
 <div className="space-y-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
 <p>{error}</p>
 {fallbackWhatsappUrl && (
 <a
 href={fallbackWhatsappUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 font-semibold underline"
 >
 <MessageCircle size={16} />
 Ouvrir WhatsApp
 </a>
 )}
 </div>
 )}

 <button
 type="submit"
 disabled={loading || items.length === 0}
 className="w-full rounded-lg bg-success py-4 text-lg font-medium text-white transition-colors hover:bg-success/90 disabled:opacity-50"
 >
 {loading
 ?'Traitement…'
 : `Enregistrer la commande ${finalTotal.toFixed(2)} €`}
 </button>

 <p className="text-center text-xs text-muted-foreground">
 En passant commande, vous acceptez nos conditions générales de vente.
 </p>
 </form>
 </div>
 </div>
 );
}
