import { NextApiResponse } from 'next';

import { CreateEventFormData } from '@components/Modals/CreateEventModal';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import validateEventData from '@lib/utilities/validateEventData';

interface EditEventRequest extends EnsureAuthenticatedRequest {
  body: CreateEventFormData;
  query: {
    id: string;
  };
}

const editEvent = async (req: EditEventRequest, res: NextApiResponse) => {
  const {
    title,
    isLive,
    liveUrl,
    recordedUrl,
    startDate,
    maxCheckinsQuantity,
    duration,
  } = req.body;

  try {
    validateEventData(req.body);

    const event = await prisma.event.update({
      where: {
        id: req.query.id,
      },
      data: {
        title,
        duration,
        liveUrl,
        recordedUrl,
        checkInsMaxQuantity: isLive ? maxCheckinsQuantity : undefined,
        startDate: isLive && startDate ? new Date(startDate) : undefined,
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(editEvent, ['ADMIN', 'INSTRUCTOR']);
