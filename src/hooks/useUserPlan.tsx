import { api } from '@lib/api';
import {
  BillingPeriod,
  OLD_PLANS,
  PLANS,
  PlanCode,
  PlanId,
  PlanName,
  PlanType,
} from '@lib/stripe/plans';
import { useQuery } from '@tanstack/react-query';

export interface UserPlan {
  id: PlanId;
  type: PlanType;
  code: PlanCode;
  name: PlanName;
  checkinsQuantity: number;
  price: number;
  cancelAtPeriodEnd: boolean;
  canSeeExclusiveContents: boolean;
  expirationDate?: Date;
  nextBillingDate?: Date;
  nextBillingValue?: string;
  stripeSubscriptionId?: string;
}

interface GetPlanPricePerMonthParams {
  billingPeriod: BillingPeriod;
  checkInsQuantity: number;
}

export function getPlanPricePerMonth({
  billingPeriod,
  checkInsQuantity,
}: GetPlanPricePerMonthParams) {
  let plan = PLANS.find(
    (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
  );

  if (!plan) {
    plan = OLD_PLANS.find(
      (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
    );
  }

  return plan?.pricePerMonth || 0;
}

export function getFullPricePerBillingPeriod({
  billingPeriod,
  checkInsQuantity,
}: GetPlanPricePerMonthParams) {
  let plan = PLANS.find(
    (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
  );

  if (!plan) {
    plan = OLD_PLANS.find(
      (plan) => plan.id === `${billingPeriod.toUpperCase()}_${checkInsQuantity}`
    );
  }

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
