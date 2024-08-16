import { PrismaInstance } from '@server/db';

export type SystemLogType = 'DAILY_ACTIVE_USERS';

export interface CreateSystemLogParams {
  prismaInstance: PrismaInstance;
  log: SystemLogType;
  userId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

async function createSystemLog({
  log,
  metadata,
  userId,
  prismaInstance,
}: CreateSystemLogParams) {
  const systemLog = await prismaInstance.systemLog.create({
    data: {
      log,
      metadata,
      userId,
    },
  });

  return systemLog;
}

export default Object.freeze({
  createSystemLog,
});
