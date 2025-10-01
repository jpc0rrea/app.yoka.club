import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';

interface RankingEntry {
  userId: string;
  userName: string;
  userDisplayName: string;
  userImageUrl: string | null;
  activeDays: number;
}

interface YokaratsRankingResponse {
  ranking: RankingEntry[];
  month: number;
  year: number;
}

interface UseYokaratsRankingParams {
  month?: number;
  year?: number;
}

export function useYokaratsRanking({
  month,
  year,
}: UseYokaratsRankingParams = {}) {
  return useQuery({
    queryKey: ['yokarats', 'ranking', month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const { data } = await api.get<YokaratsRankingResponse>(
        `/yokarats/ranking?${params.toString()}`
      );
      return data;
    },
  });
}

export type { RankingEntry, YokaratsRankingResponse };
