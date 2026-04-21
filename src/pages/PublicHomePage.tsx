import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, MapPin, MessageCircle, Package, ShoppingBag, Store, Truck, Users } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { Vendor } from '../lib/supabase';
import { catalogService } from '../services/catalogService';
import { LocalProduct } from '../data/mockCatalog';

type PublicVendor = Vendor & {
  is_public?: boolean | null;
  is_demo?: boolean | null;
  status?: string | null;
  service_zone?: string | null;
  zone_label?: string | null;
};

type PublicProduct = LocalProduct & {
  is_public?: boolean | null;
  is_demo?: boolean | null;
  status?: string | null;
  vendor_id?: string;
  vendorId?: string;
};

const zones = ['Fort-de-France', 'Le Lamentin', 'Schoelcher'];
const contactPhone = '+596 696 65 35 89';
const ok = (v: unknown) => v === true || String(v ?? '').toLowerCase() === 'true';
const verified = (v: unknown) => String(v ?? '').toLowerCase() === 'verified';

function vendorIsPublic(vendor: PublicVendor) {
  return ok(vendor.is_public) && !ok(vendor.is_demo) && verified(vendor.status);
}

function productIsPublic(product: PublicProduct) {
  return ok(product.is_public) && !ok(product.is_demo) && verified(product.status) && product.available !== false;
}

