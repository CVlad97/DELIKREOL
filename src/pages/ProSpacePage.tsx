import { Building2, ChevronRight, ShieldCheck, Store, Truck } from 'lucide-react';

export function ProSpacePage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const partnerLaunchLink = `${baseUrl}?view=launch-network`;

  return (
    <div className="min-h-screen bg-[#fbf4ea] text-[#2a190f]">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">DELIKREOL</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Espace Pro</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Accès séparé du parcours client. Choisissez votre entrée selon votre rôle: partenaire, livreur, point relais ou admin.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <a
              href={partnerLaunchLink}
              className="rounded-[1.4rem] border border-orange-200 bg-[#fff8ef] p-5 transition hover:-translate-y-0.5"
            >
              <div className="inline-flex rounded-xl bg-white p-2 text-[#d95f2d]">
                <Store className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-xl font-black">Devenir partenaire</h2>
              <p className="mt-2 text-sm text-stone-600">Restaurant, traiteur, producteur, livreur ou point relais.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7c2d12]">
                Ouvrir le formulaire <ChevronRight className="h-4 w-4" />
              </span>
            </a>

            <a
              href={`${baseUrl}?view=partner-documents`}
              className="rounded-[1.4rem] border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5"
            >
              <div className="inline-flex rounded-xl bg-[#fff3e5] p-2 text-[#d95f2d]">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-xl font-black">Accès partenaire</h2>
              <p className="mt-2 text-sm text-stone-600">Déposer et suivre vos documents, conformité et statut.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7c2d12]">
                Ouvrir le portail <ChevronRight className="h-4 w-4" />
              </span>
            </a>

            <a
              href={`${baseUrl}?view=admin-documents`}
              className="rounded-[1.4rem] border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5"
            >
              <div className="inline-flex rounded-xl bg-[#fff3e5] p-2 text-[#d95f2d]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-xl font-black">Accès admin</h2>
              <p className="mt-2 text-sm text-stone-600">Validation documentaire et supervision opérationnelle.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7c2d12]">
                Ouvrir l’admin <ChevronRight className="h-4 w-4" />
              </span>
            </a>

            <a
              href={`${baseUrl}?view=customer`}
              className="rounded-[1.4rem] border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5"
            >
              <div className="inline-flex rounded-xl bg-[#fff3e5] p-2 text-[#d95f2d]">
                <Truck className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-xl font-black">Retour espace client</h2>
              <p className="mt-2 text-sm text-stone-600">Catalogue, panier, commande et suivi client.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7c2d12]">
                Revenir au site <ChevronRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// Ajout de la section pour les traiteurs
<a
  href={`${baseUrl}?view=traiteurs`}
  className="rounded-[1.4rem] border border-orange-200 bg-white p-5 transition hover:-translate-y-0.5"
>
  <div className="inline-flex rounded-xl bg-[#fff3e5] p-2 text-[#d95f2d]">
    <Store className="h-5 w-5" />
  </div>
  <h2 className="mt-3 text-xl font-black">Traiteurs</h2>
  <p className="mt-2 text-sm text-stone-600">Accédez à la liste des traiteurs disponibles et gérez vos commandes.</p>
  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7c2d12]">
    Voir les traiteurs <ChevronRight className="h-4 w-4" />
  </span>
</a>