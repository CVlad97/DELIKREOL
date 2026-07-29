import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateMartiniquePhone, PHONE_ERROR_MESSAGE } from '../../utils/phone';
import { validateEmail } from '../../utils/validation';
import { DELIVERY_FEES } from '../../services/pricing';
import { generateOrderId } from '../../utils/orderId';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  MapPin,
  ChefHat,
  Clock,
  Info,
  ArrowLeft,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { integrations } from '../../config/integrations';
import {
  martiniqueCommunes,
  normalizeCommuneQuery,
} from '../../data/martiniqueCommunes';
import { OrderSummaryByPartner, groupItemsByPartner } from '../../components/OrderSummaryByPartner';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Product } from '../../lib/supabase';
import { createStripeCheckoutSession } from '../../utils/stripe';
import {
  createWhatsAppIdempotencyKey,
  readPreparedWhatsAppOrder,
  releaseWhatsAppOrderLock,
  tryAcquireWhatsAppOrderLock,
  writePreparedWhatsAppOrder,
} from '../../utils/whatsappOrderIdempotency';

interface CartItem extends Product {
  quantity: number;
}

const WHATSAPP_NUMBER = '596696653589';

const CRENEAUX_OPTIONS = [
  { id: 'des-que-possible', label: 'Dès que possible' },
  { id: 'midi', label: 'Midi (11h30–13h30)' },
  { id: 'apres-midi', label: 'Après-midi (14h00–17h00)' },
  { id: 'soir', label: 'Soir (18h00–20h30)' },
  { id: 'autre', label: 'Autre créneau à préciser' },
];

function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '0' || phone.trim() === '') return false;
  const cleaned = phone.replace(/[\s+]/g, '');
  if (cleaned === '0') return false;
  if (cleaned.length < 8) return false;
  // Martinique: commence par 0696, 0697, 596696, 596697
  const valid = /^(?:0(?:696|697)\d{6}|(?:596)?(?:696|697)\d{6})$/.test(cleaned);
  return valid;
}

function formatPhoneError(): string {
  return 'Merci d\'indiquer un numéro WhatsApp valide, par exemple 0696 XX XX XX ou +596 696 XX XX XX.';
}

/**
 * Construit le message WhatsApp complet pour une commande.
 * Inclut le n° de commande pour dédoublonnage côté partenaire.
 */
