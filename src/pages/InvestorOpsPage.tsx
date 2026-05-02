import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  getOpsDashboardSnapshot,
  getOpsInvestorReadiness,
  type OpsDashboardSnapshot,
  proactiveDeliveryPlaybook,
  type ProactiveDeliveryOwner,
} from '../services/opsService';

const competitorMatrix = [
  {
    segment: 'Commande informelle par messagerie',
    strength: 'Rapide a lancer, habitudes client deja presentes.',
    limit: 'Peu tracable, difficile a piloter, faible preuve pour investisseur.',
    delikreol: 'Commande enregistree, panier, statut, partenaire et livraison structurables.',
  },
  {
    segment: 'Livraison generique',
    strength: 'Processus connu et execution terrain directe.',
    limit: 'Peu specialisee sur les partenaires locaux et les rayons reels.',
    delikreol: 'Couverture calculee par partenaire, retrait/livraison et validation humaine.',
  },
  {
    segment: 'Vendeur isole',
    strength: 'Produit local authentique et relation client directe.',
    limit: 'Catalogue disperse, pas de coordination multi-partenaire.',
    delikreol: 'Vitrine mutualisee avec demande entreprise, panier et suivi operationnel.',
  },
  {
    segment: 'Marketplace nationale',
    strength: 'Marque forte, habitudes digitales, moyens marketing.',
    limit: 'Peu adaptee aux contraintes terrain d une ile et aux petits partenaires.',
    delikreol: 'Positionnement Martinique, pilote local, logistique souple et controle humain.',
  },
];

const investorSignals = [
  {
    label: 'Source de verite',
    value: 'Supabase',
    detail: 'Commandes, items, partenaires et documents peuvent etre audites.',
  },
  {
    label: 'Moteur commercial',
    value: 'Application',
    detail: 'WhatsApp reste un support, pas le coeur de la commande.',
  },
  {
    label: 'Couverture',
    value: 'Rayon partenaire',
    detail: 'La livraison se calcule autour du partenaire, avec commune en fallback.',
  },
  {
    label: 'Controle risque',
    value: 'Validation humaine',
    detail: 'Vendeur et livreur ne sont pas envoyes automatiquement sans confirmation.',
  },
];

const pilotKpis = [
  'Taux de commande complete avec adresse et contact',
  'Temps de qualification ops',
  'Taux de confirmation vendeur',
  'Delai preparation + livraison',
  'Marge nette par mission',
  'Taux incident / litige',
];

