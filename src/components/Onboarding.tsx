import { useState } from 'react';
import { ChevronRight, Store, MapPin, Truck, ShoppingBag } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Store,
    title: 'Découvrez les saveurs de Martinique',
    description: 'Explorez des restaurants, producteurs locaux et commerçants près de chez vous',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: ShoppingBag,
    title: 'Commandez en quelques clics',
    description: 'Parcourez les menus, ajoutez vos produits préférés et passez commande facilement',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Recevez vos commandes à domicile ou retirez-les sur place en 30-45 minutes',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: MapPin,
    title: 'Soutenez le commerce local',
    description: 'Encouragez les acteurs économiques martiniquais et les circuits courts',
    color: 'from-purple-400 to-pink-500',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-gray-900 dark:to-gray-800 z-50 flex flex-col">
      <div className="flex justify-end p-6">
        <button
          onClick={handleSkip}
          className="text-white/80 hover:text-white font-medium"
        >
          Passer
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl`}
        >
          <Icon size={64} className="text-white" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">{slide.title}</h2>
        <p className="text-white/90 text-lg max-w-md mb-12">{slide.description}</p>

        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleNext}
          className="w-full bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-2"
        >
          {currentSlide < slides.length - 1 ? 'Suivant' : 'Commencer'}
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
