import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { eventSelect } from '@models/events/types';

// interface ListNextEventsRequest extends EnsureAuthenticatedRequest {
//   query: {
//     id: string;
//   };
// }

const listHappeningNowEvents = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    // next events are the next 10 events
    const happeningNowEvents = await prisma.event.findMany({
      take: 10,
      where: {
        isLive: true,
        recordedUrl: null,
        startDate: {
          lte: new Date(),
        },
        // the user has to already checked in on the event
        checkIns: {
          some: {
            userId: req.userId,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      select: eventSelect,
    });

    // filter the events that already passed the duration of the event
    const events = happeningNowEvents.filter((event) => {
      const eventEndDate = new Date(event.startDate || '');
      eventEndDate.setMinutes(eventEndDate.getMinutes() + event.duration);
      return eventEndDate > new Date();
    });

    return res.status(201).json({
      events,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listHappeningNowEvents);
