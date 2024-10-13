import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { isAfter, subMinutes } from 'date-fns';
import { MINUTES_TO_CHECK_IN } from '@lib/constants';
import sendMessageToYogaComKakaTelegramGroup from '@lib/telegram';

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

    if (!user.isUserActivated) {
      return res.status(400).json({
        message: 'você precisa ativar sua conta antes de fazer check-in',
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

    // checar a data de expiração do usuário
    if (user.expirationDate && isAfter(new Date(), user.expirationDate)) {
      return res.status(400).json({
        message: 'erro ao realizar check-in',
        description: 'seu plano expirou',
        errorCode: 'plan-expired',
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

    if (isAfter(new Date(), subMinutes(event.startDate, MINUTES_TO_CHECK_IN))) {
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

    const checkInType =
      user.trialCheckInsQuantity > 0
        ? 'TRIAL'
        : user.freeCheckInsQuantity > 0
        ? 'FREE'
        : 'PAID';

    const checkInTypeToDecrement =
      user.trialCheckInsQuantity > 0
        ? 'trialCheckInsQuantity'
        : user.freeCheckInsQuantity > 0
        ? 'freeCheckInsQuantity'
        : 'paidCheckInsQuantity';

    const createCheckIn = prisma.checkIn.create({
      data: {
        eventId: event.id,
        userId: user.id,
        type: checkInType,
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
        [checkInTypeToDecrement]: {
          decrement: 1,
        },
      },
    });

    const [checkIn] = await prisma.$transaction([createCheckIn, updateUser]);

    const statement = await prisma.statement.create({
      data: {
        userId: user.id,
        checkInId: checkIn.id,
        title: `aula agendada no evento ${event.title}`,
        type: 'DEBIT',
        description: 'aula agendada com sucesso',
        checkInsQuantity: 1,
        checkInType:
          checkInTypeToDecrement === 'trialCheckInsQuantity'
            ? 'TRIAL'
            : checkInTypeToDecrement === 'freeCheckInsQuantity'
            ? 'FREE'
            : 'PAID',
      },
    });

    if (checkInTypeToDecrement === 'trialCheckInsQuantity') {
      await sendMessageToYogaComKakaTelegramGroup(
        `
🎉🎉🎉 O usuário ${user.name} realizou um check-in experimental no evento ${event.title}!
        
entre em contato com ela :)
telefone: ${user.phoneNumber}
`
      );
    }

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
