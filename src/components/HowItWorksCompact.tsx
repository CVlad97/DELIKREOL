import { useState } from 'react';
import { Search, ShoppingCart, Package, ChevronDown, ChevronUp } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Choisis', detail: 'Parcours les plats des traiteurs martiniquais. Filtre par commune, budget ou disponibilité.' },
  { icon: ShoppingCart, title: 'Confirme', detail: 'Ajoute au panier, choisis retrait, point relais ou livraison. Confirme ta commande sur le site.' },
  { icon: Package, title: 'Récupère ou reçois', detail: 'Retire chez le partenaire, passe au point relais ou reçois chez toi selon disponibilité.' },
];

export function HowItWorksCompact() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Comment ça marche</h2>
        <p className="text-sm text-gray-500 mb-8">3 étapes simples pour commander local</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mb-3">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-sm text-orange-600 font-semibold hover:text-orange-700"
        >
          {expanded ? 'Masquer les détails' : 'Voir le détail'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 text-left">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <step.icon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}