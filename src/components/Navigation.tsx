import { Home, Store, MapPin, Truck, Settings, User, LogIn, FileText, Heart, Package, Activity } from 'lucide-react';
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
          { id: 'operations', label: 'Operations', icon: Activity },
          { id: 'catalog', label: 'Catalogue', icon: Package },
          { id: 'requests', label: 'Demandes', icon: FileText },
          { id: 'partners', label: 'Partenaires', icon: Store },
          { id: 'map', label: 'Carte', icon: MapPin },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40 pb-safe">
        <div className="flex justify-around items-center h-20 max-w-screen-xl mx-auto px-4">
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
                className={`group relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full animate-fadeIn" />
                )}
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-primary/10' : 'group-hover:bg-muted'}`}>
                  <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <span className={`text-[10px] mt-1 font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
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
