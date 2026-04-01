import { blink } from '../lib/blink';

const STORAGE_KEY = 'delikreol_local_requests';

export interface ClientRequestRecord {
  id: string;
  userId: string;
  address: string;
  deliveryPreference: string;
  requestDetails: string;
  preferredTime: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
}

function readLocalRequests(): ClientRequestRecord[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ClientRequestRecord[];
  } catch {
    return [];
  }
}

function writeLocalRequests(items: ClientRequestRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeRequest(item: any): ClientRequestRecord {
  return {
    id: item.id,
    userId: item.userId,
    address: item.address,
    deliveryPreference: item.deliveryPreference,
    requestDetails: item.requestDetails,
    preferredTime: item.preferredTime,
    status: item.status,
    createdAt: item.createdAt,
    adminNotes: item.adminNotes,
  };
}

export async function createClientRequest(
  payload: Omit<ClientRequestRecord, 'id' | 'createdAt'>
) {
  const request: ClientRequestRecord = {
    ...payload,
    id: `local_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const current = readLocalRequests();
  writeLocalRequests([request, ...current]);

  try {
    await (blink.db as any).clientRequests.create(payload);
  } catch (error) {
    console.warn('Blink indisponible, demande conservee localement.', error);
  }

  return request;
}

export async function listClientRequests(userId: string) {
  const localItems = readLocalRequests().filter((item) => item.userId === userId);

  try {
    const remoteItems = await (blink.db as any).clientRequests.list({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const merged = [...(remoteItems || []).map(normalizeRequest), ...localItems];
    const unique = new Map<string, ClientRequestRecord>();

    merged.forEach((item) => {
      unique.set(item.id, item);
    });

    return Array.from(unique.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  } catch (error) {
    console.warn('Lecture locale des demandes uniquement.', error);
    return localItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
