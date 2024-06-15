import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { AuthenticatedRequest } from '@models/controller/types';
import events from '@models/events';

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAuthenticatedUserOnRequest)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(postHandler)
  .delete(deleteHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function postHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;
  const eventId = req.query.eventId as string;

  if (!eventId) {
    return res.status(400).json({
      error: 'eventId is required',
    });
  }

  await events.addEventToUserFavorites({
    eventId,
    userId: authenticatedUser.id,
  });

  return res.status(200).json({ message: 'success' });
}

async function deleteHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;
  const eventId = req.query.eventId as string;

  if (!eventId) {
    return res.status(400).json({
      error: 'eventId is required',
    });
  }

  await events.removeEventFromUserFavorites({
    eventId,
    userId: authenticatedUser.id,
  });

  return res.status(200).json({ message: 'success' });
}
