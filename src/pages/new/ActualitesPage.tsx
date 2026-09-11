import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { publicSupabase, isPublicSupabaseConfigured } from '../../lib/publicSupabase';

const WHATSAPP_NUMBER = '596696653589';

type FeaturedVendor = {
  id: string;
  title: string;
  bio: string | null;
  video_url: string | null;
  location_label: string | null;
  capacity_label: string | null;
  consumer_quote: string | null;
  reward_label: string | null;
  week_start: string;
  week_end: string;
  status: string;
};

type SurplusOffer = {
  id: string;
  title: string;
  description: string | null;
  original_price: number | null;
  sale_price: number;
  quantity_available: number;
  pickup_window: string | null;
  offer_date: string;
  status: string;
};

const fallbackFeatured: FeaturedVendor = {
  id: 'pilot-save-peyia',
  title: "Traiteur à découvrir : Snack Savè Peyi’A",
  bio: 'Spot local de Rivière-Pilote, Pont de Fer : grillades, fruits frais, jus, cocktails, plats cuisinés et service de proximité.',
  video_url: null,
  location_label: 'Rivière-Pilote — Pont de Fer',
  capacity_label: 'Pilote : commandes confirmées manuellement, retrait, relais ou livraison selon disponibilité.',
  consumer_quote: 'Avis consommateurs publiés uniquement après validation DELIKREOL.',
  reward_label: 'Repas à gagner : opération pilote à activer après validation partenaire.',
  week_start: '',
  week_end: '',
  status: 'scheduled',
};

const fallbackSurplus: SurplusOffer = {
  id: 'pilot-surplus',
  title: 'Panier invendus pilote — à confirmer',
  description: 'Offre du jour/lendemain façon anti-gaspillage. Le contenu est confirmé par le traiteur avant remise client.',
  original_price: 12,
  sale_price: 7.9,
  quantity_available: 3,
  pickup_window: 'Demain 11h30–13h30 ou selon confirmation WhatsApp',
  offer_date: '',
  status: 'draft',
};

function formatEuro(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return 'Prix à confirmer';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value));
}

export default function ActualitesPage() {
  const [featured, setFeatured] = useState<FeaturedVendor[]>([fallbackFeatured]);
  const [surplus, setSurplus] = useState<SurplusOffer[]>([fallbackSurplus]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = 'Actualités & bons plans — DELIKREOL';
    async function loadNews() {
      if (!isPublicSupabaseConfigured || !publicSupabase) {
        setLoaded(true);
        return;
      }
      const [{ data: featuredRows }, { data: surplusRows }] = await Promise.all([
        publicSupabase.from('featured_vendor_weeks').select('*').in('status', ['scheduled', 'active']).order('week_start', { ascending: false }).limit(3),
        publicSupabase.from('surplus_offers').select('*').in('status', ['active', 'draft']).order('created_at', { ascending: false }).limit(6),
      ]);
      if (Array.isArray(featuredRows) && featuredRows.length > 0) setFeatured(featuredRows as FeaturedVendor[]);
      if (Array.isArray(surplusRows) && surplusRows.length > 0) setSurplus(surplusRows as SurplusOffer[]);
      setLoaded(true);
    }
    void loadNews();
  }, []);

  return (
    <Layout>
      <BackBar label="Accueil" backTo="/" />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-green-50 p-6 shadow-sm ring-1 ring-primary/10 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Actualités DELIKREOL</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">Traiteurs à découvrir, invendus et événements locaux</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">Une vitrine simple pour donner de la visibilité aux partenaires, tester les repas à gagner, soutenir Chef à Mada et préparer les paniers anti-gaspillage façon Too Good To Go.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/traiteurs" className="rounded-2xl bg-primary px-5 py-3 font-black text-white">Voir les traiteurs</Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour DELIKREOL, je veux participer à une offre actualité / repas à gagner / panier invendus.')}`} className="rounded-2xl border border-primary px-5 py-3 font-black text-primary">Participer par WhatsApp</a>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-black">Mise à l’honneur de la semaine</h2>
            {featured.map((item) => (
              <article key={item.id} className="rounded-[2rem] border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary"><span>{item.status === 'active' ? 'En cours' : 'Programmé'}</span><span>•</span><span>{item.location_label || 'Martinique'}</span></div>
                <h3 className="mt-3 text-3xl font-black text-foreground">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.bio || 'Bio partenaire à compléter.'}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-orange-50 p-4"><strong>Lieu</strong><p className="mt-1 text-sm text-muted-foreground">{item.location_label || 'À confirmer'}</p></div>
                  <div className="rounded-2xl bg-green-50 p-4"><strong>Capacité</strong><p className="mt-1 text-sm text-muted-foreground">{item.capacity_label || 'À confirmer'}</p></div>
                  <div className="rounded-2xl bg-yellow-50 p-4"><strong>À gagner</strong><p className="mt-1 text-sm text-muted-foreground">{item.reward_label || 'Repas pilote à confirmer'}</p></div>
                </div>
                <blockquote className="mt-5 rounded-2xl border-l-4 border-primary bg-stone-50 p-4 text-sm italic text-muted-foreground">{item.consumer_quote || 'Les avis clients vérifiés apparaîtront après validation DELIKREOL.'}</blockquote>
                {item.video_url ? <a className="mt-4 inline-flex font-black text-primary" href={item.video_url} target="_blank" rel="noreferrer">Voir la vidéo</a> : <p className="mt-4 text-sm text-muted-foreground">Vidéo partenaire à ajouter.</p>}
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black">Invendus & bons plans</h2>
            {surplus.map((offer) => (
              <article key={offer.id} className="rounded-[2rem] border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-black">{offer.title}</h3><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">{offer.status}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{offer.description || 'Contenu à confirmer par le traiteur.'}</p>
                <div className="mt-4 flex flex-wrap items-end gap-4"><div><p className="text-xs text-muted-foreground">Prix réduit</p><p className="text-2xl font-black text-primary">{formatEuro(offer.sale_price)}</p></div>{offer.original_price ? <div className="text-sm text-muted-foreground line-through">{formatEuro(offer.original_price)}</div> : null}<div className="text-sm font-bold">Qté : {offer.quantity_available}</div></div>
                <p className="mt-3 text-sm text-muted-foreground">Retrait : {offer.pickup_window || 'à confirmer'}</p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour DELIKREOL, je veux réserver : ${offer.title}`)}`} className="mt-4 inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-black text-white">Réserver / tester</a>
              </article>
            ))}
            {!loaded && <p className="text-sm text-muted-foreground">Chargement des actualités…</p>}
          </div>
        </section>
      </main>
    </Layout>
  );
}
