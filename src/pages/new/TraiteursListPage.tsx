import { Link } from 'react-router-dom';
import { ChefHat, MapPin, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { traiteurSpaces } from '../../data/traiteurs';
import { useEffect } from 'react';

export function TraiteursListPage() {
  useEffect(() => {
    document.title = 'Nos traiteurs partenaires — DeliKreol';
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          Nos traiteurs partenaires
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez les traiteurs, snacks et restaurateurs locaux de Martinique référencés sur DeliKreol.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {traiteurSpaces.map((traiteur) => {
          const isVerified = traiteur.status === 'public confirmé';
          const menuCount = traiteur.menuItems?.length || 0;

          return (
            <Link
              key={traiteur.slug}
              to={`/traiteur/${traiteur.slug}`}
              className="group block bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-warm transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              {/* Cover image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {traiteur.heroImage ? (
                  <img src={traiteur.heroImage} alt={traiteur.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                    <ChefHat className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                {!isVerified && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    À vérifier
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {traiteur.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {traiteur.commune || traiteur.zone || 'Martinique'}
                  </span>
                  {traiteur.specialty && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {traiteur.specialty}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {menuCount > 0 ? `${menuCount} plat${menuCount > 1 ? 's' : ''}` : 'Menu à confirmer'}
                  </span>
                  <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Voir la vitrine <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-2">Vous êtes traiteur en Martinique ?</h2>
        <p className="text-muted-foreground mb-4">
          Rejoignez DeliKreol et touchez de nouveaux clients locaux.
        </p>
        <Link
          to="/devenir-partenaire"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <Star className="w-4 h-4" />
          Devenir partenaire
        </Link>
      </div>
    </div>
  );
}

export default TraiteursListPage;
