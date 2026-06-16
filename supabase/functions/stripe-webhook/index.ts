import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Set pour idempotence (évite de traiter 2x le même événement)
const processedEvents = new Set<string>()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Vérifie la signature du webhook Stripe à partir du header `stripe-signature`.
 * Renvoie l'événement Stripe parsé, ou une erreur si la signature est invalide.
 */
async function verifyWebhook(req: Request): Promise<Stripe.Event> {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    throw new Error('Signature webhook manquante')
  }

  const rawBody = await req.text()

  const event = await stripe.webhooks.constructEventAsync(
    rawBody,
    signature,
    webhookSecret,
  )

  return event
}

/**
 * Gère l'événement payment_intent.succeeded :
 * Marque la commande comme payée dans Supabase et crée un order_event.
 */
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

  // Mettre à jour le statut de la commande
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'payée',
      payment_intent_id: paymentIntent.id,
      payment_method: 'card',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    console.error('[stripe] Erreur mise à jour commande :', orderError.message)
    throw orderError
  }

  // Créer un événement de traçabilité
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
    console.warn('[stripe] Erreur création order_event :', eventError.message)
  }

  console.log(`[stripe] Commande ${orderId} marquée comme payée`)
}

/**
 * Gère l'événement account.updated :
 * Met à jour le statut du compte partenaire/livreur dans Supabase
 * en fonction du statut Stripe (charges_enabled, payouts_enabled).
 */
async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account,
): Promise<void> {
  const accountId = account.id
  const onboardType = account.metadata?.onboard_type || ''
  const onboardName = account.metadata?.onboard_name || ''

  console.log(`[stripe] account.updated — ${accountId}, charges: ${account.charges_enabled}, payouts: ${account.payouts_enabled}`)

  // Déterminer le statut basé sur l'état du compte Stripe
  let status: string
  let onboardingCompleted = false
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'actif'
    onboardingCompleted = true
  } else if (account.charges_enabled) {
    status = 'payments_ready'
  } else if (account.details_submitted) {
    status = 'details_submitted'
  } else {
    status = 'onboarding'
  }

  if (onboardType === 'partner') {
    const { error } = await supabase
      .from('partners')
      .update({
        stripe_status: status,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        onboarding_completed: onboardingCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId)

    if (error) {
      console.warn('[stripe] Erreur mise à jour partners :', error.message)
    } else {
      console.log(`[stripe] Compte partenaire ${onboardName || accountId} → ${status} (onboarding: ${onboardingCompleted})`)
    }
  } else if (onboardType === 'driver') {
    const { error } = await supabase
      .from('drivers')
      .update({
        stripe_status: status,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        onboarding_completed: onboardingCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId)

    if (error) {
      console.warn('[stripe] Erreur mise à jour drivers :', error.message)
    } else {
      console.log(`[stripe] Compte livreur ${onboardName || accountId} → ${status}`)
    }
  } else {
    // Si le type n'est pas défini dans les metadata, essayer les deux tables
    for (const table of ['partners', 'drivers'] as const) {
      const { error } = await supabase
        .from(table)
        .update({
          stripe_status: status,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_account_id', accountId)

      if (!error) {
        console.log(`[stripe] Compte ${table} ${accountId} → ${status}`)
        break
      }
    }
  }
}

/**
 * Gère l'événement transfer.created :
 * Logge le transfert Stripe dans la table payouts (si existante)
 * ou simplement en console.
 */
async function handleTransferCreated(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer,
): Promise<void> {
  console.log(`[stripe] transfer.created — ${transfer.id}, montant: ${transfer.amount}, destination: ${transfer.destination}`)

  // Tentative d'insertion dans la table payouts (créée par migration)
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
    // La table payouts peut ne pas exister — simple log
    console.log('[stripe] Log transfert (table payouts non disponible ou erreur) :', error.message)
    console.log('[stripe] Détails transfert :', {
      id: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency,
      destination: transfer.destination,
    })
  } else {
    console.log(`[stripe] Transfert ${transfer.id} enregistré dans payouts`)
  }
}

/**
 * Webhook Stripe — endpoint sécurisé pour recevoir les événements Stripe.
 *
 * POST /stripe-webhook
 * Vérifie la signature du webhook avant de traiter les événements.
 *
 * Événements gérés :
 * - payment_intent.succeeded → marque la commande payée
 * - account.updated → met à jour le statut du compte Connect
 * - transfer.created → log du transfert
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // --- Vérification de la signature webhook ---
    const event = await verifyWebhook(req)

    console.log(`[stripe] Webhook reçu : ${event.type} (id: ${event.id})`)

    // --- Idempotence : éviter de traiter 2x le même événement ---
    if (processedEvents.has(event.id)) {
      console.log(`[stripe] Événement ${event.id} déjà traité — ignoré (idempotence)`)
      return new Response(JSON.stringify({ received: true, idempotent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    processedEvents.add(event.id)

    // --- Initialisation Supabase (service role) ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // --- Routage des événements ---
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(supabase, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const failedPI = event.data.object as Stripe.PaymentIntent
        const failedOrderId = failedPI.metadata?.orderId
        console.log(`[stripe] payment_intent.payment_failed — PI: ${failedPI.id}, orderId: ${failedOrderId}, error: ${failedPI.last_payment_error?.message || 'inconnu'}`)

        if (failedOrderId) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
          await supabase
            .from('orders')
            .update({ status: 'payment_failed', payment_error: failedPI.last_payment_error?.message || 'Erreur de paiement' })
            .eq('id', failedOrderId)
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(supabase, account)
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        await handleTransferCreated(supabase, transfer)
        break
      }

      default:
        console.log(`[stripe] Événement non géré : ${event.type}`)
    }

    // Stripe attend un 200 OK pour accuser réception
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    const message = (err as Error).message
    console.error('[stripe] Erreur webhook :', message)

    // Signature invalide → 401
    if (message.includes('signature') || message.includes('webhook')) {
      return new Response(JSON.stringify({ error: 'Signature webhook invalide' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
