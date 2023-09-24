import { AppError } from '@errors/types';
import { Session, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export interface RequestContext {
  requestId: string;
  clientIp: string;
}

export interface AuthenticatedRequestContext extends RequestContext {
  user: User;
  session: Session;
}

export interface RequestWithContext extends NextApiRequest {
  context: RequestContext;
}

export interface AuthenticatedRequest extends NextApiRequest {
  context: AuthenticatedRequestContext;
}

export interface injectRequestMetadataParams {
  request: RequestWithContext;
  response: NextApiResponse;
  next: () => void;
}

export interface OnErrorHandlerParams {
  error: AppError;
  request: RequestWithContext;
  response: NextApiResponse;
}
