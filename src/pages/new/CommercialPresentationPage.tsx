import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bot, CheckCircle2, ChefHat, CreditCard, MapPin,
  PackageCheck, Pause, Play, RotateCcw, ShieldCheck, ShoppingBag,
  Smartphone, Truck, Webhook, Workflow,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

type PresentationStep = {
  title: string;
  eyebrow: string;
  summary: string;
  detail: string;
  automation: string;
  icon: typeof ShoppingBag;
};

export const COMMERCIAL_PRESENTATION_STEPS: PresentationStep[] = [
  {
    eyebrow: '1 · Découverte',
    title: 'Le client trouve un traiteur près de lui',
    summary: 'Commune, géolocalisation, cuisine et disponibilité orientent le client vers les offres publiques.',
    detail: 'Le pilote utilise exactement le même catalogue et le même parcours que le futur lancement grand public.',
    automation: 'Automatique : catalogue public + filtres + géolocalisation consentie.',
    icon: MapPin,
  },
  {
    eyebrow: '2 · Composition',
    title: 'Le client compose son plat',
    summary: 'Accompagnements, sauces, boissons et consignes sont conservés avec la commande.',
    detail: 'Les choix obligatoires peuvent bloquer l’ajout au panier tant qu’ils ne sont pas complétés.',
    automation: 'Automatique : règles de menu + validation du panier.',
    icon: ShoppingBag,
  },
  {
    eyebrow: '3 · Prix serveur',
    title: 'Le serveur recalcule le vrai total',
    summary: 'Le navigateur ne décide ni du prix, ni du vendeur, ni du statut payé.',
    detail: 'Le backend relit produits, vendeur, options et frais puis bloque les paniers multi-vendeurs au lancement.',
    automation: 'Automatique : contrôle serveur + idempotence + jeton de suivi.',
    icon: ShieldCheck,
  },
  {
    eyebrow: '4 · Paiement',
    title: 'SumUp ouvre un checkout hébergé',
    summary: 'Le client est redirigé vers le paiement sans exposer la clé SumUp dans le navigateur.',
    detail: 'Cette présentation simule le paiement : aucun débit, remboursement ou statut payé n’est créé ici.',
    automation: 'Automatique après activation : création checkout + retour sécurisé.',
    icon: CreditCard,
  },
  {
    eyebrow: '5 · Confirmation',
    title: 'Le webhook confirme côté serveur',
    summary: 'DELIKREOL relit le checkout chez SumUp avant toute mutation de commande.',
    detail: 'Montant, devise, référence et état sont contrôlés indépendamment du navigateur.',
    automation: 'Automatique : webhook + relecture fournisseur + idempotence.',
    icon: Webhook,
  },
  {
    eyebrow: '6 · Traiteur',
    title: 'Le traiteur reçoit et traite la commande',
    summary: 'Notification puis acceptation, préparation et disponibilité dans son espace partenaire.',
    detail: 'Les changements de statut sont limités aux transitions autorisées et au vendeur propriétaire de la commande.',
    automation: 'Automatique : notification ; action traiteur : accepter/refuser puis préparer.',
    icon: ChefHat,
  },
  {
    eyebrow: '7 · Remise',
    title: 'Retrait, relais ou livraison indépendante',
    summary: 'Le client suit la commande jusqu’à sa remise avec un statut partagé.',
    detail: 'Un livreur indépendant choisit librement ses missions ; aucune mission n’est imposée par la plateforme.',
    automation: 'Automatique : proposition, suivi et preuve ; acceptation mission volontaire.',
    icon: Truck,
  },
  {
    eyebrow: '8 · Orchestration',
    title: 'n8n supervise les événements et relances',
    summary: 'Les flux peuvent orchestrer notifications, rappels, fournisseurs et support avec journalisation.',
    detail: 'Paiement réel, remboursement, KYC, litige et contrat restent dans une file de validation humaine.',
    automation: 'Automatisable : triage et relances ; sensible : pending_approval.',
    icon: Workflow,
  },
];

