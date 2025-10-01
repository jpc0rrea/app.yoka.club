import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';

interface ActivityEntry {
  date: string; // YYYY-MM-DD format
  activities: {
    type: 'recorded' | 'live';
    eventId: string;
    eventTitle: string;
    instructorName: string;
    duration: number;
    progress?: number; // Only for recorded classes
    attended?: boolean; // Only for live classes
    eventThumbnail?: string | null; // Video thumbnail URL
  }[];
}

interface UserInfo {
  id: string;
  name: string;
  displayName: string;
  imageUrl: string | null;
}

interface UserActivityResponse {
  user: UserInfo;
  activities: ActivityEntry[];
  month: number;
  year: number;
  totalActiveDays: number;
}

interface UseUserActivityParams {
  userId: string;
  month?: number;
  year?: number;
  enabled?: boolean;
}

export function useUserActivity({
  userId,
  month,
  year,
  enabled = true,
}: UseUserActivityParams) {
  return useQuery({
    queryKey: ['yokarats', 'user-activity', userId, month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const { data } = await api.get<UserActivityResponse>(
        `/yokarats/user-activity?${params.toString()}`
      );
      return data;
    },
    enabled: enabled && !!userId,
  });
}

export type { ActivityEntry, UserActivityResponse, UserInfo };
