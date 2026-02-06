import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, MapPin, Users, ArrowRight, Star, Clock, Shield, ChevronDown, Utensils, Heart } from 'lucide-react';

interface MarketingHomeProps {
  onStart?: () => void;
  onBecomePartner?: () => void;
}

export default function MarketingHome({ onStart, onBecomePartner }: MarketingHomeProps) {
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    { name: 'Marie-Claire D.', location: 'Fort-de-France', text: 'Enfin une plateforme qui comprend nos besoins locaux. Les accras arrivent encore chauds !' },
    { name: 'Jean-Pierre L.', location: 'Le Lamentin', text: 'En tant que restaurateur, Delikreol m\'a permis de doubler mes commandes en 3 mois.' },
    { name: 'Sylvie M.', location: 'Schoelcher', text: 'Le service conciergerie est incroyable. Je decris ce que je veux et tout arrive.' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 40 ? 'bg-card/90 backdrop-blur-xl shadow-soft border-b border-border/50' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-elegant">
              D
            </span>
            <span className="font-black text-foreground text-lg tracking-tight uppercase hidden sm:block">DELIKREOL</span>
          </div>
          <div className="flex items-center gap-3">
            {onBecomePartner && (
              <button
                onClick={onBecomePartner}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary transition-colors"
              >
                Devenir partenaire
              </button>
            )}
            {onStart && (
              <button
                onClick={onStart}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:shadow-elegant transition-all active:scale-95"
              >
                Lancer l'app
              </button>
            )}
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -right-32 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/[0.03] blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-10">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/[0.08] border border-primary/15 rounded-full text-xs font-bold text-primary uppercase tracking-widest mb-8">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Plateforme n.1 en Martinique
            </div>
          </div>

          <h1 className="animate-slide-up text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-foreground tracking-tighter uppercase leading-[0.85]" style={{ animationDelay: '0.2s' }}>
            Le gout de <br />
            <span className="text-primary">la Martinique</span><br />
            <span className="text-muted-foreground/40">chez vous</span>
          </h1>

          <p className="animate-slide-up max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed" style={{ animationDelay: '0.35s' }}>
            Produits frais, plats creoles authentiques et logistique intelligente.
            Commandez chez vos artisans locaux preferes, livres en moins de 30 minutes.
          </p>

          <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center pt-4" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={onStart}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-full font-black uppercase tracking-widest text-sm hover:shadow-glow transition-all active:scale-95"
            >
              Commander maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {onBecomePartner && (
              <button
                onClick={onBecomePartner}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-foreground/15 text-foreground rounded-full font-bold text-sm hover:border-primary hover:text-primary transition-all"
              >
                Devenir partenaire
              </button>
            )}
          </div>

          <div className="animate-slide-up pt-12" style={{ animationDelay: '0.65s' }}>
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
              className="inline-flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Decouvrir</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-[2.5rem] border border-border/50 p-10 md:p-16 shadow-soft">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-border">
              {[
                { value: '25 min', label: 'Livraison express', icon: Clock },
                { value: '50+', label: 'Artisans locaux', icon: Utensils },
                { value: '100%', label: 'Produits Martinique', icon: MapPin },
                { value: '4.9/5', label: 'Satisfaction client', icon: Star },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center px-4 md:px-8 space-y-3">
                    <div className="p-3 rounded-2xl bg-primary/[0.08]">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase">
              Comment ca marche
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              En trois etapes simples, savourez le meilleur de la Martinique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                icon: ShoppingBag,
                title: 'Choisissez',
                description: 'Parcourez notre selection de commercants locaux et ajoutez vos produits favoris au panier.',
              },
              {
                step: '02',
                icon: MapPin,
                title: 'Recevez',
                description: 'Livraison a domicile en 25 minutes ou retrait en point relais securise, vous decidez.',
              },
              {
                step: '03',
                icon: Heart,
                title: 'Savourez',
                description: 'Profitez de produits frais et locaux tout en soutenant l\'economie martiniquaise.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group relative bg-card border border-border/50 rounded-[2rem] p-10 hover:border-primary/30 hover:shadow-elegant transition-all duration-500">
                  <div className="absolute top-8 right-8 text-7xl font-black text-foreground/[0.03] tracking-tighter">{item.step}</div>
                  <div className="relative space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-500">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">{item.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase">
              Pourquoi Delikreol
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              Plus qu'une plateforme de livraison, un engagement pour la Martinique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: '100% Local', description: 'Tous nos partenaires sont des artisans et commercants de Martinique.' },
              { icon: Truck, title: 'Livraison rapide', description: 'Recevez vos commandes en moins de 30 minutes ou choisissez votre creneau.' },
              { icon: Users, title: 'Communaute', description: 'Soutenez l\'economie locale et participez au developpement territorial.' },
              { icon: Shield, title: 'Qualite garantie', description: 'Produits frais selectionnes avec soin par nos commercants partenaires.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-elegant transition-all duration-500 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase mb-16">
            Ce qu'ils en disent
          </h2>

          <div className="relative h-48">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              >
                <blockquote className="space-y-6">
                  <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed font-display italic">
                    &laquo; {t.text} &raquo;
                  </p>
                  <footer className="space-y-1">
                    <div className="font-black text-foreground uppercase tracking-tight">{t.name}</div>
                    <div className="text-sm text-muted-foreground font-medium">{t.location}</div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === activeTestimonial ? 'bg-primary w-10' : 'bg-border w-4 hover:bg-primary/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-foreground text-background rounded-[2.5rem] p-12 md:p-20 shadow-elegant">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Pret a decouvrir <br />
                <span className="text-primary">Delikreol ?</span>
              </h2>
              <p className="text-xl text-background/60 max-w-2xl mx-auto font-medium">
                Rejoignez notre communaute et profitez du meilleur de la Martinique, livre chez vous.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={onStart}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-full font-black uppercase tracking-widest text-sm hover:shadow-glow transition-all active:scale-95"
                >
                  Commencer a commander
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {onBecomePartner && (
                  <button
                    onClick={onBecomePartner}
                    className="inline-flex items-center justify-center px-10 py-5 border-2 border-background/20 text-background rounded-full font-bold text-sm hover:border-primary hover:text-primary transition-all"
                  >
                    Nous contacter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg">
                  D
                </span>
                <span className="font-black text-foreground tracking-tight uppercase">DELIKREOL</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Plateforme de livraison locale en Martinique, au service des artisans et des consommateurs.
              </p>
            </div>
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-4">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">Produits</button></li>
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">A propos</button></li>
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</button></li>
                <li><button onClick={onBecomePartner} className="text-muted-foreground hover:text-primary transition-colors font-medium">Devenir partenaire</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">CGV</button></li>
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">Politique de confidentialite</button></li>
                <li><button onClick={onStart} className="text-muted-foreground hover:text-primary transition-colors font-medium">Mentions legales</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                <li>contact@delikreol.com</li>
                <li>Fort-de-France, Martinique</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
              &copy; 2026 DELIKREOL &middot; Made with love in Martinique
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
