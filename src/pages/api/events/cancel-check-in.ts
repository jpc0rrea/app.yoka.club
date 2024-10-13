import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { isAfter, subMinutes } from 'date-fns';
import { MINUTES_TO_CANCEL_CHECK_IN } from '@lib/constants';

interface CancelCheckInEventRequest extends EnsureAuthenticatedRequest {
  query: {
    eventId: string;
  };
}

const cancelCheckInRoute = async (
  req: CancelCheckInEventRequest,
  res: NextApiResponse
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'usuário não foi encontrado',
        errorCode: 'user-not-found',
      });
    }

    if (!user.isUserActivated) {
      return res.status(400).json({
        message: 'você precisa ativar sua conta antes de fazer check-in',
        errorCode: 'email-not-verified',
      });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: req.query.eventId,
      },
      include: {
        checkIns: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: 'evento não foi encontrado',
        errorCode: 'event-not-found',
      });
    }

    if (!event.checkInsMaxQuantity || !event.isLive || !event.startDate) {
      return res.status(400).json({
        message: 'esse evento não permite check-ins',
        errorCode: 'event-does-not-allow-check-ins',
      });
    }

    if (
      isAfter(
        new Date(),
        subMinutes(event.startDate, MINUTES_TO_CANCEL_CHECK_IN)
      )
    ) {
      return res.status(400).json({
        message: 'não é mais possível cancelar agendamento nesse evento',
        errorCode: 'event-already-started',
      });
    }

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        eventId: event.id,
        userId: user.id,
      },
    });

    if (!checkIn) {
      return res.status(404).json({
        message: 'check-in não encontrado',
        errorCode: 'check-in-not-found',
      });
    }

    const deleteCheckIn = prisma.checkIn.delete({
      where: {
        id: checkIn.id,
      },
    });

    const checkInTypeToIncrement =
      checkIn.type === 'PAID'
        ? 'paidCheckInsQuantity'
        : checkIn.type === 'FREE'
        ? 'freeCheckInsQuantity'
        : 'trialCheckInsQuantity';

    const updateUser = prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        checkInsQuantity: {
          increment: 1,
        },
        [checkInTypeToIncrement]: {
          increment: 1,
        },
      },
    });

    const cancelCheckInStatement = prisma.statement.create({
      data: {
        userId: user.id,
        title: `check-in cancelado evento ${event.title}`,
        type: 'CREDIT',
        description: 'check-in cancelado com sucesso',
        checkInsQuantity: 1,
        checkInType: checkIn.type,
      },
    });

    await prisma.$transaction([
      deleteCheckIn,
      updateUser,
      cancelCheckInStatement,
    ]);

    return res.status(201).json({
      checkInsRemaining: user.checkInsQuantity + 1,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(cancelCheckInRoute, [
  'ADMIN',
  'INSTRUCTOR',
  'USER',
]);
