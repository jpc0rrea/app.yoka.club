import { Prisma, User } from '@prisma/client';

export const eventSelect = {
  id: true,
  title: true,
  duration: true,
  isLive: true,
  checkInsMaxQuantity: true,
  startDate: true,
  createdAt: true,
  liveUrl: true,
  recordedUrl: true,
  intensity: true,
  isPremium: true,
  instructor: {
    select: {
      displayName: true,
      imageUrl: true,
      id: true,
    },
  },
  checkIns: {
    select: {
      createdAt: true,
      userId: true,
      id: true,
      attended: true,
      user: {
        select: {
          displayName: true,
          imageUrl: true,
          username: true,
        },
      },
    },
  },
};

export const eventFromAPI = Prisma.validator<Prisma.EventDefaultArgs>()({
  select: eventSelect,
});

export type EventFromAPI = Prisma.EventGetPayload<typeof eventFromAPI>;

export interface ListEventsParams {
  isLive?: boolean;
  page?: number;
  pageSize?: number;
  instructorId?: string;
}

export interface ListEventsQueryParams
  extends Partial<{ [key: string]: string | string[] }> {
  isLive?: string;
  page?: string;
  pageSize?: string;
  instructorId?: string;
}

export interface ListRecordedEventsQueryParams
  extends Partial<{ [key: string]: string | string[] }> {
  searchInString?: string;
  pageInString?: string;
  pageSizeInString?: string;
  durationInString?: string;
  intensityInString?: string;
  premiumInString?: string;
  favoritesInString?: string;
  liveInString?: string;
  hasCheckedInString?: string;
}

export interface ListManageEventsQueryParams
  extends ListRecordedEventsQueryParams {
  isLiveInString?: string;
}

export interface HasEventStartedParams {
  event: EventFromAPI;
}

export interface HasUserAlreadyCheckedInParams {
  event: EventFromAPI;
  userId: string;
}

export interface StillHasVacancyParams {
  event: EventFromAPI;
}

export interface CanEnterTheEventParams {
  event: EventFromAPI;
  userId: string;
}

export interface UserCanCheckInInEventParams {
  event: EventFromAPI;
  userId: string;
  userCheckInsQuantity: number;
  expirationDate: Date | null | undefined;
}

export interface UserCanCancelCheckInParams {
  event: EventFromAPI;
  userId: string;
}

export interface UserCanViewRecordedEventParams {
  event: EventFromAPI;
  userId: string;
  isUserSubscribed: boolean;
}

export interface FindEventByIdParams {
  eventId: string;
}

export interface CanUserManageEvent {
  event: EventFromAPI;
  user: User;
}

export interface UpdateEventAttendace {
  eventId: string;
  attendance: {
    id: string;
    attended: boolean;
  }[];
  userId: string;
}

export const intensityOptions = [
  { label: 'leve', value: 'leve' },
  { label: 'moderado', value: 'moderado' },
  { label: 'intenso', value: 'intenso' },
];

export const intensityPossibleValues = intensityOptions.map(
  (option) => option.value
);

export interface AddEventToUserFavoritesParams {
  eventId: string;
  userId: string;
}

export interface RemoveEventFromUserFavoritesParams {
  eventId: string;
  userId: string;
}
