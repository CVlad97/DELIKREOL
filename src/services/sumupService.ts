// DELIKREOL — Service SumUp
// Statut : framework créé, NON ACTIVÉ sans clé publique valide (règle stricte)
// Activation conditionnelle : VITE_SUMUP_PUBLIC_KEY présent
// Aucun secret, aucune clé réelle dans ce dépôt

export interface SumUpCheckoutPayload {
  amount: number; // en centimes (ex: 999 = 9,99 €)
  currency: 'EUR';
  merchant_code: string;
  reference: string; // format SUMUP-XXXX
  description?: string;
  card?: {
    number?: string;
    expiry?: string;
    cvv?: string;
  };
}

export interface SumUpCheckoutResponse {
  transaction_code: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  status_code: string;
  amount: number;
  currency: string;
  reference: string;
}

export interface SumUpWebHookPayload {
  transaction_code: string;
  amount: number;
  currency: string;
  reference: string;
  merchant_code: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  status_code: string;
  timestamp?: string;
  client_reference?: string;
}

// Validation du fournisseur (manual / disabled selon clé)
// NOTE : import.meta.env fonctionne dans le pipeline Vite (build).
// Le check standalone 'node --check' échoue sur import.meta — c'est normal.
export function isSumUpEnabled(): boolean {
  return !!(import.meta.env?.VITE_SUMUP_PUBLIC_KEY);
}

// Création du checkout (framework — pas d'appel réel sans clé)
export async function createSumUpCheckout(payload: SumUpCheckoutPayload): Promise<{ success: boolean; data?: SumUpCheckoutResponse; error?: string }> {
  if (!isSumUpEnabled()) {
    return { success: false, error: 'SumUp non activé : VITE_SUMUP_PUBLIC_KEY manquante (règle sécurisée)' };
  }
  // TODO : appel API SumUp — bloqué volontairement tant que clé sandbox non validée
  return { success: false, error: 'Checkout SumUp : module framework présent, activation requise après validation clé' };
}

// Vérification paiement par transaction
export async function verifySumUpPayment(transactionCode: string): Promise<{ success: boolean; paid?: boolean; error?: string }> {
  if (!isSumUpEnabled()) {
    return { success: false, error: 'SumUp non activé' };
  }
  // TODO : appel API de vérification — nécessitera clé + endpoint sandbox
  return { success: false, error: 'verifySumUpPayment : framework présent, pas d\'appel réseau sans clé' };
}

// Traitement webhook (endpoint à intégrer côté serveur — pas de clé dans le dépôt)
export function handleSumUpWebhook(payload: SumUpWebHookPayload): { status: string; updatedAt: string } | null {
  if (!isSumUpEnabled()) return null;
  // Mise à jour du statut via Supabase — pas implémenté tant que la clé n\'est pas validée
  const status = payload.status === 'PAID' ? 'paid' : payload.status === 'FAILED' ? 'failed' : 'pending';
  return { status, updatedAt: new Date().toISOString() };
}

// Référence de paiement formatée (déjà dans paymentProviders)
export function buildSumUpReference(orderId: string): string {
  return `SUMUP-${orderId}`;
}

