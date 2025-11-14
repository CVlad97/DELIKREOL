import { useState } from 'react';
import { X, MapPin, User, Building, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserType, BusinessType, VehicleType, StorageType, CompensationType } from '../types';

interface OnboardingFormProps {
  isOpen: boolean;
  onClose: () => void;
  roleType: UserType;
}

export function OnboardingForm({ isOpen, onClose, roleType }: OnboardingFormProps) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [vendorData, setVendorData] = useState({
    business_name: '',
    business_type: 'restaurant' as BusinessType,
    description: '',
    address: '',
    phone: '',
    opening_hours: '',
    delivery_radius_km: 10,
  });

  const [relayData, setRelayData] = useState({
    business_name: '',
    address: '',
    latitude: '',
    longitude: '',
    hours: '',
    capacity_notes: '',
    parking_available: false,
    pmr_accessible: false,
    security_notes: '',
    compensation_type: 'per_pickup' as CompensationType,
    compensation_amount: 3,
    storage_cold: false,
    storage_hot: false,
    storage_dry: false,
    storage_frozen: false,
  });

  const [driverData, setDriverData] = useState({
    vehicle_type: 'scooter' as VehicleType,
    license_number: '',
    vehicle_registration: '',
    insurance_number: '',
    bank_iban: '',
    bank_bic: '',
  });

  if (!isOpen || roleType === 'customer' || roleType === 'admin') return null;

  const tabs = [
    { id: 0, title: 'Informations générales', icon: User },
    { id: 1, title: roleType === 'vendor' ? 'Votre activité' : roleType === 'relay_host' ? 'Votre point relais' : 'Votre véhicule', icon: roleType === 'vendor' ? Building : roleType === 'relay_host' ? MapPin : Truck },
    { id: 2, title: 'Paiement', icon: CreditCard },
  ];

  const handleVendorSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: user!.id,
          business_name: vendorData.business_name,
          business_type: vendorData.business_type,
          description: vendorData.description,
          address: vendorData.address,
          phone: vendorData.phone,
          opening_hours: vendorData.opening_hours ? JSON.parse(vendorData.opening_hours) : null,
          delivery_radius_km: vendorData.delivery_radius_km,
          commission_rate: 20,
          is_active: false,
        });

      if (vendorError) throw vendorError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: 'vendor' })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      alert('Votre demande a été soumise avec succès ! Notre équipe va la vérifier et vous contacter sous 48h.');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleRelayHostSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: relayPoint, error: relayError } = await supabase
        .from('relay_points')
        .insert({
          name: relayData.business_name,
          address: relayData.address,
          latitude: parseFloat(relayData.latitude),
          longitude: parseFloat(relayData.longitude),
          type: 'partner',
          hours: relayData.hours ? JSON.parse(relayData.hours) : null,
          is_active: false,
          owner_id: user!.id,
          capacity_notes: relayData.capacity_notes,
          parking_available: relayData.parking_available,
          pmr_accessible: relayData.pmr_accessible,
          security_notes: relayData.security_notes,
        })
        .select()
        .single();

      if (relayError) throw relayError;

      const { error: hostError } = await supabase
        .from('relay_point_hosts')
        .insert({
          user_id: user!.id,
          relay_point_id: relayPoint.id,
          business_name: relayData.business_name,
          compensation_type: relayData.compensation_type,
          compensation_amount: relayData.compensation_amount,
          identity_verified: false,
          sanitary_compliance: false,
          bank_account_verified: false,
        });

      if (hostError) throw hostError;

      const storageTypes: Array<{ type: StorageType; enabled: boolean }> = [
        { type: 'cold', enabled: relayData.storage_cold },
        { type: 'hot', enabled: relayData.storage_hot },
        { type: 'dry', enabled: relayData.storage_dry },
        { type: 'frozen', enabled: relayData.storage_frozen },
      ];

      for (const storage of storageTypes) {
        if (storage.enabled) {
          await supabase.from('storage_capacities').insert({
            relay_point_id: relayPoint.id,
            storage_type: storage.type,
            total_capacity: 50,
            current_usage: 0,
          });
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: 'relay_host' })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      alert('Votre demande a été soumise avec succès ! Notre équipe va la vérifier et vous contacter sous 48h.');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user!.id,
          vehicle_type: driverData.vehicle_type,
          license_number: driverData.license_number,
          is_available: false,
        });

      if (driverError) throw driverError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: 'driver' })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      alert('Votre demande a été soumise avec succès ! Notre équipe va la vérifier et vous contacter sous 48h.');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleType === 'vendor') {
      await handleVendorSubmit();
    } else if (roleType === 'relay_host') {
      await handleRelayHostSubmit();
    } else if (roleType === 'driver') {
      await handleDriverSubmit();
    }
  };

  const renderVendorForm = () => {
    if (currentTab === 0) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de votre entreprise *
            </label>
            <input
              type="text"
              value={vendorData.business_name}
              onChange={(e) => setVendorData({ ...vendorData, business_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'activité *
            </label>
            <select
              value={vendorData.business_type}
              onChange={(e) => setVendorData({ ...vendorData, business_type: e.target.value as BusinessType })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="restaurant">Restaurant</option>
              <option value="producer">Producteur</option>
              <option value="merchant">Commerçant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone *
            </label>
            <input
              type="tel"
              value={vendorData.phone}
              onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0696 XX XX XX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de votre activité
            </label>
            <textarea
              value={vendorData.description}
              onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Décrivez votre spécialité, vos produits..."
            />
          </div>
        </div>
      );
    }

    if (currentTab === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète *
            </label>
            <input
              type="text"
              value={vendorData.address}
              onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Adresse, Code postal, Ville"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rayon de livraison (km)
            </label>
            <input
              type="number"
              value={vendorData.delivery_radius_km}
              onChange={(e) => setVendorData({ ...vendorData, delivery_radius_km: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horaires d'ouverture (JSON)
            </label>
            <textarea
              value={vendorData.opening_hours}
              onChange={(e) => setVendorData({ ...vendorData, opening_hours: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              rows={4}
              placeholder='{"lundi": "9h-18h", "mardi": "9h-18h"}'
            />
          </div>
        </div>
      );
    }

    if (currentTab === 2) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Vos revenus</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">80%</div>
            <p className="text-gray-700">de chaque vente vous revient</p>
            <p className="text-sm text-gray-600 mt-2">Commission plateforme : 20%</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Les paiements seront effectués automatiquement sur votre compte bancaire après validation de votre inscription.
            </p>
          </div>
        </div>
      );
    }
  };

  const renderRelayHostForm = () => {
    if (currentTab === 0) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du point relais *
            </label>
            <input
              type="text"
              value={relayData.business_name}
              onChange={(e) => setRelayData({ ...relayData, business_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète *
            </label>
            <input
              type="text"
              value={relayData.address}
              onChange={(e) => setRelayData({ ...relayData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adresse, Code postal, Ville"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="text"
                value={relayData.latitude}
                onChange={(e) => setRelayData({ ...relayData, latitude: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="14.6415"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="text"
                value={relayData.longitude}
                onChange={(e) => setRelayData({ ...relayData, longitude: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-61.0242"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horaires d'ouverture (JSON)
            </label>
            <textarea
              value={relayData.hours}
              onChange={(e) => setRelayData({ ...relayData, hours: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={3}
              placeholder='{"lundi": "8h-20h", "mardi": "8h-20h"}'
            />
          </div>
        </div>
      );
    }

    if (currentTab === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de stockage disponibles
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={relayData.storage_cold}
                  onChange={(e) => setRelayData({ ...relayData, storage_cold: e.target.checked })}
                  className="rounded text-blue-600 mr-2"
                />
                <span className="text-gray-700">Réfrigéré (0-4°C)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={relayData.storage_hot}
                  onChange={(e) => setRelayData({ ...relayData, storage_hot: e.target.checked })}
                  className="rounded text-blue-600 mr-2"
                />
                <span className="text-gray-700">Maintien au chaud (60-65°C)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={relayData.storage_dry}
                  onChange={(e) => setRelayData({ ...relayData, storage_dry: e.target.checked })}
                  className="rounded text-blue-600 mr-2"
                />
                <span className="text-gray-700">Sec (température ambiante)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={relayData.storage_frozen}
                  onChange={(e) => setRelayData({ ...relayData, storage_frozen: e.target.checked })}
                  className="rounded text-blue-600 mr-2"
                />
                <span className="text-gray-700">Congelé (-18°C)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes sur la capacité
            </label>
            <textarea
              value={relayData.capacity_notes}
              onChange={(e) => setRelayData({ ...relayData, capacity_notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ex: Peut stocker jusqu'à 30 colis..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={relayData.parking_available}
                onChange={(e) => setRelayData({ ...relayData, parking_available: e.target.checked })}
                className="rounded text-blue-600 mr-2"
              />
              <span className="text-gray-700">Parking disponible</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={relayData.pmr_accessible}
                onChange={(e) => setRelayData({ ...relayData, pmr_accessible: e.target.checked })}
                className="rounded text-blue-600 mr-2"
              />
              <span className="text-gray-700">Accessible PMR</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes de sécurité
            </label>
            <textarea
              value={relayData.security_notes}
              onChange={(e) => setRelayData({ ...relayData, security_notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ex: Local sécurisé, caméras de surveillance..."
            />
          </div>
        </div>
      );
    }

    if (currentTab === 2) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rémunération
            </label>
            <select
              value={relayData.compensation_type}
              onChange={(e) => setRelayData({ ...relayData, compensation_type: e.target.value as CompensationType })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="per_pickup">Par retrait</option>
              <option value="per_storage">Par stockage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant souhaité (€)
            </label>
            <input
              type="number"
              value={relayData.compensation_amount}
              onChange={(e) => setRelayData({ ...relayData, compensation_amount: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="10"
              step="0.5"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Vos revenus</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">2-5€</div>
            <p className="text-gray-700">par colis stocké et récupéré</p>
            <p className="text-sm text-gray-600 mt-2">Paiement mensuel sur votre compte</p>
          </div>
        </div>
      );
    }
  };

  const renderDriverForm = () => {
    if (currentTab === 0) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de véhicule *
            </label>
            <select
              value={driverData.vehicle_type}
              onChange={(e) => setDriverData({ ...driverData, vehicle_type: e.target.value as VehicleType })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="bike">Vélo</option>
              <option value="scooter">Scooter</option>
              <option value="car">Voiture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de permis *
            </label>
            <input
              type="text"
              value={driverData.license_number}
              onChange={(e) => setDriverData({ ...driverData, license_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      );
    }

    if (currentTab === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immatriculation du véhicule
            </label>
            <input
              type="text"
              value={driverData.vehicle_registration}
              onChange={(e) => setDriverData({ ...driverData, vehicle_registration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="XX-XXX-XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro d'assurance
            </label>
            <input
              type="text"
              value={driverData.insurance_number}
              onChange={(e) => setDriverData({ ...driverData, insurance_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Vous devrez fournir une copie de votre carte grise et assurance lors de la validation.
            </p>
          </div>
        </div>
      );
    }

    if (currentTab === 2) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={driverData.bank_iban}
              onChange={(e) => setDriverData({ ...driverData, bank_iban: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BIC
            </label>
            <input
              type="text"
              value={driverData.bank_bic}
              onChange={(e) => setDriverData({ ...driverData, bank_bic: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="XXXXXXXX"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Vos revenus</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">70%</div>
            <p className="text-gray-700">des frais de livraison (5-15€ par course)</p>
            <p className="text-sm text-gray-600 mt-2">Paiement instantané après chaque livraison</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`sticky top-0 bg-gradient-to-r ${
          roleType === 'vendor' ? 'from-green-500 to-emerald-600' :
          roleType === 'relay_host' ? 'from-blue-500 to-cyan-500' :
          'from-teal-500 to-green-600'
        } text-white p-6 rounded-t-3xl z-10`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {roleType === 'vendor' ? 'Devenir Vendeur' :
                 roleType === 'relay_host' ? 'Devenir Point Relais' :
                 'Devenir Livreur'}
              </h2>
              <p className="text-white text-opacity-90">
                Complétez votre inscription en quelques étapes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentTab === tab.id
                      ? 'bg-white text-gray-900'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">{tab.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {roleType === 'vendor' && renderVendorForm()}
          {roleType === 'relay_host' && renderRelayHostForm()}
          {roleType === 'driver' && renderDriverForm()}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {currentTab > 0 && (
              <button
                type="button"
                onClick={() => setCurrentTab(currentTab - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
            )}

            {currentTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentTab(currentTab + 1)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  roleType === 'vendor' ? 'bg-green-600 hover:bg-green-700' :
                  roleType === 'relay_host' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-colors disabled:opacity-50 ${
                  roleType === 'vendor' ? 'bg-green-600 hover:bg-green-700' :
                  roleType === 'relay_host' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {loading ? 'Envoi en cours...' : 'Soumettre ma candidature'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
