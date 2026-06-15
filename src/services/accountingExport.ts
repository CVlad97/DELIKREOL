// ---------------------------------------------------------------------------
// DELIKREOL — Service d'export comptable (démo / fallback)
// ---------------------------------------------------------------------------
// Ce module fournit des fonctions de génération d'exports comptables
// utilisables côté frontend. Aucun secret (clé API, token, etc.) n'est exposé.
// Les données sont mockées ; le vrai traitement viendra via Edge Functions.
// ---------------------------------------------------------------------------

import type {
  AccountingExport,
  AccountingRow,
  ReconciledTransaction,
} from './reconciliation';
import { generateMonthlyExport, getAllTransactions } from './reconciliation';

// ---------------------------------------------------------------------------
// Types spécifiques à l'export comptable
// ---------------------------------------------------------------------------

/**
 * Rapport mensuel structuré prêt pour l'affichage ou l'export.
 */
export interface MonthlyReport {
  /** Période au format "YYYY-MM" */
  period: string;
  /** Année */
  year: number;
  /** Mois (1-12) */
  month: number;
  /** Nombre total de commandes */
  totalOrders: number;
  /** Chiffre d'affaires TTC (€) */
  revenue: number;
  /** Commissions plateforme (€) */
  commissions: number;
  /** Remboursements (€) */
  refunds: number;
  /** Frais de livraison (€) */
  deliveryFees: number;
  /** Reversements vendeurs (€) */
  vendorPayments: number;
  /** Reversements livreurs (€) */
  driverPayments: number;
  /** TVA collectée (€) */
  vatCollected: number;
  /** Solde net estimé (€) = revenue - vendorPayments - driverPayments */
  netBalance: number;
  /** Nombre de jours dans la période */
  daysInPeriod: number;
}

/**
 * Ligne du récapitulatif annuel de TVA.
 */
export interface VATSummaryLine {
  /** Mois (1-12) */
  month: number;
  /** Libellé du mois */
  monthLabel: string;
  /** Base HT des ventes (€) */
  baseHt: number;
  /** TVA collectée au taux normal 20% (€) */
  vat20: number;
  /** TVA collectée au taux réduit 10% (€) */
  vat10: number;
  /** TVA collectée au taux super-réduit 5.5% (€) */
  vat55: number;
  /** Total TVA collectée (€) */
  totalVat: number;
  /** TVA déductible estimée (€) */
  deductibleVat: number;
  /** TVA nette à déclarer (€) */
  netVat: number;
}

/**
 * Récapitulatif annuel de TVA.
 */
