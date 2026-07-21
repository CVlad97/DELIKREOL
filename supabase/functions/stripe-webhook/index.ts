import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Idempotence mémoire : utile entre deux appels tant que l'edge runtime reste chaud.
const processedEvents = new Set<string>()

function getStripe(): Stripe {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
}

function getWebhookSecret(): string {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET')
  }

  return webhookSecret
}

function getAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createClient(supabaseUrl, serviceRoleKey)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

async function verifyWebhook(req: Request): Promise<Stripe.Event> {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    throw new Error('Signature webhook manquante')
  }

  const rawBody = await req.text()
  return await getStripe().webhooks.constructEventAsync(
    rawBody,
    signature,
    getWebhookSecret(),
  )
}

async function insertEventIfNew(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
): Promise<boolean> {
  if (processedEvents.has(event.id)) {
    console.log(`[stripe] Événement ${event.id} déjà traité en mémoire — ignoré`)
    return false
  }

  const { data: existingEvent, error: lookupError } = await supabase
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()

  if (lookupError) {
    console.warn('[stripe] Vérification idempotence DB impossible:', lookupError.message)
  }

  if (existingEvent) {
    console.log(`[stripe] Événement ${event.id} déjà en base — ignoré`)
    processedEvents.add(event.id)
    return false
  }

  const { error: insertError } = await supabase
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type })

  if (insertError) {
    console.warn('[stripe] Échec enregistrement événement webhook:', insertError.message)
  }

  processedEvents.add(event.id)
  return true
}

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId
  const stripeAccountId = paymentIntent.transfer_data?.destination || null

  console.log(`[stripe] payment_intent.succeeded — PI: ${paymentIntent.id}, orderId: ${orderId}`)

  if (!orderId) {
    console.warn('[stripe] Aucun orderId dans les metadata du PaymentIntent')
    return
  }

  const { error: orderError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_intent_id: paymentIntent.id,
      payment_method: 'card',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    console.error('[stripe] Erreur mise à jour commande payée:', orderError.message)
    throw orderError
  }

  const { error: eventError } = await supabase
    .from('order_events')
    .insert({
      order_id: orderId,
      event_type: 'payment_succeeded',
      payload: {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripe_account_id: stripeAccountId,
      },
    })

  if (eventError) {
    console.warn('[stripe] Erreur création order_event payment_succeeded:', eventError.message)
  }

  console.log(`[stripe] Commande ${orderId} marquée comme payée`)
}

async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId
  console.log(`[stripe] payment_intent.payment_failed — PI: ${paymentIntent.id}, orderId: ${orderId}`)

  if (!orderId) return

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_error: paymentIntent.last_payment_error?.message || 'Erreur de paiement',
    })
    .eq('id', orderId)

  if (error) {
    console.error('[stripe] Erreur mise à jour paiement échoué:', error.message)
    throw error
  }
}

async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  charge: Stripe.Charge,
): Promise<void> {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : ''
  let orderId: string | null = charge.metadata?.orderId || null

  console.log(`[stripe] charge.refunded — charge: ${charge.id}, PI: ${piId}, orderId: ${orderId}`)

  if (!orderId && piId) {
    try {
      const pi = await getStripe().paymentIntents.retrieve(piId)
      orderId = pi.metadata?.orderId || null
    } catch (error) {
      console.warn('[stripe] Impossible de retrouver le PaymentIntent pour charge.refunded:', error)
    }
  }

  if (!orderId) return

  const { error: refundError } = await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      refunded_at: new Date().toISOString(),
      payment_intent_id: piId || null,
    })
    .eq('id', orderId)

  if (refundError) {
    console.error('[stripe] Erreur mise à jour commande remboursée:', refundError.message)
    throw refundError
  }

  const { error: eventError } = await supabase
    .from('order_events')
    .insert({
      order_id: orderId,
      event_type: 'payment_refunded',
      payload: { charge_id: charge.id, amount: charge.amount_refunded || charge.amount },
    })

  if (eventError) {
    console.warn('[stripe] Erreur création order_event refund:', eventError.message)
  }
}

async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account,
): Promise<void> {
  const accountId = account.id
  const onboardType = account.metadata?.onboard_type || ''
  const onboardName = account.metadata?.onboard_name || ''

  let status = 'onboarding'
  let onboardingCompleted = false
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'actif'
    onboardingCompleted = true
  } else if (account.charges_enabled) {
    status = 'payments_ready'
  } else if (account.details_submitted) {
    status = 'details_submitted'
  }

  const payload = {
    stripe_status: status,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    onboarding_completed: onboardingCompleted,
    updated_at: new Date().toISOString(),
  }

  const tables = onboardType === 'partner'
    ? ['partners']
    : onboardType === 'driver'
      ? ['drivers']
      : ['partners', 'drivers']

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('stripe_account_id', accountId)

    if (!error) {
      console.log(`[stripe] Compte ${table} ${onboardName || accountId} → ${status}`)
      return
    }

    console.warn(`[stripe] Erreur mise à jour ${table}:`, error.message)
  }
}

async function handleTransferCreated(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer,
): Promise<void> {
  console.log(`[stripe] transfer.created — ${transfer.id}, montant: ${transfer.amount}, destination: ${transfer.destination}`)

  const { error } = await supabase
    .from('payouts')
    .insert({
      stripe_transfer_id: transfer.id,
      stripe_account_id: typeof transfer.destination === 'string' ? transfer.destination : '',
      amount: transfer.amount / 100,
      currency: transfer.currency,
      status: 'completed',
      description: transfer.description || 'Transfert Stripe vers compte Connect',
      metadata: transfer.metadata || {},
    })

  if (error) {
    console.log('[stripe] Log transfert uniquement — table payouts indisponible ou erreur:', error.message)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const event = await verifyWebhook(req)
    console.log(`[stripe] Webhook reçu : ${event.type} (${event.id})`)

    const supabase = getAdminClient()
    const shouldProcess = await insertEventIfNew(supabase, event)
    if (!shouldProcess) {
      return json({ received: true, idempotent: true })
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge)
        break

      case 'account.updated':
        await handleAccountUpdated(supabase, event.data.object as Stripe.Account)
        break

      case 'transfer.created':
        await handleTransferCreated(supabase, event.data.object as Stripe.Transfer)
        break

      default:
        console.log(`[stripe] Événement non géré : ${event.type}`)
    }

    return json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[stripe] Erreur webhook:', message)

    if (message.includes('Signature') || message.includes('signature') || message.includes('webhook')) {
      return json({ error: message }, 401)
    }

    return json({ error: message }, 500)
  }
})
