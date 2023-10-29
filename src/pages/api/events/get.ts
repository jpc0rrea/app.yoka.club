import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { eventSelect } from '@models/events/types';

interface ListEventsRequest extends EnsureAuthenticatedRequest {
  query: {
    id: string;
  };
}

const listEvents = async (req: ListEventsRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      select: eventSelect,
    });

    return res.status(201).json({
      event,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listEvents);
