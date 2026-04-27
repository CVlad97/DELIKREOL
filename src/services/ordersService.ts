import { Order, OrderItem } from '../types';
import { readDemoOrders, writeDemoOrders, seedDemoData } from '../data/demoDb';
import { supabase, isDemoMode } from '../lib/supabase';
import { erpRequest, isErpConfigured } from '../lib/erpClient';

export interface OrderItemInput {
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  vendor_commission: number;
}

export interface CreateOrderInput extends Partial<Omit<Order, 'items'>> {
  items?: OrderItemInput[];
}

export interface OrdersService {
  listAll(): Promise<Order[]>;
  listByUser(userId: string): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(order: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: string): Promise<Order | null>;
}

class DemoOrdersService implements OrdersService {
  constructor() {
    seedDemoData();
  }
  async listAll() {
    return readDemoOrders();
  }
  async listByUser(userId: string) {
    return readDemoOrders().filter((o) => o.customer_id === userId);
  }
  async getById(id: string) {
    return readDemoOrders().find((o) => o.id === id) ?? null;
  }
  async create(order: CreateOrderInput) {
    const all = readDemoOrders();
    const id = 'o_' + Date.now().toString();
    const newOrder: Order = {
      id,
      customer_id: order.customer_id || 'demo_customer',
      order_number: order.order_number || 'DLK-' + Math.floor(Math.random() * 9000 + 1000).toString(),
      status: (order.status as any) || 'pending',
      delivery_type: (order.delivery_type as any) || 'home_delivery',
      delivery_fee: order.delivery_fee ?? 0,
      total_amount: order.total_amount ?? 0,
      created_at: new Date().toISOString(),
      items: (order.items as OrderItem[]) || [],
    } as Order;
    all.unshift(newOrder);
    writeDemoOrders(all);
    return newOrder;
  }
  async updateStatus(id: string, status: string) {
    const all = readDemoOrders();
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    all[idx].status = status as any;
    writeDemoOrders(all);
    return all[idx];
  }
}

const demoOrdersFallback = new DemoOrdersService();
const allowDemoFallback = import.meta.env.VITE_ERP_FALLBACK_DEMO !== 'false';

class ErpOrdersService implements OrdersService {
  private mapOrder(row: any): Order {
    return {
      id: row.id,
      customer_id: row.customerId ?? '',
      order_number: row.orderNumber ?? '',
      status: row.status ?? 'pending',
      delivery_type: row.deliveryType ?? 'home_delivery',
      delivery_address: row.deliveryAddress ?? null,
      delivery_fee: row.deliveryFee ?? 0,
      total_amount: row.totalAmount ?? 0,
      notes: row.notes ?? null,
      created_at: new Date(row.createdAt ?? Date.now()).toISOString(),
    } as Order;
  }

  async listAll() {
    try {
      const items = await erpRequest<any[]>('/orders');
      return items.map((i) => this.mapOrder(i));
    } catch (err) {
      if (allowDemoFallback) return demoOrdersFallback.listAll();
      throw err;
    }
  }
  async listByUser(userId: string) {
    try {
      const items = await erpRequest<any[]>('/orders');
      return items.filter((o) => o.customerId === userId).map((i) => this.mapOrder(i));
    } catch (err) {
      if (allowDemoFallback) return demoOrdersFallback.listByUser(userId);
      throw err;
    }
  }
  async getById(id: string) {
    try {
      const item = await erpRequest<any>(`/orders/${id}`);
      if (item?.error) return null;
      return this.mapOrder(item);
    } catch (err) {
      if (allowDemoFallback) return demoOrdersFallback.getById(id);
      return null;
    }
  }
  async create(order: CreateOrderInput) {
    const items = order.items ?? [];
    const payload = {
      orderNumber: order.order_number ?? `DK${Date.now().toString().slice(-8)}`,
      customerId: order.customer_id ?? null,
      partnerId: items[0]?.vendor_id ?? null,
      deliveryType: order.delivery_type ?? 'home_delivery',
      deliveryAddress: order.delivery_address ?? null,
      deliveryFee: order.delivery_fee ?? 0,
      commissionFee: items.reduce((sum, i) => sum + i.vendor_commission, 0),
      notes: order.notes ?? null,
      items: items.map((i) => ({
        productId: i.product_id,
        partnerId: i.vendor_id,
        quantity: i.quantity,
        unitPrice: i.unit_price
      }))
    };
    try {
      const res = await erpRequest<{ id: string; total: number }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return {
        id: res.id,
        customer_id: order.customer_id ?? '',
        order_number: payload.orderNumber,
        status: 'pending',
        delivery_type: payload.deliveryType,
        delivery_address: payload.deliveryAddress,
        delivery_fee: payload.deliveryFee,
        total_amount: res.total ?? order.total_amount ?? 0,
        notes: order.notes ?? null,
        created_at: new Date().toISOString(),
        items: order.items as OrderItem[]
      } as Order;
    } catch (err) {
      if (allowDemoFallback) return demoOrdersFallback.create(order);
      throw err;
    }
  }
  async updateStatus() {
    return null;
  }
}

class SupabaseOrdersService implements OrdersService {
  async listAll() {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return data as Order[];
  }
  async listByUser(userId: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('customer_id', userId);
    if (error) throw error;
    return data as Order[];
  }
  async getById(id: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Order | null;
  }
  async create(order: CreateOrderInput) {
    const { data, error } = await supabase.from('orders').insert(order).select().maybeSingle();
    if (error) throw error;
    if (order.items && order.items.length > 0 && data?.id) {
      const items = order.items.map((item) => ({
        ...item,
        order_id: data.id
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;
    }
    return data as Order;
  }
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as Order | null;
  }
}

export const ordersService: OrdersService = isErpConfigured
  ? new ErpOrdersService()
  : isDemoMode
    ? new DemoOrdersService()
    : new SupabaseOrdersService();
