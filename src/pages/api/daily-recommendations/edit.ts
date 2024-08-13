import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface EditDailyRecommendationRequest extends EnsureAuthenticatedRequest {
  body: {
    eventId: string;
    dailyRecommendationId: string;
  };
}

const editDailyRecommendation = async (
  req: EditDailyRecommendationRequest,
  res: NextApiResponse
) => {
  const { eventId, dailyRecommendationId } = req.body;

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

    const dailyRecommendation = await prisma.dailyRecommendation.findUnique({
      where: {
        id: dailyRecommendationId,
      },
    });

    if (!dailyRecommendation) {
      return res.status(404).json({
        message: 'recomendação de prática não encontrada',
        action: 'tente fazer login novamente',
      });
    }

    const updatedDailyRecommendation = await prisma.dailyRecommendation.update({
      where: {
        id: dailyRecommendationId,
      },
      data: {
        eventId,
      },
    });

    return res.status(201).json(updatedDailyRecommendation);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(editDailyRecommendation, [
  'ADMIN',
  'INSTRUCTOR',
]);
