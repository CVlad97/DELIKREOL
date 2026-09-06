import { BriefcaseBusiness, HeartHandshake, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const opportunities = [
  {
    icon: HeartHandshake,
    title: 'Traiteur indépendant',
    text: 'Rejoignez notre réseau et livrez vos spécialités locales selon vos disponibilités.',
  },
  {
    icon: Truck,
    title: 'Livreur partenaire',
    text: 'Effectuez des missions de livraison près de chez vous, avec des créneaux flexibles.',
  },
];

export default function Jobs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-gradient-to-br from-foreground via-accent to-primary p-8 text-white shadow-xl sm:p-12">
          <BriefcaseBusiness className="mb-5 h-10 w-10 text-secondary" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-secondary">DeliKreol recrute</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Construisons ensemble le goût local.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
            Découvrez les opportunités pour contribuer au développement de la cuisine créole et des services de proximité en Martinique.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2" aria-label="Opportunités">
          {opportunities.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <Icon className="h-8 w-8 text-primary" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              <a
                href="https://wa.me/596696653589?text=Bonjour%20DeliKreol%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20une%20opportunit%C3%A9."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90"
              >
                Proposer ma candidature
              </a>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-muted/40 p-7 text-center">
          <h2 className="text-2xl font-black">Vous êtes un professionnel local ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Rejoignez le réseau DeliKreol pour développer votre activité et toucher de nouveaux clients.
          </p>
          <Link
            to="/devenir-partenaire"
            className="mt-6 inline-flex rounded-2xl border border-primary px-5 py-3 text-sm font-black text-primary hover:bg-primary/10"
          >
            Devenir partenaire
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
