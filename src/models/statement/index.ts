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
  });

  const createdCreditStatementTransaction = prisma.statement.create({
    data: {
      userId,
      title,
      description,
      type: 'CREDIT',
      checkInsQuantity: amount,
      paymentId,
    },
  });

  const updateUserTransaction = prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      checkInsQuantity: {
        increment: amount,
      },
    },
  });

  await prisma.$transaction([
    createdCreditStatementTransaction,
    updateUserTransaction,
  ]);
}

export default Object.freeze({
  findAllCreditsByUserId,
  addCredits,
});
