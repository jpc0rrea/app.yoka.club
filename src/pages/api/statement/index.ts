import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';

const getStatement = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  const { userId } = req;

  const statement = await prisma.statement.findMany({
    where: {
      userId,
    },
  });

  return res.status(200).json({ statement });
};

export default ensureAuthenticated(getStatement);
