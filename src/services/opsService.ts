import { demoOrders, demoStats, demoVendors, orderStatusLabels } from '../data/demoData';
import { readDemoOrders, readDemoPartners } from '../data/demoDb';
import { listClientRequests } from './clientRequestsService';

export type MissionStage = 'new' | 'qualified' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type ComplianceStatus = 'valid' | 'expiring' | 'missing';

export interface OpsClient {
  id: string;
  name: string;
  phone: string;
  zone: string;
  locality: string;
  channel: 'site' | 'whatsapp' | 'telegram' | 'manual';
  requestCount: number;
  lastRequestAt: string;
  priority: 'normal' | 'vip' | 'watch';
  notes: string;
}

export interface OpsPartner {
  id: string;
  name: string;
  category: string;
  zone: string;
  locality: string;
  status: 'active' | 'pending' | 'suspended';
  commissionRate: number;
  contactPhone: string;
  visibility: 'public' | 'private';
  story: string;
  complianceStatus: ComplianceStatus;
  documents: Array<{
    type: string;
    status: ComplianceStatus;
    expiresAt?: string;
  }>;
}

export interface OpsMission {
  id: string;
  reference: string;
  stage: MissionStage;
  serviceType: 'meal' | 'groceries' | 'parcel' | 'service' | 'custom';
  clientName: string;
  clientLocality: string;
  partnerName: string;
  partnerLocality: string;
  canTakeOrder: boolean;
  eligibilityReason: string;
  zone: string;
  createdAt: string;
  dueLabel: string;
  channel: 'site' | 'whatsapp' | 'telegram' | 'manual';
  amount: number;
  partnerCost: number;
  deliveryFee: number;
  commission: number;
  margin: number;
  paymentStatus: 'pending' | 'quoted' | 'paid' | 'cash';
  operatorNotes: string;
}

export interface OpsFinanceSummary {
  grossToday: number;
  partnerCostsToday: number;
  deliveryFeesToday: number;
  commissionsToday: number;
  marginToday: number;
  averageBasket: number;
  topCategories: Array<{ name: string; count: number }>;
  topZones: Array<{ name: string; count: number }>;
}

export interface OpsAlert {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel?: string;
  actionView?: string;
}

export type ProactiveDeliveryOwner = 'ops' | 'partner' | 'driver' | 'support';

export interface ProactiveDeliveryStep {
  id: string;
  trigger: string;
  owner: ProactiveDeliveryOwner;
  targetMinutes: number;
  action: string;
  evidence: string;
  fallback: string;
}

export interface OpsInvestorReadiness {
  score: number;
  level: 'pilot-ready' | 'needs-attention' | 'blocked';
  summary: string;
  blockers: string[];
  nextActions: string[];
}

export interface OpsDashboardSnapshot {
  generatedAt: string;
  kpis: {
    requestsToday: number;
    awaitingQualification: number;
    assignedMissions: number;
    activeMissions: number;
    completedToday: number;
    incidents: number;
    availablePartners: number;
    nonCompliantPartners: number;
    estimatedRevenue: number;
    estimatedCommission: number;
    averageHandlingMinutes: number;
  };
  missionPipeline: Record<MissionStage, number>;
  missions: OpsMission[];
  clients: OpsClient[];
  partners: OpsPartner[];
  finance: OpsFinanceSummary;
  alerts: OpsAlert[];
}

const missionStageLabels: Record<MissionStage, string> = {
  new: 'Nouvelle',
  qualified: 'Qualifiee',
  assigned: 'Assignee',
  in_progress: 'En cours',
  completed: 'Terminee',
  cancelled: 'Annulee',
};

export const opsMissionStageLabels = missionStageLabels;

