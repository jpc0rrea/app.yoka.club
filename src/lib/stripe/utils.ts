import { NotFoundError, ServiceError } from '@errors/index';
import { prisma } from '@server/db';
import Stripe from 'stripe';
import { stripe } from '.';
import user from '@models/user';
import { convertNumberToReal } from '@lib/utils';
import { OLD_PLANS, PLANS } from './plans';

interface GetInvoiceInfoParams {
  invoice: Stripe.Invoice;
}

async function getInvoicePrice({ invoice }: GetInvoiceInfoParams) {
  if (!invoice.lines.data.length) {
    throw new NotFoundError({
      message: `a fatura não possui itens.`,
      action: `verifique se a fatura possui itens e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_INVOICE_LINES',
    });
  }

  if (
    !invoice.lines.data[0] ||
    !invoice.lines.data[0].price ||
    !invoice.lines.data[0].price.id
  ) {
    throw new NotFoundError({
      message: `o item da fatura não possui preço.`,
      action: `verifique se o item da fatura possui preço e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_INVOICE_LINES_PRICE',
    });
  }

  const priceId = invoice.lines.data[0].price.id;

  const price = await stripe.prices.retrieve(priceId);

  if (!price) {
    throw new NotFoundError({
      message: `o preço do item da fatura não foi encontrado.`,
      action: `verifique se o preço do item da fatura existe e tente novamente.`,
      errorLocationCode: 'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_PRICE',
    });
  }

  return price;
}

async function getInvoiceSubscription({ invoice }: GetInvoiceInfoParams) {
  if (!invoice.lines.data.length) {
    throw new NotFoundError({
      message: `a fatura não possui itens.`,
      action: `verifique se a fatura possui itens e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_INVOICE_LINES',
    });
  }

  if (!invoice.lines.data[0] || !invoice.lines.data[0].subscription) {
    throw new NotFoundError({
      message: `a fatura não possui uma assinatura.`,
      action: `verifique se a fatura possui uma assinatura e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_INVOICE_LINES_SUBSCRIPTION',
    });
  }

  const subscriptionId = invoice.lines.data[0].subscription;

  let subscription: Stripe.Subscription;

  if (typeof subscriptionId === 'string') {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } else {
    subscription = subscriptionId;
  }

  if (!subscription) {
    throw new NotFoundError({
      message: `a assinatura da fatura não foi encontrada.`,
      action: `verifique se a assinatura da fatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_SUBSCRIPTION',
    });
  }

  return subscription;
}

async function getInvoiceUser({ invoice }: GetInvoiceInfoParams) {
  if (!invoice.customer) {
    throw new NotFoundError({
      message: `a fatura não possui um cliente.`,
      action: `verifique se a fatura possui um cliente e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_INVOICE_CUSTOMER',
    });
  }

  const stripeCustomer = await stripe.customers.retrieve(
    invoice.customer.toString()
  );

  if (!stripeCustomer) {
    throw new NotFoundError({
      message: `o cliente da fatura não foi encontrado.`,
      action: `verifique se o cliente da fatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_CUSTOMER',
    });
  }

  if (stripeCustomer.deleted) {
    throw new NotFoundError({
      message: `o cliente da fatura foi deletado.`,
      action: `verifique se o cliente da fatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_CUSTOMER',
    });
  }

  const userId = stripeCustomer.metadata?.userId;

  if (!userId) {
    throw new NotFoundError({
      message: `o cliente da fatura não possui um usuário associado.`,
      action: `verifique se o cliente da fatura possui um usuário associado e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_CUSTOMER_METADATA_USER_ID',
    });
  }

  const userObject = await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  if (userObject.stripeId !== stripeCustomer.id) {
    throw new ServiceError({
      message: `o id do cliente da fatura não confere com o id do cliente do usuário.`,
      action: `verifique se o cliente da fatura pertence ao usuário e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:CUSTOMER_ID_MISMATCH',
    });
  }

  return userObject;
}

async function getInvoiceBalanceTransaction({ invoice }: GetInvoiceInfoParams) {
  const balanceTransactions = await stripe.balanceTransactions.list({
    expand: ['data.source'],
    type: 'charge',
    limit: 100,
  });

  if (!balanceTransactions.data.length) {
    throw new NotFoundError({
      message: `não foi possível encontrar a transação de cobrança da fatura.`,
      action: `verifique se a transação de cobrança da fatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_BALANCE_TRANSACTION',
    });
  }

  const balanceTransaction = balanceTransactions.data.find((balance) => {
    const source = balance.source as Stripe.Charge;

    return source.invoice === invoice.id;
  });

  if (!balanceTransaction) {
    throw new NotFoundError({
      message: `não foi possível encontrar a transação de cobrança da fatura.`,
      action: `verifique se a transação de cobrança da fatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_INVOICE_PRICE:MISSING_BALANCE_TRANSACTION',
    });
  }

  return balanceTransaction;
}

async function getPriceByPriceId(stripePriceId: string) {
  const price = await stripe.prices.retrieve(stripePriceId);

  if (!price) {
    throw new NotFoundError({
      message: `o preço não foi encontrado.`,
      action: `verifique se o preço existe e tente novamente.`,
      errorLocationCode: 'MODEL:STRIPE:UTILS:GET_PRICE:MISSING_PRICE',
    });
  }

  return price;
}

interface GetSubscriptionDetailsParams {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}

