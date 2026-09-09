import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  MapPin,
  ShoppingCart,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const GUIDE_PARTENAIRE = [
  {
    title: 'Créer mon compte partenaire',
    steps: [
      'Remplissez le formulaire "Devenir partenaire" accessible via le menu principal.',
      'Après validation, recevez un identifiant et un mot de passe par email.',
      'Connectez-vous à la plateforme partenaire avec vos identifiants.',
    ],
  },
  {
    title: 'Ajouter mes produits au catalogue',
    steps: [
      'Accédez au tableau de bord partenaire et cliquez sur "Ajouter un produit".',
      'Renseignez le nom, la description, le prix, les photos et les catégories.',
      'Indiquez la disponibilité (quantité en stock) et les options de livraison/click & collect.',
      'Enregistrez : le produit apparaîtra dans le catalogue public.',
    ],
  },
  {
    title: 'Gérer les commandes et les livraisons',
    steps: [
      'Lorsque qu\'une commande arrive, vous recevez une notification WhatsApp / email.',
      'Vérifiez la disponibilité des produits en stock.',
      'Confirmez la préparation ou proposez une alternative.',
      'Une fois prêt, indiquez le statut "Prêt" : le client sera notifié pour le retrait ou la livraison.',
    ],
  },
  {
    title: 'Consulter mes ventes et mes statistiques',
    steps: [
      'Dans le tableau de bord, allez dans "Ventes" ou "Rapports".',
      'Visualisez le chiffre d\'affaires, le nombre de commandes et les produits les plus vendus.',
      'Utilisez ces données pour ajuster vos offres et vos promotions.',
    ],
  },
];

export function GuidePartenaire() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-6">Guide du partenaire Delikreol</h2>
      {GUIDE_PARTENAIRE.map((section) => (
        <div key={section.title} className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-primary">
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">{section.title}</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
                <div>{step}</div>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-semibold mb-2">Besoin d'aide ?</h3>
        <p className="text-gray-600 mb-4">Contactez notre équipe partenaire via WhatsApp au <strong>+596 69 66 53 58 9</strong> ou écrivez-nous à <a href="mailto:partenari@delikreol.com" className="text-blue-600 hover:text-blue-700">partenari@delikreol.com</a>.</p>
        <Link to="/aide" className="underline text-blue-600">Voir la foire aux questions (FAQ)</Link>
      </div>
    </div>
  );
}