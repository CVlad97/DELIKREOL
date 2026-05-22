type MetricEvent =
  | 'public_view'
  | 'checkout_success'
  | 'partner_lead_success'
  | 'business_request_success'
  | 'product_submission_success';

type MetricPayload = Record<string, unknown>;

const METRICS_ENDPOINT = import.meta.env.VITE_METRICS_WEBHOOK_URL || import.meta.env.VITE_SHEETS_API_URL || '';
const SESSION_ID_KEY = 'delikreol_public_session_id';
const VIEW_SENT_KEY = 'delikreol_public_view_sent';
const LOCAL_COUNTS_KEY = 'delikreol_local_metrics';
const LOCAL_QUEUE_KEY = 'delikreol_pending_metrics_queue';

type LocalCounts = {
  public_view: number;
  checkout_success: number;
  partner_lead_success: number;
  business_request_success: number;
  product_submission_success: number;
};

type QueuedMetric = {
  event: MetricEvent;
  at: string;
  session_id: string;
  path: string;
  href: string;
  referrer: string | null;
  user_agent: string;
  payload: MetricPayload;
};

function readCounts(): LocalCounts {
  try {
    const raw = localStorage.getItem(LOCAL_COUNTS_KEY);
    if (!raw) {
      return {
        public_view: 0,
        checkout_success: 0,
        partner_lead_success: 0,
        business_request_success: 0,
        product_submission_success: 0,
      };
    }
    const parsed = JSON.parse(raw) as LocalCounts;
    return {
      public_view: parsed.public_view || 0,
      checkout_success: parsed.checkout_success || 0,
      partner_lead_success: parsed.partner_lead_success || 0,
      business_request_success: parsed.business_request_success || 0,
      product_submission_success: parsed.product_submission_success || 0,
    };
  } catch {
    return {
      public_view: 0,
      checkout_success: 0,
      partner_lead_success: 0,
      business_request_success: 0,
      product_submission_success: 0,
    };
  }
}

function writeCounts(counts: LocalCounts) {
  localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(counts));
}

function incrementLocalCounter(event: MetricEvent) {
  const counts = readCounts();
  counts[event] = (counts[event] || 0) + 1;
  writeCounts(counts);
}

function readQueue(): QueuedMetric[] {
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMetric[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMetric[]) {
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue.slice(-500)));
}

function enqueueMetric(metric: QueuedMetric) {
  const queue = readQueue();
  queue.push(metric);
  writeQueue(queue);
}

async function flushQueue() {
  if (!METRICS_ENDPOINT) return;
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: QueuedMetric[] = [];
  for (const metric of queue) {
    try {
      const response = await fetch(METRICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: metric.event,
          at: metric.at,
          session_id: metric.session_id,
          path: metric.path,
          href: metric.href,
          referrer: metric.referrer,
          user_agent: metric.user_agent,
          ...metric.payload,
        }),
      });
      if (!response.ok) {
        remaining.push(metric);
      }
    } catch {
      remaining.push(metric);
    }
  }
  writeQueue(remaining);
}

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem(SESSION_ID_KEY, created);
  return created;
}

function sendMetric(event: MetricEvent, payload: MetricPayload = {}) {
  incrementLocalCounter(event);
  const metric: QueuedMetric = {
    event,
    at: new Date().toISOString(),
    session_id: getSessionId(),
    path: window.location.pathname,
    href: window.location.href,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    payload,
  };
  enqueueMetric(metric);
  if (!METRICS_ENDPOINT) return;
  void flushQueue();
}

export function trackPublicView() {
  if (sessionStorage.getItem(VIEW_SENT_KEY) === '1') return;
  sessionStorage.setItem(VIEW_SENT_KEY, '1');
  sendMetric('public_view');
}

export function trackCheckoutSuccess(payload: MetricPayload = {}) {
  sendMetric('checkout_success', payload);
}

export function trackPartnerLeadSuccess(payload: MetricPayload = {}) {
  sendMetric('partner_lead_success', payload);
}

export function trackBusinessRequestSuccess(payload: MetricPayload = {}) {
  sendMetric('business_request_success', payload);
}

export function trackProductSubmissionSuccess(payload: MetricPayload = {}) {
  sendMetric('product_submission_success', payload);
}

export function getLocalMetrics() {
  return readCounts();
}

export function getPendingMetricsCount() {
  return readQueue().length;
}
