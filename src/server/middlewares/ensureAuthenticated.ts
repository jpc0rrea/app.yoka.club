/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export interface EnsureAuthenticatedRequest extends NextApiRequest {
  userId: string;
}

export default function ensureAuthenticated(handler: any) {
  return async (req: EnsureAuthenticatedRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.userId = session.user.id;

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
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.userId = session.user.id;

      if (!roles.includes(session.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return handler(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
