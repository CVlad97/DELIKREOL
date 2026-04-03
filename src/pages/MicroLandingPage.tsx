const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696000000';

export function MicroLandingPage() {
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Bonjour, je veux commander sur DELIKREOL.'
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              DELIKREOL - Bon plan local
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-orange-700 leading-tight">
              Commande locale, simple et rapide en Martinique
            </h1>
            <p className="text-lg text-slate-600">
              Plats creoles, douceurs, paniers frais et artisanat. Des vendeurs locaux verifies,
              une commande claire, un suivi simple. Tout depuis ton mobile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappLink}
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold text-center"
              >
                Commander via WhatsApp
              </a>
              <a
                href="/"
                className="px-6 py-3 rounded-xl border border-orange-300 text-orange-700 font-bold text-center"
              >
                Voir le catalogue
              </a>
            </div>
            <div className="text-sm text-slate-500">
              Besoin d'un suivi ?{' '}
              <a href="/?order-status=1" className="text-orange-700 font-semibold">
                Suivre ma commande
              </a>
            </div>
          </div>

          <div className="bg-white/90 border border-orange-100 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pourquoi DELIKREOL</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>Vendeurs locaux avec produits fiables et proches.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>Commande rapide, sans inscription lourde.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>Suivi simple et support WhatsApp.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>Prix clairs, commission locale raisonnable.</span>
              </div>
            </div>

            <div className="mt-6 border-t border-orange-100 pt-4">
              <h3 className="font-semibold text-slate-900 mb-2">Comment ca marche</h3>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                <li>Choisis tes produits.</li>
                <li>Confirme la commande.</li>
                <li>Nous te contactons pour la livraison.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-orange-600 text-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-lg font-bold">Pret a commander ?</div>
            <div className="text-sm text-orange-100">
              Service en lancement, retours locaux bienvenus.
            </div>
          </div>
          <a
            href={whatsappLink}
            className="px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-center"
          >
            Demarrer sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
