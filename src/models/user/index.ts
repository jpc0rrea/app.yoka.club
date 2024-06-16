import { isValidPhoneNumber } from 'react-phone-number-input';

import { prisma } from '@server/db';
import { NotFoundError, ValidationError } from '@errors/index';
import { RegisterRequest } from '@pages/api/users/register';
import authentication from '@models/authentication';

import {
  CleanUserToFrontendParams,
  CreateUserData,
  CreateWithoutPasswordUserData,
  FindOneByEmailParams,
  FindOneByIdParams,
  GetUserProfileByUsernameParams,
  UpdateProfilePictureParams,
  UpdateUserProfileParams,
  UpdateUserSubscriptionParams,
  selectUserProfile,
} from './types';
import { addMonths, isAfter } from 'date-fns';
import eventLogs from '@models/event-logs';
import { UpdateUserProfileRequest } from '@pages/api/user/profile';
import { UpdateProfileFormData } from '@pages/profile';
import { SendGridMailService } from '@lib/mail/SendGridMailService';
import checkin from '@models/checkin';
import mailLists from '@lib/mail/mailLists';
import webserver from '@infra/webserver';
import sendMessageToYogaComKakaTelegramGroup from '@lib/telegram';
import { RegisterWithoutPasswordRequest } from '@pages/api/users/register-without-password';
import {
  isBrazilianPhoneNumber,
  isValidBrazilianPhoneNumber,
} from '@lib/utils';
import { ClintCRMService } from '@lib/crm/ClintCRMService';
import { BILLING_PERIODS, PLAN_CODES } from '@lib/stripe/plans';

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

