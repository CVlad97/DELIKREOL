export const categories = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Maçonnerie', 'Toiture', 'Peinture',
  'Carrelage', 'Climatisation', 'Terrasse / deck', 'Cuisine', 'Salle de bain',
  'Clôture', 'Jardin', 'Dépannage urgent'
];

export const communes = [
  'Fort-de-France', 'Le Lamentin', 'Ducos', 'Rivière-Pilote', 'Sainte-Luce',
  'Le Marin', 'Le François', 'Les Trois-Îlets', 'Le Robert', 'Schoelcher'
];

export const artisans = [
  {
    id: 1,
    name: 'Menuiserie Sud Caraïbe',
    trade: 'Menuiserie / deck / pergola',
    town: 'Rivière-Pilote',
    zones: ['Rivière-Pilote', 'Sainte-Luce', 'Le Marin'],
    rating: 4.8,
    availability: 'Cette semaine',
    badges: ['Vérifié', 'Devis rapide', 'Matériaux partenaires'],
    price: '€€',
    description: 'Spécialiste decks, pergolas, portes, petites extensions bois et finitions extérieures.',
    works: ['Deck terrasse', 'Pergola tropicale', 'Habillage bois']
  },
  {
    id: 2,
    name: 'Élec Pro MQ',
    trade: 'Électricité / dépannage urgent',
    town: 'Ducos',
    zones: ['Ducos', 'Lamentin', 'François'],
    rating: 4.7,
    availability: 'Urgence 24-48h',
    badges: ['Urgence', 'Vérifié'],
    price: '€€',
    description: 'Dépannage, remise aux normes, tableaux électriques, luminaires et petits chantiers.',
    works: ['Tableau électrique', 'Éclairage LED', 'Diagnostic panne']
  },
  {
    id: 3,
    name: 'Plomberie Express 972',
    trade: 'Plomberie / salle de bain',
    town: 'Fort-de-France',
    zones: ['Fort-de-France', 'Schoelcher', 'Lamentin'],
    rating: 4.6,
    availability: 'Aujourd’hui selon secteur',
    badges: ['Urgence', 'Devis rapide'],
    price: '€€',
    description: 'Fuites, rénovation salle de bain, chauffe-eau, robinetterie et évacuations.',
    works: ['Fuite', 'Douche italienne', 'Pack plomberie']
  },
  {
    id: 4,
    name: 'Bâti Créole Services',
    trade: 'Maçonnerie / rénovation',
    town: 'Le Marin',
    zones: ['Le Marin', 'Sainte-Anne', 'Sainte-Luce'],
    rating: 4.5,
    availability: 'Projet à planifier',
    badges: ['Chantier suivi', 'Vérifié'],
    price: '€€€',
    description: 'Extensions, murs, dalles, ouvertures, petites constructions et rénovation lourde.',
    works: ['Extension 20 m²', 'Dalle béton', 'Mur clôture']
  },
  {
    id: 5,
    name: 'Peinture Tropicale',
    trade: 'Peinture / façade',
    town: 'Sainte-Luce',
    zones: ['Sainte-Luce', 'Rivière-Pilote', 'Trois-Îlets'],
    rating: 4.9,
    availability: 'Cette semaine',
    badges: ['Finition premium', 'Devis rapide'],
    price: '€',
    description: 'Peinture intérieure, extérieure, façades tropicalisées, préparation supports.',
    works: ['Façade', 'Appartement', 'Traitement humidité']
  },
  {
    id: 6,
    name: 'Clim & Froid Antilles',
    trade: 'Climatisation / froid',
    town: 'Le Lamentin',
    zones: ['Toute Martinique'],
    rating: 4.7,
    availability: 'Sous 72h',
    badges: ['Maintenance', 'Vérifié'],
    price: '€€',
    description: 'Pose, entretien, diagnostic climatisation et optimisation consommation.',
    works: ['Pose split', 'Entretien', 'Diagnostic froid']
  }
];

export const materials = [
  { id: 1, name: 'Bois traité deck', category: 'Terrasse / deck', price: 'à partir de 39 €/m²', supplier: 'Local / import', stock: 'Sur demande', delay: '5-15 jours', type: 'Achat groupé' },
  { id: 2, name: 'Carrelage antidérapant', category: 'Carrelage', price: 'lot dès 18 €/m²', supplier: 'Destockage', stock: 'Limité', delay: '48h', type: 'Destockage' },
  { id: 3, name: 'Peinture façade tropicalisée', category: 'Peinture', price: 'à partir de 79 €/pot', supplier: 'Fournisseur MQ', stock: 'Disponible', delay: '24-72h', type: 'Local' },
  { id: 4, name: 'Pack plomberie salle de bain', category: 'Plomberie', price: 'sur devis', supplier: 'Mix local/import', stock: 'Selon projet', delay: '7-21 jours', type: 'Sourcing' },
  { id: 5, name: 'Ciment et agrégats chantier', category: 'Maçonnerie', price: 'prix chantier groupé', supplier: 'Local', stock: 'Disponible', delay: '24-72h', type: 'Local' },
  { id: 6, name: 'Kit éclairage LED intérieur', category: 'Électricité', price: 'dès 12 €/point', supplier: 'Import négocié', stock: 'Sur demande', delay: '10-20 jours', type: 'Import' }
];

export const demoProjects = [
  { id: 'BK-1001', title: 'Deck terrasse 25 m²', town: 'Sainte-Luce', budget: '3 500–6 000 €', status: 'Artisans consultés', priority: 'Normal' },
  { id: 'BK-1002', title: 'Rénovation salle de bain', town: 'Ducos', budget: '5 000–9 000 €', status: 'Devis reçus', priority: 'Normal' },
  { id: 'BK-1003', title: 'Dépannage fuite urgent', town: 'Le François', budget: '150–500 €', status: 'Prioritaire', priority: 'Urgent' },
  { id: 'BK-1004', title: 'Extension maison 20 m²', town: 'Rivière-Pilote', budget: '25 000–45 000 €', status: 'Diagnostic à planifier', priority: 'Étude' }
];

export const packs = [
  { name: 'Diagnostic Express', price: '49–99 €', text: 'Clarifier le besoin, préparer les photos et cadrer le premier budget.' },
  { name: 'Coordination Petit Chantier', price: 'sur devis', text: 'Sélection d’artisans, planning simple et suivi des étapes clés.' },
  { name: 'Suivi Rénovation', price: 'commission projet', text: 'Comparaison devis, matériaux, points de contrôle et alertes budget.' },
  { name: 'Projet Construction', price: 'sur étude', text: 'Pré-cadrage, consultation, lots artisans et coordination documentaire.' }
];
