import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, Utensils } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { setPageMeta } from '../../services/seo';

const ARTICLES = [
  {
    title: 'Comment organiser un repas d’équipe créole en Martinique',
    category: 'Business',
    summary: 'Checklist simple : nombre de personnes, créneau, allergies, budget, livraison planifiée et validation WhatsApp.',
  },
  {
    title: 'Traiteurs martiniquais : vendre plus sans gérer un site',
    category: 'Traiteurs',
    summary: 'Pourquoi une vitrine claire, des photos nettes et une confirmation rapide augmentent les demandes qualifiées.',
  },
  {
    title: 'Livraison planifiée : la bonne approche en milieu insulaire',
    category: 'Logistique',
    summary: 'Réduire les échecs de livraison avec des créneaux réalistes, points relais et paniers minimums.',
  },
];

export default function BlogPage() {
  useEffect(() => {
    setPageMeta(
      'Blog — DeliKreol | Traiteurs, livraison et gastronomie créole',
      'Conseils DeliKreol pour commander, organiser un événement, choisir un traiteur et développer la livraison locale en Martinique.',
      'blog DeliKreol, traiteur Martinique, repas créole entreprise',
    );
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
              <BookOpen size={14} /> Magazine local
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#24140d] sm:text-6xl">Le guide DeliKreol.</h1>
            <p className="mt-4 max-w-xl leading-7 text-[#6f5b4b]">
              Contenus courts pour aider les clients, entreprises, traiteurs et livreurs à mieux organiser les commandes locales.
            </p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-primary to-[#24140d] p-6 text-white shadow-2xl">
            <CalendarDays className="text-white/80" />
            <p className="mt-4 text-2xl font-black">Objectif éditorial : convertir les recherches locales en demandes WhatsApp qualifiées.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <article key={article.title} className="rounded-[2rem] border border-primary/15 bg-white p-5 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8ef] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <Utensils size={13} /> {article.category}
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#24140d]">{article.title}</h2>
              <p className="mt-3 min-h-24 leading-7 text-[#6f5b4b]">{article.summary}</p>
              <Link to="/contact" className="mt-5 inline-flex items-center gap-2 font-black text-primary">
                Proposer un sujet <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
