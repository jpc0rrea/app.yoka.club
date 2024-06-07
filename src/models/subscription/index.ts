import statement from '@models/statement';
import plan from '@models/plan';
import user from '@models/user';
import { prisma } from '@server/db';
import {
  CancelSubscriptionParams,
  CreateSubscriptionCheckoutSession,
  RenewSubscriptionParams,
} from './types';
import { UnauthorizedError } from '@errors/index';
import { stripe } from '@lib/stripe';
import eventLogs from '@models/event-logs';
import { PLANS } from '@lib/stripe/plans';
import webserver from '@infra/webserver';

async function renewSubscription({
  userId,
  planId,
  paymentId,
  subscriptionId,
  prismaInstance,
}: RenewSubscriptionParams) {
  const planObject = await plan.getPlanByPlanId(planId);

  const multiplier =
    planObject.recurrencePeriod === 'MONTHLY'
      ? 1
      : planObject.recurrencePeriod === 'QUARTERLY'
      ? 3
      : 12;

  const checkInsQuantity = planObject.checkInsQuantity * multiplier;

  // criar o statement se a quantidade de check-ins for maior que 0
  if (checkInsQuantity > 0) {
    await statement.createCreditStatement({
      amount: checkInsQuantity,
      description: `${checkInsQuantity} check-ins adicionados. ${
        planObject.checkInsQuantity
      } check-ins por mês no plano ${
        planObject.recurrencePeriod === 'MONTHLY' ? 'mensal' : 'trimestral'
      }.`,
      title: `renovação da assinatura da plataforma`,
      userId,
      paymentId,
      prismaInstance,
      checkInType: 'PAID',
    });
  }

  // atualizar o usuário: checkins, data de expiração e assinatura
  await user.updateUserSubscription({
    checkInsQuantity: checkInsQuantity,
    userId,
    subscriptionId,
    recurrencePeriod: planObject.recurrencePeriod,
    prismaInstance,
  });
}

async function cancelSubscription({ userId }: CancelSubscriptionParams) {
  const userObject = await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  if (!userObject.stripeId || !userObject.subscriptionId) {
    throw new UnauthorizedError({
      message: `o usuário não possui uma assinatura ativa.`,
      action: `verifique se o usuário possui uma assinatura ativa e tente novamente.`,
      errorLocationCode: 'MODEL:SUBSCRIPTION:CANCEL_SUBSCRIPTION:MISSING_USER',
    });
  }

  await stripe.subscriptions.update(userObject.subscriptionId, {
    cancel_at_period_end: true,
  });

  await eventLogs.createEventLog({
    userId,
    eventType: 'USER.CANCEL_SUBSCRIPTION',
    metadata: {
      subscriptionId: userObject.subscriptionId,
    },
    prismaInstance: prisma,
  });
}

async function createSubscriptionCheckoutSession({
  userId,
  planCode,
  billingPeriod,
  sessionToken,
  prismaInstance,
}: CreateSubscriptionCheckoutSession) {
  const userObject = await user.findOneById({
    userId,
    prismaInstance: prismaInstance,
  });

  const { stripeId } = userObject;

  let customerId = stripeId || '';

  if (!stripeId) {
    const stripeCustomer = await stripe.customers.create({
      email: userObject.email,
      name: userObject.name,
      metadata: {
        userId,
      },
    });

    customerId = stripeCustomer.id;

    await prismaInstance.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeId: customerId,
      },
    });
  }

  const priceId =
    PLANS.find(
      (plan) => plan.billingPeriod === billingPeriod && plan.code === planCode
    )?.stripePriceId || '';

  if (!priceId) {
    throw new UnauthorizedError({
      message: `o plano com o código ${planCode} e período de cobrança ${billingPeriod} não foi encontrado.`,
      action: `verifique se o plano com o código ${planCode} e período de cobrança ${billingPeriod} existe e tente novamente.`,
      errorLocationCode:
        'MODEL:SUBSCRIPTION:CREATE_SUBSCRIPTION_CHECKOUT_SESSION:MISSING_PLAN',
    });
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: sessionToken
      ? `${process.env.STRIPE_SUCCESS_URL}?sessionToken=${sessionToken}`
      : process.env.STRIPE_SUCCESS_URL,
    cancel_url: sessionToken
      ? `${webserver.host}/register/without-password?sessionToken=${sessionToken}`
      : process.env.STRIPE_CANCEL_URL,
  });

  return stripeCheckoutSession.id;
}

export default Object.freeze({
  renewSubscription,
  cancelSubscription,
  createSubscriptionCheckoutSession,
});
