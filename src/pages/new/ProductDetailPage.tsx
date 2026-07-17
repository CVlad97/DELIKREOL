import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ChefHat,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { ProductThumbnail } from '../../components/ProductThumbnail';
import { mockProducts } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { resolveProductThumbnail } from '../../services/catalogImageResolver';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import type { Product } from '../../types';

const WHATSAPP_NUMBER = '596696653589';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [quantity, setQuantity] = useState(1);

  const productData = useMemo(() => {
    const mock = mockProducts.find((product) => product.id === slug);
    if (mock) {
      const vendorSpace = traiteurSpaces.find((space) => space.name === mock.vendor) || null;
      return { product: mock, vendorSpace };
    }

    for (const space of traiteurSpaces) {
      const item = space.menuItems.find((menuItem) => (
        `${space.slug}-${slugify(menuItem.name)}` === slug ||
        (menuItem as { id?: string }).id === slug
      ));

      if (item) {
        return {
          product: {
            id: `${space.slug}-${slugify(item.name)}`,
            name: item.name,
            vendor: space.name,
            price: item.price,
            category: item.category,
            image: item.image ?? undefined,
            description: item.description,
            zone: space.commune || space.zone,
            available: true,
            featured: item.featured,
          },
          vendorSpace: space,
        };
      }
    }

    return null;
  }, [slug]);

  useEffect(() => {
    if (productData) {
      const { product } = productData;
      setPageMeta(
        `${product.name} — DeliKreol | ${product.vendor}`,
        `${product.name} chez ${product.vendor}. Commandez en ligne sur DeliKreol en Martinique.`,
      );
    } else {
      setPageMeta('Produit introuvable — DeliKreol', 'Ce produit n’est pas disponible sur DeliKreol.');
    }
    trackPublicView();
  }, [productData]);

  if (!productData) {
    return (
      <Layout>
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h1 className="text-2xl font-black">Produit introuvable</h1>
            <p className="mt-2 text-muted-foreground">Ce produit n’existe pas ou n’est plus disponible.</p>
            <Link to="/catalogue" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
              Retour au catalogue
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const { product, vendorSpace } = productData;
  const partnerImage = vendorSpace?.heroImage || vendorSpace?.galleryImages?.[0] || vendorSpace?.portraitImage || null;
  const thumbnail = resolveProductThumbnail({
    src: product.image,
    partnerImage,
    name: product.name,
    vendor: product.vendor,
    category: product.category,
  });
  const vendorName = product.vendor || 'Prestataire';
  const zone = product.zone || vendorSpace?.commune || vendorSpace?.zone || 'Martinique';
  const description = product.description || 'Description à compléter avec le prestataire.';
  const sides = (product as { sides?: string[] }).sides || [];

  const cartProduct: Product = {
    id: product.id,
    vendor_id: vendorName,
    name: product.name,
    description: product.description || null,
    category: product.category,
    price: product.price,
    image_url: thumbnail.src,
    is_available: product.available !== false,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) addItem(cartProduct);
    showSuccess(`${product.name} (x${quantity}) ajouté au panier`);
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour DeliKreol, je souhaite des informations sur :\n` +
    `Produit : ${product.name}\n` +
    `Prix : ${product.price} €\n` +
    `Traiteur : ${vendorName}\n` +
    `Commune : ${zone}`,
  );

  return (
    <Layout>
      <BackBar label="Catalogue" backTo="/catalogue" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <ProductThumbnail
              src={product.image}
              partnerImage={partnerImage}
              productName={product.name}
              vendorName={vendorName}
              category={product.category}
              aspectRatio="1 / 1"
              priority
              containerClassName="w-full"
              imgClassName="product-photo-natural"
              showBadge
            />
          </section>

          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {product.category || 'Produit local'}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                product.available !== false
                  ? 'bg-success/10 text-success'
                  : 'bg-secondary/15 text-secondary'
              }`}>
                {product.available !== false ? 'Disponible' : 'Sur confirmation'}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-black text-primary">{product.price.toFixed(2).replace('.', ',')} €</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ChefHat className="h-4 w-4 text-primary" />{vendorName}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{zone}</span>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <h2 className="font-black text-foreground">Description</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>
            </div>

            {sides.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <h2 className="font-black text-foreground">Accompagnements</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sides.map((side) => (
                    <span key={side} className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-foreground">
                      {side}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {thumbnail.source !== 'product' && (
              <div className="mt-6 rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm text-secondary">
                <p className="font-bold">Photo produit en cours de validation</p>
                <p className="mt-1">Le visuel affiché est identifié comme {thumbnail.source === 'partner' ? 'un visuel du partenaire' : 'une vignette temporaire'}.</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="inline-flex h-12 w-12 items-center justify-center hover:bg-muted"
                  aria-label="Réduire la quantité"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center font-black" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="inline-flex h-12 w-12 items-center justify-center hover:bg-muted"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-primary-foreground transition hover:bg-primary"
              >
                <ShoppingCart className="h-5 w-5" /> Ajouter au panier
              </button>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-success px-6 py-3 font-black text-success-foreground transition hover:brightness-95"
            >
              <MessageCircle className="h-5 w-5" /> Poser une question via WhatsApp
            </a>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default ProductDetailPage;
