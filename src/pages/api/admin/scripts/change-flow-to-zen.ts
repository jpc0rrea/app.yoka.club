import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { CheckInTypes, StatementType } from '@prisma/client';
import { addDays } from 'date-fns';

const changeFlowToZen = async (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(400).json({
      message:
        'esse script só pode ser executado em ambiente de desenvolvimento',
    });
  }

  const mode = req.query.mode as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operations: Record<string, any> = {};

  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      const {
        id,
        email,
        paidCheckInsQuantity,
        freeCheckInsQuantity,
        expirationDate,
      } = user;
      const daysFromPaidCheckIns = paidCheckInsQuantity * 3.75;
      const newExpirationDate = expirationDate
        ? addDays(expirationDate, daysFromPaidCheckIns)
        : null;

      const debitStatement = {
        userId: id,
        title: 'License Conversion',
        description: `Converted ${paidCheckInsQuantity} paid check-ins to ${daysFromPaidCheckIns} days of license.`,
        type: StatementType.DEBIT,
        checkInsQuantity: paidCheckInsQuantity,
        checkInType: CheckInTypes.PAID,
      };

      const creditStatement = {
        userId: id,
        title: 'Free Check-Ins Credit',
        description: `Set free check-ins to 999999.`,
        type: StatementType.CREDIT,
        checkInsQuantity: 999999 - freeCheckInsQuantity,
        checkInType: CheckInTypes.FREE,
      };

      operations[email] = {
        debitStatement,
        creditStatement,
        userUpdate: {
          freeCheckInsQuantity: 999999,
          paidCheckInsQuantity: 0,
          checkInsQuantity: 999999,
          stripeId: null,
          subscriptionId: null,
          expirationDate: newExpirationDate,
        },
      };

      if (mode === 'live') {
        await prisma.statement.create({ data: debitStatement });
        await prisma.statement.create({ data: creditStatement });
        await prisma.user.update({
          where: { id },
          data: operations[email].userUpdate,
        });
      }
    }

    return res.status(200).json({
      message: mode === 'live' ? 'Operations executed' : 'Dry run completed',
      operations,
    });
  } catch (error) {
    console.error('Error updating users:', error);
    return res.status(500).json({
      message: 'An error occurred while processing the request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default changeFlowToZen;
