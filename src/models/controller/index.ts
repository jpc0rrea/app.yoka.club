/* eslint-disable @typescript-eslint/no-explicit-any */
import snakeize from 'snakeize';
import { v4 as uuidV4 } from 'uuid';

import {
  BaseError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
  ValidationError,
} from '@errors/index';
import logger from '@infra/logger';
// import webserver from '@infra/webserver';
import ip from '@models/ip';
import session from '@models/session';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';

async function injectRequestMetadata(
  request: NextApiRequest & { [key: string]: any },
  response?: NextApiResponse,
  next?: () => void
) {
  request.context = {
    ...request.context,
    requestId: uuidV4(),
    clientIp: ip.extractFromRequest(request),
  };

  if (next) {
    return next();
  }
}

async function onNoMatchHandler(
  request: NextApiRequest & { [key: string]: any },
  response: NextApiResponse
) {
  injectRequestMetadata(request);
  const publicErrorObject = new NotFoundError({
    message: '',
    requestId: request.context?.requestId || uuidV4(),
  });

  const privateErrorObject = {
    ...publicErrorObject,
    context: { ...request.context },
  };
  logger.info(snakeize(privateErrorObject));

  return response
    .status(publicErrorObject.statusCode)
    .json(snakeize(publicErrorObject));
}

function onErrorHandler(
  error: unknown,
  request: NextApiRequest & { [key: string]: any },
  response: NextApiResponse
) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof UnprocessableEntityError ||
    error instanceof TooManyRequestsError
  ) {
    const publicErrorObject = {
      ...error,
      requestId: request.context.requestId,
    };

    const privateErrorObject = {
      ...publicErrorObject,
      context: { ...request.context },
    };
    logger.info(snakeize(privateErrorObject));

    return response.status(error.statusCode).json(snakeize(publicErrorObject));
  }

  if (error instanceof UnauthorizedError) {
    const publicErrorObject = {
      ...error,
      requestId: request.context.requestId,
    };

    const privateErrorObject = {
      ...publicErrorObject,
      context: { ...request.context },
    };
    logger.info(snakeize(privateErrorObject));

    session.clearSessionIdCookie(response);

    return response.status(error.statusCode).json(snakeize(publicErrorObject));
  }

  if (error instanceof BaseError) {
    const publicErrorObject = new InternalServerError({
      requestId: request.context?.requestId,
      message: error.message,
      errorId: error.errorId,
      statusCode: error.statusCode,
      errorLocationCode: error.errorLocationCode,
    });

    const privateErrorObject = {
      ...new InternalServerError({
        ...error,
        requestId: request.context?.requestId,
      }),
      context: { ...request.context },
    };

    logger.error(snakeize(privateErrorObject));

    return response
      .status(publicErrorObject.statusCode)
      .json(snakeize(publicErrorObject));
  }

  // check if the error is from the prisma client
  if (error instanceof PrismaClientKnownRequestError) {
    const publicErrorObject = new InternalServerError({
      requestId: request.context?.requestId,
      message: error.message,
      errorLocationCode:
        'CONTROLLER:ON_ERROR_HANDLER:PRISMA_CLIENT_KNOWN_REQUEST_ERROR',
    });

    const privateErrorObject = {
      ...new InternalServerError({
        ...error,
        requestId: request.context?.requestId,
      }),
      context: { ...request.context },
      prismaError: error,
    };

    logger.error(snakeize(privateErrorObject));

    return response
      .status(publicErrorObject.statusCode)
      .json(snakeize(publicErrorObject));
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    const publicErrorObject = new InternalServerError({
      requestId: request.context?.requestId,
      message: error.message,
      errorLocationCode:
        'CONTROLLER:ON_ERROR_HANDLER:PRISMA_CLIENT_UNKNOWN_REQUEST_ERROR',
    });

    const privateErrorObject = {
      ...new InternalServerError({
        ...error,
        requestId: request.context?.requestId,
      }),
      context: { ...request.context },
      prismaError: error,
    };

    logger.error(snakeize(privateErrorObject));

    return response
      .status(publicErrorObject.statusCode)
      .json(snakeize(publicErrorObject));
  }

  const publicErrorObject = new InternalServerError({
    requestId: request.context?.requestId,
    message: 'Erro não tratado',
    errorId: uuidV4(),
    statusCode: 500,
    errorLocationCode: 'CONTROLLER:ON_ERROR_HANDLER:UNHANDLED_ERROR',
  });

  const privateErrorObject = {
    ...new InternalServerError({
      message: 'Erro não tratado',
      errorId: uuidV4(),
      statusCode: 500,
      errorLocationCode: 'CONTROLLER:ON_ERROR_HANDLER:UNHANDLED_ERROR',
      requestId: request.context?.requestId,
    }),
    context: { ...request.context },
  };

  logger.error(snakeize(privateErrorObject));

  return response
    .status(publicErrorObject.statusCode)
    .json(snakeize(publicErrorObject));
}

function logRequest(
  request: NextApiRequest & { [key: string]: any },
  response: NextApiResponse,
  next: () => void
) {
  const { method, url, headers, query, body, context } = request;

  const log = {
    method,
    url,
    headers,
    query,
    context,
    body,
  };

  logger.info(log);

  return next();
}

// function injectPaginationHeaders(pagination, endpoint, response) {
//   const links = [];
//   const baseUrl = `${webserver.host}${endpoint}?strategy=${pagination.strategy}`;

//   if (pagination.firstPage) {
//     links.push(
//       `<${baseUrl}&page=${pagination.firstPage}&per_page=${pagination.perPage}>; rel="first"`
//     );
//   }

//   if (pagination.previousPage) {
//     links.push(
//       `<${baseUrl}&page=${pagination.previousPage}&per_page=${pagination.perPage}>; rel="prev"`
//     );
//   }

//   if (pagination.nextPage) {
//     links.push(
//       `<${baseUrl}&page=${pagination.nextPage}&per_page=${pagination.perPage}>; rel="next"`
//     );
//   }

//   if (pagination.lastPage) {
//     links.push(
//       `<${baseUrl}&page=${pagination.lastPage}&per_page=${pagination.perPage}>; rel="last"`
//     );
//   }

//   const linkHeaderString = links.join(', ');

//   response.setHeader('Link', linkHeaderString);
//   response.setHeader('X-Pagination-Total-Rows', pagination.totalRows);
// }

export default Object.freeze({
  injectRequestMetadata,
  onNoMatchHandler,
  onErrorHandler,
  logRequest,
  // injectPaginationHeaders,
});
