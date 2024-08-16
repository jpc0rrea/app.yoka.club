import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify that the request is coming from Vercel's cron job
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const activeUsersCount = await countActiveUsers();

    await logActiveUsersCount(activeUsersCount);

    res.status(200).json({
      message: 'Active users counted and logged successfully',
      count: activeUsersCount,
    });
  } catch (error) {
    console.error('Error in count-active-users cron job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function countActiveUsers(): Promise<number> {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const activeUsers = await prisma.user.count({
    where: {
      WatchSession: {
        some: {
          progress: {
            gte: 0.9,
          },
          updatedAt: {
            gte: tenDaysAgo,
          },
        },
      },
    },
  });

  return activeUsers;
}

async function logActiveUsersCount(count: number): Promise<void> {
  await prisma.systemLog.create({
    data: {
      log: 'DAILY_ACTIVE_USERS_COUNT',
      metadata: { count },
    },
  });
}
