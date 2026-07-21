export interface Integration {
  enabled: boolean;
  label: string;
  description: string;
  configKey?: string;
  status: 'ready' | 'configured' | 'pending';
}

export interface IntegrationsConfig {
  stripe: Integration & { publicKey?: string };
  qonto: Integration & { apiBaseUrl?: string };
  revolut: Integration & { apiBaseUrl?: string };
  zapier: Integration & { webhookUrl?: string };
  make: Integration & { webhookUrl?: string };
  sheets: Integration & { apiBaseUrl?: string };
  openai: Integration & { apiKey?: string };
  crypto: Integration & {
    provider?: 'coinbase' | 'solana' | 'polygon';
    walletAddress?: string;
  };
}

export function isStripeTestPublicEnabled(flag: unknown, publicKey: unknown): boolean {
  return flag === 'true' && typeof publicKey === 'string' && publicKey.startsWith('pk_test_');
}

const stripePublicEnabled = isStripeTestPublicEnabled(
  import.meta.env.VITE_ENABLE_STRIPE_PUBLIC,
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
);

export const integrations: IntegrationsConfig = {
  stripe: {
    // Stripe public reste en mode test uniquement tant que le go-live n'est pas validé.
    enabled: stripePublicEnabled,
    label: 'Stripe (carte bancaire)',
    description: 'Paiement sécurisé Stripe en mode test uniquement',
    publicKey: stripePublicEnabled ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY : undefined,
    status: stripePublicEnabled ? 'configured' : 'pending',
  },
  qonto: {
    enabled: true,
    label: 'Qonto — Martinique 972',
    description: 'Compte pro Qonto pour DeliKreol · IBAN FR · Solo Premium (39€ HT) · Rapprochement auto commandes',
    apiBaseUrl: import.meta.env.VITE_QONTO_API_URL,
    status: 'configured',
  },
  revolut: {
    enabled: false,
    label: 'Revolut Business',
    description: 'Paiements internationaux et multi-devises',
    apiBaseUrl: import.meta.env.VITE_REVOLUT_API_URL,
    status: 'pending',
  },
  zapier: {
    enabled: false,
    label: 'Zapier',
    description: 'Automatisation des workflows',
    webhookUrl: import.meta.env.VITE_ZAPIER_WEBHOOK_URL,
    status: 'pending',
  },
  make: {
    enabled: false,
    label: 'Make (Integromat)',
    description: 'Automatisation avancée',
    webhookUrl: import.meta.env.VITE_MAKE_WEBHOOK_URL,
    status: 'pending',
  },
  sheets: {
    enabled: !!import.meta.env.VITE_SHEETS_PUBLIC_URL || !!import.meta.env.VITE_SHEETS_ORDERS_URL || !!import.meta.env.VITE_SHEETS_API_URL,
    label: 'Google Sheets',
    description: 'Catalogue public (source principale)',
    apiBaseUrl: import.meta.env.VITE_SHEETS_ORDERS_URL || import.meta.env.VITE_SHEETS_API_URL,
    status: (import.meta.env.VITE_SHEETS_PUBLIC_URL || import.meta.env.VITE_SHEETS_ORDERS_URL || import.meta.env.VITE_SHEETS_API_URL) ? 'configured' : 'pending',
  },
  openai: {
    enabled: false,
    label: 'OpenAI (proxy uniquement)',
    description: 'IA serveur/proxy uniquement. Aucune clé exposée côté frontend.',
    apiKey: undefined,
    status: 'pending',
  },
  crypto: {
    enabled: false,
    label: 'Crypto Wallet',
    description: 'Conversion points → tokens blockchain (Solana/Polygon)',
    provider: undefined,
    walletAddress: import.meta.env.VITE_CRYPTO_WALLET_ADDRESS,
    status: 'pending',
  },
};

export function getEnabledIntegrations(): Array<keyof IntegrationsConfig> {
  return Object.entries(integrations)
    .filter(([_, config]) => config.enabled)
    .map(([key]) => key as keyof IntegrationsConfig);
}

export function getIntegrationStatus(key: keyof IntegrationsConfig): string {
  const integration = integrations[key];
  if (!integration) return 'unknown';

  if (integration.enabled && integration.status === 'configured') {
    return '✅ Actif';
  }
  if (integration.enabled && integration.status === 'ready') {
    return '🟡 Prêt';
  }
  return '⏳ À configurer';
}
