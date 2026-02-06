import { useState } from 'react';
import { Store, Truck, MapPin, ArrowLeft, ArrowRight, CheckCircle, TrendingUp, DollarSign, ShieldCheck, Zap, Star, Home } from 'lucide-react';
import { PartnerApplicationForm } from '../components/PartnerApplicationForm';
import { PartnerType } from '../agents/partnerScoring';

interface BecomePartnerProps {
  onBack?: () => void;
}

export function BecomePartner({ onBack }: BecomePartnerProps) {
  const [selectedType, setSelectedType] = useState<PartnerType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const partnerTypes = [
    {
      type: 'vendor' as PartnerType,
      icon: Store,
      title: 'Vendeur',
      subtitle: 'Restaurateur · Producteur',
      color: 'bg-primary',
      revenue: '80% des revenus',
      description: 'Propulsez votre activité locale. Nous gérons la visibilité et la logistique, vous gérez la qualité.',
      benefits: [
        'Commission ultra-compétitive (20%)',
        'Zéro frais d\'infrastructure',
        'Marketing local ciblé inclus',
        'Paiements hebdomadaires garantis',
      ],
      requirements: [
        'SIRET martiniquais valide',
        'Conformité normes sanitaires',
        'Catalogue produits qualitatifs',
      ],
    },
    {
      type: 'driver' as PartnerType,
      icon: Truck,
      title: 'Livreur',
      subtitle: 'Indépendant · Équipé',
      color: 'bg-accent',
      revenue: '70% frais livraison',
      description: 'Liberté totale. Notre IA optimise vos tournées pour maximiser vos gains par kilomètre.',
      benefits: [
        'Gains immédiats après livraison',
        'Planification 100% libre',
        'IA Route Optimizer intégrée',
        'Support chauffeur 24/7',
      ],
      requirements: [
        'Statut auto-entrepreneur',
        'Véhicule motorisé ou vélo',
        'Smartphone récent (GPS)',
      ],
    },
    {
      type: 'relay_host' as PartnerType,
      icon: MapPin,
      title: 'Point Relais',
      subtitle: 'Commerce · Accueil',
      color: 'bg-secondary',
      revenue: 'Jusqu\'à 5€ / colis',
      description: 'Optimisez votre espace. Attirez de nouveaux clients et rentabilisez chaque mètre carré.',
      benefits: [
        'Revenu passif par colis',
        'Flux de clients additionnels',
        'Gestion simplifiée par QR Code',
        'Zéro investissement matériel',
      ],
      requirements: [
        'Local commercial ou sécurisé',
        'Zone de stockage dédiée',
        'Horaires d\'accueil réguliers',
      ],
    },
  ];

  if (showForm && selectedType) {
    return (
      <PartnerApplicationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedType(null);
        }}
        partnerType={selectedType}
      />
    );
  }

  if (selectedType) {
    const partner = partnerTypes.find(p => p.type === selectedType)!;
    const Icon = partner.icon;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-black uppercase tracking-widest text-sm"
            >
              <ArrowLeft size={18} />
              Retour aux rôles
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-bold text-sm px-4 py-2 rounded-xl border border-border hover:border-primary/30"
              >
                <Home size={16} />
                Accueil
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className={`inline-flex p-5 ${partner.color} text-white rounded-3xl shadow-elegant`}>
                  <Icon size={48} />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">
                  Devenir <br />
                  <span className="text-primary">{partner.title}</span>
                </h1>
                <p className="text-2xl text-muted-foreground font-medium leading-relaxed">
                  {partner.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-4 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
                <DollarSign className="text-primary w-6 h-6" />
                <span className="text-xl font-black text-primary uppercase tracking-tight">{partner.revenue}</span>
              </div>

              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">Vos Avantages</h3>
                  <div className="grid gap-4">
                    {partner.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
                        <CheckCircle className="text-accent w-6 h-6 flex-shrink-0" />
                        <span className="font-bold text-foreground/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="p-10 bg-foreground text-background rounded-[3rem] shadow-elegant space-y-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Pré-requis</h3>
                <div className="space-y-6">
                  {partner.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-sm text-primary-foreground flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-lg font-bold leading-tight">{req}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-background/10">
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-6 bg-primary text-primary-foreground rounded-full font-black text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    Postuler Maintenant
                  </button>
                </div>
              </div>

              <div className="p-8 border-2 border-dashed border-border rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Zap className="w-6 h-6" />
                  <h4 className="font-black uppercase tracking-widest text-sm">Validation Express</h4>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Notre IA analyse votre dossier en temps réel. Recevez une réponse de principe en moins de 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-20">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-black uppercase tracking-widest text-sm"
            >
              <ArrowLeft size={18} />
              Retour
            </button>
          )}
          <div className="hidden md:flex gap-8">
            <button className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">Aide</button>
            <button className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">Contact</button>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <TrendingUp className="w-3 h-3" />
            Grow with us
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-foreground tracking-tighter uppercase leading-[0.8]">
            Bâtissons <br />
            <span className="text-primary">le futur</span> ensemble.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Que vous cuisiniez, cultiviez, livriez ou accueilliez, il y a une place pour votre talent dans l'écosystème Delikreol.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {partnerTypes.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.type}
                onClick={() => setSelectedType(partner.type)}
                className="group cursor-pointer bg-card border-2 border-border/50 rounded-[3rem] p-10 space-y-8 hover:border-primary transition-all duration-500 shadow-elegant flex flex-col"
              >
                <div className={`w-20 h-20 rounded-3xl ${partner.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={40} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">{partner.title}</h2>
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{partner.subtitle}</p>
                  </div>
                  <p className="text-muted-foreground font-medium leading-relaxed">{partner.description}</p>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenus</span>
                    <span className="text-lg font-black text-primary tracking-tight">{partner.revenue}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-32 relative overflow-hidden bg-primary rounded-[4rem] p-16 md:p-24 text-primary-foreground shadow-elegant">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                Des questions <br />
                sur le partenariat ?
              </h2>
              <p className="text-xl md:text-2xl text-primary-foreground/80 font-medium">
                Notre équipe d'onboarding est prête à vous accueillir et à répondre à toutes vos interrogations.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:onboarding@delikreol.mq"
                className="group flex items-center justify-between p-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-3xl border border-white/20 transition-all"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Email Direct</div>
                  <div className="text-2xl font-black tracking-tight uppercase">onboarding@delikreol.mq</div>
                </div>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </a>
              <a
                href="tel:+596696000000"
                className="group flex items-center justify-between p-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-3xl border border-white/20 transition-all"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">WhatsApp Business</div>
                  <div className="text-2xl font-black tracking-tight uppercase">+596 696 00 00 00</div>
                </div>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
