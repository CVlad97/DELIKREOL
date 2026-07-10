// DELIKREOL — Configuration multi-marché
// Détection pays par géolocalisation IP → langue, devise, TVA, règles locales
// Utilisation : un seul domaine delikreol.com pour le monde entier

export type CountryCode = 'MQ' | 'GP' | 'GF' | 'FR' | 'US' | 'CA' | 'GB' | 'DE' | 'ES' | 'PT' | 'JP' | 'BR' | 'NL' | 'IT' | 'CH' | 'BE' | 'OTHER';

export interface MarketConfig {
  country: CountryCode;
  lang: 'fr' | 'en' | 'kr' | 'es' | 'pt' | 'de' | 'ja' | 'nl' | 'it';
  currency: 'EUR' | 'USD' | 'GBP' | 'JPY' | 'BRL' | 'CAD' | 'CHF';
  currencySymbol: string;
  tvaRate: number;
  tvaLabel: string;
  timezone: string;
  locale: string;
  phoneFormat: string;
  deliveryNote: string;
  flag: string;
}

// ─── MAPPING PAYS → CONFIG ─────────────────────────────────
const COUNTRY_MARKET: Record<CountryCode, MarketConfig> = {
  MQ: { country: 'MQ', lang: 'fr', currency: 'EUR', currencySymbol: '€', tvaRate: 0.021, tvaLabel: 'TVA 2.1% (Martinique)', timezone: 'America/Martinique', locale: 'fr-MQ', phoneFormat: '+596 696 XX XX XX', deliveryNote: 'Livraison en Martinique — retrait, point relais ou livraison.', flag: '🇲🇶' },
  GP: { country: 'GP', lang: 'fr', currency: 'EUR', currencySymbol: '€', tvaRate: 0.085, tvaLabel: 'TVA 8.5% (Guadeloupe)', timezone: 'America/Guadeloupe', locale: 'fr-GP', phoneFormat: '+590 690 XX XX XX', deliveryNote: 'Livraison en Guadeloupe.', flag: '🇬🇵' },
  GF: { country: 'GF', lang: 'fr', currency: 'EUR', currencySymbol: '€', tvaRate: 0.085, tvaLabel: 'TVA 8.5% (Guyane)', timezone: 'America/Cayenne', locale: 'fr-GF', phoneFormat: '+594 694 XX XX XX', deliveryNote: 'Livraison en Guyane.', flag: '🇬🇫' },
  FR: { country: 'FR', lang: 'fr', currency: 'EUR', currencySymbol: '€', tvaRate: 0.20, tvaLabel: 'TVA 20% (France)', timezone: 'Europe/Paris', locale: 'fr-FR', phoneFormat: '06 XX XX XX XX', deliveryNote: 'Livraison en France métropolitaine.', flag: '🇫🇷' },
  US: { country: 'US', lang: 'en', currency: 'USD', currencySymbol: '$', tvaRate: 0, tvaLabel: 'No VAT', timezone: 'America/New_York', locale: 'en-US', phoneFormat: '+1 XXX XXX XXXX', deliveryNote: 'Delivery in the US.', flag: '🇺🇸' },
  CA: { country: 'CA', lang: 'en', currency: 'CAD', currencySymbol: 'C$', tvaRate: 0.05, tvaLabel: 'GST 5% (Canada)', timezone: 'America/Toronto', locale: 'en-CA', phoneFormat: '+1 XXX XXX XXXX', deliveryNote: 'Delivery in Canada.', flag: '🇨🇦' },
  GB: { country: 'GB', lang: 'en', currency: 'GBP', currencySymbol: '£', tvaRate: 0.20, tvaLabel: 'VAT 20% (UK)', timezone: 'Europe/London', locale: 'en-GB', phoneFormat: '+44 7XXX XXXXXX', deliveryNote: 'Delivery in the UK.', flag: '🇬🇧' },
  DE: { country: 'DE', lang: 'de', currency: 'EUR', currencySymbol: '€', tvaRate: 0.19, tvaLabel: 'MwSt 19% (Deutschland)', timezone: 'Europe/Berlin', locale: 'de-DE', phoneFormat: '+49 1XX XXXXXXX', deliveryNote: 'Lieferung in Deutschland.', flag: '🇩🇪' },
  ES: { country: 'ES', lang: 'es', currency: 'EUR', currencySymbol: '€', tvaRate: 0.21, tvaLabel: 'IVA 21% (España)', timezone: 'Europe/Madrid', locale: 'es-ES', phoneFormat: '+34 6XX XXX XXX', deliveryNote: 'Entrega en España.', flag: '🇪🇸' },
  JP: { country: 'JP', lang: 'ja', currency: 'JPY', currencySymbol: '¥', tvaRate: 0.10, tvaLabel: '消費税 10% (日本)', timezone: 'Asia/Tokyo', locale: 'ja-JP', phoneFormat: '+81 90 XXXX XXXX', deliveryNote: '日本国内配送。', flag: '🇯🇵' },
  BR: { country: 'BR', lang: 'pt', currency: 'BRL', currencySymbol: 'R$', tvaRate: 0.17, tvaLabel: 'ICMS 17% (Brasil)', timezone: 'America/Sao_Paulo', locale: 'pt-BR', phoneFormat: '+55 XX XXXXX XXXX', deliveryNote: 'Entrega no Brasil.', flag: '🇧🇷' },
  NL: { country: 'NL', lang: 'nl', currency: 'EUR', currencySymbol: '€', tvaRate: 0.21, tvaLabel: 'BTW 21% (Nederland)', timezone: 'Europe/Amsterdam', locale: 'nl-NL', phoneFormat: '+31 6 XXXXXXXX', deliveryNote: 'Bezorging in Nederland.', flag: '🇳🇱' },
  PT: { country: 'PT', lang: 'pt', currency: 'EUR', currencySymbol: '€', tvaRate: 0.23, tvaLabel: 'IVA 23% (Portugal)', timezone: 'Europe/Lisbon', locale: 'pt-PT', phoneFormat: '+351 9XX XXX XXX', deliveryNote: 'Entrega em Portugal.', flag: '🇵🇹' },
  IT: { country: 'IT', lang: 'it', currency: 'EUR', currencySymbol: '€', tvaRate: 0.22, tvaLabel: 'IVA 22% (Italia)', timezone: 'Europe/Rome', locale: 'it-IT', phoneFormat: '+39 3XX XXX XXXX', deliveryNote: 'Consegna in Italia.', flag: '🇮🇹' },
  CH: { country: 'CH', lang: 'de', currency: 'CHF', currencySymbol: 'CHF', tvaRate: 0.081, tvaLabel: 'MwSt 8.1% (Schweiz)', timezone: 'Europe/Zurich', locale: 'de-CH', phoneFormat: '+41 7X XXX XX XX', deliveryNote: 'Lieferung in der Schweiz.', flag: '🇨🇭' },
  BE: { country: 'BE', lang: 'fr', currency: 'EUR', currencySymbol: '€', tvaRate: 0.21, tvaLabel: 'TVA 21% (Belgique)', timezone: 'Europe/Brussels', locale: 'fr-BE', phoneFormat: '+32 4XX XX XX XX', deliveryNote: 'Livraison en Belgique.', flag: '🇧🇪' },
  OTHER: { country: 'OTHER', lang: 'en', currency: 'USD', currencySymbol: '$', tvaRate: 0, tvaLabel: 'Taxes may apply', timezone: 'UTC', locale: 'en-US', phoneFormat: 'Contact us', deliveryNote: 'International delivery — contact us.', flag: '🌍' },
};

