import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import user from '@models/user';
import { NextResponse } from 'next/server';

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

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get('origin');
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      'Access-Control-Max-Age': '86400',
    },
  });

  return response;
}

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

  await authentication.createSessionAndSetCookies({
    userId: newUser.id,
    response: res,
  });

  return res.status(201).json({
    code: 'user-created',
  });
}

// export default register;
