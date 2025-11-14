import { supabase } from '../lib/supabase';

export type PartnerType = 'vendor' | 'driver' | 'relay_host';
export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_info';
export type AIGrade = 'A' | 'B' | 'C';

export interface PartnerApplication {
  id?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  partner_type: PartnerType;
  application_data: Record<string, any>;
  status?: ApplicationStatus;
  ai_score?: AIGrade;
  ai_feedback?: AIFeedback;
  created_at?: string;
}

export interface AIFeedback {
  grade: AIGrade;
  completeness_score: number;
  strengths: string[];
  weaknesses: string[];
  response_template: {
    subject: string;
    body: string;
  };
}

interface FieldValidation {
  field: string;
  required: boolean;
  weight: number;
}

const VENDOR_FIELDS: FieldValidation[] = [
  { field: 'business_name', required: true, weight: 10 },
  { field: 'business_type', required: true, weight: 10 },
  { field: 'description', required: true, weight: 5 },
  { field: 'address', required: true, weight: 10 },
  { field: 'phone', required: true, weight: 10 },
  { field: 'siret', required: true, weight: 15 },
  { field: 'health_compliance', required: true, weight: 20 },
  { field: 'opening_hours', required: true, weight: 5 },
  { field: 'delivery_radius', required: false, weight: 5 },
  { field: 'product_categories', required: true, weight: 10 },
];

const DRIVER_FIELDS: FieldValidation[] = [
  { field: 'full_name', required: true, weight: 10 },
  { field: 'phone', required: true, weight: 10 },
  { field: 'siret', required: true, weight: 20 },
  { field: 'vehicle_type', required: true, weight: 15 },
  { field: 'license_number', required: true, weight: 15 },
  { field: 'insurance_proof', required: true, weight: 20 },
  { field: 'availability', required: true, weight: 10 },
];

const RELAY_HOST_FIELDS: FieldValidation[] = [
  { field: 'location_name', required: true, weight: 10 },
  { field: 'address', required: true, weight: 10 },
  { field: 'owner_name', required: true, weight: 10 },
  { field: 'phone', required: true, weight: 10 },
  { field: 'storage_types', required: true, weight: 15 },
  { field: 'total_capacity', required: true, weight: 10 },
  { field: 'opening_hours', required: true, weight: 10 },
  { field: 'parking_available', required: false, weight: 5 },
  { field: 'pmr_accessible', required: false, weight: 5 },
  { field: 'security_measures', required: true, weight: 15 },
];

function getFieldsForType(type: PartnerType): FieldValidation[] {
  switch (type) {
    case 'vendor':
      return VENDOR_FIELDS;
    case 'driver':
      return DRIVER_FIELDS;
    case 'relay_host':
      return RELAY_HOST_FIELDS;
  }
}

