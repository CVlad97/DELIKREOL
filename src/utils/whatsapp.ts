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
export function waLink(phone: string | null | undefined, message: string): string {
  const clean = String(phone ?? '').replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Numéro au format attendu par wa.me : chiffres seuls, préfixe pays inclus.
 * Un numéro martiniquais saisi « 0696 17 80 00 » devient 596696178000 —
 * sans cette conversion, wa.me ouvre une conversation vers un numéro inconnu.
 */
export function toInternationalDigits(phone: string | null | undefined): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return `596${digits.slice(1)}`;
  return digits;
}

export interface PartnerOrderSummary {
  orderNumber: string;
  customerName?: string | null;
  commune?: string | null;
  mode?: string | null;
  totalAmount?: number | string | null;
  lines?: Array<{ product_name?: string | null; quantity?: number | null }>;
}

/** Message envoyé au traiteur pour qu'il prépare une commande. */
export function partnerOrderMessage(input: PartnerOrderSummary): string {
  const total = Number(input.totalAmount ?? 0);
  const items = (input.lines ?? [])
    .map((line) => `• ${Number(line.quantity ?? 1)} × ${line.product_name || 'Article'}`)
    .join('\n');
  const client = [input.customerName, input.commune].filter(Boolean).join(' · ');

  return [
    `DELIKREOL · Nouvelle commande ${input.orderNumber}`,
    items ? `\n${items}` : '',
    total > 0 ? `\nTotal : ${total.toFixed(2).replace('.', ',')} €` : '',
    client ? `Client : ${client}` : '',
    input.mode ? `Mode : ${input.mode}` : '',
    '\nMerci de confirmer la préparation en répondant à ce message.',
  ].filter(Boolean).join('\n');
}

/**
 * Lien « Envoyer au traiteur sur WhatsApp ». Renvoie `null` quand aucun numéro
 * exploitable n'est connu : mieux vaut pas de bouton qu'un lien qui ouvre une
 * conversation vide vers un destinataire inventé.
 */
export function partnerOrderWhatsappLink(
  phone: string | null | undefined,
  input: PartnerOrderSummary,
): string | null {
  const digits = toInternationalDigits(phone);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(partnerOrderMessage(input))}`;
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
