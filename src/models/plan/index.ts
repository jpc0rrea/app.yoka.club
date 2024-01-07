import stripeUtils from '@lib/stripe/utils';
import { CreatePlanParams, GetUserPlanParams } from './types';
import { prisma } from '@server/db';
import { NotFoundError } from '@errors/index';
import user from '@models/user';
import { PlanIds, UserPlan } from '@hooks/useUserPlan';
import { isAfter } from 'date-fns';

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
    name: 'yogini iniciante',
    price: 0,
    checkinsQuantity: 0,
    extra: 'acesso aos conteúdos gratuitos',
    cancelAtPeriodEnd: false,
  };

  if (
    !userObject.stripeId ||
    !userObject.expirationDate ||
    isAfter(new Date(), userObject.expirationDate) ||
    !userObject.subscriptionId
  ) {
    return plan;
  }

  const subscriptionDetails = await stripeUtils.getSubscriptionDetails({
    stripeCustomerId: userObject.stripeId,
    stripeSubscriptionId: userObject.subscriptionId,
  });

  plan.expirationDate = new Date(userObject.expirationDate);
  plan.type = 'premium';
  plan.nextBillingValue = subscriptionDetails.nextBillingValue;
  plan.nextBillingDate = new Date(subscriptionDetails.nextBillingTime);
  plan.id = subscriptionDetails.plan.id as PlanIds;
  plan.name = 'yogini premium';
  plan.checkinsQuantity = subscriptionDetails.plan.checkInsQuantity;
  plan.price = subscriptionDetails.plan.fullPricePerBillingPeriod;
  plan.extra = 'acesso a todas as aulas gravadas e a conteúdos exclusivos';
  plan.cancelAtPeriodEnd = subscriptionDetails.cancelAtPeriodEnd;

  return plan;
}

export default Object.freeze({
  create,
  getPlanByStripePriceId,
  getPlanByPlanId,
  getUserPlan,
});
