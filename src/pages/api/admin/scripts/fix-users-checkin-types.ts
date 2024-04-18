import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';

const fixUsersCheckInsType = async (
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

  for (const user of users) {
    // se a aluna só tiver 1 check-in, e ele tiver title = 'check-in de boas vindas',
    // então mudar o checkInType para 'TRIAL'
    // e atualizar a quantidade de checkIns trial da aluna
    if (user.checkInsQuantity === 1) {
      const statement = user.statements[0];

      if (!statement) {
        console.log(`user ${user.id} has no statements, algo está estranho`);
        continue;
      }

      if (
        statement.title === 'check-in de boas vindas' &&
        user.statements.length === 1
      ) {
        await prisma.statement.update({
          where: {
            id: statement.id,
          },
          data: {
            checkInType: 'TRIAL',
          },
        });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            trialCheckInsQuantity: 1,
          },
        });

        console.log(
          `user ${user.id} check-in de boas vindas atualizado para TRIAL`
        );
        continue;
      }
    }

    // se a aluna tiver mais de 1 check-in, a quantidade de check-ins é a quantidade paga
    if (user.checkInsQuantity > 0) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          paidCheckInsQuantity: user.checkInsQuantity,
        },
      });

      console.log(`user ${user.id} check-ins atualizados para PAID`);
    }
  }

  return res.status(200).json({ users });
};

export default fixUsersCheckInsType;
