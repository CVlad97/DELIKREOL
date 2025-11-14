import { X, TrendingUp, Euro, Clock, CheckCircle } from 'lucide-react';
import { UserType } from '../types';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { OnboardingForm } from './OnboardingForm';
import { useAuth } from '../contexts/AuthContext';

interface RoleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  roleType: UserType;
}

interface RoleInfo {
  title: string;
  subtitle: string;
  objectives: string[];
  earnings: {
    label: string;
    amount: string;
    details: string;
  };
  benefits: string[];
  requirements: string[];
  process: string[];
}

const roleInfoData: Record<UserType, RoleInfo> = {
  customer: {
    title: 'Client',
    subtitle: 'Découvrez la richesse culinaire créole',
    objectives: [],
    earnings: { label: '', amount: '', details: '' },
    benefits: [],
    requirements: [],
    process: [],
  },
  vendor: {
    title: 'Vendeur',
    subtitle: 'Développez votre activité culinaire',
    objectives: [
      'Augmenter votre visibilité locale',
      'Atteindre plus de clients sans investissement publicitaire',
      'Gérer vos commandes en temps réel',
    ],
    earnings: {
      label: 'Vos revenus',
      amount: '80%',
      details: 'de chaque vente (Commission plateforme : 20%)',
    },
    benefits: [
      'Zéro frais d\'inscription',
      'Paiement instantané après chaque commande',
      'Outil de gestion des stocks inclus',
      'Support client dédié',
      'Statistiques de vente en temps réel',
    ],
    requirements: [
      'Avoir une activité de restauration, traiteur ou production alimentaire',
      'Respecter les normes sanitaires en vigueur',
      'Être basé en Martinique',
    ],
    process: [
      'Créez votre compte vendeur',
      'Ajoutez vos produits avec photos',
      'Recevez des commandes',
      'Préparez et validez',
      'Soyez payé immédiatement',
    ],
  },
  relay_host: {
    title: 'Point Relais',
    subtitle: 'Générez des revenus complémentaires',
    objectives: [
      'Créer une source de revenus passifs',
      'Attirer du trafic dans votre commerce',
      'Participer à l\'économie locale',
    ],
    earnings: {
      label: 'Vos revenus',
      amount: '2-5€',
      details: 'par colis stocké et récupéré',
    },
    benefits: [
      'Installation gratuite (équipements fournis si nécessaire)',
      'Revenus garantis par colis',
      'Flexibilité totale des horaires',
      'Aucun investissement requis',
      'Formation complète incluse',
    ],
    requirements: [
      'Disposer d\'un espace de stockage sécurisé',
      'Avoir des horaires d\'ouverture réguliers',
      'Être accessible au public',
      'Respecter les normes de conservation alimentaire',
    ],
    process: [
      'Inscrivez-vous comme hébergeur',
      'Validation de votre espace',
      'Installation des équipements',
      'Recevez les dépôts de colis',
      'Gagnez à chaque retrait client',
    ],
  },
  driver: {
    title: 'Livreur',
    subtitle: 'Travaillez en toute liberté',
    objectives: [
      'Gérer votre emploi du temps librement',
      'Maximiser vos revenus selon votre disponibilité',
      'Contribuer à l\'économie locale',
    ],
    earnings: {
      label: 'Vos revenus',
      amount: '70%',
      details: 'des frais de livraison (5-15€ par course)',
    },
    benefits: [
      'Paiement immédiat après chaque livraison',
      'Choisissez vos courses',
      'Travaillez quand vous voulez',
      'Prime de performance',
      'Assurance incluse pendant les livraisons',
    ],
    requirements: [
      'Avoir un véhicule (vélo, scooter, voiture)',
      'Permis de conduire valide (si nécessaire)',
      'Smartphone avec GPS',
      'Être majeur',
    ],
    process: [
      'Créez votre profil livreur',
      'Vérification de vos documents',
      'Formation rapide à l\'application',
      'Activez votre disponibilité',
      'Acceptez des courses et livrez',
    ],
  },
  admin: {
    title: 'Administrateur',
    subtitle: 'Gérer la plateforme',
    objectives: [],
    earnings: { label: '', amount: '', details: '' },
    benefits: [],
    requirements: [],
    process: [],
  },
};

export function RoleInfoModal({ isOpen, onClose, roleType }: RoleInfoModalProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (!isOpen || roleType === 'customer' || roleType === 'admin') return null;

  const info = roleInfoData[roleType];

  const handleContinue = () => {
    if (user) {
      setShowOnboarding(true);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{info.title}</h2>
              <p className="text-orange-100 text-lg">{info.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 rounded-full p-3">
                <Euro className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.earnings.label}</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">{info.earnings.amount}</div>
                <p className="text-gray-700 text-lg">{info.earnings.details}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-orange-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-900">Vos objectifs</h3>
            </div>
            <ul className="space-y-3">
              {info.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700 text-lg">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Avantages</h3>
              <ul className="space-y-3">
                {info.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Prérequis</h3>
              <ul className="space-y-3">
                {info.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-orange-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-900">Comment ça marche ?</h3>
            </div>
            <div className="space-y-4">
              {info.process.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-gray-700 text-lg">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white text-center">
            <p className="text-xl mb-4">Prêt à rejoindre Delikreol ?</p>
            <button
              onClick={handleContinue}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors transform hover:scale-105 duration-200 shadow-lg"
            >
              {user ? 'Remplir le formulaire' : `Créer mon compte ${info.title.toLowerCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          initialMode="signup"
        />
      )}

      {showOnboarding && (
        <OnboardingForm
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          roleType={roleType}
        />
      )}
    </>
  );
}
