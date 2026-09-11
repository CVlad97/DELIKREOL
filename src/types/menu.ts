export interface MenuOptions {
  sides: string[];
  drinks: string[];
  sauces: string[];
  included_side_count: number;
  included_drink_count: number;
  included_sauce_count: number;
  instructions_enabled?: boolean;
}

export interface MenuSelection {
  sides: string[];
  drinks: string[];
  sauces: string[];
  instructions?: string;
}

function normalizeChoiceArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === 'string')) return null;
  return value.map((item) => item.trim()).filter(Boolean);
}

function normalizeCount(value: unknown, fallback: number): number | null {
  const parsed = value == null ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

/** Ignore safely any incomplete menu configuration returned by the public catalogue. */
/** The checkout function remains the authority for validating a customer's final choices. */
export function normalizeMenuOptions(value: unknown): MenuOptions | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const sides = normalizeChoiceArray(record.sides);
  const drinks = normalizeChoiceArray(record.drinks);
  const sauces = normalizeChoiceArray(record.sauces ?? []);
  if (!sides || !drinks || !sauces) return null;

  const includedSideCount = normalizeCount(record.included_side_count, 0);
  const includedDrinkCount = normalizeCount(record.included_drink_count, 0);
  const includedSauceCount = normalizeCount(record.included_sauce_count, 0);
  if (includedSideCount == null || includedDrinkCount == null || includedSauceCount == null) return null;
  if (includedSideCount > sides.length || includedDrinkCount > drinks.length || includedSauceCount > sauces.length) return null;

  return {
    sides,
    drinks,
    sauces,
    included_side_count: includedSideCount,
    included_drink_count: includedDrinkCount,
    included_sauce_count: includedSauceCount,
    instructions_enabled: record.instructions_enabled !== false,
  };
}

function stableChoices(values?: string[]): string[] {
  return [...(values || [])].sort((a, b) => a.localeCompare(b, 'fr'));
}

export function menuSelectionKey(selection?: Partial<MenuSelection>): string {
  if (!selection) return 'standard';
  return JSON.stringify({
    sides: stableChoices(selection.sides),
    drinks: stableChoices(selection.drinks),
    sauces: stableChoices(selection.sauces),
    instructions: (selection.instructions || '').trim().slice(0, 240),
  });
}

export function formatMenuSelection(selection?: Partial<MenuSelection>): string[] {
  if (!selection) return [];
  const instructions = (selection.instructions || '').trim();
  return [
    selection.sides?.length ? `Accompagnement${selection.sides.length > 1 ? 's' : ''} : ${selection.sides.join(', ')}` : '',
    selection.drinks?.length ? `Boisson${selection.drinks.length > 1 ? 's' : ''} : ${selection.drinks.join(', ')}` : '',
    selection.sauces?.length ? `Sauce${selection.sauces.length > 1 ? 's' : ''} : ${selection.sauces.join(', ')}` : '',
    instructions ? `Consigne : ${instructions}` : '',
  ].filter(Boolean);
}
