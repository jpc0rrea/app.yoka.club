import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

import { env } from '@env/server.mjs';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { stripe } from '@lib/stripe';
import { UnauthorizedError } from '@errors/index';

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

  console.log({
    event,
    type,
  });

  return res.status(200).json({ received: true });
}
