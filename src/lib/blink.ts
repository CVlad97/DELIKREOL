const makeCollection = (storageKey: string) => ({
  async list({ where }: { where?: Record<string, unknown>; orderBy?: Record<string, string> } = {}): Promise<unknown[]> {
    try {
      const raw = localStorage.getItem(storageKey);
      let items: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
      if (where) {
        items = items.filter(item =>
          Object.entries(where).every(([k, v]) => item[k] === v)
        );
      }
      return items;
    } catch {
      return [];
    }
  },
  async get(id: string): Promise<unknown | null> {
    try {
      const raw = localStorage.getItem(storageKey);
      const items: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
      return items.find(item => item.id === id) ?? null;
    } catch {
      return null;
    }
  },
  async create(data: Record<string, unknown>): Promise<unknown> {
    try {
      const raw = localStorage.getItem(storageKey);
      const items: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
      const newItem = { ...data, id: data.id ?? crypto.randomUUID(), createdAt: new Date().toISOString() };
      items.push(newItem);
      localStorage.setItem(storageKey, JSON.stringify(items));
      return newItem;
    } catch {
      return data;
    }
  },
  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    try {
      const raw = localStorage.getItem(storageKey);
      const items: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
      const idx = items.findIndex(item => item.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        localStorage.setItem(storageKey, JSON.stringify(items));
        return items[idx];
      }
      return null;
    } catch {
      return null;
    }
  },
});

export const blink = {
  db: {
    clientRequests: makeCollection('delikreol_client_requests'),
    orders: makeCollection('delikreol_orders'),
    deliveries: makeCollection('delikreol_deliveries'),
  },
};
