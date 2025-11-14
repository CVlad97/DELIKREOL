import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ShoppingCart, User, LogOut, Moon, Sun, Users, Zap, Shield } from 'lucide-react';
import { supabase, Vendor } from '../lib/supabase';
import { VendorCard } from '../components/VendorCard';
import { AuthModal } from '../components/AuthModal';
import { Cart } from '../components/Cart';
import { CheckoutModal } from '../components/CheckoutModal';
import { Onboarding } from '../components/Onboarding';
import { UserProfile } from '../components/UserProfile';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BecomePartner } from './BecomePartner';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

export function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_completed');
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [showBecomePartner, setShowBecomePartner] = useState(false);

  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, selectedType]);

  const loadVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVendors(data);
    }
    setLoading(false);
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((v) => v.business_type === selectedType);
    }

    setFilteredVendors(filtered);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (showBecomePartner) {
    return <BecomePartner onBack={() => setShowBecomePartner(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 border-b border-emerald-700 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em' }}>
                  DELI<span className="text-yellow-300">KRÉOL</span>
                </h1>
                <p className="text-sm text-emerald-100 mt-1 font-medium tracking-wide">🌴 Martinique · Livraison Locale 🌴</p>
              </div>
            </div>

            <div className="absolute right-4 top-4 flex items-center gap-3">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              >
                <ShoppingCart size={24} className="text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                    <p className="text-xs text-emerald-100">{profile?.user_type}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    title="Déconnexion"
                  >
                    <LogOut size={20} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-semibold shadow-md"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <MapPin size={20} className="text-emerald-600" />
            <input
              type="text"
              placeholder="Fort-de-France, Martinique"
              className="bg-transparent flex-1 outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              La Plateforme Logistique Locale Intelligente
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              DELIKREOL n'est pas qu'une marketplace : c'est un écosystème collaboratif qui mutualise
              la logistique locale avec des points relais de proximité et une optimisation par IA.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Réseau Mutualisé</h3>
              <p className="text-sm text-gray-600">
                Points relais partagés entre tous les vendeurs pour une logistique optimale
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Optimisation IA</h3>
              <p className="text-sm text-gray-600">
                Tournées intelligentes et affectations automatiques pour livraisons rapides
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Écosystème Local</h3>
              <p className="text-sm text-gray-600">
                Soutenez les producteurs et commerces martiniquais avec chaque commande
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowBecomePartner(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold"
            >
              Devenir Partenaire
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-sm">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un restaurant, producteur..."
              className="flex-1 outline-none text-gray-700"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter size={20} className="text-gray-600 flex-shrink-0" />
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedType('restaurant')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedType === 'restaurant'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setSelectedType('producer')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedType === 'producer'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Producteurs
            </button>
            <button
              onClick={() => setSelectedType('merchant')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedType === 'merchant'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Commerçants
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun vendeur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onClick={() => setSelectedVendor(vendor.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {selectedVendor && (
        <VendorDetailModal
          vendorId={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}

      <WhatsAppButton
        phoneNumber="+596696000000"
        message="Bonjour, je souhaite passer une commande sur Delikreol !"
      />
    </div>
  );
}

function VendorDetailModal({ vendorId, onClose }: { vendorId: string; onClose: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorAndProducts();
  }, [vendorId]);

  const loadVendorAndProducts = async () => {
    setLoading(true);

    const [vendorResult, productsResult] = await Promise.all([
      supabase.from('vendors').select('*').eq('id', vendorId).single(),
      supabase.from('products').select('*').eq('vendor_id', vendorId).eq('is_available', true),
    ]);

    if (vendorResult.data) setVendor(vendorResult.data);
    if (productsResult.data) setProducts(productsResult.data);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-4xl sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{vendor?.business_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun produit disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
