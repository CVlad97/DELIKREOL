import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  ImagePlus,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Warehouse,
  Wallet,
} from 'lucide-react';
import { loadPublicCatalog } from '../services/publicCatalogService';
import { getMartiniqueServiceZones } from '../services/serviceZones';
import { submitPartnerLead, submitPartnerProduct, uploadPartnerProductPhoto } from '../services/partnerPortalService';

type CatalogStats = {
  configured: boolean;
  vendors: number;
  products: number;
};

type PartnerFormState = {
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  commune: string;
  zone_label: string;
  activity_type: string;
  delivery_radius_km: string;
  opening_hours: string;
};

type ProductFormState = {
  business_name: string;
  product_name: string;
  description: string;
  category: string;
  price: string;
  stock_quantity: string;
};

type SubmitStatus = { kind: 'idle' | 'saving' | 'success' | 'error'; message?: string };

const defaultPartnerForm: PartnerFormState = {
  business_name: '',
  contact_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  commune: '',
  zone_label: 'Secteur sud',
  activity_type: 'food_partner',
  delivery_radius_km: '8',
  opening_hours: '',
};

const defaultProductForm: ProductFormState = {
  business_name: '',
  product_name: '',
  description: '',
  category: 'Cuisine locale',
  price: '',
  stock_quantity: '',
};

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const whatsappBase = `https://wa.me/${whatsappNumber}`;

