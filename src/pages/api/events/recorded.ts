import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { eventSelect } from '@models/events/types';
import events from '@models/events';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

interface ListRecordedEventsRequest extends EnsureAuthenticatedRequest {
  query: {
    search: string;
    page: string;
    pageSize: string;
    duration: string;
    intensity: string;
    premium: string;
    favorites: string;
    live: string;
    hasCheckedIn: string;
  };
}

const listRecordedEvents = async (
  req: ListRecordedEventsRequest,
  res: NextApiResponse
) => {
  try {
    const {
      search: searchInString,
      page: pageInString,
      pageSize: pageSizeInString,
      duration: durationInString,
      intensity: intensityInString,
      premium: premiumInString,
      favorites: favoritesInString,
      live: liveInString,
      hasCheckedIn: hasCheckedInString,
    } = req.query;
    const { userId } = req;

    const {
      search,
      page,
      pageSize,
      durationArray,
      intensity,
      isPremium,
      onlyFavorites,
      onlyLive,
      onlyEventsWithCheckIn,
    } = events.convertQueryParamsInListRecordedEventsParams({
      searchInString,
      pageInString,
      pageSizeInString,
      durationInString,
      intensityInString,
      premiumInString,
      favoritesInString,
      liveInString,
      hasCheckedInString,
    });

    const query: Prisma.EventFindManyArgs<DefaultArgs> = {
      take: pageSize,
      skip: page ? (page - 1) * pageSize : undefined,
      where: {
        isLive: onlyFavorites ? undefined : onlyLive ? true : false,
        recordedUrl: {
          not: null,
        },
        isPremium,
        title: {
          contains: search,
          mode: 'insensitive',
        },
        duration: {
          in: durationArray,
        },
        intensity: {
          in: intensity,
        },
        favorites: onlyFavorites
          ? {
              some: {
                userId,
              },
            }
          : {},
        checkIns: onlyEventsWithCheckIn
          ? {
              some: {
                userId,
              },
            }
          : {},
      },
      select: eventSelect,
      orderBy: {
        createdAt: 'desc',
      },
    };

    // next events are the next 10 events
    const eventsPromise = prisma.event.findMany(query);
    const eventsCountPromise = prisma.event.count({
      where: query.where,
    });

    const [eventsFromDb, eventsCount] = await prisma.$transaction([
      eventsPromise,
      eventsCountPromise,
    ]);

    const totalPages = Math.ceil(eventsCount / pageSize);

    return res.status(201).json({
      events: eventsFromDb,
      eventsCount,
      totalPages,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listRecordedEvents);
