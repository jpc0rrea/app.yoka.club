import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import user from '@models/user';

export interface RegisterWithoutPasswordRequest extends NextApiRequest {
  body: {
    email: string;
    name: string;
    phoneNumber: string;
  };
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(registerWithoutPasswordValidationHandler, register);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

function registerWithoutPasswordValidationHandler(
  req: RegisterWithoutPasswordRequest,
  res: NextApiResponse,
  next: () => void
) {
  const cleanBody = user.validateRegisterUserWithoutPasswordRequest(req);

  req.body = cleanBody;

  return next();
}

async function register(
  req: RegisterWithoutPasswordRequest,
  res: NextApiResponse
) {
  const newUser = await user.createWithoutPassword(req.body);

  await authentication.createSessionAndSetCookies({
    userId: newUser.id,
    response: res,
  });

  return res.status(201).json({
    code: 'user-created',
  });
}

// export default register;
