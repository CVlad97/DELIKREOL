import { Package, MapPin, Clock, Shield, ArrowRight, HelpCircle } from 'lucide-react';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro') => void;
  onShowGuide: () => void;
}

export function ClientHomePage({ onSelectMode, onShowGuide }: ClientHomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onShowGuide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment ça marche ?</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold text-3xl mb-6 shadow-2xl shadow-emerald-500/50">
            D
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-4">
            Bienvenue sur Delikreol
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            Votre plateforme de conciergerie logistique en Martinique
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Commandez simplement, on s'occupe de trouver, préparer et livrer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <button
            onClick={() => onSelectMode('customer')}
            className="group relative bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur border-2 border-blue-600 rounded-3xl p-8 text-left hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
          >
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-blue-400 mb-3">Je veux commander</h2>
            <p className="text-slate-300 mb-6">
              Mode CLIENT : Décrivez ce que vous voulez, on s'occupe de tout
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>Repas, produits locaux, courses...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>Livraison à domicile ou point relais</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>Suivi en temps réel de votre demande</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-4 transition-all">
              <span>Commencer</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => onSelectMode('pro')}
            className="group relative bg-gradient-to-br from-orange-900/50 to-orange-800/30 backdrop-blur border-2 border-orange-600 rounded-3xl p-8 text-left hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
          >
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-orange-400 mb-3">Espace Pro / Métiers</h2>
            <p className="text-slate-300 mb-6">
              Mode PRO : Restaurants, points relais, livreurs, administrateurs
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>Recevez des demandes qualifiées</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>Gérez vos produits et commandes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>Générez des revenus complémentaires</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-4 transition-all">
              <span>Accéder</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Rapide</h3>
            <p className="text-sm text-slate-400">
              Traitement express de vos demandes
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Local</h3>
            <p className="text-sm text-slate-400">
              Partenaires et produits martiniquais
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Sécurisé</h3>
            <p className="text-sm text-slate-400">
              Paiement et données protégés
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Simple</h3>
            <p className="text-sm text-slate-400">
              Une demande, on s'occupe de tout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
