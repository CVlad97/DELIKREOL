import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike, Store, Users } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { setPageMeta } from '../../services/seo';

const PROFILES = [
  { title: 'Traiteurs', text: 'Recevoir des demandes qualifiées, mettre en avant son menu et vendre en livraison planifiée.', to: '/devenir-partenaire', icon: Store },
  { title: 'Livreurs', text: 'Participer aux tournées locales selon zones et disponibilités, sans promesse de volume garanti.', to: '/devenir-livreur', icon: Bike },
  { title: 'Points relais', text: 'Accueillir des retraits planifiés et renforcer le maillage local.', to: '/devenir-point-relais', icon: Users },
];

export default function RecrutementPage() {
  useEffect(() => {
    setPageMeta(
      'Recrutement — DeliKreol | Traiteurs, livreurs et points relais',
      'Rejoindre DeliKreol comme traiteur partenaire, livreur ou point relais en Martinique.',
      'recrutement livreur Martinique, devenir traiteur partenaire, point relais Martinique',
    );
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-primary to-[#24140d] p-6 text-white shadow-2xl sm:p-10">
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Rejoindre l’écosystème DeliKreol.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/80">
            Nous recrutons progressivement des partenaires fiables pour construire une marketplace locale solide : traiteurs, livreurs et points relais.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PROFILES.map((profile) => {
            const Icon = profile.icon;
            return (
              <article key={profile.title} className="rounded-[2rem] border border-primary/15 bg-white p-6 shadow-sm">
                <Icon className="text-primary" />
                <h2 className="mt-4 text-2xl font-black text-[#24140d]">{profile.title}</h2>
                <p className="mt-3 min-h-28 leading-7 text-[#6f5b4b]">{profile.text}</p>
                <Link to={profile.to} className="inline-flex items-center gap-2 font-black text-primary">
                  Candidater <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
