// DELIKREOL — Bitstack Model : arrondis centimes → BTC
// Inspiré de Bitstack (FR) : https://bitstack-app.com
// Principe : arrondir chaque paiement au centime supérieur, collecter la différence, convertir en BTC

export interface RoundUpConfig {
  enabled: boolean;
  method: 'centime_sup' | 'euro_sup' | 'pourcentage';
  percentageValue?: number; // 1 = 1%, 0.5 = 0.5%
  maxRoundUpPerTransaction: number; // 10 = max 10€ arrondi par transaction
  minOrderAmount: number; // 5 = minimum 5€ pour activer l'arrondi
  btcAddress: string; // adresse de collecte BTC
  exchangeProvider: 'binance' | 'coinbase' | 'moonpay' | 'manual';
  conversionFrequency: 'instant' | 'daily' | 'weekly' | 'monthly';
  cumulativeThreshold: number; // conversion quand le total atteint ce montant (ex: 10€)
}

export interface RoundUpTransaction {
  id: string;
  orderId: string;
  originalAmount: number;
  roundedAmount: number;
  roundUpAmount: number;
  currency: string;
  project: 'delikreol' | 'ikabay' | 'kaygo' | 'irchestrator' | 'anbaybot';
  btcEquivalent: number;
  btcAddress: string;
  status: 'collected' | 'converted' | 'sent';
  createdAt: string;
  convertedAt?: string;
}

const DEFAULT_CONFIG: RoundUpConfig = {
  enabled: true,
  method: 'centime_sup',
  maxRoundUpPerTransaction: 10,
  minOrderAmount: 5,
  btcAddress: '', // à configurer par l'admin
  exchangeProvider: 'coinbase',
  conversionFrequency: 'weekly',
  cumulativeThreshold: 10,
};

let config: RoundUpConfig = { ...DEFAULT_CONFIG };

export function setRoundUpConfig(c: Partial<RoundUpConfig>) {
  config = { ...config, ...c };
}

export function getRoundUpConfig(): RoundUpConfig {
  return { ...config };
}

// ─── CALCUL DE L'ARRONDI ────────────────────────────────────
export function calculateRoundUp(amount: number): number {
  if (amount < config.minOrderAmount) return 0;

  let roundUp = 0;
  switch (config.method) {
    case 'centime_sup':
      // Arrondir au centime supérieur : 14.32 → 15.00, diff = 0.68
      roundUp = Math.ceil(amount) - amount;
      break;
    case 'euro_sup':
      // Arrondir à l'euro supérieur : 14.32 → 15.00, diff = 0.68
      roundUp = Math.ceil(amount) - amount;
      break;
    case 'pourcentage':
      roundUp = amount * ((config.percentageValue || 1) / 100);
      break;
  }

  return Math.min(roundUp, config.maxRoundUpPerTransaction);
}

// ─── ESTIMATION BTC ─────────────────────────────────────────
// Taux BTC simulé (à remplacer par API réelle CoinGecko/Coinbase)
let simulatedBtcRate = 65000; // 1 BTC = 65 000 EUR

export function setBtcRate(rate: number) { simulatedBtcRate = rate; }

export function estimateBtcAmount(eurAmount: number): number {
  if (simulatedBtcRate <= 0) return 0;
  return eurAmount / simulatedBtcRate;
}

// ─── STOCKAGE LOCAL ─────────────────────────────────────────
function getStorageKey(project: string): string {
  return `delikreol_roundups_${project}`;
}

export function getSavedTransactions(project: string): RoundUpTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(project)) || '[]');
  } catch {
    return [];
  }
}

export function saveTransaction(tx: RoundUpTransaction) {
  const existing = getSavedTransactions(tx.project);
  existing.push(tx);
  localStorage.setItem(getStorageKey(tx.project), JSON.stringify(existing));
}

// ─── STATISTIQUES MULTI-PROJETS ─────────────────────────────
export interface RoundUpStats {
  totalCollected: number;
  totalBtc: number;
  totalTransactions: number;
  projectsBreakdown: Record<string, { collected: number; btc: number; count: number }>;
  lastConversion: string | null;
  nextConversionEstimate: string;
}

export function getRoundUpStats(): RoundUpStats {
  const projects = ['delikreol', 'ikabay', 'kaygo', 'irchestrator', 'anbaybot'];
  const breakdown: Record<string, { collected: number; btc: number; count: number }> = {};
  let totalCollected = 0;
  let totalBtc = 0;
  let totalTx = 0;
  let lastConv: string | null = null;

  for (const proj of projects) {
    const txs = getSavedTransactions(proj);
    const collected = txs.reduce((s, t) => s + (t.status !== 'sent' ? t.roundUpAmount : 0), 0);
    const btc = txs.reduce((s, t) => s + t.btcEquivalent, 0);
    const count = txs.length;
    breakdown[proj] = { collected, btc, count };
    totalCollected += collected;
    totalBtc += btc;
    totalTx += count;

    const last = txs.filter(t => t.convertedAt).sort((a, b) => new Date(b.convertedAt!).getTime() - new Date(a.convertedAt!).getTime())[0];
    if (last && (!lastConv || last.convertedAt! > lastConv)) lastConv = last.convertedAt!;
  }

  return {
    totalCollected,
    totalBtc,
    totalTransactions: totalTx,
    projectsBreakdown: breakdown,
    lastConversion: lastConv,
    nextConversionEstimate: totalCollected >= config.cumulativeThreshold ? 'Prête' : `${(config.cumulativeThreshold - totalCollected).toFixed(2)} € manquants`,
  };
}

// ─── SIMULATION ──────────────────────────────────────────────
export function simulerArrondis(project: string, nombreCommandes: number, panierMoyen: number): RoundUpTransaction[] {
  const txs: RoundUpTransaction[] = [];
  for (let i = 0; i < nombreCommandes; i++) {
    const montant = panierMoyen + (Math.random() - 0.5) * 10;
    const arrondi = calculateRoundUp(montant);
    if (arrondi > 0) {
      txs.push({
        id: `sim-${project}-${i}`,
        orderId: `SIM-${i}`,
        originalAmount: Math.round(montant * 100) / 100,
        roundedAmount: Math.ceil(montant),
        roundUpAmount: Math.round(arrondi * 100) / 100,
        currency: 'EUR',
        project: project as any,
        btcEquivalent: estimateBtcAmount(arrondi),
        btcAddress: config.btcAddress || 'Non configurée',
        status: 'collected',
        createdAt: new Date().toISOString(),
      });
    }
  }
  return txs;
}

// ─── CONFIGURATION PAR PROJET ────────────────────────────────
export const PROJECT_BITSTACK_CONFIGS: Record<string, { enabled: boolean; method: RoundUpConfig['method']; percentageValue?: number }> = {
  delikreol: { enabled: true, method: 'centime_sup' },
  ikabay: { enabled: false, method: 'pourcentage', percentageValue: 0.5 },
  kaygo: { enabled: false, method: 'centime_sup' },
  irchestrator: { enabled: false, method: 'pourcentage', percentageValue: 1 },
  anbaybot: { enabled: false, method: 'centime_sup' },
};