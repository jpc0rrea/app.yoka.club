import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { EventFromAPI } from 'pages/api/events/list';

interface GetEventsParams {
  isLive?: boolean;
}

export async function listEvents({ isLive }: GetEventsParams) {
  const eventsResponse = await api.get<{
    events: EventFromAPI[];
  }>(`/events/list${isLive !== undefined ? `?isLive=${isLive}` : ''}`);

  return eventsResponse.data.events;
}

export function useEvents({ isLive }: GetEventsParams) {
  return useQuery({
    queryKey: [
      'events',
      {
        isLive,
      },
    ],
    queryFn: () => listEvents({ isLive }),
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
