import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

export const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2024-09-30.acacia',
  appInfo: {
    name: 'yoka club',
    version: '0.1.0',
  },
});

export async function getStripeJs() {
  const stripeJs = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  );

  return stripeJs;
}
