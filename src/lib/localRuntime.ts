export type LocalRow = Record<string, unknown>;

const KEY = 'delikreol_runtime_store';

const emptyStore = () => ({
  vendors: [] as LocalRow[],
  products: [] as LocalRow[],
  orders: [] as LocalRow[],
  order_items: [] as LocalRow[],
  leads: [] as LocalRow[],
  partner_applications: [] as LocalRow[],
  catering_requests: [] as LocalRow[],
  project_memory: [] as LocalRow[],
});

export type LocalStore = ReturnType<typeof emptyStore>;

export function loadLocalStore(): LocalStore {
  if (typeof window === 'undefined') return emptyStore();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return emptyStore();
  try {
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

export function saveLocalStore(store: LocalStore) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  }
}

export function addLocalRow(table: keyof LocalStore, row: LocalRow) {
  const store = loadLocalStore();
  const next = {
    id: String(row.id ?? `${table}-${Date.now()}`),
    created_at: String(row.created_at ?? new Date().toISOString()),
    ...row,
  };
  store[table] = [...store[table], next];
  saveLocalStore(store);
  return next;
}

export function listLocalRows(table: keyof LocalStore) {
  return loadLocalStore()[table];
}

export function clearLocalStore() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(KEY);
  }
}
