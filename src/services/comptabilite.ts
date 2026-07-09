// DELIKREOL — Comptabilité Partenaires
// Facturation, TVA, DGFiP, déclarations automatiques

export interface ComptaInvoice {
  id: string;
  invoiceNumber: string;
  partnerName: string;
  partnerSiret: string;
  partnerAddress: string;
  partnerTvaIntra: string;
  clientName: string;
  clientSiret?: string;
  emissionDate: string;
  dueDate: string;
  lines: ComptaInvoiceLine[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  tvaRate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  type: 'facture' | 'avoir' | 'acompte';
  paymentMethod?: 'virement' | 'cheque' | 'especes' | 'stripe' | 'qonto';
  paidAt?: string;
  qontoSyncId?: string;
  dgfipDeclared?: boolean;
}

export interface ComptaInvoiceLine {
  label: string;
  quantity: number;
  unitPrice: number;
  totalHT: number;
  tvaRate: number;
}

export interface ComptaDeclaration {
  id: string;
  period: string; // '2026-Q1', '2026-07'
  type: 'tva' | 'tva_ca12' | 'dgfip_ir' | 'dgfip_is' | 'tva_tns';
  dueDate: string;
  status: 'a_faire' | 'preparee' | 'validee' | 'transmise' | 'acquittee';
  totalCA: number;
  totalTvaCollectee: number;
  totalTvaDeductible: number;
  totalTvaDue: number;
  notes: string;
}

export interface ComptaPartner {
  name: string;
  siren: string;
  siret: string;
  rcs: string;
  tvaIntra: string;
  address: string;
  legalForm: string;
  capital: number;
  apeCode: string;
  isAutoEntrepreneur: boolean;
  tvaRegime: 'franchise_base' | 'reel_simplifie' | 'reel_normal';
  accountantName?: string;
  accountantEmail?: string;
  urssafId?: string;
}

// ─── TAUX TVA EN VIGUEUR (Martinique) ──────────────────────
// La TVA en Martinique est différente de la métropole :
// - Taux normal : 8.5%
// - Taux réduit : 2.1% (alimentation, restauration)
// - Taux particulier : 1.05% (presse)
export const TVA_RATES = [
  { label: 'TVA réduite — Alimentation (Martinique)', rate: 0.021, code: '2.1' },
  { label: 'TVA normale — Prestations (Martinique)', rate: 0.085, code: '8.5' },
  { label: 'TVA métropole — Normale', rate: 0.20, code: '20' },
  { label: 'TVA métropole — Réduite', rate: 0.055, code: '5.5' },
  { label: 'TVA métropole — Super réduite', rate: 0.10, code: '10' },
];

// ─── CALCULS TVA ───────────────────────────────────────────
export function calculerTVA(montantHT: number, taux: number): number {
  return Math.round(montantHT * taux * 100) / 100;
}

export function calculerTTC(montantHT: number, taux: number): number {
  return montantHT + calculerTVA(montantHT, taux);
}

export function deduireTVA(montantTTC: number, taux: number): number {
  return Math.round((montantTTC * taux) / (1 + taux) * 100) / 100;
}

// ─── GÉNÉRATION NUMÉRO FACTURE ────────────────────────────
export function genererNumeroFacture(partnerPrefix: string, annee: number, mois: number, index: number): string {
  const m = String(mois).padStart(2, '0');
  const i = String(index).padStart(4, '0');
  return `DK-${partnerPrefix}-${annee}${m}-${i}`;
}

// ─── ÉCHÉANCES DGFiP ───────────────────────────────────────
export function getEcheancesFiscales(annee: number): ComptaDeclaration[] {
  return [
    {
      id: `tva-m${annee}-01`, period: `${annee}-01`, type: 'tva',
      dueDate: `${annee}-02-15`, status: 'a_faire', totalCA: 0,
      totalTvaCollectee: 0, totalTvaDeductible: 0, totalTvaDue: 0, notes: '',
    },
    {
      id: `tva-m${annee}-02`, period: `${annee}-02`, type: 'tva',
      dueDate: `${annee}-03-15`, status: 'a_faire', totalCA: 0,
      totalTvaCollectee: 0, totalTvaDeductible: 0, totalTvaDue: 0, notes: '',
    },
    {
      id: `tva-q${annee}-01`, period: `${annee}-Q1`, type: 'tva_ca12',
      dueDate: `${annee}-04-15`, status: 'a_faire', totalCA: 0,
      totalTvaCollectee: 0, totalTvaDeductible: 0, totalTvaDue: 0, notes: 'CA12 — Déclaration trimestrielle',
    },
    {
      id: `dgfip-ir-${annee}`, period: `${annee}`, type: 'dgfip_ir',
      dueDate: `${annee}-05-31`, status: 'a_faire', totalCA: 0,
      totalTvaCollectee: 0, totalTvaDeductible: 0, totalTvaDue: 0, notes: 'Déclaration revenus DGFiP',
    },
  ];
}

// ─── DONNÉES DÉMO PARTENAIRES ─────────────────────────────
export const PARTENAIRES_DEMO: Record<string, ComptaPartner> = {
  'saveurs-afrique': {
    name: "Saveurs d'Afrique",
    siren: '912345678',
    siret: '91234567800015',
    rcs: 'RCS Fort-de-France 912 345 678',
    tvaIntra: 'FR91912345678',
    address: 'Cluny, 97215 Rivière-Salée, Martinique',
    legalForm: 'Micro-entrepreneur',
    capital: 0,
    apeCode: '5610C',
    isAutoEntrepreneur: true,
    tvaRegime: 'franchise_base',
  },
  'ninice': {
    name: 'Les Délices de Ninice',
    siren: '898765432',
    siret: '89876543200021',
    rcs: 'RCS Fort-de-France 898 765 432',
    tvaIntra: 'FR13898765432',
    address: 'Dillon, 97200 Fort-de-France, Martinique',
    legalForm: 'Entreprise individuelle',
    capital: 0,
    apeCode: '5610C',
    isAutoEntrepreneur: false,
    tvaRegime: 'franchise_base',
  },
  'coco': {
    name: "Coco's Food",
    siren: '901234567',
    siret: '90123456700032',
    rcs: 'RCS Fort-de-France 901 234 567',
    tvaIntra: 'FR19901234567',
    address: 'Fort-de-France, Martinique',
    legalForm: 'Micro-entrepreneur',
    capital: 0,
    apeCode: '5610C',
    isAutoEntrepreneur: true,
    tvaRegime: 'franchise_base',
  },
};

// ─── GÉNÉRATEUR DE FACTURE DÉMO ───────────────────────────
export function genererFactureDemo(partnerKey: string, index: number): ComptaInvoice {
  const partner = PARTENAIRES_DEMO[partnerKey];
  if (!partner) throw new Error('Partenaire inconnu');

  const now = new Date();
  const montant = [150, 280, 95, 420, 200][index % 5];
  const taux = 0.021; // TVA alimentation Martinique

  return {
    id: `fact-${partnerKey}-${index}`,
    invoiceNumber: genererNumeroFacture(partnerKey.toUpperCase().slice(0, 4), now.getFullYear(), now.getMonth() + 1, index),
    partnerName: partner.name,
    partnerSiret: partner.siret,
    partnerAddress: partner.address,
    partnerTvaIntra: partner.tvaIntra,
    clientName: 'DELIKREOL SAS',
    emissionDate: now.toISOString().split('T')[0],
    dueDate: new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0],
    lines: [
      { label: 'Prestation de traiteur — Commande du ' + now.toLocaleDateString('fr-FR'), quantity: 1, unitPrice: montant, totalHT: montant, tvaRate: taux },
    ],
    totalHT: montant,
    totalTVA: calculerTVA(montant, taux),
    totalTTC: calculerTTC(montant, taux),
    tvaRate: taux,
    status: index % 3 === 0 ? 'paid' : index % 3 === 1 ? 'sent' : 'draft',
    type: 'facture',
  };
}

