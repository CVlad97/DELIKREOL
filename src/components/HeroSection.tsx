import { MapPin, Clock, TrendingUp, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      title: 'Savourez la Martinique',
      subtitle: 'Les meilleurs plats créoles livrés chez vous',
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-orange-600 to-red-600',
    },
    {
      title: 'Producteurs locaux',
      subtitle: 'Fruits, légumes et produits frais du terroir',
      image: 'https://images.pexels.com/photos/1300975/pexels-photo-1300975.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Livraison express',
      subtitle: 'Recevez vos commandes en moins de 30 minutes',
      image: 'https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gradient: 'from-blue-600 to-cyan-600',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: Clock, label: 'Livraison moyenne', value: '25 min' },
    { icon: TrendingUp, label: 'Commandes actives', value: '150+' },
    { icon: Heart, label: 'Satisfaction', value: '4.8/5' },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="relative h-[300px] md:h-[400px]">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-75`} />
            </div>

            <div className="relative h-full flex items-center justify-center text-center px-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {banner.title}
                </h1>
                <p className="text-xl md:text-2xl text-white opacity-90 drop-shadow-md">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner ? 'bg-white w-8' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
