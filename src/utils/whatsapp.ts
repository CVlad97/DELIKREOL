// WhatsApp — DELIKREOL
// Canal de SUPPORT uniquement.
// La commande principale passe par le site et Supabase.
// WhatsApp sert uniquement pour :
// - aide si le client est bloqué
// - suivi d'une commande déjà créée
// - question partenaire/livreur/point relais
// - problème de paiement ou livraison

export const DELIKREOL_MAIN_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

/** Génère un lien WhatsApp avec message pré-rempli */
export function waLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/** Lien WhatsApp support DELIKREOL */
export function supportLink(orderId?: string): string {
  const msg = orderId
    ? `Bonjour, j'ai besoin d'aide pour ma commande ${orderId}.`
    : 'Bonjour, j\'ai besoin d\'aide sur DELIKREOL.';
  return waLink(DELIKREOL_MAIN_WHATSAPP, msg);
}

/** Message d'accueil WhatsApp — SUPPORT UNIQUEMENT */
export const WELCOME_MESSAGE = `Bonjour, bienvenue chez DELIKREOL.

Pour commander, utilisez le site.
Ce WhatsApp sert uniquement pour :
• aide si vous êtes bloqué
• suivi d'une commande déjà créée
• question partenaire/livreur/point relais
• problème de paiement ou livraison

Merci d'indiquer votre numéro de commande si vous en avez un.`;

/** Message d'absence */
export const AWAY_MESSAGE = `Merci pour votre message 🙏

Nous vous répondrons dès que possible.

Si vous avez besoin d'aide pour une commande existante, indiquez simplement votre numéro de commande.`;

// ──────────────────────────────────────────────
// SUPPORT — Messages pré-remplis
// ──────────────────────────────────────────────

export function supportOrderMessage(orderId: string): string {
  return `Bonjour, j'ai besoin d'aide pour ma commande ${orderId}.`;
}

export function supportPartnerMessage(partnerName: string): string {
  return `Bonjour, je suis partenaire ${partnerName} sur DELIKREOL. J'ai besoin d'aide pour ma fiche.`;
}

// ──────────────────────────────────────────────
// COMPAT — Anciens exports (dépréciés, gardés pour compat)
// ──────────────────────────────────────────────
export function getWhatsAppBusinessLink(phone: string, message: string = '') {
  return waLink(phone, message);
}

export function openWhatsAppChat(phone: string = DELIKREOL_MAIN_WHATSAPP, message: string = '') {
  window.open(waLink(phone, message), '_blank', 'noopener,noreferrer');
}

export async function sendWhatsAppNotification(_phone: string, _template: string, _vars: Record<string, string> = {}) {
  console.warn('[DELIKREOL] WhatsApp API non active. Utiliser wa.me pour le support.');
  return false;
}