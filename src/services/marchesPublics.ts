// DELIKREOL — Veille Appels d'Offre Publics
// Aspire les marchés publics de restauration/livraison en Martinique
// Sources : BOAMP, JOUE, data.gouv.fr, marchés publics locaux

export interface MarchePublic {
  id: string;
  titre: string;
  organisme: string;
  commune: string;
  objet: string;
  type: 'restauration_collective' | 'livraison_repas' | 'traiteur_evenementiel' | 'prestation_alimentaire';
  dateLimite: string;
  datePublication: string;
  montantEstime?: number;
  dureeMois?: number;
  source: 'BOAMP' | 'JOUE' | 'data.gouv' | 'collectivite_locale';
  url: string;
  statut: 'ouvert' | 'bientot' | 'ferme';
  cpvCodes: string[]; // Code CPV (Classification Produits et Services)
}

const CPV_RESTAURATION = [
  '55520000', // Services de restauration collective
  '55521000', // Services de restauration collective à domicile
  '55522000', // Services de restauration collective pour entreprises de transport
  '55523000', // Services de restauration collective pour autres entreprises
  '55524000', // Services de restauration collective pour écoles
  '55525000', // Services de restauration collective pour maisons de retraite
  '55526000', // Services de restauration collective pour hôpitaux
  '55320000', // Services de restauration traiteur
  '55321000', // Services de préparation de repas
  '55322000', // Services de restauration traiteur événementiel
  '15890000', // Repas et plats préparés
  '15891000', // Plats préparés à base de légumes
  '15892000', // Plats préparés à base de viande
  '15893000', // Plats préparés à base de poisson
  '15894000', // Plats préparés surgelés
  '15895000', // Plats préparés réfrigérés
  '15896000', // Plats préparés déshydratés
];

// Données simulées (exemples) — en production, remplacer par API BOAMP
const MARCHES_SIMULES: MarchePublic[] = [
  {
    id: 'boamp-2026-001',
    titre: 'Restauration scolaire pour les écoles de Fort-de-France',
    organisme: 'Mairie de Fort-de-France',
    commune: 'Fort-de-France',
    objet: 'Prestation de restauration scolaire pour 12 écoles primaires — 1500 repas/jour',
    type: 'restauration_collective',
    dateLimite: '2026-09-15',
    datePublication: '2026-07-01',
    montantEstime: 850000,
    dureeMois: 24,
    source: 'BOAMP',
    url: 'https://www.boamp.fr/avis/...',
    statut: 'ouvert',
    cpvCodes: ['55524000', '15890000'],
  },
  {
    id: 'boamp-2026-002',
    titre: 'Livraison de repas à domicile pour personnes âgées',
    organisme: 'CCAS du Lamentin',
    commune: 'Lamentin',
    objet: 'Service de portage de repas à domicile pour 80 bénéficiaires — 7j/7',
    type: 'livraison_repas',
    dateLimite: '2026-08-30',
    datePublication: '2026-06-15',
    montantEstime: 320000,
    dureeMois: 12,
    source: 'BOAMP',
    url: 'https://www.boamp.fr/avis/...',
    statut: 'ouvert',
    cpvCodes: ['55521000', '15890000'],
  },
  {
    id: 'boamp-2026-003',
    titre: 'Cocktail dinatoire pour l\'assemblée de Martinique',
    organisme: 'Collectivité Territoriale de Martinique',
    commune: 'Fort-de-France',
    objet: 'Prestation traiteur pour réception officielle — 300 personnes',
    type: 'traiteur_evenementiel',
    dateLimite: '2026-10-01',
    datePublication: '2026-07-10',
    montantEstime: 45000,
    dureeMois: 1,
    source: 'BOAMP',
    url: 'https://www.boamp.fr/avis/...',
    statut: 'bientot',
    cpvCodes: ['55322000'],
  },
  {
    id: 'boamp-2026-004',
    titre: 'Repas pour le CHU de Martinique',
    organisme: 'CHU de Martinique',
    commune: 'Fort-de-France',
    objet: 'Fourniture de repas pour patients et personnel — 2000 repas/jour',
    type: 'restauration_collective',
    dateLimite: '2026-11-15',
    datePublication: '2026-07-05',
    montantEstime: 1200000,
    dureeMois: 36,
    source: 'JOUE',
    url: 'https://ted.europa.eu/...',
    statut: 'bientot',
    cpvCodes: ['55526000', '15890000'],
  },
  {
    id: 'boamp-2026-005',
    titre: 'Traiteur pour séminaire entreprises du Sud',
    organisme: 'CCI Martinique',
    commune: 'Rivière-Salée',
    objet: 'Prestation traiteur pour séminaire inter-entreprises — 150 personnes sur 2 jours',
    type: 'traiteur_evenementiel',
    dateLimite: '2026-09-01',
    datePublication: '2026-06-20',
    montantEstime: 25000,
    dureeMois: 1,
    source: 'collectivite_locale',
    url: 'https://www.martinique-achats.fr/...',
    statut: 'ouvert',
    cpvCodes: ['55322000'],
  },
  {
    id: 'boamp-2026-006',
    titre: 'Portage de repas à domicile — Secteur Nord',
    organisme: 'Mairie de Saint-Pierre',
    commune: 'Saint-Pierre',
    objet: 'Service de livraison de repas pour personnes âgées et dépendantes — zone Nord Caraïbe',
    type: 'livraison_repas',
    dateLimite: '2026-10-30',
    datePublication: '2026-07-15',
    montantEstime: 180000,
    dureeMois: 12,
    source: 'BOAMP',
    url: 'https://www.boamp.fr/avis/...',
    statut: 'bientot',
    cpvCodes: ['55521000'],
  },
];

