import { PrismaInstance } from '@server/db';

export type EventLogType =
  | 'USER.RENEW_SUBSCRIPTION'
  | 'USER.CANCEL_SUBSCRIPTION'
  | 'USER.UPDATE_PROFILE'
  | 'USER.UPDATE_PROFILE_PICTURE';

export interface CreateEventLogParams {
  prismaInstance: PrismaInstance;
  eventType: EventLogType;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}
