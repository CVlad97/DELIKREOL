import { Product } from '../types';
import { readDemoProducts, writeDemoProducts, seedDemoData } from '../data/demoDb';
import { supabase, isDemoMode } from '../lib/supabase';

export interface ProductsService {
  listAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(payload: Partial<Product>): Promise<Product>;
  update(id: string, payload: Partial<Product>): Promise<Product | null>;
  remove(id: string): Promise<boolean>;
}

class DemoProductsService implements ProductsService {
  constructor() {
    seedDemoData();
  }
  async listAll() {
    return readDemoProducts();
  }
  async getById(id: string) {
    const all = readDemoProducts();
    return all.find((p) => p.id === id) ?? null;
  }
  async create(payload: Partial<Product>) {
    const all = readDemoProducts();
    const id = 'p_' + Date.now().toString();
    const newP: Product = {
      id,
      vendor_id: payload.vendor_id || 'v1',
      name: payload.name || 'New product',
      description: payload.description ?? null,
      category: payload.category || 'uncategorized',
      price: payload.price ?? 0,
      image_url: payload.image_url ?? null,
      is_available: payload.is_available ?? true,
      stock_quantity: payload.stock_quantity ?? null,
      created_at: new Date().toISOString(),
    };
    all.unshift(newP);
    writeDemoProducts(all);
    return newP;
  }
  async update(id: string, payload: Partial<Product>) {
    const all = readDemoProducts();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...payload } as Product;
    all[idx] = updated;
    writeDemoProducts(all);
    return updated;
  }
  async remove(id: string) {
    let all = readDemoProducts();
    const before = all.length;
    all = all.filter((p) => p.id !== id);
    writeDemoProducts(all);
    return all.length < before;
  }
}

class SupabaseProductsService implements ProductsService {
  async listAll() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data as Product[];
  }
  async getById(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Product | null;
  }
  async create(payload: Partial<Product>) {
    const { data, error } = await supabase.from('products').insert(payload).select().maybeSingle();
    if (error) throw error;
    return data as Product;
  }
  async update(id: string, payload: Partial<Product>) {
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as Product | null;
  }
  async remove(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const productsService: ProductsService = isDemoMode ? new DemoProductsService() : new SupabaseProductsService();
