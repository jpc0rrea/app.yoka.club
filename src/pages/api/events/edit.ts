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
    intensity,
  } = req.body;

  try {
    validateEventData(req.body);

    const eventObject = await prisma.event.findUnique({
      where: {
        id: req.query.id,
      },
    });

    if (!eventObject) {
      return res.status(404).json({
        message: 'evento não encontrado',
        action: 'tente criar um novo evento',
      });
    }

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

    if (user.role !== 'ADMIN' && eventObject.instructorId !== user.id) {
      return res.status(403).json({
        message: 'você não tem permissão para editar este evento',
      });
    }

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
        intensity,
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
