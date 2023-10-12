import { ValidationError } from '@errors/index';
import {
  CleanPaymentsToFrontendParams,
  GetPaymentsFromUserParams,
  HandleMercadoPagoPaymentParams,
  HandleStripeInvoicePaidParams,
  InsertPaymentParams,
} from './types';
import { prisma } from '@server/db';
import stripeUtils from '@lib/stripe/utils';
import plan from '@models/plan';
import subscriptions from '@models/subscription';
import { roundNumber } from '@lib/utils';
import mercadopago from '@lib/mercadopago';
import user from '@models/user';
import statement from '@models/statement';
import eventLogs from '@models/event-logs';

async function handleStripeInvoicePaid({
  stripeInvoice,
}: HandleStripeInvoicePaidParams) {
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

async function handleMercadoPagoPayment({
  paymentId,
}: HandleMercadoPagoPaymentParams) {
  const paymentObject = await mercadopago.getPayment({ paymentId });

  const paymentStatus = paymentObject.status;

  if (!paymentStatus || paymentStatus !== 'approved') {
    return 'PAYMENT-NOT-APPROVED';
  }

  console.log(paymentObject);

  const userId = paymentObject.metadata.user_id;
  const checkInsQuantity = paymentObject.metadata.check_ins_quantity;

  if (!userId) {
    return 'USERID-NOT-FOUND';
  }

  if (!checkInsQuantity) {
    return 'CHECKINSQUANTITY-NOT-FOUND';
  }

  if (
    !paymentObject.transaction_amount ||
    !paymentObject.transaction_details ||
    !paymentObject.transaction_details.net_received_amount
  ) {
    return 'PAYMENT-INFORMATIONS-MISSING';
  }

  const userObject = await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  const grossValue = paymentObject.transaction_amount * 100;
  const netValue = paymentObject.transaction_details?.net_received_amount * 100;
  const fee = grossValue - netValue;

  const isMoreThanOneCheckin = checkInsQuantity > 1;

  await prisma.$transaction(async (tx) => {
    const payment = await insertPayment({
      userId: userObject.id,
      externalId: paymentId,
      platform: 'MERCADO_PAGO',
      method: 'PIX',
      grossValue,
      netValue,
      fee,
      currency: 'brl',
      prismaInstance: tx,
    });

    await statement.createCreditStatement({
      amount: checkInsQuantity,
      title: 'compra de check-ins avulso',
      description: `${checkInsQuantity} check-in${
        isMoreThanOneCheckin ? 's' : ''
      } adicionado${isMoreThanOneCheckin ? 's' : ''}`,
      paymentId: payment.id,
      userId: userObject.id,
      prismaInstance: tx,
    });

    await tx.user.update({
      where: {
        id: userObject.id,
      },
      data: {
        checkInsQuantity: {
          increment: checkInsQuantity,
        },
      },
    });

    await eventLogs.createEventLog({
      eventType: 'USER.PURCHASED_CHECK_INS',
      userId: userObject.id,
      metadata: {
        oldCheckInsQuantity: userObject.checkInsQuantity,
        newCheckInsQuantity: userObject.checkInsQuantity + checkInsQuantity,
      },
      prismaInstance: tx,
    });
  });

  return 'PAYMENT-APPROVED';
}

export default Object.freeze({
  handleStripeInvoicePaid,
  insertPayment,
  getAllFromUser,
  cleanPaymentsForFrontend,
  handleMercadoPagoPayment,
});
