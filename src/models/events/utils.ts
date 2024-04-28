import {
  StillHasVacancyParams,
  UserCanCancelCheckInParams,
  UserCanCheckInInEventParams,
  UserCanViewRecordedEventParams,
  CanEnterTheEventParams,
  HasEventStartedParams,
  HasUserAlreadyCheckedInParams,
  CanUserManageEvent,
} from './types';

import { differenceInMinutes } from 'date-fns';
import {
  MINUTES_TO_CANCEL_CHECK_IN,
  MINUTES_TO_CHECK_IN,
  TOLERANCE_MINUTES_TO_ENTER_EVENT,
} from '@lib/constants';

function hasStarted({ event }: HasEventStartedParams) {
  if (!event.startDate) {
    return false;
  }

  return new Date(event.startDate) < new Date();
}

function hasUserAlreadyCheckedIn({
  event,
  userId,
}: HasUserAlreadyCheckedInParams) {
  return event.checkIns.map((checkIn) => checkIn.userId).includes(userId);
}

function stillHasVacancy({ event }: StillHasVacancyParams) {
  if (!event.checkInsMaxQuantity) {
    return false;
  }

  return event.checkIns.length < event.checkInsMaxQuantity;
}

function userCanEnterTheEvent({ event, userId }: CanEnterTheEventParams) {
  if (!event.startDate) {
    return false;
  }

  const timeToEventInMinutes = differenceInMinutes(
    new Date(event.startDate),
    new Date()
  );

  const userHasCheckedIn = hasUserAlreadyCheckedIn({
    event,
    userId,
  });

  return (
    timeToEventInMinutes > -TOLERANCE_MINUTES_TO_ENTER_EVENT && userHasCheckedIn
  );
}

function userCanCheckIn({
  event,
  userId,
  userCheckInsQuantity,
}: UserCanCheckInInEventParams) {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return false;
  }

  const eventAlreadyStarted = hasStarted({
    event,
  });

  if (!eventAlreadyStarted) {
    return false;
  }

  const userHasCheckedIn = hasUserAlreadyCheckedIn({
    event,
    userId,
  });

  if (userHasCheckedIn) {
    return false;
  }

  if (userCheckInsQuantity <= 0) {
    return false;
  }

  const stillHasVacancyInEvent = stillHasVacancy({ event });

  if (!stillHasVacancyInEvent) {
    return false;
  }

  const timeToEventInMinutes = differenceInMinutes(
    new Date(event.startDate),
    new Date()
  );

  if (timeToEventInMinutes > MINUTES_TO_CHECK_IN) {
    return false;
  }

  return true;
}

function userCanCancelCheckIn({ event, userId }: UserCanCancelCheckInParams) {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return false;
  }

  const alreadyCheckedIn = hasUserAlreadyCheckedIn({
    event,
    userId,
  });

  if (!alreadyCheckedIn) {
    return false;
  }

  const eventAlreadyStarted = hasStarted({
    event,
  });

  if (eventAlreadyStarted) {
    return false;
  }

  const timeToEventInMinutes = differenceInMinutes(
    new Date(event.startDate),
    new Date()
  );

  if (timeToEventInMinutes > MINUTES_TO_CANCEL_CHECK_IN) {
    return false;
  }

  return true;
}

function userCanViewRecordedEvent({
  event,
  userId,
  isUserSubscribed,
}: UserCanViewRecordedEventParams) {
  if (!event.startDate) {
    return false;
  }

  const userHasCheckedIn = hasUserAlreadyCheckedIn({
    event,
    userId,
  });

  if (userHasCheckedIn) {
    return true;
  }

  if (isUserSubscribed) {
    return true;
  }

  return false;
}

function canUserManageEvent({ event, user }: CanUserManageEvent) {
  if (user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'INSTRUCTOR' && event.instructor.id === user.id) {
    return true;
  }

  return false;
}

export default Object.freeze({
  hasStarted,
  hasUserAlreadyCheckedIn,
  stillHasVacancy,
  userCanEnterTheEvent,
  userCanCheckIn,
  userCanCancelCheckIn,
  userCanViewRecordedEvent,
  canUserManageEvent,
});
