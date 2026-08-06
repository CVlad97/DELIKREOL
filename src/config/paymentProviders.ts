export type PaymentProviderId =
  | 'qonto_transfer'
  | 'revolut_transfer'
  | 'cash_on_delivery'
  | 'crypto_wallet'
  | 'external_payment_link'
  | 'stripe_disabled';

export type PaymentStatus =
  | 'pending'
  | 'proof_submitted'
  | 'under_review'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentProvider = {
  id: PaymentProviderId;
  label: string;
  shortLabel: string;
  description: string;
  status: 'ready' | 'manual' | 'disabled';
  requiresProof?: boolean;
  requiresExternalId?: boolean;
  network?: 'polygon' | 'solana';
  accountName?: string;
  iban?: string;
  bic?: string;
  walletAddress?: string;
  paymentUrl?: string;
};

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'proof_submitted',
  'under_review',
  'paid',
  'failed',
  'refunded',
  'cancelled',
];

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'qonto_transfer',
    label: 'Virement Qonto',
    shortLabel: 'Qonto',
    description: 'Virement bancaire avec référence unique de commande. Validation manuelle admin.',
    status: 'manual',
    requiresProof: true,
    accountName: import.meta.env.VITE_QONTO_ACCOUNT_NAME || 'DELIKREOL',
    iban: import.meta.env.VITE_QONTO_IBAN || import.meta.env.VITE_BANK_IBAN || '',
    bic: import.meta.env.VITE_QONTO_BIC || import.meta.env.VITE_BANK_BIC || '',
  },
  {
    id: 'revolut_transfer',
    label: 'Virement Revolut Business',
    shortLabel: 'Revolut',
    description: 'Virement bancaire Revolut Business avec référence unique. Validation manuelle admin.',
    status: 'manual',
    requiresProof: true,
    accountName: import.meta.env.VITE_REVOLUT_ACCOUNT_NAME || 'DELIKREOL',
    iban: import.meta.env.VITE_REVOLUT_IBAN || '',
    bic: import.meta.env.VITE_REVOLUT_BIC || '',
  },
  {
    id: 'cash_on_delivery',
    label: 'Paiement à la livraison',
    shortLabel: 'Livraison',
    description: 'Paiement en espèces ou moyen accepté par le partenaire à la remise. À confirmer sur WhatsApp.',
    status: 'manual',
  },
  {
    id: 'crypto_wallet',
    label: 'Wallet crypto facultatif',
    shortLabel: 'Crypto',
    description: 'USDT Polygon prioritaire. Hash de transaction requis puis validation manuelle.',
    status: import.meta.env.VITE_CRYPTO_WALLET_ADDRESS ? 'manual' : 'disabled',
    requiresExternalId: true,
    network: (import.meta.env.VITE_CRYPTO_NETWORK || 'polygon') === 'solana' ? 'solana' : 'polygon',
    walletAddress: import.meta.env.VITE_CRYPTO_WALLET_ADDRESS || '',
  },
  {
    id: 'external_payment_link',
    label: 'Lien de paiement externe',
    shortLabel: 'Lien externe',
    description: 'Lien généré manuellement par l’équipe ou le partenaire. Aucun paiement automatisé côté site.',
    status: import.meta.env.VITE_EXTERNAL_PAYMENT_URL ? 'manual' : 'disabled',
    paymentUrl: import.meta.env.VITE_EXTERNAL_PAYMENT_URL || '',
  },
  {
    id: 'stripe_disabled',
    label: 'Stripe désactivé',
    shortLabel: 'Stripe OFF',
    description: 'Stripe est conservé derrière feature flag, non proposé au client en production.',
    status: 'disabled',
  },
];

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  return PAYMENT_PROVIDERS.find((provider) => provider.id === id) || PAYMENT_PROVIDERS[0];
}

export function isCustomerSelectablePaymentProvider(id: PaymentProviderId): boolean {
  return getPaymentProvider(id).status !== 'disabled' && id !== 'stripe_disabled';
}

export function buildPaymentReference(orderNumber: string, providerId: PaymentProviderId): string {
  const prefix = providerId === 'qonto_transfer' ? 'QONTO'
    : providerId === 'revolut_transfer' ? 'REVOLUT'
      : providerId === 'crypto_wallet' ? 'CRYPTO'
        : providerId === 'cash_on_delivery' ? 'COD'
          : 'EXT';
  return `${prefix}-${orderNumber}`;
}
