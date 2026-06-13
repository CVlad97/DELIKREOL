// DELIKREOL — Coordination WhatsApp traiteur ↔ livreur
// Canal temporaire via wa.me (pas d'API WhatsApp Cloud)
// Les échanges sont loggés dans Supabase table delivery_communications

export const DELIKREOL_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

/** Génère un lien wa.me */
function waLink(phone: string, msg: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}

/** Formate un numéro Martinique */
function formatPhone(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^0/, '596');
}

// ─── MESSAGES TRAITEUR → LIVREUR ───

export function partnerToDriverMessage(
  orderNumber: string,
  partnerName: string,
  clientCommune: string,
  clientPhone: string,
  readyAt: string,
): string {
  return `DELIKREOL - Nouvelle livraison à préparer

Commande : ${orderNumber}
Traiteur : ${partnerName}
Client : ${clientCommune} — ${clientPhone}
Prêt à : ${readyAt}

Veuillez confirmer votre disponibilité.

Merci 🙏`;
}

export function partnerToDriverLink(
  driverPhone: string,
  orderNumber: string,
  partnerName: string,
  clientCommune: string,
  clientPhone: string,
  readyAt: string,
): string {
  return waLink(
    driverPhone,
    partnerToDriverMessage(orderNumber, partnerName, clientCommune, clientPhone, readyAt),
  );
}

// ─── MESSAGES LIVREUR → TRAITEUR ───

export function driverToPartnerMessage(
  orderNumber: string,
  driverName: string,
  estimatedArrival: string,
): string {
  return `DELIKREOL - Confirmation livreur

Commande : ${orderNumber}
Livreur : ${driverName}
Arrivée estimée : ${estimatedArrival}

Je confirme la prise en charge de la livraison.

Merci 🙏`;
}

export function driverToPartnerLink(
  partnerPhone: string,
  orderNumber: string,
  driverName: string,
  estimatedArrival: string,
): string {
  return waLink(
    partnerPhone,
    driverToPartnerMessage(orderNumber, driverName, estimatedArrival),
  );
}

// ─── NOTIFICATIONS COORDINATION ───

export function driverNeededNotification(
  orderNumber: string,
  commune: string,
  earning: number,
): string {
  return `🚚 DELIKREOL — Livreur recherché

Commande : ${orderNumber}
Zone : ${commune}
Gain livreur : ${earning.toFixed(2)} €

Cliquez pour voir les détails : https://cvlad97.github.io/DELIKREOL/statut-commande?order=${orderNumber}`;
}

export function driverNeededLink(
  driverPhone: string,
  orderNumber: string,
  commune: string,
  earning: number,
): string {
  return waLink(driverPhone, driverNeededNotification(orderNumber, commune, earning));
}

// ─── MESSES COLLECTE / RETRAIT ───

export function readyForPickupMessage(
  orderNumber: string,
  partnerName: string,
  partnerAddress: string,
  pickupTime: string,
): string {
  return `DELIKREOL ─ Commande prête

Commande : ${orderNumber}
Traiteur : ${partnerName}
Adresse : ${partnerAddress}
Prête à : ${pickupTime}

Merci de vous présenter au retrait. 🙏`;
}

export function readyForPickupLink(
  clientPhone: string,
  orderNumber: string,
  partnerName: string,
  partnerAddress: string,
  pickupTime: string,
): string {
  return waLink(
    clientPhone,
    readyForPickupMessage(orderNumber, partnerName, partnerAddress, pickupTime),
  );
}

// ─── HELPER LOG DANS SUPABASE ───

export interface DeliveryCommsLog {
  order_number: string;
  from_type: 'partner' | 'driver' | 'coordinator';
  from_name: string;
  to_type: 'partner' | 'driver' | 'client';
  to_phone: string;
  message_type: 'driver_needed' | 'pickup_ready' | 'driver_confirmed' | 'en_route' | 'delivered' | 'issue';
  wa_link: string;
  status?: 'sent' | 'pending' | 'failed';
}

export function buildCommsLog(entry: DeliveryCommsLog): DeliveryCommsLog {
  return { status: 'pending', ...entry };
}

// ─── FORMAT NUMÉRO — AFFICHAGE SÉCURISÉ ───

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 6) return phone;
  return clean.slice(0, 4) + 'XX' + clean.slice(-2);
}

export function getWhatsAppPhoneLink(phone: string, message: string): string {
  return waLink(phone, message);
}