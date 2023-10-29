import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

const listEvents = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          {
            role: 'INSTRUCTOR',
          },
          {
            role: 'ADMIN',
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
      },
    });

    return res.status(201).json(instructors);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listEvents);
