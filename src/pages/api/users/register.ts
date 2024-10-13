import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';

import { prisma } from '@server/db';
import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import user from '@models/user';
import activation from '@models/activation';
import { BillingPeriod, PlanCode } from '@lib/stripe/plans';
import subscription from '@models/subscription';
import { SESSION_EXPIRATION_IN_SECONDS } from '@models/session';
import webserver from '@infra/webserver';

export interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  };
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .post(registerValidationHandler, register);

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

  if (req.body.planCode === 'free') {
    await activation.createAndSendActivationEmail({
      user: newUser,
    });

    return res.status(201).json({
      code: 'user-created',
      userId: newUser.id,
    });
  }

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

  const sessionId = await subscription.createSubscriptionCheckoutSession({
    userId: newUser.id,
    planCode: req.body.planCode,
    billingPeriod: req.body.billingPeriod,
    sessionToken: session.sessionToken,
    prismaInstance: prisma,
  });

  return res.status(201).json({
    code: 'user-created',
    sessionToken: session.sessionToken,
    userId: newUser.id,
    sessionId,
    returnUrl: `${webserver.host}/register/without-password`,
  });
}

// export default register;
