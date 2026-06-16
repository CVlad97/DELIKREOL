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
 * Crée un PaymentIntent Stripe.
 *
 * Comportement marketplace Stripe Connect :
 * - Si `vendorStripeAccountId` est fourni, le PaymentIntent est créé avec
 *   un transfert automatique vers le compte du traiteur (transfer_data)
 *   et une commission Delikreol de 15 % (application_fee_amount).
 * - Sinon, le comportement existant est conservé (paiement simple direct).
 *
 * @param {number} amount - Montant en EUR (ex: 25.50)
 * @param {string} [currency='eur'] - Devise
 * @param {string} [orderId] - Identifiant de la commande (metadata)
 * @param {string} [vendorStripeAccountId] - Stripe Connect account ID du traiteur (optionnel)
 * @returns {Promise<{ clientSecret: string }>} Le client_secret à utiliser côté frontend
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
        // Recalcul : (sub_total ou total) + delivery_fee = total_attend
        const subTotal = order.sub_total || 0
        const deliveryFee = order.delivery_fee || 0
        const calculatedTotal = subTotal + deliveryFee

        if (calculatedTotal > 0) {
          serverAmountInCents = Math.round(calculatedTotal * 100)
          console.log(`[stripe] Montant recalculé depuis la base : ${subTotal} + ${deliveryFee} = ${calculatedTotal}€ (${serverAmountInCents} centimes)`)
        }

        // Alerte si le frontend a envoyé un montant différent
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

    if (vendorStripeAccountId) {
      // -------------------------------------------------------
      // MODE MARKETPLACE — Paiement avec transfert vers le traiteur
      // -------------------------------------------------------
      console.log('[stripe] Mode marketplace — création PaymentIntent avec transfer vers', vendorStripeAccountId)

      const commissionRate = 0.15 // 15 % de commission Delikreol
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
        // Transfert automatique des fonds vers le compte Stripe Connect du traiteur
        transfer_data: {
          destination: vendorStripeAccountId,
        },
        // Commission Delikreol prélevée sur le transfert
        application_fee_amount: applicationFee,
      })

      console.log('[stripe] PaymentIntent créé (marketplace) :', paymentIntent.id)

      return new Response(JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // -------------------------------------------------------
    // MODE SIMPLE — Paiement direct (comportement existant)
    // -------------------------------------------------------
    console.log('[stripe] Mode simple — création PaymentIntent sans transfer')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    })

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
