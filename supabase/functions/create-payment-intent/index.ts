import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
import Stripe from 'npm:stripe@19.3.1'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Crée un PaymentIntent Stripe avec idempotency key stable.
 * orderId est obligatoire — chaque PaymentIntent est lié à une commande.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { amount, currency = 'eur', orderId, vendorId, customerId, deliveryId } = body
    const vendorStripeAccountId = body.vendorStripeAccountId || body.vendorAccountId

    // --- Validation — orderId obligatoire ---
    if (!orderId) {
      throw new Error('orderId requis — chaque PaymentIntent doit être lié à une commande')
    }
    if (!amount || amount <= 0) {
      throw new Error('Montant invalide')
    }
    if (vendorStripeAccountId && !vendorStripeAccountId.startsWith('acct_')) {
      throw new Error('ID de compte Stripe Connect invalide')
    }

    // --- Initialisation Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // amount est attendu en centimes côté frontend ; le serveur privilégie toujours la base.
    let serverAmountInCents = Math.round(amount)
    // Idempotency key STABLE basée sur orderId (évite les doublons Stripe)
    const idempotencyKey = `delikreol_pi_${orderId}`

    console.log(`[stripe] Vérification commande ${orderId} en base...`)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, total_cents, delivery_fee, delivery_fee_cents, subtotal, sub_total_cents, payment_intent_id')
      .eq('id', orderId)
      .single()

    // Vérifier si un PaymentIntent existe déjà pour cette commande
    if (!orderError && order?.payment_intent_id) {
      console.log(`[stripe] PaymentIntent déjà existant pour ${orderId} : ${order.payment_intent_id}`)
      return new Response(JSON.stringify({ clientSecret: 'already_exists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (orderError) {
      console.warn('[stripe] Commande non trouvée en base, utilisation du montant frontend')
    } else {
      const storedTotalCents = Number(order.total_cents || 0)
      const totalAmount = Number(order.total_amount || 0)
      const subtotalCents = Number(order.sub_total_cents || 0) || Math.round(Number(order.subtotal || 0) * 100)
      const deliveryFeeCents = Number(order.delivery_fee_cents || 0) || Math.round(Number(order.delivery_fee || 0) * 100)
      const calculatedTotalCents = storedTotalCents || Math.round(totalAmount * 100) || subtotalCents + deliveryFeeCents

      if (calculatedTotalCents > 0) {
        serverAmountInCents = Math.round(calculatedTotalCents)
        console.log(`[stripe] Montant recalculé depuis la base : ${serverAmountInCents} centimes`)
      }

      const frontendAmountCents = Math.round(amount)
      if (Math.abs(serverAmountInCents - frontendAmountCents) > 1) {
        console.warn(`[stripe] ⚠️ Différence de montant : frontend=${frontendAmountCents}, serveur=${serverAmountInCents} — utilisation valeur serveur`)
      }
    }

    const amountInCents = serverAmountInCents

    if (vendorStripeAccountId) {
      // MODE MARKETPLACE
      const commissionRate = 0.15
      const applicationFee = Math.round(amountInCents * commissionRate)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          orderId,
          ...(vendorId && { vendorId }),
          ...(customerId && { customerId }),
          ...(deliveryId && { deliveryId }),
          mode: 'marketplace',
        },
        automatic_payment_methods: { enabled: true },
        transfer_data: {
          destination: vendorStripeAccountId,
        },
        application_fee_amount: applicationFee,
      }, { idempotencyKey })

      // Stocker le payment_intent_id dans la commande pour traçabilité
      await supabase.from('orders').update({ payment_intent_id: paymentIntent.id }).eq('id', orderId)

      return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // MODE SIMPLE
    console.log('[stripe] Mode simple — création PaymentIntent')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    }, { idempotencyKey })

    // Stocker le payment_intent_id dans la commande
    await supabase.from('orders').update({ payment_intent_id: paymentIntent.id }).eq('id', orderId)

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('[stripe] Erreur create-payment-intent :', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
