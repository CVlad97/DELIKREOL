/**
 * Construction de message WhatsApp pour demande événementielle.
 * N'envoie jamais de message réel — génère uniquement une URL pré-remplie.
 * @module eventVenueWhatsApp
 */

export interface EventRequestData {
  venueName: string;
  commune: string;
  date: string;
  time: string;
  eventType: string;
  guestCount: number;
  needCaterer: boolean;
  needDelivery: boolean;
  needSetup: boolean;
  needBeverages: boolean;
  needServiceStaff: boolean;
  comment: string;
}

const WHATSAPP_NUMBER = '596696653589';

/**
 * Construit le message texte pour une demande événementielle.
 */
export function buildEventWhatsAppMessage(data: EventRequestData): string {
  const lines: string[] = [
    'DELIKREOL — Demande événementielle',
    '',
    `Lieu : ${data.venueName}`,
    `Commune : ${data.commune}`,
    `Date : ${data.date || 'À préciser'}`,
    `Heure : ${data.time || 'À préciser'}`,
    `Type d'événement : ${data.eventType || 'À préciser'}`,
    `Nombre d'invités : ${data.guestCount > 0 ? data.guestCount : 'À préciser'}`,
    `Besoin traiteur : ${data.needCaterer ? 'Oui' : 'Non'}`,
    `Besoin livraison : ${data.needDelivery ? 'Oui' : 'Non'}`,
    `Besoin installation : ${data.needSetup ? 'Oui' : 'Non'}`,
    `Besoin boissons : ${data.needBeverages ? 'Oui' : 'Non'}`,
    `Personnel de service : ${data.needServiceStaff ? 'Oui' : 'Non'}`,
    data.comment ? `Commentaire : ${data.comment}` : '',
    '',
    'Statut : demande à confirmer',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Construit l'URL WhatsApp pré-remplie (wa.me).
 */
export function buildEventWhatsAppUrl(data: EventRequestData): string {
  const message = buildEventWhatsAppMessage(data);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Vérifie qu'aucune donnée sensible n'est présente dans le message.
 */
export function containsSensitiveData(message: string): boolean {
  const sensitivePatterns = [
    /sk_live_/i, // Stripe secret
    /sk_test_/i, // Stripe test
    /sb_secret_/i, // Supabase secret
    /service_role/i, // Supabase service role
    /password/i,
    /api_key/i,
    /secret/i,
    /token/i,
    /iban/i,
    /bic/i,
  ];
  return sensitivePatterns.some((p) => p.test(message));
}
