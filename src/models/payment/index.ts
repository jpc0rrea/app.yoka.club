import { ValidationError } from '@errors/index';
import {
  CleanPaymentsToFrontendParams,
  GetPaymentsFromUserParams,
  HandleStripeInvoicePaidParams,
  InsertPaymentParams,
} from './types';
import { prisma } from '@server/db';
import stripeUtils from '@lib/stripe/utils';
import plan from '@models/plan';
import subscriptions from '@models/subscription';
import { roundNumber } from '@lib/utils';

async function handleStripeInvoicePaid({
  stripeInvoice,
}: HandleStripeInvoicePaidParams) {
  console.log('cheguei no handleStripeInvoicePaid');
  const subscription = await stripeUtils.getInvoiceSubscription({
    invoice: stripeInvoice,
  });

  const price = await stripeUtils.getInvoicePrice({
    invoice: stripeInvoice,
  });

  const userObject = await stripeUtils.getInvoiceUser({
    invoice: stripeInvoice,
  });

  const balanceTransaction = await stripeUtils.getInvoiceBalanceTransaction({
    invoice: stripeInvoice,
  });

  const grossValue = balanceTransaction.amount;
  const netValue = balanceTransaction.net;
  const fee = balanceTransaction.fee;
  const currency = stripeInvoice.currency;

  console.log({ grossValue, netValue, fee, currency });

  if (!grossValue || !netValue || !fee || !currency) {
    throw new ValidationError({
      message: `a fatura não possui valores.`,
      action: `verifique se a fatura possui valores e tente novamente.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:PAYMENTS:HANDLE_STRIPE_INVOICE_PAID:MISSING_VALUES',
    });
  }

  const planObject = await plan.getPlanByStripePriceId(price.id);

  const planId = planObject.id;

  await prisma.$transaction(
    async (tx) => {
      // criar o pagamento
      const payment = await insertPayment({
        userId: userObject.id,
        planId,
        externalId: stripeInvoice.id,
        platform: 'STRIPE',
        method: 'CREDIT_CARD',
        grossValue,
        netValue,
        fee,
        currency,
        prismaInstance: tx,
      });

      await subscriptions.renewSubscription({
        userId: userObject.id,
        subscriptionId: subscription.id,
        planId,
        paymentId: payment.id,
        prismaInstance: tx,
      });
    },
    {
      maxWait: 7000, // default: 2000
      timeout: 10000, // default: 5000
    }
  );
}

async function insertPayment({
  userId,
  planId,
  externalId,
  platform,
  method,
  grossValue,
  netValue,
  fee,
  currency,
  prismaInstance,
}: // useTransaction = false,
InsertPaymentParams) {
  const payment = await prismaInstance.payment.create({
    data: {
      userId,
      planId,
      externalId,
      platform,
      method,
      grossValue,
      netValue,
      fee,
      currency,
    },
  });

  return payment;
}

async function getAllFromUser({ userId }: GetPaymentsFromUserParams) {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
    },
    include: {
      plan: true,
    },
  });

  return payments;
}

function cleanPaymentsForFrontend({ payments }: CleanPaymentsToFrontendParams) {
  const cleanPayments = payments.map((payment) => {
    return {
      ...payment,
      grossValue: roundNumber({
        value: payment.grossValue / 100,
        decimalPlaces: 2,
      }),
      netValue: undefined,
      fee: undefined,
      plan: {
        recurrencePeriod: payment.plan?.recurrencePeriod,
      },
    };
  });

  return cleanPayments;
}

export default Object.freeze({
  handleStripeInvoicePaid,
  insertPayment,
  getAllFromUser,
  cleanPaymentsForFrontend,
});
