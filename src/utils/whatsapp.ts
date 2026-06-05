export const DELIKREOL_MAIN_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

export async function sendWhatsAppNotification(
  _phoneNumber: string,
  _templateName: string,
  _variables: Record<string, string> = {},
) {
  console.warn(
    '[DELIKREOL] WhatsApp API non active en mode gratuit. Utiliser les liens wa.me et valider les messages manuellement.',
  );
  return false;
}

export async function notifyOrderConfirmed(phoneNumber: string, order: any) {
  return sendWhatsAppNotification(phoneNumber, 'order_confirmation', {
    order_number: order.order_number,
    total: Number(order.total_amount || 0).toFixed(2),
    delivery_type: order.delivery_type === 'home_delivery' ? 'Livraison à domicile' : 'Retrait ou point relais à confirmer',
    estimated_time: 'Créneau à confirmer par le prestataire',
  });
}

export async function notifyOrderPreparing(phoneNumber: string, orderNumber: string) {
  return sendWhatsAppNotification(phoneNumber, 'order_preparing', {
    order_number: orderNumber,
  });
}

export async function notifyOrderReady(phoneNumber: string, orderNumber: string, message: string) {
  return sendWhatsAppNotification(phoneNumber, 'order_ready', {
    order_number: orderNumber,
    message,
  });
}

export async function notifyDriverAssigned(
  phoneNumber: string,
  orderNumber: string,
  driverName: string,
  driverPhone: string,
  eta: string,
) {
  return sendWhatsAppNotification(phoneNumber, 'driver_assigned', {
    order_number: orderNumber,
    driver_name: driverName,
    driver_phone: driverPhone,
    eta: eta || 'Heure estimée à confirmer',
  });
}

export async function notifyOrderDelivered(phoneNumber: string, orderNumber: string) {
  return sendWhatsAppNotification(phoneNumber, 'order_delivered', {
    order_number: orderNumber,
  });
}

export async function getWhatsAppMessages(_userId: string) {
  return [];
}

export function getWhatsAppBusinessLink(phoneNumber: string, message: string = '') {
  const cleanNumber = (phoneNumber || DELIKREOL_MAIN_WHATSAPP).replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
}

export function openWhatsAppChat(phoneNumber: string = DELIKREOL_MAIN_WHATSAPP, message: string = '') {
  const link = getWhatsAppBusinessLink(phoneNumber, message);
  window.open(link, '_blank', 'noopener,noreferrer');
}