const STEP_SECONDS = 6;
export default function CommercialPresentationPage() {
  const autoRequested = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get('autoplay');
    return value !== '0';
  }, []);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(autoRequested);

  useEffect(() => {
    document.title = 'Présentation commerciale — DELIKREOL';
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % COMMERCIAL_PRESENTATION_STEPS.length);
    }, STEP_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const step = COMMERCIAL_PRESENTATION_STEPS[current];
  const Icon = step.icon;
  const progress = ((current + 1) / COMMERCIAL_PRESENTATION_STEPS.length) * 100;

  const next = () => setCurrent((index) => (index + 1) % COMMERCIAL_PRESENTATION_STEPS.length);
  const restart = () => {
    setCurrent(0);
    setPlaying(true);
  };

  return (
    <Layout>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-white shadow-xl">
          <div className="bg-gradient-to-br from-[#fff7ec] via-white to-[#fff1e8] px-6 py-7 sm:px-10 sm:py-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Démonstration guidée · aucun débit réel
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                  DELIKREOL en 8 étapes
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Une présentation simple du parcours client, du paiement sécurisé, du traitement traiteur et de l’orchestration automatisée.
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPlaying((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-black text-primary shadow-sm">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? 'Pause' : 'Lecture'}
                </button>
                <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-white shadow-sm">
                  <RotateCcw className="h-4 w-4" /> Recommencer
                </button>
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-10">
              <div className="flex min-h-[360px] flex-col justify-between rounded-[1.75rem] bg-[#24150f] p-7 text-white sm:p-9">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6c453]">{step.eyebrow}</p>
                  </div>
                  <h2 className="mt-7 text-3xl font-black leading-tight sm:text-4xl">{step.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85">{step.summary}</p>
                  <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">{step.detail}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#f6c453]">
                  <Bot className="h-4 w-4" /> {step.automation}
                </div>
              </div>
            </div>

            <aside className="border-t border-input bg-muted/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">Scénario automatique</p>
              <div className="mt-5 space-y-3">
                {COMMERCIAL_PRESENTATION_STEPS.map((item, index) => {
                  const ItemIcon = item.icon;
                  const active = index === current;
                  return (
                    <button key={item.title} type="button" onClick={() => setCurrent(index)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:border-primary/20 hover:bg-white'}`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-primary text-white' : 'bg-white text-muted-foreground'}`}>
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-black ${active ? 'text-primary' : 'text-foreground'}`}>{item.eyebrow}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>

          <div className="border-t border-input bg-white px-6 py-5 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4 text-primary" />
                <span>Lecture automatique : {STEP_SECONDS}s par étape · durée ≈ {COMMERCIAL_PRESENTATION_STEPS.length * STEP_SECONDS}s</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full border border-input bg-white px-4 py-2 text-sm font-black text-foreground">
                  Étape suivante <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/catalogue" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-white">
                  Voir le catalogue réel <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-input bg-white p-6">
            <CheckCircle2 className="h-7 w-7 text-success" />
            <h3 className="mt-4 text-lg font-black">Pilote présentable</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Le parcours peut être montré en public sans déclencher de paiement ni modifier une commande réelle.</p>
          </article>
          <article className="rounded-3xl border border-input bg-white p-6">
            <PackageCheck className="h-7 w-7 text-primary" />
            <h3 className="mt-4 text-lg font-black">Même architecture que la production</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Catalogue, règles serveur, suivi et espaces partenaires sont présentés sans simuler un faux succès de paiement.</p>
          </article>
          <article className="rounded-3xl border border-input bg-white p-6">
            <Workflow className="h-7 w-7 text-secondary" />
            <h3 className="mt-4 text-lg font-black">Automatisation progressive</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">n8n peut automatiser les événements sûrs. Les actions juridiques ou financières sensibles restent soumises à validation.</p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-input bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Vidéo tuto</p>
              <h2 className="mt-2 text-2xl font-black">Présentation vidéo prête à partager</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">La vidéo reprend le même scénario en moins d’une minute. Elle est générée localement sur le VPS pour éviter un abonnement vidéo.</p>
            </div>
          </div>
          <video className="mt-5 aspect-video w-full rounded-2xl bg-black" controls playsInline preload="metadata" poster="/branding/hero-tropical.png">
            <source src="/media/delikreol-presentation-commerciale.mp4" type="video/mp4" />
          </video>
        </section>
      </main>
    </Layout>
  );
}
