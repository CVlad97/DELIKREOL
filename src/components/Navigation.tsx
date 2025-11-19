import { Home, Store, MapPin, Truck, Settings, User, LogIn, FileText, Heart } from 'lucide-react';
import { UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

interface NavigationProps {
  userType: UserType;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ userType, currentView, onNavigate }: NavigationProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const getMenuItems = () => {
    switch (userType) {
      case 'customer':
        const customerItems = [
          { id: 'home', label: 'Accueil', icon: Home },
          { id: 'map', label: 'Carte', icon: MapPin },
        ];
        if (user) {
          customerItems.push(
            { id: 'requests', label: 'Demandes', icon: FileText },
            { id: 'community-fund', label: 'Fonds', icon: Heart },
            { id: 'orders', label: 'Commandes', icon: Store },
            { id: 'profile', label: 'Profil', icon: User }
          );
        } else {
          customerItems.push({ id: 'auth', label: 'Connexion', icon: LogIn });
        }
        return customerItems;
      case 'vendor':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'products', label: 'Produits', icon: Store },
          { id: 'orders', label: 'Commandes', icon: Store },
          { id: 'stats', label: 'Statistiques', icon: Settings },
        ];
      case 'relay_host':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'deposits', label: 'Dépôts', icon: MapPin },
          { id: 'capacity', label: 'Capacité', icon: Store },
          { id: 'earnings', label: 'Gains', icon: Settings },
        ];
      case 'driver':
        return [
          { id: 'available', label: 'Courses', icon: Truck },
          { id: 'active', label: 'En cours', icon: MapPin },
          { id: 'history', label: 'Historique', icon: Store },
          { id: 'earnings', label: 'Gains', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Vue d\'ensemble', icon: Home },
          { id: 'requests', label: 'Demandes', icon: FileText },
          { id: 'partners', label: 'Partenaires', icon: Store },
          { id: 'guide', label: 'Guide & Test', icon: Settings },
          { id: 'community-fund', label: 'Fonds', icon: Heart },
          { id: 'users', label: 'Utilisateurs', icon: User },
          { id: 'relay-points', label: 'Points Relais', icon: MapPin },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'auth') {
                    setShowAuth(true);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          initialMode="signup"
        />
      )}
    </>
  );
}
