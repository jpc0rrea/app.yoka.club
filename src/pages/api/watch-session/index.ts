import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { LIMIT_TIME_TO_WATCH_SESSION_IN_HOURS } from '@lib/constants';

interface GetWatchSessionIdRequest extends EnsureAuthenticatedRequest {
  query: {
    eventId: string;
  };
}

const listNextEvents = async (
  req: GetWatchSessionIdRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req;
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        message: 'Event id is required',
      });
    }

    // the watchSession has to be created within LIMIT_TIME_TO_WATCH_SESSION_IN_HOURS hours
    const watchSession = await prisma.watchSession.findFirst({
      where: {
        userId,
        eventId,
        createdAt: {
          gte: new Date(
            new Date().getTime() -
              LIMIT_TIME_TO_WATCH_SESSION_IN_HOURS * 60 * 60 * 1000
          ),
        },
      },
    });

    if (watchSession) {
      return res.status(200).json({
        watchSession,
      });
    }

    const newWatchSession = await prisma.watchSession.create({
      data: {
        userId,
        eventId,
      },
    });

    return res.status(201).json({
      watchSession: newWatchSession,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listNextEvents);
