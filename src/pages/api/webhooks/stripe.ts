import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

import { env } from '@env/server.mjs';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import payment from '@models/payment';
import { stripe } from '@lib/stripe';
import { UnauthorizedError } from '@errors/index';
import Stripe from 'stripe';

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(postStripeWebhookHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postStripeWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('cheguei no webhook');
  const buf = await buffer(req);

  const secret = req.headers['stripe-signature'];

  if (!secret) {
    throw new UnauthorizedError({
      message: `o webhook não foi autenticado.`,
      action: `verifique se o webhook foi enviado pelo stripe e tente novamente.`,
      errorLocationCode:
        'MODEL:STRIPE:WEBHOOK:POST_STRIPE_WEBHOOK_HANDLER:MISSING_SECRET',
    });
  }

  const event = stripe.webhooks.constructEvent(
    buf,
    secret,
    env.STRIPE_WEBHOOK_SECRET
  );

  const { type } = event;

  if (type === 'invoice.paid') {
    await payment.handleStripeInvoicePaid({
      stripeInvoice: event.data.object as Stripe.Invoice,
    });
  } else {
    return res
      .status(200)
      .json({ received: true, message: 'event type not supported' });
  }

  return res.status(200).json({ received: true });
}
