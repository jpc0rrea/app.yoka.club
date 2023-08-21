import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';

const getUsers = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  const users = await prisma.user.findMany({});

  return res.status(200).json({ users });
};

export default ensureAuthenticatedWithRole(getUsers, ['ADMIN']);
