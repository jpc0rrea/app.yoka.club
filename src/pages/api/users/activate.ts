import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import activation from '@models/activation';

export interface ActivateUserRequest extends NextApiRequest {
  body: {
    token: string;
  };
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .patch(activateUserHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function activateUserHandler(
  req: ActivateUserRequest,
  res: NextApiResponse
) {
  await activation.activateUserUsingTokenId({
    tokenId: req.body.token,
  });

  return res.status(200).json({
    code: 'user-activated',
  });
}
