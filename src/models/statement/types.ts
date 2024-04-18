import { CheckInTypes } from '@prisma/client';
import { PrismaInstance } from '@server/db';

export interface FindAllCreditsByUserIdParams {
  userId: string;
}

export interface AddCreditsParams {
  userId: string;
  amount: number;
  title: string;
  description: string;
  paymentId?: string;
  prismaInstance: PrismaInstance;
  checkInType: CheckInTypes;
}
