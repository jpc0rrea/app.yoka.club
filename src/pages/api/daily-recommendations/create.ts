import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface CreateDailyRecommendationRequest extends EnsureAuthenticatedRequest {
  body: {
    date: string;
    eventId: string;
  };
}

const createDailyRecommendation = async (
  req: CreateDailyRecommendationRequest,
  res: NextApiResponse
) => {
  const { date, eventId } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'usuário não encontrado',
        action: 'tente fazer login novamente',
      });
    }

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        message: 'você não tem permissão para criar um evento',
        action: 'tente fazer login novamente',
      });
    }

    const dailyRecommendation = await prisma.dailyRecommendation.create({
      data: {
        date: new Date(date),
        eventId,
        metadata: {
          createdBy: user.id,
        },
      },
    });

    return res.status(201).json(dailyRecommendation);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(createDailyRecommendation, [
  'ADMIN',
  'INSTRUCTOR',
]);
