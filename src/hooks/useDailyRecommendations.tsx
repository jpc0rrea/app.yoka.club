import { api } from '@lib/api';
import convertParamsInQueryParams from '@lib/utilities/convertParamsInQueryParams';
import { DailyRecommendation, Event } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

interface GetDailyRecommendationsParams {
  startDate: Date;
  endDate: Date;
}

interface DailyRecommendationWithEvent extends DailyRecommendation {
  event: Event;
}

export async function getDailyRecommendations({
  startDate,
  endDate,
}: GetDailyRecommendationsParams) {
  const queryString = convertParamsInQueryParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const recommendationsResponse = await api.get<{
    dailyRecommendations: DailyRecommendationWithEvent[];
  }>(`/daily-recommendations/list${queryString}`);

  return recommendationsResponse.data.dailyRecommendations;
}

export function useDailyRecommendations({
  startDate,
  endDate,
}: GetDailyRecommendationsParams) {
  return useQuery({
    queryKey: [
      'daily-recommendations',
      {
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      getDailyRecommendations({
        startDate,
        endDate,
      }),
  });
}
