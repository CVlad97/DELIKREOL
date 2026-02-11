import { Order } from '../types';
import { readDemoOrders, writeDemoOrders, seedDemoData } from '../data/demoDb';
import { supabase, isDemoMode } from '../lib/supabase';

export interface OrdersService {
  listAll(): Promise<Order[]>;
  listByUser(userId: string): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(order: Partial<Order>): Promise<Order>;
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
  async create(order: Partial<Order>) {
    const all = readDemoOrders();
    const id = 'o_' + Date.now().toString();
    const newOrder: Order = {
      id,
      customer_id: order.customer_id || 'demo_customer',
      order_number: 'DLK-' + Math.floor(Math.random() * 9000 + 1000).toString(),
      status: (order.status as any) || 'pending',
      delivery_type: (order.delivery_type as any) || 'home_delivery',
      delivery_fee: order.delivery_fee ?? 0,
      total_amount: order.total_amount ?? 0,
      created_at: new Date().toISOString(),
      items: order.items || [],
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
  async create(order: Partial<Order>) {
    const { data, error } = await supabase.from('orders').insert(order).select().maybeSingle();
    if (error) throw error;
    return data as Order;
  }
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as Order | null;
  }
}

export const ordersService: OrdersService = isDemoMode ? new DemoOrdersService() : new SupabaseOrdersService();