// ─── DÉTECTION PAYS ─────────────────────────────────────────
let detectedCountry: CountryCode = 'OTHER';
let detectionDone = false;

export function detectCountry(): MarketConfig {
  if (detectionDone) return COUNTRY_MARKET[detectedCountry];

  // 1. Surcharge via localStorage (admin/test)
  try {
    const override = localStorage.getItem('delikreol_market_override') as CountryCode | null;
    if (override && COUNTRY_MARKET[override]) {
      detectedCountry = override;
      detectionDone = true;
      return COUNTRY_MARKET[override];
    }
  } catch {}

  // 2. Détection via Cloudflare (en-tête Cf-Ipcountry)
  const cfCountry = (document.querySelector('meta[name="cf-country"]') as HTMLMetaElement)?.content;
  if (cfCountry && COUNTRY_MARKET[cfCountry as CountryCode]) {
    detectedCountry = cfCountry as CountryCode;
    detectionDone = true;
    return COUNTRY_MARKET[detectedCountry];
  }

  // 3. Fallback : navigator.language
  const navLang = navigator.language || '';
  if (navLang.startsWith('fr')) {
    // France métropole par défaut, sauf si on détecte DOM-TOM
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Martinique')) detectedCountry = 'MQ';
    else if (tz.includes('Guadeloupe')) detectedCountry = 'GP';
    else if (tz.includes('Cayenne')) detectedCountry = 'GF';
    else detectedCountry = 'FR';
  } else if (navLang.startsWith('de')) detectedCountry = 'DE';
  else if (navLang.startsWith('es')) detectedCountry = 'ES';
  else if (navLang.startsWith('ja')) detectedCountry = 'JP';
  else if (navLang.startsWith('pt')) detectedCountry = 'BR';
  else if (navLang.startsWith('nl')) detectedCountry = 'NL';
  else if (navLang.startsWith('it')) detectedCountry = 'IT';
  else detectedCountry = 'US'; // English fallback

  detectionDone = true;
  return COUNTRY_MARKET[detectedCountry];
}

// ─── API EXPORT ─────────────────────────────────────────────
export function getMarket(): MarketConfig {
  return detectCountry();
}

export function setMarketOverride(country: CountryCode) {
  try {
    localStorage.setItem('delikreol_market_override', country);
    detectedCountry = country;
    detectionDone = true;
  } catch {}
}

export function formatPrice(amount: number): string {
  const market = getMarket();
  return `${amount.toFixed(2)} ${market.currencySymbol}`;
}

export function getDeliveryNotice(): string {
  return getMarket().deliveryNote;
}

export function getTvaInfo(): { rate: number; label: string } {
  const market = getMarket();
  return { rate: market.tvaRate, label: market.tvaLabel };
}