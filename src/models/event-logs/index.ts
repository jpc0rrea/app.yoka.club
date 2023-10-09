import user from '@models/user';
import { CreateEventLogParams } from './types';

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

  const eventLog = await prismaInstance.eventLog.create({
    data: {
      eventType,
      metadata,
      userId: userObject.id,
    },
  });

  return eventLog;
}

export default Object.freeze({
  createEventLog,
});
