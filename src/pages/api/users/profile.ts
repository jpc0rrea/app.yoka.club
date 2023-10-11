import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { AuthenticatedRequest } from '@models/controller/types';
import user from '@models/user';
import { ValidationError } from '@errors/index';

interface GetUserProfileRequest extends AuthenticatedRequest {
  query: {
    username: string;
  };
}

const router = createRouter<GetUserProfileRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(validateGetUserProfileRequest, getHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(req: GetUserProfileRequest, res: NextApiResponse) {
  const userProfileObject = await user.getUserProfileByUsername({
    username: req.query.username,
  });

  return res.status(200).json({ user: userProfileObject });
}

function validateGetUserProfileRequest(
  req: GetUserProfileRequest,
  res: NextApiResponse,
  next: () => void
) {
  const { username } = req.query;

  if (!username) {
    throw new ValidationError({
      message: `o campo "username" é obrigatório`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_GET_USER_PROFILE_REQUEST:USERNAME_IS_REQUIRED',
      key: 'email',
    });
  }

  req.query.username = username.trim();

  return next();
}
