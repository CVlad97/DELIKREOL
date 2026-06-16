import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/** Corps de la requête attendue */
interface PayoutRequest {
  /** Stripe Connect account ID du livreur */
  driverStripeAccountId: string
  /** Montant en EUR (ex: 15.00) */
  amount: number
  /** Identifiant de la mission/livraison concernée */
  orderId: string
}

/**
 * Vérifie que le header Authorization contient un token JWT valide
 * avec le rôle 'admin' (service_role).
 */
async function verifyAdminAuth(
  supabase: ReturnType<typeof createClient>,
  req: Request,
): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace(/^Bearer\s+/i, '')

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false

    // Vérifier que l'utilisateur a le rôle admin via la table profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch {
    console.warn('[stripe] Auth admin échouée — token JWT invalide')
    return false
  }
}

/**
 * Crée un transfert Stripe vers le compte Connect d'un livreur.
 *
 * POST /stripe-payout
 * Body: { driverStripeAccountId, amount, orderId }
 * Auth: admin (Authorization: Bearer <service_role_key or JWT>)
 *
 * @returns { transfer: Transfer } L'objet transfert Stripe créé
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // --- Vérification admin ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const isAdmin = await verifyAdminAuth(supabase, req)

    if (!isAdmin) {
      console.warn('[stripe] Tentative de payout non autorisée')
      return new Response(JSON.stringify({ error: 'Accès non autorisé — rôle admin requis' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // --- Validation du body ---
    const body: PayoutRequest = await req.json()
    const { driverStripeAccountId, amount, orderId } = body

    if (!driverStripeAccountId) {
      throw new Error('Champ obligatoire : driverStripeAccountId')
    }
    if (!amount || amount <= 0) {
      throw new Error('Montant invalide (doit être > 0)')
    }
    if (!orderId) {
      throw new Error('Champ obligatoire : orderId')
    }

    const amountInCents = Math.round(amount * 100)
    console.log(`[stripe] Création transfert — ${amount} EUR vers ${driverStripeAccountId} (commande: ${orderId})`)

    // --- Vérification que la commande existe et est payée ---
    const { data: order, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .single()

    if (orderCheckError || !order) {
      throw new Error(`Commande ${orderId} introuvable`)
    }
    if (order.payment_status !== 'paid' && order.status !== 'payée') {
      throw new Error(`Commande ${orderId} non payée (status: ${order.payment_status || order.status}) — payout impossible`)
    }

    // --- Vérification que le livreur a les droits Stripe ---
    const { data: driver } = await supabase
      .from('drivers')
      .select('stripe_payouts_enabled, stripe_status')
      .eq('stripe_connect_account_id', driverStripeAccountId)
      .single()

    if (!driver) {
      console.warn('[stripe] Livreur non trouvé dans drivers, transfert quand même...')
    } else if (!driver.stripe_payouts_enabled) {
      throw new Error(`Le livreur n'a pas les paiements activés (stripe_payouts_enabled=${driver.stripe_payouts_enabled})`)
    }

    // Génération d'une clé d'idempotence pour éviter les doublons Stripe
    const idempotencyKey = `payout_${orderId}_${Date.now()}`

    // --- Création du transfert Stripe ---
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'eur',
      destination: driverStripeAccountId,
      description: `Paiement livreur — Commande ${orderId}`,
      metadata: {
        orderId,
      },
    }, {
      idempotencyKey,
    })

    console.log(`[stripe] Transfert créé : ${transfer.id}`)

    // --- Enregistrement dans la table payouts ---
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert({
        stripe_transfer_id: transfer.id,
        stripe_account_id: driverStripeAccountId,
        order_id: orderId,
        amount,
        currency: 'eur',
        status: 'completed',
        description: `Paiement livreur — Commande ${orderId}`,
      })

    if (payoutError) {
      console.warn('[stripe] Erreur enregistrement payout dans Supabase :', payoutError.message)
    }

    return new Response(JSON.stringify({
      success: true,
      transfer: {
        id: transfer.id,
        amount,
        currency: 'eur',
        destination: driverStripeAccountId,
        status: 'completed',
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('[stripe] Erreur stripe-payout :', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
