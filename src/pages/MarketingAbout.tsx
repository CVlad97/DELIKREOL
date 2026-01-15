import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Leaf, TrendingUp } from 'lucide-react';

export default function MarketingAbout() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              À propos de Delikreol
            </h1>
            <p className="text-lg text-gray-600">
              Une plateforme dédiée au développement de l'économie locale en Guadeloupe
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Delikreol est né d'une vision simple mais ambitieuse : créer un écosystème qui soutient les commerçants locaux tout en offrant aux consommateurs guadeloupéens un accès facile et rapide aux meilleurs produits de leur territoire.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Nous croyons fermement au potentiel de l'économie locale et au pouvoir de la communauté. C'est pourquoi nous avons développé une plateforme qui met en relation directe les producteurs, commerçants, et consommateurs, tout en créant des opportunités pour les livreurs et points relais.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nos valeurs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local d'abord</h3>
              <p className="text-gray-600">
                Nous privilégions les circuits courts et soutenons l'économie locale.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Communauté</h3>
              <p className="text-gray-600">
                Nous créons des liens entre tous les acteurs de l'écosystème local.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Responsabilité</h3>
              <p className="text-gray-600">
                Nous minimisons notre impact environnemental et favorisons le durable.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Nous utilisons la technologie pour faciliter et moderniser le commerce local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Notre impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100+</div>
              <div className="text-gray-600">Commerçants partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-600">Livraisons par semaine</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-gray-600">Clients satisfaits</div>
            </div>
          </div>
          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Un modèle collaboratif unique
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Delikreol va au-delà d'une simple plateforme de livraison. Nous avons développé un système de points de fidélité qui permet aux utilisateurs de participer au développement de nouveaux points relais et infrastructures dans leur quartier. C'est un investissement communautaire qui profite à tous.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Notre technologie intègre des agents IA pour optimiser les itinéraires de livraison, scorer les partenaires potentiels, et assister les administrateurs dans la gestion quotidienne. Le tout avec une approche transparente et éthique.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Rejoignez l'aventure
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Que vous soyez commerçant, livreur, ou simplement consommateur, vous avez un rôle à jouer dans le développement de l'économie locale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/customer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              Commander
            </Link>
            <Link
              to="/become-partner"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
