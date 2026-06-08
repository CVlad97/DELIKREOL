import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  MessageCircle,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';

const WHATSAPP_NUMBER = '596696653589';

const DELIVERY_MODES = [
  {
    icon: Store,
    title: 'Retrait chez le traiteur',
    description:
      'Vous récupérez votre commande directement chez le prestataire. Pas de frais de livraison.',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-500',
    badge: 'Gratuit',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Truck,
    title: 'Livraison proche',
    description:
      'Livraison dans un rayon proche du prestataire, selon sa disponibilité et celle de DeliKreol.',
    color: 'bg-green-50 border-green-200',
    iconColor: 'bg-green-500',
    badge: 'Selon disponibilité',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    icon: MapPin,
    title: 'Livraison éloignée',
    description:
      'Livraison sur toute la Martinique, possible à partir de 40€ de commande, selon validation du prestataire et disponibilité DeliKreol.',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'bg-orange-500',
    badge: 'À partir de 40€',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
];

export default function LivraisonPage() {
  const openWhatsAppVerify = () => {
    const msg = encodeURIComponent(
      'Bonjour DeliKreol ! Je souhaite vérifier la possibilité de livraison dans ma commune. Merci !'
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <Layout title="Livraison & Retrait">
      {/* Intro */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
          <Truck size={14} />
          Modes de livraison
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          DeliKreol propose plusieurs modes de récupération de vos commandes, adaptés à votre
          localisation et au montant de votre panier.
        </p>
      </div>

      {/* Important notices */}
      <div className="space-y-3 mb-8">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Livraison éloignée</strong> possible à partir de <strong>40€ de commande</strong>,
            selon validation du prestataire et disponibilité DeliKreol.
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
          <Clock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 leading-relaxed">
            Pour une <strong>livraison midi</strong>, la commande doit idéalement être passée
            <strong> avant 10h</strong>, selon disponibilité du prestataire.
          </p>
        </div>
      </div>

      {/* 3 modes */}
      <div className="space-y-4 mb-10">
        <h2 className="text-lg font-black text-foreground">Les 3 modes de récupération</h2>
        <div className="grid gap-4">
          {DELIVERY_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className={`p-5 rounded-2xl border ${mode.color} transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${mode.iconColor} text-white rounded-xl flex items-center justify-center`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">{mode.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${mode.badgeColor}`}
                      >
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-10">
        <h2 className="text-lg font-black text-foreground mb-4">Comment ça fonctionne</h2>
        <div className="space-y-3">
          {[
            {
              step: 1,
              text: 'Choisissez vos plats dans le catalogue et ajoutez-les au panier.',
            },
            {
              step: 2,
              text: 'Indiquez votre commune et le mode de récupération souhaité.',
            },
            {
              step: 3,
              text: 'DeliKreol vérifie la disponibilité avec le prestataire et vous confirme par WhatsApp.',
            },
            {
              step: 4,
              text: 'Récupérez votre commande ou attendez la livraison selon l\'option choisie.',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-black">
                {item.step}
              </div>
              <p className="text-sm text-foreground font-medium leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zones */}
      <div className="mb-10">
        <h2 className="text-lg font-black text-foreground mb-4">
          <MapPin size={18} className="inline mr-2 text-primary" />
          Zones desservies
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          DeliKreol couvre les 34 communes de la Martinique. La disponibilité de la livraison
          dépend du prestataire et du montant de votre commande.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {martiniqueCommunes.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground"
            >
              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
              {c.name}
            </div>
          ))}
        </div>
      </div>

      {/* Not sure? WhatsApp */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-foreground">Pas sûr(e) de votre zone ?</h3>
            <p className="text-sm text-muted-foreground">
              Contactez-nous sur WhatsApp et nous vérifierons la possibilité de livraison dans
              votre commune.
            </p>
          </div>
          <button
            onClick={openWhatsAppVerify}
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
          >
            <MessageCircle size={16} fill="white" />
            Vérifier la possibilité
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-colors shadow-lg"
        >
          <ShoppingCart size={16} />
          Voir le catalogue
          <ArrowRight size={16} />
        </Link>
      </div>
    </Layout>
  );
}
