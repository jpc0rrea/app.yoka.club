import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

import { CHECK_IN_PRICE } from '@lib/constants';
import user from '@models/user';
import { prisma } from '@server/db';
import { ValidationError } from '@errors/index';
import eventLogs from '@models/event-logs';

interface CreateCheckoutParams {
  checkInsQuantity: number;
  userId: string;
}

async function createCheckout({
  checkInsQuantity,
  userId,
}: CreateCheckoutParams) {
  const userObject = await user.findOneById({ userId, prismaInstance: prisma });

  if (!checkInsQuantity) {
    throw new ValidationError({
      message: 'checkInsQuantity is required',
      action: 'envie pelo menos 1 check-in',
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:MERCADOPAGO:CREATE_CHECKOUT:CHECK_INS_QUANTITY_REQUIRED',
    });
  }

  const back_urls = {
    success: process.env.MERCADOPAGO_BACK_URL,
    failure: process.env.MERCADOPAGO_BACK_URL,
    pending: process.env.MERCADOPAGO_BACK_URL,
  };

  const preferenceBody = {
    items: [
      {
        id: 'SEPARATE-CHECK-IN-',
        title: 'Pacote de check-ins',
        unit_price: CHECK_IN_PRICE,
        quantity: checkInsQuantity,
      },
    ],
    notification_url: process.env.MERCADOPAGO_WEBHOOKS_URL,
    metadata: {
      userId: userObject.id,
      checkInsQuantity,
    },
    payment_methods: {
      excluded_payment_methods: [
        {
          id: 'bolbradesco', // boleto
        },
        {
          id: 'pec', // pagamentos em lotéricas
        },
        {
          id: 'debelo', // débito
        },
        {
          id: 'atm', // débito
        },
        {
          id: 'credit_card', // cartão de crédito
        },
        {
          id: 'paypalec', // paypal
        },
      ],
      excluded_payment_types: [
        {
          id: 'ticket', // boleto
        },
        {
          id: 'atm', // débito
        },
        {
          id: 'credit_card', // cartão de crédito
        },
        {
          id: 'paypalec', // paypal
        },
      ],
    },
    back_urls,
    auto_return: 'approved',
  };

  const uniqueId = `${userId}-${checkInsQuantity}-${Date.now()}`;

  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000, idempotencyKey: uniqueId },
  });

  const preference = new Preference(client);

  const preferenceObject = await preference.create({
    body: preferenceBody,
  });

  await eventLogs.createEventLog({
    eventType: 'USER.CREATE_MERCADOPAGO_CHECKOUT',
    userId: userObject.id,
    prismaInstance: prisma,
    metadata: {
      preferenceId: preferenceObject.id,
      checkInsQuantity,
      idempotencyKey: uniqueId,
    },
  });

  return preferenceObject.init_point;
}

interface GetPaymentParams {
  paymentId: string;
}

async function getPayment({ paymentId }: GetPaymentParams) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000 },
  });

  const payment = new Payment(client);

  const paymentoObject = await payment.get({
    id: paymentId,
  });

  return paymentoObject;
}

export default Object.freeze({
  createCheckout,
  getPayment,
});