export function getMarchesPublics(): MarchePublic[] {
  return MARCHES_SIMULES;
}

export function getMarchesByType(type: MarchePublic['type']): MarchePublic[] {
  return MARCHES_SIMULES.filter(m => m.type === type);
}

export function getMarchesByCommune(commune: string): MarchePublic[] {
  return MARCHES_SIMULES.filter(m => m.commune.toLowerCase().includes(commune.toLowerCase()));
}

export function getMarchesOuverts(): MarchePublic[] {
  return MARCHES_SIMULES.filter(m => m.statut === 'ouvert');
}

export function getMarchesByPartnerCapacite(partenaire: {
  commune?: string;
  types?: MarchePublic['type'][];
  capaciteMaxRepas?: number;
}): MarchePublic[] {
  return MARCHES_SIMULES.filter(m => {
    if (partenaire.commune && !m.commune.includes(partenaire.commune)) return false;
    if (partenaire.types && !partenaire.types.includes(m.type)) return false;
    if (partenaire.capaciteMaxRepas && m.montantEstime && m.montantEstime > partenaire.capaciteMaxRepas * 10) return false;
    return true;
  });
}

// Sources officielles documentées (pour intégration future)
export const SOURCES_OFFICIELLES = [
  {
    nom: 'BOAMP',
    url: 'https://www.boamp.fr/',
    api: 'https://api.boamp.fr/api/v1/avis',
    description: 'Bulletin Officiel des Annonces des Marchés Publics — gratuit',
    documentation: 'https://www.boamp.fr/pages/aide/api',
  },
  {
    nom: 'JOUE / TED',
    url: 'https://ted.europa.eu/',
    api: 'https://ted.europa.eu/api/v1/notices',
    description: 'Tenders Electronic Daily — marchés > 140k€',
    documentation: 'https://ted.europa.eu/fr/api.html',
  },
  {
    nom: 'data.gouv.fr',
    url: 'https://www.data.gouv.fr/fr/datasets/',
    api: 'https://www.data.gouv.fr/api/1/datasets/',
    description: 'Jeux de données ouvertes — marchés publics et appels d\'offre',
    documentation: 'https://www.data.gouv.fr/fr/apidoc/',
  },
  {
    nom: 'Martinique Achats',
    url: 'https://www.martinique-achats.fr/',
    api: null,
    description: 'Portail des marchés publics de la Collectivité Territoriale de Martinique',
    documentation: null,
  },
];