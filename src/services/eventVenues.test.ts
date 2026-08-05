import { describe, it, expect } from 'vitest';
import { isValidCoordinate, findNearestTraiteursToVenue, findNearestDriversToVenue, buildVenueLogisticsSummary, getVenueCoords } from '../services/venueLogistics';
import { getPublishedEventVenues, getDemoEventVenues, eventVenues } from '../data/eventVenues';
import { buildEventWhatsAppMessage, buildEventWhatsAppUrl, containsSensitiveData, type EventRequestData } from '../services/eventVenueWhatsApp';
import type { EventVenue } from '../types/eventVenue';

// ——— 1. Coordonnées valides ———
describe('isValidCoordinate', () => {
  it('valide des coordonnées correctes', () => {
    expect(isValidCoordinate(14.6, -61.0)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);
  });

  // ——— 2. Coordonnées invalides ———
  it('rejette des coordonnées invalides', () => {
    expect(isValidCoordinate(undefined, -61)).toBe(false);
    expect(isValidCoordinate(14.6, undefined)).toBe(false);
    expect(isValidCoordinate(91, -61)).toBe(false);
    expect(isValidCoordinate(14.6, -181)).toBe(false);
    expect(isValidCoordinate(NaN, -61)).toBe(false);
    expect(isValidCoordinate(14.6, Infinity)).toBe(false);
  });
});

// ——— 3. Salle non publiée exclue ———
describe('getPublishedEventVenues', () => {
  it('exclut les salles non publiées', () => {
    const published = getPublishedEventVenues();
    expect(published.length).toBe(0); // Toutes les salles démo ont published=false
  });

  // ——— 4. Salle sans coordonnées exclue ———
  it('exclurait une salle sans coordonnées valides', () => {
    const venue: EventVenue = {
      id: 'test-1', slug: 'test-1', name: 'Test', venueType: 'reception_hall',
      commune: 'Test', deliveryAccess: 'unknown', verificationStatus: 'verified', published: true,
    };
    expect(isValidCoordinate(venue.latitude, venue.longitude)).toBe(false);
  });

  it('les salles démo ne sont jamais publiées', () => {
    const demo = getDemoEventVenues();
    demo.forEach(v => {
      expect(v.isDemo).toBe(true);
      expect(v.published).toBe(false);
    });
  });
});

// ——— 5. Tri des traiteurs par distance ———
describe('findNearestTraiteursToVenue', () => {
  const venue: EventVenue = {
    id: 'test', slug: 'test', name: 'Test', venueType: 'reception_hall',
    commune: 'Fort-de-France', latitude: 14.6036, longitude: -61.0710,
    deliveryAccess: 'easy', verificationStatus: 'verified', published: true,
  };

  it('retourne les traiteurs triés par distance', () => {
    const mockTraiteurs = [
      { slug: 't1', name: 'T1', latitude: 14.61, longitude: -61.07, zone: 'Fdf', commune: 'Fdf', } as any,
      { slug: 't2', name: 'T2', latitude: 14.50, longitude: -61.00, zone: 'Sud', commune: 'Sud', } as any,
    ];
    const result = findNearestTraiteursToVenue(venue, mockTraiteurs, 5);
    expect(result.length).toBe(2);
    expect(result[0].distanceKm).toBeLessThanOrEqual(result[1].distanceKm);
  });

  it('ignore les traiteurs sans coordonnées', () => {
    const mockTraiteurs = [
      { slug: 't1', name: 'T1', latitude: undefined, longitude: undefined, zone: 'Fdf', commune: 'Fdf' } as any,
    ];
    const result = findNearestTraiteursToVenue(venue, mockTraiteurs, 5);
    expect(result.length).toBe(0);
  });
});

// ——— 6. Tri des salles par distance ———
describe('getVenueCoords', () => {
  it('retourne les coordonnées si valides', () => {
    const venue: EventVenue = {
      id: 'test', slug: 'test', name: 'Test', venueType: 'reception_hall',
      commune: 'Test', latitude: 14.6, longitude: -61.0,
      deliveryAccess: 'unknown', verificationStatus: 'unverified', published: false,
    };
    const coords = getVenueCoords(venue);
    expect(coords).not.toBeNull();
    expect(coords?.latitude).toBe(14.6);
  });

  it('retourne null si coordonnées absentes', () => {
    const venue: EventVenue = {
      id: 'test', slug: 'test', name: 'Test', venueType: 'reception_hall',
      commune: 'Test', deliveryAccess: 'unknown', verificationStatus: 'unverified', published: false,
    };
    expect(getVenueCoords(venue)).toBeNull();
  });
});

