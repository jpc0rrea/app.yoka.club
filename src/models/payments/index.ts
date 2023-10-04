import { NotFoundError, ValidationError } from '@errors/index';
import { HandleStripeInvoicePaidParams, InsertPaymentParams } from './types';
import { prisma } from '@server/db';
import stripeUtils from '@lib/stripe/utils';

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

  if (!grossValue || !netValue || !fee || !currency) {
    throw new ValidationError({
      message: `a fatura não possui valores.`,
      action: `verifique se a fatura possui valores e tente novamente.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:PAYMENTS:HANDLE_STRIPE_INVOICE_PAID:MISSING_VALUES',
    });
  }

  // criar o pagamento
  const payment = 

  // adicionar o check in

  // atualizar o usuário 
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
}: InsertPaymentParams) {
  const payment = await prisma.payment.create({
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
  })

  return payment;
}
