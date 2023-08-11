import { NextApiResponse } from 'next';

import {
  CreateEventFormData,
  // createEventFormSchema,
} from '@components/Modals/CreateEventModal';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import validateEventData from '@lib/utilities/validateEventData';

interface CreateEventRequest extends EnsureAuthenticatedRequest {
  body: CreateEventFormData;
}

const createEvent = async (req: CreateEventRequest, res: NextApiResponse) => {
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
    // createEventFormSchema.parse(req.body);

    const event = await prisma.event.create({
      data: {
        title,
        duration,
        isLive,
        liveUrl,
        recordedUrl,
        checkInsMaxQuantity: isLive ? maxCheckinsQuantity : null,
        startDate: isLive && startDate ? new Date(startDate) : null,
        instructorId: req.userId,
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

export default ensureAuthenticatedWithRole(createEvent, [
  'ADMIN',
  'INSTRUCTOR',
]);
