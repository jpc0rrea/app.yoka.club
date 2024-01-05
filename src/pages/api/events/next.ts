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

const listNextEvents = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    // next events are the next 10 events
    const nextEvents = await prisma.event.findMany({
      take: 10,
      where: {
        isLive: true,
        startDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      select: eventSelect,
    });

    return res.status(201).json({
      nextEvents,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listNextEvents);