export const proactiveDeliveryPlaybook: ProactiveDeliveryStep[] = [
  {
    id: 'order-capture',
    trigger: 'Commande client enregistree',
    owner: 'ops',
    targetMinutes: 3,
    action: 'Verifier adresse, panier, mode livraison/retrait et statut paiement avant transmission.',
    evidence: 'Commande pending avec total, produits, client et instructions lisibles.',
    fallback: 'Appeler ou envoyer un message support si adresse incomplete.',
  },
  {
    id: 'partner-confirmation',
    trigger: 'Commande qualifiee',
    owner: 'partner',
    targetMinutes: 7,
    action: 'Confirmer disponibilite, delai de preparation, substitution eventuelle et heure de retrait.',
    evidence: 'Reponse partenaire OK disponible + delai preparation.',
    fallback: 'Basculer vers alternative ou prevenir le client avant paiement final.',
  },
  {
    id: 'driver-preassign',
    trigger: 'Commande en preparation avec livraison',
    owner: 'driver',
    targetMinutes: 5,
    action: 'Pre-affecter un livreur dans le rayon partenaire et partager pickup/drop sans depart anticipe.',
    evidence: 'Livreur identifie, zone compatible, vehicule adapte.',
    fallback: 'Proposer retrait client ou replanifier le creneau.',
  },
  {
    id: 'eta-control',
    trigger: 'Commande prete',
    owner: 'ops',
    targetMinutes: 4,
    action: 'Confirmer depart, ETA client, lien Maps et consigne de remise.',
    evidence: 'Statut in_delivery, ETA communique, incident note si retard.',
    fallback: 'Escalade support si ETA depasse le creneau annonce.',
  },
  {
    id: 'delivery-proof',
    trigger: 'Remise client',
    owner: 'support',
    targetMinutes: 2,
    action: 'Cloturer livraison, verifier satisfaction courte et archiver preuve operationnelle.',
    evidence: 'Commande delivered avec horodatage et commentaire si incident.',
    fallback: 'Ouvrir litige manuel si client ou livreur signale un probleme.',
  },
];

function inferZoneFromAddress(address: string | undefined): string {
  if (!address) return 'Centre Martinique';
  const lower = address.toLowerCase();
  if (lower.includes('fort')) return 'Fort-de-France';
  if (lower.includes('lamentin')) return 'Lamentin';
  if (lower.includes('marin')) return 'Sud Atlantique';
  if (lower.includes('robert')) return 'Nord Atlantique';
  if (lower.includes('schoel')) return 'Centre Caraibe';
  return 'Martinique';
}

function normalizeLocality(value: string | undefined): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function localityFromText(value: string | undefined): string {
  if (!value) return 'Martinique';
  const firstSegment = value.split('—')[0]?.split(',')[0]?.trim() || value.trim();
  return firstSegment || 'Martinique';
}

function isLocalityCompatible(partnerLocality: string, clientLocality: string) {
  const partner = normalizeLocality(partnerLocality);
  const client = normalizeLocality(clientLocality);

  if (!partner || !client) return false;
  if (partner === client) return true;
  if (partner.includes(client) || client.includes(partner)) return true;
  if (partner === 'martinique' || client === 'martinique') return true;
  return false;
}

function buildPartnerLocalityIndex() {
  const index = new Map<string, string>();

  demoVendors.forEach((vendor) => {
    index.set(normalizeLocality(vendor.business_name), localityFromText(inferZoneFromAddress(vendor.address)));
  });

  readDemoPartners().forEach((partner) => {
    const name = String(partner.company_name ?? '').trim();
    const locality = localityFromText(String(partner.address ?? partner.zone_label ?? 'Martinique'));
    if (name) {
      index.set(normalizeLocality(name), locality);
    }
  });

  return index;
}

function resolvePartnerLocality(partnerName: string) {
  const index = buildPartnerLocalityIndex();
  return index.get(normalizeLocality(partnerName)) || inferZoneFromAddress(partnerName);
}

function mapOrderStatusToStage(status: string): MissionStage {
  switch (status) {
    case 'pending':
      return 'new';
    case 'confirmed':
      return 'qualified';
    case 'preparing':
    case 'ready':
      return 'assigned';
    case 'in_delivery':
      return 'in_progress';
    case 'delivered':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'new';
  }
}

