import { NextApiResponse } from 'next';
import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
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

const trailsHandler = async (req: TrailsRequest, res: NextApiResponse) => {
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

    return res.status(405).json({ message: 'método não permitido' });
  } catch (err) {
    console.error('Error in trails handler:', err);
    return res.status(500).json({
      message: 'erro interno do servidor',
    });
  }
};

export default ensureAuthenticated(trailsHandler);
