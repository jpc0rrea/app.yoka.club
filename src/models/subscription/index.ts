import statement from '@models/statement';
import plan from '@models/plan';
import user from '@models/user';
import { prisma } from '@server/db';
import { CancelSubscriptionParams, RenewSubscriptionParams } from './types';
import { UnauthorizedError } from '@errors/index';
import { stripe } from '@lib/stripe';
import eventLogs from '@models/event-logs';

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

export default Object.freeze({
  renewSubscription,
  cancelSubscription,
});
