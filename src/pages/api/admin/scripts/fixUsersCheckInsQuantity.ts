import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { isSameHour } from 'date-fns';

const fixUsersCheckInsQuantity = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(400).json({
      message:
        'esse script só pode ser executado em ambiente de desenvolvimento',
    });
  }

  const users = await prisma.user.findMany({ include: { statements: true } });

  users.forEach((user) => {
    user.statements.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }

      if (a.createdAt > b.createdAt) {
        return -1;
      }

      return 0;
    });
  });

  for (const user of users) {
    if (user.statements.length === 1) {
      continue;
    }

    let checkInsQuantity = user.statements.reduce((acc, statement) => {
      if (statement.type === 'CREDIT') {
        return acc + statement.checkInsQuantity;
      }

      return acc - 1;
    }, 0);

    const statementToRemove = user.statements.find((statement) => {
      return (
        statement.description ===
          'check-in inicial para experimentar a plataforma :)' &&
        isSameHour(statement.createdAt, new Date('2023-10-09T23:13:00.000Z'))
      );
    });

    if (!statementToRemove) {
      continue;
    }

    checkInsQuantity = checkInsQuantity - statementToRemove.checkInsQuantity;

    // const deleteStatementPromise = prisma.statement.delete({
    //   where: {
    //     id: statementToRemove.id,
    //   },
    // });

    // const updateCheckInsQuantityPromise = prisma.user.update({
    //   where: {
    //     id: user.id,
    //   },
    //   data: {
    //     checkInsQuantity,
    //   },
    // });

    // await prisma.$transaction([
    //   deleteStatementPromise,
    //   updateCheckInsQuantityPromise,
    // ]);

    console.log(`> ${user.name} - ${checkInsQuantity} check-ins`);
  }

  return res.status(200).json({ users });
};

export default fixUsersCheckInsQuantity;
