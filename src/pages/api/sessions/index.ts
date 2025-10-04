import { createRouter } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import session from '@models/session';
import user from '@models/user';
import { ForbiddenError, UnauthorizedError } from '@errors/index';
import { AuthenticatedRequest } from '@models/controller/types';
import activation from '@models/activation';

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

export interface CreateSessionRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

export interface PatchSessionRequest extends NextApiRequest {
  body: {
    sessionToken: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
}

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAnonymousOrUser)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .delete(deleteSessionHandler)
  .post(createSessionValidationHandler, createSessionHandler)
  .patch(updateSessionInRequest);

export default router.handler({
  // attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function deleteSessionHandler(
  request: AuthenticatedRequest,
  response: NextApiResponse
) {
  const sessionObject = request.context.session;

  await session.expireById({
    sessionId: sessionObject.id,
  });

  session.clearSessionIdCookie(response);

  return response.status(200).json({
    code: 'session-deleted',
  });
}

async function createSessionValidationHandler(
  req: CreateSessionRequest,
  res: NextApiResponse,
  next: () => void
) {
  const cleanBody = session.validateCreateSessionRequest(req);

  req.body = cleanBody;

  return next();
}

async function createSessionHandler(
  req: CreateSessionRequest,
  res: NextApiResponse
) {
  let storedUser;

  try {
    storedUser = await user.findOneByEmail({
      email: req.body.email,
    });
    await authentication.comparePasswords({
      providedPassword: req.body.password,
      passwordHash: storedUser.password,
    });
  } catch (err) {
    throw new UnauthorizedError({
      message: `dados não conferem.`,
      action: `verifique se as credenciais enviadas estão corretas.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  // checar se o usuário já está com a conta ativa
  if (!storedUser.isUserActivated) {
    await activation.createAndSendActivationEmail({
      user: storedUser,
    });

    throw new ForbiddenError({
      message: `o seu usuário ainda não está ativado.`,
      action: `verifique seu email, acabamos de enviar um novo convite de ativação :)`,
      errorLocationCode: 'CONTROLLER:SESSIONS:POST_HANDLER:USER_NOT_ACTIVATED',
    });
  }

  const sessionObject = await authentication.createSessionAndSetCookies({
    userId: storedUser.id,
    response: res,
  });

  const cleanUser = user.cleanUserToFrontend({ user: storedUser });

  return res.status(201).json({
    code: 'session-created',
    user: cleanUser,
    session: sessionObject,
  });
}

async function updateSessionInRequest(
  req: PatchSessionRequest,
  res: NextApiResponse
) {
  const sessionObjectInContext = req.context?.session;

  if (sessionObjectInContext) {
    await session.expireById({
      sessionId: sessionObjectInContext.id,
    });

    session.clearSessionIdCookie(res);
  }

  const sessionToken = req.body.sessionToken;
  const sessionObject = await session.findOneValidByToken({ sessionToken });

  if (!sessionObject) {
    throw new UnauthorizedError({
      message: `sessão inválida.`,
      action: `verifique se o token de sessão enviado está correto.`,
      errorLocationCode: `CONTROLLER:SESSIONS:PATCH_HANDLER:INVALID_SESSION`,
    });
  }

  session.setSessionIdCookieInResponse({
    response: res,
    sessionToken: sessionObject.sessionToken,
  });

  return res.status(200).json({
    code: 'session-updated',
    session: sessionObject,
  });
}
