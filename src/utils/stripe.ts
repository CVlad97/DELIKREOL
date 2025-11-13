import Stripe from "stripe";

const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
}) : null;

export async function createPaymentIntent(
  total: number,
  vendorAccountId?: string
): Promise<string | null> {
  if (!stripe) {
    console.warn('Stripe is not configured');
    return null;
  }

  try {
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(total * 100),
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (vendorAccountId) {
      paymentIntentData.application_fee_amount = Math.round(total * 0.10 * 100);
      paymentIntentData.transfer_data = {
        destination: vendorAccountId,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

export async function createConnectedAccount(
  email: string,
  businessName: string
): Promise<string | null> {
  if (!stripe) {
    console.warn('Stripe is not configured');
    return null;
  }

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
      },
    });

    return account.id;
  } catch (error) {
    console.error('Error creating connected account:', error);
    return null;
  }
}
