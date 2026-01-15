// Storage Provider Interface - Allows switching between Supabase and Demo modes
export interface PartnerDocument {
  id: string;
  partner_id: string;
  doc_type: 'haccp' | 'rcpro';
  storage_path?: string;
  status: 'pending' | 'validated' | 'expired';
  uploaded_at: string;
  expires_at?: string;
  file_name?: string;
}

export interface StorageProvider {
  uploadDocument(
    partnerId: string,
    docType: 'haccp' | 'rcpro',
    file: File,
    expiresAt?: string
  ): Promise<PartnerDocument>;
  
  getDocuments(partnerId: string): Promise<PartnerDocument[]>;
  
  updateDocumentStatus(
    documentId: string,
    status: 'pending' | 'validated' | 'expired'
  ): Promise<void>;
  
  deleteDocument(documentId: string): Promise<void>;
}

// Demo Storage Implementation (localStorage-based)
class DemoStorageProvider implements StorageProvider {
  private storageKey = 'delikreol_partner_docs';

  private getDocs(): PartnerDocument[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveDocs(docs: PartnerDocument[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(docs));
  }

  async uploadDocument(
    partnerId: string,
    docType: 'haccp' | 'rcpro',
    file: File,
    expiresAt?: string
  ): Promise<PartnerDocument> {
    const doc: PartnerDocument = {
      id: `doc_${Date.now()}`,
      partner_id: partnerId,
      doc_type: docType,
      status: 'pending',
      uploaded_at: new Date().toISOString(),
      expires_at: expiresAt,
      file_name: file.name,
      storage_path: `demo://partner/${partnerId}/${docType}/${file.name}`,
    };

    const docs = this.getDocs();
    // Replace existing doc of same type
    const filtered = docs.filter(d => !(d.partner_id === partnerId && d.doc_type === docType));
    filtered.push(doc);
    this.saveDocs(filtered);

    return doc;
  }

  async getDocuments(partnerId: string): Promise<PartnerDocument[]> {
    const docs = this.getDocs();
    return docs.filter(d => d.partner_id === partnerId);
  }

  async updateDocumentStatus(
    documentId: string,
    status: 'pending' | 'validated' | 'expired'
  ): Promise<void> {
    const docs = this.getDocs();
    const doc = docs.find(d => d.id === documentId);
    if (doc) {
      doc.status = status;
      this.saveDocs(docs);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    const docs = this.getDocs();
    const filtered = docs.filter(d => d.id !== documentId);
    this.saveDocs(filtered);
  }
}

// Supabase Storage Implementation (future)
// TODO: Implement when ready to integrate with Supabase Storage
// class SupabaseStorageProvider implements StorageProvider { ... }

export function getStorageProvider(): StorageProvider {
  // For now, always use demo provider
  // TODO: Switch to Supabase when VITE_SUPABASE_URL is configured
  return new DemoStorageProvider();
}
