// DELIKREOL — Qonto Sync (squelette backend sécurisé)
// Aucune clé dans le repo — lecture via Deno.env uniquement

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const QONTO_API_KEY = Deno.env.get('QONTO_API_KEY')
  const QONTO_ORGANIZATION_ID = Deno.env.get('QONTO_ORGANIZATION_ID')

  if (!QONTO_API_KEY || !QONTO_ORGANIZATION_ID) {
    return new Response(JSON.stringify({
      status: 'QONTO_NOT_CONFIGURED',
      message: 'Qonto clés non configurées dans les secrets Supabase',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    )

    const body = await req.json()
    const { entity_type, entity_id, action } = body

    // Log the sync attempt
    if (supabase) {
      await supabase.from('qonto_sync_logs').insert({
        entity_type: entity_type || 'unknown',
        entity_id,
        action: action || 'sync',
        status: 'pending',
        message: 'Qonto sync requested',
      })
    }

    // TODO: real Qonto API calls when keys are configured
    return new Response(JSON.stringify({
      status: 'QONTO_CONFIGURED',
      message: 'Qonto clés présentes — synchronisation à implémenter',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})