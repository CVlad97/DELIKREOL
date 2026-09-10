import { describe, expect, it } from 'vitest';
import { formatMenuSelection, menuSelectionKey, normalizeMenuOptions } from './menu';

describe('menu selections', () => {
  it('uses a stable key regardless of selection order', () => {
    expect(menuSelectionKey({ sides: ['Riz', 'Frites'], drinks: ['Eau'] }))
      .toBe(menuSelectionKey({ sides: ['Frites', 'Riz'], drinks: ['Eau'] }));
  });

  it('keeps different compositions on separate cart lines', () => {
    expect(menuSelectionKey({ sides: ['Riz'], drinks: ['Eau'] }))
      .not.toBe(menuSelectionKey({ sides: ['Frites'], drinks: ['Eau'] }));
  });

  it('formats choices for cart and WhatsApp summaries', () => {
    expect(formatMenuSelection({ sides: ['Riz'], drinks: ['Jus local'] })).toEqual([
      'Accompagnement : Riz',
      'Boisson : Jus local',
    ]);
  });

  it('rejects an impossible partner configuration', () => {
    expect(normalizeMenuOptions({ sides: ['Riz'], drinks: [], included_side_count: 2, included_drink_count: 0 })).toBeNull();
  });
});
