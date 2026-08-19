import { describe, expect, it } from 'vitest';
import {
  buildLogisticsInvoiceDraft,
  buildOnboardingWhatsAppMessage,
  getElectronicInvoicingMilestones,
  getLaunchReadiness,
  getRequiredOnboardingDocuments,
} from './logisticsPartnerBilling';

describe('logisticsPartnerBilling', () => {
  it('builds a reviewable invoice draft without claiming PDP transmission', () => {
    const invoice = buildLogisticsInvoiceDraft({
      partnerKind: 'driver',
      partnerName: 'Kevin Mobilité',
      partnerSiret: '12345678900010',
      period: '2026-08',
      now: new Date('2026-08-19T12:00:00.000Z'),
      missions: [
        { id: 'm1', orderNumber: 'DK-1', completedAt: '2026-08-18', amount: 4 },
        { id: 'm2', orderNumber: 'DK-2', completedAt: '2026-08-19', amount: 5.5 },
      ],
    });

    expect(invoice.invoiceNumber).toBe('DK-LIV-KEVI-202608');
    expect(invoice.totalHT).toBe(9.5);
    expect(invoice.totalTTC).toBe(9.5);
    expect(invoice.status).toBe('ready_for_review');
    expect(invoice.electronicInvoicingStatus).toBe('pdp_required_before_send');
    expect(invoice.complianceNotes.join(' ')).toContain('Brouillon non transmis');
  });

  it('tracks current French e-invoicing milestones for small independent partners', () => {
    const milestones = getElectronicInvoicingMilestones(new Date('2026-08-19T00:00:00.000Z'));

    expect(milestones.receiveDeadline).toBe('2026-09-01');
    expect(milestones.smallBusinessIssueDeadline).toBe('2027-09-01');
    expect(milestones.receiveRequired).toBe(false);
    expect(milestones.smallBusinessIssueRequired).toBe(false);
  });

  it('separates driver and relay onboarding evidence', () => {
    expect(getRequiredOnboardingDocuments('driver')).toContain('Zones et horaires de disponibilité validés');
    expect(getRequiredOnboardingDocuments('relay_host')).toContain('Capacité de stockage par créneau');
  });

  it('builds a safe onboarding WhatsApp draft without sending it', () => {
    const message = buildOnboardingWhatsAppMessage({
      partnerKind: 'relay_host',
      name: 'Épicerie Test',
      commune: 'Ducos',
      phone: '0696000000',
      relayStorage: ['froid', 'sec'],
    });

    expect(message).toContain('Candidature point relais indépendant');
    expect(message).toContain('Statut : à vérifier par DELIKREOL avant activation.');
  });

  it('marks launch readiness only when all required controls are complete', () => {
    expect(getLaunchReadiness([
      { id: 'docs', label: 'Documents', required: true, complete: true },
      { id: 'invoice', label: 'Facture', required: true, complete: false },
    ])).toMatchObject({ required: 2, complete: 1, ready: false });
  });
});