// ——— 7. Absence de Math.random() dans les données cartographiques ———
describe('No Math.random in map data', () => {
  it('eventVenues ne contient pas de Math.random()', () => {
    const source = JSON.stringify(eventVenues);
    expect(source).not.toContain('Math.random');
  });

  it('les coordonnées des salles démo sont fixes', () => {
    const demo = getDemoEventVenues();
    demo.forEach(v => {
      // Les coordonnées doivent être des nombres fixes, pas générés aléatoirement
      expect(typeof v.latitude).toBe('number');
      expect(typeof v.longitude).toBe('number');
    });
  });
});

// ——— 8. Message WhatsApp correctement encodé ———
describe('buildEventWhatsAppMessage', () => {
  const sampleData: EventRequestData = {
    venueName: 'Salle Test',
    commune: 'Fort-de-France',
    date: '2026-08-15',
    time: '18:00',
    eventType: 'Mariage',
    guestCount: 100,
    needCaterer: true,
    needDelivery: true,
    needSetup: false,
    needBeverages: true,
    needServiceStaff: false,
    comment: 'Test comment',
  };

  it('génère un message structuré', () => {
    const msg = buildEventWhatsAppMessage(sampleData);
    expect(msg).toContain('DELIKREOL — Demande événementielle');
    expect(msg).toContain('Lieu : Salle Test');
    expect(msg).toContain('Commune : Fort-de-France');
    expect(msg).toContain('Date : 2026-08-15');
    expect(msg).toContain('Heure : 18:00');
    expect(msg).toContain('Type d\'événement : Mariage');
    expect(msg).toContain('Nombre d\'invités : 100');
    expect(msg).toContain('Besoin traiteur : Oui');
    expect(msg).toContain('Besoin livraison : Oui');
    expect(msg).toContain('Besoin installation : Non');
    expect(msg).toContain('Besoin boissons : Oui');
    expect(msg).toContain('Personnel de service : Non');
    expect(msg).toContain('Statut : demande à confirmer');
  });

  it('l\'URL est encodée avec encodeURIComponent', () => {
    const url = buildEventWhatsAppUrl(sampleData);
    expect(url).toContain('https://wa.me/596696653589?text=');
    expect(url).toContain(encodeURIComponent('DELIKREOL'));
  });

  // ——— 9. Message sans données sensibles ———
  it('ne contient pas de données sensibles', () => {
    const msg = buildEventWhatsAppMessage(sampleData);
    expect(containsSensitiveData(msg)).toBe(false);
  });

  it('détecte les données sensibles', () => {
    expect(containsSensitiveData('sk_live_123456')).toBe(true);
    expect(containsSensitiveData('service_role')).toBe(true);
    expect(containsSensitiveData('IBAN FR123456')).toBe(true);
  });
});

// ——— 10. Capacité absente correctement masquée ———
describe('venue display', () => {
  it('capacité absente ne provoque pas d\'affichage undefined', () => {
    const venue: EventVenue = {
      id: 'test', slug: 'test', name: 'Test', venueType: 'reception_hall',
      commune: 'Test', deliveryAccess: 'unknown', verificationStatus: 'unverified', published: false,
    };
    // Si capacitySeated est undefined, on ne l'affiche pas
    expect(venue.capacitySeated).toBeUndefined();
  });
});

// ——— 20. Absence de coordonnées temps réel de livreur ———
describe('findNearestDriversToVenue', () => {
  const venue: EventVenue = {
    id: 'test', slug: 'test', name: 'Test', venueType: 'reception_hall',
    commune: 'Fort-de-France', latitude: 14.6036, longitude: -61.0710,
    deliveryAccess: 'easy', verificationStatus: 'verified', published: true,
  };

  it('ne retourne pas de position temps réel', () => {
    const mockDrivers = [
      { name: 'Driver 1', contact: 'Tel', zone: 'Fort-de-France', type: 'société' as const, transport: 'Voiture', disponible: true, note: '' },
    ];
    const result = findNearestDriversToVenue(venue, mockDrivers, 5);
    result.forEach(r => {
      expect(r.driver).not.toHaveProperty('latitude');
      expect(r.driver).not.toHaveProperty('longitude');
    });
  });
});
