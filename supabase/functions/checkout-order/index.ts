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
    'Vary': 'Origin',
  }
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405)

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    )

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: authData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } }

    const body = await req.json()
    const {
      idempotency_key,
      items,
      total,
      total_amount,
      delivery_fee,
      commune,
      mode,
      phone,
      email,
      notes,
      creneaux,
      address,
      payment_provider,
    } = body

    if (!idempotency_key) {
      return json(req, { error: 'idempotency_key required' }, 400)
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json(req, { error: 'items required' }, 400)
    }

    // Vérifier idempotence
    const { data: existing } = await supabase
      .from('orders')
      .select('id, order_number, status, payment_status')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle()

    if (existing) {
      return json(req, { existing: true, order: existing })
    }

    // Générer uniquement le numéro métier. orders.id reste généré par Postgres (UUID).
    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const random = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 36]).join('')
    const orderNumber = `DK-${datePart}-${random}`

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        idempotency_key,
        customer_id: authData.user?.id || null,
        customer_phone: phone || '',
        customer_email: email || authData.user?.email || null,
        commune,
        order_mode: mode,
        subtotal: Number(total || 0),
        delivery_fee: Number(delivery_fee || 0),
        delivery_fee_cents: Math.round(Number(delivery_fee || 0) * 100),
        sub_total_cents: Math.round(Number(total || 0) * 100),
        total_cents: Math.round(Number(total_amount ?? total ?? 0) * 100),
        total_amount: Number(total_amount ?? total ?? 0),
        delivery_type: mode === 'livraison' ? 'home_delivery' : mode === 'relais' ? 'relay_point' : 'pickup',
        notes: notes || '',
        creneaux: creneaux || '',
        address: address || '',
        status: 'pending',
        payment_status: payment_provider === 'stripe_test' ? 'awaiting_payment' : 'pending',
        payment_provider: payment_provider || 'manual',
        payment_method: payment_provider === 'stripe_test' ? 'card' : 'manual',
        tracking_token: Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map(b => b.toString(16).padStart(2, '0')).join(''),
      })
      .select()
      .single()

    if (orderError) throw orderError
    const orderId = order.id

    // Créer order_items
    if (items?.length) {
      const orderItems = items.map((i: any) => ({
        order_id: orderId,
        product_id: typeof i.id === 'string' && /^[0-9a-f-]{36}$/i.test(i.id) ? i.id : null,
        vendor_id: typeof i.vendor_id === 'string' && /^[0-9a-f-]{36}$/i.test(i.vendor_id) ? i.vendor_id : null,
        product_name: i.name,
        vendor_name: i.vendor || i.vendor_name || '',
        unit_price: Number(i.price || i.unit_price || 0),
        quantity: Number(i.quantity || 1),
        subtotal: Number(i.price || i.unit_price || 0) * Number(i.quantity || 1),
        total: (Number(i.price || i.unit_price || 0) * Number(i.quantity || 1)).toFixed(2),
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError
    }

    // Créer order_events
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: payment_provider === 'stripe_test' ? 'public_order_created' : 'whatsapp_order_prepared',
      payload: { mode, commune, items_count: items?.length || 0, payment_provider: payment_provider || 'manual' },
    })

    // Créer notifications
    const notifications = [
      { order_id: orderNumber, recipient_type: 'admin', recipient_phone: '', channel: 'dashboard', message: `Nouvelle commande ${orderNumber}`, status: 'pending' },
      { order_id: orderNumber, recipient_type: 'client', recipient_phone: phone, channel: 'whatsapp_support', message: `Commande ${orderNumber} créée. Support WhatsApp si besoin.`, status: 'pending' },
    ]

    if (mode === 'livraison') {
      notifications.push({ order_id: orderNumber, recipient_type: 'driver_needed', recipient_phone: '', channel: 'dashboard', message: `Livraison nécessaire pour ${orderNumber}`, status: 'pending' })
    }
    if (mode === 'relais') {
      notifications.push({ order_id: orderNumber, recipient_type: 'relay_needed', recipient_phone: '', channel: 'dashboard', message: `Point relais nécessaire pour ${orderNumber}`, status: 'pending' })
    }

    await supabase.from('notifications').insert(notifications)

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        tracking_token: order.tracking_token,
        status: 'pending',
      },
    }), { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

  } catch (err) {
    return json(req, { error: err instanceof Error ? err.message : 'Unable to create order' }, 500)
  }
})
