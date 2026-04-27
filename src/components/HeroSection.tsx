import { Clock, TrendingUp, Heart, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      title: 'Savourez le terroir de la Martinique',
      subtitle: 'Les pépites de nos restaurateurs et producteurs livrées chez vous',
      image: 'https://images.unsplash.com/photo-1768734836079-040ec2543a65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwzfHx0cm9waWNhbCUyMGZvb2QlMjBleG90aWMlMjBmcnVpdHMlMjBtYXJrZXR8ZW58MHwwfHx8MTc2OTU3MDE5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-primary/80 to-accent/60',
    },
    {
      title: 'Fraîcheur & Authenticité',
      subtitle: 'Fruits exotiques et produits locaux en direct des marchés',
      image: 'https://images.unsplash.com/photo-1768758533459-e9b99decb605?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHw1fHx0cm9waWNhbCUyMGZvb2QlMjBleG90aWMlMjBmcnVpdHMlMjBtYXJrZXR8ZW58MHwwfHx8MTc2OTU3MDE5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-secondary/80 to-primary/60',
    },
    {
      title: 'Logistique Intelligente',
      subtitle: 'Livraison express ou retrait en point relais sécurisé',
      image: 'https://images.unsplash.com/photo-1768734836792-daa30dd521e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZvb2QlMjBleG90aWMlMjBmcnVpdHMlMjBtYXJrZXR8ZW58MHwwfHx8MTc2OTU3MDE5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-accent/80 to-secondary/60',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: Clock, label: 'Livraison express', value: '25 min' },
    { icon: TrendingUp, label: 'Partenaires locaux', value: '50+' },
    { icon: Heart, label: 'Engagement', value: '100%' },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="relative h-[450px] md:h-[550px]">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} mix-blend-multiply`} />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative h-full flex items-center justify-center text-center px-6">
              <div className="max-w-4xl space-y-6">
                <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase drop-shadow-2xl">
                  {banner.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
                  {banner.subtitle}
                </p>
                <div className="pt-8">
                  <button className="px-8 py-4 bg-white text-primary rounded-full font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3 mx-auto">
                    Découvrir la carte
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentBanner ? 'bg-white w-12' : 'bg-white/30 w-4 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative -mt-12 z-10 max-w-7xl mx-auto px-4">
        <div className="bg-card rounded-3xl p-8 shadow-elegant border border-primary/10 backdrop-blur-sm bg-card/90">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-border">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center justify-center text-center px-4 space-y-2 group">
                  <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
