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
    instructorId: instructorIdFromRequest,
  } = req.body;

  try {
    validateEventData(req.body);
    // createEventFormSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'usuário não encontrado',
        action: 'tente fazer login novamente',
      });
    }

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        message: 'você não tem permissão para criar um evento',
        action: 'tente fazer login novamente',
      });
    }

    if (user.role === 'INSTRUCTOR' && instructorIdFromRequest) {
      return res.status(403).json({
        message:
          'você não tem permissão para criar um evento para outro instrutor',
        action: 'tente novamente',
      });
    }

    let instructorId = user.id;

    if (user.role === 'ADMIN' && instructorIdFromRequest) {
      const instructor = await prisma.user.findUnique({
        where: {
          id: instructorIdFromRequest,
        },
      });

      if (!instructor) {
        return res.status(404).json({
          message: 'instrutor não encontrado',
          action: 'tente novamente',
        });
      }

      instructorId = instructor.id;
    }

    const event = await prisma.event.create({
      data: {
        title,
        duration,
        isLive,
        liveUrl,
        recordedUrl,
        checkInsMaxQuantity: isLive ? maxCheckinsQuantity : null,
        startDate: isLive && startDate ? new Date(startDate) : null,
        instructorId,
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
