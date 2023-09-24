/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnauthorizedError } from 'errors';
import password from '@models/password';
import session from '@models/session';
import {
  ComparePasswordsParams,
  CreateSessionAndSetCookiesParams,
  InjectAuthenticatedUserParams,
} from './types';
import { NextApiRequest, NextApiResponse } from 'next';
import user from '@models/user';

async function hashPassword(unhashedPassword: string) {
  return await password.hash(unhashedPassword);
}

async function comparePasswords({
  providedPassword,
  passwordHash,
}: ComparePasswordsParams) {
  const passwordMatches = await password.compare({
    providedPassword,
    storedPassword: passwordHash,
  });

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: `A senha informada não confere com a senha do usuário.`,
      action: `Verifique se a senha informada está correta e tente novamente.`,
      errorLocationCode:
        'MODEL:AUTHENTICATION:COMPARE_PASSWORDS:PASSWORD_MISMATCH',
    });
  }
}

async function injectAnonymousOrUser(
  request: NextApiRequest,
  response: NextApiResponse,
  next: () => void
) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser({ request });
    return next();
  } else {
    injectAnonymousUser(request);
    return next();
  }

  async function injectAuthenticatedUser({
    request,
  }: InjectAuthenticatedUserParams) {
    const sessionObject = await session.findOneValidFromRequest({
      req: request,
    });
    const userObject = await user.findOneById({
      userId: sessionObject.userId,
    });

    request.context = {
      ...request.context,
      user: userObject,
      session: sessionObject,
    };
  }

  function injectAnonymousUser(
    request: NextApiRequest & { [key: string]: any }
  ) {
    request.context = {
      ...request.context,
      user: undefined,
    };
  }
}

// //TODO: this should be here or inside the session model?
// function parseSetCookies(response) {
//   const setCookieHeaderValues = response.headers.raw()['set-cookie'];
//   const parsedCookies = setCookieParser.parse(setCookieHeaderValues, {
//     map: true,
//   });
//   return parsedCookies;
// }

async function createSessionAndSetCookies({
  userId,
  response,
}: CreateSessionAndSetCookiesParams) {
  const sessionObject = await session.create({
    userId,
  });

  session.setSessionIdCookieInResponse({
    sessionToken: sessionObject.sessionToken,
    response,
  });

  return sessionObject;
}

export default Object.freeze({
  hashPassword,
  comparePasswords,
  injectAnonymousOrUser,
  // parseSetCookies,
  createSessionAndSetCookies,
});
