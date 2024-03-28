import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import user from '@models/user';
import activation from '@models/activation';

export interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
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
  .post(registerValidationHandler, register);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

function registerValidationHandler(
  req: RegisterRequest,
  res: NextApiResponse,
  next: () => void
) {
  const cleanBody = user.validateRegisterUserRequest(req);

  req.body = cleanBody;

  return next();
}

async function register(req: RegisterRequest, res: NextApiResponse) {
  const newUser = await user.create(req.body);

  await activation.createAndSendActivationEmail({
    user: newUser,
  });

  return res.status(201).json({
    code: 'user-created',
    userId: newUser.id,
  });
}

// export default register;
