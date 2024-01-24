import { ValidationError } from '@errors/index';
import {
  ListEventsParams,
  ListEventsQueryParams,
  ListRecordedEventsQueryParams,
  eventSelect,
} from './types';
import { prisma } from '@server/db';
import user from '@models/user';

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

  return {
    search: searchInString || undefined,
    page,
    pageSize,
    maxDuration,
    durationArray,
    intensity,
    isPremium,
  };
}

export default Object.freeze({
  listEvents,
  convertQueryParamsInListEventsParams,
  convertQueryParamsInListRecordedEventsParams,
});
