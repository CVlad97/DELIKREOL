import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Mail,
  ExternalLink,
  ShoppingCart,
  Truck,
  Store,
  FileText,
  MapPin,
  CreditCard,
  Clock,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

const WHATSAPP_NUMBER = '596696653589';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ElementType;
  link?: { to: string; label: string };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Comment commander ?',
    answer:
      'Choisissez vos plats dans le catalogue, ajoutez-les au panier, puis envoyez votre commande via WhatsApp. DeliKreol vérifie la disponibilité avec le prestataire.',
    icon: ShoppingCart,
    link: { to: '/catalogue', label: 'Voir le catalogue' },
  },
  {
    question: 'Comment savoir si la livraison est possible ?',
    answer:
      'Indiquez votre commune et votre panier. DeliKreol vérifie avec le prestataire. Livraison éloignée possible à partir de 40€ de commande.',
    icon: Truck,
    link: { to: '/livraison', label: 'En savoir plus sur la livraison' },
  },
  {
    question: 'Comment devenir partenaire ?',
    answer:
      'Remplissez le formulaire Devenir partenaire ou contactez-nous sur WhatsApp.',
    icon: Store,
    link: { to: '/devenir-partenaire', label: 'Remplir le formulaire' },
  },
  {
    question: 'Comment devenir livreur ?',
    answer:
      'Remplissez le formulaire de candidature livreur. DeliKreol vérifie les zones, disponibilités et conditions avant activation.',
    icon: Truck,
    link: { to: '/devenir-livreur', label: 'Postuler comme livreur' },
  },
  {
    question: 'Comment demander un devis ?',
    answer:
      'Utilisez notre formulaire de devis pour événements (mariage, séminaire, anniversaire…). Décrivez votre projet et recevez une proposition personnalisée.',
    icon: FileText,
    link: { to: '/devis', label: 'Demander un devis' },
  },
  {
    question: 'Les paiements sont-ils actifs ?',
    answer:
      'Le paiement en ligne est prévu en phase 2. Pour le lancement, les demandes sont confirmées par WhatsApp.',
    icon: CreditCard,
  },
  {
    question: 'Les horaires sont-ils garantis ?',
    answer:
      'Les horaires dépendent du prestataire. DeliKreol vérifie la disponibilité à chaque commande.',
    icon: Clock,
  },
];

const QUICK_LINKS = [
  { to: '/catalogue', label: 'Catalogue', icon: ShoppingCart },
  { to: '/livraison', label: 'Livraison', icon: Truck },
  { to: '/devis', label: 'Devis traiteur', icon: FileText },
  { to: '/devenir-partenaire', label: 'Devenir partenaire', icon: Store },
  { to: '/devenir-livreur', label: 'Devenir livreur', icon: Truck },
  { to: '/points-relais', label: 'Points relais', icon: MapPin },
];

export default function AidePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout title="Aide & Contact">
      {/* Intro */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
          <HelpCircle size={14} />
          Questions fréquentes
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Retrouvez les réponses aux questions les plus courantes. Si vous ne trouvez pas ce que
          vous cherchez, contactez-nous directement par WhatsApp.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3 mb-12">
        {FAQ_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`bg-card border rounded-2xl transition-all ${
                isOpen ? 'border-primary shadow-md' : 'border-border'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center gap-3 p-4 text-left"
                aria-expanded={isOpen}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="flex-1 text-sm font-bold text-foreground">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-16">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  {item.link && (
                    <Link
                      to={item.link.to}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {item.link.label}
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="mb-12">
        <h2 className="text-lg font-black text-foreground mb-4">Nous contacter</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle size={24} fill="white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-900">WhatsApp</p>
              <p className="text-xs text-green-700">+596 696 65 35 89</p>
              <p className="text-xs text-green-600 mt-0.5">Réponse rapide</p>
            </div>
          </a>

          <a
            href="mailto:contact@delikreol.mq"
            className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Email</p>
              <p className="text-xs text-blue-700">contact@delikreol.mq</p>
              <p className="text-xs text-blue-600 mt-0.5">Réponse sous 24h</p>
            </div>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-black text-foreground mb-4">Liens utiles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <Icon size={18} className="text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
