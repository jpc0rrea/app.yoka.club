import { EventFromAPI } from '@models/events/types';
import eventUtils from '@models/events/utils';

interface GetCheckInStatusesParams {
  event: EventFromAPI;
  userId: string;
  userCheckInsQuantity: number;
  isUserSubscribed: boolean;
  expirationDate: Date | null | undefined;
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
  expirationDate,
}: GetCheckInStatusesParams): GetCheckInStatusesResponse {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return {
      alreadyCheckedIn: false,
      eventAlreadyStarted: true,
      stillHasVacancy: false,
      canEnterTheEvent: false,
      canCheckIn: false,
      canCancelCheckIn: false,
      canViewRecordedEvent: isUserSubscribed,
    };
  }

  const alreadyCheckedIn = eventUtils.hasUserAlreadyCheckedIn({
    event,
    userId,
  });

  const eventAlreadyStarted = eventUtils.hasStarted({
    event,
  });

  const stillHasVacancy = eventUtils.stillHasVacancy({ event });

  const canEnterTheEvent = eventUtils.userCanEnterTheEvent({
    event,
    userId,
  });

  const canCheckIn = eventUtils.userCanCheckIn({
    event,
    userId,
    userCheckInsQuantity,
    expirationDate,
  });

  const canCancelCheckIn = eventUtils.userCanCancelCheckIn({
    event,
    userId,
  });

  // o usuário pode ver o evento gravado se a data de expiração dele for maior que hoje
  // ou se ela fez check-in no evento
  const canViewRecordedEvent = eventUtils.userCanViewRecordedEvent({
    event,
    userId,
    isUserSubscribed,
  });

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
