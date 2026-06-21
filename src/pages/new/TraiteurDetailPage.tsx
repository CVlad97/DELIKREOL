import { useParams, Link } from 'react-router-dom';
import { ChefHat, MapPin, ShoppingCart, MessageCircle, ArrowLeft, Clock, AlertTriangle, Star, X } from 'lucide-react';
import { traiteurSpaces, formatEuro } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useMemo, useState } from 'react';
import { setPageMeta } from '../../services/seo';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedDesc, setSelectedDesc] = useState<string>('');

  const traiteur = useMemo(() => {
    return traiteurSpaces.find(t => t.slug === slug) || null;
  }, [slug]);

  useEffect(() => {
    document.title = traiteur
      ? `${traiteur.name} — DeliKreol`
      : 'Traiteur introuvable — DeliKreol';
  }, [traiteur]);

  useEffect(() => {
    if (traiteur) {
      const commune = traiteur.commune || traiteur.zone || 'Martinique';
      setPageMeta(
        `${traiteur.name} - ${commune} - Plats créoles Martinique`,
        `${traiteur.name} - ${commune} - Plats créoles Martinique. ${traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}`,
        `${traiteur.name}, ${commune}, livraison repas Martinique, plats créoles`
      );

      // Schema.org LocalBusiness pour le SEO — sans aggregateRating non prouvé
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'FoodEstablishment',
        '@id': `https://delikreol.mq/traiteur/${traiteur.slug}`,
        name: traiteur.name,
        description: (traiteur.description || traiteur.offer || '').substring(0, 200),
        image: traiteur.heroImage || undefined,
       地址: traiteur.address || traiteur.zone,
        servesCuisine: traiteur.specialty || 'Cuisine créole martiniquaise',
        priceRange: traiteur.startingAt > 0 ? `€${traiteur.startingAt.toFixed(0)}` : '€',
        areaServed: { '@type': 'City', name: 'Martinique' },
        telephone: traiteur.profile?.contactPhone || undefined,
        // Pas d'aggregateRating — pas encore d'avis réels collectés
      };
      let el = document.getElementById('schema-localbusiness') as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = 'schema-localbusiness';
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);
    }
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
            <img loading="lazy" src={traiteur.heroImage} alt={traiteur.name} className="w-full h-full object-cover" />
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
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border-4 border-primary/10 shadow-lg ring-2 ring-amber-200/50">
            <img loading="lazy" src={traiteur.portraitImage} alt={`Portrait ${traiteur.name}`}
              className="w-full h-full object-cover object-top" />
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
          Fiche en cours de validation avec la partenaire. Photos et descriptions à confirmer.
        </p>

        {/* Bouton Envoyer mes corrections */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 font-semibold mb-1">Vous êtes ce partenaire ?</p>
          <p className="text-xs text-amber-700 mb-3">
            Envoyez vos corrections à DELIKREOL, nous les appliquons gratuitement avant publication.
          </p>
          <a
            href={`https://wa.me/596696653589?text=${encodeURIComponent(
              `Bonjour Vladimir, je souhaite corriger ma fiche DELIKREOL.\nPartenaire : ${traiteur.name}\nCorrections à apporter :\n- Description :\n- Plats :\n- Prix :\n- Photos :\n- Compositions :\n- Allergènes :\n- Horaires :\n- Disponibilités :\n- Modes : retrait / relais / livraison`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-sm"
          >
            <MessageCircle className="w-4 h-4" fill="white" />
            Envoyer mes corrections
          </a>
        </div>

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

      {/* Photos du traiteur */}
      {traiteur.galleryImages && traiteur.galleryImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-4">Photos du traiteur</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {traiteur.galleryImages.map((img, i) => (
              <div key={i} onClick={() => {
                setSelectedImage(img);
                setSelectedName(`${traiteur.name} — Photo ${i + 1}`);
                setSelectedDesc('');
              }}
                className="aspect-square rounded-xl overflow-hidden bg-muted group relative cursor-pointer">
                <img loading="lazy" src={img} alt={`${traiteur.name} - ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold shadow-lg transition-opacity">
                    🔍 Agrandir
                  </span>
                </div>
              </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item: any) => {
              const hasImage = item.image && !item.image.includes('photo-a-confirmer');
              return (
                <div key={item.id || item.name} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  {/* Large clickable image */}
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative cursor-pointer"
                    onClick={() => {
                      if (hasImage) {
                        setSelectedImage(item.image);
                        setSelectedName(item.name);
                        setSelectedDesc(item.description || '');
                      }
                    }}>
                    {hasImage ? (
                      <>
                        <img loading="lazy" src={item.image} alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg transition-opacity">
                            🔍 Agrandir
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50">
                        <ChefHat className="w-10 h-10 text-amber-300" />
                      </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
                      {item.price > 0 ? `${item.price} €` : 'Sur devis'}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-base mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                      {item.description || 'Description à compléter avec le prestataire.'}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-sm transition-all hover:scale-[1.02]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au panier
                    </button>
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

      {/* Lightbox modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[4/3] bg-muted">
              <img loading="lazy" src={selectedImage} alt={selectedName}
                className="w-full h-full object-contain bg-gray-900" />
            </div>
            <div className="p-5 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedName}</h3>
              {selectedDesc && (
                <p className="text-gray-600 text-sm leading-relaxed">{selectedDesc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TraiteurDetailPage;
