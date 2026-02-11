import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, MapPin, Users, ArrowRight } from 'lucide-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Livraison locale et responsable en Guadeloupe
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Découvrez les meilleurs commerçants locaux et recevez vos produits frais directement chez vous ou en point relais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer"
                className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Commander maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/become-partner"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                Devenir partenaire
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <ShoppingBag className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Choisissez vos produits</h3>
              <p className="text-gray-600">
                Parcourez notre sélection de commerçants locaux et ajoutez vos produits favoris au panier.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Choisissez votre mode de livraison</h3>
              <p className="text-gray-600">
                Livraison à domicile ou retrait en point relais, vous décidez ce qui vous convient le mieux.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Truck className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Recevez votre commande</h3>
              <p className="text-gray-600">
                Suivez votre commande en temps réel et profitez de produits frais et locaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nos avantages
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-emerald-600 mb-3">
                <MapPin className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Local</h3>
              <p className="text-gray-600">
                Tous nos partenaires sont des commerçants locaux de Guadeloupe.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-emerald-600 mb-3">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Livraison rapide</h3>
              <p className="text-gray-600">
                Recevez vos commandes en moins de 2 heures ou choisissez votre créneau.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-emerald-600 mb-3">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Communauté</h3>
              <p className="text-gray-600">
                Soutenez l'économie locale et participez au développement territorial.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-emerald-600 mb-3">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Qualité garantie</h3>
              <p className="text-gray-600">
                Produits frais sélectionnés avec soin par nos commerçants partenaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à découvrir Delikreol ?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Rejoignez notre communauté et profitez du meilleur de la Guadeloupe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/customer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              Commencer à commander
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Delikreol</h3>
              <p className="text-sm">
                Plateforme de livraison locale en Guadeloupe, au service des commerçants et des consommateurs.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">Produits</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/become-partner" className="hover:text-white transition-colors">Devenir partenaire</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal/terms" className="hover:text-white transition-colors">CGV</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link to="/legal/mentions" className="hover:text-white transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: contact@delikreol.com</li>
                <li>Guadeloupe</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Delikreol. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
