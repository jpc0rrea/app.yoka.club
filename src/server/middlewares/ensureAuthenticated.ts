/* eslint-disable @typescript-eslint/no-explicit-any */
import session from '@models/session';
import user from '@models/user';
import { prisma } from '@server/db';
import { UserRole } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export interface EnsureAuthenticatedRequest extends NextApiRequest {
  userId: string;
}

export default function ensureAuthenticated(handler: any) {
  return async (req: EnsureAuthenticatedRequest, res: NextApiResponse) => {
    try {
      const sessionObject = await session.findOneValidFromRequest({
        req,
      });

      req.userId = sessionObject.userId;

      return handler(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export function ensureAuthenticatedWithRole(handler: any, roles: UserRole[]) {
  return async (req: EnsureAuthenticatedRequest, res: NextApiResponse) => {
    try {
      const sessionObject = await session.findOneValidFromRequest({
        req,
      });

      if (!sessionObject) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.userId = sessionObject.userId;

      const userObject = await user.findOneById({
        userId: sessionObject.userId,
        prismaInstance: prisma,
      });

      if (!roles.includes(userObject.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return handler(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
