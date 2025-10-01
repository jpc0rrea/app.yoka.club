import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface GetUserActivityRequest extends EnsureAuthenticatedRequest {
  query: {
    userId: string;
    month?: string;
    year?: string;
  };
}

interface ActivityEntry {
  date: string; // YYYY-MM-DD format
  activities: {
    type: 'recorded' | 'live';
    eventId: string;
    eventTitle: string;
    instructorName: string;
    duration: number;
    progress?: number; // Only for recorded classes
    attended?: boolean; // Only for live classes
    eventThumbnail?: string | null; // Video thumbnail URL
  }[];
}

const getUserActivity = async (
  req: GetUserActivityRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'userId is required',
      });
    }

    const currentDate = new Date();
    const selectedMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

    // Validate month and year
    if (selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({
        message: 'month must be between 1 and 12',
      });
    }

    if (selectedYear < 2020 || selectedYear > 2100) {
      return res.status(400).json({
        message: 'year must be between 2020 and 2100',
      });
    }

    // Calculate the start and end dates of the month
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    // Get completed watch sessions for the month
    const watchSessions = await prisma.watchSession.findMany({
      where: {
        userId,
        progress: {
          gt: 0.8,
        },
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        progress: true,
        updatedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            duration: true,
            recordedUrl: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get attended live classes for the month
    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId,
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
        attended: true,
        event: {
          select: {
            id: true,
            title: true,
            duration: true,
            startDate: true,
            recordedUrl: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Group activities by date
    const activitiesByDate = new Map<string, ActivityEntry['activities']>();

    // Process watch sessions
    watchSessions.forEach((session) => {
      // Convert UTC date to Brazil timezone (America/Sao_Paulo)
      const brazilDate = new Date(
        session.updatedAt.toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
        })
      );
      const dateKey = brazilDate.toISOString().split('T')[0] as string;

      if (!activitiesByDate.has(dateKey)) {
        activitiesByDate.set(dateKey, []);
      }

      const dateActivities = activitiesByDate.get(dateKey);
      if (dateActivities) {
        dateActivities.push({
          type: 'recorded',
          eventId: session.event.id,
          eventTitle: session.event.title,
          instructorName: session.event.instructor.name,
          duration: session.event.duration,
          progress: session.progress,
          eventThumbnail: session.event.recordedUrl,
        });
      }
    });

    // Process check-ins
    checkIns.forEach((checkIn) => {
      const eventStartDate = checkIn.event.startDate;

      if (!eventStartDate) {
        return; // Skip if event has no start date
      }

      // Convert UTC date to Brazil timezone (America/Sao_Paulo)
      const brazilDate = new Date(
        eventStartDate.toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
        })
      );
      const dateKey = brazilDate.toISOString().split('T')[0] as string;

      if (!activitiesByDate.has(dateKey)) {
        activitiesByDate.set(dateKey, []);
      }

      const dateActivities = activitiesByDate.get(dateKey);
      if (dateActivities) {
        dateActivities.push({
          type: 'live',
          eventId: checkIn.event.id,
          eventTitle: checkIn.event.title,
          instructorName: checkIn.event.instructor.name,
          duration: checkIn.event.duration,
          attended: checkIn.attended ?? undefined,
          eventThumbnail: checkIn.event.recordedUrl,
        });
      }
    });

    // Convert to array format
    const activities: ActivityEntry[] = Array.from(activitiesByDate.entries())
      .map(([date, activities]) => ({
        date,
        activities: activities.sort((a, b) => {
          // Sort by type (live first) then by title
          if (a.type !== b.type) {
            return a.type === 'live' ? -1 : 1;
          }
          return a.eventTitle.localeCompare(b.eventTitle);
        }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user,
      activities,
      month: selectedMonth,
      year: selectedYear,
      totalActiveDays: activities.length,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(getUserActivity);
