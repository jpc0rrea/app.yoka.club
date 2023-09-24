import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
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
        },
      },
    },
  },
};

export const eventFromAPI = Prisma.validator<Prisma.EventDefaultArgs>()({
  select: eventSelect,
});

export type EventFromAPI = Prisma.EventGetPayload<typeof eventFromAPI>;

interface ListEventsRequest extends EnsureAuthenticatedRequest {
  query: {
    isLive: string;
  };
}

const listEvents = async (req: ListEventsRequest, res: NextApiResponse) => {
  try {
    const { isLive: isLiveInString } = req.query;

    const isLive =
      isLiveInString === 'true'
        ? true
        : isLiveInString === 'false'
        ? false
        : undefined;

    const events = await prisma.event.findMany({
      where: {
        isLive,
      },
      select: eventSelect,
    });

    return res.status(200).json({
      events,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listEvents);
