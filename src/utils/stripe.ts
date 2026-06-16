import { supabase } from '../lib/supabase';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * Crée un Payment Intent standard (sans Stripe Connect).
 * Utilisé quand le traiteur n'a pas encore de compte Stripe Connect.
 *
 * @param total - Montant total en euros
 * @param orderId - Identifiant de la commande
 * @param vendorAccountId - (optionnel) ID du compte Stripe du vendeur
 * @returns Le clientSecret du Payment Intent, ou null en cas d'erreur
 */
export async function createPaymentIntent(
  total: number,
  orderId: string,
  vendorAccountId?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(total * 100),
        currency: 'eur',
        orderId,
        vendorAccountId,
      },
    });

    if (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }

    return data.clientSecret;
  } catch (error) {
    console.error('Error calling payment function:', error);
    return null;
  }
}

/**
 * Crée un Payment Intent Stripe Connect pour un traiteur disposant
 * d'un compte Stripe Connect. Les fonds sont automatiquement
 * répartis entre la plateforme et le vendeur.
 *
 * @param amount - Montant total en euros
 * @param orderId - Identifiant de la commande
 * @param vendorStripeAccountId - ID du compte Stripe Connect du traiteur (acct_xxx)
 * @returns Le clientSecret du Payment Intent, ou null en cas d'erreur
 */
export async function createConnectPaymentIntent(
  amount: number,
  orderId: string,
  vendorStripeAccountId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(amount * 100),
        currency: 'eur',
        orderId,
        vendorAccountId: vendorStripeAccountId,
        connect: true,
      },
    });

    if (error) {
      console.error('Error creating Connect payment intent:', error);
      return null;
    }

    return data.clientSecret;
  } catch (error) {
    console.error('Error calling Connect payment function:', error);
    return null;
  }
}

/**
 * Récupère un lien d'onboarding Stripe Connect pour un traiteur.
 * Ce lien permet au traiteur de créer ou connecter son compte Stripe.
 *
 * @param email - Email du traiteur (contact@delikreol.mq)
 * @param name - Nom commercial du traiteur
 * @param type - Type de business (restaurant, producer, merchant)
 * @returns L'URL d'onboarding Stripe Connect, ou null en cas d'erreur
 */
export async function getStripeConnectOnboardingLink(
  email: string,
  name: string,
  type: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {
      body: {
        email,
        name,
        type,
      },
    });

    if (error) {
      console.error('Error getting Connect onboarding link:', error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error('Error calling Connect onboarding function:', error);
    return null;
  }
}

/**
 * Crée un compte Stripe Connect pour un traiteur.
 *
 * @param email - Email du traiteur
 * @param businessName - Nom commercial
 * @param userId - ID utilisateur Supabase
 * @returns L'ID du compte Stripe Connect, ou null en cas d'erreur
 */
export async function createConnectedAccount(
  email: string,
  businessName: string,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-connected-account', {
      body: {
        email,
        businessName,
        userId,
      },
    });

    if (error) {
      console.error('Error creating connected account:', error);
      return null;
    }

    return data.accountId;
  } catch (error) {
    console.error('Error calling account creation function:', error);
    return null;
  }
}

/**
 * Retourne la clé publiable Stripe depuis les variables d'environnement.
 */
export function getStripePublishableKey(): string | undefined {
  return STRIPE_PUBLISHABLE_KEY;
}