// WhatsApp Business — DeliKreol
// Canal principal de commande, devis et validation partenaire
// Tous les liens utilisent wa.me (gratuit) avec messages pré-remplis

export const DELIKREOL_MAIN_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
export const DELIVERY_THRESHOLD = 40;
export const DELIVERY_NOTICE = `Livraison éloignée possible à partir de ${DELIVERY_THRESHOLD} € de commande, selon validation du prestataire et disponibilité DeliKreol.`;

/** Génère un lien WhatsApp avec message pré-rempli */
export function waLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/** Lien vers le numéro principal DeliKreol */
export function delikreolWaLink(message: string): string {
  return waLink(DELIKREOL_MAIN_WHATSAPP, message);
}

// ──────────────────────────────────────────────
// GÉNÉRATEURS DE MESSAGES
// ──────────────────────────────────────────────

/** Message d'accueil WhatsApp Business */
export const WELCOME_MESSAGE = `Bonjour 👋 Bienvenue sur DeliKreol.

Vous pouvez nous écrire pour :
1. Commander un plat
2. Demander un devis traiteur
3. Devenir partenaire
4. Proposer un service de livraison
5. Devenir point relais

Envoyez simplement votre demande, votre commune et le créneau souhaité. On vous répond rapidement.`;

/** Message d'absence WhatsApp Business */
export const AWAY_MESSAGE = `Merci pour votre message 🙏

Nous avons bien reçu votre demande DeliKreol. Nous vous répondrons dès que possible pour confirmer les disponibilités, les prix, le retrait ou la livraison.

Pour gagner du temps, envoyez :
• votre nom
• votre commune
• le plat ou le service souhaité
• le jour et l'heure
• livraison ou retrait`;

/** Commande générique */
export function commandeMessage(clientName: string, commune: string, items: { name: string; qty: number; price: number }[], total: number, mode: 'retrait' | 'livraison', creneau: string): string {
  let msg = `Bonjour 👋 Nouvelle commande DeliKreol.

Client : ${clientName}
Commune : ${commune}
Type : ${mode}
Créneau : ${creneau}

Produits :
${items.map(i => `• ${i.qty}x ${i.name} — ${(i.price * i.qty).toFixed(2)}€`).join('\n')}

Total : ${total.toFixed(2)} €

${mode === 'livraison' ? `\n${DELIVERY_NOTICE}` : ''}

Merci de confirmer la disponibilité avec le prestataire.`;
  return msg;
}

/** Commande chez un traiteur spécifique */
export function commandeTraiteurMessage(traiteurName: string): string {
  return `Bonjour DeliKreol, je souhaite commander chez ${traiteurName}. Pouvez-vous me donner les disponibilités et les prix ?`;
}

/** Devis traiteur */
export function devisMessage(eventType: string, date: string, commune: string, guests: number, budget: string, message: string): string {
  return `Bonjour 👋 Pour mon devis traiteur :

📅 Date : ${date}
📍 Commune : ${commune}
👥 Personnes : ${guests}
💰 Budget : ${budget} €
🎉 Type : ${eventType}

Message : ${message || '—'}

Merci de me faire une proposition adaptée.`;
}

/** Candidature partenaire */
export function partenaireMessage(businessName: string, commune: string, cuisineType: string, prix: string): string {
  return `Bonjour 👋 Je souhaite devenir partenaire DeliKreol.

Activité : ${businessName}
Commune : ${commune}
Type de cuisine : ${cuisineType}
Prix moyens : ${prix} €

Je joins mes photos et horaires.`;
}

/** Candidature livreur */
export function livreurMessage(name: string, commune: string, zones: string, transport: string, disponibilites: string): string {
  return `Bonjour 👋 Je souhaite devenir livreur DeliKreol.

Nom : ${name}
Commune : ${commune}
Zones : ${zones}
Transport : ${transport}
Disponibilités : ${disponibilites}`;
}

/** Candidature point relais */
export function relaisMessage(placeName: string, commune: string, address: string, horaires: string): string {
  return `Bonjour 👋 Je souhaite devenir point relais DeliKreol.

Lieu : ${placeName}
Commune : ${commune}
Adresse : ${address}
Horaires : ${horaires}`;
}

/** Validation fiche partenaire */
export function validationMessage(partnerName: string): string {
  return `Bonjour 👋 Je prépare votre fiche partenaire DeliKreol avant publication.

Pouvez-vous vérifier :
1. Les photos
2. Les plats
3. Les prix
4. La bio
5. Les horaires
6. Le retrait / livraison

Dites-moi simplement : OK pour publication, ou envoyez les corrections.`;
}

// ──────────────────────────────────────────────
// OPEN WHATSAPP (ouvre dans un nouvel onglet)
// ──────────────────────────────────────────────
export function openWhatsApp(phone: string = DELIKREOL_MAIN_WHATSAPP, message: string = '') {
  window.open(waLink(phone, message), '_blank', 'noopener,noreferrer');
}

// ──────────────────────────────────────────────
// STUBS — pour compatibilité avec le code existant
// ──────────────────────────────────────────────
export async function sendWhatsAppNotification(_phone: string, _template: string, _vars: Record<string, string> = {}) {
  console.warn('[DELIKREOL] WhatsApp API non active. Utiliser wa.me.');
  return false;
}

export async function notifyOrderConfirmed(_phone: string, _order: any) {
  return sendWhatsAppNotification(_phone, 'order_confirmation');
}

export async function getWhatsAppMessages(_userId: string) {
  return [];
}

export function getWhatsAppBusinessLink(phone: string, message: string = '') {
  return waLink(phone, message);
}