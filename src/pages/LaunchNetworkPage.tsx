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
  Package,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Wallet,
  Warehouse,
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
  const shareLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour, je viens de voir DELIKREOL. Je souhaite en savoir plus sur le lancement operationnel en Martinique.')}`;

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
              <p className="text-xs font-semibold text-stone-500">Plateforme locale operationnelle</p>
            </div>
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#client" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Client</a>
            <a href="#ops" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Ops</a>
            <a href="#partenaires" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Partenaires</a>
            <a href="#lancement" className="rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-black text-white">Pret a partager</a>
          </nav>
          <a href={shareLink} className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-black text-white md:hidden">Partager</a>
        </div>
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_10%_15%,rgba(251,146,60,0.24),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#fff7ed_0%,#fff_46%,#fff4e6_100%)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#c2410c] shadow-sm">
                <MapPin className="h-4 w-4" /> Martinique uniquement
              </div>
              <h1 className="max-w-5xl text-4xl font-black tracking-tight text-[#301607] md:text-6xl lg:text-7xl">
                Une plateforme serieuse qui montre directement le client, la logistique, les partenaires et le lancement pilote.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                DELIKREOL est presente comme une plateforme directement lisible : commande client, suivi de livraison, cockpit operationnel, validation humaine, reseau partenaires et lancement par zone pilote.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#client" className="inline-flex items-center gap-2 rounded-2xl bg-[#f97316] px-6 py-4 font-black text-white shadow-xl shadow-orange-500/25">Voir le parcours client <ArrowRight className="h-5 w-5" /></a>
                <a href="#ops" className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 font-bold text-[#7c2d12]">Voir le cockpit ops</a>
                <a href="#partenaires" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-bold text-emerald-800">Voir le reseau partenaire</a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                <TrustPill icon={<BadgeCheck className="h-5 w-5" />} label="Client" />
                <TrustPill icon={<Truck className="h-5 w-5" />} label="Logistique" />
                <TrustPill icon={<Users className="h-5 w-5" />} label="Ops" />
                <TrustPill icon={<Store className="h-5 w-5" />} label="Partenaires" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white/92 p-6 shadow-2xl shadow-orange-900/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Etat de la plateforme</p>
              <h2 className="mt-3 text-3xl font-black text-[#301607]">Une facade faite pour etre partagee presque immediatement.</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                En quelques secondes, le visiteur comprend ce que voit le client, ce que gere l exploitation, comment les partenaires entrent, et comment un lancement pilote peut tourner rapidement.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatCard label="Partenaires publics actifs" value={catalogStatus === 'ready' ? String(catalogStats.vendors) : '...'} />
                <StatCard label="Produits publics actifs" value={catalogStatus === 'ready' ? String(catalogStats.products) : '...'} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ReadyFlag label="Client" value="Visible" />
                <ReadyFlag label="Suivi" value="Visible" />
                <ReadyFlag label="Ops" value="Visible" />
                <ReadyFlag label="Partenaires" value="Visible" />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#lancement" className="inline-flex items-center gap-2 rounded-2xl bg-[#24170f] px-5 py-4 font-black text-white">Voir le plan de lancement</a>
                <a href={shareLink} className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 px-5 py-4 font-bold text-[#7c2d12]">Partager maintenant</a>
              </div>
            </div>
          </div>
        </section>

        <section id="client" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Client" title="Le parcours client est visible tout de suite" text="La plateforme montre le panier, l acompte, le solde a la livraison, l ETA, le suivi et le pourboire livreur. Le prospect voit donc un produit pense pour le terrain, pas une simple idee." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-orange-100 bg-[#fff8ed] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Commande exemple</p>
                    <h3 className="mt-2 text-2xl font-black text-[#301607]">Plateau creole + jus local</h3>
                    <p className="mt-1 text-sm text-stone-500">Fort-de-France - livraison domicile ou point relais selon zone</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Simulation visible</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniCard icon={<CreditCard className="h-5 w-5" />} title="Acompte" text="Une partie a la commande pour confirmer le flux." />
                  <MiniCard icon={<Wallet className="h-5 w-5" />} title="Solde" text="Le reste a la livraison ou au retrait." />
                  <MiniCard icon={<Clock className="h-5 w-5" />} title="ETA" text="Fenetre estimee visible et mise a jour si besoin." />
                  <MiniCard icon={<Truck className="h-5 w-5" />} title="Tip livreur" text="Possible apres satisfaction du client." />
                </div>
                <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-[#301607]">Suivi de commande</p>
                  <div className="mt-4 space-y-4">
                    <TimelineItem title="Commande recue" text="Panier confirme et acompte valide." active />
                    <TimelineItem title="Verification operateur" text="Disponibilite, zone et partenaire verifies." active />
                    <TimelineItem title="Preparation" text="Le partenaire prepare la commande." active />
                    <TimelineItem title="Livreur assigne" text="Livreur identifie et ETA partage." />
                    <TimelineItem title="En approche" text="Notification simple et lisible pour le client." />
                    <TimelineItem title="Livree" text="Confirmation finale et tip optionnel." />
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Ecran client</p>
                <h3 className="mt-2 text-2xl font-black">Une interface simple a comprendre en quelques secondes</h3>
                <div className="mt-6 rounded-[1.5rem] bg-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-200">Commande DK-241</span>
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">En cours</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 w-3/4 rounded-full bg-orange-300" /></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <TrackingFact label="ETA actuel" value="12h35 - 12h50" />
                    <TrackingFact label="Mode" value="Livraison domicile" />
                    <TrackingFact label="Paiement" value="Acompte + solde" />
                    <TrackingFact label="Support" value="Operateur joignable" />
                  </div>
                  <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-stone-200">Le client voit un suivi utile, sans surcharge, avec reprise en main possible par l exploitation.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ops" className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Operations" title="Le cockpit montre que la plateforme n est pas livree au hasard" text="Le systeme peut proposer automatiquement, mais l exploitation garde la main pour valider, corriger, reasigner ou suspendre. C est ce qui rend le projet credible et pilotable." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Mode d exploitation</p>
                    <h3 className="mt-2 text-2xl font-black text-[#301607]">Semi-automatise, jamais aveugle</h3>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">Reprise en main humaine</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniCard icon={<CheckCircle2 className="h-5 w-5" />} title="Proposition auto" text="Le systeme suggere partenaire, relais et livreur." />
                  <MiniCard icon={<Users className="h-5 w-5" />} title="Validation" text="Operateur valide ou modifie avant execution." />
                  <MiniCard icon={<MapPin className="h-5 w-5" />} title="Controle zone" text="Commune et rayon verifies avant promesse client." />
                  <MiniCard icon={<ShieldCheck className="h-5 w-5" />} title="Gestion incident" text="Retard, rupture, indisponibilite : reprise manuelle possible." />
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-[#fff8ed] p-5">
                  <p className="text-sm font-black text-[#301607]">Regles visibles</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                    <li>- aucune promesse hors zone</li>
                    <li>- ETA corrige si l ecart devient significatif</li>
                    <li>- partenaire et livreur peuvent etre reassignes</li>
                    <li>- la fiabilite passe avant la vitesse marketing</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Pipeline ops</p>
                <h3 className="mt-2 text-2xl font-black">Exemple de supervision des flux</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <OpsColumn title="Nouvelles" items={['DK-241 / client confirme / acompte recu', 'DK-242 / demande pro / Ducos']} />
                  <OpsColumn title="A valider" items={['partenaire disponible / rayon OK', 'point relais ou domicile a confirmer']} />
                  <OpsColumn title="En cours" items={['livreur assigne / ETA 12h35', 'commande groupee / preparation en cours']} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="partenaires" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Partenaires" title="Le reseau partenaire est visible et actionnable" text="La page montre tout de suite comment un vendeur, un livreur, un point relais ou un prospect pro peut entrer dans le systeme. Cela rend le partage plus simple et plus credible." />
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <FeatureCard icon={<Store className="h-6 w-6" />} title="Vendeurs" text="Traiteurs, producteurs, restaurants, commerces." />
              <FeatureCard icon={<Truck className="h-6 w-6" />} title="Livreurs" text="Coursiers regulierement disponibles par zone." />
              <FeatureCard icon={<Warehouse className="h-6 w-6" />} title="Points relais" text="Retrait de proximite et mutualisation locale." />
              <FeatureCard icon={<Briefcase className="h-6 w-6" />} title="Pros" text="Commandes groupees et besoins recurrents." />
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <DarkInfoCard title="Zones pilotes" icon={<MapPin className="h-5 w-5" />}>
                <p className="text-sm leading-6 text-stone-200">Le site est pense pour commencer sur un perimetre limite, apprendre vite, puis s etendre sans surpromettre.</p>
                <div className="mt-5 flex flex-wrap gap-2">{serviceZones.map((zone) => <span key={zone} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-stone-100">{zone}</span>)}</div>
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
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <DarkInfoCard title="Catalogue partenaire" icon={<Package className="h-5 w-5" />}>
                <p className="text-sm leading-6 text-stone-200">Les produits et photos sont proposes avant publication. La facade publique reste honnete : pas de faux catalogue.</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-200">
                  <li>- description produit</li>
                  <li>- prix et stock</li>
                  <li>- photo produit</li>
                  <li>- verification avant mise en ligne</li>
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

        <section id="lancement" className="bg-[#24170f] py-12 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Lancement pilote" title="Montrer qu une zone peut deja tourner avec peu de partenaires" text="Le plus important n est pas d ouvrir partout. Le plus important est de montrer qu une zone pilote peut deja vendre, livrer, suivre et apprendre vite avec quelques partenaires solides." />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <LaunchCard title="3 types de partenaires" text="1 vendeur, 1 livreur et 1 point relais suffisent pour ouvrir une zone test." />
              <LaunchCard title="Perimetre limite" text="Une commune ou un secteur pilote suffit pour verifier les flux et corriger vite." />
              <LaunchCard title="Projection simple" text="Objectif : commandes reelles, marge lisible et preuve terrain avant extension." />
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6">
                <p className="text-sm font-black text-orange-200">Ce que le site prouve maintenant</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-200">
                  <li>- le client comprend le service</li>
                  <li>- le prospect voit que l exploitation existe</li>
                  <li>- le partenaire voit comment entrer</li>
                  <li>- le projet peut etre partage sans paraitre vide</li>
                </ul>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6">
                <p className="text-sm font-black text-orange-200">Actions immediates</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={shareLink} className="rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white">Partager maintenant</a>
                  <a href={partnerLink} className="rounded-2xl border border-white/20 px-5 py-4 font-bold text-white">Recruter des partenaires</a>
                  <a href={proLink} className="rounded-2xl border border-emerald-300 bg-emerald-400 px-5 py-4 font-black text-emerald-950">Recevoir une demande pro</a>
                </div>
              </div>
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
              <p className="text-sm text-stone-500">Client - operations - partenaires - lancement pilote</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-stone-600">
            <a href="#client">Client</a>
            <a href="#ops">Ops</a>
            <a href="#partenaires">Partenaires</a>
            <a href="#lancement">Lancement</a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 text-center text-xs font-black">
          <a href="#client" className="rounded-xl bg-[#f97316] px-2 py-3 text-white">Client</a>
          <a href="#ops" className="rounded-xl border border-orange-200 px-2 py-3 text-[#7c2d12]">Ops</a>
          <a href="#partenaires" className="rounded-xl border border-orange-200 px-2 py-3 text-[#7c2d12]">Pro</a>
          <a href="#lancement" className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-emerald-800">Go</a>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">{label}</p><p className="mt-2 text-3xl font-black text-[#301607]">{value}</p></div>;
}

function ReadyFlag({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-bold text-[#7c2d12]"><span className="mr-2 text-[#f97316]">●</span>{label} : {value}</div>;
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-[#c2410c]">{icon}</div><h3 className="text-xl font-black text-[#301607]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>;
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

function LaunchCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-6"><h3 className="text-xl font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-200">{text}</p></div>;
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
