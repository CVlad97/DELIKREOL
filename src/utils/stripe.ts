import { supabase } from '../lib/supabase';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

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

export function getStripePublishableKey(): string | undefined {
  return STRIPE_PUBLISHABLE_KEY;
}
