import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const QONTO_API = Deno.env.get('QONTO_API_BASE_URL') || 'https://thirdparty.qonto.com/v2'
const QONTO_CLIENT_ID = Deno.env.get('QONTO_CLIENT_ID') || ''
const QONTO_CLIENT_SECRET = Deno.env.get('QONTO_CLIENT_SECRET') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

let _tokenCache: { accessToken: string; expiresAt: number } | null = null

// ── Auth Qonto (client_credentials) ─────────────────────────────────
async function getQontoToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.accessToken
  }
  const resp = await fetch('https://thirdparty.qonto.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: QONTO_CLIENT_ID,
      client_secret: QONTO_CLIENT_SECRET,
    }),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Qonto auth failed: ${resp.status} ${err}`)
  }
  const data = await resp.json()
  _tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return data.access_token
}

// ── Appel Qonto API ────────────────────────────────────────────────
async function qontoGet<T>(path: string): Promise<{ data?: T; error?: string }> {
  try {
    const token = await getQontoToken()
    const resp = await fetch(`${QONTO_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) {
      const err = await resp.text()
      return { error: `Qonto ${resp.status}: ${err}` }
    }
    return { data: await resp.json() }
  } catch (e: unknown) {
    return { error: String(e) }
  }
}

// ── Handlers ───────────────────────────────────────────────────────
async function handleGetOrganization() {
  return await qontoGet('/organizations/current')
}

async function handleListBankAccounts() {
  return await qontoGet('/bank_accounts')
}

async function handleListTransactions(url: URL) {
  const bankAccountId = url.searchParams.get('bank_account_id') || ''
  const status = url.searchParams.get('status') || ''
  const page = url.searchParams.get('page') || '1'
  let path = `/transactions?page=${page}`
  if (bankAccountId) path += `&bank_account_id=${bankAccountId}`
  if (status) path += `&status=${status}`
  return await qontoGet(path)
}

async function handleReconciliation(supabase: ReturnType<typeof createClient>) {
  // Récupère les transactions Qonto et les commandes non rapprochées
  const [qontoRes, ordersRes] = await Promise.all([
    qontoGet('/transactions?page=1&per_page=50'),
    supabase.from('orders').select('id, order_number, total, status').is('qonto_reconciled_at', null).limit(50),
  ])

  if (qontoRes.error) return qontoRes
  if (ordersRes.error) return { error: ordersRes.error.message }

  const transactions = (qontoRes.data as any)?.transactions || []
  const orders = ordersRes.data || []

  return {
    data: {
      pendingOrders: orders,
      recentTransactions: transactions.slice(0, 20),
      matchSuggestions: orders.map((o: any) => ({
        orderId: o.id,
        orderNumber: o.order_number,
        amount: o.total,
        possibleMatches: transactions.filter((t: any) =>
          Math.abs(t.amount_cents / 100 - o.total) < 0.5
        ),
      })),
    },
  }
}

async function handleExport(supabase: ReturnType<typeof createClient>, url: URL) {
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(url.searchParams.get('month') || String(new Date().getMonth() + 1))
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true })

  if (!orders) return { data: { rows: [], summary: {} } }

  const csvLines = [
    'Date;N° commande;Client;Montant TTC;Commission Delikreol;Montant traiteur;Frais livraison;Statut;Mode paiement',
    ...orders.map((o: any) =>
      [
        o.created_at?.split('T')[0] || '',
        o.order_number || '',
        o.client_name || '',
        (o.total || 0).toFixed(2),
        ((o.total || 0) * 0.15).toFixed(2),
        ((o.total || 0) * 0.75).toFixed(2),
        (o.delivery_fee || 0).toFixed(2),
        o.status || '',
        o.payment_method || '',
      ].join(';')
    ),
  ]

  return {
    data: {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s: number, o: any) => s + (o.total || 0), 0),
      totalCommissions: orders.reduce((s: number, o: any) => s + (o.total || 0) * 0.15, 0),
      csv: csvLines.join('\n'),
      rows: orders,
    },
  }
}

// ── Router principal ──────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/qonto-finance/', '').replace('/functions/v1/qonto-finance', '')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    let result: { data?: unknown; error?: string }

    switch (path) {
      case '/organization':
        result = await handleGetOrganization()
        break
      case '/bank-accounts':
        result = await handleListBankAccounts()
        break
      case '/transactions':
        result = await handleListTransactions(url)
        break
      case '/reconciliation':
        result = await handleReconciliation(supabase)
        break
      case '/export':
        result = await handleExport(supabase, url)
        break
      case '/health':
        result = { data: { status: 'ok', qontoConfigured: Boolean(QONTO_CLIENT_ID && QONTO_CLIENT_SECRET) } }
        break
      default:
        return new Response(JSON.stringify({ error: 'Not found', available: ['/organization', '/bank-accounts', '/transactions', '/reconciliation', '/export', '/health'] }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const status = result.error ? 500 : 200
    return new Response(JSON.stringify(result.error ? { error: result.error } : result.data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
