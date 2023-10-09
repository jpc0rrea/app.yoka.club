import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { AuthenticatedRequest } from '@models/controller/types';
import subscription from '@models/subscription';

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .delete(deleteHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function deleteHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;

  await subscription.cancelSubscription({
    userId: authenticatedUser.id,
  });

  return res.status(200).json({ success: true });
}
