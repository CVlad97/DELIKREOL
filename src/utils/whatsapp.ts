import { supabase } from '../lib/supabase';

export async function sendWhatsAppNotification(
  phoneNumber: string,
  templateName: string,
  variables: Record<string, string> = {}
) {
  try {
    const { data: template } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();

    if (!template) {
      console.error(`Template ${templateName} not found`);
      return false;
    }

    let message = template.template_content;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const { data, error } = await supabase.functions.invoke('whatsapp-send', {
      body: {
        to: phoneNumber,
        message,
      },
    });

    if (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendWhatsAppNotification:', error);
    return false;
  }
}

export async function notifyOrderConfirmed(phoneNumber: string, order: any) {
  return sendWhatsAppNotification(phoneNumber, 'order_confirmation', {
    order_number: order.order_number,
    total: order.total_amount.toFixed(2),
    delivery_type: order.delivery_type === 'home_delivery' ? 'Livraison à domicile' : 'Point relais',
    estimated_time: '30-45 min',
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
  eta: string
) {
  return sendWhatsAppNotification(phoneNumber, 'driver_assigned', {
    order_number: orderNumber,
    driver_name: driverName,
    driver_phone: driverPhone,
    eta,
  });
}

export async function notifyOrderDelivered(phoneNumber: string, orderNumber: string) {
  return sendWhatsAppNotification(phoneNumber, 'order_delivered', {
    order_number: orderNumber,
  });
}

export async function getWhatsAppMessages(userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return [];
  }
}

export function getWhatsAppBusinessLink(phoneNumber: string, message: string = '') {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
}

export function openWhatsAppChat(phoneNumber: string, message: string = '') {
  const link = getWhatsAppBusinessLink(phoneNumber, message);
  window.open(link, '_blank');
}
