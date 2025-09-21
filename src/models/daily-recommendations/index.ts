import { startOfDay } from 'date-fns';
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

async function getNext7() {
  const dailyRecommendations = await prisma.dailyRecommendation.findMany({
    where: {
      date: {
        gte: startOfDay(new Date()),
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: 7,
    include: {
      event: true,
    },
  });

  return dailyRecommendations;
}

export default Object.freeze({
  convertQueryParamsInListDailyRecommendationsParams,
  listDailyRecommendations,
  getNext7,
});
