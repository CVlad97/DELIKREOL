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
  partnerName: string;
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
    const partnerCost = Number((totalAmount * 0.72).toFixed(2));
    const commission = Number((totalAmount * 0.18).toFixed(2));
    const margin = Number((totalAmount + deliveryFee - partnerCost).toFixed(2));

    return {
      id: order.id,
      reference: order.order_number,
      stage,
      serviceType: index % 5 === 0 ? 'groceries' : index % 4 === 0 ? 'parcel' : 'meal',
      clientName: index < demoOrders.length ? demoOrders[index].customer_name : `Client ${index + 1}`,
      partnerName: index < demoOrders.length ? demoOrders[index].vendor_name : `Partenaire ${index + 1}`,
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
