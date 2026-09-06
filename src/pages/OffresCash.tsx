import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const offers = [
  {
    title: 'Configuration WhatsApp Business',
    price: '49 €',
    text: 'Mise en place de votre profil professionnel et de vos premiers outils de réponse.',
  },
  {
    title: 'Mini-site vitrine',
    price: '79 €',
    text: 'Une présence claire pour présenter votre activité, vos menus et vos coordonnées.',
  },
  {
    title: 'Carte menu digitale',
    price: '39 €',
    text: 'Un menu partageable facilement avec vos clients sur mobile et WhatsApp.',
  },
  {
    title: 'Pack visibilité traiteur',
    price: '49 €/mois',
    text: 'Une visibilité renforcée auprès des clients qui recherchent des saveurs locales.',
  },
];

export default function OffresCash() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-primary">Offres professionnelles</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Des solutions simples pour accélérer votre activité.</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
            Des services concrets, proposés par DeliKreol aux traiteurs, restaurateurs et acteurs locaux.
          </p>
        </section>

        <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Offres cash">
          {offers.map((offer) => (
            <article key={offer.title} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">{offer.title}</h2>
              <p className="mt-4 text-2xl font-black text-primary">{offer.price}</p>
              <p className="mt-4 flex-1 leading-7 text-muted-foreground">{offer.text}</p>
              <a
                href={`https://wa.me/596696653589?text=${encodeURIComponent(`Bonjour DeliKreol, je souhaite en savoir plus sur : ${offer.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90"
              >
                Demander l'offre
                <MessageCircle className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/devenir-partenaire" className="inline-flex items-center gap-2 rounded-2xl border border-primary px-5 py-3 text-sm font-black text-primary hover:bg-primary/10">
            Devenir partenaire
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-black text-background hover:opacity-90">
            Nous contacter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
