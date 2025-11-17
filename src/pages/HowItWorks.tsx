import { Package, Store, Truck, Users, CheckCircle, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            Comment fonctionne Delikreol ?
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Une plateforme logistique qui simplifie les commandes pour les clients
            et crée des opportunités pour les partenaires locaux
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-emerald-400 text-center mb-12">
            Le flux complet en 5 étapes
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
            {[
              { icon: Package, label: 'Demande client', color: 'blue' },
              { icon: Users, label: 'Hub Delikreol', color: 'purple' },
              { icon: Store, label: 'Partenaires', color: 'orange' },
              { icon: Truck, label: 'Livraison', color: 'green' },
              { icon: CheckCircle, label: 'Client satisfait', color: 'emerald' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full bg-${step.color}-500/20 border-2 border-${step.color}-500 flex items-center justify-center mb-2`}>
                    <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                  </div>
                  <p className="text-sm text-slate-300 text-center max-w-[100px]">{step.label}</p>
                </div>
                {idx < 4 && (
                  <ArrowRight className="w-6 h-6 text-slate-600 mx-2 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Pour les Clients</h3>
            <p className="text-slate-300 mb-6">
              Commandez simplement, on s'occupe de tout
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Décrivez votre besoin</h4>
                  <p className="text-sm text-slate-400">
                    "Je veux un repas créole pour ce soir" ou "J'ai besoin de fruits frais"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">On trouve pour vous</h4>
                  <p className="text-sm text-slate-400">
                    L'équipe Delikreol et les partenaires s'occupent de trouver, préparer et stocker
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Recevez ou récupérez</h4>
                  <p className="text-sm text-slate-400">
                    Livraison à domicile ou retrait dans un point relais proche
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Suivez en temps réel</h4>
                  <p className="text-sm text-slate-400">
                    Notifications et suivi de votre demande jusqu'à la livraison
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-orange-400 mb-4">Pour les Partenaires</h3>
            <p className="text-slate-300 mb-6">
              Restaurants, producteurs, points relais, livreurs
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Recevez des demandes</h4>
                  <p className="text-sm text-slate-400">
                    Des demandes qualifiées adaptées à votre activité et votre zone
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Faites votre métier</h4>
                  <p className="text-sm text-slate-400">
                    Préparez, stockez ou livrez selon votre rôle
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Mettez à jour le statut</h4>
                  <p className="text-sm text-slate-400">
                    "Préparé", "Prêt au retrait", "En livraison", etc.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Soyez payé</h4>
                  <p className="text-sm text-slate-400">
                    Rémunération selon les règles convenues avec Delikreol
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Hub Admin</h3>
            <p className="text-slate-300 mb-6">
              Orchestration et coordination
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Centralisation</h4>
                  <p className="text-sm text-slate-400">
                    Toutes les demandes clients arrivent dans le hub
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Assignation intelligente</h4>
                  <p className="text-sm text-slate-400">
                    Distribution aux bons partenaires (resto, relais, livreur)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Suivi en temps réel</h4>
                  <p className="text-sm text-slate-400">
                    Vue d'ensemble sur tous les flux en cours
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Support & optimisation</h4>
                  <p className="text-sm text-slate-400">
                    Assistance client et amélioration continue du service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 backdrop-blur border border-emerald-700/50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-emerald-400 mb-4">
            Pourquoi Delikreol ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Simple pour les clients</h4>
              <p className="text-sm text-slate-400">
                Une seule demande, on s'occupe de tout : trouver, préparer, livrer
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Opportunités pour les pros</h4>
              <p className="text-sm text-slate-400">
                Des revenus complémentaires pour les commerçants et livreurs locaux
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Économie locale</h4>
              <p className="text-sm text-slate-400">
                Favorise les circuits courts et le développement du territoire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
