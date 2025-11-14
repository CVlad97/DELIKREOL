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

export const integrations: IntegrationsConfig = {
  stripe: {
    enabled: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    label: 'Stripe',
    description: 'Paiements en ligne sécurisés',
    publicKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    status: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'configured' : 'pending',
  },
  qonto: {
    enabled: false,
    label: 'Qonto',
    description: 'Compte professionnel et gestion financière',
    apiBaseUrl: import.meta.env.VITE_QONTO_API_URL,
    status: 'pending',
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
    enabled: false,
    label: 'Google Sheets',
    description: 'Export et synchronisation des données',
    apiBaseUrl: import.meta.env.VITE_SHEETS_API_URL,
    status: 'pending',
  },
  openai: {
    enabled: !!import.meta.env.VITE_OPENAI_API_KEY,
    label: 'OpenAI',
    description: 'Intelligence artificielle et copilot admin',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    status: import.meta.env.VITE_OPENAI_API_KEY ? 'configured' : 'pending',
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
