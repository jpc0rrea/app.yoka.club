import { NotFoundError, ValidationError } from '@errors/index';
import {
  AddEventToUserFavoritesParams,
  FindEventByIdParams,
  ListEventsParams,
  ListEventsQueryParams,
  ListManageEventsQueryParams,
  ListRecordedEventsQueryParams,
  RemoveEventFromUserFavoritesParams,
  UpdateEventAttendace,
  eventSelect,
} from './types';
import { prisma } from '@server/db';
import user from '@models/user';
import eventUtils from '@models/events/utils';
import checkInModel from '@models/checkin';

async function listEvents({
  isLive,
  page,
  pageSize = 10,
  instructorId,
}: ListEventsParams) {
  const events = await prisma.event.findMany({
    where: {
      isLive,
      instructorId,
    },
    select: eventSelect,
    skip: page ? (page - 1) * pageSize : undefined,
    take: pageSize,
    orderBy: [
      {
        startDate: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });

  return events;
}

async function convertQueryParamsInListEventsParams({
  isLive: isLiveInString,
  page: pageInString,
  pageSize: pageSizeInString,
  instructorId,
}: ListEventsQueryParams) {
  const isLive =
    isLiveInString === 'true'
      ? true
      : isLiveInString === 'false'
      ? false
      : undefined;

  const page = pageInString ? parseInt(pageInString) : undefined;

  if (page !== undefined && (isNaN(page) || page < 0)) {
    throw new ValidationError({
      message: `o parâmetro 'page' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_PARAM',
      key: 'page',
    });
  }

  const pageSize = pageSizeInString ? parseInt(pageSizeInString) : undefined;

  if (pageSize !== undefined && (isNaN(pageSize) || pageSize < 0)) {
    throw new ValidationError({
      message: `o parâmetro 'pageSize' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_SIZE_PARAM',
      key: 'pageSize',
    });
  }

  if (instructorId) {
    await user.findOneById({
      userId: instructorId,
      prismaInstance: prisma,
    });
  }

  return {
    isLive,
    page,
    pageSize,
    instructorId,
  };
}

function convertQueryParamsInListRecordedEventsParams({
  searchInString,
  pageInString,
  pageSizeInString,
  durationInString,
  intensityInString,
  premiumInString,
  favoritesInString,
}: ListRecordedEventsQueryParams) {
  const page = pageInString ? parseInt(pageInString) : 1;

  if (isNaN(page) || page < 0) {
    throw new ValidationError({
      message: `o parâmetro 'page' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_PARAM',
      key: 'page',
    });
  }

  const pageSize = pageSizeInString ? parseInt(pageSizeInString) : 20;

  if (isNaN(pageSize) || pageSize < 0) {
    throw new ValidationError({
      message: `o parâmetro 'pageSize' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_SIZE_PARAM',
      key: 'pageSize',
    });
  }

  if (typeof durationInString !== 'string') {
    throw new ValidationError({
      message: `o parâmetro 'duration' deve ser uma string.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_DURATION_PARAM',
      key: 'duration',
    });
  }

  if (typeof premiumInString !== 'string') {
    throw new ValidationError({
      message: `o parâmetro 'premium' deve ser uma string.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PREMIUM_PARAM',
      key: 'premium',
    });
  }

  const durationArray = durationInString
    ? durationInString.split(',').map((duration) => parseInt(duration.trim()))
    : undefined;

  const premiumArray = premiumInString
    ? premiumInString.split(',').map((premium) => premium.trim())
    : undefined;

  // só vai ser premium se no premium array tiver o valor 'exclusiva' e não tiver o valor 'gratuita'
  const isPremium = premiumArray
    ? premiumArray.includes('exclusiva') && !premiumArray.includes('gratuita')
      ? true
      : premiumArray.includes('exclusiva') && premiumArray.includes('gratuita')
      ? undefined
      : false
    : undefined;

  const maxDuration = durationArray
    ? Math.max(...durationArray.filter((duration) => !isNaN(duration)))
    : undefined;

  const intensity = intensityInString
    ? intensityInString.split(',').map((intensity) => intensity.trim())
    : undefined;

  const onlyFavorites = favoritesInString === 'true' ? true : false;

  return {
    search: searchInString || undefined,
    page,
    pageSize,
    maxDuration,
    durationArray,
    intensity,
    isPremium,
    onlyFavorites,
  };
}

function convertQueryParamsInListManageEventsParams({
  searchInString,
  pageInString,
  pageSizeInString,
  durationInString,
  intensityInString,
  premiumInString,
  isLiveInString,
}: ListManageEventsQueryParams) {
  const page = pageInString ? parseInt(pageInString) : 1;

  if (isNaN(page) || page < 0) {
    throw new ValidationError({
      message: `o parâmetro 'page' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_PARAM',
      key: 'page',
    });
  }

  const pageSize = pageSizeInString ? parseInt(pageSizeInString) : 20;

  if (isNaN(pageSize) || pageSize < 0) {
    throw new ValidationError({
      message: `o parâmetro 'pageSize' deve ser um número inteiro positivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PAGE_SIZE_PARAM',
      key: 'pageSize',
    });
  }

  if (typeof durationInString !== 'string') {
    throw new ValidationError({
      message: `o parâmetro 'duration' deve ser uma string.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_DURATION_PARAM',
      key: 'duration',
    });
  }

  if (typeof premiumInString !== 'string') {
    throw new ValidationError({
      message: `o parâmetro 'premium' deve ser uma string.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:LIST_EVENTS:INVALID_PREMIUM_PARAM',
      key: 'premium',
    });
  }

  const durationArray = durationInString
    ? durationInString.split(',').map((duration) => parseInt(duration.trim()))
    : undefined;

  const premiumArray = premiumInString
    ? premiumInString.split(',').map((premium) => premium.trim())
    : undefined;

  // só vai ser premium se no premium array tiver o valor 'exclusiva' e não tiver o valor 'gratuita'
  const isPremium = premiumArray
    ? premiumArray.includes('exclusiva') && !premiumArray.includes('gratuita')
      ? true
      : premiumArray.includes('exclusiva') && premiumArray.includes('gratuita')
      ? undefined
      : false
    : undefined;

  // só vai ser live se no isLive array tiver o valor 'live' e não tiver o valor 'recorded'
  const isLive = isLiveInString
    ? isLiveInString.includes('live') && !isLiveInString.includes('recorded')
      ? true
      : isLiveInString.includes('live') && isLiveInString.includes('recorded')
      ? undefined
      : false
    : undefined;

  const maxDuration = durationArray
    ? Math.max(...durationArray.filter((duration) => !isNaN(duration)))
    : undefined;

  const intensity = intensityInString
    ? intensityInString.split(',').map((intensity) => intensity.trim())
    : undefined;

  return {
    search: searchInString || undefined,
    page,
    pageSize,
    maxDuration,
    durationArray,
    intensity,
    isPremium,
    isLive,
  };
}

async function findOneById({ eventId }: FindEventByIdParams) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: eventSelect,
  });

  if (!event) {
    throw new NotFoundError({
      message: `o evento com id ${eventId} não foi encontrado.`,
      action: `verifique se o "eventId" informado está correto e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:FIND_ONE_BY_ID:EVENT_NOT_FOUND',
      key: 'eventId',
    });
  }

  return event;
}

async function updateEventAttendance({
  eventId,
  attendance,
  userId, // user (admin or instructor) that is updating the attendance
}: UpdateEventAttendace) {
  const eventObject = await findOneById({ eventId });

  if (!eventObject.isLive) {
    throw new ValidationError({
      message: `o evento não é um evento ao vivo.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode: 'MODEL:EVENTS:UPDATE_EVENT_ATTENDANCE:EVENT_NOT_LIVE',
      key: 'eventId',
    });
  }

  const userObject = await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  const canUserManageEvent = eventUtils.canUserManageEvent({
    event: eventObject,
    user: userObject,
  });

  if (!canUserManageEvent) {
    throw new ValidationError({
      message: `você não tem permissão para atualizar a lista de presença.`,
      action: `verifique o valor informado e tente novamente.`,
      errorLocationCode:
        'MODEL:EVENTS:UPDATE_EVENT_ATTENDANCE:USER_NOT_ALLOWED',
      key: 'eventId',
    });
  }

  const updateCheckinsAttencePromises = [];

  for (const checkin of attendance) {
    updateCheckinsAttencePromises.push(
      checkInModel.updateCheckInAttendance({
        checkinId: checkin.id,
        attended: checkin.attended,
      })
    );
  }

  await Promise.all(updateCheckinsAttencePromises);
}

async function addEventToUserFavorites({
  eventId,
  userId,
}: AddEventToUserFavoritesParams) {
  await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  const eventObject = await findOneById({ eventId });

  await prisma.favorite.upsert({
    where: {
      userId_eventId: {
        eventId,
        userId,
      },
    },
    create: {
      userId,
      eventId,
    },
    update: {},
  });

  return eventObject;
}

async function removeEventFromUserFavorites({
  eventId,
  userId,
}: RemoveEventFromUserFavoritesParams) {
  await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  await prisma.favorite.delete({
    where: {
      userId_eventId: {
        eventId,
        userId,
      },
    },
  });
}

export default Object.freeze({
  findOneById,
  listEvents,
  convertQueryParamsInListEventsParams,
  convertQueryParamsInListRecordedEventsParams,
  convertQueryParamsInListManageEventsParams,
  updateEventAttendance,
  addEventToUserFavorites,
  removeEventFromUserFavorites,
});
