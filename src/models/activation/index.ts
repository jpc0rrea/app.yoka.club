import { addMinutes, isAfter } from 'date-fns';

import webserver from '@infra/webserver';
import { prisma } from '@server/db';
import {
  // ActivateUserByUserIdParams,
  ActivateUserUsingTokenIdParams,
  CreateActivationTokenParams,
  CreateAndSendActivationEmailParams,
  SendEmailToUserParams,
} from './types';
import { SendGridMailService } from '@lib/mail/SendGridMailService';
import { NotFoundError, ValidationError } from '@errors/index';
import user from '@models/user';
import checkin from '@models/checkin';

async function createAndSendActivationEmail({
  user,
}: CreateAndSendActivationEmailParams) {
  const tokenObject = await createActivationToken({
    user,
  });
  await sendEmailToUser({
    user,
    tokenId: tokenObject.id,
  });
}

async function createActivationToken({ user }: CreateActivationTokenParams) {
  const token = await prisma.activateAccountToken.create({
    data: {
      userId: user.id,
      expiresAt: addMinutes(new Date(), 30),
    },
  });

  return token;
}

async function sendEmailToUser({ user, tokenId }: SendEmailToUserParams) {
  const activationPageEndpoint = getActivationPageEndpoint(tokenId);

  const mailService = new SendGridMailService();

  await mailService.send({
    template: 'activateAccount',
    to: user.email,
    templateData: {
      buttonLink: activationPageEndpoint,
      userName: user.displayName,
    },
  });
}

function getActivationApiEndpoint() {
  return `${webserver.host}/api/v1/activation`;
}

function getActivationPageEndpoint(tokenId: string) {
  return tokenId
    ? `${webserver.host}/register/activate/${tokenId}`
    : `${webserver.host}/register/activate`;
}

async function activateUserUsingTokenId({
  tokenId,
}: ActivateUserUsingTokenIdParams) {
  let tokenObject = await findOneTokenById(tokenId);
  if (tokenObject.alreadyUsed) {
    throw new ValidationError({
      message: `o token de ativação utilizado já foi usado.`,
      action: 'você pode fazer login normalmente pelo sistema',
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:ACTIVATION:ACTIVATE_USER_USING_TOKEN_ID:TOKEN_ALREADY_USED',
    });
  }

  // checar se o token já expirou
  if (isAfter(new Date(), tokenObject.expiresAt)) {
    throw new ValidationError({
      message: `o token de ativação utilizado já expirou.`,
      action: 'faça login novamente para receber um novo token por email.',
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:ACTIVATION:ACTIVATE_USER_USING_TOKEN_ID:TOKEN_EXPIRED',
    });
  }

  const userToActivate = await user.findOneById({ userId: tokenObject.userId });

  const activateUserTransaction = prisma.user.update({
    where: {
      id: userToActivate.id,
    },
    data: {
      isUserActivated: true,
    },
  });

  const markTokenAsUsedTransaction = prisma.activateAccountToken.update({
    where: {
      id: tokenId,
    },
    data: {
      alreadyUsed: true,
    },
  });

  const [, updatedTokenObject] = await prisma.$transaction([
    activateUserTransaction,
    markTokenAsUsedTransaction,
  ]);

  tokenObject = updatedTokenObject;

  await checkin.giveTrialCheckin({ userId: userToActivate.id });

  return tokenObject;
}

// async function activateUserByUserId({ userId }: ActivateUserByUserIdParams) {
//   const userToActivate = await user.findOneById({ userId });

//   await prisma.user.update({
//     where: {
//       id: userToActivate.id,
//     },
//     data: {
//       isUserActivated: true,
//     },
//   });
// }

async function findOneTokenById(tokenId: string) {
  const activationToken = await prisma.activateAccountToken.findUnique({
    where: {
      id: tokenId,
    },
  });

  if (!activationToken) {
    throw new NotFoundError({
      message: `o token de ativação utilizado não foi encontrado no sistema.`,
      action: 'certifique-se que está sendo enviado o token corretamente.',
      stack: new Error().stack,
    });
  }

  return activationToken;
}

export default Object.freeze({
  createAndSendActivationEmail,
  getActivationApiEndpoint,
  activateUserUsingTokenId,
});
