// ---------------------------------------------------------------------------
// DELIKREOL — Service de rapprochement bancaire (démo / fallback)
// ---------------------------------------------------------------------------
// Ce module fournit des interfaces et fonctions de rapprochement utilisables
// côté frontend. Toutes les données sont mockées. Le vrai rapprochement sera
// implémenté via des Edge Functions Supabase.
//
// Aucun secret (clé API, token, etc.) n'est exposé ici.
// ---------------------------------------------------------------------------

/**
 * Statut de rapprochement d'une transaction.
 */
export type ReconciliationStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';

/**
 * Transaction rapprochée entre une commande Delikréol et une opération Qonto.
 */
export interface ReconciledTransaction {
  /** Identifiant unique de la commande */
  orderId: string;
  /** Numéro lisible de la commande (ex: DLK-4521) */
  orderNumber: string;
  /** Montant payé par le client (€) */
  clientAmount: number;
  /** Commission prélevée par la plateforme (€) */
  commission: number;
  /** Montant reversé au vendeur (€) */
  vendorAmount: number;
  /** Frais de livraison (€) */
  deliveryFee: number;
  /** Montant reversé au livreur (€) */
  driverAmount: number;
  /** Statut de la transaction */
  status: ReconciliationStatus;
  /** Identifiant de la transaction Qonto associée (vide si non rapproché) */
  qontoTransactionId: string;
  /** Référence interne Qonto (vide si non rapproché) */
  qontoReference: string;
  /** Date de rapprochement (ISO string) */
  reconciledAt: string | null;
}

/**
 * Ligne d'un export comptable.
 */
export interface AccountingRow {
  /** Date de la transaction */
  date: string;
  /** Numéro de commande */
  orderNumber: string;
  /** Type d'opération */
  type: 'vente' | 'commission' | 'remboursement' | 'frais_livraison' | 'virement_vendeur' | 'virement_livreur';
  /** Libellé */
  label: string;
  /** Montant HT (€) */
  amountHt: number;
  /** Taux de TVA appliqué */
  tvaRate: number;
  /** Montant de TVA (€) */
  tvaAmount: number;
  /** Montant TTC (€) */
  amountTtc: number;
  /** Devise */
  currency: string;
}

/**
 * Export comptable structuré pour une période donnée.
 */
export interface AccountingExport {
  /** Période concernée (ex: "2026-06") */
  period: string;
  /** Nombre total de commandes */
  totalOrders: number;
  /** Chiffre d'affaires total TTC (€) */
  totalRevenue: number;
  /** Total des commissions plateforme (€) */
  totalCommissions: number;
  /** Total des remboursements (€) */
  totalRefunds: number;
  /** Total des frais de livraison (€) */
  totalDeliveryFees: number;
  /** Total des reversements aux vendeurs (€) */
  totalVendorPayments: number;
  /** Total des reversements aux livreurs (€) */
  totalDriverPayments: number;
  /** Total des dépenses fournisseurs (€) */
  totalSupplierExpenses: number;
  /** Montant total de TVA collectée (€) */
  vatAmount: number;
  /** Lignes détaillées de l'export */
  rows: AccountingRow[];
}

/**
 * Métriques calculées pour une période donnée (dashboard).
 */
export interface PeriodMetrics {
  /** Nombre total de commandes */
  totalOrders: number;
  /** Chiffre d'affaires total (€) */
  totalRevenue: number;
  /** Commissions totales (€) */
  totalCommission: number;
  /** Frais de livraison totaux (€) */
  totalDeliveryFees: number;
  /** Valeur moyenne des commandes (€) */
  averageOrderValue: number;
  /** Nombre de commandes rapprochées */
  reconciledOrders: number;
  /** Nombre de commandes en attente */
  pendingOrders: number;
  /** Taux de rapprochement (%) */
  reconciliationRate: number;
}

// ---------------------------------------------------------------------------
// Données mockées
// ---------------------------------------------------------------------------