function buildOpsMissions(): OpsMission[] {
  const partnerLocalityIndex = buildPartnerLocalityIndex();
  const localOrders = readDemoOrders();
  const sourceOrders = localOrders.length > 0
    ? localOrders
    : demoOrders.map((order) => ({
        id: order.id,
        customer_id: order.customer_name,
        order_number: order.order_number,
        status: order.status,
        delivery_type: order.delivery_type,
        delivery_address: order.delivery_address,
        delivery_fee: 4,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items.map((item, index) => ({
          id: `${order.id}_${index}`,
          order_id: order.id,
          product_id: `${order.id}_product_${index}`,
          vendor_id: order.vendor_name,
          quantity: item.qty,
          unit_price: item.price,
          subtotal: item.qty * item.price,
          vendor_commission: item.qty * item.price * 0.15,
        })),
      }));

  return sourceOrders.slice(0, 8).map((order, index) => {
    const stage = mapOrderStatusToStage(order.status);
    const totalAmount = order.total_amount ?? 0;
    const deliveryFee = order.delivery_fee ?? 4;
    const primaryVendorId = order.items?.[0]?.vendor_id;
    const partnerName =
      (order as { vendor_name?: string }).vendor_name ||
      demoVendors.find((vendor) => vendor.id === primaryVendorId)?.business_name ||
      `Partenaire ${index + 1}`;
    const clientLocality = localityFromText(order.delivery_address);
    const partnerLocality = partnerLocalityIndex.get(normalizeLocality(partnerName)) || resolvePartnerLocality(partnerName);
    const canTakeOrder = isLocalityCompatible(partnerLocality, clientLocality);
    const partnerCost = Number((totalAmount * 0.72).toFixed(2));
    const commission = Number((totalAmount * 0.18).toFixed(2));
    const margin = Number((totalAmount + deliveryFee - partnerCost).toFixed(2));

    return {
      id: order.id,
      reference: order.order_number,
      stage,
      serviceType: index % 5 === 0 ? 'groceries' : index % 4 === 0 ? 'parcel' : 'meal',
      clientName: index < demoOrders.length ? demoOrders[index].customer_name : `Client ${index + 1}`,
      clientLocality,
      partnerName,
      partnerLocality,
      canTakeOrder,
      eligibilityReason: canTakeOrder
        ? `OK zone: ${partnerLocality} vers ${clientLocality}`
        : `Hors zone probable: ${partnerLocality} vs ${clientLocality}`,
      zone: inferZoneFromAddress(order.delivery_address),
      createdAt: order.created_at,
      dueLabel: stage === 'completed' ? 'Cloturee' : stage === 'in_progress' ? 'Moins de 20 min' : "A traiter aujourd'hui",
      channel: index % 3 === 0 ? 'whatsapp' : index % 3 === 1 ? 'site' : 'manual',
      amount: totalAmount,
      partnerCost,
      deliveryFee,
      commission,
      margin,
      paymentStatus: stage === 'completed' ? 'paid' : index % 2 === 0 ? 'quoted' : 'pending',
      operatorNotes: stage === 'new' ? 'Verifier adresse et panier' : stage === 'assigned' ? 'Confirmer disponibilite partenaire' : 'RAS',
    };
  });
}

async function buildOpsClients(missions: OpsMission[]): Promise<OpsClient[]> {
  const localRequests = await listClientRequests('demo_customer').catch(() => []);
  const missionGroups = new Map<string, OpsMission[]>();

  missions.forEach((mission) => {
    const group = missionGroups.get(mission.clientName) || [];
    group.push(mission);
    missionGroups.set(mission.clientName, group);
  });

  return Array.from(missionGroups.entries()).slice(0, 6).map(([clientName, items], index) => ({
    id: `client_${index + 1}`,
    name: clientName,
    phone: `0696 ${String(10 + index).padStart(2, '0')} ${String(20 + index).padStart(2, '0')} ${String(30 + index).padStart(2, '0')}`,
    zone: items[0]?.zone || 'Martinique',
    locality: items[0]?.clientLocality || items[0]?.zone || 'Martinique',
    channel: items[0]?.channel || 'site',
    requestCount: items.length + (index < localRequests.length ? 1 : 0),
    lastRequestAt: items[0]?.createdAt || new Date().toISOString(),
    priority: items.length >= 2 ? 'vip' : index === 0 ? 'watch' : 'normal',
    notes: items.length >= 2 ? 'Client recurrent, rappeler si delai > 10 min.' : 'Validation manuelle suffisante.',
  }));
}

