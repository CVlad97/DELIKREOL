import { isDemoMode, supabase, UserType } from './supabase';

export type PartnerRole = Extract<UserType, 'vendor' | 'driver' | 'relay_host'>;

export type PartnerDocumentType =
  | 'siret'
  | 'operating_address'
  | 'haccp'
  | 'product_photos'
  | 'establishment_photo'
  | 'production_capacity'
  | 'driving_license'
  | 'insurance'
  | 'vehicle_photo'
  | 'vehicle_type'
  | 'availability'
  | 'transport_capacity'
  | 'relay_address'
  | 'local_photo'
  | 'storage_capacity'
  | 'opening_hours';

export type PartnerDocumentStatus =
  | 'missing'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface PartnerDocumentRequirement {
  type: PartnerDocumentType;
  label: string;
  description: string;
  sensitive: boolean;
  expires: boolean;
  acceptsText?: boolean;
}

export interface PartnerDocument {
  id: string;
  user_id?: string | null;
  partner_application_id?: string | null;
  uploaded_by?: string | null;
  document_type: PartnerDocumentType;
  status?: PartnerDocumentStatus;
  verification_status: PartnerDocumentStatus;
  file_name?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  bucket_id?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  expires_at?: string | null;
  uploaded_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PartnerCompliance {
  status: 'complete' | 'incomplete' | 'needs_review' | 'rejected' | 'expired';
  approved: number;
  total: number;
  missing: PartnerDocumentRequirement[];
  blocking: PartnerDocument[];
}

interface StorageProvider {
  getDocuments(userId: string): Promise<PartnerDocument[]>;
  uploadDocument(input: {
    userId: string;
    role: PartnerRole;
    documentType: PartnerDocumentType;
    file: File;
    expiresAt?: string;
  }): Promise<PartnerDocument>;
  updateDocumentStatus(id: string, status: PartnerDocumentStatus, reviewNote?: string): Promise<void>;
  deleteDocument(id: string): Promise<void>;
}

const DEMO_KEY = 'delikreol_partner_documents_v2';
const PRIVATE_BUCKET = 'partner-documents-private';
const PUBLIC_PRODUCT_BUCKET = 'product-photos';

const ROLE_REQUIREMENTS: Record<PartnerRole, PartnerDocumentRequirement[]> = {
  vendor: [
    { type: 'siret', label: 'SIRET', description: 'Identifiant légal de l’activité.', sensitive: true, expires: false, acceptsText: true },
    { type: 'operating_address', label: 'Adresse d’exploitation', description: 'Adresse où les produits sont préparés ou remis.', sensitive: true, expires: false, acceptsText: true },
    { type: 'haccp', label: 'Hygiène / HACCP', description: 'Attestation ou justificatif hygiène si activité alimentaire.', sensitive: true, expires: true },
    { type: 'product_photos', label: 'Photos produits', description: 'Photos réelles destinées au catalogue public.', sensitive: false, expires: false },
    { type: 'establishment_photo', label: 'Photo établissement', description: 'Photo réelle du lieu ou atelier.', sensitive: false, expires: false },
    { type: 'production_capacity', label: 'Capacité production / stock', description: 'Volume préparé, stock ou capacité quotidienne.', sensitive: true, expires: false, acceptsText: true },
  ],
  driver: [
    { type: 'driving_license', label: 'Permis de conduire', description: 'Permis adapté au véhicule utilisé.', sensitive: true, expires: true },
    { type: 'insurance', label: 'Assurance', description: 'Attestation d’assurance à jour.', sensitive: true, expires: true },
    { type: 'vehicle_photo', label: 'Photo véhicule', description: 'Photo du véhicule utilisé pour les livraisons.', sensitive: true, expires: false },
    { type: 'vehicle_type', label: 'Type de véhicule', description: 'Voiture, scooter, vélo ou autre.', sensitive: false, expires: false, acceptsText: true },
    { type: 'availability', label: 'Disponibilité', description: 'Créneaux habituels disponibles.', sensitive: false, expires: false, acceptsText: true },
    { type: 'transport_capacity', label: 'Capacité transport', description: 'Volume, froid, sacs isothermes ou limites.', sensitive: true, expires: false, acceptsText: true },
  ],
  relay_host: [
    { type: 'siret', label: 'SIRET si professionnel', description: 'Identifiant légal si le point relais est porté par une activité pro.', sensitive: true, expires: false, acceptsText: true },
    { type: 'relay_address', label: 'Adresse du relais', description: 'Adresse exacte du point de dépôt/retrait.', sensitive: true, expires: false, acceptsText: true },
    { type: 'local_photo', label: 'Photo du local', description: 'Photo réelle de l’espace d’accueil ou stockage.', sensitive: true, expires: false },
    { type: 'storage_capacity', label: 'Capacité de stockage', description: 'Nombre de colis, froid/sec, contraintes.', sensitive: true, expires: false, acceptsText: true },
    { type: 'opening_hours', label: 'Horaires', description: 'Créneaux de dépôt et retrait.', sensitive: false, expires: false, acceptsText: true },
  ],
};

export function getRoleRequirements(role?: UserType | null): PartnerDocumentRequirement[] {
  if (role === 'driver' || role === 'relay_host' || role === 'vendor') {
    return ROLE_REQUIREMENTS[role];
  }
  return [];
}

export function getDocumentRequirement(role: PartnerRole, type: PartnerDocumentType) {
  return ROLE_REQUIREMENTS[role].find((requirement) => requirement.type === type);
}

export function getDocumentLabel(type: string): string {
  const all = Object.values(ROLE_REQUIREMENTS).flat();
  return all.find((requirement) => requirement.type === type)?.label ?? type;
}

export function buildCompliance(role: PartnerRole, documents: PartnerDocument[]): PartnerCompliance {
  const requirements = getRoleRequirements(role);
  const latestByType = new Map<string, PartnerDocument>();

  documents.forEach((document) => {
    const previous = latestByType.get(document.document_type);
    if (!previous || (document.uploaded_at ?? '').localeCompare(previous.uploaded_at ?? '') > 0) {
      latestByType.set(document.document_type, document);
    }
  });

  const missing = requirements.filter((requirement) => !latestByType.has(requirement.type));
  const relevantDocs = requirements
    .map((requirement) => latestByType.get(requirement.type))
    .filter(Boolean) as PartnerDocument[];
  const blocking = relevantDocs.filter((document) =>
    ['rejected', 'expired', 'missing'].includes(document.verification_status)
  );
  const underReview = relevantDocs.filter((document) =>
    ['uploaded', 'under_review'].includes(document.verification_status)
  );
  const approved = relevantDocs.filter((document) => document.verification_status === 'approved').length;

  let status: PartnerCompliance['status'] = 'complete';
  if (blocking.some((document) => document.verification_status === 'rejected')) status = 'rejected';
  else if (blocking.some((document) => document.verification_status === 'expired')) status = 'expired';
  else if (missing.length > 0) status = 'incomplete';
  else if (underReview.length > 0) status = 'needs_review';

  return { status, approved, total: requirements.length, missing, blocking };
}

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

function toSafeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

class DemoStorageProvider implements StorageProvider {
  async getDocuments(userId: string): Promise<PartnerDocument[]> {
    return readDemoDocs()
      .filter((document) => document.user_id === userId)
      .sort((a, b) => (b.uploaded_at ?? '').localeCompare(a.uploaded_at ?? ''));
  }

