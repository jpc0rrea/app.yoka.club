import stripeUtils from '@lib/stripe/utils';
import { CreatePlanParams, GetUserPlanParams } from './types';
import { prisma } from '@server/db';
import { NotFoundError } from '@errors/index';
import user from '@models/user';
import { UserPlan } from '@hooks/useUserPlan';
import { isAfter } from 'date-fns';
// import { PlanId } from '@lib/stripe/plans';

async function create({
  checkInsQuantity,
  price,
  currency,
  recurrencePeriod,
  isActive,
  stripePriceId,
}: CreatePlanParams) {
  const priceInStripe = await stripeUtils.getPriceByPriceId(stripePriceId);

  const plan = await prisma.plan.create({
    data: {
      checkInsQuantity,
      price,
      currency,
      recurrencePeriod,
      isActive,
      stripePriceId: priceInStripe.id,
    },
  });

  return plan;
}

async function getPlanByStripePriceId(stripePriceId: string) {
  const plan = await prisma.plan.findFirst({
    where: {
      stripePriceId,
    },
  });

  if (!plan) {
    throw new NotFoundError({
      message: `o plano com o stripePriceId ${stripePriceId} não foi encontrado.`,
      action: `verifique se o plano com o stripePriceId ${stripePriceId} existe e tente novamente.`,
      errorLocationCode: 'MODEL:PLAN:GET_PLAN_BY_STRIPE_PRICE_ID:MISSING_PLAN',
    });
  }

  return plan;
}

async function getPlanByPlanId(planId: number) {
  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
    },
  });

  if (!plan) {
    throw new NotFoundError({
      message: `o plano com o id ${planId} não foi encontrado.`,
      action: `verifique se o plano com o id ${planId} existe e tente novamente.`,
      errorLocationCode: 'MODEL:PLAN:GET_PLAN_BY_PLAN_ID:MISSING_PLAN',
    });
  }

  return plan;
}

async function getUserPlan({ userId }: GetUserPlanParams) {
  const userObject = await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  const plan: UserPlan = {
    id: 'FREE',
    type: 'free',
    name: 'plano gratuito',
    code: 'free',
    price: 0,
    checkinsQuantity: 0,
    cancelAtPeriodEnd: false,
    expirationDate: userObject.expirationDate || undefined,
    canSeeExclusiveContents: userObject.expirationDate
      ? isAfter(userObject.expirationDate, new Date())
      : false,
    stripeSubscriptionId: userObject.subscriptionId || undefined,
  };

  if (
    !userObject.expirationDate ||
    isAfter(new Date(), userObject.expirationDate)
  ) {
    return plan;
  }

  plan.type = 'premium';
  plan.code = 'zen';
  plan.checkinsQuantity = userObject.checkInsQuantity;
  plan.expirationDate = new Date(userObject.expirationDate);
  plan.name = 'plano zen';

  if (!userObject.subscriptionId || !userObject.stripeId) {
    return plan;
  }

  // const subscriptionDetails = await stripeUtils.getSubscriptionDetails({
  //   stripeCustomerId: userObject.stripeId,
  //   stripeSubscriptionId: userObject.subscriptionId,
  // });

  plan.expirationDate = new Date(userObject.expirationDate);
  plan.type = 'premium';
  // plan.nextBillingValue = subscriptionDetails.nextBillingValue;
  plan.nextBillingValue = 'R$ 89,90';
  // plan.nextBillingDate = new Date(subscriptionDetails.nextBillingTime);
  plan.nextBillingDate = new Date('2025-03-24T14:00:00.000Z');
  // plan.id = subscriptionDetails.plan.id as PlanId;
  plan.id = 'MONTHLY';
  plan.name = 'plano zen';
  plan.code = 'zen';
  // plan.checkinsQuantity = subscriptionDetails.plan.checkInsQuantity;
  // plan.price = subscriptionDetails.plan.fullPricePerBillingPeriod;
  plan.price = 89.9;
  // plan.cancelAtPeriodEnd = subscriptionDetails.cancelAtPeriodEnd;
  plan.cancelAtPeriodEnd = false;
  return plan;
}

export default Object.freeze({
  create,
  getPlanByStripePriceId,
  getPlanByPlanId,
  getUserPlan,
});
