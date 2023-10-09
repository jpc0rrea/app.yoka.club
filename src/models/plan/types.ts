import { RecurrencePeriod } from '@prisma/client';

export interface CreatePlanParams {
  checkInsQuantity: number;
  price: number;
  currency: string;
  recurrencePeriod: RecurrencePeriod;
  isActive: boolean;
  stripePriceId: string;
}

export interface GetUserPlanParams {
  userId: string;
}
