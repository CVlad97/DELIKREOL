import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    )

    const body = await req.json()
    const { idempotency_key, items, total, commune, mode, phone, notes, creneaux, address } = body

    if (!idempotency_key) {
      return new Response(JSON.stringify({ error: 'idempotency_key required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Vérifier idempotence
    const { data: existing } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ existing: true, order: existing }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Générer order_id et order_number
    const orderId = crypto.randomUUID()
    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const random = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 36]).join('')
    const orderNumber = `DK-${datePart}-${random}`

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        idempotency_key,
        customer_phone: phone || '',
        commune,
        order_mode: mode,
        subtotal: total,
        notes: notes || '',
        creneaux: creneaux || '',
        address: address || '',
        status: 'pending',
        tracking_token: Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map(b => b.toString(16).padStart(2, '0')).join(''),
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Créer order_items
    if (items?.length) {
      const orderItems = items.map((i: any) => ({
        order_id: orderId,
        product_name: i.name,
        vendor_name: i.vendor,
        unit_price: i.price,
        quantity: i.quantity,
        total: (i.price * i.quantity).toFixed(2),
      }))
      await supabase.from('order_items').insert(orderItems)
    }

    // Créer order_events
    await supabase.from('order_events').insert({
      order_id: orderNumber,
      event_type: 'order_created',
      payload: { mode, commune, items_count: items?.length || 0 },
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
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})