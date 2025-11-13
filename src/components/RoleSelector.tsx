import { Store, MapPin, Truck, Shield, ShoppingBag } from 'lucide-react';
import { UserType } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: UserType) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const roles = [
    {
      type: 'customer' as UserType,
      title: 'Client',
      description: 'Commander des repas créoles délicieux',
      icon: ShoppingBag,
      color: 'from-orange-500 to-red-500',
    },
    {
      type: 'vendor' as UserType,
      title: 'Vendeur',
      description: 'Restaurant, producteur ou traiteur',
      icon: Store,
      color: 'from-green-500 to-emerald-600',
    },
    {
      type: 'relay_host' as UserType,
      title: 'Point Relais',
      description: 'Héberger et gagner de l\'argent',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'driver' as UserType,
      title: 'Livreur',
      description: 'Livrer et être payé immédiatement',
      icon: Truck,
      color: 'from-purple-500 to-pink-500',
    },
    {
      type: 'admin' as UserType,
      title: 'Administrateur',
      description: 'Gérer la plateforme',
      icon: Shield,
      color: 'from-gray-700 to-gray-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Delikreol
          </h1>
          <p className="text-xl text-gray-700">
            Plateforme de repas créoles en Martinique
          </p>
          <p className="text-gray-600 mt-2">
            Sélectionnez votre rôle pour continuer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.type}
                onClick={() => onSelectRole(role.type)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                <div className="p-8 relative">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {role.title}
                  </h3>

                  <p className="text-gray-600">
                    {role.description}
                  </p>

                  <div className="mt-6 flex items-center justify-center text-sm font-medium text-gray-500 group-hover:text-orange-600 transition-colors">
                    Accéder
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>🌴 Distribution locale • 🍽️ Repas créoles authentiques • 🚀 Économie circulaire</p>
        </div>
      </div>
    </div>
  );
}
