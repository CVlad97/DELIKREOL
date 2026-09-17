export interface MenuOptions {
  appetizers?: string[];
  sides: string[];
  drinks: string[];
  sauces?: string[];
  condiments?: string[];
  included_appetizer_count?: number;
  included_side_count: number;
  included_drink_count: number;
  included_sauce_count?: number;
  included_condiment_count?: number;
  instructions_enabled?: boolean;
}

export interface NormalizedMenuOptions extends MenuOptions {
  appetizers: string[];
  sauces: string[];
  condiments: string[];
  included_appetizer_count: number;
  included_sauce_count: number;
  included_condiment_count: number;
}

export interface MenuSelection {
  appetizers: string[];
  sides: string[];
  drinks: string[];
  sauces: string[];
  condiments: string[];
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
export function normalizeMenuOptions(value: unknown): NormalizedMenuOptions | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const appetizers = normalizeChoiceArray(record.appetizers ?? []);
  const sides = normalizeChoiceArray(record.sides);
  const drinks = normalizeChoiceArray(record.drinks);
  const sauces = normalizeChoiceArray(record.sauces ?? []);
  const condiments = normalizeChoiceArray(record.condiments ?? []);
  if (!appetizers || !sides || !drinks || !sauces || !condiments) return null;

  const includedAppetizerCount = normalizeCount(record.included_appetizer_count, 0);
  const includedSideCount = normalizeCount(record.included_side_count, 0);
  const includedDrinkCount = normalizeCount(record.included_drink_count, 0);
  const includedSauceCount = normalizeCount(record.included_sauce_count, 0);
  const includedCondimentCount = normalizeCount(record.included_condiment_count, 0);
  if (includedAppetizerCount == null || includedSideCount == null || includedDrinkCount == null || includedSauceCount == null || includedCondimentCount == null) return null;
  if (includedAppetizerCount > appetizers.length || includedSideCount > sides.length || includedDrinkCount > drinks.length || includedSauceCount > sauces.length || includedCondimentCount > condiments.length) return null;

  return {
    appetizers,
    sides,
    drinks,
    sauces,
    condiments,
    included_appetizer_count: includedAppetizerCount,
    included_side_count: includedSideCount,
    included_drink_count: includedDrinkCount,
    included_sauce_count: includedSauceCount,
    included_condiment_count: includedCondimentCount,
    instructions_enabled: record.instructions_enabled !== false,
  };
}

function stableChoices(values?: string[]): string[] {
  return [...(values || [])].sort((a, b) => a.localeCompare(b, 'fr'));
}

export function menuSelectionKey(selection?: Partial<MenuSelection>): string {
  if (!selection) return 'standard';
  return JSON.stringify({
    appetizers: stableChoices(selection.appetizers),
    sides: stableChoices(selection.sides),
    drinks: stableChoices(selection.drinks),
    sauces: stableChoices(selection.sauces),
    condiments: stableChoices(selection.condiments),
    instructions: (selection.instructions || '').trim().slice(0, 240),
  });
}

export function formatMenuSelection(selection?: Partial<MenuSelection>): string[] {
  if (!selection) return [];
  const instructions = (selection.instructions || '').trim();
  return [
    selection.appetizers?.length ? `Entrée${selection.appetizers.length > 1 ? 's' : ''} : ${selection.appetizers.join(', ')}` : '',
    selection.sides?.length ? `Accompagnement${selection.sides.length > 1 ? 's' : ''} : ${selection.sides.join(', ')}` : '',
    selection.drinks?.length ? `Boisson${selection.drinks.length > 1 ? 's' : ''} : ${selection.drinks.join(', ')}` : '',
    selection.sauces?.length ? `Sauce${selection.sauces.length > 1 ? 's' : ''} : ${selection.sauces.join(', ')}` : '',
    selection.condiments?.length ? `Condiment${selection.condiments.length > 1 ? 's' : ''} : ${selection.condiments.join(', ')}` : '',
    instructions ? `Consigne : ${instructions}` : '',
  ].filter(Boolean);
}
