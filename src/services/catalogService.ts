import { Vendor, Product, supabase, isDemoMode } from '../lib/supabase';
import { seedDemoData, readDemoProducts } from '../data/demoDb';
import { erpRequest, isErpConfigured } from '../lib/erpClient';
import { fetchSheetData, normalizeBoolean, normalizeNumber, SheetProductRow } from './sheetsService';

export interface CatalogService {
  listVendors(): Promise<Vendor[]>;
  getVendorById(id: string): Promise<Vendor | null>;
  listProducts(): Promise<Product[]>;
  listProductsByVendor(vendorId: string): Promise<Product[]>;
}

const demoVendorMap: Record<string, { name: string; type: Vendor['business_type'] }> = {
  v1: { name: 'Chez Tatie', type: 'restaurant' },
  v2: { name: 'La Case Créole', type: 'merchant' },
  v3: { name: 'Distillerie du Nord', type: 'producer' }
};

class DemoCatalogService implements CatalogService {
  constructor() {
    seedDemoData();
  }
  async listVendors() {
    const products = readDemoProducts();
    const vendorIds = Array.from(new Set(products.map((p) => p.vendor_id)));
    return vendorIds.map((id) => {
      const meta = demoVendorMap[id] ?? { name: 'Vendeur local', type: 'merchant' as const };
      return {
        id,
        user_id: id,
        business_name: meta.name,
        business_type: meta.type,
        description: 'Produits locaux sélectionnés',
        logo_url: null,
        address: 'Martinique',
        latitude: null,
        longitude: null,
        phone: '+596000000',
        commission_rate: 0.2,
        is_active: true,
        opening_hours: null,
        delivery_radius_km: 10,
        created_at: new Date().toISOString()
      } as Vendor;
    });
  }
  async getVendorById(id: string) {
    const all = await this.listVendors();
    return all.find((v) => v.id === id) ?? null;
  }
  async listProducts() {
    return readDemoProducts();
  }
  async listProductsByVendor(vendorId: string) {
    return readDemoProducts().filter((p) => p.vendor_id === vendorId);
  }
}

const demoFallback = new DemoCatalogService();
const allowDemoFallback = import.meta.env.VITE_ERP_FALLBACK_DEMO !== 'false';
const sheetsProductsUrl = import.meta.env.VITE_SHEETS_PUBLIC_URL || '';
const isSheetsConfigured = sheetsProductsUrl.length > 0;

class ErpCatalogService implements CatalogService {
  private mapPartner(partner: any): Vendor {
    return {
      id: partner.id,
      user_id: partner.id,
      business_name: partner.name,
      business_type: (partner.type as Vendor['business_type']) ?? 'merchant',
      description: partner.description ?? null,
      logo_url: partner.logoUrl ?? null,
      address: partner.address ?? 'Martinique',
      latitude: null,
      longitude: null,
      phone: partner.contactPhone ?? '',
      commission_rate: partner.commissionRate ?? 0,
      is_active: !!partner.isActive,
      opening_hours: null,
      delivery_radius_km: 10,
      created_at: new Date(partner.createdAt ?? Date.now()).toISOString()
    } as Vendor;
  }

  private mapProduct(product: any): Product {
    const vendorName = product.partnerName ?? product.vendorName ?? null;
    return {
      id: product.id,
      vendor_id: product.partnerId ?? 'unknown',
      name: product.name,
      description: product.description ?? null,
      category: product.category ?? product.categoryId ?? 'Divers',
      price: Number(product.price ?? 0),
      image_url: null,
      is_available: !!product.isAvailable,
      stock_quantity: null,
      created_at: new Date(product.createdAt ?? Date.now()).toISOString(),
      vendor: vendorName
        ? ({
            business_name: vendorName
          } as any)
        : undefined
    } as Product;
  }

