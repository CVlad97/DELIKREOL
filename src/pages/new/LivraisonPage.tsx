import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';

const WHATSAPP_NUMBER = '596696653589';

const DELIVERY_MODES = [
  {
    icon: Store,
    title: 'Retrait chez le traiteur',
    description: 'Le retrait est le seul mode activé pendant le pilote. Le lieu et le créneau sont confirmés avec le partenaire.',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-500',
    badge: 'Disponible selon partenaire',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
];

export default function LivraisonPage() {
  useEffect(() => {
    document.title = 'Livraison & Retrait — DeliKreol | Livraison plats créoles Martinique';
  }, []);

  const openWhatsAppVerify = () => {
    const msg = encodeURIComponent(
      'Bonjour DeliKreol ! Je souhaite vérifier les modalités de retrait disponibles pour ma commande. Merci !'
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <Layout title="Livraison & Retrait">
      <BackBar label='Retour' backTo='/' />
      {/* Intro */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
          <Store size={14} />
          Modalités de retrait
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Pendant le pilote, le retrait est proposé chez certains partenaires après confirmation du lieu et du créneau.
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Pendant le pilote, la livraison à domicile et les points relais ne sont pas ouverts.
        Le retrait n’est proposé que si le partenaire confirme votre commande et son créneau.
      </div>

      {/* 3 modes */}
      <div className="space-y-4 mb-10">
        <h2 className="text-lg font-black text-foreground">Mode disponible pendant le pilote</h2>
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
              text: 'Retirez la commande au lieu et au créneau confirmés par le partenaire.',
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

      <div className="mb-10 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-black text-foreground mb-2">Zone de retrait</h2>
        <p className="text-sm text-muted-foreground">
          Les zones ne sont pas encore couvertes par un service de livraison garanti. Vérifiez le lieu de retrait
          affiché par le partenaire avant de commander.
        </p>
      </div>

      {/* Not sure? WhatsApp */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-success/10 border border-green-200 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-foreground">Besoin de vérifier le retrait ?</h3>
            <p className="text-sm text-muted-foreground">
              Contactez-nous sur WhatsApp pour vérifier les modalités de retrait proposées par le partenaire.
            </p>
          </div>
          <button
            onClick={openWhatsAppVerify}
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
          >
            <MessageCircle size={16} fill="white" />
            Vérifier le retrait
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary text-primary-foreground rounded-xl font-bold text-sm transition-colors shadow-lg"
        >
          <ShoppingCart size={16} />
          Voir le catalogue
          <ArrowRight size={16} />
        </Link>
      </div>
    </Layout>
  );
}
