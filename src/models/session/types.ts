import { NextApiRequest, NextApiResponse } from 'next';

export interface SetSessionIdCookieInResponseParams {
  sessionToken: string;
  response: NextApiResponse;
}

export interface ExpireByIdParams {
  sessionId: string;
}

export interface FindOneValidByTokenParams {
  sessionToken: string;
}

export interface FindOneValidByIdParams {
  sessionId: string;
}

export interface CreateSessionParams {
  userId: string;
}

export interface GetSessionParams {
  req: NextApiRequest;
}

export interface RenewParams {
  sessionId: string;
  response: NextApiResponse;
}
