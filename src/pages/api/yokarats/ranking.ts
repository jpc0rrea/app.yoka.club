import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface GetYokaratsRankingRequest extends EnsureAuthenticatedRequest {
  query: {
    month?: string;
    year?: string;
  };
}

interface RankingEntry {
  userId: string;
  userName: string;
  userDisplayName: string;
  userImageUrl: string | null;
  activeDays: number;
}

const getYokaratsRanking = async (
  req: GetYokaratsRankingRequest,
  res: NextApiResponse
) => {
  try {
    const currentDate = new Date();
    const month = req.query.month
      ? parseInt(req.query.month)
      : currentDate.getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year)
      : currentDate.getFullYear();

    // Validate month and year
    if (month < 1 || month > 12) {
      return res.status(400).json({
        message: 'month must be between 1 and 12',
      });
    }

    if (year < 2020 || year > 2100) {
      return res.status(400).json({
        message: 'year must be between 2020 and 2100',
      });
    }

    // Calculate the start and end dates of the month in Brazil timezone
    // Brazil (São Paulo) is UTC-3 year-round (no DST since 2019)
    // Use ISO string with explicit timezone offset to ensure correct UTC conversion
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-01T00:00:00-03:00`
    );
    const endDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(
        2,
        '0'
      )}T23:59:59.999-03:00`
    );

    // Get all completed watch sessions (progress > 0.8) for the month
    const completedWatchSessions = await prisma.watchSession.findMany({
      where: {
        progress: {
          gt: 0.8,
        },
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Get all attended live classes for the month
    const attendedCheckIns = await prisma.checkIn.findMany({
      where: {
        attended: true,
        event: {
          isLive: true,
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: {
        userId: true,
        event: {
          select: {
            startDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Process the data to count unique active days per user
    const userActiveDaysMap = new Map<string, Set<string>>();
    const userDataMap = new Map<
      string,
      { name: string; displayName: string; imageUrl: string | null }
    >();

    // Process watch sessions
    completedWatchSessions.forEach((session) => {
      const userId = session.userId;
      // Convert UTC date to Brazil timezone (America/Sao_Paulo)
      const brazilDateStr = session.updatedAt.toLocaleDateString('sv-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      const dateKey = brazilDateStr; // Already in YYYY-MM-DD format

      if (!userActiveDaysMap.has(userId)) {
        userActiveDaysMap.set(userId, new Set());
        userDataMap.set(userId, {
          name: session.user.name,
          displayName: session.user.displayName,
          imageUrl: session.user.imageUrl,
        });
      }

      const userDays = userActiveDaysMap.get(userId);
      if (userDays) {
        userDays.add(dateKey);
      }
    });

    // Process check-ins
    attendedCheckIns.forEach((checkIn) => {
      const userId = checkIn.userId;
      const eventStartDate = checkIn.event.startDate;

      if (!eventStartDate) {
        return; // Skip if event has no start date
      }

      // Convert UTC date to Brazil timezone (America/Sao_Paulo)
      const brazilDateStr = eventStartDate.toLocaleDateString('sv-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      const dateKey = brazilDateStr; // Already in YYYY-MM-DD format

      if (!userActiveDaysMap.has(userId)) {
        userActiveDaysMap.set(userId, new Set());
        userDataMap.set(userId, {
          name: checkIn.user.name,
          displayName: checkIn.user.displayName,
          imageUrl: checkIn.user.imageUrl,
        });
      }

      const userDays = userActiveDaysMap.get(userId);
      if (userDays) {
        userDays.add(dateKey);
      }
    });

    // Convert to ranking array
    const ranking: RankingEntry[] = Array.from(userActiveDaysMap.entries())
      .map(([userId, activeDaysSet]) => {
        const userData = userDataMap.get(userId);
        if (!userData) {
          return null;
        }
        return {
          userId,
          userName: userData.name,
          userDisplayName: userData.displayName,
          userImageUrl: userData.imageUrl,
          activeDays: activeDaysSet.size,
        };
      })
      .filter((entry): entry is RankingEntry => entry !== null)
      .sort((a, b) => b.activeDays - a.activeDays);

    return res.status(200).json({
      ranking,
      month,
      year,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(getYokaratsRanking);
