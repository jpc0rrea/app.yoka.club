import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { EventFromAPI, ListEventsParams } from '@models/events/types';
import convertParamsInQueryParams from '@lib/utilities/convertParamsInQueryParams';

export async function listEvents(listEventParams: ListEventsParams) {
  const queryString = convertParamsInQueryParams(listEventParams);

  const eventsResponse = await api.get<{
    events: EventFromAPI[];
  }>(`/events/list${queryString}`);

  return eventsResponse.data.events;
}

interface UseEventsParams extends ListEventsParams {
  enabled: boolean;
}

export function useEvents({ enabled, ...listEventParams }: UseEventsParams) {
  return useQuery({
    queryKey: [
      'events',
      {
        listEventParams,
        enabled,
      },
    ],
    queryFn: () => listEvents(listEventParams),
    enabled,
  });
}

interface GetEventByIdParams {
  eventId: string;
}

export async function getEventById({
  eventId,
}: GetEventByIdParams): Promise<EventFromAPI> {
  const eventResponse = await api.get<{
    event: EventFromAPI;
  }>(`/events/get?id=${eventId}`);

  return eventResponse.data.event;
}

export function useEventById({ eventId }: GetEventByIdParams) {
  return useQuery({
    queryKey: ['events', 'byId', eventId],
    queryFn: () => getEventById({ eventId }),
  });
}

export async function getNextEvents(): Promise<EventFromAPI[]> {
  const eventsResponse = await api.get<{
    nextEvents: EventFromAPI[];
  }>('/events/next');

  return eventsResponse.data.nextEvents;
}

export function useNextEvents() {
  return useQuery({
    queryKey: ['events', 'next'],
    queryFn: () => getNextEvents(),
  });
}
