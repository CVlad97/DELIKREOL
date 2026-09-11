import { describe, expect, it } from 'vitest';
import { formatMenuSelection, menuSelectionKey, normalizeMenuOptions } from './menu';

describe('menu selections', () => {
  it('uses a stable key regardless of selection order', () => {
    expect(menuSelectionKey({ sides: ['Riz', 'Frites'], drinks: ['Eau'], sauces: ['Chien', 'Piment'] }))
      .toBe(menuSelectionKey({ sides: ['Frites', 'Riz'], drinks: ['Eau'], sauces: ['Piment', 'Chien'] }));
  });

  it('keeps different compositions on separate cart lines', () => {
    expect(menuSelectionKey({ sides: ['Riz'], drinks: ['Eau'], sauces: ['Chien'] }))
      .not.toBe(menuSelectionKey({ sides: ['Frites'], drinks: ['Eau'], sauces: ['Chien'] }));
  });

  it('separates lines when sauce or consigne changes', () => {
    expect(menuSelectionKey({ sides: ['Riz'], drinks: ['Eau'], sauces: ['Chien'], instructions: 'sans piment' }))
      .not.toBe(menuSelectionKey({ sides: ['Riz'], drinks: ['Eau'], sauces: ['Créole'], instructions: 'sauce à part' }));
  });

  it('formats choices for cart and WhatsApp summaries', () => {
    expect(formatMenuSelection({ sides: ['Riz'], drinks: ['Jus local'], sauces: ['Sauce chien'], instructions: 'sauce à part' })).toEqual([
      'Accompagnement : Riz',
      'Boisson : Jus local',
      'Sauce : Sauce chien',
      'Consigne : sauce à part',
    ]);
  });

  it('normalizes old menu configurations without sauces', () => {
    expect(normalizeMenuOptions({ sides: ['Riz'], drinks: ['Eau'], included_side_count: 1, included_drink_count: 1 })).toEqual({
      sides: ['Riz'],
      drinks: ['Eau'],
      sauces: [],
      included_side_count: 1,
      included_drink_count: 1,
      included_sauce_count: 0,
      instructions_enabled: true,
    });
  });

  it('rejects an impossible partner configuration', () => {
    expect(normalizeMenuOptions({ sides: ['Riz'], drinks: [], sauces: ['Chien'], included_side_count: 2, included_drink_count: 0, included_sauce_count: 1 })).toBeNull();
  });
});
