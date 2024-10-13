import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { AuthenticatedRequest } from '@models/controller/types';
import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import { ListDailyRecommendationsQueryParams } from '@models/daily-recommendations/types';
import dailyRecommendations from '@models/daily-recommendations';

interface ListDailyRecommendationsRequest extends AuthenticatedRequest {
  query: ListDailyRecommendationsQueryParams;
}

const router = createRouter<ListDailyRecommendationsRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.ensureAuthenticatedAndInjectUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(getNext7DailyRecommendationsHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getNext7DailyRecommendationsHandler(
  req: ListDailyRecommendationsRequest,
  res: NextApiResponse
) {
  const dailyRecommendationsArray = await dailyRecommendations.getNext7();

  return res.status(200).json({
    dailyRecommendations: dailyRecommendationsArray,
  });
}
