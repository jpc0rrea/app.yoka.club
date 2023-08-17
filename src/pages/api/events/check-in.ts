import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { isAfter } from 'date-fns';

interface CheckInEventRequest extends EnsureAuthenticatedRequest {
  query: {
    eventId: string;
  };
}

const checkInRoute = async (req: CheckInEventRequest, res: NextApiResponse) => {
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

    if (!user.emailVerified) {
      return res.status(400).json({
        message: 'você precisa verificar seu email antes de fazer check-in',
        errorCode: 'email-not-verified',
      });
    }

    if (!user.checkInsQuantity || user.checkInsQuantity <= 0) {
      return res.status(400).json({
        message: 'erro ao realizar check-in',
        description: 'você não tem check-ins disponíveis',
        errorCode: 'no-check-ins-available',
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

    if (isAfter(new Date(), event.startDate)) {
      return res.status(400).json({
        message: 'não é mais possível fazer check-in nesse evento',
        errorCode: 'event-already-started',
      });
    }

    if (event.checkIns.length >= event.checkInsMaxQuantity) {
      return res.status(400).json({
        message: 'não há mais vagas para esse evento',
        errorCode: 'event-is-full',
      });
    }

    const createCheckIn = prisma.checkIn.create({
      data: {
        eventId: event.id,
        userId: user.id,
      },
    });

    const updateUser = prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        checkInsQuantity: {
          decrement: 1,
        },
      },
    });

    const [checkIn] = await prisma.$transaction([createCheckIn, updateUser]);

    const statement = await prisma.statement.create({
      data: {
        userId: user.id,
        checkInId: checkIn.id,
        title: `check-in realizado no evento ${event.title}`,
        type: 'CHECK_IN',
        description: 'check-in realizado com sucesso',
        checkInsQuantity: 1,
      },
    });

    return res.status(201).json({
      checkIn,
      statement,
      checkInsRemaining: user.checkInsQuantity - 1,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(checkInRoute, [
  'ADMIN',
  'INSTRUCTOR',
  'USER',
]);
