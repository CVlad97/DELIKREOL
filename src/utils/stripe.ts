import { supabase } from '../lib/supabase';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * Crée une session Stripe Checkout hébergée à partir d'une commande déjà
 * enregistrée. Le montant est recalculé côté serveur depuis la base.
 */
export async function createStripeCheckoutSession(
  orderId: string,
  returnUrl: string,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { orderId, returnUrl },
  });

  if (error) {
    console.error('Error creating Stripe Checkout session:', error);
    throw error;
  }

  if (!data?.url || typeof data.url !== 'string') {
    throw new Error(data?.error || 'Stripe Checkout URL manquante');
  }

  return data.url;
}

/**
 * Crée un PaymentIntent standard. Conservé pour les écrans qui utilisent
 * Stripe Elements ; le montant transmis à la fonction est en centimes.
 */
export async function createPaymentIntent(
  total: number,
  orderId: string,
  vendorAccountId?: string,
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

    return data?.clientSecret ?? null;
  } catch (error) {
    console.error('Error calling payment function:', error);
    return null;
  }
}

/**
 * Crée un PaymentIntent Stripe Connect pour un traiteur disposant d'un
 * compte Connect. Le backend attend vendorAccountId.
 */
export async function createConnectPaymentIntent(
  amount: number,
  orderId: string,
  vendorStripeAccountId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(amount * 100),
        currency: 'eur',
        orderId,
        vendorAccountId: vendorStripeAccountId,
      },
    });

    if (error) {
      console.error('Error creating Connect payment intent:', error);
      return null;
    }

    return data?.clientSecret ?? null;
  } catch (error) {
    console.error('Error calling Connect payment function:', error);
    return null;
  }
}

/**
 * Récupère un lien d'onboarding Stripe Connect pour un traiteur.
 */
export async function getStripeConnectOnboardingLink(
  email: string,
  name: string,
  type: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {
      body: { email, name, type },
    });

    if (error) {
      console.error('Error getting Connect onboarding link:', error);
      return null;
    }

    return data?.accountLink ?? null;
  } catch (error) {
    console.error('Error calling Connect onboarding function:', error);
    return null;
  }
}

/**
 * Crée un compte Stripe Connect pour un traiteur.
 */
export async function createConnectedAccount(
  email: string,
  businessName: string,
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-connected-account', {
      body: { email, businessName, userId },
    });

    if (error) {
      console.error('Error creating connected account:', error);
      return null;
    }

    return data?.accountId ?? null;
  } catch (error) {
    console.error('Error calling account creation function:', error);
    return null;
  }
}

export function getStripePublishableKey(): string | undefined {
  return STRIPE_PUBLISHABLE_KEY;
}
