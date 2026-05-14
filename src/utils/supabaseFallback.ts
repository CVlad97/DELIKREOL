type AnyRecord = Record<string, unknown>;

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const anyError = error as AnyRecord;
  const raw = anyError.status ?? anyError.statusCode ?? anyError.status_code ?? anyError.statusCode;
  const status = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(status) ? status : null;
}

function getMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error !== 'object') return String(error);
  const anyError = error as AnyRecord;
  return String(anyError.message ?? anyError.error_description ?? anyError.details ?? anyError.hint ?? '');
}

export function isSupabasePausedOrRestricted(error: unknown): boolean {
  const status = getStatusCode(error);
  if (status === 402 || status === 540) return true;
  const msg = getMessage(error).toLowerCase();
  return (
    msg.includes('paused') ||
    msg.includes('project paused') ||
    msg.includes('overdue_payment') ||
    msg.includes('payment required') ||
    msg.includes('billing') ||
    msg.includes('subscription') ||
    msg.includes('invoice') ||
    msg.includes('402') ||
    msg.includes('540')
  );
}

export function isNetworkOrFetchError(error: unknown): boolean {
  const msg = getMessage(error).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('dns') ||
    msg.includes('connection refused') ||
    msg.includes('service unavailable')
  );
}

export function shouldFallbackToDemo(error: unknown): boolean {
  return isSupabasePausedOrRestricted(error) || isNetworkOrFetchError(error);
}

export function activateDemoOverride(reason?: string) {
  try {
    window.localStorage.setItem('delikreol_demo_override', 'true');
  } catch {
    // ignore
  }
  if (reason) console.warn('[DELIKREOL] Demo override activated:', reason);
}

