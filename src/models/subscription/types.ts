import { BillingPeriod, PlanCode } from '@lib/stripe/plans';
import { PrismaInstance } from '@server/db';

export interface RenewSubscriptionParams {
  userId: string;
  planId: number;
  paymentId: string;
  subscriptionId: string;
  prismaInstance: PrismaInstance;
}

export interface CancelSubscriptionParams {
  userId: string;
}

export interface CreateSubscriptionCheckoutSession {
  userId: string;
  planCode: PlanCode;
  billingPeriod: BillingPeriod;
  sessionToken?: string;
  prismaInstance: PrismaInstance;
}
