import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import payment from '@models/payment';

interface MercadoPagoWebhookRequest extends NextApiRequest {
  body: {
    /* Tipo da ação */
    action: 'payment.created' | 'payment.updated';
    /* ID da notificação */
    id: string;
    /* Tipo da notificação */
    type: 'payment';
    data: {
      /* ID do pagamento ou merchant order */
      id: string;
    };
    /* Data de criação do recurso */
    date_created: string;
    /* Número de vezes que a notificação foi enviada */
    version: number;
  };
}

const router = createRouter<MercadoPagoWebhookRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(postMercadoPagoWebhookHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postMercadoPagoWebhookHandler(
  req: MercadoPagoWebhookRequest,
  res: NextApiResponse
) {
  const { action, data } = req.body;

  if (action === 'payment.created' || action === 'payment.updated') {
    const message = await payment.handleMercadoPagoPayment({
      paymentId: data.id,
    });

    return res.status(200).json({ received: true, message });
  } else {
    return res
      .status(200)
      .json({ received: true, message: 'action type not supported' });
  }
}
