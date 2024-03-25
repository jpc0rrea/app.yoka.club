import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import user from '@models/user';
import { setCookie } from 'nookies';
import { SESSION_EXPIRATION_IN_SECONDS } from '@models/session';

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
  .post(registerWithoutPasswordValidationHandler, registerWithoutPassword);

// enable cors
router.all((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  return res.status(200).end();
});

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

async function registerWithoutPassword(
  req: RegisterWithoutPasswordRequest,
  res: NextApiResponse
) {
  const newUser = await user.createWithoutPassword(req.body);

  const session = await authentication.createSessionAndSetCookies({
    userId: newUser.id,
    response: res,
  });

  setCookie({ res }, 'session_id', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_EXPIRATION_IN_SECONDS,
    domain: process.env.COOKIE_DOMAIN,
  });

  return res.status(201).json({
    code: 'user-created',
    sessionToken: session.sessionToken,
  });
}

// export default register;
