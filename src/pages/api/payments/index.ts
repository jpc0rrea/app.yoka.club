import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { AuthenticatedRequest } from '@models/controller/types';
import payment from '@models/payment';

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(getHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;

  const payments = await payment.getAllFromUser({
    userId: authenticatedUser.id,
  });

  const cleanPayments = payment.cleanPaymentsForFrontend({
    payments,
  });

  return res.status(200).json({ payments: cleanPayments });
}
