export interface MenuOptions {
  sides: string[];
  drinks: string[];
  included_side_count: number;
  included_drink_count: number;
}

export interface MenuSelection {
  sides: string[];
  drinks: string[];
}

export function normalizeMenuOptions(value: unknown): MenuOptions | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.sides) || !Array.isArray(record.drinks)) return null;
  if (!record.sides.every((item) => typeof item === 'string') || !record.drinks.every((item) => typeof item === 'string')) return null;
  const includedSideCount = Number(record.included_side_count);
  const includedDrinkCount = Number(record.included_drink_count);
  if (!Number.isInteger(includedSideCount) || !Number.isInteger(includedDrinkCount)) return null;
  if (includedSideCount < 0 || includedSideCount > record.sides.length || includedDrinkCount < 0 || includedDrinkCount > record.drinks.length) return null;
  return {
    sides: record.sides,
    drinks: record.drinks,
    included_side_count: includedSideCount,
    included_drink_count: includedDrinkCount,
  };
}

export function menuSelectionKey(selection?: MenuSelection): string {
  if (!selection) return 'standard';
  return JSON.stringify({
    sides: [...selection.sides].sort((a, b) => a.localeCompare(b, 'fr')),
    drinks: [...selection.drinks].sort((a, b) => a.localeCompare(b, 'fr')),
  });
}

export function formatMenuSelection(selection?: MenuSelection): string[] {
  if (!selection) return [];
  return [
    selection.sides.length > 0 ? `Accompagnement${selection.sides.length > 1 ? 's' : ''} : ${selection.sides.join(', ')}` : '',
    selection.drinks.length > 0 ? `Boisson${selection.drinks.length > 1 ? 's' : ''} : ${selection.drinks.join(', ')}` : '',
  ].filter(Boolean);
}
