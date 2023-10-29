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