function buildOpsPartners(): OpsPartner[] {
  const localPartners = readDemoPartners();
  const basePartners = demoVendors.map((vendor, index) => ({
    id: vendor.id,
    name: vendor.business_name,
    category: vendor.business_type,
    zone: inferZoneFromAddress(vendor.address),
    locality: localityFromText(vendor.address),
    status: vendor.is_active ? 'active' as const : 'suspended' as const,
    commissionRate: vendor.commission_rate,
    contactPhone: vendor.phone,
    visibility: index % 4 === 0 ? 'private' as const : 'public' as const,
    story: vendor.description,
    complianceStatus: index % 5 === 0 ? 'expiring' as const : vendor.is_active ? 'valid' as const : 'missing' as const,
    documents: [
      { type: 'Identite', status: 'valid' as const },
      { type: 'RC Pro', status: index % 5 === 0 ? 'expiring' as const : 'valid' as const, expiresAt: '2026-06-30' },
      { type: 'HACCP', status: vendor.business_type === 'restaurant' ? (index % 3 === 0 ? 'missing' as const : 'valid' as const) : 'valid' as const },
    ],
  }));

  const onboardedPartners = localPartners.map((partner) => ({
    id: partner.id,
    name: partner.company_name,
    category: partner.partner_type,
    zone: inferZoneFromAddress(partner.address),
    locality: localityFromText(partner.address),
    status: partner.status === 'submitted' ? 'pending' as const : 'active' as const,
    commissionRate: 15,
    contactPhone: partner.phone || 'N/A',
    visibility: 'private' as const,
    story: 'Candidature a qualifier avant activation.',
    complianceStatus: 'missing' as const,
    documents: [{ type: 'Dossier legal', status: 'missing' as const }],
  }));

  return [...basePartners, ...onboardedPartners].slice(0, 8);
}

