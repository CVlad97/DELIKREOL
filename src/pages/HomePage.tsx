import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ShoppingCart, User, LogOut, Users, Zap, Shield, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase, Vendor } from '../lib/supabase';
import { VendorCard } from '../components/VendorCard';
import { ProductCard } from '../components/ProductCard';
import { AuthModal } from '../components/AuthModal';
import { Cart } from '../components/Cart';
import { CheckoutModal } from '../components/CheckoutModal';
import { Onboarding } from '../components/Onboarding';
import { UserProfile } from '../components/UserProfile';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BecomePartner } from './BecomePartner';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, selectedType]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVendors(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des vendeurs. Veuillez réessayer.');
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <header className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 border-b-4 border-yellow-400 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-2 animate-pulse">
                  <img
                    src="/capture_d'ecran_2025-12-15_144525.png"
                    alt="DELIKREOL Logo"
                    className="h-16 md:h-24 w-auto drop-shadow-2xl transition-transform hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs md:text-sm text-white font-black tracking-wider bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 px-4 md:px-6 py-2 rounded-full shadow-xl inline-block animate-pulse">
                  ⚡ Saveurs Local Express ⚡
                </div>
              </div>
            </div>

            <div className="absolute right-2 md:right-4 top-3 md:top-4 flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm"
              >
                <ShoppingCart size={20} className="text-white md:w-6 md:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white drop-shadow">{profile?.full_name}</p>
                    <p className="text-xs text-yellow-200 font-medium">{profile?.user_type}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm"
                    title="Déconnexion"
                  >
                    <LogOut size={18} className="text-white md:w-5 md:h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-red-600 px-3 md:px-4 py-2 rounded-xl hover:bg-yellow-50 transition-all transform hover:scale-105 font-bold shadow-lg text-sm"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/95 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm border-2 border-yellow-200">
            <MapPin size={20} className="text-red-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Fort-de-France, Martinique"
              className="bg-transparent flex-1 outline-none text-gray-800 placeholder-gray-500 font-medium"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl p-6 md:p-8 mb-8 border-2 border-orange-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-3">
              La Plateforme Logistique Locale Intelligente
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              DELIKREOL n'est pas qu'une marketplace : c'est un écosystème collaboratif qui mutualise
              la logistique locale avec des points relais de proximité et une optimisation par IA.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Réseau Mutualisé</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Points relais partagés entre tous les vendeurs pour une logistique optimale
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Optimisation IA</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tournées intelligentes et affectations automatiques pour livraisons rapides
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Écosystème Local</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Soutenez les producteurs et commerces martiniquais avec chaque commande
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowBecomePartner(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-black shadow-xl hover:shadow-2xl text-lg"
            >
              Devenir Partenaire
            </button>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-lg border-2 border-orange-100 focus-within:border-orange-400 transition-colors">
            <Search size={22} className="text-orange-500 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un restaurant, producteur..."
              className="flex-1 outline-none text-gray-800 font-medium placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={22} className="text-orange-600 flex-shrink-0" />
            <button
              onClick={() => setSelectedType('all')}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedType('restaurant')}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedType === 'restaurant'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setSelectedType('producer')}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedType === 'producer'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200'
              }`}
            >
              Producteurs
            </button>
            <button
              onClick={() => setSelectedType('merchant')}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedType === 'merchant'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200'
              }`}
            >
              Commerçants
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadVendors}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-lg"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium text-lg">Chargement des saveurs locales...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Aucun résultat</h3>
            <p className="text-gray-600 font-medium mb-6">Aucun vendeur ne correspond à votre recherche.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-lg"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor, index) => (
              <div
                key={vendor.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VendorCard
                  vendor={vendor}
                  onClick={() => setSelectedVendor(vendor.id)}
                />
              </div>
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
      supabase.from('vendors').select('*').eq('id', vendorId).maybeSingle(),
      supabase.from('products').select('*').eq('vendor_id', vendorId).eq('is_available', true),
    ]);

    if (vendorResult.data) setVendor(vendorResult.data);
    if (productsResult.data) setProducts(productsResult.data);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl border-t-4 border-orange-500">
        <div className="p-5 border-b-2 border-orange-100 flex items-center justify-between sticky top-0 bg-gradient-to-r from-white to-orange-50">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">{vendor?.business_name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all transform hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-white to-orange-50">
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-medium text-lg">Chargement des produits...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">Ce vendeur n'a pas encore de produits en ligne.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
