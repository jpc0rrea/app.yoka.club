import { TOLERANCE_MINUTES_TO_ENTER_EVENT } from '@lib/constants';
import { EventFromAPI } from '@models/events/types';
import { differenceInMinutes } from 'date-fns';

interface GetCheckInStatusesParams {
  event: EventFromAPI;
  userId: string;
  userCheckInsQuantity: number;
  isUserSubscribed: boolean;
}

interface GetCheckInStatusesResponse {
  alreadyCheckedIn: boolean;
  eventAlreadyStarted: boolean;
  canEnterTheEvent: boolean;
  stillHasVacancy: boolean;
  canCheckIn: boolean;
  canCancelCheckIn: boolean;
  canViewRecordedEvent: boolean;
}

export default function getCheckInStatuses({
  event,
  userId,
  userCheckInsQuantity,
  isUserSubscribed,
}: GetCheckInStatusesParams): GetCheckInStatusesResponse {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return {
      alreadyCheckedIn: false,
      eventAlreadyStarted: false,
      stillHasVacancy: false,
      canEnterTheEvent: false,
      canCheckIn: false,
      canCancelCheckIn: false,
      canViewRecordedEvent: false,
    };
  }

  const alreadyCheckedIn = event.checkIns
    .map((checkIn) => checkIn.userId)
    .includes(userId);

  const eventAlreadyStarted = event.startDate
    ? new Date(event?.startDate) < new Date()
    : false;

  const stillHasVacancy = event.checkIns.length < event.checkInsMaxQuantity;

  // to checkIn/ cancel checkIn, there must be at least 30 minutes left to the event
  const timeToEventInMinutes = differenceInMinutes(
    new Date(event.startDate),
    new Date()
  );

  const canEnterTheEvent = event.startDate
    ? timeToEventInMinutes > -TOLERANCE_MINUTES_TO_ENTER_EVENT
    : false;

  const canCheckIn =
    !alreadyCheckedIn &&
    !eventAlreadyStarted &&
    stillHasVacancy &&
    userCheckInsQuantity > 0 &&
    timeToEventInMinutes > 30;

  const canCancelCheckIn =
    alreadyCheckedIn && !eventAlreadyStarted && timeToEventInMinutes > 30;

  // o usuário pode ver o evento gravado se a data de expiração dele for maior que hoje
  // ou se ela fez check-in no evento
  const canViewRecordedEvent = isUserSubscribed || alreadyCheckedIn;

  return {
    alreadyCheckedIn,
    eventAlreadyStarted,
    stillHasVacancy,
    canEnterTheEvent,
    canCheckIn,
    canCancelCheckIn,
    canViewRecordedEvent,
  };
}
