import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { UserPlan } from '@hooks/useUserPlan';

const getPlan = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  const { userId } = req;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: 'Usuário não encontrado', errorCode: 'user-not-found' });
  }

  const userPlan: UserPlan = {
    id: 'FREE',
    type: 'free',
    name: 'yogi iniciante',
    price: 0,
    checkinsQuantity: 0,
    extra: 'acesso aos conteúdos gratuitos',
  };

  if (!user.stripeId || !user.subscriptionId) {
    return res.status(200).json({ userPlan, user });
  }

  return res.status(200).json({ user, userPlan });
};

export default ensureAuthenticated(getPlan);
