export interface Review {
  id: string;
  traiteurSlug: string;
  traiteurName: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  verified: boolean; // la commande a été vérifiée
}

const STORAGE_KEY = 'delikreol_reviews';

// Reviews de démo pour chaque traiteur
const DEMO_REVIEWS: Review[] = [
  {
    id: 'demo-1',
    traiteurSlug: 'ninice',
    traiteurName: 'Les Delices de Ninice',
    authorName: 'Marie-Line',
    rating: 5,
    comment: 'Colombo de poulet incroyable ! Les épices sont parfaites. Je recommande vivement.',
    createdAt: '2026-06-15T12:00:00Z',
    verified: true,
  },
  {
    id: 'demo-2',
    traiteurSlug: 'ninice',
    traiteurName: 'Les Delices de Ninice',
    authorName: 'Jean-Phi',
    rating: 4,
    comment: 'Très bon accueil, plats savoureux. Le bara était un peu sec ce jour-là mais le reste était excellent.',
    createdAt: '2026-06-10T14:30:00Z',
    verified: true,
  },
  {
    id: 'demo-3',
    traiteurSlug: 'cocos-food',
    traiteurName: "Coco's Food",
    authorName: 'Stephanie',
    rating: 5,
    comment: 'Poulet rôti comme à la maison ! La box grillé du marché est un régal.',
    createdAt: '2026-06-18T09:15:00Z',
    verified: true,
  },
  {
    id: 'demo-4',
    traiteurSlug: 'an-tje-coco',
    traiteurName: 'An Tjè Coco',
    authorName: 'David',
    rating: 5,
    comment: 'Pépites de coco faites avec amour. On sent la qualité des produits locaux.',
    createdAt: '2026-06-12T16:45:00Z',
    verified: true,
  },
  {
    id: 'demo-5',
    traiteurSlug: 'saveurs-afrique',
    traiteurName: "Saveurs d'Afrique",
    authorName: 'Aïssata',
    rating: 5,
    comment: 'Le mafé est divin, comme au Sénégal ! Et le Dôkô est un délice.',
    createdAt: '2026-06-08T11:20:00Z',
    verified: true,
  },
  {
    id: 'demo-6',
    traiteurSlug: 'save-peyia',
    traiteurName: "Snack Savè Peyi'A",
    authorName: 'Ludovic',
    rating: 4,
    comment: 'Bon rapport qualité-prix. Les grillades sont bien assaisonnées.',
    createdAt: '2026-06-05T13:00:00Z',
    verified: true,
  },
  {
    id: 'demo-7',
    traiteurSlug: 'goute-mwen',
    traiteurName: 'Virtuel Gouté Mwen',
    authorName: 'Sophie',
    rating: 5,
    comment: 'Les glaces sont rafraîchissantes et pleines de saveurs. Super Coco un délice ! Et sans sucre ajouté en plus.',
    createdAt: '2026-06-19T10:00:00Z',
    verified: true,
  },
  {
    id: 'demo-8',
    traiteurSlug: 'sweet-family-traiteur-orianne',
    traiteurName: 'Sweet Family Traiteur Orianne',
    authorName: 'Karine',
    rating: 5,
    comment: 'Commander pour un anniversaire, tout le monde a adoré les bao buns ! Service impeccable.',
    createdAt: '2026-06-17T18:30:00Z',
    verified: true,
  },
];

export function getReviews(traiteurSlug: string): Review[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all: Review[] = stored ? JSON.parse(stored) : [];
  return [...DEMO_REVIEWS.filter(r => r.traiteurSlug === traiteurSlug), ...all.filter(r => r.traiteurSlug === traiteurSlug)];
}

export function getAllReviews(): Review[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const userReviews: Review[] = stored ? JSON.parse(stored) : [];
  return [...DEMO_REVIEWS, ...userReviews];
}

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  const newReview: Review = {
    ...review,
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const stored = localStorage.getItem(STORAGE_KEY);
  const all: Review[] = stored ? JSON.parse(stored) : [];
  all.push(newReview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newReview;
}

export function getAverageRating(traiteurSlug: string): { average: number; count: number } {
  const reviews = getReviews(traiteurSlug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}