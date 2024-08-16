import { api } from '@lib/api';
import { useQuery } from '@tanstack/react-query';
import { DateRangePickerValue } from '@tremor/react';
import { endOfDay, startOfDay } from 'date-fns';

interface GetBusinessInformationsParams {
  dates: DateRangePickerValue;
}

export type WatchedEvents = {
  eventId: string;
  playedSeconds: number;
  watchedCount: number;
  title: string;
  usersThatWatched: {
    userId: string;
    displayName: string;
  }[];
};

export type NewUsers = {
  userId: string;
  displayName: string;
  // Dias que o usuário entrou no App
  daysUsingApp: Date[];
  // Total de aulas assistidas
  watchedEventsCount: number;
};

interface BusinessInformations {
  newUsersPerDay: {
    date: string;
    usuários: number;
  }[];
  newUsersCount: number;
  watchedEventsTableData: WatchedEvents[];
  newUsersTableData: NewUsers[];
}

export async function getBusinessInformations({
  dates,
}: GetBusinessInformationsParams) {
  const { from, to } = dates;

  if (!from || !to) {
    return null;
  }

  const fromInString = startOfDay(from).toISOString();
  const toInString = endOfDay(to).toISOString();

  const response = await api.get<BusinessInformations>(
    `/admin/business?from=${fromInString}&to=${toInString}`
  );

  return response.data;
}

export default function useBusinessInformations({
  dates,
}: GetBusinessInformationsParams) {
  return useQuery(
    ['businessInformations', dates],
    () => {
      return getBusinessInformations({ dates });
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!dates.from && !!dates.to,
    }
  );
}
