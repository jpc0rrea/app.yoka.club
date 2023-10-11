import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';

import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import controller from '@models/controller';
import { AuthenticatedRequest } from '@models/controller/types';
import user from '@models/user';
import { UpdateProfileFormData } from '@pages/profile';

export interface UpdateUserProfileRequest extends AuthenticatedRequest {
  body: UpdateProfileFormData;
}

const router = createRouter<UpdateUserProfileRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .put(updateProfileValidatorHandler, putHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function putHandler(req: UpdateUserProfileRequest, res: NextApiResponse) {
  const authenticatedUser = req.context.user;

  const updatedUser = await user.updateProfile({
    userId: authenticatedUser.id,
    ...req.body,
  });

  const cleanUpdatedUser = user.cleanUserToFrontend({
    user: updatedUser,
  });

  return res.status(200).json({ user: cleanUpdatedUser });
}

function updateProfileValidatorHandler(
  req: UpdateUserProfileRequest,
  res: NextApiResponse,
  next: () => void
) {
  const cleanBody = user.validateUpdateUserProfileRequest(req);

  req.body = cleanBody;

  return next();
}
