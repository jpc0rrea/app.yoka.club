import { PaymentMethod, PaymentPlatform } from '@prisma/client';
import Stripe from 'stripe';

export interface HandleStripeInvoicePaidParams {
  stripeInvoice: Stripe.Invoice;
}

export interface InsertPaymentParams {
  userId: string;
  planId?: number;
  externalId: string;
  platform: PaymentPlatform;
  method: PaymentMethod;
  grossValue: number;
  netValue: number;
  fee: number;
  currency: string;
}
