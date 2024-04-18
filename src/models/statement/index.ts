import { prisma } from '@server/db';
import { AddCreditsParams, FindAllCreditsByUserIdParams } from './types';
import { ValidationError } from '@errors/index';
import user from '@models/user';

async function findAllCreditsByUserId({
  userId,
}: FindAllCreditsByUserIdParams) {
  const creditsObject = await prisma.statement.findMany({
    where: {
      userId,
      type: 'CREDIT',
    },
  });

  return creditsObject;
}

async function addCredits({
  userId,
  amount,
  title,
  description,
  paymentId,
  checkInType = 'PAID',
}: AddCreditsParams) {
  if (!amount || amount <= 0) {
    throw new ValidationError({
      message: `o campo 'amout' está inválido.`,
      action: `informe um valor válido.`,
      stack: new Error().stack,
      errorLocationCode: 'MODEL:STATEMENT:ADD_CREDITS:INVALID_AMOUNT',
      key: 'amount',
    });
  }

  await user.findOneById({
    userId,
    prismaInstance: prisma,
  });

  const createdCreditStatementTransaction = prisma.statement.create({
    data: {
      userId,
      title,
      description,
      type: 'CREDIT',
      checkInsQuantity: amount,
      paymentId,
      checkInType,
    },
  });

  const checkInTypeToIncrement =
    checkInType === 'PAID'
      ? 'paidCheckInsQuantity'
      : checkInType === 'TRIAL'
      ? 'trialCheckInsQuantity'
      : 'freeCheckInsQuantity';

  const updateUserTransaction = prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      checkInsQuantity: {
        increment: amount,
      },
      [checkInTypeToIncrement]: {
        increment: amount,
      },
    },
  });

  await prisma.$transaction([
    createdCreditStatementTransaction,
    updateUserTransaction,
  ]);
}

async function createCreditStatement({
  userId,
  amount,
  title,
  description,
  paymentId,
  prismaInstance,
}: AddCreditsParams) {
  if (!amount || amount <= 0) {
    throw new ValidationError({
      message: `o campo 'amout' está inválido.`,
      action: `informe um valor válido.`,
      stack: new Error().stack,
      errorLocationCode:
        'MODEL:STATEMENT:CREATE_CREDIT_STATEMENT:INVALID_AMOUNT',
      key: 'amount',
    });
  }

  await user.findOneById({
    userId,
    prismaInstance,
  });

  const statement = await prismaInstance.statement.create({
    data: {
      userId,
      title,
      description,
      type: 'CREDIT',
      checkInsQuantity: amount,
      paymentId,
    },
  });

  return statement;
}

export default Object.freeze({
  findAllCreditsByUserId,
  addCredits,
  createCreditStatement,
});