export interface VATSummary {
  /** Année concernée */
  year: number;
  /** Lignes mensuelles */
  lines: VATSummaryLine[];
  /** Totaux annuels */
  totals: {
    baseHt: number;
    vat20: number;
    vat10: number;
    vat55: number;
    totalVat: number;
    deductibleVat: number;
    netVat: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

/**
 * Arrondit un montant à 2 décimales.
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Retourne le nom français d'un mois.
 */
function monthLabel(month: number): string {
  const labels = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  return labels[month - 1] ?? `Mois ${month}`;
}

/**
 * Échappe une valeur pour le CSV (guillemets si nécessaire).
 */
function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Génère une chaîne CSV formatée à partir d'un export comptable structuré.
 *
 * Le CSV utilise le point-virgule (;) comme séparateur et inclut un en-tête
 * avec les métriques récapitulatives avant les lignes détaillées.
 *
 * @param exportData Données d'export comptable
 * @returns Chaîne CSV formatée
 */
export function generateCSV(exportData: AccountingExport): string {
  const lines: string[] = [];

  // En-tête récapitulatif
  lines.push(`Export comptable Delikréol - Période: ${exportData.period}`);
  lines.push('');
  lines.push(`Période;${exportData.period}`);
  lines.push(`Total commandes;${exportData.totalOrders}`);
  lines.push(`CA total TTC;${exportData.totalRevenue.toFixed(2)}`);
  lines.push(`Commissions;${exportData.totalCommissions.toFixed(2)}`);
  lines.push(`Remboursements;${exportData.totalRefunds.toFixed(2)}`);
  lines.push(`Frais livraison;${exportData.totalDeliveryFees.toFixed(2)}`);
  lines.push(`Reversements vendeurs;${exportData.totalVendorPayments.toFixed(2)}`);
  lines.push(`Reversements livreurs;${exportData.totalDriverPayments.toFixed(2)}`);
  lines.push(`Dépenses fournisseurs;${exportData.totalSupplierExpenses.toFixed(2)}`);
  lines.push(`TVA totale;${exportData.vatAmount.toFixed(2)}`);
  lines.push('');

  // En-tête des colonnes détaillées
  lines.push('Date;N° commande;Type;Libellé;Montant HT;TVA %;Montant TVA;Montant TTC;Devise');

  // Lignes détaillées
  for (const row of exportData.rows) {
    lines.push(
      [
        csvEscape(row.date),
        csvEscape(row.orderNumber),
        csvEscape(row.type),
        csvEscape(row.label),
        csvEscape(row.amountHt.toFixed(2)),
        csvEscape(row.tvaRate),
        csvEscape(row.tvaAmount.toFixed(2)),
        csvEscape(row.amountTtc.toFixed(2)),
        csvEscape(row.currency),
      ].join(';'),
    );
  }

  return lines.join('\n');
}

/**
 * Génère un rapport mensuel structuré à partir des données de rapprochement.
 *
 * @param year  Année (ex: 2026)
 * @param month Mois (1-12)
 * @returns Rapport mensuel structuré
 */
export function generateMonthlyReport(year: number, month: number): MonthlyReport {
  const { export: exportData } = generateMonthlyExport(year, month);

  const daysInPeriod = new Date(year, month, 0).getDate();

  const netBalance = round2(
    exportData.totalRevenue -
    exportData.totalVendorPayments -
    exportData.totalDriverPayments,
  );

  return {
    period: exportData.period,
    year,
    month,
    totalOrders: exportData.totalOrders,
    revenue: exportData.totalRevenue,
    commissions: exportData.totalCommissions,
    refunds: exportData.totalRefunds,
    deliveryFees: exportData.totalDeliveryFees,
    vendorPayments: exportData.totalVendorPayments,
    driverPayments: exportData.totalDriverPayments,
    vatCollected: exportData.vatAmount,
    netBalance,
    daysInPeriod,
  };
}

/**
 * Génère un récapitulatif annuel de TVA.
 *
 * Parcourt chaque mois de l'année, calcule la TVA collectée à partir
 * des transactions mockées, et produit un tableau récapitulatif avec
 * les totaux annuels.
 *
 * @param year Année (ex: 2026)
 * @returns Récapitulatif annuel de TVA
 */
export function generateVATSummary(year: number): VATSummary {
  const lines: VATSummaryLine[] = [];
  const annualTotals = {
    baseHt: 0,
    vat20: 0,
    vat10: 0,
    vat55: 0,
    totalVat: 0,
    deductibleVat: 0,
    netVat: 0,
  };

  for (let month = 1; month <= 12; month++) {
    const transactions: ReconciledTransaction[] = getAllTransactions();

    // Calcul de la base HT et TVA depuis les transactions du mois simulé
    // On répartit fictivement les transactions sur l'année
    const monthlyTransactions = transactions.filter((_, idx) => idx % 12 === (month - 1) % transactions.length);

    let baseHt = 0;
    let vat20 = 0;
    const vat10 = 0;
    const vat55 = 0;

    for (const tx of monthlyTransactions) {
      const ht = round2(tx.clientAmount / 1.2);
      baseHt = round2(baseHt + ht);
      vat20 = round2(vat20 + tx.clientAmount - ht);
    }

    const totalVat = round2(vat20 + vat10 + vat55);
    // TVA déductible estimée à 30% de la TVA collectée (simulation)
    const deductibleVat = round2(totalVat * 0.3);
    const netVat = round2(totalVat - deductibleVat);

    const line: VATSummaryLine = {
      month,
      monthLabel: monthLabel(month),
      baseHt,
      vat20,
      vat10,
      vat55,
      totalVat,
      deductibleVat,
      netVat,
    };

    lines.push(line);

    annualTotals.baseHt = round2(annualTotals.baseHt + baseHt);
    annualTotals.vat20 = round2(annualTotals.vat20 + vat20);
    annualTotals.vat10 = round2(annualTotals.vat10 + vat10);
    annualTotals.vat55 = round2(annualTotals.vat55 + vat55);
    annualTotals.totalVat = round2(annualTotals.totalVat + totalVat);
    annualTotals.deductibleVat = round2(annualTotals.deductibleVat + deductibleVat);
    annualTotals.netVat = round2(annualTotals.netVat + netVat);
  }

  return {
    year,
    lines,
    totals: annualTotals,
  };
}
