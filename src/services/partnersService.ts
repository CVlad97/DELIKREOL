import { supabase, isDemoMode } from '../lib/supabase';
import { readDemoPartners, writeDemoPartners, seedDemoData } from '../data/demoDb';

export interface PartnerApplication {
  id: string;
  company_name: string;
  partner_type: 'vendor' | 'relay_host' | 'courier';
  contact_email: string;
  phone: string;
  address: string;
  status: 'submitted' | 'approved' | 'rejected';
  docs: string[];
}

export interface PartnersService {
  apply(app: Partial<PartnerApplication>): Promise<PartnerApplication>;
  listAll(): Promise<PartnerApplication[]>;
  updateStatus(id: string, status: PartnerApplication['status']): Promise<PartnerApplication | null>;
  uploadDoc(id: string, file: File): Promise<string>;
}

class DemoPartnersService implements PartnersService {
  constructor() {
    seedDemoData();
  }
  async apply(app: Partial<PartnerApplication>) {
    const all = readDemoPartners();
    const id = 'pa_' + Date.now().toString();
    const newApp: PartnerApplication = {
      id,
      company_name: app.company_name || 'Company',
      partner_type: (app.partner_type as any) || 'vendor',
      contact_email: app.contact_email || 'unknown@example.com',
      phone: app.phone || '',
      address: app.address || '',
      status: 'submitted',
      docs: [],
    };
    all.unshift(newApp);
    writeDemoPartners(all);
    return newApp;
  }
  async listAll() {
    return readDemoPartners();
  }
  async updateStatus(id: string, status: PartnerApplication['status']) {
    const all = readDemoPartners();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    all[idx].status = status;
    writeDemoPartners(all);
    return all[idx];
  }
  async uploadDoc(id: string, file: File) {
    // simulate upload by storing file.name in docs list
    const all = readDemoPartners();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Application not found');
    all[idx].docs = all[idx].docs || [];
    all[idx].docs.push(file.name);
    writeDemoPartners(all);
    return Promise.resolve(file.name);
  }
}

class SupabasePartnersService implements PartnersService {
  async apply(app: Partial<PartnerApplication>) {
    const { data, error } = await supabase.from('partner_applications').insert(app).select().maybeSingle();
    if (error) throw error;
    return data as PartnerApplication;
  }
  async listAll() {
    const { data, error } = await supabase.from('partner_applications').select('*');
    if (error) throw error;
    return data as PartnerApplication[];
  }
  async updateStatus(id: string, status: PartnerApplication['status']) {
    const { data, error } = await supabase.from('partner_applications').update({ status }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as PartnerApplication | null;
  }
  async uploadDoc(id: string, file: File) {
    if (!supabase.storage) throw new Error('Storage not available');
    const key = `partner-docs/${id}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('partner-docs').upload(key, file as any, { cacheControl: '3600' });
    if (error) throw error;
    return data?.path || key;
  }
}

export const partnersService: PartnersService = isDemoMode ? new DemoPartnersService() : new SupabasePartnersService();
