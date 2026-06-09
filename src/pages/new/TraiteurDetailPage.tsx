import { useParams, Link } from 'react-router-dom';
import { ChefHat, MapPin, ShoppingCart, MessageCircle, ArrowLeft, Clock, AlertTriangle, Star } from 'lucide-react';
import { traiteurSpaces, formatEuro } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useMemo } from 'react';
import type { Product } from '../../types';

const WHATSAPP_NUMBER = '596696653589';

function menuItemToProduct(item: any, vendorName: string): Product {
  return {
    id: item.id || String(Math.random()),
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

export function TraiteurDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const traiteur = useMemo(() => {
    return traiteurSpaces.find(t => t.slug === slug) || null;
  }, [slug]);

  useEffect(() => {
    document.title = traiteur
      ? `${traiteur.name} — DeliKreol`
      : 'Traiteur introuvable — DeliKreol';
  }, [traiteur]);

  if (!traiteur) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Traiteur introuvable</h1>
          <p className="text-muted-foreground mb-6">Ce traiteur n'est pas encore référencé.</p>
          <Link to="/traiteurs" className="text-primary font-semibold hover:underline">← Voir tous les traiteurs</Link>
        </div>
      </div>
    );
  }

  const isVerified = traiteur.status === 'public confirmé';
  const menuItems = traiteur.menuItems || [];

  const handleAddToCart = (item: any) => {
    addItem(menuItemToProduct(item, traiteur.name));
    showSuccess(`${item.name} ajouté au panier`);
  };

  const devisMessage = encodeURIComponent(
    `Bonjour DeliKreol, je souhaite un devis traiteur :\n` +
    `Traiteur : ${traiteur.name}\n` +
    `Commune : ${traiteur.commune || traiteur.zone || ''}\n` +
    `Date :\nNombre de personnes :\nBudget :\nType d'événement :`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/traiteurs" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Tous les traiteurs
      </Link>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden mb-8">
        <div className="aspect-[21/9] bg-muted relative">
          {traiteur.heroImage ? (
            <img src={traiteur.heroImage} alt={traiteur.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <ChefHat className="w-20 h-20 text-primary/20" />
            </div>
          )}
        </div>
      </div>

      {/* Portrait + Bio */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
        {traiteur.portraitImage && (
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border-4 border-primary/10">
            <img src={traiteur.portraitImage} alt={`Portrait ${traiteur.name}`}
              className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl font-display font-bold">{traiteur.name}</h1>
          {isVerified ? (
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Partenaire vérifié
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              À vérifier
            </span>
          )}
          {traiteur.photoStatus && traiteur.photoStatus !== 'confirmée' && (
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
              📸 {traiteur.photoStatus === 'externe à vérifier' ? 'Photos externes' : 'Photos à confirmer'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{traiteur.commune || traiteur.zone || 'Martinique'}</span>
          {traiteur.specialty && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{traiteur.specialty}</span>}
        </div>

        <p className="text-muted-foreground mb-4">
          {traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}
        </p>

        {/* Bio complète */}
        {traiteur.story && traiteur.story !== traiteur.description && (
          <div className="mb-4 p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground leading-relaxed">{traiteur.story}</p>
          </div>
        )}

        {/* Highlights */}
        {traiteur.highlights && traiteur.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {traiteur.highlights.map((h, i) => (
              <span key={i} className="text-xs px-2.5 py-1 bg-primary/5 text-primary rounded-full">{h}</span>
            ))}
          </div>
        )}

        <p className="text-xs text-amber-600 flex items-center gap-1 mb-6">
          <AlertTriangle className="w-3 h-3" />
          Horaires, retrait et livraison à confirmer avec le prestataire.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <Link to="/panier" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm">
            <ShoppingCart className="w-4 h-4" />
            Commander via DeliKreol
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${devisMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Demander un devis
          </a>
        </div>
      </div>
      </div>

      {/* Galerie photos */}
      {traiteur.galleryImages && traiteur.galleryImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-4">Galerie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {traiteur.galleryImages.map((img, i) => (
              <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-muted group relative">
                <img src={img} alt={`${traiteur.name} - ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </a>
            ))}
          </div>
          {traiteur.photoStatus && traiteur.photoStatus !== 'confirmée' && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {traiteur.photoStatus === 'externe à vérifier' ? 'Photos externes — vérification en cours' : 'Photos à confirmer'}
            </p>
          )}
        </div>
      )}

      {/* Menu */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-display font-bold mb-6">
          {menuItems.length > 0 ? 'Les plats' : 'Menu à confirmer'}
        </h2>

        {menuItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {menuItems.map((item: any) => {
              const hasImage = item.image && !item.image.includes('photo-a-confirmer');
              return (
                <div key={item.id || item.name} className="bg-card rounded-xl border border-border p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {hasImage ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50">
                        <ChefHat className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                      {item.description || 'Description à compléter avec le prestataire.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{item.price > 0 ? `${item.price} €` : 'Prix à confirmer'}</span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Le menu de ce prestataire est en cours de préparation.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour DeliKreol, je voudrais connaître le menu de ${traiteur.name}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-600 hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              Demander le menu via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default TraiteurDetailPage;
