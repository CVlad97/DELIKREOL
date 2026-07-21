import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { ProductThumbnail } from '../../components/ProductThumbnail';
import { SmartImage } from '../../components/SmartImage';
import { ReviewSection } from '../../components/ReviewSection';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatEuro, PUBLIC_HIDDEN_PRODUCT_TRAITEURS, traiteurSpaces } from '../../data/traiteurs';
import { getThumbnailPlaceholder, isUsableThumbnail, resolveProductThumbnail } from '../../services/catalogImageResolver';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import type { Product } from '../../types';

const WHATSAPP_NUMBER = '596696653589';
const MADA_BADGE_TRAITEURS = new Set([
  "Saveurs d'Afrique",
  'Les Delices de Ninice',
  'Sweet Family Traiteur Orianne',
]);

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueImages(images: Array<string | null | undefined>): string[] {
  return Array.from(new Set(images.filter((image): image is string => Boolean(image))));
}

export function TraiteurDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const traiteur = useMemo(
    () => traiteurSpaces.find((item) => item.slug === slug) || null,
    [slug],
  );

  useEffect(() => {
    if (!traiteur) {
      setPageMeta('Traiteur introuvable — DeliKreol', 'Cette fiche partenaire n’est pas disponible.');
      trackPublicView();
      return;
    }

    const commune = traiteur.commune || traiteur.zone || 'Martinique';
    setPageMeta(
      `${traiteur.name} — ${commune} — DeliKreol`,
      `${traiteur.name} à ${commune}. ${traiteur.description || traiteur.offer}`,
      `${traiteur.name}, ${commune}, livraison Martinique, cuisine locale`,
    );
    trackPublicView();
  }, [traiteur]);

  if (!traiteur) {
    return (
      <Layout>
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h1 className="text-2xl font-black">Traiteur introuvable</h1>
            <p className="mt-2 text-muted-foreground">Cette fiche n’est pas encore disponible.</p>
            <Link to="/traiteurs" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
              Voir tous les traiteurs
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const menuItems = PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(traiteur.name)
    ? []
    : (traiteur.menuItems || []).filter((item) => isUsableThumbnail(item.image));
  const isChefMada = traiteur.slug === 'chef-a-mada';
  const showMadaBadge = MADA_BADGE_TRAITEURS.has(traiteur.name);
  const isGouteMwen = traiteur.slug === 'goute-mwen';
  const useContainedHero = isGouteMwen;
  const firstProductImage = menuItems.find((item) => Boolean(item.image))?.image || null;
  const galleryImages = uniqueImages([
    traiteur.heroImage,
    ...(traiteur.galleryImages || []),
    ...menuItems.map((item) => item.image),
  ]);
  const legacyHeroSuffix = `/hero.${'jpg'}`;
  const heroImage = isGouteMwen
    ? firstProductImage || galleryImages.find((image) => !image.endsWith(legacyHeroSuffix)) || traiteur.heroImage
    : traiteur.heroImage || firstProductImage || traiteur.galleryImages?.[0];
  const partnerFallback = heroImage || traiteur.galleryImages?.[0] || traiteur.portraitImage || getThumbnailPlaceholder();
  const isVerified = traiteur.status === 'public confirmé';
  const visibleStartingAt = menuItems.length
    ? menuItems.reduce((lowest, item) => Math.min(lowest, item.price), Number.POSITIVE_INFINITY)
    : 0;

  const handleAddToCart = (item: (typeof menuItems)[number]) => {
    const thumbnail = resolveProductThumbnail({
      src: item.image,
      partnerImage: partnerFallback,
      name: item.name,
      vendor: traiteur.name,
      category: item.category,
    });

    const product: Product = {
      id: `${traiteur.slug}-${slugify(item.name)}`,
      vendor_id: traiteur.name,
      name: item.name,
      description: item.description || null,
      category: item.category || 'Plats',
      price: item.price,
      image_url: thumbnail.src,
      is_available: true,
      stock_quantity: null,
      created_at: new Date().toISOString(),
    };

    addItem(product);
    showSuccess(`${item.name} ajouté au panier`);
  };

  const devisMessage = encodeURIComponent(
    `Bonjour DeliKreol, je souhaite commander chez ${traiteur.name}.\n` +
    `Date souhaitée :\nQuantité :\nRetrait ou livraison :\nAdresse :`,
  );

  return (
    <Layout>
      <BackBar label="Traiteurs" backTo="/traiteurs" />
      <main className="pb-24 sm:pb-12">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 shadow-xl">
            {heroImage ? (
              <SmartImage
                src={heroImage}
                fallbackSrc={partnerFallback}
                finalFallbackSrc={getThumbnailPlaceholder()}
                alt={`${traiteur.name} — visuel principal`}
                kind={useContainedHero ? 'packaging' : 'ambient'}
                fit={useContainedHero ? 'contain' : 'cover'}
                aspectRatio="16 / 8"
                priority
                containerClassName="w-full min-h-[360px] sm:min-h-[430px]"
                imgClassName="product-photo-natural"
              />
            ) : (
              <div className="flex min-h-[360px] w-full items-center justify-center bg-gradient-to-br from-neutral-950 via-primary/30 to-neutral-900 sm:min-h-[430px]">
                <ChefHat className="h-24 w-24 text-white/20" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 lg:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/90 px-3 py-1 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Partenaire référencé
                  </span>
                )}
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  {traiteur.photoStatus === 'confirmée' ? 'Photos validées' : 'Visuels en validation'}
                </span>
                {showMadaBadge && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-primary shadow-sm">
                    <img
                      loading="lazy"
                      src={`${import.meta.env.BASE_URL}vendors/chef-a-mada/logo.jpg`}
                      alt="Écusson Chef à Mada"
                      className="h-5 w-5 rounded-full object-contain"
                    />
                    Écusson Chef à Mada
                  </span>
                )}
                {isChefMada && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
                    Livraison planifiée uniquement sur devis
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{traiteur.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-lg">
                    {traiteur.promise || traiteur.offer}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-white px-5 py-3 text-neutral-950 shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">À partir de</p>
                  <p className="text-3xl font-black text-primary">
                    {visibleStartingAt > 0 ? formatEuro(visibleStartingAt) : 'Sur devis'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-foreground">{menuItems.length}</p>
              <p className="text-xs text-muted-foreground">références catalogue</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-foreground">
                {visibleStartingAt > 0 ? formatEuro(visibleStartingAt) : 'Devis'}
              </p>
              <p className="text-xs text-muted-foreground">prix de départ</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="inline-flex items-center gap-1 text-sm font-black text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {traiteur.commune || traiteur.zone || 'Martinique'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">zone de service</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="inline-flex items-center gap-1 text-sm font-black text-foreground">
                <Clock className="h-4 w-4 text-primary" /> {traiteur.turnaround || 'À confirmer'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">préparation</p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">La marque</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Une histoire locale, une offre lisible</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                {traiteur.story || traiteur.description || traiteur.offer}
              </p>
              {traiteur.highlights?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {traiteur.highlights.slice(0, 6).map((highlight) => (
                    <span key={highlight} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-3xl bg-neutral-950 p-6 text-white shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Commander</p>
              <h2 className="mt-2 text-2xl font-black">Envie de goûter ?</h2>
              <p className="mt-2 text-sm text-white/70">
                {isChefMada
                  ? 'Cette vitrine regroupe des plats partenaires. Les commandes passent uniquement par devis et créneau planifié.'
                  : 'Ajoutez les produits au panier ou vérifiez les disponibilités avec DeliKreol.'}
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${devisMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 font-black text-success-foreground"
              >
                <MessageCircle className="h-5 w-5" /> Vérifier les disponibilités
              </a>
              {!isChefMada && (
                <Link
                  to="/panier"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-neutral-950"
                >
                  <ShoppingCart className="h-5 w-5" /> Voir mon panier
                </Link>
              )}
            </aside>
          </section>

          <section className="mt-12 border-t border-border pt-10" id="catalogue">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Catalogue</p>
                <h2 className="text-3xl font-black">{isGouteMwen ? 'Les parfums' : 'Les produits'}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {isChefMada
                  ? 'Sélection mutualisée disponible uniquement en livraison planifiée sur devis.'
                  : 'Prix et disponibilité confirmés au moment de la commande.'}
              </p>
            </div>

            {menuItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" data-partner-catalogue="true">
                {menuItems.map((item) => (
                  <article
                    key={`${traiteur.slug}-${item.name}`}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <ProductThumbnail
                      src={item.image}
                      partnerImage={partnerFallback}
                      productName={item.name}
                      vendorName={traiteur.name}
                      category={item.category}
                      aspectRatio="1 / 1"
                      containerClassName="w-full bg-white"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                      showBadge
                    />
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 min-h-[2.75rem] font-black leading-tight">
                          {item.name.replace(/^Gouté Mwen\s*[—-]\s*/i, '')}
                        </h3>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-black text-primary">
                          {item.price > 0 ? formatEuro(item.price) : 'Devis'}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {item.description || 'Description à confirmer avec le prestataire.'}
                      </p>
                      {isChefMada ? (
                        <Link
                          to="/devis"
                          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary"
                        >
                          Demander un devis
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary"
                        >
                          <ShoppingCart className="h-4 w-4" /> Ajouter
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/30 py-12 text-center">
                <ChefHat className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Le catalogue est en cours de préparation.</p>
              </div>
            )}
          </section>

          <section className="mt-12">
            <ReviewSection traiteurSlug={traiteur.slug} traiteurName={traiteur.name} />
          </section>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-md gap-2">
            {!isChefMada && (
              <Link to="/panier" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-black text-primary-foreground">
                <ShoppingCart className="h-4 w-4" /> Panier
              </Link>
            )}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${devisMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 font-black text-success-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

      </main>
    </Layout>
  );
}

export default TraiteurDetailPage;
