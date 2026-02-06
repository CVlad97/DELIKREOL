import { Package, Store, Truck, Users, CheckCircle, ArrowRight, ShoppingBag, MapPin, Zap } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { icon: Package, label: 'Demande client', color: 'bg-primary/10 text-primary border-primary/20' },
    { icon: Users, label: 'Hub Delikreol', color: 'bg-secondary/10 text-secondary border-secondary/20' },
    { icon: Store, label: 'Partenaires', color: 'bg-accent/10 text-accent border-accent/20' },
    { icon: Truck, label: 'Livraison', color: 'bg-primary/10 text-primary border-primary/20' },
    { icon: CheckCircle, label: 'Client satisfait', color: 'bg-accent/10 text-accent border-accent/20' },
  ];

  const sections = [
    {
      title: 'Pour les Clients',
      subtitle: 'Commandez simplement, on s\'occupe de tout',
      icon: ShoppingBag,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      items: [
        { title: 'Decrivez votre besoin', desc: '"Je veux un repas creole pour ce soir" ou "J\'ai besoin de fruits frais"' },
        { title: 'On trouve pour vous', desc: 'L\'equipe Delikreol et les partenaires s\'occupent de trouver, preparer et stocker' },
        { title: 'Recevez ou recuperez', desc: 'Livraison a domicile ou retrait dans un point relais proche' },
        { title: 'Suivez en temps reel', desc: 'Notifications et suivi de votre demande jusqu\'a la livraison' },
      ],
    },
    {
      title: 'Pour les Partenaires',
      subtitle: 'Restaurants, producteurs, points relais, livreurs',
      icon: Store,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
      items: [
        { title: 'Recevez des demandes', desc: 'Des demandes qualifiees adaptees a votre activite et votre zone' },
        { title: 'Faites votre metier', desc: 'Preparez, stockez ou livrez selon votre role' },
        { title: 'Mettez a jour le statut', desc: '"Prepare", "Pret au retrait", "En livraison", etc.' },
        { title: 'Soyez paye', desc: 'Remuneration selon les regles convenues avec Delikreol' },
      ],
    },
    {
      title: 'Hub Admin',
      subtitle: 'Orchestration et coordination',
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
      items: [
        { title: 'Centralisation', desc: 'Toutes les demandes clients arrivent dans le hub' },
        { title: 'Assignation intelligente', desc: 'Distribution aux bons partenaires (resto, relais, livreur)' },
        { title: 'Suivi en temps reel', desc: 'Vue d\'ensemble sur tous les flux en cours' },
        { title: 'Support & optimisation', desc: 'Assistance client et amelioration continue du service' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 pt-20">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/[0.08] border border-primary/15 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5" />
            Guide Complet
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
            Comment fonctionne <br />
            <span className="text-primary">Delikreol ?</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Une plateforme logistique qui simplifie les commandes pour les clients
            et cree des opportunites pour les partenaires locaux.
          </p>
        </div>

        <div className="mb-24">
          <h2 className="text-2xl font-black text-foreground text-center mb-12 uppercase tracking-tight">
            Le flux complet en 5 etapes
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl ${step.color} border-2 flex items-center justify-center mb-3`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground text-center max-w-[100px] uppercase tracking-widest">{step.label}</p>
                  </div>
                  {idx < 4 && (
                    <ArrowRight className="w-5 h-5 text-border mx-3 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {sections.map((section, i) => {
            const SectionIcon = section.icon;
            return (
              <div key={i} className="bg-card border border-border/50 rounded-[2rem] p-8 hover:border-primary/30 hover:shadow-elegant transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl ${section.bgColor} flex items-center justify-center mb-6`}>
                  <SectionIcon className={`w-7 h-7 ${section.color}`} />
                </div>
                <h3 className={`text-2xl font-black ${section.color} mb-2 uppercase tracking-tight`}>{section.title}</h3>
                <p className="text-muted-foreground font-medium mb-8">{section.subtitle}</p>
                <div className="space-y-5">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${section.bgColor} flex items-center justify-center ${section.color} font-black text-sm`}>
                        {j + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-0.5">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-foreground rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black text-background tracking-tighter uppercase mb-10">
              Pourquoi <span className="text-primary">Delikreol</span> ?
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { title: 'Simple pour les clients', desc: 'Une seule demande, on s\'occupe de tout : trouver, preparer, livrer' },
                { title: 'Opportunites pour les pros', desc: 'Des revenus complementaires pour les commercants et livreurs locaux' },
                { title: 'Economie locale', desc: 'Favorise les circuits courts et le developpement du territoire' },
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="font-black text-background uppercase tracking-tight text-lg">{item.title}</h4>
                  <p className="text-sm text-background/60 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
