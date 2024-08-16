import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { format } from 'date-fns';
import { User } from '@prisma/client';

interface GetBusinessInfoRequest extends EnsureAuthenticatedRequest {
  query: {
    from: string;
    to: string;
  };
}

function calcNewUserPerDay(newUsers: User[]) {
  const newUsersPerDayRaw: {
    date: string;
    day: string;
    usuários: number;
  }[] = newUsers.reduce((acc, user) => {
    const date = user.createdAt.toISOString();
    const day = format(new Date(user.createdAt.toISOString()), 'dd/MM/yyyy');

    if (!date) {
      return acc;
    }

    const dateInArray = acc.find((item) => item.day === day);

    if (!dateInArray) {
      acc.push({ date, usuários: 1, day });
    } else {
      dateInArray['usuários'] += 1;
    }

    return acc;
  }, [] as { date: string; usuários: number; day: string }[]);

  newUsersPerDayRaw.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    }

    if (a.date > b.date) {
      return 1;
    }

    return 0;
  });

  const newUsersPerDay = newUsersPerDayRaw.map((item) => {
    return {
      date: item.day,
      usuários: item['usuários'],
    };
  });

  return newUsersPerDay;
}

interface GetWatchedEventsTableDataParams {
  from: string;
  to: string;
}

async function getWatchedEventsTableData({
  from,
  to,
}: GetWatchedEventsTableDataParams) {
  const watchSessions = await prisma.watchSession.findMany({
    where: {
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    include: {
      event: true,
      user: true,
    },
  });

  const watchedEventsTableData = watchSessions.reduce(
    (acc, watchSession) => {
      const event = watchSession.event;
      const user = watchSession.user;

      if (!event || !user) {
        return acc;
      }

      const eventInArray = acc.find((item) => item.eventId === event.id);

      if (!eventInArray) {
        acc.push({
          eventId: event.id,
          title: event.title,
          watchedCount: watchSession.progress > 0.9 ? 1 : 0,
          playedSeconds: watchSession.playedSeconds,
          usersThatWatched: [
            {
              userId: user.id,
              displayName: user.displayName,
            },
          ],
        });
      } else {
        eventInArray['watchedCount'] += 1;
        eventInArray['usersThatWatched'].push({
          userId: user.id,
          displayName: user.displayName,
        });
      }

      return acc;
    },
    [] as {
      eventId: string;
      playedSeconds: number;
      watchedCount: number;
      title: string;
      usersThatWatched: {
        userId: string;
        displayName: string;
      }[];
    }[]
  );

  return watchedEventsTableData;
}

async function getNewUsersTableData(newUsers: User[]) {
  const newUsersDailyLogs = await prisma.eventLog.findMany({
    where: {
      userId: {
        in: newUsers.map((item) => item.id),
      },
      eventType: 'USER.DAILY_USAGE',
    },
  });

  const newUsersWatchSessions = await prisma.watchSession.findMany({
    where: {
      userId: {
        in: newUsers.map((item) => item.id),
      },
    },
  });

  const newUsersTableData = newUsers.map((user) => {
    const userWatchSessions = newUsersWatchSessions.filter(
      (item) => item.userId === user.id
    );

    const watchedEventsCount = userWatchSessions.filter(
      (item) => item.progress > 0.9
    ).length;

    const daysUsingApp = newUsersDailyLogs.map((log) => {
      const date = new Date(log.createdAt);
      return date.toISOString();
    });

    return {
      userId: user.id,
      displayName: user.displayName,
      daysUsingApp,
      watchedEventsCount,
    };
  });

  return newUsersTableData;
}

const getBusinessInfo = async (
  req: GetBusinessInfoRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { from, to } = req.query;

  const newUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
  });

  const newUsersPerDay = calcNewUserPerDay(newUsers);

  const watchedEventsTableData = await getWatchedEventsTableData({ from, to });

  const newUsersTableData = await getNewUsersTableData(newUsers);

  return res.status(200).json({
    newUsersPerDay,
    newUsersCount: newUsers.length,
    watchedEventsTableData,
    newUsersTableData,
  });
};

export default ensureAuthenticatedWithRole(getBusinessInfo, ['ADMIN']);
