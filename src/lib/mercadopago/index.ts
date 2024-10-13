import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

import { calculatePricePerCheckin } from '@lib/constants';
import user from '@models/user';
import { prisma } from '@server/db';
import { ValidationError } from '@errors/index';
import eventLogs from '@models/event-logs';
import { BillingPeriod, PlanCode, PLANS } from '@lib/stripe/plans';

interface CreateCheckInCheckoutParams {
  checkInsQuantity: number;
  userId: string;
}

async function createCheckInCheckout({
  checkInsQuantity,
  userId,
}: CreateCheckInCheckoutParams) {
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

  const pricePerCheckIn = calculatePricePerCheckin(checkInsQuantity);

  const preferenceBody = {
    items: [
      {
        id: 'SEPARATE-CHECK-IN-',
        title: 'Pacote de check-ins',
        unit_price: pricePerCheckIn,
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

interface CreateSubscriptionCheckoutParams {
  billingPeriod: BillingPeriod;
  planCode: PlanCode;
  userId: string;
}

async function createSubscriptionCheckout({
  billingPeriod,
  planCode,
  userId,
}: CreateSubscriptionCheckoutParams) {
  const userObject = await user.findOneById({ userId, prismaInstance: prisma });

  if (!billingPeriod || !planCode) {
    throw new ValidationError({
      message: 'billingPeriod and planCode are required',
      action: 'envie billingPeriod e planCode',
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:MERCADOPAGO:CREATE_SUBSCRIPTION_CHECKOUT:BILLING_PERIOD_AND_PLAN_CODE_REQUIRED',
    });
  }

  const back_urls = {
    success: process.env.MERCADOPAGO_BACK_URL,
    failure: process.env.MERCADOPAGO_BACK_URL,
    pending: process.env.MERCADOPAGO_BACK_URL,
  };

  const chosenPlan = PLANS.find(
    (plan) => plan.billingPeriod === billingPeriod && plan.code === planCode
  );

  if (!chosenPlan) {
    throw new ValidationError({
      message: 'invalid billingPeriod or planCode',
    });
  }

  const unitPrice = chosenPlan.fullPricePerBillingPeriod;

  const preferenceBody = {
    items: [
      {
        id: 'SEPARATE-CHECK-IN-',
        title: 'Pacote de check-ins',
        unit_price: unitPrice,
        quantity: 1,
      },
    ],
    notification_url: process.env.MERCADOPAGO_WEBHOOKS_URL,
    metadata: {
      userId: userObject.id,
      billingPeriod,
      planCode,
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
          id: 'atm', // débito
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
          id: 'paypalec', // paypal
        },
      ],
    },
    back_urls,
    auto_return: 'approved',
  };

  console.log(preferenceBody);
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
  createCheckInCheckout,
  createSubscriptionCheckout,
  getPayment,
});
