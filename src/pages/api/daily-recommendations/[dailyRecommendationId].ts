import {
  ensureAuthenticatedWithRole,
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { NextApiResponse } from 'next';

interface DeleteDailyRecommendationRequest extends EnsureAuthenticatedRequest {
  query: {
    dailyRecommendationId: string;
  };
}

const deleteDailyRecommendation = async (
  req: DeleteDailyRecommendationRequest,
  res: NextApiResponse
) => {
  const { dailyRecommendationId } = req.query;

  try {
    await prisma.dailyRecommendation.delete({
      where: {
        id: dailyRecommendationId,
      },
    });

    res.status(200).json({
      message: 'recomendação removida com sucesso',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'ocorreu um erro ao remover a recomendação',
    });
  }
};

export default ensureAuthenticatedWithRole(deleteDailyRecommendation, [
  'ADMIN',
  'INSTRUCTOR',
]);
