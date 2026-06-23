export interface CookiePreferences {
  necessary: boolean;   // always true
  geolocation: boolean; // consentement explicite
  analytics: boolean;   // tendances (opt-in)
  marketing: boolean;   // refus par défaut
  hasMadeChoice: boolean;
  consentUpdatedAt?: string;
}

const COOKIE_KEY = 'delikreol_cookie_prefs';

export const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  geolocation: false,
  analytics: false,
  marketing: false,
  hasMadeChoice: false,
};

export function loadCookiePrefs(): CookiePreferences {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* empty */ }
  return DEFAULT_PREFS;
}

export function saveCookiePrefs(prefs: CookiePreferences): void {
  try {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ ...DEFAULT_PREFS, ...prefs, necessary: true, hasMadeChoice: true, consentUpdatedAt: new Date().toISOString() })
    );
  } catch { /* empty */ }
}

export function resetCookiePrefs(): void {
  try { localStorage.removeItem(COOKIE_KEY); } catch { /* empty */ }
}

export function hasConsented(loc: keyof CookiePreferences): boolean {
  return loadCookiePrefs()[loc] === true;
}

// RGPD textes
export const RGPD_NOTICE = `DELIKREOL utilise des informations pour améliorer votre expérience :
- Cookies nécessaires : fonctionnement du panier
- Géolocalisation : trouver les traiteurs et relais près de chez vous (avec votre accord)
- Analytics : améliorer le service (optionnel)
- Marketing : offres personnalisées (optionnel)

Vous pouvez gérer vos préférences à tout moment. Aucune donnée n'est vendue à des tiers.`;

export const GEOLOCATION_NOTICE = `DELIKREOL demande votre position pour :
1. Trouver les partenaires et points relais près de chez vous
2. Calculer la distance et le délai de livraison
3. Vous proposer le retrait, le relais ou la livraison le plus adapté

Votre position n'est pas stockée de façon permanente.
Vous pouvez refuser et choisir votre commune manuellement.

🔒 Aucune donnée de localisation n'est partagée avec des tiers.`;