function buildWhatsAppOrderMessage(params: {
  items: CartItem[];
  total: number;
  mode: 'retrait' | 'relais' | 'livraison';
  commune: string;
  creneauText: string;
  notes: string;
  traiteurs: string[];
  phone: string;
  orderId: string;
}): string {
  const { items, total, mode, commune, creneauText, notes, traiteurs, phone, orderId } = params;
  const modeFee = DELIVERY_FEES[mode]?.fee || 0;
  const partnerGroups = groupItemsByPartner(items);
  const productList = partnerGroups
    .map((group) => {
      const lines = group.items
        .map(
          (item) =>
            `  • ${item.name} x${item.quantity} — ${(item.price * item.quantity).toFixed(2)}€`
        )
        .join('\n');
      const header = partnerGroups.length > 1
        ? `🏪 ${group.name} (sous-total ${group.subtotal.toFixed(2)}€) :\n`
        : '';
      return `${header}${lines}`;
    })
    .join('\n\n');

  const traiteurText = traiteurs.length > 0 ? traiteurs.join(', ') : 'Non précisé';

  const lines = [
    'Bonjour 👋 Nouvelle commande DeliKreol.',
    `📋 Commande n° ${orderId}`,
    '',
    'Produits :',
    productList,
    '',
    `Total : ${(total + modeFee).toFixed(2).replace('.', ',')} € (dont ${modeFee.toFixed(2).replace('.', ',')} € de ${mode === 'retrait' ? 'retrait' : mode === 'relais' ? 'point relais' : 'livraison'})`,
    `Commune : ${commune || 'Non précisée'}`,
    `Type : ${mode === 'retrait' ? 'Retrait' : mode === 'relais' ? 'Point relais' : 'Livraison'}`,
    `Créneau(x) souhaité(s) : ${creneauText || 'Non précisé'}`,
    `Traiteur : ${traiteurText}`,
    phone ? `Téléphone : ${phone}` : '',
    '',
    mode === 'livraison'
      ? `Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.`
      : '',
    notes ? `\nMessage : ${notes}` : '',
    '',
    'Merci de confirmer la disponibilité avec le prestataire.',
  ]
    .filter(Boolean)
    .join('\n');

  return lines;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [commune, setCommune] = useState('');
  const [communeSuggestions, setCommuneSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mode, setMode] = useState<'retrait' | 'relais' | 'livraison'>('retrait');
  const [selectedCreneaux, setSelectedCreneaux] = useState<string[]>([]);
  const [autreCreneau, setAutreCreneau] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [preparedMessage, setPreparedMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappShareUrl, setWhatsappShareUrl] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [stripeStatus, setStripeStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [savedField, setSavedField] = useState<string | null>(null);
  const panierRef = useRef<HTMLDivElement>(null);
  const checkoutInFlightRef = useRef(false);
  const stripeTestCheckoutEnabled =
    integrations.stripe.enabled &&
    !!integrations.stripe.publicKey?.startsWith('pk_test_') &&
    isSupabaseConfigured;

  useEffect(() => {
    if (panierRef.current) {
      panierRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const flashSaved = (field: string) => {
    setSavedField(field);
    setTimeout(() => setSavedField(null), 1500);
  };

  const handleClearCart = () => {
    clearCart();
    setMessageSent(false);
    setPreparedMessage('');
    setCommune('');
    setCreneau('');
    setSelectedCreneaux([]);
    setAutreCreneau('');
    setNotes('');
    setPhone('');
    setPhoneError('');
    showSuccess('Panier vidé');
  };

  const toggleCreneau = (id: string) => {
    setSelectedCreneaux((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getCreneauText = () => {
    const labels = selectedCreneaux
      .filter((id) => id !== 'autre')
      .map((id) => CRENEAUX_OPTIONS.find((o) => o.id === id)?.label || id);
    if (selectedCreneaux.includes('autre') && autreCreneau.trim()) {
      labels.push(autreCreneau.trim());
    }
    return labels.length > 0 ? labels.join(', ') : '';
  };

  const setCreneau = (val: string) => {}; // compat

  // Commune autocomplete
  const handleCommuneInput = (value: string) => {
    setCommune(value);
    if (value.trim().length >= 2) {
      const q = normalizeCommuneQuery(value);
      const matches = martiniqueCommunes
        .filter((c) => {
          const names = [c.name, ...c.aliases].map(normalizeCommuneQuery);
          return names.some((n) => n.includes(q));
        })
        .map((c) => c.name)
        .slice(0, 6);
      setCommuneSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setCommuneSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCommune = (name: string) => {
    setCommune(name);
    setCommuneSuggestions([]);
    setShowSuggestions(false);
  };

  // Get unique vendor names from cart
  const traiteurs = useMemo(() => {
    const vendorSet = new Set<string>();
    items.forEach((item) => {
      if (item.vendor_id) vendorSet.add(item.vendor_id);
      if (item.vendor?.business_name) vendorSet.add(item.vendor.business_name);
    });
    return Array.from(vendorSet);
  }, [items]);

  const hasMultipleVendors = traiteurs.length > 1;

  const createPublicOrder = async (paymentProvider: 'manual' | 'stripe_test', idempotencyKey: string) => {
    const deliveryFee = DELIVERY_FEES[mode]?.fee || 0;
    const { data, error } = await supabase.functions.invoke('checkout-order', {
      body: {
        idempotency_key: idempotencyKey,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          vendor_id: item.vendor_id,
          vendor: item.vendor?.business_name || item.vendor_id || '',
        })),
        total,
        total_amount: total + deliveryFee,
        delivery_fee: deliveryFee,
        commune,
        mode,
        phone,
        email,
        notes,
        creneaux: getCreneauText(),
        payment_provider: paymentProvider,
      },
    });

    if (error) throw error;
    if (!data?.order?.id || !data?.order?.order_number) {
      throw new Error(data?.error || 'Commande non créée');
    }
    return data.order as { id: string; order_number: string; tracking_token?: string };
  };

  const validateOrderForm = () => {
    // Panier vide
    if (items.length === 0) {
      showError('Votre panier est vide. Ajoutez un plat avant de préparer une demande.');
      return false;
    }
    // Anti-double-click
    if (checkoutInFlightRef.current || checkoutStatus === 'processing' || stripeStatus === 'processing' || messageSent) {
      return false;
    }
    // Validate phone — obligatoire
    if (!phone || !validateMartiniquePhone(phone)) {
      setPhoneError("Merci d'indiquer un numéro WhatsApp valide, ex : 0696 XX XX XX");
      return false;
    }
    // Email valide si fourni
    if (email && !validateEmail(email)) {
      showError("Merci d'indiquer une adresse email valide.");
      return false;
    }
    // Block multi-traiteur
    if (hasMultipleVendors) {
      showError('Pour cette version test, merci de passer une commande par partenaire. Le panier multi-traiteur arrive bientôt.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleWhatsAppClick = async () => {
    if (!validateOrderForm()) return;
    checkoutInFlightRef.current = true;
    setCheckoutStatus('processing');
    let lockOwner: string | null = null;
    let orderPersistedInSupabase = false;

    // Générer ID commande
    let orderNumber = generateOrderId();
    const orderUuid = crypto.randomUUID();
    const deliveryFee = DELIVERY_FEES[mode]?.fee || 0;

    // Construire la commande
    const order: {
      id: string;
      order_number: string;
      [key: string]: unknown;
    } = {
      id: orderUuid,
      order_number: orderNumber,
      customer_phone: phone,
      customer_email: email || null,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        vendor_name: item.vendor?.business_name || item.vendor_id || null,
      })),
      subtotal: total,
      total_amount: total + deliveryFee,
      delivery_fee: deliveryFee,
      delivery_type: mode,
      commune,
      creneaux: getCreneauText(),
      notes,
      source: 'public_checkout',
      payment_status: 'pending',
      invoice_status: 'draft',
      qonto_status: 'pending_reconciliation',
      delivery_status: 'pending',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const idempotencyKey = await createWhatsAppIdempotencyKey({
      items,
      mode,
      commune,
      creneauText: getCreneauText(),
      notes,
      phone,
      email,
    });
    order.idempotency_key = idempotencyKey;
    const existingPreparedOrder = readPreparedWhatsAppOrder(idempotencyKey);

    // Sauvegarder en local (fallback uniquement si Supabase échoue)
    const saveLocal = () => {
      try {
        const localOrders = JSON.parse(localStorage.getItem('delikreol_local_orders_v1') || '[]');
        const nextOrders = localOrders.filter(
          (localOrder: { idempotency_key?: string; order_number?: string }) =>
            localOrder.idempotency_key !== idempotencyKey && localOrder.order_number !== order.order_number,
        );
        nextOrders.push(order);
        localStorage.setItem('delikreol_local_orders_v1', JSON.stringify(nextOrders));
      } catch (e) {
        console.warn('[DELIKREOL] Échec sauvegarde locale:', e);
      }
    };

    try {
      lockOwner = tryAcquireWhatsAppOrderLock(idempotencyKey);
      if (!lockOwner) {
        showError('Demande déjà en préparation dans un autre onglet. Réessayez dans quelques secondes.');
        setCheckoutStatus('idle');
        checkoutInFlightRef.current = false;
        return;
      }

      if (existingPreparedOrder?.persistedInSupabase || (!isSupabaseConfigured && existingPreparedOrder)) {
        orderNumber = existingPreparedOrder.orderNumber;
        order.order_number = orderNumber;
        order.id = existingPreparedOrder.orderId;
        orderPersistedInSupabase = existingPreparedOrder.persistedInSupabase;
      }

      if (isSupabaseConfigured) {
        const createdOrder = await createPublicOrder('manual', idempotencyKey);
        orderNumber = createdOrder.order_number;
        order.order_number = orderNumber;
        order.id = createdOrder.id;
        orderPersistedInSupabase = true;
      } else if (!existingPreparedOrder) {
        saveLocal();
      }
    } catch (err) {
      console.warn('[DELIKREOL] Échec Supabase, fallback localStorage:', err);
      saveLocal();
    }

    const confirmedWhatsappText = buildWhatsAppOrderMessage({
      items,
      total,
      mode,
      commune,
      creneauText: getCreneauText(),
      notes,
      traiteurs,
      phone,
      orderId: orderNumber,
    });
    const confirmedWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(confirmedWhatsappText)}`;
    setOrderNumber(orderNumber);
    setWhatsappShareUrl(confirmedWhatsappUrl);
    writePreparedWhatsAppOrder({
      idempotencyKey,
      orderId: String(order.id),
      orderNumber,
      whatsappUrl: confirmedWhatsappUrl,
      persistedInSupabase: orderPersistedInSupabase,
      createdAt: new Date().toISOString(),
    });
    const opened = window.open(confirmedWhatsappUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      showError('Popup WhatsApp bloquée : utilisez le bouton “Ouvrir WhatsApp” sur l’écran suivant.');
    }

    setCheckoutStatus('success');
    setMessageSent(true);
    clearCart();
    setPreparedMessage(`Demande préparée — à confirmer sur WhatsApp.`);
    showSuccess('Demande préparée — à confirmer sur WhatsApp.');
    setTimeout(() => navigate(`/statut-commande?order=${orderNumber}`), 1500);
    releaseWhatsAppOrderLock(idempotencyKey, lockOwner);
    checkoutInFlightRef.current = false;
  };

  const handleStripeCheckoutClick = async () => {
    if (!validateOrderForm()) return;
    if (!stripeTestCheckoutEnabled) {
      showError('Paiement test indisponible : configuration Stripe test incomplète.');
      return;
    }

    setStripeStatus('processing');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        showError('Connectez-vous à Mon espace pour tester le paiement CB sécurisé.');
        setStripeStatus('idle');
        navigate('/connexion?next=/panier');
        return;
      }

      const idempotencyKey = `public_stripe_test_${crypto.randomUUID()}`;
      const createdOrder = await createPublicOrder('stripe_test', idempotencyKey);
      const checkoutUrl = await createStripeCheckoutSession(createdOrder.id, window.location.origin);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[DELIKREOL] Stripe checkout indisponible:', err);
      showError('Paiement test indisponible. Utilisez WhatsApp pour confirmer la demande.');
      setStripeStatus('error');
    }
  };

  useEffect(() => {
    document.title = `Panier (${itemCount}) — DeliKreol`;
    setPageMeta(`Panier (${itemCount}) — DeliKreol | Commande plats créoles`, 'Votre panier DeliKreol. Commandez vos plats créoles en Martinique. Livraison et retrait.');
    trackPublicView();
  }, [itemCount]);

  // Empty state
  if (items.length === 0 && !messageSent) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFBF0]">
          <div className="text-center px-4 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/[0.15] mb-6">
              <ShoppingCart className="w-10 h-10 text-primary/400" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-3">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Ajoutez un plat pour préparer une commande. Parcourez notre catalogue de traiteurs martiniquais.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-primary/200"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir le catalogue
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Success state
  if (messageSent && items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFBF0]">
          <div className="text-center px-4 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-3">Demande préparée ! 🎉</h1>
            {orderNumber && (
              <p className="text-3xl font-black text-primary mb-2 font-mono">{orderNumber}</p>
            )}
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {preparedMessage}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Besoin d'aide ? Contactez-nous sur WhatsApp.
            </p>
              <div className="flex flex-col gap-3">
              {whatsappShareUrl && (
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" fill="white" />
                  Ouvrir WhatsApp
                </a>
              )}
              <a
                href={`https://wa.me/596696653589?text=${encodeURIComponent(`Bonjour, j'ai besoin d'aide pour ma commande ${orderNumber}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" fill="white" />
                Support commande
              </a>
              <Link
                to="/catalogue"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary font-bold rounded-2xl border-2 border-primary/200 transition-all hover:scale-105"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const creneauText = getCreneauText();

  return (
    <Layout>
      <div className="bg-[#FFFBF0] min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-7 h-7" />
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Mon panier</h1>
                <p className="text-primary/100 text-sm">
                  {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success banner after WhatsApp */}
        {messageSent && (
          <div className="bg-green-50 border-b border-green-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">
                    Demande préparée — à confirmer sur WhatsApp.
                  </p>
                  <p className="text-green-700 text-sm">
                    La demande est prête. Elle reste à confirmer sur WhatsApp avant préparation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4" ref={panierRef}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">Articles</h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vider le panier
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-primary/100 p-4 flex gap-4 group hover:border-primary/200 transition-all"
                >
                  {/* Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-primary/[0.08] flex-shrink-0">
                    {item.image_url ? (
                      <img loading="lazy"
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ChefHat className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.vendor_id}</p>
                    <p className="text-lg font-black text-primary mt-1">
                      {item.price.toFixed(2)} €
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        showSuccess(`${item.name} retiré`);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-muted rounded-xl px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-input flex items-center justify-center hover:border-primary/300 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-input flex items-center justify-center hover:border-primary/300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}

              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/700 font-semibold mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </div>

            {/* Order summary / WhatsApp form */}
            <div className="space-y-4">
              {/* Subtotal + Delivery */}
              <div className="bg-white rounded-2xl border border-primary/100 p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Résumé</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total ({itemCount} articles)</span>
                    <span className="font-bold text-foreground">{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {mode === 'retrait' ? 'Frais retrait' : mode === 'relais' ? 'Frais point relais' : 'Frais livraison'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {mode === 'retrait' ? 'Gratuit' : `${(DELIVERY_FEES[mode]?.fee || 0).toFixed(2).replace('.', ',')} €`}
                    </span>
                  </div>
                  {mode === 'livraison' && total < 40 && (
                    <div className="text-xs text-secondary bg-secondary/10 rounded-lg px-3 py-2">
                      Livraison éloignée possible à partir de 40 € de commande, sous réserve de validation.
                    </div>
                  )}
                  <hr className="border-primary/100" />
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">Total estimé</span>
                    <span className="text-2xl font-black text-primary">
                      {(total + (DELIVERY_FEES[mode]?.fee || 0)).toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total final confirmé après vérification par WhatsApp.
                  </p>
                </div>
              </div>

              {/* Récapitulatif par partenaire */}
              <OrderSummaryByPartner items={items} />

              {/* Paiement info card */}
              <div className="bg-white rounded-2xl border border-primary/100 p-6">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Paiement
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    WhatsApp-first
                  </span>
                  {stripeTestCheckoutEnabled && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                      Mode test Stripe — aucun vrai paiement
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  WhatsApp reste le canal principal de confirmation. Le paiement CB est disponible uniquement en test sécurisé quand vous êtes connecté.
                </p>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl border border-primary/100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground">Informations de commande</h2>

                {/* Multi-traiteur warning */}
                {hasMultipleVendors && (
                  <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-secondary">Panier multi-partenaires</p>
                      <p className="text-secondary">
                        Pour cette version test, merci de valider une commande par partenaire. Le panier multi-traiteur arrive bientôt.
                      </p>
                    </div>
                  </div>
                )}

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    Téléphone WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    onBlur={() => phone.trim() && flashSaved('phone')}
                    placeholder="0696 XX XX XX"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                      phoneError
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-input focus:border-primary/400 focus:ring-2 focus:ring-ring/30'
                    }`}
                  />
                  {savedField === 'phone' && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold mt-1 animate-pulse">
                      ✓ Enregistré
                    </span>
                  )}
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => email.trim() && flashSaved('email')}
                    placeholder="nom@exemple.fr"
                    className="w-full px-3 py-2.5 rounded-xl border border-input focus:border-primary/400 focus:ring-2 focus:ring-ring/30 text-sm outline-none"
                  />
                  {savedField === 'email' && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold mt-1 animate-pulse">
                      ✓ Enregistré
                    </span>
                  )}
                </div>

                {/* Commune */}
                <div className="relative">
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Votre commune
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => handleCommuneInput(e.target.value)}
                    onFocus={() => communeSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                      if (commune.trim()) flashSaved('commune');
                    }}
                    placeholder="Fort-de-France, Lamentin..."
                    className="w-full px-3 py-2.5 rounded-xl border border-input focus:border-primary/400 focus:ring-2 focus:ring-ring/30 text-sm outline-none"
                  />
                  {savedField === 'commune' && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold mt-1 animate-pulse">
                      ✓ Enregistré
                    </span>
                  )}
                  {showSuggestions && communeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-primary/200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {communeSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onMouseDown={() => selectCommune(name)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/[0.08] transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <MapPin className="w-3 h-3 inline mr-2 text-primary/400" />
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMode('retrait')}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        mode === 'retrait'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted text-muted-foreground border border-input hover:border-primary/300'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Retrait {total > 0 ? `${total.toFixed(2).replace('.', ',')} €` : ''}
                    </button>
                    <button
                      onClick={() => setMode('relais')}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        mode === 'relais'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted text-muted-foreground border border-input hover:border-primary/300'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Relais +2,50€
                    </button>
                    <button
                      onClick={() => setMode('livraison')}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        mode === 'livraison'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted text-muted-foreground border border-input hover:border-primary/300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Livraison +4€
                    </button>
                  </div>
                </div>

                {/* Créneaux - checkboxes */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Créneau(x) souhaité(s)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Choisissez un ou plusieurs créneaux possibles :
                  </p>
                  <div className="space-y-2">
                    {CRENEAUX_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-input hover:border-primary/300 cursor-pointer transition-all text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCreneaux.includes(option.id)}
                          onChange={() => toggleCreneau(option.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        {option.label}
                      </label>
                    ))}
                    {selectedCreneaux.includes('autre') && (
                      <input
                        type="text"
                        value={autreCreneau}
                        onChange={(e) => setAutreCreneau(e.target.value)}
                        placeholder="Précisez votre créneau..."
                        className="w-full px-3 py-2 rounded-xl border border-primary/200 focus:border-primary/400 text-sm outline-none mt-1"
                      />
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => notes.trim() && flashSaved('notes')}
                    placeholder="Allergies, préférences, instructions spéciales..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-input focus:border-primary/400 focus:ring-2 focus:ring-ring/30 text-sm outline-none resize-none"
                  />
                  {savedField === 'notes' && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold mt-1 animate-pulse">
                      ✓ Enregistré
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons de commande */}
              {checkoutStatus === 'processing' ? (
                <div className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white font-bold rounded-2xl text-lg">
                  Enregistrement en cours...
                </div>
              ) : (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-primary text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/200 text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Commander sur WhatsApp
                </button>
              )}
              {stripeTestCheckoutEnabled && (
                <button
                  onClick={handleStripeCheckoutClick}
                  disabled={stripeStatus === 'processing' || checkoutStatus === 'processing'}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-amber-50 text-foreground font-bold rounded-2xl border-2 border-amber-300 transition-all disabled:opacity-60"
                >
                  <CreditCard className="w-5 h-5" />
                  {stripeStatus === 'processing' ? 'Préparation Stripe test...' : 'Tester le paiement CB sécurisé'}
                </button>
              )}
              <p className="text-xs text-center text-muted-foreground">
                Demande à confirmer : aucun paiement réel n’est activé tant que le go-live Stripe live n’est pas validé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