  async uploadDocument(input: {
    userId: string;
    role: PartnerRole;
    documentType: PartnerDocumentType;
    file: File;
    expiresAt?: string;
  }): Promise<PartnerDocument> {
    const docs = readDemoDocs().filter(
      (document) => !(document.user_id === input.userId && document.document_type === input.documentType)
    );
    const requirement = getDocumentRequirement(input.role, input.documentType);
    const doc: PartnerDocument = {
      id: `doc_${Date.now()}`,
      user_id: input.userId,
      uploaded_by: input.userId,
      document_type: input.documentType,
      status: 'uploaded',
      verification_status: 'uploaded',
      file_name: input.file.name,
      file_path: `demo/${input.userId}/${input.documentType}/${input.file.name}`,
      bucket_id: requirement?.sensitive ? PRIVATE_BUCKET : PUBLIC_PRODUCT_BUCKET,
      mime_type: input.file.type,
      file_size: input.file.size,
      uploaded_at: new Date().toISOString(),
      expires_at: input.expiresAt || null,
    };
    docs.push(doc);
    writeDemoDocs(docs);
    return doc;
  }

  async updateDocumentStatus(id: string, status: PartnerDocumentStatus, reviewNote?: string): Promise<void> {
    const docs = readDemoDocs();
    const idx = docs.findIndex((document) => document.id === id);
    if (idx >= 0) {
      docs[idx] = {
        ...docs[idx],
        verification_status: status,
        review_note: reviewNote,
        reviewed_at: new Date().toISOString(),
      };
      writeDemoDocs(docs);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    writeDemoDocs(readDemoDocs().filter((document) => document.id !== id));
  }
}

class SupabaseStorageProvider implements StorageProvider {
  async getDocuments(userId: string): Promise<PartnerDocument[]> {
    const { data, error } = await supabase
      .from('partner_documents')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((document: any) => ({
      ...document,
      user_id: document.user_id ?? document.uploaded_by,
      uploaded_at: document.uploaded_at ?? document.created_at,
      verification_status: document.verification_status ?? document.status ?? 'uploaded',
    })) as PartnerDocument[];
  }

  async uploadDocument(input: {
    userId: string;
    role: PartnerRole;
    documentType: PartnerDocumentType;
    file: File;
    expiresAt?: string;
  }): Promise<PartnerDocument> {
    const requirement = getDocumentRequirement(input.role, input.documentType);
    const bucketId = requirement?.sensitive ? PRIVATE_BUCKET : PUBLIC_PRODUCT_BUCKET;
    const path = `${input.userId}/${input.documentType}/${Date.now()}_${toSafeFileName(input.file.name)}`;

    const { error: uploadError } = await supabase.storage.from(bucketId).upload(path, input.file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const publicUrl = requirement?.sensitive
      ? null
      : supabase.storage.from(bucketId).getPublicUrl(path).data.publicUrl;

    const { data, error } = await supabase
      .from('partner_documents')
      .insert({
        user_id: input.userId,
        uploaded_by: input.userId,
        document_type: input.documentType,
        status: 'uploaded',
        verification_status: 'uploaded',
        file_name: input.file.name,
        file_path: path,
        bucket_id: bucketId,
        is_sensitive: requirement?.sensitive ?? true,
        file_size: input.file.size,
        mime_type: input.file.type,
        expires_at: input.expiresAt || null,
        metadata: {
          public_url: publicUrl,
          partner_role: input.role,
          minimization: 'required_for_role',
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data as PartnerDocument;
  }

  async updateDocumentStatus(id: string, status: PartnerDocumentStatus, reviewNote?: string): Promise<void> {
    const { error } = await supabase
      .from('partner_documents')
      .update({
        verification_status: status,
        status,
        review_note: reviewNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
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
