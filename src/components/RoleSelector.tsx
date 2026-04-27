import { Store, MapPin, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserType } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: UserType) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const roles = [
    {
      type: 'vendor' as UserType,
      title: 'Vendeur',
      description: 'Restaurant, producteur ou traiteur local.',
      highlight: '80% par vente',
      icon: Store,
      color: 'bg-primary',
    },
    {
      type: 'relay_host' as UserType,
      title: 'Point Relais',
      description: 'Hébergez des colis et générez des revenus passifs.',
      highlight: 'Jusqu\'à 5€/colis',
      icon: MapPin,
      color: 'bg-secondary',
    },
    {
      type: 'driver' as UserType,
      title: 'Livreur',
      description: 'Livrez en toute liberté, soyez payé immédiatement.',
      highlight: '70% frais livraison',
      icon: Truck,
      color: 'bg-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 py-20">
      <div className="max-w-7xl w-full space-y-20">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground font-black text-3xl shadow-elegant mb-4">
            D
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.8]">
            Rejoindre <br />
            <span className="text-primary">l'Espace Pro</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Choisissez votre rôle dans l'écosystème Delikreol et commencez à générer des revenus dès aujourd'hui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.type}
                onClick={() => onSelectRole(role.type)}
                className="group cursor-pointer relative bg-card border-2 border-border/50 rounded-[3rem] p-12 space-y-10 hover:border-primary transition-all duration-500 shadow-elegant flex flex-col"
              >
                <div className={`w-20 h-20 rounded-3xl ${role.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={40} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">{role.title}</h2>
                    <div className="inline-flex px-4 py-1.5 bg-muted rounded-full text-xs font-black uppercase tracking-widest text-primary">
                      {role.highlight}
                    </div>
                  </div>
                  <p className="text-muted-foreground font-medium leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-8 border-t border-border flex items-center justify-between">
                  <span className="text-primary font-black uppercase tracking-widest text-sm group-hover:gap-4 transition-all flex items-center gap-2">
                    Sélectionner
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-muted/30 border border-border rounded-[4rem] p-12 md:p-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {[
              { title: 'Revenus Instantanés', desc: 'Paiements automatiques sécurisés après chaque vente.', icon: CheckCircle2 },
              { title: 'Impact Martinique', desc: 'Contribuez directement au dynamisme de notre île.', icon: CheckCircle2 },
              { title: 'IA Logistique', desc: 'Bénéficiez de nos algorithmes pour optimiser votre temps.', icon: CheckCircle2 },
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="inline-flex p-3 bg-white rounded-xl shadow-sm text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight">{feature.title}</h4>
                <p className="text-muted-foreground font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
