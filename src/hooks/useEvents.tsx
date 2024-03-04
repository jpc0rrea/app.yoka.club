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

interface GetRecordedEventsParams {
  search?: string;
  duration?: string[];
  intensity?: string[];
  premium?: string[];
  page?: number;
  pageSize?: number;
}

export async function getRecordedEvents({
  search,
  duration,
  intensity,
  premium,
  page,
  pageSize,
}: GetRecordedEventsParams): Promise<{
  events: EventFromAPI[];
  eventsCount: number;
  totalPages: number;
}> {
  const queryString = convertParamsInQueryParams({
    search,
    duration,
    intensity,
    premium,
    page,
    pageSize,
  });

  const eventsResponse = await api.get<{
    events: EventFromAPI[];
    eventsCount: number;
    totalPages: number;
  }>(`/events/recorded${queryString}`);

  return eventsResponse.data;
}

export function useRecordedEvents({
  search,
  duration,
  intensity,
  premium,
  page,
  pageSize,
}: GetRecordedEventsParams) {
  return useQuery({
    queryKey: [
      'recordedEvents',
      {
        search,
        duration,
        intensity,
        premium,
        page,
        pageSize,
      },
    ],
    queryFn: () =>
      getRecordedEvents({
        search,
        duration,
        intensity,
        premium,
        page,
        pageSize,
      }),
  });
}

export async function getHappeningNowEvents(): Promise<EventFromAPI[]> {
  const eventsResponse = await api.get<{
    events: EventFromAPI[];
  }>('/events/happening-now');

  return eventsResponse.data.events;
}

export function useHappeningNowEvents() {
  return useQuery({
    queryKey: ['events', 'happeningNow'],
    queryFn: () => getHappeningNowEvents(),
  });
}

interface GetEventsToManageParams {
  search?: string;
  duration?: string[];
  intensity?: string[];
  premium?: string[];
  isLive?: string[];
  page?: number;
  pageSize?: number;
}

export async function getEventsToManage({
  search,
  duration,
  intensity,
  premium,
  isLive,
  page,
  pageSize,
}: GetEventsToManageParams): Promise<{
  events: EventFromAPI[];
  eventsCount: number;
  totalPages: number;
}> {
  const queryString = convertParamsInQueryParams({
    search,
    duration,
    intensity,
    premium,
    isLive,
    page,
    pageSize,
  });

  const eventsResponse = await api.get<{
    events: EventFromAPI[];
    eventsCount: number;
    totalPages: number;
  }>(`/events/to-manage${queryString}`);

  return eventsResponse.data;
}

interface UseEventsToManageParams extends GetEventsToManageParams {
  enabled: boolean;
}

export function useEventsToManage({
  search,
  duration,
  intensity,
  premium,
  isLive,
  page,
  pageSize,
  enabled,
}: UseEventsToManageParams) {
  return useQuery({
    queryKey: [
      'events',
      'toManage',
      {
        search,
        duration,
        intensity,
        premium,
        isLive,
        page,
        pageSize,
        enabled,
      },
    ],
    queryFn: () =>
      getEventsToManage({
        search,
        duration,
        intensity,
        premium,
        isLive,
        page,
        pageSize,
      }),
    enabled,
  });
}