function calculateCompletenessScore(
  data: Record<string, any>,
  fields: FieldValidation[]
): number {
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const field of fields) {
    totalWeight += field.weight;

    const value = data[field.field];
    if (value !== undefined && value !== null && value !== '') {
      earnedWeight += field.weight;
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

function determineGrade(completeness: number): AIGrade {
  if (completeness >= 85) return 'A';
  if (completeness >= 70) return 'B';
  return 'C';
}

function identifyStrengthsAndWeaknesses(
  data: Record<string, any>,
  fields: FieldValidation[]
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const field of fields) {
    const value = data[field.field];
    const hasValue = value !== undefined && value !== null && value !== '';

    if (field.required) {
      if (hasValue) {
        if (field.weight >= 15) {
          strengths.push(`${field.field} complet et conforme`);
        }
      } else {
        weaknesses.push(`${field.field} manquant (requis)`);
      }
    }
  }

  return { strengths, weaknesses };
}

function generateResponseTemplate(
  type: PartnerType,
  grade: AIGrade,
  name: string,
  weaknesses: string[]
): { subject: string; body: string } {
  const partnerTypeLabel = {
    vendor: 'vendeur',
    driver: 'livreur',
    relay_host: 'hôte de point relais',
  }[type];

  if (grade === 'A') {
    return {
      subject: `Bienvenue chez DELIKREOL - Candidature ${partnerTypeLabel} acceptée`,
      body: `Bonjour ${name},

Excellente nouvelle ! Votre candidature pour devenir ${partnerTypeLabel} sur DELIKREOL a été acceptée.

Votre dossier est complet et conforme à nos critères. Nous sommes ravis de vous compter parmi nos partenaires.

Prochaines étapes :
1. Vous recevrez vos identifiants de connexion dans les 24h
2. Formation en ligne disponible sur votre tableau de bord
3. Activation de votre profil après la formation

Bienvenue dans la famille DELIKREOL !

Cordialement,
L'équipe DELIKREOL`,
    };
  }

  if (grade === 'B') {
    return {
      subject: `DELIKREOL - Complément d'information requis`,
      body: `Bonjour ${name},

Merci pour votre candidature en tant que ${partnerTypeLabel} sur DELIKREOL.

Votre dossier est prometteur, mais nous avons besoin de quelques informations complémentaires :

${weaknesses.map(w => `- ${w}`).join('\n')}

Merci de compléter ces éléments dans les 7 jours pour que nous puissions finaliser votre inscription.

Cordialement,
L'équipe DELIKREOL`,
    };
  }

  return {
    subject: `DELIKREOL - Candidature ${partnerTypeLabel}`,
    body: `Bonjour ${name},

Merci pour votre intérêt pour DELIKREOL.

Malheureusement, votre candidature ne répond pas à nos critères actuels :

${weaknesses.map(w => `- ${w}`).join('\n')}

Nous vous encourageons à re-postuler une fois ces éléments complétés.

Cordialement,
L'équipe DELIKREOL`,
  };
}

export async function scoreApplication(
  application: PartnerApplication
): Promise<AIFeedback> {
  try {
    const fields = getFieldsForType(application.partner_type);
    const completenessScore = calculateCompletenessScore(application.application_data, fields);
    const grade = determineGrade(completenessScore);
    const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(
      application.application_data,
      fields
    );

    const response_template = generateResponseTemplate(
      application.partner_type,
      grade,
      application.applicant_name,
      weaknesses
    );

    const feedback: AIFeedback = {
      grade,
      completeness_score: completenessScore,
      strengths: strengths.slice(0, 5),
      weaknesses: weaknesses.slice(0, 5),
      response_template,
    };

    return feedback;
  } catch (error) {
    console.error('Error scoring application:', error);
    throw new Error('Échec de l\'évaluation de la candidature');
  }
}

export async function submitApplication(
  application: PartnerApplication
): Promise<string> {
  try {
    const feedback = await scoreApplication(application);

    const { data, error } = await supabase
      .from('partner_applications')
      .insert({
        applicant_name: application.applicant_name,
        applicant_email: application.applicant_email,
        applicant_phone: application.applicant_phone,
        partner_type: application.partner_type,
        application_data: application.application_data,
        status: 'submitted',
        ai_score: feedback.grade,
        ai_feedback: feedback,
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw new Error('Échec de la soumission de la candidature');
  }
}

export async function getApplications(
  filters?: {
    partner_type?: PartnerType;
    status?: ApplicationStatus;
    ai_score?: AIGrade;
  }
): Promise<PartnerApplication[]> {
  try {
    let query = supabase
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.partner_type) {
      query = query.eq('partner_type', filters.partner_type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.ai_score) {
      query = query.eq('ai_score', filters.ai_score);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Échec du chargement des candidatures');
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('partner_applications')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', applicationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    return false;
  }
}

export async function getApplicationStats(): Promise<{
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byType: Record<PartnerType, number>;
  byGrade: Record<AIGrade, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('partner_applications')
      .select('partner_type, status, ai_score');

    if (error) throw error;

    const applications = data || [];

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byGrade: Record<string, number> = {};

    applications.forEach((app: any) => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      byType[app.partner_type] = (byType[app.partner_type] || 0) + 1;
      if (app.ai_score) {
        byGrade[app.ai_score] = (byGrade[app.ai_score] || 0) + 1;
      }
    });

    return {
      total: applications.length,
      byStatus: byStatus as Record<ApplicationStatus, number>,
      byType: byType as Record<PartnerType, number>,
      byGrade: byGrade as Record<AIGrade, number>,
    };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return {
      total: 0,
      byStatus: {} as Record<ApplicationStatus, number>,
      byType: {} as Record<PartnerType, number>,
      byGrade: {} as Record<AIGrade, number>,
    };
  }
}
