import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import session from '@models/session';
import { UnauthorizedError } from '@errors/index';

const router = createRouter<CheckSessionRequest, NextApiResponse>();

export interface CheckSessionRequest extends NextApiRequest {
  query: {
    sessionToken: string;
  };
}

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .get(checkSessionHandler);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function checkSessionHandler(
  req: CheckSessionRequest,
  res: NextApiResponse
) {
  const sessionToken = req.query.sessionToken;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: `sessão inválida.`,
      action: `verifique se o token de sessão enviado está correto.`,
      errorLocationCode: `CONTROLLER:SESSIONS:PATCH_HANDLER:INVALID_SESSION`,
    });
  }

  const sessionObject = await session.findOneValidByToken({ sessionToken });

  if (!sessionObject) {
    throw new UnauthorizedError({
      message: `sessão inválida.`,
      action: `verifique se o token de sessão enviado está correto.`,
      errorLocationCode: `CONTROLLER:SESSIONS:PATCH_HANDLER:INVALID_SESSION`,
    });
  }

  return res.status(200).json({
    code: 'session-checked',
  });
}
