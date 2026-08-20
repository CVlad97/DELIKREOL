// DELIKREOL — Qonto Sync.
// Backend uniquement : aucune clé Qonto ne doit être exposée côté frontend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://delikreol.com',
  'https://www.delikreol.com',
  'https://cvlad97.github.io',
  'http://localhost:5173',
])

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://delikreol.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

async function requireAdmin(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return { error: json(req, { error: 'Authentication required' }, 401) }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) return { error: json(req, { error: 'Invalid session' }, 401) }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || !isAdmin) return { error: json(req, { error: 'Admin required' }, 403) }

  return { supabase, userId: userData.user.id }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405)

  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const qontoApiKey = Deno.env.get('QONTO_API_KEY')
  const qontoOrganizationId = Deno.env.get('QONTO_ORGANIZATION_ID')

  if (!qontoApiKey || !qontoOrganizationId) {
    return json(req, {
      status: 'QONTO_NOT_CONFIGURED',
      mode: 'manual',
      message: 'Qonto API désactivée : configurez les secrets serveur Supabase pour activer la synchronisation.',
    })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const entityType = typeof body.entity_type === 'string' ? body.entity_type.slice(0, 80) : 'unknown'
    const entityId = typeof body.entity_id === 'string' ? body.entity_id.slice(0, 120) : null
    const action = typeof body.action === 'string' ? body.action.slice(0, 80) : 'sync'

    const { error: logError } = await auth.supabase.from('qonto_sync_logs').insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      status: 'pending',
      message: 'Qonto sync requested by admin',
    })
    if (logError) {
      console.warn(`[qonto-sync] log skipped: ${logError.message}`)
    }

    return json(req, {
      status: 'QONTO_CONFIGURED_NOT_AUTOMATED',
      mode: 'manual_review',
      message: 'Secrets Qonto présents. Appels API réels à valider en sandbox avant automatisation.',
    })
  } catch (err) {
    return json(req, { error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
