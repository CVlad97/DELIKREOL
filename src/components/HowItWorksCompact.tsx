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
    <section className="py-8 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-xl font-black text-gray-900 mb-1.5">Comment ça marche</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-5">3 étapes simples pour commander local</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 mb-2.5">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">{step.title}</h3>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-orange-600 font-semibold hover:text-orange-700"
        >
          {expanded ? 'Masquer les détails' : 'Voir le détail'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 text-left">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-orange-50 p-3">
                <step.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
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
