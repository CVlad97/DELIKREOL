import { supabase } from '../lib/supabase';

interface CartItem {
  id: string;
  product_id: string;
  vendor_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderParams {
  customerId: string;
  items: CartItem[];
  deliveryType: 'home_delivery' | 'pickup' | 'relay_point';
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  relayPointId?: string;
  notes?: string;
}

export async function createOrder(params: CreateOrderParams) {
  const {
    customerId,
    items,
    deliveryType,
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    relayPointId,
    notes
  } = params;

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = deliveryType === 'home_delivery' ? 3.50 : 0;
  const totalAmount = subtotal + deliveryFee;

  const orderNumber = `DK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending',
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryLatitude,
        delivery_longitude: deliveryLongitude,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        notes: notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    for (const item of items) {
      const vendorCommission = item.price * item.quantity * 0.20;

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          vendor_id: item.vendor_id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          vendor_commission: vendorCommission
        });

      if (itemError) throw itemError;
    }

    const { error: deliveryError } = await supabase
      .from('deliveries')
      .insert({
        order_id: order.id,
        status: 'pending',
        pickup_address: deliveryAddress || 'Point relais',
        pickup_latitude: deliveryLatitude,
        pickup_longitude: deliveryLongitude,
        driver_fee: deliveryFee * 0.70,
        estimated_time: 30
      });

    if (deliveryError) throw deliveryError;

    if (deliveryType === 'relay_point' && relayPointId) {
      const depositQrCode = `DEPOSIT-${order.id}-${Date.now()}`;
      const pickupQrCode = `PICKUP-${order.id}-${Date.now()}`;

      const { error: depositError } = await supabase
        .from('relay_point_deposits')
        .insert({
          order_id: order.id,
          relay_point_id: relayPointId,
          vendor_id: items[0]?.vendor_id,
          deposit_qr_code: depositQrCode,
          pickup_qr_code: pickupQrCode,
          storage_type: 'cold',
          status: 'awaiting_deposit'
        });

      if (depositError) throw depositError;
    }

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        total_amount: totalAmount,
        vendor_amount: subtotal * 0.80,
        driver_amount: deliveryFee * 0.70,
        relay_point_amount: deliveryType === 'relay_point' ? 1.50 : 0,
        platform_commission: subtotal * 0.20 + (deliveryFee * 0.30),
        status: 'pending'
      });

    if (paymentError) throw paymentError;

    return { success: true, order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error };
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        ),
        delivery:deliveries(
          *,
          driver:drivers(*)
        ),
        payment:payments(*),
        deposit:relay_point_deposits(
          *,
          relay_point:relay_points(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return { success: false, error };
  }
}
