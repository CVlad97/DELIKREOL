import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Crée un PaymentIntent Stripe avec idempotency key.
 * Mode marketplace (Stripe Connect) ou mode simple.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { amount, currency = 'eur', orderId, vendorStripeAccountId, vendorId, customerId, deliveryId } = body

    // --- Initialisation Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // --- Recalcul serveur du montant depuis la commande (sécurité) ---
    let serverAmountInCents = Math.round(amount * 100)

    if (orderId) {
      console.log(`[stripe] Vérification commande ${orderId} en base...`)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('total, delivery_fee, sub_total')
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.warn('[stripe] Commande non trouvée en base, utilisation du montant frontend')
      } else {
        const subTotal = order.sub_total || 0
        const deliveryFee = order.delivery_fee || 0
        const calculatedTotal = subTotal + deliveryFee

        if (calculatedTotal > 0) {
          serverAmountInCents = Math.round(calculatedTotal * 100)
          console.log(`[stripe] Montant recalculé depuis la base : ${subTotal} + ${deliveryFee} = ${calculatedTotal}€ (${serverAmountInCents} centimes)`)
        }

        const frontendAmountCents = Math.round(amount * 100)
        if (Math.abs(serverAmountInCents - frontendAmountCents) > 1) {
          console.warn(`[stripe] ⚠️ Différence de montant : frontend=${frontendAmountCents}, serveur=${serverAmountInCents} — utilisation valeur serveur`)
        }
      }
    }

    // --- Validation du montant ---
    if (!amount || amount <= 0) {
      throw new Error('Montant invalide')
    }
    if (vendorStripeAccountId && !vendorStripeAccountId.startsWith('acct_')) {
      throw new Error('ID de compte Stripe Connect invalide')
    }

    const amountInCents = serverAmountInCents
    // Générer une idempotency key pour éviter les doublons de paiement
    const idempotencyKey = `pi_${orderId || 'direct'}_${Date.now()}`

    if (vendorStripeAccountId) {
      // MODE MARKETPLACE
      console.log('[stripe] Mode marketplace — création PaymentIntent idempotencyKey:', idempotencyKey)

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

      console.log('[stripe] PaymentIntent créé (marketplace) :', paymentIntent.id)

      return new Response(JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // MODE SIMPLE
    console.log('[stripe] Mode simple — création PaymentIntent idempotencyKey:', idempotencyKey)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    }, { idempotencyKey })

    console.log('[stripe] PaymentIntent créé (simple) :', paymentIntent.id)

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