const ownerLabels: Record<ProactiveDeliveryOwner, string> = {
  ops: 'Ops DELIKREOL',
  partner: 'Partenaire',
  driver: 'Livreur',
  support: 'Support',
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function InvestorOpsPage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [snapshot, setSnapshot] = useState<OpsDashboardSnapshot | null>(null);

  useEffect(() => {
    void getOpsDashboardSnapshot().then(setSnapshot);
  }, []);

  const readiness = snapshot ? getOpsInvestorReadiness(snapshot) : null;

  return (
    <div className="min-h-screen bg-[#fbf4ea] text-[#24170f]">
      <header className="border-b border-orange-100 bg-[#fff8ec]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <a href={baseUrl} className="flex items-center gap-3">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-12 w-12 rounded-2xl bg-white p-1.5 shadow-sm" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Investisseur / operations</p>
              <p className="text-lg font-black">DELIKREOL</p>
            </div>
          </a>
          <div className="hidden items-center gap-2 sm:flex">
            <a href={`${baseUrl}#catalogue`} className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-[#7c2d12]">
              Voir catalogue
            </a>
            <a href={`${baseUrl}#partenaires`} className="rounded-full bg-[#d95f2d] px-4 py-2 text-sm font-black text-white">
              Recruter partenaire
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-orange-100">
          <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
            <div>
              <span className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#7c2d12]">
                Martinique pilote
              </span>
              <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                Une plateforme locale qui se pilote comme une operation, pas comme une simple vitrine.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                DELIKREOL doit prouver trois choses a un investisseur martiniquais : acquisition locale, execution fiable et marge mesurable. Cette page formalise le positionnement face aux alternatives et le mode de gestion terrain.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#readiness" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#24170f] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white">
                  Voir readiness <ArrowRight className="h-4 w-4" />
                </a>
                <a href={baseUrl} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-4 text-sm font-black text-[#7c2d12]">
                  Retour accueil
                </a>
              </div>
            </div>

            <div id="readiness" className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-elegant">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Readiness investisseur</p>
                  <h2 className="mt-2 text-3xl font-black">{readiness ? `${readiness.score}/100` : 'Calcul en cours'}</h2>
                </div>
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500"
                  style={{ width: `${readiness?.score ?? 0}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                {readiness?.summary ?? 'Lecture du pipeline operationnel local.'}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricCard icon={PackageCheck} label="Demandes" value={snapshot ? String(snapshot.kpis.requestsToday) : '-'} />
                <MetricCard icon={Users} label="Partenaires actifs" value={snapshot ? String(snapshot.kpis.availablePartners) : '-'} />
                <MetricCard icon={Clock} label="A qualifier" value={snapshot ? String(snapshot.kpis.awaitingQualification) : '-'} />
                <MetricCard icon={BarChart3} label="Marge estimee" value={snapshot ? formatEuro(snapshot.finance.marginToday) : '-'} />
              </div>
              {readiness && readiness.blockers.length > 0 && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Points a traiter avant pitch</p>
                  <ul className="mt-3 space-y-2 text-sm text-amber-900">
                    {readiness.blockers.map((blocker) => (
                      <li key={blocker} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-600" />
                        <span>{blocker}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {investorSignals.map((signal) => (
              <div key={signal.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{signal.label}</p>
                <h3 className="mt-2 text-2xl font-black">{signal.value}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{signal.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fff8ef] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading eyebrow="Versus concurrence" title="Le bon angle n'est pas de promettre plus. C'est d'etre plus operable." />
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-soft">
              <div className="grid grid-cols-1 border-b border-orange-100 bg-[#24170f] text-sm font-black uppercase tracking-[0.14em] text-orange-100 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
                <div className="p-4">Alternative</div>
                <div className="p-4">Force</div>
                <div className="p-4">Limite</div>
                <div className="p-4">Reponse DELIKREOL</div>
              </div>
              {competitorMatrix.map((item) => (
                <div key={item.segment} className="grid grid-cols-1 border-b border-orange-100 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
                  <div className="p-4 font-black text-[#2a190f]">{item.segment}</div>
                  <div className="p-4 text-sm leading-6 text-stone-600">{item.strength}</div>
                  <div className="p-4 text-sm leading-6 text-stone-600">{item.limit}</div>
                  <div className="p-4 text-sm font-semibold leading-6 text-[#7c2d12]">{item.delikreol}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading eyebrow="Livraison proactive" title="Un protocole clair avant d'automatiser." />
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {proactiveDeliveryPlaybook.map((step, index) => (
              <div key={step.id} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#7c2d12]">Etape {index + 1}</span>
                  <span className="text-xs font-black text-stone-400">{step.targetMinutes} min</span>
                </div>
                <h3 className="mt-4 text-lg font-black">{step.trigger}</h3>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#c2410c]">{ownerLabels[step.owner]}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600">{step.action}</p>
                <div className="mt-4 rounded-2xl bg-[#fff8ef] p-3 text-xs leading-5 text-stone-600">
                  <strong>Preuve :</strong> {step.evidence}
                  <br />
                  <strong>Fallback :</strong> {step.fallback}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#24170f] py-14 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Gestion parfaite = discipline mesurable</p>
              <h2 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
                Les KPI a prouver avant de lever ou d'ouvrir largement.
              </h2>
              <p className="mt-4 text-sm leading-6 text-stone-300">
                Aucun chiffre marketing non prouve n'est affiche. La bonne strategie consiste a produire un pilote court, mesurable et defendable devant un investisseur local.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pilotKpis.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-bold leading-6 text-stone-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-elegant lg:p-8">
            <SectionHeading eyebrow="Prochaine execution" title="Ce qui doit etre prouve sur le terrain." />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(readiness?.nextActions ?? [
                'Finaliser le test client, vendeur, livreur et preuve de remise.',
                'Mesurer le delai de qualification et la marge par commande.',
                'Qualifier les documents partenaires avant visibilite publique.',
              ]).map((action) => (
                <div key={action} className="rounded-[1.35rem] border border-orange-100 bg-[#fffaf4] p-5">
                  <BadgeCheck className="h-6 w-6 text-[#d95f2d]" />
                  <p className="mt-4 text-sm font-bold leading-6 text-stone-700">{action}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={`${baseUrl}#partenaires`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d95f2d] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white">
                Ajouter partenaires <Store className="h-4 w-4" />
              </a>
              <a href={`${baseUrl}?view=admin-documents`} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-4 text-sm font-black text-[#7c2d12]">
                Controle documents <ShieldCheck className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-orange-100 bg-[#fff9f3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <span>DELIKREOL - page investisseur pilote Martinique</span>
          <span>Donnees operationnelles a valider sur terrain reel avant pitch financier.</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">{eyebrow}</p>
      <h2 className="mt-3 max-w-4xl font-display text-4xl font-black leading-tight tracking-tight text-[#24170f] sm:text-5xl">{title}</h2>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-[#fffaf4] p-4">
      <Icon className="h-5 w-5 text-[#d95f2d]" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