  async listVendors() {
    try {
      const partners = await erpRequest<any[]>('/partners?type=vendor');
      return partners.map((p) => this.mapPartner(p));
    } catch (err) {
      if (allowDemoFallback) return demoFallback.listVendors();
      throw err;
    }
  }
  async getVendorById(id: string) {
    try {
      const partner = await erpRequest<any>(`/partners/${id}`);
      if (partner?.error) return null;
      return this.mapPartner(partner);
    } catch {
      if (allowDemoFallback) return demoFallback.getVendorById(id);
      return null;
    }
  }
  async listProducts() {
    try {
      const items = await erpRequest<any[]>('/catalog/products');
      return items.map((p) => this.mapProduct(p));
    } catch (err) {
      if (allowDemoFallback) return demoFallback.listProducts();
      throw err;
    }
  }
  async listProductsByVendor(vendorId: string) {
    try {
      const items = await erpRequest<any[]>(`/catalog/products?partnerId=${vendorId}`);
      return items.map((p) => this.mapProduct(p));
    } catch (err) {
      if (allowDemoFallback) return demoFallback.listProductsByVendor(vendorId);
      throw err;
    }
  }
}

class SupabaseCatalogService implements CatalogService {
  async listVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Vendor[];
  }
  async getVendorById(id: string) {
    const { data, error } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Vendor | null;
  }
  async listProducts() {
    const { data, error } = await supabase.from('products').select('*').eq('is_available', true);
    if (error) throw error;
    return data as Product[];
  }
  async listProductsByVendor(vendorId: string) {
    const { data, error } = await supabase.from('products').select('*').eq('vendor_id', vendorId).eq('is_available', true);
    if (error) throw error;
    return data as Product[];
  }
}

class SheetsCatalogService implements CatalogService {
  private mapProduct(row: SheetProductRow, index: number, vendorId: string): Product {
    return {
      id: row.id ?? `sheet-product-${index}`,
      vendor_id: vendorId,
      name: row.name,
      description: row.description ?? null,
      category: row.category ?? 'Divers',
      price: normalizeNumber(row.price),
      image_url: row.image_url ?? row.image ?? null,
      is_available: normalizeBoolean(row.available ?? row.is_available ?? 'true'),
      stock_quantity: null,
      created_at: new Date().toISOString()
    } as Product;
  }

  async listVendors() {
    try {
      const products = await this.listProducts();
      const vendorNames = Array.from(new Set(products.map((p) => p.vendor?.business_name ?? p.vendor_id)));
      return vendorNames.map((name, index) => {
        const id = `sheet-vendor-${index}`;
        return {
          id,
          user_id: id,
          business_name: name ?? 'Vendeur local',
          business_type: 'merchant',
          description: 'Vendeur local',
          logo_url: null,
          address: 'Martinique',
          latitude: null,
          longitude: null,
          phone: '',
          commission_rate: 0.2,
          is_active: true,
          opening_hours: null,
          delivery_radius_km: 10,
          created_at: new Date().toISOString()
        } as Vendor;
      });
    } catch {
      return demoFallback.listVendors();
    }
  }

  async getVendorById(id: string) {
    const vendors = await this.listVendors();
    return vendors.find((v) => v.id === id) ?? null;
  }

  async listProducts() {
    try {
      const rows = await fetchSheetData<SheetProductRow>(sheetsProductsUrl);
      return rows.map((row, index) => {
        const vendorId = row.vendor ?? 'sheet-vendor';
        const product = this.mapProduct(row, index, vendorId);
        return {
          ...product,
          vendor: { business_name: row.vendor ?? 'Vendeur local' } as any
        } as Product;
      });
    } catch {
      return demoFallback.listProducts();
    }
  }

  async listProductsByVendor(vendorId: string) {
    const products = await this.listProducts();
    return products.filter((p) => p.vendor_id === vendorId);
  }
}

export const catalogService: CatalogService = isErpConfigured
  ? new ErpCatalogService()
  : isSheetsConfigured
    ? new SheetsCatalogService()
    : isDemoMode
      ? new DemoCatalogService()
      : new SupabaseCatalogService();
