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

/** Type d'utilisateur Stripe Connect */
type OnboardType = 'partner' | 'driver'

/** Corps de la requête attendue */
interface OnboardRequest {
  email: string
  name: string
  type: OnboardType
}

/**
 * Crée un compte Stripe Connect Express pour un partenaire (traiteur) ou un livreur,
 * génère un lien d'onboarding Stripe, et stocke le stripe_account_id dans Supabase.
 *
 * POST /stripe-connect-onboard
 * Body: { email, name, type: 'partner' | 'driver' }
 *
 * @returns { accountLink: string } L'URL d'onboarding Stripe à rediriger le user
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body: OnboardRequest = await req.json()
    const { email, name, type } = body

    // --- Validation des champs obligatoires ---
    if (!email || !name || !type) {
      throw new Error('Champs obligatoires : email, name, type (partner|driver)')
    }
    if (type !== 'partner' && type !== 'driver') {
      throw new Error("Le champ 'type' doit être 'partner' ou 'driver'")
    }

    console.log(`[stripe] Création compte Connect Express pour ${type} : ${email}`)

    // --- Création du compte Stripe Connect Express ---
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      business_type: 'individual',
      business_profile: {
        name,
        product_description: type === 'partner'
          ? 'Traiteur partenaire Delikreol — Marketplace culinaire Martinique'
          : 'Livreur partenaire Delikreol — Livraison de repas Martinique',
      },
      metadata: {
        onboard_type: type,
        onboard_name: name,
      },
    })

    const stripeAccountId = account.id
    console.log(`[stripe] Compte Connect créé : ${stripeAccountId}`)

    // --- Génération du lien d'onboarding Stripe ---
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${Deno.env.get('PUBLIC_SITE_URL') || 'https://delikreol.mq'}/stripe-onboard/refresh`,
      return_url: `${Deno.env.get('PUBLIC_SITE_URL') || 'https://delikreol.mq'}/stripe-onboard/success`,
      type: 'account_onboarding',
    })

    console.log(`[stripe] Lien d'onboarding généré pour ${stripeAccountId}`)

    // --- Stockage du stripe_account_id dans Supabase ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (type === 'partner') {
      // La table "partners" doit exister avec une colonne stripe_account_id
      // On met à jour par email (le partenaire a déjà été créé dans la BDD)
      const { error: updateError } = await supabase
        .from('partners')
        .update({ stripe_account_id: stripeAccountId, updated_at: new Date().toISOString() })
        .eq('email', email)

      if (updateError) {
        console.warn('[stripe] Impossible de mettre à jour partners :', updateError.message)
        // Tentative d'insertion si l'enregistrement n'existe pas encore
        const { error: insertError } = await supabase
          .from('partners')
          .insert({ email, name, stripe_account_id: stripeAccountId, status: 'onboarding' })

        if (insertError) {
          console.warn('[stripe] Impossible d\'insérer dans partners :', insertError.message)
        }
      }
    } else {
      // type === 'driver'
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ stripe_account_id: stripeAccountId, updated_at: new Date().toISOString() })
        .eq('email', email)

      if (updateError) {
        console.warn('[stripe] Impossible de mettre à jour drivers :', updateError.message)
        const { error: insertError } = await supabase
          .from('drivers')
          .insert({ email, name, stripe_account_id: stripeAccountId, status: 'onboarding' })

        if (insertError) {
          console.warn('[stripe] Impossible d\'insérer dans drivers :', insertError.message)
        }
      }
    }

    return new Response(JSON.stringify({
      accountLink: accountLink.url,
      stripeAccountId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('[stripe] Erreur stripe-connect-onboard :', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
