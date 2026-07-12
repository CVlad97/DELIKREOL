import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ReviewSection } from '../../components/ReviewSection';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatEuro, traiteurSpaces } from '../../data/traiteurs';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import type { Product } from '../../types';

const WHATSAPP_NUMBER = '596696653589';

function menuItemToProduct(item: any, vendorName: string): Product {
  return {
    id: item.id || `${vendorName}-${item.name}`,
    vendor_id: vendorName,
    name: item.name,
    description: item.description || null,
    category: item.category || 'Plats',
    price: item.price,
    image_url: item.image || null,
    is_available: true,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };
}

function uniqueImages(images: Array<string | null | undefined>) {
  return Array.from(new Set(images.filter((image): image is string => Boolean(image))));
}

export function TraiteurDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [selectedDesc, setSelectedDesc] = useState('');

  const traiteur = useMemo(
    () => traiteurSpaces.find((item) => item.slug === slug) || null,
    [slug],
  );

  useEffect(() => {
    document.title = traiteur
      ? `${traiteur.name} — DeliKreol`
      : 'Traiteur introuvable — DeliKreol';
    trackPublicView();
  }, [traiteur]);

  useEffect(() => {
    if (!traiteur) return;

    const commune = traiteur.commune || traiteur.zone || 'Martinique';
    setPageMeta(
      `${traiteur.name} - ${commune} - DeliKreol`,
      `${traiteur.name} - ${commune}. ${traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}`,
      `${traiteur.name}, ${commune}, livraison Martinique, cuisine locale`,
    );

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FoodEstablishment',
      '@id': `https://delikreol.com/traiteur/${traiteur.slug}`,
      name: traiteur.name,
      description: (traiteur.description || traiteur.offer || '').substring(0, 200),
      image: traiteur.heroImage || undefined,
      address: traiteur.address || traiteur.zone,
      servesCuisine: traiteur.specialty || 'Cuisine locale martiniquaise',
      priceRange: traiteur.startingAt > 0 ? `€${traiteur.startingAt.toFixed(0)}` : '€',
      areaServed: { '@type': 'AdministrativeArea', name: 'Martinique' },
      telephone: traiteur.profile?.contactPhone || undefined,
    };

    let element = document.getElementById('schema-localbusiness') as HTMLScriptElement | null;
    if (!element) {
      element = document.createElement('script');
      element.id = 'schema-localbusiness';
      element.type = 'application/ld+json';
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(schema);
  }, [traiteur]);

  if (!traiteur) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Traiteur introuvable</h1>
          <p className="text-muted-foreground mb-6">Cette fiche n'est pas encore disponible.</p>
          <Link to="/traiteurs" className="text-primary font-semibold hover:underline">
            Voir tous les traiteurs
          </Link>
        </div>
      </main>
    );
  }

  const menuItems = traiteur.menuItems || [];
  const isGouteMwen = traiteur.slug === 'goute-mwen';
  const firstProductImage = menuItems.find((item: any) => Boolean(item.image))?.image as string | undefined;
  const galleryWithoutPoster = (traiteur.galleryImages || []).find(
    (image) => !image.endsWith('/hero.jpg'),
  );
  const heroImage = isGouteMwen
    ? firstProductImage || galleryWithoutPoster || traiteur.heroImage
    : traiteur.heroImage || firstProductImage;
  const galleryImages = uniqueImages([
    ...(isGouteMwen ? [] : [traiteur.heroImage]),
    ...(traiteur.galleryImages || []),
    ...menuItems.map((item: any) => item.image),
  ]);
  const isVerified = traiteur.status === 'public confirmé';

  const openImage = (image: string, name: string, description = '') => {
    setSelectedImage(image);
    setSelectedName(name);
    setSelectedDesc(description);
  };

  const handleAddToCart = (item: any) => {
    addItem(menuItemToProduct(item, traiteur.name));
    showSuccess(`${item.name} ajouté au panier`);
  };

  const devisMessage = encodeURIComponent(
    `Bonjour DeliKreol, je souhaite commander chez ${traiteur.name}.\n` +
      `Date souhaitée :\nQuantité :\nRetrait ou livraison :\nAdresse :`,
  );

  return (
    <main className="pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-5 sm:pt-8">
        <Link
          to="/traiteurs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les traiteurs
        </Link>

        <section className="relative overflow-hidden rounded-[1.75rem] bg-neutral-900 shadow-xl">
          <div className="aspect-[4/5] sm:aspect-[16/8] lg:aspect-[16/7]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={`${traiteur.name} — produit phare`}
                className={`w-full h-full ${isGouteMwen ? 'object-contain bg-white' : 'object-cover'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200">
                <ChefHat className="w-20 h-20 text-primary/700/30" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/90 px-3 py-1 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Partenaire référencé
                </span>
              )}
              {isGouteMwen && (
                <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold">
                  Photos d'origine
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight">
                  {traiteur.name}
                </h1>
                <p className="mt-2 text-sm sm:text-lg text-white/90 max-w-2xl">
                  {traiteur.promise || traiteur.offer}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl bg-white text-neutral-900 px-5 py-3 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-neutral-500 font-bold">À partir de</p>
                <p className="text-3xl font-black text-primary">
                  {traiteur.startingAt > 0 ? formatEuro(traiteur.startingAt) : 'Sur devis'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-2xl font-black text-foreground">{menuItems.length}</p>
            <p className="text-xs text-muted-foreground">références au catalogue</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-2xl font-black text-foreground">
              {traiteur.startingAt > 0 ? formatEuro(traiteur.startingAt) : 'Devis'}
            </p>
            <p className="text-xs text-muted-foreground">prix de départ</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="inline-flex items-center gap-1 text-sm font-black text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {traiteur.commune || traiteur.zone || 'Martinique'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">zone de service</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="inline-flex items-center gap-1 text-sm font-black text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {traiteur.turnaround || 'À confirmer'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">préparation</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-6 mt-8">
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-black mb-2">La marque</p>
            <h2 className="text-2xl sm:text-3xl font-display font-black mb-4">
              Une histoire locale, une offre lisible
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {traiteur.story || traiteur.description || traiteur.offer}
            </p>
            {traiteur.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {traiteur.highlights.slice(0, 6).map((highlight, index) => (
                  <span
                    key={`${highlight}-${index}`}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 shadow-sm h-fit">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 font-black mb-2">
              Commander
            </p>
            <h2 className="text-2xl font-black">Envie de goûter ?</h2>
            <p className="text-sm text-white/70 mt-2 mb-6">
              Ajoutez les produits au panier ou demandez les disponibilités par WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${devisMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-success hover:bg-emerald-400 px-4 py-3 font-black text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Vérifier les disponibilités
            </a>
            <Link
              to="/panier"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 px-4 py-3 font-black text-neutral-950 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Voir mon panier
            </Link>
          </aside>
        </section>

        {galleryImages.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-black">En images</p>
                <h2 className="text-2xl sm:text-3xl font-display font-black">Photos originales</h2>
              </div>
              <p className="text-sm text-muted-foreground">{galleryImages.length} visuels</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages.slice(0, 12).map((image, index) => (
                <button
                  type="button"
                  key={image}
                  onClick={() => openImage(image, `${traiteur.name} — photo ${index + 1}`)}
                  className={`group relative overflow-hidden rounded-2xl border bg-white text-left ${
                    index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      loading="lazy"
                      src={image}
                      alt={`${traiteur.name} — photo ${index + 1}`}
                      className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                        isGouteMwen ? 'object-contain bg-white' : 'object-cover'
                      }`}
                    />
                  </div>
                  <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/65 px-3 py-1 text-center text-xs font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    Agrandir
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 border-t pt-10" id="catalogue">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-black">Catalogue</p>
              <h2 className="text-3xl font-display font-black">
                {isGouteMwen ? 'Les parfums' : 'Les produits'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Prix et disponibilité à confirmer au moment de la commande.
            </p>
          </div>

          {menuItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {menuItems.map((item: any) => {
                const hasImage = item.image && !item.image.includes('photo-a-confirmer');
                return (
                  <article
                    key={item.id || item.name}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => hasImage && openImage(item.image, item.name, item.description || '')}
                      className="relative block w-full bg-white text-left"
                      aria-label={hasImage ? `Agrandir ${item.name}` : item.name}
                    >
                      <div className="aspect-square overflow-hidden">
                        {hasImage ? (
                          <img
                            loading="lazy"
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full transition-transform duration-500 hover:scale-105 ${
                              isGouteMwen ? 'object-contain bg-white p-1' : 'object-cover'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-50">
                            <ChefHat className="w-10 h-10 text-amber-300" />
                          </div>
                        )}
                      </div>
                      <span className="absolute top-2 right-2 rounded-full bg-white/95 px-2.5 py-1 text-sm font-black text-primary shadow">
                        {item.price > 0 ? formatEuro(item.price) : 'Sur devis'}
                      </span>
                    </button>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-black text-sm sm:text-base leading-tight min-h-[2.5rem]">
                        {item.name.replace(/^Gouté Mwen\s*[—-]\s*/i, '')}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {item.description || 'Description à confirmer avec le prestataire.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs sm:text-sm font-black text-white transition-colors hover:bg-primary/90"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/30 py-12 text-center">
              <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Le catalogue est en cours de préparation.</p>
            </div>
          )}
        </section>

        <section className="mt-12">
          <ReviewSection traiteurSlug={traiteur.slug} traiteurName={traiteur.name} />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <Link
            to="/panier"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-black text-white"
          >
            <ShoppingCart className="w-4 h-4" />
            Panier
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${devisMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedName}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] bg-neutral-950 flex items-center justify-center">
              <img src={selectedImage} alt={selectedName} className="max-h-[75vh] w-full object-contain" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-neutral-950">{selectedName}</h3>
              {selectedDesc && <p className="mt-2 text-sm text-neutral-600">{selectedDesc}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TraiteurDetailPage;
