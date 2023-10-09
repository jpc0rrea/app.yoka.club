import { api } from '@lib/api';
import { useQuery } from '@tanstack/react-query';

export type PlanIds =
  | 'FREE'
  | 'MONTHLY_8'
  | 'MONTHLY_12'
  | 'QUARTERLY_8'
  | 'QUARTERLY_12';

export interface UserPlan {
  id: PlanIds;
  type: 'free' | 'premium';
  name: 'yogi iniciante' | 'yogi premium';
  checkinsQuantity: number;
  price: number;
  extra: string;
  cancelAtPeriodEnd: boolean;
  expirationDate?: Date;
  nextBillingDate?: Date;
  nextBillingValue?: string;
}

export interface Plan {
  id: PlanIds;
  fullPricePerBillingPeriod: number;
  pricePerMonth: number;
}

export const planPrices: Plan[] = [
  {
    id: 'MONTHLY_8',
    fullPricePerBillingPeriod: 199.9,
    pricePerMonth: 199.9,
  },
  {
    id: 'MONTHLY_12',
    fullPricePerBillingPeriod: 259.9,
    pricePerMonth: 259.9,
  },
  {
    id: 'QUARTERLY_8',
    fullPricePerBillingPeriod: 499.7,
    pricePerMonth: 166.57,
  },
  {
    id: 'QUARTERLY_12',
    fullPricePerBillingPeriod: 649.7,
    pricePerMonth: 216.57,
  },
];

interface GetPlanPricePerMonthParams {
  billingPeriod: 'monthly' | 'quarterly';
  checkInsQuantity: number;
}

export function getPlanPricePerMonth({
  billingPeriod,
  checkInsQuantity,
}: GetPlanPricePerMonthParams) {
  const plan = planPrices.find(
    (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
  );

  return plan?.pricePerMonth || 0;
}

export function getFullPricePerBillingPeriod({
  billingPeriod,
  checkInsQuantity,
}: GetPlanPricePerMonthParams) {
  const plan = planPrices.find(
    (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
  );

  return plan?.fullPricePerBillingPeriod || 0;
}

export async function getUserPlan() {
  const { data } = await api.get<{
    plan: UserPlan;
  }>('/user/plan');

  return data.plan;
}

export function useUserPlan() {
  return useQuery({
    queryKey: ['userPlan'],
    queryFn: getUserPlan,
  });
}
