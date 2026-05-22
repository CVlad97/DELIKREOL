import { Vendor, Product, supabase, isDemoMode, isSupabaseConfigured } from '../lib/supabase';
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
const allowSheetsFallback =
  import.meta.env.VITE_SHEETS_FALLBACK !== 'false' && isSheetsConfigured;

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
      is_available: product.isAvailable !== false,
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
  private normalizeVendor(row: any): Vendor {
    return {
      id: row.id,
      user_id: row.user_id ?? row.id,
      business_name: row.business_name ?? row.name ?? 'Partenaire local',
      business_type: (row.business_type as Vendor['business_type']) ?? 'merchant',
      description: row.description ?? null,
      logo_url: row.logo_url ?? row.image_url ?? null,
      address: row.address ?? row.zone_label ?? 'Martinique',
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      phone: row.phone ?? '',
      commission_rate: Number(row.commission_rate ?? 0),
      is_active: row.is_active !== false,
      opening_hours: row.opening_hours ?? null,
      delivery_radius_km: Number(row.delivery_radius_km ?? 10),
      created_at: row.created_at ?? new Date().toISOString()
    } as Vendor;
  }

  async listVendors() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => this.normalizeVendor(row));
    } catch (err) {
      if (allowSheetsFallback) return sheetsFallback.listVendors();
      throw err;
    }
  }
  async getVendorById(id: string) {
    try {
      const { data, error } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? this.normalizeVendor(data) : null;
    } catch (err) {
      if (allowSheetsFallback) return sheetsFallback.getVendorById(id);
      throw err;
    }
  }
  async listProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendor:vendors(business_name)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        is_available: row.is_available !== false,
      })) as Product[];
    } catch (err) {
      if (allowSheetsFallback) return sheetsFallback.listProducts();
      throw err;
    }
  }
  async listProductsByVendor(vendorId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendor:vendors(business_name)')
        .eq('vendor_id', vendorId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        is_available: row.is_available !== false,
      })) as Product[];
    } catch (err) {
      if (allowSheetsFallback) return sheetsFallback.listProductsByVendor(vendorId);
      throw err;
    }
  }
}

class SheetsCatalogService implements CatalogService {
  private normalizeText(value?: string | null) {
    if (!value) return '';
    return String(value).replace(/\s+/g, ' ').trim();
  }

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
      const results: Product[] = [];
      rows.forEach((row, index) => {
        const name = this.normalizeText(row.name);
        const price = normalizeNumber(row.price);
        if (!name || !Number.isFinite(price)) return;
        const vendorName = this.normalizeText(row.vendor) || 'Vendeur local';
        const category = this.normalizeText(row.category) || 'Divers';
        const description = this.normalizeText(row.description) || null;
        const imageUrl = this.normalizeText(row.image_url ?? row.image) || null;
        const zone = this.normalizeText(row.zone) || undefined;
        const product = this.mapProduct(
          {
            ...row,
            name,
            category,
            description: description ?? undefined,
            image_url: imageUrl ?? undefined,
            vendor: vendorName,
            price
          },
          index,
          vendorName
        );
        (product as Product & { zone?: string }).zone = zone;
        results.push({
          ...product,
          vendor: { business_name: vendorName } as any
        } as Product);
      });
      return results;
    } catch {
      return demoFallback.listProducts();
    }
  }

  async listProductsByVendor(vendorId: string) {
    const products = await this.listProducts();
    return products.filter((p) => p.vendor_id === vendorId);
  }
}

const sheetsFallback = new SheetsCatalogService();

// Catalogue source selection:
// - User preference: Sheets should be the primary source when configured (public pilot),
//   with Supabase/ERP remaining available for admin/backoffice flows.
export const catalogService: CatalogService = isSheetsConfigured
  ? new SheetsCatalogService()
  : isSupabaseConfigured
    ? new SupabaseCatalogService()
    : isErpConfigured
      ? new ErpCatalogService()
      : isDemoMode
        ? new DemoCatalogService()
        : new SupabaseCatalogService();
