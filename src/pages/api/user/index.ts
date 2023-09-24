import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import session from 'models/session';
import { AuthenticatedRequest } from '@models/controller/types';
import user from '@models/user';

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(renewSessionIfNecessary, getHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;

  const cleanUser = user.cleanUserToFrontend({
    user: authenticatedUser,
  });

  return res.status(200).json({ user: cleanUser });
}

async function renewSessionIfNecessary(
  request: AuthenticatedRequest,
  response: NextApiResponse,
  next: () => void
) {
  let sessionObject = request.context.session;

  // Renew session if it expires in less than 3 weeks.
  if (
    sessionObject.expiresAt.getTime() - Date.now() <
    1000 * 60 * 60 * 24 * 7 * 3
  ) {
    sessionObject = await session.renew({
      sessionId: sessionObject.id,
      response,
    });

    request.context.session = sessionObject;
  }
  return next();
}
