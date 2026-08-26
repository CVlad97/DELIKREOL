import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { setPageMeta } from '../../services/seo';

const FAQ_ITEMS = [
  {
    question: 'Comment commander sur DeliKreol ?',
    answer: 'Ajoutez les plats au panier, choisissez le retrait ou la livraison, préparez la demande puis confirmez sur WhatsApp avec le numéro de commande.',
  },
  {
    question: 'Le paiement carte est-il obligatoire ?',
    answer: 'Non. Le lancement est WhatsApp-first avec virement Qonto, virement Revolut Business, paiement à la livraison, lien externe ou wallet crypto facultatif.',
  },
  {
    question: 'Quand ma commande est-elle validée ?',
    answer: 'La demande est validée après confirmation du traiteur et, si nécessaire, vérification de la preuve de paiement par l’équipe DeliKreol.',
  },
  {
    question: 'Les traiteurs peuvent-ils modifier leurs plats ?',
    answer: 'Oui. Les partenaires utilisent leur espace pro pour demander ou préparer les modifications de menu, photos, disponibilité et suivi.',
  },
  {
    question: 'DeliKreol livre partout en Martinique ?',
    answer: 'La couverture vise les 34 communes, mais chaque livraison dépend de la disponibilité du traiteur, du créneau et du montant de commande.',
  },
];

export default function FAQPage() {
  useEffect(() => {
    setPageMeta(
      'FAQ — DeliKreol | Commande traiteur et livraison en Martinique',
      'Questions fréquentes sur DeliKreol : commande WhatsApp, paiements, livraison, traiteurs partenaires et suivi en Martinique.',
      'FAQ DeliKreol, commande WhatsApp Martinique, livraison traiteur Martinique',
    );
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="rounded-[2rem] bg-[#24140d] p-6 text-white shadow-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <HelpCircle size={14} /> Centre d’aide
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Commander créole sans friction.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
            Les règles opérationnelles sont claires : demande préparée sur le site, confirmation humaine sur WhatsApp, paiement contrôlé et suivi transparent.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="rounded-3xl border border-primary/15 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#24140d]">{item.question}</h2>
              <p className="mt-3 leading-7 text-[#6f5b4b]">{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl border border-success/20 bg-success/10 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex items-center gap-2 font-black text-success"><ShieldCheck size={18} /> Besoin d’une réponse rapide ?</div>
            <p className="mt-2 text-sm text-[#6f5b4b]">WhatsApp reste le canal prioritaire pour valider disponibilité, livraison et paiement.</p>
          </div>
          <a href="https://wa.me/596696653589" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-black text-white">
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>

        <div className="mt-6 text-center">
          <Link to="/catalogue" className="font-black text-primary underline">Voir le catalogue</Link>
        </div>
      </section>
    </Layout>
  );
}
