import { isValidPhoneNumber } from 'react-phone-number-input';

import { prisma } from '@server/db';
import { NotFoundError, ValidationError } from '@errors/index';
import { RegisterRequest } from '@pages/api/users/register';
import authentication from '@models/authentication';

import {
  CleanUserToFrontendParams,
  CreateUserData,
  FindOneByEmailParams,
  FindOneByIdParams,
  UpdateUserSubscriptionParams,
} from './types';
import { addMonths } from 'date-fns';
import eventLogs from '@models/event-logs';

async function create(userData: CreateUserData) {
  const { email, password, name, phoneNumber } = userData;

  await validateUniqueEmail(email);

  const username = await generateUniqueUsernameFromEmail(email);

  const displayName = generateDisplayNameFromName(name);

  const passwordHash = await authentication.hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
      phoneNumber,
      username,
      displayName,
    },
  });

  return user;
}

async function validateUniqueEmail(email: string) {
  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithSameEmail) {
    throw new ValidationError({
      message: `o email informado já está sendo usado.`,
      action: `tente fazer login com o email informado.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS',
      key: 'email',
    });
  }
}

async function generateUniqueUsernameFromEmail(email: string) {
  let username = email.split('@')[0] || email;

  const userWithSameUsername = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (userWithSameUsername) {
    username = `${username}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return username;
}

function generateDisplayNameFromName(name: string) {
  return name.split(' ')[0] || name;
}

async function findOneById({ userId }: FindOneByIdParams) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundError({
      message: `o id "${userId}" não foi encontrado no sistema.`,
      action: 'verifique se o "id" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:FIND_ONE_BY_ID:NOT_FOUND',
      key: 'id',
    });
  }

  return user;
}

async function findOneByEmail({ email }: FindOneByEmailParams) {
  const userObject = await prisma.user.findUnique({
    where: {
      email,
    },
    // select: selectUserProtectedFields,
  });

  if (!userObject) {
    throw new NotFoundError({
      message: `o email informado não foi encontrado no sistema.`,
      action: 'verifique se o "email" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:FIND_ONE_BY_EMAIL:NOT_FOUND',
      key: 'email',
    });
  }

  return userObject;
}

function validateRegisterUserRequest(req: RegisterRequest) {
  const { email, password, name, phoneNumber } = req.body;

  if (!email || !password || !name || !phoneNumber) {
    throw new ValidationError({
      message: `Os campos "email", "password", "name" e "phoneNumber" são obrigatórios.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:MISSING_FIELDS',
      key: 'email',
    });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError({
      message: `O campo "email" não é um email válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_EMAIL',
      key: 'email',
    });
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new ValidationError({
      message: `O campo "password" deve ter no mínimo 6 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_PASSWORD',
      key: 'password',
    });
  }

  if (typeof name !== 'string' || name.length < 3) {
    throw new ValidationError({
      message: `O campo "name" deve ter no mínimo 3 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_NAME',
      key: 'name',
    });
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new ValidationError({
      message: `O campo "phoneNumber" não é um número de telefone válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_PHONE_NUMBER',
      key: 'phoneNumber',
    });
  }

  return {
    email: email.toLowerCase().trim(),
    password: password.trim(),
    name: name.trim(),
    phoneNumber: phoneNumber.trim(),
  } as CreateUserData;
}

function cleanUserToFrontend({ user }: CleanUserToFrontendParams) {
  const cleanUser = {
    ...user,
    password: undefined,
  };

  return cleanUser;
}

async function updateUserSubscription({
  userId,
  subscriptionId,
  recurrencePeriod,
  checkInsQuantity,
  prismaInstance,
}: UpdateUserSubscriptionParams) {
  const userObject = await findOneById({
    userId,
    prismaInstance,
  });

  const newExpirationDate = addMonths(
    userObject.expirationDate
      ? new Date(userObject.expirationDate)
      : new Date(),
    recurrencePeriod === 'MONTHLY'
      ? 1
      : recurrencePeriod === 'QUARTERLY'
      ? 3
      : 12
  );

  const updatedUser = prismaInstance.user.update({
    where: {
      id: userId,
    },
    data: {
      subscriptionId,
      checkInsQuantity: {
        increment: checkInsQuantity,
      },
      expirationDate: newExpirationDate,
    },
  });

  await eventLogs.createEventLog({
    userId,
    eventType: 'USER.RENEW_SUBSCRIPTION',
    metadata: {
      subscriptionId,
      oldCheckInsQuantity: userObject.checkInsQuantity,
      newCheckInsQuantity: userObject.checkInsQuantity + checkInsQuantity,
      oldExpirationDate: userObject.expirationDate,
      newExpirationDate,
    },
    prismaInstance,
  });

  return updatedUser;
}

export default Object.freeze({
  create,
  findOneById,
  findOneByEmail,
  generateUniqueUsernameFromEmail,
  generateDisplayNameFromName,
  validateRegisterUserRequest,
  cleanUserToFrontend,
  updateUserSubscription,
});