// ─── EXPORT CSV ────────────────────────────────────────────
export function exporterFacturesCSV(factures: ComptaInvoice[]): string {
  const header = 'Numéro;Client;Date;Montant HT;TVA;TTC;Statut;Échéance';
  const lines = factures.map(f =>
    `${f.invoiceNumber};${f.clientName};${f.emissionDate};${f.totalHT.toFixed(2)};${f.totalTVA.toFixed(2)};${f.totalTTC.toFixed(2)};${f.status};${f.dueDate}`
  );
  return [header, ...lines].join('\n');
}

// ─── RÉCAPITULATIF DGFiP ───────────────────────────────────
export function genererDeclarationTVA(factures: ComptaInvoice[], periode: string): ComptaDeclaration {
  const actives = factures.filter(f => f.status !== 'cancelled');
  const totalCA = actives.reduce((s, f) => s + f.totalHT, 0);
  const totalTvaCollectee = actives.reduce((s, f) => s + f.totalTVA, 0);
  const totalTvaDue = totalTvaCollectee; // simplification : déduction à gérer plus tard

  return {
    id: `decl-${periode}`,
    period: periode,
    type: 'tva',
    dueDate: '2026-02-15',
    status: 'a_faire',
    totalCA,
    totalTvaCollectee,
    totalTvaDeductible: 0,
    totalTvaDue,
    notes: 'Généré automatiquement par DELIKREOL Compta.',
  };
}