import { Store, MapPin, Truck, Shield, ShoppingBag } from 'lucide-react';
import { UserType } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: UserType) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const roles = [
    {
      type: 'vendor' as UserType,
      title: 'Vendeur',
      description: 'Restaurant, producteur ou traiteur',
      highlight: 'Gagnez 80% par vente',
      icon: Store,
      color: 'from-green-500 to-emerald-600',
    },
    {
      type: 'relay_host' as UserType,
      title: 'Point Relais',
      description: 'Hébergez des colis et générez des revenus',
      highlight: '2-5€ par colis',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'driver' as UserType,
      title: 'Livreur',
      description: 'Livrez à votre rythme, soyez payé immédiatement',
      highlight: '70% des frais de livraison',
      icon: Truck,
      color: 'from-teal-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Delikreol
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Rejoignez l'économie créole locale
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Développez votre activité et générez des revenus en rejoignant notre réseau de distribution alimentaire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.type}
                onClick={() => onSelectRole(role.type)}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                <div className="p-8 relative">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {role.title}
                  </h3>

                  <div className="mb-4">
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-br ${role.color} text-white font-bold text-sm`}>
                      {role.highlight}
                    </div>
                  </div>

                  <p className="text-gray-600 text-base leading-relaxed mb-6">
                    {role.description}
                  </p>

                  <div className="flex items-center justify-center text-base font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                    En savoir plus
                    <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Pourquoi rejoindre Delikreol ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold text-gray-900 mb-1">Revenus garantis</h4>
              <p className="text-sm text-gray-600">Paiements immédiats après chaque transaction</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌴</div>
              <h4 className="font-bold text-gray-900 mb-1">Impact local</h4>
              <p className="text-sm text-gray-600">Soutenez l'économie martiniquaise</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-bold text-gray-900 mb-1">Zéro frais</h4>
              <p className="text-sm text-gray-600">Inscription gratuite, aucun frais cachés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
