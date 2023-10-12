import { Payment, PaymentMethod, PaymentPlatform, Plan } from '@prisma/client';
import { PrismaInstance } from '@server/db';
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
  prismaInstance: PrismaInstance;
}

export interface GetPaymentsFromUserParams {
  userId: string;
}

export interface CleanPaymentsToFrontendParams {
  payments: (Payment & {
    plan: Plan | null;
  })[];
}

export interface HandleMercadoPagoPaymentParams {
  paymentId: string;
}
