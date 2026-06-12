import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Handshake,
  FileText,
  MessageCircle,
  ChefHat,
  Truck,
  Clock,
  MapPin,
  ArrowRight,
  Utensils,
  Plus,
  Sparkles,
  Users,
  Heart,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { mockProducts, type LocalProduct } from '../../data/mockCatalog';
import { traiteurSpaces, formatEuro } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';

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

const HOW_IT_WORKS_STEPS = [
  {
    icon: Utensils,
    title: 'Choisissez',
    description: 'Parcourez le catalogue, trouvez un plat ou un traiteur près de chez vous.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: MessageCircle,
    title: 'Confirmez sur le site',
    description: 'Votre commande est préparée et confirmée directement sur DELIKREOL. Suivi et support inclus.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Truck,
    title: 'Récupérez ou recevez',
    description: 'Retrait sur place ou livraison selon la disponibilité du prestataire.',
    color: 'bg-amber-100 text-amber-600',
  },
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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const featuredProducts = mockProducts.filter((p) => p.featured);
  const featuredTraiteurs = traiteurSpaces.slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalogue');
    }
  };

  const handleAddToCart = (product: LocalProduct) => {
    addItem(localProductToCartProduct(product));
    showSuccess(`${product.name} ajouté au panier`);
  };

  useEffect(() => {
    document.title = 'DeliKreol — Le goût local, simple à commander | Martinique';
  }, []);

  return (
    <Layout>
      {/* Hero Section — Style original DeliKreol */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-[#FFFBF0]">
        {/* Madras pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}branding/logo-madras.svg)`,
            backgroundSize: '120px',
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Logo cloche */}
            <div className="hidden md:flex justify-center">
              <img
                src={`${import.meta.env.BASE_URL}assets/hero-illustration.svg`}
                alt="DELIKREOL"
                className="w-full max-w-md h-auto drop-shadow-2xl"
              />
            </div>
            {/* Text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                LOCAL PREMIUM
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4 ml-2">
                🧪 Phase pilote
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                <span className="text-orange-500">Choisis</span> ton plat.
                <br />
                <span className="text-amber-500">Confirme</span> ta commande.
                <br />
                <span className="text-emerald-500">Récupère</span> ou reçois.
              </h1>
              <p className="text-base text-gray-500 mb-6 max-w-lg mx-auto md:mx-0">
                Commandez local en Martinique. Retrait, point relais ou livraison programmée.
              </p>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                <Link
                  to="/catalogue"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-base"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Commander maintenant
                </Link>
                <Link
                  to="/devenir-partenaire"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-2xl border-2 border-orange-200 transition-all hover:scale-105 text-base"
                >
                  Je suis traiteur
                </Link>
                <Link
                  to="/statut-commande"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-2xl border-2 border-amber-200 transition-all hover:scale-105 text-sm"
                >
                  Suivre ma commande
                </Link>
              </div>
              {/* Steps */}
              <div className="flex items-center justify-center md:justify-start gap-4 pt-4 border-t border-orange-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">1</span>
                  Choisis
                </div>
                <span className="text-gray-300 text-xs">→</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">2</span>
                  Confirme
                </div>
                <span className="text-gray-300 text-xs">→</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">3</span>
                  Récupère
                </div>
              </div>
            </div>

            {/* Support WhatsApp */}
            <div className="flex justify-center pb-8">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur DELIKREOL.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" fill="white" />
                Besoin d'aide ? Support WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-lg">3 étapes simples pour commander</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative text-center p-8 rounded-3xl bg-gradient-to-b from-white to-orange-50/30 border border-orange-100 hover:border-orange-200 hover:shadow-lg transition-all group"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">
                    {index + 1}
                  </div>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Traiteurs */}
      {featuredTraiteurs.length > 0 && (
        <section className="py-16 md:py-20 bg-[#FFFBF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  Nos traiteurs partenaires
                </h2>
                <p className="text-gray-500 text-lg">
                  Des artisans locaux, passionnés et engagés
                </p>
              </div>
              <Link
                to="/catalogue"
                className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Voir tous
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {featuredTraiteurs.map((traiteur) => (
                <Link
                  key={traiteur.slug}
                  to={`/traiteur/${traiteur.slug}`}
                  className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className={`h-36 bg-gradient-to-br ${traiteur.gradient} relative overflow-hidden`}>
                    {traiteur.heroImage && (
                      <img
                        src={traiteur.heroImage}
                        alt={traiteur.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-overlay opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 flex items-end p-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {traiteur.zone}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {traiteur.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{traiteur.offer}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {traiteur.startingAt > 0 && (
                        <span className="font-semibold text-orange-600">
                          À partir de {formatEuro(traiteur.startingAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {traiteur.turnaround}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Voir tous les traiteurs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products — Carrousel */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  Plats à découvrir
                </h2>
                <p className="text-gray-500 text-lg">
                  Sélection de nos partenaires
                </p>
              </div>
              <Link
                to="/catalogue"
                className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Voir le catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ChefHat className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.available !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.available !== false ? 'Disponible' : 'Sur confirmation'}
                      </span>
                    </div>
                    {!product.image && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Photo à confirmer
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
                    {product.zone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" />
                        {product.zone}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-gray-900">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="text-[10px] text-gray-400 block -mt-1">Prix DELIKREOL</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Quick Links */}
      <section className="py-16 md:py-20 bg-[#FFFBF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Catégories
            </h2>
            <p className="text-gray-500 text-lg">Explorez par type de cuisine</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${cat.id}`}
                className="px-6 py-3 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-semibold rounded-2xl border border-orange-100 hover:border-orange-300 transition-all hover:scale-105 shadow-sm text-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Le meilleur est à venir */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Le meilleur est à venir
            </h2>
            <p className="text-lg text-orange-100 leading-relaxed">
              DeliKreol grandit chaque jour. De nouveaux traiteurs, de nouvelles communes, de nouvelles saveurs rejoignent la plateforme.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ChefHat, label: 'Traiteurs partenaires', value: `${traiteurSpaces.length}` },
              { icon: MapPin, label: 'Communes Martinique', value: '34' },
              { icon: Users, label: 'Commandes traitées', value: 'Bientôt' },
              { icon: Heart, label: 'Produits au catalogue', value: '25+' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-amber-200" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-orange-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
            Prêt à commander ?
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Choisissez un plat ou un traiteur, indiquez votre commune, puis DeliKreol vérifie la disponibilité avec le prestataire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalogue"
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Voir le catalogue
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur DELIKREOL.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-green-200 text-lg"
            >
              <MessageCircle className="w-5 h-5" fill="white" />
              Support WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
