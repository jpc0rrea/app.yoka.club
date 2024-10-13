import cookie from 'cookie';
import crypto from 'crypto';
import { NextApiResponse } from 'next';

import { prisma } from '@server/db';
import cacheControl from '@models/cache-control';
import {
  CreateSessionParams,
  ExpireByIdParams,
  FindOneValidByIdParams,
  FindOneValidByTokenParams,
  GetSessionParams,
  RenewParams,
  SetSessionIdCookieInResponseParams,
} from './types';
import { UnauthorizedError, ValidationError } from '@errors/index';
import { CreateSessionRequest } from '@pages/api/sessions';
import { subDays } from 'date-fns';

export const SESSION_EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function create({ userId }: CreateSessionParams) {
  const sessionToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * SESSION_EXPIRATION_IN_SECONDS);

  const sessionObject = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
    },
  });

  return sessionObject;
}

function setSessionIdCookieInResponse({
  sessionToken,
  response,
}: SetSessionIdCookieInResponseParams) {
  cacheControl.noCache(undefined, response);
  response.setHeader('Set-Cookie', [
    cookie.serialize('session_id', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_EXPIRATION_IN_SECONDS,
      domain: process.env.COOKIE_DOMAIN,
    }),
  ]);
}

async function expireById({ sessionId }: ExpireByIdParams) {
  const expiredSession = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      expiresAt: subDays(new Date(), 1),
    },
  });

  return expiredSession;
}

// TODO: mark session as invalid also in Database.
function clearSessionIdCookie(response: NextApiResponse) {
  cacheControl.noCache(undefined, response);
  response.setHeader('Set-Cookie', [
    cookie.serialize('session_id', 'invalid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: -1,
      domain: process.env.COOKIE_DOMAIN,
    }),
  ]);
}

async function findOneValidByToken({
  sessionToken,
}: FindOneValidByTokenParams) {
  const sessionObject = await prisma.session.findFirst({
    where: {
      AND: [
        {
          sessionToken,
        },
        {
          expiresAt: {
            gt: new Date(),
          },
        },
      ],
    },
  });

  return sessionObject;
}

async function findOneById({ sessionId }: FindOneValidByIdParams) {
  const sessionObject = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  return sessionObject;
}

async function findOneValidFromRequest({ req }: GetSessionParams) {
  console.log('findOneValidFromRequest');
  console.log({
    cookies: req.cookies,
  });
  const sessionToken = req.cookies?.session_id;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: `usuário não possui sessão ativa.`,
      action: `verifique se este usuário está logado.`,
    });
  }

  const sessionObject = await findOneValidByToken({ sessionToken });

  if (!sessionObject) {
    throw new UnauthorizedError({
      message: `usuário não possui sessão ativa.`,
      action: `verifique se este usuário está logado.`,
    });
  }

  return sessionObject;
}

function validateCreateSessionRequest(req: CreateSessionRequest) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError({
      message: `Os campos "email" e "password" são obrigatórios.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:MISSING_FIELDS',
      key: 'email',
    });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError({
      message: `O campo "email" não é um email válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_EMAIL',
      key: 'email',
    });
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new ValidationError({
      message: `O campo "password" deve ter no mínimo 6 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_PASSWORD',
      key: 'password',
    });
  }

  return {
    email: email.toLowerCase().trim(),
    password: password.trim(),
  };
}

async function renew({ sessionId, response }: RenewParams) {
  const sessionObjectRenewed = await renewObjectInDatabase(sessionId);

  setSessionIdCookieInResponse({
    sessionToken: sessionObjectRenewed.sessionToken,
    response,
  });

  return sessionObjectRenewed;
}

async function renewObjectInDatabase(sessionId: string) {
  const expiresAt = new Date(Date.now() + 1000 * SESSION_EXPIRATION_IN_SECONDS);

  const updatedSessionObject = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      expiresAt,
    },
  });

  return updatedSessionObject;
}

export default Object.freeze({
  create,
  setSessionIdCookieInResponse,
  expireById,
  findOneById,
  findOneValidByToken,
  findOneValidFromRequest,
  clearSessionIdCookie,
  validateCreateSessionRequest,
  renew,
});
