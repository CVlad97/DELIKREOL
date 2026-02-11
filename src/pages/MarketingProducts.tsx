import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBasket, Leaf, Coffee } from 'lucide-react';

export default function MarketingProducts() {
  const categories = [
    {
      icon: UtensilsCrossed,
      title: 'Restaurants',
      description: 'Découvrez les meilleurs restaurants locaux et commandez vos plats préférés.',
      features: ['Cuisine créole', 'Plats du jour', 'Spécialités locales'],
    },
    {
      icon: ShoppingBasket,
      title: 'Épiceries & Marchés',
      description: 'Produits frais et locaux directement des producteurs et épiceries.',
      features: ['Fruits & légumes', 'Produits de la mer', 'Épices locales'],
    },
    {
      icon: Leaf,
      title: 'Agriculture locale',
      description: 'Soutenez les agriculteurs locaux et profitez de produits ultra-frais.',
      features: ['Légumes bio', 'Fruits de saison', 'Produits fermiers'],
    },
    {
      icon: Coffee,
      title: 'Artisans & Spécialités',
      description: 'Découvrez les créations des artisans et producteurs locaux.',
      features: ['Café local', 'Rhum artisanal', 'Confiseries'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Produits & Services
            </h1>
            <p className="text-lg text-gray-600">
              Une sélection variée de produits locaux et de qualité, livrés directement chez vous.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div
                key={category.title}
                className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-700">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Modes de livraison
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez le mode de livraison qui vous convient le mieux
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Livraison à domicile
              </h3>
              <p className="text-gray-600 mb-4">
                Recevez vos commandes directement chez vous en moins de 2 heures.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Livraison express disponible
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Suivi en temps réel
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Frais de livraison dès 3,50€
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Point relais
              </h3>
              <p className="text-gray-600 mb-4">
                Retirez votre commande dans un point relais proche de chez vous.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Gratuit ou frais réduits
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Horaires étendus
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></span>
                  Points relais dans toute la Guadeloupe
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commander ?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Découvrez tous nos produits et commencez vos achats dès maintenant.
          </p>
          <Link
            to="/customer"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            Voir tous les produits
          </Link>
        </div>
      </section>
    </div>
  );
}
