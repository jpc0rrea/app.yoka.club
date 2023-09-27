import { TOLERANCE_MINUTES_TO_ENTER_EVENT } from '@lib/constants';
import { differenceInMinutes } from 'date-fns';
import { EventFromAPI } from 'pages/api/events/list';

interface GetCheckInStatusesParams {
  event: EventFromAPI;
  userId: string;
  userCheckInsQuantity: number;
}

interface GetCheckInStatusesResponse {
  alreadyCheckedIn: boolean;
  eventAlreadyStarted: boolean;
  canEnterTheEvent: boolean;
  stillHasVacancy: boolean;
  canCheckIn: boolean;
  canCancelCheckIn: boolean;
}

export default function getCheckInStatuses({
  event,
  userId,
  userCheckInsQuantity,
}: GetCheckInStatusesParams): GetCheckInStatusesResponse {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return {
      alreadyCheckedIn: false,
      eventAlreadyStarted: false,
      stillHasVacancy: false,
      canEnterTheEvent: false,
      canCheckIn: false,
      canCancelCheckIn: false,
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

  console.log(timeToEventInMinutes);

  const canEnterTheEvent = event.startDate
    ? timeToEventInMinutes > -TOLERANCE_MINUTES_TO_ENTER_EVENT
    : false;

  console.log(canEnterTheEvent);

  const canCheckIn =
    !alreadyCheckedIn &&
    !eventAlreadyStarted &&
    stillHasVacancy &&
    userCheckInsQuantity > 0 &&
    timeToEventInMinutes > 30;

  const canCancelCheckIn =
    alreadyCheckedIn && !eventAlreadyStarted && timeToEventInMinutes > 30;

  return {
    alreadyCheckedIn,
    eventAlreadyStarted,
    stillHasVacancy,
    canEnterTheEvent,
    canCheckIn,
    canCancelCheckIn,
  };
}
