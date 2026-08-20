import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, MessageCircle, UsersRound } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { setPageMeta } from '../../services/seo';

const OFFERS = [
  'Plateaux repas et pauses créoles pour réunions',
  'Livraison planifiée sur devis',
  'Facture et suivi de commande',
  'Sélection multi-traiteurs selon disponibilité',
];

export default function BusinessPage() {
  useEffect(() => {
    setPageMeta(
      'DeliKreol Business — Repas d’entreprise en Martinique',
      'Commandes groupées, séminaires, réunions et événements professionnels avec traiteurs créoles en Martinique.',
      'repas entreprise Martinique, traiteur séminaire Martinique, DeliKreol business',
    );
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="rounded-[2rem] bg-[#24140d] p-6 text-white shadow-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Briefcase size={14} /> B2B Martinique
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Repas d’entreprise, séminaires et événements sans improvisation.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/75">
            DeliKreol centralise les demandes, qualifie le besoin, confirme les traiteurs disponibles et prépare le suivi de paiement.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/devis" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-white">
              Demander un devis
            </Link>
            <a href="https://wa.me/596696653589" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-black text-white">
              <MessageCircle size={18} /> WhatsApp Business
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] border border-primary/15 bg-white p-6 shadow-sm">
            <UsersRound className="text-primary" />
            <h2 className="mt-4 text-3xl font-black text-[#24140d]">Offre prioritaire</h2>
            <p className="mt-3 leading-7 text-[#6f5b4b]">
              Cible recommandée : entreprises, administrations, associations et organisateurs d’événements. Panier moyen plus élevé, moins de livraison immédiate, meilleure marge.
            </p>
          </div>
          <div className="rounded-[2rem] border border-primary/15 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black text-[#24140d]">Ce qui est inclus</h2>
            <div className="mt-4 space-y-3">
              {OFFERS.map((offer) => (
                <div key={offer} className="flex gap-3 rounded-2xl bg-[#fff8ef] p-3 text-sm font-bold text-[#24140d]">
                  <CheckCircle2 className="h-5 w-5 text-success" /> {offer}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
