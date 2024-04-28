import { PrismaInstance } from '@server/db';

export type EventLogType =
  | 'USER.SUBSCRIBED_TO_PLAN'
  | 'USER.RENEW_SUBSCRIPTION'
  | 'USER.CANCEL_SUBSCRIPTION'
  | 'USER.UPDATE_PROFILE'
  | 'USER.UPDATE_PROFILE_PICTURE'
  | 'USER.CREATE_MERCADOPAGO_CHECKOUT'
  | 'USER.PURCHASED_CHECK_INS'
  | 'CHECK_IN.ATTENDANCE_UPDATED';

export interface CreateEventLogParams {
  prismaInstance: PrismaInstance;
  eventType: EventLogType;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}
