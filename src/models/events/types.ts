import { Prisma } from '@prisma/client';

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
}

export interface ListManageEventsQueryParams
  extends ListRecordedEventsQueryParams {
  isLiveInString?: string;
}

export const intensityOptions = [
  { label: 'leve', value: 'leve' },
  { label: 'moderado', value: 'moderado' },
  { label: 'intenso', value: 'intenso' },
];

export const intensityPossibleValues = intensityOptions.map(
  (option) => option.value
);
