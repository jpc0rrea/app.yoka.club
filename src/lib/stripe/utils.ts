import { NotFoundError, ServiceError } from '@errors/index';
import Stripe from 'stripe';
import { stripe } from '.';
import user from '@models/user';

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
    !!invoice.lines.data[0].price.id
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

export default Object.freeze({
  getInvoicePrice,
  getInvoiceSubscription,
  getInvoiceUser,
  getInvoiceBalanceTransaction,
});
