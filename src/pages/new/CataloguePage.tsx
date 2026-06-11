import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  MapPin,
  ChefHat,
  Plus,
  SlidersHorizontal,
  ShoppingBag,
  Eye,
  Tag,
  Clock,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { mockProducts, type LocalProduct } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import {
  martiniqueCommunes,
  findCommune,
  normalizeCommuneQuery,
} from '../../data/martiniqueCommunes';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../lib/supabase';

const ALL_CATEGORIES = [
  { id: 'tous', name: 'Tous' },
  { id: 'plats', name: 'Plats' },
  { id: 'snacking', name: 'Snacking' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'bowl', name: 'Bowl' },
  { id: 'pates', name: 'Pâtes' },
  { id: 'traiteur-evenementiel', name: 'Traiteur événementiel' },
  { id: 'commandes-entreprise', name: 'Commandes entreprise' },
];

const BUDGET_RANGES = [
  { label: 'Tous les prix', min: 0, max: Infinity },
  { label: 'Moins de 10€', min: 0, max: 10 },
  { label: '10€ – 15€', min: 10, max: 15 },
  { label: '15€ – 25€', min: 15, max: 25 },
  { label: 'Plus de 25€', min: 25, max: Infinity },
];

function localProductToCartProduct(p: LocalProduct): Product {
  return {
    id: p.id,
    vendor_id: p.vendor,
    name: p.name,
    description: p.description ?? null,
    category: p.category,
    price: p.price,
    image_url: p.image ?? null,
    is_available: p.available !== false,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };
}

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') ?? 'tous');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'tous' | 'retrait' | 'livraison'>('tous');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<'default' | 'commune' | 'prix-croissant' | 'prix-decroissant' | 'disponible'>('default');

  // Build extended product list with traiteur menu items
  const allProducts: LocalProduct[] = useMemo(() => {
    const traiteurProducts: LocalProduct[] = traiteurSpaces.flatMap((space) =>
      space.menuItems.map((item) => ({
        id: `${space.slug}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        vendor: space.name,
        price: item.price,
        category: item.category,
        image: item.image ?? undefined,
        description: item.description,
        zone: space.zone,
        available: true,
        featured: item.featured,
      }))
    );

    // Combine mockProducts and traiteur menu items (avoid duplicates by id)
    const ids = new Set(mockProducts.map((p) => p.id));
    const merged = [...mockProducts];
    for (const p of traiteurProducts) {
      if (!ids.has(p.id)) {
        merged.push(p);
        ids.add(p.id);
      }
    }
    return merged;
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let results = allProducts;

    // Search query — match name, vendor, description, zone (commune-tolerant)
    if (searchQuery.trim()) {
      const q = normalizeCommuneQuery(searchQuery);
      results = results.filter((p) => {
        const haystack = normalizeCommuneQuery(
          `${p.name} ${p.vendor} ${p.description ?? ''} ${p.zone ?? ''} ${p.category}`
        );
        if (haystack.includes(q)) return true;
        // Try commune-tolerant match on zone
        if (p.zone) {
          const commune = findCommune(searchQuery);
          if (commune) {
            const zoneNorm = normalizeCommuneQuery(p.zone);
            const communeNorm = normalizeCommuneQuery(commune.name);
            return zoneNorm.includes(communeNorm);
          }
        }
        return false;
      });
    }

    // Category filter
    if (selectedCategory !== 'tous') {
      const catName = ALL_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? '';
      results = results.filter(
        (p) => normalizeCommuneQuery(p.category) === normalizeCommuneQuery(catName)
      );
    }

    // Commune filter
    if (selectedCommune) {
      const commune = findCommune(selectedCommune);
      if (commune) {
        const communeNorm = normalizeCommuneQuery(commune.name);
        results = results.filter((p) => {
          if (!p.zone) return false;
          return normalizeCommuneQuery(p.zone).includes(communeNorm);
        });
      }
    }

    // Budget range filter
    const budget = BUDGET_RANGES[selectedBudgetIndex];
    if (budget) {
      results = results.filter(
        (p) => p.price >= budget.min && p.price < budget.max
      );
    }

    // Availability
    if (showAvailableOnly) {
      results = results.filter((p) => p.available !== false);
    }

    // Sort
    if (sortMode === 'prix-croissant') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'prix-decroissant') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'commune' && selectedCommune) {
      results.sort((a, b) => {
        const aMatch = a.zone?.toLowerCase().includes(selectedCommune.toLowerCase()) ? 0 : 1;
        const bMatch = b.zone?.toLowerCase().includes(selectedCommune.toLowerCase()) ? 0 : 1;
        return aMatch - bMatch;
      });
    } else if (sortMode === 'disponible') {
      results.sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1));
    }

    return results;
  }, [allProducts, searchQuery, selectedCategory, selectedCommune, selectedBudgetIndex, showAvailableOnly, selectedMode, sortMode]);

  const handleAddToCart = (product: LocalProduct) => {
    addItem(localProductToCartProduct(product));
    showSuccess(`${product.name} ajouté au panier`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('tous');
    setSelectedCommune('');
    setSelectedBudgetIndex(0);
    setSelectedMode('tous');
    setShowAvailableOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'tous' ||
    selectedCommune !== '' ||
    selectedBudgetIndex !== 0 ||
    selectedMode !== 'tous' ||
    showAvailableOnly;

  useEffect(() => {
    document.title = 'Catalogue — DeliKreol | Plats & traiteurs en Martinique';
  }, []);

  return (
    <Layout>
      <div className="bg-[#FFFBF0] min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-black mb-3">Catalogue</h1>
            <p className="text-orange-100 text-lg mb-6">
              Trouvez votre prochain repas parmi nos traiteurs partenaires
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plat, traiteur ou commune..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-800 placeholder-gray-400 bg-white border-0 outline-none shadow-sm focus:ring-4 focus:ring-white/30 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filters toggle + active count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  showFilters
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Réinitialiser
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-700">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'résultat' : 'résultats'}
            </p>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tri par commune */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Trier par
                  </label>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm bg-white outline-none"
                  >
                    <option value="default">Pertinence</option>
                    <option value="commune">Ma commune</option>
                    <option value="prix-croissant">Prix croissant</option>
                    <option value="prix-decroissant">Prix décroissant</option>
                    <option value="disponible">Disponible maintenant</option>
                  </select>
                </div>
                {/* Commune */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Commune
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm bg-white outline-none"
                  >
                    <option value="">Toutes les communes</option>
                    {martiniqueCommunes.map((commune) => (
                      <option key={commune.name} value={commune.name}>
                        {commune.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Budget
                  </label>
                  <select
                    value={selectedBudgetIndex}
                    onChange={(e) => setSelectedBudgetIndex(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm bg-white outline-none"
                  >
                    {BUDGET_RANGES.map((range, i) => (
                      <option key={i} value={i}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <ShoppingBag className="w-4 h-4 inline mr-1" />
                    Mode
                  </label>
                  <div className="flex gap-2">
                    {(['tous', 'retrait', 'livraison'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                          selectedMode === mode
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Disponibilité
                  </label>
                  <button
                    onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      showAvailableOnly
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {showAvailableOnly ? '✓ Disponible uniquement' : 'Tout afficher'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ChefHat className="w-10 h-10" />
                        <span className="text-xs font-medium">Photo à confirmer</span>
                      </div>
                    )}
                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.available !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {product.available !== false ? 'Disponible' : 'Sur confirmation'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-orange-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-0.5">{product.vendor}</p>
                    {product.zone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" />
                        {product.zone}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                                              <span className="text-2xl font-black text-gray-900">
                                                {product.price.toFixed(2).replace('.', ',')} €
                                              </span>
                                              <span className="text-[10px] text-gray-400 block">Prix DELIKREOL</span>
                                            </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02]"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter au panier
                        </button>
                        <Link
                          to={`/produit/${product.id}`}
                          className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-all"
                          title="Détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No results */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6">
                <Search className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Essayez d'ajuster vos filtres ou votre recherche. Nos traiteurs couvrent de nombreuses communes en Martinique.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
