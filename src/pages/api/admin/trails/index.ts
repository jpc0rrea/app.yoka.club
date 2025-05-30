import { NextApiResponse } from 'next';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { trailSelect } from '@models/trails/types';

interface TrailsRequest extends EnsureAuthenticatedRequest {
  query: {
    search?: string;
    page?: string;
    pageSize?: string;
  };
}

interface CreateTrailRequest extends EnsureAuthenticatedRequest {
  body: {
    title: string;
    description?: string;
    coverImageUrl: string;
    eventIds: string[];
  };
}

const trailsHandler = async (
  req: TrailsRequest | CreateTrailRequest,
  res: NextApiResponse
) => {
  try {
    if (req.method === 'GET') {
      // List trails
      const { search, page = '1', pageSize = '20' } = req.query;
      const pageStr = Array.isArray(page) ? page[0] ?? '1' : page ?? '1';
      const pageSizeStr = Array.isArray(pageSize)
        ? pageSize[0] ?? '20'
        : pageSize ?? '20';
      const pageNumber = parseInt(pageStr);
      const pageSizeNumber = parseInt(pageSizeStr);
      const skip = (pageNumber - 1) * pageSizeNumber;
      const searchString = Array.isArray(search) ? search[0] : search;

      const where = searchString
        ? {
            OR: [
              {
                title: { contains: searchString, mode: 'insensitive' as const },
              },
              {
                description: {
                  contains: searchString,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {};

      const [trails, trailsCount] = await Promise.all([
        prisma.trail.findMany({
          where,
          select: trailSelect,
          skip,
          take: pageSizeNumber,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.trail.count({ where }),
      ]);

      const totalPages = Math.ceil(trailsCount / pageSizeNumber);

      return res.status(200).json({
        trails,
        trailsCount,
        totalPages,
      });
    }

    if (req.method === 'POST') {
      // Create trail
      const {
        title,
        description,
        coverImageUrl,
        eventIds = [],
      } = (req as CreateTrailRequest).body;

      if (!title || !coverImageUrl) {
        return res.status(400).json({
          message: 'título e imagem de capa são obrigatórios',
        });
      }

      // Verify all events exist if eventIds provided
      if (eventIds.length > 0) {
        const events = await prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true },
        });

        if (events.length !== eventIds.length) {
          return res.status(400).json({
            message: 'um ou mais eventos não foram encontrados',
          });
        }
      }

      const trail = await prisma.trail.create({
        data: {
          title,
          description,
          coverImageUrl,
          ...(eventIds.length > 0 && {
            trailEvents: {
              create: eventIds.map((eventId, index) => ({
                eventId,
                order: index + 1,
              })),
            },
          }),
        },
        select: trailSelect,
      });

      return res.status(201).json({ trail });
    }

    return res.status(405).json({ message: 'método não permitido' });
  } catch (err) {
    console.error('Error in trails handler:', err);
    return res.status(500).json({
      message: 'erro interno do servidor',
    });
  }
};

export default ensureAuthenticatedWithRole(trailsHandler, ['ADMIN']);
