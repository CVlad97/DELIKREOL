export type LogisticsPartnerKind = 'driver' | 'relay_host';

export type LogisticsMissionForBilling = {
  id: string;
  orderNumber: string;
  completedAt: string;
  amount: number;
  label?: string;
};

export type LogisticsInvoiceDraft = {
  invoiceNumber: string;
  partnerKind: LogisticsPartnerKind;
  partnerName: string;
  partnerSiret: string | null;
  period: string;
  issueDate: string;
  dueDate: string;
  lines: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: 'draft' | 'ready_for_review';
  electronicInvoicingStatus: 'not_transmitted' | 'pdp_required_before_send';
  complianceNotes: string[];
};

export type LaunchReadinessItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

const TVA_RATE = 0;
const ONE_DAY_MS = 86_400_000;

export function getElectronicInvoicingMilestones(currentDate = new Date()) {
  const receiveDeadline = new Date('2026-09-01T00:00:00.000Z');
  const smallBusinessIssueDeadline = new Date('2027-09-01T00:00:00.000Z');

  return {
    currentDate: currentDate.toISOString().slice(0, 10),
    receiveDeadline: receiveDeadline.toISOString().slice(0, 10),
    smallBusinessIssueDeadline: smallBusinessIssueDeadline.toISOString().slice(0, 10),
    receiveRequired: currentDate >= receiveDeadline,
    smallBusinessIssueRequired: currentDate >= smallBusinessIssueDeadline,
  };
}

export function getRequiredOnboardingDocuments(kind: LogisticsPartnerKind) {
  const base = [
    'Identité du représentant',
    'SIRET ou justificatif d’activité indépendante',
    'Attestation d’assurance responsabilité civile professionnelle',
    'Coordonnées de contact WhatsApp vérifiées',
    'Acceptation des conditions partenaires DELIKREOL',
  ];

  if (kind === 'driver') {
    return [
      ...base,
      'Permis ou justificatif adapté au véhicule déclaré',
      'Attestation véhicule ou assurance mobilité',
      'Zones et horaires de disponibilité validés',
    ];
  }

  return [
    ...base,
    'Adresse du point de retrait vérifiée',
    'Capacité de stockage par créneau',
    'Compatibilité chaud/froid/surgelé déclarée',
    'Procédure de remise colis et code de retrait validée',
  ];
}

export function buildLogisticsInvoiceDraft(params: {
  partnerKind: LogisticsPartnerKind;
  partnerName: string;
  partnerSiret?: string | null;
  period: string;
  missions: LogisticsMissionForBilling[];
  now?: Date;
}): LogisticsInvoiceDraft {
  const now = params.now || new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const dueDate = new Date(now.getTime() + 30 * ONE_DAY_MS).toISOString().slice(0, 10);
  const prefix = params.partnerKind === 'driver' ? 'LIV' : 'REL';
  const safeName = params.partnerName.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'PART';
  const totalHT = Math.round(params.missions.reduce((sum, mission) => sum + mission.amount, 0) * 100) / 100;
  const totalTVA = Math.round(totalHT * TVA_RATE * 100) / 100;

  return {
    invoiceNumber: `DK-${prefix}-${safeName}-${params.period.replace(/\D/g, '') || issueDate.replace(/\D/g, '')}`,
    partnerKind: params.partnerKind,
    partnerName: params.partnerName,
    partnerSiret: params.partnerSiret?.trim() || null,
    period: params.period,
    issueDate,
    dueDate,
    lines: params.missions.map((mission) => ({
      label: mission.label || `Prestation logistique commande ${mission.orderNumber}`,
      quantity: 1,
      unitPrice: mission.amount,
      total: mission.amount,
    })),
    totalHT,
    totalTVA,
    totalTTC: totalHT + totalTVA,
    status: params.missions.length > 0 ? 'ready_for_review' : 'draft',
    electronicInvoicingStatus: 'pdp_required_before_send',
    complianceNotes: [
      'Brouillon non transmis à une plateforme de dématérialisation partenaire.',
      'À contrôler par DELIKREOL avant émission ou reversement.',
      'TVA à confirmer selon le statut fiscal réel du partenaire.',
    ],
  };
}

export function buildOnboardingWhatsAppMessage(params: {
  partnerKind: LogisticsPartnerKind;
  name: string;
  commune: string;
  phone: string;
  availability?: string;
  zones?: string[];
  relayStorage?: string[];
}) {
  const title = params.partnerKind === 'driver'
    ? 'Candidature livreur indépendant'
    : 'Candidature point relais indépendant';
  const lines = [
    `DELIKREOL — ${title}`,
    `Nom : ${params.name}`,
    `Commune : ${params.commune}`,
    `Téléphone : ${params.phone}`,
    params.availability ? `Disponibilité : ${params.availability}` : '',
    params.zones?.length ? `Zones : ${params.zones.join(', ')}` : '',
    params.relayStorage?.length ? `Stockage relais : ${params.relayStorage.join(', ')}` : '',
    'Statut : à vérifier par DELIKREOL avant activation.',
  ];
  return lines.filter(Boolean).join('\n');
}

export function getLaunchReadiness(items: LaunchReadinessItem[]) {
  const requiredItems = items.filter((item) => item.required);
  const completedRequiredItems = requiredItems.filter((item) => item.complete);
  return {
    required: requiredItems.length,
    complete: completedRequiredItems.length,
    ready: requiredItems.length > 0 && completedRequiredItems.length === requiredItems.length,
  };
}
