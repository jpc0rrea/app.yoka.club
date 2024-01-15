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
    } = req.query;

    const { search, page, pageSize, maxDuration, intensity } =
      events.convertQueryParamsInListRecordedEventsParams({
        searchInString,
        pageInString,
        pageSizeInString,
        durationInString,
        intensityInString,
      });

    const query: Prisma.EventFindManyArgs<DefaultArgs> = {
      take: pageSize,
      skip: page ? (page - 1) * pageSize : undefined,
      where: {
        isLive: false,
        recordedUrl: {
          not: null,
        },
        title: {
          contains: search,
          mode: 'insensitive',
        },
        duration: {
          lte: maxDuration,
        },
        intensity: {
          in: intensity,
        },
      },
      select: eventSelect,
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
