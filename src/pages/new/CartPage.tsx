import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import {
  martiniqueCommunes,
  normalizeCommuneQuery,
} from '../../data/martiniqueCommunes';

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

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { showSuccess, showError } = useToast();

  const [commune, setCommune] = useState('');
  const [communeSuggestions, setCommuneSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mode, setMode] = useState<'retrait' | 'livraison'>('retrait');
  const [selectedCreneaux, setSelectedCreneaux] = useState<string[]>([]);
  const [autreCreneau, setAutreCreneau] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [preparedMessage, setPreparedMessage] = useState('');

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

  // Build WhatsApp message
  const whatsappMessage = useMemo(() => {
    if (items.length === 0) return '';

    const productList = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} — ${(item.price * item.quantity).toFixed(2)}€`
      )
      .join('\n');

    const traiteurText = traiteurs.length > 0 ? traiteurs.join(', ') : 'Non précisé';
    const creneauText = getCreneauText();

    const lines = [
      'Bonjour 👋 Nouvelle commande DeliKreol.',
      '',
      `Produits :`,
      productList,
      '',
      `Total : ${total.toFixed(2)} €`,
      `Commune : ${commune || 'Non précisée'}`,
      `Type : ${mode === 'retrait' ? 'Retrait' : 'Livraison'}`,
      `Créneau(x) souhaité(s) : ${creneauText || 'Non précisé'}`,
      `Traiteur : ${traiteurText}`,
      phone ? `Téléphone : ${phone}` : '',
      '',
      mode === 'livraison' ? `Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.` : '',
      notes ? `\nMessage : ${notes}` : '',
      '',
      'Merci de confirmer la disponibilité avec le prestataire.',
    ]
      .filter(Boolean)
      .join('\n');

    return lines;
  }, [items, total, commune, mode, getCreneauText, notes, traiteurs, phone]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppClick = () => {
    // Validate phone
    if (phone && !validatePhone(phone)) {
      setPhoneError(formatPhoneError());
      return;
    }
    setPhoneError('');

    window.open(whatsappUrl, '_blank');
    setMessageSent(true);
    setPreparedMessage(
      'Votre récapitulatif est prêt. Cliquez sur WhatsApp pour envoyer votre demande à DeliKreol. La commande sera confirmée après vérification des disponibilités, du retrait/livraison et du total final.'
    );
    showSuccess('Redirection vers WhatsApp...');
  };

  useEffect(() => {
    document.title = `Panier (${itemCount}) — DeliKreol`;
  }, [itemCount]);

  // Empty state
  if (items.length === 0 && !messageSent) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFBF0]">
          <div className="text-center px-4 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-6">
              <ShoppingCart className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Ajoutez un plat pour préparer une commande. Parcourez notre catalogue de traiteurs martiniquais.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200"
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
            <h1 className="text-2xl font-black text-gray-900 mb-3">Demande préparée !</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {preparedMessage}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" fill="white" />
                Confirmer ma demande sur WhatsApp
              </a>
              <Link
                to="/catalogue"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-orange-600 font-bold rounded-2xl border-2 border-orange-200 transition-all hover:scale-105"
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
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-7 h-7" />
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Mon panier</h1>
                <p className="text-orange-100 text-sm">
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
                    Votre récapitulatif est prêt.
                  </p>
                  <p className="text-green-700 text-sm">
                    Cliquez sur WhatsApp pour envoyer votre demande à DeliKreol. La commande sera confirmée après vérification des disponibilités, du retrait/livraison et du total final.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">Articles</h2>
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
                  className="bg-white rounded-2xl border border-orange-100 p-4 flex gap-4 group hover:border-orange-200 transition-all"
                >
                  {/* Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ChefHat className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.vendor_id}</p>
                    <p className="text-lg font-black text-orange-600 mt-1">
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
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}

              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </div>

            {/* Order summary / WhatsApp form */}
            <div className="space-y-4">
              {/* Subtotal + Delivery */}
              <div className="bg-white rounded-2xl border border-orange-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total ({itemCount} articles)</span>
                    <span className="font-bold text-gray-900">{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {mode === 'livraison' ? 'Frais de livraison' : 'Retrait'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {mode === 'livraison'
                        ? 'À confirmer sur WhatsApp selon commune et disponibilité'
                        : 'Frais de livraison non appliqués'}
                    </span>
                  </div>
                  {mode === 'livraison' && total < 40 && (
                    <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.
                    </div>
                  )}
                  <hr className="border-orange-100" />
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total estimé</span>
                    <span className="text-2xl font-black text-orange-600">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Total final confirmé après vérification par WhatsApp.
                  </p>
                </div>
              </div>

              {/* Paiement info card */}
              <div className="bg-white rounded-2xl border border-orange-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Paiement
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                    WhatsApp-first
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">
                    Paiement en ligne bientôt disponible
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Le paiement en ligne n'est pas encore activé sur cette version test. Votre commande est d'abord confirmée par WhatsApp avec le total final.
                </p>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Informations de commande</h2>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
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
                    placeholder="0696 XX XX XX"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                      phoneError
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>

                {/* Commune */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Votre commune
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => handleCommuneInput(e.target.value)}
                    onFocus={() => communeSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Fort-de-France, Lamentin..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                  />
                  {showSuggestions && communeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-orange-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {communeSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onMouseDown={() => selectCommune(name)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <MapPin className="w-3 h-3 inline mr-2 text-orange-400" />
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode('retrait')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        mode === 'retrait'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Retrait
                    </button>
                    <button
                      onClick={() => setMode('livraison')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        mode === 'livraison'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Livraison
                    </button>
                  </div>
                </div>

                {/* Créneaux - checkboxes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Créneau(x) souhaité(s)
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Choisissez un ou plusieurs créneaux possibles :
                  </p>
                  <div className="space-y-2">
                    {CRENEAUX_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-orange-300 cursor-pointer transition-all text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCreneaux.includes(option.id)}
                          onChange={() => toggleCreneau(option.id)}
                          className="w-4 h-4 accent-orange-500"
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
                        className="w-full px-3 py-2 rounded-xl border border-orange-200 focus:border-orange-400 text-sm outline-none mt-1"
                      />
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, préférences, instructions spéciales..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none resize-none"
                  />
                </div>
              </div>

              {/* WhatsApp CTA */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-200 text-lg"
              >
                <MessageCircle className="w-6 h-6" fill="white" />
                Confirmer ma demande sur WhatsApp
              </button>
              <p className="text-xs text-center text-gray-400">
                Vous ne payez pas encore en ligne. La commande est envoyée à DeliKreol pour confirmation du plat, du retrait/livraison et du total final.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}