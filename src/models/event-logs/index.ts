import user from '@models/user';
import { prisma } from '@server/db';
import { CreateEventLogParams, LogDailyAppUsageParams } from './types';

async function createEventLog({
  eventType,
  userId,
  metadata,
  prismaInstance,
}: CreateEventLogParams) {
  const userObject = await user.findOneById({
    userId,
    prismaInstance,
  });

  const eventLog = await prisma.eventLog.create({
    data: {
      eventType,
      metadata,
      userId: userObject.id,
    },
  });

  return eventLog;
}

async function logDailyAppUsage({ userId }: LogDailyAppUsageParams) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.eventLog.findFirst({
    where: {
      userId,
      eventType: 'USER.DAILY_USAGE',
      createdAt: {
        gte: today,
      },
    },
  });

  if (existingLog) {
    return;
  }

  await prisma.eventLog.create({
    data: {
      eventType: 'USER.DAILY_USAGE',
      userId,
      metadata: { date: today.toISOString() },
    },
  });
}

export default Object.freeze({
  createEventLog,
  logDailyAppUsage,
});
