import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { submitApplication, PartnerType } from '../agents/partnerScoring';

interface PartnerApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  partnerType: PartnerType;
}

export function PartnerApplicationForm({ isOpen, onClose, partnerType }: PartnerApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitApplication({
        applicant_name: formData.full_name || formData.owner_name || formData.business_name,
        applicant_email: formData.email,
        applicant_phone: formData.phone,
        partner_type: partnerType,
        application_data: formData,
      });

      showSuccess('Candidature envoyée avec succès ! Nous vous contacterons sous 48h.');
      onClose();
      setFormData({});
    } catch (error) {
      showError('Erreur lors de l\'envoi de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderVendorFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'entreprise *
        </label>
        <input
          type="text"
          required
          value={formData.business_name || ''}
          onChange={(e) => updateField('business_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type d'activité *
        </label>
        <select
          required
          value={formData.business_type || ''}
          onChange={(e) => updateField('business_type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Sélectionner...</option>
          <option value="restaurant">Restaurant</option>
          <option value="producer">Producteur</option>
          <option value="merchant">Commerçant</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description de votre activité *
        </label>
        <textarea
          required
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Décrivez vos produits, votre cuisine, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse complète *
        </label>
        <input
          type="text"
          required
          value={formData.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          required
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="+596 696 XX XX XX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro SIRET *
        </label>
        <input
          type="text"
          required
          value={formData.siret || ''}
          onChange={(e) => updateField('siret', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégories de produits *
        </label>
        <input
          type="text"
          required
          value={formData.product_categories || ''}
          onChange={(e) => updateField('product_categories', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Ex: Plats créoles, Produits bio, Viennoiseries..."
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.health_compliance || false}
            onChange={(e) => updateField('health_compliance', e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">
            Je certifie être en conformité sanitaire *
          </span>
        </label>
      </div>
    </>
  );

  const renderDriverFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet *
        </label>
        <input
          type="text"
          required
          value={formData.full_name || ''}
          onChange={(e) => updateField('full_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          required
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="+596 696 XX XX XX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro SIRET (auto-entrepreneur) *
        </label>
        <input
          type="text"
          required
          value={formData.siret || ''}
          onChange={(e) => updateField('siret', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de véhicule *
        </label>
        <select
          required
          value={formData.vehicle_type || ''}
          onChange={(e) => updateField('vehicle_type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Sélectionner...</option>
          <option value="bike">Vélo</option>
          <option value="scooter">Scooter</option>
          <option value="car">Voiture</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro de permis *
        </label>
        <input
          type="text"
          required
          value={formData.license_number || ''}
          onChange={(e) => updateField('license_number', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Disponibilité hebdomadaire *
        </label>
        <input
          type="text"
          required
          value={formData.availability || ''}
          onChange={(e) => updateField('availability', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Ex: Lundi-Vendredi 9h-18h"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.insurance_proof || false}
            onChange={(e) => updateField('insurance_proof', e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">
            Je certifie avoir une assurance responsabilité civile *
          </span>
        </label>
      </div>
    </>
  );

  const renderRelayHostFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom du point relais *
        </label>
        <input
          type="text"
          required
          value={formData.location_name || ''}
          onChange={(e) => updateField('location_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Ex: Épicerie Durand, Bar PMU..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Votre nom *
        </label>
        <input
          type="text"
          required
          value={formData.owner_name || ''}
          onChange={(e) => updateField('owner_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse complète *
        </label>
        <input
          type="text"
          required
          value={formData.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          required
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="+596 696 XX XX XX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Types de stockage disponibles *
        </label>
        <div className="space-y-2">
          {['cold', 'hot', 'dry', 'frozen'].map(type => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.storage_types?.includes(type) || false}
                onChange={(e) => {
                  const current = formData.storage_types || [];
                  updateField('storage_types', e.target.checked
                    ? [...current, type]
                    : current.filter((t: string) => t !== type)
                  );
                }}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {type === 'cold' ? 'Réfrigéré' : type === 'hot' ? 'Chaud' : type === 'dry' ? 'Sec' : 'Congelé'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacité totale (nombre de colis) *
        </label>
        <input
          type="number"
          required
          min="5"
          value={formData.total_capacity || ''}
          onChange={(e) => updateField('total_capacity', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Horaires d'ouverture *
        </label>
        <input
          type="text"
          required
          value={formData.opening_hours || ''}
          onChange={(e) => updateField('opening_hours', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Ex: Lun-Sam 8h-20h"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mesures de sécurité *
        </label>
        <textarea
          required
          value={formData.security_measures || ''}
          onChange={(e) => updateField('security_measures', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Ex: Caméras, local fermé, alarme..."
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.parking_available || false}
            onChange={(e) => updateField('parking_available', e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">Parking disponible</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.pmr_accessible || false}
            onChange={(e) => updateField('pmr_accessible', e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">Accessible PMR</span>
        </label>
      </div>
    </>
  );

  const titleMap = {
    vendor: 'Devenir Vendeur',
    driver: 'Devenir Livreur',
    relay_host: 'Devenir Hôte de Point Relais',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{titleMap[partnerType]}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {partnerType === 'vendor' && renderVendorFields()}
            {partnerType === 'driver' && renderDriverFields()}
            {partnerType === 'relay_host' && renderRelayHostFields()}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Soumettre ma candidature
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