function buildFinanceSummary(missions: OpsMission[]): OpsFinanceSummary {
  const grossToday = missions.reduce((sum, mission) => sum + mission.amount + mission.deliveryFee, 0);
  const partnerCostsToday = missions.reduce((sum, mission) => sum + mission.partnerCost, 0);
  const deliveryFeesToday = missions.reduce((sum, mission) => sum + mission.deliveryFee, 0);
  const commissionsToday = missions.reduce((sum, mission) => sum + mission.commission, 0);
  const marginToday = missions.reduce((sum, mission) => sum + mission.margin, 0);
  const averageBasket = missions.length > 0 ? grossToday / missions.length : 0;

  const topCategories = Object.entries(
    missions.reduce<Record<string, number>>((acc, mission) => {
      acc[mission.serviceType] = (acc[mission.serviceType] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topZones = Object.entries(
    missions.reduce<Record<string, number>>((acc, mission) => {
      acc[mission.zone] = (acc[mission.zone] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    grossToday: Number(grossToday.toFixed(2)),
    partnerCostsToday: Number(partnerCostsToday.toFixed(2)),
    deliveryFeesToday: Number(deliveryFeesToday.toFixed(2)),
    commissionsToday: Number(commissionsToday.toFixed(2)),
    marginToday: Number(marginToday.toFixed(2)),
    averageBasket: Number(averageBasket.toFixed(2)),
    topCategories,
    topZones,
  };
}

function buildAlerts(partners: OpsPartner[], missions: OpsMission[]): OpsAlert[] {
  const alerts: OpsAlert[] = [];
  const missingCompliance = partners.filter((partner) => partner.complianceStatus !== 'valid');
  const newMissions = missions.filter((mission) => mission.stage === 'new');
  const lowMargin = missions.filter((mission) => mission.margin < 5);

  if (newMissions.length > 0) {
    alerts.push({
      id: 'new-missions',
      level: 'high',
      title: `${newMissions.length} demandes a qualifier`,
      description: 'Verifier le besoin, confirmer le canal et affecter un partenaire avant relance manuelle.',
      actionLabel: 'Ouvrir operations',
      actionView: 'operations',
    });
  }

  if (missingCompliance.length > 0) {
    alerts.push({
      id: 'partner-compliance',
      level: 'medium',
      title: `${missingCompliance.length} partenaires a regulariser`,
      description: 'Documents incomplets ou bientot expires. Priorite aux partenaires visibles publiquement.',
      actionLabel: 'Voir partenaires',
      actionView: 'partners',
    });
  }

  if (lowMargin.length > 0) {
    alerts.push({
      id: 'low-margin',
      level: 'medium',
      title: `${lowMargin.length} missions a faible marge`,
      description: 'Verifier prix client, frais de livraison et cout partenaire avant diffusion large.',
      actionLabel: 'Voir finances',
      actionView: 'operations',
    });
  }

  alerts.push({
    id: 'ops-discipline',
    level: 'low',
    title: 'Discipline operative recommandee',
    description: 'Centraliser demandes WhatsApp, site et Telegram dans le pipeline avant execution terrain.',
  });

  return alerts;
}

export async function getOpsDashboardSnapshot(): Promise<OpsDashboardSnapshot> {
  const missions = buildOpsMissions();
  const clients = await buildOpsClients(missions);
  const partners = buildOpsPartners();
  const finance = buildFinanceSummary(missions);
  const alerts = buildAlerts(partners, missions);

  const missionPipeline = missions.reduce<Record<MissionStage, number>>(
    (acc, mission) => {
      acc[mission.stage] += 1;
      return acc;
    },
    {
      new: 0,
      qualified: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
  );

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      requestsToday: missions.length,
      awaitingQualification: missionPipeline.new + missionPipeline.qualified,
      assignedMissions: missionPipeline.assigned,
      activeMissions: missionPipeline.in_progress,
      completedToday: missionPipeline.completed,
      incidents: alerts.filter((alert) => alert.level === 'high').length,
      availablePartners: partners.filter((partner) => partner.status === 'active').length,
      nonCompliantPartners: partners.filter((partner) => partner.complianceStatus !== 'valid').length,
      estimatedRevenue: finance.grossToday,
      estimatedCommission: finance.commissionsToday,
      averageHandlingMinutes: demoStats.avg_delivery_time,
    },
    missionPipeline,
    missions,
    clients,
    partners,
    finance,
    alerts,
  };
}

export function getOpsInvestorReadiness(snapshot: OpsDashboardSnapshot): OpsInvestorReadiness {
  const pendingWeight = snapshot.kpis.awaitingQualification * 7;
  const complianceWeight = snapshot.kpis.nonCompliantPartners * 6;
  const incidentWeight = snapshot.kpis.incidents * 10;
  const partnerCoverageWeight = snapshot.kpis.availablePartners < 3 ? 14 : 0;
  const marginWeight = snapshot.finance.marginToday < 20 ? 8 : 0;
  const rawScore = 100 - pendingWeight - complianceWeight - incidentWeight - partnerCoverageWeight - marginWeight;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const blockers: string[] = [];
  const nextActions: string[] = [];

  if (snapshot.kpis.awaitingQualification > 0) {
    blockers.push(`${snapshot.kpis.awaitingQualification} demande(s) a qualifier avant execution terrain.`);
    nextActions.push('Traiter les commandes pending et confirmer panier, adresse, paiement et partenaire.');
  }

  if (snapshot.kpis.nonCompliantPartners > 0) {
    blockers.push(`${snapshot.kpis.nonCompliantPartners} partenaire(s) avec dossier documentaire incomplet ou expirant.`);
    nextActions.push('Prioriser la validation documentaire des partenaires visibles publiquement.');
  }

  if (snapshot.kpis.availablePartners < 3) {
    blockers.push('Couverture pilote trop courte pour rassurer un investisseur terrain.');
    nextActions.push('Activer au moins trois partenaires dans des rayons de livraison testables.');
  }

  if (snapshot.finance.marginToday < 20) {
    blockers.push('Marge operationnelle encore fragile sur les missions pilotes.');
    nextActions.push('Revoir frais de service, frais livraison et panier minimum avant extension.');
  }

  if (nextActions.length === 0) {
    nextActions.push('Lancer un test reel controle avec client, vendeur, livreur et preuve de remise.');
    nextActions.push('Documenter delai moyen, taux de confirmation et marge par mission.');
  }

  const level = score >= 78
    ? 'pilot-ready'
    : score >= 48
      ? 'needs-attention'
      : 'blocked';

  const summary = level === 'pilot-ready'
    ? 'Pret pour une demonstration investisseur en mode pilote controle.'
    : level === 'needs-attention'
      ? 'Demontrable, mais les points de qualification doivent etre traites avant extension.'
      : 'Trop de risques operationnels pour presenter comme pilote stable.';

  return {
    score,
    level,
    summary,
    blockers,
    nextActions: nextActions.slice(0, 4),
  };
}

export function getMissionStatusSummary(stage: MissionStage): string {
  return missionStageLabels[stage];
}

export function getPartnerWhatsAppLink(phone: string, partnerName: string): string {
  const digits = phone.replace(/\D/g, '');
  const text = encodeURIComponent(`Bonjour ${partnerName}, DELIKREOL souhaite confirmer votre disponibilite aujourd'hui.`);
  return `https://wa.me/${digits}?text=${text}`;
}

export function getTelegramShareLink(reference: string): string {
  const text = encodeURIComponent(`Mission ${reference} a suivre dans DELIKREOL OPS.`);
  return `https://t.me/share/url?url=https://cvlad97.github.io/DELIKREOL/&text=${text}`;
}

export function getGoogleMapsLink(zone: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${zone}, Martinique`)}`;
}

export function getWazeLink(zone: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(`${zone}, Martinique`)}&navigate=yes`;
}

export function getOrderStageLabelFromStatus(status: string): string {
  return orderStatusLabels[status] || status;
}
