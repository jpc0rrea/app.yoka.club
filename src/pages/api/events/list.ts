import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { ListEventsQueryParams } from '@models/events/types';
import { AuthenticatedRequest } from '@models/controller/types';
import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import events from '@models/events';

interface ListEventsRequest extends AuthenticatedRequest {
  query: ListEventsQueryParams;
}

const router = createRouter<ListEventsRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.ensureAuthenticatedAndInjectUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(getEventsHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getEventsHandler(req: ListEventsRequest, res: NextApiResponse) {
  const listEventsParams = await events.convertQueryParamsInListEventsParams(
    req.query
  );

  const eventsArray = await events.listEvents(listEventsParams);

  return res.status(200).json({
    events: eventsArray,
  });
}