async function getSubscriptionDetails({
  stripeSubscriptionId,
  stripeCustomerId,
}: GetSubscriptionDetailsParams) {
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );

  if (!subscription) {
    throw new NotFoundError({
      message: `a assinatura não foi encontrada.`,
      action: `verifique se a assinatura existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SUBSCRIPTION_DETAILS:MISSING_SUBSCRIPTION',
    });
  }

  if (!subscription.current_period_end) {
    throw new NotFoundError({
      message: `a assinatura não possui um período de término.`,
      action: `verifique se a assinatura possui um período de término e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SUBSCRIPTION_DETAILS:MISSING_SUBSCRIPTION_CURRENT_PERIOD_END',
    });
  }

  if (
    !subscription.items.data ||
    !subscription.items.data.length ||
    !subscription.items.data[0]
  ) {
    throw new NotFoundError({
      message: `a assinatura não possui itens.`,
      action: `verifique se a assinatura possui itens e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SUBSCRIPTION_DETAILS:MISSING_SUBSCRIPTION_ITEMS',
    });
  }

  const price = await stripe.prices.retrieve(
    subscription.items.data[0].price.id
  );

  let plan = PLANS.find((plan) => plan.stripePriceId === price.id);

  if (!plan) {
    plan = OLD_PLANS.find((plan) => plan.stripePriceId === price.id);
  }

  if (!plan) {
    throw new NotFoundError({
      message: `o plano não foi encontrado.`,
      action: `verifique se o plano existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SUBSCRIPTION_DETAILS:MISSING_PLAN',
    });
  }

  const nextBillingTime = new Date(
    subscription.current_period_end * 1000
  ).toISOString();

  if (subscription.cancel_at_period_end || subscription.status === 'canceled') {
    return {
      plan,
      nextBillingTime,
      nextBillingValue: undefined,
      cancelAtPeriodEnd: true,
    };
  }

  let nextInvoice: Stripe.Response<Stripe.UpcomingInvoice>;

  try {
    nextInvoice = await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
    });
  } catch (error) {
    console.log(error);
    return {
      plan,
      nextBillingTime,
      nextBillingValue: undefined,
      cancelAtPeriodEnd: true,
    };
  }

  const nextBillingValue = convertNumberToReal(
    (nextInvoice.amount_due || nextInvoice.total) / 100
  );

  return {
    plan,
    nextBillingTime,
    nextBillingValue,
    cancelAtPeriodEnd: false,
  };
}

interface GetScheduledSubscriptionDetailsParams {
  stripeScheduledSubscriptionId: string;
  stripeCustomerId: string;
}

async function getScheduledSubscriptionDetails({
  stripeScheduledSubscriptionId,
  stripeCustomerId,
}: GetScheduledSubscriptionDetailsParams) {
  const scheduledSubscription = await stripe.subscriptionSchedules.retrieve(
    stripeScheduledSubscriptionId
  );

  if (!scheduledSubscription) {
    throw new NotFoundError({
      message: `a assinatura agendada não foi encontrada.`,
      action: `verifique se a assinatura agendada existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_SCHEDULED_SUBSCRIPTION',
    });
  }

  if (!scheduledSubscription.phases || !scheduledSubscription.phases.length) {
    throw new NotFoundError({
      message: `a assinatura agendada não possui fases.`,
      action: `verifique se a assinatura agendada possui fases e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_SCHEDULED_SUBSCRIPTION_PHASES',
    });
  }

  const currentPhase = scheduledSubscription.phases[0];

  if (!currentPhase) {
    throw new NotFoundError({
      message: `a fase atual da assinatura agendada não foi encontrada.`,
      action: `verifique se a fase atual da assinatura agendada existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_SCHEDULED_SUBSCRIPTION_PHASE',
    });
  }

  if (!currentPhase.end_date) {
    throw new NotFoundError({
      message: `a fase atual da assinatura agendada não possui uma data de término.`,
      action: `verifique se a fase atual da assinatura agendada possui uma data de término e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_SCHEDULED_SUBSCRIPTION_PHASE_END_DATE',
    });
  }

  if (
    !currentPhase.items ||
    !currentPhase.items.length ||
    !currentPhase.items[0] ||
    !currentPhase.items[0].price
  ) {
    throw new NotFoundError({
      message: `a fase atual da assinatura agendada não possui itens.`,
      action: `verifique se a fase atual da assinatura agendada possui itens e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_SCHEDULED_SUBSCRIPTION_PHASE_ITEMS',
    });
  }

  const price = await stripe.prices.retrieve(
    currentPhase.items[0].price.toString()
  );

  const plan = PLANS.find((plan) => plan.stripePriceId === price.id);

  if (!plan) {
    throw new NotFoundError({
      message: `o plano não foi encontrado.`,
      action: `verifique se o plano existe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:UTILS:GET_SCHEDULED_SUBSCRIPTION_DETAILS:MISSING_PLAN',
    });
  }

  const nextBillingTime = new Date(
    currentPhase.start_date * 1000
  ).toISOString();

  console.log('TODELETE 0');

  if (scheduledSubscription.end_behavior === 'cancel') {
    return {
      plan,
      nextBillingTime,
      nextBillingValue: undefined,
      cancelAtPeriodEnd: true,
    };
  }

  let nextInvoice: Stripe.Response<Stripe.UpcomingInvoice>;

  try {
    nextInvoice = await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
    });
  } catch (error) {
    console.log(error);
    return {
      plan,
      nextBillingTime,
      nextBillingValue: undefined,
      cancelAtPeriodEnd: true,
    };
  }

  const nextBillingValue = convertNumberToReal(
    (nextInvoice.amount_due || nextInvoice.total) / 100
  );

  return {
    plan,
    nextBillingTime,
    nextBillingValue,
    cancelAtPeriodEnd: false,
  };
}

export default Object.freeze({
  getInvoicePrice,
  getInvoiceSubscription,
  getInvoiceUser,
  getInvoiceBalanceTransaction,
  getPriceByPriceId,
  getSubscriptionDetails,
  getScheduledSubscriptionDetails,
});
