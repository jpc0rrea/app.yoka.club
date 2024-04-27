import user from '@models/user';
import { prisma } from '@server/db';
import { GiveTrialCheckinParams, UpdateCheckinAttendance } from './types';
import { ValidationError } from '@errors/index';
import statement from '@models/statement';
import eventLogs from '@models/event-logs';

async function giveTrialCheckin({ userId }: GiveTrialCheckinParams) {
  const userObject = await user.findOneById({ userId, prismaInstance: prisma });

  if (userObject.checkInsQuantity > 0) {
    throw new ValidationError({
      message: `você já ganhou seu check-in de teste.`,
      action: `se você gostou do nosso serviço, considere assinar um plano.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:CHECKIN:GIVE_TRIAL_CHECKIN:ALREADY_USED',
      key: 'checkInQuantity',
    });
  }

  if (userObject.trialCheckInsQuantity > 0) {
    throw new ValidationError({
      message: `você já ganhou seu check-in de teste.`,
      action: `se você gostou do nosso serviço, considere assinar um plano.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:CHECKIN:GIVE_TRIAL_CHECKIN:ALREADY_USED',
      key: 'checkInQuantity',
    });
  }

  const creditsObject = await statement.findAllCreditsByUserId({ userId });

  if (creditsObject.length > 0) {
    throw new ValidationError({
      message: `você já ganhou seu check-in de teste.`,
      action: `se você gostou do nosso serviço, considere assinar um plano.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:CHECKIN:GIVE_TRIAL_CHECKIN:ALREADY_USED',
      key: 'checkInQuantity',
    });
  }

  if (!userObject.isUserActivated) {
    throw new ValidationError({
      message: `você precisa ativar sua conta antes de ganhar um check-in de teste.`,
      action: `verifique seu email para ativar sua conta.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:CHECKIN:GIVE_TRIAL_CHECKIN:USER_NOT_ACTIVATED',
      key: 'checkInQuantity',
    });
  }

  await statement.addCredits({
    userId,
    amount: 1,
    title: 'check-in de boas vindas',
    description: 'check-in inicial para experimentar a plataforma :)',
    checkInType: 'TRIAL',
    prismaInstance: prisma,
  });
}

async function updateCheckInAttendance({
  checkinId,
  attended,
}: UpdateCheckinAttendance) {
  const checkIn = await prisma.checkIn.update({
    where: {
      id: checkinId,
    },
    data: {
      attended,
    },
  });

  await eventLogs.createEventLog({
    userId: checkIn.userId,
    eventType: 'CHECK_IN.ATTENDANCE_UPDATED',
    metadata: {
      checkInId: checkIn.id,
      attended: checkIn.attended,
    },
    prismaInstance: prisma,
  });

  return checkIn;
}

export default Object.freeze({
  giveTrialCheckin,
  updateCheckInAttendance,
});
