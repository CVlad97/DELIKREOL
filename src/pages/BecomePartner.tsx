import { useState } from 'react';
import { Store, Truck, MapPin, ArrowLeft, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
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
      subtitle: 'Restaurant · Producteur · Commerce',
      color: 'from-blue-500 to-blue-600',
      revenue: '80% des revenus',
      description: 'Augmentez votre visibilité et vendez vos produits locaux à travers notre plateforme',
      benefits: [
        'Commission de seulement 20%',
        'Paiements automatiques sécurisés',
        'Gestion simplifiée des commandes',
        'Zéro infrastructure de livraison',
        'Visibilité sur toute la Martinique',
      ],
      requirements: [
        'SIRET valide',
        'Conformité sanitaire',
        'Photos de vos produits',
        'Horaires d\'ouverture',
        'Adresse de préparation',
      ],
    },
    {
      type: 'driver' as PartnerType,
      icon: Truck,
      title: 'Livreur',
      subtitle: 'Auto-entrepreneur',
      color: 'from-green-500 to-green-600',
      revenue: '70% des frais de livraison',
      description: 'Travaillez en toute liberté avec des tournées optimisées par IA',
      benefits: [
        '70% des frais de livraison',
        'Paiement immédiat après livraison',
        'Horaires 100% flexibles',
        'Routes optimisées par IA',
        'Application mobile dédiée',
      ],
      requirements: [
        'Statut auto-entrepreneur (SIRET)',
        'Véhicule (vélo, scooter, voiture)',
        'Permis de conduire valide',
        'Assurance responsabilité civile',
        'Smartphone avec GPS',
      ],
    },
    {
      type: 'relay_host' as PartnerType,
      icon: MapPin,
      title: 'Hôte de Point Relais',
      subtitle: 'Commerce · Particulier',
      color: 'from-orange-500 to-orange-600',
      revenue: '2-5€ par colis',
      description: 'Générez un revenu complémentaire en accueillant des colis dans votre local',
      benefits: [
        '2 à 5€ par colis géré',
        'Augmentation du trafic client',
        'Horaires flexibles configurables',
        'Application simple de gestion',
        'Pas d\'investissement requis',
      ],
      requirements: [
        'Local adapté au stockage',
        'Capacité de stockage (min. 5 colis)',
        'Horaires réguliers',
        'Mesures de sécurité',
        'Accès pratique pour retraits',
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedType(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <div className={`bg-gradient-to-br ${partner.color} text-white p-8 rounded-2xl shadow-xl mb-8`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <Icon size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{partner.title}</h1>
                <p className="text-lg opacity-90">{partner.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex">
              <DollarSign size={20} />
              <span className="font-bold">{partner.revenue}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Pourquoi rejoindre DELIKREOL ?</h2>
            <p className="text-gray-700 mb-6">{partner.description}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={24} />
                  Avantages
                </h3>
                <ul className="space-y-3">
                  {partner.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={24} />
                  Pré-requis
                </h3>
                <ul className="space-y-3">
                  {partner.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg text-emerald-900 mb-3">Processus de candidature</h3>
            <div className="space-y-2 text-sm text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="font-bold">1.</span>
                <span>Remplissez le formulaire de candidature (5 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">2.</span>
                <span>Évaluation automatique par IA (instantané)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">3.</span>
                <span>Validation par notre équipe (24-48h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">4.</span>
                <span>Formation en ligne et activation (1h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">5.</span>
                <span>Commencez à gagner ! 🎉</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className={`w-full bg-gradient-to-r ${partner.color} text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}
          >
            Postuler maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </button>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Rejoignez l'écosystème DELIKREOL
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme logistique locale où chaque acteur gagne. Choisissez votre rôle et commencez à développer votre activité dès aujourd'hui.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {partnerTypes.map((partner) => {
            const Icon = partner.icon;
            return (
              <button
                key={partner.type}
                onClick={() => setSelectedType(partner.type)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden text-left group"
              >
                <div className={`bg-gradient-to-br ${partner.color} p-6 text-white`}>
                  <Icon size={48} className="mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{partner.title}</h2>
                  <p className="text-sm opacity-90">{partner.subtitle}</p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                    <DollarSign size={20} />
                    <span>{partner.revenue}</span>
                  </div>

                  <p className="text-gray-700 mb-4 text-sm">{partner.description}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    {partner.benefits.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-emerald-600 font-bold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                    En savoir plus
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions ?</h2>
          <p className="mb-6">Notre équipe est là pour vous accompagner dans votre démarche</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:contact@delikreol.com"
              className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
            >
              contact@delikreol.com
            </a>
            <a
              href="https://wa.me/596696000000"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors"
            >
              WhatsApp: +596 696 00 00 00
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
