import {
  ListDailyRecommendationsParams,
  ListDailyRecommendationsQueryParams,
} from './types';
import { prisma } from '@server/db';

function convertQueryParamsInListDailyRecommendationsParams({
  startDate,
  endDate,
}: ListDailyRecommendationsQueryParams) {
  return {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };
}

async function listDailyRecommendations({
  startDate,
  endDate,
}: ListDailyRecommendationsParams) {
  const dailyRecommendations = await prisma.dailyRecommendation.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      event: true,
    },
  });

  return dailyRecommendations;
}

export default Object.freeze({
  convertQueryParamsInListDailyRecommendationsParams,
  listDailyRecommendations,
});
