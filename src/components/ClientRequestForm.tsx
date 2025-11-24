import { useState, useEffect } from 'react';
import { MapPin, Package, Clock, Send, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AddressAutocomplete } from './AddressAutocomplete';
import { GeocodeResult, isInDeliveryZone } from '../services/geocodingService';

interface InitialProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
}

interface ClientRequestFormProps {
  initialProducts?: InitialProduct[];
}

export function ClientRequestForm({ initialProducts = [] }: ClientRequestFormProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const generateInitialDetails = () => {
    if (initialProducts.length === 0) return '';
    return initialProducts
      .map(p => `• ${p.name} (${p.vendor}) - ${p.price.toFixed(2)}€`)
      .join('\n');
  };

  const [formData, setFormData] = useState({
    address: '',
    deliveryPreference: 'home_delivery' as 'home_delivery' | 'relay_point',
    requestDetails: generateInitialDetails(),
    preferredTime: 'midi',
  });

  const [geocodeData, setGeocodeData] = useState<GeocodeResult | null>(null);
  const [addressVerified, setAddressVerified] = useState(false);
  const [addressError, setAddressError] = useState<string>('');

  useEffect(() => {
    if (initialProducts.length > 0) {
      setFormData(prev => ({
        ...prev,
        requestDetails: generateInitialDetails(),
      }));
    }
  }, [initialProducts]);

  const handleAddressSelect = (result: GeocodeResult) => {
    setGeocodeData(result);
    setAddressVerified(true);
    setAddressError('');
    setFormData(prev => ({ ...prev, address: result.displayName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('Vous devez être connecté');
      return;
    }

    if (!addressVerified || !geocodeData) {
      setAddressError('Veuillez sélectionner une adresse dans la liste');
      showError('Veuillez sélectionner et vérifier votre adresse');
      return;
    }

    const inZone = isInDeliveryZone(geocodeData.latitude, geocodeData.longitude);
    if (!inZone) {
      const confirmOutOfZone = window.confirm(
        'Votre adresse est hors de notre zone de livraison principale. La livraison est sous réserve de disponibilité. Voulez-vous continuer ?'
      );
      if (!confirmOutOfZone) return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('client_requests').insert({
        user_id: user.id,
        address: formData.address,
        delivery_preference: formData.deliveryPreference,
        request_details: formData.requestDetails,
        preferred_time: formData.preferredTime,
        status: 'pending_admin_review',
      });

      if (error) throw error;

      showSuccess('Votre demande a été envoyée avec succès!');
      setFormData({
        address: '',
        deliveryPreference: 'home_delivery',
        requestDetails: '',
        preferredTime: 'midi',
      });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      showError(error.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-50 mb-4">
        Nouvelle Demande
      </h2>
      {initialProducts.length > 0 && (
        <div className="mb-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <ShoppingBag className="w-5 h-5" />
            Produits sélectionnés ({initialProducts.length})
          </div>
          <div className="text-slate-300 text-sm space-y-1">
            {initialProducts.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span>{p.name} <span className="text-slate-400">({p.vendor})</span> - {p.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-slate-300 mb-6">
        {initialProducts.length > 0
          ? "Complétez votre demande ou ajoutez d'autres produits ci-dessous."
          : "Décrivez ce que vous souhaitez commander. Notre équipe vous recontactera rapidement."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Adresse ou commune
          </label>
          <AddressAutocomplete
            value={formData.address}
            onChange={(value) => {
              setFormData({ ...formData, address: value });
              setAddressVerified(false);
              setGeocodeData(null);
            }}
            onSelectAddress={handleAddressSelect}
            error={addressError}
          />
          {geocodeData && addressVerified && (
            <div className="mt-3 p-3 bg-slate-900/50 border border-emerald-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-emerald-400 font-medium mb-1">Adresse vérifiée</div>
                  <div className="text-slate-300 text-sm">{geocodeData.displayName}</div>
                  <div className="text-slate-400 text-xs mt-1">
                    {geocodeData.commune} • {geocodeData.postalCode}
                  </div>
                  {isInDeliveryZone(geocodeData.latitude, geocodeData.longitude) ? (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Zone de livraison couverte
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                      Hors zone principale - livraison sous réserve
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Package className="inline w-4 h-4 mr-1" />
            Préférence de livraison
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryPreference: 'home_delivery' })}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.deliveryPreference === 'home_delivery'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500'
              }`}
            >
              🏠 Livraison à domicile
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryPreference: 'relay_point' })}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.deliveryPreference === 'relay_point'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500'
              }`}
            >
              📦 Point relais
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Ce que vous souhaitez commander
          </label>
          <textarea
            value={formData.requestDetails}
            onChange={(e) => setFormData({ ...formData, requestDetails: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Ex: 2 pizzas margherita, 1 salade césar, des légumes frais du marché..."
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Créneau souhaité
          </label>
          <select
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="midi">Midi (11h-14h)</option>
            <option value="soir">Soir (18h-21h)</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-slate-950 px-6 py-3 rounded-lg hover:bg-emerald-400 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer ma demande
            </>
          )}
        </button>
      </form>
    </div>
  );
}
