import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import mercadopago from '@lib/mercadopago';

interface CheckMercadoPagoPaymentRequest extends NextApiRequest {
  query: {
    payment_id: string;
  };
}

const router = createRouter<CheckMercadoPagoPaymentRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.ensureAuthenticatedAndInjectUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(getHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(
  req: CheckMercadoPagoPaymentRequest,
  res: NextApiResponse
) {
  const paymentObject = await mercadopago.getPayment({
    paymentId: req.query.payment_id,
  });

  return res.status(201).json({
    status: paymentObject.status,
  });
}

// export default register;
