const erpBaseUrl = import.meta.env.VITE_ERP_API_URL || '';

export const isErpConfigured = erpBaseUrl.length > 0;

export async function erpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!isErpConfigured) {
    throw new Error('ERP API non configurée');
  }
  const url = `${erpBaseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    for (const [key, value] of options.headers) {
      headers[key] = value;
    }
  } else if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (typeof window !== 'undefined' && !headers['x-admin-token']) {
    const token = window.localStorage.getItem('erp_admin_token');
    if (token) headers['x-admin-token'] = token;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ERP error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}
