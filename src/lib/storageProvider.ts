import { isDemoMode, supabase } from './supabase';

export type PartnerDocType = 'haccp' | 'rcpro';
export type PartnerDocStatus = 'pending' | 'validated' | 'expired';

export interface PartnerDocument {
  id: string;
  user_id: string;
  doc_type: PartnerDocType;
  file_name: string;
  file_path?: string;
  status: PartnerDocStatus;
  uploaded_at: string;
  expiry_date?: string;
  expires_at?: string;
}

interface StorageProvider {
  getDocuments(userId: string): Promise<PartnerDocument[]>;
  uploadDocument(
    userId: string,
    docType: PartnerDocType,
    file: File,
    expiryDate?: string
  ): Promise<PartnerDocument>;
  updateDocumentStatus(id: string, status: PartnerDocStatus): Promise<void>;
  deleteDocument(id: string): Promise<void>;
}

const DEMO_KEY = 'delikreol_partner_documents';

function readDemoDocs(): PartnerDocument[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as PartnerDocument[]) : [];
  } catch {
    return [];
  }
}

function writeDemoDocs(docs: PartnerDocument[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(docs));
}

class DemoStorageProvider implements StorageProvider {
  async getDocuments(userId: string): Promise<PartnerDocument[]> {
    return readDemoDocs()
      .filter((d) => d.user_id === userId)
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  }

  async uploadDocument(
    userId: string,
    docType: PartnerDocType,
    file: File,
    expiryDate?: string
  ): Promise<PartnerDocument> {
    const docs = readDemoDocs().filter((d) => !(d.user_id === userId && d.doc_type === docType));
    const doc: PartnerDocument = {
      id: `doc_${Date.now()}`,
      user_id: userId,
      doc_type: docType,
      file_name: file.name,
      status: 'pending',
      uploaded_at: new Date().toISOString(),
      expiry_date: expiryDate,
      expires_at: expiryDate,
    };
    docs.push(doc);
    writeDemoDocs(docs);
    return doc;
  }

  async updateDocumentStatus(id: string, status: PartnerDocStatus): Promise<void> {
    const docs = readDemoDocs();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx >= 0) {
      docs[idx].status = status;
      writeDemoDocs(docs);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    const docs = readDemoDocs().filter((d) => d.id !== id);
    writeDemoDocs(docs);
  }
}

class SupabaseStorageProvider implements StorageProvider {
  async getDocuments(userId: string): Promise<PartnerDocument[]> {
    const { data, error } = await supabase
      .from('partner_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PartnerDocument[];
  }

  async uploadDocument(
    userId: string,
    docType: PartnerDocType,
    file: File,
    expiryDate?: string
  ): Promise<PartnerDocument> {
    const path = `partner-documents/${userId}/${docType}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('partner-docs').upload(path, file);
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('partner_documents')
      .insert({
        user_id: userId,
        doc_type: docType,
        file_name: file.name,
        file_path: path,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
        expiry_date: expiryDate,
        expires_at: expiryDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PartnerDocument;
  }

  async updateDocumentStatus(id: string, status: PartnerDocStatus): Promise<void> {
    const { error } = await supabase.from('partner_documents').update({ status }).eq('id', id);
    if (error) throw error;
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from('partner_documents').delete().eq('id', id);
    if (error) throw error;
  }
}

export function getStorageProvider(): StorageProvider {
  return isDemoMode ? new DemoStorageProvider() : new SupabaseStorageProvider();
}