const MOCK_TRANSACTIONS: ReconciledTransaction[] = [
  {
    orderId: 'ord_001',
    orderNumber: 'DLK-1001',
    clientAmount: 45.90,
    commission: 6.89,
    vendorAmount: 39.01,
    deliveryFee: 5.00,
    driverAmount: 5.00,
    status: 'paid',
    qontoTransactionId: 'qonto_tx_abc123',
    qontoReference: 'QNT-REF-001',
    reconciledAt: '2026-06-01T10:30:00Z',
  },
  {
    orderId: 'ord_002',
    orderNumber: 'DLK-1002',
    clientAmount: 32.50,
    commission: 4.88,
    vendorAmount: 27.62,
    deliveryFee: 3.50,
    driverAmount: 3.50,
    status: 'paid',
    qontoTransactionId: 'qonto_tx_def456',
    qontoReference: 'QNT-REF-002',
    reconciledAt: '2026-06-02T14:15:00Z',
  },
  {
    orderId: 'ord_003',
    orderNumber: 'DLK-1003',
    clientAmount: 78.00,
    commission: 11.70,
    vendorAmount: 66.30,
    deliveryFee: 6.00,
    driverAmount: 6.00,
    status: 'pending',
    qontoTransactionId: '',
    qontoReference: '',
    reconciledAt: null,
  },
  {
    orderId: 'ord_004',
    orderNumber: 'DLK-1004',
    clientAmount: 25.00,
    commission: 3.75,
    vendorAmount: 21.25,
    deliveryFee: 4.00,
    driverAmount: 4.00,
    status: 'refunded',
    qontoTransactionId: 'qonto_tx_ghi789',
    qontoReference: 'QNT-REF-003',
    reconciledAt: '2026-06-03T09:00:00Z',
  },
  {
    orderId: 'ord_005',
    orderNumber: 'DLK-1005',
    clientAmount: 120.00,
    commission: 18.00,
    vendorAmount: 102.00,
    deliveryFee: 8.00,
    driverAmount: 8.00,
    status: 'cancelled',
    qontoTransactionId: '',
    qontoReference: '',
    reconciledAt: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

/**
 * Retourne la date actuelle au format ISO (YYYY-MM-DD).
 */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Arrondit un montant à 2 décimales.
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Génère une référence unique pour le rapprochement.
 */
function generateReference(): string {
  return `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Génère des lignes comptables mockées pour un export mensuel.
 */
function generateMockExportRows(year: number, month: number): AccountingRow[] {
  const rows: AccountingRow[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (const tx of MOCK_TRANSACTIONS) {
    const day = Math.min(parseInt(tx.orderId.slice(-3), 10) % daysInMonth + 1, daysInMonth);
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Ligne vente (client)
    rows.push({
      date,
      orderNumber: tx.orderNumber,
      type: 'vente',
      label: `Vente ${tx.orderNumber}`,
      amountHt: round2(tx.clientAmount / 1.2),
      tvaRate: 20,
      tvaAmount: round2(tx.clientAmount - tx.clientAmount / 1.2),
      amountTtc: tx.clientAmount,
      currency: 'EUR',
    });

    // Ligne commission
    rows.push({
      date,
      orderNumber: tx.orderNumber,
      type: 'commission',
      label: `Commission plateforme ${tx.orderNumber}`,
      amountHt: round2(tx.commission / 1.2),
      tvaRate: 20,
      tvaAmount: round2(tx.commission - tx.commission / 1.2),
      amountTtc: tx.commission,
      currency: 'EUR',
    });

    // Ligne virement vendeur
    rows.push({
      date,
      orderNumber: tx.orderNumber,
      type: 'virement_vendeur',
      label: `Reversement vendeur ${tx.orderNumber}`,
      amountHt: tx.vendorAmount,
      tvaRate: 0,
      tvaAmount: 0,
      amountTtc: tx.vendorAmount,
      currency: 'EUR',
    });

    // Ligne frais de livraison
    rows.push({
      date,
      orderNumber: tx.orderNumber,
      type: 'frais_livraison',
      label: `Frais de livraison ${tx.orderNumber}`,
      amountHt: round2(tx.deliveryFee / 1.2),
      tvaRate: 20,
      tvaAmount: round2(tx.deliveryFee - tx.deliveryFee / 1.2),
      amountTtc: tx.deliveryFee,
      currency: 'EUR',
    });

    // Ligne virement livreur
    rows.push({
      date,
      orderNumber: tx.orderNumber,
      type: 'virement_livreur',
      label: `Reversement livreur ${tx.orderNumber}`,
      amountHt: tx.driverAmount,
      tvaRate: 0,
      tvaAmount: 0,
      amountTtc: tx.driverAmount,
      currency: 'EUR',
    });

    // Ligne remboursement si applicable
    if (tx.status === 'refunded') {
      rows.push({
        date,
        orderNumber: tx.orderNumber,
        type: 'remboursement',
        label: `Remboursement ${tx.orderNumber}`,
        amountHt: round2(-tx.clientAmount / 1.2),
        tvaRate: 20,
        tvaAmount: round2(-(tx.clientAmount - tx.clientAmount / 1.2)),
        amountTtc: -tx.clientAmount,
        currency: 'EUR',
      });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Génère un export mensuel complet (structuré + CSV) pour une année/mois donnés.
 *
 * @param year  Année (ex: 2026)
 * @param month Mois (1-12)
 * @returns Un objet contenant l'export structuré et sa représentation CSV
 */
export function generateMonthlyExport(year: number, month: number): {
  export: AccountingExport;
  csv: string;
} {
  const rows = generateMockExportRows(year, month);
  const period = `${year}-${String(month).padStart(2, '0')}`;

  const totals = rows.reduce(
    (acc, row) => ({
      totalRevenue: acc.totalRevenue + (row.type === 'vente' ? row.amountTtc : 0),
      totalCommissions: acc.totalCommissions + (row.type === 'commission' ? row.amountTtc : 0),
      totalRefunds: acc.totalRefunds + (row.type === 'remboursement' ? Math.abs(row.amountTtc) : 0),
      totalDeliveryFees: acc.totalDeliveryFees + (row.type === 'frais_livraison' ? row.amountTtc : 0),
      totalVendorPayments: acc.totalVendorPayments + (row.type === 'virement_vendeur' ? row.amountTtc : 0),
      totalDriverPayments: acc.totalDriverPayments + (row.type === 'virement_livreur' ? row.amountTtc : 0),
      totalSupplierExpenses: acc.totalSupplierExpenses + 0,
      vatAmount: acc.vatAmount + row.tvaAmount,
    }),
    {
      totalRevenue: 0,
      totalCommissions: 0,
      totalRefunds: 0,
      totalDeliveryFees: 0,
      totalVendorPayments: 0,
      totalDriverPayments: 0,
      totalSupplierExpenses: 0,
      vatAmount: 0,
    },
  );

  const accountingExport: AccountingExport = {
    period,
    totalOrders: MOCK_TRANSACTIONS.length,
    ...totals,
    rows,
  };

  // Construction du CSV
  const header = 'date;orderNumber;type;label;amountHt;tvaRate;tvaAmount;amountTtc;currency';
  const csvRows = rows.map(
    (r) =>
      `${r.date};${r.orderNumber};${r.type};"${r.label}";${r.amountHt.toFixed(2)};${r.tvaRate};${r.tvaAmount.toFixed(2)};${r.amountTtc.toFixed(2)};${r.currency}`,
  );
  const csv = `${header}\n${csvRows.join('\n')}`;

  return { export: accountingExport, csv };
}

/**
 * Marque une commande comme rapprochée avec une transaction Qonto.
 *
 * @param orderId          Identifiant de la commande
 * @param qontoTransactionId Identifiant de la transaction Qonto
 * @returns La transaction rapprochée mise à jour, ou null si introuvable
 */
export function reconcileOrder(
  orderId: string,
  qontoTransactionId: string,
): ReconciledTransaction | null {
  const tx = MOCK_TRANSACTIONS.find((t) => t.orderId === orderId);
  if (!tx) return null;

  tx.qontoTransactionId = qontoTransactionId;
  tx.qontoReference = generateReference();
  tx.reconciledAt = new Date().toISOString();
  tx.status = 'paid';

  return { ...tx };
}

/**
 * Retourne la liste des commandes qui ne sont pas encore rapprochées.
 *
 * @returns Tableau des transactions en attente de rapprochement
 */
export function getPendingReconciliation(): ReconciledTransaction[] {
  return MOCK_TRANSACTIONS.filter((t) => t.status === 'pending' || t.status === 'cancelled');
}

/**
 * Calcule les métriques pour une période donnée (dashboard).
 *
 * @param startDate Date de début (ISO string ou Date)
 * @param endDate   Date de fin (ISO string ou Date)
 * @returns Métriques calculées pour la période
 */
export function calculatePeriodMetrics(
  startDate: string | Date,
  endDate: string | Date,
): PeriodMetrics {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    if (!tx.reconciledAt) return false;
    const txTime = new Date(tx.reconciledAt).getTime();
    return txTime >= start && txTime <= end;
  });

  const totalRevenue = filtered.reduce((sum, tx) => sum + tx.clientAmount, 0);
  const totalCommission = filtered.reduce((sum, tx) => sum + tx.commission, 0);
  const totalDeliveryFees = filtered.reduce((sum, tx) => sum + tx.deliveryFee, 0);
  const totalOrders = filtered.length;
  const averageOrderValue = totalOrders > 0 ? round2(totalRevenue / totalOrders) : 0;

  const allInPeriod = MOCK_TRANSACTIONS.filter((tx) => {
    const d = tx.reconciledAt ? new Date(tx.reconciledAt).getTime() : Date.now();
    return d >= start && d <= end || tx.status === 'pending';
  });

  const pendingOrders = allInPeriod.filter((tx) => tx.status === 'pending' || tx.status === 'cancelled').length;
  const reconciliationRate = allInPeriod.length > 0
    ? round2((filtered.length / allInPeriod.length) * 100)
    : 0;

  return {
    totalOrders,
    totalRevenue: round2(totalRevenue),
    totalCommission: round2(totalCommission),
    totalDeliveryFees: round2(totalDeliveryFees),
    averageOrderValue,
    reconciledOrders: filtered.length,
    pendingOrders,
    reconciliationRate,
  };
}

/**
 * Retourne toutes les transactions (utile pour debugging / affichage).
 */
export function getAllTransactions(): ReconciledTransaction[] {
  return MOCK_TRANSACTIONS.map((tx) => ({ ...tx }));
}
