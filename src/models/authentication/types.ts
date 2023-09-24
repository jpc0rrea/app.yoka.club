/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

export interface ComparePasswordsParams {
  providedPassword: string;
  passwordHash: string;
}

export interface InjectAuthenticatedUserParams {
  request: NextApiRequest & { [key: string]: any };
}

export interface CreateSessionAndSetCookiesParams {
  userId: string;
  response: NextApiResponse;
}
