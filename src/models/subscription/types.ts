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