export function LaunchNetworkPage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [catalogStats, setCatalogStats] = useState<CatalogStats>({ configured: false, vendors: 0, products: 0 });
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(defaultPartnerForm);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [partnerStatus, setPartnerStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productStatus, setProductStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [proCompany, setProCompany] = useState('');
  const [proContact, setProContact] = useState('');
  const [proNeed, setProNeed] = useState('');

  useEffect(() => {
    let active = true;

    loadPublicCatalog()
      .then((result) => {
        if (!active) return;
        setCatalogStats({
          configured: result.configured,
          vendors: result.vendors.length,
          products: result.products.length,
        });
        setCatalogStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setCatalogStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const serviceZones = useMemo(
    () =>
      Array.from(
        new Set([
          ...getMartiniqueServiceZones(),
          'Fort-de-France',
          'Lamentin',
          'Ducos',
          'Riviere-Salee',
          'Sainte-Luce',
          'Le Marin',
          'Le Francois',
          'Secteur sud',
        ]),
      ).slice(0, 12),
    [],
  );

  const partnerLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour, je souhaite rejoindre le reseau partenaire DELIKREOL en Martinique.')}`;

  const proLink = useMemo(() => {
    const text = [
      'Bonjour, je souhaite faire une demande pro sur DELIKREOL Martinique.',
      proCompany && `Entreprise : ${proCompany}`,
      proContact && `Contact : ${proContact}`,
      proNeed && `Besoin : ${proNeed}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, [proCompany, proContact, proNeed]);

  const handlePartnerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPartnerStatus({ kind: 'saving', message: 'Enregistrement du partenaire...' });

    try {
      await submitPartnerLead({
        business_name: partnerForm.business_name,
        contact_name: partnerForm.contact_name,
        phone: partnerForm.phone,
        whatsapp: partnerForm.whatsapp || partnerForm.phone,
        email: partnerForm.email,
        address: partnerForm.address,
        commune: partnerForm.commune,
        zone_label: partnerForm.zone_label,
        activity_type: partnerForm.activity_type,
        delivery_radius_km: Number(partnerForm.delivery_radius_km || '8'),
        opening_hours: partnerForm.opening_hours,
      });

      setPartnerStatus({ kind: 'success', message: 'Demande partenaire envoyee. Retour apres verification.' });
      setPartnerForm(defaultPartnerForm);
    } catch (error) {
      setPartnerStatus({ kind: 'error', message: extractError(error, 'Impossible d enregistrer la demande partenaire.') });
    }
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductStatus({ kind: 'saving', message: 'Transmission du catalogue...' });

    try {
      let imageUrl: string | null = null;

      if (productPhoto) {
        const uploaded = await uploadPartnerProductPhoto(productPhoto);
        imageUrl = uploaded.publicUrl;
      }

      await submitPartnerProduct({
        business_name: productForm.business_name,
        product_name: productForm.product_name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price || '0'),
        stock_quantity: productForm.stock_quantity ? Number(productForm.stock_quantity) : undefined,
        is_available: true,
        image_url: imageUrl,
      });

      setProductStatus({ kind: 'success', message: 'Produit transmis pour verification.' });
      setProductForm(defaultProductForm);
      setProductPhoto(null);
    } catch (error) {
      setProductStatus({ kind: 'error', message: extractError(error, 'Impossible d enregistrer le produit pour le moment.') });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8ed] text-[#24170f]">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#accueil" className="flex items-center gap-3" aria-label="DELIKREOL accueil">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-11 w-11 rounded-2xl shadow-lg shadow-orange-500/20" />
            <div>
              <p className="font-black leading-none">DELIKREOL</p>
              <p className="text-xs font-semibold text-stone-500">Reseau local martiniquais</p>
            </div>
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#rejoindre" className="rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-black text-white">Rejoindre le reseau</a>
            <a href="#experience-client" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Parcours client</a>
            <a href="#cockpit-ops" className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800">Cockpit ops</a>
          </nav>
          <a href={partnerLink} className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-black text-white md:hidden">Partenaire</a>
        </div>
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_10%_15%,rgba(251,146,60,0.24),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#fff7ed_0%,#fff_46%,#fff4e6_100%)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#c2410c] shadow-sm">
                <MapPin className="h-4 w-4" /> Martinique uniquement
              </div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-[#301607] md:text-6xl lg:text-7xl">
                Delikreol montre maintenant le reseau partenaire, le parcours client et le cockpit operationnel.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                La plateforme ne se contente plus de recruter des partenaires. Elle montre aussi comment un client commande, suit sa livraison, recoit une estimation, et comment l exploitation garde la main en mode semi-automatise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#f97316] px-6 py-4 font-black text-white shadow-xl shadow-orange-500/25">Rejoindre le reseau <ArrowRight className="h-5 w-5" /></a>
                <a href="#experience-client" className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 font-bold text-[#7c2d12]">Voir le parcours client</a>
                <a href="#cockpit-ops" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-bold text-emerald-800">Voir le cockpit ops</a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustPill icon={<BadgeCheck className="h-5 w-5" />} label="Partenaires verifies" />
                <TrustPill icon={<Clock className="h-5 w-5" />} label="ETA et suivi visibles" />
                <TrustPill icon={<Truck className="h-5 w-5" />} label="Validation manuelle possible" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-2xl shadow-orange-900/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Etat du lancement</p>
              <h2 className="mt-3 text-3xl font-black text-[#301607]">Une facade qui rassure clients, partenaires et prospects pros.</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Cette version montre les preuves attendues : acquisition partenaire, simulation de parcours client, suivi, paiement en deux temps et supervision operationnelle.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatCard label="Partenaires publics actifs" value={catalogStatus === 'ready' ? String(catalogStats.vendors) : '...'} />
                <StatCard label="Produits publics actifs" value={catalogStatus === 'ready' ? String(catalogStats.products) : '...'} />
              </div>

              <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#7c2d12]">Configuration publique {catalogStatus === 'ready' ? (catalogStats.configured ? 'activee' : 'a completer') : 'en verification'}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                <li>- parcours client visible meme avant la pleine ouverture</li>
                <li>- suivi et estimation affichables</li>
                <li>- ajout de produits et photos avant validation publique</li>
                <li>- supervision operationnelle semi-automatisee</li>
              </ul>

              <a href={partnerLink} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#24170f] px-5 py-4 font-black text-white">Parler sur WhatsApp <MessageCircle className="h-5 w-5" /></a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionIntro eyebrow="Pourquoi ce lancement" title="Une logique plus forte face a la concurrence locale" text="Au lieu de promettre une marketplace pleine sans preuve, DELIKREOL montre un reseau actif, un parcours client compréhensible et un pilotage logistique credibles." />
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <FeatureCard icon={<Store className="h-6 w-6" />} title="Vendeurs" text="Traiteurs, producteurs, commerces et artisans alimentaires." />
            <FeatureCard icon={<Truck className="h-6 w-6" />} title="Livreurs" text="Acteurs terrain capables de couvrir une zone ou une tournee." />
            <FeatureCard icon={<Warehouse className="h-6 w-6" />} title="Points relais" text="Commerces et lieux de retrait de proximite." />
            <FeatureCard icon={<Briefcase className="h-6 w-6" />} title="Demandes pros" text="Repas d equipe, commandes groupees et besoins recurrents." />
          </div>
        </section>

        <section id="experience-client" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Parcours client" title="Simulation d une commande et du suivi livraison" text="Cette section sert de vitrine : elle montre a quoi ressemble l experience client finale, sans promettre une automatisation aveugle." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-orange-100 bg-[#fff8ed] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Commande client</p>
                    <h3 className="mt-2 text-2xl font-black text-[#301607]">Plateau creole + jus local</h3>
                    <p className="mt-1 text-sm text-stone-500">Fort-de-France - point relais ou domicile selon zone</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Simulation</span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniCard icon={<CreditCard className="h-5 w-5" />} title="Paiement 1" text="Acompte a la commande pour confirmer." />
                  <MiniCard icon={<Wallet className="h-5 w-5" />} title="Paiement 2" text="Solde a la livraison ou au retrait." />
                  <MiniCard icon={<Clock className="h-5 w-5" />} title="ETA" text="Fenetre estimee 12h20 - 12h50." />
                  <MiniCard icon={<Truck className="h-5 w-5" />} title="Tip livreur" text="Pourboire possible apres livraison." />
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-[#301607]">Statut de commande</p>
                  <div className="mt-4 space-y-4">
                    <TimelineItem title="Commande recue" text="Panier confirme, acompte valide." active />
                    <TimelineItem title="Validation operateur" text="Verification disponibilite + zone + partenaire." active />
                    <TimelineItem title="Preparation partenaire" text="Commande en cours de preparation." active />
                    <TimelineItem title="Livreur assigne" text="Livreur regulier propre, equipe et identifie." />
                    <TimelineItem title="En approche" text="ETA mis a jour si variation significative." />
                    <TimelineItem title="Livree / retiree" text="Confirmation finale + pourboire optionnel." />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Tracking client</p>
                <h3 className="mt-2 text-2xl font-black">Une page simple que le client peut comprendre en 10 secondes.</h3>
                <div className="mt-6 rounded-[1.5rem] bg-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-200">Commande DK-241</span>
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">En cours</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-3/4 rounded-full bg-orange-300" />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <TrackingFact label="Livreur" value="Assigne et joignable via plateforme" />
                    <TrackingFact label="ETA actuel" value="12h35" />
                    <TrackingFact label="Mode" value="Livraison domicile" />
                    <TrackingFact label="Support" value="Operateur disponible si besoin" />
                  </div>
                  <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-stone-200">
                    Mise a jour utile seulement en cas de vrai changement de statut ou d ETA, pour garder un suivi lisible et rassurant.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cockpit-ops" className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Cockpit operationnel" title="Apercu de la supervision semi-automatisee" text="Le systeme peut proposer, mais l exploitation garde le droit de valider, corriger, reasigner ou reprendre la main a tout moment." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Mode d exploitation</p>
                    <h3 className="mt-2 text-2xl font-black text-[#301607]">Auto-assisté, pas tout automatique</h3>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">Validation humaine</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniCard icon={<CheckCircle2 className="h-5 w-5" />} title="Proposition" text="Le systeme suggere partenaire, relais et livreur." />
                  <MiniCard icon={<Users className="h-5 w-5" />} title="Controle" text="Operateur peut valider, modifier ou suspendre." />
                  <MiniCard icon={<MapPin className="h-5 w-5" />} title="Zone" text="Controle de commune et rayon reel." />
                  <MiniCard icon={<ShieldCheck className="h-5 w-5" />} title="Exceptions" text="Reprise en main si blocage ou retard." />
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-[#fff8ed] p-5">
                  <p className="text-sm font-black text-[#301607]">Regles visibles pour rassurer</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                    <li>- aucune promesse hors zone</li>
                    <li>- ETA modifie seulement si ecart important</li>
                    <li>- bascule manuelle si partenaire indisponible</li>
                    <li>- priorite a la fiabilite avant la vitesse</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Vue ops</p>
                <h3 className="mt-2 text-2xl font-black">Pipeline de commandes et logistique</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <OpsColumn title="Nouvelles" items={['DK-241 / FDF / client confirme', 'DK-242 / Ducos / demande pro']} />
                  <OpsColumn title="A valider" items={['assiette locale / partenaire OK / livreur a confirmer', 'point relais / ETA a verifier']} />
                  <OpsColumn title="En cours" items={['livreur assigne / ETA 12h35', 'commande groupee / preparation partenaire']} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionIntro eyebrow="Rejoindre le reseau" title="Inscription partenaire" text="Cette entree convient aux vendeurs, producteurs, traiteurs, livreurs et futurs points relais." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DarkInfoCard title="Ce qu on cherche maintenant" icon={<Users className="h-5 w-5" />}>
              <ul className="space-y-2 text-sm leading-6 text-stone-200">
                <li>- etablissements capables de fournir regulierement</li>
                <li>- partenaires voulant tester une zone pilote</li>
                <li>- points relais de confiance</li>
                <li>- livreurs ou coursiers locaux</li>
                <li>- structures pro avec besoins recurrentiels</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {serviceZones.map((zone) => <span key={zone} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-stone-100">{zone}</span>)}
              </div>
            </DarkInfoCard>

            <FormCard title="Formulaire partenaire" icon={<Store className="h-5 w-5" />}>
              <form className="space-y-3" onSubmit={handlePartnerSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={partnerForm.business_name} onChange={(event) => setPartnerForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Nom de l etablissement" className={inputClass('sm:col-span-2')} required />
                  <input value={partnerForm.contact_name} onChange={(event) => setPartnerForm((current) => ({ ...current, contact_name: event.target.value }))} placeholder="Contact" className={inputClass()} required />
                  <input value={partnerForm.phone} onChange={(event) => setPartnerForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telephone" className={inputClass()} required />
                  <input value={partnerForm.whatsapp} onChange={(event) => setPartnerForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp" className={inputClass()} />
                  <input value={partnerForm.email} onChange={(event) => setPartnerForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className={inputClass()} />
                  <input value={partnerForm.address} onChange={(event) => setPartnerForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adresse" className={inputClass('sm:col-span-2')} />
                  <input value={partnerForm.commune} onChange={(event) => setPartnerForm((current) => ({ ...current, commune: event.target.value }))} placeholder="Commune" className={inputClass()} />
                  <input value={partnerForm.zone_label} onChange={(event) => setPartnerForm((current) => ({ ...current, zone_label: event.target.value }))} placeholder="Zone servie" className={inputClass()} />
                  <input value={partnerForm.delivery_radius_km} onChange={(event) => setPartnerForm((current) => ({ ...current, delivery_radius_km: event.target.value }))} placeholder="Rayon livraison (km)" className={inputClass()} />
                  <input value={partnerForm.activity_type} onChange={(event) => setPartnerForm((current) => ({ ...current, activity_type: event.target.value }))} placeholder="Type d activite" className={inputClass()} />
                  <textarea value={partnerForm.opening_hours} onChange={(event) => setPartnerForm((current) => ({ ...current, opening_hours: event.target.value }))} placeholder="Horaires et creneaux" className={textareaClass('sm:col-span-2')} rows={3} />
                </div>
                <button type="submit" disabled={partnerStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white disabled:opacity-70">{partnerStatus.kind === 'saving' ? 'Envoi en cours...' : 'Envoyer la demande partenaire'}</button>
                <StatusBanner status={partnerStatus} />
              </form>
            </FormCard>
          </div>
        </section>

        <section id="catalogue" className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Catalogue partenaire" title="Ajouter vos produits et vos photos" text="Les produits proposes ne deviennent publics qu apres verification. Cela permet d ouvrir le catalogue client avec des offres reelles et presentables." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <DarkInfoCard title="Ce qui sera verifie" icon={<ShieldCheck className="h-5 w-5" />}>
                <ul className="space-y-2 text-sm leading-6 text-stone-200">
                  <li>- coherence des informations produit</li>
                  <li>- qualite minimale de la photo</li>
                  <li>- lien avec un partenaire identifiable</li>
                  <li>- disponibilite reelle avant publication</li>
                </ul>
              </DarkInfoCard>

              <FormCard title="Ajouter mes produits" icon={<ImagePlus className="h-5 w-5" />}>
                <form className="space-y-3" onSubmit={handleProductSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={productForm.business_name} onChange={(event) => setProductForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Nom de l etablissement" className={inputClass('sm:col-span-2')} required />
                    <input value={productForm.product_name} onChange={(event) => setProductForm((current) => ({ ...current, product_name: event.target.value }))} placeholder="Nom du produit" className={inputClass()} required />
                    <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} placeholder="Categorie" className={inputClass()} />
                    <input value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Prix" className={inputClass()} />
                    <input value={productForm.stock_quantity} onChange={(event) => setProductForm((current) => ({ ...current, stock_quantity: event.target.value }))} placeholder="Stock" className={inputClass()} />
                    <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description courte" className={textareaClass('sm:col-span-2')} rows={3} />
                    <label className="flex items-center justify-between rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-600 sm:col-span-2">
                      <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 text-[#c2410c]" />{productPhoto ? productPhoto.name : 'Ajouter une photo produit'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => setProductPhoto(event.target.files?.[0] ?? null)} />
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">Choisir</span>
                    </label>
                  </div>
                  <button type="submit" disabled={productStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white disabled:opacity-70">{productStatus.kind === 'saving' ? 'Transmission en cours...' : 'Transmettre le catalogue'}</button>
                  <StatusBanner status={productStatus} />
                </form>
              </FormCard>
            </div>
          </div>
        </section>

        <section id="demande-pro" className="bg-[#24170f] py-12 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">Pros et collectivites</p>
              <h2 className="mt-3 text-4xl font-black">Une demande pro simple avant meme l ouverture client complete.</h2>
              <p className="mt-4 max-w-2xl text-stone-300">Repas d equipe, commandes groupees, besoins recurrents, sourcing local ou logistique pilote : DELIKREOL peut qualifier la demande avant engagement.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={partnerLink} className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white">Devenir partenaire</a>
                <a href={proLink} className="rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Envoyer la demande pro</a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={proCompany} onChange={(event) => setProCompany(event.target.value)} placeholder="Entreprise" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400" />
                <input value={proContact} onChange={(event) => setProContact(event.target.value)} placeholder="Contact / telephone" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400" />
                <textarea value={proNeed} onChange={(event) => setProNeed(event.target.value)} placeholder="Besoin, volume, commune, date souhaitee" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 sm:col-span-2" rows={4} />
              </div>
              <a href={proLink} className="mt-4 inline-flex w-full justify-center rounded-2xl bg-emerald-400 px-5 py-4 font-black text-emerald-950">Envoyer la demande pro</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-orange-100 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-10 w-10" />
            <div>
              <p className="font-black">DELIKREOL Martinique</p>
              <p className="text-sm text-stone-500">Reseau local - parcours client visible - supervision operationnelle</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-stone-600">
            <a href="#experience-client">Parcours client</a>
            <a href="#cockpit-ops">Cockpit ops</a>
            <a href="#rejoindre">Partenaires</a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 text-center text-xs font-black">
          <a href="#experience-client" className="rounded-xl bg-[#f97316] px-2 py-3 text-white">Client</a>
          <a href="#cockpit-ops" className="rounded-xl border border-orange-200 px-2 py-3 text-[#7c2d12]">Ops</a>
          <a href="#rejoindre" className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-emerald-800">Partenaire</a>
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#301607] md:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{text}</p></div>;
}

function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">{icon}<span>{label}</span></div>;
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-[#c2410c]">{icon}</div><h3 className="text-xl font-black text-[#301607]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">{label}</p><p className="mt-2 text-3xl font-black text-[#301607]">{value}</p></div>;
}

function MiniCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.25rem] border border-orange-100 bg-white p-4 shadow-sm"><div className="mb-3 inline-flex rounded-xl bg-orange-100 p-2 text-[#c2410c]">{icon}</div><h4 className="text-sm font-black text-[#301607]">{title}</h4><p className="mt-1 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function TimelineItem({ title, text, active }: { title: string; text: string; active?: boolean }) {
  return <div className="flex gap-3"><div className={`mt-1 h-3 w-3 flex-none rounded-full ${active ? 'bg-emerald-500' : 'bg-orange-200'}`} /><div><p className="text-sm font-black text-[#301607]">{title}</p><p className="text-sm leading-6 text-stone-600">{text}</p></div></div>;
}

function TrackingFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-wide text-stone-300">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}

function OpsColumn({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-[1.25rem] bg-white/10 p-4"><p className="text-sm font-black text-orange-200">{title}</p><div className="mt-3 space-y-3">{items.map((item) => <div key={item} className="rounded-xl bg-white/10 p-3 text-sm font-semibold text-stone-100">{item}</div>)}</div></div>;
}

function DarkInfoCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm"><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-200">{icon}<span>{title}</span></div><div className="mt-4">{children}</div></div>;
}

function FormCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3 text-[#c2410c]">{icon}<h3 className="text-xl font-black text-[#301607]">{title}</h3></div>{children}</div>;
}

function StatusBanner({ status }: { status: SubmitStatus }) {
  if (status.kind === 'idle') return null;
  const tone = status.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : status.kind === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-orange-200 bg-orange-50 text-orange-800';
  return <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>{status.message}</p>;
}

function inputClass(extra = '') {
  return `rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 ${extra}`.trim();
}

function textareaClass(extra = '') {
  return `rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 ${extra}`.trim();
}

function extractError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
