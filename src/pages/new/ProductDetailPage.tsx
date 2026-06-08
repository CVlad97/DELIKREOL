import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChefHat, MapPin, ArrowLeft, MessageCircle, AlertTriangle } from 'lucide-react';
import { mockProducts } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../../types';

const WHATSAPP_NUMBER = '596696653589';

function localToProduct(p: any): Product {
  return {
    id: p.id,
    vendor_id: p.vendor || '',
    name: p.name,
    description: p.description || null,
    category: p.category || '',
    price: p.price,
    image_url: p.image || null,
    is_available: true,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => {
    // Search in mock products
    const mock = mockProducts.find(p => p.id === slug);
    if (mock) return { ...mock, source: 'mock' as const };
    // Search in traiteur menus
    for (const t of traiteurSpaces) {
      const item = t.menuItems?.find((m: any) => m.id === slug);
      if (item) return { ...item, vendor: t.name, zone: t.commune || '', source: 'traiteur' as const };
    }
    return null;
  }, [slug]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — DeliKreol`;
    } else {
      document.title = 'Produit introuvable — DeliKreol';
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Produit introuvable</h1>
          <p className="text-muted-foreground mb-6">Ce produit n'existe pas ou n'est plus disponible.</p>
          <Link to="/catalogue" className="text-primary font-semibold hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  const hasRealImage = product.image && !product.image.includes('photo-a-confirmer');
  const vendorName = product.vendor || 'Prestataire';
  const zone = product.zone || 'Martinique';
  const sides = (product as any).sides || [];
  const description = product.description || 'Description à compléter avec le prestataire.';

  const handleAddToCart = () => {
    const cartProduct = localToProduct(product);
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct);
    }
    showSuccess(`${product.name} (x${quantity}) ajouté au panier`);
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour DeliKreol, je souhaite des informations sur :\n` +
    `Produit : ${product.name}\n` +
    `Prix : ${product.price}€\n` +
    `Traiteur : ${vendorName}\n` +
    `Commune : ${zone}`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/catalogue" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
          {hasRealImage ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-600">
              <ChefHat className="w-16 h-16 mb-3 opacity-40" />
              <span className="text-sm font-medium">Photo à confirmer</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">{product.category || 'Plats'}</span>
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Disponible</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mb-4">{product.price} €</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1"><ChefHat className="w-4 h-4" />{vendorName}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{zone}</span>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {sides.length > 0 && (
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-2">Accompagnements</h3>
              <div className="flex flex-wrap gap-2">
                {sides.map((s: string) => (
                  <span key={s} className="text-xs px-3 py-1 bg-secondary/10 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 mb-4">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Allergènes à confirmer. Horaires, retrait et livraison à confirmer avec le prestataire.
            </p>
          </div>

          {/* Quantity & Add to cart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors">−</button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 hover:bg-muted transition-colors">+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier
            </button>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Poser une question via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
