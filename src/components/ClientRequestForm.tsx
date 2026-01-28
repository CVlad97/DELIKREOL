import { useState, useEffect } from 'react';
import { MapPin, Package, Clock, Send, ShoppingBag, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { blink } from '../lib/blink';
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
      await blink.db.clientRequests.create({
        userId: user.id,
        address: formData.address,
        deliveryPreference: formData.deliveryPreference,
        requestDetails: formData.requestDetails,
        preferredTime: formData.preferredTime,
        status: 'pending_admin_review',
      });

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
    <div className="bg-card rounded-[2.5rem] p-10 border-2 border-border/50 shadow-elegant space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-primary">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Demande Libre</h2>
        </div>
        <p className="text-muted-foreground font-medium">Vous ne trouvez pas votre bonheur ? Nos agents s'occupent de tout pour vous.</p>
      </div>

      {initialProducts.length > 0 && (
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
            <ShoppingBag className="w-4 h-4" />
            Selection en cours ({initialProducts.length})
          </div>
          <div className="grid gap-2">
            {initialProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-white/50 p-3 rounded-xl border border-border/50">
                <span className="font-bold text-foreground/80">{p.name}</span>
                <span className="font-black text-primary">{p.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            <MapPin className="inline w-3 h-3 mr-2" />
            Lieu de livraison
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
            <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <div className="text-accent font-black uppercase tracking-widest text-[10px] mb-1">Localisation Validée</div>
                  <div className="text-foreground font-bold text-sm">{geocodeData.displayName}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Mode de Récupération
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryPreference: 'home_delivery' })}
              className={`p-5 rounded-2xl border-2 transition-all font-bold text-sm uppercase tracking-widest ${
                formData.deliveryPreference === 'home_delivery'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
              }`}
            >
              🏠 Domicile
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryPreference: 'relay_point' })}
              className={`p-5 rounded-2xl border-2 transition-all font-bold text-sm uppercase tracking-widest ${
                formData.deliveryPreference === 'relay_point'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
              }`}
            >
              📦 Point Relais
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Détails de votre besoin
          </label>
          <textarea
            value={formData.requestDetails}
            onChange={(e) => setFormData({ ...formData, requestDetails: e.target.value })}
            className="w-full px-6 py-4 bg-muted border-none rounded-2xl text-foreground focus:ring-4 focus:ring-primary/10 font-bold placeholder:text-muted-foreground/50"
            placeholder="Ex: 2 pizzas margherita, 1 salade césar, des légumes frais du marché..."
            rows={4}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            <Clock className="inline w-3 h-3 mr-2" />
            Disponibilité
          </label>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {['midi', 'soir', 'flexible'].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setFormData({ ...formData, preferredTime: time })}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  formData.preferredTime === time
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-transparent text-muted-foreground hover:border-primary/20'
                }`}
              >
                {time === 'midi' ? 'Déjeuner (11h-14h)' : time === 'soir' ? 'Dîner (18h-21h)' : 'Temps Libre'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background py-6 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:shadow-elegant transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
              Traitement IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Soumettre ma demande
            </>
          )}
        </button>
      </form>
    </div>
  );
}
