import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import { AuthenticatedRequest } from '@models/controller/types';
import mercadopago from '@lib/mercadopago';

export interface CreateMercadoPagoRequest extends AuthenticatedRequest {
  body: {
    checkInsQuantity: number;
  };
}

const router = createRouter<CreateMercadoPagoRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.ensureAuthenticatedAndInjectUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(postHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(
  req: CreateMercadoPagoRequest,
  res: NextApiResponse
) {
  const authenticatedUser = req.context.user;

  const checkoutUrl = await mercadopago.createCheckout({
    userId: authenticatedUser.id,
    checkInsQuantity: req.body.checkInsQuantity,
  });

  return res.status(201).json({
    checkoutUrl,
  });
}

// export default register;