async function createWithoutPassword(userData: CreateWithoutPasswordUserData) {
  const { email, phoneNumber, name } = userData;

  await validateUniqueEmail(email);

  const username = await generateUniqueUsernameFromEmail(email);

  const displayName = name
    ? generateDisplayNameFromName(name)
    : generateDisplayNameFromEmail(email);

  const { generatedPassword, hashedPassword } =
    await authentication.generateRandomPassword();

  const user = await prisma.user.create({
    data: {
      email,
      phoneNumber,
      username,
      displayName,
      name: name || displayName,
      password: hashedPassword,
      isUserActivated: true,
    },
  });

  await checkin.giveTrialCheckin({ userId: user.id });

  // enviar email de boas vindas
  const mailService = new SendGridMailService();

  await mailService.addContact({
    email: user.email,
    firstName: user.displayName,
    listIds: [mailLists['user-onboarding']],
  });

  await mailService.send({
    template: 'userRegisteredWithoutPassword',
    to: user.email,
    templateData: {
      userName: user.displayName,
      buttonLink: `${webserver.host}/profile`,
      password: generatedPassword,
    },
  });

  const CRMService = new ClintCRMService();

  await CRMService.addContact({
    name,
    email,
    phone: phoneNumber,
    origin: 'ad',
  });

  await sendMessageToYogaComKakaTelegramGroup(
    `
🎉🎉🎉
o usuário ${user.displayName} acabou de ativar sua conta!

    email: ${user.email}
    telefone: ${user.phoneNumber}
`
  );

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

function generateDisplayNameFromEmail(email: string) {
  return email.split('@')[0] || email;
}

async function findOneById({ userId }: FindOneByIdParams) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      favorites: true,
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

  const favoriteEvents = user.favorites.map((favorite) => favorite.eventId);

  return {
    ...user,
    favoriteEvents,
    favorites: undefined,
  };
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

  if (
    isBrazilianPhoneNumber(phoneNumber) &&
    !isValidBrazilianPhoneNumber(String(phoneNumber))
  ) {
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

function validateRegisterUserWithoutPasswordRequest(
  req: RegisterWithoutPasswordRequest
) {
  const { email, name, phoneNumber, planCode, billingPeriod } = req.body;

  if (!email || !name || !phoneNumber) {
    throw new ValidationError({
      message: `Os campos "email", "name" e "phoneNumber" são obrigatórios.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_WITHOUT_PASS_REQUEST:MISSING_FIELDS',
      key: 'email',
    });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError({
      message: `O campo "email" não é um email válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_WITHOUT_PASS_REQUEST:INVALID_EMAIL',
      key: 'email',
    });
  }

  if (typeof name !== 'string' || name.length < 3) {
    throw new ValidationError({
      message: `O campo "name" deve ter no mínimo 3 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_WITHOUT_PASS_REQUEST:INVALID_NAME',
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

  if (
    isBrazilianPhoneNumber(phoneNumber) &&
    !isValidBrazilianPhoneNumber(String(phoneNumber))
  ) {
    throw new ValidationError({
      message: `O campo "phoneNumber" não é um número de telefone válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_REQUEST:INVALID_PHONE_NUMBER',
      key: 'phoneNumber',
    });
  }

  if (!planCode || !PLAN_CODES.includes(planCode)) {
    throw new ValidationError({
      message: `O campo "chosenPlan" deve ser "free", "flow" ou "zen".`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_WITHOUT_PASS_REQUEST:INVALID_CHOSEN_PLAN',
      key: 'chosenPlan',
    });
  }

  if (!billingPeriod || !BILLING_PERIODS.includes(billingPeriod)) {
    throw new ValidationError({
      message: `O campo "billingPeriod" deve ser "monthly" ou "quarterly".`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_REGISTER_USER_WITHOUT_PASS_REQUEST:INVALID_PERIOD',
      key: 'period',
    });
  }

  return {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phoneNumber: phoneNumber.trim(),
    planCode: planCode.trim(),
    billingPeriod: billingPeriod.trim(),
  } as CreateWithoutPasswordUserData;
}

function validateUpdateUserProfileRequest(req: UpdateUserProfileRequest) {
  const { username, email, name, bio, displayName } = req.body;

  if (!username || !email || !name || !displayName) {
    throw new ValidationError({
      message: `os campos "username", "email", "name" e "displayName" são obrigatórios.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:MISSING_FIELDS',
      key: 'username',
    });
  }

  if (typeof username !== 'string' || username.length < 3) {
    throw new ValidationError({
      message: `o campo "username" deve ter no mínimo 3 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_USERNAME',
      key: 'username',
    });
  }

  // check if the username passes this /^[a-zA-Z0-9_.-]+$/ regex
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new ValidationError({
      message: `o campo "username" deve conter apenas letras, números, pontos, hífens e underscores.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_USERNAME',
      key: 'username',
    });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError({
      message: `o campo "email" não é um email válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_EMAIL',
      key: 'email',
    });
  }

  if (typeof name !== 'string' || name.length < 3) {
    throw new ValidationError({
      message: `o campo "name" deve ter no mínimo 3 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_NAME',
      key: 'name',
    });
  }

  if (typeof displayName !== 'string' || displayName.length < 3) {
    throw new ValidationError({
      message: `O campo "displayName" deve ter no mínimo 3 caracteres.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_DISPLAY_NAME',
      key: 'displayName',
    });
  }

  if (bio && typeof bio !== 'string') {
    throw new ValidationError({
      message: `o campo "bio" deve ser uma string.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:USER:VALIDATE_UPDATE_USER_PROFILE_REQUEST:INVALID_BIO',
      key: 'bio',
    });
  }

  return {
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    bio: bio?.trim(),
    displayName: displayName.trim(),
  } as UpdateProfileFormData;
}

function cleanUserToFrontend({ user }: CleanUserToFrontendParams) {
  const isSubscribed =
    user.expirationDate && isAfter(user.expirationDate, new Date());

  const cleanUser = {
    ...user,
    isSubscribed,
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

  const normalizedExpirationDate = userObject.expirationDate
    ? isAfter(userObject.expirationDate, new Date())
      ? userObject.expirationDate
      : new Date()
    : new Date();

  const newExpirationDate = addMonths(
    normalizedExpirationDate,
    recurrencePeriod === 'MONTHLY'
      ? 1
      : recurrencePeriod === 'QUARTERLY'
      ? 3
      : 12
  );

  const isSubscribing =
    !userObject.subscriptionId || userObject.subscriptionId !== subscriptionId;

  if (isSubscribing) {
    const mailService = new SendGridMailService();

    const checkInsPerMonth =
      checkInsQuantity /
      (recurrencePeriod === 'MONTHLY'
        ? 1
        : recurrencePeriod === 'QUARTERLY'
        ? 3
        : 12);

    await mailService.send({
      template:
        checkInsPerMonth === 0
          ? 'userSubscribedToPlanWithoutCheckIns'
          : 'userSubscribedToPlanWithCheckIns',
      to: userObject.email,
      templateData: {
        userName: userObject.displayName,
        planName:
          checkInsPerMonth === 0
            ? undefined
            : `${
                recurrencePeriod === 'MONTHLY' ? 'mensal' : 'trimestral'
              } - ${checkInsPerMonth} check-ins/ mês${
                recurrencePeriod === 'MONTHLY'
                  ? ''
                  : ` (${checkInsQuantity} ao total)`
              }`,
      },
    });
  }

  const updatedUser = prismaInstance.user.update({
    where: {
      id: userId,
    },
    data: {
      subscriptionId,
      checkInsQuantity: {
        increment: checkInsQuantity,
      },
      paidCheckInsQuantity: {
        increment: checkInsQuantity,
      },
      expirationDate: newExpirationDate,
    },
  });

  await eventLogs.createEventLog({
    userId,
    eventType: isSubscribing
      ? 'USER.SUBSCRIBED_TO_PLAN'
      : 'USER.RENEW_SUBSCRIPTION',
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

async function updateProfile({
  userId,
  bio,
  name,
  displayName,
  email,
  username,
}: UpdateUserProfileParams) {
  const userObject = await findOneById({
    userId,
    prismaInstance: prisma,
  });

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithSameEmail && userWithSameEmail.id !== userId) {
    throw new ValidationError({
      message: `o email informado já está sendo usado.`,
      action: `tente outro email`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:UPDATE_PROFILE:EMAIL_ALREADY_EXISTS',
      key: 'email',
    });
  }

  const userWithSameUsername = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (userWithSameUsername && userWithSameUsername.id !== userId) {
    throw new ValidationError({
      message: `o username informado já está sendo usado.`,
      action: `tente outro username`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:UPDATE_PROFILE:USERNAME_ALREADY_EXISTS',
      key: 'username',
    });
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      bio,
      name,
      displayName,
      email,
      username,
    },
  });

  console.log('updatedUser', updatedUser);

  await eventLogs.createEventLog({
    userId,
    eventType: 'USER.UPDATE_PROFILE',
    metadata: {
      oldBio: userObject.bio,
      newBio: bio,
      oldName: userObject.name,
      newName: name,
      oldDisplayName: userObject.displayName,
      newDisplayName: displayName,
      oldEmail: userObject.email,
      newEmail: email,
      oldUsername: userObject.username,
      newUsername: username,
    },
    prismaInstance: prisma,
  });

  return updatedUser;
}

async function getUserProfileByUsername({
  username,
}: GetUserProfileByUsernameParams) {
  const userObject = await prisma.user.findUnique({
    where: {
      username,
    },
    select: selectUserProfile,
  });

  if (!userObject) {
    throw new NotFoundError({
      message: `o username "${username}" não foi encontrado no sistema.`,
      action: 'verifique se o "username" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: 'MODEL:USER:GET_USER_PROFILE_BY_USERNAME:NOT_FOUND',
      key: 'username',
    });
  }

  return userObject;
}

async function updateProfilePicture({
  userId,
  profilePictureUrl,
}: UpdateProfilePictureParams) {
  const userObject = await findOneById({
    userId,
    prismaInstance: prisma,
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      imageUrl: profilePictureUrl,
    },
  });

  await eventLogs.createEventLog({
    userId,
    eventType: 'USER.UPDATE_PROFILE_PICTURE',
    metadata: {
      oldImageUrl: userObject.imageUrl,
      newImageUrl: profilePictureUrl,
    },
    prismaInstance: prisma,
  });

  return updatedUser;
}

export default Object.freeze({
  create,
  findOneById,
  findOneByEmail,
  generateUniqueUsernameFromEmail,
  generateDisplayNameFromName,
  createWithoutPassword,
  validateRegisterUserRequest,
  validateRegisterUserWithoutPasswordRequest,
  validateUpdateUserProfileRequest,
  cleanUserToFrontend,
  updateUserSubscription,
  updateProfile,
  getUserProfileByUsername,
  updateProfilePicture,
});