export function PublicHomePage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
  const whatsappBase = `https://wa.me/${whatsappNumber}`;
  const [vendors, setVendors] = useState<PublicVendor[]>([]);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selected, setSelected] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [proCompany, setProCompany] = useState('');
  const [proContact, setProContact] = useState('');
  const [proNeed, setProNeed] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([catalogService.listVendors(), catalogService.listProducts()])
      .then(([vendorRows, productRows]) => {
        if (!active) return;
        const publicVendors = (vendorRows as PublicVendor[]).filter(vendorIsPublic);
        const vendorMap = new Map(publicVendors.map((vendor) => [vendor.id, vendor]));
        const publicProducts = (productRows as unknown as PublicProduct[])
          .filter(productIsPublic)
          .filter((product) => vendorMap.has(product.vendor_id ?? product.vendorId ?? ''))
          .map((product) => {
            const vendor = vendorMap.get(product.vendor_id ?? product.vendorId ?? '');
            return {
              ...product,
              vendor: vendor?.business_name ?? product.vendor ?? 'Partenaire DELIKREOL',
              zone: vendor?.service_zone ?? vendor?.zone_label ?? vendor?.address ?? 'Martinique',
            };
          });
        setVendors(publicVendors);
        setProducts(publicProducts);
      })
      .catch(() => setError('Catalogue public indisponible pour le moment.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ['Toutes', ...Array.from(new Set(products.map((p) => p.category || 'Divers')))], [products]);
  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const text = `${product.name} ${product.vendor} ${product.category} ${product.description ?? ''}`.toLowerCase();
      return (!needle || text.includes(needle)) && (category === 'Toutes' || product.category === category);
    });
  }, [category, products, query]);

  const orderLink = useMemo(() => {
    const lines = selected.map((product) => `- ${product.name} · ${product.vendor} · ${product.price.toFixed(2)} €`);
    const text = ['Bonjour, je souhaite commander sur DELIKREOL Martinique.', '', 'Selection :', ...lines, '', 'Merci de confirmer disponibilite, retrait ou livraison.'].join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, [selected, whatsappBase]);

  const proLink = useMemo(() => {
    const text = ['Bonjour, je souhaite une demande pro sur DELIKREOL Martinique.', proCompany && `Entreprise: ${proCompany}`, proContact && `Contact: ${proContact}`, proNeed && `Besoin: ${proNeed}`].filter(Boolean).join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, [proCompany, proContact, proNeed, whatsappBase]);

  const addProduct = (product: LocalProduct) => setSelected((current) => [...current, product]);
  const removeProduct = (id: string) => setSelected((current) => {
    const index = current.findIndex((item) => item.id === id);
    return index === -1 ? current : current.filter((_, itemIndex) => itemIndex !== index);
  });

  const hasRealData = vendors.length > 0 && products.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1014] via-[#11161b] to-[#10181d] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-10 w-10" />
            <img src={`${baseUrl}branding/logo-wordmark-premium.svg`} alt="DELIKREOL" className="hidden h-10 md:block" />
          </div>
          <nav className="flex items-center gap-2 md:gap-3">
            <a href="#catalogue" className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-200">Commander</a>
            <a href="#partenaires" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">Devenir partenaire</a>
            <a href="#demande-pro" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950">Demande pro</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <section className="rounded-[2rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,14,20,0.96))] p-8 shadow-2xl md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Martinique uniquement</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Commande locale simple, retrait ou livraison, avec partenaires verifies en Martinique.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">DELIKREOL centralise les commandes locales verifiees, confirme les disponibilites et oriente chaque demande vers le bon partenaire en Martinique.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalogue" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-slate-950">Commander <ArrowRight className="h-5 w-5" /></a>
            <a href="#partenaires" className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-100">Devenir partenaire</a>
            <a href="#demande-pro" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 font-semibold text-emerald-200">Demande pro</a>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard icon={<ShoppingBag />} title="Commande simple" text="Choix produit, confirmation de disponibilite, puis validation finale." />
          <InfoCard icon={<Truck />} title="Retrait ou livraison" text="Conditions publiques lisibles selon zone desservie et partenaire actif." />
          <InfoCard icon={<Store />} title="Partenaires verifies" text="Seuls les partenaires verifies et publics sont visibles." />
        </section>

        <section id="zones" className="mt-10 rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3"><MapPin className="h-6 w-6 text-emerald-300" /><h2 className="text-2xl font-bold text-white">Zones desservies en Martinique</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">La facade publique se limite aux zones actuellement servies. Toute extension doit etre verifiee avant publication.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">{zones.map((zone) => <div key={zone} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"><div className="font-semibold text-slate-100">{zone}</div><div className="mt-1 text-sm text-slate-400">Retrait, livraison ou confirmation selon partenaire.</div></div>)}</div>
        </section>

        <section id="catalogue" className="mt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h2 className="text-3xl font-bold text-white">Catalogue public verifie</h2><p className="mt-2 text-sm text-slate-300">Uniquement les partenaires et produits publics, verifies et reels.</p></div><a href={whatsappBase} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">WhatsApp direct <ArrowRight className="h-4 w-4" /></a></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit ou un partenaire" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 md:col-span-2" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          {loading && <p className="mt-6 text-sm text-slate-400">Chargement du catalogue public...</p>}
          {error && <p className="mt-6 text-sm text-amber-300">{error}</p>}
          {!loading && !hasRealData && <EmptyCatalogue whatsappBase={whatsappBase} />}
          {hasRealData && <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <LocalProductCard key={product.id} product={product} onAddToRequest={addProduct} />)}</div><Selection products={selected} onRemove={removeProduct} orderLink={orderLink} /></div>}
        </section>

        <section id="partenaires" className="mt-10">
          <div className="flex items-center gap-3"><Users className="h-6 w-6 text-emerald-300" /><h2 className="text-3xl font-bold text-white">Partenaires verifies</h2></div>
          <p className="mt-2 text-sm text-slate-300">Les partenaires affiches publiquement sont verifies, actifs et reels.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{vendors.map((vendor) => <div key={vendor.id} className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6"><div className="text-xs uppercase tracking-[0.2em] text-emerald-300">{vendor.business_type}</div><h3 className="mt-3 text-2xl font-bold text-white">{vendor.business_name}</h3><p className="mt-2 text-sm text-slate-300">{vendor.description || 'Partenaire local verifie en Martinique.'}</p><div className="mt-4 text-sm text-slate-400">{vendor.service_zone || vendor.zone_label || vendor.address}</div></div>)}</div>
          {!loading && vendors.length === 0 && <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">Aucun partenaire public verifie n'est encore visible.</p>}
        </section>

        <section id="demande-pro" className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6"><div className="flex items-center gap-3 text-emerald-300"><Building2 className="h-6 w-6" /><h2 className="text-3xl font-bold text-white">Demande pro</h2></div><p className="mt-3 text-sm leading-6 text-slate-300">Repas d'equipe, demande recurrente, retrait groupe ou livraison sur site.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><input value={proCompany} onChange={(e) => setProCompany(e.target.value)} placeholder="Entreprise" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100" /><input value={proContact} onChange={(e) => setProContact(e.target.value)} placeholder="Contact / telephone" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100" /><textarea value={proNeed} onChange={(e) => setProNeed(e.target.value)} placeholder="Besoin, volume, zone, date souhaitee" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 sm:col-span-2" rows={4} /></div><a href={proLink} className="mt-5 inline-flex rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950">Envoyer ma demande pro</a></div>
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6"><div className="flex items-center gap-3 text-emerald-300"><MessageCircle className="h-6 w-6" /><h2 className="text-2xl font-bold text-white">Retrait, livraison, horaires</h2></div><div className="mt-5 space-y-4 text-sm leading-6 text-slate-300"><p>Retrait disponible selon partenaire et point relais public verifie.</p><p>Livraison disponible selon zone desservie, volume et creneau confirme.</p><p>Google Business Profile : Martinique · lien principal : commande DELIKREOL · contact : {contactPhone}</p></div></div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center gap-3 text-emerald-300">{icon}<span className="font-semibold">{title}</span></div><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p></div>;
}

function EmptyCatalogue({ whatsappBase }: { whatsappBase: string }) {
  return <div className="mt-6 rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-6"><div className="flex items-center gap-3 text-amber-200"><Package className="h-5 w-5" /><p className="font-semibold">Catalogue public en cours d'activation</p></div><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Aucun partenaire verifie et public n'est encore affiche. DELIKREOL affiche uniquement les donnees reelles activees. Contactez-nous sur WhatsApp pour une demande manuelle ou pour devenir partenaire.</p><a href={whatsappBase} className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-slate-950">Commander par WhatsApp</a></div>;
}

function Selection({ products, onRemove, orderLink }: { products: LocalProduct[]; onRemove: (id: string) => void; orderLink: string }) {
  return <aside className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6"><div className="flex items-center gap-3 text-emerald-300"><ShoppingBag className="h-5 w-5" /><h3 className="text-lg font-bold text-white">Ma selection</h3></div>{products.length === 0 ? <p className="mt-4 text-sm leading-6 text-slate-400">Ajoutez des produits pour preparer votre demande.</p> : <div className="mt-4 space-y-3">{products.map((product) => <div key={`${product.id}-${product.vendor}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3"><div><div className="text-sm font-semibold text-slate-100">{product.name}</div><div className="text-xs text-slate-400">{product.vendor}</div></div><button onClick={() => onRemove(product.id)} className="text-xs text-slate-400">Retirer</button></div>)}<a href={orderLink} className="inline-flex w-full justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950">Commander</a></div>}</aside>;
}
