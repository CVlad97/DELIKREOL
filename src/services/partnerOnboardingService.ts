import { supabase } from '../lib/supabase';

export interface PartnerApplicationInput {
  business_name: string;
  business_type: 'restaurant' | 'producer' | 'merchant' | 'relay_host' | 'driver';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  zone_label: string;
  legal_status?: string;
  siren?: string;
  siret?: string;
  vat_number?: string;
  certifications?: string;
  services: string[];
  zones_served?: string[];
  availability_notes?: string;
  capacity_notes?: string;
}

export interface PartnerDocumentInput {
  documentType:
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
    | 'opening_hours'
    | 'other';
  file: File;
  description?: string;
  expiresAt?: string;
}

export interface PartnerCatalogFileInput {
  file: File;
  format: 'csv' | 'xlsx' | 'xls' | 'pdf' | 'other';
  note?: string;
}

export interface PartnerCatalogItemInput {
  name: string;
  description?: string;
  category?: string;
  unit: string;
  price: number;
  currency?: string;
  is_signature?: boolean;
  allergens?: string[];
}

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPartnerApplication(
  input: PartnerApplicationInput
): Promise<ServiceResponse<{ id: string }>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const { data, error } = await supabase
      .from('partner_applications')
      .insert({
        user_id: userData.user.id,
        business_name: input.business_name,
        business_type: input.business_type,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        address: input.address,
        zone_label: input.zone_label,
        status: 'pending',
        details: {
          contact_name: input.contact_name,
          city: input.city,
          legal_status: input.legal_status,
          siren: input.siren,
          siret: input.siret,
          vat_number: input.vat_number,
          certifications: input.certifications,
          services: input.services,
          zones_served: input.zones_served,
          availability_notes: input.availability_notes,
          capacity_notes: input.capacity_notes,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating partner application:', error);
      return { success: false, error: 'Erreur lors de la création de la candidature' };
    }

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function uploadPartnerDocument(
  partnerApplicationId: string,
  documentInput: PartnerDocumentInput
): Promise<ServiceResponse<{ id: string; url: string }>> {
  try {
    const { file, documentType } = documentInput;
    const { data: authData } = await supabase.auth.getUser();
    const isPublicPhoto = documentType === 'product_photos' || documentType === 'establishment_photo';
    const bucketId = isPublicPhoto ? 'product-photos' : 'partner-documents-private';

    const fileExt = file.name.split('.').pop();
    const fileName = `${authData.user?.id || partnerApplicationId}/${documentType}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      return { success: false, error: 'Erreur lors de l\'upload du document' };
    }

    const { data, error } = await supabase
      .from('partner_documents')
      .insert({
        partner_application_id: partnerApplicationId,
        user_id: authData.user?.id,
        uploaded_by: authData.user?.id,
        document_type: documentType,
        status: 'uploaded',
        verification_status: 'uploaded',
        file_path: fileName,
        bucket_id: bucketId,
        is_sensitive: !isPublicPhoto,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        expires_at: documentInput.expiresAt,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving document metadata:', error);
      return { success: false, error: 'Erreur lors de l\'enregistrement du document' };
    }

    return {
      success: true,
      data: { id: data.id, url: fileName },
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function uploadPartnerCatalogFile(
  partnerApplicationId: string,
  catalogInput: PartnerCatalogFileInput
): Promise<ServiceResponse<{ id: string; url: string }>> {
  try {
    const { file, format, note } = catalogInput;

    const fileExt = file.name.split('.').pop();
    const fileName = `${partnerApplicationId}/catalog_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('partner-catalog')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading catalog:', uploadError);
      return { success: false, error: 'Erreur lors de l\'upload du catalogue' };
    }

    const { data: urlData } = supabase.storage
      .from('partner-catalog')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('partner_catalog_files')
      .insert({
        partner_application_id: partnerApplicationId,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        format,
        note,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving catalog metadata:', error);
      return { success: false, error: 'Erreur lors de l\'enregistrement du catalogue' };
    }

    return {
      success: true,
      data: { id: data.id, url: urlData.publicUrl },
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function savePartnerCatalogItems(
  partnerApplicationId: string,
  items: PartnerCatalogItemInput[]
): Promise<ServiceResponse<{ count: number }>> {
  try {
    if (items.length === 0) {
      return { success: true, data: { count: 0 } };
    }

    const { error } = await supabase
      .from('partner_catalog_items')
      .insert(
        items.map((item) => ({
          partner_application_id: partnerApplicationId,
          name: item.name,
          description: item.description,
          category: item.category,
          unit: item.unit,
          price: item.price,
          currency: item.currency || 'EUR',
          is_signature: item.is_signature || false,
          allergens: item.allergens || [],
        }))
      );

    if (error) {
      console.error('Error saving catalog items:', error);
      return { success: false, error: 'Erreur lors de l\'enregistrement des produits' };
    }

    return { success: true, data: { count: items.length } };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function getPartnerApplication(
  applicationId: string
): Promise<ServiceResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('partner_applications')
      .select(`
        *,
        partner_documents(*),
        partner_catalog_files(*),
        partner_catalog_items(*)
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      return { success: false, error: 'Erreur lors du chargement de la candidature' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function listPartnerApplications(
  status?: string
): Promise<ServiceResponse<any[]>> {
  try {
    let query = supabase
      .from('partner_applications')
      .select(`
        *,
        profiles(full_name, phone),
        partner_documents(count),
        partner_catalog_files(count),
        partner_catalog_items(count)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing applications:', error);
      return { success: false, error: 'Erreur lors du chargement des candidatures' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function updatePartnerApplicationStatus(
  applicationId: string,
  status: 'pending' | 'accepted' | 'rejected',
  adminNotes?: string
): Promise<ServiceResponse> {
  try {
    const updateData: any = { status };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('partner_applications')
      .update(updateData)
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating status:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du statut' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function updatePartnerDocumentVerification(
  documentId: string,
  status: 'under_review' | 'approved' | 'rejected' | 'expired',
  reviewNote?: string
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('partner_documents')
      .update({
        verification_status: status,
        status,
        review_note: reviewNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document verification:', error);
      return { success: false, error: 'Erreur lors de la validation du document' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

export async function createPartnerDocumentAccessUrl(document: {
  bucket_id?: string | null;
  file_path?: string | null;
  file_url?: string | null;
}): Promise<ServiceResponse<{ url: string }>> {
  try {
    if (document.file_url?.startsWith('http')) {
      return { success: true, data: { url: document.file_url } };
    }

    const bucket = document.bucket_id || 'partner-docs';
    const path = document.file_path || document.file_url;

    if (!path) {
      return { success: false, error: 'Chemin du document indisponible' };
    }

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5);
    if (error) {
      console.error('Error creating signed URL:', error);
      return { success: false, error: 'Impossible de générer le lien sécurisé' };
    }

    return { success: true, data: { url: data.signedUrl } };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}
