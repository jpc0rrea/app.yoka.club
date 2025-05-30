import { Event, User } from '@prisma/client';

export const trailSelect = {
  id: true,
  title: true,
  description: true,
  coverImageUrl: true,
  createdAt: true,
  updatedAt: true,
  trailEvents: {
    select: {
      id: true,
      order: true,
      event: {
        select: {
          id: true,
          title: true,
          duration: true,
          isLive: true,
          startDate: true,
          recordedUrl: true,
          liveUrl: true,
          intensity: true,
          isPremium: true,
          instructor: {
            select: {
              displayName: true,
              imageUrl: true,
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      order: 'asc' as const,
    },
  },
} as const;

export interface TrailEventFromAPI {
  id: string;
  order: number;
  event: {
    id: string;
    title: string;
    duration: number;
    isLive: boolean;
    startDate: Date | null;
    recordedUrl: string | null;
    liveUrl: string | null;
    intensity: string | null;
    isPremium: boolean;
    instructor: {
      displayName: string;
      imageUrl: string | null;
      id: string;
    };
  };
}

export interface TrailFromAPI {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  trailEvents: TrailEventFromAPI[];
}

export interface ListTrailsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ListTrailsQueryParams
  extends Partial<{ [key: string]: string | string[] }> {
  page?: string;
  pageSize?: string;
  search?: string;
}

export interface CreateTrailParams {
  title: string;
  description?: string;
  coverImageUrl: string;
  eventIds: string[];
}

export interface UpdateTrailParams {
  trailId: string;
  title: string;
  description?: string;
  coverImageUrl: string;
  eventIds: string[];
}

export interface DeleteTrailParams {
  trailId: string;
}

export interface FindTrailByIdParams {
  trailId: string;
}
