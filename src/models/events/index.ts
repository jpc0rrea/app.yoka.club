import { ValidationError } from '@errors/index';
import { ListEventsParams, ListEventsQueryParams, eventSelect } from './types';
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

export default Object.freeze({
  listEvents,
  convertQueryParamsInListEventsParams,
});
